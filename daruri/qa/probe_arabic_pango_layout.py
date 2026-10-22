#!/usr/bin/env python3
"""READ-ONLY Daruri Arabic source-word geometry proof using WeasyPrint's
PangoLayout. Never extract or guess Arabic word content from PDF glyphs.

Rebuild unchanged A4 sources; capture the rendered TextBox's original Pango
cluster positions without inserting word <span> elements (which can reflow or
change glyph shaping). Compare every resulting page's pixels to the approved
published PDF and fail closed if page count or layout differs.

This probe emits a report and optional sample overlay as workflow artifacts.
It DOES NOT overwrite the published PDF or install speculative word maps.
"""
from __future__ import annotations
from collections import OrderedDict, Counter
from pathlib import Path
from tempfile import TemporaryDirectory
import argparse, ctypes, ctypes.util, hashlib, json, re, sys, unicodedata
import fitz
from weasyprint import HTML as WeasyHTML
from weasyprint.text.line_break import Layout
from weasyprint.text.ffi import ffi

ROOT=Path(__file__).resolve().parents[1]
BUILD=ROOT/"build"
sys.path.insert(0,str(BUILD))
import print_editions

PANGO=ctypes.CDLL(ctypes.util.find_library("pango-1.0"))
class PangoRect(ctypes.Structure):
    _fields_=[("x",ctypes.c_int),("y",ctypes.c_int),("width",ctypes.c_int),("height",ctypes.c_int)]
PANGO.pango_layout_index_to_pos.argtypes=[ctypes.c_void_p,ctypes.c_int,ctypes.POINTER(PangoRect)]
PANGO.pango_layout_index_to_pos.restype=None

def concat_normalized(s):
    return "".join(c for c in unicodedata.normalize("NFC",s) if not c.isspace())

def word_boxes(textbox,page_number):
    if textbox.pango_layout.text!=textbox.text:
        raise RuntimeError("Pango layout text differs from the source TextBox")
    ptr=int(ffi.cast("uintptr_t",textbox.pango_layout.layout))
    chars=textbox.text
    byte_offsets=[0]
    for ch in chars:
        byte_offsets.append(byte_offsets[-1]+len(ch.encode("utf8")))
    for word in re.finditer(r"\S+",chars):
        rects=[]
        for i in range(word.start(),word.end()):
            raw=PangoRect()
            PANGO.pango_layout_index_to_pos(ptr,byte_offsets[i],ctypes.byref(raw))
            coords=(raw.x,raw.y,raw.x+raw.width,raw.y+raw.height)
            rects.append((
                textbox.position_x+min(coords[0],coords[2])/1024,
                textbox.position_y+min(coords[1],coords[3])/1024,
                textbox.position_x+max(coords[0],coords[2])/1024,
                textbox.position_y+max(coords[1],coords[3])/1024))
        if not rects:continue
        css=(min(x[0] for x in rects),min(x[1] for x in rects),
             max(x[2] for x in rects),max(x[3] for x in rects))
        pt=[round(c*0.75,3) for c in css]
        if (pt[0]<-0.5 or pt[1]<-0.5 or pt[2]>596 or pt[3]>843 or
            pt[2]<=pt[0] or pt[3]<=pt[1]):
            raise RuntimeError(f"Word bbox out of PDF bounds: {word.group()!r}, {pt}")
        yield [word.group(),page_number,*pt]

class CapturedHTML:
    document=None
    def __init__(self,*,string,base_url=None,**kwargs):
        self.raw=string
        self.base_url=base_url
    def write_pdf(self, output):
        doc=WeasyHTML(string=self.raw,base_url=self.base_url).render()
        CapturedHTML.document=doc
        doc.write_pdf(output)

def original_word_groups(document):
    """Associate existing monolingual <p class=ar-body> DOM elements with
    Pango TextBoxes on each page, without changing any characters or HTML."""
    groups=OrderedDict()
    for number,page in enumerate(document.pages,1):
        for box in page._page_box.descendants():
            if type(box).__name__!="TextBox" or box.element_tag!="p":continue
            element=box.element
            if "ar-body" not in str(element.get("class") or "").split():continue
            key=id(element)
            if key not in groups:groups[key]={"chunks":[],"words":[]}
            groups[key]["chunks"].append(box.text)
            groups[key]["words"].extend(word_boxes(box,number))
    return list(groups.values())

def page_images_equal(a,b):
    if len(a)!=len(b):return False,0
    equal=0
    for i in range(len(a)):
        if abs(a[i].rect.width-b[i].rect.width)>0.05 or abs(a[i].rect.height-b[i].rect.height)>0.05:
            break
        av=a[i].get_pixmap(matrix=fitz.Matrix(1,1),alpha=False)
        bv=b[i].get_pixmap(matrix=fitz.Matrix(1,1),alpha=False)
        if av.width!=bv.width or av.height!=bv.height:break
        if hashlib.sha256(av.samples).digest()!=hashlib.sha256(bv.samples).digest():break
        equal+=1
    return equal==len(a),equal

