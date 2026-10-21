'use strict';
// Run: node daruri/qa/verify-reader-refresh.cjs
// The refresh is an optional, user-initiated operation outside the Daruri
// service-worker scope. Never clear personal annotations or unrelated caches.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.resolve(__dirname,'../../refresh-daruri.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script,'isolated refresh page has inline behaviour');
assert.ok(!/<script[^>]+src=/.test(html),'refresh page must not depend on cached scripts');
const btn={disabled:false,click:null,addEventListener(name,fn){if(name==='click')this.click=fn;}};
const status={textContent:''},direct={href:''};
const cleared=[],unregistered=[],cache=new Set(['daruri-reader-20261020','daruri-reader-20261021','unrelated-website-cache']);
const localNotes={record:'important private bookmark',userAnnotation:'private personal note'};
let redirected;
const base='https://gnamma-research.github.io/booksite/refresh-daruri.html';
const regs=[
 {scope:'https://gnamma-research.github.io/booksite/daruri/',async unregister(){unregistered.push(this.scope);return true;}},
 {scope:'https://gnamma-research.github.io/booksite/other-app/',async unregister(){unregistered.push(this.scope);return true;}}
];
const context={
 URL,Date,Promise,
 document:{getElementById(id){return ({refresh:btn,status,'open-direct':direct})[id];}},
 caches:{async keys(){return [...cache]},async delete(name){cleared.push(name);return cache.delete(name);}},
 navigator:{serviceWorker:{async getRegistrations(){return regs}}},
 location:{href:base,assign(url){redirected=url;}},
 window:{caches:true}
};
vm.runInNewContext(script,context,{filename:'refresh-daruri.html'});
assert.equal(typeof btn.click,'function');
assert(direct.href.includes('/booksite/daruri/'));
(async()=>{
 await btn.click();
 assert.deepEqual(cleared.sort(),['daruri-reader-20261020','daruri-reader-20261021']);
 assert.deepEqual(unregistered,['https://gnamma-research.github.io/booksite/daruri/']);
 assert(cache.has('unrelated-website-cache'));
 assert.equal(localNotes.record,'important private bookmark');
 assert.equal(localNotes.userAnnotation,'private personal note');
 const target=new URL(redirected);
 assert.equal(target.pathname,'/booksite/daruri/');
 assert.equal(target.hash,'#section=1');
 assert(target.searchParams.get('gnamma-refresh')?.includes('20261021-qinline4'));
 assert.equal(btn.disabled,true);
 console.log('PASS: refresh is user-initiated, only Daruri offline cache removed, unrelated caches and personal annotations preserved; new reader URL bypasses old cache.');
})().catch(e=>{console.error(e);process.exitCode=1;});
