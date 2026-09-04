# Uzbekistan

A two-person trip planner for an 11-day journey through Uzbekistan and
Tajikistan (7–17 October 2026). One trip, two members, realtime sync, bilingual
(English/Italian), dark-themed, and built to read on a phone in daylight or a
laptop at a desk.

## Stack

- **Next.js 16** (App Router) + **TypeScript** — typed end to end, no `any`
- **Supabase** (free tier) — Postgres, magic-link auth, realtime, storage
- **Tailwind CSS v4** — a majolica-inspired dark palette
- **next-intl** — `en`/`it`, both locales complete from the first commit
- **Leaflet** — the map as a supporting view (added in a later slice)
- Deployed on **Vercel** (Hobby)

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase credentials (optional until wired)
npm run dev
```

Open http://localhost:3000 — it lands on the timeline, never a splash screen.

## Scripts

| Command                | What it does                              |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Dev server                                |
| `npm run build`        | Production build                          |
| `npm run lint`         | ESLint                                    |
| `npm run typecheck`    | Generate route types, then `tsc --noEmit` |
| `npm run test`         | Run the Vitest suite                      |
| `npm run format`       | Format with Prettier                      |
| `npm run format:check` | Verify formatting (used in CI)            |

## Environment

See `.env.example`. Every variable is optional in development until Supabase is
wired up — the app renders the seeded itinerary without them.

## Free-tier keep-alive

Supabase pauses free projects after 7 days of database inactivity.
`.github/workflows/supabase-keepalive.yml` runs `SELECT 1` every 3 days via
`scripts/keep-alive.mjs`, using the `SUPABASE_DB_URL` repository secret, so the
project never pauses mid-trip.

## Deploy (hosted Supabase + Vercel)

**1. Supabase → SQL Editor** — paste the whole `supabase/setup.sql` and Run.

**2. Supabase → Authentication → URL Configuration** — set:

- Site URL: `https://YOUR-APP.vercel.app`
- Redirect URLs: `https://YOUR-APP.vercel.app/**`, `http://localhost:3000/**`, `http://localhost:3001/**`

**3. Vercel → Environment Variables** (from Supabase → Project Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon/publishable key>
SUPABASE_SERVICE_ROLE_KEY=<service_role/secret key>
SITE_URL=https://YOUR-APP.vercel.app
ALLOWED_EMAILS=you@example.com,partner@example.com
```

**4. Deploy.** Magic-link emails use Supabase's built-in sender by default — check
Spam the first time and mark "Not spam". For reliable inbox delivery (or a custom
"sender name"), enable a custom SMTP in Supabase → Authentication → Emails (e.g.
Resend's free tier).

Also add `SUPABASE_DB_URL` as the GitHub **repository secret** for the keep-alive action.
