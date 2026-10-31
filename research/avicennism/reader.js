(function(){'use strict';const V=window.AVR;if(!V||!V.pages){document.getElementById('main').textContent='Reader application files are missing.';return;}const P=V.pages,$=V.$,$$=V.$$;
function navState(){const mobile=window.matchMedia('(max-width:860px)').matches;const open=mobile?document.body.classList.contains('nav-open'):!document.body.classList.contains('nav-collapsed')&&V.saved.prefs.mode!=='focus';$('[data-action=menu]').setAttribute('aria-expanded',String(open));$('#scrim').hidden=!(mobile&&open);if(mobile&&!open)$('#navigation').setAttribute('inert','');else $('#navigation').removeAttribute('inert');}
function closeMenu(){document.body.classList.remove('nav-open');navState();}
function toggleMenu(){if(V.saved.prefs.mode==='focus'){V.saved.prefs.mode='reading';V.save();V.colors();}if(window.matchMedia('(max-width:860px)').matches)document.body.classList.toggle('nav-open');else document.body.classList.toggle('nav-collapsed');navState();}
function closePanel(){if($('#panel').open)$('#panel').close();}
function currentBookmark(){const active=V.bookmarked();const b=$('[data-action=bookmark]');b.setAttribute('aria-pressed',String(active));b.title=active?'Remove bookmark':'Bookmark this reading';}
function activeNav(route){const first=route.split('/')[0],top=first==='full'?'texts':first;$$('#navigation [data-nav]').forEach(a=>{if(a.dataset.nav===top)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});}
function render(scroll=true){const route=V.route(),path=route.path,p=path.split('/');V.current=path+(route.query.toString()?'?'+route.query:'');$('#pager').hidden=true;$('#main').setAttribute('aria-busy','false');closeMenu();activeNav(path);
switch(p[0]){
case 'home':$('#main').innerHTML=P.home();break;
case 'contents':P.contents('contents');break;
case 'texts':P.contents('texts');break;
case 'chapters':P.contents('chapters');break;
case 'text':P.text(p[1],p[2]);break;
case 'full':P.full(p[1]);break;
case 'compare':if(p[1])P.compare(p[1],route.query);else $('#main').innerHTML=P.compareList();break;
case 'domains':$('#main').innerHTML=P.domainMap();break;
case 'domain':$('#main').innerHTML=P.domain(p[1]);break;
case 'witnesses':$('#main').innerHTML=P.witnesses();break;
case 'tradition':P.tradition();break;
case 'method':P.contextMethod();break;
case 'post-asfar':if(p[1])P.dossier(p[1]);else P.afterAsfar();break;
case 'tajrid-overlap':P.tajridOverlap();break;
case 'glossary':P.glossary();break;
case 'search':P.search(route.query.get('q')||'');break;
case 'desk':P.desk();break;
case 'downloads':$('#main').innerHTML=P.downloads();break;
case 'help':$('#main').innerHTML=P.help();break;
default:$('#main').innerHTML=P.home();
}
V.colors();V.track();currentBookmark();document.title=V.label(V.current)+' · Late Avicennism';if(scroll)window.scrollTo({top:0,behavior:'instant'});}
function quote(){const p=V.route().path.split('/'),r=V.byId.get(p[1]);if(!r){V.copy(location.href);return;}const s=V.sections(r)[Number(p[2])||0];V.copy(r.author+', '+r.work+', '+r.locus+', '+(s?s.title:'')+'. '+location.href);}
function selectedText(){try{return String(window.getSelection()?.toString()||'').trim();}catch{return '';}}
document.addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(!el)return;const a=el.dataset.action;if(!a)return;
if(a==='menu'){toggleMenu();return;}if(a==='close-menu'){closeMenu();return;}if(a==='close-panel'){closePanel();return;}
if(a==='search'){P.quickSearch();return;}if(a==='settings'){P.settings();return;}if(a==='focus'){V.saved.prefs.mode=V.saved.prefs.mode==='focus'?'reading':'focus';V.save();V.colors();navState();return;}
if(a==='ar'||a==='en'){const other=a==='ar'?'en':'ar';if(V.saved.prefs[a]&&!V.saved.prefs[other]){V.toast('At least one layer must remain visible.');return;}V.saved.prefs[a]=!V.saved.prefs[a];V.save();V.colors();return;}
if(a==='bookmark'||a==='mark'){V.bookmark();currentBookmark();if(V.route().path==='desk')P.desk();return;}
if(a==='share'){V.copy(location.href);return;}if(a==='copy-citation'){quote();return;}
if(a==='note'){P.note('');return;}if(a==='selection-note'){P.note(selectedText());return;}if(a==='save-note'){P.saveNote();return;}
if(a==='jump'){P.jump();return;}if(a==='print'){window.print();return;}
if(a==='export-json'){P.exportJSON();return;}if(a==='export-md'){P.exportMD();return;}if(a==='import-json'){$('#backup-file')?.click();return;}
if(a==='swap'){const route=V.route(),id=route.path.split('/')[1],left=$('#compare-left'),right=$('#compare-right');if(!left||!right)return;const old=route.query;location.hash=V.href('compare/'+id,{left:right.value,right:left.value,li:old.get('ri')||'',ri:old.get('li')||''});return;}
});
document.addEventListener('click',e=>{const t=e.target.closest('[data-remove-mark]');if(t){V.saved.marks.splice(Number(t.dataset.removeMark),1);V.save();P.desk();currentBookmark();}});
document.addEventListener('change',e=>{const t=e.target;if(t.dataset.pref){let v=t.value;if(t.dataset.pref==='size')v=Math.max(16,Math.min(29,Number(v)||19));V.saved.prefs[t.dataset.pref]=v;V.save();V.colors();const count=$('#size-count');if(count)count.textContent=v;}if(t.id==='backup-file')P.importBackup(t.files[0]);});
document.addEventListener('input',e=>{if(e.target.dataset.pref==='size'){const n=Math.max(16,Math.min(29,Number(e.target.value)||19));V.saved.prefs.size=n;V.colors();if($('#size-count'))$('#size-count').textContent=n;}});
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(a&&$('#panel').open&&$('#panel').contains(a))closePanel();});
document.addEventListener('click',e=>{const b=e.target.closest('[data-scroll-to]');if(!b)return;const id=b.dataset.scrollTo,target=document.getElementById(id);if(target){target.scrollIntoView({behavior:'smooth',block:'start'});}});
$('#scrim').addEventListener('click',closeMenu);window.addEventListener('resize',navState);
window.addEventListener('hashchange',()=>render());
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if($('#panel').open)closePanel();else closeMenu();return;}const tag=(e.target.tagName||'').toLowerCase();if(['input','select','textarea'].includes(tag)||e.ctrlKey||e.metaKey||e.altKey)return;if(e.key==='/'){e.preventDefault();P.quickSearch();}else if(e.key==='?'){e.preventDefault();location.hash='#help';}else if(e.key==='g'){e.preventDefault();location.hash='#contents';}else if(e.key==='ArrowRight'&&!$('#pager').hidden){location.hash=$('#next').getAttribute('href');}else if(e.key==='ArrowLeft'&&!$('#pager').hidden){location.hash=$('#prev').getAttribute('href');}});
$('#where').addEventListener('click',P.jump);
const q=window.matchMedia('(prefers-color-scheme: dark)');if(q.addEventListener)q.addEventListener('change',()=>{if(V.saved.prefs.theme==='system')V.colors();});
render();
})();