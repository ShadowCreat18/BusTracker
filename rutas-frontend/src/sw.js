const CACHE_NAME = 'bustracker-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/icon/pwa_icon.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  // Ignorar llamadas de GET a la API del backend o mapas para que no llenen la caché
  if (event.request.url.includes('nominatim') || event.request.url.includes('localhost:1337')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Encontrado en caché, lo retornamos inmediatamente
        if (response) {
          return response;
        }

        // No está en caché. Lo pedimos a la red.
        const fetchRequest = event.request.clone();
        return fetch(fetchRequest).then(
          function(response) {
            // Verifica que la respuesta sea válida y local (archivos JS, CSS, del proyecto)
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Metemos el archivo fresco a la caché para el próximo uso offline
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(function(err) {
            console.log('Error de fetch offline: ', err);
        });
      })
  );
});
