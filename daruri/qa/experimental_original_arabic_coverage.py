#!/usr/bin/env python3
"""Independent phrase-coverage comparison for experimental Daruri source PDFs.

Pure QA; makes no edits to any PDF. Uses verified Pango map solely as truth
for source phrase and page. Does NOT infer full copy/paste or native viewer
compatibility from normalized PyMuPDF/Poppler coverage.
"""
from pathlib import Path
from collections import defaultdict
import argparse, json, fitz, subprocess, unicodedata

def clean(s):
    return "".join(c.casefold() for c in unicodedata.normalize("NFKD",str(s))
                   if unicodedata.category(c)[0] in ("L","N") and not unicodedata.combining(c))

def word_probes(m):
    for key,words in m["segments"].items():
        if not key.endswith((":ar",":vocalized")):continue
        page=int(words[0][1])
        seq=[x[0] for x in words if int(x[1])==page][:5]
        if len(seq)<3:continue
        yield key,page," ".join(seq)

def poppler_pages(path):
    s=subprocess.check_output(["pdftotext",str(path),"-"],timeout=120).decode("utf-8","replace")
    return [clean(x) for x in s.split("\f")]

def run(original,candidate,mapping):
    m=json.loads(Path(mapping).read_text(encoding="utf-8"))
    first=list(word_probes(m))
    with fitz.open(original) as baseline,fitz.open(candidate) as updated:
        if len(baseline)!=len(updated):raise ValueError("Page number changed")
        old=[clean(p.get_text(sort=False)) for p in baseline]
        new=[clean(p.get_text(sort=False)) for p in updated]
        old_pop=poppler_pages(original)
        new_pop=poppler_pages(candidate)
        methods={"pymupdf_baseline":old,"pymupdf_candidate":new,
                 "poppler_baseline":old_pop,"poppler_candidate":new_pop}
        result={"segment_probes":len(first),"release_approved":False,"methods":{}}
        for name,pages in methods.items():
            hits=0;failures=[]
            for key,pageno,text in first:
                target=clean(text)
                if pageno<=len(pages) and target in pages[pageno-1]:hits+=1
                else:failures.append(key)
            result["methods"][name]={"matched":hits,"failed":len(failures),
                                    "first_failures":failures[:16]}
        result["meaning"]="Probe substring recovery only; exact native search UI and word highlighting require separate tests"
        print(json.dumps(result,ensure_ascii=False,indent=2))
        return result

if __name__=="__main__":
    ap=argparse.ArgumentParser()
    ap.add_argument("--original",required=True)
    ap.add_argument("--candidate",required=True)
    ap.add_argument("--map",required=True)
    ap.add_argument("--report")
    args=ap.parse_args()
    results=run(args.original,args.candidate,args.map)
    if args.report:Path(args.report).write_text(json.dumps(results,indent=2,ensure_ascii=False)+"\n")
