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
assert.equal(api.sourceMatch(ambiguous,{quote:'proceed, after praising God',prefix:'',suffix:''}),null,'ambiguous exact quote needs safe section fallback');
assert(api.tidy('الْحَمْدُ لِلَّهِ').includes('الحمدلله'));
const mf=JSON.parse(fs.readFileSync(path.join(root,'pdf-editions-manifest.json'),'utf8'));
for(const file of ['daruri.pdf','daruri-study.pdf','daruri-english.pdf','daruri-arabic.pdf','daruri-arabic-vowelled.pdf']){
  const m=JSON.parse(fs.readFileSync(path.join(root,'personal-anchor-maps',file+'.json'),'utf8'));
  assert.equal(m.source_sha256,mf.files[file].sha256,'the exact map must be bound to the edition hash');
  assert(m.coverage>0.99,'layout map missing too many segments');
  assert(Object.keys(m.segments).length>=400,'full-layout coverage expected');
  const lang=file.includes('english')?'en':file.includes('arabic')?'ar':'en';
  const anchor=m.segments['1:0:'+((file.includes('vowelled')||file==='daruri.pdf'||file==='daruri-study.pdf')&&lang==='ar'?'vocalized':lang)];
  assert(anchor?.length>10,'section 1 must include verified word positions: '+file);
  for(const w of anchor.slice(0,30)){
    assert(w.length===6&&typeof w[0]==='string'&&Number.isInteger(w[1])&&w[1]>0);
    assert(w[2]>=0&&w[3]>=0&&w[4]>w[2]&&w[5]>w[3],'invalid word rectangle: '+file);
  }
}
const ex=fs.readFileSync(path.join(root,'personal-export.js'),'utf8');
assert(ex.includes('sourceMatch(words,target)')&&ex.includes('drawLinkedHighlight(pdf,sourcePage,where.hit,destPage,noteTarget.top)'));
assert(s.includes("Subtype:PDFName.of('Link')"),'two-way navigation must use PDF links');
assert(!s.includes("Subtype:PDFName.of('Text')"),'no personal comment boxes allowed');
assert(!s.includes("Subtype:PDFName.of('Highlight')"),'clickable highlights must not add annotation comment entries');
assert(ex.includes('searchableFonts(pdf,URL_ROOT)')&&ex.includes('textOverlay(pdf,out'));
assert(ex.includes('candidate.source_sha256===metadata.sha256'));
assert(ex.includes("if(!p.appendix)throw Error"),'links must have an appendix destination');
const reserve=[];
for(const desired of [90,90,90,90,90,90]){
  const top=api.allocateMarginTop(reserve,desired,842);
  assert(top!==null&&top>=57&&top<=792);
  assert(reserve.filter(v=>Math.abs(v-top)<20).length===1);
}
assert(api.sourceTop({section:'12'},null,{anchors:{'section-12':{page:3,y:170}}},2)===170);
assert(api.sourceTop({section:'12'},null,{anchors:{'section-12':{page:4,y:170}}},2)===82);
const html=fs.readFileSync(path.join(root,'personal-export.html'),'utf8');
assert(html.indexOf('personal-pdf-enhancements.js')<html.indexOf('personal-export.js'));
assert(html.includes('name="pe-mode" value="none" checked'));
console.log('PASS P-note identifiers, margin collision safety, no popups, verified links, multilingual Unicode and unchanged clean default');