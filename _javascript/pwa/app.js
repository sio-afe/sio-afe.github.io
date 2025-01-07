if ('serviceWorker' in navigator) {
  // Get Jekyll config from URL parameters
  const src = new URL(document.currentScript.src);
  const register = src.searchParams.get('register');
  const baseUrl = src.searchParams.get('baseurl');

  if (register) {
    const swUrl = `${baseUrl}/sw.min.js`;

    navigator.serviceWorker.register(swUrl).then((registration) => {
      registration.addEventListener('updatefound', () => {
        registration.installing.addEventListener('statechange', () => {
          if (registration.waiting) {
            if (navigator.serviceWorker.controller) {
              // Instead of showing notification, trigger update immediately
              registration.waiting.postMessage('SKIP_WAITING');
            }
          }
        });
      });
    });

    let refreshing = false;

    // Detect controller change and refresh all the opened tabs
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        window.location.reload();
        refreshing = true;
      }
    });
  } else {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      for (let registration of registrations) {
        registration.unregister();
      }
    });
  }
}