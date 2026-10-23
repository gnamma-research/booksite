#!/usr/bin/env python3
"""Create a browser-PDF experiment fixture from canonical Daruri text only.

No PDFs, WeasyPrint typesetting, OCR, dynamic notes, personal Reading Desk data
or other off-site services are inputs. This fixture is an excerpt/full work and
is never a substitute for the official published complete Study edition.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import sys

HERE=Path(__file__).resolve().parent
ROOT=HERE.parent
sys.path.insert(0,str(ROOT/"build"))
from build_editions import read_book  # noqa:E402

def sha(data:bytes):
    return hashlib.sha256(data).hexdigest()

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--out",type=Path,required=True)
    a=p.parse_args()
    canonical=(ROOT/"edition-r3-20261020.js")
    book=read_book()
    sections=[s for s in book["sections"] if isinstance(s.get("id"),int) and 1<=s["id"]<=258]
    if [s["id"] for s in sections]!=list(range(1,259)):
        raise ValueError("Unexpected source-section manifest")
    if sum(len(s["segments"]) for s in sections)!=414:
        raise ValueError("Expected exactly 414 authorial parallel passages")
    by_id={s["id"]:s for s in sections}
    selected=[1,22,38,64,65,258]
    fixture={
      "schema":"daruri-real-source-browser-pdf-stress-v1",
      "authorial_sections":258,
      "authorial_passages":414,
      "source_sha256":sha(canonical.read_bytes()),
      "source_provenance":"Gnamma's canonical JSON reader data, not HTML transcribed from a PDF",
      "sample_sections":[{
          "id":s["id"],
          "recorded_arabic_heading":s.get("headingAr") or "",
          "recorded_english_heading":s.get("headingEn") or "",
          "editorial_english_title":s.get("title") or "",
          "segments":[{
              "arabic":v["vocalized"],
              "arabic_unvowelled":v["ar"],
              "english":v["en"],
              "id":f'R{s["id"]:03d}-P{i+1:02d}',
          }for i,v in enumerate(s["segments"])],
      }for s in (by_id[n] for n in selected)],
      "full_sections":[{
          "id":s["id"],
          "recorded_arabic_heading":s.get("headingAr") or "",
          "recorded_english_heading":s.get("headingEn") or "",
          "segments":[{
              "arabic":v["vocalized"],"english":v["en"],
              "id":f'R{s["id"]:03d}-P{i+1:02d}',
          }for i,v in enumerate(s["segments"])],
      }for s in sections],
      "stress_phrase":"وَفِي أَلْفَاظِهِ",
      "stress_note_id":"EXPERIMENT-65",
      "stress_note_text":"Experimental inline reference and a same-page footnote. This is not a publisher's original note.",
      "no_personal_user_data":True,
    }
    if fixture["stress_phrase"] not in " ".join(seg["vocalized"] for seg in by_id[65]["segments"]):
        raise ValueError("The real §65 source phrase is absent; do not invent fixture text")
    raw=(json.dumps(fixture,ensure_ascii=False,separators=(",",":"))+"\n").encode("utf8")
    a.out.parent.mkdir(parents=True,exist_ok=True)
    a.out.write_bytes(raw)
    print("REAL_DARURI_BROWSER_FIXTURE",json.dumps({
        "bytes":len(raw),"source_sha256":fixture["source_sha256"],
        "sample_sections":selected,"full_passages":414,
        "stress_phrase":fixture["stress_phrase"],"out":str(a.out)
    },ensure_ascii=False),flush=True)

if __name__=="__main__":
    main()
