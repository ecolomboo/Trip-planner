import type { Entry, EntryDraft } from "@/lib/types";
import type { Database } from "@/types/database";

type EntryInsert = Database["public"]["Tables"]["entries"]["Insert"];

/*
 * Pure, testable cache helpers. The mutations and the realtime handler both
 * route through these, so the sync layer's behaviour is covered by unit tests
 * rather than only by clicking around.
 */

/** Stable order: date, then manual position, then time. */
export function sortEntries(entries: Entry[]): Entry[] {
  return [...entries].sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      a.position - b.position ||
      (a.time ?? "").localeCompare(b.time ?? ""),
  );
}

/** Insert or replace an entry, keeping order. */
export function upsertEntry(entries: Entry[], entry: Entry): Entry[] {
  return sortEntries([...entries.filter((e) => e.id !== entry.id), entry]);
}

/** Replace an entry by id, keeping order. */
export function updateEntryInCache(entries: Entry[], entry: Entry): Entry[] {
  return sortEntries(entries.map((e) => (e.id === entry.id ? entry : e)));
}

/** Remove an entry by id. */
export function removeEntryFromCache(entries: Entry[], id: string): Entry[] {
  return entries.filter((e) => e.id !== id);
}

/** A change delivered over Supabase realtime (`postgres_changes`). */
export interface EntryChangeEvent {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new?: Entry;
  oldId?: string;
}

/** Apply a remote change to a cached list, last-write-wins by id. */
export function applyRemoteChange(entries: Entry[], event: EntryChangeEvent): Entry[] {
  if (event.eventType === "DELETE" && event.oldId) {
    return removeEntryFromCache(entries, event.oldId);
  }
  if (event.new) {
    return upsertEntry(entries, event.new);
  }
  return entries;
}

/** Next manual position for a new entry on a date (appends at the end). */
export function nextPosition(entries: Entry[], date: string): number {
  return (
    entries.filter((e) => e.date === date).reduce((max, e) => Math.max(max, e.position), 0) + 1
  );
}

/** Convert a domain draft (+ position) to a Postgres insert/update row. */
export function toEntryRow(draft: EntryDraft, position: number, tripId: string): EntryInsert {
  return {
    trip_id: tripId,
    date: draft.date,
    type: draft.type,
    title: draft.title,
    time: draft.time ? (draft.time.length === 5 ? `${draft.time}:00` : draft.time) : null,
    cost_per_person: draft.costPerPerson ?? null,
    booking_status: draft.bookingStatus,
    notes: draft.notes ?? null,
    url: draft.url ?? null,
    stop_id: draft.stopId ?? null,
    position,
  };
}
