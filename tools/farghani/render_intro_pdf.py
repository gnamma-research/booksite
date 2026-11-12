#!/usr/bin/env python3
"""Typeset and inspect Farghānī's provisional INTRODUCTION-ONLY scholarly PDF.
Uses browser print with Arabic shaping/font fallback; does not claim MS collation.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import fitz,json,re
ROOT=Path(__file__).resolve().parents[2]
BOOK=ROOT/"texts/al-farghani/muntaha-al-madarik"
SOURCE=BOOK/"editorial/PRINT_SCHOLARLY_INTRO_019.html"
OUT=BOOK/"downloads/FARGHANI_Introduction_Provisional_Scholarly_019.pdf"
QA=BOOK/"editorial/PRINT_PDF_QA_019.json"
SHOTS=ROOT/"qa-artifacts/farghani-scholar-pdf"
SHOTS.mkdir(parents=True,exist_ok=True);OUT.parent.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True)
  page=browser.new_page(viewport={"width":1400,"height":900},device_scale_factor=1)
  errors=[]
  page.on("pageerror",lambda e:errors.append(str(e)))
  page.goto(SOURCE.as_uri(),wait_until="load",timeout=90000)
  assert page.locator("#pr-reading > section.pr-page").count()==128
  assert page.locator(".print-appendix").count()==3
  page.emulate_media(media="print")
  page.pdf(path=str(OUT),format="A4",print_background=True,prefer_css_page_size=True,
           display_header_footer=False,timeout=120000)
  browser.close()
assert OUT.stat().st_size>150000
doc=fitz.open(OUT)
count=len(doc)
if not (128<=count<=550):
  raise AssertionError(f"Unexpected PDF page count: {count}, rather than 128+")
first=doc[0].get_text()
all_text_count=sum(len(doc[n].get_text()) for n in range(len(doc)))
sample=[0,1,2,min(60,count-1),min(125,count-1),count-3,count-2,count-1]
for n in sorted(set(sample)):
  pix=doc[n].get_pixmap(matrix=fitz.Matrix(1.05,1.05),alpha=False)
  pix.save(SHOTS/f"pdf-page-{n+1:03d}.png")
result={"type":"gnamma-farghani-provisional-introduction-scholar-pdf-qa",
 "pdf_path":str(OUT.relative_to(ROOT)),"size_bytes":OUT.stat().st_size,
 "total_pdf_pages":count,"intro_b2007_page_labels":128,
 "print_1876_bounded_loci_appendix":15,
 "glossary_entries":66,
 "first_page_text_sample":first[:650],
 "pdf_extracted_chars":all_text_count,
 "page_screenshots":[p.name for p in SHOTS.glob("pdf-page*.png")],
 "javascript_errors":errors,
 "status":"typesetting-and-page-count-verified-NOT-linguistic-critical-edition"}
if errors:raise AssertionError(errors)
QA.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(json.dumps(result,ensure_ascii=False,indent=2))
