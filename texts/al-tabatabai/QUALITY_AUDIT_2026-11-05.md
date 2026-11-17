# Three-book Hikma reading room: source and implementation audit

**Updated 5 November 2026 · `gnamma-research/booksite` (master)**

Maintainer audit only. Do not expose editorial task lists as reading sections on the public website. Textual annotations belong beside their specific passages.

## Actual coverage

| Book | Authorial Arabic units in reader | Units with original English working translations | Glossary |
| --- | ---: | ---: | ---: |
| al-Muẓaffar, *al-Manṭiq* selections | 25 | 25 | 33 |
| al-Ṭabāṭabāʾī, *Bidāyat al-Ḥikma* | **111** (introduction + all 110 chapters) | **111** | 89 |
| al-Ṭabāṭabāʾī, *Nihāyat al-Ḥikma* | 136 (introduction, stage prefaces and 130 chapters) | 136 | 30 |

**Meaning of completion:** Both *Bidāya* and *Nihāya* have complete **working English reading coverage** matching their authorial Arabic reading units. This is **not** completion of a specialist-verified critical edition. No claim of exhaustive manuscript collation, independent Arabic–English line-by-line review, verified quotations, or approved journal-quality translation is made. The Muẓaffar reader has 11 translated introduction passages (pp. 8–25 of the cited Arabic edition) and 14 selections from Book III on definition; **the rest of his book has not been imported or translated.**

## Reader work

- Three-book reader (Muẓaffar → Bidāya → Nihāya) without the legacy iframe; book selection, search, backlinks, source passage IDs, saved reading notes and bookmarks.
- Arabic-first, continuous reading by default; three language modes, reading-focus mode, mobile navigation, typography, source footnotes, searchable glossary, and glossary-to-passage links.
- Book-wide search is retained; ordinary continuous scrolling is limited to the active book for mobile performance.
- Browser Print / Save as PDF dialog supports Reading, parallel Study, and Arabic Reference layouts.
- Nine **independent, selectable-text A4 PDFs** have been built and published by the repository workflow in earlier releases. The **latest** source revision must be matched to a newly verified manifest before the PDFs can be described as reflecting all 111 translated Bidāya units.
- The public `editions/index.html` catalog reads only actual `editions/manifest.json` inventory, including source-file and output hashes. It never invents missing downloads.

## Bidāya textual preparation and translation

- 110 Arabic chapter headings cross-checked against the Arabic contents; specific English captions replace generic ordinal headings.
- Nine misplaced Arabic stage introductions detached from chapter bodies and rendered under their respective stages. Nine intruding English editorial headings removed from the Arabic source text.
- Repaired 258 recurring PDF-derived `R`, `T`, and `5` character substitutions and 108 missing `به` ligatures against a second Arabic witness, retaining other uncertain readings.
- All 110 chapters plus the author's introduction received a new, AI-assisted English working rendering preserving the order of arguments, objections and replies rather than substituting summary outlines.
- Glossary contains 89 tagged entries, each linked to a stable chapter passage.
- One unresolved example in VI.11: `إلا بداعيين` is retained in Arabic; the printed explanatory gloss `أي لإخراج الفعل والانفعال الدفعي` motivates the English rendering of instantaneous action and passivity. Further printed-witness collation required.
- The authorial Arabic still requires thorough character-level proofreading. **The absence of the previously detected OCR artifacts does not certify the source transcription.**
- Previously supplied student lecture notes (Aanand Krishnan recording lectures by Shaykh Mohammad Ali Shomali) are a secondary pedagogical resource, not a verbatim transcript or an independent Arabic witness. The copyrighted published Qarāʾī English translation is *not* copied into the reader.

## Nihāya textual status

- 136 working English units accompany the authorial Arabic; prior targeted visual checks and recorded readings appear in repository history.
- The early Qum 1404 AH witness and a later Rafed fourth-edition transcription form the recorded comparison basis; their paginations differ and are not collapsed into one inferred offset.
- Known editorial apparatus, OCR and attribution issues must be rechecked against actual printed pages, particularly the divisions of existence, substantial motion (IX), union of knower and known (XI), and divine attributes (XII).
- There is no claim of an exhaustive new scholarly review in this pass.

## Source bases

- Bidāya Arabic comparison: https://lib.rafed.net/m/?b_id=1571&type=c_fbook
- Muẓaffar Arabic source and introduction: https://lib.rafed.net/view.php?b_id=1604&type=c_fbook
- Nihāya public-domain early printed scan: https://sites.dlib.nyu.edu/viewer/books/princeton_aco000637/1
- Nihāya later Arabic transcription: https://lib.rafed.net/view.php?b_id=1642&type=c_fbook

## Reproducible release checks

```sh
node texts/al-tabatabai/tools/audit-hikma.mjs
node --check texts/al-tabatabai/assets/hikma-combined.js
node --check texts/al-tabatabai/assets/hikma-reader.js
node --check texts/al-tabatabai/assets/hikma-refinements.js
# Playwright is installed by CI:
node texts/al-tabatabai/tools/qa-browser.cjs
node texts/al-tabatabai/tools/build-pdfs.cjs
```

- Browser verification workflow: `.github/workflows/hikma-reader-qa.yml`; Chromium and WebKit test outputs and A4 smoke sample are retained as artifacts. Queued, cancelled or action-required runs are **not** evidence of a pass.
- PDF workflow: `.github/workflows/hikma-a4-pdf-release.yml`; generates nine A4 PDFs, verifies their SHA256 manifests and source match, and refuses to publish a stale PDF batch over updated textual sources.
- The independent download catalog is at `texts/al-tabatabai/editions/`.

## Outstanding scholarly work

1. Exhaustive Arabic source collation, page and paragraph locators, manuscript/edition variants and the boundary between original text and secondary notes for both complete Ḥikma books.
2. Independent expert review of every English passage for lexical accuracy, conceptual distinctions, completeness and difficult historical or theological attributions.
3. Import and translate the remaining *al-Manṭiq* original source rather than describing 25 selections as the complete book.
4. Confirm current source hashes in the nine published PDF manifests after the final translation commit; inspect actual printed PDF page breaks, Arabic shaping, selectable Arabic text, navigation and sources.
5. Run/inspect automated Chromium and WebKit browser QA, physical iOS Safari, voice-over and accessibility checks.
6. Strengthen paragraph-level alignment, scholarly footnote markers, systematic glossary concordance and verified source citations.

**Do not describe the edition as specialist-certified until these scholarly checks are genuinely completed.**
