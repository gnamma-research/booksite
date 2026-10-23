/* Repair N-note section pointers before the reader parses editionData. */
(function(){
'use strict';
const el=document.getElementById('editionData');
if(!el?.textContent)return;
try{
  const edition=JSON.parse(el.textContent),locations=Object.create(null),
        bySection=Object.create(null);
  for(const section of edition.sections||[]){
    const sectionId=String(section.id);
    const ids=(section.noteIds||[]).filter(id=>/^N\d{3}$/.test(id));
    if(!ids.length)continue;
    bySection[sectionId]=ids;
    for(const id of ids)locations[id]=sectionId;
  }
  let corrected=0;
  for(const note of edition.notes||[]){
    const sectionId=locations[note.id];
    if(!sectionId)continue;
    const exact=sectionId==='colophon'?sectionId:Number(sectionId);
    if(String(note.n)!==sectionId){note.n=exact;corrected++;}
  }
  window.GnammaNNoteLocations={bySection,locations,corrected};
  if(corrected)el.textContent=JSON.stringify(edition);
}catch(error){console.warn('N-note section normalization skipped',error);}
})();

/* Daruri reader: compact private annotations in the existing persistent dock.
 * Counts are derived from Reading Desk records; this never writes personal data. */
(function(){
'use strict';
// Quran.com-inspired icon grammar, independently redrawn to use Daruri's
// currentColor: bookmark with confirmation, a bookmark-plus-¶ pair, and
// a note containing a pen. Saved indicators are never destructive actions.
const bookmarkUI=window.GnammaBookmarkUI;
if(!bookmarkUI)throw Error('Bookmark controls must load before the reading dock');
const icons={
 section:bookmarkUI.icon({saved:true}),
 paragraph:bookmarkUI.icon({kind:'paragraph',saved:true}),
 highlight:bookmarkUI.highlightIcon(),
 note:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3.6" y="3.5" width="16" height="17" rx="2"/><path d="M7 8h7M7 11h4"/><path d="m11.6 16.9 5.3-5.3 2 2-5.3 5.3-2.8.8zM15.9 12.6l2 2"/></svg>'
};
function create({state,rd}){
 const dock=document.getElementById('readerDock');
 const jump=document.getElementById('openJump');
 if(!dock||!jump||!rd)return null;
 let center=dock.querySelector('.gn-dock-center');
 if(!center){
  center=document.createElement('div');center.className='gn-dock-center';
  dock.insertBefore(center,jump);center.appendChild(jump);
 }
 let status=center.querySelector('#gn-dock-private-status');
 if(!status){
  status=document.createElement('div');status.id='gn-dock-private-status';
  status.className='gn-dock-private-status';status.setAttribute('role','group');
  status.setAttribute('aria-label','Your personal saved items in this reading section');
  status.hidden=true;center.append(status);
 }
 const meta=jump.querySelector('.reader-location-meta');
 let paraRef=meta?.querySelector('#gn-dock-paragraph-ref');
 if(meta&&!paraRef){
  paraRef=document.createElement('span');paraRef.id='gn-dock-paragraph-ref';
  paraRef.className='gn-dock-paragraph-ref';paraRef.hidden=true;meta.append(paraRef);
 }
 // A single record can be linked to several reading sections, but is only
 // counted once per section. Kinds stay derived from stored source metadata.
 const categories=[
  {id:'section',label:'Saved section bookmarks',symbol:'§'},
  {id:'paragraph',label:'Saved paragraph bookmarks',symbol:'¶'},
  {id:'dictionary',label:'Dictionary entries',symbol:'D'},
  {id:'quran',label:'Qurʾān references',symbol:'Q'},
  {id:'hadith',label:'Ḥadīth references',symbol:'H'},
  {id:'source',label:'Other scholarly references',symbol:'S'},
  {id:'highlight',label:'Highlights',symbol:icons.highlight},
  {id:'note',label:'Personal notes',symbol:icons.note}
 ];
 const categoryOf=item=>{
  if(item.kind==='note')return 'note';
  const kind=rd.sourceKind?.(item)||item.kind;
  if(['quran','hadith','dictionary','section','paragraph'].includes(kind))return kind;
  if(kind==='quote')return 'highlight';
  return 'source';
 };
 // The persistent saved-state key distinguishes personal bookmarks from
 // citations merely present in a section. Category glyphs navigate saved items.
 const savedPrefix=()=>{
  const prefix=document.createElement('span');prefix.className='gn-dock-saved-prefix';
  prefix.innerHTML=bookmarkUI.icon({saved:true});
  // Checked bookmark is the shared visible heading for all category counters.
  prefix.setAttribute('aria-hidden','true');return prefix;
 };
 const displaySymbol=(category)=>{
  if(category.symbol.length===1){
   const el=document.createElement('span');el.className='gn-dock-code';
   el.textContent=category.symbol;el.setAttribute('aria-hidden','true');return el;
  }
  const el=document.createElement('span');el.className='gn-dock-symbol';
  el.innerHTML=category.symbol;el.setAttribute('aria-hidden','true');return el;
 };
 let bySection=new Map(),last='',queued=false,sheet=null,sheetTrigger=null,sheetSection='';
 function closeSheet(restore=false){
  if(!sheet)return;
  sheet.remove();sheet=null;sheetSection='';
  const trigger=sheetTrigger;sheetTrigger=null;
  if(restore&&trigger?.isConnected)trigger.focus({preventScroll:true});
 }
 function reindex(){
  bySection=new Map();
  for(const item of rd.records()){
   if(item.deleted||!item.target)continue;
   const linked=new Set();
   if(item.target.section!=null)linked.add(String(item.target.section));
   for(const origin of Array.isArray(item.origins)?item.origins:[]){
    if(origin?.section!=null)linked.add(String(origin.section));
   }
   for(const section of linked){
    if(!section)continue;
    const items=bySection.get(section)||[];
    items.push(item);bySection.set(section,items);
   }
  }
  closeSheet();last='';schedule();
 }
 function readingPosition(){
  const reader=document.getElementById('reader');if(!reader)return null;
  const toolbar=document.getElementById('readingControls');
  const top=Math.max(0,toolbar?.getBoundingClientRect().bottom||0);
  const dockTop=dock.getBoundingClientRect().top;
  const y=Math.round(Math.max(top+35,Math.min(dockTop-38,top+(dockTop-top)*.22)));
  const x=Math.round(window.innerWidth/2);
  let grid=document.elementFromPoint?.(x,y)?.closest?.('#reader .passage-grid')||null;
  if(!grid){
   let best=Infinity;
   for(const p of reader.querySelectorAll('.passage-grid')){
    const rect=p.getBoundingClientRect();
    if(rect.bottom<=top||rect.top>=dockTop)continue;
    const distance=Math.abs(rect.top+Math.min(rect.height,70)/2-y);
    if(distance<best){best=distance;grid=p;}
   }
  }
  const section=String(grid?.closest('[data-reading-section]')?.getAttribute('data-reading-section')||state.n||'');
  const raw=grid?.getAttribute('data-segment');
  const segment=raw==null?null:Number(raw);
  return {section,segment:Number.isInteger(segment)?segment:null};
 }
 function classify(section){
  const groups=new Map(categories.map(category=>[category.id,[]]));
  for(const item of bySection.get(section)||[])groups.get(categoryOf(item))?.push(item);
  return groups;
 }
 function openSaved(item,section){
  closeSheet();
  if(!rd.openSavedItem?.(item.id,section))rd.openAt?.(section||item.target?.section||state.n,null,'all');
 }
 function itemTitle(item){
  const description=rd.describeSavedItem?.(item)||{};
  return String(description.title||item.title||item.target?.term||'Saved reference');
 }
 function itemLocation(item,section){
  const t=item.target||{};
  const locations=Array.isArray(item.origins)?item.origins:[];
  const loc=locations.find(origin=>String(origin.section)===String(section));
  const segment=t.section!=null&&String(t.section)===String(section)?t.segment:loc?.segment;
  return segment!=null&&Number.isInteger(Number(segment))?'¶'+(Number(segment)+1):'';
 }
 function openSheet(categoryId,trigger,section){
  const groups=classify(section);
  const items=categoryId==='all'?[...groups.values()].flat():groups.get(categoryId)||[];
  closeSheet();
  if(!items.length)return;
  const panel=document.createElement('section');
  panel.id='gn-dock-saved-sheet';panel.className='gn-dock-saved-sheet';
  panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','false');
  panel.setAttribute('aria-label','Your saved items in section '+section);
  const head=document.createElement('header');head.className='gn-dock-sheet-heading';
  const title=document.createElement('h3');title.textContent='Your saved items in §'+section;
  const dismiss=document.createElement('button');dismiss.type='button';
  dismiss.className='gn-dock-sheet-close';dismiss.textContent='×';
  dismiss.setAttribute('aria-label','Close saved references');
  dismiss.addEventListener('click',()=>closeSheet(true));
  head.append(title,dismiss);panel.append(head);
  const list=document.createElement('div');list.className='gn-dock-sheet-list';panel.append(list);
  for(const category of categories){
   if(categoryId!=='all'&&categoryId!==category.id)continue;
   const rows=groups.get(category.id)||[];if(!rows.length)continue;
   if(categoryId==='all'){
    const heading=document.createElement('h4');heading.className='gn-dock-sheet-category';
    heading.append(displaySymbol(category),document.createTextNode(category.label));
    list.append(heading);
   }
   for(const item of rows){
    const button=document.createElement('button');button.type='button';
    button.className='gn-dock-sheet-item';
    const itemName=itemTitle(item);
    button.setAttribute('aria-label','Open '+itemName);
    const titleLine=document.createElement('span');titleLine.className='gn-dock-sheet-item-title';
    titleLine.textContent=itemName;
    const locator=itemLocation(item,section);
    const detail=document.createElement('small');detail.className='gn-dock-sheet-item-detail';
    detail.textContent=locator||(item.kind==='note'?'Personal note':'Open saved source');
    button.append(titleLine,detail);
    button.addEventListener('click',()=>openSaved(item,section));
    list.append(button);
   }
  }
  const foot=document.createElement('footer');
  const manage=document.createElement('button');manage.type='button';
  manage.className='gn-dock-sheet-manage';manage.textContent='Manage in Reading Desk';
  manage.addEventListener('click',()=>{closeSheet();rd.openAt(section,null,'all');});
  foot.append(manage);panel.append(foot);
  const rect=dock.getBoundingClientRect();
  const near=trigger.getBoundingClientRect();
  const width=Math.min(410,window.innerWidth-20);
  const middle=window.innerWidth<=760?window.innerWidth/2:
   Math.max(width/2+10,Math.min(window.innerWidth-width/2-10,near.left+near.width/2));
  panel.style.width=width+'px';panel.style.left=middle+'px';
  panel.style.bottom=Math.max(10,window.innerHeight-rect.top+9)+'px';
  document.body.append(panel);
  sheet=panel;sheetTrigger=trigger;sheetSection=section;
  panel.querySelector('.gn-dock-sheet-item')?.focus({preventScroll:true});
 }
 function render(){
  if(state.route!=='reader'||dock.hidden){
   closeSheet();status.hidden=true;if(paraRef)paraRef.hidden=true;last='';return;
  }
  const place=readingPosition();
  if(!place){closeSheet();status.hidden=true;last='';return;}
  const synced=String(state.n)===place.section;
  if(paraRef){
   paraRef.hidden=place.segment==null||!synced;
   if(!paraRef.hidden){
    paraRef.textContent='· ¶'+(place.segment+1);
    paraRef.title='Paragraph '+(place.segment+1);
    paraRef.setAttribute('aria-label','Paragraph '+(place.segment+1));
    jump.setAttribute('aria-label','Current location: '+place.section+', paragraph '+(place.segment+1)+'. Open section navigator.');
   }else jump.setAttribute('aria-label','Current section '+place.section+'. Open section navigator.');
  }
  const groups=classify(place.section),total=[...groups.values()].reduce((n,items)=>n+items.length,0);
  const mobile=window.matchMedia?.('(max-width: 760px)').matches??false;
  const signature=[place.section,place.segment,mobile,...categories.map(c=>groups.get(c.id).map(item=>item.id).join(','))].join('|');
  if(sheet&&sheetSection!==place.section)closeSheet();
  if(signature===last&&status.hidden===!total)return;
  last=signature;status.replaceChildren();
  if(!total){status.hidden=true;return;}
  if(mobile){
   // Mobile uses ONE large touch target, not eight small buttons.
   const button=document.createElement('button');button.type='button';
   button.className='gn-dock-summary';
   button.dataset.gnCategoryCount=String(categories.filter(category=>groups.get(category.id).length).length);
   button.setAttribute('aria-label','Open '+total+' saved items in section '+place.section);
   const symbols=document.createElement('span');symbols.className='gn-dock-summary-symbols';
   for(const category of categories){
    const count=groups.get(category.id).length;if(!count)continue;
    const pair=document.createElement('span');pair.className='gn-dock-summary-pair';pair.dataset.gnMark=category.id;
    const number=document.createElement('span');number.className='gn-dock-count';
    number.textContent=count;pair.append(displaySymbol(category),number);
    symbols.append(pair);
   }
   const fallback=document.createElement('span');fallback.className='gn-dock-summary-fallback';
   fallback.textContent=total+' items';
   const caret=document.createElement('span');caret.className='gn-dock-summary-caret';
   caret.textContent='⌃';caret.setAttribute('aria-hidden','true');
   button.append(savedPrefix(),symbols,fallback,caret);
   button.addEventListener('click',()=>{
    const uniqueItem=total===1?[...groups.values()].flat()[0]:null;
    if(uniqueItem)openSaved(uniqueItem,place.section);
    else openSheet('all',button,place.section);
   });
   status.append(button);
  }else{
   status.append(savedPrefix());
   for(const category of categories){
    const items=groups.get(category.id);if(!items.length)continue;
    const button=document.createElement('button');button.type='button';
    button.className='gn-dock-mark';button.dataset.gnMark=category.id;
    if(category.id==='paragraph')button.classList.add('gn-dock-paragraph-mark');
    const count=document.createElement('span');count.className='gn-dock-count';
    count.textContent=items.length;
    button.append(displaySymbol(category),count);
    button.setAttribute('aria-label',category.label+': '+items.length+' in section '+place.section+
     (items.length===1?'. Open saved item':'. Choose saved item'));
    button.title=category.label+': '+items.length+' in §'+place.section;
    button.addEventListener('click',()=>items.length===1?openSaved(items[0],place.section):openSheet(category.id,button,place.section));
    status.append(button);
   }
  }
  status.hidden=false;
 }
 let verifyTimer=0;
 function schedule(){
  if(queued)return;queued=true;
  requestAnimationFrame(()=>{queued=false;render();});
 }
 function flushSoon(){
  schedule();
  if(verifyTimer)return;
  verifyTimer=setTimeout(()=>{verifyTimer=0;render();},90);
 }
 window.addEventListener('scroll',()=>{closeSheet();flushSoon();},{passive:true});
 window.addEventListener('resize',()=>{closeSheet();flushSoon();},{passive:true});
 window.addEventListener('hashchange',()=>{closeSheet();flushSoon();});
 document.addEventListener('gnamma-reading-desk-change',reindex);
 document.addEventListener('gnamma-reader-route-change',()=>{closeSheet();flushSoon();});
 document.addEventListener('pointerdown',event=>{
  if(sheet&&!sheet.contains(event.target)&&!status.contains(event.target))closeSheet();
 },true);
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&sheet){event.preventDefault();event.stopPropagation();closeSheet(true);}
 },true);
 new MutationObserver(flushSoon).observe(dock,{attributes:true,attributeFilter:['hidden']});
 const main=document.getElementById('mainContent');
 if(main)new MutationObserver(flushSoon).observe(main,{childList:true,subtree:true});
 reindex();flushSoon();
 return {refresh:()=>{reindex();render();flushSoon();},update:()=>{render();flushSoon();}};
}
let modeAPI=null,modePicker=null,modeOpener=null;
function closeModePicker(restoreFocus=false){
 if(!modePicker||modePicker.hidden)return;
 modePicker.hidden=true;
 if(restoreFocus&&modeOpener?.isConnected)modeOpener.focus({preventScroll:true});
 modeOpener?.setAttribute('aria-expanded','false');
}
function updateModePicker(){
 if(!modePicker||!modeAPI)return;
 const current=modeAPI.getMode();
 modePicker.querySelectorAll('[data-gn-reader-mode]').forEach(button=>
  button.setAttribute('aria-checked',String(button.dataset.gnReaderMode===current)));
 const checkbox=modePicker.querySelector('#gn-focus-apparatus-choice');
 if(checkbox)checkbox.checked=modeAPI.getApparatus();
}
function ensureModePicker(){
 if(modePicker)return modePicker;
 const picker=document.createElement('div');
 picker.id='gn-reading-mode-picker';picker.className='gn-reading-mode-picker';
 picker.setAttribute('role','dialog');picker.setAttribute('aria-label','Select reading mode');
 picker.hidden=true;
 picker.innerHTML='<div class="gn-mode-heading">Reading mode</div>'+
  '<div role="radiogroup" aria-label="Reading mode choices">'+
  '<button type="button" class="gn-mode-choice" role="radio" data-gn-reader-mode="reading"><span>Reading<small>Section and scholarly apparatus</small></span></button>'+
  '<button type="button" class="gn-mode-choice" role="radio" data-gn-reader-mode="focus"><span>Focus<small>One section, fewer distractions</small></span></button>'+
  '<button type="button" class="gn-mode-choice" role="radio" data-gn-reader-mode="continuous"><span>Continuous<small>Scroll through the whole text</small></span></button></div>'+
  '<label class="gn-mode-apparatus"><input type="checkbox" id="gn-focus-apparatus-choice"><span>In Focus, show apparatus below the text</span></label>';
 document.body.append(picker);
 picker.addEventListener('click',event=>{
  const choice=event.target.closest('[data-gn-reader-mode]');if(!choice)return;
  event.preventDefault();modeAPI?.setMode(choice.dataset.gnReaderMode);closeModePicker(); 
 });
 picker.querySelector('#gn-focus-apparatus-choice')?.addEventListener('change',event=>{
  modeAPI?.setApparatus(event.target.checked);updateModePicker();
 });
 document.addEventListener('pointerdown',event=>{
  if(picker.hidden)return;
  if(picker.contains(event.target)||event.target.closest('[data-focus-toggle]'))return;
  closeModePicker();
 });
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&!picker.hidden){event.preventDefault();closeModePicker(true);}
 });
 modePicker=picker;return modePicker;
}
function attachModes(api){modeAPI=api;return {close:closeModePicker};}
function openModeMenu(opener){
 if(!modeAPI)return;
 const picker=ensureModePicker();
 if(!picker.hidden){closeModePicker(true);return;}
 modeOpener=opener?.closest?.('[data-focus-toggle]')||document.getElementById('focusToolbar');
 updateModePicker();picker.hidden=false;
 const rect=modeOpener?.getBoundingClientRect()||{left:10,right:56,bottom:56,top:10};
 const width=picker.offsetWidth||300,height=picker.offsetHeight||255;
 const left=Math.max(10,Math.min(window.innerWidth-width-10,rect.right-width/2));
 const below=rect.bottom+8;
 const top=below+height<window.innerHeight-10?below:Math.max(10,rect.top-height-8);
 picker.style.left=left+'px';picker.style.top=top+'px';
 modeOpener?.setAttribute('aria-expanded','true');
 picker.querySelector('[aria-checked="true"]')?.focus({preventScroll:true});
}
window.GnammaReadingDock={create,attachModes,openModeMenu,closeModePicker};

})();


