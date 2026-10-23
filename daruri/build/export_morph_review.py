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
    """Unbiased representative token sample PLUS independent challenge examples.

    Stratified challenge examples illuminate known risk; they are not silently
    pooled with the probability sample for headline accuracy. Unlike the old
    exporter, model omissions are eligible: missing analyses count in coverage.
    """
    candidates = []
    annotated = {row.get("id"): row for row in index.get("records", [])}
    processed = index.get("processedIds") or list(annotated)
    if len(set(processed)) != len(processed):
        raise ValueError("Repeated processed paragraph ID")
    for locator in processed:
        if locator not in texts:
            raise ValueError(f"Cannot sample missing canonical source paragraph {locator}")
        tokens = source.words(texts[locator])
        by_position: dict[int, list[list]] = {}
        for value in annotated.get(locator, {}).get("a", []):
            if isinstance(value, list) and len(value) >= 6:
                pos = value[0]
                if not isinstance(pos, int) or not 0 <= pos < len(tokens):
                    raise ValueError(f"Token ordinal out of range at {locator}:{pos}")
                if source.fold(value[1]) != source.fold(tokens[pos]):
                    raise ValueError(f"Source/index mismatch at {locator}:{pos}")
                by_position.setdefault(pos, []).append(value)
        for position, token in enumerate(tokens):
            analyses = by_position.get(position, [])
            alternatives = [a for a in analyses
                            if a[5] in {"contextual-alternative", "ambiguous"}]
            top = [a for a in analyses
                   if a[5] not in {"contextual-alternative", "ambiguous", "contextual-backoff"}]
            if len(top) > 1:
                raise ValueError(f"Multiple top candidates at {locator}:{position}")
            def lexical_signature(a):
                return (source.fold(a[2]), source.fold(a[3]), a[4],
                        a[6] if len(a) > 6 else "")
            if not top:
                risk = "missing model analysis"
            elif alternatives and any(lexical_signature(a) != lexical_signature(top[0])
                                      for a in alternatives):
                risk = "competing lexical analyses"
            elif alternatives:
                risk = "different grammatical features"
            elif any(x in token for x in ("حكم", "علم", "قياس", "أصل", "علة", "نص", "شرع")):
                risk = "technical expression"
            else:
                risk = ""
            context = " ".join(tokens[max(0, position - 8):position + 9])
            candidates.append({
                "work": str(index.get("work", "")),
                "passage_id": locator,
                "token_position": str(position),
                "surface": token,
                "context": context,
                "suggested_analyses": json.dumps([
                    {"lemma": a[2], "root": a[3], "pos": a[4], "origin": a[5],
                     "lexical_id": a[6] if len(a) >= 7 else "",
                     "grammar": a[7] if len(a) >= 8 else {}}
                    for a in analyses
                ], ensure_ascii=False),
                "ambiguous": "yes" if alternatives else "no",
                "model_has_analysis": "yes" if top else "no",
                "challenge_reason": risk,
                "sample_group": "",
                "reviewed_lemma": "",
                "reviewed_root": "",
                "reviewed_pos": "",
                "reviewed_lexical_id": "",
                "judgement": "",
                "reviewer": "",
                "review_notes": ""
            })
    randomizer = random.Random(seed)
    randomizer.shuffle(candidates)
    # 80% of the requested set is a simple random token sample. Use this
    # probability sample for overall accuracy. Challenge items assess failure
    # modes separately, never artificially improving apparent accuracy.
    n_random = min(len(candidates), max(1, (count * 4 + 4) // 5))
    primary = candidates[:n_random]
    for row in primary:
        row["sample_group"] = "representative"
    remaining = candidates[n_random:]
    # Round-robin challenge quotas mean rare model omissions and lexical
    # disagreements are not drowned out by common case-ending variants.
    priorities = ["missing model analysis", "competing lexical analyses",
                  "different grammatical features", "technical expression"]
    pools = {name: [r for r in remaining if r["challenge_reason"] == name]
             for name in priorities}
    for pool in pools.values():
        randomizer.shuffle(pool)
    selection = primary
    challenge = []
    target = max(0, count - len(primary))
    while len(challenge) < target and any(pools.values()):
        for label in priorities:
            if pools[label] and len(challenge) < target:
                challenge.append(pools[label].pop())
    for row in challenge:
        row["sample_group"] = "challenge"
    selection += challenge
    if len(selection) < count:
        for row in remaining:
            if row["sample_group"]:
                continue
            row["sample_group"] = "representative"
            selection.append(row)
            if len(selection) >= count:
                break
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
               "suggested_analyses", "ambiguous", "model_has_analysis",
               "challenge_reason", "sample_group", "reviewed_lemma",
               "reviewed_root", "reviewed_pos", "reviewed_lexical_id",
               "judgement", "reviewer", "review_notes"]
    with args.output.open("w", newline="", encoding="utf-8-sig") as file:
        writer = csv.DictWriter(file, fieldnames=columns)
        writer.writeheader()
        writer.writerows(rows)
    print(f"{work}: exported {len(rows)} review occurrences to {args.output}")
    print("Review columns deliberately blank. Representative and enriched challenge "
          "examples MUST be evaluated separately; model omissions are sampled.")


if __name__ == "__main__":
    main()
