"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import type { CragWithArea } from "@/lib/types/database";

// Fix Leaflet default marker icons in Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "hue-rotate-180",
});

L.Marker.prototype.options.icon = defaultIcon;

function FlyToLocation({
  lat,
  lng,
}: {
  lat: number;
  lng: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 10, { duration: 1.5 });
  }, [map, lat, lng]);
  return null;
}

interface CragMapProps {
  crags: CragWithArea[];
  userLat?: number | null;
  userLng?: number | null;
  onCragClick?: (cragId: string) => void;
}

export default function CragMap({
  crags,
  userLat,
  userLng,
  onCragClick,
}: CragMapProps) {
  const centerLat = userLat ?? -33.9249;
  const centerLng = userLng ?? 18.4241;

  return (
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={8}
      className="h-[400px] w-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userLat && userLng && (
        <>
          <FlyToLocation lat={userLat} lng={userLng} />
          <Marker position={[userLat, userLng]} icon={userIcon}>
            <Popup>Your location</Popup>
          </Marker>
        </>
      )}

      {crags.map((crag) => (
        <Marker key={crag.id} position={[crag.latitude, crag.longitude]}>
          <Popup>
            <div className="text-sm">
              <strong
                className="cursor-pointer text-blue-600 hover:underline"
                onClick={() => onCragClick?.(crag.id)}
              >
                {crag.name}
              </strong>
              {crag.area && (
                <p className="text-gray-500">{crag.area.name}</p>
              )}
              {crag.route_count !== undefined && (
                <p>{crag.route_count} routes</p>
              )}
              {crag.distance_km !== undefined && (
                <p>{crag.distance_km.toFixed(1)} km away</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
