#!/usr/bin/env python3
"""Render reusable scholarly apparatus for other explicitly selected page designs.

Existing A4 approved packet generator remains unchanged: its 15 PDFs are the
canonical objects for all 120 approved combinations. This helper generates
independent apparatus *templates* for a new paper/typographic design from the
same canonical scholarly HTML and CSS data (WeasyPrint/Pango), not by resizing
PDF page images.

A template-only output MUST NOT be served as a book edition until a separately
typeset source-body PDF, note policy, anchors, new per-profile links and exact
native Unicode QA have been approved, all using new SHA-256 identities.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import sys

import fitz

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"build"))
from build_apparatus_variants import build_appendix, APPARATUS_ORDER  # noqa: E402

PAPER = {
    "A4": (595.276,841.89),
    "A5": (419.528,595.276),
    "Letter": (612,792),
}
STYLE_CONFIG=Path(__file__).with_name("design-styles.json")


def checksum(raw:bytes)->str:
    return hashlib.sha256(raw).hexdigest()


def get_style(name:str)->tuple[dict,str]:
    catalog=json.loads(STYLE_CONFIG.read_text(encoding="utf-8"))
    if catalog.get("schema")!=1 or catalog.get("default")!="gnamma-a4-v1":
        raise ValueError("Unrecognized design styles release version")
    styles=catalog.get("styles",[])
    if len({s.get("id") for s in styles})!=len(styles):
        raise ValueError("Duplicate typography style definitions")
    item=next((s for s in styles if s.get("id")==name),None)
    if item is None or item.get("status") not in ("approved","template-only"):
        raise ValueError("Unregistered or unapproved source-page design: "+name)
    if item.get("paper") not in PAPER:
        raise ValueError("Unsupported page size; first register and verify it")
    css=item.get("appendix_css")
    if not isinstance(css,str) or len(css)>10000:
        raise ValueError("Invalid appendix print stylesheet")
    # This tool may be executed on a release runner. No foreign URLs, imports
    # or remote assets may be injected through a design stylesheet.
    if re.search(r"@import\b|\burl\s*\(|expression\s*\(",css,re.I):
        raise ValueError("Design CSS must use only approved local fonts and markup")
    if (name=="gnamma-a4-v1")!=(css==""):
        raise ValueError("Canonical A4 stylesheet must remain byte-identical")
    return item,checksum(STYLE_CONFIG.read_bytes())


def produce(style_id:str,components:tuple[str,...],directory:Path,preview:bool)->dict:
    style,style_sha=get_style(style_id)
    if style["status"]!="approved" and not preview:
        raise ValueError("Unapproved book design may only be rendered as a NONRELEASE preview")
    if not components or len(components)>4 or (
        tuple(x for x in APPARATUS_ORDER if x in components)!=components
    ):
        raise ValueError("Incorrect order or missing scholarly components")
    if len(set(components))!=len(components):
        raise ValueError("Repeated scholarly apparatus component")
    raw=build_appendix(components,style_css=style["appendix_css"])
    width,height=PAPER[style["paper"]]
    with fitz.open(stream=raw,filetype="pdf") as pdf:
        if not pdf.page_count:
            raise ValueError("Empty apparatus packet")
        bad=[]
        for index,page in enumerate(pdf):
            if abs(page.rect.width-width)>0.4 or abs(page.rect.height-height)>0.4:
                bad.append(f"page {index+1} has wrong size {page.rect}")
            if not page.get_text().strip():
                bad.append(f"page {index+1} is empty")
            for block in page.get_text("blocks"):
                if len(block)<5 or not str(block[4]).strip():
                    continue
                x0,y0,x1,y1=block[:4]
                if min(x0,y0)<-0.5 or x1>page.rect.width+0.5 or y1>page.rect.height+0.5:
                    bad.append(f"page {index+1} has text outside the page")
            if len(bad)>8:break
        if bad:raise ValueError("Invalid typeset appendix: "+repr(bad))
        count=pdf.page_count
        roots=list(pdf.resolve_names())
    slug="-".join(components)
    name=(f"{style_id}-apparatus-{slug}"+
          ("-PREVIEW-NONRELEASE" if style["status"]!="approved" else "")+".pdf")
    target=directory/name
    if target.exists():
        if target.read_bytes()!=raw:
            raise ValueError("Refusing to overwrite an existing nonmatching PDF")
    else:
        target.parent.mkdir(parents=True,exist_ok=True)
        target.write_bytes(raw)
    report={
        "schema":1,"status":style["status"],
        "not_a_released_pdf":style["status"]!="approved",
        "style_id":style_id,"style_manifest_sha256":style_sha,
        "paper":style["paper"],"expected_size_pt":[width,height],
        "components":list(components),"pages":count,
        "font_and_markup":"canonical Gnamma HTML/CSS + only the explicit page design CSS",
        "sha256":checksum(raw),"bytes":len(raw),"file":name,
        "component_named_anchors":roots,
        "source_document_registered":False,
        "exact_source_link_map_approved":False,
        "original_authorial_arabic_search_certified":False
    }
    (directory/(name+".json")).write_text(
        json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print("DESIGN_TEMPLATE_RESULT",json.dumps(report,ensure_ascii=False),flush=True)
    return report


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--style",required=True)
    parser.add_argument("--components",nargs="+",required=True)
    parser.add_argument("--output-dir",type=Path,required=True)
    parser.add_argument("--preview",action="store_true")
    a=parser.parse_args()
    produce(a.style,tuple(a.components),a.output_dir,a.preview)


if __name__=="__main__":
    main()
