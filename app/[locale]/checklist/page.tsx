import { getTranslations } from "next-intl/server";
import { Checklist } from "@/components/checklist";
import { requireUser } from "@/lib/auth";
import { mapChecklistItem } from "@/lib/map";
import { createClient } from "@/lib/supabase/server";

export default async function ChecklistPage() {
  await requireUser();
  const supabase = await createClient();
  const t = await getTranslations("checklist");

  const [{ data: trip }, { data: rows }] = await Promise.all([
    supabase.from("trips").select("id").limit(1).maybeSingle(),
    supabase.from("checklist_items").select("*").order("position, created_at"),
  ]);

  const items = (rows ?? []).map(mapChecklistItem);

  return (
    <div className="max-w-2xl">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink">{t("title")}</h1>
      </header>
      <Checklist tripId={trip?.id ?? ""} items={items} />
    </div>
  );
}
