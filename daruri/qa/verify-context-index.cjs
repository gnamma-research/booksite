#!/usr/bin/env node
/* Dependency-free regression for source-level AI candidate ranking and
 * morphology postings. No CAMeL weights, browser data or network required.
 * Run: node daruri/qa/verify-context-index.cjs
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const lex={
 schema:'gnamma-morph-lexicon-v1',
 entries:[
  {lemma:'كتب',root:'كتب',pos:'verb',forms:['كتب'],roman:['kataba']},
  {lemma:'كتاب',root:'كتب',pos:'noun',forms:['كتاب'],roman:['kitab']},
  {lemma:'بحث',root:'بحث',pos:'noun',forms:['بحث'],roman:['bahth']}
 ]
};
const corpus=[
 {work:'daruri',id:'passage:5:0',ar:'كتب والكتاب كتب',type:'text',title:'§5',
  section:'5',privacy:'public'}
];
const raw={schema:'gnamma-morph-v1',work:'daruri',
 annotator:'synthetic contextual model for isolated testing',
 contextual:true,records:[{id:'passage:5:0',a:[
  [0,'كتب','كتب','كتب','verb','contextual-bert','كَتَبَ_1',{rank:1,asp:'p'}],
  [0,'كتب','بحث','بحث','noun','contextual-alternative','بَحْث_1',{rank:2,cas:'n'}],
  [1,'والكتاب','كتاب','كتب','noun','contextual-bert','كِتاب_1',{rank:1,cas:'g'}],
  [2,'كتب','كتاب','كتب','noun','contextual-bert','كُتُب_1',{rank:1,cas:'a'}]
 ]}]};
const ctx={window:{},console,
 fetch:async url=>({
  ok:true,
  json:async()=>String(url).startsWith('morph-lexicon')?lex:raw
 })};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'gnamma-morphology.js'),'utf8'),ctx,
 {filename:'gnamma-morphology.js'});
(async()=>{
 const morph=ctx.window.GnammaMorphology;
 await Promise.all([morph.loadLexicon(),morph.ensure('daruri')]);
 const first=morph.disambiguate('كتب',[],'daruri','passage:5:0',0);
 assert.equal(first.best.lemma,'كتب');
 assert.equal(first.best.features.asp,'p');
 assert.equal(first.certainty,'automated');
 assert.equal(first.alternatives.length,1);
 assert.equal(first.alternatives[0].lemma,'بحث');
 const last=morph.disambiguate('كتب',[],'daruri','passage:5:0',2);
 assert.equal(last.best.lemma,'كتاب');
 assert.equal(last.best.features.cas,'a');
 const unlocated=morph.disambiguate('كتب',[],'daruri','passage:5:0');
 assert.equal(unlocated.best,null,'Cannot resolve distinct source occurrences by spelling alone');
 assert.equal(unlocated.certainty,'occurrence-unlocated');
 assert.equal(morph.find('بحث','morph-root',corpus).items.length,0,
  'Alternative AI guess must never enter root postings');
 const wordForms=morph.find('والكتاب','morph-lemma',corpus);
 assert.equal(wordForms.ready,true);
 assert.equal(wordForms.items.length,1,'Observed prefixed form resolves to its lemma');
 assert.equal(wordForms.keys.join(','),'كتاب');
 assert.equal(morph.status('daruri').contextual,undefined);

 // The actual public release stays on curated v1. Test the opt-in v2 path
 // separately, including small postings and lazy per-occurrence grammar files.
 const compact={
  schema:'gnamma-morph-postings-v2',work:'daruri',
  contextual:true,classicalArabicValidated:false,
  annotator:'synthetic MSA candidates, unchecked',
  ids:['passage:5:0'],shardSize:1,
  detailPrefix:'morph-daruri-details-v2/',
  l:{'كتب':[[0,0,0]],'كتاب':[[0,1,0],[0,2,0]]},
  r:{'كتب':[[0,0,0],[0,1,0],[0,2,0]]},
  f:{'كتب':{l:['كتب','كتاب'],r:['كتب']},
     'والكتاب':{l:['كتاب'],r:['كتب']}},
  summary:{searchableOccurrences:3}
 };
 const details={schema:'gnamma-morph-detail-v2',work:'daruri',shard:0,
  records:raw.records};
 const requests=[];
 const preview={window:{GnammaContextualMorphAssets:{
  daruri:'morph-daruri-search-v2.json'}},console,
  fetch:async url=>{
   const path=String(url).split('?')[0];
   requests.push(path);
   const value=path==='morph-lexicon.json'?lex:
     path==='morph-daruri-search-v2.json'?compact:
     path==='morph-daruri-details-v2/0000.json'?details:null;
   return {ok:!!value,status:value?200:404,json:async()=>value};
  }};
 vm.createContext(preview);
 vm.runInContext(fs.readFileSync(path.join(root,'gnamma-morphology.js'),'utf8'),
  preview,{filename:'gnamma-morphology.js'});
 const portable=preview.window.GnammaMorphology;
 await Promise.all([portable.loadLexicon(),portable.ensure('daruri')]);
 assert.ok(requests.includes('morph-daruri-search-v2.json'));
 assert.ok(!requests.some(x=>x.includes('details-v2')),
  'Search must not download all grammatical detail shards');
 const shallow=portable.find('والكتاب','morph-lemma',corpus);
 assert.equal(shallow.items.length,1);
 assert.equal(shallow.keys.join(','),'كتاب');
 assert.equal(shallow.items[0].matched.term,'والكتاب');
 assert.equal(portable.find('بحث','morph-root',corpus).items.length,0);
 await portable.ensureDetail('daruri','passage:5:0');
 const precise=portable.disambiguate('كتب',[],'daruri','passage:5:0',0);
 assert.equal(precise.best.lemma,'كتب');
 assert.equal(precise.alternatives.length,1);
 const repeat=portable.disambiguate('كتب',[],'daruri','passage:5:0',2);
 assert.equal(repeat.best.lemma,'كتاب');
 await portable.ensureDetail('daruri','passage:5:0');
 assert.equal(requests.filter(x=>x.includes('details-v2')).length,1,
  'Identical word detail shard should come from cache');
 console.log('PASS: compact v2 root/lemma postings, opt-in release flag, source position and lazy detail loading');
 console.log('PASS: lexical alternatives excluded from search; contextual positions, features and inflected queries verified');
})().catch(e=>{console.error(e);process.exitCode=1});
