-- Photos: linked to routes or crags
create table photos (
  id            uuid primary key default gen_random_uuid(),
  route_id      uuid references routes(id) on delete cascade,
  crag_id       uuid references crags(id) on delete cascade,
  user_id       uuid not null references auth.users(id),
  storage_path  text not null,
  caption       text,
  created_at    timestamptz default now(),
  constraint photo_has_target check (route_id is not null or crag_id is not null)
);

create index idx_photos_route on photos(route_id);
create index idx_photos_crag on photos(crag_id);

alter table photos enable row level security;
create policy "Public read" on photos for select using (true);
create policy "Own insert" on photos for insert with check (auth.uid() = user_id);
create policy "Own delete" on photos for delete using (auth.uid() = user_id);
