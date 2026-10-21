#!/usr/bin/env python3
"""Publish only the missing unvowelled bilingual A4 Reading PDFs.

This deliberately leaves all ten approved Reading/Study PDFs, the reference PDF,
and website-specific page destinations untouched. The reader's canonical Arabic
(unvowelled) and English passages are rendered in parallel from the same source.
"""
from __future__ import annotations

import hashlib
import json
import tempfile
from pathlib import Path

import fitz
import print_editions
import publish_editions

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT.parent / "editions"
LANGUAGE = "bilingual-unvowelled"


def run() -> list[dict]:
    manifest_path = OUTPUT / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    assert manifest.get("status") == "verified"
    assert manifest["tier_order"] == ["reading", "study", "reference"]
    prior = [
        f for f in manifest["files"]
        if not (f["tier"] == "reading" and f["language"] == LANGUAGE)
    ]
    assert len(prior) == 10, "Existing ten verified PDFs must be left untouched"
    for record in prior:
        target = OUTPUT / record["file"]
        assert target.is_file(), f"Missing previously approved PDF: {target}"
        assert hashlib.sha256(target.read_bytes()).hexdigest() == record["sha256"], (
            f"Previously approved PDF checksum mismatch: {target}"
        )
    sections = print_editions.BOOK["sections"]
    assert len([s for s in sections if str(s.get("id")).isdigit()]) == 258
    assert sum(len(s["segments"]) for s in sections if str(s.get("id")).isdigit()) == 414
    examples = [
        s for s in sections if str(s.get("id")).isdigit()
        for seg in s["segments"] if seg.get("ar") != seg.get("vocalized")
    ]
    assert len(examples) >= 100, "The source must contain meaningful vowelled/unvowelled differences"
    assert print_editions.MODES[LANGUAGE]["ar"] == "ar"

    produced = []
    with tempfile.TemporaryDirectory(prefix="daruri-bilingual-unvowelled-") as tmp:
        for editorial in (False, True):
            raw = Path(tmp) / ("raw-titles-on.pdf" if editorial else "raw-titles-off.pdf")
            printed = print_editions.build(
                LANGUAGE, range(1, 259), "full", "Complete reading text",
                raw, editorial_titles=editorial
            )
            assert printed["paragraphs"] == 414 and printed["sections"] == list(range(1, 259))
            filename = f"daruri-reading-bilingual-unvowelled-titles-{'on' if editorial else 'off'}.pdf"
            target = OUTPUT / "reading" / filename
            entry = publish_editions.finalize(raw, target, sections, "reading", LANGUAGE, editorial)
            assert entry["file"] == f"reading/{filename}" and entry["notes"] == "none"
            assert entry["pages"] >= 30 and entry["bookmarks"] >= 52
            with fitz.open(target) as pdf:
                assert len(pdf) == entry["pages"]
                assert sum(len(p.get_text()) for p in pdf) > 40000
                assert all(abs(p.rect.width - 595.276) < 1 for p in pdf)
            produced.append(entry)

    new_files = prior + produced
    new_files.sort(key=lambda row: (
        0 if row["tier"] == "reading" else 1,
        ["bilingual", LANGUAGE, "english", "arabic", "arabic-vowelled"].index(row["language"]),
        bool(row["editorial_titles"])
    ))
    assert len(new_files) == 12
    assert len({f["file"] for f in new_files}) == 12
    manifest["files"] = new_files
    manifest["release"] = "20261021-a4-bilingual-vowels"
    manifest["note"] = (
        "Verified vowelled and unvowelled bilingual Reading PDFs, "
        "with all previously approved files and reference page destinations preserved."
    )
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps([{"file": r["file"], "pages": r["pages"], "sha256": r["sha256"]}
                      for r in produced], indent=2), flush=True)
    return produced


if __name__ == "__main__":
    run()
