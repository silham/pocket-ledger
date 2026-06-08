const STATIC_CACHE = 'pl-static-v1';
const DYNAMIC_CACHE = 'pl-dynamic-v1';
const API_CACHE = 'pl-api-v1';

const PRECACHE_URLS = ['/offline', '/'];

// Install: precache offline fallback and shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(DYNAMIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: delete caches from old versions
self.addEventListener('activate', (event) => {
  const CURRENT = new Set([STATIC_CACHE, DYNAMIC_CACHE, API_CACHE]);
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => !CURRENT.has(n)).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Never cache mutations
  if (request.method !== 'GET') return;

  // Static assets (content-hashed) — Cache First, 365 day TTL
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // API routes — Network First, fall back to cached response
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE, 4000));
    return;
  }

  // Auth routes — Network Only (never cache login/register state)
  if (url.pathname.startsWith('/login') || url.pathname.startsWith('/register')) {
    return;
  }

  // App pages — Stale While Revalidate (instant load, update in background)
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName, timeoutMs = 5000) {
  const cache = await caches.open(cacheName);
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(id);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached ?? new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  return cached ?? (await fetchPromise) ?? offlineFallback();
}

async function offlineFallback() {
  const cached = await caches.match('/offline');
  return cached ?? new Response('<h1>Offline</h1>', {
    headers: { 'Content-Type': 'text/html' },
  });
}
