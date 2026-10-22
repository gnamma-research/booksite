/* Daruri reader: compact private annotations in the existing persistent dock.
 * Counts are derived from Reading Desk records; this never writes personal data. */
(function(){
'use strict';
const icons={
 bookmark:'<path d="M6 3.5h12v17l-6-4-6 4.5z"/>',
 highlight:'<path d="m15 4 5 5M4 20l4-.5L20 7a3 3 0 0 0-4-4L4 15z"/>',
 note:'<rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>'
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
 const empty=()=>({bookmarks:0,highlights:0,notes:0});
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
   if(item.kind==='section'||item.kind==='paragraph')type='bookmarks';
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
  const y=Math.round(Math.max(top+35,Math.min(dockTop-38,top+(dockTop-top)*.42)));
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
  const passageCounts=place.segment==null?sectionCounts:(passages.get(keyOf(place.section,place.segment))||empty());
  // Section-level marks remain visible while scrolling through that section.
  const sectionBookmarks=(sectionOnly.get(place.section)||empty()).bookmarks;
  const sectionNotes=(sectionOnly.get(place.section)||empty()).notes;
  const counts={
   bookmarks:place.segment==null?sectionCounts.bookmarks:sectionBookmarks+passageCounts.bookmarks,
   highlights:passageCounts.highlights,
   notes:place.segment==null?sectionCounts.notes:sectionNotes+passageCounts.notes
  };
  const signature=[place.section,place.segment,counts.bookmarks,counts.highlights,counts.notes].join('|');
  if(signature===last)return;last=signature;
  status.replaceChildren();
  const values=[['bookmark','bookmarks','Saved bookmarks'],['highlight','highlights','Highlighted quotations'],['note','notes','Personal notes']];
  for(const [icon,type,label] of values){
   const count=counts[type];if(!count)continue;
   const button=document.createElement('button');button.type='button';
   button.className='gn-dock-mark';button.dataset.gnMark=type;
   button.setAttribute('aria-label',label+': '+count+' in '+(place.segment==null?'this section':'the current passage or section'));
   button.title=label+': '+count;
   button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+icons[icon]+'</svg><span>'+count+'</span>';
   button.addEventListener('click',()=>{
    // Keep jump/title separate from annotation actions; never toggle/delete here.
    const onlyParagraph=type==='highlights'?place.segment:null;
    rd.openAt(place.section,onlyParagraph,type==='note'?'notes':'bookmarks');
   });
   status.append(button);
  }
  status.hidden=!status.childElementCount;
 }
 function schedule(){
  if(queued)return;queued=true;
  requestAnimationFrame(()=>{queued=false;render();});
 }
 window.addEventListener('scroll',schedule,{passive:true});
 window.addEventListener('resize',schedule,{passive:true});
 window.addEventListener('hashchange',schedule);
 document.addEventListener('gnamma-reading-desk-change',reindex);
 document.addEventListener('gnamma-reader-route-change',schedule);
 const main=document.getElementById('mainContent');
 if(main)new MutationObserver(schedule).observe(main,{childList:true,subtree:true});
 reindex();schedule();
 return {refresh:()=>{reindex();schedule();},update:schedule};
}
window.GnammaReadingDock={create};
})();