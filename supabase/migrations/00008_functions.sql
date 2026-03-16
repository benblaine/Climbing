-- Helper function: find crags near a GPS point
create or replace function nearby_crags(
  user_lat double precision,
  user_lng double precision,
  radius_km double precision default 50
)
returns table (
  id uuid,
  area_id uuid,
  name text,
  description text,
  latitude double precision,
  longitude double precision,
  approach text,
  created_at timestamptz,
  updated_at timestamptz,
  distance_km double precision,
  area_name text,
  route_count bigint
)
language sql stable
as $$
  select
    c.id,
    c.area_id,
    c.name,
    c.description,
    c.latitude,
    c.longitude,
    c.approach,
    c.created_at,
    c.updated_at,
    ST_Distance(
      c.location,
      ST_MakePoint(user_lng, user_lat)::geography
    ) / 1000.0 as distance_km,
    a.name as area_name,
    (select count(*) from routes r where r.crag_id = c.id) as route_count
  from crags c
  join areas a on a.id = c.area_id
  where ST_DWithin(
    c.location,
    ST_MakePoint(user_lng, user_lat)::geography,
    radius_km * 1000
  )
  order by ST_Distance(
    c.location,
    ST_MakePoint(user_lng, user_lat)::geography
  );
$$;

-- Auto-set location geography column from lat/lng on areas
create or replace function set_area_location()
returns trigger
language plpgsql
as $$
begin
  new.location := ST_MakePoint(new.longitude, new.latitude)::geography;
  return new;
end;
$$;

create trigger areas_set_location
  before insert or update on areas
  for each row execute procedure set_area_location();

-- Auto-set location geography column from lat/lng on crags
create or replace function set_crag_location()
returns trigger
language plpgsql
as $$
begin
  new.location := ST_MakePoint(new.longitude, new.latitude)::geography;
  return new;
end;
$$;

create trigger crags_set_location
  before insert or update on crags
  for each row execute procedure set_crag_location();
