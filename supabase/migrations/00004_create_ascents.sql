-- Ascents: user climb logs
create table ascents (
  id            uuid primary key default gen_random_uuid(),
  route_id      uuid not null references routes(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  climbed_on    date not null default current_date,
  style         text not null default 'redpoint' check (style in ('onsight', 'flash', 'redpoint', 'toprope', 'attempt')),
  grade_opinion text,
  notes         text,
  rating        integer check (rating >= 1 and rating <= 5),
  created_at    timestamptz default now()
);

create index idx_ascents_route on ascents(route_id);
create index idx_ascents_user on ascents(user_id);

alter table ascents enable row level security;
create policy "Public read" on ascents for select using (true);
create policy "Own insert" on ascents for insert with check (auth.uid() = user_id);
create policy "Own update" on ascents for update using (auth.uid() = user_id);
create policy "Own delete" on ascents for delete using (auth.uid() = user_id);
