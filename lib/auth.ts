import type { User } from "@supabase/supabase-js";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

/** The signed-in user, or null when there is no valid session. */
export async function getUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return data.user ?? null;
  } catch {
    // Supabase isn't configured (or is unreachable): treat as signed out so
    // the app redirects to sign-in instead of crashing with a 500.
    return null;
  }
}

/** Require a session; redirect to the sign-in page otherwise. */
export async function requireUser(): Promise<User> {
  const user = await getUser();
  if (!user) {
    const locale = await getLocale();
    redirect(`/${locale}/sign-in`);
  }
  return user;
}
