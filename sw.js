// Network-first service worker - always fetch fresh content
// No caching strategy enabled

// Install event - skip waiting immediately
self.addEventListener('install', event => {
  console.log('Service Worker: Installed (no cache)');
  self.skipWaiting();
});

// Activate event - clear all existing caches and take control immediately
self.addEventListener('activate', event => {
  console.log('Service Worker: Activated (clearing all caches)');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('Service Worker: Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - always use network, never cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request, {
      cache: 'no-store'
    }).catch(error => {
      console.log('Service Worker: Fetch failed:', error);
      // Return a basic error response instead of cached content
      return new Response('Network error', {
        status: 503,
        statusText: 'Service Unavailable'
      });
    })
  );
});

// Listen for messages from the client
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  if (event.data === 'clearCache') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
      })
    );
  }
}); 