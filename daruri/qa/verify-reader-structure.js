#!/usr/bin/env node
/** Source-first heading contract. Optional argument: a candidate reader HTML.
 * NODE_PATH=/tmp/daruri-study-qa/node_modules node daruri/qa/verify-reader-structure.js
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const file=process.argv[2]||path.resolve(__dirname,'../index.html');
const html=fs.readFileSync(file,'utf8'),BOOK=require('./load-book')(html);
const script=html.slice(html.lastIndexOf('<script>')+8,html.lastIndexOf('</script>'));new vm.Script(script);
function extract(name){const a=script.indexOf('function '+name+'(');assert.ok(a>=0,name);for(let b=script.indexOf('}',a);b>=0;b=script.indexOf('}',b+1)){const value=script.slice(a,b+1);try{new vm.Script('('+value+')');return value;}catch(_){}}throw Error(name);}
const css=fs.readFileSync(path.resolve(__dirname,'../reader-structure.css'),'utf8');
const dom=new JSDOM('<!doctype html><html><head><style>'+css+'</style></head><body><main class="reader mode-parallel" id="reader"><div class="reader-heading"></div></main></body></html>');
const doc=dom.window.document,container=doc.querySelector('.reader-heading');
const state={vowels:true},esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const bareArabic=s=>String(s).replace(/[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed]/g,'');
const context=vm.createContext({state,esc,bareArabic});vm.runInContext(extract('headingsNearDuplicate')+'\n'+extract('renderReaderHeading'),context);
const render=vm.runInContext('renderReaderHeading',context),near=vm.runInContext('headingsNearDuplicate',context);
let source=0,editorial=0,captions=0;
for(const s of BOOK.sections){
 container.innerHTML=render(s);
 const heading=container.querySelector('h1.paired-heading');assert.ok(heading,s.id);assert.equal(container.querySelectorAll('h1').length,1);
 if(s.headingAr){
  source++;assert.ok(heading.classList.contains('gn-source-heading'));assert.equal(heading.querySelector('.source-heading-en').textContent,s.headingEn||s.title);assert.equal(heading.querySelector('.source-heading-ar').textContent,s.headingVocalized||s.headingAr);assert.equal(heading.querySelector('.editorial-heading'),null);
  const caption=container.querySelector('.gn-editorial-section-caption');assert.equal(!!caption,!near(s.title,s.headingEn),String(s.id));
  if(caption){captions++;assert.equal(caption.querySelector('.editorial-heading').textContent,s.title);assert.ok(caption.querySelector('.gn-editorial-caption-label').textContent.startsWith('Editorial'));}
 }else{
  editorial++;assert.ok(heading.classList.contains('gn-editorial-only-heading'));assert.equal(heading.querySelector('.editorial-heading').textContent,s.title);assert.equal(heading.previousElementSibling.textContent,'Editorial section');
 }
 container.innerHTML=render(s,'h3');assert.equal(container.querySelectorAll('h3.paired-heading').length,1);assert.equal(container.querySelector('h1'),null);
 doc.getElementById('reader').className='reader mode-arabic';
 for(const el of container.querySelectorAll('.gn-editorial-section-caption,.gn-editorial-section-label,.gn-editorial-only-heading'))assert.equal(dom.window.getComputedStyle(el).display,'none','Arabic editorial visibility '+s.id);
 doc.getElementById('reader').className='reader mode-parallel';
}
assert.equal(source,47);assert.equal(editorial,212);
const native=new JSDOM(html).window.document;
for(const s of BOOK.sections){
 const page=native.querySelector('[data-native-section="'+s.id+'"]'),header=page.querySelector('.fb-hero'),heading=header.querySelector('h1.fb-dual-heading');assert.ok(heading,s.id);
 if(s.headingAr){assert.ok(heading.classList.contains('gn-source-heading'));assert.equal(heading.querySelector('.fb-editorial-heading'),null);assert.equal(heading.querySelector('.fb-unvowelled').textContent,s.headingAr);assert.equal(heading.querySelector('.fb-original-heading-en').textContent,s.headingEn);}
 else{assert.ok(heading.classList.contains('gn-editorial-only-heading'));assert.equal(heading.previousElementSibling.textContent,'Editorial section');}
 assert.equal(header.querySelectorAll('.fb-heading-source-popup').length,1);assert.equal(header.querySelectorAll('.gn-pdf-source-link').length,1);
}
const links=[...native.querySelectorAll('head link[rel="stylesheet"]')];assert.ok(links.at(-1).getAttribute('href').startsWith('reader-structure.css'));
assert.ok(html.includes('collapseDuplicateHeadings();\n applyReadingState()'));
assert.ok(script.includes("renderReaderHeading(sec,'h3')"));
console.log(`PASS: source-first normal/continuous headings for all 259 sections; ${source} source rubrics, ${editorial} labelled editorial units, ${captions} distinct secondary captions; Arabic editorial visibility and all native source popovers/PDF links retained.`);
dom.window.close();
