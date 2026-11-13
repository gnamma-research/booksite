#!/usr/bin/env node
/* Evidence-only research helper: compare actual GNAMMA published Arabic, and
   distinguish direct citations from concept-level parallels. */
import fs from 'node:fs'; import vm from 'node:vm'; import path from 'node:path';
const ROOT=path.resolve(import.meta.dirname,'..'), DATA=path.join(ROOT,'data');
const files=['units.js','commentary.js','commentary-introduction-1.js','commentary-introduction-2.js','commentary-introduction-3.js','commentary-introduction-4.js','commentary-main-001-019.js','commentary-main-020-060.js','commentary-conclusion.js','commentary-corpus.js'];
const ctx=vm.createContext({window:{}});for(const n of files)vm.runInContext(fs.readFileSync(path.join(DATA,n),'utf8'),ctx,{filename:n});
const sharh=ctx.window.GNAMMA_TAMHID_CORPUS.units,matn=ctx.window.GNAMMA_QAWAID_MATN.units;
const parent=ROOT.split(path.sep).slice(0,-4).join(path.sep)||'/';
const other=path.resolve(ROOT,'../../..');
function read(p){return JSON.parse(fs.readFileSync(path.join(other,p),'utf8'));}
function sample(s,max=250){return String(s||'').replace(/\s+/g,' ').slice(0,max);}
const targets=['SH-026','SH-029','SH-039','SH-041','SH-051','SH-053','SH-060','SH-INTRO-030','SH-INTRO-011','QT-041'];
const source=targets.map(id=>{let u=[...matn,...sharh].find(x=>x.id===id);return{id,section:u.section||u.title,arabicSample:sample(u.readingArabic||u.arabic,6000),englishSample:sample(u.english,1900),longQuotes:[...String(u.readingArabic||u.arabic).matchAll(/«([^»]{25,12000})»/gu)].map((m,i)=>({index:i,arabic:sample(m[1],1700)}))}});
const q=read('texts/sadr-al-din-al-qunawi/al-nusus/data/parallel.json');
const taj=read('research/tajrid/sourcebook.json');
function catalog(obj){return{keys:Object.keys(obj),firstEntry:obj.entries?.[0]?{id:obj.entries[0].id,work:obj.entries[0].work,section:obj.entries[0].section,arabic:sample(obj.entries[0].arabic)}:null};}
const qunawi=(q.entries||[]).filter(e=>e.work==='QUN-NU'&&/الوجود المطلق|الوُجود المطلق|الحقيقة الواحدة|المطلق|التعين|الحضرة|الوحدة|الوجود الحق|الوجود العام/.test(e.arabic||'')).map(e=>({id:e.id,work:e.work,section:e.section,arabic:sample(e.arabic,490),english:sample(e.english,410),locator:e.locator,sourceUrl:e.source_url}));
let tajRecords=[];
if(Array.isArray(taj.records))tajRecords=taj.records;
else if(taj.records&&typeof taj.records==='object')tajRecords=Object.entries(taj.records).map(([id,v])=>({id,...v}));
else if(Array.isArray(taj.entries))tajRecords=taj.entries;
console.log('TAJRID_STRUCTURE',JSON.stringify({
  matnType:Array.isArray(taj.matn)?'array':typeof taj.matn,
  matnKeys:Array.isArray(taj.matn)?[]:Object.keys(taj.matn||{}).slice(0,20),
  matnFirst:Array.isArray(taj.matn)?taj.matn[0]:Object.entries(taj.matn||{}).slice(0,1),
  extractsType:Array.isArray(taj.extracts)?'array':typeof taj.extracts,
  extractsKeys:Array.isArray(taj.extracts)?[]:Object.keys(taj.extracts||{}).slice(0,20),
  extractsFirst:Array.isArray(taj.extracts)?taj.extracts[0]:Object.entries(taj.extracts||{}).slice(0,1),
  questionsType:Array.isArray(taj.questions)?'array':typeof taj.questions,
  questionsFirst:Array.isArray(taj.questions)?taj.questions[0]:Object.entries(taj.questions||{}).slice(0,1)
}).slice(0,11000));
const tajHits=tajRecords.filter(e=>/وجود|الوجود|تشكيك|توحيد|التعيّن/.test([e.arabic,e.title,e.chapter,e.summary,e.topic].join(' '))).slice(0,90).map(e=>({id:e.id,title:e.title,arabic:sample(e.arabic,360),english:sample(e.english,240),work:e.work_id||e.work,part:e.part}));
const rep={schema:'qawtaw21-crosswork-source-inspection',date:'2026-11-13',
  imported:{q:catalog(q),taj:{keys:Object.keys(taj),total:tajRecords.length,first:tajRecords[0]?{id:tajRecords[0].id,title:tajRecords[0].title,arabic:sample(tajRecords[0].arabic,230)}:null}},
  source,qunawiCandidates:qunawi,tajridCandidates:tajHits};
fs.writeFileSync(path.join(ROOT,'qa/qawtaw21-crosswork-candidates.json'),JSON.stringify(rep,null,2)+'\n');
console.log('CROSSWORK_COUNTS',JSON.stringify({qEntries:q.entries?.length,qNu:qunawi.length,tajRecords:tajRecords.length,tajMatches:tajHits.length,qSample:qunawi.slice(0,5)}));
for(const x of source)console.log('SOURCE_UNIT',JSON.stringify(x));
