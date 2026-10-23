#!/usr/bin/env python3
"""No-waiver research comparison: headless browser-generated full HTML vs A4
reference. A *browser engine* creates this PDF; CDP is only an automation tool.
No prebuilt PDF was used to render or print candidate pages.

Records all failures instead of claiming parity from a merely valid PDF file.
"""
from __future__ import annotations
import argparse,hashlib,json,re,sys,unicodedata
from pathlib import Path
import fitz

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"build"))
from build_editions import read_book  # noqa: E402

def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def normal(s):
    s=unicodedata.normalize("NFKD",s or "")
    return "".join(x.casefold() for x in s
      if unicodedata.category(x)[0] in ("L","N")).replace("\u0640","")

def main():
 p=argparse.ArgumentParser()
 p.add_argument("--candidate",required=True,type=Path)
 p.add_argument("--approved",required=True,type=Path)
 p.add_argument("--output",required=True,type=Path)
 p.add_argument("--study",action="store_true")
 a=p.parse_args()
 if not a.candidate.is_file() or not a.approved.is_file():
     raise ValueError("Generated Chromium PDF or independent approved baseline absent")
 canonical=read_book()
 passages=[seg["ar"] for s in canonical["sections"] if isinstance(s.get("id"),int)
            and 1<=s["id"]<=258 for seg in s["segments"]]
 assert len(passages)==414
 with fitz.open(a.candidate) as doc,fitz.open(a.approved) as approved:
  pages=len(doc);baseline=len(approved)
  matched_pixels=0
  changed_sample=[]
  if pages==baseline:
    for n in range(pages):
      actual,expect=doc[n],approved[n]
      if actual.get_pixmap(alpha=False).samples==expect.get_pixmap(alpha=False).samples:
        matched_pixels+=1
      elif len(changed_sample)<8:
        changed_sample.append(n+1)
  names=doc.resolve_names()
  text=[normal(page.get_text(sort=False)) for page in doc]
  all_text="".join(text)
  cover=0
  for sentence in passages:
   words=re.findall(r"[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff]+",sentence)
   needle=normal("".join(words[:2]))
   if needle and any(needle in page for page in text):
    cover+=1
  invalid_links=0
  for page in doc:
   for link in page.get_links():
    if link.get("kind")==fitz.LINK_GOTO and not 0<=link.get("page",-1)<pages:
      invalid_links+=1
  # These are descriptive, not certification. Named source IDs and Study
  # note-call/body positions need explicit independent cross-page audits.
  total_links=sum(len(page.get_links()) for page in doc)
  report={
    "engine":"Chromium native print engine through privileged Playwright CDP",
    "not_ordinary_website_pdf_blob_api":True,
    "release_approved":False,
    "study":a.study,
    "pages_browser":pages,
    "pages_approved":baseline,
    "pages_equal":pages==baseline,
    "full_page_pixel_matches":matched_pixels if pages==baseline else None,
    "first_changed_raster_pages":changed_sample,
    "source_destinations_of_258":sum(f"section-{i}" in names for i in range(1,259)),
    "first_two_arabic_words_extracted_on_some_page":cover,
    "arabic_source_eligible":414,
    "pdf_named_destinations":len(names),
    "toc_entries":len(doc.get_toc()),
    "links":total_links,
    "invalid_internal_links":invalid_links,
    "pdf_size_bytes":a.candidate.stat().st_size,
    "pdf_sha256":digest(a.candidate),
    "footnote_call_body_same_page_certified":False,
    "unicode_exact_literal_search_certified":False,
    "pdfkit_ios_android_native_certified":False,
    "page_css_footnote_support_must_be_tested":True,
    "engines_need_separate_tests":True
  }
 a.output.write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n","utf-8")
 print("DARURI_BROWSER_PRINT_A4_DIAGNOSTIC",json.dumps(report,ensure_ascii=False),flush=True)

if __name__=="__main__":
 main()
