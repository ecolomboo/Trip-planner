"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { useEntries } from "@/hooks/use-entries";
import { useMediaQuery } from "@/hooks/use-media-query";
import { parseTripDate } from "@/lib/format";
import type { BookingStatus, Entry, EntryDraft, EntryType, Stop, TripDay } from "@/lib/types";
import { EntryDetail } from "./entry-detail";
import { EntryEditor } from "./entry-editor";

/** Accent per entry type — one ceramic colour, used as a quiet dot. */
const TYPE_DOT: Record<EntryType, string> = {
  flight: "bg-turquoise",
  train: "bg-turquoise",
  road_transfer: "bg-ochre",
  accommodation: "bg-ochre",
  tour: "bg-turquoise",
  sight: "bg-ochre",
  meal: "bg-pomegranate",
  note: "bg-ink-faint",
};

/** Booking status: ochre means "needs action", muted means done. */
const BOOKING_CHIP: Record<BookingStatus, string> = {
  booked: "text-ink-faint",
  to_book: "bg-ochre/15 text-ochre",
};

interface Props {
  tripId: string;
  days: TripDay[];
  stops: Stop[];
  entries: Entry[];
}

interface EditorState {
  mode: "add" | "edit";
  entry: Entry | null;
  defaultDate: string;
}

