import type { Entry, Stop, TripDay } from "./types";

/**
 * Canonical seed for the 11-day trip (7–17 October 2026).
 *
 * This is the same data that `supabase/migrations` seeds into Postgres, kept
 * here as typed source of truth so the app is useful the moment it runs and so
 * the timeline has something real to render before the database is wired up.
 */

export const TRIP_START = "2026-10-07";
export const TRIP_END = "2026-10-17";

export const seedStops: Stop[] = [
  { id: "stop-urgench", name: "Urgench", lon: 60.63, lat: 41.55, sortOrder: 1 },
  { id: "stop-moynaq", name: "Moynaq", lon: 59.03, lat: 43.77, sortOrder: 2 },
  { id: "stop-khiva", name: "Khiva", lon: 60.36, lat: 41.38, sortOrder: 3 },
  { id: "stop-ayaz-kala", name: "Ayaz Kala", lon: 61.03, lat: 41.9, sortOrder: 4 },
  { id: "stop-bukhara", name: "Bukhara", lon: 64.42, lat: 39.77, sortOrder: 5 },
  { id: "stop-sentob", name: "Sentob (Nuratau)", lon: 66.25, lat: 40.55, sortOrder: 6 },
  { id: "stop-samarkand", name: "Samarkand", lon: 66.97, lat: 39.65, sortOrder: 7 },
  { id: "stop-haft-kul", name: "Haft Kul (Tajikistan)", lon: 68.1, lat: 39.25, sortOrder: 8 },
  { id: "stop-tashkent", name: "Tashkent", lon: 69.24, lat: 41.3, sortOrder: 9 },
];

export const seedDays: TripDay[] = [
  { date: "2026-10-07", title: "Flight" },
  { date: "2026-10-08", title: "Urgench → Moynaq → Khiva" },
  { date: "2026-10-09", title: "Khiva" },
  { date: "2026-10-10", title: "Khiva → desert castles → Bukhara" },
  { date: "2026-10-11", title: "Bukhara" },
  { date: "2026-10-12", title: "Bukhara → Nuratau mountains" },
  { date: "2026-10-13", title: "Nuratau → Samarkand" },
  { date: "2026-10-14", title: "Samarkand → Tajikistan → Samarkand" },
  { date: "2026-10-15", title: "Samarkand" },
  { date: "2026-10-16", title: "Samarkand → Tashkent" },
  { date: "2026-10-17", title: "Tashkent" },
];

export const seedEntries: Entry[] = [
  {
    id: "entry-1",
    date: "2026-10-07",
    type: "flight",
    title: "Milan Malpensa → Urgench",
    time: "20:00",
    bookingStatus: "to_book",
    notes: "Evening departure from Milan Malpensa.",
  },
  {
    id: "entry-2",
    date: "2026-10-08",
    type: "note",
    title: "Land in Urgench",
    time: "05:00",
    bookingStatus: "booked",
    notes: "Land 05:00.",
  },
  {
    id: "entry-3",
    date: "2026-10-08",
    type: "tour",
    title: "Aral Sea ship cemetery tour",
    bookingStatus: "to_book",
    stopId: "stop-moynaq",
    notes: "Full-day Aral Sea ship cemetery tour.",
  },
  {
    id: "entry-4",
    date: "2026-10-08",
    type: "accommodation",
    title: "Night in Khiva",
    bookingStatus: "to_book",
    stopId: "stop-khiva",
  },
  {
    id: "entry-5",
    date: "2026-10-09",
    type: "sight",
    title: "Ichan Kala",
    bookingStatus: "booked",
    stopId: "stop-khiva",
    notes: "Full day inside Ichan Kala.",
  },
  {
    id: "entry-6",
    date: "2026-10-10",
    type: "tour",
    title: "Ellik-Qala fortresses",
    bookingStatus: "to_book",
    stopId: "stop-ayaz-kala",
    notes: "Ellik-Qala fortresses.",
  },
  {
    id: "entry-7",
    date: "2026-10-10",
    type: "road_transfer",
    title: "Across the Kyzylkum → Bukhara",
    bookingStatus: "to_book",
    stopId: "stop-bukhara",
    notes: "Road across the Kyzylkum.",
  },
  {
    id: "entry-8",
    date: "2026-10-10",
    type: "accommodation",
    title: "Night in Bukhara",
    bookingStatus: "to_book",
    stopId: "stop-bukhara",
  },
  {
    id: "entry-9",
    date: "2026-10-11",
    type: "sight",
    title: "Bukhara old town",
    bookingStatus: "booked",
    stopId: "stop-bukhara",
    notes: "Full day.",
  },
  {
    id: "entry-10",
    date: "2026-10-12",
    type: "road_transfer",
    title: "Pickup → Nuratau",
    bookingStatus: "to_book",
    stopId: "stop-sentob",
    notes: "Pickup, village homestay.",
  },
  {
    id: "entry-11",
    date: "2026-10-12",
    type: "accommodation",
    title: "Village homestay",
    bookingStatus: "to_book",
    stopId: "stop-sentob",
  },
  {
    id: "entry-12",
    date: "2026-10-12",
    type: "tour",
    title: "Horse riding",
    bookingStatus: "to_book",
    stopId: "stop-sentob",
  },
  {
    id: "entry-13",
    date: "2026-10-13",
    type: "tour",
    title: "Morning horse riding",
    bookingStatus: "to_book",
    stopId: "stop-sentob",
  },
  {
    id: "entry-14",
    date: "2026-10-13",
    type: "road_transfer",
    title: "Transfer → Samarkand",
    bookingStatus: "to_book",
    stopId: "stop-samarkand",
    notes: "Afternoon transfer, evening arrival.",
  },
  {
    id: "entry-15",
    date: "2026-10-14",
    type: "tour",
    title: "Seven Lakes (Haft Kul) day trip",
    bookingStatus: "to_book",
    stopId: "stop-haft-kul",
    notes: "Full-day Seven Lakes (Haft Kul) trip via Jartepa border.",
  },
  {
    id: "entry-16",
    date: "2026-10-15",
    type: "sight",
    title: "Samarkand",
    bookingStatus: "booked",
    stopId: "stop-samarkand",
    notes: "Full day.",
  },
  {
    id: "entry-17",
    date: "2026-10-16",
    type: "train",
    title: "Afrosiyob → Tashkent",
    time: "09:00",
    bookingStatus: "to_book",
    stopId: "stop-tashkent",
    notes: "Afrosiyob high-speed train.",
  },
  {
    id: "entry-18",
    date: "2026-10-16",
    type: "sight",
    title: "Tashkent",
    bookingStatus: "booked",
    stopId: "stop-tashkent",
    notes: "Full day in the capital.",
  },
  {
    id: "entry-19",
    date: "2026-10-17",
    type: "sight",
    title: "Free morning in Tashkent",
    bookingStatus: "booked",
    stopId: "stop-tashkent",
  },
  {
    id: "entry-20",
    date: "2026-10-17",
    type: "flight",
    title: "Return flight home",
    time: "15:00",
    bookingStatus: "to_book",
    notes: "Afternoon flight home.",
  },
];

/** Day number (1-based) for a trip date, used for "Day N" labels. */
export function dayNumber(date: string): number {
  const start = Date.parse(`${TRIP_START}T00:00:00Z`);
  const current = Date.parse(`${date}T00:00:00Z`);
  return Math.round((current - start) / 86_400_000) + 1;
}
