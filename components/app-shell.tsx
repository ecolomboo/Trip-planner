"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "./language-switcher";

const NAV_ITEMS = [
  { href: "/timeline", key: "timeline" },
  { href: "/map", key: "map" },
  { href: "/settings", key: "settings" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            href="/timeline"
            className="font-display text-xl font-semibold tracking-tight text-ink"
          >
            Silk Road
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <nav aria-label={t("label")}>
              <ul className="flex items-center gap-1">
                {NAV_ITEMS.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                          active ? "bg-surface-raised text-ink" : "text-ink-muted hover:text-ink"
                        }`}
                      >
                        {t(item.key)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
