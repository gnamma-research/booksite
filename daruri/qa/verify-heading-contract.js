#!/usr/bin/env node
/**
 * Gnamma Darūrī heading/navigation regression check.
 * Run: node daruri/qa/verify-heading-contract.js
 * Depends only on Node.js. Never rewrites scholarly text.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=fs.readFileSync(path.resolve(__dirname,'..','index.html'),'utf8');
const sourceData=html.match(/<script[^>]*\bid="editionData"[^>]*>([\s\S]*?)<\/script>/);
assert(sourceData,'Missing editionData');
const book=JSON.parse(sourceData[1]);
assert.equal(book.sections.length,259,'The original 258 sections plus colophon must remain');
assert.equal(book.stats.passages,416,'Aligned textual units changed unexpectedly');
const codeStart=html.lastIndexOf('<script>');
const codeEnd=html.lastIndexOf('</script>');
assert(codeStart>0 && codeEnd>codeStart,'Missing main reader script');
new vm.Script(html.slice(codeStart+'<script>'.length,codeEnd),{filename:'daruri/index.html'});
const noise=new Set(['the','a','an','in','on','of','and','to','for','by','first','second','third','section','chapter']);
function normalizedTokens(s){
 return String(s||'').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&')
 .replace(/&quot;/g,'"').replace(/&#39;/g,"'").normalize('NFKC')
 .toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim().split(/\s+/)
 .filter(w=>w&&!noise.has(w));
}
function nearDuplicate(a,b){
 if(!a||!b)return false;
 const A=normalizedTokens(a),B=normalizedTokens(b);
 if(!A.length||!B.length)return false;
 const sA=new Set(A),sB=new Set(B),common=[...sA].filter(w=>sB.has(w)).length;
 return A.join(' ')==B.join(' ')||(common>=3 &&
   common/Math.min(sA.size,sB.size)>=.75 &&
   common/new Set([...sA,...sB]).size>=.40);
}
const headers=[...html.matchAll(/<header class="fb-hero">([\s\S]*?)<\/header>/g)]
 .map(m=>m[1]).filter(block=>block.includes('fb-dual-heading'));
assert.equal(headers.length,book.sections.length,'Every section needs exactly one static heading');
for(let i=0;i<headers.length;i++){
 const body=headers[i];
 const editorial=body.match(/<span class="fb-editorial-heading">([^<]*)<\/span>/)?.[1];
 const original=body.match(/<span class="fb-original-heading-en"[^>]*>([^<]*)<\/span>/)?.[1];
 assert(!nearDuplicate(editorial,original),
   'Repeated English editorial and original headings in static section '+book.sections[i].id);
 assert(!body.includes('class="subtitle"'),
   'Repeated subtitle below reading title in static section '+book.sections[i].id);
}
assert(html.includes('function headingsNearDuplicate(editorial,original)'),
       'Dynamic heading de-duplication function missing');
assert(html.includes('collapseDuplicateHeadings();\n applyReadingState()'),
       'De-duplication no longer applied when rendering a section');
for(const id of ['readerPreviousNumber','readerNextNumber','readerDock','dockTitle','dockSection']){
 assert(html.includes('id="'+id+'"'),'Missing numbered reader dock element '+id);
}
assert(html.includes("const ordinal=$('#'+id+'Number')"),
       'Previous/next numbers no longer synchronize with selected section');
assert(!html.includes('<span>Previous<small>')&&!html.includes('<span>Next<small>'),
       'Static dock has regressed to wide Previous/Next labels');
const staticNumbers=(html.match(/class="fb-step-number"/g)||[]).length;
assert(staticNumbers>=510,'Static dock section numbers missing');
const nativePageIds=[...html.matchAll(/class="fb-page fb-reading-page" data-native-section="([^"]+)"/g)].map(m=>m[1]);
assert.equal(nativePageIds.length,book.sections.length,'Static reading pages missing');
assert.equal(new Set(nativePageIds).size,nativePageIds.length,'Static section IDs are duplicated');
console.log('Darūrī heading/navigation contract passed: '+book.sections.length+
 ' unique static headings, 416 passages; JS syntax, de-duplication, section numbers and dock checked.');
