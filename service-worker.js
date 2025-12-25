const CACHE_NAME = 'salary-calculator-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// 安裝 Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 激活 Service Worker
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
});

// 攔截請求並使用緩存
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果在緩存中找到，返回緩存版本
        if (response) {
          return response;
        }
        // 否則從網絡獲取
        return fetch(event.request).then((response) => {
          // 檢查響應是否有效
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          // 克隆響應
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          return response;
        });
      })
      .catch(() => {
        // 如果網絡請求失敗，可以返回離線頁面
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

