// Service worker do Pixel Rush. Mude VERSAO ao publicar uma atualização grande.
const VERSAO = 'pixel-rush-v1';
const BASE = ['./', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png', 'favicon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  // só mexe no próprio site e nos scripts do Firebase; login e banco (Firestore) passam direto
  const meu = url.origin === location.origin;
  const fbScript = url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/');
  if (!meu && !fbScript) return;
  // rede primeiro (sempre pega a versão nova do jogo); sem internet usa o cache
  e.respondWith(
    fetch(req).then(r => {
      if (r && (r.ok || r.type === 'opaque')) { const cp = r.clone(); caches.open(VERSAO).then(c => c.put(req, cp)); }
      return r;
    }).catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('./') : Response.error())))
  );
});
