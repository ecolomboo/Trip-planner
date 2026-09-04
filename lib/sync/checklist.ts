import type { ChecklistItem } from "@/lib/types";
import type { Database } from "@/types/database";

type ChecklistInsert = Database["public"]["Tables"]["checklist_items"]["Insert"];

/** Next position for a new item (appends at the end). */
export function nextChecklistPosition(items: ChecklistItem[]): number {
  return items.reduce((max, item) => Math.max(max, item.position), 0) + 1;
}

/** Insert or replace an item, keeping position order. */
export function upsertChecklistItem(items: ChecklistItem[], item: ChecklistItem): ChecklistItem[] {
  return [...items.filter((i) => i.id !== item.id), item].sort((a, b) => a.position - b.position);
}

/** Remove an item by id. */
export function removeChecklistItem(items: ChecklistItem[], id: string): ChecklistItem[] {
  return items.filter((i) => i.id !== id);
}

/** Convert a new item's title (+ position) to a Postgres insert row. */
export function toChecklistRow(title: string, position: number, tripId: string): ChecklistInsert {
  return { trip_id: tripId, title, position, done: false };
}
