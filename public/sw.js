/* Metri service worker — hand-rolled, conservative, versioned.
 * Bump CACHE_VERSION to invalidate every prior cache on next activate. */
const CACHE_VERSION = "metri-v1";
const OFFLINE_URL = "/offline";

// Statically-knowable shell assets. Hashed /_next chunks are NOT listed here —
// they're picked up opportunistically via stale-while-revalidate.
const PRECACHE_URLS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/brand/icon-192.png",
  "/brand/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);
      // Best-effort: a single 404 shouldn't abort the whole install.
      await Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache.add(new Request(url, { cache: "reload" })),
        ),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

const isStaticAsset = (url) =>
  url.pathname.startsWith("/_next/static/") ||
  url.pathname.startsWith("/brand/") ||
  url.pathname.startsWith("/images/") ||
  /\.(?:woff2?|ttf|otf|png|jpg|jpeg|gif|svg|webp|ico)$/.test(url.pathname);

// Network-first for navigations: fresh when online, cached page or the offline
// fallback when not. Successful navigations are cached for next-time offline use.
const handleNavigation = async (request) => {
  const cache = await caches.open(CACHE_VERSION);
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const offline = await cache.match(OFFLINE_URL);
    if (offline) return offline;
    return new Response("", { status: 503, statusText: "Offline" });
  }
};

// Stale-while-revalidate for static assets: serve cache instantly, refresh in
// the background.
const handleStatic = async (request) => {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);
  const fetched = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  return cached || (await fetched) || fetch(request);
};

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET — never cache POST/auth/mutations.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Same-origin only; let cross-origin pass straight through.
  if (url.origin !== self.location.origin) return;

  // Never intercept API/auth routes — always hit the network.
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(handleStatic(request));
  }
});
