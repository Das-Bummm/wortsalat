const CACHE = 'wortsalat-v9';
const FILES = ['./', 'index.html', 'game.js', 'puzzles.js', 'db.js', 'pets.js', 'push/rules.mjs', 'config.js', 'manifest.json', 'icon-180.png', 'icon-512.png'];

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

// Mitteilungen vom Versand (push/send.mjs)
self.addEventListener('push', e => {
  const d = e.data?.json() ?? {};
  e.waitUntil(Promise.all([
    self.registration.showNotification(d.title || 'Wortsalat', { body: d.body, icon: 'icon-180.png', badge: 'icon-180.png', tag: d.tag, data: { start: d.start } }),
    self.navigator.setAppBadge?.(1).catch(() => {}),
  ]));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const start = e.notification.data?.start;
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    if (list[0]) { list[0].postMessage({ start }); return list[0].focus(); }
    return clients.openWindow(start ? `./?start=${start}` : './');
  }));
});
