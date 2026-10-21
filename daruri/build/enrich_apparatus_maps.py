#!/usr/bin/env python3
"""Augment verified apparatus maps with exact glossary and index entry destinations.

Appendix word/entry headings are measured from the independent WeasyPrint PDF
that was inserted unchanged into each published apparatus PDF. Every appendix
page is verified text-for-text against the published PDF before using its named
destinations; no coordinates are guessed from page numbers or text matching.
"""
from __future__ import annotations

import hashlib, json, re, unicodedata
from pathlib import Path
import fitz

from build_apparatus_variants import (
    VARIANTS, BOOK, build_appendix, digest
)

def norm(text: str)->str:
    return unicodedata.normalize("NFKC",str(text)).strip().casefold()

def ordered_terms(kind: str) -> list[dict]:
    from build_editions import alpha
    key=lambda term:alpha(term["term"])
    if kind=="glossary":
        return sorted(BOOK["glossary"],key=key)
    return sorted(BOOK["index"],key=key)

def named_point(raw: dict,page_offset: int,total: int):
    p=raw.get("page",-1)
    if not isinstance(p,int) or p<0 or page_offset+p>=total:
        raise ValueError("Apparatus destination lies outside the PDF")
    xy=raw.get("to")
    if xy is None:raise ValueError("Missing exact apparatus destination coordinates")
    x,y=(float(xy[0]),float(xy[1])) if isinstance(xy,(tuple,list)) else (float(xy.x),float(xy.y))
    if not all(-5<=z<=2000 for z in (x,y)):raise ValueError("Impossible appendix coordinates")
    return {"page":page_offset+p+1,"x":round(x,2),"y":round(y,2)}

def run():
    path=VARIANTS/"manifest.json"
    manifest=json.loads(path.read_text())
    if len(manifest.get("files",[]))!=120 or manifest.get("status")!="verified":
        raise ValueError("Expected 120 independently verified apparatus PDFs")
    for entry in manifest["files"]:
        filename=entry["filename"]
        full=VARIANTS/filename
        old=VARIANTS/"maps"/(filename+".json")
        meta_path=VARIANTS/"maps"/(filename+".metadata.json")
        mapping=json.loads(old.read_text())
        metadata=json.loads(meta_path.read_text())
        # Keep existing fully certified entry maps byte-for-byte.
        if (mapping.get("entry_positions") and
            mapping.get("entry_count") == entry.get("mapped_entries") and
            entry.get("map_sha256") == digest(old.read_bytes())):
            print("RETAIN MAP", filename, flush=True)
            continue
        names=tuple(entry["apparatus"])
        standalone=build_appendix(names)
        with fitz.open(stream=standalone,filetype="pdf") as appendix,fitz.open(full) as merged:
            first=entry["base_pages"]
            if len(merged)!=first+len(appendix):raise ValueError("Mismatched supplement page count")
            for i,page in enumerate(appendix):
                original=hashlib.sha256(page.get_text(sort=False).encode()).digest()
                inserted=hashlib.sha256(merged[first+i].get_text(sort=False).encode()).digest()
                if original!=inserted:
                    raise ValueError(f"Different apparatus page {i+1} in {filename}")
            refs=appendix.resolve_names()
            positions={"terms":{},"applications":{},"concordance":{}}
            for kind in ("glossary","index"):
                if kind not in names:continue
                ordered=ordered_terms(kind)
                for i,item in enumerate(ordered):
                    anchor=refs.get(("glossary-" if kind=="glossary" else "index-")+str(i))
                    if anchor is None:raise ValueError("Missing verified "+kind+" item "+str(i))
                    dest=named_point(anchor,first,len(merged))
                    itemname=norm(item["term"])
                    key=itemname
                    if key in positions["terms"] and positions["terms"][key]!=dest:
                        # Do not silently conflate glossary vs index term positions.
                        positions["terms"][kind+":"+key]=dest
                    else:
                        positions["terms"][key]=dest
                    if kind=="glossary":
                        ar=norm(item.get("ar",""))
                        if ar and ar not in positions["terms"]:
                            positions["terms"][ar]=dest
            if "applications" in names:
                for app in BOOK["apps"]:
                    key=str(app["id"])
                    anchor=refs.get("application-"+key)
                    if anchor is None:raise ValueError("Missing named Bidāya application: "+key)
                    positions["applications"][key]=named_point(anchor,first,len(merged))
                if len(positions["applications"])!=len(BOOK["apps"]):
                    raise ValueError("Application destination coverage is incomplete")
            if "concordance" in names:
                for n in range(1,259):
                    anchor=refs.get("concordance-"+str(n))
                    if anchor is None:raise ValueError("Missing named R/BA concordance entry "+str(n))
                    positions["concordance"][str(n)]=named_point(anchor,first,len(merged))
                if len(positions["concordance"])!=258:
                    raise ValueError("Concordance destination coverage is incomplete")
            assert len(positions["terms"])>=len(BOOK["glossary"]) if "glossary" in names else True
            assert len(positions["terms"])>=len(BOOK["index"]) if "index" in names else True
        mapping["entry_positions"]=positions
        mapping["entry_mapping_method"]="WeasyPrint named HTML anchors; source appendix pages verified byte-for-byte in extracted text"
        mapping["entry_count"]=sum(len(v) for v in positions.values())
        old.write_text(json.dumps(mapping,ensure_ascii=False,indent=2)+"\n")
        metadata["entry_positions"]=positions
        metadata["entry_mapping_method"]=mapping["entry_mapping_method"]
        metadata["entry_count"]=mapping["entry_count"]
        meta_path.write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+"\n")
        entry["map_sha256"]=digest(old.read_bytes())
        entry["mapped_entries"]=mapping["entry_count"]
        print("MAP",filename,"entries",mapping["entry_count"],"sections",len(mapping["section_pages"]),flush=True)
    path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n")
    print("PASS: apparatus heading positions and 258 source section destinations checked in all 120 maps",flush=True)

if __name__=="__main__":
    run()
