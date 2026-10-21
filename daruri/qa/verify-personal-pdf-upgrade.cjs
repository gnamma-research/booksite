'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const s=fs.readFileSync(path.join(root,'personal-pdf-enhancements.js'),'utf8');
new Function(s);
const scope={window:{},document:{},URL,Intl,Date,Number,String,Array,Map,Set,Math};
vm.runInNewContext(s,scope,{timeout:2000});
const api=scope.window.GnammaPdfUpgrade;
assert(api);
const en=[
 ['To',1,310,80,322,92],['proceed,',1,326,80,366,92],['after',1,370,80,391,92],
 ['praising',1,396,80,431,92],['God,',1,436,80,458,92],['who',1,466,80,480,92]
];
const hit=api.sourceMatch(en,{quote:'proceed, after praising God',prefix:'To ',suffix:', who'});
assert(hit,'unique exact English quote should match');
assert.equal(hit.page,1);assert.equal(hit.rects.length,1);
assert(hit.rects[0].x0>=320&&hit.rects[0].x1<=460);
assert.equal(api.sourceMatch(en,{quote:'proceed without that evidence'}),null);
const ar=[['وَبَعْدَ',2,180,90,245,114],['حَمْدِ',2,132,90,175,114],
 ['اللَّهِ',2,89,90,126,114],['وَالصَّلَاةِ',2,30,90,85,114]];
const found=api.sourceMatch(ar,{quote:'وبعد حمد الله والصلاة'});
assert(found,'Arabic vowel marks must not prevent exact phrase match');
assert.equal(found.page,2);
assert(found.rects[0].x0<=30&&found.rects[0].x1>=240);
const ambiguous=[...en,...en.map(w=>[w[0],1,w[2],w[3]+45,w[4],w[5]+45])];
assert.equal(api.sourceMatch(ambiguous,{quote:'proceed, after praising God'}),null,'ambiguous exact quote needs safe section fallback');
assert(api.tidy('الْحَمْدُ لِلَّهِ').includes('الحمدلله'));
const ex=fs.readFileSync(path.join(root,'personal-export.js'),'utf8');
assert(ex.includes('sourceMatch(words,target)')&&ex.includes('addHighlight(pdf'));
assert(ex.includes('searchableFonts(pdf,URL_ROOT)')&&ex.includes('textOverlay(pdf,out'));
assert(ex.includes('candidate.source_sha256===metadata.sha256'));
assert(ex.includes("if(!p.appendix&&skipped.length)"),'notes must never disappear from export');
const html=fs.readFileSync(path.join(root,'personal-export.html'),'utf8');
assert(html.indexOf('personal-pdf-enhancements.js')<html.indexOf('personal-export.js'));
assert(html.includes('name="pe-mode" value="none" checked'));
console.log('PASS unique English and RTL Arabic highlights, ambiguity fallback, checksum contract, searchable Unicode engine and privacy default');