import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const files=['data/commentary.js','data/commentary-introduction-1.js','data/commentary-introduction-2.js','data/commentary-introduction-3.js','data/commentary-introduction-4.js','data/commentary-conclusion.js','data/commentary-main-001-019.js','data/commentary-corpus.js'];
const context=vm.createContext({window:{}});
for(const file of files)new vm.Script(fs.readFileSync(path.join(root,file),'utf8'),{filename:file}).runInContext(context);
const corpus=context.window.GNAMMA_TAMHID_CORPUS;
assert.equal(corpus.units.length,65);assert.equal(corpus.coverage.mainUnits,19);
const lines=['# Tamhīd al-Qawāʿid — Arabic–English commentary','', '**Ṣāʾin al-Dīn ʿAlī Ibn Turka**','', 'Working translation · 3 November 2026','', '**Scope:** 40 authorial introductory sections; 19 complete main explanations on QT-001–QT-019 (A pp.48–95); six concluding sections (A pp.270–274). Commentary QT-020–QT-060 remains untranslated. The ancestor’s 61-unit matn is separate.','', 'The introduction uses edition N; the main and closing commentary use edition A. Their page numbers must not be conflated. Lumbard’s selections are a checked comparator, not the English copy-text. The translation is based on medieval Arabic, not a reproduction of a modern translation. Independent manuscript collation and specialist review remain outstanding.','', '## Contents',''];
for(const u of corpus.units)lines.push('- '+u.id+' — '+(u.section||u.title));
lines.push('','---','');
let currentPart='';
for(const u of corpus.units){
 if(u.part!==currentPart){currentPart=u.part;lines.push('# '+({introduction:'I. Authorial introduction',main:'II. Main commentary: QT-001–QT-019',conclusion:'III. Concluding discussion'})[u.part],'');}
 if(u.id===corpus.gap.before)lines.push('## UNTRANSLATED INTERVAL', '',corpus.gap.description,'');
 lines.push('## '+u.id+' — '+(u.section||u.title),'', '**Source:** '+u.sourceLocator,'',u.sourceUrl,'');
 if(u.matnId)lines.push('**Linked matn:** '+u.matnId,'');
 if(u.lumbardComparator)lines.push('**Comparator:** Lumbard, pp. '+u.lumbardComparator.pages.join('–')+'; independent translation from Arabic.','');
 lines.push('### Arabic','',u.arabic,'','### English','',u.english,'');
 if(u.notes?.length)lines.push('### Textual and translation notes','',...u.notes.map((n,i)=>`${i+1}. ${n}`),'');
 if(u.sourceTextSha256)lines.push('Source-text SHA-256: `'+u.sourceTextSha256+'`','');
 lines.push('---','');
}
fs.writeFileSync(path.join(root,'data/parallel-commentary.md'),lines.join('\n'));
fs.writeFileSync(path.join(root,'data/commentary-corpus.json'),JSON.stringify(corpus,null,2)+'\n');
const totals={units:65,introduction:40,main:19,conclusion:6,englishWords:corpus.units.reduce((n,u)=>n+u.english.trim().split(/\s+/).length,0),newMainEnglishWords:corpus.units.filter(u=>u.part==='main').reduce((n,u)=>n+u.english.trim().split(/\s+/).length,0),completeWork:false};
fs.writeFileSync(path.join(root,'qa/commentary-export-report.json'),JSON.stringify(totals,null,2)+'\n');
console.log(JSON.stringify(totals,null,2));
