-- Canonical additive cloud schema for Auvrantis Create/Check.
-- Review and apply manually through the owner-controlled Supabase SQL Editor.
-- This migration never changes SiteForge's profiles, sites, leads, or policies.
begin;

create extension if not exists pgcrypto;

create table if not exists public.auvrantis_create_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  draft jsonb not null check (jsonb_typeof(draft) = 'object'),
  schema_version smallint not null default 1 check (schema_version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, owner_id)
);

create index if not exists auvrantis_create_projects_owner_updated
  on public.auvrantis_create_projects(owner_id, updated_at desc);

alter table public.auvrantis_create_projects enable row level security;
drop policy if exists auvrantis_create_projects_read_own
  on public.auvrantis_create_projects;
create policy auvrantis_create_projects_read_own
  on public.auvrantis_create_projects for select
  using (auth.uid() = owner_id);
revoke all on public.auvrantis_create_projects from anon, authenticated;
grant select on public.auvrantis_create_projects to authenticated;
grant all on public.auvrantis_create_projects to service_role;

create table if not exists public.auvrantis_publications (
  project_id uuid not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9]{16,32}$'),
  document jsonb not null check (jsonb_typeof(document) = 'object'),
  active boolean not null default true,
  published_at timestamptz not null default now(),
  primary key (project_id, owner_id),
  foreign key (project_id, owner_id)
    references public.auvrantis_create_projects(id, owner_id) on delete cascade
);

create index if not exists auvrantis_publications_owner_active
  on public.auvrantis_publications(owner_id, active);

alter table public.auvrantis_publications enable row level security;
drop policy if exists auvrantis_publications_read_own
  on public.auvrantis_publications;
create policy auvrantis_publications_read_own
  on public.auvrantis_publications for select
  using (auth.uid() = owner_id);
revoke all on public.auvrantis_publications from anon, authenticated;
grant select on public.auvrantis_publications to authenticated;
grant all on public.auvrantis_publications to service_role;

-- Product subscriptions are reserved for separate Create and Check purchases.
-- Client roles are read-only; signed Stripe webhook code owns all writes.
create table if not exists public.auvrantis_product_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_key text not null check (product_key in ('auvrantis_create', 'auvrantis_check')),
  stripe_subscription_id text not null unique,
  stripe_price_id text not null,
  status text not null check (status in (
    'incomplete', 'incomplete_expired', 'trialing', 'active',
    'past_due', 'canceled', 'unpaid', 'paused'
  )),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists auvrantis_product_subscriptions_user_product
  on public.auvrantis_product_subscriptions(user_id, product_key);

alter table public.auvrantis_product_subscriptions enable row level security;
drop policy if exists auvrantis_product_subscriptions_read_own
  on public.auvrantis_product_subscriptions;
create policy auvrantis_product_subscriptions_read_own
  on public.auvrantis_product_subscriptions for select
  using (auth.uid() = user_id);
revoke all on public.auvrantis_product_subscriptions from anon, authenticated;
grant select on public.auvrantis_product_subscriptions to authenticated;
grant all on public.auvrantis_product_subscriptions to service_role;

-- Privacy-preserving, bounded request budgets. subject_hash is an HMAC of the
-- client IP (or normalized email for email-scope limits); raw values are never stored.
create table if not exists public.auvrantis_request_budgets (
  subject_hash text not null check (subject_hash ~ '^[a-f0-9]{64}$'),
  scope text not null check (scope in (
    'signup_minute', 'signup_hour', 'signup_day', 'signup_email_hour',
    'signup_global_minute', 'signup_global_hour',
    'login_minute', 'login_hour', 'login_day', 'login_email_hour',
    'login_global_minute', 'login_global_hour',
    'cloud_minute', 'cloud_day', 'publish_day'
  )),
  window_start timestamptz not null,
  request_count integer not null check (request_count > 0),
  primary key (subject_hash, scope, window_start)
);

