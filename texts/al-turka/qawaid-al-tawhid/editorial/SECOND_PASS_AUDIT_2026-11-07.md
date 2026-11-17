# Qawāʿid / Tamhīd — second-pass editorial and release audit

**7 November 2026 | Evidence-graded, not manuscript-critical.**

## Scope and actual checks

The current working corpus contains **171** Arabic–English units: **61** original *Qawāʿid* lemmata (QT), **40** independent *Tamhīd* introductory units, **64** main commentary units, and **six** concluding units. The second-pass register checks **all 171 records** for bilingual presence, identifiers, mapped matn references, source-page metadata, notes, and sampled lexical ratios. **No Arabic/English sides or stable IDs are missing or duplicated.** All **18** primary/contextual reference cards point to existing unit identifiers; all **82** lexicon headwords have their required fields.

The 223 retained Āshtiyānī page snapshots span printed **pp.48–270**. A mechanical comparison sampled **4,466 short Arabic source fragments across 125 original/main units**. **122/125** attain at least 0.80 fragment presence after diacritic/orthographic normalization, **95/125** at least 0.90. The score is a *textual-correspondence diagnostic* only: it neither proves faithful translation nor counts as independent manuscript evidence. The 40-unit introduction follows source N rather than A and was not re-collated against N in this test.

**Three QT source-match review cases** are distinguished from content omission:

- **QT-027 (A p.118; 0.667):** retained digital source includes an evidently malformed `و فإنّ` where the working reading cautiously prints `فإنّ`. The original note already identifies this as a provisional normalization; further manuscript witness needed.
- **QT-004 (A pp.53–54; 0.739):** long printed variant parentheses interrupt the text spanning a page; the base has been normalized. The retained source reports `أردنا / رأينا` and `المناظرين / الناظرين`. This is a source-comparison warning, not evidence of omitted bilingual paragraphs.
- **QT-057 (A pp.257–258; 0.739):** the normalized working reading has `ويختلّ العقل` against printed `وتخلّط العقل`, and omits the difficult printed `حينئذ منذ` adjacent to `عشرين سنة`. An explicit source note was added on 7 November; neither form is claimed to have been established by manuscript collation.

## Closing commentary: direct check of A pp.270–274

The original commentary **SH-061-C, D, E, F, A and B** is all present, with Arabic and English. Public digital pages **[270](https://ablibrary.net/book_content/b/17638/466?lang=ar), [271](https://ablibrary.net/book_content/b/17638/467?lang=ar), [272](https://ablibrary.net/book_content/b/17638/468?lang=ar), [273](https://ablibrary.net/book_content/b/17638/469?lang=ar) and [274](https://ablibrary.net/book_content/b/17638/470?lang=ar)** were checked for the authorial sequence and boundary with modern comments on 7 November. The page transcriptions contain Persian/Arabic notes by later editors which must **not** become Ibn Turka's prose.

Open readings retained as uncertainties include `يصيرى`, `والملوك`, `الغير المنسقة المنتظمة` in the digital reading, and the final `أقفاله / إقباله / أفعاله` variants. The working translation makes contextual decisions with notes; **these are not resolved manuscript variants**. The main A snapshots end at p.270, so the six concluding units were excluded from the mechanical 125-unit sample. A separate conclusion-witness capture and physical-leaf comparison are still open.

## Scholarly limits: what remains genuinely unverified

1. **No independent manuscript folios have been inspected or collated.** Three separately catalogued manuscript witnesses and the Hādīzādeh original-text printing remain bibliographical leads, not independently collated copy-texts. No stemma or diplomatic critical edition can be claimed.
2. **No exhaustive human clause-by-clause bilingual proofreading of approximately 48,760 English words** has been completed in this audit. Automated Arabic matching and lexical ratios are *triage*, not a substitute for specialist judgment on negation, modality, objection/reply structure, and Akbarian terms.
3. The source of the introduction (edition N), and independent confirmation of many reported printed variants, need new direct visual checks.
4. The 18 reference cards have been checked for target validity, **not for full quotation provenance in all 18 external works**. Likewise 82 dictionary entries have been checked structurally, not each in its historical philological context.
5. The matn's reported **QT-059** lacuna remains documented and **deferred**, with no conjectural replacement.

## Technical publication

The source commentary HTML and standalone download were found to have an **unclosed style block** in an older archived build, which causes browser parsing to swallow the page. The repository's commentary HTML and generation guard were repaired in November 2026. The corrected standalone was verified with a balanced pair of styles in the current GitHub blob. A separately repaired local copy has been opened in Chromium, with the first screen rendered correctly; this is **not real-device iOS Safari acceptance**.

The repository declares **five searchable PDFs**: bilingual Reading (299 pages), English Reading (138), Arabic Reading (173), bilingual Study (322), and bilingual Reference (359). The PDF manifest supplies SHA-256 values. This audit checks the manifest and release recipes but does not independently re-download and visually inspect all five binary PDFs. The PDF publication workflow has been extended to rebuild when the underlying matn or commentary changes, preventing source/edition drift.

## Per-unit record

The machine-readable [171-row second-pass register](../qa/second-pass-register-2026-11-07.json) gives, for each unit, language word counts, source-page IDs, sample evidence, variant/notes flags, source family, and manuscript-collation status. Treat lower sampled correspondence as a *review signal*, not a verdict.

**Editorial verdict:** **Complete source-based working translation and usable reading edition; manuscript-critical definitive edition and exhaustive literary proofreading not yet established.** Do not advertise the latter as finished without inspecting the necessary witnesses and re-reviewing the full bilingual text.
