import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Both locales ship complete from the first commit.
  locales: ["en", "it"],
  defaultLocale: "en",
});

export type AppLocale = (typeof routing.locales)[number];

/** Narrows an unknown `[locale]` segment value to a supported locale. */
export function isLocale(value: string | undefined): value is AppLocale {
  return typeof value === "string" && (routing.locales as readonly string[]).includes(value);
}
