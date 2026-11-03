import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(base,p),'utf8');
const sourceFiles=['data/commentary.js','data/commentary-introduction-1.js','data/commentary-introduction-2.js','data/commentary-introduction-3.js','data/commentary-introduction-4.js','data/commentary-conclusion.js','data/commentary-corpus.js'];
const context=vm.createContext({window:{},console});
for(const file of sourceFiles)new vm.Script(read(file),{filename:file}).runInContext(context);
const corpus=context.window.GNAMMA_TAMHID_CORPUS;
assert.equal(corpus.units.length,46);
assert.equal(corpus.coverage.introductionUnits,40);
assert.equal(corpus.coverage.conclusionUnits,6);
assert.equal(corpus.coverage.wholeCommentaryComplete,false);
assert.equal(new Set(corpus.units.map(x=>x.id)).size,46);
for(let i=0;i<40;i++)assert.equal(corpus.units[i].id,'SH-INTRO-'+String(i+1).padStart(3,'0'));
assert.deepEqual(Array.from(corpus.units.slice(40),u=>u.id),['SH-061-C','SH-061-D','SH-061-E','SH-061-F','SH-061-A','SH-061-B']);
for(const u of corpus.units){assert.ok(u.arabic.trim().length>20,u.id);assert.ok(u.english.trim().length>20,u.id);assert.match(u.sourceUrl,/^https:\/\//);assert.ok(u.sourceEdition==='N'||u.sourceEdition==='A');}
assert.equal(corpus.units.filter(u=>u.lumbardComparator).length,7);
// The final online continuation has no separately verified printed page.
// Test the actual locator contract rather than one incidental wording.
for(const u of corpus.units.slice(37,40)){assert.match(u.sourceLocator,/42/);assert.ok(u.sourceLocator.includes('continuation'));assert.equal(u.sourceEdition,'N');}
new vm.Script(read('data/units.js')).runInContext(context);
assert.equal(context.window.GNAMMA_QAWAID_MATN.units.length,61);
for(const f of ['reader.js','commentary-reader.js','commentary-main-bridge.js'])new vm.Script(read(f),{filename:f});
for(const f of ['index.html','commentary.html'])for(const m of read(f).matchAll(/<script src="([^"]+)"/g))assert.ok(fs.existsSync(path.join(base,m[1])),f+': '+m[1]);

// Small deterministic DOM harness: state and generated markup, not visual rendering.
const elements=new Map(),documentHandlers=new Map(),windowHandlers=new Map(),storage=new Map();
class Element{
 constructor(id='',tag='DIV'){this.id=id;this.tagName=tag;this.dataset={};this.attributes={};this.handlers=new Map();this.style={setProperty(){}};this.textContent='';this.value='';this.open=false;this.disabled=false;this.checked=false;this._html='';}
 set innerHTML(s){this._html=s;for(const m of s.matchAll(/id="([^"]+)"/g))if(!elements.has(m[1]))elements.set(m[1],new Element(m[1]));}
 get innerHTML(){return this._html;}
 setAttribute(k,v){this.attributes[k]=String(v);if(k==='open')this.open=true;}
 removeAttribute(k){delete this.attributes[k];if(k==='open')this.open=false;}
 hasAttribute(k){return Object.hasOwn(this.attributes,k);}
 addEventListener(k,fn){if(!this.handlers.has(k))this.handlers.set(k,[]);this.handlers.get(k).push(fn);}
 fire(k,extra={}){for(const f of this.handlers.get(k)||[])f({target:this,preventDefault(){},stopImmediatePropagation(){},...extra});}
 scrollIntoView(){} focus(){} showModal(){this.open=true;} close(){this.open=false;} appendChild(){} remove(){} click(){this.fire('click');}
 closest(selector){if(selector==='button')return this.tagName==='BUTTON'?this:null;return null;}
 getBoundingClientRect(){return {top:150,bottom:500};}
}
for(const m of read('commentary.html').matchAll(/id="([^"]+)"/g))elements.set(m[1],new Element(m[1]));
const document={documentElement:new Element('html'),body:new Element('body'),getElementById:id=>elements.get(id)||null,querySelectorAll:()=>[],addEventListener:(k,f)=>{if(!documentHandlers.has(k))documentHandlers.set(k,[]);documentHandlers.get(k).push(f);},createElement:tag=>new Element('',tag.toUpperCase())};
const location={hash:'',href:'https://example.org/commentary.html',assign(s){this.href=s;}};
const fakeWindow={GNAMMA_TAMHID_CORPUS:corpus,addEventListener:(k,f)=>windowHandlers.set(k,f)};
const sandbox={window:fakeWindow,document,location,console,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},history:{replaceState(_a,_b,h){location.hash=h;}},navigator:{clipboard:{writeText:()=>Promise.resolve()}},setTimeout:()=>1,clearTimeout(){},requestAnimationFrame:f=>f(),URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},Blob:class{}};
vm.createContext(sandbox);new vm.Script(read('commentary-reader.js')).runInContext(sandbox);
const el=id=>elements.get(id);
assert.ok(el('reading-list').innerHTML.includes('SH-INTRO-001'));
assert.ok(el('reading-list').innerHTML.includes(corpus.units[0].english));
assert.equal(el('total-count').textContent,46);
el('continuous-reading').fire('click');
assert.equal(document.body.dataset.focus,'3');
assert.equal((el('reading-list').innerHTML.match(/<article /g)||[]).length,46);
assert.equal((el('reading-list').innerHTML.match(/class="corpus-gap"/g)||[]).length,1);
el('lang-en').fire('click');assert.equal(document.body.dataset.language,'ar');
el('lang-ar').fire('click');assert.equal(document.body.dataset.language,'ar');
el('lang-en').fire('click');assert.equal(document.body.dataset.language,'both');
el('focus-recover').fire('click');assert.equal(document.body.dataset.focus,'0');
el('save-button').fire('click');assert.ok([...storage.values()].some(s=>s.includes('SH-INTRO-001')));
el('menu-button').fire('click');assert.equal(el('sheet').open,true);assert.ok(el('sheet-content').innerHTML.includes('SH-INTRO-040'));
el('sheet-close').fire('click');assert.equal(el('sheet').open,false);
el('search-button').fire('click');
el('sheet-content').fire('input',{target:{id:'commentary-query',value:'nafs al-amr',dataset:{}}});assert.ok(el('commentary-results').innerHTML.includes('SH-INTRO-026'));
const newButton=new Element('', 'BUTTON');newButton.dataset.jump='40';newButton.attributes['data-jump']='40';for(const f of documentHandlers.get('click')||[])f({target:newButton});
assert.ok(el('reading-list').innerHTML.includes('SH-061-C'));assert.ok(el('reading-list').innerHTML.includes('Intervening commentary not yet translated'));

const report={passed:true,checks:'source loading, sequence, unique IDs, edition labels, comparator coverage, script references, JS syntax, initial/continuous render, gap marker, language invariant, focus recovery, bookmark persistence, contents, search, jump',introUnits:40,concludingUnits:6,totalUnits:46,matnUnits:61,arabicTokens:corpus.units.reduce((n,u)=>n+u.arabic.trim().split(/\s+/).length,0),englishWords:corpus.units.reduce((n,u)=>n+u.english.trim().split(/\s+/).length,0),independentManuscriptsCollated:0,wholeCommentaryComplete:false,visualBrowserTested:false};
fs.writeFileSync(path.join(base,'qa/commentary-test-report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
