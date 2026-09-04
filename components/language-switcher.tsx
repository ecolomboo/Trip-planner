"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

/**
 * Segmented EN | IT toggle. Bigger tap target and clearer state than a
 * `<select>`, which matters on a phone. Full names live in the labels for
 * screen readers; the visible text stays compact.
 */
const LABELS: Record<AppLocale, { short: string; full: string }> = {
  en: { short: "EN", full: "English" },
  it: { short: "IT", full: "Italiano" },
};

export function LanguageSwitcher() {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("settings.language");
  const [isPending, startTransition] = useTransition();

  function select(nextLocale: AppLocale) {
    if (nextLocale === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <div
      role="group"
      aria-label={t("label")}
      className="flex shrink-0 items-center rounded-full border border-line bg-surface p-0.5"
    >
      {routing.locales.map((value) => {
        const active = value === locale;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            aria-label={LABELS[value].full}
            disabled={isPending}
            onClick={() => select(value)}
            className={`min-w-9 rounded-full px-2.5 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
              active
                ? "bg-surface-raised text-turquoise shadow-card"
                : "text-ink-faint hover:text-ink"
            }`}
          >
            {LABELS[value].short}
          </button>
        );
      })}
    </div>
  );
}
