#!/usr/bin/env python3
"""GNAMMA Tahdhīb Stage114 publication verification.

A complete *working draft index* is not an unabridged or manuscript-certified edition.
Checks match the published HTML, JSON, Markdown, section numbering and source grades.
"""
import json
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
ED=ROOT/"texts/al-taftazani/tahdhib-al-mantiq/edition"
EXPECTED={
  "first_pass_draft":738,
  "inherited_first_pass":291,
  "modern_editorial_reference":57,
  "translated_visible_text_missing_table":4,
}
SECTIONS=[
  ("H-PREFACE",140),("H-INTRO",82),("H-DALALA",91),
  ("H-MAFAHIM",153),("H-DEFINITION",29),("H-PROPOSITIONS",135),
  ("H-CONDITIONAL",44),("H-CONTRADICTION",33),("H-CONVERSION",40),
  ("H-CONTRAPOSITION",26),("H-SYLLOGISM",157),
  ("H-INDUCTION",36),("H-ARTS",38),("H-SCIENCES",86),
]
GAPS={
  "HWN-DEFINITION-019","HWN-PROPOSITIONS-097",
  "HWN-PROPOSITIONS-121","HWN-CONDITIONAL-040",
}

def main():
    p=json.loads((ED/"progress-stage114.json").read_text(encoding="utf-8"))
    obj=json.loads((ED/"hawashi-effective-stage114.json").read_text(encoding="utf-8"))
    rows=obj["records"]
    assert obj["stage"]=="114" and len(rows)==1090,("entries",len(rows))
    assert len(obj["sections"])==14
    assert p["numberedSourcePositions"]==1090
    assert p["englishFirstPassRenderings"]==1029
    assert p["modernEditorialReferenceOnly"]==57
    assert p["proseRenderedWithMissingTable"]==4
    assert p["fullDigitalArabicTranscriptions"]==79
    assert p["completePhotographicallyCollatedPrintedPages"]==0
    assert p["independentlyCertifiedYazdiCommentaryPositions"]==0
    assert p["fullyProvedClassicalModalCases"]==0

    ids=[n["id"] for n in rows]
    assert len(ids)==len(set(ids))
    assert rows[0]["id"]=="HWN-001"
    assert rows[-1]["id"]=="HWN-SCIENCES-086"
    count={key:0 for key in EXPECTED}
    for n in rows:
        count[n["translationStatus"]]+=1
        assert n["pages"] and n["sourceUrls"]
        assert len(n["pages"])==len(n["sourceUrls"])
        assert all(u.startswith("https://ablibrary.net/book_content/b/12170/") for u in n["sourceUrls"])
        assert n.get("scanCertified") is False,n["id"]
        assert n.get("fullPrintedPageTranslated") is False,n["id"]
        assert isinstance(n["english"],str) and n["english"].strip(),n["id"]
    assert count==EXPECTED,count
    assert sum(bool(n.get("arabicFullText")) for n in rows)==79
    assert {n["id"] for n in rows if n["translationStatus"]=="translated_visible_text_missing_table"}==GAPS

    for section,n in SECTIONS:
        a=[x for x in rows if x["sectionId"]==section]
        prefix="HWN-" if section=="H-PREFACE" else "HWN-"+section[2:]+"-"
        assert [x["id"] for x in a]==[f"{prefix}{i:03}" for i in range(1,n+1)],section
        assert [x["localNoteNumber"] for x in a]==list(range(1,n+1)),section

    html=(ED/"hawashi-numbered-notes.html").read_text(encoding="utf-8")
    embedded=re.search(r'<script id="corpus" type="application/json">([\s\S]*?)</script><script>',html)
    assert embedded,"Embedded corpus missing in primary public H reader"
    source=json.loads(embedded.group(1))
    assert source["records"]==rows
    assert source["sections"]==obj["sections"]
    assert "1,090 numbered source positions" in html
    assert "Stage 114 is published here" in html
    assert "progress-stage114.html" in html
    assert "hawashi-numbered-notes-stage113-archive.html" in html

    markdown=(ED/"batches/hawashi-all-sections-cumulative-stage114.md").read_text(encoding="utf-8")
    mdIds=re.findall(r'^## (HWN-[A-Z0-9-]+) — local note ',markdown,re.M)
    assert mdIds==ids,("Markdown numbering",len(mdIds))
    assert markdown.count("MODERN EDITORIAL REFERENCE")>=57
    assert "HWN-SCIENCES-086" in markdown
    assert "four" in markdown.lower()
    assert (ED/"hawashi-numbered-notes-stage113-archive.html").is_file()
    assert (ED/"HANDOFF_STAGE113.md").is_file()
    handoff=(ED/"HANDOFF_LATEST.md").read_text(encoding="utf-8")
    assert "Stage114" in handoff and "1,090" in handoff and "tables" in handoff.lower()
    main=(ED/"index.html").read_text(encoding="utf-8")
    assert "Open the full 14-section gloss reader" in main
    prior=(ED/"progress.html").read_text(encoding="utf-8")
    assert "preserve the earlier Stage113" in prior
    print("PASS Stage114: 1,090 indexed, 1,029 English first passes, 4 table gaps, 57 reference-only, 79 digitally transcribed Arabic, 14 sections; no false certified pages.")

if __name__=="__main__":
    main()
