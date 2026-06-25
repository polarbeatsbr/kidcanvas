const CACHE_NAME = 'kidcanvas-cache-v20';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/favicon.ico',
  '/favicon-32x32.png'
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
    // Estratégia Network-First: Tenta a rede primeiro para garantir conteúdo fresco
    fetch(event.request).then((networkResponse) => {
      if (event.request.method === 'GET' && networkResponse.status === 200) {
        const cacheCopy = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, cacheCopy);
        });
      }
      return networkResponse;
    }).catch(() => {
      // Fallback para o Cache se estiver offline
      return caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/index.html');
        }
      });
    })
  );
});
