const CACHE_NAME = 'salary-calculator-v2';
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

// 攔截請求並使用緩存（網絡優先策略）
self.addEventListener('fetch', (event) => {
  // 只處理同源請求
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // 對於 HTML 文件，使用網絡優先策略以確保獲取最新版本
  if (event.request.destination === 'document' || event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // 如果網絡請求成功，更新緩存並返回響應
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch(err => {
                console.warn('Failed to cache response:', err);
              });
            return response;
          }
          // 如果網絡請求失敗，嘗試從緩存獲取
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // 最後嘗試返回 index.html
              return caches.match(BASE_PATH + '/index.html');
            });
        })
        .catch((error) => {
          console.warn('Fetch failed, using cache:', error);
          // 網絡失敗時，從緩存獲取
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // 最後嘗試返回 index.html
              return caches.match(BASE_PATH + '/index.html');
            });
        })
    );
  } else {
    // 對於其他資源（圖片、JSON等），使用緩存優先策略
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
              // 克隆響應並更新緩存
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
              throw error;
            });
        })
    );
  }
});

