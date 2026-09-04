import { describe, expect, it } from "vitest";
import type { Entry } from "@/lib/types";
import { applyRemoteChange, nextPosition, sortEntries, toEntryRow } from "./entries";

function entry(partial: Partial<Entry> & { id: string }): Entry {
  return {
    date: "2026-10-08",
    type: "note",
    title: "x",
    bookingStatus: "to_book",
    position: 1,
    ...partial,
  };
}

describe("sortEntries", () => {
  it("orders by date, then position", () => {
    const entries = [
      entry({ id: "b", date: "2026-10-09", position: 1 }),
      entry({ id: "a", date: "2026-10-08", position: 2 }),
      entry({ id: "c", date: "2026-10-08", position: 1 }),
    ];
    expect(sortEntries(entries).map((e) => e.id)).toEqual(["c", "a", "b"]);
  });
});

describe("applyRemoteChange", () => {
  it("inserts a new entry in order", () => {
    const result = applyRemoteChange([entry({ id: "1" })], {
      eventType: "INSERT",
      new: entry({ id: "2", position: 2 }),
    });
    expect(result.map((e) => e.id)).toEqual(["1", "2"]);
  });

  it("replaces an existing entry by id (last-write-wins)", () => {
    const result = applyRemoteChange([entry({ id: "1", title: "old" })], {
      eventType: "UPDATE",
      new: entry({ id: "1", title: "new" }),
    });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("new");
  });

  it("deletes by old id", () => {
    const result = applyRemoteChange([entry({ id: "1" }), entry({ id: "2" })], {
      eventType: "DELETE",
      oldId: "1",
    });
    expect(result.map((e) => e.id)).toEqual(["2"]);
  });
});

describe("nextPosition", () => {
  it("appends after the highest position on that date", () => {
    const entries = [
      entry({ id: "1", date: "2026-10-08", position: 2 }),
      entry({ id: "2", date: "2026-10-09", position: 5 }),
    ];
    expect(nextPosition(entries, "2026-10-08")).toBe(3);
  });
});

describe("toEntryRow", () => {
  it("maps to snake_case, pads time, and nulls empty optionals", () => {
    const row = toEntryRow(
      { date: "2026-10-08", type: "train", title: "T", bookingStatus: "booked", time: "09:00" },
      3,
      "trip-1",
    );
    expect(row).toMatchObject({
      trip_id: "trip-1",
      booking_status: "booked",
      time: "09:00:00",
      position: 3,
      cost_per_person: null,
      notes: null,
      stop_id: null,
    });
  });
});
