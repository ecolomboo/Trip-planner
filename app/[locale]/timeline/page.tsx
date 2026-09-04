import { getTranslations } from "next-intl/server";
import { Timeline } from "@/components/timeline";
import { requireUser } from "@/lib/auth";
import { mapDay, mapEntry } from "@/lib/map";
import { createClient } from "@/lib/supabase/server";

export default async function TimelinePage() {
  await requireUser();
  const supabase = await createClient();
  const t = await getTranslations("timeline");

  const [{ data: daysRows }, { data: entriesRows }] = await Promise.all([
    supabase.from("days").select("*").order("date"),
    supabase.from("entries").select("*").order("date, position"),
  ]);

  const days = (daysRows ?? []).map(mapDay);
  const entries = (entriesRows ?? []).map(mapEntry);

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink">{t("title")}</h1>
      </header>
      <Timeline days={days} entries={entries} />
    </div>
  );
}
