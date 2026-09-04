"use client";

import { useMemo, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { useEntries } from "@/hooks/use-entries";
import { parseTripDate } from "@/lib/format";
import type { BookingStatus, Entry, EntryDraft, EntryType, Stop, TripDay } from "@/lib/types";
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
const BOOKING_TEXT: Record<BookingStatus, string> = {
  booked: "text-ink-faint",
  to_book: "text-ochre",
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
  const [editor, setEditor] = useState<EditorState | null>(null);

  const format = useFormatter();
  const t = useTranslations("timeline");
  const tTypes = useTranslations("entry.types");
  const tBooking = useTranslations("entry.booking");

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

  const todayIso = new Date().toISOString().slice(0, 10);

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
  }

  return (
    <div>
      <ol>
        {days.map((day, index) => {
          const dayEntries = byDate.get(day.date) ?? [];
          const isToday = day.date === todayIso;
          return (
            <li key={day.date} className="flex gap-4">
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
                  className="mt-2 h-2.5 w-2.5 rotate-45 rounded-[2px] bg-turquoise/70"
                  aria-hidden="true"
                />
                {index < days.length - 1 && (
                  <span className="mt-2 w-px flex-1 bg-line" aria-hidden="true" />
                )}
              </div>

              {/* Day content */}
              <div className={`min-w-0 flex-1 ${index < days.length - 1 ? "pb-10" : "pb-2"}`}>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                  <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
                    {format.dateTime(parseTripDate(day.date), {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      timeZone: "UTC",
                    })}
                    {isToday && (
                      <span className="ml-2 font-sans normal-case tracking-normal text-turquoise">
                        {t("today")}
                      </span>
                    )}
                  </p>
                  <h2 className="text-lg font-medium leading-tight text-ink">{day.title}</h2>
                </div>

                {dayEntries.length === 0 ? (
                  <p className="mt-2 text-sm text-ink-faint">{t("noEntries")}</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {dayEntries.map((entry) => (
                      <EntryRow
                        key={entry.id}
                        entry={entry}
                        typeLabel={tTypes(entry.type)}
                        bookingLabel={tBooking(entry.bookingStatus)}
                        onClick={() => setEditor({ mode: "edit", entry, defaultDate: entry.date })}
                      />
                    ))}
                  </ul>
                )}

                <button
                  type="button"
                  onClick={() => setEditor({ mode: "add", entry: null, defaultDate: day.date })}
                  className="mt-3 rounded-md px-2 py-1 text-sm text-ink-faint hover:text-turquoise"
                >
                  + {t("addEntry")}
                </button>
              </div>
            </li>
          );
        })}
      </ol>

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
  onClick,
}: {
  entry: Entry;
  typeLabel: string;
  bookingLabel: string;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-start gap-3 rounded-lg border border-line bg-surface px-3 py-2 text-left transition-colors hover:border-line-strong"
      >
        <span
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TYPE_DOT[entry.type]}`}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate font-medium text-ink">{entry.title}</span>
            {entry.time && (
              <span className="shrink-0 font-mono text-xs text-ink-muted">{entry.time}</span>
            )}
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-faint">
            <span>{typeLabel}</span>
            <span className={`font-medium ${BOOKING_TEXT[entry.bookingStatus]}`}>
              {bookingLabel}
            </span>
            {entry.notes && (
              <span className="truncate" title={entry.notes}>
                · {entry.notes}
              </span>
            )}
          </span>
        </span>
      </button>
    </li>
  );
}
