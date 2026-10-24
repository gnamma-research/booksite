# Darūrī Scholarly PDF — definitive exact-copy decision

**25 October 2026 — completed automated comparison, nonrelease research.** The published `master` PDF is the standard of fidelity; all research branches remain isolated. No PDF binary or public download was replaced.

## Fixed approved reference

- Approved binary: `master:daruri/daruri.pdf` as of master SHA `2c1b76f2b606d9cbfee2340debfb8fb696754c52`.
- Manifest: `daruri/pdf-editions-manifest.json`.
- **243 A4 pages, 2,667,800 bytes, SHA-256 `d30dac6541d043e663d148984de6e183076fd5bbdee04da26168d22c82327a5c`**.
- 979 PDF bookmarks; 5,732 link annotations with precise rectangles/targets; 2,856 source-internal names-tree destinations.
- Latest canonical source JS SHA-256 `d9f4f16ee0c01814c18914e673385f58b666c7feaecdc042376071342ac26a2d`.
- Latest full historical dictionary payload is the same `full-headwords.json` blob as master: `a8180cb7b3092834146e0ad552d5907326549a82`.
- Earlier browser experiments used the OLD JS `e233057d…` and OLD dictionary definitions; they MUST NOT be presented as identical to this edition.

## Three independent exactness claims

| Claim | Result | Evidence |
|---|---|---|
| Rebuild the edition from current structured source using original WeasyPrint 68/Pango pipeline | **PASS VISUAL / SEMANTIC**: 243/243 full pages pixel-identical, every page's extracted text equal, all 979 outlines, 5,732 links with type, rectangle and destination, all 2,856 named destinations and PDF metadata identical. Rebuilt PDF has a distinct SHA and is 4 bytes shorter due differences inside compressed PDF serialization. | [Actions #40143097056](https://github.com/gnamma-research/booksite/actions/runs/40143097056) |
| In an ordinary Chromium/WebKit browser, download the EXISTING approved PDF and SHA-256-verify it before saving | **PASS BYTE-FOR-BYTE**, exactly approved 2,667,800 bytes and manifest SHA. Deliberately forged SHA is refused before any download. | [Standalone #40143958575](https://github.com/gnamma-research/booksite/actions/runs/40143958575) |
| Generate a NEW PDF entirely inside an ordinary browser directly from canonical HTML via Typst WASM | **PASS FUNCTIONAL RESEARCH PDF; FAIL EXACT PUBLISHED COPY**: full Scholarly apparatus output, but 238 instead of 243 pages, 941 instead of 979 bookmarks, 4,240 instead of 5,732 links, zero instead of 2,856 names-tree destinations; visually different pagination/fonts/line geometry. | [Full source and parity test #40143794146](https://github.com/gnamma-research/booksite/actions/runs/40143794146) |

The newly corrected Typst build uses current approved authorial and dictionary source files, generates the complete 625 scholarly-note source objects, 153 glossary terms and 157 complete selected historic articles, with all **258/258** editorial TOC links navigating to matching PDF bookmarks. Chromium and WebKit emitted byte-identical PDFs of 12,218,816 bytes, SHA `d42b5ed2e8e1d3c8b454a4b7f009879828b60b4564372590a52f865063c18a4d`. Independent eligible English source probes 416/416 and original-current-source cross PDF probes 415/415. This is deliberately labeled **different Scholarly typesetting**.

## Working integrated Reference UI

The verified exact-download process has been inserted in the actual Editions **Reference** tab on **draft feature PR #176** (not live). Its Read action remains available. New Download checks the latest static manifest, integer PDF byte size, PDF header, and SHA-256 with the browser's `crypto.subtle`, then offers a Blob containing the **original approved binary**. Manifest corruption or stale mismatched PDF causes a user-visible refusal, not a silent fallback.

[Integrated CI #40144566508](https://github.com/gnamma-research/booksite/actions/runs/40144566508): **Chromium and WebKit BOTH PASS** on 1280×860 desktop, 390×844 phone and 320×700 narrow phone viewports (six exact downloads). Each output had original SHA `d30dac65…`; the button was at least 48×48; the intentionally forged digest triggered NO download and a visible checksum error. Personal reading notes were not read/uploaded. This is Linux browser emulation, **not physical iPhone/iPad/Android acceptance**.

- [Draft PR #176 — integrated Reference verified download](https://github.com/gnamma-research/booksite/pull/176)
- [Draft PR #170 — predecessor new-layout Typst research](https://github.com/gnamma-research/booksite/pull/170)

## Decision

**For a guarantee of an exact current Scholarly edition:** keep the official canonical WeasyPrint source-to-PDF build and signed original PDF available as the Reference edition; deliver that existing artifact byte-for-byte, verifying its manifest hash in the ordinary visitor browser. This is the reliable low-bandwidth, low-memory workflow; it does NOT pretend that downloading a prepared PDF constitutes new HTML typesetting.

**For new reader-customizable exports:** retain signed Stage 1 modular recipes (12 source bases + 15 apparatus packets → 120 choices) and experimental full-HTML Typst WASM in separate controls/branches until acceptable. Mark any Typst output as a different layout. A true in-browser re-typesetter capable of page-for-page WeasyPrint/Pango equivalence has NOT been demonstrated. Neither the Typst research PDF nor an optional postprocessed compressed variant may replace the approved Reference under an "exact copy" label.

No exact tashkīl-sensitive *PDF search* is required. Accurate Arabic typography and complete scholarly editorial prose still matter.

## Remaining release controls

- Draft PR #176 must not merge into production without final current-master UI/asset-cache/offline compatibility review and physical iOS Safari/PDFKit and Android tests; 320–1280px simulated browser tests passed.
- Continue a separate full textual exact Arabic and English scholarly note/dictionary collation and accessibility/reading order for any different Typst PDF. Source-count/excerpt probes alone are not exact visual reproduction.
- Preserve source provenance and no-repeat experiment evidence. If `master` PDF or manifest SHA changes, rerun the exact-reference UI and WeasyPrint source rebuild tests against the new pair and refuse stale digests.
