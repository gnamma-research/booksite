#!/usr/bin/env python3
"""Diagnostic only: inspect safe Arabic source/word order on a few A4 pages."""
from pathlib import Path
import fitz,sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/"build"))
from build_base_personal_maps import BOOK,SECTIONS,appropriate,clean,tokens_in_section,position
ROOT=Path(__file__).resolve().parents[1]
for filename,lang in [
    ("reading/daruri-reading-arabic-titles-off.pdf","ar"),
    ("reading/daruri-reading-bilingual-titles-off.pdf","ar"),
    ("reading/daruri-reading-english-titles-off.pdf","en"),
]:
    with fitz.open(ROOT/"editions"/filename) as pdf:
        names=pdf.resolve_names()
        anchors={f"section-{i}":position(names[f"section-{i}"]) for i in range(1,259)}
        allwords=[p.get_text("words",sort=False) for p in pdf]
        print("###",filename,lang,flush=True)
        for n in (1,11,23):
            words=tokens_in_section(allwords,n,anchors,lang)
            seg=SECTIONS[str(n)]["segments"][0]
            source=seg["ar"] if lang=="ar" else seg["en"]
            print("SECTION",n,"anchors",anchors[f"section-{n}"],"words",len(words))
            print("SOURCE",repr(source[:180]))
            print("NATIVE TOKENS",repr([v[0] for v in words[:26]]))
            print("NORM SOURCE",repr(clean(source)[:145]))
            print("JOINED",repr(clean("".join(v[0] for v in words))[:145]))
            print("REVERSE WORDS",repr(clean("".join(v[0] for v in words[::-1]))[:145]))
            print("REVERSE EACH",repr(clean("".join(v[0][::-1] for v in words))[:145]))
            print("DOUBLE REVERSE",repr(clean("".join(v[0][::-1] for v in words[::-1]))[:145]))
