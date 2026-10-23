#!/usr/bin/env python3
"""Strict nonrelease native Arabic word-hitbox acceptance.

Independent of 414/414 Unicode copy/search: compare the first and last
original word groups of every authorial passage with actual HarfBuzz-shaped
font width and the DOM-derived line source position. A nearby *tiny* search
hitbox is not a valid word selection rectangle.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path
from statistics import median
import fitz

def best_hit(page,phrase,row,side):
    source_bounds=fitz.Rect(
        row["x"]-4,page.rect.height-row["y"]-row["height"]-4,
        row["x"]+row["width"]+4,page.rect.height-row["y"]+row["height"]+4
    )
    width=row[side+"_visible_width_pt"]
    if side=="opening":
        expected_left=row["x"]+row["width"]-width
        expected_right=row["x"]+row["width"]
    else:
        expected_left=row["x"]
        expected_right=row["x"]+width
    candidates=[r for r in page.search_for(phrase) if r.intersects(source_bounds)]
    if not candidates:
        return dict(found=False,ok=False,reason="No phrase hit in its original line")
    hit=min(candidates,key=lambda r:
            abs(r.x0-expected_left)+abs(r.x1-expected_right))
    ratio=hit.width/width
    left_error=abs(hit.x0-expected_left)
    right_error=abs(hit.x1-expected_right)
    credible=(0.72<=ratio<=1.33 and left_error<=max(9,width*.2)
              and right_error<=max(9,width*.2))
    return dict(found=True,ok=credible,width_ratio=ratio,
        expected_visible_width=width,native_hit_width=hit.width,
        source_x=[expected_left,expected_right],
        native_x=[hit.x0,hit.x1],left_error=left_error,right_error=right_error)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--pdf",type=Path,required=True)
    ap.add_argument("--evidence",type=Path,required=True)
    ap.add_argument("--report",type=Path,required=True)
    ap.add_argument("--strict",action="store_true")
    args=ap.parse_args()
    evidence=json.loads(args.evidence.read_text("utf8"))
    if evidence.get("source_paragraphs")!=414 or not evidence.get("native_rtl_text_matrix"):
        raise ValueError("Full 414-paragraph native RTL metadata missing")
    rows=[r for r in evidence["source_lines"] if r.get("line")==1]
    if len(rows)!=414 or len({r["id"] for r in rows})!=414:
        raise ValueError("Original authorial passage openings incomplete")
    checked=[]
    with fitz.open(args.pdf) as document:
        if len(document)!=evidence["pages"]:
            raise ValueError("Evidence does not match real native PDF")
        for row in rows:
            for side in ("opening","ending"):
                phrase=row.get(side+"_source")
                width=row.get(side+"_visible_width_pt")
                if not phrase or not isinstance(width,(int,float)) or width<=0:
                    raise ValueError("Unmeasured original word phrase "+row["id"])
                finding=best_hit(document[row["page"]-1],phrase,row,side)
                checked.append(dict(id=row["id"],side=side,
                    source=phrase,page=row["page"],**finding))
    summary={}
    for side in ("opening","ending"):
        these=[r for r in checked if r["side"]==side]
        ratios=[r["width_ratio"] for r in these if r.get("found")]
        summary[side]={
            "authorial_passages":len(these),
            "native_phrase_hits":sum(bool(r["found"]) for r in these),
            "true_source_geometry_hits":sum(bool(r["ok"]) for r in these),
            "median_native_to_visible_width_ratio":round(median(ratios),5)
                     if ratios else None
        }
    native_success=all(v["true_source_geometry_hits"]==414 for v in summary.values())
    report={
      "schema":"gnamma-browser-rtl-native-word-geometry-v1",
      "browser":evidence["engine"],
      "original_source_sha256":evidence["source_sha256"],
      "original_font_sha256":evidence["font_sha256"],
      "native_engine":"PyMuPDF "+fitz.VersionBind,
      "source_text_modified":False,
      "strict_first_last_word_geometry":summary,
      "first_20_failures":[r for r in checked if not r["ok"]][:20],
      "native_first_last_word_geometry_verified":native_success,
      "all_21647_source_words_certified":False,
      "other_pdf_engines_and_native_phones_certified":False,
      "full_english_study_links_notes_page_parity_certified":False,
      "general_release_approved":False
    }
    args.report.parent.mkdir(parents=True,exist_ok=True)
    args.report.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n","utf8")
    print("GNAMMA_NATIVE_RTL_WORD_GEOMETRY",json.dumps({
        "browser":evidence["engine"],"source_phrases":summary,
        "native_geometry_verified":native_success,
        "general_release_approved":False
    },ensure_ascii=False),flush=True)
    if args.strict and not native_success:
        raise AssertionError("Native first+last Arabic word geometry fails source width/alignment")
    return 0

if __name__=="__main__":
    raise SystemExit(main())
