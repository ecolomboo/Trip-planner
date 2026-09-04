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
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6"
    >
      <input type="hidden" name="locale" value={locale} />
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
          {t("email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          placeholder="you@example.com"
          className="min-h-11 w-full rounded-xl border border-line bg-background px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint transition-colors hover:border-line-strong"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="btn-primary min-h-11 w-full rounded-xl px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? tCommon("loading") : t("sendLink")}
      </button>
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
        >
          {error === "notAllowed"
            ? t("notAllowed")
            : error === "notConfigured"
              ? t("notConfigured")
              : error === "invalid"
                ? t("invalid")
                : tErrors("somethingWentWrong")}
        </p>
      )}
    </form>
  );
}
