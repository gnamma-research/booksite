/* Daruri Hadith context: separate primary collection reports, Arabic isnad, book/bab and linked translation. */
(()=>{
'use strict';
if(window.__gnHadithContextInstalled)return;window.__gnHadithContextInstalled=true;
const REV='20261023-hen1';
const here=document.currentScript?.src||new URL('hadith-context-ui.js',document.baseURI).href;
const scripts=['hadith-context-data.js','hadith-context-arabic-bukhari1.js','hadith-context-arabic-bukhari2.js','hadith-context-arabic-muslim.js','hadith-context-arabic-abudawud1.js','hadith-context-arabic-abudawud2.js','hadith-context-arabic-tirmidhi.js','hadith-context-arabic-sunan.js','hadith-context-metadata.js'];
const englishScripts=["hadith-context-english-bukhari-a.js","hadith-context-english-bukhari-b.js","hadith-context-english-bukhari-long.js","hadith-context-english-abudawud-a.js","hadith-context-english-abudawud-b.js","hadith-context-english-tirmidhi-a.js","hadith-context-english-tirmidhi-b.js","hadith-context-english-tirmidhi-c.js","hadith-context-english-muslim.js","hadith-context-english-other.js"];
const pending=new Map();
const mk=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e;};
function load(src){if(pending.has(src))return pending.get(src);const p=new Promise((ok,fail)=>{const s=document.createElement('script');s.async=true;s.src=new URL(src+'?v='+REV,here).href;s.onload=()=>ok();s.onerror=()=>fail(new Error('Could not load '+src));document.head.append(s);});pending.set(src,p);return p;}
async function corpus(){const first=await Promise.allSettled(scripts.slice(0,-1).map(load));const last=await Promise.allSettled([load(scripts[scripts.length-1])]);const translations=await Promise.allSettled(englishScripts.map(load));if(!window.GnammaHadithContextData?.notes)throw Error('Hadith source index is missing');return {data:window.GnammaHadithContextData,reports:window.GnammaHadithReports||{},english:window.GnammaHadithEnglishFull||{},failed:first.concat(last,translations).filter(x=>x.status==='rejected').length};}
function outbound(text,url){const a=mk('a','gn-hadith-source-link',text);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
function label(host,key,value,lang){if(!value)return;const p=mk('p','gn-hadith-meta');p.append(mk('strong',null,key+': '));const v=mk('span',null,value);if(lang){v.lang=lang;v.dir='rtl';}p.append(v);host.append(p);}
function reportCard(key,cite,report,index,fullTranslation){
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
    if(typeof fullTranslation==='string' && fullTranslation.trim()){
      const heading=mk('h6','gn-hadith-section-label','Full English translation · complete transmission');
      article.append(heading);
      const english=mk('section','gn-hadith-english');
      english.lang='en'; english.dir='ltr';
      for(const paragraph of fullTranslation.split(/\n\s*\n/)){
        if(paragraph.trim())english.append(mk('p','gn-hadith-english-paragraph',paragraph.trim()));
      }
      article.append(english);
    } else {
      article.append(mk('p','gn-hadith-error','The complete English translation could not be loaded. Follow the original collection link below; no abbreviated summary is substituted for a full translation.'));
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
  n.refs.forEach((key,i)=>{const cite=cor.data.sources[key];if(cite)host.append(reportCard(key,cite,cor.reports[key]||{},i,cor.english[key]));});
  if(cor.failed)host.append(mk('p','gn-hadith-unresolved','Some local report assets did not load. Use their external source links above.'));
  host.append(mk('p','gn-hadith-credit','Complete English translations are newly prepared, AI-assisted editorial renderings of the Arabic sources, including each displayed chain and collector’s remarks; they have not yet undergone independent scholarly certification. For authoritative wording, compare the Arabic and the linked primary collection. Hadith al-aḥkām works remain supplementary.'));
}
function enhance(node){if(!node?.matches?.('.gn-note-entry[data-note-id]'))return;const id=node.dataset.noteId;
 if(!/^HAD-R\d+$/.test(id)||node.dataset.gnHadithContextEnhanced==='1')return;
 node.dataset.gnHadithContextEnhanced='1';
 const detail=mk('details','gn-hadith-context');detail.dataset.gnHadithContext=id;
 const summary=mk('summary','gn-hadith-context-toggle');summary.append(mk('span','gn-hadith-chevron','›'),mk('span','gn-hadith-closed','Show full Hadith · Arabic and English'),mk('span','gn-hadith-open','Hide Hadith context'));
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
