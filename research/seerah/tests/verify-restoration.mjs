import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const source=JSON.parse(read('editorial/release-1.8.0-restored-chapters.json'));
const original=JSON.parse(read('editorial/archive-20261112-preintegrated-chapters-1.4.1.json'));
const prior=JSON.parse(read('editorial/archived-1.7.0-pre-restoration-chapters.json'));
const reader=read('read-restored-1.8.0.html');
const priorReader=read('read-1.7.0.html');
const manuscript=read('editorial/current-edition-1.8.0-metaphysical-restoration.md');
const critical=JSON.parse(read('data/dossiers.json'));
const changes=JSON.parse(read('editorial/RESTORATION_SELECTIVE_EXTENSIONS_20261113.json'));
const restoration=JSON.parse(read('editorial/RESTORED_CHAPTER_01_METAPHYSICAL_20261113.json'));

assert.equal(source.edition,'1.8.0-metaphysical-restoration');
assert.equal(original.edition,'1.4.1');
assert.equal(prior.edition,'1.7.0-generative-muhammadan-framework');
assert.equal(source.chapters.length,46);
assert.equal(critical.dossiers.length,9);
assert.equal(changes.patches.length,8);
assert.ok(reader.includes('Research edition 1.8.0'));
assert.ok(manuscript.includes('Research edition 1.8.0'));
assert.ok(priorReader.includes('Research edition 1.7.0'));
assert.ok(reader.includes('read-1.7.0.html'));
assert.equal((reader.match(/<article class="chapter"/g)||[]).length,46);
assert.equal((reader.match(/class="matn"/g)||[]).length,46);
assert.equal((reader.match(/class="sharh"/g)||[]).length,46);
assert.ok(reader.includes('data-mode="matn"')&&reader.includes('data-mode="both"'));
assert.ok(reader.includes('data-bookmark=')&&reader.includes('assets/site.js'));
for(const name of ['Nūḥ','Shuʿayb','Iblīs','Ḥirāʾ','al-Ḥudaybiyyah','Baghdad'])assert.ok(reader.includes(name));
for(const k of ['al-wahm al-kullī','Futūḥāt','Muhammadan Reality','Ḥallāj','the Garden'])assert.ok(source.chapters[0].sharh.includes(k),k);
assert.equal(source.chapters[0].matn,restoration.matn);
assert.equal(source.chapters[0].sharh,restoration.sharh);
assert.ok(source.chapters[0].matn.indexOf('builds the Ark') < source.chapters[0].matn.indexOf('At the flood'));
assert.ok(source.chapters[12].sharh.includes('bukhari:709'));
assert.ok(source.chapters[43].sharh.includes('21 December 1868')===false || source.chapters[43].sharh.includes('Privy Council'));
const modified=new Set([1,2,10,11,13,28,33,44,45]);
const result={changedMatns:[],changedSharhs:[],unchanged:[]};
function tokens(s,isHTML){
 if(isHTML)s=s.replace(/<\/(?:p|li|h[1-6]|blockquote)>/g,' ').replace(/<[^>]+>/g,'')
 .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&nbsp;/g,' ');
 else s=s.replace(/\[([^\]]+)\]\(https?:\/\/[^)\s]+\)/g,'$1').replace(/[*_`]/g,'');
 return (s.match(/[\p{L}\p{M}\p{N}]+/gu)||[]).map(w=>w.toLowerCase());
}
for(let i=0;i<46;i++){
 const c=source.chapters[i],b=original.chapters[i],id='ch-'+String(i+1).padStart(2,'0');
 assert.equal(c.id,i+1);
 assert.equal(c.title,b.title);
 if(c.matn!==b.matn)result.changedMatns.push(c.id);
 if(c.sharh!==b.sharh)result.changedSharhs.push(c.id);
 if(!modified.has(c.id)){assert.equal(c.matn,b.matn);assert.equal(c.sharh,b.sharh);result.unchanged.push(c.id);}
 const start=reader.indexOf('<article class="chapter" id="'+id+'"'),end=reader.indexOf('</article>',start);
 assert.ok(start>=0&&end>start,'Missing article '+id);
 const article=reader.slice(start,end);
 for(const layer of ['matn','sharh']){
 const match=layer==='matn'?article.match(/<section class="matn"[^>]*>([\s\S]*?)<\/section>/):article.match(/<div class="sharh-body">([\s\S]*?)<\/div>/);
 assert.ok(match,'Missing '+layer+' '+id);
 assert.deepEqual(tokens(c[layer],false),tokens(match[1],true),'Reader/source mismatch '+id+'/'+layer);
 assert.ok(manuscript.includes(c[layer]),'Manuscript/source mismatch '+id+'/'+layer);
 }
}
assert.deepEqual(result.changedMatns,[1,2,10,11,13,45]);
assert.deepEqual(result.changedSharhs,[1,2,10,11,13,28,33,44,45]);
console.log('PASS Sīrah restoration 1.8: 46 chapter pairs and manuscript, original metaphysical chapter and sources, prior edition archived; 6 revised matns, 9 revised shurūḥ.');