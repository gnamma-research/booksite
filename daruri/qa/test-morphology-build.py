#!/usr/bin/env python3
"""Dependency-free morphology index normalisation and provenance checks.

Run from repository root:
    python3 daruri/qa/test-morphology-build.py

Full contextual-model regression tests require an installed CAMeL MSA model
and a separately adjudicated Classical-Arabic gold set.
"""
from __future__ import annotations

import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
source = ROOT / "daruri" / "build" / "build_gnamma_morph_index.py"
spec = importlib.util.spec_from_file_location("gnamma_morph_build", source)
assert spec and spec.loader
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

# CAMeL analyses commonly encode dotted consonantal roots and dictionary
# headword sense identifiers; these must not break browsing/search indexes.
for original, expected in [
    ("ش.ر.ع", "شرع"),
    ("ك.ت.ب", "كتب"),
    ("شَرَعَ", "شرع"),
    ("ع.ل.ل", "علل"),
    ("NTWS", ""),
    ("#NA#", ""),
    ("", ""),
    ("a.b.c", ""),
    ("ا", ""),
]:
    actual = module.normalize_model_root(original)
    assert actual == expected, f"root {original!r}: {actual!r} != {expected!r}"

for original, expected in [
    ("شارِع_1", "شارِع"),
    ("شارِع_2", "شارِع"),
    ("القياس_3", "القياس"),
    ("عمل", "عمل"),
    ("unknown", ""),
    ("", ""),
]:
    actual = module.normalize_model_lemma(original)
    assert actual == expected, f"lemma {original!r}: {actual!r} != {expected!r}"

curated = module.Curated()
assert len(curated.lexicon) >= 50
for text in ("والاجتهاد في القياس", "كتب العلم", "والعلم بالقياس"):
    analysis, tokens = curated.annotate(text)
    assert tokens == len(module.words(text))
    for item in analysis:
        assert len(item) == 6
        assert 0 <= item[0] < tokens
        assert item[5] in {"curated", "curated-context", "ambiguous"}

# The published indexes MUST continue to describe themselves truthfully.
for work in ("daruri", "mustasfa"):
    with (ROOT / "daruri" / f"morph-{work}-v1.json").open(encoding="utf-8") as file:
        index = json.load(file)
    assert index["schema"] == "gnamma-morph-v1"
    assert index["work"] == work
    assert index.get("contextual") is False, (
        f"{work}: do not mark unpublished model output as contextual"
    )
    assert "curated" in index.get("annotator", "").lower()
    assert index.get("records")

review_source = ROOT / "daruri" / "build" / "export_morph_review.py"
review_spec = importlib.util.spec_from_file_location("gnamma_morph_review", review_source)
assert review_spec and review_spec.loader
review = importlib.util.module_from_spec(review_spec)
review_spec.loader.exec_module(review)
review_sample = {
    "schema": "gnamma-morph-v1",
    "work": "daruri",
    "records": [
        {"id": "passage:1:0", "a": [
            [0, "العلم", "عِلْم", "علم", "noun", "ambiguous"],
            [0, "العلم", "عَلِمَ", "علم", "verb", "ambiguous"]
        ]}
    ]
}
sheet = review.sample_review_rows(review_sample, {"passage:1:0": "العلم والكتب"}, 1)
assert len(sheet) == 1
assert sheet[0]["surface"] == "العلم"
assert sheet[0]["ambiguous"] == "yes"
assert sheet[0]["reviewed_lemma"] == ""
assert "والكتب" in sheet[0]["context"]

# Sentence windows preserve the original published token positions.
windows = module.contextual_windows("كتب العلم؟ ثم كتب الدرس.", max_words=2)
assert windows == [
    (0, ["كتب", "العلم"]),
    (2, ["ثم", "كتب"]),
    (4, ["الدرس"]),
], windows

# Exercise the actual contextual annotator without downloading BERT weights.
# Fake output tests the indexing contract, NOT Arabic linguistic accuracy.
from types import SimpleNamespace


class FakeDisambiguator:
    def disambiguate(self, batch):
        output = []
        for surface in batch:
            primary = SimpleNamespace(analysis={
                "lex": "كاتِب_1", "root": "ك.ت.ب", "pos": "noun",
                "source": "lex", "diac": surface, "cas": "n",
                "gloss": "writer", "d3seg": surface,
            })
            alternate = SimpleNamespace(analysis={
                "lex": "كِتاب_2", "root": "ك.ت.ب", "pos": "noun",
                "source": "lex", "cas": "a", "gloss": "book",
            })
            output.append(SimpleNamespace(analyses=[primary, alternate]))
        return output


