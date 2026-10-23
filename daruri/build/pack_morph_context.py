#!/usr/bin/env python3
"""Pack source-verified CAMeL candidate morphology into mobile-sized indexes.

The full model index (usually tens of MB) is OFFLINE REVIEW MATERIAL.
The small search posting index maps normalized lemma/root keys to source
paragraph/token coordinates. Detailed analyses live in separately fetchable
shards. Packing never endorses a candidate as correct or modifies the reader.

Usage:
  python3 daruri/build/pack_morph_context.py \
    --index .morph-context-review/morph-daruri-v1.json \
    --out-dir .morph-context-review/packed
"""
from __future__ import annotations

import argparse
import json
from collections import defaultdict
from pathlib import Path

from build_gnamma_morph_index import fold, words, load_sources

SCHEMA = "gnamma-morph-postings-v2"
GOOD_SOURCES = {"contextual-bert", "reviewed"}


def pack(index: dict, text_by_id: dict[str, str], shard_size: int = 48) -> tuple[dict, list[list[dict]]]:
    if not index.get("contextual") or index.get("schema") != "gnamma-morph-v1":
        raise ValueError("Expected a CONTEXTUAL candidate index; cannot silently relabel curated analyses")
    if index.get("work") not in {"daruri", "mustasfa"}:
        raise ValueError("Unsupported work ID")
    if shard_size < 1 or shard_size > 256:
        raise ValueError("Shard size must be between 1 and 256")
    ids: list[str] = []
    lemma_postings = defaultdict(list)
    root_postings = defaultdict(list)
    forms: dict[str, dict[str, set[str]]] = {}
    occurrences = 0
    aligned = 0
    shards: list[list[dict]] = []
    current: list[dict] = []
    for record in index["records"]:
        loc = record.get("id")
        if loc not in text_by_id:
            raise ValueError(f"Source paragraph missing in canonical corpus: {loc!r}")
        if loc in ids:
            raise ValueError(f"Duplicate source paragraph ID: {loc!r}")
        ref = len(ids)
        ids.append(loc)
        original_words = words(text_by_id[loc])
        primary_positions = set()
        for entry in record["a"]:
            if not isinstance(entry, list) or len(entry) < 6:
                raise ValueError(f"Malformed analysis in {loc}")
            position, surface, lemma, root, pos, origin = entry[:6]
            if not isinstance(position, int) or position < 0 or position >= len(original_words):
                raise ValueError(f"Invalid source word coordinate in {loc}: {position!r}")
            if fold(surface) != fold(original_words[position]):
                raise ValueError(f"Source word drift in {loc} at word #{position}: {surface!r}")
            aligned += 1
            if origin not in GOOD_SOURCES:
                continue
            if position in primary_positions:
                raise ValueError(f"Several supposedly primary analyses at {loc}:{position}")
            primary_positions.add(position)
            occurrences += 1
            lemma_key, root_key = fold(lemma), fold(root)
            status = 1 if origin == "reviewed" else 0
            if lemma_key:
                lemma_postings[lemma_key].append([ref, position, status])
            if root_key:
                root_postings[root_key].append([ref, position, status])
            form_key = fold(surface)
            family = forms.setdefault(form_key, {"l": set(), "r": set()})
            if lemma_key:
                family["l"].add(lemma_key)
            if root_key:
                family["r"].add(root_key)
        current.append(record)
        if len(current) >= shard_size:
            shards.append(current)
            current = []
    if current:
        shards.append(current)
    if not ids:
        raise ValueError("No annotated records")
    if not occurrences:
        raise ValueError("Contextual index had no primary lexical analyses")
    compact = {
        "schema": SCHEMA, "work": index["work"],
        "annotator": index.get("annotator", "automated / unverified"),
        "contextual": True, "classicalArabicValidated": False,
        "fullIndexSource": "offline model candidate, NOT a scholarly-reviewed release",
        "ids": ids,
        "shardSize": shard_size,
        "detailPrefix": f"morph-{index['work']}-details-v2/",
        "l": dict(lemma_postings), "r": dict(root_postings),
        "f": {word: {"l": sorted(v["l"]), "r": sorted(v["r"])}
              for word, v in forms.items()},
        "summary": {
            "sourceSegments": len(ids), "searchableOccurrences": occurrences,
            "sourceAlignedAnalyses": aligned,
            "detailShards": len(shards)
        }
    }
    return compact, shards


def main() -> None:
    cli = argparse.ArgumentParser()
    cli.add_argument("--index", type=Path, required=True)
    cli.add_argument("--out-dir", type=Path,
                     default=Path(__file__).resolve().parents[2] / ".morph-context-review" / "packed")
    cli.add_argument("--shard-size", type=int, default=48)
    args = cli.parse_args()
    raw = json.loads(args.index.read_text(encoding="utf-8"))
    work = raw.get("work")
    if work not in {"daruri", "mustasfa"}:
        cli.error("Unsupported input work")
    source = dict(load_sources()[work])
    compact, shards = pack(raw, source, args.shard_size)
    # This name is deliberately distinct from the public curated v1 indexes.
    args.out_dir.mkdir(parents=True, exist_ok=True)
    index_path = args.out_dir / f"morph-{work}-search-v2.json"
    index_path.write_text(json.dumps(compact, ensure_ascii=False, separators=(",", ":")) + "\n",
                          encoding="utf-8")
    folder = args.out_dir / compact["detailPrefix"]
    folder.mkdir(exist_ok=True)
    for i, records in enumerate(shards):
        file = folder / f"{i:04d}.json"
        file.write_text(json.dumps({"schema": "gnamma-morph-detail-v2", "work": work,
                                    "shard": i, "records": records},
                                   ensure_ascii=False, separators=(",", ":")) + "\n",
                        encoding="utf-8")
    print(f"{work}: {compact['summary']}, compact={index_path.stat().st_size} bytes, "
          f"full details in {len(shards)} lazy shards")
    print("CANDIDATE ARTIFACTS ONLY — never publish or activate without separate "
          "human gold validation and source/corpus coverage review.")


if __name__ == "__main__":
    main()
