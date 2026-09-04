import { getTranslations } from "next-intl/server";
import { Timeline } from "@/components/timeline";
import { requireUser } from "@/lib/auth";
import { mapDay, mapEntry, mapStop } from "@/lib/map";
import { createClient } from "@/lib/supabase/server";

export default async function TimelinePage() {
  await requireUser();
  const supabase = await createClient();
  const t = await getTranslations("timeline");

  const [{ data: trip }, { data: daysRows }, { data: entriesRows }, { data: stopsRows }] =
    await Promise.all([
      supabase.from("trips").select("id").limit(1).maybeSingle(),
      supabase.from("days").select("*").order("date"),
      supabase.from("entries").select("*").order("date, position"),
      supabase.from("stops").select("*").order("sort_order"),
    ]);

  const tripId = trip?.id ?? "";
  const days = (daysRows ?? []).map(mapDay);
  const entries = (entriesRows ?? []).map(mapEntry);
  const stops = (stopsRows ?? []).map(mapStop);

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink">{t("title")}</h1>
      </header>
      <Timeline tripId={tripId} days={days} stops={stops} entries={entries} />
    </div>
  );
}
