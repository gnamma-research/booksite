/* Full canonical HTML DOM -> native Typst AST/source for local browser WASM.
 * Unlike a PDF-assembly recipe, this reads only the authentic HTML publication.
 * Preserve ALL original authorial text, note prose, lexicon article prose,
 * page-local scholarly apparatus, original link targets and source headings.
 *
 * Renderer is deliberately conservative. It is an engineering benchmark, NOT
 * the approved scholarly publication layout yet. No OCR, remote PDF or AI text.
 */
const textEscape=s=>String(s??'').replace(/\\/g,'\\\\').replace(/([#*_@$[\]<>])/g,'\\$1')
  .replace(/\s+/gu,' ');
const attr=el=>el?.getAttribute?.bind(el);
const localLang=el=>el?.closest?.('[lang="ar"],[dir="rtl"]')?'ar':'en';

export function makeTypstFromCanonicalHtml(originalHtml,record){
 const dom=new DOMParser().parseFromString(originalHtml,'text/html');
 const allIds=[...dom.querySelectorAll('[id]')].map(x=>x.id);
 if(new Set(allIds).size!==allIds.length)throw Error('Nonunique authoritative IDs');
 if(dom.querySelectorAll('p.source-segment').length!==record.source_segments)
   throw Error('Source paragraph count mismatch');
 if(record.edition==='scholarly'&&(
    dom.querySelectorAll('.apparatus-note').length!==625||
    dom.querySelectorAll('.lex-article').length!==157||
    dom.querySelectorAll('.lex-term').length!==153))
   throw Error('Complete 625 source notes/157 dictionary articles not available');
 const labels=new Map();const used=new Set();
 for(const id of allIds){
  let safe='loc-'+id.normalize('NFD').replace(/[^A-Za-z0-9_-]/gu,'-')
        .replace(/-+/g,'-').replace(/^-|-$/g,'');
  if(!safe||safe==='loc')safe='loc-empty';
  if(used.has(safe)){let i=2;while(used.has(safe+'-'+i))i++;safe+='-'+i;}
  labels.set(id,safe);used.add(safe);
 }
 // Editorial topics are used ONLY for PDF sidebar bookmark labels. They
 // are not inserted into the author's printed Arabic/English source text.
 const sectionTopics=new Map();
 for(const el of dom.querySelectorAll('section.editorial-toc a[href^="#section-"]')){
   const match=/^#section-([1-9][0-9]*)$/.exec(el.getAttribute('href')||'');
   if(match && Number(match[1])<=258)
     sectionTopics.set(Number(match[1]),(el.textContent||'').trim());
 }
 if(sectionTopics.size!==258)throw Error('Missing original 258 editorial section labels');
 const located=new Set();
 const anchor=el=>{
  const id=el?.getAttribute?.('id');
  if(!id)return '';
  located.add(id);
  return '#box(width: 0pt, height: 0pt)[ ]<'+labels.get(id)+'>';
 };
 const childRich=el=>[...el.childNodes].map(rich).join('');
 function rich(el){
  if(el.nodeType===Node.TEXT_NODE)return textEscape(el.nodeValue);
  if(el.nodeType!==Node.ELEMENT_NODE)return '';
  const tag=el.tagName.toLowerCase();
  if(['script','style','noscript','template'].includes(tag))return '';
  let prefix=anchor(el);
  if(tag==='br')return prefix+'#linebreak()';
  if(tag==='img')return prefix; // only decorative image, not book text
  const body=childRich(el);
  if(tag==='a'){
   const href=el.getAttribute('href')||'';
   if(href.startsWith('#')){
    const name=href.slice(1);
    if(!labels.has(name))throw Error('Missing original target '+name);
    return prefix+'#link(<'+labels.get(name)+'>)['+body+']';
   }
   if(/^https?:\/\//.test(href))
     return prefix+'#link('+JSON.stringify(href)+')['+body+']';
   return prefix+body;
  }
  if(tag==='b'||tag==='strong')return prefix+'#strong['+body+']';
  if(tag==='i'||tag==='em'||tag==='cite')return prefix+'#emph['+body+']';
  if(tag==='sup')return prefix+'#super['+body+']';
  if(tag==='sub')return prefix+'#sub['+body+']';
  if(tag==='code')return prefix+'#text(font:"Noto Sans",size:7.5pt)['+body+']';
  if(tag==='span'&&el.getAttribute('lang')==='ar')
    return prefix+'#text(font:"Noto Naskh Arabic",lang:"ar",dir:rtl)['+body+']';
  if(tag==='span'&&el.getAttribute('lang')==='en')
    return prefix+'#text(lang:"en",dir:ltr)['+body+']';
  if(tag==='span'&&el.getAttribute('dir')==='rtl')
    return prefix+'#text(font:"Noto Naskh Arabic",lang:"ar",dir:rtl)['+body+']';
  return prefix+body;
 }
 const lines=[
   '#set page(paper: "a4", margin: (top: 17mm,bottom:18mm,left:17mm,right:17mm), numbering: "1", number-align: center + bottom)\\n',
   '#set document(title: "Al-Ḍarūrī fī Uṣūl al-Fiqh — Scholarly Edition", author: "Abū al-Walīd Ibn Rushd")\\n',
   '#set text(font: "Noto Serif",lang:"en",size:9pt)\n',
   '#set par(leading: 0.7em, justify:false)\n',
   // The original HTML already supplies two authoritative contents lists.
   // No synthetic Typst #outline() in the *printed* book: keep PDF sidebar
   // bookmarks without adding 20+ redundant front-matter pages.

 ];
 const stats={
  source_sha256:record.source_sha256,source_html_sha256:record.html_sha256,
  original_html_bytes:record.html_bytes,
  original_source_passages:record.authorial_source_paragraphs,
  original_text_segments:record.source_segments,
  original_notes:record.total_original_notes,
  historical_terms:record.historical_dictionary_terms,
  historical_articles:record.historical_dictionary_articles,
  source_links:record.all_internal_reference_links,
  typst_bilingual_grid_rows:0,typst_lexicon_grid_rows:0,
  typst_pieces:0,unmapped_internal_href:0,generated_source_links:0,
  source_kind:"canonical original HTML, never PDF",release_approved:false
 };
 function renderGrid(el,language){
  const inner=[...el.children].map(block).join('');
  return '#text(font:"'+(language==='ar'?'Noto Naskh Arabic':'Noto Serif')+
    '",size:'+(language==='ar'?'10.5pt':'8.5pt')+
    ',lang:"'+language+'",dir:'+(language==='ar'?'rtl':'ltr')+
    ')['+inner+']';
 }
 function bodyGrid(table,scholarly){
  const out=[anchor(table)];
  for(const tr of table.querySelectorAll('tr')){
   const en=tr.querySelector('td.english,td.lex-en');
   const ar=tr.querySelector('td.arabic,td.lex-ar');
   if(!en||!ar){out.push(...[...tr.children].map(block));continue;}
   out.push(anchor(tr));
   out.push('#grid(columns: (1fr,1fr),gutter:4mm,row-gutter:0pt,');
   out.push('['+anchor(en)+renderGrid(en,'en')+'],');
   out.push('['+anchor(ar)+renderGrid(ar,'ar')+'])\n#v(3pt)\n');
   if(scholarly)stats.typst_lexicon_grid_rows++;
   else stats.typst_bilingual_grid_rows++;
  }
  return out.join('');
 }
 const nonContent=new Set(['script','style','noscript','template','svg','canvas']);
 function block(el){
  if(el.nodeType===Node.TEXT_NODE)return el.nodeValue.trim()?textEscape(el.nodeValue)+'\n':'';
  if(el.nodeType!==Node.ELEMENT_NODE)return '';
  const tag=el.tagName.toLowerCase();
  if(nonContent.has(tag))return '';
  if(el.matches('section.cover')){
    const textOf=selector=>textEscape((el.querySelector(selector)?.textContent||'').trim());
    const author=el.querySelector('p.author');
    const authorEn=textEscape(author ? [...author.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.nodeValue).join(' ').trim() : '');
    const coverAr=el.querySelector('p.author span[lang="ar"]');
    const authorAr=textEscape(coverAr?.textContent||'');
    return [
      '#align(center)[\\n',
      '#v(36mm)\\n',
      '#text(size:10pt,weight:"bold",tracking:1.3pt)['+textOf('.brand')+']\\n',
      '#v(12mm)\\n',
      '#text(font:"Noto Naskh Arabic",lang:"ar",dir:rtl,size:25pt)['+textOf('.arabic-title')+']\\n',
      '#v(8mm)\\n',
      '#heading(level:1,outlined:true)['+textOf('h1')+']\\n',
      '#v(7mm)\\n',
      '#text(size:12pt)['+authorEn+']\\n',
      '#v(3mm)\\n',
      '#text(font:"Noto Naskh Arabic",lang:"ar",dir:rtl,size:13pt)['+authorAr+']\\n',
      '#v(20mm)\\n',
      '#text(size:12pt,weight:"bold")['+textOf('.edition')+']\\n',
      '#v(5mm)\\n',
      '#text(size:9pt)['+textOf('.scope')+']\\n',
      '#v(24mm)\\n',
      '#text(size:9pt)['+textOf('.date')+']\\n',
      ']\\n#pagebreak()\\n'
    ].join('');
  }
  if(tag==='a')return rich(el)+'\n';
  if(tag==='table'&&el.classList.contains('parallel-text'))
     return bodyGrid(el,false);
  if(tag==='table'&&el.classList.contains('lex-bilingual'))
     return bodyGrid(el,true);
  if(tag==='h1'||tag==='h2'||tag==='h3'||tag==='h4'||tag==='h5'||tag==='h6'){
    const level=Math.min(Number(tag[1]),5);
    const txt=childRich(el);
    // All 258 authorial sections must appear in the PDF sidebar outline.
    // Preserve original heading level for other editorial apparatus.
    const sectionId=el.getAttribute('id')||'';
    const sectionHeading=/^section-([1-9][0-9]*)$/.exec(sectionId);
    // The original section anchor is usually on the section wrapper rather
    // than the heading node; find the nearest owning source section.
    const owner=el.closest('[id^="section-"]');
    const ownerId=owner?.id||'';
    const ownerSection=/^section-([1-9][0-9]*)$/.exec(ownerId);
    if((sectionHeading && Number(sectionHeading[1])<=258) ||
       (ownerSection && Number(ownerSection[1])<=258 &&
        (tag==='h2'||tag==='h3'))){
      return '#heading(level:2,outlined:true)['+txt+']'+anchor(el)+'\n';
    }
    return '#heading(level:'+level+')['+txt+']'+anchor(el)+'\n';
  }
  if(['p','li','dt','dd','figcaption','blockquote'].includes(tag)){
    const lang=localLang(el);
    const txt=childRich(el);
    const font=lang==='ar'?'Noto Naskh Arabic':'Noto Serif';
    return '#text(font:"'+font+'",lang:"'+lang+'",dir:'+(lang==='ar'?'rtl':'ltr')+
      ',size:'+(lang==='ar'?'10.5pt':'8.5pt')+')['+txt+']'+anchor(el)+'\n\n';
  }
  // One outline entry for each canonical authorial section wrapper.
  const sourceSection=/^section-([1-9][0-9]*)$/.exec(el.id||'');
  if(sourceSection && Number(sourceSection[1])<=258){
    const children=[...el.childNodes].map(block).join('');
    return anchor(el)+'#heading(level:2,outlined:true)[Section '+sourceSection[1]+']\n'+children;
  }
  // Original section IDs are on nested headings or metadata, while the
  // enclosing source section carries data-section-id. Emit one outline
  // heading for each original numbered source section.
  const sourceNumber=el.matches('section.text-section') ? el.getAttribute('data-section-id') : null;
  if(sourceNumber && /^(?:[1-9][0-9]*)$/.test(sourceNumber) && Number(sourceNumber)<=258){
    const number=Number(sourceNumber);
    const topic=(sectionTopics.get(number)||('Section '+sourceNumber))
      .replace(/^\\s*[0-9]+\\.\\s*/,'');
    const label=textEscape('§'+sourceNumber+' · '+topic);
    const children=[...el.childNodes].map(block).join('');
    // Scoped Typst heading display suppression. The actual heading remains
    // in Typst's semantic/PDF outline but contributes NO printed editorial
    // prose, blank space or changed canonical book text.
    const pdfBookmark='#{ show heading: none; heading(level: 2, outlined: true, bookmarked: true)['+
      label+'] }\\n';
    return anchor(el)+pdfBookmark+children;
  }
  const begin=anchor(el);
  const breakBefore=el.matches('main.main-text')?'#pagebreak()\\n':
    (el.matches('section.page-start,section.cover,section.contents')||
      el.id==='concordance'||el.id==='lexicon')?'#pagebreak(weak:true)\n':'';
  const body=[...el.childNodes].map(block).join('');
  return breakBefore+begin+body;
 }
 const parts=[...dom.body.children].map(block);
 lines.push(...parts);
 // Reference target labels must be emitted in the document, not merely defined
 // in the lookup map. A hidden page-1 fallback would break citation semantics.
 const internalHrefs=[...dom.querySelectorAll('a[href^="#"]')].map(e=>e.getAttribute('href').slice(1));
 const unplaced=[...new Set(internalHrefs)].filter(x=>!located.has(x));
 if(unplaced.length)throw Error('Cannot preserve actual scholarly destination: '+unplaced.slice(0,20));
 stats.generated_source_links=(lines.join('').match(/#link\(/g)||[]).length;
 stats.emitted_target_labels=located.size;
 stats.validated_internal_target_count=new Set(internalHrefs).size;
 stats.typst_character_count=lines.join('').length;
 return {source:lines.join(''),metrics:stats};
}
