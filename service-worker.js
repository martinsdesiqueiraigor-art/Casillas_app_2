// service-worker.js — Cache offline-first do Casillas App
// Estratégia: cache-first para assets estáticos, network-first para navegação.

const CACHE_VERSION = 'casillas-v13';
const CACHE_ASSETS = [
  './js/core/eventBus.js',
  './js/core/outboxStore.js',
  './js/core/router.js',
  './js/core/supabaseClient.js',
  './js/core/syncQueue.js',
  './js/modules/consultor/constants.js',
  './js/modules/consultor/ConsultorAgent.js',
  './js/modules/consultor/index.js',
  './js/modules/consultor/resolver.js',
  './js/modules/consultor/resultCard.js',
  './js/modules/consultor/slotExtractor.js',
  './js/modules/consultor/telemetry.js',
  './js/modules/guia/adapter.js',
  './js/modules/guia/bancoCiclosCNC.js',
  './js/modules/guia/deepFreeze.js',
  './js/modules/guia/GuiaManager.js',
  './js/modules/guia/renderers/blocks.js',
  './',
  './index.html',
  './offline.html',
  './auth.html',
  './manifest.json',
  './css/reset.css',
  './css/variables.css',
  './css/layout.css',
  './css/components.css',
  './css/modules.css',
  './js/app.js',
  './js/auth.js',
  './js/supabase.js',
  './js/supabase.bundle.js',
  './js/state.js',
  './js/trial.js',
  './js/utils.js',
  './js/db.js',
  './js/keyboard.js',
  './js/menu.js',
  './js/icons.js',
  './js/data/materiais.js',
  './js/data/tolerancias.js',
  './js/data/chavetas.js',
  './js/data/conicidades.js',
  './js/calc/trig.js',
  './js/calc/coni.js',
  './js/calc/poly.js',
  './js/calc/furos.js',
  './js/calc/rosca.js',
  './js/calc/tol.js',
  './js/calc/potencia.js',
  './js/calc/chaveta.js',
  './js/calc/gcode.js',
  './js/modules/trig.js',
  './js/modules/coni.js',
  './js/modules/poly.js',
  './js/modules/furos.js',
  './js/modules/rosca.js',
  './js/modules/tol.js',
  './js/modules/potencia.js',
  './js/modules/chaveta.js',
  './js/modules/conicpad.js',
  './js/modules/prog.js',
  './js/modules/guia.js',
  './js/modules/consult.js',
  './js/modules/home.js',
  './dados/guia_cnc.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((c) => c || caches.match('./offline.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
        return res;
      });
    })
  );
});
