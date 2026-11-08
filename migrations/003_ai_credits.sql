-- Pay-per-token AI credits for Auvrantis Create.
-- Review and apply manually through the owner-controlled Supabase SQL Editor.
--
-- Units: millicredits (mc). 1 credit = 1,000 mc = one US cent of retail price.
-- Flow: reserve the maximum price of a run -> call the model -> settle at real usage.
-- Holds older than 15 minutes are released automatically, so a crashed request never
-- keeps a customer's credits. Only the server (service_role) can call these functions.
begin;

create table if not exists public.auvrantis_ai_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance_mc bigint not null default 0 check (balance_mc >= 0),
  held_mc bigint not null default 0 check (held_mc >= 0),
  lifetime_purchased_mc bigint not null default 0,
  lifetime_spent_mc bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.auvrantis_ai_holds (
  ref text primary key check (char_length(ref) between 8 and 80),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (char_length(action) <= 32),
  amount_mc bigint not null check (amount_mc > 0),
  created_at timestamptz not null default now(),
  settled_at timestamptz
);
create index if not exists auvrantis_ai_holds_open
  on public.auvrantis_ai_holds(user_id, created_at) where settled_at is null;

create table if not exists public.auvrantis_ai_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('signup_grant', 'purchase', 'usage', 'refund', 'adjustment')),
  ref text not null check (char_length(ref) between 1 and 200),
  delta_mc bigint not null,
  action text,
  model text,
  input_tokens integer,
  output_tokens integer,
  provider_cost_usd numeric(14, 8),
  created_at timestamptz not null default now(),
  unique (kind, ref)
);
create index if not exists auvrantis_ai_ledger_user_created
  on public.auvrantis_ai_ledger(user_id, created_at desc);

alter table public.auvrantis_ai_wallets enable row level security;
alter table public.auvrantis_ai_holds enable row level security;
alter table public.auvrantis_ai_ledger enable row level security;
drop policy if exists auvrantis_ai_wallets_read_own on public.auvrantis_ai_wallets;
create policy auvrantis_ai_wallets_read_own on public.auvrantis_ai_wallets for select using (auth.uid() = user_id);
drop policy if exists auvrantis_ai_ledger_read_own on public.auvrantis_ai_ledger;
create policy auvrantis_ai_ledger_read_own on public.auvrantis_ai_ledger for select using (auth.uid() = user_id);
revoke all on public.auvrantis_ai_wallets, public.auvrantis_ai_holds, public.auvrantis_ai_ledger from anon, authenticated;
grant select on public.auvrantis_ai_wallets, public.auvrantis_ai_ledger to authenticated;
grant all on public.auvrantis_ai_wallets, public.auvrantis_ai_holds, public.auvrantis_ai_ledger to service_role;

-- Creates the wallet on first use and grants the one-time signup credits.
create or replace function public.auvrantis_ai_wallet_ensure(p_user uuid, p_grant_mc bigint)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare v_balance bigint;
begin
  insert into auvrantis_ai_wallets (user_id, balance_mc) values (p_user, greatest(p_grant_mc, 0))
  on conflict (user_id) do nothing;
  if found and p_grant_mc > 0 then
    insert into auvrantis_ai_ledger (user_id, kind, ref, delta_mc) values (p_user, 'signup_grant', p_user::text, p_grant_mc)
    on conflict (kind, ref) do nothing;
  end if;
  select balance_mc into v_balance from auvrantis_ai_wallets where user_id = p_user;
  return v_balance;
end;
$$;

