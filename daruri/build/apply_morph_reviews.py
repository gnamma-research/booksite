#!/usr/bin/env python3
"""Apply explicitly adjudicated per-occurrence Arabic morphology corrections.

This does NOT create scholarly judgments. It imports a human-edited review
CSV, retaining the original BERT prediction as an inspectable alternative.
Unreviewed words remain flagged automatic. Output is always a staging file.

Usage:
 python3 daruri/build/apply_morph_reviews.py \
  --index .morph-context-review/morph-daruri-v1.json \
  --reviews .morph-context-review/daruri-adjudicated.csv \
  --output .morph-context-review/daruri-reviewed-candidates.json
"""
from __future__ import annotations

import argparse
import csv
import json
from copy import deepcopy
from pathlib import Path

from build_gnamma_morph_index import fold, load_sources, words

GOOD = {"contextual-bert", "reviewed"}


def apply_reviews(index: dict, reviews: list[dict], texts: dict[str, str]) -> tuple[dict, dict]:
    if index.get("schema") != "gnamma-morph-v1" or not index.get("contextual"):
        raise ValueError("Refusing corrections to an unrelated or non-contextual index")
    work = index.get("work")
    if work not in ("daruri", "mustasfa"):
        raise ValueError("Unrecognized corpus")
    result = deepcopy(index)
    records = {r["id"]: r for r in result["records"]}
    processed = set(index.get("processedIds") or records)
    summary = {"accepted_reviews": 0, "corrected": 0, "confirmed": 0,
               "unanalysable": 0, "pending": 0, "retained_model_alternatives": 0}
    seen = set()
    for review in reviews:
        judgement = str(review.get("judgement", "")).strip().lower()
        if judgement == "":
            summary["pending"] += 1
            continue
        if judgement not in ("confirmed", "corrected", "unanalysable"):
            raise ValueError(f"Unsupported adjudication {judgement!r}")
        locator = review.get("passage_id", "")
        text_position = str(review.get("token_position", ""))
        if not text_position.isdecimal():
            raise ValueError(f"Invalid source token ordinal {text_position!r}")
        position = int(text_position)
        key = (locator, position)
        if key in seen:
            raise ValueError(f"Duplicate adjudication at {key}")
        seen.add(key)
        if locator not in processed or locator not in texts:
            raise ValueError(f"Review refers to an unprocessed or absent source: {key}")
        if review.get("work") != work:
            raise ValueError(f"Review work mismatch at {key}")
        tokens = words(texts[locator])
        if position >= len(tokens):
            raise ValueError(f"Source token outside paragraph at {key}")
        surface = tokens[position]
        if fold(review.get("surface", "")) != fold(surface):
            raise ValueError(f"Human review source word mismatch at {key}")
        reviewer = review.get("reviewer", "").strip()
        if not reviewer:
            raise ValueError(f"No named human reviewer at {key}")
        existing = records.get(locator)
        if existing is None:
            existing = {"id": locator, "a": []}
            records[locator] = existing
        entries = existing["a"]
        if any(a[0] == position and a[5] == "reviewed" for a in entries):
            raise ValueError(f"Already independently reviewed: {key}")
        originals = [a for a in entries if a[0] == position and a[5] in GOOD]
        if len(originals) > 1:
            raise ValueError(f"Multiple prior primary analyses at {key}")
        for item in originals:
            item[5] = "contextual-alternative"  # no longer a search assertion
            summary["retained_model_alternatives"] += 1
        summary["accepted_reviews"] += 1
        summary[judgement] += 1
        if judgement == "unanalysable":
            # A qualified reviewer declined to select a reading. Do not index
            # the former model guess as if uncertainty were certainty.
            continue
        lemma = str(review.get("reviewed_lemma", "")).strip()
        root = str(review.get("reviewed_root", "")).strip()
        pos = str(review.get("reviewed_pos", "")).strip()
        lexical_id = str(review.get("reviewed_lexical_id", "")).strip()
        if not lemma or not pos:
            raise ValueError(f"Reviewed lemma and POS required at {key}")
        if not all(isinstance(value, str) for value in (lemma, root, pos)):
            raise ValueError("Invalid reviewed strings")
        entries.append([position, surface, lemma, root, pos, "reviewed", lexical_id,
                        {"reviewer": reviewer,
                         "review_note": str(review.get("review_notes", ""))[:400]}])
    result["records"] = [records[k] for k in (index.get("processedIds") or records) if k in records]
    # Deliberately keep corpus-level boolean false: sampling and selective
    # corrections do NOT prove every token was scholar-reviewed.
    result["classicalArabicValidated"] = False
    result["annotator"] = str(index.get("annotator", "")) + " + individual scholarly reviews"
    result["reviewSummary"] = summary
    result["summary"] = dict(index.get("summary") or {})
    result["summary"]["reviewedTokens"] = summary["confirmed"] + summary["corrected"]
    result["summary"]["rejectedTokens"] = summary["unanalysable"]
    return result, summary


def main() -> None:
    cli = argparse.ArgumentParser()
    cli.add_argument("--index", type=Path, required=True)
    cli.add_argument("--reviews", type=Path, required=True)
    cli.add_argument("--output", type=Path, required=True)
    args = cli.parse_args()
    output = args.output.resolve()
    public = Path(__file__).resolve().parents[1]
    if output == args.index.resolve() or output.is_relative_to(public):
        cli.error("Do not overwrite the input model or write review candidates into the public daruri/ directory")
    index = json.loads(args.index.read_text(encoding="utf-8"))
    work = index.get("work")
    if work not in {"daruri", "mustasfa"}:
        cli.error("Unsupported source work")
    with args.reviews.open(encoding="utf-8-sig", newline="") as file:
        reviews = list(csv.DictReader(file))
    amended, stats = apply_reviews(index, reviews, dict(load_sources()[work]))
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(amended, ensure_ascii=False,
                     separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"{work}: staged review-enriched candidates: {stats}")
    print("This does not publish to the website or certify corpus-wide grammatical accuracy.")


if __name__ == "__main__":
    main()
