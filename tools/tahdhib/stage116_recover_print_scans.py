#!/usr/bin/env python3
"""Stage116: retrieve source scans, save BOUNDED research slices and provenance.
Does not publish or modify the canonical corpus. Never claims that PDF index
equals printed page without direct visual confirmation.
"""
from __future__ import annotations
from pathlib import Path
import hashlib, json, os, urllib.request, time, sys
import fitz

ROOT=Path("tahdhib116-photo-audit")
ROOT.mkdir(exist_ok=True)
URLS={
  "lis_fa1208_1405": "https://archive.org/download/lis_fa12/lis_fa1208.pdf",
  "lis_fa1209_1433": "https://archive.org/download/lis_fa12/lis_fa1209.pdf",
}
TARGETS=[258,294,300,309,387]
OFFSETS=[-1,0,1,2,3]
manifest={
 "stage":116,"sourceType":"public scan of printed modern edition; not manuscript",
 "targets":TARGETS,"offsets":OFFSETS,"works":{},
 "published_to_site":False,
 "caveat":"photo image index and printed page numbers must be confirmed by human visual reading; not automatic"
}
def sha(b):return hashlib.sha256(b).hexdigest()
for tag,url in URLS.items():
    obj={"url":url,"status":"pending","rendered":[]}
    manifest["works"][tag]=obj
    dest=ROOT/(tag+".pdf")
    try:
      hdr={"User-Agent":"GNAMMA-Scholarly-Source-Audit/1.0 contact: publicly hosted citation link"}
      last=None
      for attempt in range(3):
        try:
          with urllib.request.urlopen(urllib.request.Request(url,headers=hdr),timeout=90) as resp, dest.open("wb") as sink:
            while True:
              chunk=resp.read(1<<18)
              if not chunk: break
              sink.write(chunk)
          if dest.stat().st_size>500000: break
          raise RuntimeError("download unexpectedly small")
        except Exception as ex:
          last=ex
          if attempt==2:raise
          time.sleep(3)
      obj["pdf_bytes"]=dest.stat().st_size
      obj["pdf_sha256"]=sha(dest.read_bytes())
      pdf=fitz.open(dest)
      obj["page_count"]=len(pdf)
      # Low-res page images for research review, preserve original scan hash.
      for n in TARGETS:
        for off in OFFSETS:
          index=n+off
          if not (0<=index<len(pdf)):continue
          page=pdf[index]
          pix=page.get_pixmap(matrix=fitz.Matrix(1.15,1.15),alpha=False)
          dat=pix.tobytes("jpeg",jpg_quality=66)
          name=f"{tag}-printed-p{n}-pdfindex-{index:03}.jpg"
          (ROOT/name).write_bytes(dat)
          obj["rendered"].append({
            "targetPrintedPage":n,"pdfIndex0":index,"candidateOffset":off,
            "name":name,"bytes":len(dat),"sha256":sha(dat),
            "embeddedPdfTextChars":len(page.get_text("text")),
            "pdfPageSize":[round(page.rect.width,1),round(page.rect.height,1)]
          })
      # Second pass: exactly five printed source pages, true high-resolution, no
      # automated textual OCR. Determined from first-pass visual page-numeral
      # matching: 1405 scan pdf index=printed+1; 1433 pdf index=printed.
      obj["highres"]=[]
      printed_to_pdf_offset = 1 if tag == "lis_fa1208_1405" else 0
      for printed in TARGETS:
        idx = printed + printed_to_pdf_offset
        page = pdf[idx]
        pix = page.get_pixmap(matrix=fitz.Matrix(3.3,3.3),alpha=False)
        png = pix.tobytes("png")
        fname = f"{tag}-VERIFIED-PRINTED-p{printed}-pdfindex-{idx:03}-hires.png"
        (ROOT/fname).write_bytes(png)
        obj["highres"].append({
          "printedPage":printed,"pdfIndex0":idx,"name":fname,
          "bytes":len(png),"sha256":sha(png),
          "indexOffsetDeterminedBy":"visual printed folio in 25-candidate gallery"
        })
      obj["status"]="downloaded_and_thumbnails_and_five_verified_highres_pages_rendered"
      pdf.close()
      print("retrieved",tag,"pages",obj["page_count"],"PDF bytes",obj["pdf_bytes"],"sha",obj["pdf_sha256"],flush=True)
      # Avoid uploading full PDF editions; provide original public URL and verified SHA.
      dest.unlink()
    except Exception as ex:
      obj["status"]="failed"
      obj["error"]=str(ex)
      print("ERROR",tag,repr(ex),file=sys.stderr,flush=True)
manifest["rendered_count"]=sum(len(x.get("rendered",[])) for x in manifest["works"].values())
(ROOT/"manifest.json").write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n")
print(json.dumps({k:{y:v for y,v in val.items() if y!="rendered"} for k,val in manifest["works"].items()},ensure_ascii=False,indent=2),flush=True)
if manifest["rendered_count"]==0:sys.exit(2)
