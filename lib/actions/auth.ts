"use server";

import { headers } from "next/headers";
import { isLocale } from "@/i18n/routing";
import { isAllowedEmail } from "@/lib/allowlist";
import { createClient } from "@/lib/supabase/server";

export type MagicLinkResult = { ok: true } | { error: "invalid" | "notAllowed" | "failed" };

export async function requestMagicLink(formData: FormData): Promise<MagicLinkResult> {
  const email = String(formData.get("email") ?? "").trim();
  const localeParam = String(formData.get("locale") ?? "");
  const locale = isLocale(localeParam) ? localeParam : "en";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "invalid" };
  }
  if (!isAllowedEmail(email)) {
    return { error: "notAllowed" };
  }

  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin") ?? "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback?locale=${locale}`,
    },
  });

  if (error) {
    console.error("signInWithOtp failed", error);
    return { error: "failed" };
  }

  return { ok: true };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
