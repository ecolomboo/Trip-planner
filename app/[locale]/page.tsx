import { redirect } from "@/i18n/navigation";
import { getUser } from "@/lib/auth";
import type { AppLocale } from "@/i18n/routing";

/** Land on the timeline when signed in, otherwise on sign-in — never a 500. */
export default async function LocaleIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getUser();
  redirect({ href: user ? "/timeline" : "/sign-in", locale: locale as AppLocale });
}
