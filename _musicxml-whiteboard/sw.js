const CACHE_NAME = 'musicxml-wb-v1';

const PRECACHE_URLS = [
    './',
    'index.html',
    'view3d.html',
    'css/style.css',
    'js/globals.js',
    'js/history.js',
    'js/ui.js',
    'js/svg-engine.js',
    'js/musicxml.js',
    'js/project.js',
    'js/main.js',
    'js/pwa.js',
    'js/view3d.js',
    'vendor/opensheetmusicdisplay.min.js',
    'vendor/html2canvas.min.js',
    'vendor/jspdf.umd.min.js',
    'vendor/three.min.js',
    'vendor/fonts/outfit-latin.woff2',
    'icons/icon-192x192.png',
    'icons/icon-512x512.png',
    'manifest.json'
];

// Install Event: Pre-cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Pre-caching offline assets');
                return cache.addAll(PRECACHE_URLS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event: Cache-First + Dynamic Fallback
self.addEventListener('fetch', event => {
    // Only handle GET requests (e.g. ignore browser extensions, etc.)
    if (event.request.method !== 'GET') return;

    // Ignore requests from chrome-extension protocols
    if (event.request.url.startsWith('chrome-extension://')) return;

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse; // Return from cache
            }

            // Fallback to network
            return fetch(event.request).then(networkResponse => {
                // Check if we received a valid response
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                // Clone response to put into cache
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });

                return networkResponse;
            }).catch(() => {
                // If both cache and network fail, it means we are offline and the file isn't cached.
                // For static apps, we could return a custom offline page, but returning a generic error is fine.
                console.warn('[Service Worker] Fetch failed; returning offline error.');
                // Optional: return caches.match('offline.html');
            });
        })
    );
});
