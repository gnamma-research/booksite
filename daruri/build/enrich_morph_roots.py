#!/usr/bin/env python3
"""Safely supplement partial CAMeL BERT roots from the site's curated headwords.

CAMeL represents many weak or hamzated consonants with '#', e.g. qiyās:
ق.#.س and wājib: #.ج.ب. Silently discarding those roots makes a complete
morphology index search misleading; inventing a weak radical without
lexicographic support is worse.

This stage uses *only* the bounded hand-curated Gnamma dictionary, never a
blind character replacement. Unique lemma -> root correspondence is required;
verified complete model roots and reviewed entries are never overwritten.
The supplement is explicitly marked provisional and never labelled a
scholar-confirmed linguistic judgement.

Example:
 python3 daruri/build/enrich_morph_roots.py \
 --index /tmp/review/morph-daruri-v1.json \
 --output /tmp/review/morph-daruri-supplemented.json

The old model's root skeleton was not stored: such supplements are
'curated-lemma-only'. Future models preserve raw_root to allow additional
radical-position comparison. The script is offline and never deploys data.
"""
from __future__ import annotations
import argparse
import json
from collections import Counter
from pathlib import Path

from build_gnamma_morph_index import ROOT, fold, normalize_model_root

LEXICON = ROOT / "daruri" / "morph-lexicon.json"
ACCEPTED_POS = {"noun", "noun_prop", "verb", "adj", "adv", "noun_num"}
ACCEPTED_SOURCE = {"contextual-bert", "contextual-alternative"}


def root_hints(lex: dict) -> dict[str, str]:
    if lex.get("schema") != "gnamma-morph-lexicon-v1":
        raise ValueError("Incompatible curated Gnamma lexicon")
    groups: dict[str, set[str]] = {}
    for item in lex.get("entries", []):
        lemma, root = fold(item.get("lemma", "")), fold(item.get("root", ""))
        if lemma and root and len(root) in (3, 4, 5):
            groups.setdefault(lemma, set()).add(root)
    return {lemma: next(iter(roots)) for lemma, roots in groups.items()
            if len(roots) == 1}


def matches_partial_raw_root(raw: str, chosen_root: str) -> bool:
    """Only accept root consonants compatible with model's radial skeleton."""
    raw = str(raw or "").strip()
    if not raw or "#" not in raw:
        return False
    parts = raw.split(".")
    normalized = fold(chosen_root)
    if len(parts) != len(normalized):
        return False
    return all(part == "#" or fold(part) == expected
               for part, expected in zip(parts, normalized))


def enrich(index: dict, lexicon: dict) -> tuple[dict, dict]:
    if index.get("schema") != "gnamma-morph-v1" or not index.get("contextual"):
        raise ValueError("Only automated contextual candidate indexes can be supplemented")
    hints = root_hints(lexicon)
    stats = Counter()
    examples = []
    for record in index.get("records", []):
        for item in record.get("a", []):
            if not isinstance(item, list) or len(item) < 6:
                continue
            if item[5] not in ACCEPTED_SOURCE:
                continue
            if item[3]:
                stats["already_has_root"] += 1
                continue
            stats["missing_root"] += 1
            if item[4] not in ACCEPTED_POS:
                stats["nonlexical_pos"] += 1
                continue
            key = fold(item[2])
            expected = hints.get(key)
            if not expected:
                stats["not_in_curated_headwords"] += 1
                continue
            if len(item) == 6:
                item.append("")  # optional lexical sense ID
            if len(item) == 7:
                item.append({})
            if not isinstance(item[7], dict):
                raise ValueError("Malformed word-feature map; preserving source")
            features = item[7]
            raw_root = str(features.get("raw_root", "")).strip()
            if raw_root:
                raw_full = normalize_model_root(raw_root)
                if raw_full:
                    stats["complete_model_root_conflict"] += 1
                    continue
                if not matches_partial_raw_root(raw_root, expected):
                    stats["incompatible_model_radicals"] += 1
                    continue
                evidence = "curated-headword-and-partial-raw-root"
            else:
                evidence = "curated-headword-only"
            item[3] = expected
            features["root_origin"] = evidence
            features["root_verified"] = False
            stats["supplemented"] += 1
            if len(examples) < 16:
                examples.append({"token": item[1], "lemma": item[2],
                                 "root": expected, "evidence": evidence})
    stats["unique_curated_headwords"] = len(hints)
    index["rootSupplement"] = {
        "method": "unique-curated-lemma", "scholarlyValidated": False,
        "sourceLexicon": "daruri/morph-lexicon.json",
        "statistics": dict(stats), "examples": examples
    }
    index["classicalArabicValidated"] = False
    return index, index["rootSupplement"]


def main() -> None:
    cli = argparse.ArgumentParser()
    cli.add_argument("--index", type=Path, required=True)
    cli.add_argument("--lexicon", type=Path, default=LEXICON)
    cli.add_argument("--output", type=Path, required=True)
    args = cli.parse_args()
    public = ROOT / "daruri"
    destination = args.output.resolve()
    if destination.is_relative_to(public) or destination == args.index.resolve():
        cli.error("Supplement only a separate staging copy outside public daruri/")
    index = json.loads(args.index.read_text(encoding="utf-8"))
    lexicon = json.loads(args.lexicon.read_text(encoding="utf-8"))
    updated, report = enrich(index, lexicon)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(updated, ensure_ascii=False,
                          separators=(",", ":")) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    print("No human-revision status has been asserted and no public index altered.")


if __name__ == "__main__":
    main()
