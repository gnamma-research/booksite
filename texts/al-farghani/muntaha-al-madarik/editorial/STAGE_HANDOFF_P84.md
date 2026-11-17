# Farghānī / Muntahā al-madārik — 50-page translation stage handoff

**8 November 2026 · GNAMMA Research / Texts / ʿIrfān and metaphysics**

## Canonical stage state

- **The user's request:** translate at least 50 further pages in one stage, continuing from the established B2007 p. 34 boundary, without re-translating old pages.
- **Delivered:** NEW B2007 pp. **35–84 inclusive (50 pages)** as new English working translation, in seven original stage files. **Cumulative English master B2007 pp.18–84 (67 pages)**, preserving inherited pp.18–34 unchanged.
- **Authorial boundaries:** first foundation finishes at p.69; the second occupies pp.70–78; the third begins p.79 and continues past p.84. **The full four-foundation introduction is not complete.**
- **Grade:** English draft based on modern printed Arabic web transcription, not independently sentence-to-sentence collated, manuscript-checked, or a constituted Arabic critical text. The 32 bilingual excerpt records cover only selected passages from pp.18–34.
- **Structural validation:** exactly 50 unique new `### B2007 p. NN` headings, pp.35–84 with no gaps; exactly 67 cumulative pp.18–84; reader has a linked Arabic source for every page. This checks *structure*, not translational accuracy.
- **Source editions:** B2007 is the Beirut digital text, different pagination from 1876 Istanbul; 67 B2007 pages must NEVER be reported as 67/107 of the Istanbul edition.
- **Manuscript variants established:** **zero**.

## Files to recover before continuing

1. **Mandatory policy:** `docs/TRANSLATION_CONTINUITY_PROTOCOL.md`.
2. **Earlier stage:** `editorial/STAGE_MANIFEST.json` and `editorial/STAGE_HANDOFF.md`.
3. **Current stage machine-readable manifest:** `editorial/STAGE_MANIFEST_P84.json` — seven source-file paths, exact Git blob SHAs as observed, page counts, no-gap audit and restart location.
4. **Canonical complete current English master:** `editorial/WORKING_TRANSLATION_18_84.md`.
5. **New stage sources, to preserve for audit:** `editorial/TRANSLATION_35_40.md`, `TRANSLATION_41_46.md`, `TRANSLATION_47_52.md`, `TRANSLATION_53_60.md`, `TRANSLATION_61_68.md`, `TRANSLATION_69_76.md`, `TRANSLATION_77_84.md`.
6. **Reader:** `continuous-translation.html`, rendered with 67 section anchors and 67 Arabic-source links; book landing `index.html`.
7. **Selected Arabic–English units:** `data/units.js` (32 only, pp18–34); do **not** count them as complete Arabic coverage.
8. **Scholarly apparatus:** `editorial/STATUS.md`, `WITNESS_REGISTER.json`, `COMPARISON.md`, `GLOSSARY.md`, `CRITICAL_INTRODUCTION.md`.
9. **GNAMMA catalogue:** `texts/manifest.json`, `texts/index.html`, where Farghānī appears beside Qawāʿid al-Tawḥīd.
10. **Public issue:** https://github.com/gnamma-research/booksite/issues/245 (full-edition requirements).

Nothing existing has been replaced with abbreviated excerpts. The new master is an **additional** cumulative file, and the previous 18–34 master remains at its original path. The HTML derived reader was updated in place.

## Exact restart point

**Resume with B2007 p.85:** https://ablibrary.net/book_content/b/9606/85?lang=ar

Previous translated final clause, end p.84:

`وهو مما يلي عالمه وعين مرتبته التي هي حصة من الحضرة العمائية التي هي عين البرزخية بين حضرتي الوجوب والإمكان من التعين الثاني`

Original opening of p.85, completing the sentence:

`وعالم الغيب والمعاني، ولكن من حيث تفصيل تلك البرزخية لا من حيث إجمالها، وهذا الكرسي الكريم هو أصل الجنان`

The next section explains the Footstool's third aspect, the three paradisal gardens, and relation of Paradise and Hell to spiritual/elemental forms. **Do not restart at p.35** or recycle the already drafted 50 pages as new output.

## Critical verification priorities

1. Secure full continuous Arabic copy-text aligned by clause to the 67-page English working translation; ensure authorial source versus B2007 editor's footnotes is explicitly distinguished.
2. Review each English clause against printed Arabic; correct gaps and meaning shifts with a before/after reason and an exact primary reference. Do not infer verification from page-heading counts.
3. Collate selected I1876 historical-print images and, if accessible, a complete early manuscript witness (e.g. Süleymaniye Yeni Camii 706). Record real variants with sigla; no invented readings.
4. Resolve p.33 ambiguous text and p.34 `الحضرة العملية`; check an early witness before emendation.
5. Investigate Farghānī’s explicit p.73 distinction between manifestation by *will and choice* and manifestation by necessity of the Essence. It materially affects Guénon–Schuon alignment.
6. Preserve the distinction between a completed **scholarly essay** and unfinished translation of the **authorial introduction**; the latter continues through the third and fourth foundations.
7. Report text-character denominators and a verified percentage only after complete original Arabic and exact edition concordance are present.

**Stage state: cumulative English working translation saved. NOT YET A FULLY CUMULATIVE CRITICAL EDITION.**

**Pages build:** repository commits verified; hosting deployment status requires a separate successful GitHub Pages workflow check. A queued build does not establish live deployment.
