#!/usr/bin/env python3
"""Build versioned Gnamma Arabic morphological indexes offline, never in the browser.

Default 'curated' mode is intentionally conservative and model-free.
'bert' mode requires CAMeL Tools plus an installed BERT disambiguator and
runs sentence-context analysis. The current public snapshots use 'curated'.
Do not label the MLE disambiguator 'contextual': it does not use neighbours.

From repository root:
  python daruri/build/build_gnamma_morph_index.py
  python daruri/build/build_gnamma_morph_index.py --mode bert --out-dir /tmp/morph-review

Review output before publishing. Never upload licensed language-model weights.
"""
from __future__ import annotations
import argparse
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ARABIC = re.compile(r"[\u0621-\u064a]")
WORD = re.compile(r"[\w\u064b-\u065f\u0670]+", re.UNICODE)
VOWELS = re.compile(r"[\u0300-\u036f\u064b-\u065f\u0670\u06d6-\u06ed\u0640]")
NORMALIZE = str.maketrans(dict(zip("أإآٱىؤئ", "اااايوي")))
def normalize_model_lemma(value: object) -> str:
    """CAMeL lex IDs are e.g. شارِع_1 versus شارِع_2.

    Preserve the complete ID separately; the reader displays the actual Arabic
    headword without the sense suffix or romanized inflection marker.
    """
    text = str(value or "").strip()
    text = re.sub(r"_[0-9]+$", "", text)
    text = re.sub(r"-[a-z]+$", "", text)
    return text if ARABIC.search(text) else ""


def normalize_model_root(value: object) -> str:
    """Convert CAMeL dotted roots ش.ر.ع to queryable شرع.

    Non-lexical placeholders (NTWS, #, or missing consonants) are NOT roots.
    An empty root is legitimate for an unrooted lemma/particle.
    """
    text = str(value or "").strip()
    if not text or "#" in text or not ARABIC.search(text):
        return ""
    root = re.sub(r"[.\s\u064b-\u065f\u0670]", "", text)
    return root if re.fullmatch(r"[\u0621-\u064a]{3,5}", root) else ""


CLITICS = ("وال", "فال", "بال", "كال", "لل", "ال", "و", "ف", "ب", "ك", "ل")
SUFFIXES = ("هما", "هم", "هن", "ها", "نا", "كم", "كن", "ه", "ك", "ي")


def fold(text: str) -> str:
    return VOWELS.sub("", str(text).lower()).translate(NORMALIZE).strip()


def words(text: str) -> list[str]:
    return [m.group(0) for m in WORD.finditer(text) if ARABIC.search(m.group(0))]


def contextual_windows(text: str, max_words: int = 90) -> list[tuple[int, list[str]]]:
    """Natural punctuation boundaries, exact original token ordinals.

    Do not concatenate paragraphs; preserve the published token numbering even
    when there are no spaces between punctuation and Arabic words.
    """
    tokens = [m for m in WORD.finditer(text) if ARABIC.search(m.group(0))]
    output: list[tuple[int, list[str]]] = []
    start = 0
    for i, token in enumerate(tokens):
        next_start = tokens[i + 1].start() if i + 1 < len(tokens) else len(text)
        gap = text[token.end():next_start]
        at_boundary = bool(re.search(r"[.؟!؛\n]", gap))
        if i + 1 - start >= max_words or at_boundary or i + 1 == len(tokens):
            output.append((start, [x.group(0) for x in tokens[start:i + 1]]))
            start = i + 1
    return output


MODEL_FEATURES = ("diac", "gloss", "cas", "stt", "asp", "vox", "mod",
                  "gen", "num", "per", "pattern", "prc0", "prc1", "prc2",
                  "prc3", "enc0", "d3seg")
MODEL_SKIP = {"", "na", "None", "NOAN", "NO_ANALYSIS", "0", "-"}


def model_features(analysis: dict) -> dict[str, str]:
    """Small, displayable morphology metadata; model output, not an edition."""
    return {key: str(analysis[key])[:180] for key in MODEL_FEATURES
            if key in analysis and str(analysis[key]) not in MODEL_SKIP}


def load_sources() -> dict[str, list[tuple[str, str]]]:
    source = (ROOT / "daruri/edition-r3-20261020.js").read_text(encoding="utf-8")
    match = re.search(
        r'document\.getElementById\("editionData"\)\.textContent\s*=\s*("(?:\\.|[^"\\])*")\s*;',
        source, re.S)
    if not match:
        raise RuntimeError("Cannot find canonical Daruri reader payload")
    book = json.loads(json.loads(match.group(1)))
    daruri = [
        (f"passage:{sec['id']}:{idx}", segment.get("ar") or segment.get("vocalized") or "")
        for sec in book["sections"] for idx, segment in enumerate(sec.get("segments", []))
    ]
    mustasfa = json.loads((ROOT / "arabic/full-arabic-pages.json").read_text(encoding="utf-8"))
    if mustasfa.get("schema") != "gnamma-mustasfa-arabic-v1":
        raise RuntimeError("Invalid Mustasfa source witness")
    arabic = [
        (f"arabic:{page['id']}:{idx}", paragraph)
        for page in mustasfa["pages"] for idx, paragraph in enumerate(page["paragraphs"])
    ]
    return {"daruri": daruri, "mustasfa": arabic}


