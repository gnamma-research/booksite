# Farghānī — Stage XVIII canonical reader-production handoff
**11 November 2026 | Scope: introduction ONLY | GNAMMA master**

## Authoritative current outcomes

Saʿīd al-Dīn al-Farghānī, *Muntahā al-madārik*, systematic four-foundation introduction and `tatimmat al-dībāja` (B2007 Beirut printed pp18–145). All **128 page labels** have a continuous **English working translation**. No further translation of Ibn al-Fāriḍ's main poem commentary is part of this project.

Unchanged scholarly source status:
- **559** selected Arabic–English critical records over all **128** introductory page labels.
- **283** selected excerpts checked against the edited modern digital Beirut text (B2007 pp18–60); **276** checked only against secondary derivative retranscription (pp61–145).
- Historical 1876 Istanbul photographed printed witness: **15 bounded phrase comparisons**, 7 differences vs later digital/derivative and 8 agreements, **not 15 complete pages**.
- **0** fully source-collated whole printed pages, **0** independently read medieval manuscript folios, **0** verified manuscript variants.
- Working English is complete in source-page *scope*, not definitive at every clause.
- Original I1876 printed p18 `الحضرة العمائية` (Cloud-like Presence) has long been photographically confirmed, modern B2007 digital p34 `الحضرة العملية` remains in apparatus; both English HTML and canonical working Markdown now agree with this established preliminary print correction. B2007 printed paper p52 remains unavailable; I1876 printed p32 `اسم الحكم` vs B2007 online `سم الحكيم` stays expressly provisional.

## Reader and UX completed in this stage

1. The canonical full introduction reader `../continuous-translation.html` now has a self-contained responsive reading system (`../full-reader.css`, `../full-reader.js`). Full English paragraphs remain true static HTML and readable if JS is unavailable.
2. English full-text search searches all **128** pages, separate from the original **32 curated Arabic–English extracts** and the separate **559 selected critical clauses**.
3. Five work parts, 128-page contents, per-page source, source-quality links to the selected bilingual clauses, bookmarks and last place, reading progress, optional page labels, font scale, page width, paper/mist/night palette, copying citation, focus mode and printing are functional.
4. Readability: scholarly apparatus holds **128 Arabic source-link entries** and **70 optional note entries** separate from uninterrupted prose; no progress reports in the authorial text; eleven page-continuation brackets removed. Five part boundaries remain; all previous page IDs are retained.
5. Fixed literal Markdown/HTML formatting artefacts on pp21,31,34,83,113 (nine exact later fixes on pp21/31/34); no speculative wording change was substituted for a manuscript reading.
6. On mobile, simplified sticky controls and an explicit “Aa · Tools” modal; full reader type uses robust serif fallback, dark mode and proper print CSS; compact iOS/Android-like toolbar. The text focus mode is distinct from the source-comparison workspace.
7. The critical clause viewer presents the same **559**, now 60 at a time, with search, page/source-grade filtering, `?page=N` deep link, collapsed photographed-print details and a print-all state; scholarly files tucked into optional sections rather than interrupting reading.
8. The book entry page now puts the full **128-page reader** first, selected source checks second, curated 32-extract material third; secondary research and past handoffs are behind details.

## Verification

- Deterministic static test `tests/farghani/verify_reader.py` verifies **128/128** section order and page anchors, HTML/link integrity, 128 source entries, 5 sections, 850+ translated paragraphs, no known Markdown/emphasis regressions, 559 unique critical records and exact grade split 283+276.
- Browser test `tests/farghani/verify_browser.py` checks **Chromium + WebKit**, **desktop + phone** (four configurations), including opening UI screenshots, search, contents navigation, source-level links, bookmarking/reload, page indicator, mobile Aa Tools, theme/type, focus, print and no horizontal overflow/JavaScript exception.
- GitHub Actions `.github/workflows/farghani-introduction-reader-qa.yml` pins Playwright's supported Noble browser container. **Run 42973208161 was green (4/4 browsers) before final typography/source-parity refinements**; inspect most recent CI run for current exact head. Screenshots and JSON report retained as temporary GitHub workflow artifacts. The static test also passes the later p34 typography regression as of the Stage XVIII source archive.
- Full QA detail and before/after error audit: [READER_REVIEW_018.md](READER_REVIEW_018.md).

## Recovery and immutability

- The **entire cumulative recoverable English/critical-source text and reader files** are in [FULL_CUMULATIVE_READER_018.md](FULL_CUMULATIVE_READER_018.md) (about 2.49 MB). It embeds 18 source files, their exact Git blob SHA and UTF-8 size, including the full working English, all 559 selected bilingual records, 11 original critical JS datasets via the retained `ALL_CRITICAL_DATASETS_017.md` subarchive, historic print evidence, primary reader HTML/CSS/JS, critical reader and extract reader.
- Stage XVII archive remains in [FULL_CUMULATIVE_READER_017.md](FULL_CUMULATIVE_READER_017.md); original source text and photographic JPGs remain separately in canonical repository paths.
- **Not a full offline photographic bundle**: the actual 1876 original resolution JPEGs and external shared reader stylesheet are not embedded; the archive explicitly records those exclusions.
- [Machine-readable Stage XVIII manifest](STAGE_MANIFEST_READER_018.json) describes counts, source classes, archive SHA and exact restart.

## Exact safe continuation

Only fix actual regression bugs in the reader or demonstrably defective authorial English against source; run all static and browser QA after every edit. If a complete *critical* Arabic copy-text is required later, obtain physical scanned B2007 printed page 52 then 38, 48, 61–65 and independent manuscript folios (e.g. Carullah 1107, Koca Ragıp Paşa 670, Kadızademehmed 273). **Do not present secondary retranscription as independent witness**; do not switch scope to the main verse-by-verse commentary.

## Start-here files

- `docs/TRANSLATION_CONTINUITY_PROTOCOL.md` — global no-retranslation/true-coverage rules
- `texts/al-farghani/muntaha-al-madarik/editorial/FULL_CUMULATIVE_READER_018.md`
- `texts/al-farghani/muntaha-al-madarik/editorial/READER_REVIEW_018.md`
- `texts/al-farghani/muntaha-al-madarik/editorial/STAGE_HANDOFF_CRITICAL_016.md` — last substantive photographed-print evidence
- `texts/al-farghani/muntaha-al-madarik/editorial/STAGE_MANIFEST_READER_018.json`
