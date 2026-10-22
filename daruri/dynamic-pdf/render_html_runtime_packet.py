#!/usr/bin/env python3
"""Build SHA-bound reusable scholarly packet from HTML, no PDF rendering input.

Approved packet PDF and JSON are opened ONLY after rendering for immutable QA.
Use the current canonical Gnamma HTML/CSS/Pango generator and the same fonts,
rather than copying prebuilt packet pages. Pixel/text/word/anchors/link identity
is required before any approved per-profile map may be rebound.

This is an experimental *build-time* replacement for stored packet PDFs.
The production site must not use it until Unicode and native viewers pass.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import sys

import fitz

HERE=Path(__file__).resolve().parent
ROOT=HERE.parent
sys.path.insert(0,str(ROOT/"build"))
sys.path.insert(0,str(ROOT/"qa"))
from build_apparatus_variants import build_appendix, APPARATUS_ORDER  # noqa: E402
from verify_dynamic_apparatus_links import equivalent_links  # noqa: E402

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def inspect(approved,output):
    with fitz.open(approved) as a,fitz.open(output) as b:
        if a.page_count!=b.page_count:
            raise ValueError("Re-rendered scholarly apparatus page count differs")
        if a.resolve_names()!=b.resolve_names():
            raise ValueError("Scholarly apparatus dictionary/index anchors moved")
        text_total=0
        for n,(x,y) in enumerate(zip(a,b),1):
            if x.rect!=y.rect:
                raise ValueError(f"Printed apparatus paper/layout changed on page {n}")
            if x.get_pixmap(alpha=False).samples!=y.get_pixmap(alpha=False).samples:
                raise ValueError(f"Printed apparatus pixels differ on page {n}")
            if x.get_text()!=y.get_text():
                raise ValueError(f"Scholarly appendix text extraction differs on page {n}")
            def words(page):
                return [(w[4],*(round(float(z),3) for z in w[:4]))
                        for w in page.get_text("words",sort=False)]
            if words(x)!=words(y):
                raise ValueError(f"Apparatus source-term word geometry differs on page {n}")
            errors,count,delta=equivalent_links(x.get_links(),y.get_links(),0.002)
            if errors:
                raise ValueError(f"Changed apparatus hyperlink on page {n}: {errors[:2]}")
            text_total+=len(x.get_text())
        return {"pages":a.page_count,"pixels_equal":True,"words_equal":True,
                "links_equal_sub_0_002pt":True,"named_anchors_equal":True,
                "text_chars":text_total}

def build(components,approved_packet,approved_map,out_packet,out_map):
    if not components or list(components)!=[c for c in APPARATUS_ORDER if c in components]:
        raise ValueError("Non-canonical apparatus component configuration")
    if len(set(components))!=len(components):
        raise ValueError("Duplicate apparatus component")
    if out_packet.exists() or out_map.exists():
        raise ValueError("Never overwrite an existing generated packet/map")
    old=json.loads(approved_map.read_text(encoding="utf8"))
    approved_sha=sha(approved_packet)
    if old.get("sha256")!=approved_sha or old.get("components")!=list(components):
        raise ValueError("Signed packet mapping belongs to another prebuilt PDF")
    print("HTML_APPARATUS_RENDERS_NOW", "-".join(components),flush=True)
    raw=build_appendix(tuple(components))
    out_packet.parent.mkdir(parents=True,exist_ok=True)
    out_packet.write_bytes(raw)
    proof=inspect(approved_packet,out_packet)
    new_sha=sha(out_packet)
    old["sha256"]=new_sha
    old["bytes"]=len(raw)
    old["_temporary_html_origin_proof"]={
      "release_approved":False,"approved_sha256":approved_sha,
      "rendered_html_packet_sha256":new_sha,
      "approved_original_map_sha256":sha(approved_map),
      "apparatus_visual_and_link_parity":proof
    }
    out_map.write_text(json.dumps(old,separators=(",",":"),ensure_ascii=False)+"\n","utf8")
    print("HTML_APPARATUS_PACKET_PASS",json.dumps({
      "components":components,"pages":proof["pages"],
      "approved_sha":approved_sha,"rendered_sha":new_sha,
      "source_link_reference_count":len(old.get("links_to_source",[])),
      "packet_map_sha256":sha(out_map)
    },ensure_ascii=False),flush=True)

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--components",nargs="+",required=True)
    p.add_argument("--approved-pdf",required=True,type=Path)
    p.add_argument("--approved-map",required=True,type=Path)
    p.add_argument("--output-pdf",required=True,type=Path)
    p.add_argument("--output-map",required=True,type=Path)
    a=p.parse_args()
    build(a.components,a.approved_pdf,a.approved_map,a.output_pdf,a.output_map)
