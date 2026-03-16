-- Rebolt records: append-only history of rebolting events
create table rebolt_records (
  id            uuid primary key default gen_random_uuid(),
  route_id      uuid not null references routes(id) on delete cascade,
  rebolted_on   date not null,
  rebolted_by   text,
  reported_by   uuid not null references auth.users(id),
  bolt_type     text,
  notes         text,
  created_at    timestamptz default now()
);

create index idx_rebolt_route on rebolt_records(route_id);

alter table rebolt_records enable row level security;
create policy "Public read" on rebolt_records for select using (true);
create policy "Auth insert" on rebolt_records for insert with check (auth.role() = 'authenticated');
create policy "Auth update" on rebolt_records for update using (auth.role() = 'authenticated');
