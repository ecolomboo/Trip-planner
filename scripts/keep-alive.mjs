// Keeps the Supabase free-tier Postgres from auto-pausing after 7 days of
// inactivity. Run by `.github/workflows/supabase-keepalive.yml` every 3 days.
import pg from "pg";

const url = process.env.SUPABASE_DB_URL;
if (!url) {
  throw new Error("SUPABASE_DB_URL is not set");
}

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  const { rows } = await client.query("SELECT 1 AS ok");
  if (rows[0]?.ok !== 1) {
    throw new Error(`Unexpected ping response: ${JSON.stringify(rows)}`);
  }
  console.log("Supabase keep-alive ping: ok");
} finally {
  await client.end();
}
