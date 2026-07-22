const CACHE_NAME = 'salary-neo-brutal-v16';
const BASE_PATH = self.location.pathname.replace('/service-worker.js', '');

const urlsToCache = [
  BASE_PATH + '/',
  BASE_PATH + '/index.html',
  BASE_PATH + '/styles.css',
  BASE_PATH + '/uiverse.css',
  BASE_PATH + '/vendor/gsap.min.js',
  BASE_PATH + '/motion.js',
  BASE_PATH + '/manifest.json',
  BASE_PATH + '/assets/icons.svg'
];

const isStyleOrScript = (request) => {
  const dest = request.destination;
  return dest === 'style' || dest === 'script' || dest === 'worker';
};

const cachePut = (request, response) => {
  if (!response || response.status !== 200 || response.type !== 'basic') return Promise.resolve();
  const clone = response.clone();
  return caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => {});
};

const networkFirst = (request) => fetch(request)
  .then((response) => {
    if (response && response.status === 200) return cachePut(request, response).then(() => response);
    return caches.match(request).then((cached) => cached || response);
  })
  .catch(() => caches.match(request));

const cacheFirst = (request) => caches.match(request)
  .then((cached) => {
    if (cached) return cached;
    return fetch(request).then((response) => {
      if (response && response.status === 200) return cachePut(request, response).then(() => response);
      return response;
    });
  });

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) return;

  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(networkFirst(event.request).then((response) => response || caches.match(BASE_PATH + '/index.html')));
    return;
  }

  if (isStyleOrScript(event.request)) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(cacheFirst(event.request));
});
