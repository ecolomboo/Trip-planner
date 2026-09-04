import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/auth";
import { summarizeBudget } from "@/lib/budget";
import { parseTripDate } from "@/lib/format";
import { mapEntry } from "@/lib/map";
import { convertEur, formatMoney, type ExchangeRates } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";
import { ENTRY_TYPES } from "@/lib/types";

/** One muted pastel per category, mirroring the timeline dots. */
const TYPE_DOT: Record<string, string> = {
  flight: "bg-cat-transit",
  train: "bg-cat-transit",
  road_transfer: "bg-cat-road",
  accommodation: "bg-cat-stay",
  tour: "bg-cat-tour",
  sight: "bg-cat-sight",
  meal: "bg-cat-meal",
  note: "bg-cat-note",
};

export default async function BudgetPage({ params }: { params: Promise<{ locale: string }> }) {
  await requireUser();
  const { locale } = await params;
  const supabase = await createClient();
  const t = await getTranslations("budget");
  const tTypes = await getTranslations("entry.types");

  const [{ data: trip }, { data: entriesRows }] = await Promise.all([
    supabase.from("trips").select("exchange_rates").limit(1).maybeSingle(),
    supabase.from("entries").select("*").order("date, position"),
  ]);

  const entries = (entriesRows ?? []).map(mapEntry);
  const summary = summarizeBudget(entries, 2);
  const rates = (trip?.exchange_rates ?? {}) as ExchangeRates;

  const somFor = (eur: number) => formatMoney(convertEur(eur, "UZS", rates), "UZS", locale);
  const dateLabel = (date: string) =>
    new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" }).format(
      parseTripDate(date),
    );

  return (
    <div className="max-w-3xl">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink">{t("title")}</h1>
      </header>

      {summary.perPerson === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-6 text-center text-ink-faint">
          {t("noCosts")}
        </p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <TotalCard
              label={t("perPerson")}
              amount={formatMoney(summary.perPerson, "EUR", locale)}
              equivalent={somFor(summary.perPerson)}
            />
            <TotalCard
              label={t("forBoth")}
              amount={formatMoney(summary.forBoth, "EUR", locale)}
              equivalent={somFor(summary.forBoth)}
              variant="hero"
            />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <TotalCard
              label={t("booked")}
              amount={formatMoney(summary.booked, "EUR", locale)}
              equivalent={somFor(summary.booked)}
            />
            <TotalCard
              label={t("toPay")}
              amount={formatMoney(summary.toPay, "EUR", locale)}
              equivalent={somFor(summary.toPay)}
              variant={summary.toPay > 0 ? "attention" : "plain"}
            />
          </div>

          <section className="mt-6">
            <h2 className="mb-2 text-sm font-medium text-ink-muted">{t("byCategory")}</h2>
            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
              {ENTRY_TYPES.map((type) => {
                const amount = summary.byCategory[type];
                if (amount === 0) return null;
                return (
                  <li key={type} className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className="flex items-center gap-2.5 text-ink">
                      <span
                        className={`h-2 w-2 rounded-full ${TYPE_DOT[type]}`}
                        aria-hidden="true"
                      />
                      {tTypes(type)}
                    </span>
                    <span className="font-mono text-sm tabular-nums text-ink-muted">
                      {formatMoney(amount, "EUR", locale)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          {summary.needsBooking.length > 0 && (
            <section className="mt-6">
              <h2 className="mb-2 text-sm font-medium text-accent">{t("needsBooking")}</h2>
              <ul className="divide-y divide-accent/15 overflow-hidden rounded-2xl border border-accent/30 bg-surface shadow-card">
                {summary.needsBooking.map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className="min-w-0 truncate text-ink">
                      <span className="mr-2 font-mono text-xs text-ink-faint">
                        {dateLabel(entry.date)}
                      </span>
                      {entry.title}
                    </span>
                    <span className="shrink-0 font-mono text-sm tabular-nums text-accent">
                      {formatMoney(entry.costPerPerson ?? 0, "EUR", locale)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function TotalCard({
  label,
  amount,
  equivalent,
  variant = "plain",
}: {
  label: string;
  amount: string;
  equivalent: string;
  variant?: "plain" | "hero" | "attention";
}) {
  const styles: Record<NonNullable<typeof variant>, string> = {
    plain: "border-line bg-surface",
    hero: "border-accent/40 bg-gradient-to-br from-accent/15 to-transparent",
    attention: "border-accent/30 bg-surface",
  };

  return (
    <div className={`rounded-2xl border p-4 shadow-card sm:p-5 ${styles[variant]}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-semibold tabular-nums text-ink sm:text-3xl">
        {amount}
      </p>
      <p className="mt-1 font-mono text-xs text-ink-faint">≈ {equivalent}</p>
    </div>
  );
}
