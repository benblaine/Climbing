import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Area } from "@/lib/types/database";

export default async function AreasPage() {
  const supabase = await createClient();
  const { data: areas } = await supabase
    .from("areas")
    .select("*")
    .order("name") as unknown as { data: Area[] | null };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Climbing Areas</h1>

      {!areas || areas.length === 0 ? (
        <p className="text-muted-foreground">
          No areas yet. Add some climbing areas to get started.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area) => (
            <Link
              key={area.id}
              href={`/areas/${area.id}`}
              className="rounded-lg border border-border p-4 hover:border-primary transition-colors"
            >
              <h2 className="font-semibold text-lg">{area.name}</h2>
              {area.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {area.description}
                </p>
              )}
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {area.latitude.toFixed(4)}, {area.longitude.toFixed(4)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
