# Sanandajī *Taqrīb al-Marām* — Volume I Stage 77 full recovery handoff

**Checkpoint: 12 November 2026.** Source project: critical Arabic–English edition of the combined Būlāq printing (1318 AH), *Tahdhīb al-Kalām* of Taftāzānī with Sanandajī's sharḥ, Muḥammad Wasīm's separately self-identified introduction, long lower glosses and shorter ruled annotations. Original scan `taqribmaram(2).pdf`, 632 physical pages, SHA256 `4addd660de68794f9d64e062e3b25a2782497b3342eb4580218c3e07e8d12134`.

## The correct new work and its limits

- Previous Stage76 machine-readable baseline: **1,338 source-linked Arabic/English records** retained without alteration.
- **New Stage77 source-linked records: 62** across original printed I:2–16: **54 fresh source-facing English translation/explanatory records on I:6–16**, and **8 prefatory reconciliation/stream-separation records on I:2–5**. Some records contain summarizing interpretative clauses; do not call them 62 literally translated original paragraphs.
- Updated cumulative dataset: **1,400 unique IDs**, verified programmatically. Breakdown of the 62 additions: **24 upper mixed matn/sharḥ, 26 lower marginal, 8 separately ruled, 4 Wasīm prefatory attribution/reuse**.
- The four Wasīm records in the new file are **NOT new translations** of his preface. The full preface has already been translated in the repository module `stage51-wasim-preface.js` on the booksite; it is linked and its identification recorded in `Stage77_I002-I005_Prefatory_Streams_Audit.md`. Do **not** duplicate those English words as a new achievement.
- **All 15 numbered body positions I:2–16 are re-inspected from the primary source scan.** I:6–16 now have strengthened, layer-separated source-facing English (selected Arabic anchors; no complete diplomatic transcript). Pages I:2–5 have explicit dual-author prefatory audit, preserving earlier primary author and Wasīm translations. **No newly independently certified complete body page**.
- The source PDF section I:2–17 was extracted as a **16-page exact copy** of the embedded original page images: 16/16 embedded source-image SHA256 hashes equal the original combined scan (including context I:17).
- The reader embeds its 15 original source images as data URLs and was tested with `page.set_content()` in Chromium at desktop 1400×860 and mobile 390×844; JavaScript executed without page errors, filtered I:13 returned 3 lower cards, **the scan image loaded** and there was no horizontal viewport overflow. This is a local reader test, not an end-to-end deployed site test.

## Strict status summary

- Printed Volume I: 280 numbered positions including bibliographic title leaf; 279 body pages. **279/279 have SOME English**, much of it old and nonliteral.
- Legacy 'all-register source-facing attempted' bar was **212/279, I:69–280**, and is conservatively **not raised** here: I:6–16 still contain condensed lower material, and I:17–68 likewise have some incomplete lower text. This bar is not a translation-completeness measure.
- **0 of 279 pages independently certified as complete and gap-free**. The dataset fields `full_diplomatic_arabic`, `all_printed_clauses_literally_translated`, `independent_second_proof`, `textual_witness_collation` are all false for the 62 new records.
- Word-level Arabic translation coverage **cannot** be quantified from existing page cards. A complete inventory of every printed Arabic line (including Wasīm and anonymous notes) is needed before assigning such a percentage.
- No independent manuscript variants have been collated. Related texts are parallels, **not** textual witnesses to this printing. The title leaf and unnumbered preliminary leaves have not received complete bibliographic transcription.
- This Stage77 output is **not a definitive critical edition** and must not be merged to the live website under such a label.

## Source page mapping

Printed Volume I p = combined original PDF physical page p+13 (one-based), or zero-indexed page p+12. Printed I:2–16 = physical pp.15–29. Context I:17 = physical p.30.

## Delivery files

- `Sanandaji_VolI_Cumulative_Stage77.md` — cumulative source-order master, 280 original numbered entries; new I:2–16 material foregrounded and old prose nested under expandable ‘historical’ details.
- `Stage77_All_Units_I002-I280.json` — 1,400 source-linked bilingual working-unit records.
- `Stage77_New_Units_I002-I016.json` — 62 new records, with `is_new_translation` distinguishing 54 new explanations from eight preface reconciliations.
- Review branch also carries `stage77-I002-I016-source-facing-units.json` (62 fields-verified machine-readable units) alongside four Markdown source dossiers.
- `Stage77_I002-I005_Prefatory_Streams_Audit.md` — both distinct prefaces and provenance link to prior translated Wasīm module.
- `Stage77_I006-I008_Source_Aligned_Bilingual.md`, `Stage77_I009-I012_Source_Aligned_Bilingual.md`, `Stage77_I013-I016_Source_Aligned_Bilingual.md` — new connected translation/explanation drafts with explicit cautions.
- `Stage77_Page_Status_280.csv` — 280-row inherited audit plus Stage77 fields, all closure flags false.
- `Stage77_Original_Arabic_I002-I017.pdf` — 16 original source leaves (including transition page) with 16/16 exact image checks.
- `Stage77_Source_Integrity.json`, `Stage77_Integrity_And_Metrics.json` — reproducibility evidence.
- `Stage77_Offline_Opening_Bilingual_Reader_I002-I016.html` + `source_images/I002.png`–`I016.png` — offline self-contained comparison reader with embedded original images, page selection, Arabic/English, source-layer filters, search and dark mode. Separate original image files are included for preservation.
- `Stage77_Reader_desktop_QA.png`, `Stage77_Reader_mobile_QA.png` — local DOM/viewport QA evidence, including successful inline original-image rendering (not a deployed website test).
- `Stage76_Research_Recovery.zip` — intact inherited full prior checkpoint retained as nested archive for history.

## Exact remaining path to completion

1. **Never confuse remaining source-facing draft coverage with literal completion.** All I:2–16 now have source-facing/stream-aware entries, but many long margins on I:6–16 still need line-by-line Arabic transcription and corresponding literal English, not just argument synopses.
2. Proceed across Volume I in *proof clusters* selected for high density of unresolved lower text. For every original printed position, inventory all upper lines, long lower lines, ruled notes, and multi-page continuations. Each source line must have a stable address and English counterpart.
3. Resolve the explicit uncertain Arabic readings and record alternatives only where an actual second witness is consulted. Do not silently emend the scan with cognate passages.
4. Do a separate full second visual proof for each full-page translation, preferably including an independent human scholarly proof for definitive claims.
5. Retain Taftāzānī parenthesised matn, Sanandajī sharḥ, Wasīm's positively signed preface, and later anonymous marginal voices as separate authorial layers. For a future reader, tuck *editorial apparatus* away from continuous text.
6. Once 279/279 body pages are **gap-free and source-checked**, publish to the default NAMA/GNAMMA site as an expressly identified *verified translation of the Būlāq print*. Upgrade to a definitive textual-critical edition only after independent source collation and scholarship.
7. Then resume Volume II from the substantial earlier provisional corpus. Do not throw away existing II:15–314 material or assume II:321–335 are absent: the website has late-series working files.

## Publication statement

Local Stage77 materials may be committed to the established **GitHub review branch** `sanandaji/vol1-all-register-2026-11-10` to protect them and facilitate later integration. This is separate from public publication. No main-branch deployment is asserted.