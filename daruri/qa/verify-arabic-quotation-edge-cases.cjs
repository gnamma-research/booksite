/* Exact Arabic quotation safety regression over actual Pango word maps.
   No PDF geometry guesses, no alterations to any published PDF. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const src=fs.readFileSync(path.join(root,'personal-pdf-enhancements.js'),'utf8');
const sandbox={window:{},URL,Intl,Date,Number,String,Array,Map,Set,Math};
vm.runInNewContext(src,sandbox,{timeout:10000});
const {sourceMatch,tidy}=sandbox.window.GnammaPdfUpgrade;
const index=JSON.parse(fs.readFileSync(path.join(root,'editions/maps/manifest.json'),'utf8'));
const selected=index.files.filter(x=>
 /^reading\/daruri-reading-(?:arabic|arabic-vowelled|bilingual|bilingual-unvowelled)-titles-(?:on|off)\.pdf$/.test(x.file));
assert.equal(selected.length,8);
const outcomes=[];
for(const row of selected){
 const map=JSON.parse(fs.readFileSync(path.join(root,'editions',row.map_file),'utf8'));
 const lang=row.file.includes('arabic-vowelled')||row.file.includes('bilingual-titles-')?'vocalized':'ar';
 const words=map.segments['11:0:'+lang];
 assert.ok(words?.length>15,'Missing source words: '+row.file);
 const quote='أما حد الحكم عند أهل السنة فهو عبارة عن خطاب الشرع';
 const variants=[
   quote,
   'اما حد الحكم عند اهل السنة فهو عبارة عن خطاب الشرع',
   'أَمَّا حَدُّ الْحُكْمِ عِنْدَ أَهْلِ السُّنَّةِ فَهُوَ عِبَارَةٌ عَنْ خِطَابِ الشَّرْعِ',
   'أما حـدّ الحكم عند أهـل السنة فهو عبارة عن خطاب الشرع',
   'أما، حدُ الحكم! عندَ أهل السنة: فهو عبارة عن خطاب الشرع.'
 ];
 for(const q of variants){
  const hit=sourceMatch(words,{quote:q});
  assert(hit,'Missing valid Arabic quote in '+row.file+': '+q);
  assert.equal(hit.page,words[0][1]);
  assert(hit.rects.every(r=>r.x0>=0&&r.x1<=596&&r.y0>=0&&r.y1<=843));
 }
 assert.equal(sourceMatch(words,{quote:'نص غير موجود هنا في هذا الكتاب'}),null);
 let softWrap=false;
 for(let i=1;i<words.length-3;i++){
  if(words[i-1][1]!==words[i][1]||Math.abs(words[i][3]-words[i-1][3])<=5)continue;
  const q=words.slice(i-1,i+4).map(w=>w[0]).join(' ');
  const hit=sourceMatch(words,{quote:q});
  if(hit&&hit.rects.length>=2){softWrap=true;break;}
 }
 const across=[['أما',1,500,45,530,65],['حد',1,460,45,495,65],
               ['الحكم',2,510,30,550,55],['عند',2,465,30,505,55]];
 assert.equal(sourceMatch(across,{quote:'أما حد الحكم عند'}),null,
   'Cross-page selections must fall back to section links');
 const repeated=[...words.slice(0,10),...words.slice(0,10).map(w=>[
   w[0],w[1],w[2],w[3]+35,w[4],w[5]+35
 ])];
 const fragment=words.slice(0,6).map(w=>w[0]).join(' ');
 assert.equal(sourceMatch(repeated,{quote:fragment}),null,
   'Repeated quote without strong context is ambiguous');
 assert.equal(sourceMatch([['أما',2,-5,20,6,41]],{quote:'أما أما أما'}),null);
 outcomes.push({edition:row.file,language:lang,forms:variants.length,softWrap});
}
assert.equal(tidy('إِنَّ الْقُرْآنَ').includes('انالقران'),true);
console.log('PASS 8 editions: normalized Arabic quotation variants and missing/repeated/cross-page fail-closed cases',outcomes);
