/* Darūrī · compact scholarly Copy and paragraph permalinks.
   Additive extension: existing source text, notes, Reader Desk and route API are unchanged. */
(()=>{
'use strict';
const C=window.GnammaCopyContext;
if(!C?.book?.sections||!C?.state||!C?.sections)return;
const REV='20261024-copylinks1';
/* Frozen 2026-10-24 paragraph registry: §§1–258, followed by the colophon.
   NEVER recompute identifiers after a textual split/merge. New IDs and aliases
   require an explicit edit to this registry and its acceptance tests. */
const COUNTS=('1,2,2,1,1,2,1,1,1,1,3,1,1,1,2,1,4,1,2,1,1,1,2,1,2,1,1,3,2,1,2,1,1,1,1,1,1,2,1,1,1,1,1,2,2,1,4,1,3,1,1,1,2,1,1,2,2,2,1,1,1,1,1,4,2,1,1,1,2,1,1,1,1,1,4,3,3,1,1,1,3,3,1,1,1,1,1,1,1,2,1,1,1,1,1,2,2,1,1,1,1,1,1,1,3,1,3,2,2,2,5,2,5,1,2,1,1,2,2,1,3,1,2,2,1,2,1,1,2,2,3,1,1,1,2,1,2,3,1,1,2,3,1,1,1,1,1,1,1,1,1,1,3,1,1,1,1,1,1,1,3,2,5,1,1,2,2,2,1,2,1,1,1,1,1,1,1,1,1,3,2,2,1,1,3,2,2,1,2,1,4,1,2,4,3,1,2,3,1,3,2,1,2,1,2,1,1,2,1,2,2,2,2,1,1,1,3,2,1,1,2,2,3,1,3,1,1,1,4,1,2,1,2,1,1,1,1,1,2,3,2,1,2,1,1,3,2,1,1,4,2,2,2,2,1,2,1,1').split(',').map(Number);
const OVERRIDES=Object.freeze({}); /* Future changes: {'64':['R064-P001', ...]} */
const ALIASES=Object.freeze({}); /* Retired ID -> canonical retained ID. */
const escapeHTML=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const idFor=(section,index)=>{
 const n=String(section),s=C.sections.get(n),ids=OVERRIDES[n],count=n==='colophon'?2:COUNTS[Number(n)-1];
 if(!s||!Number.isInteger(index)||index<0)return null;
 if(ids)return ids[index]||null;
 if(s.segments.length!==count||index>=count)return null; /* Fail closed on unregistered splits. */
 return (n==='colophon'?'RCOL':'R'+n.padStart(3,'0'))+'-P'+String(index+1).padStart(3,'0');
};
const locate=(section,id)=>{
 const s=C.sections.get(String(section));if(!s||!id)return -1;
 const canonical=ALIASES[id]||id;
 return (s.segments||[]).findIndex((_,i)=>idFor(section,i)===canonical);
};
const urlFor=(section,from=null,to=null)=>{
 const base=location.href.split('#')[0];
 const parts=['section='+encodeURIComponent(section)];
 if(from&&locate(section,from)>=0){parts.push('paragraph='+encodeURIComponent(from));if(to&&to!==from&&locate(section,to)>=locate(section,from))parts.push('through='+encodeURIComponent(to));}
 return base+'#'+parts.join('&');
};
function parseHash(hash=location.hash){
 const fragment=String(hash).replace(/^#/,'');if(!fragment.startsWith('section='))return null;
 let q;try{q=new URLSearchParams(fragment)}catch(_){return null;}
 const section=q.get('section');if(!C.sections.has(section))return null;
 const raw=q.get('paragraph');if(!raw)return {section,index:-1,id:null};
 const index=locate(section,raw);return {section,index,id:index>=0?idFor(section,index):null,invalid:index<0,raw};
}
const segs=section=>C.sections.get(String(section))?.segments||[];
const sectionLabel=n=>n==='colophon'?'Colophon':'§'+n;
const paragraphLabel=(n,i)=>sectionLabel(n)+' · ¶'+(i+1);
const preview=(n,i)=>String(segs(n)[i]?.en||'').replace(/\s+/g,' ').slice(0,82);
const getReader=()=>document.querySelector('#reader');
function gridLocation(grid){
 if(!grid)return null;
 const section=grid.closest('.gn-continuous-section[data-reading-section]')?.dataset.readingSection||String(C.state.n);
 const index=Number(grid.dataset.segment);
 return Number.isInteger(index)&&idFor(section,index)?{section,index,id:idFor(section,index)}:null;
}
function currentGrid(){
 const nodes=[...document.querySelectorAll('#reader .passage-grid[data-segment]')];
 if(!nodes.length)return null;
 const cutoff=Math.min(180,Math.max(85,innerHeight*.27));
 return nodes.find(n=>n.getBoundingClientRect().top<=cutoff&&n.getBoundingClientRect().bottom>=cutoff) ||
   nodes.find(n=>n.getBoundingClientRect().bottom>cutoff)||nodes[0];
}
function currentTarget(){return selected?{section:selected.section,index:selected.start,id:idFor(selected.section,selected.start)}:targeted||gridLocation(currentGrid())||{section:String(C.state.n),index:0,id:idFor(C.state.n,0)};}
let targeted=null,selected=null,selectionScheduled=false,menu=null,sheet=null,opener=null,config=null,preloadIssue=[],sourceReady=false,preloadToken=0,pendingSelection=null;
function selectionSnapshot(){
 const s=window.getSelection();if(!s||s.isCollapsed||!String(s).trim()||!s.rangeCount)return null;
 const r=s.getRangeAt(0),root=getReader();if(!root)return null;
 const ancestor=x=>x?.nodeType===1?x:x?.parentElement;
 const a=ancestor(r.startContainer)?.closest('.passage-ar,.passage-en');
 const b=ancestor(r.endContainer)?.closest('.passage-ar,.passage-en');
 if(!a||!b||!root.contains(a)||!root.contains(b))return null;
 const first=gridLocation(a.closest('.passage-grid')),last=gridLocation(b.closest('.passage-grid'));
 if(!first||!last||first.section!==last.section)return null; /* No guessed cross-section selection. */
 const text=String(s);return {text,section:first.section,start:Math.min(first.index,last.index),end:Math.max(first.index,last.index),language:a.classList.contains('passage-ar')&&b.classList.contains('passage-ar')?'ar':a.classList.contains('passage-en')&&b.classList.contains('passage-en')?'en':'both'};
}
function refreshSelection(){
 if(selectionScheduled)return;selectionScheduled=true;
 queueMicrotask(()=>{selectionScheduled=false;
  const prior=selected;
  // A real selection is immutable once the Copy menu or sheet opens. Touch
  // scrolling/focus changes must never convert a quotation to a new paragraph.
  if(!(prior&&((menu&&!menu.hidden)||sheet)))selected=selectionSnapshot();
  if(menu&&!menu.hidden&&(prior?.text!==selected?.text||
       prior?.section!==selected?.section||prior?.start!==selected?.start))
    drawMenu();
  const copy=document.querySelector('#readerCopyAction');
  if(copy){copy.setAttribute('aria-label',selected?'Copy selected text':'Copy complete current section');copy.title=copy.getAttribute('aria-label');}
 });
}
document.addEventListener('selectionchange',refreshSelection);
// On touch devices the Copy control may take focus and collapse a real selection.
document.addEventListener('pointerdown',e=>{
 if(e.target.closest?.('#readerCopyAction,#readerCopyOptions,#gn-copy-menu'))pendingSelection=selectionSnapshot()||selected;
 else if(e.target.closest?.('#reader .passage-ar,#reader .passage-en'))pendingSelection=null;
},true);
function annotate(){
 if(!getReader())return;
 for(const grid of document.querySelectorAll('#reader .passage-grid[data-segment]')){
   if(grid.dataset.gnParagraphId)continue;
   const p=gridLocation(grid);if(!p)continue;
   grid.dataset.gnParagraphId=p.id;
   const btn=document.createElement('button');btn.type='button';btn.className='gn-paragraph-link';
   btn.dataset.gnParLink=p.id;btn.dataset.gnParSection=p.section;
   btn.textContent='¶'+(p.index+1);
   btn.setAttribute('aria-label','Copy link to '+paragraphLabel(p.section,p.index));btn.title='Link to '+paragraphLabel(p.section,p.index);
   grid.prepend(btn);
 }
 if(!document.querySelector('#readerCopyOptions'))mountCopyButton();
 if(location.hash.includes('&paragraph='))requestJump();
}
let annotating=false;const observer=new MutationObserver(()=>{if(annotating)return;annotating=true;requestAnimationFrame(()=>{annotating=false;annotate()});});
observer.observe(document.querySelector('#mainContent')||document.body,{childList:true,subtree:true});
function requestJump(){const dest=parseHash();if(!dest?.id)return;
 const target=[...document.querySelectorAll('#reader .passage-grid[data-gn-paragraph-id]')].find(el=>el.dataset.gnParagraphId===dest.id);
 if(!target)return;
 if(lastJumpHash===location.hash&&lastJumpElement===target)return;
 lastJumpHash=location.hash;lastJumpElement=target;
 target.scrollIntoView({block:'start',behavior:'instant'});
 // Offset only explicit permalink jumps; ordinary Reader paragraph scrolling
 // must retain its existing geometry and dock paragraph tracking.
 const toolbar=document.getElementById('readingControls');
 const safeTop=Math.max(0,toolbar?.getBoundingClientRect().bottom||0)+28;
 const actualTop=target.getBoundingClientRect().top;
 if(actualTop<safeTop)window.scrollBy({top:actualTop-safeTop,behavior:'instant'});
 target.classList.add('gn-copy-target');
 document.querySelectorAll('#reader .gn-copy-target').forEach(other=>{if(other!==target)other.classList.remove('gn-copy-target')});
 setTimeout(()=>{if(target.isConnected)target.classList.remove('gn-copy-target')},2600);
}
let lastJumpHash='',lastJumpElement=null;
window.addEventListener('hashchange',()=>{
 const p=parseHash();if(!p)return;
 lastJumpHash='';lastJumpElement=null;
 if(p.invalid){setTimeout(()=>message('Paragraph link is no longer current; showing the section.'),250);return;}
 requestAnimationFrame(()=>requestAnimationFrame(()=>{annotate();requestJump()}));
});
function mountCopyButton(){
 const copy=document.querySelector('#readerCopyAction');if(!copy)return;
 copy.dataset.gnCopyReady='1';
 copy.setAttribute('aria-label','Copy complete current section');
 const group=document.createElement('div');group.className='gn-copy-wrapper';copy.before(group);group.append(copy);
 const arrow=document.createElement('button');arrow.type='button';arrow.id='readerCopyOptions';arrow.className='gn-copy-chevron';
 arrow.setAttribute('aria-label','Copy options');arrow.setAttribute('aria-haspopup','menu');arrow.setAttribute('aria-expanded','false');arrow.innerHTML='<span aria-hidden="true">⌄</span>';
 group.append(arrow);
 arrow.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(menu&&!menu.hidden)closeMenu();else openMenu(arrow)});
}
function menuHost(){if(menu)return menu;menu=document.createElement('div');menu.className='gn-copy-menu';menu.id='gn-copy-menu';menu.hidden=true;menu.setAttribute('role','menu');menu.setAttribute('aria-label','Copy options');document.body.append(menu);return menu;}
/* Distinct at small sizes: typography Aa, a speech annotation bubble,
   and a three-volume scholarly source collection. Not three page icons. */
const copyMenuSvg=paths=>'<svg class="gn-copy-symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths+'</svg>';
const copyMenuSymbols=Object.freeze({
 selected:copyMenuSvg('<rect x="3" y="4" width="18" height="16" rx="2" stroke-dasharray="2 2"/><path d="M7 9h10M7 13h6"/>'),
 text:'<span class="gn-copy-type-mark">Aa</span>',
 notes:copyMenuSvg('<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 9h8"/><path d="M8 13h6"/>'),
 research:copyMenuSvg('<rect x="2.5" y="6" width="4.5" height="15" rx="1"/><path d="M10 3.5h4.5V21H10z"/><path d="M16.5 8.5l3.8-1 2 12.7-3.8 1z"/><path d="M3.5 18h2.5M11 18h2.5M18.2 18l2.7-.4"/>'),
 citation:'❞',
 link:'↗'
});
function drawMenu(){
 menuHost();const p=selected?{section:selected.section,index:selected.start}:gridLocation(currentGrid())||currentTarget();
 const entries=[...(selected?[['selected','Selected text','text-cursor']]:[]),['text','Text','file-text'],['notes','Scholarly notes','notebook-pen'],['research','Research extract','library-big'],['citation','Citation','quote'],['link','Link','link']];
 menu.innerHTML='<div class="gn-copy-menu-head">Copy <small>'+escapeHTML(sectionLabel(p.section)+(p.index>=0?' · ¶'+(p.index+1):''))+'</small></div>'+entries.map(([kind,label,ico],i)=>
  (kind==='citation'?'<div class="gn-copy-rule"></div>':'')+'<button type="button" role="menuitem" data-gn-menu="'+kind+'"><span class="gn-copy-mini gn-copy-icon-'+ico+'" data-gn-icon="'+kind+'" aria-hidden="true">'+copyMenuSymbols[kind]+'</span><span>'+label+'</span><span class="gn-copy-arrow" aria-hidden="true">›</span></button>'
 ).join('');
}
function openMenu(trigger){if(C.state.route!=='reader')return;targeted=null;selected=selectionSnapshot()||pendingSelection||null;
 opener=trigger;drawMenu();menu.hidden=false;trigger.setAttribute('aria-expanded','true');
 const box=trigger.getBoundingClientRect(),left=Math.max(8,Math.min(innerWidth-menu.offsetWidth-8,box.right-menu.offsetWidth));
 menu.style.left=left+'px';menu.style.top=Math.min(innerHeight-menu.offsetHeight-8,box.bottom+5)+'px';
 menu.querySelector('button')?.focus({preventScroll:true});
}
let menuPositionFrame=0;
function refreshOpenCopyMenu(){
 if(!menu||menu.hidden||C.state.route!=='reader')return;
 if(menuPositionFrame)return;
 menuPositionFrame=requestAnimationFrame(()=>{
  menuPositionFrame=0;
  if(!menu||menu.hidden||C.state.route!=='reader'||selected)return;
  const head=menu.querySelector('.gn-copy-menu-head small');
  const p=gridLocation(currentGrid())||currentTarget();
  const label=sectionLabel(p.section)+(p.index>=0?' · ¶'+(p.index+1):'');
  if(head&&head.textContent!==label)head.textContent=label;
 });
}
window.addEventListener('scroll',refreshOpenCopyMenu,{passive:true});
window.addEventListener('resize',refreshOpenCopyMenu,{passive:true});
function closeMenu(restore=false){if(!menu)return;menu.hidden=true;document.querySelector('#readerCopyOptions')?.setAttribute('aria-expanded','false');if(restore)opener?.focus({preventScroll:true});}
function message(v){const old=document.querySelector('#gn-copy-toast');old?.remove();const x=document.createElement('div');x.id='gn-copy-toast';x.className='gn-copy-toast';x.setAttribute('role','status');x.textContent=v;document.body.append(x);setTimeout(()=>x.remove(),3800);}
const modes={selected:'Selected text',text:'Copy text',notes:'Scholarly notes',research:'Research extract',citation:'Scholarly citation',link:'Copy link'};
function defaults(kind){
 const p=selected?{section:selected.section,index:selected.start,id:idFor(selected.section,selected.start)}:currentTarget();
 const len=segs(p.section).length;
 const scope=kind==='selected'?'selected':kind==='link'&&targeted?'paragraph':'section';
 return {kind,section:p.section,scope,start:Math.max(0,p.index),end:Math.max(0,p.index),
 language:C.state.lang==='parallel'?'both':C.state.lang==='arabic'?'ar':'en',vowels:!!C.state.vowels,
 editorial:kind!=='text',sources:kind==='notes'||kind==='research',variants:kind==='research',
 dictionary:kind==='research',bidaya:kind==='research',quranContext:kind==='research',hadithContext:kind==='research',
 sectionNotes:kind==='research',personal:false,appendCitation:false,appendLink:false,
 rich:false,citationSource:'translation',size:len};
}
const radio=(name,val,label,current)=>'<label class="gn-copy-choice"><input type="radio" name="'+name+'" value="'+val+'" '+(current===val?'checked':'')+'><span>'+label+'</span></label>';
const checkbox=(name,label,checked)=>'<label class="gn-copy-check"><input type="checkbox" name="'+name+'" '+(checked?'checked':'')+'><span>'+label+'</span></label>';
function chooser(name,value){return '<select name="'+name+'" aria-label="'+(name==='start'?'Starting paragraph':'Ending paragraph')+'">'+segs(config.section).map((_,i)=>'<option value="'+i+'" '+(Number(value)===i?'selected':'')+'>¶'+(i+1)+' · '+escapeHTML(preview(config.section,i))+'</option>').join('')+'</select>';}
function summary(){
 const sc=config.scope==='section'?sectionLabel(config.section):config.scope==='selected'?'Selected text':config.scope==='range'?paragraphLabel(config.section,config.start)+'–¶'+(config.end+1):paragraphLabel(config.section,config.start);
 return sc+(config.kind==='link'?'': ' · '+({en:'English',ar:'Arabic',both:'Arabic + English'}[config.language]||''));
}
function drawSheet(){
 if(!sheet)return;const k=config.kind,isLink=k==='link',isCite=k==='citation',isSelected=k==='selected';
 const scopes=(isSelected?['selected']:isLink?['paragraph','range','section']:['paragraph','range','section']);
 const scopeGroup='<div class="gn-copy-pills">'+scopes.map(x=>radio('scope',x,({selected:'Selected text',paragraph:'Paragraph',range:'Range',section:'Section'})[x],config.scope)).join('')+'</div>';
 const paragraph=config.scope==='paragraph'?'<label class="gn-copy-field">Paragraph'+chooser('start',config.start)+'</label>':
   config.scope==='range'?'<div class="gn-copy-pair"><label class="gn-copy-field">From'+chooser('start',config.start)+'</label><label class="gn-copy-field">To'+chooser('end',config.end)+'</label></div>':'';
 const languages=isLink||isCite||isSelected?'':'<div class="gn-copy-group"><div class="gn-copy-label">Language</div><div class="gn-copy-pills">'+radio('language','en','English',config.language)+radio('language','ar','Arabic',config.language)+radio('language','both','Both',config.language)+'</div>'+(config.language!=='en'?checkbox('vowels','Arabic vowel marks',config.vowels):'')+'</div>';
 const advanced=(k==='notes'||k==='research')?'<details class="gn-copy-more"><summary>Adjust included material <span aria-hidden="true">⌄</span></summary><div class="gn-copy-extras">'+
  checkbox('editorial','Editorial, translation and grammar notes',config.editorial)+
  checkbox('sources','Qurʾān / ḥadīth references',config.sources)+
  checkbox('variants','Textual variants and manuscript notes',config.variants)+
  checkbox('quranContext','Full cited verses and surrounding Qurʾān context',config.quranContext)+
  checkbox('hadithContext','Full cited ḥadīth transmissions and translations',config.hadithContext)+
  checkbox('dictionary','Historical dictionary excerpts',config.dictionary)+
  checkbox('bidaya','Relevant Bidāya applications',config.bidaya)+
  (config.scope!=='section'?checkbox('sectionNotes','Also include section-wide notes (labelled)',config.sectionNotes):'')+
  '<div class="gn-copy-rule"></div>'+checkbox('personal','My personal Reading Desk notes (private)',config.personal)+
 '</div></details>':'';
 const citationChoice=isCite?'<div class="gn-copy-group"><div class="gn-copy-label">What are you citing?</div><div class="gn-copy-pills">'+radio('citationSource','original','Arabic original',config.citationSource)+radio('citationSource','translation','Gnamma translation',config.citationSource)+'</div></div>':'';
 const output=(isLink||isCite)?'':'<details class="gn-copy-more"><summary>Output options <span aria-hidden="true">⌄</span></summary><div class="gn-copy-extras">'+checkbox('appendCitation','Add scholarly citation',config.appendCitation)+checkbox('appendLink','Append one Gnamma passage link',config.appendLink)+checkbox('rich','Rich text (when supported)',config.rich)+'</div></details>';
 const q=k==='notes'?'Published notes and source references; personal notes excluded.':k==='research'?'Full available source contexts; private notes excluded.':isSelected?'The exact highlighted words; no automatic translation.':isLink?'Links preserve the recipient’s language and display settings.':'';
 sheet.querySelector('.gn-copy-sheet-title').textContent=modes[k];
 sheet.querySelector('.gn-copy-sheet-body').innerHTML='<div class="gn-copy-group"><div class="gn-copy-label">'+(isLink?'Link to':isCite?'Reference for':'What to copy')+'</div>'+scopeGroup+paragraph+'</div>'+languages+citationChoice+advanced+output+
 (q?'<p class="gn-copy-hint">'+escapeHTML(q)+'</p>':'')+
 '<div class="gn-copy-preview"><div class="gn-copy-label">'+(isLink?'Link preview':'Selection')+'</div><output id="gn-copy-preview">'+escapeHTML(isLink?buildLink():summary())+'</output></div>'+
 '<div class="gn-copy-error" role="status" id="gn-copy-status"></div>';
 const btn=sheet.querySelector('#gn-copy-submit');btn.textContent=isLink?'Copy link':isCite?'Copy citation':'Copy';btn.disabled=false;
 if(isLink&&config.scope==='selected'){btn.disabled=true;}
 if(config.scope==='range'&&config.end<config.start){btn.disabled=true;sheet.querySelector('#gn-copy-status').textContent='Ending paragraph must not precede starting paragraph.';}
 if(config.kind==='research'||config.quranContext||config.hadithContext)preloadSources();
}
function buildLink(){
 const section=config.section;
 return config.scope==='section'?urlFor(section):config.scope==='range'?urlFor(section,idFor(section,config.start),idFor(section,config.end)):
   urlFor(section,idFor(section,config.start));
}
function openSheet(kind,target=null){
 const openedFromMenu=!!(menu&&!menu.hidden);
 closeMenu();config=defaults(kind);
 // An open, unselected Copy menu follows the visible paragraph. Preserve the
 // separate one-tap quick Copy behaviour, which copies the whole section.
 if(openedFromMenu&&!selected&&!target&&kind!=='selected')config.scope='paragraph';
 if(target){targeted=target;config.section=target.section;config.start=target.index;config.end=target.index;config.scope=kind==='link'?'paragraph':config.scope;}
 sheet=document.createElement('div');sheet.className='gn-copy-backdrop';sheet.innerHTML='<div class="gn-copy-sheet" role="dialog" aria-modal="true" aria-label="Copy options"><div class="gn-copy-sheet-header"><strong class="gn-copy-sheet-title"></strong><button type="button" class="gn-copy-dismiss" aria-label="Close copy options" data-gn-copy-close>×</button></div><div class="gn-copy-sheet-body"></div><div class="gn-copy-sheet-footer"><button type="button" class="gn-copy-cancel" data-gn-copy-close>Cancel</button><button type="button" id="gn-copy-submit">Copy</button></div></div>';
 document.body.append(sheet);document.body.classList.add('gn-copy-sheet-open');
 sheet.addEventListener('click',e=>{if(e.target===sheet||e.target.closest('[data-gn-copy-close]')){closeSheet();return;}if(e.target.id==='gn-copy-submit')doCopy();});
 sheet.addEventListener('change',e=>{
   const el=e.target;if(!el.name)return;
   config[el.name]=el.type==='checkbox'?el.checked:el.type==='radio'?el.value:el.name==='start'||el.name==='end'?Number(el.value):el.value;
   if(el.name==='start'&&config.scope==='paragraph')config.end=config.start;
   if(['scope','language','start','end','citationSource'].includes(el.name)){
     const keep=el.name==='scope'&&el.value==='range';if(keep)config.end=Math.max(config.end,config.start);
     drawSheet();const focus=sheet.querySelector('[name="'+el.name+'"]'+(el.type==='radio'?'[value="'+el.value+'"]':''));focus?.focus({preventScroll:true});
   } else {
     sheet.querySelector('#gn-copy-preview').textContent=config.kind==='link'?buildLink():summary();
     if(config.kind==='notes'&&(el.name==='quranContext'||el.name==='hadithContext'))preloadSources();
   }
 });
 drawSheet();sheet.querySelector('.gn-copy-dismiss')?.focus({preventScroll:true});
}
function closeSheet(){if(!sheet)return;preloadToken++;sheet.remove();sheet=null;config=null;document.body.classList.remove('gn-copy-sheet-open');opener?.focus({preventScroll:true});}
function script(path){return new Promise((resolve,reject)=>{
 const src=new URL(path,document.baseURI).href;
 if([...document.scripts].some(s=>s.src.split('?')[0]===src)){resolve();return;}
 const node=document.createElement('script');node.async=true;node.src=path;
 node.onload=resolve;node.onerror=()=>reject(new Error(path+' unavailable'));document.head.append(node);
});}
const HADITH_FILES=['hadith-context-data.js','hadith-context-arabic-bukhari1.js','hadith-context-arabic-bukhari2.js','hadith-context-arabic-muslim.js','hadith-context-arabic-abudawud1.js','hadith-context-arabic-abudawud2.js','hadith-context-arabic-tirmidhi.js','hadith-context-arabic-sunan.js','hadith-context-metadata.js',
 'hadith-context-english-bukhari-a.js','hadith-context-english-bukhari-b.js','hadith-context-english-bukhari-long.js','hadith-context-english-abudawud-a.js','hadith-context-english-abudawud-b.js','hadith-context-english-tirmidhi-a.js','hadith-context-english-tirmidhi-b.js','hadith-context-english-tirmidhi-c.js','hadith-context-english-muslim.js','hadith-context-english-other.js'];
let loadCache=new Map();
const loadOnce=(path)=>{if(!loadCache.has(path))loadCache.set(path,script(path).catch(e=>{loadCache.delete(path);throw e}));return loadCache.get(path);};
async function preloadSources(){
 if(!sheet||!config)return;const token=++preloadToken;
 const q=config.quranContext,h=config.hadithContext;
 const resources=[...(q?['quran-context-data.js']:[]),...(h?HADITH_FILES:[])];
 if(!resources.length){preloadIssue=[];sourceReady=true;return;}
 const status=sheet.querySelector('#gn-copy-status'),btn=sheet.querySelector('#gn-copy-submit');
 btn.disabled=true;if(status)status.textContent='Preparing local scholarly sources…';
 const outcomes=await Promise.allSettled(resources.map(loadOnce));
 if(token!==preloadToken||!sheet)return;
 preloadIssue=outcomes.flatMap((x,i)=>x.status==='rejected'?[resources[i]]:[]);
 sourceReady=preloadIssue.length===0;btn.disabled=false;
 if(status)status.textContent=sourceReady?'Source contexts ready.':preloadIssue.length+' source file(s) unavailable. Copy will explicitly identify missing material.';
 if(!sourceReady)btn.textContent='Copy available material';
}
function includedNotes(){
 const s=C.sections.get(String(config.section));if(!s)return [];
 const sources=(s.noteIds||[]).map(id=>C.notes.get(id)).filter(Boolean);
 const apps=C.book.apps.filter(a=>String(a.n)===String(config.section));
 const appNotes=apps.flatMap(a=>window.DARURI_SOURCE_REFERENCES?.applications?.[a.id]||[]);
 const map=new Map([...sources,...appNotes].map(n=>[n.id,n]));
 const range=(config.scope==='section'||config.scope==='selected')?null:[config.start,config.scope==='range'?config.end:config.start];
 return [...map.values()].filter(note=>{
  if(!range)return true;
  const anchors=note.source_anchors||[];
  if(!anchors.length)return config.sectionNotes;
  return anchors.some(a=>Number(a.segment_index)>=range[0]&&Number(a.segment_index)<=range[1]);
 });
}
function selectedSegments(){const s=C.sections.get(String(config.section));if(!s)return [];
 return config.scope==='section'?s.segments.map((x,i)=>({x,i})):config.scope==='selected'?[]:
 s.segments.map((x,i)=>({x,i})).filter(({i})=>i>=config.start&&i<=(config.scope==='range'?config.end:config.start));}
function linesOfText(){
 if(config.scope==='selected')return selected?.text||'';
 const lines=["Ibn Rushd · al-Daruri",sectionLabel(config.section) + (config.scope!=='section'?' · '+(config.scope==='range'?'¶'+(config.start+1)+'–'+(config.end+1):'¶'+(config.start+1)):'')];
 for(const {x} of selectedSegments()){
  if(config.language==='ar'||config.language==='both')lines.push(config.vowels?(x.vocalized||x.ar):x.ar);
  if(config.language==='en'||config.language==='both')lines.push(x.en||'');
  lines.push('');
 }
 return lines.join('\n\n').trim();
}
function citation(){
 const s=C.sections.get(config.section);if(!s)return '';
 const pages=s.pages||[];const page=pages.length?(pages.length>1?pages[0]+'–'+pages[pages.length-1]:pages[0]):null;
 const locator=sectionLabel(config.section)+(config.scope!=='section'?', para. '+(config.start+1)+(config.scope==='range'?'–'+(config.end+1):'')+' (Gnamma paragraph division)':'');
 const original='Ibn Rushd, al-Daruri fi Usul al-Fiqh aw Mukhtasar al-Mustasfa, ed. Jamal al-Din al-ʿAlawi (Beirut: Dar al-Gharb al-Islami, 1994)'+(page?', '+page:'')+'; '+locator;
 return config.citationSource==='original'?original+'.':original+'; English translation in the Gnamma bilingual reading edition (2026), '+buildLink()+'.';
}
function groupedNotes(){
 const notes=includedNotes(),text=[];
 for(const note of notes){
  const type=note.source_type||note.kind||'',source=type==='quran'||type==='quran-source'||type==='hadith'||type==='hadith-source';
  const variant=/textual|manuscript|variant|collation/i.test(type);
  const keep=(source&&config.sources)||(variant&&config.variants)||(!source&&!variant&&config.editorial)||type==='application'&&config.bidaya;
  if(type==='application'&&!config.bidaya)continue;
  if(!keep)continue;
  const scoped=(config.scope!=='section'&&!(note.source_anchors||[]).length)?' [Section-level context]':'';
  const ref=Array.isArray(note.references)?note.references.map(r=>r.label_en||r.label||'').filter(Boolean).join('; '):'';
  text.push('['+note.id+'] '+(source?(note.source_type==='quran'?'Qurʾān': 'Hadith source'):'Editorial note')+scoped+(ref?' — '+ref:'')+'\n'+(note.text||''));
 }
 return text;
}
function contextLines(){const out=[],notes=includedNotes();
 if(config.quranContext){
  const q=window.GnammaQuranContextData;
  if(!q?.notes||!q?.verses)out.push('[Qurʾānic context unavailable]');
  else {
   for(const note of notes.filter(x=>x.source_type==='quran')){
    for(const ref of q.notes[note.id]||[]){
     out.push('Qurʾān context: '+ref.label+' — cited verses and adjacent context (editorial)');
     for(const key of ref.verses||[]){const verse=q.verses[key];if(!verse){out.push('[Verse '+key+' unavailable]');continue;}
       out.push(key+' · '+verse.ar+'\n'+verse.en);
     }
     out.push('Arabic text: Tanzil Project (CC BY 3.0), verbatim; English rendering: M. M. Pickthall (1930). Source: tanzil.net.');
    }
   }
  }
 }
 if(config.hadithContext){
  const d=window.GnammaHadithContextData,reports=window.GnammaHadithReports||{},translations=window.GnammaHadithEnglishFull||{};
  if(!d?.notes)out.push('[Ḥadīth context unavailable]');
  else for(const note of notes.filter(x=>x.source_type==='hadith')){
   const h=d.notes[note.id];if(!h){out.push('[Source context not available for '+note.id+']');continue;}
   out.push('Ḥadīth context — '+note.id+(h.unresolved?' [attribution remains unresolved]':''));
   if(h.note)out.push(h.note);
   for(const key of h.refs||[]){
    const r=reports[key];out.push('Primary report: '+key+(r?.book?' · '+r.book:''));
    out.push(r?.arabic||'[Arabic transmission unavailable locally]');
    out.push(translations[key]||'[Full editorial English translation unavailable locally]');
   }
  }
 }
 if(preloadIssue.length)out.push('UNAVAILABLE SOURCES: '+preloadIssue.join(', '));
 return out;
}
function additionalLines(){let a=[];
 if(config.editorial||config.sources||config.variants)a=a.concat(groupedNotes());
 if(config.bidaya){
  const apps=C.book.apps.filter(x=>String(x.n)===String(config.section));
  for(const x of apps)a.push('Bidāya application — '+x.title+'\n'+x.book+' · '+x.locator+'\n'+x.text);
 }
 if(config.dictionary){
  for(const g of C.book.glossary.filter(x=>(x.sections||[]).map(String).includes(config.section)))a.push('Dictionary — '+g.term+' · '+g.ar+'\n'+g.definition);
 }
 a=a.concat(contextLines());
 if(config.personal){
  const personal=C.rd?.records?.()||[];
  for(const row of personal){
   if(row.deleted||!row.body?.trim()||String(row.target?.section)!==String(config.section))continue;
   if(config.scope!=='section'&&row.target?.segment!=null&& (Number(row.target.segment)<config.start||Number(row.target.segment)>(config.scope==='range'?config.end:config.start)))continue;
   a.push('My personal note'+(row.title?' — '+row.title:'')+'\n'+row.body+'\n'+(row.updated?new Date(row.updated).toISOString():''));
  }
 }
 return a;
}
function generateText(){
 if(config.kind==='link')return buildLink();if(config.kind==='citation')return citation();
 let result=linesOfText();
 if(['notes','research'].includes(config.kind)){
  const notes=additionalLines();if(notes.length)result+='\n\nSCHOLARLY APPARATUS\n\n'+notes.join('\n\n');
 }
 if(config.appendCitation)result+='\n\n'+citation();
 if(config.appendLink)result+='\n\n'+buildLink();
 return result;
}
function asHTML(plain){const pieces=String(plain).split(/\n\n+/).map(p=>{
 const ar=/[\u0600-\u06FF]/.test(p)&&!/[A-Za-z]/.test(p);return '<p'+(ar?' lang="ar" dir="rtl"':'')+'>'+escapeHTML(p).replace(/\n/g,'<br>')+'</p>';
 });return '<div class="gn-scholar-copy">'+pieces.join('')+'</div>';}
async function writeClipboard(plain,rich){
 try{
  if(rich&&navigator.clipboard?.write&&window.ClipboardItem){
   const item=new ClipboardItem({'text/plain':new Blob([plain],{type:'text/plain'}),'text/html':new Blob([asHTML(plain)],{type:'text/html'})});
   await navigator.clipboard.write([item]);return true;
  }
  if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(plain);return true;}
 }catch(_){/* Try the legacy clipboard route below. */}
 const box=document.createElement('textarea');box.value=plain;box.style.cssText='position:fixed;top:0;left:-10000px';document.body.append(box);box.focus();box.select();
 const ok=document.execCommand('copy');box.remove();if(!ok)throw new Error('Clipboard unavailable');return true;
}
async function doCopy(){
 if(!config||!sheet)return;
 const c={...config},text=generateText();if(!text.trim()){message('Nothing to copy');return;}
 const button=sheet.querySelector('#gn-copy-submit');button.disabled=true;
 try{await writeClipboard(text,c.rich);closeSheet();message(c.kind==='link'?'Paragraph or section link copied':c.kind==='citation'?'Scholarly citation copied':'Copied to clipboard');}
 catch(e){button.disabled=false;sheet.querySelector('#gn-copy-status').textContent='Clipboard unavailable. Select and copy the preview manually.';
  let previewNode=sheet.querySelector('#gn-copy-preview');if(previewNode){const textarea=document.createElement('textarea');textarea.value=text;textarea.rows=6;previewNode.replaceWith(textarea);textarea.focus();textarea.select();}}
}
async function quickCopy(){
 const snap=selectionSnapshot()||pendingSelection||selected,section=snap?.section||String(C.state.n);
 config=defaults(snap?'selected':'text');config.section=section;
 if(snap){config.scope='selected';selected=snap;}else config.scope='section';pendingSelection=null;
 const text=generateText();config=null;
 try{await writeClipboard(text,false);message(snap?'Selected text copied':'Section copied');}
 catch(_){message('Clipboard unavailable; use Copy options');}
}
/* Capture before legacy document delegation, to preserve selection and avoid twice copying. */
document.addEventListener('click',e=>{
 const target=e.target.closest?.('#readerCopyAction');if(!target)return;
 e.preventDefault();e.stopImmediatePropagation();quickCopy();
},true);
document.addEventListener('click',e=>{
 const par=e.target.closest?.('[data-gn-par-link]');if(par){e.preventDefault();e.stopImmediatePropagation();
  const p={section:par.dataset.gnParSection,index:locate(par.dataset.gnParSection,par.dataset.gnParLink),id:par.dataset.gnParLink};
  targeted=p;selected=null;openSheet('link',p);return;}
 const choice=e.target.closest?.('[data-gn-menu]');if(choice){e.preventDefault();const kind=choice.dataset.gnMenu;openSheet(kind);return;}
 if(menu&&!menu.hidden&&!e.target.closest('#readerCopyOptions,#gn-copy-menu'))closeMenu();
},true);
document.addEventListener('keydown',e=>{
 if(sheet){if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeSheet();return;}
  if(e.key==='Tab'){
   const controls=[...sheet.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),summary,[tabindex="0"]')].filter(x=>x.getClientRects().length);
   if(controls.length&&(e.shiftKey&&document.activeElement===controls[0]||!e.shiftKey&&document.activeElement===controls.at(-1))){e.preventDefault();(e.shiftKey?controls.at(-1):controls[0]).focus();}
  }return;}
 if(menu&&!menu.hidden){if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeMenu(true);}else if(e.key==='ArrowDown'||e.key==='ArrowUp'){
  e.preventDefault();const items=[...menu.querySelectorAll('button:not([hidden])')],at=items.indexOf(document.activeElement);items[(at+(e.key==='ArrowDown'?1:-1)+items.length)%items.length]?.focus();}}
},true);
const setup=()=>{mountCopyButton();annotate();const dest=parseHash();if(dest?.id)requestAnimationFrame(()=>requestAnimationFrame(requestJump));};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
window.GnammaCopyLinks={revision:REV,idFor,locate,urlFor,parseHash,annotate};
})();