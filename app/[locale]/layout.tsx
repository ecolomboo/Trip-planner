import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Providers } from "@/components/providers";
import { isLocale, routing } from "@/i18n/routing";
import "../globals.css";

/*
 * Type, chosen deliberately:
 * - Fraunces (display): the journal serif for day numerals and headings.
 * - Geist / Geist Mono (body): the quiet sans/mono around the timeline.
 */
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Silk Road",
  description: "Two-person trip planner — Uzbekistan & Tajikistan, October 2026",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} antialiased`}
    >
      <body className="min-h-screen">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <AppShell>{children}</AppShell>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
