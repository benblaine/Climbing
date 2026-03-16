-- Routes: individual climbs within a crag
create table routes (
  id                  uuid primary key default gen_random_uuid(),
  crag_id             uuid not null references crags(id) on delete cascade,
  name                text not null,
  grade               text not null,
  grade_sort          integer default 0,
  style               text default 'sport' check (style in ('sport', 'trad', 'boulder', 'mixed')),
  pitches             integer default 1,
  length_meters       integer,
  description         text,
  first_ascensionist  text,
  first_ascent_date   text,
  thecrag_id          text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create index idx_routes_crag on routes(crag_id);
create index idx_routes_thecrag on routes(thecrag_id);

alter table routes enable row level security;
create policy "Public read" on routes for select using (true);
create policy "Auth insert" on routes for insert with check (auth.role() = 'authenticated');
create policy "Auth update" on routes for update using (auth.role() = 'authenticated');
