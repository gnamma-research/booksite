#!/usr/bin/env python3
"""Check every unvowelled bilingual page and render visual evidence.

Run from the repository root. This does not modify any published PDF.
"""
from __future__ import annotations
import hashlib
import json
import unicodedata
from pathlib import Path
import fitz

root=Path(__file__).resolve().parents[1]
out=Path("test-artifacts")
out.mkdir(exist_ok=True, parents=True)
manifest=json.loads((root/"editions/manifest.json").read_text())
records={(r["tier"],r["language"],r["editorial_titles"]):r for r in manifest["files"]}
for titles in (False,True):
    vowelled=records["reading","bilingual",titles]
    plain=records["reading","bilingual-unvowelled",titles]
    path=root/"editions"/plain["file"]
    assert hashlib.sha256(path.read_bytes()).hexdigest()==plain["sha256"]
    with fitz.open(path) as doc:
        assert len(doc)==plain["pages"]==vowelled["pages"]
        assert len(doc.get_toc())==plain["bookmarks"]
        assert all(abs(p.rect.width-595.2756)<1 and abs(p.rect.height-841.89)<1 for p in doc)
        assert all(len(p.get_text().strip())>20 for p in doc)
        assert len(doc)>=30
        for ix in sorted(set([0,1,5,len(doc)//2,len(doc)-1])):
            pix=doc[ix].get_pixmap(matrix=fitz.Matrix(1.65,1.65),alpha=False)
            pix.save(out/f"bilingual-unvowelled-{('titles-on' if titles else 'titles-off')}-p{ix+1}.png")
        plain_marks=sum(sum(unicodedata.combining(ch)>0 for ch in p.get_text()) for p in doc)
    with fitz.open(root/"editions"/vowelled["file"]) as doc:
        vowel_marks=sum(sum(unicodedata.combining(ch)>0 for ch in p.get_text()) for p in doc)
    print(f"Visual QA: titles={titles} pages={plain['pages']}, "
          f"Arabic combining marks (unvowelled / vowelled): {plain_marks}/{vowel_marks}")
    assert vowel_marks>plain_marks, "New unvowelled PDF must contain fewer vowel marks"
print("PASS: 2 published A4 unvowelled bilingual editions, page parity, outline, "
      "PDF hashes, no empty pages, vowel difference and ten full-page render samples.")
