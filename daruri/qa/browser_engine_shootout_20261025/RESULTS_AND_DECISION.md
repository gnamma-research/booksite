# Darūrī Scholarly Edition: verified browser PDF engine comparison and engineering decision

**Research date: 25 October 2026** · **Nonrelease** · **Source-anchored, independently checked.**

This document consolidates experiments on the **current canonical Scholarly source**, not an outdated working translation. It supplements [OPEN_KIT.md](./OPEN_KIT.md), intended as a permanent cross-chat handoff. See `daruri/qa/stage2_shootout/EXACT_SCHOLARLY_PUBLISHED_PARITY_DECISION_2026-10-25.md` for detailed immutable approved-PDF parity evidence. Every candidate is a research engine; nothing should modify `master` or current published assets without separate release approval.

## Executive decision

**Recommended approach: keep the signed WeasyPrint PDF as the default canonical Reference for the moment, and continue developing Typst as the strongest *demonstrated* browser-native Blob generator for customized editions.** Typst has no demonstrated fundamental impediment to printing the 153-entry directory, 157 historical dictionary articles, or 625 notes; we implemented a 2-column linked directory with computed PDF folios as evidence. But its **Arabic logical copy/paste is presently corrupt in at least two WASM compiler versions**, and full-book WebKit with dictionary introspection has become unreliable. **These are release blockers**, not a cosmetic 238-vs-243-page issue.

**Vivliostyle is the strongest CSS-fidelity alternative**. The complete 248-page original HTML can be paginated and exported in-browser using `vivliostyle-pdf` into a real Blob. However, the current pdf emitter produces malformed PDF object streams, broken ToUnicode cross-reader extraction and high memory use. We repaired the object structure **with pure in-browser JS**; text semantics remain broken. It should not be published yet, though a targeted open-source fork is plausible. **Paged.js** offers a good Print/Save-as-PDF fallback that keeps closer HTML/CSS layout, but full PDF sidebar bookmarks or one-click client PDF blobs have not been demonstrated.

**Do not require the new generator to match WeasyPrint pagination.** Require full content, proper reader/copy functionality, link destinations, source references and professional printed layout. Treat original exact copy and differently formatted editions as separate user-visible choices.

## Ground truth and strict scholarly acceptance

Master `daruri/daruri.pdf` = approved **243 A4 pages**, 2,667,800 B, 979 outline entries, 5,732 PDF link annotations, 2,856 names-tree destinations, SHA-256 `d30dac6541d043e663d148984de6e183076fd5bbdee04da26168d22c82327a5c`.

Current authorial JS SHA-256 `d9f4f16ee0c01814c18914e673385f58b666c7feaecdc042376071342ac26a2d`. Current complete dictionary data blob SHA `a8180cb7b3092834146e0ad552d5907326549a82`. `ultimate_html_fixture.py` builds current Scholarly HTML of **2,060,089 B** SHA `ca9457059d79674ded74c8f7dfda278d0154efdd157374dd9f8740f73fd35aba`.

Source: 258 numbered authorial sections, 414 original bilingual pairs / 416 rendered bilingual segments per language, **625 original scholarly note objects, 153 terminology dossiers, 157 complete *selected* historical dictionary articles**, 283 historical article English paragraphs, 660 distinct internal reference target families, 99 distinct external URLs.

**"Complete" means each selected article is supplied completely**, *not* that every historical dictionary has been exhaustively transcribed. A failed glossary directory layout is not a lost article; confirmed loss only after the actual body or its notes cannot be found. The 591/591 note and 282/282 lexicon *excerpt* gates are NOT exact full-text collations of mixed Arabic/English note bodies.