/* Clickable editorial-note ranges: share the adjacent N-marker action. */
(function(){
'use strict';
let menu=null,previousRange=null;
function linkedNotes(range){
  const anchors=[];
  let next=range.nextElementSibling;
  while(next?.matches('a.note-ref-symbol[data-note-target]')){
    anchors.push(next);
    next=next.nextElementSibling;
  }
  return anchors;
}
function closeChoice(restoreFocus){
  if(!menu)return;
  menu.remove();menu=null;
  if(restoreFocus&&previousRange?.isConnected){
    const first=linkedNotes(previousRange)[0];
    first?.focus({preventScroll:true});
  }
  previousRange=null;
}
function chooseNote(anchor){
  // Route through the existing note marker, so editorial, Qurʾānic and other
  // notes use exactly their existing card and return-to-reading behaviour.
  closeChoice(false);
  if(anchor?.isConnected)anchor.click();
}
function showChoice(range,anchors){
  closeChoice(false);
  previousRange=range;
  const popup=document.createElement('div');
  popup.className='gn-note-range-choice';
  popup.setAttribute('role','dialog');
  popup.setAttribute('aria-label','Choose a note on this passage');
  const heading=document.createElement('p');
  heading.className='gn-note-range-choice-label';
  heading.textContent='Notes on this wording';
  popup.append(heading);
  for(const anchor of anchors){
    const item=document.createElement('button');
    item.type='button';
    item.textContent=anchor.dataset.noteTarget;
    item.setAttribute('aria-label','Open note '+anchor.dataset.noteTarget);
    item.addEventListener('click',()=>chooseNote(anchor));
    popup.append(item);
  }
  document.body.append(popup);
  const rect=range.getBoundingClientRect();
  const width=popup.getBoundingClientRect().width||190;
  const height=popup.getBoundingClientRect().height||80;
  popup.style.left=Math.max(8,Math.min(window.innerWidth-width-8,rect.left))+'px';
  popup.style.top=(rect.bottom+6+height<=window.innerHeight-8
    ?rect.bottom+6:Math.max(8,rect.top-height-6))+'px';
  menu=popup;
  popup.querySelector('button')?.focus({preventScroll:true});
}
document.addEventListener('click',event=>{
  const target=event.target;
  if(!(target instanceof Element))return;
  const range=target.closest('#mainContent .passage-ar .note-anchored.note-range');
  if(!range)return;
  // Dictionary terms and genuine links inside the range keep priority.
  if(target.closest('button,a,[role="button"],input,select,textarea,[contenteditable="true"]'))return;
  // Never hijack a user's text selection.
  if(window.getSelection?.()?.toString().trim())return;
  const anchors=linkedNotes(range);
  if(!anchors.length)return;
  event.preventDefault();
  if(anchors.length===1)chooseNote(anchors[0]);
  else showChoice(range,anchors);
});
document.addEventListener('pointerdown',event=>{
  if(menu&&!menu.contains(event.target)&&!event.target.closest?.('.note-anchored.note-range'))
    closeChoice(false);
});
document.addEventListener('keydown',event=>{
  if(!menu||event.key!=='Escape')return;
  event.preventDefault();event.stopPropagation();closeChoice(true);
});
document.addEventListener('gnamma-reader-route-change',()=>closeChoice(false));
})();


