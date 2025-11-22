// Service worker that unregisters itself and clears all caches
// This effectively disables the PWA and all caching

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(cacheNames.map(cache => caches.delete(cache))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll())
      .then(clients => {
        clients.forEach(client => client.navigate(client.url));
      })
  );
}); 