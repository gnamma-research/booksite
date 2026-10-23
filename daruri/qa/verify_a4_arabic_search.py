#!/usr/bin/env python3
"""Read-only search audit of the twelve actual signed production Daruri A4 PDFs.

This explicitly measures everyday *unvowelled Arabic word* Find first, distinct
from exact fully vowelled multi-word scholarly quotation Find. Test against
real SHA-256 verified published PDFs, not generated copies or OCR.
"""
from __future__ import annotations
import collections
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
import time
import unicodedata

import fitz
import pypdfium2 as pdfium

SITE=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(SITE/"build"))
from build_editions import read_book  # noqa

def normalize_ar(value):
    value=unicodedata.normalize("NFKD",str(value))
    return "".join(c for c in value
        if unicodedata.category(c)!="Mn" and c!='ـ')

def source_samples():
    book=read_book()
    sections=[s for s in book["sections"] if type(s.get("id")) is int and 1<=s["id"]<=258]
    assert len(sections)==258 and sum(len(s["segments"]) for s in sections)==414
    original=" ".join(v["ar"] for s in sections for v in s["segments"])
    # Keep only everyday terms genuinely present in the current 414-segment corpus.
    candidates=["القياس","الحكم","الدليل","الأصل","الأحكام","الشرع","النص",
                "العلم","المعرفة","الكلام","اللفظ","الكتاب","العام","الخاص",
                "المسألة","الاجتهاد","اللغة","الفقه"]
    words=[w for w in candidates if w in normalize_ar(original)]
    if len(words)<8:raise ValueError("Canonical original Arabic vocabulary changed")
    examples=[]
    for section in [1,22,38,64,65,105,151,210,258]:
        row=sections[section-1]["segments"][0]
        pure=normalize_ar(row["ar"])
        phrase=" ".join(pure.split()[:2])
        rawv=row["vocalized"]
        vowelled=" ".join(rawv.split()[:2])
        # Choose a distinctive original word without requiring it to be first
        large=[w for w in re.findall(r"[\u0621-\u064A]{4,}",pure)[:24] if len(w)>=5]
        word=large[0] if large else pure.split()[0]
        examples.append({"section":section,"plain_first_two":phrase,
            "vowelled_first_two":vowelled,"distinctive_word":word,
            "english_first_two":" ".join(row["en"].split()[:2])})
    return {"section_count":258,"paragraph_count":414,
            "everyday_arabic_queries":words,"section_examples":examples,
            "english_controls":["law","legal","the","reason","knowledge"]}

def hashfile(path):
    with path.open("rb") as stream:
        h=hashlib.sha256()
        for block in iter(lambda:stream.read(1024*1024),b""):h.update(block)
        return h.hexdigest()

def find_mupdf(doc,query):
    pages=[]
    for pg in doc:
        try: hits=pg.search_for(query)
        except Exception as e:raise RuntimeError("MuPDF query failure "+repr(query)) from e
        if hits:pages.append((pg.number+1,len(hits)))
    return {"hit_pages":len(pages),"hits":sum(n for _,n in pages),
            "first_pages":pages[:4]}

def find_pdfium(pdf,query):
    # Stop at first real hit; this checks ordinary Find availability rather
    # than exhaustive occurrence counting. No artificial Unicode normalization.
    for i in range(len(pdf)):
        pg=pdf[i]
        text=pg.get_textpage()
        search=text.search(query)
        try:
            hit=search.get_next()
        except Exception as e:
            return {"found":False,"search_error":str(e)[:160]}
        if hit is not None:
            return {"found":True,"first_page":i+1}
    return {"found":False,"first_page":None}

def poppler(path,mode):
    result=subprocess.run(["pdftotext",mode,str(path),"-"],
           capture_output=True,text=True,timeout=70)
    return {"rc":result.returncode,"text":result.stdout,
            "stderr":result.stderr[:550]}

