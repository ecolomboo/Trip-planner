"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useChecklist } from "@/hooks/use-checklist";
import type { ChecklistItem } from "@/lib/types";

const FIELD = "w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-ink";

export function Checklist({ tripId, items: initial }: { tripId: string; items: ChecklistItem[] }) {
  const { items, addItem, toggleItem, deleteItem } = useChecklist(tripId, initial);
  const t = useTranslations("checklist");
  const tCommon = useTranslations("common");
  const [title, setTitle] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const value = title.trim();
    if (!value) return;
    addItem.mutate(value);
    setTitle("");
  }

  const open = items.filter((i) => !i.done);
  const done = items.filter((i) => i.done);

  return (
    <div>
      <form onSubmit={submit} className="mb-4 flex gap-2">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={t("placeholder")}
          aria-label={t("addItem")}
          className={FIELD}
        />
        <button
          type="submit"
          className="shrink-0 rounded-md bg-turquoise px-4 py-2 text-sm font-medium text-background"
        >
          {t("addItem")}
        </button>
      </form>

      {items.length === 0 ? (
        <p className="text-ink-faint">{t("empty")}</p>
      ) : (
        <ul className="space-y-2">
          {[...open, ...done].map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2"
            >
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => toggleItem.mutate({ id: item.id, done: !item.done })}
                className="h-4 w-4 shrink-0 accent-turquoise"
              />
              <span
                className={`min-w-0 flex-1 ${item.done ? "text-ink-faint line-through" : "text-ink"}`}
              >
                {item.title}
              </span>
              <button
                type="button"
                onClick={() => deleteItem.mutate(item.id)}
                aria-label={tCommon("remove")}
                className="shrink-0 text-lg leading-none text-ink-faint hover:text-pomegranate"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
