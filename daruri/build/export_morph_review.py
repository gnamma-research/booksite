#!/usr/bin/env python3
"""Export a reproducible, occurrence-level morphology review sheet.

The sheet is for qualified Arabic readers to adjudicate gold examples before
publishing contextual-model output as dependable. It does NOT infer correctness.

Example, from repo root:
python3 daruri/build/export_morph_review.py \
  --index /tmp/morph-review/morph-daruri-v1.json \
  --count 250 --output /tmp/daruri-morph-review.csv
"""
from __future__ import annotations

import argparse
import csv
import importlib.util
import json
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MODULE = ROOT / "daruri" / "build" / "build_gnamma_morph_index.py"
spec = importlib.util.spec_from_file_location("gnamma_morph_build", MODULE)
assert spec and spec.loader
source = importlib.util.module_from_spec(spec)
spec.loader.exec_module(source)


def sample_review_rows(index: dict, texts: dict[str, str], count: int,
                       seed: int = 23) -> list[dict[str, str]]:
    """Deterministic sample; prefer ambiguous analyses without hiding easy tokens."""
    candidates = []
    for record in index.get("records", []):
        locator = record.get("id")
        if locator not in texts:
            continue
        tokens = source.words(texts[locator])
        by_position: dict[int, list[list]] = {}
        for value in record.get("a", []):
            if isinstance(value, list) and len(value) >= 6:
                pos = value[0]
                if isinstance(pos, int) and 0 <= pos < len(tokens):
                    by_position.setdefault(pos, []).append(value)
        for position, analyses in by_position.items():
            token = tokens[position]
            if any(source.fold(row[1]) != source.fold(token) for row in analyses):
                raise ValueError(f"Token/index mismatch {locator} at {position}: {token!r}")
            ambiguous = len(analyses) > 1 or any(a[5] == "ambiguous" for a in analyses)
            context = " ".join(tokens[max(0, position - 8):position + 9])
            candidates.append({
                "work": str(index.get("work", "")),
                "passage_id": locator,
                "token_position": str(position),
                "surface": token,
                "context": context,
                "suggested_analyses": json.dumps([
                    {"lemma": a[2], "root": a[3], "pos": a[4], "origin": a[5],
                     "lexical_id": a[6] if len(a) >= 7 else ""}
                    for a in analyses
                ], ensure_ascii=False),
                "ambiguous": "yes" if ambiguous else "no",
                "reviewed_lemma": "",
                "reviewed_root": "",
                "reviewed_pos": "",
                "reviewed_lexical_id": "",
                "judgement": "",
                "reviewer": "",
                "review_notes": ""
            })
    randomizer = random.Random(seed)
    ambiguous = [x for x in candidates if x["ambiguous"] == "yes"]
    other = [x for x in candidates if x["ambiguous"] != "yes"]
    randomizer.shuffle(ambiguous)
    randomizer.shuffle(other)
    # Stratify 50:50 where possible, not all homographs and not all easy cases.
    n_ambig = min(len(ambiguous), count // 2)
    selection = ambiguous[:n_ambig]
    n_other = min(len(other), count - len(selection))
    selection += other[:n_other]
    if len(selection) < count:
        selection += ambiguous[n_ambig:n_ambig + count - len(selection)]
    selection.sort(key=lambda x: (x["passage_id"], int(x["token_position"])))
    return selection


def main() -> None:
    cli = argparse.ArgumentParser()
    cli.add_argument("--index", type=Path,
                     default=ROOT / "daruri/morph-daruri-v1.json")
    cli.add_argument("--count", type=int, default=250)
    cli.add_argument("--seed", type=int, default=23)
    cli.add_argument("--output", type=Path, required=True)
    args = cli.parse_args()
    if args.count <= 0 or args.count > 10000:
        cli.error("--count must be between 1 and 10000")
    index = json.loads(args.index.read_text(encoding="utf-8"))
    if index.get("schema") != "gnamma-morph-v1":
        cli.error("Unrecognized morphology index schema")
    work = index.get("work")
    if work not in {"daruri", "mustasfa"}:
        cli.error("Unsupported work")
    texts = dict(source.load_sources()[work])
    rows = sample_review_rows(index, texts, args.count, args.seed)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    columns = ["work", "passage_id", "token_position", "surface", "context",
               "suggested_analyses", "ambiguous", "reviewed_lemma",
               "reviewed_root", "reviewed_pos", "reviewed_lexical_id",
               "judgement", "reviewer", "review_notes"]
    with args.output.open("w", newline="", encoding="utf-8-sig") as file:
        writer = csv.DictWriter(file, fieldnames=columns)
        writer.writeheader()
        writer.writerows(rows)
    print(f"{work}: exported {len(rows)} review occurrences to {args.output}")
    print("The empty review columns are intentional; do not auto-fill ground truth.")


if __name__ == "__main__":
    main()