def run(site,output):
    manifest=json.loads((site/"editions/manifest.json").read_text("utf8"))
    rows=manifest["files"]
    if len(rows)!=12:raise ValueError("Expected precisely twelve published A4 PDFs")
    src=source_samples()
    audits=[]
    start=time.perf_counter()
    for n,row in enumerate(rows,1):
        pdf_path=site/"editions"/row["file"]
        if not pdf_path.is_file():raise FileNotFoundError(pdf_path)
        observed_sha=hashfile(pdf_path)
        if observed_sha!=row["sha256"]:raise ValueError("Release SHA mismatch: "+row["file"])
        arabic=row["language"] not in ("english",)
        with fitz.open(pdf_path) as mu:
            if len(mu)!=row["pages"]:raise ValueError("Page mismatch: "+row["file"])
            pdf=pdfium.PdfDocument(str(pdf_path))
            start_text=" ".join(p.get_text(sort=False) for p in list(mu)[:3])[:1100]
            queries=src["everyday_arabic_queries"][:12] if arabic else []
            typed_arabic={q:find_mupdf(mu,q) for q in queries}
            pdfium_arabic={q:find_pdfium(pdf,q) for q in queries[:8]}
            phrase_examples=[
                {"section":sample["section"],
                 "unvowelled_original":sample["plain_first_two"],
                 "fully_vowelled_original":sample["vowelled_first_two"],
                 "unvowelled_find":find_mupdf(mu,sample["plain_first_two"]),
                 "vowelled_find":find_mupdf(mu,sample["vowelled_first_two"]),
                 "distinctive_word":sample["distinctive_word"],
                 "word_find":find_mupdf(mu,sample["distinctive_word"])}
                for sample in src["section_examples"] if arabic
            ]
            english_queries={q:find_mupdf(mu,q)
                for q in src["english_controls"][:4]
                if row["language"] not in ("arabic","arabic-vowelled")}
            english_quoted={str(sample["section"]):find_mupdf(mu,sample["english_first_two"])
                for sample in src["section_examples"][:4]
                if row["language"] not in ("arabic","arabic-vowelled")}
            visible_images=sum(len(p.get_images(full=True)) for p in list(mu)[:3])
        pop=poppler(pdf_path,"-layout")
        pop_ar={q:q in pop["text"] for q in (src["everyday_arabic_queries"][:8] if arabic else [])}
        measurement={
         "name":row["file"],"language":row["language"],"tier":row["tier"],
         "pdf_sha256":observed_sha,"pages":row["pages"],"original_language_has_arabic":arabic,
         "pdf_version":"", "first_3_page_images":visible_images,
         "first_text_excerpt":start_text[:350],
         "native_mupdf_common_words":typed_arabic,
         "native_pdfium_common_words":pdfium_arabic,
         "poppler_layout_contains_common_words":pop_ar,
         "mupdf_authorial_section_tests":phrase_examples,
         "native_mupdf_english_common":english_queries,
         "native_mupdf_english_phrases":english_quoted,
         "poppler_exit_code":pop["rc"],"poppler_diagnostics":pop["stderr"]
        }
        audits.append(measurement)
        mw=sum(bool(x["hit_pages"]) for x in typed_arabic.values())
        pw=sum(bool(x["found"]) for x in pdfium_arabic.values())
        pl=sum(bool(x) for x in pop_ar.values())
        me=sum(bool(x["hit_pages"]) for x in english_quoted.values())
        print("A4_NATIVE_ARABIC_FIND",n,12,row["file"],
              "arabic",arabic,"MuPDF ordinary words",str(mw)+"/"+str(len(typed_arabic)),
              "PDFium ordinary",str(pw)+"/"+str(len(pdfium_arabic)),
              "Poppler ordinary",str(pl)+"/"+str(len(pop_ar)),
              "MuPDF English passage",str(me)+"/"+str(len(english_quoted)),
              flush=True)
    report={
      "schema":"gnamma-read-only-twelve-published-A4-arabic-native-find-v1",
      "status":"tested-not-assumed",
      "edition_manifest_release":manifest["release"],
      "all_pdf_release_sha256_matched":True,
      "actual_base_pdf_count":len(audits),
      "arabic_text_editions":sum(x["original_language_has_arabic"] for x in audits),
      "english_only":sum(not x["original_language_has_arabic"] for x in audits),
      "original_corpus":src,
      "read_only":True,"no_pdf_changes":True,
      "engines":["MuPDF","PDFium","Poppler text layout"],
      "measurements":audits,
      "elapsed_seconds":round(time.perf_counter()-start,2)
    }
    output.parent.mkdir(parents=True,exist_ok=True)
    output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n","utf8")
    print("A4_FIND_FINAL",json.dumps({
        "a4":len(audits),"arabic":report["arabic_text_editions"],
        "english_only":report["english_only"],
        "mupdf_word_presence_per_file":[
          [x["name"],sum(bool(y["hit_pages"]) for y in x["native_mupdf_common_words"].values())]
          for x in audits],
        "elapsed_seconds":report["elapsed_seconds"]},ensure_ascii=False),flush=True)
    return 0

if __name__=="__main__":
    if len(sys.argv)!=2:raise SystemExit("Usage: verify_a4_arabic_search.py OUTPUT_REPORT")
    raise SystemExit(run(SITE,Path(sys.argv[1])))
