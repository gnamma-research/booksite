
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
function contents(n){return '<div class="kind">'+esc(n.kind)+'</div><h2 id="note-title">'+esc(n.title)+'</h2><p>'+esc(n.warrant)+'</p><p class="limit"><strong>Limit.</strong> '+esc(n.limit)+'</p><p class="source"><strong>Source.</strong> '+esc(n.locator)+'<br><a href="'+esc(n.source_pages_url)+'" >Source details in this edition</a></p><div class="note-help">'+esc(n.id)+' · Click a reference to keep the note open. Escape closes it.</div>'}
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
 body+=verses.map(v=>'<div class="citation-verse"><p class="context-label">'+esc(v.key)+'</p><p class="arabic-passage" lang="ar" dir="rtl">'+esc(v.text)+'</p>'+(v.reading?'<p><strong>Reading of this verse.</strong> '+esc(v.reading)+'</p>':'')+'<p><a href="'+esc(v.url)+'" target="_blank" rel="noopener">Verse source details</a></p></div>').join('');
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
 if(n.source_url)body+='<p><a href="'+esc(n.source_url)+'" target="_blank" rel="noopener">Source details in this edition</a></p>';
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
function list(){const q=search.value.toLocaleLowerCase();const found=notes.filter(n=>[n.id,n.label,n.title,n.kind,n.warrant,n.limit].join(' ').toLocaleLowerCase().includes(q));results.innerHTML='<p><small>'+found.length+' of '+notes.length+' entries</small></p>'+found.map(n=>'<section class="register-card"><small>'+esc(n.id+' · '+n.kind)+'</small><h3>'+esc(n.title)+'</h3><p>'+esc(n.warrant)+'</p><p><strong>Limit.</strong> '+esc(n.limit)+'</p><p><small>'+esc(n.locator)+'</small><br><a href="'+esc(n.source_pages_url)+'" >Source details in this edition</a></p></section>').join('')}
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
const readingStorageKey='gnamma-bidaya-'+document.body.dataset.edition+'-pilot';
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

