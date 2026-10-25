'use strict';
/* Audit current published personal-word maps against verified English note anchors.
 * This reports PRECISION and safe fallbacks, not merely section-count coverage.
 * No PDFs or maps are modified, and ambiguous phrases MUST remain unhighlighted. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(base,p),'utf8'));
const manifest=read('pdf-editions-manifest.json');
const alignment=read('qa/ENGLISH_NOTE_ALIGNMENT.json');
const js=fs.readFileSync(path.join(base,'personal-pdf-enhancements.js'),'utf8');
const context={window:{},document:{},URL,Intl,Date,Number,String,Array,Map,Set,Math};
vm.runInNewContext(js,context,{timeout:5000});
const matcher=context.window.GnammaPdfUpgrade?.sourceMatch;
assert.equal(typeof matcher,'function','Exact selected words must fail closed without matching');
const cases=alignment.english_phrase_anchors;
assert(cases?.length>=110,'Expected authoritative current English note anchors');
const results=[];
for(const file of ['daruri.pdf','daruri-study.pdf','daruri-english.pdf']){
 const meta=read('build/release/'+file+'.metadata.json'),words=read('personal-anchor-maps/'+file+'.json');
 assert.equal(words.source_sha256,manifest.files[file].sha256,'Stale '+file+' map identity');
 assert.equal(words.source_sha256,meta.sha256,'Stale '+file+' PDF metadata');
 let matched=0,fallback=0,unsafe=0;
 const casesOut=[];
 for(const row of cases){
  const key=[row.section,row.segment,'en'].join(':');
  const segment=words.segments[key]||[];
  const hit=matcher(segment,{quote:row.english});
  let state='section-fallback';
  if(hit){
   const anchor=meta.anchors?.['segment-'+row.section+'-'+row.segment+'-en'];
   const pageIsExact=anchor?.page===hit.page;
   const rectSafe=hit.rects.every(r=>r.x0>=0&&r.y0>=0&&r.x1>r.x0&&r.y1>r.y0&&
     r.x1<=600&&r.y1<=850);
   if(!pageIsExact||!rectSafe){unsafe++;state='unsafe-exact-link';}
   else {matched++;state='exact-match';}
  }else fallback++;
  casesOut.push({section:row.section,paragraph:row.segment+1,id:row.note_id,
    phrase:row.english,source_tokens:segment.length,result:state,
    page:hit?.page||null});
 }
 const mappedTokens=Object.values(words.segments).reduce((n,a)=>n+a.length,0);
 const out={pdf:file,sha:words.source_sha256,pages:meta.pages,
   segmentCoverage:words.coverage,mappedTokens,notePhrases:cases.length,
   exact:matched,sectionFallback:fallback,unsafeExact:unsafe,
   fallbackExamples:casesOut.filter(x=>x.result!=='exact-match').slice(0,24),
   teacherTerms:casesOut.filter(x=>['N002','N003','N005'].includes(x.id))};
 results.push(out);
 console.log('PERSONAL MAP PHRASES '+JSON.stringify(out).slice(0,6600));
 if(unsafe)process.exitCode=1;
}
const root=path.join(__dirname,'personal-word-audit');
fs.mkdirSync(root,{recursive:true});
fs.writeFileSync(path.join(root,'report.json'),JSON.stringify(results,null,2));
if(results.some(r=>r.unsafeExact))throw Error('Unsafe generated word-level source destinations detected');
console.log('PASS exact selected-note phrase QA: '+results.map(r=>
 r.pdf+' '+r.exact+'/'+r.notePhrases+' exact, '+r.sectionFallback+' safe fallbacks').join('; '));
