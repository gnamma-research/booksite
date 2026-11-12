/* Qawtaw17: isolated offline cache for the source-scoped Qawaid/Tamhid
 * working edition. Shared Daruri matcher and icon scripts are cached intact.
 * Personal reading data remains in the browser and is never cached here.
 */
const CACHE='gnamma-qawaid-20261113-qawtaw17-v1';
const FILES=[
 './','index.html','commentary.html',
 'reader.css','layered-reader.css','qawaid-study.css','qawaid-parity.css',
 'layered-reader.js','commentary-reader.js','commentary-main-bridge.js',
 'qawaid-study.js','qawaid-parity-search.js','qawaid-parity-desk.js','qawaid-parity-personal-pdf.js',
 'qawaid-historical-lexicon.js','qawaid-inline-references.js',
 'data/units.js','data/commentary.js','data/commentary-corpus.json','data/commentary-corpus.js',
 'data/commentary-conclusion.js','data/commentary-main-001-019.js','data/commentary-main-020-060.js',
 'data/commentary-introduction-1.js','data/commentary-introduction-2.js',
 'data/commentary-introduction-3.js','data/commentary-introduction-4.js',
 'data/linked-lexicon.js','data/primary-reference-register.js',
 'data/parallel-matn.md','data/parallel-commentary.md',
 'pdf/manifest.json','pdf/qawaid-bilingual-reading.pdf','pdf/qawaid-english-reading.pdf',
 'pdf/qawaid-arabic-reading.pdf','pdf/qawaid-bilingual-study.pdf','pdf/qawaid-bilingual-reference.pdf',
 '../../../daruri/bookmark-ui.js','../../../daruri/gnamma-scholarly.js',
 '../../../daruri/gnamma-proximity.js',
 '../../../daruri/vendor/pdf-lib-1.17.1.min.js','../../../daruri/vendor/fontkit-1.1.1.umd.min.js',
 '../../../daruri/vendor/NotoSerif-Regular.ttf','../../../daruri/vendor/NotoNaskhArabic-Regular.ttf',
 '../../../assets/gnamma-mark.svg'
];
const URLS=FILES.map(s=>new URL(s,self.registration.scope).href);
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  for(const url of URLS){
   const res=await fetch(url,{cache:'no-store'});
   if(!res.ok)throw new Error('Offline source asset missing: '+url);
   await cache.put(url,res.clone());
  }
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  for(const k of await caches.keys())if(k.startsWith('gnamma-qawaid-')&&k!==CACHE)await caches.delete(k);
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const u=new URL(req.url);
 if(u.origin!==self.location.origin||!URLS.includes(u.href))return;
 event.respondWith((async()=>{
  const cached=await caches.match(req,{ignoreSearch:true});
  if(cached)return cached;
  try{return await fetch(req);}catch(_){return new Response('Source is not in the offline archive.',{status:503});}
 })());
});
self.addEventListener('message',event=>{
 if(event.data?.type!=='QAW_OFFLINE_STATUS')return;
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE),keys=await cache.keys();
  event.source?.postMessage?.({type:'QAW_OFFLINE_STATUS',cached:keys.length,expected:URLS.length,
   complete:URLS.every(url=>keys.some(x=>x.url===url))});
 })());
});
