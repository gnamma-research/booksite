#!/usr/bin/env python3
"""Read-only Pango source-word layout proof for Daruri's bilingual A4 Reading PDFs.

The original two-column HTML <table id=section-N> supplies Arabic <td>s;
we traverse layout boxes with their original DOM ancestry, match their logical
Arabic paragraphs to the authorial source, and measure words via their actual
PangoLayout. No <span> wrapping, glyph-order guesses or PDF modifications.
"""
from __future__ import annotations
from pathlib import Path
from collections import OrderedDict
from tempfile import TemporaryDirectory
import hashlib,json,sys
import fitz
from weasyprint.text.line_break import Layout

HERE=Path(__file__).resolve().parent
ROOT=HERE.parent
BUILD=ROOT/"build"
sys.path.insert(0,str(HERE))
sys.path.insert(0,str(BUILD))
import print_editions
from probe_arabic_pango_layout import (
    CapturedHTML,concat_normalized,word_boxes,page_images_equal,make_proof
)

def walk(node,page_number,section=None,arabic=False):
    tag=getattr(node,"element_tag",None)
    element=getattr(node,"element",None)
    if tag=="table" and element is not None:
        ident=element.get("id") or ""
        if ident.startswith("section-") and ident[8:].isdigit():
            section=int(ident[8:])
    if tag=="td" and element is not None:
        arabic="arabic" in str(element.get("class") or "").split()
    if type(node).__name__=="TextBox" and tag=="p" and section is not None and arabic:
        yield section,id(element),node,page_number
    for child in getattr(node,"children",()):
        yield from walk(child,page_number,section,arabic)

def bilingual_groups(document):
    result=OrderedDict()
    for p,page in enumerate(document.pages,1):
        for n,element_id,box,index in walk(page._page_box,p):
            key=(n,element_id)
            if key not in result:result[key]={"chunks":[],"words":[]}
            result[key]["chunks"].append(box.text)
            result[key]["words"].extend(word_boxes(box,index))
    return result

def main():
    source=json.loads((ROOT/"editions/manifest.json").read_text())
    variants=["bilingual","bilingual-unvowelled"]
    results=[]
    original_html=print_editions.HTML
    orig_deactivate=Layout.deactivate
    try:
        print_editions.HTML=CapturedHTML
        Layout.deactivate=lambda self:None
        for language in variants:
            for editorial in (False,True):
                filename=f"daruri-reading-{language}-titles-{'on' if editorial else 'off'}.pdf"
                rel=Path("reading")/filename
                certified=next(s for s in source["files"] if s["file"]==rel.as_posix())
                published=ROOT/"editions"/rel
                assert hashlib.sha256(published.read_bytes()).hexdigest()==certified["sha256"]
                with TemporaryDirectory() as tmp:
                    target=Path(tmp)/filename
                    CapturedHTML.document=None
                    print_editions.build(language,range(1,259),"full","Complete reading text",target,editorial_titles=editorial)
                    document=CapturedHTML.document
                    if document is None:raise RuntimeError("WeasyPrint did not capture layout")
                    groups=bilingual_groups(document)
                    src=[
                        (int(section["id"]),index,segment[print_editions.MODES[language]["ar"]])
                        for section in print_editions.BOOK["sections"] if str(section.get("id","")).isdigit()
                        for index,segment in enumerate(section["segments"])
                    ]
                    if len(groups)!=len(src):
                        raise RuntimeError(f"Arabic cell groups {len(groups)} != expected {len(src)}")
                    matched=OrderedDict()
                    for (key,group), (n,i,text) in zip(groups.items(),src):
                        number,_=key
                        if number!=n:raise RuntimeError(f"Out-of-order source §{number} != {n}")
                        if concat_normalized("".join(group["chunks"]))!=concat_normalized(text):
                            raise RuntimeError(f"Arabic source segment mismatch in §{n}, segment {i}")
                        matched[(n,i)]=group["words"]
                    with fitz.open(published) as approved,fitz.open(target) as regenerated:
                        parity,pages=page_images_equal(approved,regenerated)
                        count=sum(len(v) for v in matched.values())
                        results.append({"file":rel.as_posix(),"pixel_parity":parity,
                            "page_count":len(approved),"pages_identical":pages,
                            "source_segments":len(matched),"word_rectangles":count})
                        print("BILINGUAL",language,editorial,"PANGO",len(matched),
                              "words",count,"parity",parity,pages,"/",len(approved),flush=True)
                        if not parity:raise RuntimeError("PDF pages not pixel-identical")
                        if len(matched)!=414:raise RuntimeError("Missing Arabic source segments")
    finally:
        print_editions.HTML=original_html
        Layout.deactivate=orig_deactivate
    path=ROOT/"qa"/"arabic-bilingual-probe-summary.json"
    path.write_text(json.dumps(results,ensure_ascii=False,indent=2)+"\n")
    print("PASS",json.dumps(results,ensure_ascii=False),flush=True)

if __name__=="__main__":main()