// Progressive enhancement: move the original nodes, never duplicate their IDs,
// source buttons or event handlers. Continuous reading restores their exact order.
(()=>{
 const manuscript=document.getElementById('manuscript');
 const originals=[...manuscript.childNodes];
 const definitions={
  principles:{title:'Legal reasoning',question:'How is the judgment reached?',kind:'Uṣūl · methods & controls',glyph:'⌘',color:'sage'},
  scripture:{title:'Qurʾān & Sunnah',question:'What do the text and its setting disclose?',kind:'Text · context · commentary',glyph:'▤',color:'rose'},
  formation:{title:'Character & virtue',question:'What might repeated practice form?',kind:'Personal formation',glyph:'◐',color:'ochre'},
  social:{title:'Institutions & common life',question:'What sustains the practice—and where can it fail?',kind:'Social conditions & effects',glyph:'▦',color:'blue'},
  symbols:{title:'Spiritual & metaphysical',question:'How does this practice open onto a higher end?',kind:'Sufi readings · symbols · metaphysics',glyph:'✧',color:'violet'},
  alchemy:{title:'Alchemy of practice',question:'What transformation does living the law suggest?',kind:'Comparative interpretation',glyph:'⟁',color:'copper'}
 };
 if(document.body.dataset.edition==='law')for(const key of ['formation','social','symbols','alchemy'])delete definitions[key];
 const names={'REP-02':'Ablution','REP-09':'Zakāt','REP-23':'Nursing','REP-31':'Salam','REP-43':'Interdiction','REP-50':'Deposit','REP-63':'Injury','REP-72':'Judgment'};
 const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e;};
 const button=(label,cls,fn)=>{const b=make('button',cls,label);b.type='button';b.addEventListener('click',fn);return b;};
 const anchor=(label,id,cls)=>{const a=make('a',cls,label);a.href='#'+id;return a;};
 const cases=new Map();let current=null;
 // Explicit REP markers delimit studies; book headings and method remain outside.
 for(const node of originals){
  if(node.nodeType===1){
   const marker=node.matches('[id^="REP-"]')?node:node.querySelector('[id^="REP-"]');
   if(marker&&names[marker.id]){current={id:marker.id,nodes:[],selected:[],compare:new Set(),mode:'map'};cases.set(current.id,current);}
   else if(node.tagName==='H1'||node.tagName==='HR'||node.querySelector('#PILOT-METHOD'))current=null;
  }
  if(current)current.nodes.push(node);
 }
 if(cases.size!==8)return; // The complete original reader remains usable.
 const caseNodes=new Set([...cases.values()].flatMap(c=>c.nodes));
 const libraryNodes=originals.filter(n=>!caseNodes.has(n));
 const root=make('div','atlas-shell');root.id='study-atlas';
 const mast=make('header','atlas-mast');
 mast.innerHTML='<div><p class="atlas-eyebrow">Ibn Rushd · Eight studies</p><h1>'+document.body.dataset.editionTitle+'</h1><p class="atlas-deck">One legal question, connected inquiries. Begin with the ruling and its sources.</p></div>';
 const mastActions=make('div','atlas-mast-actions');mastActions.append(anchor('Home','PILOT-START','atlas-link'),anchor('About & method','PILOT-METHOD','atlas-link'),button('Continuous reading','atlas-text-button',()=>setMode(false)));
 mast.append(mastActions);root.append(mast);
 const stage=make('div','atlas-stage');root.append(stage);
 const library=make('div','atlas-library');library.hidden=true;
 const libraryHead=make('div','atlas-library-head');libraryHead.append(anchor('← Home','PILOT-START','atlas-link'),button('Return to the study','atlas-button',()=>{location.hash=activeCase.id;showCase(activeCase.id);}),button('Continuous reading','atlas-text-button',()=>setMode(false)));
 library.append(libraryHead);root.append(library);
 // Home, method and references are separate destinations. Their original nodes
 // and anchors stay intact for source links and continuous reading.
 const documentPages=new Map();
 for(const key of ['home','method','edition','sources']){const page=make('section','atlas-document');page.dataset.document=key;page.hidden=true;documentPages.set(key,page);library.append(page);}
 const structural=make('div','');structural.hidden=true;library.append(structural);
 let destination=documentPages.get('home');
 for(const node of libraryNodes){
  if(node.nodeType===1){
   if(node.matches('#PILOT-METHOD')||node.querySelector('#PILOT-METHOD'))destination=documentPages.get('method');
   if(node.id==='review-scope')destination=documentPages.get('edition');
   if(node.id==='review-source-locators')destination=documentPages.get('sources');
   if(node.tagName==='HR'||(node.tagName==='H1'&&['Worship','Family','Exchange and agency','Trust, injury and judgment'].includes(node.textContent.trim()))){structural.append(node);continue;}
  }
  destination.append(node);
 }
 const sourceCatalog=library.querySelector('#review-source-locators');
 const sourceEntries=sourceCatalog?[...sourceCatalog.querySelectorAll(':scope > section')]:[];
 const sourcePreface=sourceCatalog?[...sourceCatalog.children].filter(n=>!sourceEntries.includes(n)):[];
 const sourceIndex=make('ul','atlas-source-index');
 for(const entry of sourceEntries){const li=make('li','');li.append(anchor(entry.querySelector('h3').textContent,entry.id,''));sourceIndex.append(li);}
 const sourceBack=anchor('← All source notes','review-source-locators','atlas-link');
 if(sourceCatalog){sourceCatalog.prepend(sourceBack);sourceCatalog.append(sourceIndex);const sourceNav=anchor('Source notes','review-source-locators','');sourceNav.addEventListener('click',()=>setReaderMenu(false,true));document.querySelector('.pilot-sidebar-contents').append(sourceNav);}
 const linearReturn=button('Explore perspectives','atlas-return-button',()=>setMode(true));linearReturn.hidden=true;
 document.querySelector('.top-actions').prepend(linearReturn);
 let enabled=false,activeCase=cases.values().next().value;
 const related=(c,layer)=>c.shared.filter(x=>x.from===layer);
 function notePreview(nodes){
  const candidate=nodes.find(n=>n.nodeType===1&&n.textContent.trim().length>110);
  if(!candidate)return '';
  const copy=candidate.cloneNode(true);
  const heading=copy.querySelector('strong');if(heading)heading.remove();
  return copy.textContent.trim().replace(/^[:.·\s]+/,'');
 }
 function buildStudy(c,index){
  c.element=make('section','atlas-study');c.element.dataset.study=c.id;c.element.hidden=true;
  c.header=make('header','atlas-study-head');
  const heading=c.nodes.find(n=>n.nodeType===1&&n.tagName==='H2');
  heading.innerHTML=heading.innerHTML.replace(/^(REP-\d+\.)\s*/,'<span class="atlas-rep-prefix">$1 </span>');
  const eyebrow=make('p','atlas-eyebrow','Study '+String(index+1).padStart(2,'0')+' / 08 · '+c.id);
  c.header.append(eyebrow,heading);heading.tabIndex=-1;
  const travel=make('div','atlas-travel');
  const ids=[...cases.keys()];if(index>0)travel.append(anchor('← '+names[ids[index-1]],ids[index-1],''));if(index<7)travel.append(anchor(names[ids[index+1]]+' →',ids[index+1],''));
  c.header.append(travel);c.element.append(c.header);
  c.ground=make('div','atlas-ground');
  const coreCard=make('section','atlas-core');coreCard.innerHTML='<p class="atlas-eyebrow">The legal question</p>';
  const core=make('details','atlas-core-details');const coreSummary=make('summary','');coreSummary.append(make('strong','','Ruling & disagreement'),make('span','atlas-disclosure','Read the complete summary +'));
  core.append(coreSummary);const coreBody=make('div','atlas-core-body');core.append(coreBody);
  const sourceRow=make('div','atlas-primary-sources');
  const stakes=make('details','atlas-stakes');stakes.append(make('summary','','The question at stake'));
  c.panels={};c.contents={};c.shared=[];
  for(const key of Object.keys(definitions)){
   const def=definitions[key],panel=make('section','atlas-panel tone-'+def.color);panel.dataset.perspective=key;panel.id='atlas-'+c.id+'-'+key;panel.hidden=true;
   const ph=make('header','atlas-panel-head');ph.append(make('p','atlas-eyebrow',def.kind),make('h3','',def.title));
   const body=make('div','atlas-panel-body');panel.append(ph,body);c.panels[key]=panel;c.contents[key]=body;
  }
  c.extras=make('details','atlas-extra');c.extras.append(make('summary','','Further references for this study'));
  const archive=make('div','atlas-original-markers');archive.hidden=true;
  let previousLayer=null;
  for(const node of c.nodes){
   if(node===heading)continue;
   if(node.nodeType!==1){archive.append(node);continue;}
   if(node.matches('.case-reading-route')||/^Division \d+:/.test(node.textContent.trim())){archive.append(node);continue;}
   if(!node.textContent.trim()){c.header.prepend(node);continue;}
   if(node.querySelector('[data-primary-text]')){sourceRow.append(node);continue;}
   let key=node.dataset.readingLayer;
   if(key==='stakes'){stakes.append(node);previousLayer='stakes';continue;}
   if(key){
    if((node.dataset.readingAlso||'').split(' ').includes('symbols')){
     c.shared.push({from:key,to:'symbols',node});key='symbols';
    }
    c.contents[key].append(node);previousLayer=key;continue;
   }
   if(node.dataset.readingCore||/^Ibn Rushd:/.test(node.textContent.trim())){coreBody.append(node);continue;}
   if(previousLayer&&node.tagName==='P'&&node.textContent.trim().length<180&&!node.querySelector('strong')){
    (previousLayer==='stakes'?stakes:c.contents[previousLayer]).append(node);continue;
   }
   c.extras.append(node);
  }
  const stakesHeading=stakes.querySelector('p > strong');
  if(stakesHeading){
   const subject=stakesHeading.textContent.replace(/^Interpretive focus:\s*/,'').replace(/[.]$/,'');
   stakes.querySelector('summary').replaceChildren(make('span','atlas-eyebrow','The question at stake'),make('strong','',subject));
  }
  const coreText=coreBody.textContent.replace(/^Ibn Rushd: summary of the ruling and disagreement\.\s*/,'');
  coreSummary.insertBefore(make('span','atlas-core-preview',coreText),coreSummary.lastChild);
  coreCard.append(core,sourceRow);c.ground.append(coreCard);if(document.body.dataset.edition!=='law')c.ground.append(stakes);c.element.append(c.ground);
  c.board=make('section','atlas-board');c.board.setAttribute('aria-label','Perspectives on '+names[c.id]);
  const boardHead=make('div','atlas-board-head');boardHead.innerHTML='<div><p class="atlas-eyebrow">Explore the study</p><h3>Perspectives in relation</h3><p>Open a card, or select two to compare. Each asks a different question of the same practice.</p></div>';
  c.compareButton=button('Compare two cards','atlas-button',()=>openReading(c,[...c.compare]));c.compareButton.disabled=true;boardHead.append(c.compareButton);c.board.append(boardHead);
  c.announce=make('p','atlas-selection-status');c.announce.setAttribute('role','status');c.announce.setAttribute('aria-live','polite');c.board.append(c.announce);
  c.cards={};const groups=make('div','atlas-card-groups');
  for(const [label,keys] of [['Sources & reasoning',['principles','scripture']],['Person & common life',['formation','social']],['Inward & symbolic',['symbols','alchemy']]]){
   const column=make('div','atlas-card-group');column.append(make('h4','atlas-group-title',label));
   for(const key of keys.filter(key=>definitions[key])){
    const def=definitions[key],hasContent=!!c.contents[key].children.length||related(c,key).length;
    const card=make('div','atlas-card tone-'+def.color);c.cards[key]=card;
    const read=button('','atlas-card-open',()=>openReading(c,[key]));read.disabled=!hasContent;
    read.setAttribute('aria-controls',c.panels[key].id);
    read.innerHTML='<span class="atlas-card-top"><span class="atlas-symbol" aria-hidden="true">'+def.glyph+'</span><span class="atlas-card-kind">'+def.kind+'</span></span>';
    read.append(make('strong','atlas-card-title',def.title),make('span','atlas-card-question',def.question));
    const preview=notePreview([...c.contents[key].children]);
    if(preview)read.append(make('span','atlas-card-excerpt',preview));
    read.append(make('span','atlas-open-label',hasContent?'Read perspective ↗':'No separate section in this study'));
    card.append(read);
    if(hasContent){const label=make('label','atlas-compare-choice');const check=make('input','');check.type='checkbox';check.dataset.compareLayer=key;check.setAttribute('aria-label','Compare '+def.title);label.append(check,make('span','','Compare'));card.append(label);check.addEventListener('change',()=>{
     if(check.checked&&c.compare.size===2){check.checked=false;c.announce.textContent='Two perspectives are selected. Deselect one to choose another.';return;}
     if(check.checked)c.compare.add(key);else c.compare.delete(key);
     card.classList.toggle('is-selected',check.checked);c.compareButton.disabled=c.compare.size!==2;
     c.compareButton.textContent=c.compare.size===2?'Compare selected →':'Compare two cards';
     c.announce.textContent=c.compare.size?c.compare.size+' of 2 selected':'';
    });}
    column.append(card);
   }
   if(column.querySelector('.atlas-card'))groups.append(column);
  }
  c.board.append(groups);c.element.append(c.board);
  c.reader=make('section','atlas-reader');c.reader.hidden=true;
  const tools=make('div','atlas-reader-tools');tools.append(button('← All perspectives','atlas-button',()=>showMap(c,true)));
  const pick=(label,slot)=>{const wrap=make('label','atlas-picker');wrap.append(make('span','',label));const select=make('select','');select.dataset.perspectiveSlot=slot;if(slot===1){const o=make('option','','None · read one perspective');o.value='';select.append(o);}for(const [k,def] of Object.entries(definitions)){if(!c.contents[k].children.length&&!related(c,k).length)continue;const o=make('option','',def.title);o.value=k;select.append(o);}wrap.append(select);tools.append(wrap);select.addEventListener('change',()=>{const keys=[c.firstSelect.value,c.secondSelect.value].filter(Boolean);openReading(c,[...new Set(keys)],false);});return select;};
  c.firstSelect=pick('Reading',0);c.secondSelect=pick('Alongside',1);c.reader.append(tools);
  c.mobileTabs=make('div','atlas-mobile-tabs');c.mobileTabs.setAttribute('aria-label','Switch compared perspective');c.reader.append(c.mobileTabs);
  c.panelsArea=make('div','atlas-panels');c.reader.append(c.panelsArea);
  for(const [key,panel] of Object.entries(c.panels)){
   for(const shared of related(c,key)){const callout=make('p','atlas-shared');callout.append(make('span','','This passage also has an inward reading: '),anchor(shared.node.querySelector('strong')?.textContent||'Read the spiritual commentary',shared.node.id,''));c.contents[key].append(callout);}
   c.panelsArea.append(panel);
  }
  c.element.append(c.reader,c.extras,archive);if(c.extras.children.length===1)c.extras.hidden=true;
  stage.append(c.element);
 }
 [...cases.values()].forEach(buildStudy);
 function allLayers(){for(const key of Object.keys(readingState))readingState[key]=true;applyReadingLayers({save:false,keepPosition:false});for(const c of cases.values())for(const n of c.nodes)if(n.nodeType===1&&!n.matches('.case-reading-route'))n.hidden=false;}
 function showMap(c,scroll=false){hide();c.mode='map';c.board.hidden=false;c.reader.hidden=true;c.element.classList.remove('is-reading');if(scroll)c.ground.scrollIntoView({block:'start',behavior:'auto'});}
 function openReading(c,keys,scroll=true){
  keys=[...new Set(keys)].filter(k=>c.panels[k]).slice(0,2);if(!keys.length)return;
  hide();document.body.dataset.activeStudy=c.id;document.body.dataset.activePerspectives=keys.join(',');c.selected=keys;c.mode='reading';c.board.hidden=true;c.reader.hidden=false;c.element.classList.add('is-reading');
  c.firstSelect.value=keys[0];c.secondSelect.value=keys[1]||'';
  c.panelsArea.dataset.count=keys.length;
  for(const [k,p] of Object.entries(c.panels)){p.hidden=!keys.includes(k);p.classList.toggle('is-mobile-active',k===keys[0]);}
  // Match the visual order to the selectors, rather than the original DOM order.
  keys.forEach(k=>c.panelsArea.append(c.panels[k]));
  c.mobileTabs.replaceChildren();
  if(keys.length===2)for(const key of keys){const b=button(definitions[key].title,'',()=>{for(const k of keys)c.panels[k].classList.toggle('is-mobile-active',k===key);[...c.mobileTabs.children].forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});b.setAttribute('aria-pressed',String(key===keys[0]));c.mobileTabs.append(b);}
  if(scroll){c.reader.scrollIntoView({block:'start',behavior:'auto'});c.firstSelect.focus({preventScroll:true});}
 }
 function showCase(id,scroll=true){
  activeCase=cases.get(id)||activeCase;document.body.dataset.activeStudy=activeCase.id;delete document.body.dataset.activePerspectives;stage.hidden=false;library.hidden=true;mast.hidden=false;
  for(const c of cases.values())c.element.hidden=c!==activeCase;
  for(const a of document.querySelectorAll('.pilot-sidebar-contents a')){if(a.hash==='#'+activeCase.id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}
  showMap(activeCase);
  if(scroll)activeCase.header.scrollIntoView({block:'start',behavior:'auto'});
 }
 function showLibrary(target,scroll=true){
  hide();stage.hidden=true;library.hidden=false;
  for(const c of cases.values())c.element.hidden=true;
  const page=[...documentPages.values()].find(p=>p.contains(target))||documentPages.get('home');
  for(const p of documentPages.values())p.hidden=p!==page;
  delete document.body.dataset.activeStudy;delete document.body.dataset.activePerspectives;const home=page.dataset.document==='home';mast.hidden=true;libraryHead.hidden=home;
  const sourceEntry=sourceEntries.find(e=>e.contains(target));
  for(const entry of sourceEntries)entry.hidden=entry!==sourceEntry;
  for(const n of sourcePreface)n.hidden=Boolean(sourceEntry);
  sourceIndex.hidden=Boolean(sourceEntry);sourceBack.hidden=!sourceEntry;
  const navigationId=home?'PILOT-START':page.dataset.document==='method'?'PILOT-METHOD':page.dataset.document==='sources'?'review-source-locators':target.id;
  for(const a of document.querySelectorAll('.pilot-sidebar-contents a')){if(a.hash==='#'+navigationId)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}
  if(scroll){if(home)window.scrollTo({top:0,behavior:'instant'});else (sourceEntry||page).scrollIntoView({block:'start',behavior:'instant'});}
 }
 function route(scroll=true){
  if(!enabled)return;let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
  const target=document.getElementById(id||'PILOT-START');
  const c=[...cases.values()].find(x=>x.element.contains(target));
  if(c){showCase(c.id,false);const panel=target.closest('.atlas-panel');if(panel)openReading(c,[panel.dataset.perspective],false);const detail=target.closest('details');if(detail)detail.open=true;if(scroll)(panel?target:c.header).scrollIntoView({block:'start',behavior:'auto'});}
  else if(target&&library.contains(target))showLibrary(target,scroll);
  else showLibrary(document.getElementById('PILOT-START'),scroll);
 }
 function setMode(cards){
  hide();enabled=cards;document.body.classList.toggle('atlas-mode',cards);linearReturn.hidden=cards;
  if(cards){
   // On re-entry, put every preserved node back in its card, not a copied view.
   if(root.isConnected===false){for(const [node,slot] of placement)slot.parentNode.insertBefore(node,slot.nextSibling);manuscript.replaceChildren(root);}
   allLayers();route(true);
  }else{for(const n of [...sourceEntries,...sourcePreface])n.hidden=false;sourceIndex.hidden=true;sourceBack.hidden=true;manuscript.replaceChildren(...originals);applyReadingLayers({save:false,keepPosition:false});let target;try{target=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch{}(target||document.getElementById('PILOT-START'))?.scrollIntoView({block:'start',behavior:'auto'});}
 }
 // Fixed positions survive continuous-reading round trips, including whitespace.
 const placement=originals.map(n=>{const slot=document.createComment('source position');n.parentNode.insertBefore(slot,n);return [n,slot];});
 manuscript.replaceChildren(root);enabled=true;document.body.classList.add('atlas-mode');allLayers();
 window.bidayaOpenPerspective=(study,keys)=>{if(cases.has(study)){showCase(study,false);openReading(cases.get(study),keys,false);}};addEventListener('hashchange',()=>route());
 document.addEventListener('click',event=>{
  if(!enabled)return;const a=event.target.closest('a[href^="#"]');if(!a||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  if(a.hash===location.hash)setTimeout(()=>route(),0);
 });
 route(true);
 addEventListener('beforeprint',()=>{if(enabled){root.dataset.restoreAfterPrint='true';setMode(false);}});
 addEventListener('afterprint',()=>{if(root.dataset.restoreAfterPrint){delete root.dataset.restoreAfterPrint;setMode(true);}});
})();

