/**
 * Seeds scraped data from scraped-data.json into Supabase.
 *
 * Usage:
 *   cd scripts/scraper
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx seed-database.ts
 *
 * Uses the service role key to bypass RLS.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import "dotenv/config";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface ScrapedData {
  areas: Array<{
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    url: string;
    crags: Array<{
      name: string;
      description: string;
      latitude: number;
      longitude: number;
      url: string;
      routes: Array<{
        name: string;
        grade: string;
        grade_sort: number;
        style: string;
        pitches: number;
        length_meters: number | null;
        description: string;
        first_ascensionist: string;
        first_ascent_date: string;
        thecrag_id: string;
      }>;
    }>;
  }>;
}

async function main() {
  const data: ScrapedData = JSON.parse(
    readFileSync("scraped-data.json", "utf-8")
  );

  console.log("Seeding database...\n");

  let totalRoutes = 0;
  let totalCrags = 0;

  for (const area of data.areas) {
    // Skip areas with no coords
    if (!area.latitude && !area.longitude) {
      console.log(`Skipping area without coords: ${area.name}`);
      continue;
    }

    console.log(`Area: ${area.name}`);

    // Upsert area
    const { data: areaRow, error: areaError } = await supabase
      .from("areas")
      .upsert(
        {
          name: area.name,
          description: area.description || null,
          latitude: area.latitude,
          longitude: area.longitude,
        },
        { onConflict: "name" }
      )
      .select("id")
      .single();

    if (areaError) {
      // Try insert instead (name may not have unique constraint)
      const { data: insertedArea, error: insertError } = await supabase
        .from("areas")
        .insert({
          name: area.name,
          description: area.description || null,
          latitude: area.latitude,
          longitude: area.longitude,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error(`  Error inserting area ${area.name}:`, insertError.message);
        continue;
      }
      if (!insertedArea) continue;

      await seedCrags(insertedArea.id, area.crags);
    } else if (areaRow) {
      await seedCrags(areaRow.id, area.crags);
    }
  }

  async function seedCrags(
    areaId: string,
    crags: ScrapedData["areas"][0]["crags"]
  ) {
    for (const crag of crags) {
      const { data: cragRow, error: cragError } = await supabase
        .from("crags")
        .insert({
          area_id: areaId,
          name: crag.name,
          description: crag.description || null,
          latitude: crag.latitude || 0,
          longitude: crag.longitude || 0,
        })
        .select("id")
        .single();

      if (cragError) {
        console.error(`  Error inserting crag ${crag.name}:`, cragError.message);
        continue;
      }

      totalCrags++;

      if (cragRow && crag.routes.length > 0) {
        const routeRows = crag.routes.map((route) => ({
          crag_id: cragRow.id,
          name: route.name,
          grade: route.grade,
          grade_sort: route.grade_sort,
          style: ["sport", "trad", "boulder", "mixed"].includes(route.style)
            ? route.style
            : "sport",
          pitches: route.pitches || 1,
          length_meters: route.length_meters,
          description: route.description || null,
          first_ascensionist: route.first_ascensionist || null,
          first_ascent_date: route.first_ascent_date || null,
          thecrag_id: route.thecrag_id || null,
        }));

        const { error: routeError } = await supabase
          .from("routes")
          .insert(routeRows);

        if (routeError) {
          console.error(
            `  Error inserting routes for ${crag.name}:`,
            routeError.message
          );
        } else {
          totalRoutes += routeRows.length;
        }
      }

      console.log(
        `  Crag: ${crag.name} (${crag.routes.length} routes)`
      );
    }
  }

  console.log(`\n=== Seeding Complete ===`);
  console.log(`Crags: ${totalCrags}`);
  console.log(`Routes: ${totalRoutes}`);
}

main().catch(console.error);
