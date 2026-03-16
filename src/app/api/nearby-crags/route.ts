import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const radius = parseFloat(searchParams.get("radius") ?? "50");

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: "lat and lng are required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Try PostGIS function first, fall back to manual distance calc
  const { data, error } = await supabase.rpc("nearby_crags", {
    user_lat: lat,
    user_lng: lng,
    radius_km: radius,
  });

  if (error) {
    // Fallback: fetch all crags and filter client-side
    const { data: allCrags } = await supabase
      .from("crags")
      .select("*, area:areas(*)");

    if (!allCrags) {
      return NextResponse.json({ crags: [] });
    }

    const R = 6371;
    const nearby = allCrags
      .map((crag) => {
        const dLat = ((crag.latitude - lat) * Math.PI) / 180;
        const dLon = ((crag.longitude - lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat * Math.PI) / 180) *
            Math.cos((crag.latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance_km = R * c;
        return { ...crag, distance_km };
      })
      .filter((c) => c.distance_km <= radius)
      .sort((a, b) => a.distance_km - b.distance_km);

    return NextResponse.json({ crags: nearby });
  }

  return NextResponse.json({ crags: data });
}
