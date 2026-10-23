#!/usr/bin/env python3
"""Evidence-level release gate for reviewed classical-Arabic morphology.

Input is a model candidate index plus the CSV from export_morph_review.py
AFTER a qualified reviewer supplies explicit adjudications. No empty or
unreviewed rows are counted as verified, and a machine score is NOT accuracy.

Example:
python3 daruri/build/evaluate_morph_review.py \
 --index .morph-context-review/morph-daruri-v1.json \
 --reviews .morph-context-review/daruri-reviewed.csv \
 --min-reviewed 250 --min-exact-accuracy 0.92
"""
from __future__ import annotations
import argparse
import csv
import json
from collections import Counter
from pathlib import Path

from importlib.util import module_from_spec, spec_from_file_location

BUILD = Path(__file__).resolve().with_name("build_gnamma_morph_index.py")
spec = spec_from_file_location("gnamma_morph_eval_builder", BUILD)
assert spec is not None and spec.loader is not None
module = module_from_spec(spec)
spec.loader.exec_module(module)


def evaluate(index: dict, review_rows: list[dict], min_reviewed: int = 250,
             min_exact_accuracy: float = 0.92) -> dict:
    if index.get("schema") != "gnamma-morph-v1":
        raise ValueError("Unknown index schema")
    if not (0 <= min_exact_accuracy <= 1) or min_reviewed < 1:
        raise ValueError("Invalid evaluation threshold")
    occurrences: dict[tuple[str, int], list[list]] = {}
    for record in index.get("records", []):
        for row in record.get("a", []):
            if isinstance(row, list) and len(row) >= 6 and isinstance(row[0], int):
                occurrences.setdefault((record["id"], row[0]), []).append(row)
    totals = Counter()
    breakdown = {"ordinary": Counter(), "ambiguous": Counter()}
    mistakes = []
    seen = set()
    for record in review_rows:
        if record.get("work") != index.get("work"):
            raise ValueError("Review sheet contains a different work")
        if not record.get("passage_id") or not record.get("token_position", "").isdigit():
            raise ValueError("Review row lacks source coordinates")
        key = (record["passage_id"], int(record["token_position"]))
        if key in seen:
            raise ValueError(f"Duplicate gold review occurrence: {key}")
        seen.add(key)
        judgment = record.get("judgement", "").strip().lower()
        if judgment not in ("", "confirmed", "corrected", "unanalysable"):
            raise ValueError(f"Unsupported judgement {judgment!r} at {key}")
        if not judgment:
            totals["pending"] += 1
            continue
        if not record.get("reviewer", "").strip():
            raise ValueError(f"Review at {key} has no named adjudicator")
        if judgment == "unanalysable":
            totals["unanalysable"] += 1
            continue
        gold_lemma = record.get("reviewed_lemma", "").strip()
        gold_pos = record.get("reviewed_pos", "").strip()
        gold_root = record.get("reviewed_root", "").strip()  # legitimately empty for particles
        if not gold_lemma or not gold_pos:
            raise ValueError(f"Review at {key} needs a lemma and POS, even when confirmed")
        choices = occurrences.get(key, [])
        # The highest ranked lexical reading is the one shipped in search;
        # alternatives are never promoted silently.
        top = next((x for x in choices
                    if x[5] not in ("contextual-alternative", "ambiguous", "contextual-backoff")), None)
        if top and module.fold(str(top[1])) != module.fold(record.get("surface", "")):
            raise ValueError(f"Source-token mismatch for reviewed item at {key}")
        subset = breakdown["ambiguous" if record.get("ambiguous") == "yes" else "ordinary"]
        for target in (totals, subset):
            target["reviewed"] += 1
            if not top:
                target["missing"] += 1
                continue
            target["covered"] += 1
            checks = {
                "lemma": module.fold(top[2]) == module.fold(gold_lemma),
                "root": module.fold(top[3]) == module.fold(gold_root),
                "pos": top[4] == gold_pos
            }
            for feat, good in checks.items():
                target[feat + "_correct"] += int(good)
            lexical_id = record.get("reviewed_lexical_id", "").strip()
            if lexical_id:
                target["sense_reviewed"] += 1
                target["sense_correct"] += int(len(top) >= 7 and top[6] == lexical_id)
            target["exact_correct"] += int(all(checks.values()))
        if top and not all(checks.values()) and len(mistakes) < 20:
            mistakes.append({"passage_id": key[0], "position": key[1],
                "surface": record.get("surface"), "predicted": top[2:5],
                "reviewed": [gold_lemma, gold_root, gold_pos]})
    n = totals["reviewed"]
    score = (totals["exact_correct"] / n) if n else 0.0
    report = {
        "work": index.get("work"), "contextual_index": bool(index.get("contextual")),
        "model": index.get("annotator"), "reviewed": n, "pending": totals["pending"],
        "unanalysable": totals["unanalysable"],
        "coverage": totals["covered"] / n if n else 0,
        "exact_accuracy": score,
        "lemma_accuracy": totals["lemma_correct"] / n if n else 0,
        "root_accuracy": totals["root_correct"] / n if n else 0,
        "pos_accuracy": totals["pos_correct"] / n if n else 0,
        "sense_accuracy": (totals["sense_correct"] / totals["sense_reviewed"]
                           if totals["sense_reviewed"] else None),
        "strata": {name: dict(counts) for name, counts in breakdown.items()},
        "mistake_examples": mistakes,
        "minimum_reviewed": min_reviewed,
        "minimum_exact_accuracy": min_exact_accuracy,
        "release_gate_passed": bool(index.get("contextual") and
             n >= min_reviewed and score >= min_exact_accuracy and
             totals["pending"] == 0 and totals["unanalysable"] == 0)
    }
    return report


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--index", type=Path, required=True)
    parser.add_argument("--reviews", type=Path, required=True)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--min-reviewed", type=int, default=250)
    parser.add_argument("--min-exact-accuracy", type=float, default=0.92)
    args = parser.parse_args()
    index = json.loads(args.index.read_text(encoding="utf-8"))
    with args.reviews.open(encoding="utf-8-sig", newline="") as file:
        rows = list(csv.DictReader(file))
    report = evaluate(index, rows, args.min_reviewed, args.min_exact_accuracy)
    display = json.dumps(report, ensure_ascii=False, indent=2)
    print(display)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(display + "\n", encoding="utf-8")
    if not report["release_gate_passed"]:
        raise SystemExit("FAILED scholarly accuracy gate: public promotion is prohibited")


if __name__ == "__main__":
    main()
