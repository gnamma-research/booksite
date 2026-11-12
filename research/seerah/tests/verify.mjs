import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
const root=join(import.meta.dirname,'..');
const read=p=>readFileSync(join(root,p),'utf8');

const data=JSON.parse(read('data/chapters.json'));
const prior=JSON.parse(read('editorial/archive-1.5.0-pre1.6-chapters.json'));
const current=read('editorial/current-edition-1.6.0-scholarly.md');
const priorMan=read('editorial/current-edition-1.5.0-integrated.md');
const priorHTML=read('editorial/archive-1.5.0-pre1.6-reader.html');
const oldMan=read('editorial/current-edition-1.4.1.md');
const oldArchive=read('editorial/archive-20261112-preintegrated-complete-manuscript-1.4.1.md');
const html=read('read.html'),landing=read('index.html');
const atlas=read('atlas.html'),notes=read('dossiers.html');
const dossiers=JSON.parse(read('data/dossiers.json'));
const encounters=JSON.parse(read('editorial/encounters-1_6/index.json'));
const claimLedger=JSON.parse(read('editorial/CLAIM_WITNESS_LEDGER_1_6_20261112.json'));
const regional=JSON.parse(read('editorial/REGIONAL_MICROHISTORIES_1_6_20261112.json'));

assert.equal(data.edition,'1.6.0-scholarly-revision');
assert.equal(data.chapters.length,46);
assert.equal(prior.edition,'1.5.0-integrated-first-pass');
assert.equal(oldMan,oldArchive,'The previous 1.4.1 edition must remain exactly preserved');
assert.ok(priorHTML.includes('Research edition 1.5.0'),'Older static reader must be preserved');
assert.ok(priorMan.includes('Research edition 1.5.0'),'The 1.5.0 manuscript must be preserved');
assert.deepEqual(data.chapters[1],prior.chapters[1],'Chapter 02 must remain unchanged');
assert.notEqual(data.chapters[0].matn,prior.chapters[0].matn,'Opening ontological correction must be present');

const recompose=new Set([8,11,13,16,19,27,28,29,30,31,32,33,44]);
const regionalEdited=new Set([34,35,36,37,38,39,40,41,42,43,45,46]);
let edited=0;
for(let i=0;i<46;i++){
 const a=data.chapters[i],b=prior.chapters[i],id=i+1;
 const changed=a.matn!==b.matn||a.sharh!==b.sharh;
 if(changed)edited++;
 assert.equal(a.id,id);
 assert.equal(a.title,b.title,'A previously established chapter title was lost');
 if(recompose.has(id)){assert.notEqual(a.matn,b.matn,'Expected full matn replacement in '+id);assert.notEqual(a.sharh,b.sharh);}
 if(regionalEdited.has(id)){assert.equal(a.matn,b.matn,'Regional case should not silently change matn '+id);assert.ok(a.sharh.startsWith(b.sharh),'Historical sharḥ should be retained as start of regional case '+id);}
 if(!recompose.has(id)&&!regionalEdited.has(id)&&id!==1)assert.deepEqual(a,b,'Unexpectedly changed chapter '+id);
}
assert.equal(edited,26);

assert.equal(dossiers.dossiers.length,9);
assert.equal(encounters.entries.length,50);
assert.equal(encounters.entries.filter(e=>e.deep_analysis).length,18);
assert.equal(regional.cases.length,13);
assert.equal(claimLedger.entries.length,46);
assert.equal(claimLedger.entries.reduce((n,e)=>n+e.claims.length,0),138);

assert.ok(html.includes('Research edition 1.6.0'));
assert.ok(landing.includes('Research edition 1.6.0'));
assert.ok(html.includes('editorial/current-edition-1.6.0-scholarly.md'));
assert.equal((html.match(/<article class="chapter"/g)||[]).length,46);
assert.equal((html.match(/class="matn"/g)||[]).length,46);
assert.equal((html.match(/class="sharh"/g)||[]).length,46);
assert.ok(html.includes('data-mode="matn"')&&html.includes('data-mode="both"'));
assert.ok(html.includes('data-bookmark=')&&html.includes('assets/site.js')&&html.includes('assets/figures.js'));
assert.ok(!/<img[^>]+src=""|href=""/.test(html));
for(let i=1;i<=9;i++)assert.ok(notes.includes('id="dossier-'+i+'"'));
for(const x of ['timeline','arabia','community','authority','law','spiritual','monsoon'])assert.ok(atlas.includes('id="figure-'+x+'"'));

function tokens(s,isHtml){
 if(isHtml)s=s.replace(/<\/(?:p|li|h[1-6]|blockquote)>/g,' ')
 .replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<')
 .replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&nbsp;/g,' ');
 else s=s.replace(/\[([^\]]+)\]\(https?:\/\/[^)\s]+\)/g,'$1').replace(/[*_\`]/g,'');
 return (s.match(/[\p{L}\p{M}\p{N}]+/gu)||[]).map(t=>t.toLowerCase());
}
const forbidden=[
 /\b(?:this|the) (?:chapter|matn|sharḥ|commentary|narrative) (?:should|must|now|thus|is|does|shows|explains|prepares)\b/i,
 /\b(?:the reader|readers?) (?:should|must|needs? to|can|will|understand|see)\b/i,
 /\b(?:we|one) (?:must|should|need to) \b/i,
 /\b(?:the point is|the purpose is|the lesson is|it is worth|the next chapter|the story must|for the reader|the comparison (?:shows|helps)|the narrative (?:begins|moves))\b/i,
 /(?:^|\n\n)\s*(?:Consider|Compare|Begin with)\b/i,
 /\b(?:what matters|the relevant question is|the deeper mechanism was|those differences prepare)\b/i,
 /\b(?:should be (?:compared|studied|examined|read|distinguished|understood|set)|must be (?:examined|compared|traced))\b/i,
 /\b(?:This is the sort|This history makes|This is where|the deeper mechanism was)\b/i
];
for(let i=1;i<=46;i++){
 const ch=data.chapters[i-1],id='ch-'+String(i).padStart(2,'0');
 assert.ok(ch.matn.length>400&&ch.sharh.length>500);
 const start=html.indexOf('<article class="chapter" id="'+id+'"'),end=html.indexOf('</article>',start);
 assert.ok(start>=0&&end>start,'Missing static article '+id);
 const article=html.slice(start,end);
 for(const layer of ['matn','sharh']){
  const match=layer==='matn'
  ?article.match(/<section class="matn"[^>]*>([\s\S]*?)<\/section>/)
  :article.match(/<div class="sharh-body">([\s\S]*?)<\/div>/);
  assert.ok(match,'Missing '+layer+' in '+id);
  assert.deepEqual(tokens(ch[layer],false),tokens(match[1],true),'Canonical/reader mismatch '+id+' '+layer);
  assert.ok(current.includes(ch[layer]),'Manuscript missing canonical '+id+' '+layer);
  for(const f of forbidden)assert.ok(!f.test(ch[layer]),'Editor-directed language '+id+' '+layer+': '+f);
 }
}
console.log('PASS Sīrah edition 1.6.0: 46 aligned chapter pairs, 26 audited changes, previous versions preserved, 50 encounters, 138 claim inventory, 13 regional cases, 9 dossiers, 7 atlas figures, source/static/manuscript parity, direct-prose check');
