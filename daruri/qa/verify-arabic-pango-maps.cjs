/* Regression: eight exact Daruri Arabic Pango maps must locate real Arabic words
   and remain bound to their approved PDF SHA. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const crypto=require('node:crypto'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const base=JSON.parse(fs.readFileSync(path.join(root,'editions/manifest.json'),'utf8'));
const maps=JSON.parse(fs.readFileSync(path.join(root,'editions/maps/manifest.json'),'utf8'));
const extra=JSON.parse(fs.readFileSync(path.join(root,'editions/apparatus/manifest.json'),'utf8'));
assert.equal(maps.status,'verified');assert.equal(maps.files.length,12);
assert.equal(extra.files.length,120,'Do not alter apparatus baseline');
const references=new Map(base.files.map(v=>[v.file,v]));
const src=fs.readFileSync(path.join(root,'personal-pdf-enhancements.js'),'utf8');
const window={};
vm.runInNewContext(src,{window,URL,Intl,Date,Number,String,Array,Map,Set,Math},{timeout:2000});
const {sourceMatch,tidy}=window.GnammaPdfUpgrade;
const sha=data=>crypto.createHash('sha256').update(data).digest('hex');
const tests=[];
for(const row of maps.files.filter(x=>x.file.startsWith('reading/')&&
  /-(arabic|arabic-vowelled|bilingual|bilingual-unvowelled)-titles-(on|off)\.pdf$/.test(x.file))){
  const original=references.get(row.file);
  assert(original,'Source PDF must be approved: '+row.file);
  assert.equal(row.sha256,original.sha256);
  assert.equal(row.word_map_present,true);
  assert.ok(row.mapped_segments>=414);
  assert.equal(sha(fs.readFileSync(path.join(root,'editions',row.file))),original.sha256);
  const buf=fs.readFileSync(path.join(root,'editions',row.map_file));
  assert.equal(sha(buf),row.map_sha256,'Word map must match exact SHA');
  const map=JSON.parse(buf);
  assert.equal(map.source_sha256,row.sha256);
  assert.equal(map.section_count,258);
  assert.equal(Object.keys(map.section_pages).length,258);
  assert.equal(Object.keys(map.segments).length,row.mapped_segments);
  const lang=row.file.includes('arabic-vowelled')||row.file.includes('-bilingual-titles-')?'vocalized':'ar';
  assert.deepEqual(JSON.parse(JSON.stringify(row.word_map_coverage[lang])),{matched:414,eligible:414});
  const words=map.segments['11:0:'+lang];
  assert(words?.length>15,'Expected actual authored §11 phrase');
  for(const word of words){
    assert.equal(word.length,6);
    assert(word[1]>0&&word[1]<=original.pages);
    assert(word[2]>=0&&word[4]>word[2]&&word[4]<=596);
    assert(word[3]>=0&&word[5]>word[3]&&word[5]<=843);
  }
  const quote='أما حد الحكم عند أهل السنة فهو عبارة عن خطاب الشرع';
  const hit=sourceMatch(words,{quote});
  assert(hit?.rects?.length>0,'Unvowelled Arabic must match even when the source has vowel marks');
  assert.equal(hit.page,words[0][1]);
  assert(hit.rects.every(r=>r.x0>=0&&r.y0>=0&&r.x1<=596&&r.y1<=843));
  assert.equal(sourceMatch(words,{quote:'نص غير موجود في هذا الموضع'}),null,
    'Unmatched quotes must fall back to the section');
  tests.push({file:row.file,words:words.length,page:hit.page,rectangles:hit.rects.length});
}
assert.equal(tests.length,8,'Exactly eight independently certified Arabic editions');
console.log('PASS eight pixel-certified Arabic PDF word maps, 414/414 Arabic source segments per PDF, saved-quote vowel normalization and safe fallback',tests);
