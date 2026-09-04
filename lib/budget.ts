import { ENTRY_TYPES, type Entry, type EntryType } from "./types";

export interface BudgetSummary {
  /** Total cost per person. */
  perPerson: number;
  /** Total cost for the whole party (perPerson × people). */
  forBoth: number;
  /** Already-booked cost, for the whole party. */
  booked: number;
  /** Still-to-pay cost, for the whole party. */
  toPay: number;
  /** Per-person cost by entry type. */
  byCategory: Record<EntryType, number>;
  /** Entries with a cost that still need booking. */
  needsBooking: Entry[];
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

/**
 * Pure budget rollup. Costs are always per person (base currency), so the
 * party total is a straight multiply — there is no per-person flag to drift.
 */
export function summarizeBudget(entries: Entry[], people = 2): BudgetSummary {
  const withCost = entries.filter(
    (e): e is Entry & { costPerPerson: number } => e.costPerPerson != null && e.costPerPerson > 0,
  );

  const perPerson = sum(withCost.map((e) => e.costPerPerson));
  const bookedPerPerson = sum(
    withCost.filter((e) => e.bookingStatus === "booked").map((e) => e.costPerPerson),
  );
  const toPayPerPerson = sum(
    withCost.filter((e) => e.bookingStatus === "to_book").map((e) => e.costPerPerson),
  );

  const byCategory = Object.fromEntries(ENTRY_TYPES.map((type) => [type, 0])) as Record<
    EntryType,
    number
  >;
  for (const entry of withCost) {
    byCategory[entry.type] += entry.costPerPerson;
  }

  return {
    perPerson,
    forBoth: perPerson * people,
    booked: bookedPerPerson * people,
    toPay: toPayPerPerson * people,
    byCategory,
    needsBooking: withCost.filter((e) => e.bookingStatus === "to_book"),
  };
}
