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
    check(units.filter(u=>/^B-(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)-\d\d$/.test(u.id)).length===110,'Bidāya must preserve 110 authorial chapters');
    for(const u of units){
      if(/[RT5]/.test(u.arabic||''))failures.push('Bidāya: imported OCR placeholder in '+u.id);
      if(/CHAPTER\s+[A-Z]+:/.test(u.arabic||''))failures.push('Bidāya: injected lecture note in '+u.id);
    }
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
console.log(JSON.stringify({status:failures.length?'failed':'passed',books:report,failures,warnings},null,2));
process.exitCode=failures.length?1:0;
