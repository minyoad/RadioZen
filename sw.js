const CACHE_NAME = 'radiozen-v3';
// We cache './' which resolves to the index page content.
// We avoid caching './index.html' explicitly to prevent 308 Redirect issues on Vercel.
const ASSETS_TO_CACHE = [
  './',
  './manifest.json'
];

// Install event: Cache the app shell
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force activation
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use {cache: 'reload'} to ensure we get fresh assets from server during install
      return cache.addAll(ASSETS_TO_CACHE.map(url => new Request(url, {cache: 'reload'})));
    })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of all clients immediately
});

// Fetch event: Network-first strategy with robust fallback
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Ignore audio streams (m3u8, mp3, aac) - we don't want to cache live radio
  if (url.pathname.endsWith('.m3u8') || url.pathname.endsWith('.mp3') || url.pathname.endsWith('.aac')) {
    return;
  }

  // 2. Navigation Requests (HTML): Try Network -> Fallback to Cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Attempt network fetch
          const networkResponse = await fetch(event.request);
          
          // Check if valid network response (200 OK)
          if (networkResponse && networkResponse.status === 200) {
            return networkResponse;
          }
          
          throw new Error('Network response was not ok');
        } catch (error) {
          // Network failed (offline) or Server 404 -> Return Cached App Shell (root)
          console.log('Navigation fallback to cache:', event.request.url);
          const cache = await caches.open(CACHE_NAME);
          
          // IMPORTANT: Match './' because that's what we cached, not 'index.html'
          const cachedResponse = await cache.match('./');
          
          if (cachedResponse) {
            return cachedResponse;
          }
          return null; 
        }
      })()
    );
    return;
  }

  // 3. Static Assets: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Network failed, nothing to do
      });

      return cachedResponse || fetchPromise;
    })
  );
});