export function Timeline({ tripId, days, stops, entries: initialEntries }: Props) {
  const { entries, addEntry, updateEntry, deleteEntry } = useEntries(tripId, initialEntries);

  const todayIso = new Date().toISOString().slice(0, 10);
  const [focusDate, setFocusDate] = useState<string>(() =>
    days.some((d) => d.date === todayIso) ? todayIso : (days[0]?.date ?? ""),
  );
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const selectedEntry = selectedId ? (entries.find((e) => e.id === selectedId) ?? null) : null;

  const format = useFormatter();
  const t = useTranslations("timeline");
  const tTypes = useTranslations("entry.types");
  const tBooking = useTranslations("entry.booking");
  const tCommon = useTranslations("common");

  const byDate = useMemo(() => {
    const map = new Map<string, Entry[]>();
    for (const entry of entries) {
      const list = map.get(entry.date) ?? [];
      list.push(entry);
      map.set(entry.date, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.position - b.position || (a.time ?? "").localeCompare(b.time ?? ""));
    }
    return map;
  }, [entries]);

  function handleSave(draft: EntryDraft) {
    if (editor?.mode === "edit" && editor.entry) {
      updateEntry.mutate({ ...draft, id: editor.entry.id, position: editor.entry.position });
    } else {
      addEntry.mutate(draft);
    }
    setEditor(null);
  }

  function handleDelete(id: string) {
    deleteEntry.mutate(id);
    setEditor(null);
    setSelectedId((current) => (current === id ? null : current));
  }

  function openEditor(entry: Entry) {
    setFocusDate(entry.date);
    setEditor({ mode: "edit", entry, defaultDate: entry.date });
  }

  // Desktop keyboard: "n" opens the add dialog on the last-focussed day, so
  // several entries can be added in a row without touching the mouse.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      const typing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;
      if (event.key === "n" && !typing && !editor) {
        event.preventDefault();
        setEditor({ mode: "add", entry: null, defaultDate: focusDate });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editor, focusDate]);

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
      <div>
        <ol>
          {days.map((day, index) => {
            const dayEntries = byDate.get(day.date) ?? [];
            const isToday = day.date === todayIso;
            return (
              <li key={day.date} className="flex gap-3 sm:gap-4">
                {/* Rail: day number, diamond marker, connecting line */}
                <div className="flex w-12 shrink-0 flex-col items-center">
                  <span
                    className={`font-display text-3xl font-semibold leading-none ${
                      isToday ? "text-turquoise" : "text-ink"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span
                    className={`mt-2 h-2.5 w-2.5 rotate-45 rounded-[2px] ${
                      isToday ? "bg-turquoise shadow-glow" : "bg-turquoise/70"
                    }`}
                    aria-hidden="true"
                  />
                  {index < days.length - 1 && (
                    <span className="mt-2 w-px flex-1 bg-line" aria-hidden="true" />
                  )}
                </div>

                {/* Day content */}
                <div className={`min-w-0 flex-1 ${index < days.length - 1 ? "pb-10" : "pb-2"}`}>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
                      {format.dateTime(parseTripDate(day.date), {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        timeZone: "UTC",
                      })}
                    </p>
                    {isToday && (
                      <span className="rounded-full bg-turquoise/15 px-2 py-0.5 text-[11px] font-semibold leading-none text-turquoise">
                        {t("today")}
                      </span>
                    )}
                    <h2 className="text-lg font-medium leading-tight text-ink">{day.title}</h2>
                  </div>

                  {dayEntries.length === 0 ? (
                    <p className="mt-3 text-sm text-ink-faint">{t("noEntries")}</p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {dayEntries.map((entry) => (
                        <EntryRow
                          key={entry.id}
                          entry={entry}
                          typeLabel={tTypes(entry.type)}
                          bookingLabel={tBooking(entry.bookingStatus)}
                          selected={selectedId === entry.id}
                          onClick={() => setSelectedId(entry.id)}
                        />
                      ))}
                    </ul>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setFocusDate(day.date);
                      setEditor({ mode: "add", entry: null, defaultDate: day.date });
                    }}
                    className="mt-3 flex min-h-11 w-full items-center justify-center gap-1 rounded-xl border border-dashed border-line-strong px-3 text-sm font-medium text-ink-faint transition-colors hover:border-turquoise hover:text-turquoise sm:w-auto"
                  >
                    <span className="text-base leading-none" aria-hidden="true">
                      +
                    </span>
                    {t("addEntry")}
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Desktop detail panel */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          {selectedEntry ? (
            <EntryDetail
              entry={selectedEntry}
              stops={stops}
              onEdit={() => openEditor(selectedEntry)}
              onDelete={() => handleDelete(selectedEntry.id)}
            />
          ) : (
            <div className="rounded-2xl border border-line bg-surface p-5 text-sm text-ink-faint shadow-card">
              <svg
                viewBox="0 0 24 24"
                className="mb-3 h-6 w-6 text-ink-faint"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 7h16M4 12h16M4 17h10" />
              </svg>
              <p className="font-medium text-ink-muted">{t("selectHint")}</p>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile detail sheet */}
      {selectedEntry && !isDesktop && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setSelectedId(null)}
            aria-hidden="true"
          />
          <div className="relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-line bg-surface p-5 shadow-float animate-sheet-up sm:rounded-2xl">
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              aria-label={tCommon("close")}
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-ink-faint transition-colors hover:bg-surface-raised hover:text-ink"
            >
              <span className="text-lg leading-none" aria-hidden="true">
                ×
              </span>
            </button>
            <EntryDetail
              entry={selectedEntry}
              stops={stops}
              onEdit={() => {
                openEditor(selectedEntry);
                setSelectedId(null);
              }}
              onDelete={() => {
                handleDelete(selectedEntry.id);
                setSelectedId(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Floating add button — one tap from anywhere on a phone. */}
      {!isDesktop && (
        <button
          type="button"
          onClick={() => setEditor({ mode: "add", entry: null, defaultDate: focusDate })}
          aria-label={t("addEntry")}
          className="btn-primary fixed bottom-24 right-4 z-40 grid h-14 w-14 place-items-center rounded-full shadow-glow md:bottom-8 md:right-6"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      )}

      {editor && (
        <EntryEditor
          mode={editor.mode}
          entry={editor.entry}
          defaultDate={editor.defaultDate}
          days={days}
          stops={stops}
          onClose={() => setEditor(null)}
          onSave={handleSave}
          onDelete={editor.mode === "edit" ? handleDelete : undefined}
        />
      )}
    </div>
  );
}

function EntryRow({
  entry,
  typeLabel,
  bookingLabel,
  selected,
  onClick,
}: {
  entry: Entry;
  typeLabel: string;
  bookingLabel: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        className={`flex min-h-[56px] w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all ${
          selected
            ? "border-turquoise/60 bg-surface-raised shadow-card"
            : "border-line bg-surface hover:border-line-strong active:bg-surface-raised"
        }`}
      >
        <span
          className={`mt-1 h-2 w-2 shrink-0 self-start rounded-full ${TYPE_DOT[entry.type]}`}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate font-medium text-ink">{entry.title}</span>
            {entry.time && (
              <span className="shrink-0 font-mono text-xs tabular-nums text-ink-muted">
                {entry.time}
              </span>
            )}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span className="rounded-full bg-surface-raised px-2 py-0.5 text-ink-muted">
              {typeLabel}
            </span>
            <span className={`rounded-full px-2 py-0.5 font-medium ${BOOKING_CHIP[entry.bookingStatus]}`}>
              {bookingLabel}
            </span>
            {entry.notes && (
              <span className="truncate text-ink-faint" title={entry.notes}>
                · {entry.notes}
              </span>
            )}
          </span>
        </span>
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 shrink-0 text-ink-faint"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
    </li>
  );
}
