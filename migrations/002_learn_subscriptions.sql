-- Learning Center Pro subscriptions. Apply after 001_auvrantis.sql through the
-- owner-controlled Supabase SQL Editor. Rows are written only by the server
-- (service role) from verified Stripe webhooks; members can read their own row.
begin;

create table if not exists public.auvrantis_learn_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null check (plan in ('starter', 'unlimited')),
  status text not null check (char_length(status) between 1 and 40),
  stripe_customer_id text check (stripe_customer_id is null or stripe_customer_id ~ '^cus_[A-Za-z0-9]+$'),
  stripe_subscription_id text unique check (stripe_subscription_id is null or stripe_subscription_id ~ '^sub_[A-Za-z0-9]+$'),
  updated_at timestamptz not null default now()
);

alter table public.auvrantis_learn_subscriptions enable row level security;
drop policy if exists auvrantis_learn_subscriptions_read_own
  on public.auvrantis_learn_subscriptions;
create policy auvrantis_learn_subscriptions_read_own
  on public.auvrantis_learn_subscriptions for select
  using (auth.uid() = user_id);
revoke all on public.auvrantis_learn_subscriptions from anon, authenticated;
grant select on public.auvrantis_learn_subscriptions to authenticated;
grant all on public.auvrantis_learn_subscriptions to service_role;

commit;
