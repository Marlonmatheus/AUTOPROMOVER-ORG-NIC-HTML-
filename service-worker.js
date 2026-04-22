const CACHE_NAME = "cronograma-cache-v2"; // 🔥 muda versão sempre que atualizar

const FILES = [
  "index.html",
  "cronograma.html",
  "manifest.json",
  "icon.png"
];

// INSTALAÇÃO
self.addEventListener("install", e => {
  self.skipWaiting(); // 🔥 força atualização imediata

  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES);
    })
  );
});

// ATIVAÇÃO (limpa cache antigo)
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME)
            .map(k => caches.delete(k))
      );
    })
  );
});

// FETCH
self.addEventListener("fetch", e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, res.clone());
          return res;
        });
      })
      .catch(() => caches.match(e.request))
  );
});
