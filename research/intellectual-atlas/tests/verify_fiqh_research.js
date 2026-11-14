#!/usr/bin/env node
"use strict";

// Run with: node research/intellectual-atlas/tests/verify_fiqh_research.js
// Exercise the real loader, filters, URL state and profile renderer in a VM.
// Only the browser bootstrap is disabled; no production files are modified.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const atlasDir = path.resolve(__dirname, "..");
const readRegister = name => JSON.parse(fs.readFileSync(path.join(atlasDir, "corpora", name), "utf8"));
const fiqh = readRegister("fiqh-research.json");
const benchmark = readRegister("hanafi-atlas-benchmark.json");

function harness() {
  const root = { addEventListener() {}, querySelector() { return null; } };
  const location = { href: "https://atlas.test/research/intellectual-atlas/", hash: "" };
  const context = {
    window: { addEventListener() {} },
    document: { getElementById(id) { return id === "gn-atlas" ? root : null; } },
    location,
    history: {
      pushState(_state, _title, hash) { location.hash = hash; },
      replaceState(_state, _title, hash) { location.hash = hash; }
    },
    URL, URLSearchParams, setTimeout, clearTimeout
  };
  let source = fs.readFileSync(path.join(atlasDir, "atlas-unified.js"), "utf8");
  const bootstrap = "load().catch(err=>";
  assert.equal(source.split(bootstrap).length, 2, "Atlas bootstrap must be identifiable exactly once");
  source = source.replace(bootstrap,
    "window.__fiqhTest = { state, data, loadMetadata, loadResearchCorpus, prepare, " +
    "readHash, writeHash, filtered, relevantEdges, recordPanel, evidencePanel };\nif (false) " + bootstrap);
  vm.createContext(context);
  vm.runInContext(source, context, { filename: "atlas-unified.js", timeout: 5000 });
  const api = context.window.__fiqhTest;
  api.loadMetadata(readRegister("expanded-bibliography.json"), readRegister("manuscript-full.json"),
    readRegister("registry.json"), readRegister("early-jurists.json"), readRegister("author-chronology.json"));
  api.loadResearchCorpus(fiqh, "fq");
  api.loadResearchCorpus(benchmark, "ha", true);
  api.prepare();
  return { api, location };
}

const { api, location } = harness();
function navigate(hash) {
  location.hash = hash.startsWith("#") ? hash : "#" + hash;
  api.readHash();
  return api.filtered();
}
function profile(id) {
  assert.ok(api.data.byId.has(id), "Expected work exists: " + id);
  api.state.selected = id;
  return api.recordPanel();
}
function edges(prefix) {
  return Array.from(api.data.out.keys()).filter(id => id.startsWith(prefix))
    .flatMap(id => Array.from(api.relevantEdges(id, "later")));
}
const tests = [];
function test(name, fn) { tests.push({ name, fn }); }

test("431 researched fiqh works and 84 benchmark works remain separate from imported records", () => {
  const works = navigate("subject=fiqh");
  assert.equal(api.state.source, "research");
  assert.equal(works.length, 431);
  assert.ok(works.every(w => w.kind === "work" && w.layer === "researched"));
  assert.equal(api.data.counts.researchedFiqh, 431);
  assert.equal(api.data.edges.filter(e => e.origin === "fq").length, 247);
  const biographies = navigate("subject=biography");
  assert.equal(api.state.source, "benchmark");
  assert.equal(biographies.length, 84);
  assert.ok(biographies.every(w => !w.subjects.includes("fiqh")));
  assert.equal(biographies.filter(w => w.benchmarkCore).length, 68);
  assert.equal(api.data.counts.biographical, 84);
  const combined = navigate("subject=fiqh&source_tier=all");
  assert.ok(combined.length > 431, "Imported fiqh records remain available");
  assert.ok(combined.some(w => w.layer === "bibliographic"));
  assert.ok(combined.every(w => w.layer !== "benchmark"));
  assert.equal(api.data.counts.researchedFiqh, 431, "Imported records must not inflate the distinct-work count");
});

test("four-school filters return 125 Hanafi, 104 Shafii, 97 Maliki and 66 Hanbali works", () => {
  for (const [school, count] of Object.entries({ hanafi: 125, shafii: 104, maliki: 97, hanbali: 66 })) {
    const works = navigate("subject=fiqh&school=" + school);
    assert.equal(works.length, count, school + " researched-work count");
    assert.ok(works.every(w => w.layer === "researched" && w.schools.includes(school)));
  }
});

test("all, early and combined historical scopes survive URL round-trips", () => {
  for (const school of ["all", "early", "historical"]) {
    const before = navigate("subject=fiqh&source_tier=all&school=" + school);
    const ids = Array.from(before, w => w.id).sort();
    assert.ok(ids.length > 0, school + " scope is populated");
    if (school === "historical") {
      assert.ok(before.some(w => w.schools.includes("early")));
      assert.ok(before.some(w => w.schools.includes("named_other")));
    }
    api.writeHash(true);
    const saved = location.hash;
    assert.equal(new URLSearchParams(saved.slice(1)).get("source_tier"), "all");
    navigate("subject=fiqh");
    const restored = navigate(saved);
    assert.equal(api.state.source, "all");
    assert.equal(api.state.school, school);
    assert.deepEqual(Array.from(restored, w => w.id).sort(), ids);
  }
});

