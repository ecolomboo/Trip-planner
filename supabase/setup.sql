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
-- Seed the single trip, its nine stops, eleven days, and a useful starting
-- itinerary. Idempotent: safe to re-run (all ids are fixed).

insert into public.trips (id, name, start_date, end_date, base_currency, exchange_rates)
values (
  '00000000-0000-4000-8000-000000000001',
  'Uzbekistan & Tajikistan',
  '2026-10-07',
  '2026-10-17',
  'EUR',
  '{"UZS": 13000, "TJS": 12}'::jsonb
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Stops, in visiting order
-- ---------------------------------------------------------------------------
insert into public.stops (id, trip_id, name, lon, lat, sort_order) values
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000001', 'Urgench', 60.63, 41.55, 1),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000001', 'Moynaq', 59.03, 43.77, 2),
  ('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000001', 'Khiva', 60.36, 41.38, 3),
  ('00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000001', 'Ayaz Kala', 61.03, 41.90, 4),
  ('00000000-0000-4000-8000-000000000105', '00000000-0000-4000-8000-000000000001', 'Bukhara', 64.42, 39.77, 5),
  ('00000000-0000-4000-8000-000000000106', '00000000-0000-4000-8000-000000000001', 'Sentob (Nuratau)', 66.25, 40.55, 6),
  ('00000000-0000-4000-8000-000000000107', '00000000-0000-4000-8000-000000000001', 'Samarkand', 66.97, 39.65, 7),
  ('00000000-0000-4000-8000-000000000108', '00000000-0000-4000-8000-000000000001', 'Haft Kul (Tajikistan)', 68.10, 39.25, 8),
  ('00000000-0000-4000-8000-000000000109', '00000000-0000-4000-8000-000000000001', 'Tashkent', 69.24, 41.30, 9)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Days, 7–17 October
-- ---------------------------------------------------------------------------
insert into public.days (id, trip_id, date, title) values
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000001', '2026-10-07', 'Flight'),
  ('00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000001', '2026-10-08', 'Urgench → Moynaq → Khiva'),
  ('00000000-0000-4000-8000-000000000303', '00000000-0000-4000-8000-000000000001', '2026-10-09', 'Khiva'),
  ('00000000-0000-4000-8000-000000000304', '00000000-0000-4000-8000-000000000001', '2026-10-10', 'Khiva → desert castles → Bukhara'),
  ('00000000-0000-4000-8000-000000000305', '00000000-0000-4000-8000-000000000001', '2026-10-11', 'Bukhara'),
  ('00000000-0000-4000-8000-000000000306', '00000000-0000-4000-8000-000000000001', '2026-10-12', 'Bukhara → Nuratau mountains'),
  ('00000000-0000-4000-8000-000000000307', '00000000-0000-4000-8000-000000000001', '2026-10-13', 'Nuratau → Samarkand'),
  ('00000000-0000-4000-8000-000000000308', '00000000-0000-4000-8000-000000000001', '2026-10-14', 'Samarkand → Tajikistan → Samarkand'),
  ('00000000-0000-4000-8000-000000000309', '00000000-0000-4000-8000-000000000001', '2026-10-15', 'Samarkand'),
  ('00000000-0000-4000-8000-000000000310', '00000000-0000-4000-8000-000000000001', '2026-10-16', 'Samarkand → Tashkent'),
  ('00000000-0000-4000-8000-000000000311', '00000000-0000-4000-8000-000000000001', '2026-10-17', 'Tashkent')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Entries
-- ---------------------------------------------------------------------------
insert into public.entries
  (id, trip_id, date, stop_id, type, title, time, booking_status, notes, position)
