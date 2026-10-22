#!/usr/bin/env python3
"""NON-RELEASE independent QA for temporary Daruri Arabic character overlays.

Build success alone is not acceptance.  Report 414 source passages in MuPDF,
Poppler, native MuPDF search/highlight source positions, sampled text copy,
visual pixel parity, original hyperlinks, named section anchors and outlines.
Never changes candidate or original PDFs.
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess

import fitz

from verify_original_char_unicode import normalize, check_link_equivalence


def check(baseline, candidate, mapping, output):
    mapdata=json.loads(mapping.read_text(encoding="utf-8"))
    sha=hashlib.sha256(baseline.read_bytes()).hexdigest()
    if mapdata["source_sha256"] != sha:
        raise AssertionError("Pango source SHA mismatch: refusing unrelated PDF/map")
    keys=[k for k in mapdata["segments"] if k.endswith((":ar",":vocalized"))]
    if mapdata.get("section_count") != 258 or len(keys) != 414:
        raise AssertionError("Unexpected number of authorial Arabic sections")
    report={"version":"char-source-414-matrix-v1","diagnostic_only":True,
            "release_approved":False,
            "files":{"source":str(baseline),"candidate":str(candidate),
                     "map":str(mapping),"baseline_sha256":sha},
            "tests":{},"bad_samples":{}}
    with fitz.open(baseline) as a, fitz.open(candidate) as b:
        if len(a) != len(b):
            raise AssertionError("Changed page count")
        same_pixels=0
        equal_links=0
        for x,y in zip(a,b):
            same_pixels += x.get_pixmap(alpha=False).samples==y.get_pixmap(alpha=False).samples
            equal_links += check_link_equivalence(x,y)
        names_a=a.resolve_names()
        names_b=b.resolve_names()
        valid_section_anchors=sum(
            names_a.get(f"section-{i}") == names_b.get(f"section-{i}") and
            names_a.get(f"section-{i}") is not None
            for i in range(1,259))
        report["tests"].update({
            "pages":len(a),
            "pixel_identical":same_pixels,
            "semantic_link_pages_equal":equal_links,
            "source_section_anchors_equal":valid_section_anchors,
            "outlines_equal":a.get_toc()==b.get_toc(),
        })
        extracted=[normalize(p.get_text(sort=False)) for p in b]
        page_cache={}
        extracted_total=single_hit=pair_hit=quad_hit=pair_at_source=0
        misses=[]
        samples=[]
        items=[(k,mapdata["segments"][k]) for k in keys]
        for idx,(key,words) in enumerate(items):
            first_page=int(words[0][1])
            src=[v for v in words if int(v[1]) == first_page]
            first=[v[0] for v in src[:5]]
            page=b[first_page-1]
            authorial=normalize("".join(first))
            match=authorial in extracted[first_page-1]
            extracted_total+=match
            if first:
                single_hit+=bool(page.search_for(first[0]))
            if len(first)>=2:
                hits=page.search_for(" ".join(first[:2]))
                pair_hit+=bool(hits)
                box=fitz.Rect(src[0][2:6])
                box.include_rect(fitz.Rect(src[1][2:6]))
                pair_at_source+=bool(hits and any(fitz.Rect(h).intersects(box) for h in hits))
            if first:
                quad_hit+=bool(page.search_for(" ".join(first[:4])))
            if (not match or (first and not page.search_for(" ".join(first[:4])))) and len(misses)<25:
                misses.append({"segment":key,"page":first_page,"phrase":" ".join(first[:4]),
                               "extract_found":bool(match)})
            if idx % 24==0:
                box=fitz.Rect(src[0][2:6])
                for w in src[1:3]:
                    box.include_rect(fitz.Rect(w[2:6]))
                t=page.get_textbox(box)
                old=a[first_page-1].get_textbox(box)
                samples.append({"segment":key,"text":t[:160],
                                "old_has_replacement":"\ufffd" in old,
                                "candidate_has_replacement":"\ufffd" in t,
                                "target_found":normalize("".join(v[0] for v in src[:3])) in normalize(t)})
        report["tests"].update({
            "source_segments":len(keys),"pymupdf_extracted_source":extracted_total,
            "pymupdf_native_single_words":single_hit,
            "pymupdf_native_two_word_phrases":pair_hit,
            "pymupdf_native_up_to_four_word_phrases":quad_hit,
            "pymupdf_pair_search_source_position":pair_at_source,
            "copy_regions_checked":len(samples),
            "copy_regions_clean":sum(s["target_found"] and not s["candidate_has_replacement"] for s in samples),
            "baseline_regions_garbled":sum(s["old_has_replacement"] for s in samples)
        })
        report["bad_samples"]["pymupdf"] = misses
        report["bad_samples"]["copy"]=[s for s in samples if s["candidate_has_replacement"] or not s["target_found"]][:25]

    poppler=subprocess.check_output(["pdftotext",str(candidate),"-"],timeout=160).decode("utf8","replace")
    poppages=[normalize(x) for x in poppler.split("\f")]
    recover=0
    bad=[]
    for key,words in items:
        pg=int(words[0][1])
        w=[v[0] for v in words if int(v[1])==pg][:5]
        match=pg<=len(poppages) and normalize("".join(w)) in poppages[pg-1]
        recover += match
        if not match and len(bad)<25:bad.append({"segment":key,"page":pg,"phrase":" ".join(w[:4])})
    report["tests"]["poppler_extracted_source"]=recover
    report["bad_samples"]["poppler"]=bad
    output.parent.mkdir(parents=True,exist_ok=True)
    output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("ARABIC_MATRIX",json.dumps(report["tests"],ensure_ascii=False),flush=True)
    # Exploratory matrix always reports exact failure counts and never approves
    # the release.  Reject destructive integrity regressions immediately.
    assert same_pixels==equal_links==report["tests"]["pages"] and valid_section_anchors==258
    return report


if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--source",type=Path,required=True)
    p.add_argument("--candidate",type=Path,required=True)
    p.add_argument("--map",type=Path,required=True)
    p.add_argument("--report",type=Path,required=True)
    args=p.parse_args()
    check(args.source,args.candidate,args.map,args.report)
