import { getTranslations } from "next-intl/server";
import { BrandMark } from "@/components/brand-mark";
import { SignInForm } from "@/components/sign-in-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const t = await getTranslations("auth");
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center pt-10 text-center sm:pt-20">
      <BrandMark className="h-14 w-14 rounded-2xl" iconClassName="h-7 w-7" />
      <h1 className="mt-6 font-display text-3xl font-semibold text-ink">{t("signIn")}</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t("subtitle")}</p>
      <div className="mt-7 w-full text-left">
        <SignInForm initialError={error ?? null} />
      </div>
    </div>
  );
}
