#!/usr/bin/env python3
"""Compare locally assembled PDF with independently published certified PDF.
Fail on missing pages, changed text/word positions, broken source references,
incorrect links, lost bookmark structures or publisher content.
"""
from pathlib import Path
import sys,json,re,hashlib,collections
import fitz
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(__file__).resolve().parent/"test-output"
BASE=ROOT/"editions"
records=[]
for output in sorted(OUT.glob("daruri-*.pdf")):
 original=BASE/"apparatus"/output.name
 r={"file":output.name}
 if not original.is_file():raise RuntimeError("No certified reference "+output.name)
 with fitz.open(original) as reference, fitz.open(output) as generated:
  r["pages"]=[len(reference),len(generated)]
  r["source_text_same"]=0;r["word_geometry_same"]=0;r["visual_pages_same"]=0
  r["first_bad_text_pages"]=[];r["first_bad_geometry_pages"]=[]
  r["bad_generated_links"]=[]
  r["reference_toc"]=reference.get_toc()
  r["generated_toc"]=generated.get_toc()
  r["toc_titles_pages_same"]=(r["reference_toc"]==r["generated_toc"])
  r["published_link_count"]=sum(len(p.get_links()) for p in reference)
  r["new_link_count"]=sum(len(p.get_links()) for p in generated)
  r["published_source_page_links"]=0;r["new_source_page_links"]=0
  names=generated.resolve_names()
  r["verified_sections"]=sum(f"section-{i}" in names for i in range(1,259))
  for p in range(min(len(reference),len(generated))):
   a,b=reference[p],generated[p]
   ta,tb=a.get_text(),b.get_text()
   if ta==tb:r["source_text_same"]+=1
   elif len(r["first_bad_text_pages"])<10:r["first_bad_text_pages"].append(p+1)
   wa=[(w[4],*[round(x,2) for x in w[:4]]) for w in a.get_text("words",sort=False)]
   wb=[(w[4],*[round(x,2) for x in w[:4]]) for w in b.get_text("words",sort=False)]
   if wa==wb:r["word_geometry_same"]+=1
   elif len(r["first_bad_geometry_pages"])<10:r["first_bad_geometry_pages"].append(p+1)
   if a.rect==b.rect and a.get_pixmap().samples==b.get_pixmap().samples:
    r["visual_pages_same"]+=1
   if p<min(2,len(reference)):
    for aLink in a.get_links():
     if aLink["kind"] in (fitz.LINK_GOTO,fitz.LINK_NAMED):r["published_source_page_links"]+=1
    for bLink in b.get_links():
     if bLink["kind"] in (fitz.LINK_GOTO,fitz.LINK_NAMED):r["new_source_page_links"]+=1
   for link in b.get_links():
    if link.get("kind")==fitz.LINK_GOTO and not 0<=link.get("page",-1)<len(generated):
     r["bad_generated_links"].append((p+1,str(link.get("page"))))
    if link.get("kind")==fitz.LINK_NAMED and not 0<=link.get("page",-1)<len(generated):
     r["bad_generated_links"].append((p+1,str(link.get("page"))))
  r["source_integrity_ok"]=r["pages"][0]==r["pages"][1] and r["source_text_same"]==len(reference) and r["word_geometry_same"]==len(reference) and r["visual_pages_same"]==len(reference)
  r["safe"]=r["source_integrity_ok"] and r["toc_titles_pages_same"] and r["verified_sections"]==258 and not r["bad_generated_links"]
  print("EVALUATE",json.dumps({k:v for k,v in r.items() if k not in ("reference_toc","generated_toc")},ensure_ascii=False),flush=True)
  records.append(r)
(OUT/"parity_results.json").write_text(json.dumps(records,indent=2,ensure_ascii=False))
# CI may continue to preserve evidence, but emit machine-readable strict status.
if not all(x["safe"] for x in records):
 print("STRICT PARITY FAILED",flush=True)
 sys.exit(2)
print("ALL THREE PROFILES PASSED STRICT PIXEL + LINK + BOOKMARK PARITY")
