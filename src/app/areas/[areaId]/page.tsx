import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MapPin, ArrowLeft } from "lucide-react";
import type { Area, Crag } from "@/lib/types/database";

export default async function AreaDetailPage({
  params,
}: {
  params: Promise<{ areaId: string }>;
}) {
  const { areaId } = await params;
  const supabase = await createClient();

  const { data: area } = await supabase
    .from("areas")
    .select("*")
    .eq("id", areaId)
    .single() as unknown as { data: Area | null };

  if (!area) {
    return <p>Area not found.</p>;
  }

  const { data: crags } = await supabase
    .from("crags")
    .select("*")
    .eq("area_id", areaId)
    .order("name") as unknown as { data: Crag[] | null };

  return (
    <div>
      <Link
        href="/areas"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        All Areas
      </Link>

      <h1 className="text-2xl font-bold">{area.name}</h1>
      {area.description && (
        <p className="text-muted-foreground mt-1">{area.description}</p>
      )}

      <h2 className="text-lg font-semibold mt-6 mb-4">
        Crags ({crags?.length ?? 0})
      </h2>

      {!crags || crags.length === 0 ? (
        <p className="text-muted-foreground">No crags in this area yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {crags.map((crag) => (
            <Link
              key={crag.id}
              href={`/areas/${areaId}/crags/${crag.id}`}
              className="rounded-lg border border-border p-4 hover:border-primary transition-colors"
            >
              <h3 className="font-semibold">{crag.name}</h3>
              {crag.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {crag.description}
                </p>
              )}
              {crag.approach && (
                <p className="text-xs text-muted-foreground mt-2">
                  Approach: {crag.approach}
                </p>
              )}
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {crag.latitude.toFixed(4)}, {crag.longitude.toFixed(4)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
