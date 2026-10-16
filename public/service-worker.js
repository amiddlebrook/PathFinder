const CACHE = 'pathfinder-shell-v3';
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    try {
      const page = await fetch('/index.html',{cache:'reload'});
      if (!page.ok) return;
      const html = await page.text();
      const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(m=>m[1]);
      await cache.addAll(['/', '/index.html', '/favicon.svg', '/manifest.webmanifest', ...assets]);
    } catch (e) { console.warn('Offline precache unavailable',e); }
    self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(n=>n.startsWith('pathfinder-shell-')&&n!==CACHE).map(n=>caches.delete(n)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (req.mode === 'navigate') {
      try { const response=await fetch(req);if (response.ok) await cache.put('/index.html',response.clone());return response; }
      catch { return await cache.match('/index.html') || Response.error(); }
    }
    const saved = await cache.match(req);
    if (saved) return saved;
    try {
      const response=await fetch(req);
      if (response.ok && (url.pathname.startsWith('/assets/')||url.pathname==='/favicon.svg')) await cache.put(req,response.clone());
      return response;
    } catch { return Response.error(); }
  })());
});
