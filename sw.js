const version = '0.0.0.6';
const CACHE_NAME = `tower-defense-${version}`;

const APP_SHELL = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/router.js',
  // ajoute ici manifest/icons si besoin
];

// INSTALL: Démarre le service worker et pré-cache les fichiers du shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// ACTIVATE: nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// FETCH: stratégie hybride de service des fichiers quand offline
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1) Requêtes de navigation (deep-link SPA) :
  // Si offline ou 404 cache, on renvoie index.html (app shell),
  // puis ton router fera le rendu de la route.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // 2) Assets same-origin: cache-first + mise en cache au fil de l’eau
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;

        return fetch(req).then((networkRes) => {
          // Mise en cache “runtime” des fichiers récupérés
          const copy = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return networkRes;
        });
      })
    );
    return;
  }

  // 3) Cross-origin (CDN etc.) : network-first (ou no-op)
  event.respondWith(fetch(req).catch(() => caches.match(req)));
});
