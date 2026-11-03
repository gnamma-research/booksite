/* Stable citation anchors, source notes in continuous reading, and restoration. */
(function(){'use strict';const api=window.TahdhibNative,c=window.TAHDHIB_CONFIG;if(!api)return;
 const by=new Map(api.book.sections.map(s=>[String(s.id),s]));
 let scheduled=false;
 function enhance(){
  const root=document.getElementById('reader');if(!root)return;
  for(const row of root.querySelectorAll('.passage-grid')){
   const sec=by.get(row.closest('[data-reading-section]')?.dataset.readingSection||String(api.state.n));
   const seg=sec?.segments[Number(row.dataset.segment)];if(!seg)continue;
   row.id='u-'+seg.unitId.replace(/[^a-zA-Z0-9-]/g,'-');row.dataset.unitId=seg.unitId;
  }
  for(const block of root.querySelectorAll('[data-reading-section]')){
   const sec=by.get(block.dataset.readingSection);if(!sec||block.querySelector('.th-apparatus-access'))continue;
   if(sec.noteIds.length){const b=document.createElement('button');b.type='button';b.className='th-apparatus-access';b.textContent='Source notes · '+sec.noteIds.length;
    b.addEventListener('click',()=>{api.state.n=String(sec.id);api.renderRoute('study');});block.append(b);}
  }
 }
 function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;enhance();});}
 new MutationObserver(schedule).observe(document.getElementById('mainContent'),{childList:true,subtree:true});enhance();
 const progressKey=c.namespace+'-position';let initial=true,restoring=false;
 const safeRead=()=>{try{return JSON.parse(localStorage.getItem(progressKey)||'null')}catch{return null}};
 function restore(){
  let p=c.initial;if(!p&&!location.hash)p=safeRead();if(!p){initial=false;return;}
  restoring=true;const sec=by.get(String(p.section));if(!sec){initial=false;restoring=false;return;}
  api.goSection(String(p.section));
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   enhance();const id=sec.segments[Number(p.segment)||0]?.unitId;
   const e=id&&document.getElementById('u-'+id.replace(/[^a-zA-Z0-9-]/g,'-'));
   if(e){e.scrollIntoView({block:'start',behavior:'instant'});if(Number.isFinite(p.offset))scrollBy(0,-p.offset);}
   setTimeout(()=>{initial=false;restoring=false;},100);
  }));
 }
 let pending=false;
 function saveNow(){if(initial||restoring||api.state.route!=='reader')return;
  let row=null;
  for(const r of document.querySelectorAll('#reader .passage-grid')){if(r.getBoundingClientRect().bottom>90){row=r;break;}}
  if(!row)return;const unit=row.dataset.unitId,loc=c.map[unit];if(!loc)return;
  try{localStorage.setItem(progressKey,JSON.stringify({...loc,unitId:unit,offset:row.getBoundingClientRect().top}));}catch{}
 }
 function save(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;saveNow();});}
 window.addEventListener('scroll',save,{passive:true});window.addEventListener('pagehide',saveNow);
 restore();document.documentElement.dataset.tahdhibNative='20261103-native1';
})();
