#!/usr/bin/env python3
"""GNAMMA 1876 Muntaha facsimile acquisition; scan images, NOT an edited text.
Only public Princeton/NYU ACO source, no credentials, no third-party OCR APIs.
Run in a GitHub Actions runner with outbound internet.
"""
import hashlib, io, json, os, subprocess, sys, time, urllib.request
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps
ROOT=Path("texts/al-farghani/muntaha-al-madarik/facsimile-I1876")
OUT=ROOT/"images"
OUT.mkdir(parents=True,exist_ok=True)
MANIFEST="https://sites.dlib.nyu.edu/viewer/api/presentation/books/princeton_aco000264/manifest.json"
PDF="https://mc.dlib.nyu.edu/files/books/princeton_aco000264/princeton_aco000264_lo.pdf"
INDICES=sorted(set(list(range(1,51))+[55,60,65,70,80,90,100,110,125]))
def get_bytes(url, timeout=45):
    req=urllib.request.Request(url,headers={"User-Agent":"GNAMMA-academic-critical-edition/1.0","Accept":"*/*"})
    with urllib.request.urlopen(req,timeout=timeout) as resp:
        return resp.read()
def normurl(url):
    if not isinstance(url,str): return ""
    return "https:"+url[5:] if url.startswith("http:") else url
def resource_info(canvas):
    images=canvas.get("images",[])
    if not images and canvas.get("items"): images=canvas.get("items",[])
    if not images:return None,""
    im=images[0]
    res=im.get("resource",im.get("body",{}))
    if isinstance(res,list):res=res[0] if res else {}
    if isinstance(res,str):res={"@id":res}
    service=res.get("service") or res.get("services") or {}
    if isinstance(service,list):service=service[0] if service else {}
    if isinstance(service,str):service={"@id":service}
    sid=normurl(service.get("@id") or service.get("id") or "")
    rid=normurl(res.get("@id") or res.get("id") or "")
    return sid,rid
def image_candidates(canvas):
    sid,rid=resource_info(canvas)
    result=[]
    if sid:
        for suffix in ["full/1800,/0/default.jpg","full/1600,/0/default.jpg","full/full/0/default.jpg"]:
            result.append(sid.rstrip("/")+"/"+suffix)
    if rid:result.append(rid)
    return result
def save_image(index, raw, source_url, canvas_label):
    pil=Image.open(io.BytesIO(raw))
    pil.load()
    pil=ImageOps.exif_transpose(pil).convert("RGB")
    maxw=1750
    if pil.width>maxw:
        pil=pil.resize((maxw,round(pil.height*maxw/pil.width)),Image.Resampling.LANCZOS)
        pil.thumbnail((maxw,4000),Image.Resampling.LANCZOS)
    target=OUT/("scan_%04d.jpg"%index)
    pil.save(target,format="JPEG",quality=78,optimize=True,subsampling=0)
    rec={"scan_index":index,"canvas_label":str(canvas_label),"source_image_url":source_url,
         "sha256_source":hashlib.sha256(raw).hexdigest(),"sha256_derived":hashlib.sha256(target.read_bytes()).hexdigest(),
         "local_image":str(target),"image_size_pixels":[pil.width,pil.height],
         "source_bytes":len(raw),"derived_bytes":target.stat().st_size,
         "historical_print_identified":True,"reading_verified":False}
    return rec
def acquire_manifest():
    raw=get_bytes(MANIFEST,timeout=40)
    data=json.loads(raw.decode("utf-8-sig"))
    seq=data.get("sequences") or []
    canvases=(seq[0].get("canvases",[]) if seq else data.get("items",[]))
    return data,canvases
def pdf_fallback(records,errs):
    path=Path("/tmp/gnamma-farghani-I1876-lo.pdf")
    try:
        import fitz
        data=get_bytes(PDF,timeout=220)
        path.write_bytes(data)
        report={"pdf_url":PDF,"source_sha256":hashlib.sha256(data).hexdigest(),"bytes":len(data)}
        doc=fitz.open(str(path))
        report["pdf_page_count"]=len(doc)
        for i in INDICES:
            if i>len(doc):continue
            page=doc[i-1]
            pix=page.get_pixmap(matrix=fitz.Matrix(1.7,1.7),colorspace=fitz.csRGB,alpha=False)
            raw=pix.tobytes("png")
            records.append(save_image(i,raw,PDF+"#scan="+str(i),"PDF scan "+str(i)))
        doc.close()
        return report
    except Exception as e:
        errs.append("PDF fallback: "+repr(e))
        return {"pdf_url":PDF,"download_or_render":"FAILED"}
