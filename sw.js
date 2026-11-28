// Lets the map open with no signal: keeps the page, its map code and icons, and map tiles already viewed.
// The sheet's data and sign-in never go through here (the page keeps its own saved copy of the data).
// After changing a file this caches forever (icons, manifest), bump APP so phones fetch it again.
const APP = 'app-v1', TILES = 'tiles-v1', MAX_TILES = 1000; // roughly 30 MB of tiles at most

self.addEventListener('install', e => {
  e.waitUntil(caches.open(APP).then(c => c.addAll(['./', 'manifest.webmanifest', 'icon-192.png'])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== APP && k !== TILES).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const TILE_HOSTS = ['tile.openstreetmap.org', 'server.arcgisonline.com'];
const STATIC_HOSTS = ['unpkg.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate' && url.origin === location.origin) e.respondWith(page(req));
  else if (TILE_HOSTS.includes(url.hostname)) e.respondWith(cacheFirst(req, TILES, true));
  else if (STATIC_HOSTS.includes(url.hostname) || (url.origin === location.origin && !url.search)) e.respondWith(cacheFirst(req, APP));
  // Anything else (the sheet's web app, Google sign-in) goes straight to the network as usual.
});

// The page: the network's copy when it answers within 4 seconds, so updates show at once; otherwise the saved one.
async function page(req) {
  const cache = await caches.open(APP);
  const net = fetch(req).then(res => { if (res.ok) cache.put('./', res.clone()); return res; });
  net.catch(() => {}); // offline: handled below
  const slow = new Promise(r => setTimeout(r, 4000));
  try {
    const res = await Promise.race([net, slow]);
    if (res) return res;
  } catch (err) { /* offline */ }
  return (await cache.match('./')) || net;
}

// Tiles are requested with CORS (crossOrigin on the tile layers), so only real, readable images are kept.
async function cacheFirst(req, name, tiles) {
  const cache = await caches.open(name);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || (!tiles && res.type === 'opaque')) {
    await cache.put(req, res.clone());
    if (tiles) cache.keys().then(keys => keys.length > MAX_TILES && Promise.all(keys.slice(0, keys.length - MAX_TILES).map(k => cache.delete(k))));
  }
  return res;
}
