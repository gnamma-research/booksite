#!/usr/bin/env python3
"""READ ONLY: prove source-driven Pango Arabic geometry for Study and Reference.

Build the authoritative HTML without replacing published PDFs, traverse
original data-source-role=segment DOM paragraphs and retain Pango layouts.
Output diagnostics and optionally exact word positions only after every PDF
page is pixel-identical and every Arabic source paragraph agrees.
"""
from __future__ import annotations
import argparse, hashlib, json, re, sys
from collections import OrderedDict, Counter
from pathlib import Path
from tempfile import TemporaryDirectory
import fitz
from weasyprint import HTML as WeasyHTML
from weasyprint.text.line_break import Layout

ROOT=Path(__file__).resolve().parents[1]
BUILD=ROOT/"build"
sys.path.insert(0,str(ROOT/"qa"))
sys.path.insert(0,str(BUILD))
import build_editions
from probe_arabic_pango_layout import word_boxes, page_images_equal, concat_normalized

def walk(node,number,source=None):
    element=getattr(node,"element",None)
    if element is not None and element.get("data-source-role")=="segment":
        if element.get("data-language") in ("ar","vocalized"):
            source=(element.get("data-section-id"),element.get("data-segment-index"),element.get("data-language"))
        else:
            source=None
    if type(node).__name__=="TextBox" and source is not None and node.element_tag=="p":
        # Source note calls are separate <a>/<sup> glyph runs. They do not
        # belong to Ibn Rushd’s authorial Arabic words or their geometry.
        yield source,node,number
    for child in getattr(node,"children",()):
        yield from walk(child,number,source)

def collect(doc):
    result=OrderedDict()
    for page_no,page in enumerate(doc.pages,1):
        for source,box,n in walk(page._page_box,page_no):
            key=":".join(source)
            if key not in result:
                result[key]={"text":[],"words":[],"fragment_types":[]}
            result[key]["text"].append(box.text)
            result[key]["fragment_types"].append(str(box.element_tag))
            result[key]["words"].extend(word_boxes(box,n))
    return result

def run_one(edition,editorial,outdir,emit=False):
    approved_name=("daruri.pdf" if edition=="scholarly" else
                   f"editions/study/daruri-study-bilingual-titles-{'on' if editorial else 'off'}.pdf")
    target=ROOT/approved_name
    sha=hashlib.sha256(target.read_bytes()).hexdigest()
    reference=(json.loads((ROOT/"pdf-editions-manifest.json").read_text())["files"]["daruri.pdf"]
               if edition=="scholarly" else
               next(r for r in json.loads((ROOT/"editions/manifest.json").read_text())["files"]
                    if r["file"]==approved_name.removeprefix("editions/")))
    assert sha==reference["sha256"],"Published PDF SHA mismatch"
    with TemporaryDirectory() as tmp:
        path=Path(tmp)
        meta=build_editions.build(edition,path,editorial_titles=editorial)
        generated=path/meta["filename"]
        html=path/(meta["filename"]+".html")
        assert html.exists(),f"Cannot inspect final source HTML: {html}"
        doc=WeasyHTML(filename=str(html),base_url=str(BUILD)).render()
        groups=collect(doc)
        source=build_editions.read_book()
        expected={
            f'{s["id"]}:{idx}:vocalized':str(segment["vocalized"])
            for s in source["sections"] if str(s.get("id","")).isdigit()
            for idx,segment in enumerate(s["segments"])
        }
        same={}
        unknown=[]
        for key,x in groups.items():
            text=concat_normalized("".join(x["text"]))
            exp=concat_normalized(expected.get(key,""))
            # The authorial source can be interleaved with separate footnote
            # call numbers and references; report exact and contained separately.
            if key not in expected:unknown.append(key)
            same[key]=text==exp
        with fitz.open(target) as original,fitz.open(generated) as rebuilt:
            parity,matched_pages=page_images_equal(original,rebuilt)
            pages=(len(original),len(rebuilt))
        report={
            "edition":edition,"editorial":editorial,"pages":pages,
            "pixel_identical":parity,"identical_pages":matched_pages,
            "group_count":len(groups),"expected_segments":len(expected),
            "exact_source_paragraphs":sum(same.values()),
            "contained_source_paragraphs":sum(
                concat_normalized(expected[k]) in concat_normalized("".join(v["text"]))
                for k,v in groups.items() if k in expected),
            "unknown_keys":unknown[:20],
            "source_sample":{k:{"source":expected.get(k,"")[:120],
                "layout":"".join(v["text"])[:140],
                "box_count":len(v["words"]),"types":list(dict.fromkeys(v["fragment_types"]))[:10]}
                for k,v in list(groups.items())[:5]},
            "words_recorded":sum(len(v["words"]) for v in groups.values())
        }
        print("STUDY_REFERENCE_PROBE",json.dumps(report,ensure_ascii=False),flush=True)
        if emit and parity and len(groups)==len(expected) and all(same.values()):
            form="vocalized"
            result={k:v["words"] for k,v in groups.items()}
            (outdir/(edition+("-editorial" if editorial else "")+".words.json")).write_text(
                json.dumps({"file":approved_name,"sha256":sha,"segments":result,
                    "pixel_parity":True,"source_segments":len(groups)},ensure_ascii=False))
        return report

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--edition",choices=["study","scholarly","all"],default="all")
    p.add_argument("--emit-wordmaps",action="store_true")
    args=p.parse_args()
    out=ROOT/"qa"/"study-reference-pango-report"
    out.mkdir(exist_ok=True)
    old=Layout.deactivate
    Layout.deactivate=lambda self:None
    try:
        cases=([("study",False),("study",True)] if args.edition in ("study","all") else [])
        if args.edition in ("scholarly","all"):cases.append(("scholarly",False))
        reports=[run_one(e,t,out,emit=args.emit_wordmaps) for e,t in cases]
    finally:
        Layout.deactivate=old
    (out/"summary.json").write_text(json.dumps(reports,ensure_ascii=False,indent=2))
    good=all(r["pixel_identical"] and r["exact_source_paragraphs"]==r["expected_segments"]
             for r in reports)
    print("STUDY_REFERENCE_CERTIFIABLE",good,flush=True)
    # Don't fail exploratory diagnostics: strict map generation requires all
    # conditions; no unsafe output is published.
    if args.emit_wordmaps and not good:raise SystemExit("Study/Reference source or pixel parity unverified")

if __name__=="__main__":main()
