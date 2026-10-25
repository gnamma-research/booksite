# Darūrī Scholarly PDF engines — OPEN KIT / HANDOFF

**Saved 25 October 2026. Source of truth for any continuation chat.** This kit prevents redoing engine discovery and preserves both successes and NO-GO findings. **Research only; never merge or replace any published PDF on the basis of a benchmark.**

## Important update after the full 25 October experiment suite

**Before doing any further investigation, read [RESULTS_AND_DECISION.md](./RESULTS_AND_DECISION.md).** It is the definitive results log covering full Vivliostyle-PDF 248-page client Blob, failed qpdf and Arabic text layer; the successful partial in-browser JavaScript PDF reserialization repair; Typst 0.15.1 vowelled *and unvowelled* Arabic copy failure; 2-column Typst 153-term directory with generated page numbers and WebKit failure; separate pdfmake-RTL test; licenses, risks, all CI links, and engineering time estimates. The earlier notes below are preserved as historical starting hypotheses, not the newest decision. Specifically, do NOT rerun the same Vivliostyle direct PDF 0.3.3 or `pages-to-pdf` 0.4.1 unchanged, and do NOT assume a Typst 0.15 upgrade fixes Arabic text semantics.

## Where to resume immediately

1. GitHub repository: `gnamma-research/booksite`, working branch `research/daruri-browser-pdf-engine-shootout-20261025`, starting from `research/daruri-published-parity-20261025` (draft [PR #177](https://github.com/gnamma-research/booksite/pull/177)). The current site production branch is `master` and must not be mutated by engine research.
2. Approved reference: `master:daruri/daruri.pdf`, **243 A4 pages**, **979 outline entries**, **5,732 PDF annotations**, **2,856 named destinations**, SHA-256 `d30dac6541d043e663d148984de6e183076fd5bbdee04da26168d22c82327a5c`, 2,667,800 bytes. Inspect master `daruri/pdf-editions-manifest.json` to catch future updates.
3. Current approved authorial source `daruri/edition-r3-20261020.js` SHA-256 `d9f4f16ee0c01814c18914e673385f58b666c7feaecdc042376071342ac26a2d`; complete dictionary data git blob `a8180cb7b3092834146e0ad552d5907326549a82`. **Do not use 20-Oct research source** `e233057d…` or its older dictionary; they predate translation changes.
4. Canonical source HTML builder: `daruri/qa/stage2_shootout/ultimate_html_fixture.py`. From repository root: `python daruri/qa/stage2_shootout/ultimate_html_fixture.py daruri/qa/stage2_shootout/runtime_ultimate scholarly`. Output `runtime_ultimate/scholarly.html` (current-source version has 2,060,089 bytes, SHA `ca9457059d79674ded74c8f7dfda278d0154efdd157374dd9f8740f73fd35aba`). It includes embedded `@font-face` and CSS; prefer original HTML/CSS as the input to browser CSS engines.
5. Generate previous Typst baseline from `ultimate_html_to_typst.mjs`, `ultimate_typst_browser.mjs`, `test_ultimate_typst_browser.cjs`. [Full CURRENT-source CI #40143794146](https://github.com/gnamma-research/booksite/actions/runs/40143794146): **both Chromium and WebKit PASS** 258/258 TOC links, 258 numbered bookmarks, 625 scholarly note objects, 153 term dossiers, 157 full chosen dictionary articles. Latest Typst direct client Blob PDF: **238 A4 pages**, **941 PDF bookmarks**, **4,240 links**, **0 named PDF destination names**, **12,218,816 bytes**, SHA `d42b5ed2e8e1d3c8b454a4b7f009879828b60b4564372590a52f865063c18a4d`; 660 distinct original destinations retained as valid direct links.
6. [Exact-parity job #40143097056](https://github.com/gnamma-research/booksite/actions/runs/40143097056): original WeasyPrint 68 source rebuilt 243/243 **pixel-identical** pages with equal extracted text on all pages, 979 outlines, 5732 matching rectangles/destinations, 2856 named destinations; regenerated binary differs by 4 bytes. Distinct and NOT a browser-from-HTML result.
7. [Exact browser-download job #40144566508](https://github.com/gnamma-research/booksite/actions/runs/40144566508), draft [PR #176](https://github.com/gnamma-research/booksite/pull/176): the existing approved PDF is downloaded with in-browser SHA-256 verification at 1280/390/320 px in both engines; byte-for-byte exact, tampered signature refused. **This is delivery, not typesetting.**
8. [Paged.js complete Scholarly benchmark](https://github.com/gnamma-research/booksite/blob/research/daruri-published-parity-20261025/daruri/qa/stage2_shootout/ultimate_browser.cjs), produced an earlier-source **258-page** print PDF, **no PDF sidebar bookmarks**, **660 named destinations**, 99 distinct source URLs; visual layout preserves CSS/2-column dictionary better. It is **not a direct Blob**: browser Print/Save is needed.
9. Three-way visual comparisons and detailed metrics pre-existing in prior ChatGPT files: `/mnt/data/scholarly_comparison/three_way_opening.png`, `three_way_lexicon.png`, `three_way_source_end.png`, `DARURI_BROWSER_SCHOLARLY_QUALITY_AUDIT_2026-10-25.md`, `engine_metrics.json`, `approved_current.pdf`, `typst_current.pdf`, `paged_benchmark.pdf`. **Beware:** `approved_current.pdf` is an independently regenerated 243-page copy (3.48 MB SHA `13cd1ba…`), NOT the master-approved 2.67 MB file. Use the master-manifest hash to distinguish evidence.
10. The previous 7-page illustrated report `/mnt/data/Daruri_Browser_PDF_Scholarly_Engine_Audit.pdf` documents screenshots and severity. Check `daruri/qa/stage2_shootout/EXACT_SCHOLARLY_PUBLISHED_PARITY_DECISION_2026-10-25.md` for parity architecture.

## What counts as an actual defect?

**NOT automatic defects:** page count 238 vs 243, line breaks, cosmetic font differences, fewer raw link annotations due to absent repeated footer links, same content in a different typographic treatment, absence of tashkīl-sensitive native PDF Find.

**Confirmed or probable scholarly quality blockers:**
- **Typst Arabic ToUnicode / PDF copy extraction:** approved and Paged.js Arabic cover title extract **18 underlying Arabic base letters**, Typst extracts **39 duplicated base letters**. Visual Arabic looks readable, but direct copying/quoting is unreliable. Run `pdftotext -raw` and PyMuPDF comparisons at many sample pages. This is a problem distinct from vowelled search. Do not treat tagged PDF existence as proof of correct reading order. Typst 0.14/0.15 upstream PDF exporter and Typst WASM 1.0 engines need isolated A/B testing.
- **Dictionary directory**: all 153 term dossiers + 157 full historical articles exist; BUT Typst converter loses approved 2-column alphabetical term directory and printed page references. E.g. `ibāḥa` link still opens actual article. The R/BA concordance is unnecessarily single-column. Fix layout/second-pass page numbers, not by re-translating/re-importing entries. Dictionary entries are **not missing wholesale**.
- **Scholarly Qurʾān/source callouts**: Q1/Q2 and their bodies resolve in Typst, but distinctive citation boxes, running heads and repeated footer Contents/Index/Dictionary shortcuts are lost. Distinguish contextual source-note blocks from Study tier's numbered **bottom-of-page** footnotes; separate policies.
- **PDF external named-destination interoperability**: Weasy 2,856 `/Names`; Typst 0 (660 original destination families still work for in-PDF direct GoTo). Decide whether named destinations are required for scholarly permalinks and test PDFKit/Acrobat/Chrome external link behavior.
- **Mobile direct Blob**: CI Chromium aggregate RSS around ~1.1 GB (not correct PSS: counts shared mappings multiple times), 22.8MB raw / 8.38MB gzip WASM engine + fonts, ~12.22MB PDF output. Physical iOS/Android not validated. Cold cache, low-memory, phone download and offline behavior are blockers.
- Content proof `verify_scholarly_candidate.py` checks eligible English starts/ends and 153 full glossary definitions; **not every Arabic codepoint and note full text**; do full bilingual collation for a definitive Scholarly version.

## Alternative engines — verify experimentally

| Candidate | In-browser pagination | One-click pure client PDF | Current status |
| --- | --- | --- | --- |
| Typst WASM 1.0 | Yes, native compiler | **Yes (proved)** | Strong content/navigation; Arabic copy, styles, missing names tree & memory |
| Paged.js + Chrome/WebKit Print | **Yes** | **No**, print dialog (or privileged CI Chrome page.pdf only) | Excellent CSS visual comparator; existing test 0 sidebar outlines |
| Vivliostyle Viewer | Yes, paged CSS | No direct Blob in standard viewer | Partial previous benchmark; run full 2MB latest-source HTML to prove footnotes/lexicon/links |
| `vivliostyle-pdf` + `@pdfme/pdf-lib` | Vivliostyle CSS inside iframe | **Prototype yes** | **Highest-priority new proof**; test real entire current Gnamma input. Detailed README: https://github.com/vivliostyle/vivliostyle-pdf . LGPL-3.0 prototype; depends on AGPL-3.0 Vivliostyle components (legal review before deployment). Known baseline approximation, CSS paint gaps, hyphenation omissions, font fallback concerns. Check text-copy Arabic, every link+bookmark, 625 notes, 153/157 dictionary, memory, time and source HTML/base URL handling.
| WeasyPrint/Pango/HarfBuzz port to WASM | Not available turnkey | Speculative | Native Python+GLib/Pango/fontconfig dependency stack; high-risk larger engineering investment. Do not select before Vivliostyle-PDF trial.
| Own PDF emitter on paginated CSS DOM | Yes, if based on Paged.js/Vivliostyle | Potential | Fork/extend existing LGPL prototype rather than starting from blank pdf-lib; verify RTL glyph shaping, Unicode ToUnicode, link destinations, footnotes, repeated header and table cell painting. |

As of Oct 2026 upstream Vivliostyle Viewer uses Print/Save for ordinary PDF; `vivliostyle-pdf` is an early pdf-lib-based browser Blob prototype, **not yet tested on Darūrī**. See https://docs.vivliostyle.org/en/viewer/index.html . Typst upstream v0.15.1 is newer than the then-pinned `typst-wasm@1.0.0` npm package; do not assume exporter version equivalence.

## Tiered acceptance

- **Scholarly correctness**: 258 sections, 414 source passage pairs/416 rendered bilingual rows, all 625 notes, 153 dossiers, 157 full articles, all genuine R/BA cross-refs and external citations. Deep byte-level original-text collation as appropriate, visually correct Arabic with proper copy/paste base letters; do not require exact vowel-sensitive PDF search.
- **Navigation**: all 258 TOC+bookmark targets, 660 scholarly target families, 99 distinct external cited URLs, footnote call↔body and dictionary dossier↔article links, no dead GoTo, titles and true page numbers if displayed.
- **Visual editorial**: Arabic right/English left; intact quoted source callouts; two-column term directory with trustworthy page nums; concordance; running headings/footer shortcuts; no overflowing, orphan notes, text clipping or broken glyphs.
- **User-device**: direct Blob if promised (not just Print); offline/cache, size/RAM cold load, iOS PDFKit and Android viewers; user-visible failure/hide unsupported options.
- **Legal/governance**: preserve license credits, evaluate AGPL/LGPL/GPL sharing obligations prior to closed distribution, preserve pristine production binaries/source and research-only draft PR.

## Continuation protocol

1. Read this file and `DARURI_BROWSER_SCHOLARLY_QUALITY_AUDIT_2026-10-25.md`; check source pin and latest PR statuses, then run *only* evidence gaps. Do not re-litigate already proven Typst 258 bookmarks or re-run the 120-profile study/edition matrix without a relevant code change.
2. Start with 1 page + 1 note + Arabic+EN+directory microfixture in Vivliostyle-PDF, prove real PDF Blob/link annotations/Arabic logical copy; THEN full canonical Scholarly HTML.
3. Add engine outputs/CI logs + benchmark JSON into this folder, including negative tests, **named original section anchor/links and real note bodies**; every result must say whether direct client PDF is proved or merely browser printing.
4. Keep research branch separate. Do not merge or deploy unless user specifically directs after an evidence-driven review. Report uncertainty and blockers.
