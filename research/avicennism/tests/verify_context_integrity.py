"""Verify that the post-Asfār reader is a contextual edition, not a keyword anthology.

Works against the published repo and refuses:
- mislabeled shared Tajrīd pages as independent witnesses;
- invented source/section indices in comparison dossiers;
- missing intermediate pages in Gawhar Book III;
- a "complete tradition" claim from a tiny set of translated original works.
"""
from __future__ import annotations
from pathlib import Path
import json
import re
from urllib.parse import urlparse, parse_qs

HERE=Path(__file__).resolve().parents[1]
ROOT=HERE.parent
def parse_js(path,prefix,suffix):
    raw=(HERE/path).read_text(encoding="utf-8")
    assert raw.startswith(prefix)
    assert raw.rstrip().endswith(suffix)
    return json.loads(raw[len(prefix):].rstrip()[:-len(suffix)])

corpus=parse_js("corpus-primary.js","window.AVICENNIAN_CORPUS=",";")
analysis=parse_js("corpus-analysis.js","window.AVICENNIAN_CORPUS=window.AVICENNIAN_CORPUS||{};\nObject.assign(window.AVICENNIAN_CORPUS,",");")
context=json.loads((HERE/"argument-context.json").read_text(encoding="utf-8"))
links=json.loads((HERE/"argument-links.json").read_text(encoding="utf-8"))
dedup=json.loads((HERE/"TAJRID_DEDUP_AND_POST_ASFAR_SCOPE.json").read_text(encoding="utf-8"))
asfar=json.loads((HERE/"POST_ASFAR_DISTINCTIVE_DOSSIERS.json").read_text(encoding="utf-8"))
coverage=json.loads((HERE/"tradition-coverage.json").read_text(encoding="utf-8"))
tajrid=json.loads((ROOT/"tajrid"/"bookmap-crosswalk.json").read_text(encoding="utf-8"))
assert len(corpus["records"])==22
assert len(analysis["analysis"])==10
assert len(context["records"])==22
assert len(links["debates"])==10 and len(links["domainEvidence"])==20
assert len(asfar["dossiers"])==12
assert len(coverage["families"])==16
assert tajrid["record_count"]==dedup["otherProject"]["distinct_source_records"]==224
assert len(tajrid["work_inventory"])==47
assert tajrid["matn"]["unit_count"]==837
record_map={r["id"]:r for r in corpus["records"]+analysis["analysis"]}
assert len(record_map)==32
assert set(context["records"])=={r["id"] for r in corpus["records"]}
assert len({r["id"] for r in corpus["records"]})==len(corpus["records"])
assert set(dedup["sharedExactPageRecords"])=={"lah-shaw","taft-mental"}
assert set(dedup["sameWorkDifferentLocus"])=={"astar-choice"}
for item in dedup["records"]:
    if item.get("otherProjectWorkId"):
        assert any(w["work_id"]==item["otherProjectWorkId"] for w in tajrid["work_inventory"])
    if item.get("otherProjectRecordIds"):
        for id_ in item["otherProjectRecordIds"]:
            assert id_ in tajrid["records"], f"Overlapping Tajrid record missing: {id_}"

def section_titles(md: str) -> list[str]:
    """Mirror the reader's section handling, skipping empty heading containers."""
    sections = []
    title = "Edition and source status"
    acc = []
    def push():
        if any(v.strip() for v in acc) or not sections:
            sections.append(title)
    for line in md.splitlines():
        match = re.match(r"^##\s+(.+)",line)
        if match:
            push()
            title = match.group(1)
            acc = []
        elif not re.match(r"^# [^#]",line):
            acc.append(line)
    push()
    return sections

def section_count(md: str) -> int:
    return len(section_titles(md))
def check_reference(ref):
    id_=ref["recordId"]
    assert id_ in record_map, f"Unknown referenced record {id_}"
    assert isinstance(ref["section"],int) and ref["section"]>=0
    assert ref["section"]<section_count(record_map[id_]["md"]), (
        f"Out-of-range section index {id_}:{ref['section']}"
    )
assert section_titles(record_map["lah-making"]["md"])[6].startswith("Page 280")
assert section_titles(record_map["lah-making"]["md"])[7].startswith("Page 281")
assert section_titles(record_map["lah-making"]["md"])[8].startswith("Page 282")
assert section_titles(record_map["lah-unity"]["md"])[5].startswith("Page 286")
assert section_titles(record_map["lah-unity"]["md"])[6].startswith("Page 287")
for debate in links["debates"].values():
    assert len(debate["sequence"])>=2
    for item in debate["sequence"]:
        check_reference(item)
        assert item["why"] and item["role"] and item["relation"] and item["claim"]
    for relation in debate.get("links",[]):
        assert relation.get("kind") and relation.get("explanation")
for item in links["domainEvidence"].values():
    for ref in item["direct"]+item["comparative"]:
        check_reference(ref)
for dossier in asfar["dossiers"]:
    assert dossier["before"] and dossier["change"] and dossier["gap"]
    assert dossier["tajrid"] and dossier["unique"]
    for source in dossier["sources"]:
        check_reference(source)
        assert source["relation"] and source["claim"] and source["locator"]

gawhar=context["workSequence"][0]
assert gawhar==["lah-making","lah-unity","lah-eman","lah-eman-cont","lah-element","lah-active","lah-temporal","lah-divine"]
pages=[]
for id_ in gawhar:
    r=record_map[id_]
    assert "Gawhar-i murād" in r["work"]
    assert len(r["md"])>4000
    for url in r.get("sourceUrls",[]):
        parsed=urlparse(url)
        assert "ablibrary.net" in parsed.netloc
        m=re.search(r"/(\d+)$",parsed.path)
        if m: pages.append(int(m.group(1)))
assert sorted(pages)==list(range(278,310)), (
    f"Missing or duplicated Gawhar printed pages: {sorted(pages)}"
)
for id_,ctx in context["records"].items():
    for k in ("part","locator","question","immediatePrior","base","objections","reply","continuation","extent","sourceVoice","missing"):
        assert ctx.get(k),f"Missing context {id_}:{k}"
    assert not record_map[id_]["manuscriptCollated"],f"False manuscript claim: {id_}"
for p in ("reader-context.js","reader-scope.js","argument-apparatus.js"):
    assert (HERE/p).is_file()
reader_pages=(HERE/"reader-pages.js").read_text(encoding="utf-8")
reader_context=(HERE/"reader-context.js").read_text(encoding="utf-8")
assert "function defaultSection(" not in reader_pages, "Keyword-based section picker resurrected"
assert "compare-full-text" in reader_context
assert "slice(0,4)" not in reader_context, "Contextual comparison truncation reintroduced"
assert "#full/" in reader_context
assert "#post-asfar" in (HERE/"reader-scope.js").read_text(encoding="utf-8")
assert "shared-exact-page-partial" in (HERE/"argument-apparatus.js").read_text(encoding="utf-8")
print(json.dumps({
 "status":"CONTEXT + DUPLICATION GUARDS PASS",
 "gawhar_print_pages":len(pages),"book_iii_units":len(gawhar),
 "primary_and_analytical_records":len(record_map),
 "historic_streams":len(coverage["families"]),
 "after_asfar_questions":len(asfar["dossiers"]),
 "comparative_proof_chains":len(links["debates"]),
 "tajrid_existing_sources":tajrid["record_count"],
 "verified_shared_page_groups":len(dedup["sharedExactPageRecords"])
},ensure_ascii=False,indent=2))
