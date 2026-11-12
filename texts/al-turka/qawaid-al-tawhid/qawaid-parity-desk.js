/* Qawtaw17 Qawaid/Tamhid personal Reading Desk.
 * Shares Daruri bookmark icon vocabulary but uses separate book-specific storage.
 * Legacy Qawaid passage bookmarks and private notes are preserved/read, not deleted.
 */
(function(){
'use strict';
const KEY='gnamma:qawaid:desk:v1',LEGACY='gnamma:qawaid:reading:v2',FORMAT='gnamma-qawaid-reading-desk';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fold=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f\u064b-\u065f\u0670]/g,'');
const stamp=()=>new Date().toISOString();
const uuid=()=>globalThis.crypto?.randomUUID?.()||'q-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
let records=[],locked=false,conflict=false,unreadable='',unknown={},dialog=null,tab='all',sort='created-desc',filter='',origin=null,selection=null,selected=null,feedback='';
function parse(s){if(!s)return null;return JSON.parse(s);}
function load(){
 try{const raw=localStorage.getItem(KEY);if(!raw)return;const j=parse(raw);
  if(!j||j.schema!==FORMAT||!Array.isArray(j.records))throw Error('Unknown Reading Desk schema');
  records=j.records.filter(x=>x&&typeof x.id==='string'&&x.target&&typeof x.kind==='string');
  unknown=Object.fromEntries(Object.entries(j).filter(([k])=>!['schema','version','records'].includes(k)));
 }catch(e){locked=true;unreadable=localStorage.getItem(KEY)||'';console.warn('Reading Desk locked to preserve unreadable saved data',e);}
}
function legacy(){
 try{const v=parse(localStorage.getItem(LEGACY));return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}catch(_){return {};}
}
function legacyRows(){
 const r=[],v=legacy();
 for(const id of Array.isArray(v.bookmarks)?v.bookmarks:[])if(/^QT-\d{3}$/.test(id))
   r.push({id:'legacy-bookmark-'+id,kind:'section',target:{id},title:'Bookmarked '+id,quote:'',body:'',created:'',legacy:true,deleted:false});
 for(const [id,body] of Object.entries(v.personal||{}))if(body&&/^QT-\d{3}$/.test(id))
   r.push({id:'legacy-note-'+id,kind:'note',target:{id},title:'My note · '+id,quote:'',body:String(body),created:'',legacy:true,deleted:false});
 return r;
}
function merged(){
 const present=new Set(records.filter(x=>!x.deleted).map(x=>x.kind+'|'+x.target.id+'|'+(x.quote||'')));
 return [...records,...legacyRows().filter(x=>!present.has(x.kind+'|'+x.target.id+'|'+(x.quote||'')))];
}
function persist(next){
 if(locked||conflict){feedback='Saved data is protected; export the untouched backup before further edits.';return false;}
 try{const copy={schema:FORMAT,version:1,...unknown,records:next};
  localStorage.setItem(KEY,JSON.stringify(copy));records=next;feedback='Saved in this browser.';return true;
 }catch(_){feedback='Storage write failed. No new item was saved.';return false;}
}
function save(row){
 const t=stamp(),r={id:uuid(),kind:row.kind,target:row.target,title:row.title||row.kind,
  quote:row.quote||'',lang:row.lang||'',body:row.body||'',created:t,updated:t,deleted:false};
 const ok=persist([...records,r]);if(ok)render();return ok;
}
function currentId(){return window.GnammaQawaidReader?.activePassage?.()||'QT-001';}
function srcQuote(id){
 const matn=window.GNAMMA_QAWAID_MATN?.units||[];
 const u=matn.find(x=>x.id===id);
 return u?.title||id;
}
function add(kind,id,quote='',lang='',paragraph=null,body='',title=''){
 if(!id||!/^QT-\d{3}$|^SH-(?:INTRO-)?\d{3}(?:-[A-Z])?$/.test(id))return false;
 if(kind==='section'&&merged().some(x=>!x.deleted&&x.kind==='section'&&x.target.id===id))return true;
 return save({kind,target:{id,paragraph,lang},title:title||srcQuote(id),quote,lang,body});
}
function serialize(){
 return JSON.stringify({schema:FORMAT,version:1,...unknown,exportedAt:stamp(),records},null,2);
}
function download(data,name,mime){
 const u=URL.createObjectURL(new Blob([data],{type:mime||'application/json;charset=utf-8'}));
 const a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(u),1000);
}
function list(){
 const rows=merged().filter(x=>tab==='bin'?!!x.deleted:!x.deleted);
 const match=rows.filter(x=>(tab==='all'||tab==='bin'||(tab==='bookmarks'&&x.kind==='section')||
 (tab==='highlights'&&['quote','paragraph'].includes(x.kind))||(tab==='notes'&&x.kind==='note')||
 (tab==='references'&&['term','source','index'].includes(x.kind)))&&
 (!filter||fold([x.title,x.quote,x.body,x.target?.id].join(' ')).includes(fold(filter))));
 if(sort==='alpha')match.sort((a,b)=>a.title.localeCompare(b.title));
 else if(sort==='source')match.sort((a,b)=>(a.target?.id||'').localeCompare(b.target?.id||''));
 else if(sort==='created-asc')match.sort((a,b)=>(a.created||'').localeCompare(b.created||''));
 else match.sort((a,b)=>(b.created||'').localeCompare(a.created||''));
 return match;
}
function icon(kind){
 const api=window.GnammaBookmarkUI;
 if(kind==='section'||kind==='paragraph')return api?.icon?.({kind:kind==='paragraph'?'paragraph':'section'})||'◇';
 if(kind==='note')return api?.noteIcon?.()||'✎';
 if(kind==='quote')return api?.highlightIcon?.()||'✎';
 return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 5h14M5 12h14M5 19h10"/></svg>';
}
function render(){
 if(!dialog?.open)return;
 const kinds=[['all','All'],['bookmarks','Bookmarks'],['highlights','Highlights & quotes'],['notes','My notes'],['references','Sources'],['bin','Bin']];
 $('#qaw-desk-main').innerHTML=
 (locked?'<div class="qaw-error" role="alert"><b>Saved data protected.</b> Unreadable or unfamiliar data will not be overwritten. <button data-desk="raw">Download untouched data</button></div>':'')+
 (conflict?'<div class="qaw-error" role="alert">Another tab changed your collection. New writes are paused. <button data-desk="reload">Reload saved work</button></div>':'')+
 '<p class="qaw-help">Private notes, bookmarks and exact quotations stay in this browser. Legacy Qawāʿid records are preserved.</p>'+
 '<nav class="qaw-desk-tabs" aria-label="Saved categories">'+kinds.map(([k,label])=>'<button type="button" data-desk-tab="'+k+'" aria-pressed="'+(tab===k)+'">'+esc(label)+'</button>').join('')+'</nav>'+
 '<div class="qaw-flex qaw-desk-controls"><label>Find saved work<input type="search" id="qaw-desk-filter" value="'+esc(filter)+'" placeholder="Title or quotation"></label>'+
 '<label>Sort<select id="qaw-desk-sort">'+[['created-desc','Newest'],['created-asc','Oldest'],['source','Source order'],['alpha','Title A–Z']].map(([k,t])=>'<option value="'+k+'"'+(sort===k?' selected':'')+'>'+t+'</option>').join('')+'</select></label></div>'+
 '<div class="qaw-flex"><button data-desk="new" type="button">Add personal note</button><button data-desk="bookmark" type="button">Bookmark current passage</button>'+
 '<button data-desk="export" type="button">Export JSON backup</button><button data-desk="import" type="button">Import JSON</button>'+
 '<button data-desk="print" type="button">Print saved work / Save as PDF</button></div>'+
 '<input id="qaw-desk-file" type="file" accept="application/json,.json" hidden>'+
 (feedback?'<p class="qaw-help" role="status">'+esc(feedback)+'</p>':'')+
 '<div class="qaw-desk-items">'+(list().map(x=>'<article class="qaw-desk-card"><div class="qaw-desk-title">'+icon(x.kind)+
 '<div><b>'+esc(x.title)+'</b><small>'+esc(x.target?.id)+' · '+esc(x.kind)+(x.legacy?' · Earlier Qawāʿid save':'')+'</small></div></div>'+
 (x.quote?'<blockquote dir="auto">'+esc(x.quote)+'</blockquote>':'')+
 (x.body?'<p>'+esc(x.body)+'</p>':'')+
 '<div class="qaw-flex"><button data-desk-open="'+esc(x.id)+'">Go to text</button>'+
 (x.kind==='note'&&!x.legacy?'<button data-desk-edit="'+esc(x.id)+'">Edit</button>':'')+
 (!x.legacy?(x.deleted?'<button data-desk-restore="'+esc(x.id)+'">Restore</button><button data-desk-delete="'+esc(x.id)+'">Delete permanently</button>':
 '<button data-desk-trash="'+esc(x.id)+'">Move to bin</button>'):'')+'</div></article>').join('')||'<p>No saved items in this view.</p>')+'</div>';
}
function close(){if(dialog?.open)dialog.close();}
function show(mode){if(mode&&['all','bookmarks','highlights','notes','references','bin'].includes(mode))tab=mode;
 if(!dialog)make();if(!dialog.open)dialog.showModal();render();}
