import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SignOutButton } from "@/components/sign-out-button";
import { requireUser } from "@/lib/auth";

export default async function SettingsPage() {
  const user = await requireUser();
  const t = await getTranslations("settings");
  const tAuth = await getTranslations("auth");

  return (
    <div className="max-w-2xl">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink">{t("title")}</h1>
      </header>

      <section className="rounded-2xl border border-line bg-surface p-4 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-medium text-ink">{t("language.label")}</h2>
            <p className="text-sm text-ink-muted">{t("language.description")}</p>
          </div>
          <LanguageSwitcher />
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-line bg-surface p-4 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-medium text-ink">{t("currency.label")}</h2>
            <p className="text-sm text-ink-muted">{t("exchangeRates.description")}</p>
          </div>
          <span className="font-mono text-sm text-ink-muted">{t("currency.value")}</span>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-line bg-surface p-4 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-medium text-ink">{t("theme.label")}</h2>
          <span className="text-sm text-ink-muted">{t("theme.dark")}</span>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-line bg-surface p-4 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-medium text-ink">
            {tAuth("signedInAs", { email: user.email ?? "" })}
          </h2>
          <SignOutButton />
        </div>
      </section>
    </div>
  );
}
