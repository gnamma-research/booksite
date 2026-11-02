/* Tahdhīb editorial reader experience
 * Flow/immersive modes are presentation-only. They do not change source Arabic,
 * insert synthetic ellipses, or merge source/editor/commentary witnesses.
 */
(function(){'use strict';
const corpus=window.GNAMMA_CRITICAL_CORPUS;
const api=window.GnammaTahdhibReader;
if(!corpus||!api||!Array.isArray(corpus.units))return;
const vowels=window.GNAMMA_TAHDHIB_DIACRITICS;
const machine=window.GNAMMA_TAHDHIB_MACHINE_VOWELS;
const machineAvailable=!!(vowels?.strip&&machine?.schema==='gnamma-tahdhib-unverified-machine-vowels-v1'&&
 machine.work===corpus.work&&machine.unit_count===corpus.units.length&&
 corpus.units.every(u=>typeof machine.units?.[u.id]==='string'&&vowels.strip(machine.units[u.id])===vowels.strip(u.ar)));

const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const isLogic=api.isDivision;
const idFor=u=>'u-'+u.id.replace(/[^a-zA-Z0-9-]/g,'-');
const keys=new Set(corpus.units.map(u=>u.id));
const key='gnamma-tahdhib-experience-v1-'+(isLogic?'logic':'kalam');
const notesKey='gnamma-tahdhib-private-notes-v1-'+(isLogic?'logic':'kalam');
function read(key){try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}}
const old=read(key);
const prefs={
 mode:['study','flow','immersive'].includes(old.mode)?old.mode:'flow',
 vocalization:old.vocalization==='machine'&&machineAvailable?'machine':old.vocalization==='assisted'?'assisted':'original',
 arFont:['amiri','scheherazade','noto'].includes(old.arFont)?old.arFont:'amiri',
 enFont:['literary','sans','accessible'].includes(old.enFont)?old.enFont:'literary',
 pageRefs:old.pageRefs!==false
};
let notes=read(notesKey);if(!notes||typeof notes!=='object'||Array.isArray(notes))notes={};
const savePrefs=()=>{try{localStorage.setItem(key,JSON.stringify(prefs))}catch{}};
function saveNotes(){try{localStorage.setItem(notesKey,JSON.stringify(notes));return true}catch{return false}}
const el=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=String(text);return x};
function control(label,tag='button'){const b=el(tag);b.title=label;b.setAttribute('aria-label',label);return b}
function makeSelect(label,id,opts,current){
 const lab=el('label','gn-pref-label');lab.append(el('span',null,label));
 const select=el('select');select.id=id;select.setAttribute('aria-label',label);
 for(const [value,name] of opts){const op=el('option',null,name);op.value=value;select.append(op)}
 select.value=current;lab.append(select);return lab;
}
function createTools(){
 const toolbar=$('.toolbar');if(!toolbar)return;
 const box=el('div','gn-experience-controls');box.id='gn-experience-controls';
 const group=el('div','gn-reader-choice segments');group.setAttribute('role','group');group.setAttribute('aria-label','Reading presentation');
 for(const [id,name] of [['study','Study'],['flow','Flow'],['immersive','Immersive']]){
  const b=control(name+' reading');b.type='button';b.dataset.readerMode=id;b.textContent=name;
  b.addEventListener('click',()=>setMode(id));group.append(b)
 }
 box.append(group);
 const voc=el('div','gn-vowel-choice segments');voc.setAttribute('role','group');voc.setAttribute('aria-label','Arabic vocalization');
 for(const [id,name] of [['original','Arabic original'],['assisted','Arabic · vowels†'],['machine',machineAvailable?'Machine vowels‡':'Machine draft unavailable']]){
  const b=control(name);b.type='button';b.dataset.vowelMode=id;b.textContent=name;
  if(id==='machine'&&!machineAvailable){b.disabled=true;b.title='Not yet published. The original and partial-aid options are usable.'}
  b.addEventListener('click',()=>{prefs.vocalization=id;savePrefs();apply();refreshArabic()});voc.append(b)
 }
 box.append(voc);
 const options=el('details','gn-type-options');const summary=el('summary',null,'Fonts & options');
 const panel=el('div','gn-type-panel');panel.append(
 makeSelect('Arabic script','gn-ar-font',[['amiri','Amiri'],['scheherazade','Scheherazade'],['noto','Noto Naskh']],prefs.arFont),
 makeSelect('English type','gn-en-font',[['literary','Literary serif'],['sans','Readable sans'],['accessible','Lexend']],prefs.enFont)
 );
 const ref=el('label','gn-reference-choice');const refCheck=el('input');refCheck.type='checkbox';refCheck.id='gn-page-references';refCheck.checked=prefs.pageRefs;ref.append(refCheck,document.createTextNode(' Show discreet source-page locators'));panel.append(ref);
 const vocInfo=el('p','gn-vowels-disclaimer','† Assisted vowel marks are partial and manually sampled. ‡ Machine vowels, if published, are automatic and UNREVIEWED: possible grammar/case-ending errors. Neither is a critical manuscript reading.');
 panel.append(vocInfo);options.append(summary,panel);box.append(options);
 box.querySelector('#gn-ar-font')?.addEventListener('change',e=>{prefs.arFont=e.target.value;savePrefs();apply()});
 box.querySelector('#gn-en-font')?.addEventListener('change',e=>{prefs.enFont=e.target.value;savePrefs();apply()});
 refCheck.addEventListener('change',()=>{prefs.pageRefs=refCheck.checked;savePrefs();apply()});
 const noteButton=control('My reading notes');noteButton.id='gn-notebook-button';noteButton.className='toolbar-icon';noteButton.textContent='Notes';noteButton.addEventListener('click',()=>showNotebook());box.append(noteButton);
 toolbar.append(box);
 const original=$('#passages'),flow=el('div','gn-flow-reading');flow.id='flow-passages';flow.hidden=true;original.insertAdjacentElement('afterend',flow);
 const notice=el('p','gn-vowelling-status');notice.id='gn-vowelling-status';notice.setAttribute('role','status');flow.before(notice);
 const popup=el('div','gn-inline-toolbar');popup.id='gn-inline-toolbar';popup.hidden=true;popup.setAttribute('role','group');popup.setAttribute('aria-label','Selected clause actions');document.body.append(popup);
 const dialog=el('div','gn-notes-overlay');dialog.id='gn-notes-overlay';dialog.hidden=true;dialog.setAttribute('role','presentation');dialog.addEventListener('click',e=>{if(e.target===dialog)closeNotebook()});document.body.append(dialog);
}
function apply(){
 document.body.dataset.readingStyle=prefs.mode;
 document.documentElement.dataset.arabicFont=prefs.arFont;
 document.documentElement.dataset.englishFont=prefs.enFont;
 document.body.dataset.vocalization=prefs.vocalization;
 document.body.dataset.pageRefs=prefs.pageRefs?'on':'off';
 const source=$('#passages'),flow=$('#flow-passages');
 source.hidden=prefs.mode!=='study';flow.hidden=prefs.mode==='study';
 if(prefs.mode==='immersive'){document.body.dataset.focus='3';}
 else if(document.body.dataset.focus==='3'){document.body.dataset.focus='0';}
 $$('[data-reader-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.readerMode===prefs.mode)));
 $$('[data-vowel-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.vowelMode===prefs.vocalization)));
 const n=$('#gn-vowelling-status');
 if(n){
  n.hidden=prefs.vocalization==='original'||prefs.mode==='study';
  n.textContent=prefs.vocalization==='assisted'?'Assisted PARTIAL vowels · original Arabic letters preserved · not a verified vocalized edition':prefs.vocalization==='machine'?'Machine-generated vowelled candidate · UNREVIEWED grammatical endings · original Arabic letters preserved':'';
 }
 flow.dataset.view=api.getState().view;
}
function setMode(mode){
 prefs.mode=mode;savePrefs();hidePopup();
 // Flow deliberately follows the whole text without forcing page-sized cards.
 if(mode!=='study'&&api.getState().scope!=='continuous')$('[data-scope="continuous"]')?.click();
 apply();if(mode!=='study')buildFlow();
}
function isOriginalHeading(u){
 const s=String(u.ar||'').trim();
 return s.length<=100&&/^(?:الباب|الفصل|فصل|المقصد|مقصد)(?:\s|[.:،])/u.test(s);
}
function arabic(u){
 if(prefs.vocalization==='machine'&&machineAvailable){const proposed=machine.units?.[u.id];if(typeof proposed==='string'&&vowels.strip(proposed)===vowels.strip(u.ar))return proposed;}
 if(prefs.vocalization==='assisted'&&vowels?.get)return vowels.get(u).text;
 return u.ar||'';
}
function headingPair(u,section,type){
 const en=el('h3','gn-source-heading-en',u.en||'');
 const ar=el('h3','gn-source-heading-ar',arabic(u));ar.lang='ar';ar.dir='rtl';
 en.id='flow-'+idFor(u);ar.id=en.id+'-ar';
 en.dataset.clauseId=u.id;ar.dataset.clauseId=u.id;
 const wrap=el('div','gn-source-heading');
 wrap.append(en,ar);section.append(wrap);
 if(type==='editorial'){const tag=el('div','gn-editorial-marker','EDITORIAL DIVISION · '+u.id);wrap.prepend(tag)}
}
function makeRun(){
 const s=el('section','gn-flow-section'),columns=el('div','gn-flow-columns');
 const english=el('div','gn-flow-en'),arabic=el('div','gn-flow-ar');english.lang='en';arabic.lang='ar';arabic.dir='rtl';
 columns.append(english,arabic);s.append(columns);
 function addParagraph(){const ep=el('p','gn-flow-p'),ap=el('p','gn-flow-p');english.append(ep);arabic.append(ap);return {en:ep,ar:ap}}
 const para=addParagraph();
 return {section:s,english,arabic,para,addParagraph,count:0};
}
function newParagraph(run){run.para=run.addParagraph();run.count=0}
function pageMark(page,side,first){
 const tag=el('a','flow-page-ref',isLogic?'§'+page:'p. '+page);
 tag.id='flow-page-'+page+(side==='ar'?'-ar':'');
 tag.href='#page='+page;tag.dataset.page=page;tag.dataset.flowSide=side;
 tag.title=(isLogic?'Editorial division ':'Cairo printed page ')+page;
 tag.setAttribute('aria-label',tag.title);tag.dataset.pageRef=page;
 if(first)tag.classList.add('first-location');
 return tag;
}
function makeUnit(u,side){
 const span=el('span','gn-flow-unit',side==='ar'?arabic(u):(u.en||''));span.dataset.clauseId=u.id;span.dataset.page=u.page;
 span.lang=side==='ar'?'ar':'en';span.id='flow-'+idFor(u)+(side==='ar'?'-ar':'');
 span.title=u.id+' · click for citation, bookmark, and notes';
 if(api.getBookmarked().includes(u.id))span.classList.add('gn-is-bookmarked');
 if(notes[u.id]?.body)span.classList.add('gn-has-note');
 if(notes[u.id]?.highlight)span.classList.add('gn-is-highlighted');
 return span;
}

/* Printed-page seams: the legacy transcription uses paired "..." continuations.
   Suppress only those explicit editorial continuation marks in Flow/Immersive.
   The canonical study Arabic and English remain unchanged and fully inspectable. */
function joinEditorialContinuation(previous,previousNodes,current,currentNodes){
 if(!previous||!previousNodes||previous.page===current.page)return;
 const ends=s=>/(?:\.{3}|…)\s*$/u.test(String(s||''));
 const starts=s=>/^\s*(?:\.{3}|…)/u.test(String(s||''));
 if(!ends(previous.ar)||!starts(current.ar))return;
 for(const side of ['ar','en']){
  const before=side==='ar'?previous.ar:previous.en;
  const after=side==='ar'?current.ar:current.en;
  const priorSpan=previousNodes[side],nextSpan=currentNodes[side];
  if(!priorSpan||!nextSpan)continue;
  if(ends(before))priorSpan.textContent=priorSpan.textContent.replace(/\s*(?:\.{3}|…)\s*$/u,'');
  if(starts(after))nextSpan.textContent=nextSpan.textContent.replace(/^\s*(?:\.{3}|…)\s*/u,'');
  nextSpan.dataset.editorialPageSeam='joined';
  nextSpan.title=current.id+' · editorial page-continuation marks omitted in the Flow presentation; inspect Study for complete source transcription';
 }
}

function buildFlow(){
 if(prefs.mode==='study')return;
 const root=$('#flow-passages');const frag=document.createDocumentFragment();
 const view=api.getState(),selected=view.scope==='continuous'?corpus.units:corpus.units.filter(u=>u.page===view.page);
 let run=null,lastPage=null,lastUnit=null,lastRendered=null;
 function fresh(){run=makeRun();frag.append(run.section);lastUnit=null;lastRendered=null}
 for(const u of selected){
  const originalHeading=isOriginalHeading(u);
  const editorialHeading=isLogic&&!!u.title;
  if(!run || originalHeading || editorialHeading){fresh()}
  if(originalHeading){headingPair(u,run.section,'source');if(lastPage!==u.page){run.para.en.append(pageMark(u.page,'en',lastPage===null));run.para.ar.append(pageMark(u.page,'ar',lastPage===null))}lastPage=u.page;run.count=0;continue}
  if(editorialHeading){const tag=el('h3','gn-editorial-title',u.title);tag.dataset.headingOrigin='editorial';run.section.prepend(tag)}
  if(lastPage!==u.page){
   run.para.en.append(pageMark(u.page,'en',lastPage===null));
   run.para.ar.append(pageMark(u.page,'ar',lastPage===null));
   lastPage=u.page;
  }
  // The gaps are typographic word spaces, never synthetic author's punctuation.
  if(run.para.en.childNodes.length)run.para.en.append(document.createTextNode(' '));
  if(run.para.ar.childNodes.length)run.para.ar.append(document.createTextNode(' '));
  const nextUnits={en:makeUnit(u,'en'),ar:makeUnit(u,'ar')};
  joinEditorialContinuation(lastUnit,lastRendered,u,nextUnits);
  run.para.en.append(nextUnits.en);run.para.ar.append(nextUnits.ar);
  lastUnit=u;lastRendered=nextUnits;
  run.count++;
  const atSentenceEnd=/[.!?؟؛۔…]$/u.test(String(u.ar||'').trim());
  if(run.count>=14 && atSentenceEnd)newParagraph(run);
  // The type rhythm follows original punctuation, not synthetic ellipses.
 }
 root.replaceChildren(frag);root.dataset.view=view.view;
}
function refreshArabic(){
 // Reconstruct only if needed; source unit IDs and all nonvocalized text remain stable.
 if(prefs.mode!=='study')buildFlow();
 else $$('article.clause').forEach(a=>{
  const u=corpus.units.find(z=>idFor(z)===a.id);
  if(u){const p=a.querySelector('.arabic p');if(p)p.textContent=arabic(u)}
 });
}
function selectedUnit(target){
 const span=target.closest?.('[data-clause-id]');
 if(!span||!$('#flow-passages')?.contains(span))return null;
 return corpus.units.find(u=>u.id===span.dataset.clauseId)||null;
}
function hidePopup(){const popup=$('#gn-inline-toolbar');if(popup)popup.hidden=true}
function popupAt(u,node){
 const box=$('#gn-inline-toolbar');if(!box)return;
 box.replaceChildren();
 const name=el('span','gn-selected-ref',u.id);
 const bookmark=control('Bookmark '+u.id);bookmark.textContent=api.getBookmarked().includes(u.id)?'★ Saved':'☆ Bookmark';
 bookmark.addEventListener('click',()=>{api.bookmark(u.id);hidePopup();buildFlow()});
 const highlight=control('Highlight this clause');highlight.textContent=notes[u.id]?.highlight?'◈ Highlighted':'◇ Highlight';
 highlight.addEventListener('click',()=>{const old=notes[u.id]||{},next={...old,highlight:!old.highlight};
  if(!next.highlight&&!next.body)delete notes[u.id];else notes[u.id]=next;
  if(!saveNotes()){window.alert('Browser storage unavailable; highlight not saved.');return}
  hidePopup();buildFlow();
 });
 const citation=control('Copy citation');citation.textContent='Copy reference';
 citation.addEventListener('click',async()=>{const c='al-Taftāzānī, '+corpus.work+', '+(isLogic?'editorial division ':'Cairo 1912 p. ')+u.page+', '+u.id+' (Gnamma working edition)';try{await navigator.clipboard.writeText(c);citation.textContent='Copied'}catch{window.prompt('Copy citation',c)}});
 const notesButton=control('Read or write notes');notesButton.textContent='Notes & variants';
 notesButton.addEventListener('click',()=>{hidePopup();showNotebook(u)});
 const close=control('Close selected clause actions');close.textContent='×';close.addEventListener('click',hidePopup);
 box.append(name,bookmark,highlight,citation,notesButton,close);
 const r=node.getBoundingClientRect();
 box.hidden=false;
 const w=Math.min(390,window.innerWidth-20),left=Math.max(10,Math.min(r.left,window.innerWidth-w-10));
 box.style.left=left+'px';box.style.top=Math.min(window.innerHeight-box.offsetHeight-12,Math.max(10,r.bottom+8))+'px';
}
let lastNotebookFocus=null;
function closeNotebook(){const x=$('#gn-notes-overlay');x.hidden=true;lastNotebookFocus?.focus?.();lastNotebookFocus=null}
function showNotebook(u=null){
 hidePopup();const overlay=$('#gn-notes-overlay');lastNotebookFocus=document.activeElement;
 overlay.replaceChildren();
 const sheet=el('section','gn-notes-sheet');sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');
 sheet.setAttribute('aria-label','Tahdhīb reading desk notes');
 const bar=el('div','gn-notes-bar'),h=el('h2',null,u?'Notes · '+u.id:'My reading notes'),close=control('Close notes');
 close.textContent='×';close.addEventListener('click',closeNotebook);bar.append(h,close);sheet.append(bar);
 if(u){
  const metadata=el('p','gn-notes-meta',(isLogic?'Editorial division ':'Cairo printed page ')+u.page+' · '+u.id);
  sheet.append(metadata);
  const source=el('blockquote','gn-note-source',u.ar);source.dir='rtl';source.lang='ar';sheet.append(source);
  const editor=el('div','gn-note-editor'),label=el('label',null,'My private note'),area=el('textarea');
  area.rows=6;area.id='gn-note-text';area.value=String(notes[u.id]?.body||'');label.htmlFor=area.id;
  const save=control('Save my note');save.textContent='Save note';
  save.addEventListener('click',()=>{
   const val=area.value.slice(0,15000);
   if(val)notes[u.id]={...(notes[u.id]||{}),body:val,updated:new Date().toISOString()};
   else if(notes[u.id]?.highlight)notes[u.id]={highlight:true};
   else delete notes[u.id];
   if(!saveNotes()){window.alert('Browser storage is unavailable; copy your note before leaving.');return}
   closeNotebook();buildFlow();
  });
  editor.append(label,area,save);sheet.append(editor);
  if(u.editorial_note||u.notes?.length){
   const details=el('details','gn-critical-notes'),summary=el('summary',null,'Critical and explanatory apparatus');
   details.append(summary);
   if(u.editorial_note)details.append(el('p',null,u.editorial_note));
   for(const note of u.notes||[]){const p=el('p');p.append(el('strong',null,(note.type||'Note')+': '),document.createTextNode(note.text||''));details.append(p)}
   sheet.append(details);
  }
  for(const issue of (corpus.open_issues||[]).filter(i=>i.ids?.includes(u.id))){
   const d=el('p','gn-source-caution','Unresolved source issue: '+issue.issue);sheet.append(d)
  }
 }else{
  const list=el('div','gn-notes-list');
  const items=Object.entries(notes).filter(([id,n])=>keys.has(id)&&n&&(n.body||n.highlight));
  if(!items.length)list.append(el('p',null,'Your private notes will appear here. Select a clause in Flow view to add a note.'));
  for(const [id,n] of items){const b=control('Open note '+id);b.textContent=id+' · '+(n.body||'Highlighted clause').slice(0,95);b.addEventListener('click',()=>showNotebook(corpus.units.find(u=>u.id===id)));list.append(b)}
  sheet.append(list)
 }
 const actions=el('div','gn-note-backups');const exportBtn=control('Export my notes');exportBtn.textContent='Export notes';
 exportBtn.addEventListener('click',()=>{
  const data=JSON.stringify({format:'gnamma-tahdhib-private-notes-v1',work:corpus.work,notes},null,2);
  const blob=new Blob([data],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='tahdhib-'+(isLogic?'logic':'kalam')+'-personal-notes.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)
 });
 const importLabel=el('label','gn-import-notes','Import notes');
 const input=el('input');input.type='file';input.accept='.json,application/json';input.setAttribute('aria-label','Import personal notes JSON');
 input.addEventListener('change',async()=>{
  const f=input.files?.[0];if(!f||f.size>2_000_000)return;
  try{
   const data=JSON.parse(await f.text());
   if(data.format!=='gnamma-tahdhib-private-notes-v1'||data.work!==corpus.work||typeof data.notes!=='object'||!data.notes)throw Error('Wrong notes format or book');
   const next={...notes};
   for(const [id,n] of Object.entries(data.notes)){
    if(keys.has(id)&&n&&typeof n==='object'&&(typeof n.body==='string'||n.highlight===true)&&String(n.body||'').length<=15000)next[id]={body:String(n.body||''),highlight:n.highlight===true,updated:String(n.updated||'')};
   }
   notes=next;if(!saveNotes())throw Error('Unable to save notes');
   showNotebook(u);
  }catch(error){window.alert('Notes could not be imported: '+error.message)}
 });importLabel.append(input);actions.append(exportBtn,importLabel);sheet.append(actions);
 overlay.append(sheet);overlay.hidden=false;close.focus();
}
document.addEventListener('click',e=>{
 const u=selectedUnit(e.target);
 if(u&&prefs.mode!=='study'){
  const text=window.getSelection?.()?.toString();
  if(text&&text.trim())return;
  popupAt(u,e.target.closest('[data-clause-id]'));return;
 }
 if(!e.target.closest?.('#gn-inline-toolbar'))hidePopup();
});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){hidePopup();if(!$('#gn-notes-overlay').hidden)closeNotebook()}
});
window.addEventListener('scroll',hidePopup,{passive:true});
document.addEventListener('gnamma-tahdhib-render',()=>{if(prefs.mode!=='study')buildFlow();apply();if(prefs.vocalization==='assisted'&&prefs.mode==='study')refreshArabic()});
document.addEventListener('gnamma-tahdhib-view',()=>apply());
document.addEventListener('gnamma-tahdhib-bookmarks',()=>{if(prefs.mode!=='study')buildFlow()});
createTools();
const note=$('.source-note');if(note){
 note.textContent=isLogic?
 'Edition status: 19 editorial divisions, Cairo 1912 pp. 3–14; ten comparisons between different PRINTED texts. Historical modal validity and independent manuscript collation are not certified.':
 'Edition status: all 1,044 bilingual clauses cover Cairo printed pp. 15–127; 112 of 113 pages directly checked against this one print. Printed p. 77 and independent manuscript collation remain unresolved.';
}
apply();
if(prefs.mode!=='study'){
 if(api.getState().scope!=='continuous')$('[data-scope="continuous"]')?.click();
 else buildFlow();
}
window.GnammaTahdhibExperience={getPrefs:()=>({...prefs,machineAvailable}),setMode,flow:buildFlow,closeNotebook,assisted:u=>arabic(u),getNotes:()=>({...notes})};
})();