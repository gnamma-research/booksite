"""Exact appendix PDF hyperlink templates taken from APPROVED published PDFs."""
from pathlib import Path
import json,re
import fitz

def published_links(root:Path,raw:bytes,components:tuple[str,...],approved:dict|None=None)->dict:
 entries=json.loads((root/"editions/apparatus/manifest.json").read_text())["files"]
 options=[x for x in entries if tuple(x.get("apparatus",()))==components]
 if not options:raise ValueError("Missing approved reference for "+str(components))
 options.sort(key=lambda x:(x["tier"]!="reading",x["language"]!="bilingual",
                           bool(x["editorial_titles"]),x["file"]))
 gold_record=approved or options[0]
 if tuple(gold_record.get('apparatus',()))!=components:raise ValueError('Approved profile has wrong apparatus')
 with fitz.open(root/"editions"/gold_record["file"]) as gold, \
      fitz.open(root/"editions"/gold_record["source_base"]) as base, \
      fitz.open(stream=raw,filetype="pdf") as packet:
  offset=len(base)
  if len(gold)!=offset+len(packet):raise ValueError("Packet page count differs from approved")
  for n in range(len(packet)):
   ga=[(w[4],*[round(v,2) for v in w[:4]]) for w in gold[offset+n].get_text("words")]
   pa=[(w[4],*[round(v,2) for v in w[:4]]) for w in packet[n].get_text("words")]
   if ga!=pa:raise ValueError("Approved appendix text or word geometry differs "+str((components,n)))
  names=base.resolve_names()
  anchors={}
  for section in range(1,259):
   info=names.get(f"section-{section}")
   if not isinstance(info,dict) or not isinstance(info.get("page"),int):continue
   point=info.get("to")
   if point is None:continue
   x,y=(point[0],point[1]) if isinstance(point,(list,tuple)) else (point.x,point.y)
   anchors.setdefault(info["page"],[]).append((section,float(x),float(y)))
  sources=[];other=[];unmapped=[];seen=0
  for p in range(len(packet)):
   for link in gold[offset+p].get_links():
    seen+=1
    rect=[round(float(v),3) for v in link["from"]]
    kind=link.get("kind");dest=link.get("page")
    if kind in (fitz.LINK_GOTO,fitz.LINK_NAMED) and isinstance(dest,int):
     if not 0<=dest<len(gold):raise ValueError("Broken published appendix link")
     point=link.get("to")
     xy=([float(point[0]),float(point[1])] if isinstance(point,(list,tuple)) else
         [float(point.x),float(point.y)] if point is not None else None)
     if dest<offset:
      candidates=sorted((abs(ax-xy[0])+abs(ay-xy[1]),section)
        for section,ax,ay in anchors.get(dest,[])) if xy else []
      if not candidates or candidates[0][0]>.65:
       unmapped.append({"page":p,"target":dest,"point":xy,"near":candidates[:3]})
      else:sources.append({"page":p,"rect":rect,"section":candidates[0][1]})
     else:other.append({"page":p,"rect":rect,"kind":"goto",
                        "target":dest-offset,"to":xy})
    elif kind==fitz.LINK_URI:
     uri=link.get("uri","")
     if re.match(r"^https?://",uri,re.I):
      other.append({"page":p,"rect":rect,"kind":"uri","uri":uri})
     else:unmapped.append({"page":p,"uri":uri,"kind":kind})
    else:unmapped.append({"page":p,"dest":dest,"kind":kind})
  if unmapped:
   print("UNMAPPED_APPROVED_LINKS",components,len(unmapped),unmapped[:6],flush=True)
   raise ValueError("Cannot certify source citations to approved references")
  if len(sources)+len(other)!=seen:raise ValueError("Approved link count mismatch")
  return {"refs":sources,"other":other,"links":seen,
     "reference_sha256":gold_record["sha256"],"reference_file":gold_record["file"],
     "reference_base_sha256":gold_record["base_sha256"],
     "gold_reference_pages":len(gold),"geometry_verified":True}
