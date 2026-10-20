#!/usr/bin/env node
/**
 * Darūrī reader tri-state Arabic and numbered-dock regression check.
 * Run from repository root: node daruri/qa/verify-language-cycle.js
 * Only reads files and does not rewrite scholarly data.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const html=fs.readFileSync(path.resolve(__dirname,'..','index.html'),'utf8');
const mainStart=html.lastIndexOf('<script>');
const mainEnd=html.lastIndexOf('</script>');
assert(mainStart>=0&&mainEnd>mainStart,'Main reader JS is missing');
new vm.Script(html.slice(mainStart+8,mainEnd),{filename:'daruri/index.html'});
function extract(name){
 const at=html.indexOf('function '+name+'(');
 assert(at>=0,'Missing '+name);
 const source=html.slice(at);
 let depth=0,braced=false,end=-1;
 for(let i=source.indexOf('{');i<source.length;i++){
  if(source[i]==='{') {depth++;braced=true;}
  if(source[i]==='}') depth--;
  if(braced&&depth===0){end=i+1;break;}
 }
 assert(end>0,'Cannot extract '+name);
 return source.slice(0,end);
}
const fnSource=html.match(/function nextLanguageControlState\(lang,vowels,value\) \{[\s\S]*?\n\}/);
assert(fnSource,'No pure Arabic/English language transition');
const next=vm.runInNewContext('('+fnSource[0]+')');
function step(lang,vowels,button,expectedLang,expectedVowels){
 const out=next(lang,vowels,button);
 assert.equal(out.lang,expectedLang,lang+' '+String(vowels)+' '+button+' language');
 assert.equal(out.vowels,expectedVowels,lang+' '+String(vowels)+' '+button+' voweling');
}
step('english',false,'arabic','parallel',false);
step('parallel',false,'arabic','parallel',true);
step('parallel',true,'arabic','english',false);
step('arabic',false,'arabic','arabic',true);
step('arabic',true,'arabic','arabic',false);
step('english',true,'arabic','parallel',false);
step('english',false,'english','english',false);
step('parallel',true,'english','arabic',true);
step('arabic',true,'english','parallel',true);
const languageSource=html.match(/function languageButtons\(\) \{[\s\S]*?\n\}/);
assert(languageSource,'Language button renderer missing');
const context={state:{lang:'english',vowels:false}};
const buttonMarkup=vm.runInNewContext(languageSource[0]+'\nlanguageButtons()',context);
assert(buttonMarkup.includes('data-arabic-state="off"'));
assert(buttonMarkup.includes('>EN</button>'));
context.state={lang:'parallel',vowels:true};
const vowelled=vm.runInNewContext(languageSource[0]+'\nlanguageButtons()',context);
assert(vowelled.includes('>عَ</span>'));
assert(!/id=["']quickVowels["']/.test(html),'Old tashkeel toolbar button should be removed');
assert(!/id=["']apparatusTashkil["']/.test(html),'Apparatus duplicates Arabic state');
const contextPos=html.indexOf('id="contextToolbar"');
const focusPos=html.indexOf('id="focusToolbar"');
assert(focusPos>0,'Focus control missing');
assert(html.includes('function toggleContextPanel(){ /* Retired right pane. */ }'),'Retired right Context pane must not be reactivated');
for(const id of ['readerPreviousNumber','readerNextNumber','dockPart','dockSection','dockTitle']){
 assert(html.includes('id="'+id+'"'),'Missing dock '+id);
}
assert(html.includes('gn-section-number-ar-only'),'Part and section heading must remain inline');
console.log('PASS: nine Arabic/English state cases, rendered glyphs, preserved controls, retired context pane, numbered dock, JS syntax');
