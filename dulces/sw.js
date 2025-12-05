const currentCache = 'cache-v1.0';
const files = [
  './index.html',
  './js/app.js',
  './css/style.css',
  './pages/offline.html',
  './img/logos/logo.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(currentCache).then(c=>c.addAll(files)));
});

self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(k=>k!==currentCache).map(k=>caches.delete(k))
  )));
});

self.addEventListener('fetch', e=>{
  e.respondWith(
    fetch(e.request).catch(()=>caches.open(currentCache).then(c=>c.match('./pages/offline.html')))
  );
});
