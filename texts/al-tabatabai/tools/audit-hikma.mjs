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
import { createHash } from 'node:crypto';
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
    check(units.filter(u=>/^M-K-(0[1-9]|1[0-7])$/.test(u.id)).length===17,
      'Muẓaffar Book II must preserve seventeen working bilingual reading units, some source-normalized');
    check(units.length===101,'Muẓaffar must retain 101 selected Arabic-English working passages, 47 Book IV readings and the Book V preface');
    const newBook4=Array.from({length:47},(_,i)=>'M-C-'+String(i+1).padStart(2,'0'));
    check(stages.some(x=>x.id==='C'&&x.bookNumber===4),'Muẓaffar new Book IV stage missing');
    check(newBook4.every(id=>units.some(u=>u.id===id&&u.stage==='C'&&u.arabic.length>350&&u.english.length>850)),
      'Muẓaffar 47 source-grounded Book IV selected Arabic-English readings missing/truncated');
    check(stages.some(x=>x.id==='V'&&x.bookNumber===5)&&units.filter(u=>u.stage==='V').length===1&&
      units.find(u=>u.id==='M-V-01')?.source?.page==='198–199','Book V preface must be distinct from Book IV');
    const square=units.find(u=>u.id==='M-C-30')?.sourceDiagram;
    check(square?.nodes?.length===4&&square?.relations?.length===6,'Source square must retain four propositions and six relations');
    check(units.find(u=>u.id==='M-C-46')?.notes?.some(n=>n.type==='Existential conditions'&&
      n.text.includes('non-C must be nonempty')&&n.text.includes('C must be nonempty')),
      'Relation table must distinguish the required nonempty classes');
    check(units.find(u=>u.id==='M-C-25')?.source?.page==='160','Corrected displayed locator for M-C-25 lost');
    check(stages.some(x=>x.id==='K'&&x.bookNumber===2),'Muẓaffar Book II stage is missing');
    const universalIds=['M-K-01','M-K-02','M-K-03','M-K-04','M-K-05','M-K-06','M-K-07','M-K-08','M-K-09','M-K-10','M-K-11','M-K-12','M-K-13','M-K-14','M-K-15','M-K-16','M-K-17'];
    check(units.find(u=>u.id==='M-K-08')?.notes?.some(n=>/conjecture|inconsistent|not logically consistent/i.test(n.text||'')),
      'Source-critical conjecture in M-K-08 must remain explicit');
    check(units.find(u=>u.id==='M-K-14')?.notes?.some(n=>/not a diplomatic|normalized/i.test(n.text||'')),
      'Normalized M-K-14 must not masquerade as exact diplomatic Arabic');
    const newBook1=['M-L-05','M-L-06','M-L-07','M-L-08','M-L-09','M-L-10','M-L-11'];
    check(newBook1.every(id=>units.some(u=>u.id===id&&u.stage==='L'&&u.arabic.length>500&&u.english.length>500)),
      'Missing new original Muẓaffar Book I source and working translation');
    check(universalIds.every(id=>units.find(u=>u.id===id)?.english?.length>350),
      'Muẓaffar Book II bilingual passage is missing or unexpectedly short');
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
 check(src.includes('hikma-rich-text.js')&&src.includes('hikma-rich-text.css'),'Missing shared table/figure renderer in '+name);
}
for(const name of ['assets/hikma-reader.js','assets/hikma-combined.js','assets/hikma-refinements.js','assets/hikma-reader.css','assets/hikma-refinements.css','assets/hikma-rich-text.js','assets/hikma-rich-text.css']){
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
  check(mMap.summary?.localTranslatedUnits===mText.units.length,
    'Muẓaffar map summary is stale');
  check(mMap.parts.find(p=>p.book===1)?.availableUnits===11,
    'Muẓaffar source map lost new Book I source coverage');
  check(mMap.parts.find(p=>p.book===2)?.availableUnits===17,
    'Muẓaffar source map must register Book II opening');
  check(mMap.parts.find(p=>p.book===4)?.availableUnits===47&&mMap.parts.find(p=>p.book===5)?.availableUnits===1,
    'Muẓaffar source map must register 47 Book IV readings and one Book V preface');
  check(mMap.parts.reduce((n,x)=>n+x.topics.length,0)>=60,'Muẓaffar map lost section titles');
  for(const p of mMap.parts){
    check(p.start>0&&p.end>=p.start,'Muẓaffar invalid page range for book '+p.book);
    for(const t of p.topics)if(t.firstPrintedPage){
      check(['observed in source table of contents','observed in searchable source page; early scan pending collation','observed in 1402 AH searchable source page; early 1968 printed witness pending visual collation'].includes(t.locatorStatus),'Unverified Muẓaffar page locator '+t.arabic);
      check(t.firstPrintedPage>=p.start&&t.firstPrintedPage<=p.end,'Muẓaffar locator outside book');
    }
    for(const t of p.topics)if(t.firstDisplayedPage){
      check(t.locatorStatus==='directly read Rafed displayed page; physical 1968 pagination not collated',
        'Displayed page must retain its source grade: '+t.arabic);
      check(t.firstDisplayedPage>=p.start&&t.firstDisplayedPage<=p.end,'Displayed locator outside source book');
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
  check(review.entries.filter(x=>x.id!=='N-IX-09').every(x=>x.translationAssessment?.includes('NOT yet independently checked')),
    'An unchecked review record is incorrectly marked as independently collated');
  check(review.entries.filter(x=>x.englishCollation?.independentlyCollated).map(x=>x.id).join(',')==='N-IX-09',
    'Full external chapter comparison must be restricted to documented IX.9');
}

/* Translation-to-source triage is distinct from independent scholarly collation. */
const nTriage=readJson(join(root,'audits/nihaya-english-collation-triage-2026-11-09.json'),
  'Nihāya English collation triage');
if(nText&&nTriage){
  const rows=Array.isArray(nTriage.rows)?nTriage.rows:[];
  check(rows.length===nText.units.length,'Nihāya English triage must cover all 136 units');
  check(new Set(rows.map(x=>x.id)).size===rows.length,'Nihāya duplicate triage identifier');
  const original=new Map(nText.units.map(x=>[x.id,x]));
  for(const r of rows){
    const u=original.get(r.id);
    check(!!u,'Nihāya triage unknown passage '+r.id);
    if(!u)continue;
    check(r.arabicChars===u.arabic.length&&r.englishChars===u.english.length,
      'Nihāya English triage stale source/translation content at '+r.id);
    check(r.englishReview?.independentWitnessCollation===(r.id==='N-IX-09')&&
      r.englishReview?.externalExpertCertification===false,
      'Nihāya external comparison/certification grade is incorrect at '+r.id);
    const sha=s=>createHash('sha256').update(s).digest('hex');
    check(r.englishReview?.currentArabicSha256===sha(u.arabic)&&r.englishReview?.currentEnglishSha256===sha(u.english),
      'Nihāya review hashes do not describe current text at '+r.id);
    const register=review?.entries?.find(x=>x.id===r.id);
    check(register?.englishCollation?.structuralScreen==='checked-automatically',
      'Cumulative review register not linked to triage '+r.id);
  }
  check(nTriage.summary?.automaticallyScreened===136,'Incomplete Nihāya full-corpus screening');
  check(nTriage.summary?.locallyReadAgainstStoredArabic===136,'Nihāya must preserve 136 complete local bilingual readings');
  check(nTriage.summary?.secondaryPrintedDigitalSpotChecks===13,
    'Nihāya revised printed-digital spot checks must remain individually documented');
  check(rows.filter(r=>r.englishReview?.status==='local-bilingual-reading-checked').length===136,
    'Nihāya direct bilingual checks mismatch cumulative register');
  const unitXI=nText.units.find(u=>u.id==='N-XI-PRE');
  check(unitXI?.english.includes('“intellect” (al-ʿaql)')&&!unitXI?.english.includes('term “intellection”'),
    'Nihāya XI stage heading reverted to imprecise English');
  const unitIX11=nText.units.find(u=>u.id==='N-IX-11');
  check(unitIX11?.english.includes('Intermediate motion corresponds to the instant through traversal motion.') &&
    !unitIX11?.english.includes('Intermediate motion corresponds to time through traversal motion.') &&
    arabicKey(unitIX11?.arabic).includes(arabicKey('الحركة التوسّطيّة منطبقةٌ عليه بواسطة القطعيّة')),
    'Nihāya IX.11 grammatical scope: intermediate motion refers to the instant (al-ān), not time (al-zamān)');
  const xi8=nText.units.find(u=>u.id==='N-XI-08');
  check(xi8?.notes?.some(n=>/Negative predication and judgment/.test(n.text||'')) &&
    xi8?.arabic?.includes('ولا حكم فيها') && xi8?.arabic?.includes('والحقّ'),
    'Nihāya XI.8 negative judgment interpretive crux must retain its source and public note');
  const unitVI19=nText.units.find(u=>u.id==='N-VI-19');
  check(unitVI19?.english.includes('imaginal form divested of quantity')&&arabicKey(unitVI19?.arabic).includes(arabicKey('المجردة من الكم')),
    'Nihāya VI.19 scope correction lost');
  check(nText.units.find(u=>u.id==='N-VIII-10')?.arabic.startsWith('المشهور'),
    'Nihāya VIII.10 double-alif transcription corruption returned');
  check(nTriage.summary?.independentlyReconciledAgainstCompleteSecondWitness===1,
    'Nihāya complete external comparisons must count IX.9 alone');
  const newReviews=readJson(join(root,'audits/nihaya-local-review-stage8-2026-11-10.json'),'Stage VIII local review evidence');
  check(newReviews?.reviews?.length===50&&new Set(newReviews?.reviews?.map(r=>r.id)).size===50,
    'Stage VIII must preserve 50 distinct passage-specific full-reading records');
  check(newReviews?.reviews?.every(r=>r.finding.length>120&&r.reviewedArabicSha256&&r.reviewedEnglishSha256),
    'Stage VIII local findings or reviewed-source hashes missing');
  const evidence=readJson(join(root,'audits/nihaya-ix9-external-collation-2026-11-10.json'),'IX.9 external evidence');
  check(evidence?.chapterBoundaries?.allBoundariesInspected===true&&evidence?.coverage?.length===10&&
    evidence?.witnesses?.[0]?.images?.length===3&&evidence?.unit==='N-IX-09',
    'Full IX.9 external comparison requires complete boundaries and coverage evidence');
  const englishFile=readFileSync(join(root,'nihayat-al-hikma/data/nihayat-al-hikma-english.txt'),'utf8');
  check(nText.units.every(u=>englishFile.includes(u.english)),'Plain-text English edition differs from canonical unit text');
  check(!nText.units.find(u=>u.id==='N-VI-16')?.notes?.some(n=>/inconsistency has been retained/.test(n.text)),
    'Obsolete VI.16 note contradicts adopted reading');
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
  const ledger=readJson(join(root,'audits/nihaya-adopted-textual-decisions-2026-11-10.json'),'Nihāya textual decision ledger');
  check(ledger?.decisions?.length===13&&ledger?.decisions?.reduce((n,d)=>n+d.replacements.length,0)===14,
    'Textual decisions must be counted separately from literal replacements');
  check(ledger?.summary?.explicitLaterEditorialEmendations===12&&
    ledger?.summary?.laterEditionReadingsWithoutSpecificVariantFootnote===1,
    'Explicit editor corrections and unfootnoted later readings must remain distinct');
  for(const decision of ledger?.decisions||[]){
    const unit=nText.units.find(u=>u.id===decision.passageId);
    check(criticalIds.has(decision.criticalNoteId),'Decision lacks public apparatus: '+decision.id);
    for(const replacement of decision.replacements){
      check(unit?.arabic?.includes(replacement.after),'Decision not implemented: '+decision.id);
      // A feminine possessive can contain the earlier masculine string as its prefix.
      const escaped=replacement.before.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      check(!new RegExp(escaped+'(?![\\p{L}\\p{M}\\p{N}_])','u').test(unit?.arabic||''),
        'Earlier token sequence remains after adoption: '+decision.id);
    }
  }
  check(review?.summary?.N?.adoptedPrintedEditorialEmendations===12&&
    review?.summary?.N?.adoptedArabicStringReplacements===14,'Review register textual-decision counts stale');
  const ix9=nExtra.criticalNotes?.find(n=>n.id==='N1417-IX09-REFERENCE-01');
  check(ix9?.passageId==='N-IX-09'&&ix9?.adoption==='adopted-with-full-apparatus' &&
    ix9?.originalReading==='كما في القسم الأول'&&ix9?.adoptedReading==='كما في القسم الثاني'&&
    ix9?.text.includes('early facsimile does NOT attest'),
    'IX.9 adoption must preserve the first-kind early reading and attribute second-kind to the later editor');
  const editorVI09=nExtra.criticalNotes?.find(n=>n.id==='N1428-VI09-BOUNDARY-01');
  const editorVI02=nExtra.criticalNotes?.find(n=>n.id==='N1428-VI02-FORM-01');
  check(editorVI09?.passageId==='N-VI-09'&&editorVI09?.adoption==='not-applicable-editorial-comment' &&
    /1428/.test(editorVI09?.source||'') &&
    review?.entries?.find(r=>r.id==='N-VI-09')?.supplementalCriticalNoteIds?.includes('N1428-VI09-BOUNDARY-01'),
    'Later 1428 editor critique of continuum boundary must remain explicitly attributed and visible');
  check(editorVI02?.passageId==='N-VI-02'&&editorVI02?.adoption==='not-applicable-intertextual-note' &&
    review?.entries?.find(r=>r.id==='N-VI-02')?.supplementalCriticalNoteIds?.includes('N1428-VI02-FORM-01'),
    'Nihāya VI.2 vs Bidāya VI.1-2 intertextual issue must not be silently harmonized');
  check(nTriage.summary?.independentlyReconciledAgainstCompleteSecondWitness===1 &&
    review?.summary?.N?.englishIndependentlyCollated===1 &&
    review?.summary?.expertReviewedUnitsVerified===0,
    'Only documented IX.9 may count as complete external comparison; no expert certification claimed');
  check(review?.entries?.find(r=>r.id==='N-IX-09')?.supplementalCriticalNoteIds?.includes('N1417-IX09-REFERENCE-01'),
    'Nihāya IX.9 public critical apparatus lost cumulative review register backlink');
}
console.log(JSON.stringify({status:failures.length?'failed':'passed',books:report,failures,warnings},null,2));
process.exitCode=failures.length?1:0;