Source-grounded release checks:
- 100% named authorial sections; bilingual Arabic right / English left, no lost quoted Arabic or editorial apparatus.
- 625 note IDs and each note body reachable from its call; real Qurʾān/Hadith/source citations legible with distinct reference layout.
- All 153 dossier definitions and exactly chosen 157 historical articles *visually and semantically present*; live term directory with trustworthy page numbers, cross-links and concordance.
- Meaningful 258 TOC hyperlinks/bookmarks and footnote/dictionary/URL links; **zero broken** target/click annotations; external PDF `/Names` needed only if deep-link consumers require it, but assess interoperability.
- Arabic visual shaping and **logical base-letter copy without duplication** (distinct from fully diacritic-exact native PDF Find, which is NOT an acceptance requirement).
- Standard PDF structure accepted by qpdf, MuPDF, Poppler, and PDFium/PDF.js; accessible reading order, user-device actual memory, offline, no remote rendering/data upload.
- Cosmetic page count differs harmlessly; repeated footer hyperlinks might use a different scheme if comparable navigation remains.

## Empirical engine results — actual original source, not claims

| Engine/candidate | Proven full source result | PDF fidelity/navigation | Time, size, memory | Outcome |
|---|---|---|---|---|
| **Canonical WeasyPrint 68/Pango** | 243/243 pages visually identical to approved | 979 outline, 5,732 links, 2,856 named destinations, all page text equal; rebuilt bytes differ by four serialization bytes | Published 2.67 MB; native build/deployment | Gold-standard reference; cannot assume it works in normal browser |
| **Typst WASM 1.0** prior | **238 pages** current approved source. Direct browser Blob in Chromium and WebKit. Full 625 note/153 dossier/157 article source. | 258/258 numbered TOC links/bookmarks, 941 outline entries, 4,240 links, 660 target families accessible via direct GoTo; no names tree. Multiple repeated footer link annotations absent. Arabic copy broken. | 12.218816 MB; ~5–11s compilation in CI; aggregate Chrome RSS around 1.1 GB (overcounts shared memory), raw WASM 22.8 MB / gzip ~8.38MB + fonts | **Most mature direct native browser Blob**, not publication-ready |
| **Typst WASM 1.0, revised directory** | **231-page complete current-source PDF passed in BOTH Chromium and WebKit** (latest pinned CI #40154144471), with **153 linked entries in two visible printed columns**, generated target-page folios, first full `ibāḥa` dossier begins at top of page 156, not orphaned in directory. 258/258 TOC/bookmarks and all excerpt/full-definition scholarly gates pass. | 941 outline/4,240 links retained. **Important remaining printed-index defect:** on index p154 the displayed `ibāḥa` folio was 155 while actual GoTo jumped to physical p156. Live counters must be compared against real PDF target pages for all 153 entries; an experiment now uses physical `locate().page()`. | **12,300,223 B**, Chromium/WebKit byte-identical SHA `2883527b7fe0588e04983c9d0297513541dea6d9f4ab3d7a6394da7c2e92c77c`; earlier WebKit intermittent failures were not reproduced in this final passing run. | **Cross-browser layout/content benchmark PASS; Arabic PDF copy and exact folio matching still open** |
| **Typst 0.15.1 WASM alternate** | Real Noto Arabic/English small PDF compiled valid in 245ms using `@jsfi/typst-wasm@0.1.0`. | Arabic PDF copy STILL wrong: title 18 expected base letters → 39; unvowelled 18→25; `الكتاب` 6→8; vowelled `الْكِتَابُ` 6→12; legal sentence 30→43. Both MuPDF and Poppler. | 26.9MB raw WASM; one-page PDF 21.2KB | **Upgrading Typst alone does not repair Arabic** |
| **Paged.js + browser Print/Save** | Existing benchmark full Scholarly original HTML **258 pages**, 625 notes/153 dossiers/157 historical articles from then snapshot; current-source full recheck still needed. | Visually closer to WeasyPrint, including boxes/columns; ~660 named PDF destinations but zero PDF sidebar bookmarks in printed output. | ~2.97MB printed PDF, aggregate browser RSS ~784MB desktop PSS reported earlier; requires Print dialog, not direct Blob | **Excellent fallback / CSS quality comparator** |
| **Vivliostyle Viewer/Print** | CSS typesetter loaded genuine current-source 2.06MB HTML; viewer script briefly confirmed 52 source segments; **zero historical articles at moment checked because viewer lazy loads** (NOT a full-book completeness check). Full-book CSS paginated pages via prototype below. | Existing `@vivliostyle/print` naturally uses browser Print/Save; direct Blob is separate prototype. | Browser page view / print behavior may be optimized by lazy loading; inspect complete print output before claiming all pages loaded | **Promising CSS pagination, not by itself a one-click PDF exporter** |
| **Vivliostyle-PDF@0.3.3 / pages-to-pdf** | **248-page current complete Scholarly direct client Blob**, current 625/153/157 original HTML input; Poppler recognizes English paragraphs and historical dictionary articles. | 358 outlines, 3,270 annotations (3,098 internal kind NAMED, 172 external URI); no named destination tree. qpdf **exit 3 malformed object streams**, MuPDF text extraction control characters (0 Arabic and no English), some named link objects suspicious. **Not a usable PDF by scholarly standards.** | 5,604,935 B; 322,087 ms (~5m22s), approximate cumulative browser RSS ~2,887,652 KiB (shared mappings double counted). | **Direct Blob proven, full-book release NO-GO** |
| **Vivliostyle emitter with pages-to-pdf 0.4.1** | 16p original-source microbook direct PDF. | qpdf still exit 3; MuPDF Arabic/English copy broken | ~234KB; ~1.6sec micro | Changing version alone DOES NOT solve emitter faults |
| **Vivliostyle + in-browser JS `@pdfme/pdf-lib` object rewrite** | 16p genuine bilingual source+notes+two historical dictionary articles output **within browser** via `?rewrite=1`. | **qpdf now PASS**, retains all 16p, 5 outline, 29 annotations, but MuPDF Arabic/English extraction **STILL FAILS**. | ~445KB repaired PDF, ~2.44 sec end-to-end | **Partial open-source engineering success**, needs font ToUnicode and link fixes |
| **pdfmake-RTL@2.1.2** | One-page micro from real Noto Arabic/English source, dictionary and Qurʾān link; 23,575 B generated in 133ms Node; JS engine is browser-capable but browser execution NOT exercised here. | qpdf valid; 9 external +3 internal named links, zero outline; **Arabic logical extraction mangled and English lines fragment**. Not HTML/CSS; full 625-note/157-article conversion absent. | Fast micro, but requires bespoke typesetting converter | **Reject as first full-Scholarly engine unless targeted Arabic fix** |

**Vivliostyle full-book** [#40152495842](https://github.com/gnamma-research/booksite/actions/runs/40152495842). **Vivliostyle 16p micro** [#40152220663](https://github.com/gnamma-research/booksite/actions/runs/40152220663). **JS browser rewrite** [#40153714842](https://github.com/gnamma-research/booksite/actions/runs/40153714842). **pages-to-pdf@0.4.1 failure** [#40152642637](https://github.com/gnamma-research/booksite/actions/runs/40152642637). **Typst 153-term two-column directory initial** [#40153514877](https://github.com/gnamma-research/booksite/actions/runs/40153514877); **fully successful both-browser 231-page source output** [#40154144471](https://github.com/gnamma-research/booksite/actions/runs/40154144471). **Typst 0.15.1 vowelled/unvowelled copy differential** [#40153845189](https://github.com/gnamma-research/booksite/actions/runs/40153845189). **pdfmake RTL micro** [#40154041260](https://github.com/gnamma-research/booksite/actions/runs/40154041260). **Vivliostyle Viewer initial load** [#40152694770](https://github.com/gnamma-research/booksite/actions/runs/40152694770).

In all counts, qpdf failure or missing Arabic logical copy is an unequivocal NO-GO. Some English excerpt audits normalize whitespace and accents, so they cannot establish exact whole-Arabic/textual fidelity. Zero names tree is not synonymous with zero valid internal links.

## What the actual screenshots establish

Source screenshots live in previous analysis kit. Key findings:
- WeasyPrint / Paged.js / Vivliostyle retain **framed Qurʾānic source notes and compact two-column dictionary/concordance** more naturally through HTML/CSS. Baseline Typst converter prints source note content as plain text, often weaker hierarchy.
- Typst source columns Arabic right/English left are legible but type is dense, footer navigation/running heads absent in the early converter; not intrinsically beyond Typst to implement.
- Repaired Typst dictionary index has **two linked columns and real target folio expressions**. The previously orphaned first `ibāḥa` article now starts correctly at the top of physical p156 (visually inspected after a targeted page break), and all source text remains. **One index folio still displayed p155 for that link when the target PDF page was p156**: structural link itself is correct, but printed numbering needs strict individual 153/153 comparison. Next experiment changes the Typst counter to `#context locate(<target>).page()`; do not certify printed index page numbers until all 153 pass.
- Vivliostyle CSS output on microbook looks visually close to Weasy, but **PDF is malformed** regardless of how nice its raster looks.
- Missing notes and dictionary articles must be proved by comparing actual bodies. Their *printed treatments* are distinguishable, and retaining all contents ≠ professional scholastic presentation.

## Root causes and feasible changes

### A. Typst Unicode/Arabic ToUnicode: severe, upstream or low-level exporter fix

Duplicate Arabic codepoints are present in the emitted PDF text layer for **fully vowelled AND unvowelled** Arabic with actual repo Noto Naskh. The problem is not just native PDF Find under tashkīl. A PDF glyph sequence does not map one-to-one to logical Unicode, and multiple ToUnicode chunks/ActualText fragments can duplicate base letters.

**Preferred engineering:** isolate a 6-letter Arabic reproduction from Typst 0.15.1 and upstream PDF writer (Krilla). Ensure the logical Unicode spans survive shaping rather than trying to infer source characters from glyph IDs. Add MuPDF, Poppler, PDF.js, PDFium, qpdf regression. Investigate experimental [Typsastra Enhanced Unicode Engine v0.2](https://forum.typst.app/t/typsastra-enhanced-unicode-engine-for-better-unicode-in-pdfs/9709) and [unicode-pdf Rust alpha](https://github.com/Sovichea/unicode-pdf) as **reference implementations** (not proven web modules) before designing new ToUnicode writer. Do not swap font automatically, discard diacritics, or hide the Arabic from text layer as a workaround. A native PDF post-processor that fixes copied text without overlay-based visual artifacts may be appropriate only when mapped back to exact source offsets.

### B. Typst Scholarly layout is largely our converter's responsibility: proven fixable

Already done: two-column linked term directory + real target page folios; unique original section bookmarks. Next implement:
1. Distinct Qurʾānic/source note boxes and consistent note/citation hierarchy.
2. Main text running part headings and footer Contents / Subject index / Historical dictionary shortcuts.
3. Compact linked R/BA concordance and source audit columns (no six-page tall 1-column tables).
4. `lex-directory-list` first entry starts on fresh page; check page-number vs actual target start and article body placement.
5. An earlier WebKit compile regression occurred in some 153-counter iterations, but the stabilized 231-page build passed **both Chromium and WebKit** at [CI #40154144471](https://github.com/gnamma-research/booksite/actions/runs/40154144471). Verify the printed 153 folios against physical destinations (prefer `locate(<label>).page()` over `counter(page).at()`) and test on physical iOS Safari; one green run is not mobile-memory certification.
6. Portable named PDF destinations if needed by scholarly third-party deep links. In-PDF GoTo links already work; before implementing `/Names`, test compatibility with Acrobat/PDFKit to avoid solving a non-requirement.
7. Device memory scaling and font/WASM cache.

Typst's **no page matching Weasy** is a nonissue; it can be a better canonical layout if all scholarly gates pass.

### C. Vivliostyle CSS paginator good; direct PDF writer not publication ready

HTML/CSS faithfully describes the approved edition, so Vivliostyle/Paged.js can reuse original print styles. The prototype emitter is independently broken:
- PDF object stream integrity (repairable now using pure JS pdf-lib reserialization): a single client-owned `PDFDocument.load()/save({useObjectStreams:false})` pass took <0.2 s in a tiny microbook, but increased file size to 445KB. Need full-book stress, memory measurement.
- Font ToUnicode/ActualText: reserialization **does not repair** font semantics, Arabic glyph shaping/copy, or MuPDF English text.
- GoTo semantics: verify that all 660 source href families truly resolve to correct pages in PDFKit/Acrobat, not simply the count of annotation objects or named 'kind' references.
- Memory: full 248p emit ~5 minutes and ~2.9GB aggregated RSS. Need streaming per-page output, font cache/coverage, worker offload, bounded memory and physical phones.
- License: `vivliostyle-pdf` LGPL-3.0-or-later; Vivliostyle Core/Viewer/Print dependencies AGPL-3.0. Read reciprocal/network source-sharing obligations with counsel if integrating into proprietary surface, but a publishing output PDF itself is generally not made AGPL by using the tool. Font licenses OFL, no font binaries in uploaded downloadable handoff kit. Full project already hosts open code and may comply easily; still review.
- **Fork strategy:** work on `pages-to-pdf` / pdf-lib writer as a reusable standalone PDF output module; do NOT fork all of Vivliostyle Core unless pagination itself is demonstrably wrong.

### D. Paged.js browser print fallback

Keep for low-risk CSS edition generation. It can use original source and avoid a new PDF writer when user accepts Print→Save; printed PDF creation via `Playwright page.pdf()` is **privileged CI**, not user-browser direct Blob, therefore not the intended client-only one-click architecture. Add link/bookmark tests of print result, possibly injecting PDF outlines post-export only via supported API. Do not falsely claim no support for scholarly dictionary bodies because the printed directory previously looked good.

### E. Building a PDF engine from scratch is not first choice

The hard engineering is not printing Latin headings or tables. It is Arabic glyph shaping + logical ToUnicode, bidi mixed tables, CSS pagination/footnotes, font subsetting, page number cross-references, accessible annotation structure, bounded mobile memory and robust inter-PDF-reader linking. Reuse existing CSS paginator + improve emitter, or upstream Typst/Krilla Unicode architecture. Apache-licensed Rust `unicode-pdf` alpha can become a PDF semantic layer but has no full current browser Paged CSS/footnote engine, so replacing a working paginator with it would be a false economy. A WeasyPrint/Pango/Fontconfig/GLib/HarfBuzz port to browser WASM is high cost and native dependency complexity; exact rendering parity cannot be guaranteed without identical font environment, though not required by the user.

## Engineering effort, costs and delivery milestones (estimates, not background commitments)

These are **engineering effort ranges for one experienced developer with good Rust/Typst or browser PDF skills**, assuming current code, working CI, source corpus, and no fundamental upstream blocker. They are not elapsed promises or guarantees; physical-device QA and editorial proof require an additional specialist/reader.

| Workstream | Rough hands-on effort | Relative risk | Advancement condition |
|---|---:|---|---|
| Typst front/back matter polishing (dictionary index proof, citations, concordance, running headers and links) | **1–3 engineer-weeks** | Low–medium | All 153 index page refs, 157 historical articles, page heads/notes, PDF navigation passes |
| Typst full mixed-Arabic/English text **ToUnicode** bug with upstream PDF writer patch and regression readers | **3–8 weeks** if compatible patch; **8–16+ weeks** if fundamental exporter design | High | 18/18 title Arabic letters, 6/6 short unvowelled and vowelled, full note/dictionary corpus logical copy + all current links, zero new visual layout failures |
| Stabilize Typst WebKit large-doc + mobile cold-memory, font preload, fallback | **2–5 engineer-weeks**, with physical test hardware | High | Whole book completes in limited memory on actual iOS/Android |
| Paged.js CSS publication-quality Print/Save fallback | **1–3 engineer-weeks** | Low–medium | Printed full book complete; proper note placement, links and correct pages, clearly uses browser Print rather than direct Blob |
| Vivliostyle JS emitter font logic / ToUnicode patch after already-proven object-stream repair | **4–10 weeks** first robust prototype; plus **3–6 weeks** for full-book memory/link-reader compatibility | High | Micro then full 625-note emits qpdf-clean, copies exact Arabic and English, all source targets work in multiple readers, fits devices |
| Fork/extend Vivliostyle `pages-to-pdf` into production PDF exporter | **2–4 months** (depends on above), more if RTL font encoding systemic | High | Release-grade emitter of full Scholarly in browser, regression suite + license compliance |
| New document-model PDF stack (pdfmake-RTL or new Rust library + styling) | **3–6+ months** | High | Must rebuild CSS/parallel bilingual layout/dictionary and deliver correct text semantics |
| New standalone PDF emitter **from scratch** including text model, font shaping, PDF annotations and accessibility | **6–12+ months** | Very high | Only justify if existing emitters impossible to repair/reuse |
| WeasyPrint+Pango+Cairo+GLib/Fontconfig WASM port | **6–12+ months** and risky | Very high | Usually not worth it because exact page parity unnecessary |
| Human editorial **complete** 625-note/bilingual/157-article proof + device tests | **1–3+ weeks**, plus domain reviewer time | Medium | Required before any authoritative tier switch, independent of engine |

**Effort-based recommendation:** Invest a short **two-week validation pilot** in (a) upstream/Krilla Arabic ToUnicode and (b) Vivliostyle writer font semantics + full-book mobile RAM instrumentation; compare outcomes against acceptance gates. If neither yields correct 6-letter Arabic copy in multiple PDF readers within pilot, preserve signed Scholarly reference and offer Paged.js Print fallback for new custom profiles. Do NOT spend 6 months rewriting all of WeasyPrint or PDF engine merely to eliminate a print dialog.

## Exact source/test recipe for another chat

Read [OPEN_KIT.md](./OPEN_KIT.md) first. Code paths on branch `research/daruri-browser-pdf-engine-shootout-20261025`:
- `daruri/qa/stage2_shootout/ultimate_html_fixture.py` — full original HTML builder (pin current source SHA)
- `ultimate_typst_browser.mjs`, `ultimate_html_to_typst.mjs`, `test_ultimate_typst_browser.cjs` — whole book Typst
- `vivliostyle_micro_fixture.py`, `vivliostyle_pdf_browser.mjs`, `test_vivliostyle_pdf_browser.cjs`, `normalize_vivliostyle_pdf.mjs` — micro+full Vivliostyle client Blob and repair
- `qa_typst015/arabic_pdf_qa.mjs`, `qa_typst015/arabic_variants.mjs` — real Arabic glyph/ToUnicode 0.15.1 micro (5 variants)
- `../browser_engine_shootout_20261025/pdfmake_rtl/scholarly_micro.cjs` — separate document-model RTL engine
- `../build/fonts/` is owned by original repo (retain fonts in repo as existing), **never redistribute font binaries in ChatGPT handoff zip**.
- Run GitHub CI by changing only associated research branch code/workflows; use named runs above and GitHub actions artifacts. All trial PDFs are NONRELEASE.

## Documentation and licensing sources

- Typst complex script PDF text/copy issue [#4225](https://github.com/typst/typst/issues/4225).
- [Typsastra Enhanced Unicode Engine v0.2](https://forum.typst.app/t/typsastra-enhanced-unicode-engine-for-better-unicode-in-pdfs/9709) experimental Rust/Krilla logical-text approach.
- [unicode-pdf Rust alpha](https://github.com/Sovichea/unicode-pdf), Apache 2, early complex-script logical text model; not a ready full publication renderer.
- [Vivliostyle PDF](https://github.com/vivliostyle/vivliostyle-pdf), LGPL prototype, CSS pagination + PDF writer; limitations.
- [Vivliostyle license FAQ](https://vivliostyle.org/faq/), AGPL core and output distinction.
- [Vivliostyle Viewer Print→Save](https://docs.vivliostyle.org/en/viewer/index.html).
- [Paged.js](https://pagedjs.org/) print-first browser CSS engine.

## Safety / release status

This is an evidence log and nonrelease research. **No production merge or deployment**. Canonical 243-page PDFs remain signed and untouched. No claim that normalized English substring probes prove exact Arabic or complete notes. Actual iOS Safari, iPad PDFKit, Android viewers, Acrobat and mobile memory tests remain unexecuted.