create index if not exists auvrantis_request_budgets_window
  on public.auvrantis_request_budgets(window_start);

alter table public.auvrantis_request_budgets enable row level security;
revoke all on public.auvrantis_request_budgets from anon, authenticated;
grant all on public.auvrantis_request_budgets to service_role;

create or replace function public.auvrantis_cloud_ready()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object('ready', true, 'schema_version', 1);
$$;
revoke all on function public.auvrantis_cloud_ready() from public, anon, authenticated;
grant execute on function public.auvrantis_cloud_ready() to service_role;

create or replace function public.consume_auvrantis_request_budget(
  p_subject_hash text,
  p_scope text,
  p_window_seconds integer,
  p_limit integer
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_window_start timestamptz;
  v_count integer;
begin
  if p_subject_hash is null or p_scope is null or p_window_seconds is null or p_limit is null
     or p_subject_hash !~ '^[a-f0-9]{64}$'
     or p_scope not in (
       'signup_minute', 'signup_hour', 'signup_day', 'signup_email_hour',
       'signup_global_minute', 'signup_global_hour',
       'login_minute', 'login_hour', 'login_day', 'login_email_hour',
       'login_global_minute', 'login_global_hour',
       'cloud_minute', 'cloud_day', 'publish_day'
     )
     or p_window_seconds not in (60, 3600, 86400)
     or p_limit < 1 or p_limit > 10000 then
    return false;
  end if;

  v_window_start := to_timestamp(
    floor(extract(epoch from clock_timestamp()) / p_window_seconds) * p_window_seconds
  );

  delete from public.auvrantis_request_budgets
   where window_start < clock_timestamp() - interval '48 hours';

  insert into public.auvrantis_request_budgets(subject_hash, scope, window_start, request_count)
  values (p_subject_hash, p_scope, v_window_start, 1)
  on conflict (subject_hash, scope, window_start)
  do update set request_count = auvrantis_request_budgets.request_count + 1
    where auvrantis_request_budgets.request_count < p_limit
  returning request_count into v_count;

  return found;
end;
$$;
revoke all on function public.consume_auvrantis_request_budget(text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_auvrantis_request_budget(text, text, integer, integer)
  to service_role;

-- Serializes simultaneous publishes for one owner and caps active beta sites at three.
create or replace function public.publish_auvrantis_project(
  p_owner_id uuid,
  p_project_id uuid,
  p_slug text,
  p_document jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_already_active boolean;
  v_active_count integer;
  v_published_at timestamptz;
begin
  if p_owner_id is null or p_project_id is null or p_slug is null or p_document is null
     or p_slug !~ '^[a-z0-9]{16,32}$'
     or jsonb_typeof(p_document) <> 'object' then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_owner_id::text, 0));

  if not exists (
    select 1 from public.auvrantis_create_projects
     where id = p_project_id and owner_id = p_owner_id
  ) then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;

  select exists (
    select 1 from public.auvrantis_publications
     where project_id = p_project_id and owner_id = p_owner_id and active
  ) into v_already_active;

  select count(*) into v_active_count
    from public.auvrantis_publications
   where owner_id = p_owner_id and active;

  if not v_already_active and v_active_count >= 3 then
    return jsonb_build_object('ok', false, 'reason', 'limit');
  end if;

  insert into public.auvrantis_publications(project_id, owner_id, slug, document, active, published_at)
  values (p_project_id, p_owner_id, p_slug, p_document, true, now())
  on conflict (project_id, owner_id)
  do update set slug = excluded.slug,
                document = excluded.document,
                active = true,
                published_at = now()
  returning published_at into v_published_at;

  return jsonb_build_object('ok', true, 'slug', p_slug, 'published_at', v_published_at);
end;
$$;
revoke all on function public.publish_auvrantis_project(uuid, uuid, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.publish_auvrantis_project(uuid, uuid, text, jsonb)
  to service_role;

commit;
