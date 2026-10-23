# Darūrī Arabic word-level PDF mapping — authoritative cross-chat handoff

**Updated:** 2026-10-22, 14:06 Asia/Riyadh (approximately 11:06 UTC).  
**Owner after this handoff:** whichever existing Darūrī/PDF chat is coordinating release. **Do not start another parallel rewrite.**  
**Code host:** `gnamma-research/booksite`.  
**Pending change:** [PR #38](https://github.com/gnamma-research/booksite/pull/38), `feature/daruri-arabic-pango-pilot-20261022`, head at handoff `42575180bf409f1cb1c6c00480b4380ff9202958` (then add this documentation commit). PR intentionally **draft, unmerged**.  
**Live baseline (CRITICAL):** `master` at `f267661024613a468a1399b9f7575533b70b6a78`, **newer** than the original PR base `a4f869...`.

## IMPORTANT: avoid duplicate work and the silent overwrite

The **other Darūrī chat** already merged PR #41 into master at `f267661`: **"Fix searchable Arabic in Daruri personal PDFs across browsers and native PDFKit"**. It adds a CIDFontType2 / CIDToGIDMap / ToUnicode Unicode-searchable personal-PDF layer, including native PDFKit Arabic vowelled text handling and full Unicode codepoint reversal. Its latest master checks passed: native phone PDF, 137-edition exporter, unified search, Editions, Reading Desk, catalogue links and Pages deployment. Check [the latest PR #38 comments](https://github.com/gnamma-research/booksite/pull/38) from the parallel chat, which warn against overwriting these changes.

**Do not overwrite master `daruri/personal-pdf-enhancements.js` with the older PR #38 version.** Keep the new CIDFont/Unicode code and incorporate only PR #38's small, independently valuable source-match normalization change: `tidy()` removes Arabic tatwīl (U+0640) as well as combining vowel marks. The branch also modifies `daruri/personal-export.js` to load a checksum-bound scholarly Reference sidecar; reconcile that change into the **current** master exporter, not a stale whole-file copy. Keep all newer search, reader, service-worker and offline changes, and verify each SHA-bound map path.

The GitHub compare `feature/... → master` reported divergent histories (master +76 commits, branch +48 at handoff). Re-read both HEADs immediately before any edits; neither head is frozen.

## What is ALREADY verified

### All eight Arabic-bearing A4 Reading PDFs
- Arabic-only plain/vowelled, recorded/editorial headings: four editions, 156 source pages.
- Bilingual vowelled/unvowelled, recorded/editorial headings: four editions, 316 source pages.
- **Total: 472 source pages pixel-identical** to approved published PDFs, **414/414 authorial Arabic source segments** per edition, **21,647 Arabic visual word rectangles per edition** measured directly from the original unchanged WeasyPrint/Pango layout; no OCR, no PDF glyph-text reconstruction and no inserted word spans.
- All eight complete SHA-256-bound maps exist under `daruri/editions/maps/` in PR #38; English maps in bilingual PDFs are preserved.
- [Pixel-parity probe](https://github.com/gnamma-research/booksite/actions/runs/39710024197), [map publication](https://github.com/gnamma-research/booksite/actions/runs/39710954919), [8-map/quote QA](https://github.com/gnamma-research/booksite/actions/runs/39711216789), [actual local Arabic P1 PDF creation](https://github.com/gnamma-research/booksite/actions/runs/39715253628) all passed.

### Study and canonical scholarly Reference
- Two Study A4 editions: **131 and 143 pages**, pixel-identical; the canonical Reference PDF: **243 pages**, pixel-identical.
- Once publisher note-call `<a>` TextBoxes and two colophon segments were excluded from authorial matching, **all 414/414 Arabic authorial segments per edition** matched exactly. Combined Study+Reference pages: **517**.
- Word maps for the two Study PDFs have been published *to PR branch only*; their bilingual English maps are preserved. An independently checksum-bound Reference sidecar exists at `daruri/personal-source-pango-maps/manifest.json` plus `daruri.pdf.json` (414 mapped authorial segments; 21,678 words; original Reference PDF unchanged).
- [Study/Reference verified workflow](https://github.com/gnamma-research/booksite/actions/runs/39718119617) passed. `daruri/build/publish_study_reference_pango.py` and `daruri/qa/probe_study_reference_pango.py` are the source tools.

### Real personal PDF and visual/performance proof
- Generated **real 38-page Arabic vowelled personal PDF** from unchanged 37-page Reading PDF, containing one P-numbered personal note, **11 highlighted Arabic words**, three source→appendix links and an appendix→source return.
- Strict visual comparison reported **zero changed pixels outside intended word boxes/P marker area**, one changed source page, all others unchanged.
- One Chromium result: PDF **738,186 bytes**, generation **721 ms**, browser heap sample 23.1 MB; not a cross-device performance guarantee.
- [Real PDF visual/performance workflow](https://github.com/gnamma-research/booksite/actions/runs/39717704471) passed.

### Quote edge cases
- The 8-map [test](https://github.com/gnamma-research/booksite/actions/runs/39716505356) passed Arabic diacritic stripping, hamza variation, punctuation, tatwīl normalization, absent quote, repeated/ambiguous quote (reject), and cross-page quote (safe section fallback).
- Partial English source-word maps already existed and must remain intact.
- All existing five canonical PDFs, twelve A4 bases and 120 apparatus PDFs must remain **byte-for-byte unchanged**.

## Remaining blockers and final integration gates

1. **Reconcile the newest `master`, not the old PR base.** Preserve the `f267661` CIDFontType2/ToUnicode PDFKit Arabic-search fix. Apply the 8 Reading + 2 Study map files/metadata + map manifest, the independent scholarly Reference sidecar, the small `tidy()` U+0640 fix, and the Reference-sidecar lookup in the *current* `personal-export.js`. Do not overwrite new master source code, search UI, service worker, source notes, or PDF files. Leave PR #38 draft until all checks pass.
2. **Real native Android + iPhone check with new master exporter.** In earlier PR #38 branch-only [Arabic native run](https://github.com/gnamma-research/booksite/actions/runs/39718566996), **Android P1 forward/return passed**, while iPhone PDFKit correctly followed its links but failed only the *Arabic text-search* assertion because that old PR branch still used the pre-CID Arabic overlay. The **newer master f267661** separately passed native iPhone/Android Unicode searchable PDF checks; run a **fresh combined test** against current master exporter **with exact Arabic Pango maps and real Arabic personal PDF**. The stale branch-only iPhone failure must not be portrayed as proof that the new CID version fails.
3. **Full integrity regression on merged candidate:** `verify-published-selector.cjs`, `verify-arabic-pango-maps.cjs`, `verify-arabic-quotation-edge-cases.cjs`, `verify-arabic-personal-export-browser.mjs`, `verify-personal-pdf-upgrade.cjs`, 137-edition exporter, 120 appendix maps, unified search and Reading Desk. Check current renamed/versioned scripts and PDF hashes. Check that Reference sidecar is used only with exact `daruri.pdf` SHA, Study maps only with exact Study base SHA, and appendix editions reuse only their exact unchanged base geometry.
4. **Visual/device observations:** visually inspect sample Arabic ligatures, vowel marks, line wraps and right-to-left phrase rectangles in native viewers. PDFKit and Android tap P1→appendix→Return to the *correct source locus*, Arabic full-word search, offline loading and multi-note/collision cases. Guard ambiguous/multiline/multipage quotations with section fallback.
5. **Publish and document only once:** after refreshed green CI and native checks, merge reconciled PR #38 (or a clean integration PR), verify Pages deployment plus actual A4+apparatus download links, update this handoff with final merged SHA, and notify the user. Do not publish or regenerate 137 canonical PDFs merely to add maps.

## Canonical file inventory
- Mapping / Pango verification: `daruri/qa/probe_arabic_pango_layout.py`, `probe_bilingual_arabic_pango.py`, `probe_study_reference_pango.py`.
- Map generation: `daruri/build/publish_verified_arabic_word_maps.py`, `publish_study_reference_pango.py`.
- Map data: `daruri/editions/maps/manifest.json`, `daruri/editions/maps/*.pdf.json`, `*.pdf.metadata.json`, `daruri/personal-source-pango-maps/{manifest.json,daruri.pdf.json}`.
- QA: `daruri/qa/verify-arabic-pango-maps.cjs`, `verify-arabic-quotation-edge-cases.cjs`, `verify-arabic-personal-export-browser.mjs`, `verify-arabic-personal-visual.py`; native `daruri/qa/native-phone/prepare_arabic_fixture.py` and workflow `daruri-native-arabic-link-qa.yml`.
- Merge-sensitive sources: `daruri/personal-pdf-enhancements.js` (new master's CID Unicode implementation is authoritative), `daruri/personal-export.js` (integrate reference sidecar carefully).

## Ownership and communication

This handoff was made specifically because the user asked to **avoid duplicate fixes** and let the *other active Darūrī/PDF chat* finish. **Do not run another independent translation or PDF regeneration in this thread.** Use PR #38 comments and this file as the shared record, and coordinate ownership there. The original author of PR #38 should not make further overlapping code edits while the integrator is reconciling it with master.
