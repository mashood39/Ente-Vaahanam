-- Ente Vaahanam: initial schema.
-- Run in the Supabase SQL editor (or `supabase db push`).

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  make text,
  model text,
  year int check (year between 1900 and 2100),
  plate_number text,
  odometer int not null default 0 check (odometer >= 0),
  distance_unit text not null default 'km' check (distance_unit in ('km', 'mi')),
  created_at timestamptz not null default now()
);
create index vehicles_user_idx on public.vehicles (user_id);

create table public.service_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  type text not null check (type in
    ('oil_change', 'insurance', 'tires', 'brakes', 'battery', 'part_replacement', 'repair', 'other')),
  custom_label text,
  done_on date not null,
  odometer int check (odometer >= 0),
  cost numeric(12, 2) check (cost >= 0), -- INR
  notes text,

  -- Optional reminder. Whichever of date / odometer triggers first counts.
  remind_on date,
  remind_at_odometer int check (remind_at_odometer >= 0),
  reminder_state text not null default 'active' check (reminder_state in ('active', 'done', 'dismissed')),
  reminder_closed_at timestamptz,

  -- Notification bookkeeping (used by the daily job).
  last_notified_stage text check (last_notified_stage in ('due_soon', 'overdue')),
  last_notified_at timestamptz,

  created_at timestamptz not null default now(),
  constraint other_needs_label check (type <> 'other' or char_length(coalesce(custom_label, '')) > 0)
);
create index service_records_vehicle_idx on public.service_records (vehicle_id, done_on desc);
create index service_records_user_idx on public.service_records (user_id);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
create index push_subscriptions_user_idx on public.push_subscriptions (user_id);

-- Row Level Security: every table locked to the owner.
alter table public.vehicles enable row level security;
alter table public.service_records enable row level security;
alter table public.push_subscriptions enable row level security;

create policy "vehicles: owner select" on public.vehicles
  for select to authenticated using (user_id = (select auth.uid()));
create policy "vehicles: owner insert" on public.vehicles
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "vehicles: owner update" on public.vehicles
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "vehicles: owner delete" on public.vehicles
  for delete to authenticated using (user_id = (select auth.uid()));

-- A record must belong to the user AND point at one of the user's own vehicles.
create policy "records: owner select" on public.service_records
  for select to authenticated using (user_id = (select auth.uid()));
create policy "records: owner insert" on public.service_records
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.vehicles v
                where v.id = vehicle_id and v.user_id = (select auth.uid()))
  );
create policy "records: owner update" on public.service_records
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.vehicles v
                where v.id = vehicle_id and v.user_id = (select auth.uid()))
  );
create policy "records: owner delete" on public.service_records
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "push: owner select" on public.push_subscriptions
  for select to authenticated using (user_id = (select auth.uid()));
create policy "push: owner insert" on public.push_subscriptions
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "push: owner update" on public.push_subscriptions
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "push: owner delete" on public.push_subscriptions
  for delete to authenticated using (user_id = (select auth.uid()));

-- Anonymous visitors get nothing. The daily job uses the service-role key (bypasses RLS) server-side only.
revoke all on public.vehicles, public.service_records, public.push_subscriptions from anon;
