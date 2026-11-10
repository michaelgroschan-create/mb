/* Mikes Board: hält nur die Hülle der App vor (Netz zuerst, ohne Netz aus dem Speicher). Daten laufen nie über diesen Speicher. */
const C = 'mb-shell-1';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.indexOf('mb-shell-') === 0 && k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;
  const net = new Promise((ok, no) => { fetch(r).then(ok, no); setTimeout(() => no(new Error('timeout')), 8000); });
  e.respondWith(net.then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(C).then(c => c.put(r, copy)); }
    return res;
  }).catch(() => caches.match(r, { ignoreSearch: true }).then(x => x || caches.match('index.html'))));
});
