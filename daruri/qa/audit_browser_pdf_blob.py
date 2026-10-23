#!/usr/bin/env python3
"""Independently inspect real website-generated text PDF bytes.

This test intentionally does not declare the result good merely because a PDF
file exists. It separately measures Arabic extraction, native phrase find,
copied source text and the visible print note. Failure is a research finding.
"""
from __future__ import annotations
import argparse,json,unicodedata,re
from pathlib import Path
import fitz

PHRASES=["أَمَّا بَعْدُ","وَفِي أَلْفَاظِهِ"]

def norm(s):
    return "".join(c for c in unicodedata.normalize("NFKD",s)
       if unicodedata.category(c)[0] in ("L","N")).casefold()

def inspect(pdf:Path,output:Path):
  with fitz.open(pdf) as doc:
    if doc.page_count!=1:raise ValueError("Expected exactly one real PDF page")
    page=doc[0]
    content=page.get_text(sort=False)
    flat=norm(content)
    checks=[]
    for phrase in PHRASES:
      direct=page.search_for(phrase)
      checks.append({
        "original":phrase,"normalized_extraction_present":norm(phrase) in flat,
        "native_exact_search_hit_count":len(direct),
        "found_locations":[list(map(lambda n:round(float(n),2),x)) for x in direct[:4]]
      })
    footer="Editorial footnote, distinctly labelled." in content
    note_call=bool(re.search(r"\b1\b",content))
    raster=page.get_pixmap(matrix=fitz.Matrix(1.5,1.5),alpha=False)
    png=output.parent/"browser-native-arabic-preview.png"
    raster.save(png)
    result={
      "page_count":doc.page_count,"pdf_file":str(pdf),
      "arabic_original_phrases":checks,
      "source_arabic_extraction_all":all(x["normalized_extraction_present"] for x in checks),
      "source_arabic_native_search_all":all(x["native_exact_search_hit_count"]>=1 for x in checks),
      "distinct_footnote_body_extracted":footer,
      "distinct_footnote_call_extracted":note_call,
      "preview_image":str(png),
      "pdf_has_actual_selectable_text":bool(content.strip()),
      "is_exact_html_css_pdf_renderer":False,
      "release_approved":False,
    }
  output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
  print("BROWSER_NATIVE_ARABIC_INSPECTION",json.dumps(result,ensure_ascii=False),flush=True)

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--pdf",required=True,type=Path)
    p.add_argument("--report",required=True,type=Path)
    a=p.parse_args()
    inspect(a.pdf,a.report)