-- Releases this user's holds that were never settled (crashed or timed-out requests).
create or replace function public.auvrantis_ai_release_stale(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_total bigint;
begin
  with stale as (
    update auvrantis_ai_holds set settled_at = now()
    where user_id = p_user and settled_at is null and created_at < now() - interval '15 minutes'
    returning amount_mc
  )
  select coalesce(sum(amount_mc), 0) into v_total from stale;
  if v_total > 0 then
    update auvrantis_ai_wallets
      set balance_mc = balance_mc + v_total, held_mc = greatest(held_mc - v_total, 0), updated_at = now()
      where user_id = p_user;
  end if;
end;
$$;

-- Moves the maximum price of a run from balance into a hold. Raises if the balance is short.
create or replace function public.auvrantis_ai_reserve(p_user uuid, p_ref text, p_action text, p_amount_mc bigint)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare v_balance bigint;
begin
  if p_amount_mc <= 0 then raise exception 'invalid_amount'; end if;
  perform auvrantis_ai_release_stale(p_user);
  update auvrantis_ai_wallets
    set balance_mc = balance_mc - p_amount_mc, held_mc = held_mc + p_amount_mc, updated_at = now()
    where user_id = p_user and balance_mc >= p_amount_mc
    returning balance_mc into v_balance;
  if not found then raise exception 'insufficient_credits'; end if;
  insert into auvrantis_ai_holds (ref, user_id, action, amount_mc) values (p_ref, p_user, p_action, p_amount_mc);
  return v_balance;
end;
$$;

-- Settles a hold at the real price (capped at the hold) and refunds the rest. Idempotent.
create or replace function public.auvrantis_ai_settle(
  p_ref text, p_charge_mc bigint, p_model text, p_input_tokens integer, p_output_tokens integer, p_provider_cost_usd numeric
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hold auvrantis_ai_holds%rowtype;
  v_charge bigint;
  v_balance bigint;
begin
  select * into v_hold from auvrantis_ai_holds where ref = p_ref for update;
  if not found then raise exception 'unknown_hold'; end if;
  if v_hold.settled_at is not null then
    select balance_mc into v_balance from auvrantis_ai_wallets where user_id = v_hold.user_id;
    return v_balance;
  end if;
  v_charge := least(greatest(coalesce(p_charge_mc, 0), 0), v_hold.amount_mc);
  update auvrantis_ai_holds set settled_at = now() where ref = p_ref;
  update auvrantis_ai_wallets
    set balance_mc = balance_mc + (v_hold.amount_mc - v_charge),
        held_mc = greatest(held_mc - v_hold.amount_mc, 0),
        lifetime_spent_mc = lifetime_spent_mc + v_charge,
        updated_at = now()
    where user_id = v_hold.user_id
    returning balance_mc into v_balance;
  if v_charge > 0 then
    insert into auvrantis_ai_ledger (user_id, kind, ref, delta_mc, action, model, input_tokens, output_tokens, provider_cost_usd)
    values (v_hold.user_id, 'usage', p_ref, -v_charge, v_hold.action, left(p_model, 80), p_input_tokens, p_output_tokens, p_provider_cost_usd);
  end if;
  return v_balance;
end;
$$;

-- Adds purchased credits once per Stripe Checkout Session. Returns true when credits were added.
create or replace function public.auvrantis_ai_credit(p_user uuid, p_kind text, p_ref text, p_amount_mc bigint)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_kind not in ('purchase', 'refund', 'adjustment') or p_amount_mc <= 0 then raise exception 'invalid_credit'; end if;
  insert into auvrantis_ai_wallets (user_id) values (p_user) on conflict (user_id) do nothing;
  insert into auvrantis_ai_ledger (user_id, kind, ref, delta_mc) values (p_user, p_kind, p_ref, p_amount_mc)
    on conflict (kind, ref) do nothing;
  if not found then return false; end if;
  update auvrantis_ai_wallets
    set balance_mc = balance_mc + p_amount_mc,
        lifetime_purchased_mc = lifetime_purchased_mc + case when p_kind = 'purchase' then p_amount_mc else 0 end,
        updated_at = now()
    where user_id = p_user;
  return true;
end;
$$;

revoke all on function public.auvrantis_ai_wallet_ensure(uuid, bigint) from public, anon, authenticated;
revoke all on function public.auvrantis_ai_release_stale(uuid) from public, anon, authenticated;
revoke all on function public.auvrantis_ai_reserve(uuid, text, text, bigint) from public, anon, authenticated;
revoke all on function public.auvrantis_ai_settle(text, bigint, text, integer, integer, numeric) from public, anon, authenticated;
revoke all on function public.auvrantis_ai_credit(uuid, text, text, bigint) from public, anon, authenticated;
grant execute on function public.auvrantis_ai_wallet_ensure(uuid, bigint) to service_role;
grant execute on function public.auvrantis_ai_release_stale(uuid) to service_role;
grant execute on function public.auvrantis_ai_reserve(uuid, text, text, bigint) to service_role;
grant execute on function public.auvrantis_ai_settle(text, bigint, text, integer, integer, numeric) to service_role;
grant execute on function public.auvrantis_ai_credit(uuid, text, text, bigint) to service_role;

commit;