def make_proof(name,published,mapped,out_dir):
    doc=fitz.open(published)
    found={}
    for token in ("الحكم","السنة","الشرع","الاستدلال","المكلفين"):
        for key,words in mapped.items():
            if key[0] not in (10,11,12):continue
            for w in words:
                if concat_normalized(w[0]).replace("ـ","")==token:
                    page=int(w[1])-1
                    rect=fitz.Rect(*w[2:6])
                    doc[page].draw_rect(rect,fill=(0.64,0.86,0.72),
                        fill_opacity=0.25,color=(0.17,0.55,0.39),width=0.8)
                    found.setdefault(token,[]).append((page+1,tuple(w[2:6])))
                    break
            if token in found:break
    output=out_dir/(name+"-real-page-highlight-proof.pdf")
    doc.save(output)
    doc.close()
    return {"pdf":output.name,"matched":found}

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--modes",nargs="+",default=["arabic","arabic-vowelled"],
        choices=["arabic","arabic-vowelled"])
    ap.add_argument("--output-dir",type=Path,default=ROOT/"qa"/"arabic-pango-probe")
    args=ap.parse_args()
    args.output_dir.mkdir(parents=True,exist_ok=True)
    base=json.loads((ROOT/"editions"/"manifest.json").read_text())
    original=print_editions.HTML
    deactivate=Layout.deactivate
    results=[]
    try:
        print_editions.HTML=CapturedHTML
        # Layout normally disposes its Pango object after rendering. Retain
        # it ONLY during this read-only probe so the original shaping engine
        # reports the glyph-cluster rectangles; this does not alter DOM/layout.
        Layout.deactivate=lambda self:None
        for mode in args.modes:
            for titles in (False,True):
                filename=f"daruri-reading-{mode}-titles-{'on' if titles else 'off'}.pdf"
                rel=Path("reading")/filename
                approved=ROOT/"editions"/rel
                row=next(x for x in base["files"] if x["file"]==rel.as_posix())
                assert hashlib.sha256(approved.read_bytes()).hexdigest()==row["sha256"]
                with TemporaryDirectory() as tmp:
                    rebuilt=Path(tmp)/filename
                    CapturedHTML.document=None
                    print_editions.build(mode,range(1,259),"full",
                        "Complete reading text",rebuilt,editorial_titles=titles)
                    layout=CapturedHTML.document
                    if layout is None:raise RuntimeError("Missing captured layout")
                    groups=original_word_groups(layout)
                    expected=[(int(s["id"]),i,s["segments"][print_editions.MODES[mode]["ar"]])
                        for s in print_editions.BOOK["sections"] if str(s.get("id","")).isdigit()
                        for i in range(len(s["segments"]))]
                    if len(groups)!=len(expected):
                        raise RuntimeError(f"{mode}: source paragraph count {len(groups)} != {len(expected)}")
                    matched=OrderedDict()
                    for (section,segment,source),group in zip(expected,groups):
                        actual=concat_normalized("".join(group["chunks"]))
                        target=concat_normalized(source)
                        if actual!=target:
                            raise RuntimeError(f"{mode} §{section}, seg{segment}: Pango text does not match authoritative source; got {actual[:80]!r}, expected {target[:80]!r}")
                        key=(section,segment)
                        matched[key]=group["words"]
                    with fitz.open(approved) as published,fitz.open(rebuilt) as raw:
                        pixels,agree=page_images_equal(published,raw)
                        count=sum(len(words) for words in matched.values())
                        report={"file":rel.as_posix(),"same_pages":len(raw)==len(published),
                            "page_count":len(published),"pixel_parity":pixels,
                            "pixel_identical_pages":agree,"source_segments":len(matched),
                            "source_words_measured":count,
                            "source_text_exact":True,
                            "safe_for_published_pdf":pixels,
                            "sample_words":{"11:0":matched.get((11,0),[])[:12]}}
                        results.append(report)
                        print("MODE",mode,"editorial",titles,"PARITY",pixels,
                            "pages",agree,"/",len(published),
                            "source segments",len(matched),"word boxes",count,flush=True)
                        if pixels:
                            sample=make_proof(filename,approved,matched,args.output_dir)
                            report["overlay"]=sample
    finally:
        print_editions.HTML=original
        Layout.deactivate=deactivate
    out=args.output_dir/"summary.json"
    out.write_text(json.dumps(results,indent=2,ensure_ascii=False)+"\n")
    print("SUMMARY:",json.dumps([{k:v for k,v in row.items()
        if k not in ("sample_words","overlay")} for row in results],ensure_ascii=False),flush=True)
    if not all(x["safe_for_published_pdf"] for x in results):
        raise SystemExit("PDF parity mismatch: do not publish word maps")
    print("PASS: Arabic logical source words and Pango visual boxes match all approved PDF pixels",flush=True)

if __name__=="__main__":main()
