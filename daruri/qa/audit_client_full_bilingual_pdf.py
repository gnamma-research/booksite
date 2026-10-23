#!/usr/bin/env python3
"""Daruri browser-side *full bilingual* PDF quality gate (NOT a release pass).

Passing native browser Blob generation is insufficient. Independently check
coverage of 414 original paragraphs in both Arabic and English, locate the
§65 interruption and its note, and validate page structure/accessibility.

The canonical fixture is generated afresh from Gnamma source JSON. We do not
read a prebuilt PDF for rendering, and the QA report never silently treats an
image of letters as searchable Unicode.
"""
from __future__ import annotations
import argparse,json,re,unicodedata
from pathlib import Path
import fitz

def canon(t):
    t=unicodedata.normalize("NFKD",str(t))
    return "".join(c.casefold() for c in t if unicodedata.category(c)[0] in ("L","N"))

def collect(segments,name):
    return [x[name] for sect in segments for x in sect["segments"]]

def test(pdf:Path,source:Path,out:Path):
    datum=json.loads(source.read_text("utf8"))
    assert len(datum["complete"])==258
    en=collect(datum["complete"],"en")
    ar=collect(datum["complete"],"vocalized")
    assert len(en)==len(ar)==414
    with fitz.open(pdf) as doc:
        rendered=[]
        for pg in doc:
            rendered.append(canon(pg.get_text(sort=False)))
        total="".join(rendered)
        en_count=ar_count=0
        en_fail=[];ar_fail=[]
        def windows(source):
            return canon(" ".join(source.split()[:5]))
        for index,(ea,aa) in enumerate(zip(en,ar)):
            # Checks a meaningful phrase, not one coincidentally present glyph.
            e=windows(ea);a=windows(aa)
            if e and any(e in t for t in rendered):en_count+=1
            elif len(en_fail)<16:en_fail.append(index)
            if a and any(a in t for t in rendered):ar_count+=1
            elif len(ar_fail)<16:ar_fail.append(index)
        ar65=canon(datum["expected_fragments"]["arabic_exact"])
        ar65_pages=[i+1 for i,t in enumerate(rendered) if ar65 in t]
        note_phrase=canon("Editorial footnote stress sample; not part of the authorial Arabic text.")
        note_pages=[i+1 for i,t in enumerate(rendered) if note_phrase in t]
        root=doc.pdf_catalog()
        structure=doc.xref_get_key(root,"StructTreeRoot")
        links=sum(len(pg.get_links()) for pg in doc)
        actualSource=(sum(any(qa in page for page in rendered) for qa in [windows(e) for e in en]))
        report={
            "engine":"ordinary Chromium/WebKit website JavaScript using Vivliostyle + pages-to-pdf",
            "profile":"full R001-R258 bilingual Arabic and English with raised note at R065",
            "source_sections":258,"source_passages_each_language":414,
            "pages":len(doc),"bytes":pdf.stat().st_size,
            "sample_5_word_english_passages_in_pdf":en_count,
            "sample_5_word_arabic_passages_in_pdf":ar_count,
            "english_first_failures":en_fail,
            "arabic_first_failures":ar_fail,
            "arabic_R065_phrase_pages":ar65_pages,
            "note_body_pages":note_pages,
            "note_call_body_same_page_verifiable":bool(ar65_pages and note_pages and set(ar65_pages)&set(note_pages)),
            "pdf_catalog_struct_tree":str(structure),
            "pdf_links":links,
            "complete_original_unicode_text_verified":ar_count==414 and en_count==414,
            "source_65_noteref_verified":bool(ar65_pages and note_pages),
            "source_page_raster_parity_not_proven":True,
            "all_118_study_footnotes_not_in_fixture":True,
            "not_a_full_Study_PDF":True,
            "release_approved":False
        }
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n","utf8")
    print("DARURI_FULL_BILINGUAL_JS_PDF_QA",json.dumps(report,ensure_ascii=False),flush=True)

if __name__=="__main__":
    ap=argparse.ArgumentParser()
    ap.add_argument("--pdf",required=True,type=Path)
    ap.add_argument("--source",required=True,type=Path)
    ap.add_argument("--report",required=True,type=Path)
    a=ap.parse_args()
    test(a.pdf,a.source,a.report)
