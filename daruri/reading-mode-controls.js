/* Daruri reader: compact private annotations in the existing persistent dock.
 * Counts are derived from Reading Desk records; this never writes personal data. */
(function(){
'use strict';
const icons={
 sectionBookmark:'<path d="M6 3.5h12v17l-6-4-6 4.5z" fill="currentColor" fill-opacity=".12"/>',
 paragraphBookmark:'<path d="M4 3.5h12v17l-6-4-6 4.5z" fill="currentColor" fill-opacity=".12"/><text x="19" y="17" font-family="Georgia, serif" font-size="15" font-weight="700" stroke="none" fill="currentColor">¶</text>',
 highlight:'<path d="m15 4 5 5M4 20l4-.5L20 7a3 3 0 0 0-4-4L4 15z"/>',
 note:'<rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M7.7 16.5 8.4 13.5 15.8 6.2l2.3 2.3-7.4 7.3-3 .7zM13.9 8.1l2.3 2.3"/>'
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
  status=document.createElement('div');
  status.id='gn-dock-private-status';
  status.className='gn-dock-private-status';
  status.setAttribute('role','group');
  status.setAttribute('aria-label','Your saved reading marks at this passage');
  status.hidden=true;center.append(status);
 }
 let sections=new Map(),sectionOnly=new Map(),passages=new Map(),last='',queued=false;
 const keyOf=(section,segment)=>String(section)+':'+Number(segment);
 const empty=()=>({sectionBookmarks:0,paragraphBookmarks:0,highlights:0,notes:0});
 function add(row,key,kind){
  const bucket=row.get(key)||empty();bucket[kind]++;row.set(key,bucket);
 }
 function reindex(){
  sections=new Map();sectionOnly=new Map();passages=new Map();
  for(const item of rd.records()){
   if(item.deleted||!item.target||item.target.section==null)continue;
   const t=item.target,section=String(t.section);
   if(!section)continue;
   let type=null;
   if(item.kind==='section')type='sectionBookmarks';
   else if(item.kind==='paragraph')type='paragraphBookmarks';
   if(item.kind==='quote')type='highlights';
   if(item.kind==='note')type='notes';
   if(!type)continue;
   add(sections,section,type);
   if(t.segment==null)add(sectionOnly,section,type);
   if(t.segment!=null&&Number.isInteger(Number(t.segment)))
    add(passages,keyOf(section,t.segment),type);
  }
  last='';schedule();
 }
 function readingPosition(){
  const reader=document.getElementById('reader');if(!reader)return null;
  const toolbar=document.getElementById('readingControls');
  const top=Math.max(0,toolbar?.getBoundingClientRect().bottom||0);
  const dockTop=dock.getBoundingClientRect().top;
  // Use the text nearest the top of the reading viewport, not its midpoint. A
  // midpoint probe can jump into an adjacent paragraph on mobile Safari.
  const y=Math.round(Math.max(top+35,Math.min(dockTop-38,top+(dockTop-top)*.22)));
  const x=Math.round(window.innerWidth/2);
  let grid=document.elementFromPoint(x,y)?.closest?.('#reader .passage-grid')||null;
  if(!grid){
   // The anchor may fall between two text blocks. Search only as a fallback.
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
 function render(){
  if(state.route!=='reader'||dock.hidden){status.hidden=true;last='';return;}
  const place=readingPosition();if(!place){status.hidden=true;last='';return;}
  const sectionCounts=sections.get(place.section)||empty();
  const paragraphCounts=place.segment==null?sectionCounts:(passages.get(keyOf(place.section,place.segment))||empty());
  const sectionOnlyCounts=sectionOnly.get(place.section)||empty();
  // Section bookmarks persist while reading a paragraph; paragraph bookmarks
  // and precise highlights refer to the presently visible aligned passage.
  const counts={
   sectionBookmarks:sectionOnlyCounts.sectionBookmarks,
   paragraphBookmarks:paragraphCounts.paragraphBookmarks,
   highlights:paragraphCounts.highlights,
   notes:place.segment==null?sectionCounts.notes:sectionOnlyCounts.notes+paragraphCounts.notes
  };
  // Keep structural section number and live paragraph locator together.
  const locator=document.getElementById('dockSection');
  const reference=place.section==='colophon'?'Colophon':'§'+place.section;
  const locationText=reference+(place.segment==null?'':' · ¶'+(place.segment+1));
  if(locator&&locator.textContent!==locationText)locator.textContent=locationText;
  const signature=[place.section,place.segment,counts.sectionBookmarks,counts.paragraphBookmarks,counts.highlights,counts.notes].join('|');
  const hasMarks=Boolean(counts.sectionBookmarks||counts.paragraphBookmarks||counts.highlights||counts.notes);
  // A route transition can hide the dock between two equivalent signatures.
  if(signature===last&&status.hidden===!hasMarks)return;last=signature;
  status.replaceChildren();
  const values=[
   ['sectionBookmark','sectionBookmarks','Section bookmarks'],
   ['paragraphBookmark','paragraphBookmarks','Paragraph bookmarks'],
   ['highlight','highlights','Highlighted selections'],
   ['note','notes','Personal notes']
  ];
  for(const [icon,type,label] of values){
   const count=counts[type];if(!count)continue;
   const button=document.createElement('button');button.type='button';
   button.className='gn-dock-mark'+(type==='paragraphBookmarks'?' gn-dock-mark-paragraph':'');
   button.dataset.gnMark=type;
   const scope=place.segment==null?'the current section':'the current paragraph and its section';
   button.setAttribute('aria-label',label+': '+count+' in '+scope);
   button.title=label+': '+count;
   const box=icon==='paragraphBookmark'?'0 0 34 24':'0 0 24 24';
   button.innerHTML='<svg viewBox="'+box+'" aria-hidden="true">'+icons[icon]+'</svg><span>'+count+'</span>';
   button.addEventListener('click',()=>{
    // Opening saved material never toggles or deletes a mark.
    const segment=type==='sectionBookmarks'?null:
      (type==='notes'&&sectionOnlyCounts.notes?null:place.segment);
    rd.openAt(place.section,segment,type==='notes'?'notes':'bookmarks');
   });
   status.append(button);
  }
  status.hidden=!status.childElementCount;
 }
 let verifyTimer=0;
 function schedule(){
  if(queued)return;queued=true;
  requestAnimationFrame(()=>{queued=false;render();});
 }
 function flushSoon(){
  schedule();
  // Scroll-driven navigation sometimes completes after the first animation
  // frame in mobile WebKit. A bounded fallback reconciles the displayed marks
  // without polling or writing user data.
  if(verifyTimer)return;
  verifyTimer=setTimeout(()=>{verifyTimer=0;render();},90);
 }
 window.addEventListener('scroll',flushSoon,{passive:true});
 window.addEventListener('resize',flushSoon,{passive:true});
 window.addEventListener('hashchange',flushSoon);
 document.addEventListener('gnamma-reading-desk-change',reindex);
 document.addEventListener('gnamma-reader-route-change',flushSoon);
 // Refresh when another reader route makes the dock visible after rendering.
 // The main-pane observer alone can fire before syncReadingChrome removes [hidden]
 // in mobile WebKit; observing this attribute avoids an empty stale status.
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