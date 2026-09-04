"use client";

import { useFormatter, useTranslations } from "next-intl";
import { parseTripDate } from "@/lib/format";
import type { Entry, Stop } from "@/lib/types";

const BOOKING_CHIP: Record<Entry["bookingStatus"], string> = {
  booked: "bg-surface-2 text-ink-faint",
  to_book: "bg-accent/15 text-accent",
};

/** Read-only view of a selected entry, with Edit/Delete actions. */
export function EntryDetail({
  entry,
  stops,
  onEdit,
  onDelete,
}: {
  entry: Entry;
  stops: Stop[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations("entry");
  const tTypes = useTranslations("entry.types");
  const tBooking = useTranslations("entry.booking");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const stop = stops.find((s) => s.id === entry.stopId);

  return (
    <div className="space-y-5">
      <div className="pr-8">
        <p className="text-sm text-ink-faint">
          {format.dateTime(parseTripDate(entry.date), {
            weekday: "short",
            day: "numeric",
            month: "short",
            timeZone: "UTC",
          })}
        </p>
        <h2 className="mt-1 text-xl font-semibold leading-tight text-ink">{entry.title}</h2>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="rounded-full bg-surface-2 px-2.5 py-1 text-ink-muted">
            {tTypes(entry.type)}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 font-medium ${BOOKING_CHIP[entry.bookingStatus]}`}
          >
            {tBooking(entry.bookingStatus)}
          </span>
        </div>
      </div>

      <dl className="space-y-3 text-sm">
        {entry.time && <Row label={t("time.label")} value={entry.time} />}
        {entry.costPerPerson != null && (
          <Row label={t("cost.label")} value={`€ ${entry.costPerPerson}`} />
        )}
        {stop && <Row label={t("stop.label")} value={stop.name} />}
        {entry.notes && <Row label={t("notes.label")} value={entry.notes} />}
        {entry.url && <Row label={t("url.label")} value={entry.url} href={entry.url} />}
      </dl>

      <div className="flex gap-2.5 border-t border-line pt-4">
        <button
          type="button"
          onClick={onEdit}
          className="btn-primary min-h-11 flex-1 rounded-xl px-4 text-sm"
        >
          {tCommon("edit")}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="min-h-11 flex-1 rounded-xl border border-danger/40 px-4 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
        >
          {tCommon("delete")}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-ink-faint">{label}</dt>
      <dd className="mt-0.5 break-words text-ink">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline decoration-accent/40 underline-offset-2 transition-colors hover:decoration-accent"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
