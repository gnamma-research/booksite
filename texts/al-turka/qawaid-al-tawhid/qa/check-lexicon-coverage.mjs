import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const parts=[
 'data/units.js','data/commentary.js',
 'data/commentary-introduction-1.js','data/commentary-introduction-2.js',
 'data/commentary-introduction-3.js','data/commentary-introduction-4.js',
 'data/commentary-conclusion.js','data/commentary-main-001-019.js',
 'data/commentary-main-020-060.js','data/commentary-corpus.js','data/linked-lexicon.js'];
const c=vm.createContext({window:{}});
for(const p of parts)new vm.Script(fs.readFileSync(path.join(base,p),'utf8'),{filename:p}).runInContext(c);
const w=c.window,matn=w.GNAMMA_QAWAID_MATN.units,com=w.GNAMMA_TAMHID_CORPUS.units,terms=w.GNAMMA_QAWAID_TERMS.terms;
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/\s+/g,' ').trim();
const all=[...matn,...com];
const report=terms.map(t=>{
 const forms=[t.ar,...t.aliases.filter(a=>/[\u0600-\u06ff]/.test(a)),t.en.split('/')[0].trim(),...t.aliases.filter(a=>/^[A-Za-z]/.test(a)&&a.length>5)].map(norm).filter(x=>x.length>=4);
 const hits=[];
 for(const u of all){const text=norm(u.arabic+' '+u.english);if(forms.some(f=>text.includes(f)))hits.push(u.id)}
 return {id:t.id,ar:t.ar,en:t.en,category:t.category,count:hits.length,first:hits.slice(0,8)}
});
const result={total:terms.length,matched:report.filter(x=>x.count>0).length,unmatched:report.filter(x=>x.count===0),maxCount:Math.max(...report.map(x=>x.count)),totalMatchedReferences:report.reduce((a,x)=>a+x.count,0),all:report};
const file=path.join(base,'qa/lexicon-coverage-report.json');
fs.writeFileSync(file,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({total:result.total,matched:result.matched,unmatched:result.unmatched,totalMatchedReferences:result.totalMatchedReferences,maxCount:result.maxCount},null,2));
