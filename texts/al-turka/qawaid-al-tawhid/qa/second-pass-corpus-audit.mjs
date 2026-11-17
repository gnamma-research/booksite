#!/usr/bin/env node
/* Reproducible complete-corpus structural, Arabic-source and publication audit.
 * Does NOT claim line-by-line semantic correctness or manuscript collation.
 * Run: node qa/second-pass-corpus-audit.mjs (from any directory).
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const norm=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/[^ء-ي]/g,'');
const wordCount=s=>(String(s||'').match(/[\u0621-\u064a]+/g)||[]).length;
const englishWords=s=>(String(s||'').match(/[a-zA-Z]+(?:['’-][a-zA-Z]+)*/g)||[]).length;
function loadWindow(file,key){
 const W={};vm.runInNewContext(read(file),{window:W});if(!W[key])throw Error('Missing '+key+' in '+file);return JSON.parse(JSON.stringify(W[key]));
}
const matn=loadWindow('data/units.js','GNAMMA_QAWAID_MATN').units;
const corpus=JSON.parse(read('data/commentary-corpus.json'));
const commentary=corpus.units;
const references=loadWindow('data/primary-reference-register.js','GNAMMA_QAWAID_REFERENCES').items;
const lexicon=loadWindow('data/linked-lexicon.js','GNAMMA_QAWAID_TERMS').terms;
const pdfManifest=JSON.parse(read('pdf/manifest.json'));
const A=[...JSON.parse(read('sources/A_MAIN_048_095.json')).pages,...JSON.parse(read('sources/A_MAIN_095_270.json')).pages];
const apages=new Map(A.map(x=>[x.printed_page,x]));
const units=[...matn,...commentary],ids=new Map(units.map(x=>[x.id,x]));
const fail=[],notice=[],records=[];
const chk=(condition,message)=>{if(!condition)fail.push(message)};
const unique=(xs)=>new Set(xs).size===xs.length;
chk(matn.length===61,'Expected 61 distinct matn lemmata');
chk(commentary.length===110,'Expected 110 commentary units');
chk(unique(units.map(x=>x.id)),'Duplicate text IDs');
chk(commentary.filter(x=>x.part==='introduction').length===40,'Introduction count');
chk(commentary.filter(x=>x.part==='main').length===64,'Main commentary count');
chk(commentary.filter(x=>x.part==='conclusion').length===6,'Closing commentary count');
chk(lexicon.length===82,'Dictionary count');
chk(references.length===18,'Primary-reference register count');
chk([...apages.keys()].filter(x=>x>=48&&x<=270).length===223,'Retained A source pages should cover 48–270');
for(let n=1;n<=61;n++)chk(ids.has('QT-'+String(n).padStart(3,'0')),'Missing QT '+n);
for(let n=1;n<=60;n++)chk(ids.has('SH-'+String(n).padStart(3,'0')),'Missing main SH '+n);
for(let n=1;n<=40;n++)chk(ids.has('SH-INTRO-'+String(n).padStart(3,'0')),'Missing intro SH '+n);
for(const id of ['SH-035-B','SH-036-B','SH-039-B','SH-040-B','SH-061-A','SH-061-B','SH-061-C','SH-061-D','SH-061-E','SH-061-F'])chk(ids.has(id),'Missing connected or concluding '+id);
const sourceMatch=(u)=>{
 if(u.id.startsWith('SH-INTRO-'))return {score:null,status:'N page-scoped online citation; independent line-snapshot collation outstanding'};
 if(u.id.startsWith('SH-061'))return {score:null,status:'A pp.270–274: independent closing-page source check; complete retained page snapshot not included'};
 const pg=u.pages||(u.page?[u.page]:[]);
 const src=norm(pg.map(n=>apages.get(n)?.text||'').join(' '));
 const ar=norm(u.arabic);
 if(!src||!ar)return {score:null,status:'source page outside retained snapshot'};
 const step=Math.max(18,Math.floor(ar.length/40)),slices=[];
 for(let i=0;i+18<=ar.length;i+=step)slices.push(ar.slice(i,i+18));
 const hit=slices.filter(fragment=>src.includes(fragment)).length;
 return {score:slices.length?+(hit/slices.length).toFixed(3):null,status:'fixed A digital page transcription',sampledFragments:slices.length};
};
const seenLinks=new Set();
for(const u of units){
 chk(Boolean(u.arabic?.trim()&&u.english?.trim()),'Missing Arabic or English: '+u.id);
 if(u.matnId){chk(ids.has(u.matnId),'Missing target matn ID for '+u.id);seenLinks.add(u.matnId);}
 if(u.precedingMatn)chk(/Abū Ḥāmid/.test(u.precedingMatn.attribution||''),'Wrong attribution for ancestral bridge '+u.id);
 if(u.sourceTextSha256){
  const computed=hash(String(u.arabicSourceTranscription||'').trim().replace(/\s+/g,' '));
  chk(computed===u.sourceTextSha256,'Recorded original-source hash mismatch: '+u.id);
 }
 const m=sourceMatch(u),ar=wordCount(u.arabic),en=englishWords(u.english),ratio=en/Math.max(ar,1);
 if(ratio<0.65||ratio>2.4)notice.push({id:u.id,type:'translation-length-outlier',ratio:+ratio.toFixed(2)});
 if(m.score!==null&&m.score<0.72)notice.push({id:u.id,type:'low-normalized-source-fragment-overlap',score:m.score,pages:u.pages||[]});
 records.push({id:u.id,part:u.part||'matn',matnId:u.matnId||null,pages:u.pages||[u.page].filter(Boolean),arabicWords:ar,englishWords:en,ratio:+ratio.toFixed(3),arabicSourceStatus:m.status,sourceFragmentOverlap:m.score,sampledFragments:m.sampledFragments||null,recordedSourceHashVerified:Boolean(u.sourceTextSha256),editorialReview:'not independently certified clause by clause'});
}
chk(seenLinks.size===61,'Some original matn lemmata have no linked commentary');
chk(commentary.filter(u=>u.sourceTextSha256).length===64,'64 main source hashes expected');
for(const r of references){
 for(const id of r.units||[])chk(ids.has(id),'Broken primary reference '+r.id+' -> '+id);
 if(r.quoteFrom)chk(ids.has(r.quoteFrom),'Missing quotation source '+r.id);
 if(Number.isInteger(r.quoteIndex)){
  const ar=ids.get(r.quoteFrom)?.arabic||'';
  const quoted=[...ar.matchAll(/«([^»]{28,12000})»/g)];
  chk(r.quoteIndex>=0&&r.quoteIndex<quoted.length,'Out-of-range exact Arabic quotation index '+r.id);
 }
 if(r.quoteStart&&r.quoteEnd){const ar=ids.get(r.quoteFrom)?.arabic||'';chk(ar.indexOf(r.quoteStart)>=0&&ar.indexOf(r.quoteEnd,ar.indexOf(r.quoteStart))>ar.indexOf(r.quoteStart),'Unverified quote anchors '+r.id);}
}
chk(pdfManifest.files?.length===5,'Expected five released PDFs');
const pdfAudit=[];
for(const r of pdfManifest.files||[]){
 const file=path.join(root,'pdf',r.filename);
 if(!fs.existsSync(file)){fail.push('Published PDF missing: '+r.filename);continue}
 const b=fs.readFileSync(file);
 const item={filename:r.filename,bytes:b.length,sha256:hash(b),hasPdfHeader:b.subarray(0,5).toString()==='%PDF-'};
 chk(item.hasPdfHeader,'Not a PDF: '+r.filename);
 chk(item.bytes===r.size_bytes,'Size mismatch: '+r.filename);
 chk(item.sha256===r.sha256,'SHA-256 mismatch: '+r.filename);
 pdfAudit.push(item);
}
for(const file of ['commentary.html','downloads/Tamhid_Complete_Commentary_Reading_Edition.html']){
 const html=read(file);
 chk((html.match(/<style>/g)||[]).length===(html.match(/<\/style>/g)||[]).length,'Unclosed CSS block: '+file);
 chk(html.indexOf('</head>')<html.indexOf('<body'),'Body location invalid: '+file);
}
const report={date:'2026-11-07',kind:'complete-corpus machine-verifiable audit, not manuscript collation or scholarly line-by-line acceptance',
counts:{matn:61,introduction:40,main:64,conclusion:6,allBilingual:units.length,technicalDictionary:lexicon.length,primaryReferenceCards:references.length,pdfs:pdfAudit.length},
sourceEvidence:{fixedADigitalPages:'48–270',uniquePages:apages.size,verifiedSHAforMain:commentary.filter(u=>u.sourceTextSha256).length,introduction:'N online print; no independent full manuscript collation',conclusion:'A pp.271–274 independently inspected online 7 Nov 2026; not included in retained A_MAIN_095_270 snapshot',ancestralQT059:'source-reported lacuna explicitly deferred'},
semanticVerification:'Automatic character overlap, hash, page scope and length indicators do not establish the accuracy of individual English clauses, readings, or doctrinal interpretation.',
warnings:notice,errors:fail,units:records,pdfAudit};
const dest=path.join(root,'qa/second-pass-corpus-audit.json');
fs.writeFileSync(dest,JSON.stringify(report,null,2)+'\n');
const summary=`# Qawāʿid / Tamhīd — second-pass reproducible audit

**7 November 2026.** This record distinguishes confirmed file/source integrity from a still-unfinished scholarly critical edition.

## Corpus checked

- **61** bilingual ancestral matn units and **110** bilingual descendant commentary units: 40 introduction, 64 main, 6 conclusion.
- All section identifiers, authorial layers, original-matn links, 18 primary-source cards and 82 technical dictionary records are checked automatically.
- All 64 preserved main-commentary SHA-256 source fingerprints are rechecked against the retained Arabic transcriptions.
- Electronic source pages A 48–270, with the corresponding normalized Arabic-fragment overlap score for each relevant unit; discrepancies are review cues, not licence to emend Arabic silently.
- Five published PDF files are checked byte-for-byte against their manifest hashes and for the PDF signature.

## Limits and decisions

The six final commentary units (A 270–274) were compared separately against the publicly accessible A source pages [270](https://ablibrary.net/book_content/b/17638/466?lang=ar), [271](https://ablibrary.net/book_content/b/17638/467?lang=ar), [272](https://ablibrary.net/book_content/b/17638/468?lang=ar), [273](https://ablibrary.net/book_content/b/17638/469?lang=ar), and [274](https://ablibrary.net/book_content/b/17638/470?lang=ar). The A 271–274 passages are **not** in the existing retained A_MAIN_095_270 source snapshot, so a machine match there would be spurious. The SH-061 texts carefully distinguish medieval commentary from Āshtiyānī's much later Persian and Arabic marginalia/colophon.

The introduction's N source and the 61 ancestral lemmata are not proven manuscript-collated. The 61-unit text retains the expressly editorial opening choice; QT-059's reported lost ancestral material is **deferred and not reconstructed**. Differences in the published electronic text remain apparatus questions.

The recovered SH-028 quotation from *al-Ḥikma al-Rashīdiyya* now has exact start and end anchors, so the source card shows a **bounded quotation** rather than falsely displaying the whole surrounding discussion. It does not claim independent collation of the ancestor's different book.

A successful content-inventory and PDF-hash audit **does not verify all Arabic–English clauses for theological, philosophical, or linguistic accuracy**. Such certification must remain open to specialist review and checked independent textual witnesses. No claim of a manuscript-based stemma or real-device iOS Safari visual inspection is made.

## Machine output

[Per-unit audit, source fingerprint checks, anomalies and PDF hashes](../qa/second-pass-corpus-audit.json)

**Audit outcome:** ${fail.length?'FAIL — '+fail.length+' blocking findings':'PASS for machine-verifiable integrity'}; ${notice.length} nonblocking length/source-review flags.
`;
fs.writeFileSync(path.join(root,'editorial/SECOND_PASS_REVIEW_2026-11-07.md'),summary);
console.log(JSON.stringify({passed:fail.length===0,files:dest,units:records.length,sourceHashes:commentary.filter(u=>u.sourceTextSha256).length,notices:notice.length,blocking:fail.slice(0,12),pdfs:pdfAudit.length}));
if(fail.length)process.exitCode=1;
