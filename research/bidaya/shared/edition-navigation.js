// The source identifiers remain those of the original reader. Edition switches
// retain the study, paragraph, selected legal perspective, and open primary card.
(()=>{
 const edition=document.body.dataset.edition,scope=document.body.dataset.scope;
 const params=new URLSearchParams(location.search);
 function destination(next){
  const u=new URL('../'+next+'/'+(scope==='reservoir'?'reservoir.html':''),location.href);
  const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));
  const study=document.body.dataset.activeStudy||target?.closest('[data-study]')?.dataset.study;
  u.hash=location.hash||(study?'#'+study:'');
  if(study)u.searchParams.set('study',study);
  const perspectives=document.body.dataset.activePerspectives;
  if(perspectives){const keys=perspectives.split(',').filter(k=>next!=='law'||['principles','scripture'].includes(k));if(keys.length)u.searchParams.set('perspectives',keys.join(','));else u.searchParams.set('fromPerspective',perspectives);}
  else if(next==='human-life'&&study===params.get('study')&&params.get('fromPerspective'))u.searchParams.set('perspectives',params.get('fromPerspective'));
  if(typeof rushdOrigin!=='undefined'&&rushdOrigin)u.searchParams.set('primary',rushdOrigin.dataset.primaryText);
  return u;
 }
 function updateLinks(){document.querySelectorAll('[data-edition-switch]').forEach(a=>{a.href=destination(a.dataset.editionSwitch);});}
 document.addEventListener('click',e=>{const a=e.target.closest('[data-edition-switch]');if(a)a.href=destination(a.dataset.editionSwitch);},true);
 addEventListener('hashchange',updateLinks);updateLinks();
 const study=params.get('study');const selected=params.get('perspectives');
 if(study&&selected&&study===document.body.dataset.activeStudy&&window.bidayaOpenPerspective)window.bidayaOpenPerspective(study,selected.split(','));
 updateLinks();
 function showScopeNotice(){
  let target;try{target=document.getElementById(decodeURIComponent(location.hash.slice(1)))}catch{}
  const other=target?.matches('[data-other-edition]')||target?.closest('[data-other-edition]');
  document.getElementById('edition-context')?.remove();
  if(edition==='law'&&(other||(params.get('fromPerspective')&&params.get('study')===document.body.dataset.activeStudy))){const n=document.createElement('p');n.id='edition-context';n.className='edition-context';n.textContent='The legal account is shown here. The selected interpretive passage belongs to Edition II. ';const a=document.createElement('a');a.textContent='Read that passage in Law and Human Life';a.href=destination('human-life');n.append(a);document.querySelector('main').prepend(n);}
 }
 showScopeNotice();addEventListener('hashchange',showScopeNotice);
 if(params.get('primary')){const link=[...document.querySelectorAll('[data-primary-text]')].find(x=>x.dataset.primaryText===params.get('primary'));link?.click();}
 // Carry the current edition and scope into the shared source workspaces,
 // including links produced inside dialogs after the initial load.
 document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a)return;const u=new URL(a.href,location.href);if(u.origin===location.origin&&u.pathname.includes('/bidaya/shared/')&&u.pathname.endsWith('.html')){u.searchParams.set('edition',edition);u.searchParams.set('scope',scope);a.href=u;}},true);
})();
