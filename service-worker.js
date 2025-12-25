const CACHE_NAME = 'salary-calculator-v1';
// 動態獲取 Service Worker 所在路徑
const BASE_PATH = self.location.pathname.replace('/service-worker.js', '');

const urlsToCache = [
  BASE_PATH + '/',
  BASE_PATH + '/index.html',
  BASE_PATH + '/manifest.json',
  BASE_PATH + '/icon-192.png',
  BASE_PATH + '/icon-512.png'
];

// 安裝 Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache, BASE_PATH:', BASE_PATH);
        // 使用 Promise.all 來處理可能的錯誤
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(err => {
              console.warn('Failed to cache:', url, err);
            });
          })
        );
      })
      .then(() => {
        // 強制激活新的 Service Worker
        return self.skipWaiting();
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
    .then(() => {
      // 立即控制所有客戶端
      return self.clients.claim();
    })
  );
});

// 攔截請求並使用緩存
self.addEventListener('fetch', (event) => {
  // 只處理同源請求
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果在緩存中找到，返回緩存版本
        if (response) {
          return response;
        }
        // 否則從網絡獲取
        return fetch(event.request)
          .then((response) => {
            // 檢查響應是否有效
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            // 克隆響應
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch(err => {
                console.warn('Failed to cache response:', err);
              });
            return response;
          })
          .catch((error) => {
            console.warn('Fetch failed:', error);
            // 如果網絡請求失敗，嘗試返回緩存的 index.html
            if (event.request.destination === 'document' || 
                event.request.mode === 'navigate') {
              return caches.match(BASE_PATH + '/index.html');
            }
            throw error;
          });
      })
      .catch((error) => {
        console.error('Cache match failed:', error);
        // 最後嘗試返回 index.html
        if (event.request.destination === 'document' || 
            event.request.mode === 'navigate') {
          return caches.match(BASE_PATH + '/index.html');
        }
        return new Response('Offline', { status: 503 });
      })
  );
});

