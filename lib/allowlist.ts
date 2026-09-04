/**
 * Invite-only access: a comma-separated allowlist in `ALLOWED_EMAILS`.
 * No public signup — anyone not on the list is rejected before a magic link
 * is even sent.
 */
export function isAllowedEmail(email: string): boolean {
  const allowed = (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}
