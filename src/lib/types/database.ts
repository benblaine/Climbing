export interface Area {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}

export interface Crag {
  id: string;
  area_id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  approach: string | null;
  created_at: string;
  updated_at: string;
}

export interface Route {
  id: string;
  crag_id: string;
  name: string;
  grade: string;
  grade_sort: number;
  style: "sport" | "trad" | "boulder" | "mixed";
  pitches: number;
  length_meters: number | null;
  description: string | null;
  first_ascensionist: string | null;
  first_ascent_date: string | null;
  thecrag_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Ascent {
  id: string;
  route_id: string;
  user_id: string;
  climbed_on: string;
  style: "onsight" | "flash" | "redpoint" | "toprope" | "attempt";
  grade_opinion: string | null;
  notes: string | null;
  rating: number | null;
  created_at: string;
}

export interface ReboltRecord {
  id: string;
  route_id: string;
  rebolted_on: string;
  rebolted_by: string | null;
  reported_by: string;
  bolt_type: string | null;
  notes: string | null;
  created_at: string;
}

export interface Photo {
  id: string;
  route_id: string | null;
  crag_id: string | null;
  user_id: string;
  storage_path: string;
  caption: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

export interface RouteWithDetails extends Route {
  ascent_count?: number;
  last_rebolted?: string | null;
  crag?: Crag;
}

export interface CragWithArea extends Crag {
  area?: Area;
  route_count?: number;
  distance_km?: number;
}
