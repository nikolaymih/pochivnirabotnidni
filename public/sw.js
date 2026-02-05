// Service Worker for Pochivni Rabotni Dni
// Runtime caching for holidays API and static assets

const CACHE_VERSION = 'v1';
const HOLIDAYS_CACHE = `holidays-api-cache-${CACHE_VERSION}`;
const STATIC_CACHE = `static-assets-${CACHE_VERSION}`;
const APP_SHELL_CACHE = `app-shell-${CACHE_VERSION}`;

// Assets to precache (app shell)
const APP_SHELL_ASSETS = [
  '/',
  '/manifest.json',
];

// Install event - precache app shell
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');

  event.waitUntil(
    caches.open(APP_SHELL_CACHE)
      .then((cache) => {
        console.log('[SW] Precaching app shell');
        return cache.addAll(APP_SHELL_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete old versions of our caches
              return cacheName.startsWith('holidays-api-cache-') ||
                     cacheName.startsWith('static-assets-') ||
                     cacheName.startsWith('app-shell-');
            })
            .filter((cacheName) => {
              // Keep only current version
              return cacheName !== HOLIDAYS_CACHE &&
                     cacheName !== STATIC_CACHE &&
                     cacheName !== APP_SHELL_CACHE;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Strategy 1: CacheFirst for Holiday API (openholidaysapi.org)
  if (url.hostname === 'openholidaysapi.org') {
    event.respondWith(
      caches.open(HOLIDAYS_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[SW] Cache hit for holiday API:', url.pathname);
            return cachedResponse;
          }

          console.log('[SW] Fetching from network (holiday API):', url.pathname);
          return fetch(request).then((networkResponse) => {
            // Cache successful responses
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch((error) => {
            console.error('[SW] Fetch failed for holiday API:', error);
            throw error;
          });
        });
      })
    );
    return;
  }

  // Strategy 2: StaleWhileRevalidate for static assets (js, css, images, fonts)
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|woff|woff2|ttf)$/) ||
    url.pathname.startsWith('/_next/static/')
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            // Update cache with fresh response
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch((error) => {
            console.error('[SW] Fetch failed for static asset:', error);
            // Return cached version if network fails
            return cachedResponse;
          });

          // Return cached version immediately, update cache in background
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Strategy 3: Network-first for everything else (API calls, navigation, Supabase)
  // Do NOT cache Supabase calls or mutations
  event.respondWith(
    fetch(request).catch((error) => {
      console.error('[SW] Network request failed:', url.pathname, error);

      // If offline and requesting a page, try to serve from app shell cache
      if (request.mode === 'navigate') {
        return caches.match('/').then((response) => {
          return response || Promise.reject(error);
        });
      }

      throw error;
    })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
