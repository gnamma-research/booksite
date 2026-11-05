# Three-book reader: implementation and textual audit
**Date:** 5 November 2026 · **Repository:** `gnamma-research/booksite` (`master`)

This is a maintainer audit, not reader-facing material. Editorial-process notes should not appear as sections in the reading interface.

## Implemented in this pass

- Canonical three-book reader with al-Muẓaffar's *al-Manṭiq* before *Bidāyat al-Ḥikma* and *Nihāyat al-Ḥikma*; retired the legacy iframe page by redirecting its links.
- Arabic-first, continuous reading by default. Search results show across all books; ordinary continuous reading renders the active book only to reduce mobile DOM size.
- More usable mobile typography, horizontally scrollable book selector, accessible control sizes, book attribution, keyboard focus-mode navigation, last-chapter restoration, glossary lookup from selected text, and exact passage links from dictionary entries where available.
- Native browser Print/Save as PDF: A4 **Reading** (English where present, Arabic fallback), **Study** (parallel Arabic-English with notes), and **Reference** (Arabic with source notes). This is **not** three pre-rendered downloadable PDF files.
- Bidaya chapter titles: all 110 source chapter headings checked against the Arabic table of contents. New descriptive English headings are editorial translations of those headings.
- Nine misplaced Arabic stage introductions moved into their correct stage metadata and rendered in the reader. Nine extraneous English stage-heading passages removed from the Arabic bodies.
- Repaired **258** recurrent source-import substitutions in Bidāya (R → لمج, T → ته, 5 → نه, apart from the one numeral that denoted a footnote) and **108** dropped beh-ha ligatures. These mappings were compared with Arabic passages in a second published witness; they are not a substitute for line-by-line textual collation.
- Bidaya glossary: **89** terms, all linked to stable unit IDs. Muẓaffar glossary: **33** terms. Descriptions are new editorial formulations, not a reproduction of copyrighted explanatory material.
- Added `tools/audit-hikma.mjs` for reproducible validation of JSON, stage/passage identifiers, missing assets, explicit dictionary links and recurrent OCR markers.

## Source bases

- Primary Arabic comparison witness: [*Bidāyat al-Ḥikma*, Rafed](https://lib.rafed.net/m/?b_id=1571&type=c_fbook).
- Independent comparison of a specific passage: [*Bidāya*, the proof of the Necessary Existent](https://lib.rafed.net/view.php?b_id=1571&page=156&type=c_fbook).
- Aanand Krishnan, notes based on Shaykh Mohammad Ali Shomali's lectures (user-provided PDF): supplementary didactic commentary, **not** an independent Arabic text witness, a verbatim lecture transcript, or a licence to reprint a publisher's English translation.

## Coverage at audit

| Book | Arabic units | English units | Local dictionary records |
| --- | ---: | ---: | ---: |
| al-Manṭiq (Muẓaffar, selected source) | 14 | 14 | 33 |
| Bidāyat al-Ḥikma | 111 (intro + 110 chapters) | 5 | 89 |
| Nihāyat al-Ḥikma | 136 in existing JSON | working rendering of 130 numbered chapters | Existing glossary, not recounted in this audit |

**Scope warning:** The Muẓaffar edition is presently a selection, not a full translation; the vast majority of Bidāya English units remain unwritten. Existing Nihāya English and the entire Arabic corpus still need a passage-by-passage scholarly review.

## Important work still open

1. Collate every Arabic page against a reliable, clearly identified printed edition; resolve remaining spelling, segmentation, authorial/secondary footnote issues and transmission differences. Absence of OCR placeholders is not proof of correctness.
2. Translate and critically annotate Muẓaffar's entire intended section and the remaining Bidāya chapters. Do not silently treat lecture notes as the original text, and distinguish original authorial glosses from commentary.
3. Complete paragraph-to-paragraph source/translation alignment and verified contextual footnote anchors. Current reading panels align at passage/chapter level.
4. Produce independently downloadable/typeset PDF volumes if required; the website currently offers browser printing with three A4 styles.
5. Run a true browser/device regression pass, including Safari on iOS, Arabic font fallback, bookmarks, screen readers, back/forward and print output. Source-code syntax and data integrity checks were done, but the deployed GitHub Pages URL could not be opened in the available browser environment.
6. Audit content rights and attribute all references to the exact edition/page before describing any layer as a scholarly critical edition.

To rerun the local technical test from the repository root:

```sh
node texts/al-tabatabai/tools/audit-hikma.mjs
```

Do not put this audit into the reading UI.