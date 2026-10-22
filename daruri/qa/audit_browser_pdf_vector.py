#!/usr/bin/env python3
"""Detect which PDF publication requirements a genuine browser-only engine meets.

The only actual generation input is HTML in a real browser. This read-only
report audits downloaded PDF bytes via independent MuPDF/PDFium engines, not
the library which generated them. Results are honest: a green *research job*
is never equivalent to a production-release approval.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import unicodedata
import fitz
import pypdfium2 as pdfium

def clean(s):
    return "".join(ch.casefold() for ch in unicodedata.normalize("NFKD",s)
      if unicodedata.category(ch).startswith(("L","N")))

def check(pdf_path,fixture,metadata,report):
    data=json.loads(fixture.read_text("utf8"))
    meta=json.loads(metadata.read_text("utf8"))
    if meta.get("mode") not in ("excerpt","english-full","bilingual-full"):
        raise ValueError("Unknown browser output mode")
    expected=data["excerpt"] if meta["mode"]=="excerpt" else data["complete"]
    with fitz.open(pdf_path) as doc:
        pages=doc.page_count
        page_text=[p.get_text(sort=False) for p in doc]
        text="".join(page_text)
        normalized=clean(text)
        english_hits=0
        arabic_hits=0
        note_hits=0
        base_text_chars=len(text)
        word_count=sum(len(p.get_text("words")) for p in doc)
        failures=[]
        for section in expected:
            for index,s in enumerate(section["segments"]):
                en=clean(s["en"])
                if en in normalized:
                    english_hits+=1
                elif len(failures)<7:failures.append(("en",section["id"],index))
                if meta["mode"]!="english-full":
                    ar=clean(s["vocalized"])
                    if ar in normalized:arabic_hits+=1
                    elif len(failures)<10:failures.append(("ar",section["id"],index))
        expectedSegments=sum(len(s["segments"]) for s in expected)
        pair_text=data["expected_fragments"]["arabic_exact"]
        search_pages=[i+1 for i,p in enumerate(doc) if p.search_for(pair_text)]
        note_page=next((i+1 for i,p in enumerate(doc)
                        if "Scholarly note belonging" in p.get_text()),None)
        sup_page=next((i+1 for i,p in enumerate(doc)
                       if "R065" in p.get_text() and "65" in p.get_text()),None)
        links=[(page+1,l) for page,p in enumerate(doc) for l in p.get_links()]
        internal=[(p,l) for p,l in links if l.get("kind")==fitz.LINK_GOTO]
        broken=[(p,l.get("page")) for p,l in internal
                if not 0<=l.get("page",-1)<pages]
        allA4=all(abs(p.rect.width-595.276)<1 and
                  abs(p.rect.height-841.89)<1 for p in doc)
        image_count=sum(len(p.get_images()) for p in doc)
        page_zero=doc[0]
        pic=page_zero.get_pixmap(matrix=fitz.Matrix(1.1,1.1),alpha=False)
        png=report.with_suffix(".first-page.png");pic.save(png)
        source_name=meta["mode"]
        baselinePages={"excerpt":None,"english-full":43,"bilingual-full":76}[source_name]
        result={
          "schema":1,
          "experiment":"Browser DOM -> custom JS vector PDF; no server conversion",
          "engine":meta["engine"],"mode":source_name,
          "pdf_sha256":hashlib.sha256(pdf_path.read_bytes()).hexdigest(),
          "pdf_bytes":pdf_path.stat().st_size,
          "pages":pages,"allA4":allA4,
          "expected_pages_approved_original":baselinePages,
          "approved_page_count_equal":baselinePages is None or baselinePages==pages,
          "rendered_selectable_characters":base_text_chars,
          "native_extracted_words":word_count,
          "expected_authorial_paragraphs":expectedSegments,
          "english_complete_passages_in_pdf_extraction":english_hits,
          "arabic_complete_passages_in_pdf_extraction":arabic_hits if source_name!="english-full" else None,
          "arabic_original_phrase_exact_mupdf_search_pages":search_pages,
          "footnote_body_physical_page":note_page,
          "source_reference_physical_page":sup_page,
          "internal_goto_annotations":len(internal),
          "all_annotations":len(links),
          "invalid_internal_goto":broken[:12],
          "embedded_raster_image_count":image_count,
          "first_misses":failures,
          "first_page_png":str(png),
          "browser_status":meta.get("status"),
          "no_prebuilt_pdf_inputs":not meta.get("prebuiltPdfRequests"),
          "no_external_server_conversion":not meta.get("externalNetworkRequests"),
          "no_print_dialog":meta.get("generatedWithoutPrintDialog"),
          "source_reader_languages":["en"] if source_name=="english-full" else ["en","ar"],
          "native_unicode_release_approved":False,
          "full_browser_release_approved":False,
          "known_missing_footnote_and_reference_approval":
             "Does not certify exact canonical Study note placement or 258 GoTo anchors",
        }
    with pdfium.PdfDocument(pdf_path) as pd:
        page_hits=[]
        for i in range(len(pd)):
            textpage=pd[i].get_textpage()
            if textpage.search(pair_text).get_next() is not None:
                page_hits.append(i+1)
        result["original_phrase_exact_pdfium_search_pages"]=page_hits
    report.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n","utf8")
    print("BROWSER_VECTOR_PDF_INDEPENDENT_QA",json.dumps({
        "engine":result["engine"],"mode":source_name,
        "page_count":pages,
        "matches_approved_page_count":result["approved_page_count_equal"],
        "english_paragraphs":english_hits,
        "arabic_paragraphs":result["arabic_complete_passages_in_pdf_extraction"],
        "segments":expectedSegments,
        "exact_arabic_mupdf_search_pages":search_pages,
        "exact_arabic_pdfium_search_pages":result["original_phrase_exact_pdfium_search_pages"],
        "internal_goto_links":len(internal),
        "first_misses":failures[:6],
        "pdf_bytes":result["pdf_bytes"],
        "releaseApproved":False
    },ensure_ascii=False),flush=True)
    if not pages or not allA4 or base_text_chars<200 or len(broken):
        raise SystemExit("PDF is invalid or not usable as an A4 selectable original")

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--pdf",required=True,type=Path)
    p.add_argument("--canonical-fixture",required=True,type=Path)
    p.add_argument("--browser-report",required=True,type=Path)
    p.add_argument("--output",required=True,type=Path)
    args=p.parse_args()
    check(args.pdf,args.canonical_fixture,args.browser_report,args.output)
