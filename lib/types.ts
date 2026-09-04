/**
 * Domain types for the trip planner.
 *
 * These mirror the Postgres schema in `supabase/migrations`; once the database
 * types are generated (`supabase gen types`), the row types here are reconciled
 * against the generated `Database` type so the whole app stays `any`-free.
 */

export const ENTRY_TYPES = [
  "flight",
  "train",
  "road_transfer",
  "accommodation",
  "tour",
  "sight",
  "meal",
  "note",
] as const;

export type EntryType = (typeof ENTRY_TYPES)[number];

export type BookingStatus = "booked" | "to_book";

export interface Stop {
  id: string;
  name: string;
  lon: number;
  lat: number;
  sortOrder: number;
}

/** A day of the trip. Days are generated from the trip's date range. */
export interface TripDay {
  /** ISO `YYYY-MM-DD`, timezone-free. */
  date: string;
  /** The free-text "where" label, e.g. "Khiva → desert castles → Bukhara". */
  title: string;
}

export interface Entry {
  id: string;
  /** ISO `YYYY-MM-DD`, matching a `TripDay.date`. */
  date: string;
  type: EntryType;
  title: string;
  /** Wall-clock `HH:MM`, no timezone. */
  time?: string;
  /** Cost per person in the trip's base currency (EUR). */
  costPerPerson?: number;
  bookingStatus: BookingStatus;
  notes?: string;
  url?: string;
  stopId?: string;
  /** Manual order within a day (times are optional). */
  position: number;
}

export interface ChecklistItem {
  id: string;
  title: string;
  done: boolean;
}
