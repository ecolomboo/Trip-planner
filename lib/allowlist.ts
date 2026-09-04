/**
 * Invite-only access. One person is built in so the app works even with no
 * env vars; `ALLOWED_EMAILS` overrides the whole list (e.g. to add the second
 * traveller). Sign-in trusts the email alone — no verification email is sent.
 */
const DEFAULT_ALLOWED = ["edocolombo@hotmail.it"];

export function getAllowlist(): string[] {
  const fromEnv = (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  return fromEnv.length > 0 ? fromEnv : DEFAULT_ALLOWED;
}

/** True when at least one email can sign in. */
export function isAllowlistConfigured(): boolean {
  return getAllowlist().length > 0;
}

export function isAllowedEmail(email: string): boolean {
  return getAllowlist().includes(email.trim().toLowerCase());
}
