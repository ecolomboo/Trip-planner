"use client";

import dynamic from "next/dynamic";
import type { Stop } from "@/lib/types";

// Leaflet touches `window` at import time, so the map is loaded client-only.
const MapView = dynamic(() => import("./map-view").then((m) => m.MapView), {
  ssr: false,
  loading: () => <div className="h-[70vh] rounded-xl border border-line bg-surface" />,
});

export function MapClient({ stops }: { stops: Stop[] }) {
  return <MapView stops={stops} />;
}
