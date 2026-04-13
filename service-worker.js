self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('kubera').then(cache => cache.addAll(['./']))
  );
});