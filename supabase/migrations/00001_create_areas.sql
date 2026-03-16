-- Enable PostGIS for geospatial queries
create extension if not exists postgis;

-- Areas: top-level regions (Montagu, Waterval Boven, Cape Town)
create table areas (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  location    geography(Point, 4326),
  latitude    double precision not null,
  longitude   double precision not null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table areas enable row level security;
create policy "Public read" on areas for select using (true);
create policy "Auth insert" on areas for insert with check (auth.role() = 'authenticated');
create policy "Auth update" on areas for update using (auth.role() = 'authenticated');
