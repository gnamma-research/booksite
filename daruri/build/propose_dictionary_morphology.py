#!/usr/bin/env python3
"""Audit contextual morphology against Gnamma's sourced legal terminology.

This is an OFFLINE, READ-ONLY proposal generator, not automatic correction.
Lexical entries can indicate a candidate root or technical sense. Even an
earlier lexicon cannot prove a given occurrence means that sense. The report
never overwrites an original model analysis or the published reader.

From the repository root:
 python3 daruri/build/propose_dictionary_morphology.py \
   --index /tmp/morph-review/morph-daruri-v1.json \
   --output /tmp/morph-review/daruri-dictionary-proposals.csv
"""
from __future__ import annotations
import argparse
import csv
import importlib.util
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "daruri" / "build" / "build_gnamma_morph_index.py"
spec = importlib.util.spec_from_file_location("gnamma_morph_evidence_builder", SOURCE)
assert spec and spec.loader
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)
FOLD = builder.fold
# These are lookup candidates, NEVER assumed to be correct segmentation.
PREFIXES = ("", "ال", "و", "ف", "ب", "ل", "ك",
            "وال", "فال", "بال", "كال", "لل")
ARABIC_ROOT = re.compile(r"^[\u0621-\u064a]{3,5}$")


def sourced_lexicon(dictionary: dict) -> dict[str, list[dict]]:
    """Index headwords and their *explicit* editorial Arabic aliases only.

    Keeping E/L/M chronologies and exact source identifiers avoids presenting
    later, comparative legal definitions as Ibn Rushd's own terminology.
    The editorial term root is a REVIEW SUGGESTION, never morphological gold.
    """
    terms = dictionary.get("terms", {})
    sources = dictionary.get("sources", {})
    if not isinstance(terms, dict) or not isinstance(sources, dict):
        raise ValueError("Invalid dictionary registry")
    by_form: dict[str, list[dict]] = defaultdict(list)
    for key, term in terms.items():
        if not isinstance(term, dict):
            continue
        headword = term.get("lemma", "")
        if not isinstance(headword, str) or not headword.strip():
            continue
        source_refs = []
        chron = Counter()
        for source_id in term.get("sources", []):
            src = sources.get(source_id)
            if not isinstance(src, dict):
                continue
            kind = src.get("chronology") if src.get("chronology") in ("E", "L", "M") else "U"
            chron[kind] += 1
            source_refs.append({
                "id": source_id, "author": src.get("author", ""),
                "work": src.get("work", ""),
                "url": src.get("url", ""),
                "chronology": kind,
                "entry": src.get("entry", "")
            })
        root = FOLD(term.get("root") or "")
        # A historical technical glossary can attest a lexical expression,
        # but does not automatically justify a stem or grammatical root.
        if not ARABIC_ROOT.fullmatch(root):
            root = ""
        attested_sections = set()
        for hit in term.get("attested", []):
            if isinstance(hit, dict) and hit.get("section") is not None:
                attested_sections.add(str(hit["section"]))
        aliases = term.get("aliasesAr", [])
        if not isinstance(aliases, list):
            aliases = []
        forms = [(headword, "headword")] + [
            (alias, "explicit-alias") for alias in aliases if isinstance(alias, str)
        ]
        for word, origin in forms:
            lemma_key = FOLD(word)
            if not lemma_key:
                continue
            evidence = {
                "term": key, "lemma": headword,
                "root": root, "match": origin,
                "sources": source_refs, "chronology": dict(chron),
                "attested_sections": attested_sections,
                "comparison": term.get("comparison", "")
            }
            for prefix in PREFIXES:
                matched = FOLD(prefix + lemma_key)
                if matched:
                    # Dedupe the same editorial term/prefix route.
                    bucket = by_form[matched]
                    if not any(x["term"] == key for x in bucket):
                        bucket.append({**evidence,
                                       "match": origin if not prefix else "possible-clitic"})
    return dict(by_form)


def orthographic_warning(surface: str, analysis: list) -> str:
    """Retain visible hamza orthography separately from search normalization."""
    if not analysis or len(analysis) < 6:
        return ""
    features = analysis[7] if len(analysis) >= 8 and isinstance(analysis[7], dict) else {}
    # Compare only independent first-letter hamza seats; a real affix needs
    # its own segmentation audit, so avoid general 'stem' substitutions.
    s = re.sub(r"[\u064b-\u065f\u0670\u0640]", "", surface)
    d = re.sub(r"[\u064b-\u065f\u0670\u0640]", "", str(features.get("diac", "")))
    if s[:1] in ("أ", "إ") and d[:1] in ("أ", "إ") and s[0] != d[0]:
        return "written-hamza-versus-model-diacritization"
    return ""


