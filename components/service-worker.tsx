"use client";

import { useEffect } from "react";

/** Registers the service worker once the app is interactive. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Service worker registration is best-effort; the app works without it.
      });
    }
  }, []);

  return null;
}