values
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000001', '2026-10-07', null, 'flight', 'Milan Malpensa → Urgench', '20:00', 'to_book', 'Evening departure from Milan Malpensa.', 1),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000001', '2026-10-08', null, 'note', 'Land in Urgench', '05:00', 'booked', 'Land 05:00.', 1),
  ('00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000001', '2026-10-08', '00000000-0000-4000-8000-000000000102', 'tour', 'Aral Sea ship cemetery tour', null, 'to_book', 'Full-day Aral Sea ship cemetery tour.', 2),
  ('00000000-0000-4000-8000-000000000204', '00000000-0000-4000-8000-000000000001', '2026-10-08', '00000000-0000-4000-8000-000000000103', 'accommodation', 'Night in Khiva', null, 'to_book', null, 3),
  ('00000000-0000-4000-8000-000000000205', '00000000-0000-4000-8000-000000000001', '2026-10-09', '00000000-0000-4000-8000-000000000103', 'sight', 'Ichan Kala', null, 'booked', 'Full day inside Ichan Kala.', 1),
  ('00000000-0000-4000-8000-000000000206', '00000000-0000-4000-8000-000000000001', '2026-10-10', '00000000-0000-4000-8000-000000000104', 'tour', 'Ellik-Qala fortresses', null, 'to_book', 'Ellik-Qala fortresses.', 1),
  ('00000000-0000-4000-8000-000000000207', '00000000-0000-4000-8000-000000000001', '2026-10-10', '00000000-0000-4000-8000-000000000105', 'road_transfer', 'Across the Kyzylkum → Bukhara', null, 'to_book', 'Road across the Kyzylkum.', 2),
  ('00000000-0000-4000-8000-000000000208', '00000000-0000-4000-8000-000000000001', '2026-10-10', '00000000-0000-4000-8000-000000000105', 'accommodation', 'Night in Bukhara', null, 'to_book', null, 3),
  ('00000000-0000-4000-8000-000000000209', '00000000-0000-4000-8000-000000000001', '2026-10-11', '00000000-0000-4000-8000-000000000105', 'sight', 'Bukhara old town', null, 'booked', 'Full day.', 1),
  ('00000000-0000-4000-8000-000000000210', '00000000-0000-4000-8000-000000000001', '2026-10-12', '00000000-0000-4000-8000-000000000106', 'road_transfer', 'Pickup → Nuratau', null, 'to_book', 'Pickup, village homestay.', 1),
  ('00000000-0000-4000-8000-000000000211', '00000000-0000-4000-8000-000000000001', '2026-10-12', '00000000-0000-4000-8000-000000000106', 'accommodation', 'Village homestay', null, 'to_book', null, 2),
  ('00000000-0000-4000-8000-000000000212', '00000000-0000-4000-8000-000000000001', '2026-10-12', '00000000-0000-4000-8000-000000000106', 'tour', 'Horse riding', null, 'to_book', null, 3),
  ('00000000-0000-4000-8000-000000000213', '00000000-0000-4000-8000-000000000001', '2026-10-13', '00000000-0000-4000-8000-000000000106', 'tour', 'Morning horse riding', null, 'to_book', null, 1),
  ('00000000-0000-4000-8000-000000000214', '00000000-0000-4000-8000-000000000001', '2026-10-13', '00000000-0000-4000-8000-000000000107', 'road_transfer', 'Transfer → Samarkand', null, 'to_book', 'Afternoon transfer, evening arrival.', 2),
  ('00000000-0000-4000-8000-000000000215', '00000000-0000-4000-8000-000000000001', '2026-10-14', '00000000-0000-4000-8000-000000000108', 'tour', 'Seven Lakes (Haft Kul) day trip', null, 'to_book', 'Full-day Seven Lakes (Haft Kul) trip via Jartepa border.', 1),
  ('00000000-0000-4000-8000-000000000216', '00000000-0000-4000-8000-000000000001', '2026-10-15', '00000000-0000-4000-8000-000000000107', 'sight', 'Samarkand', null, 'booked', 'Full day.', 1),
  ('00000000-0000-4000-8000-000000000217', '00000000-0000-4000-8000-000000000001', '2026-10-16', '00000000-0000-4000-8000-000000000109', 'train', 'Afrosiyob → Tashkent', '09:00', 'to_book', 'Afrosiyob high-speed train.', 1),
  ('00000000-0000-4000-8000-000000000218', '00000000-0000-4000-8000-000000000001', '2026-10-16', '00000000-0000-4000-8000-000000000109', 'sight', 'Tashkent', null, 'booked', 'Full day in the capital.', 2),
  ('00000000-0000-4000-8000-000000000219', '00000000-0000-4000-8000-000000000001', '2026-10-17', '00000000-0000-4000-8000-000000000109', 'sight', 'Free morning in Tashkent', null, 'booked', null, 1),
  ('00000000-0000-4000-8000-000000000220', '00000000-0000-4000-8000-000000000001', '2026-10-17', null, 'flight', 'Return flight home', '15:00', 'to_book', 'Afternoon flight home.', 2)
on conflict (id) do nothing;
