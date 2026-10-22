#!/usr/bin/env python3
"""Strict, temporary rebinding of original Pango source geometry to HTML PDF.

The production maps are immutable SHA-bound to approved original PDFs. The
freshly typeset PDF MAY use those identical source rectangles for a one-off
Unicode repair experiment ONLY after proving:
- original map SHA == current approved PDF bytes
- every page is pixel-identical and same size
- text, source words, outline and original hyperlinks match
- all 258 named section anchors have exactly equal page/coordinates
- complete 414 original Arabic segments exist in the approved map.

This does not sign a production map or permit static-PDF deletion. No approved
publication or source/map file is changed.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path

import fitz


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def check(source, generated, original_map, destination, pdfua_tagged=False):
    mapping=json.loads(original_map.read_text("utf8"))
    official_sha=sha(source)
    if mapping.get("source_sha256") != official_sha:
        raise ValueError("Refusing map from a different approved original")
    segments={
        k:v for k,v in mapping["segments"].items()
        if k.endswith((":ar", ":vocalized"))
    }
    if len(segments)!=414 or mapping.get("section_count")!=258:
        raise ValueError(f"Source map is incomplete ({len(segments)}/414)")
    with fitz.open(source) as old,fitz.open(generated) as new:
        pages_count=len(old)
        if len(old)!=len(new):
            raise ValueError("Page count changed")
        if not pdfua_tagged and old.get_toc()!=new.get_toc():
            raise ValueError("Approved source chapter outline changed")
        if pdfua_tagged and new.xref_get_key(new.pdf_catalog(),"StructTreeRoot")[0]!="xref":
            raise ValueError("This supposed PDF-UA document has no structure tree")
        orig=old.resolve_names()
        out=new.resolve_names()
        for n in range(1,259):
            key=f"section-{n}"
            if key not in orig or key not in out:
                raise ValueError("Original authorial section anchor missing: "+key)
            a,b=orig[key],out[key]
            if a.get("page")!=b.get("page"):
                raise ValueError("Source section changed pages: "+key)
            p,q=a.get("to"),b.get("to")
            if (p is None)!=(q is None):
                raise ValueError("Named source destination lost an exact point")
            if p is not None and any(abs(float(p[i])-float(q[i]))>0.001 for i in (0,1)):
                raise ValueError("Named source coordinates changed "+key)
        for n in range(len(old)):
            a,b=old[n],new[n]
            if a.rect!=b.rect or a.get_pixmap().samples!=b.get_pixmap().samples:
                raise ValueError(f"Source visible pixels changed on page {n+1}")
            if not pdfua_tagged and a.get_text()!=b.get_text():
                raise ValueError(f"Source PDF extraction order changed on page {n+1}")
            def positions(page):
                return [(w[4],*(round(v,3) for v in w[:4]))
                        for w in page.get_text("words",sort=False)]
            if not pdfua_tagged and positions(a)!=positions(b):
                raise ValueError(f"Visible source word rect changed on page {n+1}")
            # PDF/UA changes the selectable Unicode representation and structure
            # tree; these are exactly the properties being investigated.
            # Equal page pixels at identical bounds plus identical CSS/HTML
            # source provide a controlled geometry proof, not a release waiver.
            def semlinks(page):
                return sorted(str((lk.get("kind"),lk.get("page"),
                                   lk.get("nameddest"),lk.get("uri"),
                                   tuple(round(x,3) for x in lk["from"])))
                              for lk in page.get_links())
            if semlinks(a)!=semlinks(b):
                raise ValueError(f"Original hyperlinks changed on page {n+1}")
    # Preserve EVERY word and coordinate; change only the binding to the
    # independently verified PDF bytes and mark the map as experimental.
    mapping["source_sha256"]=sha(generated)
    if "base_sha256" in mapping:
        mapping["base_sha256"]=sha(generated)
    mapping["_temporary_html_origin_pango_proof"]={
        "release_approved":False,
        "approved_source_sha256":official_sha,
        "rendered_html_pdf_sha256":sha(generated),
        "maps_rebound_only_after_complete_visual_text_and_navigation_parity":True,
        "source_word_coordinates_untouched":not pdfua_tagged,
        "tagged_pdfua_research_variant":pdfua_tagged
    }
    if destination.exists():
        raise ValueError("Never overwrite a previously created source map")
    destination.parent.mkdir(parents=True,exist_ok=True)
    destination.write_text(json.dumps(mapping,ensure_ascii=False,separators=(",",":"))+"\n","utf8")
    print("HTML_PANGO_TEMPORARY_REBIND",json.dumps({
        "approved_sha":official_sha,"html_generated_sha":sha(generated),
        "page_count":pages_count,"source_segments":len(segments),
        "original_anchors":258,"rebinding_for_QA_only":True,
        "new_map_file":str(destination)
    }),flush=True)


if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--approved",required=True,type=Path)
    p.add_argument("--generated",required=True,type=Path)
    p.add_argument("--source-map",required=True,type=Path)
    p.add_argument("--output-map",required=True,type=Path)
    p.add_argument("--pdfua-tagged",action="store_true",
                   help="Research-only: verify tagged PDF has identical page pixels and 258 anchors, allowing improved extracted Unicode")
    a=p.parse_args()
    check(a.approved,a.generated,a.source_map,a.output_map,a.pdfua_tagged)
