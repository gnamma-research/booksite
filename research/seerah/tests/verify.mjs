import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
const root=join(import.meta.dirname,'..');
const read=p=>readFileSync(join(root,p),'utf8');

const data=JSON.parse(read('data/chapters.json'));
const prior=JSON.parse(read('editorial/archive-1.6.0-pre-prose-audit-chapters.json'));
const current=read('editorial/current-edition-1.7.0-generative.md');
const old162=JSON.parse(read('editorial/archive-1.6.2-pre1.7-chapters.json'));
const old162Reader=read('editorial/archive-1.6.2-pre1.7-reader.html');
const old162Man=read('editorial/current-edition-1.6.2-targeted-fidelity.md');
const method=read('editorial/GENERATIVE_EXPLANATORY_NARRATIVE_1_7_20261113.md');
const frame=read('framework.html');
const nexus=JSON.parse(read('editorial/CHAPTER_NEXUS_PLAN_1_7_20261113.json'));
const prior161=JSON.parse(read('editorial/archive-1.6.1-pre1.6.2-chapters.json'));
const prior161HTML=read('editorial/archive-1.6.1-pre1.6.2-reader.html');
const prior161Man=read('editorial/current-edition-1.6.1-prose-reviewed.md');
const priorMan=read('editorial/current-edition-1.6.0-scholarly.md');
const priorHTML=read('editorial/archive-1.6.0-pre-prose-audit-reader.html');
const oldMan=read('editorial/current-edition-1.4.1.md');
const oldArchive=read('editorial/archive-20261112-preintegrated-complete-manuscript-1.4.1.md');
const html=read('read.html'),landing=read('index.html');
const tables=read('tables-vi-vii.html');
const atlas=read('atlas.html'),notes=read('dossiers.html');
const dossiers=JSON.parse(read('data/dossiers.json'));
const encounters=JSON.parse(read('editorial/encounters-1_6/index.json'));
const claimLedger=JSON.parse(read('editorial/CLAIM_WITNESS_LEDGER_1_6_1_20261112.json'));
const regional=JSON.parse(read('editorial/REGIONAL_MICROHISTORIES_1_6_20261112.json'));

assert.equal(data.edition,'1.7.0-generative-muhammadan-framework');
assert.equal(old162.edition,'1.6.2-targeted-source-and-prose-fidelity');
assert.ok(old162Reader.includes('Research edition 1.6.2'));
assert.ok(old162Man.includes('Research edition 1.6.2'));
assert.equal(nexus.changes.length,46);
assert.ok(method.includes('The encounter is the central unit of explanation'));
assert.ok(frame.includes('maqām lā maqām'));
assert.equal(data.chapters.filter((c,i)=>c.matn!==old162.chapters[i].matn).length,0);
assert.equal(data.chapters.filter((c,i)=>c.sharh!==old162.chapters[i].sharh).length,46);
for(const entry of nexus.changes)assert.ok(data.chapters[entry.chapter-1].sharh.includes(entry.replacement),'Missing nexus passage '+entry.chapter);
assert.equal(data.chapters.length,46);
assert.equal(prior161.edition,'1.6.1-prose-and-source-fidelity-review');
assert.ok(prior161HTML.includes('Research edition 1.6.1'));
assert.ok(prior161Man.includes('Research edition 1.6.1'));
assert.equal(old162.chapters.filter((c,i)=>c.matn!==prior161.chapters[i].matn).length,12,'Retained edition 1.6.2 must preserve its twelve matn changes');
assert.equal(old162.chapters.filter((c,i)=>c.sharh!==prior161.chapters[i].sharh).length,5,'Retained edition 1.6.2 must preserve its five sharḥ changes');
assert.ok(data.chapters[9].sharh.includes('bukhari:3877'));
assert.ok(data.chapters[44].sharh.includes('1867'));

assert.equal(prior.edition,'1.6.0-scholarly-revision');
assert.equal(oldMan,oldArchive,'The previous 1.4.1 edition must remain exactly preserved');
assert.ok(priorHTML.includes('Research edition 1.6.0'),'Older static reader must be preserved');
assert.ok(priorMan.includes('Research edition 1.6.0'),'The 1.6.0 manuscript must be preserved');
assert.notEqual(data.chapters[1].matn,prior.chapters[1].matn,'Chapter 02 prose review must be present');
assert.notEqual(data.chapters[0].matn,prior.chapters[0].matn,'Opening ontological correction must be present');

let editedMatns=0,editedSharhs=0;
for(let i=0;i<46;i++){
 const a=data.chapters[i],b=prior.chapters[i],id=i+1;
 assert.equal(a.id,id);
 assert.equal(a.title,b.title,'A chapter title was lost');
 if(a.matn!==b.matn)editedMatns++;
 if(a.sharh!==b.sharh)editedSharhs++;
}
assert.equal(editedMatns,46,'All 46 matns should reflect prose audit');
assert.ok(editedSharhs>=41,'Majority of sharh prose should be audited');
const noah=data.chapters[0].matn;
assert.ok(noah.includes('Iblīs refused'), 'Adamic refusal omitted');
assert.ok(noah.indexOf('he built the Ark')>=0 && noah.indexOf('he built the Ark')<noah.indexOf('When the flood came'), 'Nūḥ Ark chronology incorrect');
assert.ok(data.chapters[43].sharh.includes('21 December 1868'), 'Direct waqf judgment facts omitted');
assert.ok(data.chapters[43].sharh.includes('1930 Validating Act'), 'Legislative sequence omitted');
assert.equal(dossiers.dossiers.length,9);
assert.equal(encounters.entries.length,50);
assert.equal(encounters.entries.filter(e=>e.deep_analysis).length,18);
assert.equal(regional.cases.length,13);
assert.equal(claimLedger.entries.length,46);
assert.equal(claimLedger.entries.reduce((n,e)=>n+e.claims.length,0),138);

assert.ok(html.includes('Research edition 1.7.0'));
assert.ok(landing.includes('Research edition 1.7.0'));
assert.ok(landing.includes('tables-vi-vii.html')&&html.includes('tables-vi-vii.html'));
assert.ok(landing.includes('framework.html')&&html.includes('framework.html'));
assert.equal((tables.match(/<tr><th scope="row">/g)||[]).length,13);
assert.ok(tables.includes('id="vi"')&&tables.includes('id="vii"'));

assert.ok(html.includes('editorial/current-edition-1.6.1-prose-reviewed.md'));
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
console.log('PASS Sīrah 1.7.0: 46 aligned chapter pairs, all matns and 41+ shuruh prose reviewed, Nūḥ chronology verified, legal source update, 50 encounters, 138 claims, source/static/manuscript parity');
