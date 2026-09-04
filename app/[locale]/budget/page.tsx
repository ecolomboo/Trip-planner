import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/auth";
import { summarizeBudget } from "@/lib/budget";
import { parseTripDate } from "@/lib/format";
import { mapEntry } from "@/lib/map";
import { convertEur, formatMoney, type ExchangeRates } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";
import { ENTRY_TYPES } from "@/lib/types";

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
        <p className="text-ink-faint">{t("noCosts")}</p>
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
              emphasized
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <TotalCard
              label={t("booked")}
              amount={formatMoney(summary.booked, "EUR", locale)}
              equivalent={somFor(summary.booked)}
            />
            <TotalCard
              label={t("toPay")}
              amount={formatMoney(summary.toPay, "EUR", locale)}
              equivalent={somFor(summary.toPay)}
              emphasized={summary.toPay > 0}
            />
          </div>

          <section className="mt-6">
            <h2 className="mb-2 text-sm font-medium text-ink-muted">{t("byCategory")}</h2>
            <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
              {ENTRY_TYPES.map((type) => {
                const amount = summary.byCategory[type];
                if (amount === 0) return null;
                return (
                  <li key={type} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-ink">{tTypes(type)}</span>
                    <span className="font-mono text-sm text-ink-muted">
                      {formatMoney(amount, "EUR", locale)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          {summary.needsBooking.length > 0 && (
            <section className="mt-6">
              <h2 className="mb-2 text-sm font-medium text-ochre">{t("needsBooking")}</h2>
              <ul className="divide-y divide-line rounded-lg border border-ochre/30 bg-surface">
                {summary.needsBooking.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-3 px-4 py-2.5"
                  >
                    <span className="min-w-0 truncate text-ink">
                      <span className="font-mono text-xs text-ink-faint">
                        {dateLabel(entry.date)}
                      </span>{" "}
                      {entry.title}
                    </span>
                    <span className="shrink-0 font-mono text-sm text-ochre">
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
  emphasized = false,
}: {
  label: string;
  amount: string;
  equivalent: string;
  emphasized?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        emphasized ? "border-turquoise/40" : "border-line"
      } bg-surface`}
    >
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-ink">{amount}</p>
      <p className="mt-0.5 font-mono text-xs text-ink-faint">≈ {equivalent}</p>
    </div>
  );
}
