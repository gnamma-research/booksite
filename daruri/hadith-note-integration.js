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
 script.src=new URL(file+'?v='+REV,SCRIPT).href;
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
function insertAfterPhrase(passage,anchor,id,note){
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
 const marker=createMarker(id,note);
 const control=pos.node.parentElement?.closest('a,button,[role="button"]');
 if(control&&passage.contains(control))control.after(marker);
 else{const range=document.createRange();range.setStart(pos.node,after);range.collapse(true);range.insertNode(marker);}
 return true;
}
function markPassage(passage){
 if(!passage?.matches?.('.passage-ar[data-ar-seg]'))return;
 const id=passage.closest('.reader')?.querySelector('.gn-note-trigger')?null:null; // scoped exclusively by the section route below
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
  if(insertAfterPhrase(passage,anchor,noteId,record)){
   const all=[...passage.querySelectorAll('.gn-inline-hadith-ref')].filter(a=>a.dataset.noteTarget===noteId);
   const last=all.at(-1);if(last)last.dataset.gnHadithAnchor=String(i);
  }
 }
}
function simplifySourceLinks(noteId,card,rec){
 let body=[...card.children].find(x=>x.tagName==='P'&&!x.classList.contains('gn-note-scope'));if(!body)return;
 if(body.dataset.gnHadithCompact==='1')return;
 const refs=(window.GnammaHadithContextData?.notes[noteId]?.refs||[])
 .map(key=>window.GnammaHadithContextData?.sources[key]).filter(Boolean);
 const metadata=document.createElement('span');metadata.className='gn-short-source-refs';
 const label=document.createElement('span');label.className='gn-short-source-label';label.textContent=refs.length?'In ':'Source not securely identified';
 metadata.append(label);
 refs.forEach((ref,i)=>{if(i)metadata.append(document.createTextNode(' · '));const a=document.createElement('a');a.href=ref.url;a.textContent=ref.sourceLabel||ref.collection+' '+ref.number;a.target='_blank';a.rel='noopener noreferrer';a.dataset.gnSourceIcon='1';a.className='gn-source-simple-link';metadata.append(a);});
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
  const sub=document.createElement('span');sub.className='gn-source-heading-sub';sub.textContent=phrase?meta.title:'Hadith source';
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
   const subtitle=document.createElement('span');subtitle.className='gn-source-heading-sub';subtitle.textContent='Qurʾān source · '+ref.label;
   const technical=document.createElement('small');technical.className='gn-note-id gn-quiet-note-id';technical.textContent=id;
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
function htmlForHadith(id){
 const record=window.GnammaHadithAnchorMap?.notes[id],source=window.GnammaHadithContextData?.notes[id];
 if(!record||!source)return '';
 const phrase=record.anchors.find(a=>a.ar.includes('«'))?.ar;
 const links=source.refs.map(key=>window.GnammaHadithContextData.sources[key]).filter(Boolean);
 const h=phrase?'<bdi class="gn-source-heading-primary gn-source-heading-ar" lang="ar" dir="rtl">'+escape(phrase)+'</bdi>':'<span class="gn-source-heading-primary">'+escape(record.title)+'</span>';
 const summary=links.length?links.map(ref=>'<a class="gn-source-simple-link" data-gn-source-icon="1" href="'+escape(ref.url)+'" target="_blank" rel="noopener noreferrer">'+escape(ref.sourceLabel||ref.collection+' '+ref.number)+'</a>').join(' · '):'Source identification not securely established';
 return '<article class="gn-layer-note gn-unified-notes"><section class="gn-note-group"><section class="gn-note-entry" data-note-id="'+escape(id)+'" data-note-kind="hadith-source"><h3>'+h+'<span class="gn-source-heading-sub">'+escape(phrase?record.title:'Hadith source')+'</span><small class="gn-note-id gn-quiet-note-id">'+escape(id)+'</small></h3><p class="gn-hadith-shortline">In '+summary+(source.unresolved?'<span class="gn-hadith-compact-qualification"> · Source qualification unresolved</span>':'')+'</p></section></section></article>';
}
function showHadith(id,opener){
 if(!window.gnShowLayer)return false;
 const content=htmlForHadith(id);if(!content)return false;
 window.gnShowLayer('Hadith note · §'+window.GnammaHadithAnchorMap.notes[id].section,content,'notes',opener);
 return true;
}
function onClick(event){
 const link=event.target.closest?.('a.gn-inline-hadith-ref[data-note-target]');
 if(!link)return;
 event.preventDefault();event.stopImmediatePropagation();
 getIndex().then(()=>{if(!showHadith(link.dataset.noteTarget,link)){
  document.querySelector('#reader [data-gn-notes-open]')?.click();
 }}).catch(e=>console.warn('Hadith marker unavailable',e));
}
function start(){
 getIndex().then(()=>{
  scan(document);
  const watch=new MutationObserver(changes=>{
   const targets=new Set();
   for(const item of changes)for(const node of item.addedNodes){
    if(node.nodeType===1){targets.add(node);const ancestor=node.closest?.('.passage-ar,.gn-note-entry');if(ancestor)targets.add(ancestor);}
   }
   for(const node of targets)scan(node);
  });watch.observe(document.body,{childList:true,subtree:true});
 }).catch(e=>console.warn('Hadith anchor data unavailable',e));
 document.addEventListener('click',onClick,true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();