import { redirect } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

/** The app opens on the timeline, never a splash screen. */
export default async function LocaleIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect({ href: "/timeline", locale: locale as AppLocale });
}
