// Service Worker for Hotel Everest Family Restaurant
// Provides offline support and aggressive caching strategies

const CACHE_NAME = 'hotel-everest-v3';
const RUNTIME_CACHE = 'hotel-everest-runtime-v3';
const IMAGE_CACHE = 'hotel-everest-images-v3';
const STATIC_CACHE = 'hotel-everest-static-v3';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/favicon.ico'
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE, STATIC_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => {
            console.log('🗑️ Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests except for fonts and images
  if (url.origin !== location.origin && !request.destination.match(/image|font/)) {
    return;
  }

  // API requests - network first, cache fallback
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(networkFirst(request, RUNTIME_CACHE));
    return;
  }

  // Images - cache first with long expiry
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, 30 * 24 * 60 * 60 * 1000)); // 30 days
    return;
  }

  // Fonts - cache first with very long expiry
  if (request.destination === 'font') {
    event.respondWith(cacheFirst(request, STATIC_CACHE, 365 * 24 * 60 * 60 * 1000)); // 1 year
    return;
  }

  // Static assets (JS, CSS) - cache first
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(cacheFirst(request, STATIC_CACHE, 7 * 24 * 60 * 60 * 1000)); // 7 days
    return;
  }

  // HTML pages - always serve index.html for SPA routing
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match('/'))
        .then(response => response || caches.match('/offline.html'))
    );
    return;
  }

  // Default - cache first
  event.respondWith(cacheFirst(request, RUNTIME_CACHE));
});

// Cache first strategy with expiry
async function cacheFirst(request, cacheName, maxAge = 24 * 60 * 60 * 1000) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    // Check if cache is still fresh
    const cachedDate = cached.headers.get('sw-cache-date');
    if (cachedDate) {
      const age = Date.now() - parseInt(cachedDate);
      if (age < maxAge) {
        // Update in background if older than 1 day
        if (age > 24 * 60 * 60 * 1000) {
          fetch(request).then(response => {
            if (response.ok) {
              const responseToCache = response.clone();
              const headers = new Headers(responseToCache.headers);
              headers.set('sw-cache-date', Date.now().toString());
              cache.put(request, new Response(responseToCache.body, {
                status: responseToCache.status,
                statusText: responseToCache.statusText,
                headers: headers
              }));
            }
          }).catch(() => {});
        }
        return cached;
      }
    }
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const responseToCache = response.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-date', Date.now().toString());
      cache.put(request, new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      }));
    }
    return response;
  } catch (error) {
    if (cached) {
      return cached;
    }
    console.error('Fetch failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network first strategy with timeout
async function networkFirst(request, cacheName, timeout = 3000) {
  const cache = await caches.open(cacheName);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const responseToCache = response.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-date', Date.now().toString());
      cache.put(request, new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      }));
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await cache.match('/offline.html');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Background sync for offline orders
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  }
});

async function syncOrders() {
  console.log('🔄 Syncing offline orders');
  // Implement order syncing logic here
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Hotel Everest';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/android-chrome-192x192.png',
    badge: '/favicon-32x32.png',
    data: data.url || '/',
    actions: [
      { action: 'open', title: 'View' },
      { action: 'close', title: 'Close' }
    ],
    vibrate: [200, 100, 200],
    tag: data.tag || 'notification'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    const urlToOpen = event.notification.data || '/';
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  }
});

// Message handler for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => caches.delete(name))
        );
      })
    );
  }
});
