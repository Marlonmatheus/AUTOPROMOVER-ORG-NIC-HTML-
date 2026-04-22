const CACHE_NAME = "cronograma-cache-v4";

// arquivos estáticos (UI do app)
const STATIC_FILES = [
  "index.html",
  "cronograma.html",
  "manifest.json",
  "icon.png"
];

// =======================
// INSTALL
// =======================
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_FILES);
    })
  );
});

// =======================
// ACTIVATE
// =======================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// =======================
// FETCH STRATEGY (INTELIGENTE)
// =======================
self.addEventListener("fetch", (event) => {

  const url = event.request.url;

  // ❌ NUNCA intercepta Firebase / APIs
  if (
    url.includes("firebaseio.com") ||
    url.includes("googleapis") ||
    event.request.method !== "GET"
  ) {
    return;
  }

  // =======================
  // STRATEGY:
  // - HTML/CSS/JS => cache-first (rápido)
  // - resto => network-first
  // =======================

  if (event.request.destination === "document" ||
      event.request.destination === "style" ||
      event.request.destination === "script") {

    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((res) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, res.clone());
            return res;
          });
        });
      })
    );

  } else {

    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
          return res;
        })
        .catch(() => caches.match(event.request))
    );
  }
});

// =======================
// BACKGROUND SYNC (base)
// =======================
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    // aqui você pode sincronizar dados offline depois (upgrade futuro)
    console.log("Sincronização em segundo plano...");
  }
});
