#!/usr/bin/env python3
"""Isolated PDF/UA tagging and bilingual reading-order research (no release).

Outputs TWO versions from identical canonical A4 HTML:
  a) default WeasyPrint document, b) PDF/UA-1 variant.
It checks page/pixel/text/word geometry and semantic structure of the tagged
output. In the follow-on CI, both get identical independent Unicode repairs
and native reader tests. This never uses any prebuilt PDF as the rendering input.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import sys
import time

import fitz
from weasyprint import HTML

HERE=Path(__file__).resolve().parent
BUILD=HERE.parent/"build"
ROOT=HERE.parent
sys.path.insert(0,str(HERE))
from html_first_all12 import one  # noqa: E402


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def structural(pdf):
    with fitz.open(pdf) as doc:
        root=doc.pdf_catalog()
        keys={
            "StructTreeRoot":doc.xref_get_key(root,"StructTreeRoot"),
            "MarkInfo":doc.xref_get_key(root,"MarkInfo"),
            "Lang":doc.xref_get_key(root,"Lang"),
        }
        return {"pages":len(doc),"toc":len(doc.get_toc()),
                "sections":sum(f"section-{n}" in doc.resolve_names() for n in range(1,259)),
                "catalogue":keys,
                "sha256":sha(pdf)}


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--index",type=int,required=True)
    p.add_argument("--out",type=Path,required=True)
    a=p.parse_args()
    out=a.out
    out.mkdir(parents=True,exist_ok=True)
    if a.index not in (0,8,10):
        raise ValueError("A/B checks are limited to canonical English/Arabic bilingual or vowelled HTML profiles")
    baseline=out/"untagged"
    report=one(a.index,baseline,True)
    input_html=Path(report["html_file"]).read_text("utf8")
    if "<html>" in input_html:
        input_html=input_html.replace("<html>","<html lang=\"en\">",1)
    elif "<html lang=" not in input_html:
        raise ValueError("Original source HTML lacks a parsable document root")
    if "<title>" not in input_html:
        input_html=input_html.replace(
          "<head>", "<head><title>Daruri experimental tagged source</title>",1)
    with_lang=out/"pdfua-source.html"
    with_lang.write_text(input_html,"utf8")
    proof=out/"pdfua-original-NONRELEASE.pdf"
    t0=time.perf_counter()
    HTML(filename=str(with_lang),base_url=str(BUILD)).write_pdf(
      proof,pdf_variant="pdf/ua-1")
    ms=round(time.perf_counter()-t0,2)
    untagged=Path(report["new_pdf"])
    with fitz.open(proof) as pdoc, fitz.open(untagged) as prior:
        geometry_equal=[]
        visible_equal=[]
        native_text_equal=[]
        for n in range(min(len(pdoc),len(prior))):
            a,b=pdoc[n],prior[n]
            geometry_equal.append(a.rect==b.rect)
            visible_equal.append(a.get_pixmap(alpha=False).samples==b.get_pixmap(alpha=False).samples)
            native_text_equal.append(a.get_text()==b.get_text())
        check={
            "html_source_sha256":sha(with_lang),
            "source_reader_sha256":report["original_source_text_sha256"],
            "variant":"pdf/ua-1", "new_pdf_created_from_html":True,
            "source_pdf_used_for_rendering":False,
            "tagged":structural(proof),
            "original":structural(untagged),
            "same_page_count":len(pdoc)==len(prior),
            "pages_pixel_equal":sum(visible_equal),
            "pages_text_equal":sum(native_text_equal),
            "pages_media_box_equal":sum(geometry_equal),
            "tagged_generation_seconds":ms,
            "no_release_approval":True
        }
    (out/"pdfua-comparison.json").write_text(json.dumps(check,indent=2,ensure_ascii=False)+"\n")
    print("HTML_PDFUA_READING_ORDER",json.dumps(check,ensure_ascii=False),flush=True)


if __name__=="__main__":
    main()
