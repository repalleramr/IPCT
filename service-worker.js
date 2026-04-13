self.addEventListener('install',e=>{
 e.waitUntil(caches.open('ipctv2').then(c=>c.addAll(['./'])))
});