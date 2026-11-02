(()=>{'use strict';
const corpus=window.GNAMMA_CRITICAL_CORPUS;if(!corpus||!Array.isArray(corpus.units))return;
const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
const units=corpus.units,byPage=new Map(),pending=new Set(corpus.pending_pages||[]),MIN=corpus.start_page||15,MAX=corpus.end_page||127;
for(const u of units){if(!byPage.has(u.page))byPage.set(u.page,[]);byPage.get(u.page).push(u)}
const storageKey='gnamma-tahdhib-reader-v2-'+(corpus.navigation_kind||'kalam');const preferences=()=>{try{return JSON.parse(localStorage.getItem(storageKey)||'{}')}catch{return {}}};
const saved=preferences(),state={page:Math.max(MIN,Math.min(MAX,Number(saved.page)||MIN)),view:saved.view||'both',scope:saved.scope||'page',font:Number(saved.font)||1,theme:saved.theme||'light',focus:Number(saved.focus)||0,previousScope:saved.previousScope||'page',query:'',bookmarks:new Set(saved.bookmarks||[])};
const store=()=>{try{localStorage.setItem(storageKey,JSON.stringify({...state,bookmarks:[...state.bookmarks]}))}catch{}};
const norm=s=>(s||'').toLocaleLowerCase().normalize('NFKD').replace(/[\u064b-\u065f\u0670\u0640]/g,'').replace(/ـ/g,'');
const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e};
const cap=n=>String(n).padStart(corpus.navigation_kind==='division'?2:3,'0');const isDivision=corpus.navigation_kind==='division';const locationLabel=isDivision?'Editorial division':'1912 printed page';const unitLabel=corpus.unit_type||'aligned clauses';
const idFor=u=>'u-'+u.id.replace(/[^a-zA-Z0-9-]/g,'-');
const sourceText=p=>isDivision?'Line-by-line and formal logical validation outstanding':pending.has(p)?'Textual questions remain on this page; second witness required':'Cairo 1912 single-print source check recorded';
function applySettings(){document.documentElement.dataset.theme=state.theme;document.body.dataset.focus=state.focus;const fb=$('#focus');if(fb){const labels=['Normal','Focus · notes','Focus · text','Focus · continuous'];fb.innerHTML='◎ <span>'+labels[state.focus]+'</span>';fb.title=labels[state.focus];fb.setAttribute('aria-pressed',String(state.focus>0))}document.documentElement.style.setProperty('--reader-scale',String(state.font));const r=$('#passages');r.className='passages view-'+state.view;$$('[data-view]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.view===state.view)));$$('[data-scope]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.scope===state.scope)));$('#theme').title='Appearance: '+state.theme}
function article(u){
 const a=el('article','clause');a.id=idFor(u);a.dataset.page=u.page;
 const head=el('div','clause-bar');const anchor=el('a','clause-anchor',u.id);anchor.href='#'+a.id;anchor.title='Permanent citation link';
 const actions=el('div','clause-actions');const star=el('button','icon-action',state.bookmarks.has(u.id)?'★':'☆');star.title='Bookmark clause';star.setAttribute('aria-label','Bookmark '+u.id);star.setAttribute('aria-pressed',String(state.bookmarks.has(u.id)));star.addEventListener('click',()=>{if(state.bookmarks.has(u.id))state.bookmarks.delete(u.id);else state.bookmarks.add(u.id);star.textContent=state.bookmarks.has(u.id)?'★':'☆';star.setAttribute('aria-pressed',String(state.bookmarks.has(u.id)));store();renderNav()});
 const cite=el('button','icon-action','⧉');cite.title='Copy citation';cite.setAttribute('aria-label','Copy citation for '+u.id);cite.addEventListener('click',async()=>{const c='al-Taftāzānī, '+corpus.work+', '+(isDivision?'editorial division ':'Cairo 1330/1912, p. ')+u.page+', '+u.id+' (Gnamma working edition)';try{await navigator.clipboard.writeText(c);cite.textContent='✓';setTimeout(()=>cite.textContent='⧉',1200)}catch{prompt('Copy citation',c)}});
 actions.append(star,cite);head.append(anchor,actions);a.append(head);
 if(u.title){a.append(el('h3','division-title',u.title));if(u.source_location)a.append(el('p','division-source','Witness source pages: '+u.source_location))}
 const wrap=el('div','aligned');const en=el('div','english');en.lang='en';en.append(el('p',null,u.en));const ar=el('div','arabic');ar.lang='ar';ar.dir='rtl';ar.append(el('p',null,u.ar));wrap.append(en,ar);a.append(wrap);
 if(u.editorial_note||u.notes?.length){const det=el('details','editorial-note'),sum=el('summary',null,'Editorial / explanatory notes');det.append(sum);if(u.editorial_note)det.append(el('p',null,u.editorial_note));for(const note of u.notes||[]){const p=el('p');p.append(el('strong',null,(note.type||'Note')+': '),document.createTextNode(note.text||''));det.append(p)}a.append(det)}
 return a
}
function pageBlock(p,arr){
 const s=el('section','printed-page');s.id='page-'+p;
 const heading=el('div','printed-heading');const left=el('div');left.append(el('span','page-kicker',isDivision?'LOGIC / EDITORIAL STRUCTURE':'1912 / CAIRO'),el('h2',null,(isDivision?'Division ':'Printed page ')+p));
 const right=el('span',pending.has(p)?'page-status unresolved':'page-status reviewed',sourceText(p));heading.append(left,right);s.append(heading);
 for(const issue of (corpus.open_issues||[]).filter(x=>x.page===p)){const d=el('details','source-issue'),summary=el('summary',null,'Unresolved textual issue · '+issue.ids.join(', '));d.append(summary,el('p',null,issue.issue));if(issue.parallel){const a=el('a',null,'Compare authorial parallel ↗');a.href=issue.parallel;a.target='_blank';a.rel='noopener noreferrer';d.append(a,el('p','parallel-caveat',issue.parallel_role||'Not a textual witness'))}s.append(d)}
 for(const u of arr)s.append(article(u));return s
}
let lastFocus=null;
function render(){
 applySettings();const body=$('#passages');const frag=document.createDocumentFragment();let n=0;
 const groups=state.scope==='continuous'?[...byPage.entries()]:[[state.page,byPage.get(state.page)||[]]];
 for(const [p,arr] of groups){frag.append(pageBlock(p,arr));n+=arr.length}
 body.replaceChildren(frag);$('#page-number').textContent=state.scope==='continuous'?(MIN+'–'+MAX):state.page;
 $('#visible-count').textContent=n+' '+unitLabel+' · '+(state.scope==='continuous'?(MAX-MIN+1)+' '+(isDivision?'divisions':'printed pages'):(isDivision?'division ':'p. ')+state.page);
 const dis=state.scope==='continuous';for(const name of ['previous','bottom-prev'])$('#'+name).disabled=dis||state.page===MIN;for(const name of ['next','bottom-next'])$('#'+name).disabled=dis||state.page===MAX;
 renderNav();updateDock();
 if(lastFocus){const focus=lastFocus;lastFocus=null;requestAnimationFrame(()=>$('#'+CSS.escape(focus))?.scrollIntoView({block:'start'}))}
}
function renderNav(){
 const list=$('#page-list');list.replaceChildren();const frag=document.createDocumentFragment();
 for(let p=MIN;p<=MAX;p++){const b=el('button','page-item'+(p===state.page&&state.scope==='page'?' active':'')+(pending.has(p)?' pending':''));b.dataset.page=p;
 const n=el('span','page-number',cap(p));const ct=el('span','page-count',isDivision?'L'+cap(p):(byPage.get(p)||[]).length+' clauses');b.append(n,ct);
 if(pending.has(p)){b.append(el('span','page-alert','•'));b.title='Source question remains'}if((byPage.get(p)||[]).some(u=>state.bookmarks.has(u.id)))b.append(el('span','bookmarked','★'));
 b.addEventListener('click',()=>go(p));frag.append(b)}list.append(frag)
}
function go(p,target){state.page=Math.max(MIN,Math.min(MAX,Number(p)||MIN));store();const hash=target?'#'+target:'#page='+state.page;history.replaceState(null,'',hash);
 if(state.scope==='continuous'){renderNav();updateDock();requestAnimationFrame(()=>document.getElementById(target||'page-'+state.page)?.scrollIntoView({block:'start',behavior:'smooth'}))}
 else{lastFocus=target||'page-'+state.page;render()}$('#contents').classList.remove('shown');$('#open-contents')?.setAttribute('aria-expanded','false')}
