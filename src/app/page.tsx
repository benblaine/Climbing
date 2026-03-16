"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LocationProvider,
  useLocation,
} from "@/components/map/LocationProvider";
import { MapPin, Loader2, Mountain } from "lucide-react";
import Link from "next/link";
import type { CragWithArea } from "@/lib/types/database";

const CragMap = dynamic(() => import("@/components/map/CragMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] items-center justify-center rounded-lg bg-muted">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

function HomeContent() {
  const { latitude, longitude, loading: locationLoading, error: locationError } = useLocation();
  const [crags, setCrags] = useState<CragWithArea[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (latitude === null || longitude === null) return;

    setLoading(true);
    fetch(`/api/nearby-crags?lat=${latitude}&lng=${longitude}&radius=100`)
      .then((res) => res.json())
      .then((data) => {
        setCrags(data.crags ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [latitude, longitude]);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center py-4">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Mountain className="h-8 w-8 text-primary" />
          SendIt
        </h1>
        <p className="text-muted-foreground mt-1">
          Find nearby climbs, log ascents, track bolt conditions
        </p>
      </div>

      {/* Location status */}
      {locationLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Getting your location...
        </div>
      )}
      {locationError && !locationLoading && (
        <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
          <MapPin className="inline h-4 w-4 mr-1" />
          Could not get your location. Showing default area (Cape Town).
        </div>
      )}

      {/* Map */}
      <CragMap
        crags={crags}
        userLat={latitude}
        userLng={longitude}
        onCragClick={(cragId) => {
          const crag = crags.find((c) => c.id === cragId);
          if (crag?.area_id) {
            router.push(`/areas/${crag.area_id}/crags/${cragId}`);
          }
        }}
      />

      {/* Nearby crags list */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          {loading ? "Loading nearby crags..." : `Nearby Crags (${crags.length})`}
        </h2>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Searching for climbing areas near you...
          </div>
        ) : crags.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            <p>No crags found nearby.</p>
            <Link href="/areas" className="text-primary hover:underline">
              Browse all areas
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {crags.map((crag) => (
              <Link
                key={crag.id}
                href={`/areas/${crag.area_id}/crags/${crag.id}`}
                className="rounded-lg border border-border p-3 hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{crag.name}</h3>
                    {crag.area && (
                      <p className="text-xs text-muted-foreground">
                        {crag.area.name}
                      </p>
                    )}
                  </div>
                  {crag.distance_km !== undefined && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {crag.distance_km.toFixed(1)} km
                    </span>
                  )}
                </div>
                {crag.route_count !== undefined && crag.route_count > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {crag.route_count} routes
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="flex justify-center pt-4">
        <Link
          href="/areas"
          className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
        >
          Browse All Areas
        </Link>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <LocationProvider>
      <HomeContent />
    </LocationProvider>
  );
}
