const CACHE_NAME = 'hydrobalance-v1';
const STATIC_ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(STATIC_ASSETS)));
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ));
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);
    if (url.pathname.startsWith('/api/')) {
        e.respondWith(fetch(e.request).catch(() =>
            new Response(JSON.stringify({ error: 'Offline' }), { status: 503, headers: { 'Content-Type': 'application/json' } })
        ));
        return;
    }
    e.respondWith(
        caches.match(e.request).then((cached) => {
            if (cached) return cached;
            return fetch(e.request).then((res) => {
                if (res.ok && e.request.method === 'GET') {
                    caches.open(CACHE_NAME).then((c) => c.put(e.request, res.clone()));
                }
                return res;
            });
        }).catch(() => caches.match('./index.html'))
    );
});