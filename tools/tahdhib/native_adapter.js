/* Native Daruri adapter: book-isolated storage, legacy-ID migration and PDF source gates. */
(function(){'use strict';
 const cfg=window.TAHDHIB_NATIVE,book=cfg.book;
 document.getElementById('editionData').textContent=JSON.stringify(book);
 document.getElementById('dictionaryData').textContent=JSON.stringify(cfg.dictionary);
 const get=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
 const key=cfg.storagePrefix+'-reader-v2',deskKey=cfg.storagePrefix+'-reading-desk-v1';
 const old=get('gnamma-tahdhib-reader-v2-'+(cfg.kind==='logic'?'division':'kalam'))||{};
 const experience=get('gnamma-tahdhib-experience-v1-'+cfg.kind)||{};
 if(!get(key)){
  const current=cfg.book.sections.find(s=>s.originalPage===Number(old.page))||book.sections[0];
  const initial={n:String(current.id),lang:{both:'parallel',en:'english',ar:'arabic'}[old.view]||'parallel',
   focusLevel:experience.mode==='study'?0:3,theme:['light','dark'].includes(old.theme)?old.theme:'system',
   vowels:true,fontScale:old.font||1,arabicFont:experience.arFont||'amiri',englishFont:{sans:'source-serif',accessible:'literata'}[experience.enFont]||'original',bookmarks:[]};
  try{localStorage.setItem(key,JSON.stringify(initial))}catch{}
 }
 // Migrate legacy annotations once into a separate, book-labelled collection.
 // The original storage is NEVER deleted, cleared or overwritten.
 if(!get(deskKey)){
  const notes=get('gnamma-tahdhib-private-notes-v1-'+cfg.kind)||{},rows=[];
  const base=(unit,kind,target,body='')=>({id:'legacy-'+kind+'-'+unit,kind,target,title:unit,body,created:0,updated:0,modified:0,deleted:0,dateSource:'legacy-unknown'});
  for(const id of Array.isArray(old.bookmarks)?old.bookmarks:[]){const m=cfg.unitMap[id];if(m)rows.push(base(id,'paragraph',{kind:'paragraph',section:String(m.section),segment:m.segment,lang:'en'}));}
  for(const [id,n] of Object.entries(notes)){const m=cfg.unitMap[id];if(!m)continue;const target={kind:'paragraph',section:String(m.section),segment:m.segment,lang:'en'};
   if(typeof n.body==='string'&&n.body)rows.push(base(id,'note',target,n.body));
   if(n.highlight){const text=book.sections.find(s=>s.id===m.section).segments[m.segment].en;rows.push(base(id,'quote',{...target,kind:'quote',quote:text.slice(0,5000),offset:0,prefix:'',suffix:''}));}
  }
  try{localStorage.setItem(deskKey,JSON.stringify({format:'gnamma-reading-desk',version:1,book:cfg.kind,items:rows,migratedFrom:'tahdhib-legacy'}))}catch{}
 }
 const mapHash=()=>{let h;try{h=decodeURIComponent(location.hash.slice(1))}catch{return}
  if(h.startsWith('page=')){const page=Number(h.split('=')[1]);const s=book.sections.find(s=>s.originalPage===page);if(s)history.replaceState(null,'','#section='+s.id);}
  const item=cfg.anchorMap[h]||cfg.anchorMap[h.replace(/^flow-/,'').replace(/-ar$/,'')];
  if(item)history.replaceState(null,'','#section='+item.section+'&paragraph='+item.segment);
 };
 mapHash();window.addEventListener('hashchange',mapHash);
 window.GnammaEditions={render(main){
  main.innerHTML='<header class="panel-hero hero"><h1>Editions &amp; downloads</h1><p>'+book.info.title+'</p></header><p class="native-pdf-status" role="status">Checking the PDFs against this source revision…</p><div class="native-pdfs button-row"></div><p>Original Arabic, English, and parallel editions are separate from the unreviewed machine-vowelled learning aid. A matching file hash verifies file integrity, not scholarly correctness.</p><div class="button-row"><a class="action-btn" href="source-reader.html">Source apparatus and structured exports</a><a class="action-btn" href="'+cfg.statusHref+'">Editorial status</a></div>';
  const status=main.querySelector('.native-pdf-status'),list=main.querySelector('.native-pdfs');
  (async()=>{try{
   const [mr,sr]=await Promise.all([fetch('pdfs/edition_manifest.json',{cache:'no-store'}),fetch('data.js',{cache:'no-store'})]);
   if(!mr.ok||!sr.ok)throw Error('Source or PDF manifest unavailable');
   const manifest=await mr.json(),bytes=await sr.arrayBuffer();
   const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');
   if(hash!==manifest.source_sha256||manifest.unit_count!==cfg.unitCount)throw Error('The PDFs belong to a different text revision');
   let count=0;for(const file of manifest.files||[]){if(!/^pdfs\/[a-zA-Z0-9_.-]+\.pdf$/.test(file.href||''))continue;
    const a=document.createElement('a');a.className='action-btn';a.href=file.href;a.target='_blank';a.rel='noopener';
    a.textContent=(file.purpose==='bilingual'?'Arabic–English':file.purpose==='arabic'?'Arabic':'English')+' · '+file.a4_pages+' pp. · PDF';list.append(a);count++;
   }
   status.textContent=count===3?'All three canonical PDFs match the current source revision.':'Some PDF editions are unavailable.';
  }catch(e){status.textContent='Verified downloads unavailable: '+e.message+'. The page-aligned reader retains structured text exports.'}})();
 }};
})();
