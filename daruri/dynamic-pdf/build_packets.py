#!/usr/bin/env python3
"""Compile all fifteen reusable scholarly apparatus packets from the canonical
HTML/CSS+WeasyPrint pipeline. Outputs content-addressed packet PDFs and
SHA-bound exact PDF link geometry; never modifies a published PDF.
"""
from __future__ import annotations
import itertools, json, hashlib, re, argparse, sys
from pathlib import Path
import fitz
HERE=Path(__file__).resolve().parent
ROOT=HERE.parent
sys.path.insert(0,str(ROOT/"build"))
from build_apparatus_variants import build_appendix,APPARATUS_ORDER
from approved_links import published_links
OUT=HERE/"packets"
VERSION="20261022-appx-packets-v1"

def digest(raw:bytes):
 return hashlib.sha256(raw).hexdigest()

def cleanpoint(value):
 if value is None:return None
 if isinstance(value,(list,tuple)):return [round(float(value[0]),3),round(float(value[1]),3)]
 return [round(float(value.x),3),round(float(value.y),3)]

def fixture(raw:bytes,components:tuple[str,...]):
 with fitz.open(stream=raw,filetype="pdf") as doc:
  note_links=[];pdf_links=[];names=doc.resolve_names()
  # Distinguish source-section references, internal packet links and external URIs.
  # Raw stand-alone WeasyPrint links to absent source sections are repaired in
  # the merged PDF from these Unicode-grounded positions.
  source_ids=set()
  for page_n,page in enumerate(doc):
   for block in page.get_text("blocks"):
    if len(block)<5:continue
    for match in re.finditer(r"§\s*(\d{1,3})",block[4]):
     sec=int(match.group(1))
     if sec<1 or sec>258:continue
     for rect in page.search_for("§"+str(sec)):
      if rect.is_empty or rect.width<3:continue
      key=(page_n,*[round(v,3) for v in rect],sec)
      if key not in source_ids:
       source_ids.add(key)
       note_links.append({"page":page_n,"rect":[round(v,3) for v in rect],
          "section":sec})
   for link in page.get_links():
    kind=link.get("kind")
    if kind==fitz.LINK_GOTO:
     target=link.get("page",-1)
     if isinstance(target,int) and 0<=target<doc.page_count:
      pdf_links.append({"page":page_n,"rect":[round(v,3) for v in link["from"]],
       "kind":"goto","target":target,"to":cleanpoint(link.get("to"))})
    elif kind==fitz.LINK_URI:
     uri=link.get("uri","")
     if re.match(r"^https?://",uri,re.I):
      pdf_links.append({"page":page_n,"rect":[round(v,3) for v in link["from"]],
        "kind":"uri","uri":uri})
  roots={}
  for component in components:
   root_names={"glossary":["glossary"],"index":["subject-index"],
       "concordance":["concordance"],"applications":["applications"]}
   for anchor in root_names[component]:
    n=names.get(anchor)
    if isinstance(n,dict) and isinstance(n.get("page"),int):
     roots[component]={"page":n["page"],"to":cleanpoint(n.get("to"))}
     break
  # Source validation and packet identity are repeated when served.
  return {"components":list(components),"pages":len(doc),"sha256":digest(raw),
    "bytes":len(raw),"links_to_source":note_links,"packet_links":pdf_links,
    "roots":roots,"named_anchors":len(names),
    "all_sections_in_range":all(1<=x["section"]<=258 for x in note_links)}

def compile_pack(out:Path):
 out.mkdir(parents=True,exist_ok=True)
 profiles=[components for count in range(1,5)
  for components in itertools.combinations(APPARATUS_ORDER,count)]
 base_manifest=(ROOT/"editions/manifest.json").read_bytes()
 manifest={"schema":1,"release":VERSION,"generator":"WeasyPrint 68; canonical Gnamma html/css",
   "base_manifest_sha256":digest(base_manifest),"components_order":list(APPARATUS_ORDER),
   "packets":[]}
 for components in profiles:
  name="-".join(components)
  raw=build_appendix(components)
  filename=f"gnamma-apparatus-{name}.pdf"
  (out/filename).write_bytes(raw)
  meta=fixture(raw,components)
  gold=published_links(ROOT,raw,components)
  meta["links_to_source"]=gold["refs"]
  meta["packet_links"]=gold["other"]
  meta["gold_reference"]={k:v for k,v in gold.items() if k not in ("refs","other")}
  (out/(filename+".json")).write_text(json.dumps(meta,ensure_ascii=False,separators=(',',':')))
  record={"file":filename,"map":filename+".json","components":list(components),
    "pages":meta["pages"],"sha256":meta["sha256"],"bytes":meta["bytes"],
    "map_sha256":digest((out/(filename+".json")).read_bytes()),
    "source_refs":len(meta["links_to_source"]),"packet_links":len(meta["packet_links"])}
  manifest["packets"].append(record)
  print("PACKET",name,record["pages"],record["bytes"],
        "source refs",record["source_refs"],"links",record["packet_links"],flush=True)
 manifest["packets"]=sorted(manifest["packets"],key=lambda x:x["file"])
 (out/"manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n")
 print("TOTAL PACKETS",len(manifest["packets"]),
   "TOTAL BYTES",sum(x["bytes"] for x in manifest["packets"]),flush=True)
 return manifest

if __name__=="__main__":
 parser=argparse.ArgumentParser()
 parser.add_argument("--out",type=Path,default=OUT)
 args=parser.parse_args()
 compile_pack(args.out)