def propose(index: dict, texts: dict[str, str], lexicon: dict[str, list[dict]]):
    """Return evidence-linked review rows and totals; never rewrite candidates."""
    if index.get("schema") != "gnamma-morph-v1" or not index.get("contextual"):
        raise ValueError("Only contextual machine candidates can be audited")
    work = index.get("work")
    if work not in ("daruri", "mustasfa"):
        raise ValueError("Unknown work")
    rows = []
    totals = Counter()
    for passage in index.get("records", []):
        segment_id = passage["id"]
        if segment_id not in texts:
            raise ValueError(f"Canonical paragraph missing: {segment_id}")
        tokens = builder.words(texts[segment_id])
        analyses: dict[int, list[list]] = defaultdict(list)
        for analysis in passage.get("a", []):
            if not isinstance(analysis, list) or len(analysis) < 6:
                raise ValueError(f"Malformed morphology record: {segment_id}")
            i = analysis[0]
            if not isinstance(i, int) or not 0 <= i < len(tokens) or FOLD(analysis[1]) != FOLD(tokens[i]):
                raise ValueError(f"Source text/token disagreement at {segment_id}:{i}")
            analyses[i].append(analysis)
        section = segment_id.split(":")[1] if work == "daruri" else ""
        for i, token in enumerate(tokens):
            alternatives = analyses.get(i, [])
            primary = next((a for a in alternatives if a[5] not in (
                "contextual-alternative", "contextual-backoff", "ambiguous")), None)
            if not primary:
                totals["missing_model_analysis"] += 1
            form_key = FOLD(token)
            entries = lexicon.get(form_key, [])
            if not entries and not primary:
                continue
            flags = set()
            if primary:
                issue = orthographic_warning(token, primary)
                if issue:
                    flags.add(issue)
                # Typical lexicalized 'some/part' is erroneously segmented as
                # bi- + bite by the MSA model. This is a review trigger only.
                features = primary[7] if len(primary) >= 8 and isinstance(primary[7], dict) else {}
                if form_key == FOLD("بعض") and (
                    FOLD(primary[2]) == FOLD("عض") or
                    "bi_prep" in str(features.get("prc1", ""))):
                    flags.add("suspect-partitive-clitic-analysis")
            elif entries:
                flags.add("dictionary-word-without-model-analysis")
            for entry in entries:
                if primary:
                    if entry["root"] and not FOLD(primary[3]):
                        flags.add("technical-lexicon-has-root-model-omits")
                    elif entry["root"] and FOLD(primary[3]) != entry["root"]:
                        flags.add("root-disagreement-needs-adjudication")
                    # Dictionary heads can be lexical or editorial (and aliases
                    # may include plurals). A different lemma is NOT proof of
                    # a morphological model error.
                    if entry["match"] == "headword" and FOLD(primary[2]) != FOLD(entry["lemma"]):
                        flags.add("model-versus-dictionary-headword")
                flags.add("technical-sense-evidence-available")
                if work == "daruri" and section in entry["attested_sections"]:
                    flags.add("author-attested-term-in-section")
            if not flags:
                continue
            totals["flagged_occurrences"] += 1
            for flag in flags:
                totals["flag_" + flag] += 1
            # Aggregate and preserve source IDs; no entire quoted dictionary
            # texts are copied into an inference or public index.
            source_list = []
            candidate_roots = set()
            for entry in entries:
                if entry["root"]:
                    candidate_roots.add(entry["root"])
                source_list.extend(entry["sources"])
            deduped = list({src["id"]: src for src in source_list}.values())
            start, end = max(0, i - 8), min(len(tokens), i + 9)
            rows.append({
                "work": work, "passage_id": segment_id, "token_position": i,
                "surface": token,
                "context": " ".join(tokens[start:end]),
                "model_lemma": primary[2] if primary else "",
                "model_root": primary[3] if primary else "",
                "model_pos": primary[4] if primary else "",
                "model_gloss": (primary[7].get("gloss", "") if primary and
                                len(primary) >= 8 and isinstance(primary[7], dict) else ""),
                "potential_term": "; ".join(sorted({e["term"] for e in entries})),
                "lexicon_headwords": "; ".join(sorted({e["lemma"] for e in entries})),
                "suggested_roots_for_review": "; ".join(sorted(candidate_roots)),
                "review_flags": "; ".join(sorted(flags)),
                "source_evidence": json.dumps(deduped, ensure_ascii=False),
                "editorial_chronology_warning":
                    "Later dictionaries are comparisons, not evidence of the author's intended sense.",
                "reviewed_lemma": "", "reviewed_root": "",
                "reviewed_pos": "", "reviewed_sense": "",
                "reviewer": "", "review_notes": ""
            })
    totals["candidate_occurrences"] = sum(len(builder.words(texts[rid]))
        for rid in (index.get("processedIds") or [r["id"] for r in index.get("records", [])]))
    return rows, {"missing_model_analysis": 0, **dict(totals)}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--index", type=Path, required=True)
    parser.add_argument("--dictionary", type=Path, default=ROOT / "daruri/dictionary-data.json")
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--summary", type=Path)
    args = parser.parse_args()
    raw = json.loads(args.index.read_text(encoding="utf-8"))
    dictionary = json.loads(args.dictionary.read_text(encoding="utf-8"))
    text_map = dict(builder.load_sources()[raw["work"]])
    rows, summary = propose(raw, text_map, sourced_lexicon(dictionary))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    fields = ["work", "passage_id", "token_position", "surface", "context",
              "model_lemma", "model_root", "model_pos", "model_gloss",
              "potential_term", "lexicon_headwords", "suggested_roots_for_review",
              "review_flags", "source_evidence", "editorial_chronology_warning",
              "reviewed_lemma", "reviewed_root", "reviewed_pos",
              "reviewed_sense", "reviewer", "review_notes"]
    with args.output.open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    print("Dictionary suggestions only: no morphology or published reader was rewritten.")
    if args.summary:
        args.summary.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n",
                                encoding="utf-8")


if __name__ == "__main__":
    main()
