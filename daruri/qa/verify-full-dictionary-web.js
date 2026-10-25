/* Structural/content QA for the progressive full dictionary, no npm dependency. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(ROOT,relative),'utf8');
const dataSource=JSON.parse(read('build/data/full-headwords.json'));
const notesSource=JSON.parse(read('build/data/backmatter-source-notes.json'));
const window={};
vm.runInNewContext(read('full-dictionary-data.js'),{window}, {timeout:2000});
const exported=window.GnammaFullDictionaryData;
vm.runInNewContext(read('full-dictionary-index.js'),{window},{timeout:2000});
const index=window.GnammaFullDictionaryIndex;
assert.equal(index.schema_version,1);
assert.equal(Object.keys(index.terms).length,153);
assert.equal(index.terms['ṣīgha'].root,'صوغ');
assert.equal(index.terms['ṣīgha'].articles[0].source,'F');

const morph=JSON.parse(read('morph-daruri-v1.json'));
const morphLex=JSON.parse(read('morph-lexicon.json'));
const sighaEntry=morphLex.entries.find(x=>x.lemma==='صيغة');
assert.equal(sighaEntry.root,'صوغ');
const sighaRows=morph.records.flatMap(row=>row.a
  .filter(a=>a[2]==='صيغة'&&a[3]==='صوغ')
  .map(a=>({id:row.id,surface:a[1]})));
assert.equal(sighaRows.length,63);
assert.equal(new Set(sighaRows.map(x=>x.id.split(':')[1])).size,37);
assert.equal(morph.summary.seedLexiconEntries,morphLex.entries.length);

assert.equal(exported.schema_version,1);
assert.equal(exported.terms.length,153);
assert.equal(exported.articles.length,157);
assert.equal(exported.sourceNoteCount,13);
assert.equal(exported.articles.reduce((s,a)=>s+a.paragraphs.length,0),283);
assert.deepEqual(JSON.parse(JSON.stringify(exported.terms)),dataSource.terms);
assert.deepEqual(JSON.parse(JSON.stringify(exported.sources)),dataSource.sources);
assert.deepEqual(JSON.parse(JSON.stringify(exported.articles)),dataSource.articles);
for(const article of exported.articles){
  assert(article.paragraphs.every(p=>typeof p.ar==='string'&&p.ar.length>0&&typeof p.en==='string'&&p.en.length>0),article.id);
}
const articles=new Map(exported.articles.map(a=>[a.id,a]));
for(const term of exported.terms)
  for(const association of term.articles)assert(articles.has(association.id),term.term+' -> '+association.id);
const recorded=Object.values(notesSource.notes_by_dictionary_article).flatMap(g=>(g.notes||[]).filter(n=>n.apply!==false));
assert.equal(recorded.length,13);
assert.equal(Object.values(exported.notesByArticle).flat().length,13);
for(const note of recorded)
  assert(Object.values(exported.notesByArticle).flat().some(n=>n.id===note.id&&n.text===note.text),note.id);
const glossary=JSON.parse(read('dictionary-data.json')).glossary;
const sin=glossary.find(t=>t.term==='ṣināʿa');
assert(sin);
assert.match(sin.definition,/not the manufacture of divine law/);
assert.match(sin.definition,/Fiqh is directed to action/);
assert.equal(dataSource.terms.find(t=>t.term==='ṣināʿa').definition,sin.definition);
const historical=articles.get('J-sinaa');
assert(historical?.note?.includes('ars and prudentia'));
assert.equal(historical.paragraphs.length,1);
assert.equal(historical.paragraphs[0].ar,'ملكة نفسانية تصدر عنها الأفعال الاختيارية من غير روية وقيل المتعلق بكيفية العمل.');
const html=read('dictionary.html');
const hmatch=html.match(/<script type="application\/json" id="dictionaryEntries">([\s\S]*?)<\/script>/);
assert(hmatch,'Dictionary entries missing');
const inline=JSON.parse(hmatch[1]);
assert.equal(inline.length,155,'The existing 155 web entries must be preserved');
assert.equal(inline.find(t=>t.term==='ṣināʿa').definition,sin.definition);
assert(html.includes('full-dictionary-context.js?v=20261025-dossier3'));
const readerBootstrap=read('quran-context-ui.js');
assert(readerBootstrap.includes('full-dictionary-context.js?v=20261025-dossier3'));
const ui=read('full-dictionary-context.js');
for(const phrase of ['#mainContent .glossary-card','#lexArticle .lex-card','detailContent','gn-fd-parallel','source_references','Hide complete historical article'])
  assert(ui.includes(phrase),phrase);
const cache=read('sw.js'),bundle=read('download-bundle.js');
for(const fname of ['full-dictionary-context.js','full-dictionary-data.js','full-dictionary-index.js']){
  assert(cache.includes(fname),fname+' missing offline service worker');
  assert(bundle.includes(fname),fname+' missing from portable bundle');
}
const uiWord=read('gnamma-word-context.js');
const popupFooter=uiWord.slice(uiWord.indexOf('function installDictionaryActions(){'),uiWord.indexOf("document.addEventListener('click',e=>{",uiWord.indexOf('function installDictionaryActions(){')));
assert(!popupFooter.includes('morph-root')&&!popupFooter.includes('morph-lemma'),'The dictionary modal must not offer unsupported morphological searches');
assert(ui.includes('reviseReaderPopup') && ui.includes('reviseStandalone') && ui.includes('fullLabel'));
assert(ui.includes('addIndexedSearch') && ui.includes('gn-fd-morph-actions'));
assert(uiWord.includes('groundedMorphActions'));

console.log('PASS: 153 term dossiers, 157 complete historical articles, 283 bilingual pairs and all 13 source notes match scholarly source; ṣināʿa commentary, standalone dictionary, reader hooks, cache and bundle synchronized.');
