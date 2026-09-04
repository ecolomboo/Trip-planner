"use client";

import { useFormatter, useTranslations } from "next-intl";
import { parseTripDate } from "@/lib/format";
import type { Entry, Stop } from "@/lib/types";

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
    <div className="space-y-4">
      <div>
        <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
          {format.dateTime(parseTripDate(entry.date), {
            weekday: "short",
            day: "numeric",
            month: "short",
            timeZone: "UTC",
          })}
        </p>
        <h2 className="mt-1 text-xl font-semibold leading-tight text-ink">{entry.title}</h2>
        <p className="mt-1 text-sm text-ink-muted">
          {tTypes(entry.type)} · {tBooking(entry.bookingStatus)}
        </p>
      </div>

      <dl className="space-y-2 text-sm">
        {entry.time && <Row label={t("time.label")} value={entry.time} />}
        {entry.costPerPerson != null && (
          <Row label={t("cost.label")} value={`€ ${entry.costPerPerson}`} />
        )}
        {stop && <Row label={t("stop.label")} value={stop.name} />}
        {entry.notes && <Row label={t("notes.label")} value={entry.notes} />}
        {entry.url && <Row label={t("url.label")} value={entry.url} href={entry.url} />}
      </dl>

      <div className="flex gap-2 border-t border-line pt-4">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-md bg-turquoise px-4 py-2 text-sm font-medium text-background"
        >
          {tCommon("edit")}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-md border border-pomegranate/50 px-4 py-2 text-sm text-pomegranate"
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
      <dt className="text-xs text-ink-faint">{label}</dt>
      <dd className="mt-0.5 text-ink">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-turquoise underline"
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
