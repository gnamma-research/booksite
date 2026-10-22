#!/usr/bin/env node
'use strict';
/* Release-catalog acceptance for exactly the 120 currently approved layouts.
 * New body typography must be a separately SHA-approved source; it cannot be
 * manufactured by relabeling a source from another language or edition tier.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const crypto=require('node:crypto');
const build=require('./design-catalog.js').build;
const daruri=path.resolve(__dirname,'..'),edition=path.join(daruri,'editions');
const load=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const fixtures={
  base:load(path.join(edition,'manifest.json')),
  maps:load(path.join(edition,'maps/manifest.json')),
  apparatus:load(path.join(edition,'apparatus/manifest.json')),
  packets:load(path.join(__dirname,'packets/manifest.json')),
  canonical:load(path.join(daruri,'pdf-editions-manifest.json'))
};
const copy=()=>structuredClone(fixtures);
function rejects(name,mutate,expr=/./){
  const data=copy();
  mutate(data);
  assert.throws(()=>build(data),expr,name);
  console.log('DESIGN_NEGATIVE_PASS',name);
}
function main(){
  const digest=crypto.createHash('sha256')
    .update(fs.readFileSync(path.join(edition,'manifest.json'))).digest('hex');
  assert.equal(digest,fixtures.packets.base_manifest_sha256);
  const catalog=build(copy());
  assert.equal(catalog.certified_source_designs.length,12);
  assert.equal(catalog.other_approved_designs.length,5);
  assert.equal(catalog.approved_compositions.length,120);
  assert.equal(new Set(catalog.approved_compositions.map(x=>x.file)).size,120);
  const active=catalog.certified_source_designs.filter(x=>x.composable);
  assert.equal(active.length,8);
  assert(active.every(x=>x.approved_profiles===15));
  assert.equal(catalog.certified_source_designs.filter(x=>!x.composable).length,4);
  assert.equal(catalog.certified_source_designs.filter(x=>x.publisher_notes==='selected').length,2);
  assert.equal(catalog.certified_source_designs.filter(x=>x.body_layout==='parallel').length,6);
  assert.equal(catalog.certified_source_designs.filter(x=>x.body_layout==='single').length,6);
  assert(catalog.other_approved_designs.every(x=>!x.composable));
  assert.equal(catalog.invariants.remove_static_fallbacks,false);
  for(const option of catalog.approved_compositions){
    const owner=catalog.certified_source_designs.find(x=>x.id===option.design_id);
    const source=fixtures.base.files.find(x=>'editions/'+x.file===owner.pdf);
    assert.equal(option.source_base,source.file);
    assert.equal(option.packet_sha256,fixtures.packets.packets.find(p=>p.file===option.packet).sha256);
    assert.equal(option.link_map_sha256,fixtures.packets.profiles.find(m=>m.profile===option.file).map_sha256);
    assert.equal(option.approved,true);
  }
  rejects('tampered PDF SHA',d=>{d.base.files[0].sha256='0'.repeat(64)},/source map|match/);
  rejects('inconsistent editor headings',d=>{d.apparatus.files[0].editorial_titles=true},/Requested design/);
  rejects('fabricated stacked layout',d=>{d.apparatus.files[0].layout='stacked'},/different layout/);
  rejects('notes silently added to Reading',d=>{d.apparatus.files[0].notes='full'},/Requested design/);
  rejects('renamed source map',d=>{d.maps.files[0].map_sha256='foo'},/map/);
  rejects('unverified apparatus link SHA',d=>{d.packets.profiles[0].packet_sha256='0'.repeat(64)},/SHA-bound/);
  rejects('wrong packet component order',d=>{d.packets.packets.find(p=>p.components.length===2).components.reverse()},/unordered/);
  rejects('duplicate profile',d=>{d.apparatus.files[1].file=d.apparatus.files[0].file},/Duplicate/);
  rejects('missing distinct packet',d=>{d.packets.packets.pop()},/12-base|120|incomplete|Missing/);
  rejects('canonical different design absent',d=>{delete d.canonical.files['daruri.pdf']},/canonical/);
  console.log('DESIGN_CATALOG_PASS',JSON.stringify({
    signed_base_designs:12,other_approved_book_designs:5,
    active_source_designs:8,certified_combinations:120,
    apparatus_packet_set:15,negative_cases:10,
    all_other_book_designs_static_until_individually_certified:true
  }));
}
main();