/* Verified English note phrase links; source: qa/ENGLISH_NOTE_ALIGNMENT.json. */
(function(){
'use strict';
const ALIGNMENTS=[["1",0,"N001","after praising God"],["2",0,"N002","another part is particular (جزئية)"],["2",1,"N003","a probe and a rule"],["5",0,"N004","this book"],["7",0,"N005","those who discuss this craft"],["11",1,"N006","the utterance that restrains indecency"],["11",2,"N006","outside the concrete entity"],["11",1,"N007","a suitable, plausible ground"],["13",0,"N008","apprehended by reason"],["15",0,"N009","necessary knowledge"],["15",1,"N009","knowledge of this is necessary"],["20",0,"N010","extended performance periods"],["26",0,"N011","More evident still [is the error of supposing]"],["29",0,"N012","For one who understands the form of prohibition"],["29",0,"N013","a prohibition applying to that act under a particular qualification"],["29",1,"N014","If, however, the question is considered from the standpoint of meaning"],["31",1,"N015","without intending [worship of it] is forbidden in one respect and an act of drawing near [to God]"],["38",0,"N016","the legally responsible person is the guardian, subject to readiness to receive reason"],["38",1,"N016","after [possessing] reason, the condition of legal responsibility"],["44",1,"N018","the cause in acquiring [the act] be belief in the command’s obligatoriness"],["45",1,"N019","its possibility conceived"],["45",0,"N020","the shaykh Abū al-Ḥasan"],["45",0,"N021","what makes the human being appear to be an agent"],["45",1,"N021","its possibility conceived"],["47",1,"N022","[the threat of] killing"],["47",3,"N022","coercion by killing into killing"],["58",0,"N023","advancing the alms before the year's completion"],["63",0,"N024","what is peculiar to it"],["64",0,"N025","aḥruf (الأحرف السبعة, modes of recitation)"],["69",0,"N026","the expression ‘he said’ [the printed cross-reference is defective]"],["71",0,"N027","the person issuing the command"],["75",0,"N028","a goat-stag"],["75",1,"N028","a certain syllogism"],["76",0,"N029","its relation to the soul resembles that of"],["76",1,"N029","some through acquisition"],["76",0,"N030","cannot say that assent to this conclusion is produced, in the primary sense, by premises"],["77",0,"N031","What does not actually exist in the soul cannot cause what is potential"],["79",0,"N032","We answer: although this is not impossible"],["82",2,"N033","warning was perhaps required of individuals only so that their numbers would increase"],["89",0,"N035","unknown to the Prophet himself"],["91",0,"N036","Whoever holds that transgression in itself defeats acceptance, ⟨not⟩ because it arouses suspicion"],["92",0,"N037","drinks nabīdh"],["96",1,"N038","specifically addresses the very matter asserted by the critic"],["97",0,"N039","The highest is an explicit statement explaining the basis of his probity"],["97",1,"N039","for reasons other than an objection to his probity"],["105",1,"N040","some say that one may not act upon it without having heard it"],["110",1,"N041","I consider this permissible if that part conveys a meaning"],["110",0,"N042","A practitioner of independent judgement whose judgement others follow"],["111",1,"N043","he transmits only from persons of probity"],["111",0,"N044","transmission with an omitted link and transmission with a connected chain"],["113",0,"N045","may God bless them and grant them peace"],["119",0,"N046","the abrogation concerning storing sacrificial meat"],["121",2,"N047","it should not be accepted that such wording was once part of the Qurʾān until it is established by mass transmission"],["121",1,"N048","needy people"],["121",1,"N049","a compensation: food for needy people"],["124",1,"N050","God has now appointed a way for them"],["125",0,"N051","Contrary to what many think, it is not impossible"],["131",2,"N052","My community does not agree upon error"],["133",0,"N053","included as followers of the consensus"],["141",0,"N054","eating during Shawwāl"],["141",0,"N055","calling this a proof is a loose use of language"],["143",0,"N056","Here the discussion of the fourth source ends"],["145",0,"N058","the community should, at any time, lose knowledge of a collective obligation"],["152",0,"N059","requests, entreaties, and calls"],["157",0,"N060","in every context"],["158",0,"N061","the eye of a balance"],["160",0,"N062","beyond the time of need"],["161",1,"N063","while knowing with certainty that they remain indeterminate"],["161",2,"N063","knowing with certainty that they are indeterminate"],["161",0,"N064","al-ṣarīm here means night"],["163",2,"N065","its detailed clarification is deferred until the time of need"],["163",3,"N065","those who [do not] permit it"],["163",0,"N066","until the time of need"],["163",1,"N066","until the particular cow was identified for them"],["163",2,"N066","until the time of need"],["163",3,"N066","beyond the time of need"],["165",0,"N067","placing the universal (الكلي) in place of the particular (الجزئي)"],["168",1,"N069","being established’ here is not occupying a place"],["170",0,"N070","do not end in the feminine ending"],["171",0,"N071","She is entitled to the dower"],["177",0,"N072","An equivocal term does not have general scope encompassing everything to which it applies"],["178",0,"N073","specifically a masculine plural"],["179",0,"N074","the minimum denoted by a plural"],["181",1,"N075","Opinions differ concerning the specification of general wording through these other revealed proofs"],["183",0,"N076","the expression to which it belongs"],["185",0,"N077","an immediate transaction"],["185",1,"N078","the horse tethering places"],["187",1,"N079","whoever cannot find the means must fast three days"],["188",0,"N080","the amount remaining after an exception may be smaller than the amount excepted"],["191",2,"N081","substitute the specific particular for the general"],["191",3,"N082","Do not say ‘Uff’ to the two of them"],["191",3,"N083","the thread and the needle"],["192",0,"N084","indeterminate, unambiguous, prima facie, and interpreted expressions"],["194",0,"N085","what is certainly understood here is marriage"],["194",2,"N086","inference from the discourse (دليل الخطاب)"],["195",1,"N087","qualifies something by an endpoint"],["198",1,"N088","[subsisting] in the soul"],["200",1,"N089","meanings of ordinary usage"],["203",0,"N090","would signify either [obligation] or recommendation"],["203",1,"N091","It may admit recommendation or [obligation]"],["203",1,"N092","the imperative “Do!”"],["204",0,"N093","a specified time"],["205",0,"N094","the sufficiency of the commanded act (إجزاء)"],["205",1,"N094","the sufficiency of the commanded act"],["211",1,"N095","Negation as negation does not require one ruling for two things—except where negation has the force of privation"],["212",0,"N096","it is not a syllogism, but belongs to using a particular expression in place of the intended universal"],["212",1,"N096","this is using a particular expression in place of the intended universal"],["212",0,"N097","water left by a cat"],["215",0,"N098","the ruling applies with greater reason to the unmentioned case than to the stated one"],["215",0,"N099","the thread and the needle"],["217",1,"N101","When it is very remote and completely general, as when we simply say “benefit,”"],["218",1,"N102","they join the second rank"],["218",0,"N103","analogy by resemblance (قياس الشبه)"],["218",1,"N104","nourishment, measure, or edibility"],["222",1,"N105","positive and negative concomitance"],["223",2,"N106","no indication pointing to the underlying ground"],["224",0,"N107","These are all contextual indications that [make] expressions prima facie"],["224",0,"N108","These are all contextual indications that [make] expressions prima facie"],["227",0,"N109","if it is a legal judgement"],["229",0,"N110","⟨that the action is peculiar to him. The third is⟩"],["229",0,"N111","others withhold judgement"],["237",0,"N112","one is charged with attaining it"],["239",1,"N113","We have neglected nothing in the Book"],["239",1,"N114","original freedom from obligation"],["241",0,"N115","grave offence and a resort to arbitrary judgement"],["241",1,"N116","evidence itself yields what is sought"],["243",0,"N117","it occurs through forgetfulness, inattention, and inadvertence"],["246",1,"N118","ritual bathing because of the emission of fluid, and bathing because of the meeting of the circumcised parts"],["247",1,"N119","For contradictory evidence cannot occur within the Law itself"],["254",1,"N120","no practising independent jurist"],["258",0,"N121","Here our purpose in this abridgement is complete"],["258",0,"N122","the middle ten days of Dhū al-Ḥijja"],["colophon",1,"N123","Aḥmad ibn Aḥmad al-Muṭarrifī"]];
const bySection=new Map(),byNote=new Map();
for(const [section,segment,id,phrase] of ALIGNMENTS){
  if(!bySection.has(section))bySection.set(section,new Map());
  const group=bySection.get(section);
  if(!group.has(segment))group.set(segment,[]);
  group.get(segment).push({id,phrase});
  if(!byNote.has(id))byNote.set(id,[]);
  byNote.get(id).push({section,segment,phrase});
}
// Four publisher notes have no defensible English phrase-level anchor.
const VERIFIED_SECTION_FALLBACKS=Object.freeze({
  '39':['N017'],'87':['N034'],'144':['N057'],'167':['N068']
});
const info=window.GnammaNNoteLocations||{bySection:{},locations:{}};
const NOTE_IDS=new Map(Object.entries(VERIFIED_SECTION_FALLBACKS));
for(const [section,ids] of Object.entries(info.bySection||{})){
  NOTE_IDS.set(section,[...new Set([...(NOTE_IDS.get(section)||[]),...(ids||[])])]);
}
let menu=null,focusReturn=null,scheduled=false;
function closeMenu(returnFocus=false){
  if(menu){menu.remove();menu=null;}
  if(returnFocus&&focusReturn?.isConnected)focusReturn.focus({preventScroll:true});
  focusReturn=null;
}
function selectionExists(){return Boolean(window.getSelection?.()?.toString().trim());}
function activeNotes(){return !document.body.classList.contains('hide-notes')&&!document.body.classList.contains('focus-mode');}
function showChoices(trigger,links){
  closeMenu(false);
  focusReturn=trigger;
  const picker=document.createElement('div');
  picker.className='gn-note-range-choice gn-note-en-choice';
  picker.setAttribute('role','dialog');
  picker.setAttribute('aria-label','Publisher notes on this English passage');
  const label=document.createElement('p');
  label.className='gn-note-range-choice-label';
  label.textContent='Publisher notes on this passage';
  picker.append(label);
  for(const link of links){
    const button=document.createElement('button');
    button.type='button';button.textContent=link.dataset.noteTarget;
    button.setAttribute('aria-label','Open publisher note '+link.dataset.noteTarget);
    button.addEventListener('click',()=>{
      const origin=focusReturn;closeMenu(false);window.__termClickOrigin=origin;
      if(link.isConnected)link.click();
    });
    picker.append(button);
  }
  document.body.append(picker);
  const rect=trigger.getBoundingClientRect(),size=picker.getBoundingClientRect();
  const width=size.width||200,height=size.height||95;
  picker.style.left=Math.max(8,Math.min(window.innerWidth-width-8,rect.left))+'px';
  picker.style.top=(rect.bottom+height+6<=window.innerHeight-8?
    rect.bottom+6:Math.max(8,rect.top-height-6))+'px';
  menu=picker;
  picker.querySelector('button')?.focus({preventScroll:true});
}
function openRange(range){
  if(!activeNotes()||selectionExists())return;
  const key=range.dataset.gnEnNoteGroup;
  const parent=range.closest('.passage-en');
  if(!key||!parent)return;
  const links=[...parent.querySelectorAll('a.gn-note-en-ref[data-gn-en-ref-group]')]
    .filter(link=>link.dataset.gnEnRefGroup===key);
  if(links.length===1){window.__termClickOrigin=range;links[0].click();}
  else if(links.length>1)showChoices(range,links);
}
function noteAnchor(id,group,sectionLevel=false){
  const a=document.createElement('a');
  a.className='note-ref-symbol '+(sectionLevel?'gn-note-en-section-ref':'gn-note-en-ref');
  a.href='#note-'+id;
  a.dataset.noteTarget=id;
  if(!sectionLevel)a.dataset.gnEnRefGroup=group;
  a.dir='ltr';a.textContent=id;
  a.setAttribute('aria-label',(sectionLevel?'Open section-level publisher note ':'Open publisher note ')+id);
  a.title=(sectionLevel?'Section-level publisher note ':'Publisher note ')+id;
  return a;
}
function textIndex(element){
  const filter={acceptNode(node){
    const parent=node.parentElement;
    return parent?.closest('.note-ref-symbol,.gn-note-en-section-list,[aria-hidden="true"]')?
      NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;
  }};
  const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT,filter);
  const nodes=[];let text='',node;
  while((node=walker.nextNode())){
    if(!node.data)continue;
    nodes.push({node,start:text.length,end:text.length+node.length});
    text+=node.data;
  }
  return {text,nodes};
}
function groupsFor(text,entries){
  const ranges=[];
  for(const {id,phrase} of entries){
    const start=text.indexOf(phrase);
    if(start<0||text.indexOf(phrase,start+phrase.length)!==-1)continue;
    ranges.push({start,end:start+phrase.length,ids:[id]});
  }
  ranges.sort((a,b)=>a.start-b.start||b.end-a.end);
  const combined=[];
  for(const item of ranges){
    const last=combined[combined.length-1];
    if(last&&item.start<last.end){
      last.end=Math.max(last.end,item.end);
      last.ids=[...new Set([...last.ids,...item.ids])];
    }else combined.push(item);
  }
  return combined;
}
function decorateRange(element,info,item,group){
  let tail=null;
  for(let i=info.nodes.length-1;i>=0;i--){
    const record=info.nodes[i];
    if(record.end<=item.start||record.start>=item.end)continue;
    const node=record.node;
    if(!node.isConnected)continue;
    const ancestor=node.parentElement?.closest('a[href],button,[role="button"],[contenteditable="true"]');
    if(ancestor){if(!tail)tail=ancestor;continue;}
    const from=Math.max(0,item.start-record.start),
          to=Math.min(record.end-record.start,item.end-record.start);
    if(to<=from||to>node.length)continue;
    if(to<node.length)node.splitText(to);
    const part=from>0?node.splitText(from):node;
    const span=document.createElement('span');
    span.className='note-anchored note-range gn-note-en-range';
    span.dataset.gnEnNoteGroup=group;
    span.dataset.gnEnNoteIds=item.ids.join(',');
    span.tabIndex=activeNotes()?0:-1;
    span.setAttribute('role','button');
    span.setAttribute('aria-label','Open publisher '+(item.ids.length>1?'notes ':'note ')+item.ids.join(', '));
    part.replaceWith(span);span.append(part);
    if(!tail)tail=span;
  }
  if(!tail)return false;
  const links=item.ids.map(id=>noteAnchor(id,group));
  tail.after(...links);
  return true;
}
function sectionId(element){
  const nearest=element.closest('[data-reading-section]');
  if(nearest?.dataset.readingSection)return String(nearest.dataset.readingSection);
  const parent=element.closest('.reader');
  const heading=parent?.querySelector('.gn-section-number-ar-only')?.textContent||'';
  if(/colophon/i.test(heading))return 'colophon';
  const n=heading.match(/§\s*(\d+)/);
  if(n)return String(Number(n[1]));
  const hash=location.hash.match(/(?:^#|&)section=([^&]+)/);
  if(hash)try{return decodeURIComponent(hash[1]);}catch(_){return hash[1];}
  return null;
}
function addSectionLinks(section,root,seen){
  if(root.querySelector('.gn-note-en-section-list'))return;
  const ids=(NOTE_IDS.get(section)||[]).filter(id=>!seen.has(id));
  if(!ids.length)return;
  const english=[...root.querySelectorAll('.passage-grid .passage-en')].at(-1);
  if(!english)return;
  const box=document.createElement('div');
  box.className='gn-note-en-section-list';
  box.setAttribute('role','group');
  box.setAttribute('aria-label','Additional publisher notes for this section');
  const heading=document.createElement('span');
  heading.className='gn-note-en-section-heading';
  heading.textContent='Other publisher notes in this section: ';
  box.append(heading);
  ids.forEach(id=>box.append(noteAnchor(id,section+'-section',true)));
  english.append(box);
}
function processSection(section,root){
  const rows=[...root.querySelectorAll('.passage-grid')];
  if(!rows.length)return;
  const bySegment=bySection.get(section)||new Map(),seen=new Set();
  rows.forEach((row,pos)=>{
    const en=row.querySelector('.passage-en');
    if(!en)return;
    if(en.dataset.gnEnglishNoteProcessed==='1'){
      en.querySelectorAll('a.gn-note-en-ref').forEach(a=>seen.add(a.dataset.noteTarget));
      return;
    }
    const segment=Number(row.dataset.segment??pos);
    const entries=bySegment.get(segment)||[];
    const index=textIndex(en),ranges=groupsFor(index.text,entries);
    // Descending offsets preserve source text positions when text nodes split.
    for(const range of ranges.slice().reverse()){
      const group=section+'-'+segment+'-'+range.start;
      if(decorateRange(en,index,range,group))
        range.ids.forEach(id=>seen.add(id));
    }
    en.dataset.gnEnglishNoteProcessed='1';
  });
  addSectionLinks(section,root,seen);
}
function syncVisibility(root){
  const hidden=!activeNotes();
  root.querySelectorAll('.gn-note-en-range').forEach(span=>{
    span.tabIndex=hidden?-1:0;
    span.setAttribute('aria-hidden',String(hidden));
  });
}
function scan(){
  scheduled=false;
  const main=document.getElementById('mainContent'),reader=main?.querySelector('.reader');
  if(!reader)return;
  const continuous=[...reader.querySelectorAll('.gn-continuous-section[data-reading-section]')];
  if(continuous.length){
    for(const group of continuous)processSection(String(group.dataset.readingSection),group);
  }else{
    const sec=sectionId(reader);
    if(sec)processSection(sec,reader);
  }
  syncVisibility(reader);
}
function schedule(){
  if(scheduled)return;
  scheduled=true;requestAnimationFrame(scan);
}
function enhancePopup(){
  const detail=document.getElementById('detailContent');
  if(!detail||detail.querySelector('.gn-note-en-scope'))return;
  const title=detail.querySelector('#detailTitle')?.textContent||'';
  const id=title.match(/^N\d{3}/)?.[0];
  if(!id)return;
  const items=byNote.get(id)||[];
  const scope=document.createElement('div');
  scope.className='note-scope gn-note-en-scope';
  const head=document.createElement('strong');
  head.textContent=items.length?'English translation addressed: ':'Scope of this note: ';
  scope.append(head);
  if(items.length){
    const phrases=[...new Set(items.map(x=>x.phrase))].slice(0,5);
    for(const phrase of phrases){
      const line=document.createElement('div');
      line.className='gn-note-en-scope-excerpt';line.lang='en';
      line.textContent='“'+phrase+'”';
      scope.append(line);
    }
  }else{
    scope.append(document.createTextNode('The section as a whole; no exact phrase is assigned.'));
  }
  const arabic=detail.querySelector('.note-scope');
  if(arabic)arabic.after(scope);
  else detail.querySelector('#detailTitle')?.after(scope);
}
function install(){
  const main=document.getElementById('mainContent');
  if(!main)return;
  new MutationObserver(schedule).observe(main,{childList:true,subtree:true});
  new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['class']});
  const detail=document.getElementById('detailContent');
  if(detail)new MutationObserver(enhancePopup).observe(detail,{childList:true});
  document.addEventListener('click',event=>{
    const target=event.target;
    if(!(target instanceof Element))return;
    if(menu&&!menu.contains(target)&&!target.closest('.gn-note-en-range'))closeMenu(false);
    const range=target.closest('#mainContent .gn-note-en-range');
    if(!range||target.closest('a[href],button,[contenteditable="true"]'))return;
    if(!activeNotes()||selectionExists())return;
    event.preventDefault();openRange(range);
  });
  document.addEventListener('keydown',event=>{
    if(menu&&event.key==='Escape'){
      event.preventDefault();event.stopPropagation();closeMenu(true);return;
    }
    if(event.key!=='Enter'&&event.key!==' ')return;
    const target=event.target;
    if(!(target instanceof Element))return;
    const range=target.closest('#mainContent .gn-note-en-range');
    if(!range||!activeNotes())return;
    event.preventDefault();openRange(range);
  });
  document.addEventListener('gnamma-reader-route-change',()=>{closeMenu(false);schedule();});
  window.GnammaEnglishNoteQA={mapped:ALIGNMENTS.length,notes:[...byNote.keys()].length};
  schedule();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
else install();


})();


