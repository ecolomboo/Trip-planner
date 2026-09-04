"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { BrandMark } from "./brand-mark";
import { LanguageSwitcher } from "./language-switcher";
import { OfflineBanner } from "./offline-banner";
import { ServiceWorkerRegister } from "./service-worker";

type IconName = "itinerary" | "map" | "budget" | "checklist" | "settings";

const NAV_ITEMS = [
  { href: "/timeline", key: "timeline", icon: "itinerary" },
  { href: "/map", key: "map", icon: "map" },
  { href: "/budget", key: "budget", icon: "budget" },
  { href: "/checklist", key: "checklist", icon: "checklist" },
  { href: "/settings", key: "settings", icon: "settings" },
] as const;

/** Crisp 24×24 stroke icons drawn inline — no icon dependency to ship. */
function Icon({ name, className }: { name: IconName; className?: string }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "itinerary":
      return (
        <svg {...common}>
          <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
          <path d="M3.5 9.5h17" />
          <path d="M8 2.5v3M16 2.5v3" />
        </svg>
      );
    case "map":
      return (
        <svg {...common}>
          <path d="M12 21c-4-4.5-7-7.7-7-11a7 7 0 0 1 14 0c0 3.3-3 6.5-7 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    case "budget":
      return (
        <svg {...common}>
          <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
          <path d="M2.5 9.5h19" />
          <path d="M6 14.5h4" />
        </svg>
      );
    case "checklist":
      return (
        <svg {...common}>
          <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
          <path d="M8.5 12.2l2.4 2.4 4.6-4.8" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <path d="M4 8h13M4 16h13" />
          <circle cx="15" cy="8" r="2.2" />
          <circle cx="20" cy="16" r="2.2" />
        </svg>
      );
  }
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("nav");
  const tApp = useTranslations("app");
  const pathname = usePathname();
  // The sign-in screen is a focused auth moment: brand + language only.
  const isAuth = pathname === "/sign-in";

  return (
    <div className="flex min-h-screen flex-col">
      <ServiceWorkerRegister />
      <OfflineBanner />

      {/* Top bar — brand + (desktop) nav + language. Frosted so it stays legible while scrolling. */}
      <header className="sticky top-0 z-30 border-b border-line bg-background/75 backdrop-blur-xl">
        <div
          className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6"
          style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
        >
          <Link
            href="/timeline"
            className="flex min-w-0 items-center gap-2.5 text-ink transition-opacity hover:opacity-90"
          >
            <BrandMark />
            <span className="truncate font-display text-lg font-semibold tracking-tight sm:text-xl">
              {tApp("name")}
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {!isAuth && (
              <nav aria-label={t("label")} className="hidden md:block">
                <ul className="flex items-center gap-1 whitespace-nowrap">
                  {NAV_ITEMS.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={`relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                            active
                              ? "bg-surface-2 text-accent shadow-card"
                              : "text-ink-muted hover:bg-surface hover:text-ink"
                          }`}
                        >
                          <Icon name={item.icon} className="h-4 w-4" />
                          {t(item.key)}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Bottom clearance so the fixed tab bar never covers content. */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6 md:pb-12">
        {children}
      </main>

      {/* Mobile tab bar — thumb-reach navigation, safe-area aware. */}
      {!isAuth && (
      <nav
        aria-label={t("label")}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-background/85 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className="flex min-h-14 flex-col items-center justify-center gap-1 px-1 py-2"
                >
                  <span
                    className={`grid h-7 w-12 place-items-center rounded-full transition-colors ${
                      active ? "bg-accent/15 text-accent" : "text-ink-faint"
                    }`}
                  >
                    <Icon name={item.icon} className="h-5 w-5" />
                  </span>
                  <span
                    className={`text-[10px] font-medium leading-none tracking-wide ${
                      active ? "text-accent" : "text-ink-faint"
                    }`}
                  >
                    {t(item.key)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      )}
    </div>
  );
}
