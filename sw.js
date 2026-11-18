const CACHE = 'wortsalat-v2';
const FILES = ['./', 'index.html', 'game.js', 'puzzles.js', 'db.js', 'pets.js', 'config.js', 'manifest.json', 'icon-180.png', 'icon-512.png'];

self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))));

// Netz zuerst (damit Updates ankommen), offline aus dem Cache. Supabase-API-Aufrufe nicht cachen.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.hostname.endsWith('supabase.co')) return;
  e.respondWith(
    fetch(e.request)
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
