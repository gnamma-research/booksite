#!/usr/bin/env python3
"""Strict, read-only Daruri source-note and footnote release contract.

This is a *structural* gate. It is deliberately separate from authorial Arabic
search, native PDF viewer QA, dynamic browser cancellation and visual sign-off.
No PDF bytes or source manifests are changed.
"""
from __future__ import annotations

from collections import Counter
import argparse
import json
from pathlib import Path
import re

import fitz

from audit_native_source_and_notes import (
    book_data, sha256, source_destinations, audit_notes
)

SITE = Path(__file__).resolve().parents[1]
CANONICAL = [
    ("daruri.pdf", "reference"),
    ("daruri-study.pdf", "study"),
    ("daruri-english.pdf", "reading"),
    ("daruri-arabic.pdf", "reading"),
    ("daruri-arabic-vowelled.pdf", "reading"),
]


def read_book():
    source = (SITE / "edition-r3-20261020.js").read_text(encoding="utf-8")
    match = re.search(r'textContent\s*=\s*("(?:[^"\\]|\\.)*")\s*;', source, re.S)
    if not match:
        raise ValueError("Authoritative reader data not found")
    return json.loads(json.loads(match.group(1)))


def note_inventory():
    book = read_book()
    notes = book.get("notes") or []
    if isinstance(notes, dict):
        note_list = list(notes.values())
    else:
        note_list = notes
    q = json.loads((SITE/"build/data/quran-source-notes.json").read_text("utf-8"))
    h = json.loads((SITE/"build/data/hadith-source-notes.json").read_text("utf-8"))
    qnotes = q.get("notes") or []
    hnotes = [
        note
        for group in h.get("notes_by_section", {}).values()
        for note in (group if isinstance(group, list) else [group])
    ]
    body_notes = [str(n.get("id")) for n in note_list]
    qids = [str(n.get("id")) for n in qnotes]
    hids = [str(n.get("id")) for n in hnotes]
    errors = []
    if len(book_data(SITE)) != 258:
        errors.append("Original source must retain 258 numbered sections")
    if len(set(body_notes)) != len(body_notes):
        errors.append("Duplicate main-text note IDs")
    if len(body_notes) != 625:
        errors.append(f"Canonical main-text note record count changed: {len(body_notes)} (expected 625)")
    source_ids = set(qids) | set(hids)
    if not source_ids.issubset(set(body_notes)):
        errors.append("A published Qur'an/Hadith source note is not present in canonical reader notes")
    original_explanatory = len(set(body_notes) - source_ids)
    if original_explanatory != 542:
        errors.append(f"Original explanatory note inventory changed: {original_explanatory} (expected 542)")
    if len(qnotes) != 50 or len(set(qids)) != 50:
        errors.append(f"Qur'an source note count/identity changed: {len(qnotes)}")
    if len(hnotes) != 33 or len(set(hids)) != 33:
        errors.append(f"Hadith source note count/identity changed: {len(hnotes)}")
    if q.get("edition_policy", {}).get("hadith") != "scholarly_only":
        errors.append("Hadith note visibility policy changed")
    for n in qnotes:
        section = n.get("section_id")
        if not isinstance(section, int) or not 1 <= section <= 258:
            errors.append(f"Qur'an note {n.get('id')} has invalid section")
    for n in hnotes:
        section = n.get("section_id")
        if not isinstance(section, int) or not 1 <= section <= 258:
            errors.append(f"Hadith note {n.get('id')} has invalid section")
    return {
        "main_text_note_records": len(note_list),
        "original_explanatory_notes": original_explanatory,
        "quran_source_notes": len(qnotes),
        "hadith_source_notes": len(hnotes),
        "quran_source_ids": qids[:6],
        "hadith_source_ids": hids[:6],
        "errors": errors,
    }


def all_jobs():
    primary = json.loads((SITE/"pdf-editions-manifest.json").read_text("utf-8"))["files"]
    for name, kind in CANONICAL:
        yield SITE/name, primary[name], kind
    base = json.loads((SITE/"editions/manifest.json").read_text("utf-8"))
    if base.get("status") != "verified" or len(base.get("files", [])) != 12:
        raise ValueError("Twelve approved base PDF identities are missing")
    for record in base["files"]:
        kind = "study" if record["tier"] == "study" else "reading"
        yield SITE/"editions"/record["file"], record, kind


