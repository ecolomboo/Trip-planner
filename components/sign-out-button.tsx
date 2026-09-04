"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { signOut } from "@/lib/actions/auth";

export function SignOutButton() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await signOut();
          router.refresh();
        })
      }
      className="rounded-md border border-line px-3 py-1.5 text-sm text-ink-muted hover:text-ink"
    >
      {t("signOut")}
    </button>
  );
}