function openItem(id){
 const r=merged().find(x=>x.id===id);if(!r)return;
 close();
 if(r.target?.id?.startsWith('SH-INTRO'))location.href='commentary.html#'+r.target.id;
 else if(r.target?.id){location.hash='#'+r.target.id;window.dispatchEvent(new Event('hashchange'));}
}
function editNote(row){
 if(locked||conflict)return;
 const now=row?records.find(x=>x.id===row):null;
 const val=prompt('Personal note (private to this browser)',now?.body||'');if(val===null)return;
 if(now){const update=records.map(x=>x.id===now.id?{...x,body:val,updated:stamp()}:x);persist(update);render();}
 else add('note',currentId(),'','',null,val,'Personal note · '+currentId());
}
function updated(id,change){
 const orig=records.find(x=>x.id===id);if(!orig)return;
 persist(records.map(x=>x.id===id?{...x,...change,updated:stamp()}:x));render();
}
function selectionCapture(){
 const sel=getSelection?.();if(!sel||sel.isCollapsed)return null;
 const text=sel.toString().trim();if(text.length<2||text.length>1500)return null;
 const node=sel.anchorNode?.parentElement,other=sel.focusNode?.parentElement;
 const p=node?.closest?.('.text-pair .ar p,.text-pair .en p');
 const end=other?.closest?.('.text-pair .ar p,.text-pair .en p');
 if(!p||p!==end||!p.closest('#reading'))return null;
 const target=p.closest('.sharh-layer,.layered-unit');
 if(!target?.id)return null;
 const lang=p.closest('.ar')?'ar':'en';
 const pp=Array.from(p.parentElement.querySelectorAll('p'));
 const paragraph=pp.indexOf(p);
 if(paragraph<0||!p.textContent.includes(text))return null;
 return {text,id:target.id,paragraph,lang};
}
function capture(){const x=selectionCapture();if(x)selection=x;return x;}
function savedHighlight(id){return records.filter(x=>!x.deleted&&x.kind==='quote'&&x.target?.id===id);}
function marks(){
 if(!window.CSS?.highlights||!window.Highlight)return;
 const chunks=new Map();
 for(const r of records.filter(x=>!x.deleted&&x.kind==='quote'&&x.quote&&x.target?.id)){
  const id=r.target.id,scope=document.getElementById(id);if(!scope)continue;
  const lang=r.lang==='ar'?'ar':'en';
  const textNodes=scope.querySelectorAll('.'+lang+' p');
  const p=textNodes[r.target.paragraph];if(!p)continue;
  const text=p.textContent,i=text.indexOf(r.quote);if(i<0)continue;
  const walker=document.createTreeWalker(p,NodeFilter.SHOW_TEXT),nodes=[];
  let n,total=0;
  while((n=walker.nextNode())){nodes.push({node:n,start:total,end:total+n.length});total+=n.length;}
  const st=nodes.find(x=>x.end>i),en=nodes.find(x=>x.end>=i+r.quote.length);
  if(!st||!en)continue;
  const range=document.createRange();range.setStart(st.node,i-st.start);range.setEnd(en.node,i+r.quote.length-en.start);
  if(!chunks.has(id))chunks.set(id,[]);chunks.get(id).push(range);
 }
 CSS.highlights.delete('qawaid-saved');const ranges=[...chunks.values()].flat();if(ranges.length)CSS.highlights.set('qawaid-saved',new Highlight(...ranges));
}
function attach(){
 let floater=document.createElement('div');floater.id='qaw-selection-tools';floater.hidden=true;
 floater.innerHTML='<button type="button" data-desk-selection="quote">Highlight</button>'+
 '<button type="button" data-desk-selection="paragraph">Bookmark paragraph</button>'+
 '<button type="button" data-desk-selection="note">Note on selection</button>';
 document.body.append(floater);
 const update=()=>{const x=capture();floater.hidden=!x;if(x){const rect=getSelection().getRangeAt(0).getBoundingClientRect();
 floater.style.top=Math.min(window.innerHeight-52,Math.max(8,rect.bottom+6))+'px';
 floater.style.left=Math.min(window.innerWidth-230,Math.max(8,rect.left))+'px';}};
 document.addEventListener('mouseup',()=>setTimeout(update,50));
 document.addEventListener('keyup',e=>{if(e.key==='Shift'||e.key.startsWith('Arrow'))setTimeout(update,50);});
 floater.addEventListener('mousedown',e=>e.preventDefault());
 floater.addEventListener('click',e=>{
  const kind=e.target.dataset.deskSelection,x=selection;floater.hidden=true;if(!x)return;
  if(kind==='quote')add('quote',x.id,x.text,x.lang,x.paragraph,'','Highlighted '+x.id);
  if(kind==='paragraph')add('paragraph',x.id,x.text,x.lang,x.paragraph,'','Paragraph '+x.id);
  if(kind==='note'){const body=prompt('Note on selected words',x.text+' — ');if(body!==null)add('note',x.id,x.text,x.lang,x.paragraph,body,'Note · '+x.id);}
  getSelection()?.removeAllRanges();marks();
 });
 const region=$('#reading-list');if(region){new MutationObserver(()=>requestAnimationFrame(marks)).observe(region,{childList:true});}
 document.addEventListener('click',e=>{if(!floater.contains(e.target))floater.hidden=true;});
}
function make(){
 dialog=document.createElement('dialog');dialog.id='qaw-desk-dialog';dialog.className='qaw-parity-dialog';
 dialog.setAttribute('aria-label','Reading Desk');
 dialog.innerHTML='<header class="qaw-parity-head"><strong>Reading Desk · Private collection</strong><button data-desk="close" type="button" aria-label="Close">×</button></header><div id="qaw-desk-main"></div>';
 document.body.append(dialog);
 dialog.addEventListener('click',e=>{
  if(e.target===dialog){close();return;}
  const t=e.target.closest('button');if(!t)return;
  if(t.dataset.deskTab){tab=t.dataset.deskTab;render();return;}
  if(t.dataset.deskOpen){openItem(t.dataset.deskOpen);return;}
  if(t.dataset.deskEdit){editNote(t.dataset.deskEdit);return;}
  if(t.dataset.deskTrash){updated(t.dataset.deskTrash,{deleted:true});return;}
  if(t.dataset.deskRestore){updated(t.dataset.deskRestore,{deleted:false});return;}
  if(t.dataset.deskDelete){if(confirm('Permanently delete this saved item?'))persist(records.filter(x=>x.id!==t.dataset.deskDelete));render();return;}
  const k=t.dataset.desk;
  if(k==='close')close();if(k==='new')editNote(null);
  if(k==='bookmark'){add('section',currentId());render();}
  if(k==='export')download(serialize(),'qawaid-reading-desk-backup.json');
  if(k==='raw')download(unreadable,'qawaid-unreadable-original.txt','text/plain;charset=utf-8');
  if(k==='reload'){conflict=false;locked=false;records=[];load();render();}
  if(k==='import')$('#qaw-desk-file')?.click();
  if(k==='print'){
   const rows=list();const html='<html><meta charset="utf-8"><title>Qawāʿid · My Reading Desk</title>'+
   '<style>body{font:13pt/1.6 Georgia,serif;margin:20mm}h1{font-size:22pt}article{break-inside:avoid;margin:14px 0;border-bottom:1px solid #bbb;padding:8px}blockquote{font:17pt/1.7 serif}</style>'+
   '<h1>Qawāʿid / Tamhīd — my private saved work</h1><p>Personal annotations, not publisher apparatus.</p>'+
   rows.map(x=>'<article><h2>'+esc(x.title)+'</h2><p>'+esc(x.target.id)+'</p><blockquote dir="auto">'+esc(x.quote)+'</blockquote><p>'+esc(x.body)+'</p></article>').join('')+'</html>';
   const p=window.open('','_blank');if(p){p.document.open();p.document.write(html);p.document.close();p.focus();p.print();}
   else feedback='Allow pop-ups to print your saved notes as a separate PDF.';render();
  }
 });
 let filterTimer=0;
 dialog.addEventListener('input',e=>{if(e.target.id!=='qaw-desk-filter')return;
  filter=e.target.value;if(e.isComposing)return;clearTimeout(filterTimer);
  const at=e.target.selectionStart;
  filterTimer=setTimeout(()=>{render();const input=$('#qaw-desk-filter');input?.focus({preventScroll:true});if(at!=null)input?.setSelectionRange?.(Math.min(at,filter.length),Math.min(at,filter.length));},160);
 });
 dialog.addEventListener('change',async e=>{
  const t=e.target;if(t.id==='qaw-desk-sort'){sort=t.value;render();return;}
  if(t.id!=='qaw-desk-file'||!t.files?.length)return;
  try{
   const contents=await t.files[0].text(),obj=JSON.parse(contents);
   if(obj.schema!==FORMAT||!Array.isArray(obj.records))throw Error('Not a Qawāʿid Reading Desk backup');
   if(obj.records.length>10000)throw Error('Backup is too large to import safely');
   const incoming=obj.records.filter(x=>x&&typeof x.id==='string'&&x.target&&typeof x.kind==='string');
   const index=new Map(records.map(x=>[x.id,x]));
   let added=0;for(const row of incoming){if(!index.has(row.id)){index.set(row.id,row);added++;}}
   if(!confirm('Import '+added+' new items from this backup? Existing records will not be overwritten.'))return;
   persist([...index.values()]);render();
  }catch(err){feedback='Import not applied: '+err.message;render();}
 });
}
load();
window.addEventListener('storage',e=>{if(e.key===KEY){conflict=true;feedback='Another tab changed saved work; writes are paused.';render();}});
window.GnammaQawaidDesk=Object.freeze({open:show,close,records:merged,add,bookmarks:()=>merged().filter(x=>!x.deleted&&x.kind==='section'),refresh:marks,capture});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach,{once:true});else attach();
})();
