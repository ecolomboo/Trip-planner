"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

/** Shows a clear banner when offline, so editing isn't silently unavailable. */
export function OfflineBanner() {
  const t = useTranslations("offline");
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    function update() {
      setOffline(!navigator.onLine);
    }
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      className="border-b border-ochre/40 bg-ochre/10 px-4 py-2 text-sm text-ochre"
    >
      <span className="font-medium">{t("title")}.</span> {t("editingUnavailable")}
    </div>
  );
}
