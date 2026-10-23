# Gnamma: dictionary-aware Classical Arabic morphology and juristic terminology
Date: 23 October 2026
Development PR: https://github.com/gnamma-research/booksite/pull/77
**Status: experimental, review-only. The public v1 morphology indexes are unchanged.**

## Why dictionaries alone cannot solve the problem

The current CAMeL BERT-MSA model has two different kinds of mistakes.

1. **Morphological or orthographic**: reading `بعض` as a preposition plus “biting,” turning `إِنّ` into `أَنّ`, or interpreting `تتبين` as the root `تبب`. These need classical lexical analyses, strict hamza/clitic checks and context-aware ranking; a legal dictionary will not solve them all.
2. **Technical meaning / lexical sense**: assigning the ordinary “street” sense to `الشارع`, the medical “illness” sense to `العِلّة` or failing to distinguish logical and juridical senses of `القياس`. These require documented technical senses plus source context. A correct root is not a correct translation.

A dictionary headword proves that a sense exists; it does **not** prove the author chose it in any particular passage. Later dictionary entries are comparative witnesses, not evidence of the historical author's actual wording.

## Evidence already available

The Gnamma repository contains 153 core glossary entries, 155 terminology records, and 232 source records in `daruri/dictionary-data.json`. The `terms` registry provides Arabic headwords, cautious editorial roots, explicit Arabic aliases, authorial attestation examples in Darūrī, and source IDs linking to dictionaries. Source chronology metadata is `E` (before Ibn Rushd's death, 552 AH), `L` (later historical source), `M` (modern), or unknown. **E is relative to Ibn Rushd, not automatically earlier than al-Ghazālī (d. 505 AH).** Later al-Jurjānī and al-Tahānawī definitions are never promoted into the authors' own terms.

`daruri/lexicon-additions.json` holds additional comparative entries. Incorporating these into the candidate evidence graph requires the same source and chronology scrutiny; entries are not assumed to be vetted morphology labels.

## Actual 23 October model-to-dictionary audit

The fully generated MSA candidate indexes were checked against Gnamma's curated terminology register, retaining exact source word coordinates and dictionary identifiers. First audit uncovered false homographic prefix matches (`فاصل` mistaken for `فـ + أصل`; `ألسنة` mistaken for `الـ + سنة`), so the audit was revised to preserve original hamza positions and require explicit morphological evidence for clitic prefixes.

The refined audit's unreviewed evidence report:

| Diagnostic flag | Darūrī | al-Mustaṣfā |
| :-- | --: | --: |
| Total source words | 21,686 | 179,650 |
| Model analysis omissions | 360 | 3,453 |
| Occurrences flagged for some review | 2,608 | 18,623 |
| Dictionary headword/root exists but model root blank | 608 | 3,806 |
| Written hamza conflicts with model vowels | 79 | 800 |
| `بعض` split/read suspiciously | 28 | 218 |
| Model lemma vs dictionary headword mismatches | 35 | 114 |
| Candidate root disagreements | 1 | 13 |

Flags overlap. The headword/root proposal count (4,414) is **not** the number of proven model mistakes: some terms have more than one meaning or later dictionary evidence only.

A concrete case is `القياس`: CAMeL often returns lemma `قِياس` and root blank; Gnamma's linked terminology register records root `قيس`. The match can generate a **suggested root for review**, not a silent root replacement. `عِلّة` is often already lemmatized correctly as a noun with root `علل`; the missing layer is the legal effective-cause sense. `الشارع` can have a correct morphological root while still meaning “the Lawgiver” rather than “street” in relevant legal contexts.

## Proposed three-layer research engine

### A. Classical morphological candidates
- Use CAMeL plus a licensed historical-lexicon resource to expand and validate possible stems, roots, prefixes and grammatical features.
- Preserve hamza seat where written; do not normalize `إ` and `أ` indiscriminately for candidate filtering, even though normal search may fold them.
- Treat ambiguous clitic splits and letter boundaries as alternatives, not forced matches.
- Compare models and classical lexical resources to recover a candidate *missing entirely from MSA BERT's top choices*.
- Allow the model to decline an analysis when the written form/context is incompatible.

### B. Source-sensitive technical senses
- Index expressions as terms, separately from lemma/root, with distinct senses for ordinary, legal, logical and theological usage.
- Retain exact source ID, author, work, chronology and textual excerpt reference. Compare rather than import later terminology into an earlier author's voice.
- Prefer the author's own explicit definitions and worked examples when a source-specific sense is suggested.
- For al-Mustaṣfā, make a distinct authorial attestation register rather than indiscriminately treating Darūrī examples as direct evidence.

### C. Review and feedback
- Run an independent representative gold sample and a separate deliberately challenging sample, with actual source context.
- Record lemma, root, POS, vowel/segmentation, technical sense and *reason for disambiguation* separately.
- Use expert approval to feed a source-token-level correction table, retain the original model candidate, and prohibit ordinary dictionary hits from granting review status.
- Retrain or rerank a separate domain-specific candidate model only after enough approved examples exist; measure held-out **cross-book** accuracy and false-positive lemma/root search, not just token coverage.
- On publication, use compact search postings with lazy word-detail shards on mobile; never download model weights in the browser.

## What has actually been implemented in PR #77

- `daruri/build/propose_dictionary_morphology.py`: compares completed model outputs to existing source-linked terminology, preserving chronological source metadata. It checks model omissions, suspect roots, term senses, source mismatches, hamza-seat contradictions, and suspicious `بعض` splits; does not mutate model outputs.
- `daruri/build/apply_reviewed_morphology.py`: a separate **staging-only** tool for explicitly reviewer- and editor-approved source-token corrections. Original AI analyses remain visible as rejected alternatives; it refuses to overwrite the public reader.
- `daruri/qa/test-dictionary-morphology.py` and `daruri/qa/test-reviewed-morphology.py`: synthetic tests for dictionary provenance, false prefix matches, source alignment, no auto-approval, independent human signoff and preservation of the model result.
- The opt-in BERT-model Actions workflow will also export the dictionary proposal sheet alongside morphological candidate, compact-index and random-gold files.
- The completed candidate-model run is https://github.com/gnamma-research/booksite/actions/runs/39883804764 .
- The full offline dictionary diagnostic ran separately on https://github.com/gnamma-research/booksite/actions/runs/39887774319 . None of its suggested roots or senses has been presented as independently verified.

## Additional external resources to evaluate (licensing first)

- [CAMeL Tools BERT morphological disambiguator](https://camel-tools.readthedocs.io/en/v1.5.5/api/disambig/bert.html): uses a morphological analyzer to rank candidate analyses under context-sensitive predicted features. Extending dictionary evidence into the analyzer or post-ranker requires explicit engineering and validation.
- [Classical Arabic Dictionary, LDC2021L01](https://catalog.ldc.upenn.edu/LDC2021L01): historical corpus/lexical evidence; restricted licensing makes it unsuitable for silent redistribution.
- [QAMAR, 2026 ACL workshop](https://aclanthology.org/2026.abjadnlp-1.38/): manually verified Quranic morphology, useful as an external classical-Arabic benchmark but not a juristic-prose gold set; verify data availability and license before reuse.
- [Quranic Arabic Corpus documentation](https://corpus.quran.com/documentation/): useful traditional grammatical annotation and distinction between root/lemma/particle; its data has non-commercial/GPL terms.
- [al-Jurjānī, Kitāb al-Taʿrīfāt](https://arabiclexicon.hawramani.com/al-sharif-al-jurjani-kitab-al-tarifat/) and [al-Tahānawī, Kashshāf iṣṭilāḥāt al-funūn](https://sites.dlib.nyu.edu/viewer/books/columbia_aco001670/display?lang=en): technical sense evidence **written centuries after the authors being edited**.

A practical release decision needs a reviewed, held-out score and licensing clearance. It must never be inferred from a model's 98% ability to emit *some* analysis.
