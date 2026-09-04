/**
 * Invite-only access: a comma-separated allowlist in `ALLOWED_EMAILS`.
 * No public signup — anyone not on the list is rejected before a magic link
 * is even sent.
 */
export function getAllowlist(): string[] {
  return (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

/** True when at least one email is on the invite list. */
export function isAllowlistConfigured(): boolean {
  return getAllowlist().length > 0;
}

export function isAllowedEmail(email: string): boolean {
  return getAllowlist().includes(email.trim().toLowerCase());
}
