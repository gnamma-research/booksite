/* Daruri Hadith context: separate primary collection reports, Arabic isnad, book/bab and linked translation. */
(()=>{
'use strict';
if(window.__gnHadithContextInstalled)return;window.__gnHadithContextInstalled=true;
const REV='20261022-hctx1';
const here=document.currentScript?.src||new URL('hadith-context-ui.js',document.baseURI).href;
const scripts=['hadith-context-data.js','hadith-context-arabic-bukhari1.js','hadith-context-arabic-bukhari2.js','hadith-context-arabic-muslim.js','hadith-context-arabic-abudawud1.js','hadith-context-arabic-abudawud2.js','hadith-context-arabic-tirmidhi.js','hadith-context-arabic-sunan.js','hadith-context-metadata.js'];
const pending=new Map();
const mk=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e;};
function load(src){if(pending.has(src))return pending.get(src);const p=new Promise((ok,fail)=>{const s=document.createElement('script');s.async=true;s.src=new URL(src+'?v='+REV,here).href;s.onload=()=>ok();s.onerror=()=>fail(new Error('Could not load '+src));document.head.append(s);});pending.set(src,p);return p;}
async function corpus(){const result=await Promise.allSettled(scripts.map(load));if(!window.GnammaHadithContextData?.notes)throw Error('Hadith source index is missing');return {data:window.GnammaHadithContextData,reports:window.GnammaHadithReports||{},failed:result.filter(x=>x.status==='rejected').length};}
function outbound(text,url){const a=mk('a','gn-hadith-source-link',text);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
function label(host,key,value,lang){if(!value)return;const p=mk('p','gn-hadith-meta');p.append(mk('strong',null,key+': '));const v=mk('span',null,value);if(lang){v.lang=lang;v.dir='rtl';}p.append(v);host.append(p);}
function reportCard(key,cite,report,index){
  const article=mk('article','gn-hadith-report');article.dataset.hadithReport=key;
  const title=mk('h5','gn-hadith-report-heading', (index+1)+'. '+(cite.sourceLabel||cite.collection+' '+cite.number));article.append(title);
  const meta=mk('div','gn-hadith-metadata');
  if(index===0)meta.append(mk('p','gn-hadith-display-order','First cited source under the collection-priority rule; not a claim that other versions have identical wording.'));
  label(meta,'Collection',cite.collection);
  label(meta,'Book (kitāb)',report.book);
  label(meta,'Chapter (bāb)',report.chapter_en);
  label(meta,'باب',report.chapter_ar,'ar');
  label(meta,'Principal narrator',report.narrator);
  label(meta,'In-book reference',report.inBook);
  const grades=report.grades?.filter(x=>x?.name&&x.grade).map(x=>x.name+': '+x.grade);
  if(grades?.length)label(meta,'Attributed grading',grades.join(' · '));
  article.append(meta);
  if(report.arabic){
    // Large hadiths (e.g. Bukhari 2731) do not fill the whole mobile popup immediately.
    const isLong=report.arabic.length>1400;
    const wrapper=isLong?mk('details','gn-hadith-arabic-fold'):mk('div','gn-hadith-arabic-block');
    if(isLong)wrapper.append(mk('summary',null,'Read the complete Arabic transmission and isnād'));
    const ar=mk('blockquote','gn-hadith-original-ar',report.arabic);ar.lang='ar';ar.dir='rtl';wrapper.append(ar);article.append(wrapper);
    if(report.englishOriginal){
      const en=mk('p','gn-hadith-english',report.englishOriginal);en.lang='en';en.dir='ltr';article.append(mk('p','gn-hadith-section-label','English rendering of the cited report (editorial translation)'),en);
    } else {
      article.append(mk('p','gn-hadith-translation-note','The original Arabic (including its chain) is provided above. A complete published English translation is available at the primary source; the existing scholarly note gives the report’s relevance.'));
    }
  } else {
    article.append(mk('p','gn-hadith-translation-note','The full report was not verified for local reproduction. Consult the linked edition for the original wording, narrators and translation.'));
  }
  const linkRow=mk('p','gn-hadith-outbound');linkRow.append(outbound('Open '+cite.collection+' '+cite.number+' · Arabic / English ↗',cite.url));article.append(linkRow);
  return article;
}
function render(id,host,cor){host.replaceChildren();const n=cor.data.notes[id];if(!n){host.append(mk('p','gn-hadith-error','No Hadith note record for '+id));return;}
  const lead=mk('p','gn-hadith-lead','The individual collection versions below are presented separately; their Arabic chains and wordings are not merged. Reports in Bukhārī and Muslim are shown first where already cited.');host.append(lead);
  if(n.unresolved)host.append(mk('p','gn-hadith-unresolved','Source qualification: this note contains an unresolved identification or attribution. The reports below do not resolve that uncertainty.'));
  if(!n.refs.length){host.append(mk('p','gn-hadith-unresolved','No primary collection has been securely identified for the wording cited here. No invented narration is supplied.'));return;}
  n.refs.forEach((key,i)=>{const cite=cor.data.sources[key];if(cite)host.append(reportCard(key,cite,cor.reports[key]||{},i));});
  if(cor.failed)host.append(mk('p','gn-hadith-unresolved','Some local report assets did not load. Use their external source links above.'));
  host.append(mk('p','gn-hadith-credit','Collection books and chapter headings are shown only where verified for that specific report. English editions and numbering can differ; always use the linked collection entry. Hadith al-aḥkām compilations may assist comparison but do not replace the underlying transmission.'));
}
function enhance(node){if(!node?.matches?.('.gn-note-entry[data-note-id]'))return;const id=node.dataset.noteId;
 if(!/^HAD-R\d+$/.test(id)||node.dataset.gnHadithContextEnhanced==='1')return;
 node.dataset.gnHadithContextEnhanced='1';
 const detail=mk('details','gn-hadith-context');detail.dataset.gnHadithContext=id;
 const summary=mk('summary','gn-hadith-context-toggle');summary.append(mk('span','gn-hadith-chevron','›'),mk('span','gn-hadith-closed','Show Hadith text, narrators and collection context'),mk('span','gn-hadith-open','Hide Hadith context'));
 const host=mk('div','gn-hadith-context-body');detail.append(summary,host);node.append(detail);
 detail.addEventListener('toggle',()=>{if(!detail.open||detail.dataset.ready==='1'||detail.dataset.loading==='1')return;
   detail.dataset.loading='1';host.replaceChildren(mk('p','gn-hadith-status','Opening Hadith collection texts…'));
   corpus().then(x=>{if(!detail.isConnected)return;render(id,host,x);detail.dataset.ready='1';})
     .catch(e=>{host.replaceChildren(mk('p','gn-hadith-error','The local Hadith text could not be loaded. Use the original source links in the scholarly note.'));console.warn('Hadith context',e);})
     .finally(()=>{delete detail.dataset.loading;});
 });
}
function scan(root){if(root.nodeType!==1&&root.nodeType!==9)return;if(root.matches)enhance(root);root.querySelectorAll?.('.gn-note-entry[data-note-id]').forEach(enhance);}
function start(){scan(document);const watch=new MutationObserver(changes=>{for(const rec of changes)for(const n of rec.addedNodes)scan(n);});watch.observe(document.body,{subtree:true,childList:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
