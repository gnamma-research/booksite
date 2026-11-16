(()=>{'use strict';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const quote=s=>s.replace(/[.*+?^$()|[\]{}\\]/g,'\\$&');
const dialog=document.createElement('dialog');dialog.id='person-context-dialog';dialog.className='person-context-dialog';dialog.setAttribute('aria-label','Person or community context');document.body.appendChild(dialog);let people=new Map();
function nodeTextMatch(container,names){const nodes=[],walk=document.createTreeWalker(container,NodeFilter.SHOW_TEXT);let node;while(node=walk.nextNode()){if(!node.nodeValue.trim())continue;const par=node.parentElement;if(par.closest('a,button,sup,script,style,.scholar-source-notes'))continue;nodes.push(node)}
for(const alias of names){if(alias.length<4||/^(?:community|Islam|Muslim|Prophet)$/i.test(alias))continue;const re=new RegExp('(^|[^\\p{L}\\p{M}])('+quote(alias)+')(?=$|[^\\p{L}\\p{M}])','iu');for(const textNode of nodes){const match=re.exec(textNode.nodeValue);if(!match)continue;return {node:textNode,start:match.index+match[1].length,length:match[2].length}}}return null}
function decorate(d){for(const person of d.entries){const names=[...person.aliases].sort((a,b)=>b.length-a.length);for(const occ of person.appearances||[]){const target=document.getElementById(occ.anchor);if(!target)continue;const found=nodeTextMatch(target,names);if(!found)continue;const {node,start,length}=found;if(start<0||length<1)continue;const matched=node.splitText(start);matched.splitText(length);const a=document.createElement('a');a.href='people.html#person-'+encodeURIComponent(person.id);a.className='person-ref';a.dataset.personId=person.id;a.title='Who is '+person.name+'?';a.setAttribute('aria-label','About '+person.name);a.textContent=matched.nodeValue;matched.parentNode.replaceChild(a,matched)}}}
function open(person,trigger){const paragraph=trigger.closest('p'),anchor=paragraph?.id||location.hash.slice(1)||document.querySelector('[data-chapter-link][aria-current="location"]')?.dataset.chapterLink||trigger.closest('article.chapter')?.id||'ch-01';const base=location.pathname.split('/').pop();const valid=/^read(?:-preview-1\.9\.0|-restored-1\.8\.0|-1\.7\.0)?\.html$/.test(base)?base:'read.html';const safe=valid+'#'+anchor;try{sessionStorage.setItem('gnamma-seerah-return',safe)}catch{}
const full='people.html?return='+encodeURIComponent(safe)+'#person-'+encodeURIComponent(person.id);const references=(person.appearances||[]).slice(0,7).map(v=>'<a href="'+valid+'#'+esc(v.anchor)+'">Ch. '+v.chapter+' · '+(v.layer==='matn'?'matn':'sharḥ')+'</a>').join(' ');
dialog.innerHTML='<div class="person-context-head"><h2>'+esc(person.name)+'</h2><button type="button" data-close-person aria-label="Close person context">×</button></div><p class="person-context-role">'+esc(person.role)+'</p><p>'+esc(person.bio)+'</p>'+(person.source?'<p class="person-context-source">Background source: '+esc(person.source)+'</p>':'')+'<div class="person-context-links"><a href="'+full+'">Full profile and relationships</a>'+references+'</div><p class="person-context-muted">Close this card to return to the exact passage.</p>';
if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');dialog.querySelector('[data-close-person]').focus()}
document.addEventListener('click',e=>{const link=e.target.closest('a[data-person-id]');if(link){const person=people.get(link.dataset.personId);if(person){e.preventDefault();open(person,link)}}if(e.target.closest('[data-close-person]')||e.target===dialog){dialog.close?.();dialog.removeAttribute('open')}});

function addChapterCast(data){
 const groupNames=new Map(data.groups.map(g=>[g.id,g.name]));
 for(const article of document.querySelectorAll('article.chapter')){
  const chapter=Number(article.dataset.chapterPosition);
  const groupList=new Map();
  for(const person of data.entries){
   if(!(person.appearances||[]).some(o=>o.chapter===chapter))continue;
   const set=groupList.get(person.group)||[];set.push(person);groupList.set(person.group,set);
  }
  const count=[...groupList.values()].reduce((n,x)=>n+x.length,0);
  if(!count)continue;
  const details=document.createElement('details');details.className='chapter-cast';
  const groupHTML=[...groupList.entries()].map(([group,items])=>'<p class="chapter-cast-label">'+esc(groupNames.get(group)||group)+'</p><div class="chapter-cast-links">'+items.map(p=>'<a data-person-id="'+esc(p.id)+'" title="'+esc(p.role)+'" href="people.html#person-'+esc(p.id)+'">'+esc(p.name)+'</a>').join('')+'</div>').join('');
  details.innerHTML='<summary>People in this chapter <span>('+count+' people and groups)</span></summary><div class="chapter-cast-body">'+groupHTML+'<p class="chapter-cast-help">Open any name for its role and relationships, or explore the <a href="people.html">complete name index</a>.</p></div>';
  const bottom=article.querySelector('.chapter-bottom');if(bottom)bottom.before(details);else article.append(details);
 }
}
document.addEventListener('click',e=>{
 const link=e.target.closest('a[href]');if(!link||link.dataset.personId)return;
 const u=new URL(link.href,location.href);
 if(u.origin!==location.origin||!/(?:^|\/)(?:people|subjects|geography|chronology)\.html$/.test(u.pathname))return;
 const srcFile=location.pathname.split('/').pop()||'read.html';
 const good=/^read(?:-preview-1\.9\.0|-restored-1\.8\.0|-1\.7\.0)?\.html$/.test(srcFile)?srcFile:'read.html';
 const target=location.hash.slice(1)||document.querySelector('[data-chapter-link][aria-current="location"]')?.dataset.chapterLink||'ch-01';
 const ret=good+'#'+target;u.searchParams.set('return',ret);link.href=u.href;
 try{sessionStorage.setItem('gnamma-seerah-return',ret)}catch{}
},true);

fetch('data/people.json').then(r=>{if(!r.ok)throw Error('People reference index unavailable');return r.json()}).then(data=>{people=new Map(data.entries.map(e=>[e.id,e]));decorate(data);addChapterCast(data)}).catch(()=>{});
})();