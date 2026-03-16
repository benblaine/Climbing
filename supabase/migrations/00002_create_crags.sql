-- Crags: sectors within an area (Cogmans Cave, Montagu West)
create table crags (
  id          uuid primary key default gen_random_uuid(),
  area_id     uuid not null references areas(id) on delete cascade,
  name        text not null,
  description text,
  location    geography(Point, 4326),
  latitude    double precision not null,
  longitude   double precision not null,
  approach    text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index idx_crags_area on crags(area_id);

alter table crags enable row level security;
create policy "Public read" on crags for select using (true);
create policy "Auth insert" on crags for insert with check (auth.role() = 'authenticated');
create policy "Auth update" on crags for update using (auth.role() = 'authenticated');