model = module.ContextualBERT.__new__(module.ContextualBERT)
model.model = FakeDisambiguator()
model.include_all = True
model.target_roots = set()
annotated, n = model.annotate("كتب العلم؟ ثم كتب.")
assert n == 4
assert sorted({entry[0] for entry in annotated}) == [0, 1, 2, 3]
assert len(annotated) == 8
for entry in annotated:
    assert len(entry) == 8, entry
    assert entry[2] in {"كاتِب", "كِتاب"}
    assert entry[3] == "كتب"
    assert entry[5] in {"contextual-bert", "contextual-alternative"}
    assert entry[6].endswith(("_1", "_2"))
    assert entry[7]["rank"] in (1, 2)
assert all(row[5] == "contextual-bert" for row in annotated[::2])
assert all(row[5] == "contextual-alternative" for row in annotated[1::2])
fake_index = module.build_index("daruri", [("passage:1:0", "كتب العلم")], model, "bert")
assert fake_index["contextual"] is True
assert fake_index["classicalArabicValidated"] is False
assert fake_index["summary"]["tokens"] == 2
assert fake_index["summary"]["analysedTokens"] == 2
assert fake_index["summary"]["alternatives"] == 2

# Exercise the gold-sheet exporter and the review-quality gate without
# pretending these synthetic records establish actual Arabic accuracy.
review_source = ROOT / "daruri" / "build" / "export_morph_review.py"
review_spec = importlib.util.spec_from_file_location("gnamma_morph_review_export", review_source)
review_mod = importlib.util.module_from_spec(review_spec)
review_spec.loader.exec_module(review_mod)
rows = review_mod.sample_review_rows(fake_index, {"passage:1:0": "كتب العلم"}, 2)
assert len(rows) == 2 and all(row["reviewed_lemma"] == "" for row in rows)
for row in rows:
    row.update({"reviewed_lemma": "كاتِب", "reviewed_root": "كتب",
                "reviewed_pos": "noun", "reviewed_lexical_id": "كاتِب_1",
                "judgement": "confirmed", "reviewer": "synthetic-test-only"})
eval_source = ROOT / "daruri" / "build" / "evaluate_morph_review.py"
eval_spec = importlib.util.spec_from_file_location("gnamma_morph_quality_eval", eval_source)
eval_mod = importlib.util.module_from_spec(eval_spec)
eval_spec.loader.exec_module(eval_mod)
quality = eval_mod.evaluate(fake_index, rows, min_reviewed=2,
                            min_exact_accuracy=1.0)
assert quality["release_gate_passed"] is True
assert quality["sense_accuracy"] == 1.0
rows[0]["reviewed_lemma"] = "كِتاب"
bad = eval_mod.evaluate(fake_index, rows, min_reviewed=2,
                        min_exact_accuracy=0.9)
assert bad["release_gate_passed"] is False
assert bad["exact_accuracy"] == 0.5

# Mobile-safe indexed search postings must be much smaller than detailed
# grammatical feature records. Preserve exact token coordinates and never index
# speculative alternatives as if they were confirmed forms.
import sys
sys.path.insert(0, str((ROOT / "daruri" / "build").resolve()))
pack_source = ROOT / "daruri" / "build" / "pack_morph_context.py"
pack_spec = importlib.util.spec_from_file_location("gnamma_morph_pack", pack_source)
pack_mod = importlib.util.module_from_spec(pack_spec)
pack_spec.loader.exec_module(pack_mod)
compact, shards = pack_mod.pack(fake_index, {"passage:1:0": "كتب العلم"}, shard_size=1)
assert compact["schema"] == "gnamma-morph-postings-v2"
assert compact["summary"]["searchableOccurrences"] == 2
assert compact["summary"]["sourceAlignedAnalyses"] == 4
assert len(shards) == 1
assert compact["l"]["كاتب"] == [[0, 0, 0], [0, 1, 0]]
assert compact["r"]["كتب"] == [[0, 0, 0], [0, 1, 0]]
assert "كتاب" not in compact["l"], "Top-2 guesses may not enter lemma search"
assert compact["f"]["كتب"]["l"] == ["كاتب"]
bad_index = json.loads(json.dumps(fake_index, ensure_ascii=False))
bad_index["records"][0]["a"][0][1] = "مختلف"
try:
    pack_mod.pack(bad_index, {"passage:1:0": "كتب العلم"})
except ValueError as exc:
    assert "Source word drift" in str(exc)
else:
    raise AssertionError("Source-drift must fail index packing")
try:
    pack_mod.pack(module.build_index("daruri",
       [("passage:1:0", "كتب العلم")], module.Curated(), "curated"),
       {"passage:1:0": "كتب العلم"})
except ValueError:
    pass
else:
    raise AssertionError("Do not relabel a curated index as contextual")

print("PASS: morphology source windows, contextual alternatives, review sheets and scholarly quality gate")


