/* Validate Editions & Printing content/route without a browser dependency.
   Run from the repo root: node daruri/qa/verify-editions-configurator.js */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const bookjs=read('edition-r3-20261020.js');
const payload=bookjs.match(/\.textContent\s*=\s*("(?:\\.|[^"\\])*")\s*;/s);
assert.ok(payload,'Reader data payload');
const book=JSON.parse(JSON.parse(payload[1]));
const data=read('study-guide-data.js').match(/window\.DARURI_STUDY_DATA = ([\s\S]*?);\s*$/);
assert.ok(data);
const lessons=JSON.parse(data[1]);
const index=read('index.html'),sw=read('sw.js'),bundle=read('download-bundle.js');
for(const name of ['editions.js','editions.css']){
 const route=name+'?v=20261021-editiontabs-vowels-release1';
 assert.ok(index.includes(route),'Reader '+route);
 assert.ok(sw.includes(route),'Offline '+route);
 assert.ok(bundle.includes('daruri/'+name),'Download ZIP '+name);
}
assert.ok(index.includes("case'editions':window.GnammaEditions.render(main,BOOK)"));
assert.ok(index.includes('id="editions"'),'No-JS fallback route');
const count=(s,x)=>s.split(x).length-1;
assert.equal(count(index,'data-route="editions"')>=1,true);
const listeners={},nodes={},previews={reading:{innerHTML:'',dataset:{}},study:{innerHTML:'',dataset:{}}};
const config=tier=>({
 columns:{options:['parallel','stacked','1','2'].map(value=>({value})),value:'parallel'},
 vowels:{hidden:false},
 querySelector(sel){
  if(sel.includes('columns'))return this.columns;
  if(sel==='.gn-ed-vowels')return this.vowels;
  if(sel.includes('preview'))return previews[tier];
  if(sel.includes('count'))return {textContent:''};
  return null;
 },
 querySelectorAll(){return[]}
});
const configs={reading:config('reading'),study:config('study')};
const main={innerHTML:'',dataset:{},addEventListener(t,fn){listeners[t]=fn},querySelector(sel){
 const tier=(sel.match(/data-ep-tier="(\w+)"/)||[])[1];
 return configs[tier]||null;
}};
const document={
 getElementById(id){return nodes[id]||null},
 createElement(tag){return{tag,innerHTML:'',textContent:'',remove(){delete nodes[this.id]}}},
 head:{append(x){nodes[x.id]=x}},
 body:{append(x){nodes[x.id]=x}}
};
const window={DARURI_STUDY_DATA:lessons};
vm.runInNewContext(read('editions.js'),{window,document});
assert.ok(window.GnammaEditions);
window.GnammaEditions.render(main,book);
for(const tier of ['reading','study','reference'])assert.ok(main.innerHTML.includes('id="gn-ed-'+tier+'"'));
assert.ok(main.innerHTML.indexOf('id="gn-ed-reading"')<main.innerHTML.indexOf('id="gn-ed-study"'));
assert.ok(main.innerHTML.indexOf('id="gn-ed-study"')<main.innerHTML.indexOf('id="gn-ed-reference"'));
assert.equal(count(main.innerHTML,'Include editorial section titles'),2);
assert.equal(count(main.innerHTML,'role="tab"'),3,'Exactly three edition tabs');
assert.equal(count(main.innerHTML,'role="tabpanel"'),3,'Exactly three exclusive panels');
assert.ok(main.innerHTML.includes('data-ep-tab="reading"') && main.innerHTML.includes('aria-label="Personal PDF and Reading Desk notes"'));
assert.equal(typeof window.GnammaEditions.setTier,'function');
window.GnammaEditions.buildPrintable('reading');
const reading=nodes.gnEpPacket.innerHTML;
assert.equal(count(reading,'class="gn-ep-pair"'),414,'Every aligned bilingual source segment');
assert.equal(count(reading,'class="gn-ep-editorial"'),0,'Reading editorial titles off by default');
assert.ok(reading.includes('gn-ep-left')&&reading.includes('gn-ep-right'),'English left/Arabic right');
window.GnammaEditions.buildPrintable('study');
const study=nodes.gnEpPacket.innerHTML;
assert.equal(count(study,'class="gn-ep-editorial"'),258,'Study editorial titles on by default');
assert.ok(study.includes('class="gn-ep-endnotes"'),'Selected notes included in Study');
function change(tier,key,value,type='select'){
 const target={dataset:{epControl:key},type,value,checked:value===true,closest(sel){
  return sel==='[data-ep-control]'?this:sel==='[data-ep-tier]'?{dataset:{epTier:tier}}:null;
 }};
 listeners.change({target});
}
change('reading','editorial',true,'checkbox');
change('reading','language','english');
change('reading','columns','1');
change('reading','scope','range');
change('reading','from',4,'number');
change('reading','to',6,'number');
window.GnammaEditions.buildPrintable('reading');
const small=nodes.gnEpPacket.innerHTML;
assert.equal(count(small,'class="gn-ep-editorial"'),3,'Optional titles for selected §§');
assert.equal(count(small,'class="gn-ep-pair"'),0,'Monolingual uses no parallel tables');
for(const id of [4,5,6])assert.ok(small.includes('id="gn-ep-section-'+id+'"'));
for(const id of [1,7])assert.ok(!small.includes('id="gn-ep-section-'+id+'"'));
assert.equal(Object.keys(listeners).length,4,'One listener per event family including keyboard tabs');
console.log('PASS: ordered tiers, 258 sections, 414 bilingual pairs, optional editorial headings in both tiers, monolingual range, source notes, navigation, SW and ZIP assets.');
