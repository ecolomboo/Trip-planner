/**
 * Root layout is a passthrough: the `[locale]` segment owns the real
 * `<html>`/`<body>` (so `lang` is locale-aware). This file only exists so
 * Next.js always has a root layout for every route.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
