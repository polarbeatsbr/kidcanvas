const CACHE_NAME = 'kidcanvas-cache-v28';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/mascot_artista.png',
  '/mascot_mago.png',
  '/mascot_aprendiz.png',
  '/mascot_lenda.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(err => {
        console.warn("Offline cache preload missed some assets:", err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      clients.claim(),
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
    ])
  );
});

self.addEventListener('fetch', (event) => {
  // Ignorar requests de API e R2 assets externos para evitar conflitos de cache
  if (event.request.url.includes('/api/') || event.request.url.includes('pub-80073e247d7e49e6957cfb54297792ed.r2.dev')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Cachear arquivos estáticos locais novos dinamicamente
        if (event.request.method === 'GET' && networkResponse.status === 200 && (event.request.url.endsWith('.png') || event.request.url.endsWith('.css') || event.request.url.endsWith('.js'))) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cacheCopy);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback offline se o HTML principal falhar
        if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/index.html');
        }
      });
    })
  );
});
