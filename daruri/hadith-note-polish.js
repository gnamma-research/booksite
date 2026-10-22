/* Gnamma scholarly source-note presentation: readable titles, compact references, unobtrusive stable IDs.
   Do not mutate the authoritative note source objects, PDF artefacts, or any source links. */
(()=>{
 'use strict';
 if(window.__gnScholarlySourcePolishInstalled)return;
 window.__gnScholarlySourcePolishInstalled=true;
 const node=(tag,cls,value)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(value!==undefined)el.textContent=value;return el;};
 function enhance(card){
  if(!card?.matches?.('.gn-note-entry[data-note-id]')||card.dataset.gnSourceNotePolished==='1')return;
  const id=card.dataset.noteId||'';
  if(!/^QUR-R\d+-Q\d+$/.test(id)&&!/^HAD-R\d+$/.test(id))return;
  card.dataset.gnSourceNotePolished='1';
  const heading=card.querySelector(':scope > h3');
  const original=card.querySelector(':scope > p:not(.gn-note-scope)');
  if(!heading)return;
  const oldHeading=heading.textContent.trim();
  const stable=node('small','gn-scholarly-stable-id',oldHeading);
  const title=node('span','gn-scholarly-heading-primary');
  if(id.startsWith('QUR-')){
   const record=window.GnammaQuranNoteHeadings?.[id];
   if(record?.preview){
    title.textContent='﴿ '+record.preview+' ﴾';
    title.lang='ar';title.dir='rtl';title.title=record.verse;
    title.classList.add('gn-scholar-ayah-title');
    const label=node('span','gn-scholar-verse-source',record.label);
    heading.replaceChildren(title,stable,label);
   } else {
    title.textContent=oldHeading.replace(/\bQUR-R\d+-Q\d+\b/g,'').trim();
    heading.replaceChildren(title,stable);
   }
   heading.classList.add('gn-scholarly-source-heading');
   return;
  }
  const config=window.GnammaHadithAnchorMap?.notes?.[id];
  title.textContent=config?.title||'Hadith evidence';
  heading.replaceChildren(title,stable);
  heading.classList.add('gn-scholarly-source-heading');
  if(!original)return;
  // Keep the canonical publisher apparatus, including all original source URIs,
  // in the DOM for citation consistency; show concise, issue-specific details instead.
  original.classList.add('gn-hadith-canonical-legacy');
  original.hidden=true;
  const brief=node('div','gn-hadith-brief');
  const anchors=[...original.querySelectorAll('.source-note-links a[href]')];
  const dedup=new Set();
  const sources=[];
  for(const link of anchors){
   if(dedup.has(link.href))continue;
   dedup.add(link.href);
   const label=link.closest('.gn-source-citation')?.querySelector('.gn-source-label')?.textContent?.trim()
     ||link.textContent.trim()||new URL(link.href).pathname.slice(1);
   const pri=/sunnah\.com\/bukhari:/.test(link.href)?0:/sunnah\.com\/muslim:/.test(link.href)?1:2;
   sources.push({url:link.href,label,pri});
  }
  sources.sort((a,b)=>a.pri-b.pri);
  if(sources.length){
   const row=node('div','gn-hadith-source-line');
   sources.forEach((s,i)=>{
     if(i)row.append(document.createTextNode(' · '));
     const a=node('a','gn-hadith-source-text-link',s.label);
     a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';
     row.append(a);
   });
   brief.append(row);
  }else{
   brief.append(node('p','gn-hadith-unresolved','Exact transmitted source not yet identified.'));
  }
  original.before(brief);
 }
 function scan(root){
  if(root.nodeType!==1&&root.nodeType!==9)return;
  if(root.matches?.('.gn-note-entry[data-note-id]'))enhance(root);
  root.querySelectorAll?.('.gn-note-entry[data-note-id]').forEach(enhance);
 }
 function start(){
  scan(document);
  const observer=new MutationObserver(records=>{
   for(const change of records)for(const inserted of change.addedNodes)scan(inserted);
  });
  observer.observe(document.body,{subtree:true,childList:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
