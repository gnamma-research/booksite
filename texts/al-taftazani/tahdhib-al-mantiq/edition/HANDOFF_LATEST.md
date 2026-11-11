# GNAMMA Tahdhib — LATEST FULL CUMULATIVE HANDOFF

**Stage113 · 2026-11-11 · WORKING UNCOLLATED edition.**
Repository gnamma-research/booksite; root texts/al-taftazani/tahdhib-al-mantiq/edition/.

## Publication and recovery

Stage111 PR269 is merged (05f28ed5bb62071d3c072683216dabee6e2ee99f). Stage112 PR280 is merged (dbba5a88c63c02b8c134db2ef51aa0dad1a52a83). Stage113 is built on branch tahdhib-source-complete-stage113-20261111; check its PR/actual master before claiming deployment. No work is running asynchronously on the strength of this document.

Read, in order: this handoff; corpus-manifest.json; progress-data.js; stages/STAGE113_FULL_ARABIC_AND_RELEASE_RECOVERY.md; batches/hawashi-all-sections-cumulative-stage113.md; batches/hawashi-concepts-numbered-cumulative-maf001-035.md. The previous Stage112 narrative is preserved in checkpoints/stage112/HANDOFF_LATEST.md, and every immutable source batch and cumulative snapshot remains available. The manifest names every source, the Stage113 replacement overlay, and SHA256 of all immutable source files. hawashi-effective-stage113.json is a derived complete record set, not an independent witness.

## Exact current text and counts

| Historical H section | Complete first-pass English | Full digital Arabic |
|---|---:|---:|
| Preface | 136/140 | 54/140 |
| Introduction to Logic | 66/82 | 0/82 |
| Signification | 59/91 | 0/91 |
| Concepts and Universals | 30/35 | 25/35 |

**348 numbered records;291 first-pass English complete;57 partial;79 full searchable Arabic notes;269 Arabic locators;11 separately attributed unnumbered passages.** The15 dashboard measures keep main T/Y translation, H note translation, full Arabic, manuscript certification and modal proofs separate. No whole H printed page is certified:0/274. No principal Y position is independently manuscript-certified:0/110.46 historical modal classes are identified, but0/46 full historical proof cases are certified.

## Source families and numbering

T=Taftazani original matn:19 logic editorial units and separate1,044 kalam clauses. Y=Yazdi principal commentary Q7–123:110 substantive printed positions/113 blocks translated in first pass, no independent manuscript certification. H=later mixed-author glosses, rubricQ125, blankQ126, proseQ127–400 (274 printed positions). Whole-volume metadata naming Yazdi is not per-note authorship.

H-PREFACE Q127–164 has local1–140 (HWN-001 onward); H-INTRO Q165–187 local1–82 (HWN-INTRO-); H-DALALA Q188–215 local1–91 (HWN-DALALA-); H-MAFAHIM beginsQ216 with a NEW local1 and is now indexed through35/Q225 (HWN-MAFAHIM-). Never invent Preface141, Introduction83 or Signification92 at those rubric resets. Inspect every later heading before assigning a new ID.

## Actual Stage113 work

Full readable digital Arabic and consecutive English for24 new Concepts12–35 plus revised Concepts2;25 full source units, not25 complete printed pages. Concepts2 replaces its earlier partial translation; its original Stage112 draft remains in source history. The source Arabic is NOT a facsimile or a verified manuscript. ArabicFullText means digital-source transcription only. New note25 and the unnumbered note after20 have explicitly flagged readings; these have not been silently corrected. Every scanCertified flag remains false.

Theoretical distinctions preserved: cognitive quality vs represented quiddity; real vs hypothetical predicability for empty concepts; rival restrictions by different glossators; temporal cases of equality; source-specific general-absolute vs perpetual propositions; existential-import objection to double-negation transformations. Translating the arguments does not certify them as universal modern logical theorems.

## Remaining partially translated records

- **Preface:** 1, 25, 82, 90
- **Introduction to Logic:** 2, 7, 10, 19, 20, 23, 30, 42, 50, 58, 64, 68, 71, 73, 75, 77
- **Signification:** 1, 12, 13, 14, 15, 18, 21, 22, 25, 27, 28, 32, 33, 37, 38, 40, 50, 54, 57, 60, 63, 64, 68, 69, 72, 73, 74, 76, 83, 86, 88, 89
- **Concepts and Universals:** 4, 5, 6, 9, 10

In addition,269 numbered notes still have only short Arabic locators; full original Arabic must be entered and checked. H material afterQ225 throughQ400 remains to be processed. Unnumbered historical and modern quotations on each page must be inventoried, not silently assigned to the adjacent numbered speaker. Main Y collation must use genuine Y manuscripts, not automatically copies of Taftazani's T matn. Priority Y cruxesQ24,37,95–101,108,114,117,123; Stage103 has candidate witnesses only. Stage101 formal work proves restricted modern temporal implications, not the46 full classical modal cases.

## Reader, generation and tests

hawashi-numbered-notes.html displays all four sections and applies the Stage113 overlay by stable ID. progress.html renders the15 independent metrics. The original T/Y main reader still has exactly Matn and Matn+sharh modes. Full cumulative Markdown is generated from the source manifest, not assembled from chat summaries.

Run python tools/tahdhib/build_stage113.py to regenerate Stage113 from its immutable Stage112 checkpoint. It will fail rather than silently accept an unexpected baseline. Run python tools/tahdhib/check_stage_handoff.py: this first runs the complete preserved Stage112 source audit against its checkpoint, then validates the new manifest, source hashes, IDs, counts and full-Arabic fields. run_ci_contract.py runs the unchanged older source/logic/browser shell commands, whose content is Git-blob-verified. handoff_reader_qa.mjs checks the updated totals and all four sections in Chromium/WebKit. build_recovery_bundle.py exports text/code, current cumulative corpus and SHA256 manifest, excluding fonts/binaries.

## Exact next source and continuation contract

Next is **HWN-MAFAHIM-036**, beginning at https://ablibrary.net/book_content/b/12170/225?lang=ar and continuing onto printed226. Do NOT infer its conclusion from the opening sentence. Continue source-order and local numbering, preserving full Arabic alongside each new translation wherever available. Every stage must add immutable source records/report, preserve historical overrides, regenerate full cumulative text and state, update this entire handoff and15 metrics, and pass source plus Chromium/WebKit checks before merge. Record an actual PR/commit only after verification.

### New-chat starter

Continue GNAMMA Tahdhib Stage114 from actual latest master. First read this HANDOFF_LATEST.md, corpus-manifest.json, progress-data.js, Stage113 report and full Stage113 cumulative Markdown. Current348 numbered H records across four historical series;291 first-pass English complete,57 partial;79 full digital Arabic,269 locators,11 unnumbered. ZERO/274 whole H pages photo-collated;ZERO/110 Y manuscript certified;46 modal classes butZERO full proofs. Start HWN-MAFAHIM-036 atQ225→226. Preserve existing source snapshots and attribution; use full Arabic and consecutive English rather than extending summary-only coverage. Rebuild cumulative files, honest metrics, complete handoff and tests.
