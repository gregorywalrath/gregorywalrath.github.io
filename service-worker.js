const CACHE_NAME = "basketball-stats-cache-v1";
const urlsToCache = [
    "./",
    "./index.html",
    "./bootstrap-5.3.3-dist/css/bootstrap.css",
    "./app.js",
    "./manifest.json",
    "./icon-192x192.png",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
