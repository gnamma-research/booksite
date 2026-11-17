import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root),'utf8');
const d=JSON.parse(read('data/chapters.json')),old=JSON.parse(read('editorial/archive-20261117-pre2.0.0-chapters.json')),base=JSON.parse(read('editorial/release-1.8.0-restored-chapters.json'));
const html=read('read.html'),ms=read('editorial/current-edition-2.0.0-integral-46.md');
assert.equal(d.edition,'2.0.0-integral-muhammadan-46');
assert.equal(d.chapters.length,46);
assert.equal((html.match(/<article class="chapter"/g)||[]).length,46);
assert.equal((html.match(/class="matn"/g)||[]).length,46);
assert.equal((html.match(/class="sharh"/g)||[]).length,46);
assert.doesNotMatch(html,/Research edition|Editorial status|Editorial and source notes|under review/i);
function tok(s,ish){
 if(ish)s=s.replace(/<\/(?:p|li|h[1-6]|blockquote)>/g,' ').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&nbsp;/g,' ');
 else s=s.replace(/\[([^\]]+)\]\(https?:\/\/[^)\s]+\)/g,'$1').replace(/[*_\x60]/g,'');
 return(s.match(/[\p{L}\p{M}\p{N}]+/gu)||[]).map(x=>x.toLowerCase());
}
for(let i=0;i<46;i++){
 const c=d.chapters[i],p=old.chapters[i],b=base.chapters[i],id='ch-'+String(c.id).padStart(2,'0');
 assert.equal(c.id,i+1);
 assert.notEqual(c.matn,p.matn);assert.notEqual(c.matn,b.matn);assert.notEqual(c.sharh,b.sharh);
 const a=html.indexOf('<article class="chapter" id="'+id+'"'),z=html.indexOf('</article>',a);
 assert.ok(a>=0&&z>a);
 const article=html.slice(a,z),m=article.match(/<section class="matn"[^>]*>([\s\S]*?)<\/section>/),s=article.match(/<div class="sharh-body">([\s\S]*?)<\/div>/);
 assert.ok(m&&s);assert.deepEqual(tok(c.matn,false),tok(m[1],true));assert.deepEqual(tok(c.sharh,false),tok(s[1],true));
 assert.ok(ms.includes(c.matn)&&ms.includes(c.sharh));
}
for(const p of ['people','subjects']){
 const data=JSON.parse(read('data/'+p+'.json'));
 for(const x of data.entries)for(const a of x.appearances||[])assert.ok(html.includes('id="'+a.anchor+'"'));
 assert.ok(data.entries.reduce((n,x)=>n+(x.appearances||[]).length,0)>=(p==='people'?200:300));
}
assert.ok(html.includes('data-mode="matn"')&&html.includes('data-mode="both"'));
console.log('PASS 46 rewritten matns, 46 source-rich shuruh, reader and manuscript parity, reference index links, no editorial status in reader');

for(const fragment of ['Dossier 1 examines','(Dossier 7)','A rigorous microhistory would'])assert.ok(!html.includes(fragment),'Editorial/process-language fragment visible in reader: '+fragment);
