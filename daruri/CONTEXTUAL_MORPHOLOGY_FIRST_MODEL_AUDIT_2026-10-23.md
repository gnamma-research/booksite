# Darūrī contextual morphology — first full model audit (23 October 2026)

**Status:** machine-generated MSA BERT candidates; *not a verified classical Arabic edition*.
GitHub Actions [full candidate run](https://github.com/gnamma-research/booksite/actions/runs/39883804764).
The reader still uses the separately published, explicitly partial curated morphology index.

## What finished

The complete Darūrī witness used by the existing reader was processed:

| Measure | Result |
| :-- | --: |
| Published source segments | 416 |
| Arabic tokens | 21,686 |
| Tokens with primary analyses | 21,326 (98.34% coverage, **not accuracy**) |
| Ranked alternative analyses | 13,149 |
| Full offline candidate JSON | 8,351,600 bytes |
| Compact search posting index | 546,381 bytes |
| Source-linked detail files | 9 lazily loadable shards |
| Human review template | 320 representative + 80 challenge samples |

The packer validates every annotated word against the original source token and rejects source drift. Root/lemma search uses only the primary ranked morphological analysis, not the alternative possibilities. The compact index remains staging material, not deployed.

## Concrete linguistic warning cases

These readings come **from the real model output**, not imagined failure scenarios. The editorial interpretation below is a diagnostic hypothesis awaiting independent classical-Arabic verification:

| Published location | Surface token | Model's preferred lemma and gloss | Why review is needed |
| :-- | :-- | :-- | :-- |
| `passage:1:0`, token 1 | `بعد` in `أما بعد` | `بُعْد` — distance/dimension | In the opening formula, `بَعْد` (“after”) is the natural grammatical reading; identical root does not guarantee the correct lexeme |
| `passage:2:0`, token 0 | `إن` | `أَنَّ` — “that” | The model appears to have ignored the written distinction with `إِنَّ` |
| `passage:4:0`, token 27 | `تتبين` | `تَبّ` — perish/be destroyed | The verb is likely a form of `تَبَيَّن`, “become clear”; a wrong root here would pollute related-word search |
| `passage:6:0`, token 44 | `بعض` | `عَضّ` — biting | The source appears to require `بَعْض` (“some/part”), not “biting”; a wrong root would create demonstrably misleading search results |

Do not silently override the model in the public index based solely on this short audit. Record disagreements and have specialists adjudicate actual passages and lexical senses.

## What the accuracy number cannot mean

- Morphological *coverage* counts tokens with a candidate analysis; it says nothing about whether the analysis is correct.
- Top-2 alternatives may disagree about the lexeme, root, POS, case or vowel marks. These are ranked guesses, not calibrated probabilities.
- CAMeL BERT's MSA training data does not establish historical juristic technical meanings in Ibn Rushd's text or al-Ghazālī's text.
- The human review sample is deliberately split into a uniform representative part for an overall error estimate and an enriched challenge part to expose mistakes. Never pool them for a population accuracy claim.
- A 95% confidence bound and per-work domain-term error rates should accompany editorial sign-off; mechanical passing thresholds alone do not confer scholarly authority.

## Technical and editorial next steps

1. Retain full-corpus candidate files and compact postings as separate private-review artifacts. Keep the public v1 indexes curated until there is an approved accuracy report.
2. Independently review the representative and challenge sheets, prioritize `أَمّا بَعْد`, `إنّ/أنّ`, `بعض`, `تتبين`, technical vocabulary and tokens lacking roots.
3. Evaluate *lemma, root, POS and lexical-sense identity separately*. Distinguish model omissions from confident errors, and count missing analyses against coverage.
4. Add approved, source-anchored scholarly corrections with provenance. Never present machine-suggested glosses as an author's historical usage.
5. On release, activate the compact v2 posting index explicitly, serve grammatical shards on demand, profile Safari memory/latency, and keep a model-free fallback.
6. Re-run full browser tests after the latest source/edition changes; do not replace or overwrite the concurrent PDFs, apparatus or readers.
