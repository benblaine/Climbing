import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { getGradeColor } from "@/lib/grades";
import { formatDate } from "@/lib/utils";
import LogAscentForm from "@/components/ascents/LogAscentForm";
import AscentLog from "@/components/ascents/AscentLog";
import ReboltHistory from "@/components/rebolts/ReboltHistory";
import ReportReboltForm from "@/components/rebolts/ReportReboltForm";
import PhotoGallery from "@/components/photos/PhotoGallery";
import UploadPhotoForm from "@/components/photos/UploadPhotoForm";
import type { Route, Crag, Ascent, ReboltRecord, Photo } from "@/lib/types/database";

export default async function RouteDetailPage({
  params,
}: {
  params: Promise<{ areaId: string; cragId: string; routeId: string }>;
}) {
  const { areaId, cragId, routeId } = await params;
  const supabase = await createClient();

  const { data: route } = await supabase
    .from("routes").select("*").eq("id", routeId).single() as unknown as { data: Route | null };

  const { data: crag } = await supabase
    .from("crags").select("*").eq("id", cragId).single() as unknown as { data: Crag | null };

  const { data: ascents } = await supabase
    .from("ascents").select("*").eq("route_id", routeId)
    .order("climbed_on", { ascending: false }) as unknown as { data: Ascent[] | null };

  const { data: rebolts } = await supabase
    .from("rebolt_records").select("*").eq("route_id", routeId)
    .order("rebolted_on", { ascending: false }) as unknown as { data: ReboltRecord[] | null };

  const { data: photos } = await supabase
    .from("photos").select("*").eq("route_id", routeId)
    .order("created_at", { ascending: false }) as unknown as { data: Photo[] | null };

  if (!route) {
    return <p>Route not found.</p>;
  }

  const lastRebolt = rebolts && rebolts.length > 0 ? rebolts[0] : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href={`/areas/${areaId}/crags/${cragId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          {crag?.name ?? "Back"}
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{route.name}</h1>
              <span
                className={`inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium ${getGradeColor(
                  route.grade
                )}`}
              >
                {route.grade}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="capitalize">{route.style}</span>
              {route.pitches > 1 && <span>{route.pitches} pitches</span>}
              {route.length_meters && <span>{route.length_meters}m</span>}
            </div>
          </div>
        </div>

        {route.description && (
          <p className="mt-4 text-sm">{route.description}</p>
        )}

        {/* First Ascent */}
        {route.first_ascensionist && (
          <div className="mt-4 rounded-md bg-muted p-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>
                <strong>First Ascent:</strong> {route.first_ascensionist}
                {route.first_ascent_date && ` (${route.first_ascent_date})`}
              </span>
            </div>
          </div>
        )}

        {/* Rebolt Status */}
        {lastRebolt && (
          <div className="mt-3 rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                <strong>Last Rebolted:</strong>{" "}
                {formatDate(lastRebolt.rebolted_on)}
                {lastRebolt.rebolted_by && ` by ${lastRebolt.rebolted_by}`}
                {lastRebolt.bolt_type && ` (${lastRebolt.bolt_type})`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Photos */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Photos</h2>
        <PhotoGallery photos={photos ?? []} />
        <UploadPhotoForm routeId={routeId} />
      </section>

      {/* Ascent Log */}
      <section>
        <h2 className="text-lg font-semibold mb-3">
          Ascents ({ascents?.length ?? 0})
        </h2>
        <LogAscentForm routeId={routeId} />
        <AscentLog ascents={ascents ?? []} />
      </section>

      {/* Rebolt History */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Rebolt History</h2>
        <ReportReboltForm routeId={routeId} />
        <ReboltHistory records={rebolts ?? []} />
      </section>
    </div>
  );
}
