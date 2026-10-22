#!/usr/bin/env python3
"""Build a temporary, content-addressed source map for an HTML-generated A4 PDF.

Strict research bridge ONLY. The old approved PDFs are read solely to prove
pixel/text/word/outline/link/258-anchor equivalence. The actual new PDF was
independently rendered from canonical HTML, not copied from the approved PDF.

This binds publisher-note geometry, bookmarks and per-source word positions to
the exact new PDF byte hash. No approved PDF, page map or official manifest is
ever overwritten or updated. For production, sign output against a frozen
trusted typesetting-source manifest and accepted baseline, not arbitrary bytes.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path

import fitz

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def simplelinks(page):
    out=[]
    for row in page.get_links():
        target=row.get("to")
        out.append((
          row.get("kind"),row.get("page"),row.get("nameddest"),row.get("uri"),
          tuple(round(float(x),3) for x in row["from"]),
          tuple(round(float(x),3) for x in target) if target is not None else None
        ))
    return sorted(out,key=repr)

def exact_geometry(original,generated):
    with fitz.open(original) as gold,fitz.open(generated) as html:
        if gold.page_count!=html.page_count:
            raise ValueError("Original source page count differs from HTML renderer")
        if gold.get_toc()!=html.get_toc():
            raise ValueError("Original source hierarchy/bookmark tree differs")
        a,b=gold.resolve_names(),html.resolve_names()
        for number in range(1,259):
            key=f"section-{number}"
            if key not in a or key not in b:
                raise ValueError("Missing original section destination: "+key)
            x,y=a[key],b[key]
            if x.get("page")!=y.get("page"):
                raise ValueError("HTML source anchor changed page "+key)
            ax,ay=x.get("to"),y.get("to")
            if (ax is None)!=(ay is None):
                raise ValueError("Missing source anchor position "+key)
            if ax is not None and any(abs(float(ax[i])-float(ay[i]))>0.001 for i in range(2)):
                raise ValueError("Moved source section anchor "+key)
        for index,(old,new) in enumerate(zip(gold,html),1):
            if old.rect!=new.rect or old.get_pixmap(alpha=False).samples!=new.get_pixmap(alpha=False).samples:
                raise ValueError(f"Source visible typography changed on page {index}")
            if old.get_text(sort=False)!=new.get_text(sort=False):
                raise ValueError(f"Source English/Arabic text order changed on page {index}")
            def words(page):
                return [(w[4],*(round(float(x),3) for x in w[:4]))
                        for w in page.get_text("words",sort=False)]
            if words(old)!=words(new):
                raise ValueError(f"Original source word coordinates changed on page {index}")
            if simplelinks(old)!=simplelinks(new):
                raise ValueError(f"Original publisher source-note links changed on page {index}")
        return {"pages":gold.page_count,"section_destinations":258,
                "pixels_exact":True,"extractable_words_exact":True,
                "notes_bookmarks_and_links_exact":True}

def rebind(approved_pdf,approved_map,new_pdf,new_map,approved_manifest):
    approved_sha=sha(approved_pdf)
    old=json.loads(approved_map.read_text(encoding="utf-8"))
    if old.get("source_sha256")!=approved_sha or old.get("base_sha256")!=approved_sha:
        raise ValueError("Map was generated for a different approved source PDF")
    manifest=json.loads(approved_manifest.read_text(encoding="utf-8"))
    record=next((x for x in manifest["files"] if x["file"]==approved_pdf.relative_to(approved_manifest.parent).as_posix()),None)
    if not record or record["sha256"]!=approved_sha or record["bytes"]!=approved_pdf.stat().st_size:
        raise ValueError("Approved PDF is not signed by the 12-design manifest")
    geometry=exact_geometry(approved_pdf,new_pdf)
    if old.get("section_count")!=258 or len(old.get("anchors",{}))!=258:
        raise ValueError("Original source map lost the 258 recorded sections")
    generated_sha=sha(new_pdf)
    old["source_sha256"]=generated_sha
    old["base_sha256"]=generated_sha
    old["filename"]=new_pdf.name
    old["_html_origin_experimental_binding"]={
      "do_not_publish":True,
      "approved_pdf_sha256":approved_sha,
      "rendered_pdf_sha256":generated_sha,
      "authoritative_manifest_sha256":sha(approved_manifest),
      "source_map_sha256":sha(approved_map),
      "proof":geometry,
      "native_arabic_search_certified":False
    }
    if new_map.exists():
        raise ValueError("Refusing to overwrite an existing signed source map")
    new_map.parent.mkdir(parents=True,exist_ok=True)
    new_map.write_text(json.dumps(old,ensure_ascii=False,separators=(",",":"))+"\n","utf8")
    print("HTML_RUNTIME_SOURCE_REBIND",json.dumps({
      "approved":record["file"],"approved_sha256":approved_sha,
      "html_pdf_sha256":generated_sha,
      "runtime_map_sha256":sha(new_map),
      "source_sections":geometry["section_destinations"],
      "page_count":geometry["pages"],
      "original_authorial_arabic_unicode_release_approved":False
    }),flush=True)
    return old

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--approved-pdf",required=True,type=Path)
    parser.add_argument("--approved-map",required=True,type=Path)
    parser.add_argument("--generated-pdf",required=True,type=Path)
    parser.add_argument("--runtime-map",required=True,type=Path)
    parser.add_argument("--approved-manifest",required=True,type=Path)
    args=parser.parse_args()
    rebind(args.approved_pdf,args.approved_map,args.generated_pdf,
           args.runtime_map,args.approved_manifest)
