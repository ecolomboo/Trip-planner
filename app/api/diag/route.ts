// TEMPORARY diagnostic route — tests outbound fetch + Supabase env vars from
// Vercel's runtime. Removed after debugging.
import { NextResponse } from "next/server";

async function tryFetch(url: string, init?: RequestInit): Promise<string> {
  try {
    const res = await fetch(url, init);
    return `${res.status}: ${(await res.text()).slice(0, 200)}`;
  } catch (error) {
    const cause = error instanceof Error ? error.cause : undefined;
    const causeMsg = cause instanceof Error ? `${cause.name}: ${cause.message}` : String(cause ?? "");
    return `FETCH_ERR: ${error instanceof Error ? error.message : error}${causeMsg ? ` | cause: ${causeMsg}` : ""}`;
  }
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const out: Record<string, string> = {
    env: JSON.stringify({ url: !!url, anon: !!anon, service: !!service }),
  };

  out.control_supabase_com = await tryFetch("https://supabase.com");
  out.control_rest_world = await tryFetch("https://www.google.com");

  if (url) {
    out.supabase_url = url;
    out.anon_rest = await tryFetch(`${url}/rest/v1/trips?select=name&limit=2`, {
      headers: anon ? { apikey: anon, Authorization: `Bearer ${anon}` } : undefined,
    });
    if (anon && service) {
      out.service_admin = await tryFetch(`${url}/auth/v1/admin/users?per_page=1`, {
        headers: { apikey: anon, Authorization: `Bearer ${service}` },
      });
    }
  }

  return NextResponse.json(out);
}
