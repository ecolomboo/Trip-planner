// TEMPORARY diagnostic route — tests the Supabase env vars from Vercel's
// runtime (which can reach the hosted project). Removed after debugging.
import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anon || !service) {
    return NextResponse.json({
      env: { url: !!url, anon: !!anon, service: !!service },
    });
  }

  const out: Record<string, string> = {
    url: url,
    anon_key: anon.slice(0, 24) + "…",
    service_key: service.slice(0, 24) + "…",
  };

  try {
    const r1 = await fetch(`${url}/rest/v1/trips?select=name&limit=2`, {
      headers: { apikey: anon, Authorization: `Bearer ${anon}` },
    });
    out.anon_rest = String(r1.status);
    out.anon_rest_body = (await r1.text()).slice(0, 300);
  } catch (error) {
    out.anon_rest = `ERR ${error instanceof Error ? error.message : error}`;
  }

  try {
    const r2 = await fetch(`${url}/auth/v1/admin/users?per_page=1`, {
      headers: { apikey: anon, Authorization: `Bearer ${service}` },
    });
    out.service_admin = String(r2.status);
    out.service_admin_body = (await r2.text()).slice(0, 300);
  } catch (error) {
    out.service_admin = `ERR ${error instanceof Error ? error.message : error}`;
  }

  return NextResponse.json(out);
}
