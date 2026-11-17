/* Daruri reader interface, bound to Ibn Ajiba's own records and stable anchors. */
(function(){
'use strict';
const R=window.BahrReader,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],E=R.E;
const icon=name=>'<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-'+name+'"></use></svg>';
const names=['Author’s preface','Al-Fātiḥa','Al-Baqara','Āl ʿImrān','Al-Nisāʾ'];
let copyPopup=null,picker=null,pickerOpener=null,enhancing=false,frame=0;
const current=()=>R.visiblePlace()?.r||R.current||'preface';
function closePopovers(restore=false){
 window.BahrModeMenu?.closeModePicker(restore);
 if(copyPopup&&!copyPopup.hidden){copyPopup.hidden=true;const opener=$('[data-ui="copy-menu"]');opener?.setAttribute('aria-expanded','false');if(restore)opener?.focus({preventScroll:true});}
}
function copyMenu(markup){
 const trigger=$('[data-ui="copy-menu"]');
 if(copyPopup&&!copyPopup.hidden){closePopovers(true);return;}
 closePopovers();
 if(!copyPopup){copyPopup=document.createElement('div');copyPopup.className='gn-copy-menu';copyPopup.id='gn-copy-menu';copyPopup.hidden=true;copyPopup.setAttribute('role','menu');copyPopup.setAttribute('aria-label','Copy options');document.body.append(copyPopup);}
 const title=R.byId.get(current());
 copyPopup.innerHTML='<div class="gn-copy-menu-head">Copy <small>§'+((title?.index||0)+1)+'</small></div>'+markup;
 copyPopup.hidden=false;
 const box=trigger.getBoundingClientRect();
 copyPopup.style.left=Math.max(8,Math.min(innerWidth-copyPopup.offsetWidth-8,box.right-copyPopup.offsetWidth))+'px';
 copyPopup.style.top=Math.max(8,Math.min(innerHeight-copyPopup.offsetHeight-8,box.bottom+5))+'px';
 trigger.setAttribute('aria-expanded','true');copyPopup.querySelector('button')?.focus({preventScroll:true});
}
function contentsHTML(filter=''){
 const q=R.N(filter).replace(/^§/,'');
 const rows=R.catalog.filter((r,i)=>!q||R.N([r.title,r.q,r.surah,r.cairo,'§'+(i+1)].join(' ')).includes(q));
 return '<p class="result-count" role="status">'+rows.length+' / '+R.catalog.length+' sections</p>'+names.map((name,s)=>{
  const group=rows.filter(r=>r.s===s);if(!group.length)return '';
  return '<details class="contents-part" '+(q||s===R.byId.get(current())?.s?'open':'')+'><summary><span>'+E(name)+'</span><small>'+group.length+'</small></summary>'+
   group.map(r=>'<a class="toc-link" href="'+R.readURL(r.id)+'" '+(r.id===current()?'aria-current="location"':'')+'><span class="contents-number">§'+(R.byId.get(r.id).index+1)+'</span><span>'+E(r.title)+'<small>Cairo '+E(r.cairo)+'</small></span>'+icon('right')+'</a>').join('')+'</details>';
 }).join('');
}
function contentsPage(){
 R.page('Contents','Volume I · the complete Arabic–English text',
 '<label class="contents-search">'+icon('search')+'<span class="sr-only">Find a section</span><input type="search" id="full-contents-query" placeholder="Find a sūrah, verse, heading or §number…"></label><div id="full-contents-results">'+contentsHTML()+'</div>');
}
function setupPicker(){
 const d=document.createElement('dialog');d.id='jumpOverlay';d.hidden=true;d.setAttribute('aria-labelledby','jumpTitle');
 d.innerHTML='<div class="jump-dialog"><header class="jump-heading"><div><span class="micro-label">GO TO PASSAGE</span><h2 id="jumpTitle" class="sr-only">Section navigator</h2><p id="jumpLocation"></p></div><button type="button" id="jumpClose" aria-label="Close section navigator">'+icon('close')+'</button></header><label class="jump-search">'+icon('search')+'<span class="sr-only">Section number, title or concept</span><input autocomplete="off" id="jumpSearch" placeholder="Find a sūrah, verse, title or §number…" type="search"></label><div id="jumpParts" class="jump-parts"></div><div id="jumpResultCount" class="jump-summary" role="status"></div><div id="jumpResults" class="jump-results"></div><div id="jumpRecent"></div></div>';
 document.body.append(d);
 const tree=names.map((name,s)=>({kind:'part',number:s?'Sūrah '+s:'Preface',title:s?name:'Author’s preface',children:R.catalog.filter(r=>r.s===s).map(r=>({kind:'section',number:'§'+(R.byId.get(r.id).index+1),title:r.title,subtitle:r.q==='preface'?'Author’s preface':'Q '+r.q,sectionId:r.id,source:r}))}));
 picker=window.GnammaSectionPicker.install({book:{navigationTree:tree},current,originalPage:r=>r.cairo,openFullContents:()=>{closePicker();location.hash='#/contents';}});
 d.addEventListener('click',e=>{
  if(e.target===d){const b=d.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)closePicker();return;}
  const b=e.target.closest('[data-section]');if(b){closePicker();location.hash=R.readURL(b.dataset.section);}
 });
 $('#jumpClose').addEventListener('click',closePicker);
 d.addEventListener('cancel',e=>{e.preventDefault();closePicker();});
 d.addEventListener('close',()=>{d.hidden=true;document.body.classList.remove('picker-open');pickerOpener?.isConnected&&pickerOpener.focus({preventScroll:true});});
}
function openPicker(){
 closePopovers();R.closeSheet();pickerOpener=document.activeElement;
 const d=$('#jumpOverlay'),r=R.byId.get(current());
 $('#jumpLocation').textContent=(r?.surah||'Volume I')+' · §'+((r?.index||0)+1);
 d.hidden=false;d.showModal();document.body.classList.add('picker-open');picker.open();renderHistory();$('#jumpClose').focus({preventScroll:true});
}
function closePicker(){const d=$('#jumpOverlay');if(d?.open)d.close();}
function renderHistory(){
 const n=window.BahrNavigation,h=n?.history;if(!h)return;
 $('#jumpRecent').innerHTML='<div class="gn-history-picker-controls"><button data-picker-history="back" '+(!h.previous()?'disabled':'')+'>↶ Back</button><button data-picker-history="forward" '+(!h.next()?'disabled':'')+'>Forward ↷</button></div><details class="gn-history-recent"><summary>Recent locations <small>'+h.recentList().length+'</small></summary><div class="gn-history-recent-list">'+h.recentList().slice(0,16).map((x,i)=>'<button data-picker-recent="'+i+'">'+E(R.byId.get(x.section)?.title||x.section)+'</button>').join('')+'</div><button data-picker-history="clear">Clear reading history</button></details>';
}
function sourceDetails(id){
 const r=R.byId.get(id);if(!r)return;
 R.sheet('Edition details & sources','<dl class="gn-heading-citations"><div><dt>Work</dt><dd>Ibn ʿAjība · al-Baḥr al-Madīd · Volume I</dd></div><div><dt>Section</dt><dd>§'+(r.index+1)+' · '+E(r.title)+'</dd></div><div><dt>Arabic original</dt><dd>Cairo edition · '+E(r.cairo)+'</dd></div><div><dt>Qurʾānic location</dt><dd>'+E(r.q)+'</dd></div></dl><p>Section titles provide an editorial reading guide. Recorded headings within the translation remain identified in the text.</p><div class="panel-nav"><button data-action="passage-notes" data-record="'+E(id)+'">Annotations &amp; source references</button><button data-action="citation" data-record="'+E(id)+'">Cite this passage</button><a href="#/editions">PDF editions &amp; downloads</a></div>','reference','EDITION DETAILS');
}
function savedItems(id,anchor=''){
 const rows=R.desk.filter(x=>!x.archived&&!x.reference&&x.r===id&&(!anchor||x.anchor===anchor));
 R.sheet('Your saved items','<div class="panel-nav">'+(rows.length?rows.map(x=>'<a href="'+R.readURL(x.r,x.anchor,x.lang)+'">'+(x.type==='highlight'?GnammaBookmarkUI.highlightIcon():x.type==='note'?GnammaBookmarkUI.noteIcon():GnammaBookmarkUI.icon({saved:true}))+'<span>'+E(x.note||x.quote||'Bookmark')+'</span></a>').join(''):'<p>No saved items at this location.</p>')+'</div><button data-nav="desk">Manage in Reading Desk</button>','saved-items');
}
function updateSaved(){
 for(const row of $$('.section-personal-tools,.personal-paragraph-tools')){
  const id=row.dataset.record,anchor=row.dataset.for||'unit-'+id;
  const saved=R.desk.filter(x=>!x.archived&&!x.reference&&x.r===id&&x.anchor===anchor);
  const mark=row.querySelector('[data-section-bookmark],[data-paragraph-action="bookmark"]');
  if(mark){const active=saved.some(x=>x.type==='bookmark');mark.setAttribute('aria-pressed',String(active));const shape=GnammaBookmarkUI.icon({kind:row.classList.contains('personal-paragraph-tools')?'paragraph':'section',saved:active});if(mark.dataset.savedState!==String(active)){mark.innerHTML=shape;mark.dataset.savedState=String(active);}}
  let button=row.querySelector('[data-saved-at]');
  if(saved.length){if(!button){button=document.createElement('button');button.type='button';button.dataset.savedAt=anchor;button.dataset.record=id;button.className='saved-at';button.innerHTML=icon('list');row.append(button);}button.setAttribute('aria-label','View '+saved.length+' saved items at this location');button.dataset.count=saved.length;}
  else button?.remove();
 }
}
function enhanceReader(){
 if(enhancing)return;enhancing=true;
 try{
  if(R.view==='read')for(const article of $$('.passage')){
   if(article.dataset.parity)continue;article.dataset.parity='true';
   const id=article.dataset.record,r=R.byId.get(id),header=article.querySelector('.passage-header');if(!r||!header)continue;
   const eyebrow=header.querySelector('.eyebrow');
   eyebrow.classList.add('gn-heading-line');
   eyebrow.innerHTML='<span class="gn-heading-part">'+E(r.surah)+' <span class="gn-section-number">· §'+(r.index+1)+'</span></span><button type="button" class="gn-heading-source" data-source-details="'+E(id)+'" aria-label="Edition details and PDF links" title="Edition details and PDF links">ⓘ<span class="sr-only"> ↗</span></button>';
   const meta=header.querySelector('.passage-meta');if(meta)meta.remove();
   const tools=document.createElement('div');tools.className='section-personal-tools';tools.dataset.record=id;tools.setAttribute('role','toolbar');tools.setAttribute('aria-label','Section actions');
   tools.innerHTML='<button data-section-bookmark="'+E(id)+'" aria-label="Bookmark section">'+GnammaBookmarkUI.icon()+'</button><button data-section-note="'+E(id)+'" aria-label="Add personal note to section">'+GnammaBookmarkUI.noteIcon()+'</button>';
   header.append(tools);
   const actions=article.querySelector('.passage-actions');
   if(actions){actions.setAttribute('role','region');actions.setAttribute('aria-label','Reading apparatus');actions.innerHTML='<button class="apparatus-link" data-action="passage-notes" data-record="'+E(id)+'">Notes <span aria-hidden="true">↗</span></button><button class="apparatus-link" data-source-details="'+E(id)+'">Sources <span aria-hidden="true">↗</span></button>';}
   // Source and translation paragraph numbering remain independent.
   for(const col of article.querySelectorAll('.language-col')){
    [...col.querySelectorAll('[data-anchor]')].forEach((p,i)=>{p.dataset.paragraphNumber=i+1;p.setAttribute('aria-label',(p.dataset.lang==='ar'?'Arabic':'English')+' paragraph '+(i+1));});
   }
  }
  if(R.view==='read'&&!document.querySelector('.chapter-nav')&&R.prefs.mode!=='continuous'){
   const r=R.byId.get(current());if(r){const nav=document.createElement('nav');nav.className='chapter-nav';nav.setAttribute('aria-label','Adjacent section titles');nav.innerHTML=[[-1,'Previous'],[1,'Next']].map(([d,label])=>{const t=R.catalog[r.index+d];return t?'<a href="'+R.readURL(t.id)+'"><small>'+label+'</small><span>'+E(t.title)+'</span></a>':'<span></span>';}).join('');$('.reader-shell')?.append(nav);}
  }
  updateSaved();syncDock();
 }finally{enhancing=false;}
}
function syncDock(){
 const r=R.byId.get(current());if(!r||R.view!=='read')return;
 const place=R.visiblePlace(),p=place?.anchor&&document.getElementById(place.anchor),number=p?.dataset.paragraphNumber;
 const meta=r.surah+' · §'+(r.index+1)+(number?' · ¶'+number:'');
 if($('#location-source').textContent!==meta)$('#location-source').textContent=meta;
 if($('#location-label').textContent!==r.title)$('#location-label').textContent=r.title;
 $('#location-button').setAttribute('aria-label','Current location: '+meta+'. Open section navigator.');
}
function dictionarySections(body,id){
 if(!body||body.dataset.enhanced==='yes')return;body.dataset.enhanced='yes';
 const isFull=body.classList.contains('dictionary-full-entry');
 const children=[...body.children],sections={};let key='meaning';
 for(const k of ['meaning','sources','text']){const section=document.createElement('section');section.id='dictionary-'+k;section.className='dictionary-section';sections[k]=section;}
 for(const node of children){
  if(node.matches('#save-source-reference'))continue;
  if(node.tagName==='H3'&&node.textContent.includes('Historical source'))key='sources';
  if(node.tagName==='H3'&&node.textContent.includes('Occurrences'))key='text';
  sections[key].append(node);
 }
 const nav=document.createElement('nav');nav.className='dictionary-entry-nav';nav.setAttribute('aria-label','Jump within dictionary entry');
 nav.innerHTML=[['meaning','Meaning'],['sources','Sources'],['text','In the text']].map(([key,label])=>'<button data-dictionary-jump="dictionary-'+key+'">'+label+'</button>').join('')+(!isFull&&id?'<a href="#/entry/'+encodeURIComponent(id)+'">Full page ↗</a>':'');
 body.append(nav,...Object.values(sections));
 for(const evidence of sections.sources.querySelectorAll('.source-evidence')){
  const h=evidence.querySelector('h3'),author=evidence.querySelector('.eyebrow');
  const details=document.createElement('details');details.className='dictionary-source';const summary=document.createElement('summary');
  summary.textContent=[h?.textContent,author?.textContent].filter(Boolean).join(' · ');details.append(summary);
  while(evidence.firstChild)details.append(evidence.firstChild);evidence.replaceWith(details);
 }
 if(!isFull)body.insertAdjacentHTML('beforeend','<button data-action="close-sheet" class="reference-return">← Return to reading</button>');
}
function sync(){
 if(frame)return;frame=requestAnimationFrame(()=>{frame=0;enhanceReader();});
 const p=R.prefs;
 document.body.dataset.readerMode=p.mode;
 if($('#settingsParallelSideRow'))$('#settingsParallelSideRow').hidden=matchMedia('(max-width:720px)').matches||!p.ar||!p.en;
 if($('#settingsStackedOrderRow'))$('#settingsStackedOrderRow').hidden=!matchMedia('(max-width:720px)').matches||!p.ar||!p.en;
}
function install(){
 $('#focusToolbar').setAttribute('data-focus-toggle','');
 $('#reading-dock').setAttribute('role','navigation');$('#reading-dock').setAttribute('aria-label','Adjacent sections and section picker');
 $('#location-button').removeAttribute('data-action');$('#location-button').dataset.openPicker='';
 $('#location-button').append(Object.assign(document.createElement('span'),{className:'dock-picker-icon',innerHTML:icon('list')}));
 const footer=$('#leftNav .gn-nav-footer-links');footer.innerHTML='<button type="button" data-nav="home">Home</button>';
 footer.insertAdjacentHTML('afterend','<a class="sidebar-publisher" href="../../../" aria-label="Gnamma Research library">'+BAHR_UI_ASSETS.publisher+'<span class="publisher-copy"><strong>gnamma</strong><span>RESEARCH</span></span></a>');
 const help=$('#leftNav [data-nav="help"]');help?.classList.add('nav-help');
 setupPicker();if(R.view==='contents')contentsPage();
 new MutationObserver(sync).observe($('#main'),{childList:true,subtree:true});
 const original=window.BahrUI.dock;window.BahrUI.dock=id=>{original(id);syncDock();updateSaved();};
 window.addEventListener('resize',()=>{closePopovers();sync();});
 window.addEventListener('hashchange',()=>{closePopovers();closePicker();});
 document.addEventListener('pointerdown',e=>{if(copyPopup&&!copyPopup.hidden&&!e.target.closest('#gn-copy-menu,[data-ui="copy-menu"]'))closePopovers();});
 document.addEventListener('input',e=>{if(e.target.id==='full-contents-query')$('#full-contents-results').innerHTML=contentsHTML(e.target.value);});
 document.addEventListener('keydown',e=>{
  if(copyPopup&&!copyPopup.hidden){
   const buttons=[...copyPopup.querySelectorAll('button')],i=buttons.indexOf(document.activeElement);
   if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closePopovers(true);}
   if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();buttons[e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus();}
  }
 });
 document.addEventListener('click',e=>{
  const b=e.target.closest('button,a');if(!b)return;
  const d=b.dataset;
  if(d.openPicker!==undefined){e.preventDefault();openPicker();}
  else if(d.sourceDetails){e.preventDefault();sourceDetails(d.sourceDetails);}
  else if(d.sectionBookmark){R.addBookmark(d.sectionBookmark);updateSaved();}
  else if(d.sectionNote){R.annotateAt('note',{r:d.sectionNote,anchor:'unit-'+d.sectionNote,lang:'en',quote:''});}
  else if(d.savedAt){savedItems(d.record,d.savedAt);}
  else if(d.dictionaryJump){const destination=document.getElementById(d.dictionaryJump);destination?.scrollIntoView({block:'start',behavior:'instant'});}
  else if(d.pickerHistory||d.pickerRecent!==undefined){
   const n=window.BahrNavigation,h=n.history;
   if(d.pickerHistory==='clear'){h.clear();renderHistory();return;}
   const place=d.pickerHistory==='back'?h.back(n.snapshot()):d.pickerHistory==='forward'?h.forward(n.snapshot()):h.recentVisit(Number(d.pickerRecent),n.snapshot());
   closePicker();n.visitPlace(place);
  }
 },true);
 sync();
}
window.BahrParity={sync,contentsPage,copyMenu,closePopovers,dictionarySections};
install();
})();

