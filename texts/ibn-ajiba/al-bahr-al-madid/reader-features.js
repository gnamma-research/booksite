/* Book-specific bindings for Daruri's shared search, transfer and download controls. */
(function(){
'use strict';
const R=window.BahrReader,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],E=R.E;
const icon=n=>window.GnammaBookmarkUI&&['bookmark','notes'].includes(n)?(n==='notes'?GnammaBookmarkUI.noteIcon():GnammaBookmarkUI.icon()).replace('class="','class="icon '):'<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-'+n+'"></use></svg>';
const storageKey='gnamma-bahr-vol1-';

const history=window.GnammaNavigationHistory.create({validSection:id=>R.byId.has(id)});
let lastSnapshot=null,skipTrail=false;
function snapshot(){
 const p=R.visiblePlace();if(!p)return lastSnapshot;
 const nodes=[...document.querySelectorAll('#unit-'+CSS.escape(p.r)+' [data-anchor]')],i=nodes.findIndex(x=>x.id===p.anchor);
 return {section:p.r,y:scrollY,anchor:i>=0?{segment:String(i),top:document.getElementById(p.anchor)?.getBoundingClientRect().top||0}:null,at:Date.now()};
}
async function visitPlace(p){
 if(!p)return;skipTrail=true;R.closeSheet();const records=await R.record(p.section),unit=document.createElement('div');unit.innerHTML=R.unitHTML(records);
 const anchor=p.anchor?unit.querySelectorAll('[data-anchor]')[Number(p.anchor.segment)]?.id:'';
 location.hash=R.readURL(p.section,anchor||'');
}
function historyPanel(){
 if(!$('#contents-query')||$('#reading-history'))return;
 const root=document.createElement('div');root.id='reading-history';
 root.innerHTML='<div class="desk-toolbar"><button type="button" data-history="back" '+(!history.previous()?'disabled':'')+'>↶ Back</button><button type="button" data-history="forward" '+(!history.next()?'disabled':'')+'>Forward ↷</button></div><details><summary>Recent places</summary><div class="panel-nav">'+history.recentList().slice(0,16).map((p,i)=>'<button type="button" data-history-visit="'+i+'">'+E(R.byId.get(p.section)?.title||p.section)+'</button>').join('')+'</div><button type="button" data-history="clear">Clear recent places</button></details>';
 $('#contents-query').parentElement.after(root);
}
document.addEventListener('click',event=>{
 if(['previous','next'].includes(event.target.closest('button')?.id))skipTrail=true;
 const button=event.target.closest('[data-history],[data-history-visit]');if(!button){if(R.view==='read')lastSnapshot=snapshot();return;}
 event.preventDefault();event.stopImmediatePropagation();
 if(button.dataset.history==='back')visitPlace(history.back(snapshot()));
 else if(button.dataset.history==='forward')visitPlace(history.forward(snapshot()));
 else if(button.dataset.history==='clear'){history.clear();$('#reading-history')?.remove();historyPanel();}
 else visitPlace(history.recentVisit(Number(button.dataset.historyVisit),snapshot()));
},true);
window.addEventListener('hashchange',()=>{
 const match=location.hash.match(/^#\/read\/([^?]+)/);if(!match)return;
 const id=decodeURIComponent(match[1]);if(!R.byId.has(id))return;
 if(lastSnapshot&&!skipTrail&&lastSnapshot.section!==id)history.record(lastSnapshot,{section:id,y:0,anchor:null,at:Date.now()});
 skipTrail=false;lastSnapshot={section:id,y:0,anchor:null,at:Date.now()};
});
new MutationObserver(historyPanel).observe($('#sheet-body'),{childList:true});

const transfer=window.GnammaBackupTransfer.create({
 sections:R.byId,state:{get route(){return R.view==='read'?'reader':R.view;}},
 rd:{backup:()=>JSON.stringify({...JSON.parse(R.backup()),readingNavigation:history.exportData()}),importParsed:(data,choice)=>{const result=R.importParsed(data,choice);if(choice.history)result.historyAdded=history.importData(data.readingNavigation);return result;},downloadBackup:(body,name)=>R.download(name,body)},
 savePrefs:R.savePrefs,applyPrefs:()=>R.setPrefs({},R.view==='read'),goSection:id=>location.hash=R.readURL(id)
});
function script(path){return new Promise((resolve,reject)=>{const el=document.createElement('script');el.src=path;el.onload=resolve;el.onerror=()=>{el.remove();reject(Error('Could not load '+path));};document.head.append(el);});}
let searchReady=null;
function prepareSearch(){
 if(searchReady)return searchReady;
 searchReady=(async()=>{
  const rows=await R.getSearchIndex(),dictionary=await R.data('dictionary'),indices=await R.data('indices');
  window.BAHR_SEARCH_DATA={rows,dictionary:{terms:Object.fromEntries(dictionary.map(d=>[d.term,d]))},book:{
   sections:R.catalog,glossary:dictionary.map(d=>({term:d.term,ar:d.ar,definition:d.gloss})),
   index:indices.topics.map(x=>({term:x.h,sub:(x.subs||[]).map(y=>({label:y.t,sections:[...new Set((y.refs||[]).map(ref=>indices.targets[ref]?.r).filter(Boolean))]}))}))
  }};
  await script('gnamma-search.js');await script('gnamma-word-context.js');
 })().catch(err=>{searchReady=null;throw err;});
 return searchReady;
}
const wordButton=document.createElement('button');wordButton.type='button';wordButton.dataset.feature='word-context';wordButton.textContent='Word Context';$('#selection-tools').append(wordButton);
let query='',sort='created-desc',deskCategory='all',deskSource='all';
function enhanceDesk(){
 if(R.view!=='desk'||$('#desk-query'))return;
 const toolbar=$('#main .desk-toolbar');if(!toolbar)return;
 toolbar.innerHTML='<button type="button" data-feature="new-note">'+icon('notes')+' New note</button><button type="button" data-feature="print-desk">'+icon('editions')+' Print / PDF</button><details class="desk-manage"><summary>Manage</summary><div><button type="button" data-feature="transfer">'+icon('download')+' Backup &amp; Transfer</button><button type="button" data-feature="markdown">Export readable notes (.md)</button><button type="button" data-desk-filter="archived">Open Bin</button></div></details>';
 const tabs=$('#main .index-tabs');if(tabs)tabs.innerHTML=[['all','All'],['bookmark','Bookmarks'],['highlight','Highlights'],['note','My notes']].map(([v,t])=>'<button data-desk-filter="'+v+'" aria-pressed="'+(deskCategory===v)+'">'+t+'</button>').join('')+(deskCategory==='archived'?'<span class="muted">Bin · <button data-desk-filter="all">Return to saved items</button></span>':'');
 toolbar.insertAdjacentHTML('afterend','<div class="desk-browse"><label for="desk-query">Search saved items<input type="search" id="desk-query" placeholder="Search bookmarks, highlights and notes…" value="'+E(query)+'"></label><label for="desk-sort">Sort<select id="desk-sort">'+[['created-desc','Newest saved'],['created-asc','Oldest saved'],['modified-desc','Recently edited'],['source','Text / source order'],['alpha','Title A–Z']].map(([id,label])=>'<option value="'+id+'" '+(id===sort?'selected':'')+'>'+label+'</option>').join('')+'</select></label></div>');
 $$('.desk-card').forEach(card=>{const id=card.querySelector('[data-edit-note]')?.dataset.editNote;if(id)card.dataset.deskId=id;const archive=card.querySelector('[data-archive-note]');if(archive&&archive.textContent==='Archive')archive.textContent='Move to Bin';});
 const sourceLabel=document.createElement('label');sourceLabel.innerHTML='Saved from <select id="desk-source">'+[['all','All sources'],['text','Text passages'],['note','Source notes'],['dictionary','Dictionary'],['index','Subject index'],['question','Scholarly research'],['lesson','Study lessons']].map(([v,t])=>'<option value="'+v+'" '+(v===deskSource?'selected':'')+'>'+t+'</option>').join('')+'</select>';$('#desk-sort').parentElement.before(sourceLabel);
 for(const card of $$('.desk-card')){
  const item=R.desk.find(x=>x.id===card.dataset.deskId);if(!item?.reference)continue;
  card.querySelector('h3').textContent=item.reference.title;
  const link=card.querySelector('footer a');if(link){link.textContent='Open saved source';link.dataset.savedReference=item.id;link.href='#/desk';}
 }
 filterDesk();
}
function filterDesk(){
 const cards=$$('.desk-card'),rows=new Map(R.desk.map(x=>[x.id,x]));
 cards.sort((a,b)=>{
  const x=rows.get(a.dataset.deskId),y=rows.get(b.dataset.deskId);if(!x||!y)return 0;
  if(sort==='source')return(R.byId.get(x.r)?.index||0)-(R.byId.get(y.r)?.index||0);
  if(sort==='alpha')return(R.byId.get(x.r)?.title||x.r).localeCompare(R.byId.get(y.r)?.title||y.r);
  const field=sort==='modified-desc'?'updatedAt':'createdAt';return(sort==='created-asc'?1:-1)*(Date.parse(x[field])-Date.parse(y[field]));
 });
 for(const card of cards){const row=rows.get(card.dataset.deskId),kind=row?.reference?.kind||'text';card.hidden=!R.N(card.textContent).includes(R.N(query))||(deskSource!=='all'&&(deskSource==='note'?!['note','report','source'].includes(kind):kind!==deskSource));$('#desk-items').append(card);}
 if(!$('#desk-filter-count'))$('#desk-items').before(Object.assign(document.createElement('p'),{id:'desk-filter-count',className:'muted'}));
 $('#desk-filter-count').textContent=cards.filter(x=>!x.hidden).length+' saved items';
}
function markdown(){
 const text=R.desk.filter(x=>!x.archived).map(x=>'## '+(R.byId.get(x.r)?.title||x.r)+'\n\n'+(x.quote?'> '+x.quote.replace(/\n/g,'\n> ')+'\n\n':'')+(x.note?x.note+'\n\n':'')+'Saved: '+x.createdAt+'\n\n'+new URL(R.readURL(x.r,x.anchor,x.lang),location.href).href).join('\n\n---\n\n');
 R.download('Ibn-Ajiba-reading-notes.md','# Reading Desk\n\n'+text,'text/markdown;charset=utf-8');
}


function paragraphControls(){
 if(R.view!=='read')return;
 const existing=new Set($$('.personal-paragraph-tools').map(x=>x.dataset.for));
 for(const p of $$('#main .passage [data-anchor]')){
  if(existing.has(p.id))continue;
  const r=p.closest('.passage').dataset.record,lang=p.dataset.lang;
  const row=document.createElement('div');row.className='personal-paragraph-tools';row.dataset.for=p.id;row.dataset.record=r;row.dataset.lang=lang;row.setAttribute('role','group');row.setAttribute('aria-label','Paragraph reading actions');
  row.innerHTML='<button type="button" data-paragraph-action="bookmark" aria-label="Bookmark paragraph">'+GnammaBookmarkUI.icon({kind:'paragraph',saved:R.desk.some(x=>!x.archived&&x.type==='bookmark'&&x.anchor===p.id)})+'</button><button type="button" data-paragraph-action="note" aria-label="Add personal note to paragraph">'+GnammaBookmarkUI.noteIcon()+'</button>';
  p.before(row);
 }
}

function referenceControls(){
 const ref=$('#sheet').dataset.savedReference;if(!ref||$('#save-source-reference'))return;
 const button=document.createElement('button');button.id='save-source-reference';button.type='button';button.dataset.feature='save-reference';button.innerHTML=icon('bookmark')+' Bookmark source';
 $('#sheet-body').prepend(button);
}
function sourceSaveControls(){
 if(R.view==='indices')for(const details of $$('#index-results>details')){
  if(details.querySelector('[data-save-index]'))continue;const title=details.querySelector('summary').textContent,key=$('[data-index][aria-pressed="true"]')?.dataset.index||'topics';
  const button=document.createElement('button');button.type='button';button.dataset.saveIndex=key+'|'+title;button.dataset.sourceTitle=title;button.innerHTML=icon('bookmark')+' Bookmark index entry';details.append(button);
 }
 if(R.view==='study')for(const details of $$('.guide-list>details')){
  if(details.querySelector('[data-save-lesson]'))continue;const title=details.querySelector('summary').textContent.replace(/^\s*\d+\s*/,'').trim();
  const button=document.createElement('button');button.type='button';button.dataset.saveLesson=title;button.innerHTML=icon('bookmark')+' Bookmark lesson';details.append(button);
 }
}
window.addEventListener('bahr-reference-open',referenceControls);
new MutationObserver(()=>{sourceSaveControls();paragraphControls();}).observe($('#main'),{childList:true,subtree:true});

const printDefaults={tier:'reading',en:true,ar:true,marks:'source',notes:'none',headings:'original',glossary:false,index:false,research:false,sources:false,personal:false,bookmarks:false,highlights:false,dates:true,order:'source',start:0,end:388};
let printPrefs={...printDefaults};
const select=(id,options,value)=>'<select data-print-option="'+id+'" id="print-'+id+'">'+options.map(([v,t])=>'<option value="'+v+'" '+(String(value)===String(v)?'selected':'')+'>'+E(t)+'</option>').join('')+'</select>';
function customization(){
 return '<div class="download-config"><div class="book-profiles" role="group" aria-label="Book PDF edition">'+[['reading','Reading','Clean text'],['study','Study','Notes + index'],['reference','Reference','Full apparatus']].map(([v,t,d])=>'<button type="button" data-print-tier="'+v+'" aria-pressed="'+(v===printPrefs.tier)+'"><strong>'+t+'</strong><small>'+d+'</small></button>').join('')+'</div>'+
 '<div class="print-languages" role="group" aria-label="Edition languages"><span>Language</span><button type="button" data-print-toggle="en" aria-pressed="'+printPrefs.en+'">EN</button><button type="button" data-print-toggle="ar" aria-pressed="'+printPrefs.ar+'">AR <small>'+(printPrefs.ar?(printPrefs.marks==='source'?'Source marks':'Plain'):'Off')+'</small></button></div>'+
 '<details id="print-custom"><summary>Customize PDF</summary><div class="print-options"><label>Publisher notes'+select('notes',[['none','None'],['selected','Selected'],['full','Full']],printPrefs.notes)+'</label><label>Headings'+select('headings',[['original','Recorded'],['editorial','Editorial guide']],printPrefs.headings)+'</label>'+
 '<fieldset><legend>Include</legend>'+[['glossary','Glossary'],['index','Full index'],['research','Critical questions'],['sources','Source references']].map(([v,t])=>'<label><input type="checkbox" data-print-option="'+v+'" '+(printPrefs[v]?'checked':'')+'> '+t+'</label>').join('')+'</fieldset>'+
 '<label>From'+select('start',R.catalog.map((r,i)=>[i,r.title]),printPrefs.start)+'</label><label>To'+select('end',R.catalog.map((r,i)=>[i,r.title]),printPrefs.end)+'</label></div></details>'+
 '<details><summary>Add from my Reading Desk</summary><fieldset><legend>Personal additions</legend>'+[['personal','My notes'],['bookmarks','Bookmarks'],['highlights','Highlights'],['dates','Include reliable dates']].map(([v,t])=>'<label><input type="checkbox" data-print-option="'+v+'" '+(printPrefs[v]?'checked':'')+'> '+t+'</label>').join('')+'</fieldset><label>Appendix order'+select('order',[['source','Source order'],['created','Oldest first'],['newest','Newest first']],printPrefs.order)+'</label></details>'+
 '<p class="muted">Prepare a print layout from this web edition, then use your browser’s Print / Save as PDF command. The four published PDFs below remain available as complete downloads.</p><button type="button" class="primary" data-feature="prepare-book">Prepare print / PDF</button><p id="print-status" role="status"></p></div>';
}
function enhanceDownloads(){
 if(R.view!=='editions'||$('#download-types'))return;
 const grid=$('.edition-grid');if(!grid)return;
 $('.edition-tabs')?.remove();$('#personal-editions')?.remove();grid.removeAttribute('role');grid.removeAttribute('aria-labelledby');
 const parent=grid.parentElement;const title=parent.querySelector('h1');if(title)title.textContent='Downloads';
 const section=document.createElement('section');section.id='download-book';section.className='download-panel';section.setAttribute('role','tabpanel');section.setAttribute('aria-labelledby','download-tab-book');
 grid.before(section);section.append(grid);
 grid.insertAdjacentHTML('beforebegin','<h2>Book PDF</h2><p>Choose an edition of Ibn ʿAjība’s text.</p>'+customization()+'<h3>Published editions</h3>');
 const purpose=[['book','Book PDF','Reading, Study, Reference','book'],['guide','Study Guide','Lessons and exercises','study'],['offline','Offline reader','Interactive website','download'],['source','Research files','Source texts and notes','notes']];
 section.insertAdjacentHTML('beforebegin','<div id="download-types" role="tablist" aria-label="Download type">'+purpose.map(([id,t,sub,glyph],i)=>'<button type="button" role="tab" id="download-tab-'+id+'" data-download-type="'+id+'" aria-selected="'+(!i)+'" aria-controls="download-'+id+'">'+icon(glyph)+'<span><strong>'+t+'</strong><small>'+sub+'</small></span></button>').join('')+'</div>');
 const guide=document.createElement('section');guide.id='download-guide';guide.className='download-panel';guide.hidden=true;guide.setAttribute('role','tabpanel');guide.setAttribute('aria-labelledby','download-tab-guide');guide.innerHTML='<h2>Study Guide</h2><p>Twelve routes through Volume I, with passage links and study prompts.</p><a class="button" href="#/study">Read the guide</a> <button type="button" data-feature="print-guide">Print / PDF</button>';
 const offline=document.createElement('section');offline.id='download-offline';offline.className='download-panel';offline.hidden=true;offline.setAttribute('role','tabpanel');offline.setAttribute('aria-labelledby','download-tab-offline');
 const source=document.createElement('section');source.id='download-source';source.className='download-panel';source.hidden=true;source.setAttribute('role','tabpanel');source.setAttribute('aria-labelledby','download-tab-source');
 let next=section.nextSibling,inSource=false;
 while(next){const current=next;next=next.nextSibling;if(current.nodeType===1&&current.tagName==='H3'&&current.textContent==='Critical materials')inSource=true;(inSource?source:offline).append(current);}
 parent.append(guide,offline,source);
}
function refreshPrintOptions(){const old=$('.download-config');if(!old)return;const open=$('#print-custom')?.open;old.outerHTML=customization();if($('#print-custom'))$('#print-custom').open=!!open;}
function printPersonalRows(scope='selected'){
 let rows=R.desk.filter(x=>!x.archived);
 if(scope==='selected'){const ids=new Set($$('[data-print-id]:checked').map(x=>x.dataset.printId));rows=rows.filter(x=>ids.has(x.id));}
 else rows=rows.filter(x=>x.type==='note'?printPrefs.personal:x.type==='bookmark'?printPrefs.bookmarks:printPrefs.highlights);
 rows.sort((a,b)=>printPrefs.order==='source'?(R.byId.get(a.r)?.index||0)-(R.byId.get(b.r)?.index||0):((Date.parse(a.createdAt)-Date.parse(b.createdAt))*(printPrefs.order==='newest'?-1:1)));
 return rows;
}
function personalHTML(rows){return rows.length?'<section class="print-appendix"><h1>Personal reading notes</h1>'+rows.map(x=>'<article><h2>'+E(R.byId.get(x.r)?.title||x.r)+'</h2><p>'+E(x.type)+(printPrefs.dates?' · '+E(x.createdAt):'')+'</p>'+(x.quote?'<blockquote dir="auto">'+E(x.quote)+'</blockquote>':'')+(x.note?'<p class="personal-note">'+E(x.note)+'</p>':'')+'<a href="'+E(new URL(R.readURL(x.r,x.anchor,x.lang),location.href).href)+'">Return to passage</a></article>').join('')+'</section>':'';}
function printShell(title,html){
 $('#bahr-print-overlay')?.remove();const overlay=document.createElement('div');overlay.id='bahr-print-overlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Print preview');
 overlay.innerHTML='<div class="print-preview-toolbar"><strong>'+E(title)+'</strong><button type="button" data-feature="print-now">Print / save as PDF</button><button type="button" data-feature="close-print">Close preview</button></div><iframe title="Printable document" id="bahr-print-frame"></iframe>';
 document.body.append(overlay);for(const id of ['main','topbar','reading-dock'])$('#'+id).inert=true;
 const frame=$('#bahr-print-frame'),base=new URL('./',location.href).href;
 frame.srcdoc='<!doctype html><html><head><meta charset="utf-8"><title>'+E(title)+'</title><base href="'+E(base)+'"><link rel="stylesheet" href="fonts/font-faces.css"><style>'+
 '@page{size:A4;margin:18mm}*{box-sizing:border-box}body{font:12pt/1.65 Georgia,serif;color:#111;background:white;max-width:850px;margin:25px auto;padding:0 18px}h1,h2,h3{break-after:avoid}h1{font-size:22pt}h2{font-size:16pt}h3{font-size:13pt}.ar-column,[lang=ar],.arabic{font-family:Amiri,serif;font-size:17pt;line-height:1.8}.print-unit,.print-appendix{break-before:page}.parallel{display:grid;grid-template-columns:1fr 1fr;gap:25px;align-items:start}.single .parallel{display:block}.ar-column{grid-column:2;grid-row:1}.en-column{grid-column:1;grid-row:1}p,blockquote{orphans:3;widows:3}a{color:#222;overflow-wrap:anywhere}button{display:none}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ccc;padding:7px;text-align:left}article{margin-bottom:20px}.personal-note{white-space:pre-wrap}mark{background:#fff0a6}hr{border:0;border-top:1px solid #ccc}.source-note{font-size:10pt}.muted{color:#555}@media print{body{max-width:none;margin:0;padding:0}a{text-decoration:none}}'+
 '</style></head><body>'+html+'</body></html>';
 overlay.querySelector('[data-feature="close-print"]').focus();
 return frame;
}
let preparing=false;
async function prepareBook(){
 if(preparing)return;preparing=true;const settings={...printPrefs};
 try{
  if(Number(settings.end)<Number(settings.start))throw Error('Choose an ending passage at or after the starting passage.');
  const status=$('#print-status');if(status)status.textContent='Preparing the selected text…';
  const chosen=R.catalog.slice(Number(settings.start),Number(settings.end)+1),records=await Promise.all(chosen.map(r=>R.record(r.id)));
  const html=[],noteIds=new Set();
  for(const r of records){
   const ar=settings.marks==='unvowelled'?r.ar.replace(/[\u064b-\u065f\u0670\u06d6-\u06ed]/g,''):r.ar;
   const en=r.segments.map((segment,i)=>{
    const temp=document.createElement('div');temp.innerHTML=segment.html;
    temp.querySelectorAll('[data-note],a[href*="#/note/"]').forEach(x=>{const id=x.dataset.note||x.getAttribute('href').split('/').pop();if(id)noteIds.add(id);});
    temp.querySelectorAll('button').forEach(x=>x.replaceWith(document.createTextNode(x.textContent)));
    return '<section id="en-'+r.id+'-s'+(i+1)+'">'+(settings.headings==='editorial'||segment.authorial?'<h3>'+E(segment.title)+'</h3>':'')+temp.innerHTML+'</section>';
   }).join('');
   html.push('<article class="print-unit '+(settings.ar&&settings.en?'':'single')+'"><h1>'+E(r.title)+'</h1><p>Q '+E(r.q)+' · Cairo '+E(r.cairo)+'</p><div class="parallel">'+(settings.ar?'<div class="ar-column" lang="ar" dir="rtl">'+ar.split('\n').map((p,i)=>'<p id="ar-'+r.id+'-'+(i+1)+'">'+E(p)+'</p>').join('')+'</div>':'')+(settings.en?'<div class="en-column">'+en+'</div>':'')+'</div>'+
   (settings.notes!=='none'&&r.cairo_notes.length?'<h2>Cairo editor’s notes</h2>'+r.cairo_notes.map(n=>'<div class="source-note"><p>'+E(n.id)+'</p><p lang="ar" dir="rtl">'+E(n.ar)+'</p><p>'+E(n.en)+'</p></div>').join(''):'')+'</article>');
  }
  if(settings.notes!=='none'){
   const notes=await R.data('notes');html.push('<section class="print-appendix"><h1>Translator annotations</h1>'+notes.filter(n=>settings.notes==='full'||noteIds.has(n.id)).map(n=>'<article id="note-'+E(n.id)+'"><h2>'+E(n.title||n.id)+'</h2><p>'+E(n.content)+'</p><p>'+E(n.source)+'</p></article>').join('')+'</section>');
  }
  if(settings.glossary){const dictionary=await R.data('dictionary');html.push('<section class="print-appendix"><h1>Historical dictionary</h1>'+dictionary.map(d=>'<article><h2>'+E(d.term)+' · <span lang="ar">'+E(d.ar)+'</span></h2><p>'+E(d.gloss)+'</p>'+d.sources.map(s=>'<h3>'+E(s.author)+' · '+E(s.work)+'</h3><p lang="ar" dir="rtl">'+E(s.quote)+'</p><p>'+E(s.translation)+'</p><p>'+E(s.comment)+'</p>').join('')+'</article>').join('')+'</section>');}
  if(settings.index){const indices=await R.data('indices');html.push('<section class="print-appendix"><h1>Full index</h1>'+['topics','names','works','poetry'].map(k=>'<h2>'+k+'</h2>'+indices[k].map(x=>'<article><h3>'+E(x.h)+'</h3>'+(x.subs||[]).map(y=>'<p>'+E(y.t)+' · '+E((y.refs||[]).join(', '))+'</p>').join('')+'</article>').join('')).join('')+'</section>');}
  if(settings.research){const qs=await R.data('questions');html.push('<section class="print-appendix"><h1>Critical questions</h1>'+qs.map(q=>'<article><h2>'+E(q.question)+'</h2><p>'+E(q.passage)+'</p><p>'+E(q.status)+'</p></article>').join('')+'</section>');}
  if(settings.sources){const reports=await R.data('reports'),sources=await R.data('sources');html.push('<section class="print-appendix"><h1>Reports and source references</h1>'+reports.map(r=>'<article><h2>'+E(r.title)+'</h2><p lang="ar" dir="rtl">'+E(r.arabic)+'</p><p>'+E(r.english)+'</p><p>'+E(r.source)+' · '+E(r.grade)+'</p><p>'+E(r.remarks)+'</p></article>').join('')+sources.map(s=>'<article><h2>'+E(s.legacy_marker)+' · '+E(s.quran_range)+'</h2><p>'+E(s.closest_translated_passage_context)+'</p><p>'+E(s.current_status)+'</p><p>'+E(s.current_source_locators)+'</p></article>').join('')+'</section>');}
  const personal=printPersonalRows('book'),frame=printShell('The Immense Ocean · '+settings.tier,'<h1>The Immense Ocean</h1><p>Ibn ʿAjība · Volume I · Personal print layout</p>'+html.join('')+personalHTML(personal));
  frame.addEventListener('load',()=>{
   const doc=frame.contentDocument;
   for(const row of personal.filter(x=>x.type==='highlight'&&x.quote)){
    const target=doc.getElementById(row.anchor);if(!target)continue;
    const walker=doc.createTreeWalker(target,NodeFilter.SHOW_TEXT);let node;
    while(node=walker.nextNode()){const at=node.data.indexOf(row.quote);if(at<0)continue;const range=doc.createRange();range.setStart(node,at);range.setEnd(node,at+row.quote.length);const mark=doc.createElement('mark');range.surroundContents(mark);break;}
   }
  },{once:true});
  if(status)status.textContent='Print preview prepared.';
 }catch(err){R.toast(err.message);if($('#print-status'))$('#print-status').textContent=err.message;}finally{preparing=false;}
}
async function printGuide(){const guides=await R.data('guides');printShell('The Immense Ocean · Study guide','<h1>Study guide</h1>'+guides.map(g=>'<article><h2>'+E(g.title)+'</h2><p lang="ar" dir="rtl">'+E(g.arabic_title)+'</p>'+g.items.map(i=>'<h3>'+E(i.title)+'</h3><p>'+E(i.description)+'</p><p>'+i.references.flatMap(x=>x.target_ids||[]).map(id=>'<a href="'+E(new URL(R.readURL(id),location.href).href)+'">'+E(R.byId.get(id)?.title||id)+'</a>').join(' · ')+'</p>').join('')+'</article>').join(''));}
document.addEventListener('click',async event=>{
 const button=event.target.closest('button,a');if(!button)return;
 const d=button.dataset;
 if(d.deskFilter){deskCategory=d.deskFilter;return;}
 if(d.paragraphAction){event.preventDefault();event.stopImmediatePropagation();const row=button.closest('.personal-paragraph-tools'),t={r:row.dataset.record,anchor:row.dataset.for,lang:row.dataset.lang,quote:''};if(d.paragraphAction==='bookmark'){R.addParagraphBookmark(t);button.innerHTML=GnammaBookmarkUI.icon({kind:'paragraph',saved:true});}else R.annotateAt('note',t);return;}
 if(d.savedReference){event.preventDefault();event.stopImmediatePropagation();const row=R.desk.find(x=>x.id===d.savedReference);if(row?.reference)await R.openReference(row.reference);return;}
 if(d.saveIndex||d.saveLesson){event.preventDefault();event.stopImmediatePropagation();R.addReference({kind:d.saveIndex?'index':'lesson',id:d.saveIndex||d.saveLesson,title:d.sourceTitle||d.saveLesson});return;}
 if(button.id==='searchBtn'){event.preventDefault();event.stopImmediatePropagation();try{await prepareSearch();R.closeSheet();window.GnammaUnifiedSearch.open();}catch(err){R.toast(err.message);location.hash='#/search';}return;}
 if(!d.feature&&!d.printTier&&!d.printToggle&&!d.downloadType)return;
 event.preventDefault();event.stopImmediatePropagation();
 try{
  if(d.downloadType){$$('[data-download-type]').forEach(b=>b.setAttribute('aria-selected',String(b===button)));$$('.download-panel').forEach(p=>p.hidden=p.id!=='download-'+d.downloadType);return;}
  if(d.printTier){printPrefs.tier=d.printTier;Object.assign(printPrefs,d.printTier==='reading'?{notes:'none',index:false,glossary:false,research:false,sources:false}:d.printTier==='study'?{notes:'selected',index:true,glossary:false,research:false,sources:false}:{notes:'full',index:true,glossary:true,research:true,sources:true,headings:'editorial'});refreshPrintOptions();return;}
  if(d.printToggle){if(d.printToggle==='en'){if(!printPrefs.en||printPrefs.ar)printPrefs.en=!printPrefs.en;}else if(!printPrefs.ar){printPrefs.ar=true;printPrefs.marks='unvowelled';}else if(printPrefs.marks==='unvowelled')printPrefs.marks='source';else if(printPrefs.en)printPrefs.ar=false;else printPrefs.marks='unvowelled';refreshPrintOptions();return;}
  switch(d.feature){
   case'save-reference':R.addReference(JSON.parse($('#sheet').dataset.savedReference));break;
   case'word-context':{const selection=R.selected;if(!selection||selection.lang!=='ar'){R.toast('Select an Arabic word in the text.');break;}await prepareSearch();if(!window.GnammaWordContext.openSelectedQuote(selection))R.toast('Select one Arabic word to inspect its source occurrence.');break;}
   case'transfer':R.closeSheet();transfer.open();break;
   case'new-note':R.annotation('note',R.current||'preface');break;
   case'markdown':markdown();break;
   case'print-desk':printShell('Reading Desk',personalHTML(printPersonalRows()));break;
   case'prepare-book':await prepareBook();break;
   case'print-guide':await printGuide();break;
   case'print-now':{const frame=$('#bahr-print-frame');await frame.contentDocument.fonts.ready;frame.contentWindow.focus();frame.contentWindow.print();break;}
   case'close-print':$('#bahr-print-overlay')?.remove();for(const id of ['main','topbar','reading-dock'])$('#'+id).inert=false;break;
  }
 }catch(err){R.toast(err.message);}
},true);
document.addEventListener('input',event=>{if(event.target.id==='desk-query'){query=event.target.value;filterDesk();}});
document.addEventListener('change',event=>{const t=event.target;if(t.id==='desk-sort'){sort=t.value;filterDesk();}if(t.id==='desk-source'){deskSource=t.value;filterDesk();}if(t.dataset.printOption){const k=t.dataset.printOption;if(Object.hasOwn(printPrefs,k))printPrefs[k]=t.type==='checkbox'?t.checked:t.value;}});
document.addEventListener('keydown',event=>{
 const editable=event.target.matches?.('input,textarea,select,[contenteditable="true"]');
 if(((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k')||(event.key==='/'&&!editable&&!event.altKey&&!event.ctrlKey&&!event.metaKey)){
  event.preventDefault();event.stopImmediatePropagation();prepareSearch().then(()=>window.GnammaUnifiedSearch.open()).catch(err=>R.toast(err.message));return;
 }
 if($('#bahr-print-overlay')&&event.key==='Escape'){$('[data-feature="close-print"]').click();event.preventDefault();}
 if(event.target.dataset?.downloadType&&['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){
  const tabs=$$('[data-download-type]'),i=tabs.indexOf(event.target),n=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
  event.preventDefault();tabs[n].click();tabs[n].focus();
 }
});
new MutationObserver(()=>{enhanceDesk();enhanceDownloads();}).observe($('#main'),{childList:true});
window.BahrFeatures={prepareSearch,transfer,prepareBook,printShell,history};
enhanceDesk();enhanceDownloads();paragraphControls();
})();
