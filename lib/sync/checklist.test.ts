import { describe, expect, it } from "vitest";
import type { ChecklistItem } from "@/lib/types";
import { nextChecklistPosition, removeChecklistItem, upsertChecklistItem } from "./checklist";

function item(partial: Partial<ChecklistItem> & { id: string }): ChecklistItem {
  return { title: "x", done: false, position: 1, ...partial };
}

describe("checklist sync helpers", () => {
  it("upserts by id and keeps position order", () => {
    const result = upsertChecklistItem(
      [item({ id: "1", position: 1 }), item({ id: "2", position: 3 })],
      item({ id: "2", position: 2, done: true }),
    );
    expect(result.map((i) => i.id)).toEqual(["1", "2"]);
    expect(result[1].done).toBe(true);
    expect(result[1].position).toBe(2);
  });

  it("removes by id", () => {
    const result = removeChecklistItem([item({ id: "1" }), item({ id: "2" })], "1");
    expect(result.map((i) => i.id)).toEqual(["2"]);
  });

  it("computes the next position", () => {
    expect(nextChecklistPosition([item({ id: "1", position: 4 })])).toBe(5);
    expect(nextChecklistPosition([])).toBe(1);
  });
});