class Curated:
    def __init__(self):
        raw = json.loads((ROOT / "daruri/morph-lexicon.json").read_text(encoding="utf-8"))
        if raw["schema"] != "gnamma-morph-lexicon-v1":
            raise RuntimeError("Morphology lexicon schema mismatch")
        self.lexicon = raw["entries"]
        self.map = {}
        for entry in self.lexicon:
            for form in [entry["lemma"], *entry.get("forms", [])]:
                key = fold(form)
                possibilities = self.map.setdefault(key, [])
                if not any(old["lemma"] == entry["lemma"] and old["pos"] == entry["pos"] for old in possibilities):
                    possibilities.append(entry)

    def candidates(self, token: str) -> list[dict]:
        normalized = fold(token)
        tries = [normalized]
        tries += [normalized[len(prefix):] for prefix in CLITICS
                  if normalized.startswith(prefix) and len(normalized) > len(prefix) + 2]
        for current in list(tries):
            tries += [current[:-len(suffix)] for suffix in SUFFIXES
                      if current.endswith(suffix) and len(current) > len(suffix) + 2]
        options = []
        for candidate in dict.fromkeys(tries):
            for entry in self.map.get(candidate, []):
                if not any(e["lemma"] == entry["lemma"] and e["pos"] == entry["pos"] for e in options):
                    options.append(entry)
        return options

    def annotate(self, text: str):
        seq = words(text)
        values = []
        for i, w in enumerate(seq):
            possibilities = self.candidates(w)
            if not possibilities:
                continue
            chosen = possibilities[0] if len(possibilities) == 1 else None
            source = "curated"
            if len(possibilities) > 1:
                prev = fold(seq[i - 1]) if i else ""
                next_word = fold(seq[i + 1]) if i + 1 < len(seq) else ""
                verb = next((x for x in possibilities if fold(x["lemma"]) == "كتب" and x["pos"] == "verb"), None)
                noun = next((x for x in possibilities if fold(x["lemma"]) == "كتاب" and x["pos"] == "noun"), None)
                if verb and noun:
                    if prev in {"قد", "لم", "لن", "سوف"} or next_word in {"الدرس", "رسالة", "رساله"}:
                        chosen = verb
                    elif next_word in {"القديمة", "الجديدة", "المفيدة"} or prev in {"هذه", "تلك"}:
                        chosen = noun
                    if chosen:
                        source = "curated-context"
            for candidate in ([chosen] if chosen else possibilities[:3]):
                values.append([i, w, candidate["lemma"], candidate["root"],
                               candidate["pos"], source if chosen else "ambiguous"])
        return values, len(seq)


class ContextualBERT:
    """Context-aware *MSA* morphological ranking, not Classical-Arabic ground truth.

    Default model coverage is all analyzable words. Only the highest-ranked
    lexical analysis participates in root/lemma search; other ranked candidates
    are retained solely for an inspectable word-in-context panel.
    """
    def __init__(self, include_all: bool = True, top: int = 2,
                 use_gpu: bool = False, batch_size: int = 16):
        try:
            from camel_tools.disambig.bert import BERTUnfactoredDisambiguator
        except ImportError as ex:
            raise SystemExit(
                "Install camel-tools and its disambig-bert-unfactored-msa "
                "dataset before using --mode bert: " + str(ex))
        self.model = BERTUnfactoredDisambiguator.pretrained(
            model_name="msa", top=max(1, min(top, 3)),
            use_gpu=use_gpu, batch_size=batch_size)
        curated = Curated()
        self.target_roots = {fold(row["root"]) for row in curated.lexicon}
        self.include_all = include_all

    def annotate(self, text: str):
        tokens = words(text)
        if not tokens:
            return [], 0
        values = []
        for offset, batch in contextual_windows(text):
            disambiguated = self.model.disambiguate(batch)
            if len(disambiguated) != len(batch):
                raise RuntimeError("BERT returned unexpected word count")
            for j, result in enumerate(disambiguated):
                emitted = set()
                for rank, candidate in enumerate(result.analyses[:3]):
                    item = candidate.analysis
                    # CAMeL sometimes supplies a backoff/NO_ANALYSIS tag.
                    # A guessed 'lemma' is NOT a trustworthy lexical match.
                    if item.get("source") in ("backoff", "foreign", "digit", "punct"):
                        continue
                    lexical_id = str(item.get("lex", ""))
                    lemma = normalize_model_lemma(lexical_id)
                    root = normalize_model_root(item.get("root", ""))
                    pos = str(item.get("pos", ""))
                    if not lemma:
                        continue
                    if not self.include_all and fold(root) not in self.target_roots:
                        continue
                    features = model_features(item)
                    unique = (fold(lemma), fold(root), pos, lexical_id,
                              features.get("cas"), features.get("mod"), features.get("asp"))
                    if unique in emitted:
                        continue
                    emitted.add(unique)
                    source = "contextual-bert" if rank == 0 else "contextual-alternative"
                    # Keep the actual rank; a rank score is not a calibrated
                    # probability and must never be displayed as confidence %.
                    features["rank"] = rank + 1
                    values.append([offset + j, batch[j], lemma, root, pos,
                                   source, lexical_id, features])
        return values, len(tokens)

