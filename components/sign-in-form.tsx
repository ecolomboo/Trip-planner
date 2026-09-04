"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { requestMagicLink } from "@/lib/actions/auth";

export function SignInForm({ initialError }: { initialError?: string | null }) {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale();

  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result = await requestMagicLink(new FormData(event.currentTarget));
    setPending(false);
    if ("ok" in result) {
      setSent(true);
    } else {
      setError(result.error === "notAllowed" ? "notAllowed" : "failed");
    }
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-line bg-surface p-4">
        <p className="text-ink-muted">{t("checkEmail")}</p>
      </div>
    );
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
        {pending ? tCommon("loading") : t("sendLink")}
      </button>
      {error && (
        <p role="alert" className="text-sm text-pomegranate">
          {error === "notAllowed" ? t("notAllowed") : tErrors("somethingWentWrong")}
        </p>
      )}
    </form>
  );
}
