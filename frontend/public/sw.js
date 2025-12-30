self.addEventListener('install', (e) => {
  e.waitUntil(caches.open('weather-v1').then(cache => 
    cache.addAll(['/'])
  ));
});
