/* In-text locators for the three Focus modes of Ibn Rushd's Daruri.
   Each stable source paragraph carries BOTH its section (§) and paragraph (¶)
   number. Metadata sits beside, not inside, the Arabic/English source DOM:
   annotation offsets, text selection, highlights and citations stay intact.
   The reader creates new passage grids as the user changes modes/sections. */
(()=>{
 'use strict';
 if(window.GnammaFocusLocators)return;
 const $=(selector,root=document)=>root.querySelector(selector);
 let queued=false;
 function annotate(){
  const reader=$('#reader');
  if(!reader)return;
  const copy=window.GnammaCopyLinks;
  const state=window.GnammaCopyContext?.state;
  for(const grid of reader.querySelectorAll('.passage-grid[data-segment]')){
   if(grid.querySelector(':scope > .gn-focus-reading-locus'))continue;
   const section=grid.closest('.gn-continuous-section[data-reading-section]')?.dataset.readingSection||String(state?.n||'');
   const index=Number(grid.dataset.segment);
   if(!section||!Number.isInteger(index)||index<0||!copy?.idFor(section,index))continue;
   const sectionLabel=section==='colophon'?'Colophon':'§'+section;
   const paragraphLabel='¶'+(index+1);
   const locator=document.createElement('div');
   locator.className='gn-focus-reading-locus';
   locator.setAttribute('role','note');
   locator.setAttribute('aria-label',(section==='colophon'?'Colophon':'Section '+section)+', paragraph '+(index+1));
   const sectionNode=document.createElement('span');
   sectionNode.className='gn-focus-locus-section';sectionNode.textContent=sectionLabel;
   const dot=document.createElement('span');
   dot.className='gn-focus-locus-separator';dot.textContent='·';dot.setAttribute('aria-hidden','true');
   const paragraphNode=document.createElement('span');
   paragraphNode.className='gn-focus-locus-paragraph';paragraphNode.textContent=paragraphLabel;
   locator.append(sectionNode,dot,paragraphNode);
   // This is intentionally a sibling of the source spans. Never prepend
   // metadata to .passage-ar/.passage-en or change their text offsets.
   grid.prepend(locator);
  }
 }
 function schedule(){
  if(queued)return;
  queued=true;
  requestAnimationFrame(()=>{queued=false;annotate()});
 }
 const main=$('#mainContent');
 if(main)new MutationObserver(records=>{
  if(records.some(record=>[...record.addedNodes].some(node=>
   node.nodeType===1&&(
    node.matches?.('.reader,.passage-grid,.gn-continuous-section,.parallel-text')||
    node.querySelector?.('.passage-grid')
   ))))schedule();
 }).observe(main,{childList:true,subtree:true});
 document.addEventListener('gnamma-reader-route-change',schedule);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
 else schedule();
 window.GnammaFocusLocators=Object.freeze({annotate});
})();