// FunnFit 72 — Service Worker (offline app shell)
// Subí la versión (v1 -> v2 ...) cada vez que cambien los archivos, para forzar actualización.
const CACHE = 'funnfit-v1';
const ASSETS = [
  './',
  './index.html',
  './funnfit_styles.css',
  './funnfit_data.js',
  './funnfit_app.js',
  './chart.umd.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './LogoV06.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Navegación: intentar red, caer a index.html cacheado (offline)
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }
  // Resto: cache-first, con respaldo de red y guardado
  e.respondWith(
    caches.match(req).then((hit) =>
      hit || fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => hit)
    )
  );
});
