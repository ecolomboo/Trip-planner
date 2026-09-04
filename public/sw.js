// Silk Road service worker — caches the app shell and the last-synced SSR'd
// trip data, so opening the app with no signal still shows the plan instead of
// an error screen. No offline writes: editing simply needs a connection.

const CACHE = "silk-road-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Only manage same-origin requests; Supabase (a different origin) is left
  // alone — its data already lives in the SSR'd page payload.
  if (url.origin !== self.location.origin) return;

  // API routes (e.g. the auth callback) must always hit the network.
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(request));
    return;
  }

  // Hashed static assets: cache-first, they never change.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
            return response;
          }),
      ),
    );
    return;
  }

  // Navigation (HTML): network-first, fall back to the last synced copy.
  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request)),
  );
});
