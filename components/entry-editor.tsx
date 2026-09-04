"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { parseTripDate } from "@/lib/format";
import {
  ENTRY_TYPES,
  type BookingStatus,
  type Entry,
  type EntryDraft,
  type EntryType,
  type Stop,
  type TripDay,
} from "@/lib/types";

const FIELD =
  "w-full rounded-xl border border-line bg-background px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint transition-colors hover:border-line-strong";

const LABEL = "mb-1.5 block text-sm font-medium text-ink";

interface Props {
  mode: "add" | "edit";
  entry: Entry | null;
  defaultDate: string;
  days: TripDay[];
  stops: Stop[];
  onClose: () => void;
  onSave: (draft: EntryDraft) => void;
  onDelete?: (id: string) => void;
}

export function EntryEditor({
  mode,
  entry,
  defaultDate,
  days,
  stops,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const t = useTranslations("entry");
  const tCommon = useTranslations("common");
  const tTypes = useTranslations("entry.types");
  const tBooking = useTranslations("entry.booking");
  const tStop = useTranslations("entry.stop");
  const format = useFormatter();

  const [title, setTitle] = useState(entry?.title ?? "");
  const [type, setType] = useState<EntryType>(entry?.type ?? "note");
  const [date, setDate] = useState(entry?.date ?? defaultDate);
  const [time, setTime] = useState(entry?.time ?? "");
  const [booking, setBooking] = useState<BookingStatus>(entry?.bookingStatus ?? "to_book");
  const [cost, setCost] = useState(entry?.costPerPerson?.toString() ?? "");
  const [notes, setNotes] = useState(entry?.notes ?? "");
  const [url, setUrl] = useState(entry?.url ?? "");
  const [stopId, setStopId] = useState(entry?.stopId ?? "");

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      type,
      date,
      time: time || undefined,
      bookingStatus: booking,
      costPerPerson: cost ? Number(cost) : undefined,
      notes: notes.trim() || undefined,
      url: url.trim() || undefined,
      stopId: stopId || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={mode === "add" ? t("add") : t("edit")}
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-line bg-surface p-5 shadow-float animate-sheet-up sm:rounded-2xl sm:p-6"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line-strong sm:hidden" aria-hidden="true" />

        <form onSubmit={submit} className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-ink">
              {mode === "add" ? t("add") : t("edit")}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={tCommon("close")}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <span className="text-lg leading-none" aria-hidden="true">
                ×
              </span>
            </button>
          </div>

          <div>
            <label htmlFor="entry-title" className={LABEL}>
              {t("title.label")}
            </label>
            <input
              id="entry-title"
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t("title.placeholder")}
              className={FIELD}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="entry-type" className={LABEL}>
                {t("type.label")}
              </label>
              <select
                id="entry-type"
                value={type}
                onChange={(event) => setType(event.target.value as EntryType)}
                className={FIELD}
              >
                {ENTRY_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {tTypes(value)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="entry-date" className={LABEL}>
                {t("date.label")}
              </label>
              <select
                id="entry-date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className={FIELD}
              >
                {days.map((day) => (
                  <option key={day.date} value={day.date}>
                    {format.dateTime(parseTripDate(day.date), {
                      day: "numeric",
                      month: "short",
                      timeZone: "UTC",
                    })}{" "}
                    · {day.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="entry-time" className={LABEL}>
                {t("time.label")}
              </label>
              <input
                id="entry-time"
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className={FIELD}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="entry-booking" className={LABEL}>
                {t("booking.label")}
              </label>
              <select
                id="entry-booking"
                value={booking}
                onChange={(event) => setBooking(event.target.value as BookingStatus)}
                className={FIELD}
              >
                <option value="to_book">{tBooking("to_book")}</option>
                <option value="booked">{tBooking("booked")}</option>
              </select>
            </div>
            <div>
              <label htmlFor="entry-cost" className={LABEL}>
                {t("cost.label")}
              </label>
              <input
                id="entry-cost"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={cost}
                onChange={(event) => setCost(event.target.value)}
                className={FIELD}
              />
            </div>
          </div>

          <div>
            <label htmlFor="entry-stop" className={LABEL}>
              {t("stop.label")}
            </label>
            <select
              id="entry-stop"
              value={stopId}
              onChange={(event) => setStopId(event.target.value)}
              className={FIELD}
            >
              <option value="">{tStop("none")}</option>
              {stops.map((stop) => (
                <option key={stop.id} value={stop.id}>
                  {stop.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="entry-notes" className={LABEL}>
              {t("notes.label")}
            </label>
            <textarea
              id="entry-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={t("notes.placeholder")}
              rows={3}
              className={FIELD}
            />
          </div>

          <div>
            <label htmlFor="entry-url" className={LABEL}>
              {t("url.label")}
            </label>
            <input
              id="entry-url"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className={FIELD}
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            {onDelete && entry ? (
              <button
                type="button"
                onClick={() => onDelete(entry.id)}
                className="min-h-11 rounded-xl border border-danger/40 px-4 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
              >
                {tCommon("delete")}
              </button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="min-h-11 rounded-xl border border-line px-4 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
              >
                {tCommon("cancel")}
              </button>
              <button type="submit" className="btn-primary min-h-11 rounded-xl px-5 text-sm">
                {tCommon("save")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
