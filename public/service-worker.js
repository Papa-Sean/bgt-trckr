const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

// Cache Files
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/index.js",
  "/indexedDB.js",
  "/manifest.webmanifest",
  "/styles.css",
  "/icons/icon-btg-trckr.png",
  "/icons/icon-btg-trckr-bigger.png",
];

// Files saved for offline use
// install service worker
self.addEventListener("install", function (evt) {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Your files were cached successfully!");
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// clear cache
self.addEventListener("activate", function (evt) {
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// Fetching data from an API
self.addEventListener("fetch", function (evt) {
  if (evt.request.url.includes("/api/")) {
    console.log("[Service Worker] Fetch (data)", evt.request.url);
    evt.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) => {
          return fetch(evt.request)
            .then((response) => {
              //Send to cache 
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }
              return response;
            })
            .catch((err) => {
              //access cache
              return cache.match(evt.request);
            });
        })
        .catch((err) => console.log(err))
    );
  } else {
    evt.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(evt.request).then((response) => {
          return response || fetch(evt.request);
        });
      })
    );
  }
});