test("unknown dates remain unplaced and source ranges stay visible", () => {
  for (const id of ["fq:mh_maliki_8487", "fq:fiqh_shafii_qurrat_ayn"]) {
    const work = api.data.byId.get(id);
    assert.equal(work.year, null, id + " must not receive a fabricated year");
    assert.match(profile(id), /Date not established/);
  }
  assert.match(profile("fq:fiqh_shafii_qurrat_ayn"), /Conflicting death reports/);
  const range = api.data.byId.get("fq:fiqh_shafii_ianat_talibin");
  assert.equal(range.year, 1892.5, "Range midpoint is a display anchor");
  const rangeProfile = profile(range.id);
  assert.match(rangeProfile, /1892–1893 CE/);
  assert.match(rangeProfile, /midpoint/);
  assert.match(rangeProfile, /not an exact death year/);
  assert.equal(fiqh.works.find(w => w.id === range.sourceId).author_death_ce, null);
  const boundary = api.data.byId.get("fq:hf_walwaliji_fatawa");
  assert.equal(boundary.year, 1146);
  assert.match(profile(boundary.id), /after 540 AH/);
  assert.match(profile(boundary.id), /lower boundary/);
});

test("published chronology totals agree with positioned and unplaced research works", () => {
  const works = navigate("subject=fiqh");
  const summary = fiqh.metadata.summary;
  assert.equal(works.filter(w => w.year !== null).length, summary.timeline_anchored_works);
  assert.equal(works.filter(w => w.year === null).length, summary.undated_works);
  assert.equal(summary.author_dated_works, 334);
  assert.equal(summary.qualified_anchor_only_works, 1);
  assert.equal(summary.timeline_anchored_works + summary.undated_works, 431);
});

test("benchmark profiles visibly preserve disputed attribution and survival status", () => {
  const doubtful = profile("ha:hab_ibnkas");
  assert.match(doubtful, /doubts that a work with this title existed/);
  assert.match(doubtful, /Lost \/ not known to survive/);
  const disputed = profile("ha:hab_kinali");
  assert.match(disputed, /Authorship is disputed/);
  assert.match(disputed, /Printed edition reported/);
  assert.match(profile("ha:hab_himmani"), /Manuscript reported/);
  assert.match(profile("ha:hab_zahir"), /suspects the book never existed/);
});

test("textual-use group includes all 62 benchmark source-use edges", () => {
  navigate("subject=biography&edge_type=textual_use");
  const selected = edges("ha:");
  assert.equal(selected.length, 62);
  assert.ok(selected.every(e => e.type === "source_use"));
  api.writeHash();
  const saved = location.hash;
  navigate("subject=fiqh");
  navigate(saved);
  assert.equal(edges("ha:").length, 62, "Relationship group also survives the URL round-trip");
});

test("Hide provisional excludes the probable benchmark link while retaining ordinary source reports", () => {
  navigate("subject=biography&edge_type=textual_use");
  assert.ok(edges("ha:").some(e => e.id === "ha:hab_relation_020"));
  const probable = api.data.edges.find(e => e.id === "ha:hab_relation_020");
  assert.match(api.evidencePanel(probable), /Probably the source of a poem/);
  assert.match(api.evidencePanel(probable), /qualified benchmark report/);
  navigate("subject=biography&edge_type=textual_use&certain=1");
  const selected = edges("ha:");
  assert.equal(selected.length, 61);
  assert.ok(!selected.some(e => e.id === probable.id));
  assert.ok(selected.some(e => e.id === "ha:hab_relation_001"), "Ordinary benchmark attribution remains eligible");
});

test("normalized commentary and verse relationships are reachable through their groups", () => {
  navigate("subject=fiqh&edge_type=commentary");
  const commentary = edges("fq:");
  assert.equal(commentary.filter(e => e.type === "critical_commentary").length, 3);
  assert.equal(commentary.filter(e => e.type === "authorial_elucidation").length, 1);
  assert.equal(commentary.filter(e => e.type === "critical_gloss").length, 1);
  navigate("subject=fiqh&edge_type=versification");
  assert.equal(edges("fq:").length, 2);
});

test("antecedent and reception indexes preserve base-to-commentary direction", () => {
  navigate("subject=fiqh");
  const base = "fq:mh_hanbali_2977"; // Mukhtasar al-Khiraqi
  const commentary = "fq:mh_hanbali_6910"; // Ibn Qudama's al-Mughni
  assert.ok(api.relevantEdges(commentary, "prior").some(e => e.from === base && e.to === commentary));
  assert.ok(api.relevantEdges(base, "later").some(e => e.to === commentary));
  assert.ok(!api.relevantEdges(commentary, "later").some(e => e.to === base));
});

let failures = 0;
for (const { name, fn } of tests) {
  try {
    fn();
    console.log("PASS " + name);
  } catch (error) {
    failures++;
    console.error("FAIL " + name + "\n" + error.stack);
  }
}
console.log(`${tests.length - failures}/${tests.length} fiqh research integration checks passed.`);
if (failures) process.exitCode = 1;
