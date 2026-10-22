#!/usr/bin/env python3
"""All 12 APPROVED Daruri A4 source PDFs, freshly typeset from HTML.

Builds from authoritative reader text + note JSON + WeasyPrint/CSS and local
Noto fonts, NEVER from an existing PDF. The approved PDF is opened only AFTER
writing and closing the newly rendered candidate for independent comparison.
No writes to approved editions or canonical personal notes.

Native Arabic source Unicode search is a SEPARATE mandatory release gate:
pixel-identical pages do not imply searchable source text.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import resource
import sys
import time

import fitz

HERE=Path(__file__).resolve().parent
ROOT=HERE.parent
sys.path.insert(0,str(HERE))
from html_first_feasibility import (  # noqa: E402
    build_source, compare_with_approved, structural_snapshot,
    canonical_source_sha
)


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def one(profile_index:int,destination:Path,strict:bool=False):
    manifest=json.loads((ROOT/"editions/manifest.json").read_text("utf8"))
    entries=manifest["files"]
    if manifest["status"]!="verified" or len(entries)!=12:
        raise ValueError("Approved 12-source A4 design registry is incomplete")
    if not 0<=profile_index<12:
        raise ValueError("Outside the finite approved 12-source registry")
    row=entries[profile_index]
    tier=row["tier"];lang=row["language"]
    if row.get("notes") != ("selected" if tier=="study" else "none"):
        raise ValueError("Publisher-note tier changed")
    if not (tier=="study" and lang=="bilingual" or tier=="reading"):
        raise ValueError("No authoritative HTML renderer for this source design")
    name=Path(row["file"]).name
    generated=destination/name
    html=destination/(name+".html")
    destination.mkdir(parents=True,exist_ok=True)
    begin=time.perf_counter()
    evidence=build_source(tier,lang,generated,html,
                          editorial_titles=row["editorial_titles"])
    # A full source must never be obtained by cutting/splicing an approved PDF.
    if evidence["source_sections"]!=258 or evidence["authorial_segments"]!=414:
        raise ValueError("Canonical 258-section / 414-paragraph work incomplete")
    report=structural_snapshot(generated)
    comparison=compare_with_approved(generated,ROOT/"editions"/row["file"])
    if report["source_section_names"]!=258 or report["invalid_internal_link_pages"]:
        raise ValueError("HTML-generated original source has missing or invalid navigation")
    if report["out_of_bounds_sample"]:
        raise ValueError("HTML-generated original source has clipped text")
    if tier=="study" and not evidence["footnote_pagination"]["ok"]:
        raise ValueError("True publisher footnotes are not on the citation page")
    result={
        "schema":1,"status":"RESEARCH_ONLY_NOT_RELEASE_APPROVED",
        "profile_index":profile_index,"profile":row["file"],
        "edition":tier,"language":lang,"editorial_titles":row["editorial_titles"],
        "notes_policy":row["notes"],
        "original_source_text_sha256":canonical_source_sha(),
        "canonical_source_html_sha256":sha(html),
        "html_chars":len(html.read_text("utf8")),
        "html_bytes":html.stat().st_size,
        "prebuilt_source_pdf_render_inputs":[],
        "original_pdf_opened_only_after_html_generation":True,
        "new_pdf":str(generated),
        "html_file":str(html),
        "render_seconds":round(time.perf_counter()-begin,2),
        "peak_process_rss_kib":resource.getrusage(resource.RUSAGE_SELF).ru_maxrss,
        "generation":evidence,
        "generated_pdf":report,
        "approved_A_B_comparison":comparison,
        "full_native_original_arabic_search_release_gate":"NOT_CERTIFIED",
        "unchanged_approved_files":True,
        "all_A4":True
    }
    dest=destination/"html-source-acceptance.json"
    dest.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n","utf8")
    matched=(comparison.get("page_count_equal") and
             comparison.get("pixel_equal_pages")==report["pages"] and
             comparison.get("text_equal_pages")==report["pages"] and
             comparison.get("word_geometry_equal_pages")==report["pages"] and
             comparison.get("toc_equal") and
             comparison.get("source_section_destinations_equal")==258 and
             not comparison.get("first_changed_hyperlink_pages"))
    result["exact_layout_and_navigation_pass"]=bool(matched)
    dest.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n","utf8")
    print("HTML_ONLY_SOURCE_A4",json.dumps({
        "profile":row["file"],"pass":bool(matched),
        "html_bytes":result["html_bytes"],"pdf_pages":report["pages"],
        "pixels_identical":comparison["pixel_equal_pages"],
        "text_equal":comparison["text_equal_pages"],
        "word_coordinates_equal":comparison["word_geometry_equal_pages"],
        "source_anchors_equal":comparison["source_section_destinations_equal"],
        "footnotes_valid":evidence.get("footnote_pagination",{}).get("ok"),
        "seconds":result["render_seconds"],
        "native_arabic_search":"BLOCKED_UNTIL_SEPARATE_UNICODE_REPAIR"
    },ensure_ascii=False),flush=True)
    if strict and not matched:
        raise SystemExit("HTML-only rendered book differs from approved A4 edition")
    return result


if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--index",type=int,required=True)
    parser.add_argument("--out",type=Path,required=True)
    parser.add_argument("--strict",action="store_true")
    args=parser.parse_args()
    one(args.index,args.out,args.strict)
