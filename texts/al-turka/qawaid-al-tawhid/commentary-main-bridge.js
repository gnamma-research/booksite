/* Run after commentary-conclusion.js and before reader.js.
   Preserve the original matn; only extend its separately attributed commentary layer. */
(function(){
 'use strict';
 const data=window.GNAMMA_TAMHID_SHARH;
 if(data&&Array.isArray(data.units)){
  const additional=[...(window.GNAMMA_TAMHID_MAIN||[]),...(window.GNAMMA_TAMHID_CONCLUSION||[])];
  const existingIds=new Set(data.units.map(u=>u.id));
  for(const u of additional)if(!existingIds.has(u.id)){data.units.push(u);existingIds.add(u.id);}
  const sequence={'SH-061-C':1,'SH-061-D':2,'SH-061-E':3,'SH-061-F':4,'SH-061-A':5,'SH-061-B':6};
  data.units.sort((a,b)=>a.matnId.localeCompare(b.matnId)||(sequence[a.id]||a.sequence||0)-(sequence[b.id]||b.sequence||0));
  data.coverage={...data.coverage,verifiedEnglishUnits:data.units.length,verifiedArabicPrintedPages:Array.from({length:227},(_,i)=>i+48),scopeNote:'All main commentary QT001–060, four connecting sections, and the concluding discussion are translated continuously within the consulted sources. The full authorial introduction is available in commentary.html, in a separate source edition.'};
 }
 function openFull(event){event.preventDefault();event.stopImmediatePropagation();location.assign('commentary.html');}
 const start=document.getElementById('start-sharh');if(start)start.addEventListener('click',openFull,true);
 const switcher=document.querySelector('[data-layer="sharh"]');if(switcher)switcher.addEventListener('click',openFull,true);
})();
