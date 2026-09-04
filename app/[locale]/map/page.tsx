import { getTranslations } from "next-intl/server";
import { MapClient } from "@/components/map-client";
import { requireUser } from "@/lib/auth";
import { mapStop } from "@/lib/map";
import { createClient } from "@/lib/supabase/server";

export default async function MapPage() {
  await requireUser();
  const supabase = await createClient();
  const { data: stopsRows } = await supabase.from("stops").select("*").order("sort_order");
  const stops = (stopsRows ?? []).map(mapStop);
  const t = await getTranslations("map");

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink">{t("title")}</h1>
      </header>
      <MapClient stops={stops} />
    </div>
  );
}
