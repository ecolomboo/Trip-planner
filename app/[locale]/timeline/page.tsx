import { getTranslations } from "next-intl/server";
import { Timeline } from "@/components/timeline";
import { seedDays, seedEntries } from "@/lib/seed";

export default async function TimelinePage() {
  const t = await getTranslations("timeline");

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink">{t("title")}</h1>
      </header>
      <Timeline days={seedDays} entries={seedEntries} />
    </div>
  );
}