function updateDock(){const prev=$('#dock-prev'),next=$('#dock-next'),current=$('#dock-current');if(!prev||!next||!current)return;prev.disabled=state.page===MIN;next.disabled=state.page===MAX;$('#dock-prev-num').textContent=state.page>MIN?(isDivision?'L'+cap(state.page-1):String(state.page-1)):'·';$('#dock-next-num').textContent=state.page<MAX?(isDivision?'L'+cap(state.page+1):String(state.page+1)):'·';const first=(byPage.get(state.page)||[])[0];current.textContent=(isDivision?'Logic · L'+cap(state.page):'Kalām · Cairo p. '+state.page)+(isDivision&&first?.title?' · '+first.title:'');current.title='Open the page navigator'}
$('#dock-prev')?.addEventListener('click',()=>go(state.page-1));$('#dock-next')?.addEventListener('click',()=>go(state.page+1));$('#dock-current')?.addEventListener('click',()=>{$('#contents').classList.add('shown');$('#search').focus()});
let scrollPending=false;window.addEventListener('scroll',()=>{if(state.scope!=='continuous'||scrollPending)return;scrollPending=true;requestAnimationFrame(()=>{scrollPending=false;const heads=$('#passages .printed-page');let page=MIN;for(const h of heads){if(h.getBoundingClientRect().top<185)page=Number(h.dataset.page||h.id.replace('page-',''));else break}if(page!==state.page){state.page=page;updateDock()}})},{passive:true});
function search(){
 const q=norm(state.query.trim()),box=$('#search-results');box.replaceChildren();if(!q)return;
 const hits=units.filter(u=>norm(u.ar).includes(q)||norm(u.en).includes(q)||norm(u.id).includes(q));const info=el('div','search-info',hits.length+' matching clauses');box.append(info);
 for(const u of hits.slice(0,100)){const b=el('button','search-hit');const text=(norm(u.ar).includes(q)?u.ar:u.en).slice(0,90);b.append(el('strong',null,u.id),el('span',null,text));b.addEventListener('click',()=>go(u.page,idFor(u)));box.append(b)}
 if(hits.length>100)box.append(el('p','search-info','Showing first 100 matches. Narrow your query.'));
}
function toggleScope(scope){state.scope=scope;if(state.focus===3&&scope!=='continuous')state.focus=0;store();render()}
function hashState(){const h=decodeURIComponent(location.hash.slice(1));if(/^page=\d+$/.test(h))return{page:Number(h.split('=')[1])};if(h.startsWith('u-')){const id=units.find(u=>idFor(u)===h);if(id)return{page:id.page,target:h}}return null}
$$('[data-view]').forEach(b=>b.addEventListener('click',()=>{state.view=b.dataset.view;store();applySettings()}));
$$('[data-scope]').forEach(b=>b.addEventListener('click',()=>toggleScope(b.dataset.scope)));
$('#previous').addEventListener('click',()=>go(state.page-1));$('#next').addEventListener('click',()=>go(state.page+1));
$('#bottom-prev').addEventListener('click',()=>go(state.page-1));$('#bottom-next').addEventListener('click',()=>go(state.page+1));
$('#smaller').addEventListener('click',()=>{state.font=Math.max(.8,Math.round((state.font-.1)*10)/10);store();applySettings()});
$('#larger').addEventListener('click',()=>{state.font=Math.min(1.6,Math.round((state.font+.1)*10)/10);store();applySettings()});
$('#theme').addEventListener('click',()=>{state.theme={light:'dark',dark:'sepia',sepia:'light'}[state.theme]||'light';store();applySettings()});
$('#focus')?.addEventListener('click',()=>{const was=state.focus;state.focus=(state.focus+1)%4;if(was!==3&&state.focus===3){state.previousScope=state.scope;state.scope='continuous'}else if(was===3){state.scope=state.previousScope||'page'}store();render()});
$('#search').addEventListener('input',e=>{state.query=e.target.value;search()});
$('#open-contents').addEventListener('click',()=>{$('#contents').classList.add('shown');$('#open-contents').setAttribute('aria-expanded','true');$('#search').focus()});
$('#close-contents').addEventListener('click',()=>$('#contents').classList.remove('shown'));
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#contents').classList.add('shown');$('#search').focus()}if(e.key==='Escape'){$('#contents').classList.remove('shown');$('#export-modal').hidden=true}if(e.target.matches('input, textarea'))return;if(e.key==='ArrowLeft'&&!e.ctrlKey&&!e.metaKey&&state.scope==='page')go(state.page-1);if(e.key==='ArrowRight'&&!e.ctrlKey&&!e.metaKey&&state.scope==='page')go(state.page+1)});
window.addEventListener('hashchange',()=>{const s=hashState();if(s)go(s.page,s.target)});
const modal=$('#export-modal');$('#export').addEventListener('click',()=>{modal.hidden=false;$('#export-close').focus()});$('#export-close').addEventListener('click',()=>modal.hidden=true);modal.addEventListener('click',e=>{if(e.target===modal)modal.hidden=true});
function download(name,mime,text){const obj=new Blob([text],{type:mime}),url=URL.createObjectURL(obj),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}
function quote(s){return '"'+String(s??'').replace(/"/g,'""')+'"'}
$$('[data-export]').forEach(b=>b.addEventListener('click',()=>{const v=b.dataset.export;
 if(v==='json')download('tahdhib-'+(isDivision?'logic':'kalam')+'-working-corpus.json','application/json;charset=utf-8',JSON.stringify(corpus,null,2));
 if(v==='csv')download('tahdhib-'+(isDivision?'logic':'kalam')+'-clauses.csv','text/csv;charset=utf-8','id,printed_page,arabic,english,status\r\n'+units.map(u=>[u.id,u.page,u.ar,u.en,u.status].map(quote).join(',')).join('\r\n'));
 if(v==='text')download('tahdhib-'+(isDivision?'logic':'kalam')+'-english.txt','text/plain;charset=utf-8',corpus.work+' · English Working Edition\nIndependent collation outstanding\n\n'+units.map(u=>u.id+' [p. '+u.page+']\n'+u.en).join('\n\n'));
 if(v==='print'){modal.hidden=true;state.scope='continuous';render();requestAnimationFrame(()=>requestAnimationFrame(()=>window.print()))}
 else modal.hidden=true
}));
window.addEventListener('afterprint',()=>{state.scope=preferences().scope||'page';render()});
const initial=hashState();if(initial){state.page=initial.page;lastFocus=initial.target||'page-'+initial.page}render();search();
})();