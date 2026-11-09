"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");
const {spawnSync}=require("node:child_process");

test("candidate matching discovers leads without ever asserting same-work identity",()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),"gnamma-identities-"));
 const oi=path.join(dir,"oi.json"),alreq=path.join(dir,"ms.json"),out=path.join(dir,"results.json");
 const script=path.join(__dirname,"..","scripts","identity-candidates.cjs");
 fs.writeFileSync(oi,JSON.stringify({works:[
  {book_uri:"0140AbuZayd.Hidaya",title_ar:"كِتَاب الهِدَايَة",author_ar:"أبو زيد",source_url:"https://example.invalid/oi"},
  {book_uri:"1000AbuAmr.Hidaya",title_ar:"الهداية",author_ar:"أبو عمرو",source_url:"https://example.invalid/other"}
 ]}),"utf8");
 fs.writeFileSync(alreq,JSON.stringify({works:[
  {id:"M01",title_ar:"الهداية",author_ar:"ابو زيد",catalogue_url:"https://example.invalid/m1"},
  {id:"M02",title_ar:"الهداية",author_ar:"ابو عمرو",catalogue_url:"https://example.invalid/m2"},
  {id:"M03",title_ar:"الهداية",author_ar:"زيد آخر",catalogue_url:"https://example.invalid/m3"}
 ]}),"utf8");
 try{
  const p=spawnSync(process.execPath,[script,oi,alreq,out],{encoding:"utf8"});
  assert.equal(p.status,0,p.stderr||p.stdout);
  const data=JSON.parse(fs.readFileSync(out,"utf8"));
  assert.equal(data.candidate_count,2);
  assert.equal(data.verified_identity_count,0);
  assert.ok(data.candidates.every(x=>x.status==="unreviewed_candidate"&&x.canonical_work_id===null));
  assert.ok(data.candidates.every(x=>x.evidence.length===0));
  assert.ok(data.candidates.every(x=>x.right.record_id!=="M03"));
  assert.deepEqual(data.candidates.map(x=>x.left.record_id),["0140AbuZayd.Hidaya","1000AbuAmr.Hidaya"]);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test("canonical ontology is parseable and distinguishes works, witnesses, assertions and evidence",()=>{
 const schema=JSON.parse(fs.readFileSync(path.join(__dirname,"..","corpora","knowledge-graph-schema.json"),"utf8"));
 assert.equal(schema.$schema,"https://json-schema.org/draft/2020-12/schema");
 const types=schema.$defs.entity.properties.type.enum;
 for(const key of ["person","work","work_part","recension","manuscript_witness","printed_edition","text_passage","argument","bibliographic_record"])assert.ok(types.includes(key));
 const e=schema.$defs.assertion;
 for(const key of ["subject_id","object_id","predicate","evidence","status"])assert.ok(e.required.includes(key));
 assert.ok(schema.$defs.citation.required.includes("locator"));
 assert.ok(schema.$defs.dateEvent.required.includes("date_status"));
});
