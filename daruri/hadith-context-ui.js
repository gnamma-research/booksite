/* Daruri Hadith context: separate primary collection reports, Arabic isnad, book/bab and linked translation. */
(()=>{
'use strict';
if(window.__gnHadithContextInstalled)return;window.__gnHadithContextInstalled=true;
const REV='20261023-hnote2';
const here=document.currentScript?.src||new URL('hadith-context-ui.js',document.baseURI).href;
const scripts=['hadith-context-data.js','hadith-context-arabic-bukhari1.js','hadith-context-arabic-bukhari2.js','hadith-context-arabic-muslim.js','hadith-context-arabic-abudawud1.js','hadith-context-arabic-abudawud2.js','hadith-context-arabic-tirmidhi.js','hadith-context-arabic-sunan.js','hadith-context-metadata.js','hadith-traditional-notes.js'];
const englishScripts=["hadith-context-english-bukhari-a.js","hadith-context-english-bukhari-b.js","hadith-context-english-bukhari-long.js","hadith-context-english-abudawud-a.js","hadith-context-english-abudawud-b.js","hadith-context-english-tirmidhi-a.js","hadith-context-english-tirmidhi-b.js","hadith-context-english-tirmidhi-c.js","hadith-context-english-muslim.js","hadith-context-english-other.js"];
const pending=new Map();
const mk=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e;};
function load(src){if(pending.has(src))return pending.get(src);const p=new Promise((ok,fail)=>{const s=document.createElement('script');s.async=true;s.src=new URL(src+'?v='+REV,here).href;s.onload=()=>ok();s.onerror=()=>fail(new Error('Could not load '+src));document.head.append(s);});pending.set(src,p);return p;}
async function corpus(){const first=await Promise.allSettled(scripts.slice(0,-2).map(load));const last=await Promise.allSettled([load('hadith-context-metadata.js'),load('hadith-traditional-notes.js')]);const translations=await Promise.allSettled(englishScripts.map(load));if(!window.GnammaHadithContextData?.notes)throw Error('Hadith source index is missing');return {data:window.GnammaHadithContextData,reports:window.GnammaHadithReports||{},english:window.GnammaHadithEnglishFull||{},failed:first.concat(last,translations).filter(x=>x.status==='rejected').length};}
function outbound(text,url){const a=mk('a','gn-hadith-source-link',text);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
function label(host,key,value,lang){if(!value)return;const p=mk('p','gn-hadith-meta');p.append(mk('strong',null,key+': '));const v=mk('span',null,value);if(lang){v.lang=lang;v.dir='rtl';}p.append(v);host.append(p);}

function fullyVowelledTransmission(raw) {
  // The source records already have diacritics on their substantive Arabic words.
  // Complete recurring unvowelled devotional formulae; preserve all remaining
  // source letters, isnad and unusual readings rather than rewriting the witness.
  return String(raw||'')
    .replace(/صلى الله عليه وسلم/g,'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ')
    .replace(/رضى الله عنهما/g,'رَضِيَ اللَّهُ عَنْهُمَا')
    .replace(/رضى الله عنها/g,'رَضِيَ اللَّهُ عَنْهَا')
    .replace(/رضى الله عنه/g,'رَضِيَ اللَّهُ عَنْهُ');
}
function reportCard(key,cite,report,index,fullTranslation){
  const article=mk('article','gn-hadith-report');article.dataset.hadithReport=key;
  const heading=mk('h5','gn-hadith-report-heading',(cite.collection||'Collection')+' '+cite.number);
  article.append(heading);
  const meta=mk('div','gn-hadith-metadata');
  if(report.narrator)label(meta,'Narrated by',report.narrator);
  if(report.book)label(meta,'Book',report.book);
  if(report.chapter_en)label(meta,'Chapter',report.chapter_en);
  if(report.chapter_ar)label(meta,'باب',report.chapter_ar,'ar');
  const traditional=window.GnammaTraditionalHadithNotes?.traditional?.[key];
  if(traditional)label(meta,'Earlier assessment',traditional.assessment);
  article.append(meta);
  if(report.arabic){
    const isLong=report.arabic.length>1400;
    const wrapper=isLong?mk('details','gn-hadith-arabic-fold'):mk('div','gn-hadith-arabic-block');
    if(isLong)wrapper.append(mk('summary',null,'Full Arabic text and chain'));
    const ar=mk('blockquote','gn-hadith-original-ar',fullyVowelledTransmission(report.arabic));
    ar.lang='ar';ar.dir='rtl';wrapper.append(ar);article.append(wrapper);
    if(typeof fullTranslation==='string'&&fullTranslation.trim()){
      const heading=mk('h6','gn-hadith-section-label','English translation');
      article.append(heading);
      const english=mk('section','gn-hadith-english');english.lang='en';english.dir='ltr';
      for(const part of fullTranslation.split(/\n\s*\n/)){
        if(part.trim())english.append(mk('p','gn-hadith-english-paragraph',part.trim()));
      }
      article.append(english);
    }else article.append(mk('p','gn-hadith-error','English translation unavailable in the local edition. See the collection source.'));
  }else article.append(mk('p','gn-hadith-error','Arabic report text unavailable locally. See the collection source.'));
  const foot=mk('p','gn-hadith-outbound');
  foot.append(outbound('Collection record ↗',cite.url));
  article.append(foot);
  return article;
}
function render(id,host,cor,selected){
 host.replaceChildren();
 const n=cor.data.notes[id];
 if(!n){host.append(mk('p','gn-hadith-error','Source note unavailable.'));return;}
 if(n.unresolved)host.append(mk('p','gn-hadith-unresolved','Some attribution in this passage remains unidentified; the following reports do not resolve it.'));
 const keys=selected?.length?selected:n.refs;
 if(!keys.length){host.append(mk('p','gn-hadith-unresolved','The original transmission for this wording has not been securely identified.'));return;}
 const contrast=window.GnammaTraditionalHadithNotes?.variant?.[id];
 if(contrast && !selected?.length)host.append(mk('p','gn-hadith-variant',contrast));
 keys.forEach((key,i)=>{const cite=cor.data.sources[key];if(cite)host.append(reportCard(key,cite,cor.reports[key]||{},i,cor.english[key]));});
 if(cor.failed)host.append(mk('p','gn-hadith-unresolved','Some offline source records are unavailable. Use the collection links.'));
}
function createDisclosure(noteId,related) {
 const detail=mk('details',related?'gn-hadith-context gn-hadith-related':'gn-hadith-context');
 detail.dataset.gnHadithContext=noteId;
 const summary=mk('summary','gn-hadith-context-toggle');
 summary.append(mk('span','gn-hadith-chevron','›'),
   mk('span','gn-hadith-closed',related?'Related Hadith · full Arabic and English':'Read Hadith · Arabic and English'),
   mk('span','gn-hadith-open','Hide Hadith'));
 const host=mk('div','gn-hadith-context-body');detail.append(summary,host);
 detail.addEventListener('toggle',()=>{
  if(!detail.open||detail.dataset.ready==='1'||detail.dataset.loading==='1')return;
  detail.dataset.loading='1';host.replaceChildren(mk('p','gn-hadith-status','Opening source text…'));
  corpus().then(c=>{
    if(!detail.isConnected)return;
    render(noteId,host,c,related?.reports);
    detail.dataset.ready='1';
  }).catch(error=>{
    if(detail.isConnected)host.replaceChildren(mk('p','gn-hadith-error','Offline text unavailable. Follow the collection reference.'));
    console.warn('Hadith source context',error);
  }).finally(()=>{delete detail.dataset.loading;});
 });
 return detail;
}
function enhance(node){
 if(!node?.matches?.('.gn-note-entry[data-note-id]'))return;
 const id=node.dataset.noteId;
 if(/^HAD-R\d+$/.test(id)&&node.dataset.gnHadithContextEnhanced!=='1'){
  node.dataset.gnHadithContextEnhanced='1';
  node.append(createDisclosure(id,null));
 }
 if(/^QUR-R\d+-Q\d+$/.test(id)&&node.dataset.gnRelatedHadithEnhanced!=='1'){
  node.dataset.gnRelatedHadithEnhanced='1';
  const links=window.GnammaHadithAnchorMap?.quranRelated?.[id]||[];
  if(!links.length)return;
  const related=mk('section','gn-hadith-in-quran-note');
  related.dataset.relatedHadithTo=id;
  for(const record of links){
    const header=mk('h4','gn-related-hadith-heading','Related Hadith');
    related.append(header);
    related.append(mk('p','gn-related-hadith-context-label',record.subject));
    related.append(createDisclosure(record.hadithNote,record));
  }
  node.append(related);
 }
}
function scan(root){if(root.nodeType!==1&&root.nodeType!==9)return;if(root.matches)enhance(root);root.querySelectorAll?.('.gn-note-entry[data-note-id]').forEach(enhance);}
function start(){scan(document);const watch=new MutationObserver(changes=>{for(const rec of changes)for(const n of rec.addedNodes)scan(n);});watch.observe(document.body,{subtree:true,childList:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
