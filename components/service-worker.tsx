"use client";

import { useEffect } from "react";

/**
 * Registers the service worker in production. In development it is explicitly
 * unregistered: the cache-first strategy for `/_next/static` would serve stale
 * chunks during HMR, causing hydration mismatches and "I still see the old
 * version" bugs.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Best-effort; the app works without it.
    });
  }, []);

  return null;
}