def verify_document(path, declared, kind, evidence_dir):
    failures = []
    if not path.exists():
        return {"file":str(path),"errors":["PDF missing"],"type":kind}
    digest=sha256(path)
    if digest != declared.get("sha256"):
        failures.append("Approved PDF SHA-256 does not match manifest")
    expected_bytes=declared.get("size_bytes",declared.get("bytes"))
    if expected_bytes is not None and path.stat().st_size != expected_bytes:
        failures.append("Approved PDF byte size does not match manifest")
    with fitz.open(path) as pdf:
        if pdf.page_count != declared.get("pages"):
            failures.append("Approved PDF page count differs")
        names, starts = source_destinations(pdf)
        report=audit_notes(names,pdf.page_count)
        del report["_render_pages"]
        if report["missing_targets"]:
            failures.append("One or more source calls lack their original note body")
        if kind=="study" and report["cross_page_pairs"]:
            failures.append(
                f"Actual Study footnotes have {report['cross_page_pairs']} cross-page call/body pairs"
            )
        # Scholarly/Reference is a section apparatus. It may continue onto
        # a following page; this is not automatically a broken footnote.
        invalid_links=0
        texts_outside=[]
        note_pages=Counter()
        for index,page in enumerate(pdf):
            for name in names:
                if names[name].get("page")==index and (
                    name.startswith("call-") or name.startswith("qcall--")
                ):
                    note_pages[index]+=1
            for link in page.get_links():
                if link.get("kind")==fitz.LINK_GOTO and not (
                    isinstance(link.get("page"),int) and 0<=link["page"]<pdf.page_count
                ):
                    invalid_links+=1
            for block in page.get_text("blocks"):
                if not isinstance(block[4],str) or not block[4].strip():
                    continue
                x0,y0,x1,y1=block[:4]
                if x0 < -2 or y0 < -2 or x1 > page.rect.width+2 or y1 > page.rect.height+2:
                    if len(texts_outside)<8:
                        texts_outside.append({"page":index+1,"bbox":list(block[:4])})
        if invalid_links:
            failures.append(f"{invalid_links} out-of-range internal links")
        if texts_outside:
            failures.append("Text block bounding boxes extend outside page")
        # Supply compact, high-resolution visual evidence for editorial review
        # without claiming that a program checked typographical overlap.
        dense = sorted(note_pages, key=lambda p:(-note_pages[p],p))[:2]
        if kind in ("study","reference"):
            for n in dense:
                safe = path.stem.replace(" ","_")
                pdf[n].get_pixmap(matrix=fitz.Matrix(1.4,1.4),alpha=False).save(
                    evidence_dir / f"{safe}-dense-note-p{n+1}.png"
                )
        return {
            "file":str(path.relative_to(SITE)),
            "type":kind,
            "pages":pdf.page_count,
            "sha256":digest,
            "section_destinations":len(starts),
            "named_destinations":len(names),
            "source_calls":report,
            "dense_note_pages_1based":[n+1 for n in dense],
            "invalid_internal_links":invalid_links,
            "out_of_bounds_text_sample":texts_outside,
            "errors":failures,
        }


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--output-dir",type=Path,default=Path("/tmp/daruri-source-note-contract"))
    parser.add_argument("--strict",action="store_true")
    opts=parser.parse_args()
    out=opts.output_dir
    out.mkdir(parents=True,exist_ok=True)
    original=note_inventory()
    rows=[]
    errors=[*original["errors"]]
    for path,metadata,kind in all_jobs():
        try:
            row=verify_document(path,metadata,kind,out)
        except Exception as error:
            row={"file":str(path),"type":kind,"errors":[
                f"{type(error).__name__}: {error}"
            ]}
        rows.append(row)
        errors.extend(row["file"]+": "+e for e in row["errors"])
        print("NOTES_POLICY",row["file"],kind,"cross-page",
              row.get("source_calls",{}).get("cross_page_pairs"),
              "errors",len(row["errors"]),flush=True)
    result={
        "version":"20261022-reusable-pdf-note-policy-v1",
        "read_only":True,"strict":opts.strict,
        "document_count":len(rows),
        "policy":{
            "reading":"no scholarly-only Hadith sources",
            "study":"true numbered footnotes remain with calls on the physical page",
            "reference":"section apparatus follows its section; continuation to next page is permitted, not labelled page-bottom footnotes",
            "personal":"P-numbered searchable appendix is distinct from publisher note numbering",
        },
        "source_inventory":original,
        "documents":rows,
        "structural_errors":errors,
        "manual_visual_review_required":True,
        "arabic_native_search_certified":False,
        "release_approved":False,
    }
    (out/"notes-release-contract.json").write_text(
        json.dumps(result,indent=2,ensure_ascii=False)+"\n",encoding="utf-8"
    )
    print("NOTES_FINAL",json.dumps({
        "files":len(rows),"errors":len(errors),
        "inventory":original,
        "requires_human_visual_check":True
    },ensure_ascii=False),flush=True)
    return 1 if opts.strict and errors else 0


if __name__=="__main__":
    raise SystemExit(main())
