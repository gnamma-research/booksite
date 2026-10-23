/* Reader-local Back / Forward / Recent interface.
   The section picker retains its existing part browsing and live title search. */
(function(root){
'use strict';
function install(ctx){
 if(!root.GnammaNavigationHistory||!ctx?.sections)return null;
 const model=root.GnammaNavigationHistory.create({
  storage:root.localStorage,
  validSection:id=>ctx.sections.has(String(id))
 });
 const doc=root.document, dock=doc.getElementById('readerDock');
 if(!dock)return null;
 const chip=doc.createElement('div');
 chip.id='gn-reading-history-float';chip.className='gn-history-float';
 chip.hidden=true;chip.setAttribute('role','group');chip.setAttribute('aria-label','Reading location history');
 doc.body.appendChild(chip);
 let displayUntil=0,hideTimer=0,cleared=false;
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const ref=p=>p.section==='colophon'?'Colophon':'§'+p.section;
 const where=p=>ref(p)+(p.anchor?.segment!==undefined?' · ¶'+(Number(p.anchor.segment)+1):'');
 const title=p=>ctx.sections.get(String(p.section))?.title||ref(p);
 const canDisplay=()=>ctx.state.route==='reader'&&!dock.hidden&&!doc.querySelector('.gn-source-return');
 function align(){
  const rect=dock.getBoundingClientRect(),height=root.innerHeight||doc.documentElement.clientHeight;
  chip.style.bottom=Math.max(12,height-rect.top+8)+'px';
  chip.style.right=Math.max(10,(root.innerWidth||doc.documentElement.clientWidth)-rect.right+2)+'px';
 }
 function updateChip(){
  const previous=model.previous(),next=model.next();
  if(!canDisplay()||!previous&&!next||Date.now()>displayUntil){chip.hidden=true;return;}
  let buttons='';
  if(previous)buttons+='<button type="button" data-history-nav="back" aria-label="Back to '+esc(where(previous))+'" title="'+esc(title(previous))+'"><span class="gn-history-arrow" aria-hidden="true">↶</span><span>Back to '+esc(where(previous))+'</span></button>';
  if(next)buttons+='<button type="button" data-history-nav="forward" aria-label="Forward to '+esc(where(next))+'" title="'+esc(title(next))+'"><span>Forward to '+esc(where(next))+'</span><span class="gn-history-arrow" aria-hidden="true">↷</span></button>';
  chip.innerHTML=buttons;chip.hidden=false;align();
 }
 function hideIdle(){
  if(chip.matches(':hover,:focus-within')){hideTimer=setTimeout(hideIdle,1600);return;}
  displayUntil=0;chip.hidden=true;
 }
 function reveal(){
  displayUntil=Date.now()+12000;clearTimeout(hideTimer);updateChip();
  hideTimer=setTimeout(hideIdle,12000);
 }
 function positionAfterRoute(){root.requestAnimationFrame(()=>{if(Date.now()<displayUntil)updateChip();else chip.hidden=true;});}
 function renderPicker(){
  const controls=doc.getElementById('jumpHistoryControls'),recent=doc.getElementById('jumpRecent');
  if(!controls||!recent)return;
  const previous=model.previous(),next=model.next();
  controls.hidden=!previous&&!next;
  let buttons='';
  if(previous)buttons+='<button type="button" data-history-nav="back">↶ Back to '+esc(where(previous))+'</button>';
  if(next)buttons+='<button type="button" data-history-nav="forward">Forward to '+esc(where(next))+' ↷</button>';
  controls.innerHTML=buttons;
  const items=model.recentList().slice(0,16);
  recent.hidden=!items.length;
  if(!items.length)return;
  const count=recent.querySelector('[data-history-count]');
  if(count)count.textContent=' ('+items.length+(model.recentList().length>16?'+':'')+')';
  const list=doc.getElementById('jumpRecentList');
  if(list)list.innerHTML=items.map((p,i)=>'<button type="button" data-history-visit="'+i+'" title="'+esc(title(p))+'"><span class="gn-history-number">'+esc(where(p))+'</span><span class="gn-history-title">'+esc(title(p))+'</span></button>').join('');
 }
 function moveTo(point){
  if(!point)return;
  cleared=false;
  ctx.navigateTo(point);
  reveal();
 }
 function direction(which){
  const snapshot=ctx.snapshot();
  const point=which==='back'?model.back(snapshot):model.forward(snapshot);
  if(point)moveTo(point);
  return Boolean(point);
 }
 function visit(index){
  const point=model.recentVisit(index,ctx.snapshot());
  if(point)moveTo(point);
  return Boolean(point);
 }
 // Only explicit section selection creates a new trail entry. Normal scrolling
 // and the existing adjacent-section arrows are not history entries.
 doc.addEventListener('click',event=>{
  const target=event.target.closest?.('[data-section]');
  if(!target||!target.closest('#jumpResults,#mainContent,#searchOverlay,#infoOverlay,#gn-scholar-layer'))return;
  const to=String(target.dataset.section||'');
  if(!ctx.sections.has(to)||to===String(ctx.state.n))return;
  const from=ctx.snapshot();
  if(from&&model.record(from,{section:to,y:0,anchor:null})){cleared=false;reveal();}
 },true);
 function handleAction(event){
  const button=event.target.closest?.('[data-history-nav],[data-history-visit],[data-history-clear]');
  if(!button)return;
  event.preventDefault();event.stopPropagation();
  if(button.dataset.historyNav){direction(button.dataset.historyNav);return;}
  if(button.dataset.historyVisit!==undefined){visit(Number(button.dataset.historyVisit));return;}
  if(button.hasAttribute('data-history-clear')&&root.confirm('Clear recent reading locations? Your Reading Desk bookmarks and notes will not be affected.')){
   model.clear();cleared=true;chip.hidden=true;displayUntil=0;renderPicker();
  }
 }
 chip.addEventListener('click',handleAction);
 doc.getElementById('jumpOverlay')?.addEventListener('click',handleAction);
 root.addEventListener('resize',align,{passive:true});
 model.observe(()=>{if(!cleared)renderPicker();updateChip();});
 const api={
  renderPicker,afterRoute:positionAfterRoute,
  exportData:()=>model.exportData(),
  importData:payload=>{const count=model.importData(payload);if(count)renderPicker();return count;},
  clear:()=>{model.clear();chip.hidden=true;renderPicker();},
  status:()=>model.status(),
  back:()=>direction('back'),forward:()=>direction('forward')
 };
 root.GnammaReadingHistory=api;
 return api;
}
root.GnammaNavigationBridge={install};
})(typeof window==='undefined'?globalThis:window);
