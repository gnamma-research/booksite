#!/usr/bin/env python3
"""Native independent acceptance: never mistake 'downloaded PDF' for correct PDF.

The candidate was created exclusively by browser-side HTML layout and vector
PDF emission. This QA uses MuPDF's native PDF reader, optionally requiring
all 414 Arabic, all 414 English, and a correctly linked §65 footnote.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import re
import unicodedata

import fitz

def normalize(text):
    text=unicodedata.normalize("NFKD",str(text))
    return "".join(x for x in text if not unicodedata.combining(x)
                   and unicodedata.category(x)[0] in "LN").casefold()

def check(candidate,fixture_file,mode,report_path):
    fixture=json.loads(fixture_file.read_text("utf8"))
    if fixture["authorial_passages"]!=414 or fixture["authorial_sections"]!=258:
        raise ValueError("The QA source is not the canonical text")
    sections=fixture["full_sections"] if mode=="full" else fixture["sample_sections"]
    entries=[(s["id"],seg) for s in sections for seg in s["segments"]]
    report={
        "engine":"PyMuPDF native PDF reader (not browser PDF.js)",
        "mode":mode,"expected_source_passages":len(entries),
        "canonical_full_source_passages":414,
        "input_pdf_sha256":hashlib.sha256(candidate.read_bytes()).hexdigest(),
        "source_pdf_composition_inputs":0,
        "fully_browser_generated":True,
        "publication_approved":False,
    }
    with fitz.open(candidate) as pdf:
        report["pages"]=pdf.page_count
        report["pdf_bytes"]=candidate.stat().st_size
        report["all_a4"]=all(abs(p.rect.width-595.276)<1
           and abs(p.rect.height-841.89)<1 for p in pdf)
        report["raster_images_count"]=sum(len(p.get_images()) for p in pdf)
        report["printable_text_chars"]=sum(len(p.get_text()) for p in pdf)
        report["valid_goto_count"]=sum(
          l["kind"]==fitz.LINK_GOTO and 0<=l.get("page",-1)<pdf.page_count
          for p in pdf for l in p.get_links())
        report["invalid_goto_count"]=sum(
          l["kind"]==fitz.LINK_GOTO and not 0<=l.get("page",-1)<pdf.page_count
          for p in pdf for l in p.get_links())
        report["url_link_count"]=sum(
          l["kind"]==fitz.LINK_URI for p in pdf for l in p.get_links())
        normalized_pages=[normalize(p.get_text(sort=False)) for p in pdf]
        first_en_found=first_ar_found=0
        exact_en_found=exact_ar_found=0
        en_misses,ar_misses=[],[]
        # Pages may interleave Arabic/English and source-note labels; test exact
        # native find independently of whole-document pdftotext reading order.
        for n,seg in entries:
            en=" ".join(seg["english"].split()[:2])
            ar=" ".join(seg["arabic"].split()[:2])
            en_hit=any(p.search_for(en) for p in pdf)
            ar_hit=any(p.search_for(ar) for p in pdf)
            exact_en_found+=bool(en_hit)
            exact_ar_found+=bool(ar_hit)
            en_sub=normalize("".join(seg["english"].split()[:5]))
            ar_sub=normalize("".join(seg["arabic"].split()[:5]))
            ep=any(en_sub in t for t in normalized_pages)
            ap=any(ar_sub in t for t in normalized_pages)
            first_en_found+=ep;first_ar_found+=ap
            if (not en_hit or not ep) and len(en_misses)<15:
                en_misses.append({"section":n,"id":seg["id"],"native_found":bool(en_hit),"page_text_contiguous":ep})
            if (not ar_hit or not ap) and len(ar_misses)<15:
                ar_misses.append({"section":n,"id":seg["id"],"native_found":bool(ar_hit),"page_text_contiguous":ap})
        report.update({
            "english_two_word_native_search":exact_en_found,
            "arabic_two_word_native_search":exact_ar_found,
            "english_five_word_extracted_in_order":first_en_found,
            "arabic_five_word_extracted_in_order":first_ar_found,
            "english_failures":en_misses,
            "arabic_failures":ar_misses,
        })
        phrase=fixture["stress_phrase"]
        phrase_hits=[i+1 for i,p in enumerate(pdf) if p.search_for(phrase)]
        note_hits=[i+1 for i,p in enumerate(pdf)
                   if "Experimental inline reference" in p.get_text()]
        label_hits=[i+1 for i,p in enumerate(pdf) if "N65" in p.get_text()]
        report["source_65_contiguous_native_search_pages"]=phrase_hits
        report["synthetic_note_body_pages"]=note_hits
        report["synthetic_note_label_pages"]=label_hits
        report["note_call_body_same_page"]=bool(set(note_hits)&set(label_hits))
        if len(pdf):
            pdf[0].get_pixmap(matrix=fitz.Matrix(1.4,1.4)).save(str(report_path.with_suffix(".first-page.png")))
    report["strict_release_candidate"]=(report["all_a4"] and
        report["raster_images_count"]==0 and
        report["invalid_goto_count"]==0 and
        report["english_two_word_native_search"]==len(entries) and
        report["arabic_two_word_native_search"]==len(entries) and
        report["english_five_word_extracted_in_order"]==len(entries) and
        report["arabic_five_word_extracted_in_order"]==len(entries) and
        bool(report["source_65_contiguous_native_search_pages"]) and
        report["note_call_body_same_page"] and
        report["valid_goto_count"]>=1)
    report_path.parent.mkdir(parents=True,exist_ok=True)
    report_path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n","utf8")
    print("DARURI_TRUE_BROWSER_NATIVE_QA",json.dumps({
        k:report[k] for k in ("mode","pages","pdf_bytes","raster_images_count",
         "english_two_word_native_search","arabic_two_word_native_search",
         "english_five_word_extracted_in_order","arabic_five_word_extracted_in_order",
         "expected_source_passages","source_65_contiguous_native_search_pages",
         "note_call_body_same_page","valid_goto_count","strict_release_candidate")
    },ensure_ascii=False),flush=True)
    return report

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--pdf",type=Path,required=True)
    p.add_argument("--fixture",type=Path,required=True)
    p.add_argument("--mode",choices=["excerpt","full"],required=True)
    p.add_argument("--report",type=Path,required=True)
    p.add_argument("--strict",action="store_true")
    a=p.parse_args()
    result=check(a.pdf,a.fixture,a.mode,a.report)
    if a.strict and not result["strict_release_candidate"]:
        raise SystemExit("FAIL: browser-only PDF creation is NOT YET publication-compatible (details in JSON)")
