# al-Mustaṣfā definitive-edition handoff · 19 October 2026

## Current immutable facts

- v0.3 working corpus comprises 66 annotated source-linked Arabic–English excerpt cards, not 66 complete sections. Several short quotes overlap.
- 40 glossary entries; 14 works in bibliography; 18 graded cross-work references; 11 source-linked lexical snippets; 8 selective Hammad case comparisons.
- One-file website, hosted-site directory, print PDF and CSV/JSON evidence ledgers generated.
- The two uploaded Hammad 1987 scans are image-only, **303 + 489 PDF pages**. The second scan's fourth PDF page corresponds to printed dissertation page 300 (so physical PDF page = printed dissertation page minus 296). This is a working offset for its translation pages and not a universal rule for other witnesses.
- Hammad omitted the logic prolegomenon (translator's note printed p.323 n.15). Selected passages restored and connected to *Miḥakk al-Naẓar* and *al-Mankhūl*.
- Original online Arabic text is linked; **no variant collation or complete printed text proofreading** is yet asserted. Hammad's copyrighted English is not reproduced as a continuous book translation.

## Canonical paths after extracting the website package

- `data/reader.json` — source-of-truth machine-readable content, terms, page locators, notes and work links.
- `assets/data.js` — generated browser copy. Regenerate from JSON using `rebuild_data_js.py` (if supplied in developer package) or `window.MUSTASFA_DATA=` + JSON.
- `assets/app.js`, `assets/style.css` — web app logic and presentation. `index.html` loads both plus `assets/data.js`.
- `EDITORIAL_AUDIT.json` — scope, validation and limitations.
- `PASSAGE_SOURCE_REGISTER.csv`, `CROSSWORK_EVIDENCE.csv`, `HISTORICAL_LEXICON_EXCERPTS.csv`, `HAMMAD_TRANSLATION_COMPARISON.csv` — audit ledgers.
- `TRANSLATION_POLICY.md` — terminology rules and evidence grades.

## Immediate outstanding operations (do not misrepresent them as done)

1. Select a fixed Arabic edition and identify exact corresponding source page/line for every excerpt in the 66-card working corpus; correct online transcription errors.
2. Complete the logical prolegomenon **sequentially**—definition, primary notions, classifications of knowledge, matters/forms of proof, non-demonstrative premises—and add faithful English translation with notes.
3. Complete full Axis I rulings, including obligation, forbiddenness, permissibility, effectiveness and conditions.
4. Complete full Axis II sources (Book/Sunna/consensus/other alleged sources) before interpreting partial maṣlaḥa sections as representative of the whole treatment.
5. Complete Axis III language and inference and Axis IV qualified reasoning/taqlīd chapters, with methodologically honest treatment of uncertain proofs.
6. Full line-by-line Hammad comparison against the Arabic where his translation exists. Avoid manual OCR except where no better transcriptions are available.
7. Add precise parallel quotations and edition/page identifiers from al-Ghazālī's *Miʿyār*, *Miḥakk*, *Mankhūl*, *Tahdhīb*, *Shifāʾ*, *Asās*, *Iḥyāʾ*, *Iqtisād*, *Mīzān* and related works. Differentiate direct reference / verbal parallel / contextual bridge.
8. Expand each historical dictionary excerpt into its full legitimate entry with complete English translation and bibliography; add Lane, Ibn Manẓūr, Fayrūzābādī, al-Jurjānī, al-Tahānawī selectively in source chronology.
9. Build bidirectional comparison of numbered *al-Mustaṣfā* paragraphs to Ibn Rushd's *al-Ḍarūrī* and representative rulings in *Bidāya*, keeping authorial and editorial interpretations distinct.
10. Conduct independent Arabic philological proof, subject/factual review and print QA before declaring any edition 'definitive'.

**Nonnegotiable honesty:** This package is not a finished full translation; do not describe it as such in a publication or progress report.