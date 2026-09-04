"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useChecklist } from "@/hooks/use-checklist";
import type { ChecklistItem } from "@/lib/types";

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
  const progress = items.length === 0 ? 0 : Math.round((done.length / items.length) * 100);

  return (
    <div>
      <form onSubmit={submit} className="mb-4 flex gap-2">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={t("placeholder")}
          aria-label={t("addItem")}
          className="min-h-11 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint transition-colors hover:border-line-strong"
        />
        <button type="submit" className="btn-primary min-h-11 shrink-0 rounded-xl px-4 text-sm">
          {t("addItem")}
        </button>
      </form>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-ink-faint">
          {t("empty")}
        </p>
      ) : (
        <>
          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-ink-muted">
                {done.length}/{items.length}
              </span>
              <span className="font-mono tabular-nums text-ink-faint">{progress}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-raised">
              <div
                className="h-full rounded-full bg-gradient-to-r from-turquoise-deep to-turquoise-bright transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <ul className="space-y-2">
            {[...open, ...done].map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3.5 py-3 transition-colors hover:border-line-strong"
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={item.done}
                  onClick={() => toggleItem.mutate({ id: item.id, done: !item.done })}
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg border transition-colors ${
                    item.done
                      ? "border-turquoise bg-turquoise text-background"
                      : "border-line-strong bg-background text-transparent hover:border-turquoise"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => toggleItem.mutate({ id: item.id, done: !item.done })}
                  className={`min-w-0 flex-1 text-left text-sm transition-colors ${
                    item.done ? "text-ink-faint line-through" : "text-ink"
                  }`}
                >
                  {item.title}
                </button>
                <button
                  type="button"
                  onClick={() => deleteItem.mutate(item.id)}
                  aria-label={tCommon("remove")}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-faint transition-colors hover:bg-pomegranate/10 hover:text-pomegranate"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
