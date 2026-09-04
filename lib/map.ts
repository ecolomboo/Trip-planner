import type { Database } from "@/types/database";
import type { Entry, Stop, TripDay } from "./types";

type EntryRow = Database["public"]["Tables"]["entries"]["Row"];
type DayRow = Database["public"]["Tables"]["days"]["Row"];
type StopRow = Database["public"]["Tables"]["stops"]["Row"];

/** Map a Postgres `entries` row to the domain `Entry` type. */
export function mapEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    date: row.date,
    type: row.type,
    title: row.title,
    // `time` is stored as `HH:MM:SS`; the UI only shows `HH:MM`.
    time: row.time ? row.time.slice(0, 5) : undefined,
    costPerPerson: row.cost_per_person ?? undefined,
    bookingStatus: row.booking_status,
    notes: row.notes ?? undefined,
    url: row.url ?? undefined,
    stopId: row.stop_id ?? undefined,
    position: row.position,
  };
}

/** Map a Postgres `days` row to the domain `TripDay` type. */
export function mapDay(row: DayRow): TripDay {
  return { date: row.date, title: row.title };
}

/** Map a Postgres `stops` row to the domain `Stop` type. */
export function mapStop(row: StopRow): Stop {
  return { id: row.id, name: row.name, lon: row.lon, lat: row.lat, sortOrder: row.sort_order };
}
