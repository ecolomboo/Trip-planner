"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { isLocale } from "@/i18n/routing";
import { isAllowedEmail, isAllowlistConfigured } from "@/lib/allowlist";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type SignInResult = {
  error: "invalid" | "notAllowed" | "notConfigured" | "failed";
  /** Specific reason for a `failed` result — surfaced for debugging. */
  detail?: string;
};

/**
 * Email-only sign-in: if the address is on the invite list, the user is
 * provisioned (or their password refreshed) and signed straight in — no magic
 * link email is sent, no verification needed. Trusts the email alone, which is
 * acceptable for a private two-person trip. On success the session cookie is
 * set and the user is redirected to the timeline.
 */
export async function signInWithEmail(formData: FormData): Promise<SignInResult> {
  // Normalise aggressively: some mobile keyboards insert non-breaking spaces
  // or capitalise the first letter, which would otherwise fail the regex.
  const email = String(formData.get("email") ?? "")
    .replace(/[\u00a0\u2007\u202f]/g, " ")
    .trim()
    .toLowerCase();
  const localeParam = String(formData.get("locale") ?? "");
  const locale = isLocale(localeParam) ? localeParam : "en";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "invalid" };
  }
  if (!isAllowlistConfigured()) {
    return { error: "notConfigured" };
  }
  if (!isAllowedEmail(email)) {
    return { error: "notAllowed" };
  }

  const result = await provisionAndSignIn(email);
  if (result) {
    return result;
  }

  // The session cookie was set on this response by signInWithPassword.
  redirect(`/${locale}/timeline`);
}

/** Provisions the auth user with a throwaway password, then signs them in. */
async function provisionAndSignIn(email: string): Promise<SignInResult | null> {
  try {
    // Re-randomised on every sign-in; never shown to anyone and set immediately
    // before signing in, so it cannot drift stale.
    const password = randomBytes(32).toString("hex");

    const admin = createAdminClient();
    const { data: list, error: listError } = await admin.auth.admin.listUsers();
    if (listError) {
      return { error: "failed", detail: `listUsers: ${listError.message}` };
    }
    const existing = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (existing) {
      const { error } = await admin.auth.admin.updateUserById(existing.id, { password });
      if (error) {
        return { error: "failed", detail: `updateUser: ${error.message}` };
      }
    } else {
      const { error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (error) {
        return { error: "failed", detail: `createUser: ${error.message}` };
      }
    }

    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      return { error: "failed", detail: `signIn: ${signInError.message}` };
    }

    // Make sure the user is a member of the single trip (idempotent).
    const { error: rpcError } = await supabase.rpc("join_default_trip");
    if (rpcError) {
      return { error: "failed", detail: `join: ${rpcError.message}` };
    }

    return null;
  } catch (error) {
    console.error("signInWithEmail failed", error);
    return {
      error: "failed",
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
