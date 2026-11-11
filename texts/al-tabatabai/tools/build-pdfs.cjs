/* Build searchable A4 PDFs. Install playwright and Chromium first.
   HIKMA_PDF_MODES=reading,study,reference node texts/al-tabatabai/tools/build-pdfs.cjs */
'use strict';
const fs=require('node:fs'),p=require('node:path'),crypto=require('node:crypto');
const richText=require('../assets/hikma-rich-text.js');
const base=p.resolve(__dirname,'..'),dest=p.join(base,'editions');
const modes=(process.env.HIKMA_PDF_MODES||'reading,study,reference').split(',');
const configs=[['muzaffar-al-mantiq','al-Manṭiq'],['bidayat-al-hikma','Bidāyat al-Ḥikma'],['nihayat-al-hikma','Nihāyat al-Ḥikma']];
const esc=x=>String(x??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const normal=x=>String(x??'').trim(),slug=x=>String(x).replace(/[^a-zA-Z0-9_-]/g,'-');
const rich=richText.inline;
const paragraphs=(txt,dir)=>richText.renderText(txt,{language:dir==='rtl'?'arabic':'english',lineBreaks:true});
const passage=(unit,language)=>richText.renderUnit(unit,language,{lineBreaks:true});
const isGuide=x=>/editorial|guide|outline/.test(String(x.status||'').toLowerCase())||String(x.id).startsWith('B-GUIDE');
function footnotes(u,mode){
 const notes=[];
 for(const raw of u.notes||[]){
   const n=typeof raw==='string'?{text:raw}:raw;
   if(!n||!normal(n.text))continue;
   const type=String(n.type||'').toLowerCase(),txt=String(n.text);
   if(/lecture note · source|source note|editorial guide|translation status|source locator|coverage|to be translated/.test(type))continue;
   if(/^Lecture-note locator:|Source locator supplied;|translation not yet available|full translation remains/i.test(txt))continue;
   notes.push([n.type||'Note',txt,n.url||'',n.arabic||'']);
 }
 if(u.source){notes.push(['Source',[u.source.edition||'Arabic text',u.source.page?'p. '+u.source.page:''].filter(Boolean).join(' · '),u.source.url||'']);}
 if(!notes.length)return '';
 return '<aside class="apparatus"><ol>'+notes.map(x=>'<li'+(x[3]?' class="authorial-bilingual-note"':'')+'><span class="note-kind">'+esc(x[0])+':</span> '+(x[3]&&mode!=='reading'?'<div class="note-arabic" lang="ar" dir="rtl">'+paragraphs(x[3],'rtl')+'</div>':'')+(x[3]&&mode==='reference'?'':rich(x[1]))+
   (String(x[2]).startsWith('https://')?' <span class="note-url">'+esc(x[2])+'</span>':'')+'</li>').join('')+'</ol></aside>';
}
function editionIntroduction(book){
 const status=book.editorialStatus||{},sections=[];
 for(const value of [book.description,status.translationMethod,status.collation,status.pagination])
   if(normal(value))sections.push('<p>'+esc(value)+'</p>');
 if(book.id==='nihayat-al-hikma')sections.push('<p>The apparatus separates the author’s text and original notes from transcription repairs, later editorial readings, and interpretive commentary. An adopted later reading is identified with its earlier reading and source; an editor’s philosophical objection is not silently made part of the author’s argument. This is an AI-assisted critical reading edition based on printed witnesses. Manuscripts and independent specialist certification are outside its evidentiary scope.</p>');
 sections.push('<p>Passage identifiers and chapter links remain stable across the online reader and these editions. The online dictionary and “Across the books” links connect specific discussions in Muẓaffar, Bidāya and Nihāya, with reasons and cautions where their treatments differ. Source page references belong to the cited printed edition; the PDF page numbers belong to this layout.</p>');
 const sources=(book.sources||[]).filter(s=>normal(s.title));
 if(sources.length)sections.push('<h3>Sources and bibliographic references</h3>'+sources.map(s=>'<div class="edition-source"><h4>'+esc(s.title)+'</h4><p>'+esc(s.description||'')+'</p>'+(s.url?'<p class="note-url"><a href="'+esc(s.url)+'">'+esc(s.url)+'</a></p>':'')+'</div>').join(''));
 return '<section class="edition-introduction" id="edition-method"><h2>About this edition</h2>'+sections.join('')+'</section>';
}
function glossary(book){
 const seen=new Set(),entries=[];
 for(const e of book.glossary||[]){const key=normal(e.arabic||e.term||e.english).normalize('NFC');if(!key||seen.has(key))continue;seen.add(key);entries.push(e);}
 if(!entries.length)return '';
 return '<section class="printed-glossary" id="glossary"><h2>Glossary</h2><p class="glossary-intro">Editorial explanations of terms in this reading edition. The online dictionary adds related discussions in the other books and keeps automatic word matches separate.</p>'+entries.map(e=>'<div class="glossary-entry"><h3>'+(e.arabic?'<span lang="ar" dir="rtl">'+esc(e.arabic)+'</span> · ':'')+esc(e.english||e.term||'')+'</h3>'+(e.term?'<p class="glossary-term">'+esc(e.term)+'</p>':'')+'<p>'+esc(e.definition||'')+(e.passageId?' <a class="glossary-locus" href="#passage-'+slug(e.passageId)+'">'+esc(e.passageId)+'</a>':'')+'</p></div>').join('')+'</section>';
}
function buildHtml(book,mode,css){
 const units=book.units.filter(u=>!isGuide(u)),stageById=new Map(book.stages.map(s=>[String(s.id),s]));
 const toc=[],pages=[];let lastStage='',lastChapter='';
 for(const u of units){
  const st=String(u.stage??'0'),stage=stageById.get(st)||{},chapter=st+'::'+String(u.chapter??'');
  if(st!==lastStage){
   const id='stage-'+slug(st);
   toc.push('<li class="toc-stage"><a href="#'+id+'">'+esc(stage.title||st)+'</a></li>');
   pages.push('<header class="stage-title" id="'+id+'"><span class="kicker">'+(st==='0'?'INTRODUCTION':book.id==='muzaffar-al-mantiq'?'BOOK '+esc(stage.bookNumber||3):'STAGE '+esc(st))+'</span>'+
     '<h2>'+esc(stage.title||st)+'</h2>'+
     (stage.arabicTitle?'<p class="arabic-title" lang="ar" dir="rtl">'+esc(stage.arabicTitle)+'</p>':'')+
     (stage.introductionArabic&&mode!=='reading'?'<div class="stage-original" lang="ar" dir="rtl">'+paragraphs(stage.introductionArabic,'rtl')+'</div>':'')+
     '</header>');
   lastStage=st;lastChapter='';
  }
  const anchor='passage-'+slug(u.id);
  pages.push('<section class="chapter" id="'+anchor+'"><span class="passage-reference">'+esc(u.id)+'</span>');
  if(chapter!==lastChapter){
   toc.push('<li class="toc-chapter"><a href="#'+anchor+'">'+esc(u.title||'')+'</a></li>');
   pages.push('<header class="chapter-title"><span class="chapter-index">'+(st==='0'?'INTRODUCTION':(book.id==='muzaffar-al-mantiq'?'READING SECTION ':'CHAPTER ')+esc(u.chapter??''))+'</span>'+
     '<h3>'+esc(u.title||'')+'</h3>'+
     (u.arabicTitle?'<p lang="ar" dir="rtl">'+esc(u.arabicTitle)+'</p>':'')+'</header>');
   lastChapter=chapter;
  }
  const ar=normal(u.arabic),en=normal(u.english);
  if(mode==='study'){
    pages.push('<div class="pair'+(!ar||!en?' pair-single':'')+'">'+
      (ar?'<div class="arabic" lang="ar" dir="rtl">'+passage(u,'arabic')+'</div>':'')+
      (en?'<div class="english" lang="en" dir="ltr">'+passage(u,'english')+'</div>':'')+'</div>');
  }else if(mode==='reference')pages.push('<div class="arabic full" lang="ar" dir="rtl">'+passage(u,'arabic')+'</div>');
  else pages.push(en?'<div class="english full" lang="en" dir="ltr">'+passage(u,'english')+'</div>':
    '<div class="arabic full" lang="ar" dir="rtl">'+passage(u,'arabic')+'</div>');
  pages.push(footnotes(u,mode)+'</section>');
 }
 const author=typeof book.author==='object'?book.author.name||'':book.author||'';
 const labels={study:'Arabic–English study edition',reading:'Reading edition',reference:'Arabic reference edition'};
 const english=units.filter(x=>normal(x.english)).length;
 return '<!doctype html><html><head><meta charset="utf-8"><title>'+esc(book.title)+'</title><style>'+css+'</style></head><body>'+
  '<section class="cover"><span class="eyebrow">Gnamma Research · Primary Texts</span>'+
  '<div class="ar" lang="ar" dir="rtl">'+esc(book.arabicTitle||'')+'</div><h1>'+esc(book.title)+'</h1><p>'+esc(author)+'</p>'+
  '<div class="rule"></div><span class="profile">'+esc(labels[mode])+'</span></section>'+
  '<section class="contents"><h2>Contents</h2><ol><li class="toc-stage"><a href="#edition-method">About this edition</a></li>'+toc.join('')+(book.glossary?.length?'<li class="toc-stage"><a href="#glossary">Glossary</a></li>':'')+'</ol></section>'+
  editionIntroduction(book)+'<main>'+pages.join('')+'</main>'+glossary(book)+'<footer class="source-summary">'+units.length+
  ' authorial reading passages; '+english+' with English. '+(book.editorialStatus?.collation?esc(book.editorialStatus.collation):'AI-assisted reading translation; consult the edition note for its coverage and review status.')+'</footer></body></html>';
}
async function main(){
 for(const m of modes)if(!['study','reading','reference'].includes(m))throw Error('Invalid PDF layout '+m);
 fs.mkdirSync(dest,{recursive:true});
 const font=fs.readFileSync(p.join(base,'../../daruri/fonts/amiri-regular.woff2')).toString('base64');
 const css=fs.readFileSync(p.join(base,'assets/hikma-pdf.css'),'utf8').replaceAll('__AMIRI_DATA__',font)+'\n'+
   fs.readFileSync(p.join(base,'assets/hikma-rich-text.css'),'utf8');
 if(css.includes('__AMIRI_DATA__'))throw Error('Unresolved Arabic font data');
 const {chromium}=require('playwright');
 const browser=await chromium.launch({args:['--disable-dev-shm-usage']});
 const page=await browser.newPage({viewport:{width:1200,height:850}});
 const manifest={schema:1,builder:'tools/build-pdfs.cjs',files:[]};
 try{
  for(const [id,title] of configs){
   const raw=fs.readFileSync(p.join(base,id,'data/book.json')),book=JSON.parse(raw.toString('utf8'));
   const source=crypto.createHash('sha256').update(raw).digest('hex');
   let supplementSource=null;
   if(id==='nihayat-al-hikma'){
     // Typeset and web editions share the same critical apparatus.
     const supplementBytes=fs.readFileSync(p.join(base,id,'data/editorial-supplement.json'));
     supplementSource=crypto.createHash('sha256').update(supplementBytes).digest('hex');
     const extra=JSON.parse(supplementBytes.toString('utf8'));
     book.sources=[...(book.sources||[]),...(extra.sources||[])];
     book.glossary=[...(book.glossary||[]),...(extra.glossary||[])];
     const byId=new Map(book.units.map(unit=>[unit.id,unit]));
     for(const note of extra.criticalNotes||[]){
       const unit=byId.get(note.passageId);
       if(!unit)throw Error('Unresolved Nihāya critical note '+note.id);
       const existing=unit.notes||[];
       const duplicate=existing.some(item=>
         (item.id && item.id===note.id) ||
         (item.url && item.url===note.url &&
          /^Textual emendation/i.test(item.type||'') &&
          /^Textual emendation/i.test(note.type||'')));
       if(!duplicate)unit.notes=[...existing,{...note}];
     }
   }
   for(const mode of modes){
    const filename=id+'-'+mode+'-A4.pdf';
    console.log('Rendering '+filename);
    await page.setContent(buildHtml(book,mode,css),{waitUntil:'load',timeout:180000});
    await page.evaluate(async()=>{await document.fonts.ready;const faces=await document.fonts.load('16px AmiriGnamma');if(!faces.length||faces.some(f=>f.status!=='loaded'))throw Error('Arabic print font failed to load');});
    const buf=await page.pdf({format:'A4',preferCSSPageSize:true,printBackground:true,
      displayHeaderFooter:true,headerTemplate:'<span></span>',
      footerTemplate:'<div style="width:100%;text-align:center;font:8px Georgia;color:#888"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
      margin:{top:'16mm',bottom:'18mm',left:'15mm',right:'15mm'},timeout:240000});
    if(buf.length<15000||buf.subarray(0,5).toString('utf8')!=='%PDF-')throw Error('Bad PDF '+filename);
    fs.writeFileSync(p.join(dest,filename),buf);
    manifest.files.push({book:title,mode,filename,bytes:buf.length,sha256:crypto.createHash('sha256').update(buf).digest('hex'),
      source_sha256:source,supplement_sha256:supplementSource,arabic_sections:book.units.filter(x=>!isGuide(x)&&normal(x.arabic)).length,
      english_sections:book.units.filter(x=>!isGuide(x)&&normal(x.english)).length});
   }
  }
 }finally{await page.close();await browser.close()}
 fs.writeFileSync(p.join(dest,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 console.log('Generated '+manifest.files.length+' PDF editions');
}
module.exports={buildHtml};
if(require.main===module)main().catch(e=>{console.error(e.stack||e);process.exitCode=1});
