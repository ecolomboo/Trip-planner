"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { signInWithEmail } from "@/lib/actions/auth";

export function SignInForm({ initialError }: { initialError?: string | null }) {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale();

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result = await signInWithEmail(new FormData(event.currentTarget));
    // Success redirects server-side; if we're still here it was an error.
    setPending(false);
    if (result) {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-line bg-surface p-4">
      <input type="hidden" name="locale" value={locale} />
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
          {t("email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-md border border-line bg-background px-3 py-2 text-ink"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-turquoise px-4 py-2 font-medium text-background disabled:opacity-60"
      >
        {pending ? tCommon("loading") : t("signIn")}
      </button>
      {error && (
        <p role="alert" className="text-sm text-pomegranate">
          {error === "notAllowed"
            ? t("notAllowed")
            : error === "notConfigured"
              ? t("notConfigured")
              : tErrors("somethingWentWrong")}
        </p>
      )}
    </form>
  );
}
