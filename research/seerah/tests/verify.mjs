import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
const root=join(import.meta.dirname,'..');
const read=p=>readFileSync(join(root,p),'utf8');
const data=JSON.parse(read('data/chapters.json'));
const dossiers=JSON.parse(read('data/dossiers.json'));
const html=read('read.html');
const atlas=read('atlas.html');
const landing=read('index.html');
const notes=read('dossiers.html');
const current=read('editorial/current-edition-1.4.1.md');
const archived=read('editorial/source-edition-1.4.md');
assert.equal(data.chapters.length,46);
assert.equal(dossiers.dossiers.length,9);
assert.equal(data.edition,'1.4.1');
assert.ok(html.includes('Research edition 1.4.1 · under review'));
assert.ok(current.includes('## 46.') && archived.includes('Dossier 9'));
assert.equal((html.match(/<article class="chapter"/g)||[]).length,46);
assert.equal((html.match(/class="matn"/g)||[]).length,46);
assert.equal((html.match(/class="sharh"/g)||[]).length,46);
assert.ok(html.includes('data-mode="matn"') && html.includes('data-mode="both"'));
assert.ok(html.includes('data-bookmark=') && html.includes('assets/figures.js') && html.includes('assets/site.js'));
assert.ok(landing.includes('read.html') && landing.includes('atlas.html'));
assert.ok(!/<img[^>]+src=""|href=""/.test(html));
for(let i=1;i<=9;i++)assert.ok(notes.includes('id="dossier-'+i+'"'));
for(const id of ['timeline','arabia','community','authority','law','spiritual','monsoon'])assert.ok(atlas.includes('id="figure-'+id+'"'));

// Complete static-content parity: source, reader and the current critical manuscript.
// Compare tokens to ignore presentational Markdown emphasis and inline HTML.
function tokens(s,isHtml){
 if(isHtml)s=s.replace(/<\/(?:p|li|h[1-6]|blockquote)>/g,' ')
   .replace(/<[^>]+>/g,'').replace(/&amp;/g,'&')
   .replace(/&lt;/g,'<').replace(/&gt;/g,'>')
   .replace(/&quot;/g,'"').replace(/&nbsp;/g,' ');
 else s=s.replace(/\[([^\]]+)\]\(https?:\/\/[^)\s]+\)/g,'$1').replace(/[*_\`]/g,'');
 return (s.match(/[\p{L}\p{M}\p{N}]+/gu)||[]).map(t=>t.toLowerCase());
}
const forbidden=[
 /\b(?:this|the) (?:chapter|matn|sharḥ|commentary|narrative) (?:should|must|now|thus|is|does|shows|explains|prepares)\b/i,
 /\b(?:the reader|readers?) (?:should|must|needs? to|can|will|understand|see)\b/i,
 /\b(?:we|one) (?:must|should|need to) \b/i,
 /\b(?:the point is|the purpose is|the lesson is|it is worth|the next chapter|the story must|for the reader|the comparison (?:shows|helps)|the narrative (?:begins|moves))\b/i,
 /(?:^|\n\n)\s*(?:Consider|Compare|Begin with)\b/i,
 /\b(?:what matters|the relevant question is|the deeper mechanism was|those differences prepare)\b/i
];
for(let i=1;i<=46;i++){
 const ch=data.chapters[i-1],id='ch-'+String(i).padStart(2,'0');
 assert.equal(ch.id,i);
 assert.ok(ch.matn.length>400 && ch.sharh.length>500);
 const start=html.indexOf('<article class="chapter" id="'+id+'"'), end=html.indexOf('</article>',start);
 assert.ok(start>=0&&end>start,'Missing chapter '+id);
 const article=html.slice(start,end);
 for(const layer of ['matn','sharh']){
  const match=layer==='matn'
   ?article.match(/<section class="matn"[^>]*>([\s\S]*?)<\/section>/)
   :article.match(/<div class="sharh-body">([\s\S]*?)<\/div>/);
  assert.ok(match,'Missing '+layer+' for '+id);
  assert.deepEqual(tokens(ch[layer],false),tokens(match[1],true),'Rendered '+layer+' differs for '+id);
  assert.ok(current.includes(ch[layer]),'Canonical manuscript differs: '+id+' '+layer);
  for(const pattern of forbidden)assert.ok(!pattern.test(ch[layer]),'Self-referential prose: '+id+' '+layer+': '+pattern);
 }
}
// Additional style checks: methodological instructions belong in the critical apparatus,
// not in the continuous narrative or explanatory commentary.
const editorialCommands=[
 /\b(?:should be (?:compared|studied|examined|read|distinguished|understood|set)|must be (?:examined|compared|traced))\b/i,
 /\b(?:This is the sort|This history makes|This is where|the deeper mechanism was)\b/i
];
for(const chapter of data.chapters){
 for(const layer of ['matn','sharh']){
  for(const pattern of editorialCommands)assert.ok(!pattern.test(chapter[layer]),'Editorial instruction in '+chapter.id+' '+layer+': '+pattern);
 }
}
console.log('PASS: 46 aligned matns/shurūḥ, 9 dossiers, 7 figures, source parity and direct-prose rules');