def make_contacts(rows):
    good=[r for r in rows if (OUT/("scan_%04d.jpg"%r["scan_index"])).exists()]
    for chunkno,start in enumerate(range(0,len(good),20),start=1):
        subset=good[start:start+20]
        w,h=300,430
        sheet=Image.new("RGB",(4*w,5*h),"white");draw=ImageDraw.Draw(sheet)
        for k,r in enumerate(subset):
            im=Image.open(r["local_image"]);im.thumbnail((w-20,h-60))
            x=(k%4)*w+(w-im.width)//2
            y=(k//4)*h+12
            sheet.paste(im,(x,y))
            draw.text(((k%4)*w+12,(k//4)*h+h-35),str(r["scan_index"])+" ("+str(r["canvas_label"])[:18]+")",fill="black")
        sheet.save(ROOT/("contact_%02d.jpg"%chunkno),quality=72,optimize=True)
def produce():
    started=time.time();records=[];errors=[];catalog={"manifest_url":MANIFEST,"downloaded_at_utc":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),"target_scan_indices":INDICES}
    try:
        manifest,canvases=acquire_manifest()
        catalog.update({"manifest_id":manifest.get("@id") or manifest.get("id"),"manifest_label":manifest.get("label"),"canvas_count":len(canvases),"first_canvas_keys":list(canvases[0].keys()) if canvases else [],"access":"readable JSON"})
        for index in INDICES:
            if index>len(canvases):continue
            canvas=canvases[index-1];label=canvas.get("label",index)
            for uri in image_candidates(canvas):
                try:
                    raw=get_bytes(uri,timeout=35)
                    if len(raw)<1000:raise ValueError("Too small for scan")
                    records.append(save_image(index,raw,uri,label))
                    break
                except Exception as e: errors.append("canvas %d candidate %s: %s"%(index,uri[:160],repr(e)[:180]))
    except Exception as e:
        errors.append("IIIF manifest acquisition: "+repr(e))
        catalog["access"]="manifest unavailable"
    if len(records)<3:
        catalog["pdf_fallback"]=pdf_fallback(records,errors)
    if records:make_contacts(records)
    catalog["successful_image_count"]=len(records)
    catalog["images"]=records
    catalog["errors"]=errors[:140]
    catalog["elapsed_seconds"]=round(time.time()-started,1)
    (ROOT/"SOURCE_INGEST_MANIFEST.json").write_text(json.dumps(catalog,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    report="# Farghānī: I1876 facsimile acquisition checkpoint\n\n"
    report+="**Provenance:** Princeton University Libraries → NYU Arabic Collections Online → 1293/1876 *Muntahā al-madārik*, vol. 1.\n\n"
    report+="**Critical warning:** These are ordered digital scan images, NOT manuscript folios. Their scan numbers are NOT I1876 printed page numbers, and B2007 printed page numbers cannot be equated with either without visual comparison. All machine-generated OCR or scans remain UNVERIFIED until a scholar visually checks each target reading against full-resolution images. No manuscript variants follow simply from acquisition.\n\n"
    report+="IIIF canvases: %s. Images captured: %d. Errors recorded: %d.\n\n"%(str(catalog.get("canvas_count","not retrievable")),len(records),len(errors))
    report+="See SOURCE_INGEST_MANIFEST.json for each exact IIIF image URL, canvas label and SHA-256 provenance; contact sheets for locating the printed title and first 30 pages.\n\n"
    if not records:report+="**BLOCKED:** Neither IIIF image API nor low-resolution PDF source could be fetched by the runner. No text readings have been collated.\n"
    (ROOT/"SOURCE_INGEST_REPORT.md").write_text(report,encoding="utf-8")
    print(json.dumps({"image_count":len(records),"canvas_count":catalog.get("canvas_count"),"errors":errors[:6],"duration":catalog["elapsed_seconds"]},ensure_ascii=False))
    if not records:sys.exit(2)
if __name__=="__main__":produce()
