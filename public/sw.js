// Service worker de Cube·École : usage hors ligne.
// Pages de l'app : réseau d'abord, copie en cache en secours (hors ligne).
// On ne met en cache que les vraies réponses 200 de l'app elle-même : jamais
// une redirection (page de connexion Cloudflare) ni une erreur.
// Polices Google : cache d'abord, car elles ne changent pas.

const CACHE = 'cube-ecole-v1';
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
const PRECACHE = ['./', 'manifest.webmanifest', 'icone-192.png', 'icone-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => Promise.all(PRECACHE.map((url) => fetchAndStore(cache, new Request(url)))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function storable(response) {
  return response && response.status === 200 && response.type === 'basic' && !response.redirected;
}

async function fetchAndStore(cache, request) {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (storable(response)) await cache.put(request, response.clone());
    return response;
  } catch {
    return null;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok || response.type === 'opaque') {
        const cache = await caches.open(CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    })());
    return;
  }

  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(request);
      if (storable(response)) await cache.put(request, response.clone());
      return response;
    } catch {
      const cached = await cache.match(request, { ignoreSearch: true })
        || (request.mode === 'navigate' ? await cache.match('./') : undefined);
      return cached || Response.error();
    }
  })());
});
