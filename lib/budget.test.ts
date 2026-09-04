import { describe, expect, it } from "vitest";
import { summarizeBudget } from "./budget";
import type { Entry } from "./types";

function entry(partial: Partial<Entry> & { id: string }): Entry {
  return {
    date: "2026-10-08",
    type: "tour",
    title: "x",
    bookingStatus: "to_book",
    position: 1,
    ...partial,
  };
}

describe("summarizeBudget", () => {
  it("ignores entries without a cost", () => {
    const entries = [entry({ id: "1" }), entry({ id: "2", costPerPerson: 10 })];
    const summary = summarizeBudget(entries, 2);
    expect(summary.perPerson).toBe(10);
    expect(summary.forBoth).toBe(20);
  });

  it("multiplies per-person costs by the party size", () => {
    const entries = [
      entry({ id: "1", costPerPerson: 50 }),
      entry({ id: "2", costPerPerson: 25.5 }),
    ];
    const summary = summarizeBudget(entries, 2);
    expect(summary.perPerson).toBeCloseTo(75.5);
    expect(summary.forBoth).toBeCloseTo(151);
  });

  it("splits booked vs to-pay for the whole party", () => {
    const entries = [
      entry({ id: "1", costPerPerson: 100, bookingStatus: "booked" }),
      entry({ id: "2", costPerPerson: 40, bookingStatus: "to_book" }),
    ];
    const summary = summarizeBudget(entries, 2);
    expect(summary.booked).toBe(200);
    expect(summary.toPay).toBe(80);
  });

  it("breaks down cost by category (per person)", () => {
    const entries = [
      entry({ id: "1", type: "flight", costPerPerson: 300 }),
      entry({ id: "2", type: "accommodation", costPerPerson: 40 }),
    ];
    const summary = summarizeBudget(entries, 2);
    expect(summary.byCategory.flight).toBe(300);
    expect(summary.byCategory.accommodation).toBe(40);
    expect(summary.byCategory.meal).toBe(0);
  });

  it("lists the entries that still need booking", () => {
    const entries = [
      entry({ id: "1", costPerPerson: 10, bookingStatus: "booked" }),
      entry({ id: "2", costPerPerson: 20, bookingStatus: "to_book" }),
    ];
    const summary = summarizeBudget(entries, 2);
    expect(summary.needsBooking.map((e) => e.id)).toEqual(["2"]);
  });
});
