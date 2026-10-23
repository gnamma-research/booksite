#!/usr/bin/env python3
"""Stage source-anchored, explicitly editor-approved Arabic morphology repairs.

Source-linked lexicon evidence is a *proposal*, not a verified correction.
Only rows bearing editor_approved=yes and complete reviewer attribution can
replace an analysis. The overwritten machine choice stays inspectable as an
alternative and is never silently converted to gold. Source segmentation
and every token coordinate are checked before any file is written.

This does NOT publish reviewed data. The staging file needs an independent
linguistic release review, and the public reader stays on curated morphology.
"""
from __future__ import annotations
import argparse
import copy
import csv
import json
from pathlib import Path

from build_gnamma_morph_index import fold, words, load_sources

SUPPORTED = {"corrected", "confirmed"}
IGNORED_SOURCES = {"contextual-alternative", "ambiguous", "contextual-backoff"}
SHIPPED = Path(__file__).resolve().parents[1]


def apply(index: dict, source_texts: dict[str, str],
          reviews: list[dict]) -> tuple[dict, dict]:
    if index.get("schema") != "gnamma-morph-v1" or not index.get("contextual"):
        raise ValueError("Expected a source-linked contextual candidate index")
    if index.get("work") not in ("daruri", "mustasfa"):
        raise ValueError("Unsupported source work")
    output = copy.deepcopy(index)
    by_id = {record["id"]: record for record in output["records"]}
    if len(by_id) != len(output["records"]):
        raise ValueError("Repeated paragraph IDs")
    reviewed = skipped = 0
    changed = set()
    for row in reviews:
        state = str(row.get("judgement", "")).strip().lower()
        approval = str(row.get("editor_approved", "")).strip().lower()
        if not state or state == "unanalysable" or approval != "yes":
            skipped += 1
            continue
        if state not in SUPPORTED:
            raise ValueError(f"Invalid review decision: {state}")
        reviewer = str(row.get("reviewer", "")).strip()
        editor = str(row.get("editor", "")).strip()
        if not reviewer or not editor:
            raise ValueError("Approval requires a reviewer and a distinct recorded editorial sign-off")
        lemma = str(row.get("reviewed_lemma", "")).strip()
        root = str(row.get("reviewed_root", "")).strip()
        pos = str(row.get("reviewed_pos", "")).strip()
        if not lemma or not pos:
            raise ValueError("Approved review needs a headword and part of speech")
        record_id = str(row.get("passage_id", ""))
        try:
            position = int(row["token_position"])
        except (TypeError, ValueError, KeyError) as exc:
            raise ValueError("Invalid source token ordinal") from exc
        loc=(record_id,position)
        if loc in changed:
            raise ValueError("Multiple different reviews target the same source occurrence")
        changed.add(loc)
        if record_id not in by_id or record_id not in source_texts:
            raise ValueError(f"Source paragraph missing: {record_id}")
        canonical = words(source_texts[record_id])
        if not 0 <= position < len(canonical):
            raise ValueError("Word ordinal outside source paragraph")
        surface = canonical[position]
        if fold(str(row.get("surface", ""))) != fold(surface):
            raise ValueError("The reviewed source wording has changed since adjudication")
        record = by_id[record_id]
        old = [a for a in record["a"] if a[0] == position]
        for model in old:
            if fold(model[1]) != fold(surface):
                raise ValueError("Model input was not aligned with the canonical word")
        originals = [a for a in old if a[5] not in IGNORED_SOURCES and a[5] != "reviewed"]
        if len(originals) > 1:
            raise ValueError("Several model primary analyses at one source ordinal")
        if any(a[5] == "reviewed" for a in old):
            raise ValueError("Previously approved analysis requires manual conflict resolution")
        # Original AI suggestions are kept but have NO authority to enter the
        # lemma/root postings once a human-edited source reading supersedes them.
        for a in originals:
            a[5] = "contextual-alternative"
            if len(a) >= 8 and isinstance(a[7], dict):
                a[7]["supersededByReviewed"] = True
        lexeme = str(row.get("reviewed_lexical_id", "")).strip()
        new = [position, surface, lemma, root, pos, "reviewed", lexeme,
               {"reviewed": True, "reviewer": reviewer, "editor": editor,
                "reviewNote": str(row.get("review_notes", "")).strip()[:280]}]
        record["a"] = [a for a in record["a"] if a[0] != position] + [new] + [
            a for a in record["a"] if a[0] == position]
        reviewed += 1
    output["reviewedOccurrenceCount"] = reviewed
    output["classicalArabicValidated"] = False
    output["annotator"] = str(index.get("annotator", "")) + " / occurrence-approved overrides"
    return output, {"reviewed": reviewed, "skipped": skipped,
                    "publicReleasePermitted": False}


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--index",type=Path,required=True)
    parser.add_argument("--reviews",type=Path,required=True)
    parser.add_argument("--output",type=Path,required=True)
    args=parser.parse_args()
    if args.output.resolve() == args.index.resolve() or args.output.resolve().is_relative_to(SHIPPED.resolve()):
        parser.error("Do not overwrite a model or published index; write only outside daruri/")
    index=json.loads(args.index.read_text(encoding="utf-8"))
    with args.reviews.open(encoding="utf-8-sig",newline="") as f:
        records=list(csv.DictReader(f))
    source_map=dict(load_sources()[index["work"]])
    staged,status=apply(index,source_map,records)
    if status["reviewed"] == 0:
        raise SystemExit("No editor-approved morphology repairs; staged index was not written.")
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(staged,ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf-8")
    print(json.dumps(status,indent=2))
    print("Staging only. The public reader and review quality gate remain unchanged.")


if __name__=="__main__":
    main()
