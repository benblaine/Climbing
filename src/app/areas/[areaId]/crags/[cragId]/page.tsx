import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getGradeColor } from "@/lib/grades";
import type { Crag, Route, Area } from "@/lib/types/database";

export default async function CragDetailPage({
  params,
}: {
  params: Promise<{ areaId: string; cragId: string }>;
}) {
  const { areaId, cragId } = await params;
  const supabase = await createClient();

  const { data: crag } = await supabase
    .from("crags")
    .select("*")
    .eq("id", cragId)
    .single() as unknown as { data: Crag | null };

  const { data: area } = await supabase
    .from("areas")
    .select("*")
    .eq("id", areaId)
    .single() as unknown as { data: Area | null };

  const { data: routes } = await supabase
    .from("routes")
    .select("*")
    .eq("crag_id", cragId)
    .order("grade_sort", { ascending: true }) as unknown as { data: Route[] | null };

  if (!crag) {
    return <p>Crag not found.</p>;
  }

  return (
    <div>
      <Link
        href={`/areas/${areaId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        {area?.name ?? "Back"}
      </Link>

      <h1 className="text-2xl font-bold">{crag.name}</h1>
      {crag.description && (
        <p className="text-muted-foreground mt-1">{crag.description}</p>
      )}
      {crag.approach && (
        <div className="mt-3 rounded-md bg-muted p-3 text-sm">
          <strong>Approach:</strong> {crag.approach}
        </div>
      )}

      <h2 className="text-lg font-semibold mt-6 mb-4">
        Routes ({routes?.length ?? 0})
      </h2>

      {!routes || routes.length === 0 ? (
        <p className="text-muted-foreground">No routes at this crag yet.</p>
      ) : (
        <div className="space-y-2">
          {routes.map((route) => (
            <Link
              key={route.id}
              href={`/areas/${areaId}/crags/${cragId}/routes/${route.id}`}
              className="flex items-center justify-between rounded-lg border border-border p-3 hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getGradeColor(
                    route.grade
                  )}`}
                >
                  {route.grade}
                </span>
                <span className="font-medium">{route.name}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {route.style !== "sport" && (
                  <span className="capitalize">{route.style}</span>
                )}
                {route.pitches > 1 && <span>{route.pitches}p</span>}
                {route.length_meters && <span>{route.length_meters}m</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
