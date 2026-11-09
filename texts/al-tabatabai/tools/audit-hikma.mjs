#!/usr/bin/env node
/**
 * Gnamma Hikma reader data-quality checks.
 *
 * No build or external packages required:
 *   node texts/al-tabatabai/tools/audit-hikma.mjs
 *
 * This script checks technical integrity; it does not claim philological
 * collation, scholarly approval, or completion of unpublished translations.
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const books=[
  ['Muẓaffar',join(root,'muzaffar-al-mantiq/data/book.json')],
  ['Bidāya',join(root,'bidayat-al-hikma/data/book.json')],
  ['Nihāya',join(root,'nihayat-al-hikma/data/book.json')]
];
const failures=[],warnings=[],report=[];
const check=(condition,message)=>{if(!condition)failures.push(message);};
const warn=(condition,message)=>{if(!condition)warnings.push(message);};
for(const [name,file] of books){
  if(!existsSync(file)){failures.push(name+': missing source '+file);continue;}
  let data;
  try{data=JSON.parse(readFileSync(file,'utf8'));}
  catch(err){failures.push(name+': invalid JSON '+err.message);continue;}
  const stages=Array.isArray(data.stages)?data.stages:[];
  const units=Array.isArray(data.units)?data.units:[];
  const stageIds=new Set(stages.map(x=>String(x.id)));
  const ids=new Set(),groups=new Set();
  for(const unit of units){
    check(typeof unit.id==='string'&&!!unit.id,name+': blank passage identifier');
    check(!ids.has(unit.id),name+': duplicate passage '+unit.id);
    ids.add(unit.id);
    check(stageIds.has(String(unit.stage)),name+': '+unit.id+' unknown stage '+unit.stage);
    check(typeof unit.title==='string'&&!!unit.title.trim(),name+': '+unit.id+' blank title');
    check(typeof unit.arabic==='string'||typeof unit.english==='string',name+': '+unit.id+' missing text');
    groups.add(String(unit.stage)+'::'+String(unit.chapter));
  }
  const arabic=units.filter(u=>u.arabic&&u.arabic.trim()).length;
  const translated=units.filter(u=>u.english&&u.english.trim()).length;
  const glossary=Array.isArray(data.glossary)?data.glossary:[];
  const lemmaIds=new Set();
  for(const entry of glossary){
    const lemma=(entry.arabic||entry.term||'').normalize('NFKC').replace(/\s+/g,'');
    warn(!!lemma,name+': blank glossary lemma');
    warn(!lemmaIds.has(lemma),name+': repeated glossary lemma '+lemma);
    lemmaIds.add(lemma);
    if(entry.passageId)check(ids.has(entry.passageId),name+': broken dictionary target '+entry.passageId);
  }
  if(name==='Bidāya'){
    const numbered=units.filter(u=>/^B-(?:I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)-\d{2}$/.test(u.id));
    check(units.length===111,'Bidāya must contain 111 authorial reading units');
    check(numbered.length===110,'Bidāya must retain 110 numbered chapters');
    check(translated===111,'Bidāya must have working English in all authorial units');
    check(data.editorialStatus?.translationComplete===true,'Bidāya working translation completion metadata must be true');
    check(data.editorialStatus?.englishTranslatedChapters===110,'Bidāya translated chapters must total 110');
    check(data.editorialStatus?.englishTranslatedIntroductions===1,'Bidāya translated introduction must total one');
    check(stages.filter(x=>String(x.id)!=='0').length===12,'Bidāya must contain twelve numbered stages');
    for(const u of units){
      if(/[RT5]/.test(u.arabic||''))failures.push('Bidāya: imported OCR placeholder in '+u.id);
      if(/CHAPTER\s+[A-Z]+:/.test(u.arabic||''))failures.push('Bidāya: injected source heading in '+u.id);
      if(u.arabic?.trim()&&u.english?.trim()&&u.english.length/u.arabic.length<0.55)
        warnings.push('Bidāya: unusually short translation requires review in '+u.id);
    }
  }
  if(name==='Nihāya'){
    check(units.length===136,'Nihāya should preserve 136 authorial reading units');
    check(translated===136,'Nihāya should have working English in all 136 units');
  }
  if(name==='Muẓaffar'){
    check(data.editorialStatus?.translationComplete!==true,'Muẓaffar selections must not be called a complete edition');
    check(units.some(u=>u.id==='M-P-01'),'Muẓaffar introduction must precede its Book III selections');
  }
  warn(arabic>0,name+': Arabic source missing');
  warn(translated===units.length,name+': English is incomplete ('+translated+'/'+units.length+')');
  report.push({book:name,stages:stages.length,passages:units.length,arabic,english:translated,chapterGroups:groups.size,glossary:glossary.length});
}
for(const name of ['index.html','muzaffar-al-mantiq/index.html','bidayat-al-hikma/index.html','nihayat-al-hikma/index.html']){
 const file=join(root,name);
 if(!existsSync(file)){failures.push('Missing reader page '+name);continue;}
 const src=readFileSync(file,'utf8');
 check(src.includes('hikma-refinements.js')&&src.includes('hikma-refinements.css'),'Missing reader enhancements in '+name);
 check(src.includes('hikma-reader.js')||src.includes('hikma-combined.js'),'Missing primary reader script in '+name);
}
for(const name of ['assets/hikma-reader.js','assets/hikma-combined.js','assets/hikma-refinements.js','assets/hikma-reader.css','assets/hikma-refinements.css']){
 check(existsSync(join(root,name)),'Missing shared asset '+name);
}

/* Validate full Muẓaffar source map, exact Nihāya glossary locators, and PDF witness audit. */
const arabicKey=v=>String(v||'').normalize('NFKC').replace(/[\u064b-\u065f\u0670\u0640\s]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي');
function readJson(path,label){
  if(!existsSync(path)){failures.push(label+': missing');return null;}
  try{return JSON.parse(readFileSync(path,'utf8'));}
  catch(e){failures.push(label+': invalid JSON '+e.message);return null;}
}
const mMap=readJson(join(root,'muzaffar-al-mantiq/data/authorial-map.json'),'Muẓaffar source map');
const mText=readJson(join(root,'muzaffar-al-mantiq/data/book.json'),'Muẓaffar source text');
if(mMap&&mText){
  check(mMap.parts.length===7,'Muẓaffar must map introduction plus six books');
  check(mMap.parts.reduce((n,x)=>n+x.availableUnits,0)===mText.units.length,'Muẓaffar mapped translation count mismatch');
  check(mMap.parts.reduce((n,x)=>n+x.topics.length,0)>=60,'Muẓaffar map lost section titles');
  for(const p of mMap.parts){
    check(p.start>0&&p.end>=p.start,'Muẓaffar invalid page range for book '+p.book);
    for(const t of p.topics)if(t.firstPrintedPage){
      check(t.locatorStatus==='observed in source table of contents','Unverified Muẓaffar page locator '+t.arabic);
      check(t.firstPrintedPage>=p.start&&t.firstPrintedPage<=p.end,'Muẓaffar locator outside book');
    }
  }
}
const nText=readJson(join(root,'nihayat-al-hikma/data/book.json'),'Nihāya source text');
const nExtra=readJson(join(root,'nihayat-al-hikma/data/editorial-supplement.json'),'Nihāya editorial supplement');
if(nText&&nExtra){
  check(nExtra.glossary.length===47,'Nihāya supplemental glossary lost entries');
  const ids=new Map(nText.units.map(u=>[u.id,u]));
  const known=new Set(nText.glossary.map(x=>arabicKey(x.arabic||x.term)));
  for(const entry of nExtra.glossary){
    check(!known.has(arabicKey(entry.arabic||entry.term)),'Duplicated Nihāya glossary lemma '+entry.arabic);
    known.add(arabicKey(entry.arabic||entry.term));
    const u=ids.get(entry.passageId);
    check(!!u,'Invalid Nihāya passage target '+entry.passageId);
    if(u)check(arabicKey(u.arabic).includes(arabicKey(entry.arabic)),'Nihāya passage does not contain lemma '+entry.arabic);
    check(/comparative/i.test(entry.editorialOrigin||''),'Unmarked Nihāya comparative glossary entry '+entry.arabic);
  }
  check(nExtra.sources.length===2,'Nihāya revised two-volume witness incomplete');
}
const bAudit=readJson(join(root,'audits/bidaya-325page-source-parity-2026-11-07.json'),'Bidāya PDF witness audit');
if(bAudit){
  check(bAudit.summary.originalUnits===111&&bAudit.summary.sourcePagesRead===325,'Bidāya source witness audit not exhaustive across printed source');
  check((bAudit.method?.limits||'').includes('NOT an independent edition'),'Bidāya same-source comparison must not be described as independent collation');
}

/* Guard the cumulative passage-verification register without treating AI translation as certified. */
const review=readJson(join(root,'audits/cross-book-review-register-2026-11-07.json'),'Cross-book review register');
if(review){
  const expected=(mText?.units.length||0)+(nText?.units.length||0)+111;
  check(review.entries.length===expected,'Cross-book review register no longer covers all local passages');
  check(new Set(review.entries.map(x=>x.id)).size===review.entries.length,'Duplicate cross-book review record IDs');
  check(review.summary?.expertReviewedUnitsVerified===0 &&
    review.summary?.statusLabels?.criticalEdition==='NOT VERIFIED',
    'Review register must not present non-certified translations as a definitive critical edition');
  check(review.entries.every(x=>x.translationAssessment?.includes('NOT yet independently checked')),
    'An unchecked review record is incorrectly marked as certified');
}
if(nText&&nExtra){
  const validIds=new Set(nText.units.map(x=>x.id));
  const criticalIds=new Set();
  for(const note of nExtra.criticalNotes||[]){
    check(!criticalIds.has(note.id),'Duplicate Nihāya critical note '+note.id);
    criticalIds.add(note.id);
    check(validIds.has(note.passageId),'Unresolved Nihāya critical note passage '+note.passageId);
    check(/https:\/\/lib\.rafed\.net\//.test(note.url||''),'Nihāya critical note lacks printed-witness link '+note.id);
    check(!!note.source,'Nihāya critical note lacks source distinction '+note.id);
  }
  /* 1428 AH printed-editor emendations: not independently manuscript-attested. */
  const adoptedReadings=[
    ['N-I-02','ولو كانت عين الوجود لم يجز أن تسلب عن نفسها','ولو كانت عين الوجود لم يجز أن يسلب عنها','N1428-I02-01'],
    ['N-II-02','كان جوهراً أو عرضاً ـ موجوداً في نفسه رابطاً','كان جوهراً أو عرضاً ـ رابطاً','N1428-II02-01'],
    ['N-VI-03','عطف الصور الطبيعيّة','عطف الصورة الطبيعيّة','N1428-VI03-01'],
    ['N-VI-15','بما أنّها كمالاتها الثانية','بما أنّها كمالاته الثانية','N1428-VI15-01'],
    ['N-VI-15','يتمّيز به الكمال من غيره','يميّز به الكمال من غيره','N1428-VI15-01'],
    ['N-VI-16','المضاف إلى\n\nالابن ـ مثلا ـ','المضاف إلى\n\nالأب ـ مثلا ـ','N1428-VI16-01'],
    ['N-VI-16','ينتزع من الموضوعين الواجدين','ينتزع لكلّ من الموضوعين الواجدين','N1428-VI16-01'],
    ['N-VI-16','وصفاً ناعتاً لهما انتزاعاً','وصفاً ناعتاً له انتزاعاً','N1428-VI16-01']
  ];
  for(const [passageId,earlier,adopted,noteId] of adoptedReadings){
    const unit=nText.units.find(u=>u.id===passageId);
    check(!!unit,'Missing emended Nihāya passage '+passageId);
    if(!unit)continue;
    check(unit.arabic.includes(adopted),'Adopted reading reverted: '+passageId+' '+adopted);
    check(!unit.arabic.includes(earlier),'Earlier base reading reintroduced: '+passageId);
    check(criticalIds.has(noteId),'Missing printed-editor critical note '+noteId);
    const entry=review?.entries?.find(x=>x.id===passageId);
    check(entry?.supplementalCriticalNoteIds?.includes(noteId),'Review register missing '+noteId);
  }
  check(review?.summary?.N?.adoptedPrintedEditorialEmendations>=adoptedReadings.length,
    'Review register understates source-recorded Nihāya emendations');
}
console.log(JSON.stringify({status:failures.length?'failed':'passed',books:report,failures,warnings},null,2));
process.exitCode=failures.length?1:0;
