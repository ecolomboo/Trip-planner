-- Silk Road — initial schema.
-- One trip, two members. Row-level security gates every table on trip
-- membership; realtime is enabled for the tables that sync between devices.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.entry_type as enum (
  'flight',
  'train',
  'road_transfer',
  'accommodation',
  'tour',
  'sight',
  'meal',
  'note'
);

create type public.booking_status as enum ('booked', 'to_book');

create type public.member_role as enum ('owner', 'member');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  locale text not null default 'en',
  created_at timestamptz not null default now()
);

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date not null,
  base_currency text not null default 'EUR',
  -- Local-currency conversion rates, e.g. {"UZS": 13000, "TJS": 12}.
  exchange_rates jsonb not null default '{"UZS": 13000, "TJS": 12}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.trip_members (
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.member_role not null default 'member',
  primary key (trip_id, user_id)
);

create table public.stops (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  name text not null,
  lon double precision not null,
  lat double precision not null,
  sort_order integer not null default 0,
  unique (trip_id, sort_order)
);

create table public.days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  date date not null,
  title text not null default '',
  unique (trip_id, date)
);

create table public.entries (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  date date not null,
  stop_id uuid references public.stops (id) on delete set null,
  type public.entry_type not null,
  title text not null,
  time time,
  cost_per_person numeric(10, 2),
  booking_status public.booking_status not null default 'to_book',
  notes text,
  url text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index entries_trip_date_position_idx
  on public.entries (trip_id, date, position);

create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  title text not null,
  done boolean not null default false,
  done_by uuid references public.profiles (id) on delete set null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Functions & triggers
-- ---------------------------------------------------------------------------
create function public.set_updated_at() returns trigger
  language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger entries_set_updated_at
  before update on public.entries
  for each row execute function public.set_updated_at();

-- Create a profile row for every new auth user.
create function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Membership check used by RLS policies. SECURITY DEFINER so it reads
-- trip_members without triggering RLS recursion.
create function public.is_member(p_trip_id uuid) returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.trip_members tm
    where tm.trip_id = p_trip_id and tm.user_id = auth.uid()
  );
$$;

-- Adds the current user to the single trip. Called from the auth callback after
-- the app has verified the email is allowlisted; SECURITY DEFINER so the
-- not-yet-member user can insert their own membership row despite RLS.
create function public.join_default_trip() returns void
  language plpgsql security definer set search_path = public as $$
declare
  v_trip_id uuid;
begin
  select id into v_trip_id from public.trips order by created_at limit 1;
  if v_trip_id is not null then
    insert into public.trip_members (trip_id, user_id, role)
    values (v_trip_id, auth.uid(), 'member')
    on conflict do nothing;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_members enable row level security;
alter table public.stops enable row level security;
alter table public.days enable row level security;
alter table public.entries enable row level security;
alter table public.checklist_items enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

create policy "trips_select_member" on public.trips
  for select using (public.is_member(id));

create policy "trip_members_select_member" on public.trip_members
  for select using (public.is_member(trip_id));

create policy "stops_all_member" on public.stops
  for all using (public.is_member(trip_id)) with check (public.is_member(trip_id));

create policy "days_all_member" on public.days
  for all using (public.is_member(trip_id)) with check (public.is_member(trip_id));

create policy "entries_all_member" on public.entries
  for all using (public.is_member(trip_id)) with check (public.is_member(trip_id));

create policy "checklist_all_member" on public.checklist_items
  for all using (public.is_member(trip_id)) with check (public.is_member(trip_id));

-- ---------------------------------------------------------------------------
-- Realtime (device-to-device sync)
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.trips;
alter publication supabase_realtime add table public.stops;
alter publication supabase_realtime add table public.days;
alter publication supabase_realtime add table public.entries;
alter publication supabase_realtime add table public.checklist_items;
