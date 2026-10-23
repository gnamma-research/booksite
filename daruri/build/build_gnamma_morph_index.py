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
    """Truly context-dependent sentence model, unlike CAMeL's MLE option.

    BERT is not intrinsically a Classical Arabic model. Review its outputs.
    """
    def __init__(self, include_all: bool):
        try:
            from camel_tools.disambig.bert import BERTUnfactoredDisambiguator
        except ImportError as ex:
            raise SystemExit("Install camel-tools and download the BERT model offline first: " + str(ex))
        self.model = BERTUnfactoredDisambiguator.pretrained(model_name="msa", use_gpu=False)
        curated = Curated()
        self.target_roots = {fold(row["root"]) for row in curated.lexicon}
        self.include_all = include_all

    def annotate(self, text: str):
        ts = words(text)
        if not ts:
            return [], 0
        values = []
        # Split long prose into modest windows; position remains relative to the
        # ORIGINAL paragraph. No matching may cross paragraphs.
        for offset in range(0, len(ts), 100):
            batch = ts[offset:offset + 100]
            disambiguated = self.model.disambiguate(batch)
            if len(disambiguated) != len(batch):
                raise RuntimeError("BERT returned unexpected word count")
            for j, result in enumerate(disambiguated):
                if not result.analyses:
                    continue
                item = result.analyses[0].analysis
                lexical_id = str(item.get("lex", ""))
                lemma = normalize_model_lemma(lexical_id)
                root = normalize_model_root(item.get("root", ""))
                pos = str(item.get("pos", ""))
                if not lemma:
                    continue
                if not self.include_all and fold(root) not in self.target_roots:
                    continue
                # Seventh field is an optional sense-bearing lexical ID.
                # It distinguishes homographs with the same printed headword.
                values.append([offset + j, batch[j], lemma, root, pos,
                               "contextual-bert", lexical_id])
        return values, len(ts)


def build_index(work: str, rows: list[tuple[str, str]], annotator, mode: str):
    records = []
    summary = Counter()
    for locator, text in rows:
        a, n = annotator.annotate(text)
        summary["tokens"] += n
        summary["annotations"] += len(a)
        summary["ambiguous"] += sum(entry[5] == "ambiguous" for entry in a)
        if a:
            records.append({"id": locator, "a": a})
    summary["records"] = len(records)
    summary["recordsProcessed"] = len(rows)
    return {
        "schema": "gnamma-morph-v1", "work": work,
        "annotator": "CAMeL BERT MSA / automated and unchecked" if mode == "bert" else "curated-v1",
        "contextual": mode == "bert",
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
                     help="Only for BERT; index every analysed root, not just curated root families")
    cli.add_argument("--out-dir", type=Path, default=ROOT / "daruri")
    args = cli.parse_args()
    tool = Curated() if args.mode == "curated" else ContextualBERT(args.include_all)
    args.out_dir.mkdir(parents=True, exist_ok=True)
    for work, records in load_sources().items():
        result = build_index(work, records, tool, args.mode)
        path = args.out_dir / f"morph-{work}-v1.json"
        path.write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
        print(work, result["summary"], path.stat().st_size, "bytes")
    print("Review and QA the exact outputs before copying into public daruri/.")


if __name__ == "__main__":
    main()
