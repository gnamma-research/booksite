/* Reading Desk: personal local scholarly bookmarks and notes, independent of edition data. */
(function(){
'use strict';
const KEY='gnamma-reading-desk-v1', FORMAT='gnamma-reading-desk', VERSION=1;
const CATEGORIES=['all','bookmarks','highlights','mine'];
const LABELS={all:'All',bookmarks:'Bookmarks',mine:'My notes',text:'Text',booknotes:'Source notes',notes:'My notes',dictionary:'Dictionary',index:'Subject index',bidaya:'Bidāya',lessons:'Lessons',bin:'Bin'};
const SORTS={'created-desc':'Newest saved','created-asc':'Oldest saved','modified-desc':'Recently edited',source:'Text / source order',alpha:'Title A–Z'};
const KINDS=new Set(['section','paragraph','quote','footnote','dictionary','index','application','lesson','note']);
const clamp=(v,max=1000)=>String(v==null?'':v).slice(0,max);
const esc=v=>clamp(v,100000).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const escFull=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=v=>String(v||'').replace(/[\u064b-\u065f\u0670\u0640\u06d6-\u06ed]/g,'').normalize('NFC');
const norm=v=>clean(v).replace(/\s+/g,' ').trim();
const keyOf=t=>[t.kind,t.section||'',t.segment==null?'':t.segment,t.kind==='paragraph'?'':t.lang||'',t.quote?norm(t.quote).slice(0,400):'',t.term||'',t.app||'',t.lesson||'',t.level||'',t.noteId||''].join('\u241f');
const uuid=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():'desk-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
const short=(v,n=110)=>clamp(v,30000).length>n?clamp(v,n-1)+'…':String(v||'');

const bookmarkUI=window.GnammaBookmarkUI;
if(!bookmarkUI)throw Error('Bookmark controls must load before the Reading Desk');
const RD_ICON={
 bookmark:bookmarkUI.icon(),
 bookmarkSaved:bookmarkUI.icon({saved:true}),
 highlight:bookmarkUI.highlightIcon(),
 paragraph:bookmarkUI.icon({kind:'paragraph'}),
 paragraphSaved:bookmarkUI.icon({kind:'paragraph',saved:true}),
 note:bookmarkUI.noteIcon?.()||'<svg class="gn-note-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3.6" y="3.5" width="16" height="17" rx="2"/><path d="M7 8h7M7 11h4"/><path d="m11.6 16.9 5.3-5.3 2 2-5.3 5.3-2.8.8zM15.9 12.6l2 2"/></svg>',
 saved:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M5 6h14M5 12h14M5 18h9"/></svg>',
 close:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
};

Object.assign(RD_ICON,{
 print:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8V3h12v5M5 17H3V9h18v8h-2M6 14h12v7H6z"/></svg>',
 download:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/></svg>',
 upload:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17V4m-5 5 5-5 5 5M4 16v5h16v-5"/></svg>',
 plus:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 4v16M4 12h16"/></svg>',
 trash:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M8 7l1 14h6l1-14M9 7V4h6v3M10 11v6M14 11v6"/></svg>',
 share:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="19" r="2"/><path d="m8 11 8-5M8 13l8 5"/></svg>',
 eye:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
 clock:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/></svg>',
 history:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 6v6h6M4 12a8 8 0 1 0 3-6M12 7v5l3 2"/></svg>',
 edit:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="m15 5 4 4M4 20l4-.5L20 7a3 3 0 0 0-4-4L4 15z"/></svg>',
 az:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 19 8 5l5 14M5 15h6M16 6h5l-5 12h5"/></svg>',
 order:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 5h16M4 10h13M4 15h9M4 20h5"/></svg>',
 book:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 6c-3-2-6-2-10-1v14c4-1 7-1 10 1 3-2 6-2 10-1V5c-4-1-7-1-10 1zM12 6v14"/></svg>',
 index:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 5h14M5 10h14M5 15h10M5 20h7"/></svg>',
 link:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 13a5 5 0 0 0 8 0l2-2a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-8 0l-2 2a5 5 0 0 0 7 7l2-2"/></svg>',
 lesson:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m2 10 10-5 10 5-10 5zM6 12v5c4 3 8 3 12 0v-5"/></svg>',
 mail:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 7 9-7"/></svg>'
});
function deskButton(action,label,icon,caption='',selected=null,extra=''){
 return '<button type="button" class="gn-rd-toolbar-icon" data-rd="'+action+'" '+extra+
 ' title="'+esc(label)+'" aria-label="'+esc(label)+'"'+
 (selected===null?'':' aria-pressed="'+Boolean(selected)+'"')+'>'+
 (RD_ICON[icon]||RD_ICON.saved)+(caption?'<span class="gn-rd-icon-caption">'+esc(caption)+'</span>':'')+'</button>';
}
function deskChoice(action,value,label,icon,caption,selected){
 return deskButton(action,label,icon,caption,selected,'data-value="'+esc(value)+'"');
}
function rdTool(label,data,icon,selected=false,filled=false,caption=''){
 return '<button type="button" class="gn-rd-tool-icon'+(selected?' is-on':'')+(filled?' has-content':'')+'" title="'+esc(label)+'" aria-label="'+esc(label)+'" '+data+'>'+RD_ICON[icon]+
  (caption?'<span class="gn-rd-tool-caption">'+esc(caption)+'</span>':'')+'</button>';
}
const category=it=>it.kind==='note'||it.kind==='footnote'?'notes':['quote','paragraph','section'].includes(it.kind)?'text':it.kind==='application'?'bidaya':it.kind==='lesson'?'lessons':it.kind;
function create(ctx){
 const state=ctx.state, book=ctx.book;
 let records=[],available=true,selection=null,editor=null,origin=null,readingOrigin=null,printRoot=null,returnFocus=null,printFocus=null,probeTimer=0,decorating=false,ready=false,lastUndo=null,pendingIntent=null;
 let deskPdfPromise=null,deskPdfFile=null,deskPdfURL=null,printRevision=0,printingPDF=false;
 const ui={category:'all',sourceType:'all',sort:'created-desc',query:'',selected:'',context:'both',expanded:false,filterTarget:'',filterSegment:null,mobileDetail:false,listScroll:0};
 const printPrefs={scope:'visible',order:'source',arabic:true,english:true,personal:true,dates:true,bookmarkDates:false,full:false};
 let openContext=null,editorOriginal=null,printSelection=null,loadFailure=false,writeConflict=false,untouchedStorage=null,storedEnvelope={},lastSourceDeepLink='',relinkFocus=null;
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
 function archiveTarget(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
  try{return JSON.parse(JSON.stringify(raw));}catch(_){return null;}
 }
 function sanitize(r){
  if(!r||typeof r!=='object'||Array.isArray(r))
   return {id:uuid(),kind:'unavailable',target:null,title:'Unrecognized saved entry',
    body:'',created:0,updated:0,modified:0,dateSource:'legacy-unknown',
    deleted:0,standalone:false,archivedValue:r};
  const kind=clamp(r.kind||'unavailable',30),rawTarget=r.target||((r.kind&&r.section)?r:null);
  const parsed=validateTarget(rawTarget),target=archiveTarget(rawTarget);
  if(target&&parsed){for(const key of ['kind','section','segment','lang','offset'])if(key in parsed)target[key]=parsed[key];}
  const title=typeof r.title==='string'?r.title:r.title==null?'':JSON.stringify(r.title);
  const body=typeof r.body==='string'?r.body:r.body==null?'':JSON.stringify(r.body);
  return {...r,id:clamp(r.id,100)||uuid(),kind,target,title,body,
   ...(r.body!=null&&typeof r.body!=='string'?{archivedBodyValue:r.body}:{}),
   ...(r.title!=null&&typeof r.title!=='string'?{archivedTitleValue:r.title}:{}),
   ...(rawTarget&&target&&JSON.stringify(rawTarget)!==JSON.stringify(target)?{sourceTargetOriginal:archiveTarget(rawTarget)}:{}),
   created:Math.max(0,Number(r.created)||0),
   updated:Math.max(0,Number(r.updated)||0),modified:Math.max(0,Number(r.modified)||0),
   dateSource:['recorded','legacy-unknown','unverified'].includes(r.dateSource)?r.dateSource:'unverified',
   deleted:Math.max(0,Number(r.deleted)||0),standalone:kind==='note'&&!!r.standalone};
 }
 function isResolved(r){
  if(!r)return false;
  if(!r.target)return r.kind==='note'&&r.standalone===true;
  if(r.kind!=='note'&&r.kind!==r.target.kind)return false;
  if(r.target.kind==='quote'&&String(r.target.quote||'').length>5000)return false;
  return Boolean(validateTarget(r.target));
 }
 function load(skipLegacy=false){
  loadFailure=false;writeConflict=false;available=true;records=[];storedEnvelope={};
  try{
   const value=localStorage.getItem(KEY);
   untouchedStorage=value;
   if(value!==null){
    untouchedStorage=value;
    const data=JSON.parse(value);
    if(data?.format!==FORMAT||data.version!==VERSION||!Array.isArray(data.items))
     throw Error('Unsupported saved Reading Desk format');
    storedEnvelope=Object.fromEntries(Object.entries(data).filter(([key])=>!['format','version','items'].includes(key)));
    records=data.items.map(sanitize); // Never truncate records when restoring.
    const ids=new Set();
    for(const item of records){
     if(ids.has(item.id)){item.originalDuplicateId=item.id;item.id=uuid();}
     ids.add(item.id);
    }
   }
  }catch(e){
   loadFailure=true;available=false;records=[];
   ctx.notify('Existing Reading Desk data is unreadable. It is protected from overwriting. Download the original data before editing.');
   return;
  }
  let changed=false;
  for(const n of skipLegacy?[]:(state.bookmarks||[])){
   if(!section(n))continue;
   if(records.some(r=>r.kind==='section'&&String(r.target?.section)===String(n)))continue;
   records.push({id:uuid(),kind:'section',target:{kind:'section',section:String(n)},
    title:'',body:'',created:0,updated:Date.now(),modified:0,
    dateSource:'legacy-unknown',deleted:0,standalone:false});changed=true;
  }
  syncLegacy(false);
  if(changed)persist();
 }
 function persist(){
  if(loadFailure){
   ctx.notify('Original Reading Desk storage is protected. Export its untouched data before editing.');return false;
  }
  if(writeConflict){
   ctx.notify('Another tab changed Reading Desk. Refresh the saved collection before editing.');return false;
  }
  let updatedRaw;
  try{
   // Protect against overwriting a newer browser-local collection in another tab.
   // Every successful write refreshes this tab's expected raw-storage snapshot.
   const current=localStorage.getItem(KEY);
   if(current!==untouchedStorage){
    writeConflict=true;available=false;
    ctx.notify('Reading Desk changed in another tab. Your other tab’s saved work is safe; refresh this collection before writing.');
    if(state.route==='bookmarks')requestAnimationFrame(()=>render());
    return false;
   }
   updatedRaw=JSON.stringify({...storedEnvelope,format:FORMAT,version:VERSION,items:records});
   localStorage.setItem(KEY,updatedRaw);
   untouchedStorage=updatedRaw;available=true;
  }catch(e){
   available=false;
   ctx.notify('Reading Desk could not be saved: browser storage is full or unavailable. Export a backup.');
   return false;
  }
  // Rendering or syncing the separate legacy bookmark list must never turn a
  // successful storage commit into a reported failure and an incorrect rollback.
  try{syncLegacy(true);}catch(_){ctx.notify('Reading Desk was saved, but old-format bookmarks could not be synchronized.');}
  try{syncActionStates();}catch(_){}
  // Dock/status subscribers only react after the transaction has succeeded.
  try{document.dispatchEvent(new Event('gnamma-reading-desk-change'));}catch(_){}
  return true;
 }
 function syncLegacy(doSave){
  const list=records.filter(r=>r.kind==='section'&&!r.deleted&&r.target?.kind==='section'&&section(r.target.section)).map(r=>String(r.target.section));
  ctx.setLegacyBookmarks(list,doSave);
 }
 function active(){return records.filter(r=>!r.deleted);}
 function footnoteLabel(t){
  const note=ctx.notes.get(t.noteId);
  if(!note)return 'Source note · '+ctx.sectionRef(t.section);
  if(note.source_type==='quran'||note.kind==='quran-source'){
   const ref=String(note.text||'').replace(/^Qur[ʾ’']?ān[,\s]*/iu,'').replace(/\.$/,'').trim();
   return 'Qurʾān · '+(ref||t.noteId)+' · '+ctx.sectionRef(t.section);
  }
  if(note.source_type==='hadith'||note.kind==='hadith-source'){
   const ref=note.source_references?.[0]?.reference||String(note.text||'').trim().replace(/\.$/,'');
   return 'Hadith · '+short(ref||t.noteId,95)+' · '+ctx.sectionRef(t.section);
  }
  return (note.kindLabel||'Source note')+' · '+ctx.sectionRef(t.section)+' · '+short(String(note.text||'').trim()||t.noteId,85);
 }
 function footnoteKind(noteId){
  const n=ctx.notes.get(noteId);
  if(n?.source_type==='quran'||n?.kind==='quran-source')return 'Qurʾān reference';
  if(n?.source_type==='hadith'||n?.kind==='hadith-source')return 'Hadith reference';
  return n?.kindLabel||'Source note';
 }
 function titleOf(t){if(!t)return 'Unattached note';
  if(t.kind==='section')return ctx.sectionRef(t.section)+' · '+(section(t.section)?.title||'Section');
  if(t.kind==='quote')return short(t.quote,72);
  if(t.kind==='paragraph')return ctx.sectionRef(t.section)+' · Paragraph '+(t.segment+1);
  if(t.kind==='footnote')return footnoteLabel(t);
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
   if(sort==='modified-desc')return (b.modified||(b.kind==='note'?b.created:0))-(a.modified||(a.kind==='note'?a.created:0))||sourceSort(a,b);
   const av=a.created||0,bv=b.created||0;
   if(!av!==!bv)return av?-1:1;
   return sort==='created-asc'?av-bv||sourceSort(a,b):bv-av||sourceSort(a,b);
  });
 }
 function upsert(kind,target,body='',title=''){
  const now=Date.now();
  if(records.length>2999){ctx.notify('Reading Desk is full; export and remove unused entries before adding more.');return null;}
  if(kind!=='note'){
   const existing=records.find(x=>x.kind===kind&&x.target&&keyOf(x.target)===keyOf(target));
   if(existing){
    if(existing.deleted){
     const prior={deleted:existing.deleted,updated:existing.updated};existing.deleted=0;existing.updated=now;
     if(!persist()){Object.assign(existing,prior);return null;}
     ctx.notify('Restored to Reading Desk.');
     if(state.route==='bookmarks')render();
     if(state.route==='reader')refreshReaderAfterBookmark(target);
    }else ctx.notify('Already in Reading Desk.');
    return existing;
   }
  }
  const row=sanitize({id:uuid(),kind,target,title,body,created:now,updated:now,modified:0,dateSource:'recorded',deleted:0,standalone:kind==='note'&&!target});
  if(!row)return null;
  records.unshift(row);
  if(!persist()){records.shift();return null;}
  ctx.notify(kind==='note'?'Personal note added to Reading Desk.':kind==='quote'?'Highlighted in Reading Desk.':'Bookmarked in Reading Desk.');
  if(state.route==='bookmarks')render();
  if(state.route==='reader')refreshReaderAfterBookmark(target);
  return row;
 }
 function toggleSection(n){
  n=String(n);const row=records.find(r=>r.kind==='section'&&!r.deleted&&r.target?.section===n);
  if(row)trash(row.id);else upsert('section',{kind:'section',section:n});
  // Both paths have already refreshed the affected Reading Desk/reader controls.
  // A second full reader/Desk render here previously caused visible delays.
  ctx.syncChrome();
 }
 function moveMany(ids,restore=false){
  const snapshot=new Map(records.filter(r=>ids.includes(r.id)).map(r=>[r.id,{deleted:r.deleted,updated:r.updated}]));
  const now=Date.now();let count=0;
  for(const id of ids){const r=records.find(x=>x.id===id);if(!r)continue;
   if(restore&&!r.deleted||!restore&&r.deleted)continue;
   r.deleted=restore?0:now;r.updated=now;count++;
  }
  if(count){
   if(!persist()){
    for(const [id,previous] of snapshot){const row=records.find(x=>x.id===id);if(row){row.deleted=previous.deleted;row.updated=previous.updated;}}
    ctx.notify('Storage unavailable: change was not saved.');return 0;
   }
   // persist() already synchronized the legacy section list once. Re-saving it
   // here and rebuilding the entire reader twice delayed bookmark deselection.
   const touched=records.filter(r=>snapshot.has(r.id));
   if(state.route==='reader'){
    if(touched.length===1)refreshReaderAfterBookmark(touched[0].target);
    else afterReader();
   }
   if(state.route==='bookmarks')refreshDeskAfterMove(touched,restore);
  }
  return count;
 }
 function refreshDeskAfterMove(touched,restore){
  // A single bookmark disappearing from the current list does not require
  // reconstructing every saved card and every complete scholarly note.
  if(restore||touched.length!==1||touched[0].kind==='note'||ui.category==='bin'||ui.sort==='source'){
   render();return;
  }
  const id=touched[0].id,main=$('#mainContent');
  const page=main?.querySelector('.gn-rd-page');
  const card=[...(main?.querySelectorAll?.('.gn-rd-card-open[data-id]')||[])]
   .find(btn=>btn.dataset.id===id)?.closest('.gn-rd-card');
  if(!page||!card||matching().some(r=>r.id===id)){render();return;}
  card.remove();
  const visible=matching();
  const count=main.querySelector('.gn-rd-count');
  if(count)count.textContent=visible.length+' saved '+(visible.length===1?'item':'items');
  const binButton=main.querySelector('.gn-rd-manage-items [data-value="bin"]');
  if(binButton){const binCount=records.filter(r=>r.deleted).length;binButton.textContent='Open Bin'+(binCount?' ('+binCount+')':'');}
  if(ui.selected===id){
   ui.selected='';ui.mobileDetail=false;page.classList.remove('gn-rd-mobile-detail-open');
   const detail=main.querySelector('#gn-rd-detail');
   if(detail)detail.innerHTML='<div class="gn-rd-detail-placeholder"><h2>Choose an item</h2><p>Select a bookmark or personal note to see its source and context.</p></div>';
  }else if(ui.selected){render();return;} // Related links may refer to the removed item.
  if(!visible.length){
   const cards=main.querySelector('#gn-rd-cards');
   if(cards)cards.innerHTML='<p class="gn-rd-empty">No saved items here yet. Bookmark a section or paragraph, or highlight selected words in the reader to begin.</p>';
  }
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
  if(r.kind==='note'&&r.standalone)return '<p class="gn-rd-muted">Free-standing personal note</p><div class="gn-rd-personal-body">'+escFull(r.body)+'</div>';
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
  if(r.kind==='note')html+='<div class="gn-rd-personal-body"><h3>Your note</h3><p>'+escFull(r.body).replace(/\n/g,'<br>')+'</p></div>';
  return html;
 }
 function grouped(r){return r.kind==='note'?'My note':r.kind==='footnote'?footnoteKind(r.target?.noteId):
  r.kind==='section'?'Section bookmark':r.kind==='paragraph'?'Paragraph bookmark':
  r.kind==='quote'?'Highlight':LABELS[typeOf(r)]||'Bookmark';}
 function matching(){
  const q=norm(ui.query).toLocaleLowerCase(),bin=ui.category==='bin';
  const rows=records.filter(r=>Boolean(r.deleted)===bin&&
   (!ui.filterTarget||r.target?.section===ui.filterTarget)&&
   (ui.filterSegment===null||r.target?.segment===ui.filterSegment)&&
   (bin||ui.category==='all'||ui.category==='mine'&&r.kind==='note'||ui.category==='bookmarks'&&!['note','quote'].includes(r.kind)||ui.category==='highlights'&&r.kind==='quote')&&
   (bin||ui.sourceType==='all'||typeOf(r)===ui.sourceType)&&
   (!q||norm([r.title,titleOf(r.target),r.body,r.target?.quote,r.target?.term,r.target?.app,subOf(r.target)].join(' ')).toLocaleLowerCase().includes(q)));
  return bin?rows.sort((a,b)=>b.deleted-a.deleted):sortItems(rows,ui.sort);
 }
 function htmlCard(r,linkedCounts){
  const own=r.kind==='note',relatedCount=own||!r.target?0:linkedCounts.get(keyOf(r.target))||0;
  const canOpen=!!r.target&&isResolved(r);
  const parts=['<article class="gn-rd-card'+(r.id===ui.selected?' gn-rd-selected':'')+'">'];
  parts.push('<button type="button" class="gn-rd-card-open" data-rd="select" data-id="'+esc(r.id)+'" aria-label="View '+esc(own?'personal note':'bookmark')+': '+esc(short(r.title||titleOf(r.target),95))+'">');
  parts.push('<span class="gn-rd-card-heading"><small>'+esc(grouped(r))+' · '+esc(subOf(r.target))+'</small><time title="'+esc(dateLine(r,true))+'">'+esc(dateLine(r))+'</time></span>');
  if(!isResolved(r))parts.push('<span class="gn-rd-unresolved-status" role="status">Source unavailable · saved content preserved</span>');
  parts.push('<strong>'+esc(r.title||titleOf(r.target))+'</strong>');
  if(own)parts.push('<span>'+esc(short(r.body,175))+'</span>');
  else if(relatedCount)parts.push('<span>'+relatedCount+' linked personal '+(relatedCount===1?'note':'notes')+'</span>');
  parts.push('</button></article>');
    return parts.join('');
 }
 function render(){
  const main=$('#mainContent');if(!main)return;
  const visible=matching(),selected=records.find(r=>r.id===ui.selected),bin=ui.category==='bin';
  const linkedCounts=new Map();
  for(const r of active())if(r.kind==='note'&&r.target){const k=keyOf(r.target);linkedCounts.set(k,(linkedCounts.get(k)||0)+1);}
  const parts=['<section class="gn-rd-page'+(ui.mobileDetail?' gn-rd-mobile-detail-open':'')+'">'];
  parts.push('<header class="gn-rd-hero"><p class="gn-rd-kicker">YOUR PRIVATE READING COLLECTION</p><h1>Reading Desk</h1>');
  parts.push('<p>Private bookmarks and personal notes, saved in this browser.</p>');
  if(readingOrigin)parts.push('<button type="button" class="gn-rd-back-reading" data-rd="return-reading">← Back to text</button>');
  parts.push('</header>');
  if(loadFailure)parts.push('<div class="gn-rd-warning" role="alert"><strong>Saved data protected.</strong> This browser contains Reading Desk data that could not be read. No new writes will overwrite it. <button type="button" data-rd="download-original">Download untouched original data</button></div>');
  else if(writeConflict)parts.push('<div class="gn-rd-warning" role="alert"><strong>Reading Desk changed in another tab.</strong> New writes are paused to protect the newer collection. <button type="button" data-rd="refresh-storage">Reload saved items</button></div>');
  else if(!available)parts.push('<p class="gn-rd-warning" role="alert">Browser storage is unavailable or full. Download a backup before leaving.</p>');
  parts.push('<div class="gn-rd-toolbar gn-rd-simplified-toolbar" role="group" aria-label="Reading Desk actions"><div class="gn-rd-toolbar-main">');
  parts.push('<button type="button" class="gn-rd-main-action" data-rd="new-note">'+RD_ICON.note+'<span>New note</span></button>');
  parts.push('<button type="button" class="gn-rd-main-action" data-rd="print-list">'+RD_ICON.print+'<span>Print / PDF</span></button>');
  parts.push('<details class="gn-rd-manage-menu"><summary>Manage <span aria-hidden="true">⌄</span></summary><div class="gn-rd-manage-items" role="group" aria-label="Manage Reading Desk data">');
  parts.push('<button type="button" data-rd="export">Download backup (.json)</button>');
  parts.push('<button type="button" data-rd="import">Import backup (.json)</button>');
  parts.push('<button type="button" data-rd="export-markdown">Export readable notes (.md)</button>');
  parts.push('<button type="button" data-rd="share-backup">Share backup</button>');
  const binCount=records.filter(r=>r.deleted).length;
  parts.push('<button type="button" data-rd="filter" data-value="'+(bin?'all':'bin')+'">'+
   (bin?'Return to saved items':'Open Bin'+(binCount?' ('+binCount+')':''))+'</button></div></details>');
  parts.push('</div><input class="gn-rd-file" type="file" id="gn-rd-file" accept="application/json,.json" aria-label="Select Reading Desk backup file" hidden></div>');
    if(ui.filterTarget)parts.push('<p class="gn-rd-scoped">Items from '+esc(ctx.sectionRef(ui.filterTarget))+(ui.filterSegment!==null?' · paragraph '+(ui.filterSegment+1):'')+' <button data-rd="unscoped" type="button">Show all</button></p>');
  if(bin)parts.push('<p class="gn-rd-scoped">Bin <button type="button" data-rd="filter" data-value="all">← Back to saved items</button></p>');
  else parts.push('<div class="gn-rd-tabs" role="group" aria-label="Saved item categories">'+
   ['all','bookmarks','highlights','mine'].map(v=>'<button type="button" data-rd="filter" data-value="'+v+
    '" aria-pressed="'+(ui.category===v)+'">'+({all:'All',bookmarks:'Bookmarks',highlights:'Highlights',mine:'My notes'}[v])+'</button>').join('')+'</div>');
  parts.push('<label class="gn-rd-search" for="gn-rd-query">Search saved items<input id="gn-rd-query" type="search" autocomplete="off" placeholder="Search notes and quotations…" value="'+esc(ui.query)+'"></label>');
  const typeOptions=[['all','All sources'],['text','Text passages'],['booknotes','Book notes'],['dictionary','Dictionary'],['index','Subject index'],['bidaya','Bidāya applications'],['lessons','Study lessons']];
  parts.push('<div class="gn-rd-controls" role="group" aria-label="Browse saved items">');
  parts.push('<label for="gn-rd-source">Saved from <select id="gn-rd-source">'+typeOptions.map(([value,name])=>
   '<option value="'+value+'"'+(ui.sourceType===value?' selected':'')+'>'+name+'</option>').join('')+'</select></label>');
  parts.push('<label for="gn-rd-sort">Sort by <select id="gn-rd-sort">'+Object.entries(SORTS).map(([value,name])=>
   '<option value="'+value+'"'+(ui.sort===value?' selected':'')+'>'+name+'</option>').join('')+'</select></label></div>');
    parts.push('<p class="gn-rd-count" aria-live="polite">'+visible.length+' '+(bin?(visible.length===1?'item in Bin':'items in Bin'):(visible.length===1?'saved item':'saved items'))+'</p>');
  parts.push('<div class="gn-rd-layout"><div class="gn-rd-cards" id="gn-rd-cards">');
  let lastGroup='',lastPassage='';
  for(const r of visible){
   const group=(!bin&&ui.sort==='source'&&r.target?.section)?String(r.target.section):'';
   if(group&&group!==lastGroup)parts.push('<h3 class="gn-rd-source-heading">'+esc(ctx.sectionRef(group))+'</h3>');
   const key=group&&r.target?.segment!=null?group+':'+r.target.segment:'';
   if(key&&key!==lastPassage)parts.push('<h4 class="gn-rd-paragraph-heading">Paragraph '+(Number(r.target.segment)+1)+'</h4>');
   lastGroup=group;lastPassage=key;
   parts.push(htmlCard(r,linkedCounts));
  }
  if(!visible.length)parts.push('<p class="gn-rd-empty">'+(bin?'Bin is empty.':ui.query?'No items match the search.':'No saved items here yet. Bookmark a section or paragraph, or highlight selected words in the reader to begin.')+'</p>');
  parts.push('</div><div class="gn-rd-detail" id="gn-rd-detail">');
  if(selected&&visible.some(r=>r.id===selected.id)){
   parts.push('<button class="gn-rd-mobile-back" type="button" data-rd="detail-back">← Reading Desk</button>');
   if(ui.mobileDetail&&readingOrigin)parts.push('<button class="gn-rd-back-reading gn-rd-mobile-source-back" type="button" data-rd="return-reading">← Back to text</button>');
   parts.push('<header><small>'+esc(selected.kind==='note'?'MY NOTE':grouped(selected).toUpperCase())+'</small><h2>'+esc(selected.title||titleOf(selected.target))+'</h2></header>');
   const itemId='data-id="'+esc(selected.id)+'"';
   parts.push('<div class="gn-rd-detail-actions" role="group" aria-label="Actions for this saved item">');
   if(bin)parts.push('<button type="button" class="gn-rd-detail-primary" data-rd="restore" '+itemId+'>Restore item</button>');
   else{
    if(selected.kind==='note')parts.push('<button type="button" class="gn-rd-detail-primary" data-rd="edit" '+itemId+'>Edit note</button>');
    if(selected.target&&isResolved(selected)){
     parts.push('<button type="button" class="'+(selected.kind==='note'?'gn-rd-detail-secondary':'gn-rd-detail-primary')+
      '" data-rd="open" '+itemId+'>Open in text</button>');
     if(selected.kind!=='note')parts.push('<button type="button" class="gn-rd-detail-secondary" data-rd="add-note" '+itemId+'>Add note</button>');
    }
    if(!isResolved(selected))parts.push('<button type="button" class="gn-rd-detail-secondary" data-rd="relink" '+itemId+'>Relink source</button>');
   }
   parts.push('<details class="gn-rd-item-more"><summary>More <span aria-hidden="true">⌄</span></summary><div class="gn-rd-item-more-items">');
   if(!bin){
    parts.push('<button type="button" data-rd="share" '+itemId+'>Share item</button>');
    parts.push('<button type="button" data-rd="email" '+itemId+'>Email item</button>');
    parts.push('<button type="button" data-rd="print" '+itemId+'>Print / PDF for this item</button>');
   }
   parts.push('<button type="button" data-rd="'+(bin?'delete-permanent':'trash')+'" '+itemId+'>'+
    (bin?'Delete permanently':'Move to Bin')+'</button>');
   parts.push('</div></details></div>');

   if(!isResolved(selected))parts.push('<div class="gn-rd-unresolved-detail" role="status"><strong>Original source unavailable in this edition.</strong><p>The saved words, note, dates and previous source reference remain preserved. You can read or export this item and optionally reconnect it to an existing paragraph.</p></div>');
   parts.push(detailsFor(selected));
   parts.push('<footer class="gn-rd-date-details"><small>'+esc(dateLine(selected,true))+'</small></footer>');
   if(Array.isArray(selected.sourceHistory)&&selected.sourceHistory.length){
    parts.push('<details class="gn-rd-history"><summary>Previous source references ('+selected.sourceHistory.length+')</summary>');
    parts.push(selected.sourceHistory.map(h=>'<p>'+esc(h?.target?.section?'Originally '+ctx.sectionRef(h.target.section):'Earlier source')+
     (h?.target?.segment!=null?' · paragraph '+(Number(h.target.segment)+1):'')+
     (h?.target?.quote?' · '+esc(short(h.target.quote,170)):'')+
     (h?.relinkedAt?' · reconnected '+esc(dateDisplay(h.relinkedAt,true)):'')+'</p>').join(''));
    parts.push('</details>');
   }
   const relatives=selected.target?active().filter(r=>r.id!==selected.id&&r.target&&sourceKey(r.target)===sourceKey(selected.target)):[];
   if(relatives.length){
    parts.push('<section class="gn-rd-related"><h3>Related saved items</h3>');
    parts.push(relatives.slice(0,12).map(r=>'<button type="button" data-rd="related" data-id="'+esc(r.id)+'">'+esc(short(r.title||titleOf(r.target),100))+'</button>').join(''));
    parts.push('</section>');
   }
    }else parts.push('<div class="gn-rd-detail-placeholder"><h2>Choose an item</h2><p>Select a bookmark or personal note to see its source and context.</p></div>');
  parts.push('</div></div>');
  if(bin&&visible.length)parts.push('<div class="gn-rd-bin-actions"><button type="button" data-rd="restore-all">Restore all</button><button type="button" data-rd="empty-bin">Empty Bin…</button></div>');
  parts.push('<p class="gn-rd-privacy">Personal data is stored on this device. Download a JSON backup to transfer it. Markdown export is for reading, not re-importing.</p></section>');
  main.innerHTML=parts.join('');
  return main.innerHTML;
 }
 function closeRelink(){
  $('#gn-rd-relink-shade')?.remove();
  const old=relinkFocus;relinkFocus=null;
  if(old?.isConnected)old.focus({preventScroll:true});
 }
 function showRelink(row){
  if(!row||isResolved(row))return;
  closeRelink();
  const old=row.target||{};
  const ids=[...ctx.sections.keys()];
  relinkFocus=document.activeElement;
  const dlg=document.createElement('div');dlg.id='gn-rd-relink-shade';dlg.className='gn-rd-relink-shade';
  dlg.setAttribute('role','presentation');dlg.dataset.itemId=row.id;
  dlg.innerHTML='<section class="gn-rd-relink" role="dialog" aria-modal="true" aria-labelledby="gn-rd-relink-title" tabindex="-1">'+
   '<h2 id="gn-rd-relink-title">Reconnect saved source</h2>'+
   '<p>The previous source reference will be retained in the item history. Your note and original quotation will not be changed.</p>'+
   '<label>Section<select id="gn-rd-relink-section">'+ids.map(id=>{
    const sec=ctx.sections.get(id);
    return '<option value="'+esc(id)+'"'+(id===String(old.section||'')?' selected':'')+'>'+esc(ctx.sectionRef(id))+' · '+esc(short(sec?.title||'Section',90))+'</option>';
   }).join('')+'</select></label>'+
   '<label>Paragraph<select id="gn-rd-relink-segment"></select></label>'+
   (old.quote?'<blockquote>'+esc(short(old.quote,400))+'</blockquote>':'')+
   '<footer><button type="button" data-rd="relink-close">Cancel</button>'+
   '<button type="button" data-rd="relink-save">Save new source</button></footer></section>';
  document.body.append(dlg);updateRelinkSegments();
  dlg.querySelector('#gn-rd-relink-section')?.focus({preventScroll:true});
 }
 function updateRelinkSegments(){
  const node=$('#gn-rd-relink-section'),sel=$('#gn-rd-relink-segment');
  if(!node||!sel)return;
  const n=String(node.value),segments=ctx.sections.get(n)?.segments||[];
  const previous=$('#gn-rd-relink-shade')?.dataset.itemId;
  const row=records.find(r=>r.id===previous),preferred=row?.target?.section===n?Number(row.target?.segment)||0:0;
  sel.innerHTML=segments.map((seg,i)=>'<option value="'+i+'"'+(i===preferred?' selected':'')+'>'+
    'Paragraph '+(i+1)+' · '+esc(short(seg.en||seg.ar||'',70))+'</option>').join('');
 }
 function saveRelink(){
  const dlg=$('#gn-rd-relink-shade'),row=records.find(r=>r.id===dlg?.dataset.itemId);
  if(!row||isResolved(row))return;
  const sectionId=$('#gn-rd-relink-section')?.value,segment=Number($('#gn-rd-relink-segment')?.value);
  if(!ctx.sections.has(String(sectionId))||!Number.isInteger(segment)||!ctx.sections.get(String(sectionId))?.segments?.[segment]){
   ctx.notify('Select an existing section and paragraph.');return;
  }
  const original=row.target?JSON.parse(JSON.stringify(row.target)):null,kind=original?.kind;
  const newKind=kind==='quote'&&original?.quote?'quote':kind==='paragraph'?'paragraph':'paragraph';
  const target={...(original||{}),kind:newKind,section:String(sectionId),segment,
   lang:original?.lang==='ar'?'ar':'en'};
  if(newKind==='quote'){
   target.quote=clamp(original.quote,5000);
   if(!target.quote.trim()){ctx.notify('Original quotation is missing.');return;}
  }
  const validated=validateTarget(target);
  if(!validated){ctx.notify('Could not resolve this source in the current edition.');return;}
  if(newKind==='quote'){
   const seg=ctx.sections.get(String(sectionId)).segments[segment];
   const current=target.lang==='ar'?(seg.vocalized||seg.ar||''):(seg.en||'');
   if(!clean(current).includes(clean(target.quote))){
    ctx.notify('The original quotation is not present in that paragraph. Choose a matching paragraph; the saved words remain safe.');return;
   }
  }
  const prev={kind:row.kind,target:row.target,sourceHistory:row.sourceHistory,updated:row.updated};
  row.kind=row.kind==='note'?'note':newKind;row.target=validated;row.updated=Date.now();
  row.sourceHistory=[...(Array.isArray(row.sourceHistory)?row.sourceHistory:[]),{target:original,relinkedAt:row.updated}];
  if(!persist()){Object.assign(row,prev);ctx.notify('Changes not saved; the original record remains intact.');return;}
  closeRelink();if(state.route==='bookmarks')render();ctx.notify('Source reconnected; original reference preserved in history.');
 }
 function showEditor(target,existing){
  editor=existing||null;const t=target||existing?.target||null;
  editorOriginal={title:existing?.title||'',body:existing?.body||''};
  const shade=document.createElement('div');shade.className='gn-rd-editor-shade';shade.id='gn-rd-editor-shade';
  const date=existing?'<p class="gn-rd-editor-date">'+esc(dateLine(existing,true))+'</p>':'';
  shade.innerHTML='<section class="gn-rd-editor" role="dialog" aria-modal="true" aria-labelledby="gn-rd-editor-title" tabindex="-1">'+
   '<header><h2 id="gn-rd-editor-title">'+(existing?'Edit personal note':'Add personal note')+'</h2>'+
   '<button type="button" data-rd="close-editor" aria-label="Close editor">×</button></header>'+
   '<p class="gn-rd-source-label">'+esc(subOf(t))+'</p>'+
   (t?'<blockquote>'+esc(short(titleOf(t),350))+'</blockquote>':'')+date+
   '<label>Title <small>(optional)</small><input id="gn-rd-note-title" maxlength="'+Math.max(240,String(existing?.title||'').length+240)+'" placeholder="Give this thought a short title" value="'+escFull(existing?.title||'')+'"></label>'+
   '<label>Your note<textarea id="gn-rd-note-body" rows="7" maxlength="'+Math.max(30000,String(existing?.body||'').length+30000)+'" placeholder="Write your observation, question or comparison…" dir="auto">'+escFull(existing?.body||'')+'</textarea></label>'+
   '<footer><button type="button" data-rd="close-editor">Cancel</button><button type="button" class="gn-rd-primary" data-rd="save-note">Save note</button></footer></section>';
  returnFocus=document.activeElement;document.body.append(shade);document.body.classList.add('gn-rd-editor-open');
  shade.dataset.target=JSON.stringify(t);$('#gn-rd-note-body').focus({preventScroll:true});
 }
 function closeEditor(force=false){
  const node=$('#gn-rd-editor-shade');
  if(!force&&node&&editorOriginal&&
   ($('#gn-rd-note-body')?.value!==editorOriginal.body||$('#gn-rd-note-title')?.value!==editorOriginal.title)&&
   !confirm('Discard unsaved changes to this note?'))return;
  node?.remove();document.body.classList.remove('gn-rd-editor-open');
  const focus=returnFocus;returnFocus=null;editor=null;editorOriginal=null;
  if(focus?.isConnected)focus.focus({preventScroll:true});
 }
 function saveEditor(){
  const body=String($('#gn-rd-note-body')?.value??'').trim();
  if(!body){$('#gn-rd-note-body')?.focus();ctx.notify('Write a note before saving.');return;}
  const title=String($('#gn-rd-note-title')?.value??'').trim()||short(body.split('\n').find(Boolean)||'Personal note',85);
  const target=JSON.parse($('#gn-rd-editor-shade')?.dataset.target||'null');
  if(editor){
   if(editor.title!==title||editor.body!==body){
    const previous={title:editor.title,body:editor.body,updated:editor.updated,modified:editor.modified};
    editor.title=title;editor.body=body;editor.updated=Date.now();editor.modified=editor.updated;
    if(!persist()){Object.assign(editor,previous);ctx.notify('The note could not be saved; keep the editor open and download a backup.');return;}
    ctx.notify('Personal note updated.');
   }else ctx.notify('No changes to save.');
  }else upsert('note',target,body,title);
  closeEditor(true);
  if(state.route==='bookmarks'){ui.category='mine';ui.sourceType='all';render();}
  else if(state.route==='reader')afterReader();
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
  bar.setAttribute('aria-label','Actions for selected text');bar.hidden=false;
  bar.innerHTML=rdTool('Highlight selected words','data-rd="selection-bookmark"','highlight')+
   rdTool('Add a personal note for selected words','data-rd="selection-note"','note')+
   rdTool('Dismiss selection actions','data-rd="selection-dismiss"','close');
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
  const stored=active().some(r=>r.kind===target.kind&&r.target&&keyOf(r.target)===keyOf(target));
  const title=bookmarkUI.actionLabel(target.kind,stored);
  row.innerHTML='<button type="button" data-rd="attach-bookmark" data-target="'+esc(serialized)+'" aria-pressed="'+stored+'" aria-label="'+esc(title)+'">'+bookmarkUI.icon({saved:stored})+'<span>'+esc(stored?'Remove bookmark':'Bookmark')+'</span></button>'+
   '<button type="button" data-rd="attach-view" data-target="'+esc(serialized)+'"'+(stored?'':' hidden')+'>View in Reading Desk</button>'+
   '<button type="button" data-rd="attach-note" data-target="'+esc(serialized)+'">'+RD_ICON.note+'<span>Add my note</span></button>';
  return row;
 }
 function syncActionStates(){
  // Make one index for the current saved collection; avoid rescanning every
  // record for every dictionary/index/footnote control on a long reader page.
  const keys=new Set(active().filter(r=>r.target&&r.kind===r.target.kind).map(r=>keyOf(r.target)));
  document.querySelectorAll('[data-rd="attach-bookmark"]').forEach(btn=>{
   let target;try{target=JSON.parse(decodeURIComponent(btn.dataset.target||''));}catch(_){return;}
   const stored=keys.has(keyOf(target));
   const title=bookmarkUI.actionLabel(target.kind,stored);
   btn.innerHTML=bookmarkUI.icon({saved:stored})+'<span>'+esc(stored?'Remove bookmark':'Bookmark')+'</span>';
   btn.setAttribute('aria-label',title);btn.setAttribute('aria-pressed',String(stored));
   const view=btn.parentElement?.querySelector('[data-rd="attach-view"]');
   if(view)view.hidden=!stored;
  });
 }
 function showPersonalMarks(){
  try{return localStorage.getItem('gnamma-rd-show-personal-marks')!=='false';}catch(_){return true;}
 }
 function closeContext(){
  $('#gn-rd-inline-panel')?.remove();openContext=null;
 }
 function showContext(sectionId,segment,anchor){
  closeContext();
  const entries=sortItems(active().filter(r=>r.target?.section===sectionId&&r.target?.segment===segment),'source');
  if(!entries.length)return;
  const panel=document.createElement('aside');panel.id='gn-rd-inline-panel';panel.className='gn-rd-inline-panel';
  panel.setAttribute('aria-label','Your saved items at this passage');
  panel.innerHTML='<header><h3>Saved here · '+esc(ctx.sectionRef(sectionId))+' · paragraph '+(segment+1)+'</h3>'+
   '<button type="button" data-rd="close-context" aria-label="Close saved items">×</button></header>'+
   '<div class="gn-rd-inline-items">'+entries.map(r=>{
    const title=r.title||titleOf(r.target);
    return '<article><strong>'+esc(short(title,145))+'</strong>'+
     (r.kind==='note'?'<p>'+esc(short(r.body,230))+'</p>':'')+
     '<small>'+esc(dateLine(r))+'</small><div class="gn-rd-inline-actions">'+
     '<button type="button" data-rd="go-desk-item" data-id="'+esc(r.id)+'">Open in Reading Desk</button>'+
     (r.kind==='note'?'<button type="button" data-rd="edit" data-id="'+esc(r.id)+'">Edit</button>':'')+
     '<button type="button" data-rd="trash-inline" data-id="'+esc(r.id)+'">Move to Bin</button></div></article>';
   }).join('')+'</div><footer><button type="button" data-rd="go-desk-passage" data-section="'+esc(sectionId)+'" data-segment="'+segment+'">View all for this paragraph</button></footer>';
  const holder=anchor.closest('.gn-rd-passage-tools')||anchor.parentElement;
  holder.after(panel);
  openContext={section:sectionId,segment,at:window.scrollY||0};
  panel.querySelector('button')?.focus({preventScroll:true});
 }
 function ensureVisualsToggle(){
  const title=$('#settingsTitle'),panel=title?.closest('[role="dialog"]');
  if(!panel||panel.querySelector('#gn-rd-visuals-toggle'))return;
  const section=document.createElement('section');
  section.className='gn-rd-visuals-row';
  section.innerHTML='<label><input type="checkbox" id="gn-rd-visuals-toggle"'+(showPersonalMarks()?' checked':'')+
   '> Show private Reading Desk marks beside the text</label>'+
   '<small>Editorial notes are controlled separately. Focus reading hides these marks.</small>';
  panel.append(section);
 }
 function sectionToolbar(n,items){
  const count=items.length,saved=items.some(x=>x.kind==='section'),a=' data-section="'+esc(n)+'"';
  return rdTool(saved?'Remove section bookmark':'Bookmark section','data-rd="section-bookmark"'+a+' aria-pressed="'+saved+'"',saved?'bookmarkSaved':'bookmark',saved)+
   rdTool('Add personal note to section','data-rd="section-note"'+a,'note',false,items.some(x=>x.kind==='note'&&x.target?.kind==='section'))+
   (count?rdTool('View '+count+' saved items from this section','data-rd="view-section"'+a,'saved',false,true):'');
 }
 function paragraphToolbar(n,segment,relevant){
  const bookmark=relevant.some(r=>r.kind==='paragraph'),notesCount=relevant.filter(r=>r.kind==='note').length;
  const attrs=' data-section="'+esc(n)+'" data-segment="'+segment+'"';
  return rdTool(bookmark?'Remove paragraph bookmark':'Bookmark paragraph',
    'data-rd="paragraph-bookmark"'+attrs+' aria-pressed="'+bookmark+'"',
    bookmark?'paragraphSaved':'paragraph',bookmark)+
   rdTool('Add personal note to paragraph','data-rd="paragraph-note"'+attrs,'note',false,notesCount>0)+
   (relevant.length?rdTool('View '+relevant.length+' saved items for paragraph '+(segment+1),'data-rd="view-paragraph"'+attrs,'saved',false,true):'');
 }
 function refreshReaderAfterBookmark(target){
  if(state.route!=='reader')return;
  if(!target||!['section','paragraph'].includes(target.kind)){afterReader();return;}
  const reader=$('#reader');if(!reader)return;
  const n=String(target.section),items=active().filter(r=>String(r.target?.section)===n);
  reader.querySelectorAll('.gn-rd-section-tools').forEach(tools=>{
   if(tools.querySelector('[data-rd="section-bookmark"]')?.dataset.section===n)
    tools.innerHTML=sectionToolbar(n,items);
  });
  if(target.kind!=='paragraph')return;
  const segment=Number(target.segment);
  reader.querySelectorAll('.gn-rd-passage-tools').forEach(tools=>{
   const btn=tools.querySelector('[data-rd="paragraph-bookmark"]');
   if(btn?.dataset.section===n&&Number(btn.dataset.segment)===segment)
    tools.innerHTML=paragraphToolbar(n,segment,items.filter(r=>r.target?.segment===segment));
  });
 }
 function afterReader(){
  if(state.route!=='reader')return;
  const reader=$('#reader');if(!reader)return;
  if(state.focusMode||state.focusLevel===3||!showPersonalMarks()){
   reader.querySelectorAll('.gn-rd-passage-tools,.gn-rd-section-tools,.gn-rd-inline-panel').forEach(x=>x.remove());
   markReader();decorate();return;
  }
  // Group once: continuous reading can display hundreds of bilingual passages.
  // Filtering all saved records separately for every passage caused O(passages × notes) work.
  const bySection=new Map(),byParagraph=new Map();
  for(const row of active()){
   const t=row.target;if(t?.section==null)continue;
   const n=String(t.section);
   if(!bySection.has(n))bySection.set(n,[]);
   bySection.get(n).push(row);
   if(t.segment!=null){
    const key=n+':'+t.segment;
    if(!byParagraph.has(key))byParagraph.set(key,[]);
    byParagraph.get(key).push(row);
   }
  }
  const header=reader.querySelector(':scope > .reader-heading');
  if(header){
   const n=String(state.n),items=bySection.get(n)||[];
   let tools=header.nextElementSibling;
   if(!tools?.classList.contains('gn-rd-section-tools')){tools=document.createElement('div');tools.className='gn-rd-section-tools';header.after(tools);}
   tools.setAttribute('role','toolbar');tools.setAttribute('aria-label','Section actions');
   tools.innerHTML=sectionToolbar(n,items);
  }
  reader.querySelectorAll('.passage-grid').forEach(grid=>{
   const segment=Number(grid.dataset.segment),n=String(grid.closest('[data-reading-section]')?.dataset.readingSection||state.n);
   const relevant=byParagraph.get(n+':'+segment)||[];
   let tools=grid.nextElementSibling;
   if(!tools?.classList.contains('gn-rd-passage-tools')){tools=document.createElement('div');tools.className='gn-rd-passage-tools';grid.after(tools);}
   tools.setAttribute('role','toolbar');tools.setAttribute('aria-label','Paragraph '+(segment+1)+' actions');
   tools.innerHTML=paragraphToolbar(n,segment,relevant);
  });
  markReader();decorate();syncActionStates();ensureVisualsToggle();
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
  if(state.focusMode||state.focusLevel===3||!showPersonalMarks())return;
  const marks=[],annotations=[];
  for(const item of active()){
   const t=item.target;
   if(!isResolved(item)||t?.kind!=='quote'||!t.section)continue;
   // In continuous mode, state.n identifies one active section but many others
   // are visible: find each item's actual containing section.
   const root=$('#gn-continuous-'+CSS.escape(String(t.section)))||
    document.querySelector('#reader [data-reading-section="'+CSS.escape(String(t.section))+'"]')||
    (String(t.section)===String(state.n)?$('#reader'):null);
   const side=root?.querySelector('.passage-grid[data-segment="'+t.segment+'"] .passage-'+(t.lang==='ar'?'ar':'en'));
   if(!side)continue;
   const range=findRange(side,t);
   if(range)(item.kind==='note'?annotations:marks).push(range);
  }
  if(marks.length)CSS.highlights.set('gn-rd-bookmark',new Highlight(...marks));
  if(annotations.length)CSS.highlights.set('gn-rd-note',new Highlight(...annotations));
 }
 function followSharedSourceLink(){
  if(state.route!=='reader')return;
  const hash=location.hash||'';
  if(hash===lastSourceDeepLink||!hash.startsWith('#section=')||!/[&]segment=/.test(hash))return;
  lastSourceDeepLink=hash;
  const part=hash.match(/(?:^|&)segment=(\d+)/),segment=part?Number(part[1]):NaN;
  if(!Number.isInteger(segment)||segment<0||segment>2000)return;
  const sectionId=decodeURIComponent(hash.slice(9).split('&')[0]);
  const selection=hash.match(/(?:^|&)selection=([^&]*)/),language=hash.match(/(?:^|&)lang=(ar|en)/);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   const root=$('#gn-continuous-'+CSS.escape(sectionId))||
    document.querySelector('#reader [data-reading-section="'+CSS.escape(sectionId)+'"]')||$('#reader');
   const grid=root?.querySelector('.passage-grid[data-segment="'+segment+'"]');
   if(!grid)return;
   grid.scrollIntoView({block:'center',behavior:'instant'});
   if(selection&&window.CSS?.highlights&&typeof Highlight!=='undefined'){
    let quotation='';
    try{quotation=decodeURIComponent(selection[1])}catch(_){return;}
    const side=grid.querySelector('.passage-'+(language?.[1]==='ar'?'ar':'en'));
    const range=side?findRange(side,{quote:quotation,offset:0}):null;
    if(range)CSS.highlights.set('gn-rd-target',new Highlight(range));
   }
  }));
 }
 function saveDeskReturnState(){
  try{sessionStorage.setItem('gnamma-reading-desk-return-v2',JSON.stringify({at:Date.now(),ui:{
   category:ui.category,sourceType:ui.sourceType,sort:ui.sort,query:ui.query,selected:ui.selected,
   context:ui.context,expanded:ui.expanded,filterTarget:ui.filterTarget,filterSegment:ui.filterSegment,
   mobileDetail:ui.mobileDetail,listScroll:ui.listScroll},readingOrigin:readingOrigin||null}));}catch(_){}
 }
 function restoreDeskReturnState(){
  if(!location.hash.startsWith('#bookmarks'))return;
  try{
   const raw=sessionStorage.getItem('gnamma-reading-desk-return-v2');
   const data=raw?JSON.parse(raw):null;
   if(!data||Date.now()-data.at>86400000)return;
   const x=data.ui||{};
   if(CATEGORIES.includes(x.category)||x.category==='bin')ui.category=x.category;
   if(['all','text','booknotes','dictionary','index','bidaya','lessons'].includes(x.sourceType))ui.sourceType=x.sourceType;
   if(Object.hasOwn(SORTS,x.sort))ui.sort=x.sort;
   ui.query=clamp(x.query,250);ui.selected=clamp(x.selected,100);
   ui.context=['both','ar','en'].includes(x.context)?x.context:'both';
   ui.expanded=!!x.expanded;ui.filterTarget=clamp(x.filterTarget,30);
   ui.filterSegment=Number.isInteger(x.filterSegment)?x.filterSegment:null;
   ui.mobileDetail=!!x.mobileDetail;ui.listScroll=Number(x.listScroll)||0;
   if(data.readingOrigin&&Date.now()-Number(data.readingOrigin.at||0)<86400000)readingOrigin=data.readingOrigin;
   sessionStorage.removeItem('gnamma-reading-desk-return-v2');
  }catch(_){}
 }
 function enterDeskFromText(sectionId,segment=null,itemId=''){
  const targetSection=String(sectionId||state.n);
  readingOrigin={section:targetSection,segment,scroll:window.scrollY||0,at:Date.now()};
  closeContext();
  ui.filterTarget=targetSection;ui.filterSegment=segment;
  ui.category='all';ui.sourceType='all';ui.sort='source';ui.query='';
  ui.selected=itemId;ui.mobileDetail=!!itemId&&matchMedia('(max-width:760px)').matches;
  ui.listScroll=0;
  ctx.navigate('bookmarks');
  window.scrollTo({top:0,behavior:'instant'});
 }
 function returnToReading(){
  const t=readingOrigin;if(!t)return;
  readingOrigin=null;ui.mobileDetail=false;
  ctx.goSection(t.section);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   const root=$('#gn-continuous-'+CSS.escape(t.section))||$('#reader');
   const exact=t.segment!==null?root?.querySelector('.passage-grid[data-segment="'+t.segment+'"]'):null;
   if(exact)exact.scrollIntoView({block:'center',behavior:'instant'});
   else window.scrollTo({top:t.scroll||0,behavior:'instant'});
  }));
 }
 function openSource(r){
  const t=r.target;if(!t){ctx.notify('This note has no attached source.');return;}
  const existing=$('#mainContent .gn-rd-page');
  if(existing){
   if(!ui.mobileDetail)ui.listScroll=window.scrollY||0;
   origin={id:r.id,created:Date.now()};
   saveDeskReturnState();
  }
  closeContext();
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
     if(range){
      try{const rect=range.getBoundingClientRect();window.scrollBy({top:rect.top-Math.min(innerHeight*.36,240),behavior:'instant'});}catch(_){}
      if(window.CSS?.highlights&&typeof Highlight!=='undefined')CSS.highlights.set('gn-rd-target',new Highlight(range));
     }else{
      grid?.scrollIntoView({block:'center',behavior:'instant'});
      ctx.notify('Exact wording not located; opened its containing paragraph.');
     }
    }else if(t.kind==='section')readingRoot?.scrollIntoView({block:'start',behavior:'instant'});
    else (grid||$('#reader'))?.scrollIntoView({block:'center',behavior:'instant'});
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
   if(ui.listScroll&&!ui.mobileDetail)requestAnimationFrame(()=>requestAnimationFrame(()=>window.scrollTo({top:ui.listScroll,behavior:'instant'})));
  }
  if(route==='reader'){afterReader();followSharedSourceLink();}else{closeContext();decorate();}
  document.body.classList.toggle('gn-rd-returning',!!origin&&route!=='bookmarks');
  if(origin&&route!=='bookmarks'){
   const main=$('#mainContent');if(main&&!main.querySelector('.gn-rd-return')){
    const bar=document.createElement('nav');bar.className='gn-rd-return';bar.setAttribute('aria-label','Return to saved item');
    bar.innerHTML='<button type="button" data-rd="return">← Back to Reading Desk</button><button type="button" data-rd="dismiss-return" aria-label="Dismiss Reading Desk return">×</button>';
    main.prepend(bar);
   }
  }
 }
 function toDesk(){
  ui.selected=origin?.id||ui.selected;
  const y=ui.listScroll;origin=null;
  try{sessionStorage.removeItem('gnamma-reading-desk-return-v2');}catch(_){}
  document.body.classList.remove('gn-rd-returning');ctx.navigate('bookmarks');
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   if(state.route==='bookmarks')window.scrollTo({top:ui.mobileDetail?0:y,behavior:'instant'});
  }));
 }
 function textForShare(r){
  const t=r.target||null;let txt=(r.title||titleOf(t))+'\n'+subOf(t);
  if(t?.quote)txt+='\n\n“'+t.quote+'”';
  if(r.kind==='note')txt+='\n\nMy note:\n'+r.body;
  else if(t?.kind==='dictionary')txt+='\n\n'+(book.glossary.find(x=>x.term===t.term)?.definition||'');
  else if(t?.kind==='application')txt+='\n\n'+(ctx.apps.get(t.app)?.text||'');
  txt+='\n\nSource: '+canonicalURL(t);
  if(txt.length>15000)return txt.slice(0,14500)+'\n\n[Excerpt only: this shared text was shortened. The full saved note remains in Reading Desk; export Markdown or JSON for complete content.]';
  return txt;
 }
 function canonicalURL(t){
  const base=new URL('index.html',location.href).href.split('#')[0];
  if(!t)return base+'#bookmarks';
  if(['quote','paragraph','section','footnote'].includes(t.kind)){
    let hash='#section='+encodeURIComponent(t.section);
    if(Number.isInteger(Number(t.segment))&&t.segment!==undefined&&t.segment!==null){hash+='&segment='+Number(t.segment);
     if(t.kind==='quote'&&t.quote){hash+='&lang='+(t.lang==='ar'?'ar':'en')+'&selection='+encodeURIComponent(String(t.quote).slice(0,300));}}
    return base+hash;
   }
  if(t.kind==='application')return base+'#application='+encodeURIComponent(t.app);
  if(t.kind==='lesson')return base+'#study?topic='+encodeURIComponent(t.lesson)+'&level='+encodeURIComponent(t.level);
  if(t.kind==='dictionary')return t.historical?new URL('dictionary.html',location.href).href.split('#')[0]+'#view=all&term='+encodeURIComponent(t.term):base+'#glossary';
  if(t.kind==='index')return base+'#index';
  return base+'#bookmarks';
 }
 async function shareItem(r,email=false){
  const value=textForShare(r);
  if(email){const body=value.length>7000?value.slice(0,6450)+'\n\n[Email excerpt shortened; export Markdown or JSON for complete content.]':value;location.href='mailto:?subject='+encodeURIComponent('Reading Desk · '+(r.title||titleOf(r.target)).slice(0,80))+'&body='+encodeURIComponent(body);return;}
  if(navigator.share){try{await navigator.share({title:r.title||titleOf(r.target),text:value,url:canonicalURL(r.target)});return;}catch(e){if(e.name==='AbortError')return;}}
  try{await navigator.clipboard.writeText(value);ctx.notify('Text and source link copied for sharing.');}catch(e){ctx.notify('Sharing unavailable. Use Email or Print.');}
 }
 function backup(){if(loadFailure)return untouchedStorage||'';return JSON.stringify({...storedEnvelope,format:FORMAT,version:VERSION,exported:new Date().toISOString(),items:records},null,2);}
 function download(text,name){
  const blob=new Blob([text],{type:name.endsWith('.md')?'text/markdown;charset=utf-8':'application/json;charset=utf-8'}),url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=name;a.style.display='none';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
 }
 async function shareBackup(){
  const fileName=loadFailure?'Reading-Desk-original-recovery.txt':'Reading-Desk-'+new Date().toISOString().slice(0,10)+'.json',data=backup();
  if(typeof File!=='undefined'&&navigator.share){
   const file=new File([data],fileName,{type:'application/json'});
   if(!navigator.canShare||navigator.canShare({files:[file]})){
    try{await navigator.share({files:[file],title:loadFailure?'Original Reading Desk data (recovery)':'Reading Desk backup',text:loadFailure?'The original file has not been changed.':'Private Reading Desk data — import into Darūrī.'});return;}
    catch(e){if(e?.name==='AbortError')return;}
   }
  }
  download(data,fileName);ctx.notify('Backup downloaded. Share the file with Mail or Files.');
 }
 function importFile(file){
  if(!file)return;
  if(file.size>12*1024*1024){ctx.notify('Backup is too large (maximum 12 MB). The existing collection is unchanged.');return;}
  const reader=new FileReader();
  reader.onload=()=>{
   try{
    const parsed=JSON.parse(reader.result);
    if(parsed?.format!==FORMAT||parsed.version!==VERSION||!Array.isArray(parsed.items))throw Error('not a Reading Desk backup');
    if(parsed.items.length>20000)throw Error('too many items (maximum 20,000)');
    const incoming=parsed.items.map(sanitize).filter(Boolean);if(parsed.items.length&&!incoming.length)throw Error('No valid entries found');
    const merged=records.slice(),byId=new Map(merged.map(r=>[r.id,r])),now=Date.now();let changes=0;
    for(const row of incoming){
     const prior=byId.get(row.id);
     if(!prior){merged.push(row);byId.set(row.id,row);changes++;continue;}
     if(row.updated>prior.updated){
      const i=merged.indexOf(prior);merged[i]=row;byId.set(row.id,row);changes++;continue;
     }
     if(row.updated!==prior.updated)continue;
     // Upgraded timestamp fields alone must not duplicate identical notes.
     const contentFields=['kind','target','title','body','deleted','standalone'];
     const contentDiffers=contentFields.some(k=>JSON.stringify(row[k])!==JSON.stringify(prior[k]));
     if(!contentDiffers){
      if((prior.dateSource!=='recorded'&&row.dateSource==='recorded')||row.modified>prior.modified){
       const richer={...prior,dateSource:row.dateSource==='recorded'?'recorded':prior.dateSource,
        modified:Math.max(prior.modified||0,row.modified||0),created:prior.created||row.created};
       const i=merged.indexOf(prior);merged[i]=richer;byId.set(row.id,richer);changes++;
      }
      continue;
     }
     const copy={...row,id:uuid(),title:(row.title||titleOf(row.target))+' · Imported version',updated:now};
     merged.push(copy);changes++;
    }
    if(merged.length>20000)throw Error('too many combined items (maximum 20,000)');
    const before=records;records=merged;if(!persist()){records=before;throw Error('Browser storage unavailable');}ui.category='all';ui.filterTarget='';ui.selected='';render();
    ctx.notify(changes+' items merged. Existing and newer items were kept.');
   }catch(e){ctx.notify('Could not import this Reading Desk backup: '+short(e.message,80));}
  };
  reader.onerror=()=>ctx.notify('Could not read the chosen backup file.');
  reader.readAsText(file);
 }
 function exportMarkdown(){
  const rows=matching().filter(r=>!r.deleted);
  if(!rows.length){ctx.notify('Nothing to export from this view.');return;}
  const lines=['# Darūrī · Reading Desk','','Personal research collection · '+dateDisplay(Date.now(),true),'','Order: '+(SORTS[ui.sort]||'Current view'),''];
  for(const r of rows){
   lines.push('## '+(r.title||titleOf(r.target)),'',subOf(r.target),'');
   lines.push(dateLine(r,true),'');
   if(r.target?.quote)lines.push('> '+r.target.quote.replace(/\n/g,'\n> '),'');
   else if(r.target&&['paragraph','section'].includes(r.target.kind)){
    lines.push('### Arabic',sourceText(r.target,'ar'),'','### English',sourceText(r.target,'en'),'');
   }else if(r.target?.kind==='footnote')lines.push(ctx.notes.get(r.target.noteId)?.text||'','');
   if(r.kind==='note')lines.push('### My note',r.body,'');
   lines.push('Source: '+canonicalURL(r.target),'','---','');
  }
  download(lines.join('\n'),'Reading-Desk-'+new Date().toISOString().slice(0,10)+'.md');
  ctx.notify('Readable Markdown notes exported. Keep JSON backups for importing.');
 }
 function invalidateDeskPdf(){
  printRevision++;
  if(deskPdfURL){try{URL.revokeObjectURL(deskPdfURL);}catch(_){}}
  deskPdfURL=null;deskPdfFile=null;
  const result=printRoot?.querySelector('#gn-rd-pdf-result');
  if(result)result.hidden=true;
 }
 function printMessage(message,error=false){
  const status=printRoot?.querySelector('#gn-rd-pdf-message');
  if(status){status.textContent=message;status.classList.toggle('gn-rd-error',Boolean(error));}
 }
 function closePrintPreview(){
  if(!printRoot)return;
  invalidateDeskPdf();
  const focus=printFocus;printFocus=null;printRoot.remove();printRoot=null;printSelection=null;
  document.body.classList.remove('gn-rd-print');
  if(focus?.isConnected)focus.focus({preventScroll:true});
 }
 function ensureDeskPdf(){
  if(window.GnammaDeskPdf)return Promise.resolve(window.GnammaDeskPdf);
  if(deskPdfPromise)return deskPdfPromise;
  deskPdfPromise=new Promise((resolve,reject)=>{
   const script=document.createElement('script');
   script.async=true;script.src=new URL('reading-desk-pdf.js?v=20261021-rdiconpdf1',location.href).href;
   const timer=setTimeout(()=>{script.remove();reject(Error('Local PDF exporter did not load. Use Print instead.'));},18000);
   script.onload=()=>{clearTimeout(timer);window.GnammaDeskPdf?resolve(window.GnammaDeskPdf):reject(Error('PDF exporter was not initialised.'));};
   script.onerror=()=>{clearTimeout(timer);script.remove();reject(Error('PDF exporter unavailable. Try Print or reconnect once for offline caching.'));};
   document.head.append(script);
  }).catch(error=>{deskPdfPromise=null;throw error;});
  return deskPdfPromise;
 }
 async function downloadDeskPdf(){
  if(!printRoot||printingPDF)return;
  const root=printRoot,revision=printRevision,button=root.querySelector('[data-rd="download-pdf"]');
  printingPDF=true;if(button){button.disabled=true;button.setAttribute('aria-busy','true');}
  printMessage('Creating a PDF on this device…');
  try{
   const exporter=await ensureDeskPdf(),output=await exporter.makePdf(root);
   if(root!==printRoot||revision!==printRevision)return;
   invalidateDeskPdf();
   deskPdfFile=new File([output.blob],'Daruri-Reading-Desk-'+new Date().toISOString().slice(0,10)+'.pdf',{type:'application/pdf'});
   deskPdfURL=URL.createObjectURL(deskPdfFile);
   const link=root.querySelector('#gn-rd-pdf-link');
   link.href=deskPdfURL;link.download=deskPdfFile.name;
   const result=root.querySelector('#gn-rd-pdf-result');
   if(result)result.hidden=false;
   const share=root.querySelector('[data-rd="share-pdf"]');
   if(share)share.hidden=!(navigator.share&&(!navigator.canShare||navigator.canShare({files:[deskPdfFile]})));
   const warning=output.warnings.length?
    ' Some uncommon characters could not be embedded ('+output.warnings.length+'). Use Print for exact glyph fidelity.':'';
   printMessage('PDF ready — '+output.pages+' '+(output.pages===1?'page':'pages')+'. If the download did not start, tap Download ready PDF below.'+warning);
   link.click();
  }catch(error){
   if(root===printRoot)printMessage('PDF could not be created: '+String(error?.message||error)+'. Use Print or download a JSON backup.',true);
  }finally{
   printingPDF=false;
   if(button?.isConnected){button.disabled=false;button.removeAttribute('aria-busy');}
  }
 }
 async function shareDeskPdf(){
  if(!deskPdfFile){printMessage('Download a PDF first.');return;}
  if(navigator.share){
   try{await navigator.share({files:[deskPdfFile],title:'Reading Desk PDF'});return;}
   catch(error){if(error?.name==='AbortError')return;}
  }
  printMessage('File sharing is unavailable. Use Download ready PDF and your device’s Files or Share menu.',true);
 }
 function printSourcePreview(t){
  if(!t||!['quote','paragraph','section'].includes(t.kind))return '';
  const limit=printPrefs.full?100000:900;
  const excerpt=(lang)=>{
   const raw=sourceText(t,lang);
   if(!raw){
    if(t.kind==='quote'&&t.lang===lang)return String(t.quote||'');
    return '';
   }
   if(printPrefs.full||raw.length<=limit)return raw;
   if(t.kind==='quote'&&t.lang===lang&&t.quote){
    const quoted=String(t.quote),where=raw.indexOf(quoted);
    if(where>=0){
     const before=Math.max(0,where-250),after=Math.min(raw.length,where+quoted.length+260);
     return (before?'… ':'')+raw.slice(before,after)+(after<raw.length?' …':'');
    }
    // Do not invent the location when a historical wording no longer matches.
    return quoted+' [original saved quotation; wording not found in current paragraph]';
   }
   return raw.slice(0,limit)+' …';
  };
  const texts=(printPrefs.arabic?'<section class="gn-rd-print-ar" lang="ar" dir="rtl">'+esc(excerpt('ar'))+'</section>':'')+
    (printPrefs.english?'<section class="gn-rd-print-en" lang="en">'+esc(excerpt('en'))+'</section>':'');
  return '<div class="gn-rd-print-bilingual">'+texts+'</div>';
 }
 function printGroup(items){
  if(!items.length)return '';
  const first=items[0],t=first.target;
  let html='<article class="gn-rd-print-entry"><h2>'+esc(subOf(t))+'</h2>';
  if(items.some(r=>!isResolved(r)))html+='<p class="gn-rd-print-unavailable">Original source unavailable in this edition; saved content preserved</p>';
  const pass=items.find(r=>r.target&&['quote','paragraph','section'].includes(r.target.kind));
  if(pass)html+=printSourcePreview(pass.target);
  else if(t?.kind==='footnote'){
   const note=ctx.notes.get(t.noteId);html+='<p>'+esc(note?.en||note?.text||note?.body||note?.content||t.noteId)+'</p>';
  }else if(t?.kind==='dictionary')html+='<p>'+esc(book.glossary.find(g=>g.term===t.term)?.definition||'Historical dictionary entry')+'</p>';
  else if(t?.kind==='index')html+='<p>'+esc(t.term+(t.sub?' · '+t.sub:''))+'</p>';
  else if(t?.kind==='application')html+='<p>'+esc(ctx.apps.get(t.app)?.text||'')+'</p>';
  else if(t?.kind==='lesson')html+='<p>'+esc(window.DARURI_STUDY_DATA?.lessons?.find(l=>l.id===t.lesson)?.summary||'')+'</p>';
  const seen=new Set();
  const savedSelections=items.filter(r=>r.target?.quote).map(r=>r.target);
  for(const t of savedSelections){const key=t.lang+':'+t.quote;if(seen.has(key))continue;seen.add(key);
   html+='<blockquote lang="'+(t.lang==='ar'?'ar':'en')+'" dir="'+(t.lang==='ar'?'rtl':'ltr')+'">'+esc(t.quote)+'</blockquote>';}
  for(const r of items){
   if(r.kind==='note'){
    if(!printPrefs.personal)continue;
    html+='<section class="gn-rd-print-personal"><h3>'+esc(r.title||'My note')+'</h3>'+
      '<p>'+escFull(r.body).replace(/\n/g,'<br>')+'</p>'+
      (printPrefs.dates?'<small>'+esc(dateLine(r,true))+'</small>':'')+'</section>';
   }else{
    if(printPrefs.bookmarkDates)html+='<p class="gn-rd-print-record-date">'+esc(dateLine(r,true))+'</p>';
   }
  }
  html+='<p class="gn-rd-print-url">'+(items.some(r=>!isResolved(r))?'Original source reference: ':'Source: ')+esc(canonicalURL(t))+'</p></article>';
  return html;
 }
 function printGroups(rows){
  if(printPrefs.order!=='source')return rows.map(r=>[r]);
  const groups=new Map();
  for(const r of rows){
   const k=r.target?sourceKey(r.target):'unattached:'+r.id;
   if(!groups.has(k))groups.set(k,[]);
   groups.get(k).push(r);
  }
  return [...groups.values()];
 }
 function updatePrintSheet(){
  if(!printRoot)return;
  const scoped=printSelection?printSelection.map(id=>records.find(r=>r.id===id)).filter(Boolean):
   printPrefs.scope==='all'?active():matching();
  const all=scoped.filter(r=>printPrefs.personal||r.kind!=='note');
  const rows=printPrefs.order==='shown'?all:
    printPrefs.order==='source'?sortItems(all,'source'):
    sortItems(all,printPrefs.order);
  const groups=printGroups(rows),container=printRoot.querySelector('#gn-rd-print-sheet-body');
  if(!container)return;
  container.innerHTML=groups.map(printGroup).join('')||'<p>No items match the selected PDF options.</p>';
  const orderLabel=printPrefs.order==='shown'?'As currently displayed':printPrefs.order==='source'?'Source order':SORTS[printPrefs.order]||'Current order';
  const scopeLabel=printSelection?'selected item':printPrefs.scope==='all'?'all saved items':'current filtered results';
  printRoot.querySelector('#gn-rd-print-order-summary').textContent=rows.length+' included · '+scopeLabel+' · '+orderLabel;
  const caption=printRoot.querySelector('#gn-rd-print-sheet-subtitle');
  if(caption)caption.textContent='al-Ḍarūrī · '+rows.length+' '+(rows.length===1?'saved item':'saved items')+
   (printSelection?' · selected item':printPrefs.scope==='all'?' · entire collection':' · filtered view');
 }
 function preparePrint(selected){
  const subset=selected?selected.filter(Boolean):matching();
  const allSaved=active();
  if(selected?!subset.length:!allSaved.length){ctx.notify('Nothing to print in this Reading Desk yet.');return;}
  closePrintPreview();
  printSelection=selected?subset.map(r=>r.id):null;
  printPrefs.scope=selected?'single':(subset.length?'visible':'all');
  const options=[['source','Text / source order'],['created-asc','Oldest saved first'],
   ['created-desc','Newest saved first'],['shown','As currently displayed']];
  const choice=(key,title,checked)=>'<label class="gn-rd-print-check"><input type="checkbox" data-rd-print-option="'+key+'"'+
   (checked?' checked':'')+'> '+title+'</label>';
  printFocus=document.activeElement;printRoot=document.createElement('div');printRoot.id='gn-rd-print-root';
  printRoot.setAttribute('role','dialog');printRoot.setAttribute('aria-modal','true');
  printRoot.setAttribute('aria-label','Reading Desk print and PDF settings');
  const scopeControl=selected?'<p class="gn-rd-print-single">Exporting this selected saved item</p>':
    '<label for="gn-rd-print-scope">Items <select id="gn-rd-print-scope" data-rd-print-option="scope">'+
    '<option value="visible"'+(printPrefs.scope==='visible'?' selected':'')+'>Current results ('+subset.length+')</option>'+
    '<option value="all"'+(printPrefs.scope==='all'?' selected':'')+'>All saved items ('+allSaved.length+')</option></select></label>';
  printRoot.innerHTML='<div class="gn-rd-print-actions"><div><h2>Reading Desk · Print &amp; PDF</h2>'+
   '<p id="gn-rd-print-order-summary"></p></div><div class="gn-rd-print-buttons">'+
   '<button type="button" class="gn-rd-print-primary" data-rd="download-pdf">'+RD_ICON.download+'<span>Download PDF</span></button>'+
   '<button type="button" data-rd="print-now">'+RD_ICON.print+'<span>Print</span></button>'+
   '<button type="button" data-rd="close-print">'+RD_ICON.close+'<span>Close</span></button></div></div>'+
   '<div class="gn-rd-print-options" aria-label="PDF settings">'+
   '<div class="gn-rd-print-fields">'+scopeControl+
   '<label for="gn-rd-print-order">Order <select id="gn-rd-print-order" data-rd-print-option="order">'+
   options.map(([value,title])=>'<option value="'+value+'"'+(printPrefs.order===value?' selected':'')+'>'+title+'</option>').join('')+
   '</select></label></div>'+
   '<fieldset class="gn-rd-print-check-group"><legend>Languages</legend>'+
   choice('arabic','Arabic',printPrefs.arabic)+choice('english','English',printPrefs.english)+'</fieldset>'+
   '<fieldset class="gn-rd-print-check-group"><legend>Include in export</legend>'+
   choice('personal','Personal notes',printPrefs.personal)+
   choice('dates','Note dates',printPrefs.dates)+
   choice('bookmarkDates','Bookmark dates',printPrefs.bookmarkDates)+
   choice('full','Full source passages',printPrefs.full)+'</fieldset></div>'+
   '<p id="gn-rd-pdf-message" class="gn-rd-pdf-message" role="status" aria-live="polite">'+
   'Download PDF creates a file on this device. Print opens the browser printing interface.</p>'+
   '<div id="gn-rd-pdf-result" class="gn-rd-pdf-result" hidden><a id="gn-rd-pdf-link" download>Download ready PDF</a>'+
   '<button type="button" data-rd="share-pdf" hidden>Share PDF…</button></div>'+
   '<main class="gn-rd-print-sheet"><header><h1>Reading Desk</h1>'+
   '<p id="gn-rd-print-sheet-subtitle"></p></header><div id="gn-rd-print-sheet-body"></div></main>';
  document.body.append(printRoot);document.body.classList.add('gn-rd-print');
  updatePrintSheet();
  printRoot.querySelector('[data-rd="download-pdf"]')?.focus({preventScroll:true});
 }
 function handle(event){
  const btn=event.target.closest?.('[data-rd]');if(!btn)return;
  event.preventDefault();event.stopImmediatePropagation();
  const id=btn.dataset.id,action=btn.dataset.rd,row=records.find(r=>r.id===id);
  btn.closest('.gn-rd-manage-menu,.gn-rd-item-more')?.removeAttribute?.('open');
  if(action==='filter'){ui.category=btn.dataset.value;ui.selected='';ui.mobileDetail=false;ui.listScroll=0;if(ui.category==='bin'){ui.filterTarget='';ui.filterSegment=null;ui.sourceType='all';}render();window.scrollTo({top:0,behavior:'instant'});return;}
  if(action==='source-filter'){ui.sourceType=btn.dataset.value;ui.selected='';ui.mobileDetail=false;render();return;}
  if(action==='sort-filter'){ui.sort=btn.dataset.value;ui.selected='';ui.mobileDetail=false;render();return;}
  if(action==='toggle-marks'){
   const checked=!showPersonalMarks();
   try{localStorage.setItem('gnamma-rd-show-personal-marks',String(checked));}
   catch(_){ctx.notify('Cannot save this preference in this browser.');return;}
   document.querySelectorAll('#gn-rd-visuals-toggle').forEach(input=>{input.checked=checked;});
   if(state.route==='bookmarks')render();else if(state.route==='reader')afterReader();
   ctx.notify(checked?'Personal marks enabled.':'Personal marks hidden during reading.');return;
  }
  if(action==='unscoped'){ui.filterTarget='';ui.filterSegment=null;ui.category='all';ui.selected='';ui.mobileDetail=false;render();return;}
  if(action==='select'||action==='related'){
   if(action==='related'){ui.category='all';ui.sourceType='all';ui.filterTarget='';ui.filterSegment=null;}
   if(!ui.mobileDetail||action==='select')ui.listScroll=window.scrollY||0;ui.selected=id;ui.context='both';ui.expanded=false;
   ui.mobileDetail=matchMedia('(max-width:760px)').matches;
   const scroll=window.scrollY;render();window.scrollTo({top:ui.mobileDetail?0:scroll,behavior:'instant'});
   if(ui.mobileDetail)$('#gn-rd-detail .gn-rd-mobile-back')?.focus({preventScroll:true});return;
  }
  if(action==='detail-back'){
   ui.mobileDetail=false;render();
   requestAnimationFrame(()=>window.scrollTo({top:ui.listScroll||0,behavior:'instant'}));return;
  }
  if(action==='language'){ui.context=btn.dataset.value;const scroll=window.scrollY;render();window.scrollTo({top:scroll,behavior:'instant'});return;}
  if(action==='expand'){ui.expanded=!ui.expanded;const scroll=window.scrollY;render();window.scrollTo({top:scroll,behavior:'instant'});return;}
  if(action==='selection-dismiss'){hideSelection();return;}
  if(action==='selection-bookmark'&&selection){upsert('quote',selection);hideSelection();window.getSelection()?.removeAllRanges();return;}
  if(action==='selection-note'&&selection){const chosen={...selection};hideSelection();window.getSelection()?.removeAllRanges();showEditor(chosen);return;}
  if(action==='section-bookmark'){toggleSection(String(btn.dataset.section||state.n));return;}
  if(action==='paragraph-bookmark'||action==='paragraph-note'){
   const n=String(btn.dataset.section||state.n),segment=Number(btn.dataset.segment);
   const target={kind:'paragraph',section:n,segment,lang:state.lang==='arabic'?'ar':'en'};
   if(action==='paragraph-note'){showEditor(target);return;}
   const prior=active().find(x=>x.kind==='paragraph'&&x.target?.section===n&&x.target?.segment===segment);
   if(prior)trash(prior.id);else upsert('paragraph',target);
   return;
  }
    if(action==='view-paragraph'){showContext(String(btn.dataset.section||state.n),Number(btn.dataset.segment),btn);return;}
  if(action==='view-section'){enterDeskFromText(String(btn.dataset.section||state.n));return;}
  if(action==='section-note'){showEditor({kind:'section',section:String(btn.dataset.section||state.n)});return;}
  if(action==='close-context'){closeContext();return;}
  if(action==='go-desk-item'&&row){const t=row.target||{};enterDeskFromText(String(t.section||state.n),t.segment==null?null:Number(t.segment),row.id);return;}
  if(action==='go-desk-passage'){enterDeskFromText(String(btn.dataset.section||state.n),Number(btn.dataset.segment));return;}
  if(action==='trash-inline'&&row){trash(id);closeContext();afterReader();return;}
  if(action==='attach-bookmark'||action==='attach-note'||action==='attach-view'){
   let target;try{target=validateTarget(JSON.parse(decodeURIComponent(btn.dataset.target)))}catch(e){}
   if(!target){ctx.notify('Cannot find this reference.');return;}
   if(action==='attach-note'){showEditor(target);return;}
   const found=active().find(r=>r.kind===target.kind&&r.target&&keyOf(r.target)===keyOf(target));
   if(action==='attach-bookmark'){if(found)trash(found.id);else upsert(target.kind,target);return;}
   if(!found){ctx.notify('This reference is not bookmarked.');return;}
   if(target.section)enterDeskFromText(target.section,target.segment==null?null:target.segment,found.id);
   else{ui.category='all';ui.sourceType='all';ui.selected=found.id;ui.filterTarget='';ui.filterSegment=null;ui.mobileDetail=matchMedia('(max-width:760px)').matches;ctx.navigate('bookmarks');}
   return;
  }
  if(action==='new-note'){showEditor(null);return;}
  if(action==='save-note'){saveEditor();return;}
  if(action==='close-editor'){closeEditor();return;}
  if(action==='trash'&&row){trash(id);return;}
  if(action==='restore'&&row){moveMany([id],true);ctx.notify('Restored to Reading Desk.');return;}
  if(action==='delete-permanent'&&row){if(confirm('Permanently delete this item? This cannot be undone.')){const prior=records;records=records.filter(x=>x.id!==id);if(!persist()){records=prior;ctx.notify('Deletion could not be saved.');return;}render();}return;}
  if(action==='undo'&&lastUndo){moveMany([lastUndo],true);lastUndo=null;const t=$('#gn-rd-undo');if(t)t.hidden=true;return;}
  if(action==='restore-all'){moveMany(records.filter(r=>r.deleted).map(r=>r.id),true);return;}
  if(action==='empty-bin'){if(confirm('Permanently delete everything in Bin? This cannot be undone.')){const prior=records;records=records.filter(r=>!r.deleted);if(!persist()){records=prior;ctx.notify('Could not empty the Bin.');return;}render();}return;}
  if(action==='open'&&row){if(!isResolved(row)){ctx.notify('Source unavailable: the saved item has been preserved. Open its details to relink.');return;}openSource(row);return;}
  if(action==='relink'&&row){showRelink(row);return;}
  if(action==='relink-close'){closeRelink();return;}
  if(action==='relink-save'){saveRelink();return;}
  if(action==='add-note'&&row){showEditor(row.target);return;}
  if(action==='edit'&&row){showEditor(row.target,row);return;}
  if(action==='share'&&row){shareItem(row);return;}
  if(action==='email'&&row){shareItem(row,true);return;}
  if(action==='print'&&row){preparePrint([row]);return;}
  if(action==='print-list'){preparePrint();return;}
  if(action==='download-pdf'){void downloadDeskPdf();return;}
  if(action==='share-pdf'){void shareDeskPdf();return;}
  if(action==='print-now'){
   if(!printRoot)return;
   try{window.print();printMessage('Print dialog requested. If it does not appear, use Download PDF.');}
   catch(_){printMessage('Your browser blocked printing. Select Download PDF above.',true);}
   return;
  }
  if(action==='close-print'){closePrintPreview();return;}
  if(action==='export'){if(loadFailure){download(untouchedStorage||'','Reading-Desk-original-recovery.txt');ctx.notify('Original, unmodified browser data downloaded.');}else{download(backup(),'Reading-Desk-'+new Date().toISOString().slice(0,10)+'.json');ctx.notify('Reading Desk backup downloaded.');}return;}
  if(action==='download-original'){if(untouchedStorage!==null){download(untouchedStorage,'Reading-Desk-original-recovery.txt');ctx.notify('Untouched original data downloaded.');}return;}
  if(action==='refresh-storage'){load(true);ui.selected='';ui.mobileDetail=false;ui.filterTarget='';ui.filterSegment=null;render();ctx.notify('Reading Desk refreshed from current browser storage.');return;}
  if(action==='share-backup'){shareBackup();return;}
  if(action==='import'){$('#gn-rd-file')?.click();return;}
  if(action==='export-markdown'){exportMarkdown();return;}
  if(action==='return'){toDesk();return;}
  if(action==='return-reading'){returnToReading();return;}
  if(action==='dismiss-return'){origin=null;try{sessionStorage.removeItem('gnamma-reading-desk-return-v2');}catch(_){}document.body.classList.remove('gn-rd-returning');$('.gn-rd-return')?.remove();return;}
 }
 function install(){
  if(ready)return;ready=true;
  load();restoreDeskReturnState();
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
   if($('#gn-rd-relink-shade')){e.preventDefault();closeRelink();return;}
   if($('#gn-rd-editor-shade')){e.preventDefault();e.stopImmediatePropagation();closeEditor();}
   else if($('#gn-rd-inline-panel'))closeContext();
   else if(!$('#gn-rd-selection-bar')?.hidden)hideSelection();
  },true);
  document.addEventListener('keydown',e=>{
   if($('#gn-rd-relink-shade')&&e.key==='Tab'){
    const nodes=[...$('#gn-rd-relink-shade').querySelectorAll('button,select')].filter(x=>!x.disabled);
    if(!nodes.length)return;
    if(e.shiftKey&&document.activeElement===nodes[0]){e.preventDefault();nodes.at(-1).focus();}
    else if(!e.shiftKey&&document.activeElement===nodes.at(-1)){e.preventDefault();nodes[0].focus();}
    return;
   }
   if(printRoot&&e.key==='Tab'){
    const nodes=[...printRoot.querySelectorAll('button,input,select')].filter(x=>!x.disabled);if(!nodes.length)return;
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
  window.addEventListener?.('storage',e=>{
   if(e.key!==KEY||loadFailure||e.newValue===untouchedStorage)return;
   writeConflict=true;available=false;
   if(state.route==='bookmarks')render();
   ctx.notify('Saved items changed in another tab. Reload Reading Desk before editing.');
  });
  document.addEventListener('change',e=>{
   const element=e.target;
   if(element?.id==='gn-rd-relink-section'){updateRelinkSegments();return;}
   if(element?.id==='gn-rd-file'){importFile(element.files?.[0]);element.value='';}
   if(element?.id==='gn-rd-source'){ui.sourceType=element.value;ui.selected='';ui.mobileDetail=false;render();}
   if(element?.id==='gn-rd-sort'){ui.sort=element.value;ui.selected='';ui.mobileDetail=false;render();}
   if(element?.id==='gn-rd-indicators'||element?.id==='gn-rd-visuals-toggle'){
    try{localStorage.setItem('gnamma-rd-show-personal-marks',String(element.checked));}catch(_){}
    document.querySelectorAll('#gn-rd-indicators,#gn-rd-visuals-toggle').forEach(input=>{input.checked=element.checked;});
    ctx.notify(element.checked?'Personal marks enabled.':'Personal marks hidden during reading.');
    if(state.route==='reader')afterReader();
   }
   if(element?.dataset?.rdPrintOption){
    const key=element.dataset.rdPrintOption;
    if(!Object.hasOwn(printPrefs,key))return;
    if(key==='scope'&&!['visible','all'].includes(element.value))return;
    printPrefs[key]=element.type==='checkbox'?element.checked:element.value;
    updatePrintSheet();
    invalidateDeskPdf();
   }
  });
  document.addEventListener('input',e=>{if(e.target?.id==='gn-rd-query'){ui.query=e.target.value;const focusId=document.activeElement.id;const pos=e.target.selectionStart;render();const input=$('#'+focusId);input?.focus({preventScroll:true});input?.setSelectionRange?.(pos,pos);}});
  ensureVisualsToggle();
  const host=$('#detailContent');if(host){const observer=new MutationObserver(()=>{if(!decorating)queueMicrotask(decorate);});observer.observe(host,{subtree:true,childList:true});}
  const main=$('#mainContent');if(main){let scheduled=false;new MutationObserver(()=>{if(scheduled||decorating)return;scheduled=true;queueMicrotask(()=>{scheduled=false;decorate();});}).observe(main,{subtree:true,childList:true});}
 }
 install();
 return {render,afterRender,afterReader,toggleSection,decorate,openSource,backup,records:()=>records,
  openAt:(section,segment=null,kind='all')=>{
   enterDeskFromText(String(section),segment);
   if(kind==='notes'||kind==='bookmarks'||kind==='highlights'){
    ui.category=kind==='notes'?'mine':kind;
    if(state.route==='bookmarks')render();
   }
  }
 };
}
window.GnammaReadingDesk={create};
})();