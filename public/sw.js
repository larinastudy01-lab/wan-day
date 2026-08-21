const VERSION='wanday-v5';
const BASE=self.registration.scope;
const SHELL=[BASE,new URL('index.html',BASE).href,new URL('manifest.webmanifest',BASE).href,new URL('icon.svg',BASE).href];
self.addEventListener('install',event=>{event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==VERSION).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(caches.match(event.request).then(cached=>{
    const network=fetch(event.request).then(response=>{if(response.ok&&event.request.url.startsWith(self.location.origin)){const copy=response.clone();caches.open(VERSION).then(cache=>cache.put(event.request,copy))}return response}).catch(()=>cached||caches.match(new URL('index.html',BASE).href));
    return cached||network;
  }));
});