/* Canonical publisher-note section reconciliation: N ids are not section ids. */
(function(){
'use strict';
const node=document.getElementById('editionData');
if(!node?.textContent)return;
try{
  const book=JSON.parse(node.textContent);
  if(!Array.isArray(book.sections)||!Array.isArray(book.notes))return;
  const location=new Map(),bySection={};
  for(const section of book.sections){
    const sectionId=String(section.id);
    const ids=(section.noteIds||[]).filter(id=>/^N\d{3}$/.test(String(id)));
    if(ids.length)bySection[sectionId]=ids;
    for(const id of ids){
      if(location.has(id)&&location.get(id)!==sectionId)
        throw new Error('Publisher note '+id+' belongs to multiple sections');
      location.set(id,sectionId);
    }
  }
  const nNotes=book.notes.filter(note=>/^N\d{3}$/.test(String(note.id)));
  if(nNotes.some(note=>!location.has(note.id)))
    throw new Error('A publisher note has no canonical section');
  let repaired=0;
  for(const note of nNotes){
    const section=location.get(note.id);
    if(String(note.n)===section)continue;
    note.n=section==='colophon'?section:Number(section);
    repaired++;
  }
  if(repaired)node.textContent=JSON.stringify(book);
  window.GnammaNNoteLocations={
    bySection,
    locations:Object.fromEntries(location),
    repaired
  };
}catch(error){
  console.error('Unable to reconcile publisher-note section locations',error);
}
})();
