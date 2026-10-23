/* Reader-layer Hadith anchors and scholarly note headings. Canonical source notes remain unchanged. */
(()=>{
'use strict';
if(window.__gnHadithAnchorsInstalled)return;
window.__gnHadithAnchorsInstalled=true;
const REV='20261023-hnux1';
const SCRIPT=document.currentScript?.src||new URL('hadith-note-integration.js',document.baseURI).href;
let indexPromise=null;
const normalize=s=>String(s||'').replace(/[\u064b-\u065f\u0670\u0640\u06d6-\u06ed]/g,'');
const escape=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const srcScript=file=>new Promise((resolve,reject)=>{
 const script=document.createElement('script');script.async=true;
 const version=file==='quran-context-data.js'?'20261022-qcontext1':file==='hadith-context-data.js'?'20261023-hctx1':REV;
 script.src=new URL(file+'?v='+version,SCRIPT).href;
 script.onload=()=>resolve();script.onerror=()=>reject(Error('Unavailable local source: '+file));
 document.head.append(script);
});
function getIndex(){
 if(window.GnammaHadithAnchorMap?.notes && window.GnammaHadithContextData?.notes)return Promise.resolve();
 if(!indexPromise)indexPromise=Promise.all([
   window.GnammaHadithAnchorMap?.notes?Promise.resolve():srcScript('hadith-anchor-data.js'),
   window.GnammaHadithContextData?.notes?Promise.resolve():srcScript('hadith-context-data.js')
 ]).catch(e=>{indexPromise=null;throw e;});
 return indexPromise;
}
let quranPromise=null;
function quranData(){
 if(window.GnammaQuranContextData?.verses)return Promise.resolve(window.GnammaQuranContextData);
 if(!quranPromise)quranPromise=srcScript('quran-context-data.js').then(()=>window.GnammaQuranContextData).catch(e=>{quranPromise=null;throw e;});
 return quranPromise;
}
function createMarker(id,note){
 const a=document.createElement('a');a.className='note-ref-symbol gn-inline-source-letter gn-inline-hadith-ref';
 a.href='#note-'+id;a.dataset.noteTarget=id;a.dataset.gnHadithInline='1';a.textContent='H';
 a.dir='ltr';a.setAttribute('aria-label','Hadith source for this passage: '+note.title+'. Open note '+id);
 return a;
}
function insertAfterPhrase(passage,anchor,id,note,index){
 const walker=document.createTreeWalker(passage,NodeFilter.SHOW_TEXT,{
  acceptNode:node=>node.parentElement?.closest('.note-ref-symbol,.gn-inline-hadith-ref,script,style')?
   NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT
 });
 let n,all='',map=[];
 while((n=walker.nextNode())){
  for(let i=0;i<n.data.length;i++){
   if(/[\u064b-\u065f\u0670\u0640\u06d6-\u06ed]/.test(n.data[i]))continue;
   all+=n.data[i];map.push({node:n,end:i+1});
  }
 }
 const needle=normalize(anchor.ar);
 const offset=all.indexOf(needle);
 if(offset<0||all.indexOf(needle,offset+needle.length)!==-1)return false;
 const pos=map[offset+needle.length-1];if(!pos)return false;
 let after=pos.end;while(after<pos.node.length&&/[\u064b-\u065f\u0670\u0640\u06d6-\u06ed]/.test(pos.node.data[after]))after++;
 const marker=createMarker(id,note);marker.dataset.gnHadithAnchor=String(index);
 const control=pos.node.parentElement?.closest('a,button,[role="button"]');
 if(control&&passage.contains(control))control.after(marker);
 else{const range=document.createRange();range.setStart(pos.node,after);range.collapse(true);range.insertNode(marker);}
 return true;
}
function markPassage(passage){
 if(!passage?.matches?.('.passage-ar[data-ar-seg]'))return;
 const map=window.GnammaHadithAnchorMap?.notes;if(!map)return;
 const n=passage.dataset.arSeg;const section=location.hash.match(/section=([^&#]+)/)?.[1]||window.state?.n;
 if(!section)return;
 const refs=Object.entries(map).filter(([,record])=>String(record.section)===String(section))
   .flatMap(([noteId,record])=>record.anchors.filter(a=>String(a.seg)===String(n)).map(a=>({noteId,record,anchor:a})));
 if(!refs.length)return;
 const existing=new Set([...passage.querySelectorAll('.gn-inline-hadith-ref')].map(a=>a.dataset.noteTarget+'|'+a.dataset.gnHadithAnchor));
 if(existing.size>=refs.length)return;
 for(const [i,{noteId,record,anchor}] of refs.entries()){
  const key=noteId+'|'+i;
  if(existing.has(key))continue;
  insertAfterPhrase(passage,anchor,noteId,record,i);
 }
}
function simplifySourceLinks(noteId,card,rec){
 let body=[...card.children].find(x=>x.tagName==='P'&&!x.classList.contains('gn-note-scope'));if(!body)return;
 if(body.dataset.gnHadithCompact==='1')return;
 const refs=(window.GnammaHadithContextData?.notes[noteId]?.refs||[])
 .map(key=>window.GnammaHadithContextData?.sources[key]).filter(Boolean);
 const inherited=[...body.querySelectorAll('a[href]')].map(link=>({
  url:link.href,label:link.closest('.gn-source-citation')?.querySelector('.gn-source-label')?.textContent||link.textContent.trim()
 })).filter(ref=>/^https:\/\//.test(ref.url));
 const metadata=document.createElement('span');metadata.className='gn-short-source-refs';
 const label=document.createElement('span');label.className='gn-short-source-label';label.textContent=refs.length?'In ':'Source not securely identified';
 metadata.append(label);
 refs.forEach((ref,i)=>{if(i)metadata.append(document.createTextNode(' · '));const a=document.createElement('a');a.href=ref.url;a.textContent=ref.sourceLabel||ref.collection+' '+ref.number;a.target='_blank';a.rel='noopener noreferrer';a.dataset.gnSourceIcon='1';a.className='gn-source-simple-link';metadata.append(a);});
 for(const old of inherited){
  if(refs.some(ref=>ref.url===old.url))continue;
  metadata.append(document.createTextNode(' · '));
  const a=document.createElement('a');a.href=old.url;a.textContent=old.label||new URL(old.url).hostname;
  a.target='_blank';a.rel='noopener noreferrer';a.dataset.gnSourceIcon='1';a.className='gn-source-simple-link';metadata.append(a);
 }
 body.replaceChildren(metadata);body.dataset.gnHadithCompact='1';
 if(window.GnammaHadithContextData?.notes[noteId]?.unresolved){
  const warning=document.createElement('span');warning.className='gn-hadith-compact-qualification';warning.textContent=' · Source identification or transmission has qualifications.';body.append(warning);
 }
}
function decorateHeadings(card){
 const id=card.dataset.noteId;if(!id||card.dataset.gnCompactHeading==='1')return;
 const h=card.querySelector('h3');if(!h)return;
 const meta=window.GnammaHadithAnchorMap?.notes?.[id];
 if(/^HAD-R\d+$/.test(id)&&meta){
  const phrase=meta.anchors.find(a=>a.ar.includes('«'))?.ar;
  const title=document.createElement(phrase?'bdi':'span');title.className='gn-source-heading-primary'+(phrase?' gn-source-heading-ar':'');
  title.textContent=phrase||meta.title;
  if(phrase){title.lang='ar';title.dir='rtl';}
  const sub=document.createElement('span');sub.className='gn-source-heading-sub';sub.textContent=phrase?'Hadith source · '+meta.title:'Hadith source';
  const technical=document.createElement('small');technical.className='gn-note-id gn-quiet-note-id';technical.textContent=id;
  h.replaceChildren(title,sub,technical);card.dataset.gnCompactHeading='1';
  simplifySourceLinks(id,card,meta);
  return;
 }
 if(/^QUR-R\d+-Q\d+$/.test(id)){
  card.dataset.gnCompactHeading='pending';
  quranData().then(data=>{
   if(!card.isConnected)return;
   const ref=data.notes?.[id]?.[0],range=ref?.range||'',first=range.split(':')[0]+':'+(ref?.start||'');
   const verse=data.verses?.[first]||data.verses?.[ref?.verses?.[0]];
   if(!verse?.ar){card.dataset.gnCompactHeading='0';return;}
   const title=document.createElement('bdi');title.className='gn-source-heading-primary gn-source-heading-ar';title.lang='ar';title.dir='rtl';title.textContent=verse.ar;
   const subtitle=document.createElement('span');subtitle.className='gn-source-heading-sub';subtitle.textContent='Qur’an source · '+ref.label;
   const local=(h.textContent.match(/Q\d+/)||[])[0]||'';
   const technical=document.createElement('small');technical.className='gn-note-id gn-quiet-note-id';technical.textContent=(local?local+' · ':'')+id;
   h.replaceChildren(title,subtitle,technical);card.dataset.gnCompactHeading='1';
  }).catch(()=>{card.dataset.gnCompactHeading='0';});
 }
}
function directSourceLink(link){
 if(!link?.matches?.('a.gn-source-icon-link'))return;
 const wrapper=link.closest('.gn-source-citation');
 const label=wrapper?.querySelector('.gn-source-label');if(!label)return;
 const simplified=document.createElement('a');simplified.className='gn-source-label gn-source-simple-link';
 simplified.textContent=label.textContent;simplified.href=link.href;simplified.rel='noopener noreferrer';simplified.target='_blank';simplified.dataset.gnSourceIcon='1';wrapper.replaceChildren(simplified);
}
function simplifyQMarker(marker){if(marker.textContent.trim()!=='Q')marker.textContent='Q';marker.removeAttribute('title');}
function scan(root){
 if(root?.nodeType!==1&&root?.nodeType!==9&&root?.nodeType!==11)return;
 if(root.matches?.('.passage-ar'))markPassage(root);
 root.querySelectorAll?.('.passage-ar').forEach(markPassage);
 if(root.matches?.('.gn-note-entry'))decorateHeadings(root);
 root.querySelectorAll?.('.gn-note-entry').forEach(decorateHeadings);
 if(root.matches?.('a.gn-source-icon-link'))directSourceLink(root);
 root.querySelectorAll?.('.gn-note-entry a.gn-source-icon-link').forEach(directSourceLink);
 if(root.matches?.('a.quran-source-ref'))simplifyQMarker(root);
 root.querySelectorAll?.('a.quran-source-ref').forEach(simplifyQMarker);
}
function start(){
 getIndex().then(()=>{
  scan(document);
  window.GnammaHadithContextRescan?.();
  const watch=new MutationObserver(changes=>{
   const targets=new Set();
   for(const item of changes)for(const node of item.addedNodes){
    if(node.nodeType===1){targets.add(node);const ancestor=node.closest?.('.passage-ar,.gn-note-entry');if(ancestor)targets.add(ancestor);}
   }
   for(const node of targets)scan(node);
  });watch.observe(document.body,{childList:true,subtree:true});
 }).catch(e=>console.warn('Hadith anchor data unavailable',e));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();