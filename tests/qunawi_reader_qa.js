/* GNAMMA · Qūnawī reader source and cross-reference QA.
 * Every check is offline and source-control reproducible; it DOES NOT
 * certify the Arabic or English text as critically established.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const base=path.join(root,'texts/sadr-al-din-al-qunawi/al-nusus');
const read=p=>fs.readFileSync(p,'utf8');
const book=JSON.parse(read(path.join(base,'data/parallel.json')));
const mah=JSON.parse(read(path.join(root,'texts/al-mahaimi/mashra-al-khusus/data/parallel.json')));
const html=read(path.join(base,'index.html'));
const script=read(path.join(base,'reader.js'));
const css=read(path.join(base,'reader.css'));
const catalog=read(path.join(root,'texts/index.html'));
const mhtml=read(path.join(root,'texts/al-mahaimi/mashra-al-khusus/index.html'));
const ids=new Set,mahIds=new Set(mah.sections.map(x=>x.id));
let linkCount=0,linkedEntries=0,ar=0,en=0;
assert(book.entries.length>0,'Corpus cannot be empty');
assert(catalog.includes('sadr-al-din-al-qunawi/al-nusus/'),'Reader must appear in texts catalogue');
assert(html.includes('data/parallel.json'),'Reader must load canonical data');
assert(html.includes('reader.js')&&html.includes('reader.css'),'Assets referenced');
assert(script.includes('commentaryLinks(e)'),'Source-aware commentary navigation required');
assert(css.includes('.commentary-parallels'),'Commentary styles required');
assert(mhtml.includes('gotoFragment()'),'Mahāʾimī deep links required');
assert(mhtml.includes('sadr-al-din-al-qunawi/al-nusus/'),'Mahāʾimī must link to base text');
for(const e of book.entries){
  assert(e.id&&!ids.has(e.id),'Unique stable passage ID: '+e.id);
  ids.add(e.id);assert(e.source_url.startsWith('https://'),'No unsupported source: '+e.id);
  assert(e.locator&&e.locator.length>10,'Exact source location required: '+e.id);
  assert(e.status&&e.status.length>9,'Source status required: '+e.id);
  assert(e.arabic?.trim().length>15,'Arabic source must not be fabricated or missing: '+e.id);
  assert(e.english?.trim().length>15,'English translation must not be missing: '+e.id);
  assert(!/critical-edition-complete|manuscript-verified/.test(e.status),'No premature critical status');
  ar++;en++;
  if(e.commentary_links?.length){linkedEntries++;for(const l of e.commentary_links){
    assert(l.work==='MAH-MAS','Unknown commentary work: '+e.id);
    assert(mahIds.has(l.section_id),'Target anchor missing: '+e.id+' -> '+l.section_id);
    assert(l.link_url.endsWith('#'+l.section_id),'URL must match target');
    assert(l.printed_page===mah.sections.find(s=>s.id===l.section_id).printed_pages[0],'Printed page mismatch');
    linkCount++;
  }}
}
for(const work of book.works){assert(work.entry_count===book.entries.filter(e=>e.work===work.id).length,'Count mismatch: '+work.id)}

const ledger=read(path.join(base,'editorial/COVERAGE_LEDGER.csv')).trimEnd().split(/\r?\n/);
const ledgerIds=ledger.slice(1).map(line=>{const m=line.match(/^"[^"]*","([^"]*)",/);assert(m,'Malformed CSV row');return m[1]}).filter(Boolean);
assert.equal(ledgerIds.length,book.entries.length,'Coverage CSV stale: expected one row per bilingual record');
assert.equal(new Set(ledgerIds).size,book.entries.length,'Duplicated source ledger IDs');
for(const id of ids)assert(ledgerIds.includes(id),'Missing record in coverage CSV: '+id);
for(const e of book.entries.filter(e=>e.id.startsWith('QUN-NU-020-'))){
 assert.equal(e.status,'attribution-provisional-appended-text','Text 20 must remain explicitly provisional until witnessed');
}


// Al-Iznīqī cumulative working edition: provenance and noncompletion guard.
const iz=JSON.parse(read(path.join(base,'editorial/IZNIQI_COVERAGE_STATUS_20261109.json')));
assert.equal(iz.total_medieval_pages,22,'Medieval text ends at printed page 852');
assert.equal(iz.source_page_images_inspected,22,'Inspected-page count must match source register');
assert.equal(iz.pages.length,22,'One precise source-page record required for every printed page');
assert.equal(iz.source_pages_with_final_verified_full_literal_translation,0,'Do not call interpretive drafts literal-complete');
assert(iz.pages.every(p=>p.source_rendered_inspected && !p.english_full_literal_verified && !p.manuscript_leaf_collated));
for(const segment of iz.segments){
 const contents=read(path.join(base,'editorial',segment.file));
 assert(contents.length>400,'Missing Iznīqī translation segment: '+segment.file);
}
const izCumulative=read(path.join(base,'editorial/IZNIQI_EN_CUMULATIVE_DRAFT_20261109.md'));
assert(izCumulative.includes('NOT A COMPLETE LITERAL EDITION'),'Provisional caveat is required');
assert(izCumulative.length>50000,'Cumulative must include all source-page segments');
const izHtml=read(path.join(base,'izniqi/index.html'));
assert(izHtml.includes('IZNIQI_EN_CUMULATIVE_DRAFT_20261109.md'),'Iznīqī reader must load cumulative draft');
assert(catalog.includes('sadr-al-din-al-qunawi/al-nusus/izniqi/'),'Text catalogue must link working English reader');

console.log(JSON.stringify({status:'PASS',passages:book.entries.length,arabic:ar,english:en,linked_entries:linkedEntries,mahaimi_links:linkCount,targets:mahIds.size},null,2));