#!/usr/bin/env node
/* Qawtaw21: source candidate queue across 171 units. Candidate != citation. */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm';
const ROOT=path.resolve(import.meta.dirname,'..'), DATA=path.join(ROOT,'data');
const files=['units.js','commentary.js','commentary-introduction-1.js','commentary-introduction-2.js','commentary-introduction-3.js','commentary-introduction-4.js','commentary-main-001-019.js','commentary-main-020-060.js','commentary-conclusion.js','commentary-corpus.js','primary-reference-register.js'];
const ctx=vm.createContext({window:{},console:{log:()=>{}}});
for (const file of files) vm.runInContext(fs.readFileSync(path.join(DATA,file),'utf8'),ctx,{filename:file});
const matn=ctx.window.GNAMMA_QAWAID_MATN.units;
const sharh=ctx.window.GNAMMA_TAMHID_CORPUS.units;
const refs=ctx.window.GNAMMA_QAWAID_REFERENCES.items;
if(matn.length!==61||sharh.length!==110||refs.length!==18)throw new Error('Source inventory failed: '+[matn.length,sharh.length,refs.length]);
const units=[...matn.map(u=>({...u,layer:'matn'})),...sharh.map(u=>({...u,layer:'sharh'}))];
const modes=[
 {key:'explicit-verse',re:/(?:قال\s+تعالى|قوله\s+تعالى|قال\s+اللّ?ه\s+تعالى|قال\s+سبحانه|يقول\s+تعالى|قوله\s+سبحانه|في\s+كتاب(?:ه)?\s+العزيز|في\s+القرآن)/gu},
 {key:'hadith-report',re:/(?:قال\s+النبي|قال\s+رسول\s+اللّ?ه|قال\s+عليه\s+الصلاة|روي\s+عن\s+النبي|في\s+الحديث|حديث\s+النبي|قال\s+الصادق|قال\s+الباقر|عن\s+رسول\s+اللّ?ه|سمعت\s+النبي|كنت\s+كنزا)/gu},
 {key:'named-author',re:/(?:ابن\s+عربي|ابن\s+سينا|القونوي|القيصري|أرسطو|أفلاطون|الشيخ\s+الرئيس|الشيخ\s+الأكبر|صاحب\s+الفصوص|صاحب\s+الإشارات|أبو\s+حامد|الرازي|نصير\s+الدين|الطوسي)/gu},
 {key:'named-work',re:/(?:فصوص\s+الحكم|الفصوص|الفتوحات\s+المكية|إنشاء\s+الدوائر|حكمة\s+الرشيدية|الحكمة\s+الرشيدية|الاعتماد\s+الكبير|إلهيات\s+الشفاء|الإلهيات\s+من\s+الشفاء|كتاب\s+الشفاء|كتاب\s+الإشارات|شرح\s+الإشارات|التجريد|كشف\s+المراد|العقل\s+المفارق|التفسير\s+الكبير|التمهيد\s+في\s+شرح|كتاب\s+الحكمة\s+|التوحيد\s+الخاص)/gu},
 {key:'source-attribution',re:/(?:قال\s+الشيخ|يقول\s+الشيخ|أورد\s+الشيخ|كلام\s+الشيخ|نص\s+الشيخ|نقل\s+عن|نقل\s+من|يذكر\s+في|كما\s+ورد\s+في|على\s+ما\s+ذكر\s+في|في\s+الكتاب\s+المذكور)/gu}
];
const trim=s=>String(s||'').replace(/\s+/g,' ').trim();
const candidates=[],tally={};
for(const u of units){
 const ar=String(u.readingArabic||u.arabic||'');
 for(const m of ar.matchAll(/[«﴿]([^»﴾]{5,400})[»﴾]/gu)){
  const ex=trim(m[1]);
  if(!/[\u0621-\u064a]/u.test(ex))continue;
  candidates.push({id:u.id,layer:u.layer,type:'quoted-arabic',text:ex.slice(0,260),start:m.index,excerpt:trim(ar.slice(Math.max(0,m.index-110),Math.min(ar.length,m.index+Math.min(360,m[0].length+140))))});
 }
 for(const spec of modes)for(const m of ar.matchAll(spec.re)){
  candidates.push({id:u.id,layer:u.layer,type:spec.key,match:m[0],start:m.index,excerpt:trim(ar.slice(Math.max(0,m.index-130),Math.min(ar.length,m.index+220)))});
 }
 tally[u.id]=candidates.filter(c=>c.id===u.id).length;
}
const report={
 schema:'gnamma-qawtaw21-source-candidate-inventory-v1',date:'2026-11-13',
 scope:{matn:matn.length,sharh:sharh.length,existingReferences:refs.length,total:units.length},
 evidenceStatus:'Unreviewed candidates, NOT verified citations, derived from published source modules only.',
 counts:Object.fromEntries([...new Set(candidates.map(x=>x.type))].map(t=>[t,candidates.filter(c=>c.type===t).length])),
 unitsWithAnyCandidate:Object.keys(tally).filter(u=>tally[u]).length,
 topUnits:Object.entries(tally).filter(([k,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,45),
 existingUnits:[...new Set(refs.flatMap(r=>r.units||[]))].sort(),
 candidates
};
fs.writeFileSync(path.join(ROOT,'qa/qawtaw21-source-candidates.json'),JSON.stringify(report,null,2)+'\n');
console.log('QAWTAW21_COUNTS',JSON.stringify({scope:report.scope,counts:report.counts,unitsWithAnyCandidate:report.unitsWithAnyCandidate,top:report.topUnits.slice(0,18)}));
console.log('QAWTAW21_QUOTES',JSON.stringify(candidates.filter(x=>x.type==='quoted-arabic').map(x=>({id:x.id,quote:x.text})).slice(0,90)));
console.log('QAWTAW21_EXPLICIT',JSON.stringify(candidates.filter(x=>x.type==='explicit-verse'||x.type==='hadith-report').map(x=>({id:x.id,type:x.type,match:x.match,excerpt:x.excerpt})).slice(0,80)));
