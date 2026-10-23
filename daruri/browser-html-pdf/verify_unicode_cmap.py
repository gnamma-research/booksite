#!/usr/bin/env python3
"""Audit native Arabic Unicode and font-resource bloat in actual browser PDFs.

READ ONLY and NONRELEASE. Distinguish:
  1. a PDF that merely has a real Type0 Arabic font and /ToUnicode;
  2. a PDF whose source Unicode/harakat are recoverable in the correct order;
  3. a PDF with a clean single authorial text layer suitable for copy/search.

qpdf and MuPDF syntax pass do NOT imply conditions (2) and (3). This audit is
a deliberately reproducible root-cause report, not a bypass for release gates.
"""
from __future__ import annotations
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import re
import unicodedata

import fitz

def sha(data):
    return hashlib.sha256(data).hexdigest()

def clean(text):
    return "".join(c for c in unicodedata.normalize("NFKD",str(text))
                   if unicodedata.category(c)[0] in "LN").casefold()

def unicode_maps(doc):
    unique={}
    fontpages={}
    for p in doc:
        found=p.get_fonts(full=True)
        counts=Counter(x[0] for x in found)
        fontpages[p.number+1]={
          "resource_font_aliases":len(found),
          "unique_font_xrefs":len(counts),
          "most_repeated_aliases":[{"xref":xr,"aliases":num}
                                   for xr,num in counts.most_common(4)]
        }
        for xref in counts:
            if xref in unique:continue
            spec=doc.xref_object(xref)
            name=re.search(r"/BaseFont\s*/([A-Za-z0-9\-]+)",spec)
            ref=re.search(r"/ToUnicode\s+(\d+)\s+0\s+R",spec)
            if not ref:continue
            raw=doc.xref_stream(int(ref.group(1)))
            entries=re.findall(rb"<([A-Fa-f0-9]{4})>\s*<([A-Fa-f0-9]*)>",raw)
            decoded=[]
            for cid,ustr in entries:
                if not ustr or len(ustr)%4:continue
                try:
                    letters=bytes.fromhex(ustr.decode("ascii")).decode("utf-16be")
                except UnicodeError:continue
                decoded.append(letters)
            # Arabic shaping may assign glyph-level codes to presentation
            # forms and drop component-codepoints; the mapping is NOT
            # automatically the original logical Arabic text.
            malformed=sum(not u for u in decoded)
            presentation=sum(any(0xFB50<=ord(c)<=0xFDFF or
                                 0xFE70<=ord(c)<=0xFEFF for c in u)
                             for u in decoded)
            non_arabic=sum(bool(u) and all(not(0x600<=ord(c)<=0x8ff)
                             for c in u) for u in decoded)
            unique[xref]={
              "base_font":name.group(1) if name else "unknown",
              "ToUnicode_xref":int(ref.group(1)),
              "cmap_stream_sha256":sha(raw),
              "cmap_pairs_parsed":len(entries),
              "decoded_entries":len(decoded),
              "arabic_presentation_form_entries":presentation,
              "non_arabic_entries":non_arabic,
              "mapping_proves_original_authorial_text":False,
              "note":"Font-level CMaps cannot establish text-run reading order."
            }
    return fontpages,unique

def audit(pdf_path,fixture_path,evidence_path,report_path):
    source=json.loads(fixture_path.read_text("utf8"))
    if source.get("authorial_sections")!=258 or source.get("authorial_passages")!=414:
        raise ValueError("Not the canonical Daruri text fixture")
    evidence=json.loads(evidence_path.read_text("utf8"))
    variant=evidence.get("status",{}).get("unicode_semantic_qa_only",False)
    entries=[(s["id"],p) for s in source["sample_sections"] for p in s["segments"]]
    if len(entries)!=11:raise ValueError("Expected exactly 11 source passages")
    with fitz.open(pdf_path) as pdf:
        fontpages,fontmaps=unicode_maps(pdf)
        queries=[]
        fulltext=[p.get_text(sort=False) for p in pdf]
        for section,row in entries:
            phrase=" ".join(row["arabic"].split()[:2])
            matches=[(pg.number+1,len(pg.search_for(phrase)))
                     for pg in pdf if pg.search_for(phrase)]
            first5=clean("".join(row["arabic"].split()[:5]))
            extracts=[pg+1 for pg,text in enumerate(fulltext) if first5 in clean(text)]
            queries.append({
              "id":row["id"],"section":section,
              "phrase":phrase,"exact_native_search":bool(matches),
              "matching_pages":[x[0] for x in matches],
              "five_words_extracted_in_order":bool(extracts)
            })
        fault=[x for x in queries if not x["exact_native_search"]]
        report={
          "schema":"daruri-browser-arabic-font-root-audit-v1",
          "pdf_sha256":sha(pdf_path.read_bytes()),
          "reparsed_pdf_pages":len(pdf),
          "fully_browser_generated_from_html":True,
          "no_prebuilt_pdf_render_inputs":True,
          "experimental_actualtext_variant":bool(variant),
          "native_arabic_queries_total":11,
          "native_arabic_queries_found":len(queries)-len(fault),
          "source_passages_failing_native_search":fault,
          "section65_note_phrase_searchable":any(
             x["section"]==65 and x["phrase"].startswith("وَفِي") and
             x["exact_native_search"] for x in queries
          ),
          "font_resource_aliases_by_page":fontpages,
          "font_cmap_mappings_by_object":fontmaps,
          "authorial_clipboard_single_text_layer_proven":False,
          "original_arabic_text_sequence_certified":False,
          "release_approved":False
        }
    report_path.parent.mkdir(parents=True,exist_ok=True)
    report_path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n","utf8")
    print("BROWSER_ARABIC_FONT_MAPPING_ROOT_CAUSE",json.dumps({
        "variant":variant,
        "source_phrases_found":report["native_arabic_queries_found"],
        "section65_search":report["section65_note_phrase_searchable"],
        "font_aliases_page_1":fontpages.get(1),
        "cmap_font_count":len(fontmaps),
        "source_passage_failures":[x["id"] for x in fault],
        "release_approved":False
    },ensure_ascii=False),flush=True)
    return report

if __name__=="__main__":
    ap=argparse.ArgumentParser()
    ap.add_argument("--pdf",type=Path,required=True)
    ap.add_argument("--fixture",type=Path,required=True)
    ap.add_argument("--browser-evidence",type=Path,required=True)
    ap.add_argument("--report",type=Path,required=True)
    args=ap.parse_args()
    audit(args.pdf,args.fixture,args.browser_evidence,args.report)
