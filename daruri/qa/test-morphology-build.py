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

print("PASS: morphology lexical/root normalization, provenance and curated index invariants")
