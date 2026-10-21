/* Reading Desk: personal local scholarly bookmarks and notes, independent of edition data. */
(function(){
'use strict';
const KEY='gnamma-reading-desk-v1', FORMAT='gnamma-reading-desk', VERSION=1;
const CATEGORIES=['all','bookmarks','mine'];
const LABELS={all:'All',bookmarks:'Bookmarks',mine:'My notes',text:'Text',booknotes:'Book notes',notes:'My notes',dictionary:'Dictionary',index:'Subject index',bidaya:'Bidāya',lessons:'Lessons',bin:'Bin'};
const SORTS={'created-desc':'Newest saved','created-asc':'Oldest saved','modified-desc':'Recently edited',source:'Text / source order',alpha:'Title A–Z'};
const KINDS=new Set(['section','paragraph','quote','footnote','dictionary','index','application','lesson','note']);
const clamp=(v,max=1000)=>String(v==null?'':v).slice(0,max);
const esc=v=>clamp(v,100000).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=v=>String(v||'').replace(/[\u064b-\u065f\u0670\u0640\u06d6-\u06ed]/g,'').normalize('NFC');
const norm=v=>clean(v).replace(/\s+/g,' ').trim();
const keyOf=t=>[t.kind,t.section||'',t.segment==null?'':t.segment,t.kind==='paragraph'?'':t.lang||'',t.quote?norm(t.quote).slice(0,400):'',t.term||'',t.app||'',t.lesson||'',t.level||'',t.noteId||''].join('\u241f');
const uuid=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():'desk-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
const short=(v,n=110)=>clamp(v,30000).length>n?clamp(v,n-1)+'…':String(v||'');
const category=it=>it.kind==='note'||it.kind==='footnote'?'notes':['quote','paragraph','section'].includes(it.kind)?'text':it.kind==='application'?'bidaya':it.kind==='lesson'?'lessons':it.kind;
function create(ctx){
 const state=ctx.state, book=ctx.book;
 let records=[],available=true,selection=null,editor=null,origin=null,readingOrigin=null,printRoot=null,returnFocus=null,printFocus=null,probeTimer=0,decorating=false,ready=false,lastUndo=null,pendingIntent=null;
 const ui={category:'all',sourceType:'all',sort:'created-desc',query:'',selected:'',context:'both',expanded:false,filterTarget:'',filterSegment:null,mobileDetail:false,listScroll:0};
 const printPrefs={order:'source',arabic:true,english:true,personal:true,dates:true,bookmarkDates:false,full:false};
 let openContext=null,editorOriginal=null;
 const $=s=>document.querySelector(s);
 const section=n=>ctx.sections.get(String(n));
 function validateTarget(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
  const kind=clamp(raw.kind,30);
  if(!KINDS.has(kind)||kind==='note')return null;
  const target={kind};
  if(['section','quote','paragraph','footnote'].includes(kind)){
   target.section=clamp(raw.section,30);
   if(!section(target.section))return null;
  }
  if(kind==='quote'||kind==='paragraph'){
   target.segment=Math.max(0,Math.min(2000,Math.floor(Number(raw.segment)||0)));
   if(!section(target.section)?.segments?.[target.segment])return null;
   target.lang=raw.lang==='ar'?'ar':'en';
   if(kind==='quote'){
    target.quote=clamp(raw.quote,5000);
    if(!target.quote.trim())return null;
    target.prefix=clamp(raw.prefix,120);
    target.suffix=clamp(raw.suffix,120);
    target.offset=Math.max(0,Math.min(100000,Math.floor(Number(raw.offset)||0)));
   }
  }
  if(kind==='footnote'){
   target.noteId=clamp(raw.noteId,80);
   if(!ctx.notes.has(target.noteId))return null;
  }
  if(kind==='dictionary'){
   target.historical=raw.historical===true;
   target.term=clamp(raw.term,250);
   if(!book.glossary.some(g=>g.term===target.term)&&!(ctx.termExists?.(target.term)))return null;
  }
  if(kind==='index'){
   target.term=clamp(raw.term,250);
   target.sub=clamp(raw.sub,250);
   if(!book.index.some(g=>g.term===target.term))return null;
  }
  if(kind==='application'){
   target.app=clamp(raw.app,50);
   if(!ctx.apps.has(target.app))return null;
  }
  if(kind==='lesson'){
   target.lesson=clamp(raw.lesson,90);
   target.level=['basic','intermediate','advanced'].includes(raw.level)?raw.level:'basic';
   if(!window.DARURI_STUDY_DATA?.lessons?.some(l=>l.id===target.lesson))return null;
  }
  return target;
 }
 function sanitize(r){
  if(!r||typeof r!=='object'||Array.isArray(r))return null;
  const kind=clamp(r.kind,30);
  const target=validateTarget(r.target||r);
  if(kind==='note'&&!target&&!r.standalone)return null;
  if(kind!=='note'&&(!KINDS.has(kind)||!target||target.kind!==kind))return null;
  const updated=Math.max(0,Number(r.updated)||0)||Date.now();
  const created=Math.max(0,Number(r.created)||0);
  return {id:clamp(r.id,100)||uuid(),kind,target:target||null,
   title:clamp(r.title,240),body:kind==='note'?clamp(r.body,30000):'',
   created,updated,modified:Math.max(0,Number(r.modified)||0),
   dateSource:['recorded','legacy-unknown','unverified'].includes(r.dateSource)?r.dateSource:'unverified',
   deleted:Math.max(0,Number(r.deleted)||0)||0,standalone:kind==='note'&&!!r.standalone};
 }
 function load(){
  try{
   const value=localStorage.getItem(KEY);
   if(value){const data=JSON.parse(value);if(data?.format===FORMAT&&data.version===VERSION&&Array.isArray(data.items))records=data.items.slice(0,3000).map(sanitize).filter(Boolean);}
  }catch(e){available=false;}
  // Preserve existing section bookmarks without creating duplicates.
  let changed=false;
  for(const n of state.bookmarks||[]){
   if(!section(n))continue;
   if(records.some(r=>r.kind==='section'&&String(r.target?.section)===String(n)))continue;
   records.push({id:uuid(),kind:'section',target:{kind:'section',section:String(n)},title:'',body:'',created:0,updated:Date.now(),modified:0,dateSource:'legacy-unknown',deleted:0,standalone:false});changed=true;
  }
  syncLegacy(false);
  if(changed)persist();
 }
 function persist(){
  try{
   localStorage.setItem(KEY,JSON.stringify({format:FORMAT,version:VERSION,items:records}));
   available=true;syncLegacy(true);return true;
  }catch(e){
   available=false;ctx.notify('Reading Desk is not saved: browser storage is full or unavailable. Export a backup.');return false;
  }
 }
 function syncLegacy(doSave){
  const list=records.filter(r=>r.kind==='section'&&!r.deleted).map(r=>String(r.target.section));
  ctx.setLegacyBookmarks(list,doSave);
 }
 function active(){return records.filter(r=>!r.deleted);}
 function titleOf(t){if(!t)return 'Unattached note';
  if(t.kind==='section')return ctx.sectionRef(t.section)+' · '+(section(t.section)?.title||'Section');
  if(t.kind==='quote')return short(t.quote,72);
  if(t.kind==='paragraph')return ctx.sectionRef(t.section)+' · Paragraph '+(t.segment+1);
  if(t.kind==='footnote')return 'Book note '+t.noteId+' · '+ctx.sectionRef(t.section);
  if(t.kind==='dictionary')return t.term;
  if(t.kind==='index')return t.term+(t.sub?' · '+t.sub:'');
  if(t.kind==='application')return (ctx.apps.get(t.app)?.title||t.app);
  if(t.kind==='lesson')return window.DARURI_STUDY_DATA?.lessons?.find(l=>l.id===t.lesson)?.title||t.lesson;
  return 'Untitled';
 }
 function subOf(t){if(!t)return 'Personal note';
  if(['section','quote','paragraph','footnote'].includes(t.kind))return ctx.sectionRef(t.section)+(t.segment!=null?' · Paragraph '+(t.segment+1):'')+(t.lang?' · '+(t.lang==='ar'?'Arabic':'English'):'');
  if(t.kind==='lesson')return 'Study guide · '+t.level;
  if(t.kind==='application')return 'Bidāya application '+t.app;
  return LABELS[category({kind:t.kind})]||'Reference';
 }

 function dateDisplay(value,precise=false){
  if(!Number.isFinite(value)||value<=0)return '';
  try{return new Intl.DateTimeFormat(undefined,precise?{dateStyle:'medium',timeStyle:'short'}:{day:'numeric',month:'short',year:'numeric'}).format(new Date(value));}
  catch(_){return new Date(value).toISOString().slice(0,10);}
 }
 function dateLine(r,precise=false){
  const label=r.kind==='note'?'Written':'Saved',parts=[];
  if(r.dateSource==='legacy-unknown'||!r.created)parts.push('Previously saved · original date unknown');
  else if(r.dateSource==='recorded')parts.push(label+' '+dateDisplay(r.created,precise));
  else parts.push('Recorded '+dateDisplay(r.created,precise)+(precise?' · original date unverified':''));
  if(r.kind==='note'&&r.modified)parts.push('Edited '+dateDisplay(r.modified,precise));
  if(r.deleted)parts.push('Moved to Bin '+dateDisplay(r.deleted,precise));
  return parts.join(' · ');
 }
 function typeOf(r){
  const kind=r.target?.kind||r.kind;
  return kind==='footnote'?'booknotes':['quote','paragraph','section'].includes(kind)?'text':kind==='application'?'bidaya':kind==='lesson'?'lessons':kind==='dictionary'?'dictionary':kind==='index'?'index':kind==='note'?'mine':'other';
 }
 function sourceKey(t){
  if(!t)return 'unattached';
  if(['quote','paragraph'].includes(t.kind))return 'paragraph:'+t.section+':'+t.segment;
  if(t.kind==='section')return 'section:'+t.section;
  if(t.kind==='footnote')return 'booknote:'+t.noteId;
  return [t.kind,t.term||t.app||t.lesson||'',t.level||''].join(':');
 }
 function numberOf(value){const n=Number(value);return Number.isFinite(n)?n:999999;}
 function sourceSort(a,b){
  const x=a.target||{},y=b.target||{};
  const rank=t=>['section','paragraph','quote','footnote'].includes(t.kind)?0:t.kind==='dictionary'?1:t.kind==='index'?2:t.kind==='application'?3:t.kind==='lesson'?4:5;
  const delta=rank(x)-rank(y);if(delta)return delta;
  if(rank(x)===0){
   const sectionOrder=numberOf(x.section)-numberOf(y.section);if(sectionOrder)return sectionOrder;
   const segmentOrder=(x.segment==null?-1:numberOf(x.segment))-(y.segment==null?-1:numberOf(y.segment));if(segmentOrder)return segmentOrder;
   const offsetOrder=(x.offset||0)-(y.offset||0);if(offsetOrder)return offsetOrder;
  }
  if(rank(x)===4){const aLesson=String(x.lesson||'').localeCompare(String(y.lesson||''),undefined,{numeric:true});if(aLesson)return aLesson;const levels={basic:0,intermediate:1,advanced:2};return (levels[x.level]||0)-(levels[y.level]||0);}
  const name=(titleOf(x)||'').localeCompare(titleOf(y)||'',undefined,{sensitivity:'base',numeric:true});
  return name||(a.created||a.updated)-(b.created||b.updated)||a.id.localeCompare(b.id);
 }
 function sortItems(items,sort){
  return items.slice().sort((a,b)=>{
   if(sort==='source')return sourceSort(a,b);
   if(sort==='alpha')return (a.title||titleOf(a.target)).localeCompare(b.title||titleOf(b.target),undefined,{numeric:true,sensitivity:'base'})||sourceSort(a,b);
   if(sort==='modified-desc')return (b.modified||b.updated)-(a.modified||a.updated)||sourceSort(a,b);
   const av=a.created||a.updated,bv=b.created||b.updated;
   return sort==='created-asc'?av-bv||sourceSort(a,b):bv-av||sourceSort(a,b);
  });
 }
 function upsert(kind,target,body='',title=''){
  const now=Date.now();
  if(records.length>2999){ctx.notify('Reading Desk is full; export and remove unused entries before adding more.');return null;}
  if(kind!=='note'){
   const existing=records.find(x=>x.kind===kind&&keyOf(x.target)===keyOf(target));
   if(existing){if(existing.deleted){existing.deleted=0;existing.updated=now;persist();ctx.notify('Restored to Reading Desk.');}else ctx.notify('Already in Reading Desk.');return existing;}
  }
  const row=sanitize({id:uuid(),kind,target,title,body,created:now,updated:now,modified:0,dateSource:'recorded',deleted:0,standalone:kind==='note'&&!target});
  if(!row)return null;
  records.unshift(row);persist();ctx.notify(kind==='note'?'Personal note added to Reading Desk.':'Bookmarked in Reading Desk.');
  if(state.route==='bookmarks')render();
  if(state.route==='reader')afterReader();
  return row;
 }
 function toggleSection(n){
  n=String(n);const row=records.find(r=>r.kind==='section'&&!r.deleted&&r.target?.section===n);
  if(row)trash(row.id);else upsert('section',{kind:'section',section:n});
  ctx.syncChrome();
  if(state.route==='bookmarks')render();
 }
 function moveMany(ids,restore=false){
  const now=Date.now();let count=0;
  for(const id of ids){const r=records.find(x=>x.id===id);if(!r)continue;
   if(restore&&!r.deleted||!restore&&r.deleted)continue;
   r.deleted=restore?0:now;r.updated=now;count++;
  }
  if(count){persist();syncLegacy(true);if(state.route==='reader')afterReader();if(state.route==='bookmarks')render();}
  return count;
 }
 function trash(id){if(moveMany([id])){lastUndo=id;showUndo();}}
 function showUndo(){
  let toast=$('#gn-rd-undo');if(!toast){toast=document.createElement('div');toast.id='gn-rd-undo';toast.className='gn-rd-undo';toast.setAttribute('role','status');document.body.append(toast);}
  toast.innerHTML='Moved to Bin <button type="button" data-rd="undo">Undo</button>';
  toast.hidden=false;clearTimeout(showUndo.timer);showUndo.timer=setTimeout(()=>{if(toast)toast.hidden=true;},7000);
 }
 function sourceText(t,lang){
  if(!t||!['quote','paragraph','section'].includes(t.kind))return '';
  const sec=section(t.section);if(!sec)return '';
  if(t.kind==='section')return sec.segments.map(seg=>lang==='ar'?(seg.vocalized||seg.ar):seg.en).join('\n\n');
  const segment=sec.segments[t.segment];
  if(!segment)return '';
  return lang==='ar'?(segment.vocalized||segment.ar):segment.en;
 }
 function contextMarkup(t,lang,expanded){
  const raw=sourceText(t,lang);if(!raw)return '';
  const dir=lang==='ar'?' lang="ar" dir="rtl"':' lang="en"';
  const selected=t.kind==='quote'&&t.lang===lang?t.quote:'';
  if(!selected)return '<p class="gn-rd-context"'+dir+'>'+esc(expanded?raw:short(raw,380))+'</p>';
  const folded=clean(raw),needle=clean(selected);
  let at=folded.indexOf(needle);
  // Preserve exact displayed character boundaries when changing vowel display.
  function rawAt(pos){let used=0;for(let i=0;i<raw.length;i++){
    if(/[\u064b-\u065f\u0670\u0640\u06d6-\u06ed]/.test(raw[i]))continue;
    if(used++===pos)return i;
   }return raw.length;}
  if(at>=0){
   const aa=rawAt(at),bb=rawAt(at+needle.length);
   const start=expanded?0:Math.max(0,aa-145),end=expanded?raw.length:Math.min(raw.length,bb+145);
   return '<p class="gn-rd-context"'+dir+'>'+(start?'… ':'')+esc(raw.slice(start,aa))+'<mark>'+esc(raw.slice(aa,bb))+'</mark>'+esc(raw.slice(bb,end))+(end<raw.length?' …':'')+'</p>';
  }
  return '<p class="gn-rd-context"'+dir+'>'+esc(expanded?raw:short(raw,380))+'</p><p class="gn-rd-archived">Original selection: <q>'+esc(selected)+'</q></p>';
 }
 function detailsFor(r){
  const t=r.kind==='note'?r.target:r.target,expanded=ui.expanded;
  if(r.kind==='note'&&r.standalone)return '<p class="gn-rd-muted">Free-standing personal note</p><div class="gn-rd-personal-body">'+esc(r.body)+'</div>';
  let html='<p class="gn-rd-source-label">'+esc(subOf(t))+'</p>';
  if(t&&['section','paragraph','quote'].includes(t.kind)){
   html+='<div class="gn-rd-language-tabs" role="group" aria-label="Context language">'+['both','ar','en'].map(v=>'<button type="button" data-rd="language" data-value="'+v+'" aria-pressed="'+(ui.context===v)+'">'+({both:'Both',ar:'Arabic',en:'English'}[v])+'</button>').join('')+'</div>';
   if(t.kind==='quote')html+='<p class="gn-rd-quote-original">'+esc(t.quote)+'</p>';
   const langs=ui.context==='both'?['ar','en']:[ui.context];
   html+='<div class="gn-rd-bilingual">'+langs.map(lang=>'<div class="gn-rd-language-block"><small>'+(lang==='ar'?'Arabic':'English')+(t.kind==='quote'&&lang!==t.lang?' · corresponding passage':'')+'</small>'+contextMarkup(t,lang,expanded)+'</div>').join('')+'</div>';
   html+='<button type="button" class="gn-rd-text-button" data-rd="expand">'+(expanded?'Show shorter context':t.kind==='section'?'Show full section':'Show full paragraph')+'</button>';
  }else if(t?.kind==='footnote'){
   const note=ctx.notes.get(t.noteId);
   html+='<div class="gn-rd-personal-body">'+esc(note?.text||'')+'</div>';
  }else if(t?.kind==='dictionary'){
   const g=book.glossary.find(x=>x.term===t.term);
   html+='<p class="gn-rd-context" lang="ar" dir="rtl">'+esc(g?.ar||'')+'</p><p>'+esc(g?.definition||'Historical dictionary entry')+'</p>';
  }else if(t?.kind==='index'){
   const g=book.index.find(x=>x.term===t.term);
   html+='<p>'+esc(g?.term||t.term)+'</p>'+(t.sub?'<p>'+esc(t.sub)+'</p>':'');
  }else if(t?.kind==='application'){
   const a=ctx.apps.get(t.app);
   html+='<p>'+esc(a?.text||'')+'</p><p class="gn-rd-muted">'+esc(a?.locator||'')+'</p>';
  }else if(t?.kind==='lesson'){
   const l=window.DARURI_STUDY_DATA?.lessons?.find(x=>x.id===t.lesson);
   html+='<p>'+esc(l?.summary||'')+'</p><p class="gn-rd-muted">'+esc(t.level)+'</p>';
  }
  if(r.kind==='note')html+='<div class="gn-rd-personal-body"><h3>Your note</h3><p>'+esc(r.body).replace(/\n/g,'<br>')+'</p></div>';
  return html;
 }
 function grouped(r){return category(r)==='text'?'Text':LABELS[category(r)]||'Reference';}
 function matching(){
  const q=norm(ui.query).toLocaleLowerCase(),bin=ui.category==='bin';
  const rows=records.filter(r=>Boolean(r.deleted)===bin&&
   (!ui.filterTarget||r.target?.section===ui.filterTarget)&&
   (ui.filterSegment===null||r.target?.segment===ui.filterSegment)&&
   (bin||ui.category==='all'||ui.category==='mine'&&r.kind==='note'||ui.category==='bookmarks'&&r.kind!=='note')&&
   (bin||ui.sourceType==='all'||typeOf(r)===ui.sourceType)&&
   (!q||norm([r.title,titleOf(r.target),r.body,r.target?.quote,r.target?.term,r.target?.app,subOf(r.target)].join(' ')).toLocaleLowerCase().includes(q)));
  return bin?rows.sort((a,b)=>b.deleted-a.deleted):sortItems(rows,ui.sort==='created-desc'&&ui.filterTarget?'source':ui.sort);
 }
 function render(){
  const main=$('#mainContent');if(!main)return;
  const visible=matching(),selected=records.find(r=>r.id===ui.selected);
  const bin=ui.category==='bin';
  const tabs=CATEGORIES.map(k=>'<button type="button" data-rd="filter" data-value="'+k+'" aria-pressed="'+(ui.category===k)+'">'+LABELS[k]+'</button>').join('');
  let html='<section class="gn-rd-page"><header class="gn-rd-hero"><p class="gn-rd-kicker">YOUR PRIVATE READING COLLECTION</p><h1>Reading Desk</h1><p>Keep precise quotations, complete passages, book notes, dictionary terms, index topics, Bidāya applications and study lessons together. Your work stays in this browser until you transfer a backup.</p></header>';
  if(!available)html+='<p class="gn-rd-warning" role="alert">Browser storage is unavailable or full. Export a backup before leaving this page.</p>';
  html+='<div class="gn-rd-toolbar" role="group" aria-label="Reading Desk actions"><div class="gn-rd-toolbar-main"><button type="button" data-rd="new-note">+ New note</button><button type="button" data-rd="export">Download backup</button><button type="button" data-rd="share-backup">Share backup…</button><button type="button" data-rd="import">Import</button></div><div class="gn-rd-toolbar-utilities"><button type="button" data-rd="print-list">Print visible items</button><button type="button" data-rd="filter" data-value="bin" class="gn-rd-bin" aria-pressed="'+bin+'">Bin ('+records.filter(x=>x.deleted).length+')</button></div><input class="gn-rd-file" type="file" id="gn-rd-file" accept="application/json,.json" aria-label="Select Reading Desk backup file" hidden></div>';
  if(ui.filterTarget)html+='<p class="gn-rd-scoped">Items from '+esc(ctx.sectionRef(ui.filterTarget))+' <button data-rd="unscoped" type="button">Show all</button></p>';
  html+='<div class="gn-rd-tabs" role="group" aria-label="Reading Desk categories">'+tabs+'</div><label class="gn-rd-search">Search Reading Desk <input id="gn-rd-query" type="search" autocomplete="off" placeholder="Search text, terms, notes…" value="'+esc(ui.query)+'"></label>';
  html+='<p class="gn-rd-count" aria-live="polite">'+visible.length+' '+(bin?'items in Bin':'saved items')+'</p>';
  html+='<div class="gn-rd-layout"><div class="gn-rd-cards">';
  html+=visible.map(r=>'<article class="gn-rd-card'+(r.id===ui.selected?' gn-rd-selected':'')+'"><button type="button" class="gn-rd-card-open" data-rd="select" data-id="'+esc(r.id)+'"><small>'+esc(r.kind==='note'?'Personal note':r.kind==='footnote'?'Book note':grouped(r))+' · '+esc(subOf(r.target))+'</small><strong>'+esc(r.title||titleOf(r.target))+'</strong>'+(r.kind==='note'?'<span>'+esc(short(r.body,135))+'</span>':'')+'</button><div class="gn-rd-card-ops">'+(bin?'<button type="button" data-rd="restore" data-id="'+esc(r.id)+'">Restore</button>':'<button type="button" data-rd="open" data-id="'+esc(r.id)+'">Open source</button>')+'<button type="button" data-rd="'+(bin?'delete-permanent':'trash')+'" data-id="'+esc(r.id)+'">'+(bin?'Delete permanently':'Move to Bin')+'</button></div></article>').join('');
  if(!visible.length)html+='<p class="gn-rd-empty">'+(bin?'Bin is empty.':ui.query?'No items match the search.':'Nothing saved here yet. Select words in the text or bookmark an entry to begin.')+'</p>';
  html+='</div><div class="gn-rd-detail" id="gn-rd-detail">';
  if(selected&&visible.some(r=>r.id===selected.id)){
   html+='<header><small>'+esc(selected.kind==='note'?'PERSONAL NOTE':grouped(selected).toUpperCase())+'</small><h2>'+esc(selected.title||titleOf(selected.target))+'</h2></header>'+detailsFor(selected);
   html+='<div class="gn-rd-detail-actions">'+(bin?'<button type="button" data-rd="restore" data-id="'+esc(selected.id)+'">Restore</button>':'<button type="button" data-rd="open" data-id="'+esc(selected.id)+'">Open source</button><button type="button" data-rd="add-note" data-id="'+esc(selected.id)+'">Add note</button>')+(selected.kind==='note'&&!bin?'<button type="button" data-rd="edit" data-id="'+esc(selected.id)+'">Edit note</button>':'')+'<button type="button" data-rd="share" data-id="'+esc(selected.id)+'">Share</button><button type="button" data-rd="email" data-id="'+esc(selected.id)+'">Email</button><button type="button" data-rd="print" data-id="'+esc(selected.id)+'">Print</button></div>';
  }else html+='<div class="gn-rd-detail-placeholder"><h2>Choose an item</h2><p>Select a bookmark or personal note to see its source, bilingual context and available actions.</p></div>';
  html+='</div></div>';
  if(bin&&visible.length)html+='<div class="gn-rd-bin-actions"><button type="button" data-rd="restore-all">Restore all</button><button type="button" data-rd="empty-bin">Empty Bin…</button></div>';
  html+='<p class="gn-rd-privacy">Local to this browser. Use Download backup or Share backup to transfer your Reading Desk to another device. Import merges items without deleting newer notes.</p></section>';
  main.innerHTML=html;
  return html;
 }
 function showEditor(target,existing){
  editor=existing||null;const t=target||existing?.target||null;
  const shade=document.createElement('div');shade.className='gn-rd-editor-shade';shade.id='gn-rd-editor-shade';
  shade.innerHTML='<section class="gn-rd-editor" role="dialog" aria-modal="true" aria-labelledby="gn-rd-editor-title" tabindex="-1"><header><h2 id="gn-rd-editor-title">'+(existing?'Edit personal note':'Add personal note')+'</h2><button type="button" data-rd="close-editor" aria-label="Close editor">×</button></header><p class="gn-rd-source-label">'+esc(subOf(t))+'</p>'+(t?'<blockquote>'+esc(short(titleOf(t),350))+'</blockquote>':'')+'<label>Title <small>(optional)</small><input id="gn-rd-note-title" maxlength="240" placeholder="Give this thought a short title" value="'+esc(existing?.title||'')+'"></label><label>Your note<textarea id="gn-rd-note-body" rows="7" maxlength="30000" placeholder="Write your observation, question or comparison…" dir="auto">'+esc(existing?.body||'')+'</textarea></label><footer><button type="button" data-rd="close-editor">Cancel</button><button type="button" class="gn-rd-primary" data-rd="save-note">Save note</button></footer></section>';
  returnFocus=document.activeElement;document.body.append(shade);document.body.classList.add('gn-rd-editor-open');
  shade.dataset.target=JSON.stringify(t);$('#gn-rd-note-body').focus({preventScroll:true});
 }
 function closeEditor(){
  const node=$('#gn-rd-editor-shade');node?.remove();document.body.classList.remove('gn-rd-editor-open');const focus=returnFocus;returnFocus=null;editor=null;if(focus?.isConnected)focus.focus({preventScroll:true});
 }
 function saveEditor(){
  const body=clamp($('#gn-rd-note-body')?.value,30000).trim();
  if(!body){$('#gn-rd-note-body')?.focus();ctx.notify('Write a note before saving.');return;}
  const title=clamp($('#gn-rd-note-title')?.value,240).trim()||short(body.split('\n').find(Boolean)||'Personal note',85);
  const target=JSON.parse($('#gn-rd-editor-shade')?.dataset.target||'null');
  if(editor){editor.title=title;editor.body=body;editor.updated=Date.now();persist();ctx.notify('Personal note updated.');}
  else upsert('note',target,body,title);
  closeEditor();if(state.route==='bookmarks'){ui.category='notes';render();}else if(state.route==='reader')afterReader();
 }
 function targetForSelection(){
  const sel=window.getSelection?.();if(!sel||sel.isCollapsed||!sel.rangeCount)return null;
  const range=sel.getRangeAt(0),start=range.startContainer.nodeType===1?range.startContainer:range.startContainer.parentElement;
  const end=range.endContainer.nodeType===1?range.endContainer:range.endContainer.parentElement;
  const side=start?.closest?.('.passage-ar,.passage-en'),last=end?.closest?.('.passage-ar,.passage-en');
  if(!side||side!==last)return null;
  const grid=side.closest('.passage-grid');
  if(!grid||!$('#reader')?.contains(grid))return null;
  const nodes=collectNodes(side);
  const flat=nodes.map(n=>n.textContent).join('');
  function countTo(node,offset){
   try{const r=document.createRange();r.setStart(side,0);r.setEnd(node,offset);const fragment=r.cloneContents();fragment.querySelectorAll('sup,.gn-rd-passage-tools').forEach(x=>x.remove());return fragment.textContent.length;}
   catch(_){return 0;}
  }
  const a=countTo(range.startContainer,range.startOffset),b=countTo(range.endContainer,range.endOffset);
  let quote=flat.slice(a,b).trim();if(!quote||quote.length>5000)return null;
  const i=flat.indexOf(quote,Math.max(0,a-3)),at=i<0?Math.max(0,a):i;
  return {kind:'quote',section:String(grid.closest('[data-reading-section]')?.dataset.readingSection||state.n),segment:Number(grid.dataset.segment),lang:side.classList.contains('passage-ar')?'ar':'en',
    quote,prefix:flat.slice(Math.max(0,at-85),at),suffix:flat.slice(at+quote.length,at+quote.length+85),offset:at};
 }
 function collectNodes(container){
  const w=document.createTreeWalker(container,NodeFilter.SHOW_TEXT),out=[];
  while(w.nextNode()){const n=w.currentNode;if(!n.textContent||n.parentElement?.closest('sup,.gn-rd-passage-tools,[aria-hidden="true"]'))continue;out.push(n);}
  return out;
 }
 function probe(){
  if($('#gn-rd-editor-shade')||state.route!=='reader'){hideSelection();return;}
  const next=targetForSelection();
  if(!next||document.querySelector('.overlay:not([hidden]),#gn-scholar-layer')){hideSelection();return;}
  selection=next;
  let bar=$('#gn-rd-selection-bar');
  if(!bar){bar=document.createElement('div');bar.id='gn-rd-selection-bar';bar.className='gn-rd-selection-bar';bar.setAttribute('role','toolbar');bar.setAttribute('aria-label','Save selected text');document.body.append(bar);}
  bar.hidden=false;bar.innerHTML='<span>'+esc(short(next.quote,72))+'</span><button type="button" data-rd="selection-bookmark">Bookmark</button><button type="button" data-rd="selection-note">Add note</button><button type="button" data-rd="selection-dismiss" aria-label="Dismiss selection tools">×</button>';
 }
 function hideSelection(){const bar=$('#gn-rd-selection-bar');if(bar)bar.hidden=true;}
 function scheduleProbe(){clearTimeout(probeTimer);probeTimer=setTimeout(probe,200);}
 function decorate(){
  if(decorating)return;decorating=true;
  try{
   if(state.route==='applications'){
    $('#mainContent')?.querySelectorAll('[data-gn-application]').forEach(el=>{
     if(el.dataset.rdDecorated)return;el.dataset.rdDecorated='1';const app=el.dataset.gnApplication;
     const wrap=actions({kind:'application',app},true);el.append(wrap);
    });
   }
   if(state.route==='glossary'){
    $('#mainContent')?.querySelectorAll('.glossary-card').forEach(el=>{
     if(el.dataset.rdDecorated)return;el.dataset.rdDecorated='1';const term=el.querySelector('h2')?.textContent?.trim();
     if(term&&book.glossary.some(g=>g.term===term))el.append(actions({kind:'dictionary',term},true));
    });
   }
   if(state.route==='index'){
    $('#mainContent')?.querySelectorAll('.index-record').forEach(el=>{
     if(el.dataset.rdDecorated)return;const text=el.querySelector('summary')?.textContent?.trim()||'';
     const term=book.index.find(g=>g.term===(el.querySelector('summary')?.firstChild?.textContent?.trim()||''));if(!term)return;
     el.dataset.rdDecorated='1';el.querySelector('summary')?.insertAdjacentElement('afterend',actions({kind:'index',term:term.term},true));
    });
   }
   if(state.route==='study'){
    const el=$('#mainContent .sg-lesson .sg-hero');if(el&&!el.dataset.rdDecorated){
     const match=location.hash.match(/topic=([^&]+)/),lvl=location.hash.match(/level=([^&]+)/),id=match?decodeURIComponent(match[1]):'';
     if(id&&window.DARURI_STUDY_DATA?.lessons?.some(l=>l.id===id)){el.dataset.rdDecorated='1';el.append(actions({kind:'lesson',lesson:id,level:lvl?lvl[1]:'basic'},true));}
    }
   }
   const dialog=$('#detailContent');
   if(dialog&&!$('#infoOverlay')?.hidden){
    const app=dialog.querySelector('[data-gn-application]');
    if(app&&!app.dataset.rdDecorated){app.dataset.rdDecorated='1';app.append(actions({kind:'application',app:app.dataset.gnApplication},true));}
    const note=dialog.querySelector('[data-note-in-section]')?.dataset.noteInSection;
    if(note&&!dialog.dataset.rdNoteId){dialog.dataset.rdNoteId=note;const n=ctx.notes.get(note);if(n)dialog.append(actions({kind:'footnote',section:String(n.n),noteId:note},true));}
    const eyebrow=$('#detailEyebrow')?.textContent||'';
    const term=dialog.querySelector('#detailTitle')?.textContent?.trim();
    if(eyebrow.includes('DICTIONARY ENTRY')&&term&&!dialog.dataset.rdTerm){dialog.dataset.rdTerm=term;dialog.append(actions({kind:'dictionary',term},true));}
   }else if(dialog){delete dialog.dataset.rdNoteId;delete dialog.dataset.rdTerm;}
   $('#gn-scholar-layer')?.querySelectorAll('[data-note-id]').forEach(el=>{
    if(el.dataset.rdDecorated)return;const note=ctx.notes.get(el.dataset.noteId);if(!note)return;
    el.dataset.rdDecorated='1';el.append(actions({kind:'footnote',section:String(note.n||state.n),noteId:note.id},true));
   });
  }finally{decorating=false;}
 }
 function actions(target,compact){
  const row=document.createElement('div');row.className='gn-rd-attach-actions'+(compact?' gn-rd-compact':'');
  const serialized=encodeURIComponent(JSON.stringify(target));
  row.innerHTML='<button type="button" data-rd="attach-bookmark" data-target="'+esc(serialized)+'">◇ Bookmark</button><button type="button" data-rd="attach-note" data-target="'+esc(serialized)+'">+ Add note</button>';
  return row;
 }
 function afterReader(){
  if(state.route!=='reader')return;
  const reader=$('#reader');if(!reader)return;
  if(state.focusMode||state.focusLevel===3||!state.showNotes){reader.querySelectorAll('.gn-rd-passage-tools,.gn-rd-section-tools').forEach(x=>x.remove());markReader();decorate();return;}
  const header=reader.querySelector(':scope > .reader-heading');
  if(header){
    const n=String(state.n),count=active().filter(x=>x.target?.section===n).length;
    let tools=header.nextElementSibling;
    if(!tools?.classList.contains('gn-rd-section-tools')){tools=document.createElement('div');tools.className='gn-rd-section-tools';header.after(tools);}
    tools.innerHTML='<button type="button" data-rd="section-note">+ Personal note</button>'+(count?'<button type="button" data-rd="view-section">Reading Desk · '+count+' saved here</button>':'');
  }
  let sectionsCount=0;
  reader.querySelectorAll('.passage-grid').forEach(grid=>{
   const segment=Number(grid.dataset.segment),n=String(grid.closest('[data-reading-section]')?.dataset.readingSection||state.n);
   const relevant=active().filter(r=>{const t=r.target;return t&&t.section===n&&t.segment===segment;});
   const bookmarks=relevant.filter(r=>r.kind!=='note').length,notesCount=relevant.filter(r=>r.kind==='note').length;
   let tools=grid.nextElementSibling;
   if(!tools?.classList.contains('gn-rd-passage-tools')){
    tools=document.createElement('div');tools.className='gn-rd-passage-tools';grid.after(tools);
   }
   tools.innerHTML=(bookmarks||notesCount?'<button type="button" data-rd="view-paragraph" data-segment="'+segment+'">'+(bookmarks?'◇ '+bookmarks+' bookmarked':'')+(bookmarks&&notesCount?' · ':'')+(notesCount?'✎ '+notesCount+' personal '+(notesCount===1?'note':'notes'):'')+'</button>':'')+'<button type="button" data-rd="paragraph-menu" data-segment="'+segment+'">Paragraph '+(segment+1)+' · Bookmark / Note</button>';
   sectionsCount+=relevant.length;
  });
  markReader();
  decorate();
 }
 function findRange(side,target){
  const nodes=collectNodes(side),raw=nodes.map(n=>n.textContent).join('');
  const folded=clean(raw),needle=clean(target.quote||'');if(!needle)return null;
  const places=[];let p=0;
  while((p=folded.indexOf(needle,p))>=0&&places.length<100){places.push(p);p+=Math.max(1,needle.length);}
  if(!places.length)return null;
  function score(p){let score=0;const before=clean(target.prefix||'').slice(-50),after=clean(target.suffix||'').slice(0,50);
   if(before&&folded.slice(Math.max(0,p-before.length),p).endsWith(before))score+=200;
   if(after&&folded.slice(p+needle.length,p+needle.length+after.length).startsWith(after))score+=200;
   score-=Math.abs(p-(target.offset||0))/Math.max(10,folded.length);return score;
  }
  places.sort((a,b)=>score(b)-score(a));
  const first=places[0];
  if(places.length>1&&score(first)<100&&Math.abs(score(first)-score(places[1]))<.05)return null;
  function rawOffset(pos){if(folded===raw)return pos;let seen=0;for(let i=0;i<raw.length;i++){if(/[\u064b-\u065f\u0670\u0640\u06d6-\u06ed]/.test(raw[i]))continue;if(seen++===pos)return i;}return raw.length;}
  const a=rawOffset(first),b=rawOffset(first+needle.length);
  function point(pos){let count=0;for(const n of nodes){const end=count+n.textContent.length;if(pos<=end)return {node:n,offset:Math.max(0,pos-count)};count=end;}return nodes.length?{node:nodes.at(-1),offset:nodes.at(-1).length}:null;}
  const start=point(a),end=point(b);if(!start||!end)return null;
  const range=document.createRange();try{range.setStart(start.node,start.offset);range.setEnd(end.node,end.offset);}catch(_){return null;}
  return range;
 }
 function markReader(){
  if(!window.CSS?.highlights||typeof Highlight==='undefined')return;
  ['gn-rd-bookmark','gn-rd-note','gn-rd-target'].forEach(k=>CSS.highlights.delete(k));
  if(state.focusMode||!state.showNotes)return;
  const marks=[],annotations=[];
  for(const item of active()){
   const t=item.target;if(!t||t.kind!=='quote'||t.section!==String(state.n))continue;
   const root=$('#gn-continuous-'+CSS.escape(String(t.section)))||$('#reader');
   const side=root?.querySelector('.passage-grid[data-segment="'+t.segment+'"] .passage-'+(t.lang==='ar'?'ar':'en'));
   if(!side)continue;const range=findRange(side,t);if(range)(item.kind==='note'?annotations:marks).push(range);
  }
  if(marks.length)CSS.highlights.set('gn-rd-bookmark',new Highlight(...marks));
  if(annotations.length)CSS.highlights.set('gn-rd-note',new Highlight(...annotations));
 }
 function openSource(r){
  const t=r.kind==='note'?r.target:r.target;if(!t){ctx.notify('This note has no attached source.');return;}
  const existing=$('#mainContent .gn-rd-page');ui.listScroll=window.scrollY||0;
  if(existing)origin={id:r.id,created:Date.now()};
  if(['quote','paragraph','section','footnote'].includes(t.kind)){
   ctx.goSection(t.section);
   requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const readingRoot=$('#gn-continuous-'+CSS.escape(String(t.section)))||$('#reader');
    const grid=readingRoot?.querySelector('.passage-grid[data-segment="'+(t.segment||0)+'"]');
    const note=t.kind==='footnote'?ctx.notes.get(t.noteId):null;
    if(note){ctx.jumpToNote(t.noteId);return;}
    if(t.kind==='quote'){
     const side=grid?.querySelector('.passage-'+(t.lang==='ar'?'ar':'en'));
     const range=side?findRange(side,t):null;
     if(range){try{const rect=range.getBoundingClientRect();window.scrollBy({top:rect.top-Math.min(innerHeight*.36,240),behavior:'instant'});}catch(_){}if(window.CSS?.highlights&&typeof Highlight!=='undefined')CSS.highlights.set('gn-rd-target',new Highlight(range));}
     else ctx.notify('Exact wording not located; opened its containing paragraph.');
    }else (grid||$('#reader'))?.scrollIntoView({block:'center',behavior:'instant'});
   }));
  }else if(t.kind==='dictionary'){
   if(t.historical){
    try{sessionStorage.setItem('gnamma-reading-desk-dictionary-return',JSON.stringify({id:r.id,created:Date.now()}));}catch(_){}
    location.href='dictionary.html#view=all&term='+encodeURIComponent(t.term);return;
   }
   ctx.state.glossaryQuery=t.term;ctx.navigate('glossary');
   requestAnimationFrame(()=>{ctx.showTermDetail(t.term);decorate();});
  }else if(t.kind==='application'){
   ctx.navigate('applications');requestAnimationFrame(()=>{ctx.showAppDetail(t.app);decorate();});
  }else if(t.kind==='index'){
   ctx.state.indexQuery=t.term;ctx.state.indexLimit=302;ctx.navigate('index');
  }else if(t.kind==='lesson'){
   location.hash='#study?topic='+encodeURIComponent(t.lesson)+'&level='+encodeURIComponent(t.level);
  }
 }
 function afterRender(route){
  if(route==='bookmarks'){
   if(ui.listScroll)requestAnimationFrame(()=>requestAnimationFrame(()=>window.scrollTo({top:ui.listScroll,behavior:'instant'})));
  }
  if(route==='reader')afterReader();else decorate();
  if(route==='glossary'&&pendingIntent){
   const intent=pendingIntent;pendingIntent=null;
   const target=validateTarget(intent.target);
   if(target&&intent.action==='note')requestAnimationFrame(()=>showEditor(target));
  }
  document.body.classList.toggle('gn-rd-returning',!!origin&&route!=='bookmarks');
  if(origin&&route!=='bookmarks'){
   const main=$('#mainContent');if(main&&!main.querySelector('.gn-rd-return')){
    const bar=document.createElement('nav');bar.className='gn-rd-return';bar.setAttribute('aria-label','Return to Reading Desk');
    bar.innerHTML='<button type="button" data-rd="return">← Back to Reading Desk</button><button type="button" data-rd="dismiss-return" aria-label="Dismiss Reading Desk return">×</button>';
    main.prepend(bar);
   }
  }
 }
 function toDesk(){
  ui.selected=origin?.id||ui.selected;const y=ui.listScroll;origin=null;
  document.body.classList.remove('gn-rd-returning');ctx.navigate('bookmarks');
  requestAnimationFrame(()=>requestAnimationFrame(()=>{if(state.route==='bookmarks')window.scrollTo({top:y,behavior:'instant'});}));
 }
 function textForShare(r){
  const t=r.target||null;let txt=(r.title||titleOf(t))+'\n'+subOf(t);
  if(t?.quote)txt+='\n\n“'+t.quote+'”';
  if(r.kind==='note')txt+='\n\nMy note:\n'+r.body;
  else if(t?.kind==='dictionary')txt+='\n\n'+(book.glossary.find(x=>x.term===t.term)?.definition||'');
  else if(t?.kind==='application')txt+='\n\n'+(ctx.apps.get(t.app)?.text||'');
  txt+='\n\nSource: '+canonicalURL(t);
  return txt.slice(0,15000);
 }
 function canonicalURL(t){
  const base=new URL('index.html',location.href).href.split('#')[0];
  if(!t)return base+'#bookmarks';
  if(['quote','paragraph','section','footnote'].includes(t.kind))return base+'#section='+encodeURIComponent(t.section);
  if(t.kind==='application')return base+'#application='+encodeURIComponent(t.app);
  if(t.kind==='lesson')return base+'#study?topic='+encodeURIComponent(t.lesson)+'&level='+encodeURIComponent(t.level);
  if(t.kind==='dictionary')return t.historical?new URL('dictionary.html',location.href).href.split('#')[0]+'#view=all&term='+encodeURIComponent(t.term):base+'#glossary';
  if(t.kind==='index')return base+'#index';
  return base+'#bookmarks';
 }
 async function shareItem(r,email=false){
  const value=textForShare(r);
  if(email){location.href='mailto:?subject='+encodeURIComponent('Reading Desk · '+(r.title||titleOf(r.target)).slice(0,80))+'&body='+encodeURIComponent(value.slice(0,7000));return;}
  if(navigator.share){try{await navigator.share({title:r.title||titleOf(r.target),text:value,url:canonicalURL(r.target)});return;}catch(e){if(e.name==='AbortError')return;}}
  try{await navigator.clipboard.writeText(value);ctx.notify('Text and source link copied for sharing.');}catch(e){ctx.notify('Sharing unavailable. Use Email or Print.');}
 }
 function backup(){return JSON.stringify({format:FORMAT,version:VERSION,exported:new Date().toISOString(),items:records},null,2);}
 function download(text,name){
  const blob=new Blob([text],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=name;a.style.display='none';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
 }
 async function shareBackup(){
  const fileName='Reading-Desk-'+new Date().toISOString().slice(0,10)+'.json',data=backup();
  if(typeof File!=='undefined'&&navigator.share){
   const file=new File([data],fileName,{type:'application/json'});
   if(!navigator.canShare||navigator.canShare({files:[file]})){
    try{await navigator.share({files:[file],title:'Reading Desk backup',text:'Private Reading Desk data — import into Darūrī.'});return;}
    catch(e){if(e?.name==='AbortError')return;}
   }
  }
  download(data,fileName);ctx.notify('Backup downloaded. Share the file with Mail or Files.');
 }
 function importFile(file){
  if(!file)return;
  if(file.size>5*1024*1024){ctx.notify('Backup is too large (maximum 5 MB).');return;}
  const reader=new FileReader();
  reader.onload=()=>{
   try{
    const parsed=JSON.parse(reader.result);
    if(parsed?.format!==FORMAT||parsed.version!==VERSION||!Array.isArray(parsed.items))throw Error('not a Reading Desk backup');
    if(parsed.items.length>3000)throw Error('too many items');
    const incoming=parsed.items.map(sanitize).filter(Boolean);if(parsed.items.length&&!incoming.length)throw Error('No valid entries found');
    const merged=records.slice(),byId=new Map(merged.map(r=>[r.id,r])),now=Date.now();let changes=0;
    for(const row of incoming){
     const prior=byId.get(row.id);
     if(!prior){merged.push(row);byId.set(row.id,row);changes++;continue;}
     if(row.updated>prior.updated){const i=merged.indexOf(prior);merged[i]=row;byId.set(row.id,row);changes++;}
     else if(row.updated===prior.updated&&JSON.stringify(row)!==JSON.stringify(prior)){
      const copy={...row,id:uuid(),title:(row.title||titleOf(row.target))+' · Imported version',updated:now};
      merged.push(copy);changes++;
     }
    }
    if(merged.length>3000)throw Error('too many combined items');
    const before=records;records=merged;if(!persist()){records=before;throw Error('Browser storage unavailable');}ui.category='all';ui.filterTarget='';ui.selected='';render();
    ctx.notify(changes+' items merged. Existing and newer items were kept.');
   }catch(e){ctx.notify('Could not import this Reading Desk backup: '+short(e.message,80));}
  };
  reader.onerror=()=>ctx.notify('Could not read the chosen backup file.');
  reader.readAsText(file);
 }
 function closePrintPreview(){
  if(!printRoot)return;
  const focus=printFocus;printFocus=null;
  printRoot.remove();printRoot=null;
  document.body.classList.remove('gn-rd-print');
  if(focus?.isConnected)focus.focus({preventScroll:true});
 }
 function preparePrint(selected){
  const all=(selected||matching()).filter(Boolean);
  if(!all.length){ctx.notify('Nothing to print in this view.');return;}
  // Keep the print content present until explicitly dismissed. On some mobile
  // browsers afterprint is raised as soon as the preview opens.
  closePrintPreview();
  printFocus=document.activeElement;
  printRoot=document.createElement('div');printRoot.id='gn-rd-print-root';
  printRoot.setAttribute('role','dialog');
  printRoot.setAttribute('aria-modal','true');
  printRoot.setAttribute('aria-label','Reading Desk print preview');
  const single=Boolean(selected),count=all.length;
  const label=single?'1 selected entry':count+' visible '+(count===1?'entry':'entries');
  const verb=single?'Print this item':'Print these '+count+' items';
  printRoot.innerHTML=
   '<div class="gn-rd-print-actions"><div><h2>Print preview · '+label+'</h2>'+
   '<p>Only the '+(single?'selected entry':'items shown in your filtered Reading Desk')+
   ' will be printed.</p></div><div class="gn-rd-print-buttons">'+
   '<button type="button" data-rd="print-now">'+esc(verb)+'</button>'+
   '<button type="button" data-rd="close-print">Close preview</button></div></div>'+
   '<main class="gn-rd-print-sheet"><header><h1>Reading Desk</h1>'+
   '<p>al-Ḍarūrī · '+esc(label)+'</p></header>'+
   all.map(row=>'<article data-rd-print-id="'+esc(row.id)+'"><h2>'+esc(row.title||titleOf(row.target))+
   '</h2><p class="gn-rd-print-label">'+esc(subOf(row.target))+'</p>'+
   detailsForPrint(row)+'<p class="gn-rd-print-url">'+esc(canonicalURL(row.target))+
   '</p></article>').join('')+'</main>';
  document.body.append(printRoot);
  document.body.classList.add('gn-rd-print');
  printRoot.querySelector('[data-rd="print-now"]')?.focus({preventScroll:true});
 } 
  function detailsForPrint(r){
  const t=r.target;if(!t)return '<p>'+esc(r.body)+'</p>';
  let out='';
  if(['quote','paragraph','section'].includes(t.kind)){
   out+='<div lang="ar" dir="rtl">'+esc(sourceText(t,'ar'))+'</div><div lang="en">'+esc(sourceText(t,'en'))+'</div>';
  }else if(t.kind==='footnote'){const n=ctx.notes.get(t.noteId);out+='<p>'+esc(n?.en||n?.text||n?.body||n?.content||t.noteId)+'</p>';}
  else if(t.kind==='dictionary')out+='<p>'+esc(book.glossary.find(g=>g.term===t.term)?.definition||'')+'</p>';
  else if(t.kind==='application')out+='<p>'+esc(ctx.apps.get(t.app)?.text||'')+'</p>';
  else if(t.kind==='lesson')out+='<p>'+esc(window.DARURI_STUDY_DATA?.lessons?.find(l=>l.id===t.lesson)?.summary||'')+'</p>';
  if(t.quote)out+='<p><strong>Selected words:</strong> '+esc(t.quote)+'</p>';
  if(r.kind==='note')out+='<section><h3>My note</h3><p>'+esc(r.body).replace(/\n/g,'<br>')+'</p></section>';
  return out;
 }
 function handle(event){
  const btn=event.target.closest?.('[data-rd]');if(!btn)return;
  event.preventDefault();event.stopImmediatePropagation();
  const id=btn.dataset.id,action=btn.dataset.rd,row=records.find(r=>r.id===id);
  if(action==='filter'){ui.category=btn.dataset.value;ui.selected='';ui.listScroll=0;render();return;}
  if(action==='unscoped'){ui.filterTarget='';ui.category='all';render();return;}
  if(action==='select'){ui.selected=id;ui.context='both';ui.expanded=false;const scroll=window.scrollY;render();
   if(matchMedia('(max-width:760px)').matches)$('#gn-rd-detail')?.scrollIntoView({block:'start',behavior:'instant'});
   else window.scrollTo({top:scroll,behavior:'instant'});return;
  }
  if(action==='language'){ui.context=btn.dataset.value;const scroll=window.scrollY;render();window.scrollTo({top:scroll,behavior:'instant'});return;}
  if(action==='expand'){ui.expanded=!ui.expanded;const scroll=window.scrollY;render();window.scrollTo({top:scroll,behavior:'instant'});return;}
  if(action==='selection-dismiss'){hideSelection();return;}
  if(action==='selection-bookmark'&&selection){upsert('quote',selection);hideSelection();window.getSelection()?.removeAllRanges();return;}
  if(action==='selection-note'&&selection){const chosen={...selection};hideSelection();window.getSelection()?.removeAllRanges();showEditor(chosen);return;}
  if(action==='paragraph-menu'){
   const seg=Number(btn.dataset.segment),t={kind:'paragraph',section:String(state.n),segment:seg,lang:state.lang==='arabic'?'ar':'en'};
   const controls=btn.parentElement;
   const expanded=controls.querySelector('.gn-rd-paragraph-options');
   if(expanded){expanded.remove();btn.setAttribute('aria-expanded','false');return;}
   const wrap=document.createElement('span');wrap.className='gn-rd-paragraph-options';
   wrap.innerHTML='<button type="button" data-rd="paragraph-bookmark" data-segment="'+seg+'">Bookmark paragraph</button><button type="button" data-rd="paragraph-note" data-segment="'+seg+'">Add note</button>';
   controls.append(wrap);btn.setAttribute('aria-expanded','true');return;
  }
  if(action==='paragraph-bookmark'||action==='paragraph-note'){
   const target={kind:'paragraph',section:String(state.n),segment:Number(btn.dataset.segment),lang:state.lang==='arabic'?'ar':'en'};
   action==='paragraph-note'?showEditor(target):upsert('paragraph',target);return;
  }
  if(action==='view-paragraph'||action==='view-section'){
   ui.filterTarget=String(state.n);ui.category='all';ui.selected='';ctx.navigate('bookmarks');return;
  }
  if(action==='section-note'){showEditor({kind:'section',section:String(state.n)});return;}
  if(action==='attach-bookmark'||action==='attach-note'){
   let target;try{target=validateTarget(JSON.parse(decodeURIComponent(btn.dataset.target)))}catch(e){}
   if(!target){ctx.notify('Cannot bookmark this entry.');return;}
   if(action==='attach-note')showEditor(target);else upsert(target.kind,target);
   return;
  }
  if(action==='new-note'){showEditor(null);return;}
  if(action==='save-note'){saveEditor();return;}
  if(action==='close-editor'){closeEditor();return;}
  if(action==='trash'&&row){trash(id);return;}
  if(action==='restore'&&row){moveMany([id],true);ctx.notify('Restored to Reading Desk.');return;}
  if(action==='delete-permanent'&&row){if(confirm('Permanently delete this item? This cannot be undone.')){records=records.filter(x=>x.id!==id);persist();render();}return;}
  if(action==='undo'&&lastUndo){moveMany([lastUndo],true);lastUndo=null;const t=$('#gn-rd-undo');if(t)t.hidden=true;return;}
  if(action==='restore-all'){moveMany(records.filter(r=>r.deleted).map(r=>r.id),true);return;}
  if(action==='empty-bin'){if(confirm('Permanently delete everything in Bin? This cannot be undone.')){records=records.filter(r=>!r.deleted);persist();render();}return;}
  if(action==='open'&&row){openSource(row);return;}
  if(action==='add-note'&&row){showEditor(row.target);return;}
  if(action==='edit'&&row){showEditor(row.target,row);return;}
  if(action==='share'&&row){shareItem(row);return;}
  if(action==='email'&&row){shareItem(row,true);return;}
  if(action==='print'&&row){preparePrint([row]);return;}
  if(action==='print-list'){preparePrint();return;}
  if(action==='print-now'){if(!printRoot)return;window.print();return;}
  if(action==='close-print'){closePrintPreview();return;}
  if(action==='export'){download(backup(),'Reading-Desk-'+new Date().toISOString().slice(0,10)+'.json');ctx.notify('Reading Desk backup downloaded.');return;}
  if(action==='share-backup'){shareBackup();return;}
  if(action==='import'){$('#gn-rd-file')?.click();return;}
  if(action==='return'){toDesk();return;}
  if(action==='dismiss-return'){origin=null;document.body.classList.remove('gn-rd-returning');$('.gn-rd-return')?.remove();return;}
 }
 function install(){
  if(ready)return;ready=true;
  load();
  try{
   const raw=sessionStorage.getItem('gnamma-reading-desk-intent');sessionStorage.removeItem('gnamma-reading-desk-intent');
   const value=raw&&JSON.parse(raw);if(value&&Date.now()-value.created<300000)pendingIntent=value;
  }catch(_){}
  document.addEventListener('click',handle,true);
  document.addEventListener('selectionchange',scheduleProbe,{passive:true});
  document.addEventListener('keyup',e=>{if(e.key==='Shift'||e.key.startsWith('Arrow'))scheduleProbe();});
  document.addEventListener('keydown',e=>{
   if(e.key!=='Escape')return;
   if(printRoot){e.preventDefault();e.stopImmediatePropagation();closePrintPreview();return;}
   if($('#gn-rd-editor-shade')){e.preventDefault();e.stopImmediatePropagation();closeEditor();}
   else if(!$('#gn-rd-selection-bar')?.hidden)hideSelection();
  },true);
  document.addEventListener('keydown',e=>{
   if(printRoot&&e.key==='Tab'){
    const nodes=[...printRoot.querySelectorAll('button')].filter(x=>!x.disabled);if(!nodes.length)return;
    if(e.shiftKey&&document.activeElement===nodes[0]){e.preventDefault();nodes.at(-1).focus();}
    else if(!e.shiftKey&&document.activeElement===nodes.at(-1)){e.preventDefault();nodes[0].focus();}
    return;
   }
   if(!$('#gn-rd-editor-shade')||e.key!=='Tab')return;
   const nodes=[...$('#gn-rd-editor-shade').querySelectorAll('button,input,textarea')].filter(x=>!x.disabled);
   if(!nodes.length)return;const first=nodes[0],last=nodes.at(-1);
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  },true);
  document.addEventListener('change',e=>{if(e.target?.id==='gn-rd-file'){importFile(e.target.files?.[0]);e.target.value='';}});
  document.addEventListener('input',e=>{if(e.target?.id==='gn-rd-query'){ui.query=e.target.value;const focusId=document.activeElement.id;const pos=e.target.selectionStart;render();const input=$('#'+focusId);input?.focus({preventScroll:true});input?.setSelectionRange?.(pos,pos);}});
  const host=$('#detailContent');if(host){const observer=new MutationObserver(()=>{if(!decorating)queueMicrotask(decorate);});observer.observe(host,{subtree:true,childList:true});}
  const main=$('#mainContent');if(main){let scheduled=false;new MutationObserver(()=>{if(scheduled||decorating)return;scheduled=true;queueMicrotask(()=>{scheduled=false;decorate();});}).observe(main,{subtree:true,childList:true});}
 }
 install();
 return {render,afterRender,afterReader,toggleSection,decorate,openSource,backup,records:()=>records};
}
window.GnammaReadingDesk={create};
})();