def build_index(work: str, rows: list[tuple[str, str]], annotator, mode: str):
    records = []
    summary = Counter()
    for processed, (locator, text) in enumerate(rows, 1):
        a, n = annotator.annotate(text)
        if mode == "bert" and (processed == 1 or processed % 50 == 0 or processed == len(rows)):
            print(f"{work}: analysed {processed}/{len(rows)} published passages; "
                  f"{summary['tokens'] + n} word tokens processed", flush=True)
        summary["tokens"] += n
        summary["annotations"] += len(a)
        summary["analysedTokens"] += len({entry[0] for entry in a
                                           if entry[5] != "contextual-alternative"})
        summary["alternatives"] += sum(entry[5] == "contextual-alternative" for entry in a)
        summary["ambiguous"] += sum(entry[5] == "ambiguous" for entry in a)
        if a:
            records.append({"id": locator, "a": a})
    summary["records"] = len(records)
    summary["recordsProcessed"] = len(rows)
    return {
        "schema": "gnamma-morph-v1", "work": work,
        "annotator": "CAMeL BERT MSA / automated and unchecked" if mode == "bert" else "curated-v1",
        "contextual": mode == "bert",
        "classicalArabicValidated": False,
        "coverage": ("Automated sentence-context analysis; Classical Arabic accuracy is unverified; "
                     "licensed model remains outside web bundle" if mode == "bert" else
                     "Curated lemma/root forms only; a few explicitly labelled contextual rules; "
                     "not complete contextual morphology"),
        "summary": dict(summary), "records": records
    }


def main():
    cli = argparse.ArgumentParser()
    cli.add_argument("--mode", choices=("curated", "bert"), default="curated")
    cli.add_argument("--include-all", action="store_true",
                     help="Deprecated compatibility flag: contextual mode includes all lexical tokens by default")
    cli.add_argument("--curated-roots-only", action="store_true",
                     help="Debug/model evaluation mode only: limit BERT output to known root families")
    cli.add_argument("--top", type=int, choices=(1, 2, 3), default=2,
                     help="Ranked analyses per token; only the top match is searchable")
    cli.add_argument("--gpu", action="store_true", help="Use CUDA if installed")
    cli.add_argument("--work", choices=("all", "daruri", "mustasfa"), default="all")
    cli.add_argument("--max-paragraphs", type=int, default=0,
                     help="Smoke test only: process at most N paragraphs of each work")
    cli.add_argument("--out-dir", type=Path, default=None)
    args = cli.parse_args()
    if args.mode == "curated" and args.curated_roots_only:
        cli.error("--curated-roots-only requires --mode bert")
    if args.max_paragraphs < 0:
        cli.error("--max-paragraphs must be nonnegative")
    if args.mode == "bert" and args.out_dir is None:
        args.out_dir = ROOT / ".morph-context-review"
    if args.out_dir is None:
        args.out_dir = ROOT / "daruri"
    if args.mode == "bert" and args.out_dir.resolve() == (ROOT / "daruri").resolve():
        cli.error("Contextual candidates may not overwrite the published curated indexes; choose a review output directory")
    tool = Curated() if args.mode == "curated" else ContextualBERT(
        include_all=not args.curated_roots_only, top=args.top, use_gpu=args.gpu)
    args.out_dir.mkdir(parents=True, exist_ok=True)
    for work, records in load_sources().items():
        if args.work != "all" and args.work != work:
            continue
        if args.max_paragraphs:
            records = records[:args.max_paragraphs]
        result = build_index(work, records, tool, args.mode)
        path = args.out_dir / f"morph-{work}-v1.json"
        path.write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
        print(work, result["summary"], path.stat().st_size, "bytes")
    print("CANDIDATES ONLY. Review against historical Arabic gold data, validate "
          "source-token alignment and licensing before publishing anything. "
          "No public morphology index was modified by this command.")


if __name__ == "__main__":
    main()
