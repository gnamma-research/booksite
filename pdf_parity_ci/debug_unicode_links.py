#!/usr/bin/env python3
import json,fitz
from pathlib import Path
from pypdf import PdfReader
root=Path(__file__).resolve().parents[1]/"daruri"
out=Path(__file__).resolve().parent/"debug_evidence"
out.mkdir(exist_ok=True)
src=root/"editions/reading/daruri-reading-bilingual-titles-off.pdf"
pdf=fitz.open(src);page=pdf[0]
links=page.get_links()
print('Fitz linked objects',links[:8])
raw=PdfReader(src)
info=[]
for num,an in enumerate(raw.pages[0].get('/Annots',[])):
 obj=an.get_object()
 info.append({"index":num,"Subtype":str(obj.get("/Subtype")),"Dest":str(obj.get("/Dest")),"A":str(obj.get("/A")),"Rect":str(obj.get("/Rect"))})
p=out/"link-zero-raw.json"
p.write_text(json.dumps({"links":links,"raw":info},indent=2,default=str))
with fitz.open(out/"synthetic-mixed-arabic.pdf") as d:
    results=[]
    for n in range(max(0,len(d)-2),len(d)):
        pg=d[n]
        results.append({"page":n+1,"text":pg.get_text(),"words":[w[4] for w in pg.get_text('words')][-300:]})
        pg.get_pixmap(matrix=fitz.Matrix(1.2,1.2),alpha=False).save(out/("appendix-page-"+str(n+1)+".png"))
    (out/"fitz-extracted.json").write_text(json.dumps(results,ensure_ascii=False,indent=2))
    print("APPENDIX_EXTRACT",json.dumps(results,ensure_ascii=False)[:2400])
print("saved",p)
