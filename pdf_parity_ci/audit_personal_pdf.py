#!/usr/bin/env python3
"""Inspect synthetic personal edition against its approved base, without altering either."""
import sys,json,re,collections,hashlib
from pathlib import Path
import fitz
src,personal=map(Path,sys.argv[1:3])
sentinel="CI-PRIVATE-PERSONAL-NOTE"
with fitz.open(src) as ref,fitz.open(personal) as got:
 count=ref.page_count; pages=got.page_count
 issues=[];sample_checks=[]
 if pages<=count:issues.append("no-appended-personal-pages")
 if len(got.get_toc())<len(ref.get_toc()):issues.append("bookmarks-lost")
 publisher_ink_equal=0
 for p in sorted({0,1,2,count//2,count-1}):
  if p<0 or p>=count:continue
  baseline=collections.Counter((w[4],*(round(x,2) for x in w[:4])) for w in ref[p].get_text("words",sort=False))
  modified=collections.Counter((w[4],*(round(x,2) for x in w[:4])) for w in got[p].get_text("words",sort=False))
  missing=baseline-modified
  sample_checks.append({"page":p+1,"base_words":sum(baseline.values()),"missing_words":sum(missing.values())})
  if missing:issues.append(f"published-words-shifted-or-missing-page-{p+1}")
  else:publisher_ink_equal+=1
 newtext="\n".join(got[i].get_text() for i in range(count,pages))
 if sentinel not in newtext:issues.append("private-note-body-not-extractable")
 if "التحليل" not in newtext:issues.append("arabic-private-note-not-extractable")
 pmarkers=[]
 for i in range(count):
  for x in got[i].get_text("words"):
   if re.fullmatch(r"P[1-9]\d{0,3}",x[4]):pmarkers.append({"page":i+1,"label":x[4],"x":round(x[0],1)})
 # A bookmark-only source may contribute a marginal P link; fail if none.
 if not pmarkers:issues.append("no-marginal-P-marker")
 original_links=sum(len(page.get_links()) for page in ref)
 new_orig_links=sum(len(got[i].get_links()) for i in range(count))
 if new_orig_links<original_links:issues.append("publisher-navigation-links-lost")
 new_source_links=new_orig_links-original_links
 # Check all ordinary internal PDF links resolve within the new file.
 link_bad=[]
 for i,p in enumerate(got):
  for link in p.get_links():
   if link.get("kind")==fitz.LINK_GOTO and not(0<=link.get("page",-1)<pages):
    link_bad.append({"page":i+1,"target":link.get("page")})
 if link_bad:issues.append("broken-internal-link")
 result={"base":src.name,"personal_pdf_pages":pages,"published_pages":count,
  "extra_pages":pages-count,"original_links":original_links,"personal_base_links":new_orig_links,
  "added_source_links":new_source_links,"publisher_sample":sample_checks,
  "pmarkers":pmarkers[:8],"appendix_sentinel":sentinel in newtext,
  "arabic_extracted":"التحليل" in newtext,"bad_internal_links":link_bad[:8],
  "problems":issues,"pass":not issues}
print(json.dumps(result,ensure_ascii=False))
sys.exit(0 if not issues else 2)
