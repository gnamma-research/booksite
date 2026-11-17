#!/usr/bin/env python3
"""Acquire focused original-resolution IIIF pages from Princeton/NYU Muntaha 1876."""
from pathlib import Path
from urllib.request import Request, urlopen
from PIL import Image, ImageOps
import hashlib,io,json,time
ROOT=Path("texts/al-farghani/muntaha-al-madarik/facsimile-I1876-hires")
ROOT.mkdir(parents=True,exist_ok=True)
IMAGES=ROOT/"images";IMAGES.mkdir(exist_ok=True)
MANIFEST="https://sites.dlib.nyu.edu/viewer/api/presentation/books/princeton_aco000264/manifest.json"
INDEX=[12,13,14,17,20,22,24,32,36,42,43]
def fetch(url,timeout=40):
    req=Request(url,headers={"Accept":"*/*","User-Agent":"GNAMMA-philological-collation/1.0"})
    with urlopen(req,timeout=timeout) as r:return r.read()
def get_body(canvas):
    # IIIF Presentation v3: Canvas.items[] -> AnnotationPage.items[] -> Annotation.body
    entries=canvas.get("items") or []
    if entries and isinstance(entries[0],dict):
        annotations=entries[0].get("items") or []
        if annotations:
            body=annotations[0].get("body",{})
            if isinstance(body,list):body=body[0] if body else {}
            return body if isinstance(body,dict) else {"id":body}
    # IIIF v2 fallback
    images=canvas.get("images") or []
    if images:return images[0].get("resource",{})
    return {}
def sources(body):
    service=body.get("service") or body.get("services") or []
    if isinstance(service,dict):service=[service]
    output=[]
    for x in service:
        sid=x.get("id") or x.get("@id")
        if not sid:continue
        sid=sid.replace("http:","https:",1).rstrip("/")
        for tail in ["full/2200,/0/default.jpg","full/1800,/0/default.jpg","full/full/0/default.jpg"]:
            output.append(sid+"/"+tail)
    direct=body.get("id") or body.get("@id")
    if direct:output.append(direct.replace("http:","https:",1))
    return list(dict.fromkeys(output))
raw=fetch(MANIFEST,timeout=50);d=json.loads(raw)
canvases=d.get("items") or (d.get("sequences") or [{}])[0].get("canvases",[])
report={"source":"Princeton/NYU ACO IIIF","manifest":MANIFEST,"manifest_sha256":hashlib.sha256(raw).hexdigest(),"canvas_count":len(canvases),"date_utc":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),"records":[]}
for index in INDEX:
    entry={"scan_index":index,"printed_page":index-4,"tried":[],"succeeded":False}
    try:
        canvas=canvases[index-1];body=get_body(canvas)
        entry["canvas_id"]=canvas.get("id",canvas.get("@id",""))
        entry["canvas_label"]=canvas.get("label",None)
        entry["body_fields"]=list(body.keys())
        candidate=sources(body)
        entry["candidate_count"]=len(candidate)
        for url in candidate:
            try:
                data=fetch(url,timeout=60)
                im=Image.open(io.BytesIO(data));im.load()
                if im.width<1200:raise ValueError("Source too small: %s"%str(im.size))
                im=ImageOps.exif_transpose(im).convert("RGB")
                target=IMAGES/("scan_%04d.jpg"%index)
                if im.width>2500:
                    im.thumbnail((2500,5000),Image.Resampling.LANCZOS)
                im.save(target,quality=87,optimize=True)
                entry.update({"succeeded":True,"source_image_url":url,"original_image_sha256":hashlib.sha256(data).hexdigest(),
                    "stored_image_sha256":hashlib.sha256(target.read_bytes()).hexdigest(),"pixel_size":list(im.size),
                    "bytes":target.stat().st_size,"path":str(target)})
                break
            except Exception as e:
                entry["tried"].append({"url":url,"error":str(e)[:180]})
    except Exception as e:entry["error"]=str(e)
    report["records"].append(entry)
report["succeeded"]=sum(bool(x["succeeded"]) for x in report["records"])
(ROOT/"IIIF_SELECTED_HIRES_MANIFEST.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
print(json.dumps({"succeeded":report["succeeded"],"canvas_count":report["canvas_count"],
                  "records":[{"index":r["scan_index"],"ok":r["succeeded"],"candidates":r.get("candidate_count",0),
                  "reason":(r.get("tried") or [{}])[0].get("error")} for r in report["records"]]},ensure_ascii=False))
if not report["succeeded"]:
    raise SystemExit("No high-res IIIF selected images could be retrieved; provenance log saved")
