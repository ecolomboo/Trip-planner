import { getTranslations } from "next-intl/server";
import { SignInForm } from "@/components/sign-in-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const t = await getTranslations("auth");
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-sm">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink">{t("signIn")}</h1>
      </header>
      <SignInForm initialError={error ?? null} />
    </div>
  );
}
