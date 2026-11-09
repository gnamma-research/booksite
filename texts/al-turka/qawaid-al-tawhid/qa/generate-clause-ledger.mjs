#!/usr/bin/env node
/* Clause-level coverage inventory. Machine segmentation is not translation verification. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const write=(p,s)=>{const f=path.join(ROOT,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,s);};
const digest=s=>crypto.createHash('sha256').update(s).digest('hex');
const c=vm.createContext({window:{},console});
const files=['data/units.js','data/commentary.js',
'data/commentary-introduction-1.js','data/commentary-introduction-2.js',
'data/commentary-introduction-3.js','data/commentary-introduction-4.js',
'data/commentary-conclusion.js','data/commentary-main-001-019.js',
'data/commentary-main-020-060.js','data/commentary-corpus.js'];
for(const f of files)new vm.Script(read(f),{filename:f}).runInContext(c);
const matn=JSON.parse(JSON.stringify(c.window.GNAMMA_QAWAID_MATN.units));
const sharh=JSON.parse(JSON.stringify(c.window.GNAMMA_TAMHID_CORPUS.units));
if(matn.length!==61||sharh.length!==110)throw Error('Changed matn/sharh counts');
const all=[...matn.map(x=>({...x,part:'matn'})),...sharh];
const decisions=JSON.parse(read('qa/clause-review-adjudications-2026-11-09.json'));
const decisionMap=new Map(decisions.units.map(x=>[x.id,x]));
function split(source,language){
 const delimiter=language==='arabic'?/(?<=[،؛.!؟])\s+/u:/(?<=[.!?;])\s+/u;
 const fragments=String(source||'').trim().split(delimiter).filter(x=>x.trim());
 let from=0;
 return fragments.map((x,i)=>{
   const text=x.trim(),start=source.indexOf(text,from);
   if(start<0)throw Error('Cannot locate original fragment '+i);
   from=start+text.length;
   return {n:i+1,startChar:start,endChar:from,text};
 });
}
function risks(s){
 const patterns=[
 ['objection',/(?:لا\s+يقال|فلئن\s+قيل|فإن\s+قيل)/u],
 ['reply',/(?:قلنا|لأنا\s+نقول|فأجاب|قلت:)/u],
 ['negation',/(?:^|[\s،؛])(?:لا|ليس|لم|لن|غير)(?=[\s،؛])/u],
 ['exception_or_exclusivity',/(?:إلّا|إلا|إنّما|إنما)/u],
 ['conditional',/(?:^|[\s،؛])(?:لو|إذا|إن)(?=[\s،؛])/u],
 ['modality',/(?:الوجوب|الواجب|الإمكان|الممكن|الامتناع)/u],
 ['technical_vocabulary',/(?:الوجود|الماهية|الحقيقة|الكون|التشكيك|التعيّن|الاعتبار|الإطلاق|الكشف|العقل|الشهود)/u]];
 return patterns.filter(([k,r])=>r.test(s)).map(([k])=>k);
}
const units=[],counts={},reviewedUnits=[],notices=[];
let totalArabic=0,totalEnglish=0,totalReviewed=0;
for(const u of all){
 const ar=split(u.arabic,'arabic'),en=split(u.english,'english');
 totalArabic+=ar.length;totalEnglish+=en.length;
 const decision=decisionMap.get(u.id);
 if(decision){
   const seen=new Set();reviewedUnits.push(u.id);
   for(const group of decision.groups){
     if(group.arStart<1||group.arEnd>ar.length||group.arEnd<group.arStart)throw Error('Bad Arabic review indices '+u.id);
     if(group.enStart<1||group.enEnd>en.length||group.enEnd<group.enStart)throw Error('Bad English review indices '+u.id);
     for(let n=group.arStart;n<=group.arEnd;n++){
       if(seen.has(n))throw Error('Double adjudication '+u.id+':'+n);
       seen.add(n);totalReviewed++;
       counts[group.status]=(counts[group.status]||0)+1;
       ar[n-1].review={status:group.status,englishSentenceStart:group.enStart,englishSentenceEnd:group.enEnd,note:group.note};
       ar[n-1].englishCorrespondence=en.slice(group.enStart-1,group.enEnd).map(x=>x.text).join(' ');
     }
   }
   if(seen.size!==ar.length)throw Error('Manual group does not cover whole named unit '+u.id+':'+seen.size+'/'+ar.length);
 }
 for(const row of ar){
   row.riskMarkers=risks(row.text);
   if(!row.review)row.review={status:'not-yet-individually-reviewed'};
 }
 units.push({
  id:u.id,part:u.part||'matn',matnId:u.matnId||null,
  sourceEdition:u.sourceEdition||'A',
  sourceLocator:u.sourceLocator||('A pp. '+(u.pages||[]).join('–')),
  sourceUrl:u.sourceUrl||null,
  arabicSha256:digest(u.arabic),englishSha256:digest(u.english),
  arabicClauses:ar,englishSentences:en,
  manualComparativeReview:!!decision,
  sourceWarnings:(u.notes||[]).filter(x=>/variant|unstable|corrupt|conjectur|uncertain|printed|reading|lacuna/i.test(x)).length
 });
}
if(totalReviewed!==decisions.claimedManuallyComparedArabicClauses)throw Error('Review coverage count mismatch');
if(reviewedUnits.length!==decisions.units.length)throw Error('A review target ID is missing from corpus');
const summary={schema:'gnamma-clause-inventory-v1',date:'2026-11-09',
  totalBilingualUnits:units.length,originalMatnUnits:61,commentaryUnits:110,
  totalArabicPunctuationClauses:totalArabic,totalEnglishSentenceCandidates:totalEnglish,
  individuallyComparedArabicPunctuationClauses:totalReviewed,individuallyComparedUnits:reviewedUnits.length,
  NOTIndividuallyComparedArabicClauses:totalArabic-totalReviewed,
  statuses:counts,
  editorialLimit:'Punctuation-derived segments do not always equal syntactic clauses. Only individually compared units have manually associated English ranges. No manuscript witnesses were collated.'};
write('qa/clause-ledger.json',JSON.stringify({summary,units},null,2)+'\n');
let md='# Qawāʿid / Tamhīd — clause-level comparative review, pass 1\n\n';
md+='**9 November 2026.** This work inventories '+totalArabic+' Arabic punctuation-clause candidates and '+totalEnglish+' English sentence candidates across **all 171 bilingual units**. Only **'+totalReviewed+' Arabic clauses in '+reviewedUnits.length+' units** have been individually compared with their English in this pass. The remaining **'+(totalArabic-totalReviewed)+' are not certified**.\n\n';
md+='All clauses, offsets, corresponding English for reviewed passages, and source fingerprints are in the [complete clause ledger](../qa/clause-ledger.json). Automatic enumeration is **not** evidence of an accurate translation. The original Arabic and the reported QT-059 lacuna remain unchanged.\n\n';
md+='## Grouped manual decisions\n\n';
const esc=s=>String(s||'').replaceAll('|','\\|').replace(/\s+/g,' ').trim();
const trunc=(s,n=120)=>{s=esc(s);return s.length>n?s.slice(0,n-1)+'…':s;};
for(const item of decisions.units){
 const u=units.find(x=>x.id===item.id);
 md+='### '+item.id+' — '+u.sourceLocator+'\n\n';
 md+='| Arabic clauses | English sentences | Status | Source excerpt and finding |\n|---|---|---|---|\n';
 for(const g of item.groups){
  const sample=u.arabicClauses.slice(g.arStart-1,g.arEnd).map(x=>x.text).join(' ');
  md+='| '+g.arStart+'–'+g.arEnd+' | '+g.enStart+'–'+g.enEnd+' | **'+g.status+'** | '+trunc(sample)+' — '+esc(g.note)+' |\n';
 }
 md+='\n';
}
md+='## Editorial status and next passages\n\n';
md+='The corrections to **SH-014**, **SH-INTRO-021**, and **SH-061-E** have been applied to the canonical translation modules. The earlier **SH-058** lexical correction remains in force. Ambiguous printed readings in **SH-061-A** and **SH-061-F** are explicitly unresolved. Compiled corpus, exports, HTML, and PDF editions must track the revised source modules.\n\n';
md+='The next sequence for human clause review is SH-015, SH-017, SH-020–025, SH-027–031, followed by the remaining commentary and all 61 matn units. **No unreviewed section is declared accurate because of a hash or ratio test.**\n';
write('editorial/CLAUSE_REVIEW_PASS1_2026-11-09.md',md);
console.log(JSON.stringify({passed:true,totalArabic,totalEnglish,totalReviewed,pending:totalArabic-totalReviewed,reviewedUnits:reviewedUnits.length,statuses:counts}));
