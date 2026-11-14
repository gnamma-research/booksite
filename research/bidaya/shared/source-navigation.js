(()=>{
 const params=new URLSearchParams(location.search),edition=params.get('edition')==='human-life'?'human-life':'law',scope=params.get('scope')==='reservoir'?'reservoir':'pilot';
 const returnUrl=new URL('../'+edition+'/'+(scope==='reservoir'?'reservoir.html':''),location.href);
 const nav=document.createElement('nav');nav.className='source-edition-nav';nav.setAttribute('aria-label','Edition and sources');
 const back=document.createElement('a');back.href=returnUrl;back.textContent='← '+(edition==='law'?'Law and Legal Reasoning':'Law and Human Life');nav.append(back);
 for(const [id,label]of [['law','I · Law']]){const a=document.createElement('a');const u=new URL(location.href);u.searchParams.set('edition',id);a.href=u;a.dataset.sourceEdition=id;a.textContent=label;if(id===edition)a.setAttribute('aria-current','page');nav.append(a);}
 document.body.prepend(nav);
 // Restore exact page positions when switching editions within the shared viewer.
 if(typeof sourceUnit!=='undefined'){
  for(const lang of ['ar','en']){const page=Number(params.get('page-'+lang));if(params.has('page-'+lang)&&Number.isInteger(page)&&page>=0&&page<sourceUnit[lang].pages.length){sourceState.get(sourceUnit.id)[lang]=page;updateSourcePane(lang);}const zoom=params.get('zoom-'+lang);const control=document.querySelector('#pane-'+lang+' [data-zoom]');if(zoom&&[...control.options].some(o=>o.value===zoom)){control.value=zoom;control.dispatchEvent(new Event('change'));}}
  const layout=params.get('layout');if(['ar','en','both'].includes(layout)){chosenSourceLayout=true;setSourceLayout(layout);}
  nav.addEventListener('click',e=>{const a=e.target.closest('[data-source-edition]');if(!a)return;const u=new URL(a.href);for(const lang of ['ar','en']){u.searchParams.set('page-'+lang,sourceState.get(sourceUnit.id)[lang]);u.searchParams.set('zoom-'+lang,document.querySelector('#pane-'+lang+' [data-zoom]').value);}u.searchParams.set('layout',document.getElementById('source-panes').dataset.layout);a.href=u;});
 }
 function fixLinks(){for(const a of document.querySelectorAll('a[href]')){if(a.closest('.source-edition-nav'))continue;const u=new URL(a.href,location.href);if(u.origin!==location.origin)continue;if(/\/bidaya\/(law|human-life)\//.test(u.pathname))u.pathname=u.pathname.replace(/\/bidaya\/(law|human-life)\//,'/bidaya/'+edition+'/');a.href=u;}}
 fixLinks();new MutationObserver(fixLinks).observe(document.body,{childList:true,subtree:true});
 addEventListener('hashchange',()=>{for(const a of nav.querySelectorAll('[data-source-edition]')){const u=new URL(location.href);u.searchParams.set('edition',a.dataset.sourceEdition);a.href=u;}});
})();
