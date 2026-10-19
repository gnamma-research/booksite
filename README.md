# Gnamma · al-Mustaṣfā, scholarly working reader v0.5

This release provides a **mobile-responsive searchable full Arabic reading witness**, alongside **103 independent English selected passage cards** (with overlapping excerpts). The newly extended **14 intact source-paragraph translation units, sampled in source order with some gaps between them** cover portions of the opening preface and introduction. **This is NOT the complete English translation.** English coverage must never be inferred from the Arabic page count.

## Use on your phone

- **Public GitHub source:** https://github.com/gnamma-research/booksite . This repository contains the reader, selected translations, technical commentary and the complete Arabic witness.
- **GitHub Pages address after Pages is enabled:** https://gnamma-research.github.io/booksite/ . If it does not open, enable `Settings → Pages → Deploy from a branch → master → /(root)`, then await publication. No claim of a live Pages site is made until verified.
- **Offline standalone file:** `Al_Mustasfa_Gnamma_Standalone_Reader_v0_5.html` embedded in the ZIP. Open in a real Safari/Chrome tab; iOS Files preview may block scripts. The English selected passages work offline, but the whole-Arabic route needs internet to fetch the source data.
- Download this ZIP and extract the website or publish the directory without altering path structure. `index.html` must be served with `assets/` beside it.

## Navigation and apparatus

- Continuous view of all **103 English translated excerpt cards** and one-at-a-time reading with Arabic facing English.
- Whole Arabic text: **381 digital page objects, 2977 transcribed paragraphs**, page jump and all-Arabic full-text search, with one network fetch of ~1 MB.
- Technical translation decisions informed by **Felicitas Opwis, Ulrich Rudolph, Wael B. Hallaq**, the original Arabic and **Ahmad Zaki Mansur Hammad**. These are source-attributed editorial judgments, not primary quotations.
- Glossary (47 entries), graded concordance to al-Ghazālī’s other writings (24 evidence records), source-linked dictionary excerpts (17), selective Hammad comparison (8).
- Font/appearance settings, bilingual/English/Arabic modes, selected-passages search, notes, bookmarks, and navigation back from modal views to the passage.

## Editorial limitations

The whole Arabic is a digitized OpenITI witness with its own page markers—not a critical edition or the Hammad page numbering. The two Hammad scans (303 + 489 PDF pages) were supplied by the user and are not redistributed. Several earlier excerpt cards overlap others. The logical introduction is only **partly** translated, notwithstanding its Arabic availability. No entire quṭb or chapter has yet received a complete independently checked translation.

Consult `ACADEMIC_SOURCES_AND_METHOD.md`, `TRANSLATION_COVERAGE_REGISTER.csv`, `TRANSLATION_POLICY.md`, `EDITORIAL_AUDIT.json` and `ARABIC_SOURCE_ATTRIBUTION.md` for methodology and audit.