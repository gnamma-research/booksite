# Contextual Arabic morphology — conservative root recovery audit

**23 October 2026. Review-only, not a public release.**

Source: [Gnamma full contextual CAMeL BERT inference run](https://github.com/gnamma-research/booksite/actions/runs/39883804764).
Root correction: [isolated shadda-safe root audit](https://github.com/gnamma-research/booksite/actions/runs/39888206714).

## The issue

CAMeL's MSA model uses `#` as a placeholder in some radical
skeletons; for instance, the model emits `ق.#.س` for `قِياس` and
`#.ج.ب` for `واجِب`. Blindly replacing `#` with `ي` or `و`
would hallucinate roots. The first pass conservatively suppressed
these as unresolved, leaving genuinely useful root families incomplete.

The tool `build/enrich_morph_roots.py` now supplements an absent
root **only** when its machine-proposed *lexical headword* has one
unique root in the initial 56-family curated register. It preserves
shadda and written hamza during headword comparison. Where the future
model record retains its raw radical skeleton, the known consonants
must also match; incompatible skeletons are rejected. In the existing
2026-10-23 model artifacts raw skeletons were not yet retained, so
all supplements use *curated headword only* and remain provisional.

## Independently checked full-corpus results

| | Darūrī | al-Mustaṣfā | Total |
|---|---:|---:|---:|
| Source Arabic tokens | 21,686 | 179,650 | 201,336 |
| Tokens with primary MSA analyses | 21,326 | 176,197 | 197,523 |
| Newly supplemented **primary** roots | **650** | **4,642** | **5,292** |
| Additional root supplements in **alternate** analyses | 466 | 2,949 | 3,415 |
| Total supplemented analyses (primary + alternatives) | 1,116 | 7,591 | 8,707 |
| Search index after supplemental hints | 554 KB | 4.05 MB | — |

All 5,292 recovered primary root postings carry **status 2:
provisional curated headword suggestion**. They are separate from
status 0 (unchecked BERT) and status 1 (individually human-reviewed).
The alternate-ranked analyses never enter lemma/root search postings.

The file-integrity checks passed, both source witnesses were processed,
and the accompanying source/analysis records and 400 occurrence-review
rows per work are retained in 90-day private GitHub Actions artifacts.

## Critical homograph contamination avoided

A permissive no-vowels match had initially conflated the classical
lexical entry **أَمْر** (command/matter; root أ م ر) with **أَمَرّ**
(the geminated comparative form of bitterness; a different lexical
identity). This produced unsound root hints in both corpora.

The revised code preserves shadda when identifying dictionary
headwords. In the verified full-corpus output:

- 0 occurrences of **أَمَرّ** acquired the root of **أَمْر** from
  the curated dictionary supplement.
- **قياس → قيس** supplied 56 Darūrī and 580 al-Mustaṣfā
  primary model occurrences for provisional root-family lookup.
- **واجب → وجب** supplied 39 Darūrī and 271 al-Mustaṣfā
  primary model occurrences.
- Existing model roots are **not overwritten**; none of this
  corrects the systematic `بعض → عَضّ` lexical model error.
- All newly supplemented roots remain **unverified** until
  independently checked by Classical-Arabic scholars.

## Further scholarly work before enabling the index

1. Independently adjudicate the 320 representative + 80 difficult
   morphological occurrences in *each* work; retain the reviewer,
   editorial approval, source token, alternative analyses and rationale.
2. Review weak-radical and hollow roots not represented in the 56-family
   register, along with homographs and technical juristic terminology.
3. Evaluate lemma, root, part-of-speech and lexical-sense correctness
   separately, and establish a release threshold before any promotion.
4. Confirm mobile Safari download, parsing and memory costs for the
   compact index and lazy grammar-detail shards.
5. Keep the existing curated v1 reader as fallback. Never claim
   a full historical-Arabic linguistic edition on the basis of
   MSA model inference or a small curated supplement.

**Nothing in this staged root recovery changes the live site or PDFs.**
