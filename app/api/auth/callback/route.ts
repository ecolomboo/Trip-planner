import { NextResponse } from "next/server";
import { isLocale } from "@/i18n/routing";
import { isAllowedEmail } from "@/lib/allowlist";
import { createClient } from "@/lib/supabase/server";

/**
 * Magic-link landing page: exchange the one-time code for a session, verify the
 * email is allowlisted, add the user to the single trip, then send them to the
 * timeline.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const localeParam = searchParams.get("locale");
  const locale = isLocale(localeParam) ? localeParam : "en";

  if (!code) {
    return NextResponse.redirect(new URL(`/${locale}/sign-in?error=failed`, origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL(`/${locale}/sign-in?error=failed`, origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email || !isAllowedEmail(user.email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL(`/${locale}/sign-in?error=notAllowed`, origin));
  }

  // Add the user to the single trip (idempotent; RLS is bypassed server-side).
  const { error: joinError } = await supabase.rpc("join_default_trip");
  if (joinError) {
    console.error("join_default_trip failed", joinError);
  }

  return NextResponse.redirect(new URL(`/${locale}/timeline`, origin));
}
