#!/usr/bin/env python3
"""Reproduce browser test fixtures from the same 258-section canonical source.

The PDF prototype is browser-only. Python here prepares fixture JSON for CI,
but the browser receives plain text and HTML only; it creates the PDF *bytes*
using JavaScript. No pre-rendered PDF files are loaded in the browser.
"""
from pathlib import Path
import json
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/"build"))
from build_editions import read_book  # noqa:E402

ROOT=Path(__file__).resolve().parents[1]
def main():
    book=read_book()
    sections=[s for s in book["sections"] if isinstance(s.get("id"),int) and 1<=s["id"]<=258]
    assert len(sections)==258 and sum(len(s["segments"]) for s in sections)==414
    mini=[s for s in sections if s["id"] in (1,22,38,64,65,66)]
    assert len(mini)==6
    stress=next(s for s in mini if s["id"]==65)
    whole=" ".join(seg["vocalized"] for seg in stress["segments"])
    if "وَفِي أَلْفَاظِهِ" not in whole:
        raise ValueError("§65 inline-citation stress phrase is missing from canonical text")
    payload={
        "version":1,
        "title":"al-Daruri — Browser-Only HTML-to-PDF Experimental Corpus",
        "origin":"canonical Gnamma reader; no prebuilt PDF inputs",
        "source_sections":258,
        "source_segments":414,
        "excerpt_section_ids":[s["id"] for s in mini],
        "excerpt":mini,
        "complete":sections,
        "expected_fragments":{
            "arabic_exact":"وَفِي أَلْفَاظِهِ",
            "english_probe":sections[0]["segments"][0]["en"][:100],
            "test_footnote":"Scholarly note belonging to authorial §65:1",
        },
        "release_approved":False
    }
    output=ROOT/"qa/browser_pdf_canonical_fixture.json"
    output.write_text(json.dumps(payload,ensure_ascii=False,separators=(",",":"))+"\n","utf8")
    print("BROWSER_PDF_CANONICAL_FIXTURE",json.dumps({
      "sections":258,"passages":414,"small_sections":len(mini),
      "english_probe":payload["expected_fragments"]["english_probe"][:45],
      "authorial_65_phrase":payload["expected_fragments"]["arabic_exact"]
    },ensure_ascii=False))

if __name__=="__main__":
    main()
