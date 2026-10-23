#!/usr/bin/env python3
"""Independent PDF structural and linguistic integrity gate for browser HTML->PDF.

READ ONLY, NONRELEASE. A downloaded PDF must be checked by *native* tools after
a website creates it without print APIs or prebuilt PDFs. PDF header/page count
alone is not enough: broken font/resource dictionaries may render but crash a
native reader. Never call fitz on an untrusted PDF in the controlling process;
the native MuPDF probe runs in a short-lived child process because crashes can
take down CI Python itself.

Existing code's "strict_release_candidate" is a separate publication policy;
this script adds structural/reading-order diagnostics, not a release waiver.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
import unicodedata


def normalized(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFKD", s).casefold()
                   if unicodedata.category(c)[0] in "LN" and
                   not unicodedata.combining(c))


def command(args, timeout: int = 35):
    try:
        r = subprocess.run(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                           timeout=timeout, check=False)
        return {
            "exit_code": r.returncode,
            "stdout": r.stdout.decode("utf-8", "replace")[:3000],
            "stderr": r.stderr.decode("utf-8", "replace")[:3000],
            "stdout_bytes": len(r.stdout),
            "stderr_bytes": len(r.stderr),
            "timed_out": False
        }
    except subprocess.TimeoutExpired as e:
        return {
            "exit_code": None, "stdout": "", "stderr": str(e)[:3000],
            "stdout_bytes": 0, "stderr_bytes": 0, "timed_out": True
        }


def native_mupdf(pdf):
    # In some malformed PDFs, MuPDF itself crashes with SIGSEGV while building
    # page resources. Do not let that terminate the entire QA/release process.
    script = r'''
import fitz,json,sys
path=sys.argv[1]
doc=fitz.open(path)
all_text=[]
font_resources=0
images=0
links=0
for page in doc:
    all_text.append(page.get_text(sort=False))
    images+=len(page.get_images())
    links+=len(page.get_links())
    font_resources+=len(page.get_fonts())
print("GN_NATIVE_MUPDF_PROBE "+json.dumps({
 "pages":len(doc),"text_length":sum(map(len,all_text)),
 "font_resources":font_resources,"images":images,"links":links,
 "first_page_text":all_text[0][:160] if all_text else ""
},ensure_ascii=False))
'''
    row=command([sys.executable,"-c",script,str(pdf)],timeout=45)
    output=row.get("stdout","")
    for line in output.splitlines():
        if "GN_NATIVE_MUPDF_PROBE " in line:
            try: row["parsed"]=json.loads(line.split("GN_NATIVE_MUPDF_PROBE ",1)[1])
            except (ValueError,IndexError): pass
            break
    row["crashed"] = isinstance(row["exit_code"],int) and row["exit_code"]<0
    return row


def pypdf_probe(pdf):
    # Resolve just the first page and the pages tree to detect resource object
    # bloat; avoid reading every font asset in an untrusted document.
    script=r'''
from pypdf import PdfReader
import json,sys
doc=PdfReader(sys.argv[1],strict=False)
page=doc.pages[0]
font=page.get("/Resources",{}).get("/Font",{})
print("GN_PYPDF "+json.dumps({
 "pages":len(doc.pages),"first_page_font_resource_aliases":len(font),
 "unique_font_references":len(set(str(v) for v in font.values())),
 "first_page_text":(page.extract_text() or "")[:180]
},ensure_ascii=False))
'''
    row=command([sys.executable,"-c",script,str(pdf)],timeout=35)
    for line in row.get("stdout","").splitlines():
        if "GN_PYPDF " in line:
            try: row["parsed"]=json.loads(line.split("GN_PYPDF ",1)[1])
            except ValueError: pass
            break
    return row


def measure(pdf: Path, fixture: Path, mode: str):
    data=json.loads(fixture.read_text("utf-8"))
    if data.get("authorial_sections")!=258 or data.get("authorial_passages")!=414:
        raise ValueError("Canonical Daruri sample is incomplete")
    expected=data["full_sections"] if mode=="full" else data["sample_sections"]
    expected_segments=[seg for s in expected for seg in s["segments"]]
    result={
       "schema":"daruri-browser-PDF-structure-and-order-v1",
       "pdf_sha256":hashlib.sha256(pdf.read_bytes()).hexdigest(),
       "pdf_size_bytes":pdf.stat().st_size,
       "pdf_header":pdf.read_bytes()[:5].decode("latin-1"),
       "mode":mode,
       "expected_segments":len(expected_segments),
       "release_approved":False,
       "no_original_PDFs_used_as_reproduction_inputs":True
    }
    result["qpdf"]=command(["qpdf","--check",str(pdf)],timeout=30)
    result["pdfinfo"]=command(["pdfinfo",str(pdf)],timeout=30)
    result["pypdf"]=pypdf_probe(pdf)
    result["mupdf_isolated"]=native_mupdf(pdf)
    # Poppler's default and physical-layout modes are independent signals.
    result["poppler"]={}
    for label,opts in (("default",[]),("layout",["-layout"]),("raw",["-raw"])):
        args=["pdftotext","-enc","UTF-8",*opts,str(pdf),"-"]
        row=command(args,timeout=45)
        text=row["stdout"]
        norm=normalized(text)
        # Search contiguous five-word source fragments, not merely presence of
        # any Arabic glyph. This tests logical extraction order of full phrases.
        def count(field):
            success=wordpresence=0
            for segment in expected_segments:
                words=str(segment[field]).split()
                first=words[:5]
                if not first:continue
                success+=bool(normalized("".join(first)) in norm)
                wordpresence+=all(normalized(word) in norm for word in first)
            return success,wordpresence
        (ar,ar_words),(en,en_words)=count("arabic"),count("english")
        row.update({
            "normalized_arabic_five_word_passages_in_order":ar,
            "normalized_english_five_word_passages_in_order":en,
            "arabic_passages_with_all_five_words_present":ar_words,
            "english_passages_with_all_five_words_present":en_words,
            "text_length":len(text),
            "stress_phrase_in_document":normalized(data["stress_phrase"]) in norm,
            "synthetic_note_body_in_document":
                normalized("Experimental inline reference") in norm,
            "raw_text_sample":text[:500]
        })
        # Copying hundreds of kilobytes of extracted text into the JSON report
        # is not necessary; only the measured statistics should be retained.
        row["stdout"]=row["stdout"][:500]
        result["poppler"][label]=row
    result["release_gate"]={
        "nonempty_pdf":result["pdf_header"]=="%PDF-" and result["pdf_size_bytes"]>25000,
        "structural_pdf_valid":result["qpdf"]["exit_code"]==0,
        "native_mupdf_did_not_crash":result["mupdf_isolated"]["exit_code"]==0,
        "text_in_original_logical_order":
            result["poppler"]["default"]["normalized_arabic_five_word_passages_in_order"]==len(expected_segments) and
            result["poppler"]["default"]["normalized_english_five_word_passages_in_order"]==len(expected_segments),
        "footnote_65_source_contiguous":
            result["poppler"]["default"]["stress_phrase_in_document"],
        "requires_real_Study_118_note_QA":True,
        "must_not_delete_published_PDFs":True
    }
    return result


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--pdf",type=Path,required=True)
    p.add_argument("--fixture",type=Path,required=True)
    p.add_argument("--mode",choices=["excerpt","full"],required=True)
    p.add_argument("--report",type=Path,required=True)
    p.add_argument("--strict",action="store_true")
    a=p.parse_args()
    if not a.pdf.is_file():raise SystemExit("Browser did not produce a PDF file")
    res=measure(a.pdf,a.fixture,a.mode)
    a.report.parent.mkdir(parents=True,exist_ok=True)
    a.report.write_text(json.dumps(res,indent=2,ensure_ascii=False)+"\n","utf-8")
    print("BROWSER_PDF_INTEGRITY_QA",json.dumps({
        "mode":a.mode,"pages":res["pypdf"].get("parsed",{}).get("pages"),
        "qpdf_exit":res["qpdf"]["exit_code"],
        "mupdf_exit":res["mupdf_isolated"]["exit_code"],
        "first_page_font_aliases":res["pypdf"].get("parsed",{}).get("first_page_font_resource_aliases"),
        "poppler_ar":res["poppler"]["default"]["normalized_arabic_five_word_passages_in_order"],
        "poppler_en":res["poppler"]["default"]["normalized_english_five_word_passages_in_order"],
        "expected":res["expected_segments"],
        "release_gate":res["release_gate"]
    },ensure_ascii=False),flush=True)
    if a.strict and not all(bool(v) for k,v in res["release_gate"].items()
                            if k not in {"requires_real_Study_118_note_QA",
                                         "must_not_delete_published_PDFs"}):
        raise SystemExit(2)


if __name__=="__main__":
    main()
