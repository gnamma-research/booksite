(function initReaderControls(){
'use strict';
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));const body=document.body;const K='gnamma-seerah-';
const get=(k)=>{try{return localStorage.getItem(K+k)}catch(e){return null}},set=(k,v)=>{try{localStorage.setItem(K+k,v)}catch(e){}};
function toast(msg){const e=$('#feedback');if(!e)return;e.textContent=msg;e.hidden=false;clearTimeout(window._seerahToast);window._seerahToast=setTimeout(()=>{e.hidden=true},3000);}
if(body.classList.contains('seerah-reader')){
 const modeBtns=$$('[data-mode]');const figureBtn=$('#figure-toggle');
 function mode(v){const value=v==='matn'?'matn':'both';body.classList.toggle('mode-matn',value==='matn');modeBtns.forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.mode===value));});set('mode',value);}
 mode(get('mode')||'both');modeBtns.forEach(b=>b.addEventListener('click',()=>mode(b.dataset.mode)));
 function figures(visible){body.classList.toggle('hide-figures',!visible);if(figureBtn){figureBtn.setAttribute('aria-pressed',String(visible));figureBtn.textContent=visible?'Figures: on':'Figures: off';}set('figures',visible?'1':'0');}
 figures(get('figures')!=='0');figureBtn?.addEventListener('click',()=>figures(body.classList.contains('hide-figures')));
 const sidebar=$('#chapter-sidebar'),toggle=$('#nav-toggle'),close=$('#nav-close'),scrim=$('#scrim');
 function drawer(v){body.classList.toggle('nav-open',v);toggle?.setAttribute('aria-expanded',String(v));if(v)$('#chapter-search')?.focus();}
 toggle?.addEventListener('click',()=>drawer(!body.classList.contains('nav-open')));close?.addEventListener('click',()=>drawer(false));scrim?.addEventListener('click',()=>drawer(false));document.addEventListener('keydown',e=>{if(e.key==='Escape')drawer(false)});
 const links=$$('[data-chapter-link]');links.forEach(a=>a.addEventListener('click',()=>drawer(false)));
 const search=$('#chapter-search');search?.addEventListener('input',()=>{const q=search.value.trim().toLocaleLowerCase();links.forEach(a=>{const hit=a.textContent.toLocaleLowerCase().includes(q);a.hidden=!hit;});$$('.chapter-sidebar h3').forEach(h=>{let sib=h.nextElementSibling,has=false;while(sib&&!['H3'].includes(sib.tagName)){if(sib.matches('[data-chapter-link]')&&!sib.hidden)has=true;sib=sib.nextElementSibling;}h.hidden=!has;});});
 const chapters=$$('article.chapter');const bookmarks=new Set((get('bookmarks')||'').split(',').filter(Boolean));const bmBtns=$$('[data-bookmark]');
 function reflectBookmark(){bmBtns.forEach(b=>{const saved=bookmarks.has(b.dataset.bookmark);b.setAttribute('aria-pressed',String(saved));b.textContent=saved?'★ Saved':'☆ Bookmark';});links.forEach(a=>{a.classList.toggle('saved-chapter',bookmarks.has(a.dataset.chapterLink));});}
 bmBtns.forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.bookmark;if(bookmarks.has(id))bookmarks.delete(id);else bookmarks.add(id);set('bookmarks',Array.from(bookmarks).join(','));reflectBookmark();toast(bookmarks.has(id)?'Bookmark saved on this device':'Bookmark removed');}));reflectBookmark();
 const bmFilter=$('#bookmarks-only');let filtered=false;bmFilter?.addEventListener('click',()=>{filtered=!filtered;bmFilter.setAttribute('aria-pressed',String(filtered));bmFilter.textContent=filtered?'Show all chapters':'Bookmarked only';links.forEach(a=>{a.hidden=filtered&&!bookmarks.has(a.dataset.chapterLink)});});
 let active=decodeURIComponent(location.hash.slice(1))||'ch-01';
 function activeChapter(id){if(!id.startsWith('ch-'))return;active=id;links.forEach(a=>{if(a.getAttribute('href')==='#'+id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});const bar=$('#chapter-position');const el=$('#'+id);if(bar&&el)bar.textContent=el.dataset.chapterPosition+' / '+chapters.length;set('last',id);}
 const obs=new IntersectionObserver(entries=>{const candidates=entries.filter(x=>x.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);if(candidates.length)activeChapter(candidates[0].target.id);},{rootMargin:'-10% 0px -67% 0px',threshold:0});chapters.forEach(c=>obs.observe(c));activeChapter(active);
 const last=get('last'),resume=$('#resume');if(last&&$('#'+last)&&resume){resume.hidden=false;resume.addEventListener('click',()=>$('#'+last)?.scrollIntoView({behavior:'smooth'}));}
 function progress(){const dh=document.documentElement.scrollHeight-innerHeight;const p=dh>0?Math.min(100,100*scrollY/dh):0;const el=$('#progress');if(el)el.style.width=p.toFixed(2)+'%';}
 addEventListener('scroll',progress,{passive:true});progress();
 $$('[data-copy-link]').forEach(b=>b.addEventListener('click',async()=>{const link=location.origin+location.pathname+'#'+b.dataset.copyLink;try{await navigator.clipboard.writeText(link);toast('Chapter link copied');}catch(e){toast('Copy unavailable: use your browser’s Share command');}}));
 $('#print-page')?.addEventListener('click',()=>window.print());
}
})();