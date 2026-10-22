#!/usr/bin/env python3
"""Exhaustive PDF link graph & release identity audit, all published Daruri files.
Read only, no change to the published corpus or local personal notes.
"""
from __future__ import annotations
import hashlib,json,re,sys,traceback
from collections import Counter
from pathlib import Path
import fitz
ROOT=Path(__file__).resolve().parents[1]/"daruri"
OUT=Path(sys.argv[1]) if len(sys.argv)>1 else Path("pdf_parity_ci/link_graph_report.json")
def digest(p):
 h=hashlib.sha256()
 with open(p,"rb") as f:
  while data:=f.read(1048576):h.update(data)
 return h.hexdigest()
def sources():
 canon=json.loads((ROOT/"pdf-editions-manifest.json").read_text())["files"]
 for name,data in canon.items():yield ("canonical",ROOT/name,name,data["sha256"],data.get("pages"))
 bases=json.loads((ROOT/"editions/manifest.json").read_text())["files"]
 for d in bases:yield ("base_a4",ROOT/"editions"/d["file"],d["file"],d["sha256"],d["pages"])
 apparatus=json.loads((ROOT/"editions/apparatus/manifest.json").read_text())["files"]
 for d in apparatus:yield ("apparatus",ROOT/"editions"/d["file"],d["file"],d["sha256"],d["pages"])
entries=list(sources());counts=Counter();problems=[];per_file=[]
for idx,(kind,path,name,expected_sha,pages) in enumerate(entries,1):
 try:
  check={"kind":kind,"name":name,"expected_pages":pages,"expected_sha":expected_sha}
  data_sha=digest(path);check["sha_match"]=(data_sha==expected_sha)
  with fitz.open(path) as pdf:
   check["pages"]=len(pdf);check["page_match"]=(check["pages"]==pages)
   check["toc"]=len(pdf.get_toc());check["links"]=0
   problems_local=[];types=Counter()
   for pidx,page in enumerate(pdf):
    for link in page.get_links():
     check["links"]+=1;kind_link=link.get("kind");types[str(kind_link)]+=1
     if kind_link==fitz.LINK_GOTO:
      dst=link.get("page")
      if not isinstance(dst,int) or not (0<=dst<len(pdf)):
       problems_local.append({"page":pidx+1,"why":"internal-target-invalid","dest":str(dst)})
     elif kind_link==fitz.LINK_NAMED:
      # PyMuPDF resolves named destinations to a ZERO-based page index,
      # exactly like LINK_GOTO. Page index 0 is a valid first page.
      dst=link.get("page")
      if not isinstance(dst,int) or not 0<=dst<len(pdf):
       problems_local.append({"page":pidx+1,"why":"named-target-invalid","dest":str(dst),
           "named":link.get("nameddest")})
     elif kind_link==fitz.LINK_URI:
      uri=link.get("uri") or ""
      if not re.match(r"^(https?://|mailto:|tel:)",uri,re.I):
       problems_local.append({"page":pidx+1,"why":"unexpected-uri-scheme","uri":uri[:125]})
     rect=link.get("from")
     if rect and (rect.width<0 or rect.height<0):
      problems_local.append({"page":pidx+1,"why":"inverted-link-bounding-box"})
     if len(problems_local)>35:break
    if len(problems_local)>35:break
   check["link_types"]=dict(types);check["invalid_links"]=problems_local
   if kind=="canonical":
    names=pdf.resolve_names()
    targets=[f"section-{i}" for i in range(1,259)]+["section-colophon"]
    check["canonical_source_name_coverage"]=sum(x in names for x in targets)
    if check["canonical_source_name_coverage"]!=259:
     problems_local.append({"why":"missing-canonical-destinations","found":check["canonical_source_name_coverage"]})
   else:
    check["named_destinations_preserved"]=None
   counts[kind+"_pdfs"]+=1;counts[kind+"_pages"]+=len(pdf);counts[kind+"_links"]+=check["links"]
   counts[kind+"_bookmarks"]+=check["toc"];counts["total_links"]+=check["links"]
   if not check["sha_match"] or not check["page_match"] or problems_local:
    problems.append({"file":name,"sha_match":check["sha_match"],"page_match":check["page_match"],"bad_links":problems_local[:10]})
   per_file.append(check)
 except Exception as e:
  problems.append({"file":name,"error":str(e),"traceback":traceback.format_exc()[-800:]})
  per_file.append({"kind":kind,"name":name,"error":str(e)})
 if idx%20==0:print("SCANNED",idx,"of",len(entries),"links",counts["total_links"],flush=True)
result={"files":len(entries),"counts":dict(counts),"problems":problems,"files_summary":per_file,
        "all_published_files_pass":len(problems)==0,"scope":"All 5 canonical + 12 A4 + 120 apparatus PDFs. All embedded PDF link annotations checked. This does not certify semantics of each named target."}
OUT.parent.mkdir(parents=True,exist_ok=True)
OUT.write_text(json.dumps(result,ensure_ascii=False,indent=2))
print(json.dumps({k:v for k,v in result.items() if k!="files_summary"},indent=2)[:5500])
sys.exit(0 if not problems else 2)
