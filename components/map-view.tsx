"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import { useRouter } from "@/i18n/navigation";
import type { Stop } from "@/lib/types";
import "leaflet/dist/leaflet.css";

function FitBounds({ stops }: { stops: Stop[] }) {
  const map = useMap();
  useEffect(() => {
    if (stops.length > 0) {
      map.fitBounds(L.latLngBounds(stops.map((s) => [s.lat, s.lon] as [number, number])), {
        padding: [40, 40],
      });
    }
  }, [map, stops]);
  return null;
}

function markerIcon(index: number) {
  return L.divIcon({
    className: "map-marker-wrap",
    html: `<div class="map-marker">${index}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

/** The route overview: stops as numbered markers joined by the route line. */
export function MapView({ stops }: { stops: Stop[] }) {
  const router = useRouter();
  const route: [number, number][] = stops.map((s) => [s.lat, s.lon] as [number, number]);

  return (
    <div className="h-[70vh] overflow-hidden rounded-xl border border-line">
      <MapContainer center={[41, 64]} zoom={6} className="h-full w-full" zoomControl>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={route} pathOptions={{ color: "#2fd4c0", weight: 3, opacity: 0.85 }} />
        {stops.map((stop, index) => (
          <Marker
            key={stop.id}
            position={[stop.lat, stop.lon]}
            icon={markerIcon(index + 1)}
            eventHandlers={{ click: () => router.push("/timeline") }}
          >
            <Popup>
              <span className="font-medium">{stop.name}</span>
            </Popup>
          </Marker>
        ))}
        <FitBounds stops={stops} />
      </MapContainer>
    </div>
  );
}
