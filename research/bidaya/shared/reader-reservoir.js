
const subjectSearch=document.getElementById('subject-search');
if(subjectSearch)subjectSearch.addEventListener('input',()=>{
 const aliases={};
 const raw=subjectSearch.value.toLowerCase().trim();const q=aliases[raw]||raw;
 document.querySelectorAll('.subject-group').forEach(group=>{
  let visible=0;group.querySelectorAll('.subject-link').forEach(a=>{const matches=!q||a.dataset.search.includes(q);a.hidden=!matches;if(matches)visible++});
  group.hidden=visible===0;if(q&&visible)group.open=true;
 });
});
const censusSearch=document.getElementById('census-search');
if(censusSearch)censusSearch.addEventListener('input',()=>{
 const q=censusSearch.value.toLowerCase().trim();
 document.querySelectorAll('.primary-book').forEach(book=>{
  const all=!q||book.querySelector('summary').textContent.toLowerCase().includes(q);
  let found=0;book.querySelectorAll('tbody tr').forEach(row=>{const match=all||row.textContent.toLowerCase().includes(q);row.hidden=!match;if(match)found++});
  book.hidden=!(all||found);if(q&&!book.hidden)book.open=true;
 });
});
function revealBook(){
 const id=decodeURIComponent(location.hash.slice(1));if(!id)return;
 const target=document.getElementById(id);if(!target)return;
 const book=target.closest('.primary-book');if(book){book.hidden=false;book.open=true;book.querySelectorAll('tr').forEach(r=>r.hidden=false)}
}
addEventListener('hashchange',revealBook);revealBook();
const sourceNotes=JSON.parse(document.getElementById('scripture-data').textContent),sourceById=new Map(sourceNotes.map(n=>[n.id,n]));
const notes=JSON.parse(document.getElementById('principle-data').textContent),byId=new Map(notes.map(n=>[n.id,n]));
const pop=document.getElementById('principle-popover'),noteBody=document.getElementById('note-body');
let active=null,pinned=false,closeTimer,suppressPreview=false;
function esc(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')}
function contents(n){return '<div class="kind">'+esc(n.kind)+'</div><h2 id="note-title">'+esc(n.title)+'</h2><p>'+esc(n.warrant)+'</p><p class="limit"><strong>Limit.</strong> '+esc(n.limit)+'</p><p class="source"><strong>Source.</strong> '+esc(n.locator)+'<br><a href="'+esc(n.source_pages_url)+'" >View cited source pages</a></p><div class="note-help">'+esc(n.id)+' · Click a reference to keep the note open. Escape closes it.</div>'}
function eventContexts(n){return (n.event_contexts||[]).map(c=>{
 const layers=c.textual_basis?[
  ['The passage',c.textual_basis],['Setting and reported occasion',c.summary],
  ['Its ethical argument — manuscript interpretation',c.ethical_argument],
  ['What the commentary explains',c.contextual_commentary],['The spiritual reading',document.body.dataset.edition==='law'?'':c.spiritual_commentary]
 ]:[['Setting',c.summary],['Commentary',c.commentary]];
 return '<div class="event-context"><p class="context-label">'+esc(c.kind)+'</p>'+layers.filter(x=>x[1]).map(([label,text])=>'<p><strong>'+esc(label)+'.</strong> '+esc(text)+'</p>').join('')+'<p class="witness">'+esc(c.assessment)+'</p>'+(c.translation_policy?'<p class="witness">'+esc(c.translation_policy)+'</p>':'')+'<ul class="source-links">'+c.sources.map(s=>'<li><a href="'+esc(s.url)+'" target="_blank" rel="noopener">'+esc(s.label)+'</a></li>').join('')+'</ul></div>';
 }).join('')}

function citationDetails(n){
 const readings=n.citation_readings||[],verses=n.cited_verses||[],excerpt=n.citation_excerpt;
 let body=readings.map(r=>'<div class="citation-reading"><p class="context-label">'+esc(r.title)+'</p><p>'+esc(r.text)+'</p></div>').join('');
 body+=verses.map(v=>'<div class="citation-verse"><p class="context-label">'+esc(v.key)+'</p><p class="arabic-passage" lang="ar" dir="rtl">'+esc(v.text)+'</p>'+(v.reading?'<p><strong>Reading of this verse.</strong> '+esc(v.reading)+'</p>':'')+'<p><a href="'+esc(v.url)+'" target="_blank" rel="noopener">Open this verse in the source</a></p></div>').join('');
 if(excerpt&&!verses.length)body+='<details class="cited-excerpt"'+(!readings.length?' open':'')+'><summary>'+(excerpt.language==='ar'?'Arabic passage at this citation':'Passage at this citation')+'</summary><p'+(excerpt.language==='ar'?' class="arabic-passage" lang="ar" dir="rtl"':'')+'>'+esc(excerpt.text)+'</p><p class="witness">Electronic text beginning at line '+excerpt.line+'. This is an opening excerpt; use the source link for the full context.</p></details>';
 if(!readings.length&&!verses.length&&!excerpt)body+='<p class="witness">This reference identifies a source passage. A separate summary for this citation has not yet been recorded; the source remains available below.</p>';
 if((n.related_contexts||[]).length)body+='<details class="related-contexts"><summary>Full case discussion</summary><ul class="source-links">'+n.related_contexts.map(c=>'<li><a href="'+esc(c.url)+'" target="_blank" rel="noopener">'+esc(c.title)+'</a></li>').join('')+'</ul></details>';
 return body;
}
function sourceContents(n){
 const combined=Boolean(n.explicit_context_id);
 let body='<div class="kind">'+esc(n.kind)+'</div><h2 id="note-title">'+esc(n.title)+'</h2>'+(n.author?'<p><strong>'+esc(n.author)+'</strong></p>':'')+'<p class="source"><strong>Citation.</strong> '+esc(n.locator)+'</p>';
 body+=combined?eventContexts(n):citationDetails(n);
 if(n.commentary_status)body+='<p class="witness">'+esc(n.commentary_status)+'</p>';
 if(n.witness_note)body+='<p class="witness">'+esc(n.witness_note)+'</p>';
 if(n.source_url)body+='<p><a href="'+esc(n.source_url)+'" target="_blank" rel="noopener">Open cited passage</a></p>';
 if(n.links.length)body+='<details><summary>Commentaries and sources cited here</summary><ul class="source-links">'+n.links.map(l=>'<li><a href="'+esc(l.url)+'" target="_blank" rel="noopener">'+esc(l.label)+'</a></li>').join('')+'</ul></details>';
 return body+'<div class="note-help">Click to keep this note open. Hover or focus another reference to switch. Escape closes it.</div>';
}
function place(){if(!active||pop.hidden)return;const r=active.getBoundingClientRect(),w=pop.offsetWidth,h=pop.offsetHeight;let x=Math.max(12,Math.min(r.left,innerWidth-w-12));let y=r.bottom+8;if(y+h>innerHeight-12)y=Math.max(12,r.top-h-8);pop.style.left=x+'px';pop.style.top=y+'px'}
function show(btn,lock=false){clearTimeout(closeTimer);if(active&&active!==btn)active.setAttribute('aria-expanded','false');active=btn;pinned=lock;btn.setAttribute('aria-expanded','true');const source=Boolean(btn.dataset.sourceNote);pop.classList.toggle('source-note',source);noteBody.innerHTML=source?sourceContents(sourceById.get(btn.dataset.sourceNote)):contents(byId.get(btn.dataset.principle));pop.hidden=false;pop.scrollTop=0;place()}
function hide(){clearTimeout(closeTimer);if(active)active.setAttribute('aria-expanded','false');pop.hidden=true;pinned=false;active=null}
function scheduleClose(){if(!pinned)closeTimer=setTimeout(hide,240)}
// Pinning keeps the note open when leaving its button, but must never make a
// different citation display that old note. A new preview supersedes the pin.
function preview(btn){if(suppressPreview||(typeof matchMedia==='function'&&matchMedia('(hover: none)').matches))return;clearTimeout(closeTimer);if(active!==btn||pop.hidden)show(btn)}
function closeAndReturnFocus(){const returnTo=active;hide();if(returnTo){suppressPreview=true;try{returnTo.focus()}finally{suppressPreview=false}}}
document.querySelectorAll('.principle-ref,.source-ref').forEach(btn=>{btn.addEventListener('mouseenter',()=>preview(btn));btn.addEventListener('mouseleave',scheduleClose);btn.addEventListener('focus',()=>preview(btn));btn.addEventListener('blur',()=>setTimeout(()=>{if(!pinned&&!pop.contains(document.activeElement))scheduleClose()},0));btn.addEventListener('click',()=>{if(active===btn&&pinned)hide();else show(btn,true)})});
pop.addEventListener('mouseenter',()=>clearTimeout(closeTimer));pop.addEventListener('mouseleave',scheduleClose);pop.addEventListener('focusin',()=>clearTimeout(closeTimer));
document.getElementById('note-close').addEventListener('click',closeAndReturnFocus);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!pop.hidden){e.preventDefault();closeAndReturnFocus()}});
document.addEventListener('click',e=>{if(!pop.hidden&&!pop.contains(e.target)&&!e.target.closest('.principle-ref,.source-ref'))hide()});
addEventListener('resize',place);addEventListener('scroll',()=>{if(pinned)place();else hide()},{passive:true});
const dialog=document.getElementById('principle-dialog'),search=document.getElementById('principle-search'),results=document.getElementById('register-results');
function list(){const q=search.value.toLocaleLowerCase();const found=notes.filter(n=>[n.id,n.label,n.title,n.kind,n.warrant,n.limit].join(' ').toLocaleLowerCase().includes(q));results.innerHTML='<p><small>'+found.length+' of '+notes.length+' entries</small></p>'+found.map(n=>'<section class="register-card"><small>'+esc(n.id+' · '+n.kind)+'</small><h3>'+esc(n.title)+'</h3><p>'+esc(n.warrant)+'</p><p><strong>Limit.</strong> '+esc(n.limit)+'</p><p><small>'+esc(n.locator)+'</small><br><a href="'+esc(n.source_pages_url)+'" >View cited source pages</a></p></section>').join('')}
document.getElementById('open-register').addEventListener('click',()=>{hide();list();dialog.showModal();search.focus()});document.getElementById('close-register').addEventListener('click',()=>dialog.close());search.addEventListener('input',list);
// One compact menu on phones and tablets, with keyboard and touch dismissal.
const menu=document.getElementById('menu-toggle');
const readerSidebar=document.getElementById('reader-sidebar');
const navClose=document.getElementById('nav-close');
const navScrim=document.getElementById('nav-scrim');
const readerMain=document.querySelector('main');
function setReaderMenu(open,returnFocus=false){
 document.body.classList.toggle('show-nav',open);
 menu.setAttribute('aria-expanded',String(open));
 readerMain.inert=open;
 if(open){hide();navClose.focus();}
 else if(returnFocus)menu.focus();
}
menu.addEventListener('click',()=>setReaderMenu(!document.body.classList.contains('show-nav'),true));
navClose.addEventListener('click',()=>setReaderMenu(false,true));
navScrim.addEventListener('click',()=>setReaderMenu(false,true));
readerSidebar.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setReaderMenu(false,true)));
document.getElementById('mobile-open-register').addEventListener('click',()=>{
 setReaderMenu(false,true);document.getElementById('open-register').click();
});
dialog.addEventListener('close',()=>{if(matchMedia('(max-width:900px)').matches)menu.focus();});
document.addEventListener('keydown',e=>{
 if(!document.body.classList.contains('show-nav'))return;
 if(e.key==='Escape'){e.preventDefault();setReaderMenu(false,true);return;}
 if(e.key==='Tab'){
  const items=[...readerSidebar.querySelectorAll('a,button,input,summary')].filter(n=>n.getClientRects().length&&!n.disabled);
  const first=items[0],last=items[items.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 }
});
addEventListener('resize',()=>{if(innerWidth>900&&document.body.classList.contains('show-nav'))setReaderMenu(false);});

// Persist preferences when the host permits local storage; the reader remains
// functional in file views and privacy modes that deny it.
const readingToggles=[...document.querySelectorAll('[data-layer-toggle]')];
const readingNodes=[...document.querySelectorAll('[data-reading-layer],[data-inline-layers]')];
const readingHeadings=[...document.querySelectorAll('[data-reading-heading]')];
const readingRoutes=[...document.querySelectorAll('[data-reading-route]')];
const readingStorageKey='gnamma-bidaya-'+document.body.dataset.edition+'-reservoir';
const readingState=Object.fromEntries(readingToggles.map(t=>[t.dataset.layerToggle,true]));
try{const saved=JSON.parse(localStorage.getItem(readingStorageKey)||'null');if(saved&&typeof saved==='object')for(const key of Object.keys(readingState))if(typeof saved[key]==='boolean')readingState[key]=saved[key];}catch{}
function readingNodeVisible(node){
 // An inward exposition belongs to both scriptural and spiritual inquiry.
 // Either layer reveals the single paragraph and its own source references.
 if(node.dataset.readingLayer){
  return [node.dataset.readingLayer,...(node.dataset.readingAlso||'').split(' ').filter(Boolean)].some(key=>readingState[key]!==false);
 }
 if(node.dataset.inlineLayers==='scripture'){
  const enclosing=node.parentNode?.closest('[data-reading-layer]');
  if(enclosing&&[enclosing.dataset.readingLayer,...(enclosing.dataset.readingAlso||'').split(' ')].includes('symbols'))return readingNodeVisible(enclosing);
 }
 const keys=(node.dataset.inlineLayers||node.dataset.readingLayer||'').split(' ').filter(Boolean);
 return keys.every(key=>readingState[key]!==false);
}
function readingHeadingVisible(heading){
 const level=Number(heading.dataset.readingHeading);let next=heading.nextElementSibling;
 while(next){
  if(/^H[1-6]$/.test(next.tagName)&&Number(next.tagName.slice(1))<=level)break;
  if(!next.hidden&&!/^H[1-6]$/.test(next.tagName)&&next.tagName!=='NAV'&&next.textContent.trim())return true;
  next=next.nextElementSibling;
 }
 return false;
}
function applyReadingLayers({save=true,keepPosition=true}={}){
 // Keep a visible paragraph near the top in place when filtering content above
 // it. Avoid snapping back to the old URL fragment while the reader has scrolled.
 const marker=keepPosition?[...document.querySelectorAll('#manuscript > p, #manuscript > h2')].find(n=>!n.hidden&&readingNodeVisible(n)&&n.getBoundingClientRect().bottom>72):null;
 const markerTop=marker?.getBoundingClientRect().top;
 hide();
 for(const t of readingToggles)t.checked=readingState[t.dataset.layerToggle];
 for(const n of readingNodes)n.hidden=!readingNodeVisible(n);
 for(const n of readingRoutes)n.hidden=readingState[n.dataset.readingRoute]===false;
 for(const h of [...readingHeadings].reverse())h.hidden=!readingHeadingVisible(h);
 const visible=Object.values(readingState).filter(Boolean).length;
 document.getElementById('reading-status').textContent=visible===readingToggles.length?'All commentary visible.':visible===0?'Rulings only.':visible+' of '+readingToggles.length+' commentary layers visible.';
 if(save)try{localStorage.setItem(readingStorageKey,JSON.stringify(readingState));}catch{}
 if(marker&&!marker.hidden&&Number.isFinite(markerTop))scrollBy({top:marker.getBoundingClientRect().top-markerTop,behavior:'instant'});
}
function revealReadingTarget(){
 let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
 if(!id)return;
 const target=document.getElementById(id);if(!target)return;
 const filtered=target.closest('[data-reading-layer],[data-reading-heading]');
 if(filtered?.hidden){
  if(filtered.dataset.readingLayer)readingState[filtered.dataset.readingLayer]=true;
  else {
   let next=filtered.nextElementSibling;const level=Number(filtered.dataset.readingHeading);
   while(next){if(/^H[1-6]$/.test(next.tagName)&&Number(next.tagName.slice(1))<=level)break;if(next.dataset.readingLayer)readingState[next.dataset.readingLayer]=true;next=next.nextElementSibling;}
  }
  applyReadingLayers({keepPosition:false});
 }
 if(filtered||id.startsWith('REP-'))target.scrollIntoView({block:'start',behavior:'auto'});
}
for(const t of readingToggles)t.addEventListener('change',()=>{readingState[t.dataset.layerToggle]=t.checked;applyReadingLayers();});
document.getElementById('reading-all').addEventListener('click',()=>{for(const key of Object.keys(readingState))readingState[key]=true;applyReadingLayers();});
document.getElementById('reading-core').addEventListener('click',()=>{for(const key of Object.keys(readingState))readingState[key]=false;applyReadingLayers();});
addEventListener('hashchange',revealReadingTarget);
applyReadingLayers({save:false,keepPosition:false});
revealReadingTarget();

function primaryRecordHTML(n){
 return `<div class="primary-witness"><p><strong>${esc(n.work)}</strong> · ${esc(n.witness)}</p><p>${esc(n.scope)}</p></div>${n.full_discussions?.length?`<div class="primary-full"><strong>Read the full discussion</strong><p>Arabic and published English pages in a separate reading window. Each link identifies a complete question, chapter or book.</p><ul>${n.full_discussions.map(u=>`<li><a href="${esc(u.url)}" target="_blank" rel="noopener">${esc(u.title)} ↗</a></li>`).join('')}</ul></div>`:''}<p class="primary-policy">${esc(n.editorial_policy)}</p>${n.case_connection?`<section class="primary-connection"><h3>How this bears on the ruling</h3><p>${esc(n.case_connection)}</p><p><strong>What remains to be established.</strong> ${esc(n.connection_limit)}</p></section>`:''}${n.textual_note?`<p class="primary-textual-note"><strong>Textual note.</strong> ${esc(n.textual_note)}</p>`:''}`+n.passages.map(p=>`<section class="primary-passage"><h3>${esc(p.title)}</h3><p class="primary-locator">${esc(p.locator)} · <a href="${esc(p.page_image||p.source_url)}" target="_blank" rel="noopener">${esc(p.page_image?'View original Arabic page':p.source_link_label||'Open cited scan')}</a></p><div class="primary-dual" dir="rtl"><section lang="ar" dir="rtl"><h4>النص العربي · Arabic</h4><p class="primary-arabic">${esc(p.arabic)}</p></section><section lang="en" dir="ltr"><h4>English · working translation</h4><p class="primary-translation">${esc(p.translation)}</p></section></div></section>`).join('');
}
// Primary texts have their own dialog and data. They never inherit a scripture
// note's combined commentary or the current principle popover's contents.
const rushdData=JSON.parse(document.getElementById('rushd-data').textContent);
const rushdById=new Map(rushdData.map(n=>[n.id,n]));
const rushdDialog=document.getElementById('rushd-dialog');
let rushdOrigin=null;
document.querySelectorAll('[data-primary-text]').forEach(link=>link.addEventListener('click',event=>{
 if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button>0)return;
 if(typeof rushdDialog.showModal!=='function')return; // Follow the full-text page.
 const record=rushdById.get(link.dataset.primaryText);if(!record)return;
 event.preventDefault();hide();
 rushdOrigin=link;link.setAttribute('aria-expanded','true');
 document.getElementById('rushd-title').textContent=record.title;
 document.getElementById('rushd-body').innerHTML=primaryRecordHTML(record);
 rushdDialog.showModal();rushdDialog.scrollTop=0;document.getElementById('rushd-close').focus();
}));
document.getElementById('rushd-close').addEventListener('click',()=>rushdDialog.close());
rushdDialog.addEventListener('close',()=>{
 if(rushdOrigin){rushdOrigin.setAttribute('aria-expanded','false');rushdOrigin.focus();rushdOrigin=null;}
});

