# Darūrī dynamic apparatus PDF — independently verified 120-profile parity

**Date:** 22 October 2026  
**Status:** **Page/layout/link equivalence: PASSED; public-release acceptance: NOT YET PASSED.**

## Source and scope

- Approved source: `gnamma-research/booksite` published Reading/Study A4 + apparatus PDFs.
- Dynamic assembler: `feature/daruri-on-demand-pdf-20261022`, pinned commit `2dfc1e716f36e6cee32c6a45705917a6acf8d43c`.
- Independent audit code: `daruri/qa/verify_dynamic_apparatus_links.py` on `qa/daruri-dynamic-links-20261022`.
- Reproducible [GitHub Actions run 39774573713](https://github.com/gnamma-research/booksite/actions/runs/39774573713), six successful 20-PDF shards, plus successful three-profile smoke.
- **No approved PDFs were replaced, deleted, or regenerated in public locations.**

## Verified figures

| Criterion | Result |
|---|---:|
| Complete PDF profiles assembled and independently certified | **120 / 120** |
| Source/appendix pages compared byte-for-byte after rasterization | **12,888 / 12,888** |
| Pages with identical extracted visible text and word geometry | **12,888 / 12,888** |
| Exact approved appendix link multiplicities, semantic targets and geometry compared | **187,648** |
| Approved original base-PDF hyperlink instances checked and preserved | **57,180** |
| Source section named anchors checked against approved base PDFs | **30,960** (258 × 120) |
| Bad target pages, extra/missing links or incorrect URIs | **0** |
| Largest measured geometric coordinate deviation | **0.0005188 pt** (~0.000183 mm) |
| Maximum permitted geometric deviation | **0.002 pt** (~0.000706 mm) |

### Why the earlier test failed

The experimental `test_parity.py` creates link signatures by rounding both rectangle and target coordinates with `round(v, 1)`. Values on opposite sides of a half-decimal boundary can yield visibly different rounded numbers despite a genuine delta of only ~0.0005 pt. This false positive was detected on the exact generated PDFs from earlier failed run 39772057964 and compared with SHA-verified approved PDFs from run 39773449320.

The independent replacement comparison **does not round** coordinates for equivalence. It partitions links by exact `kind`, destination page, URI and whether a target coordinate is absent, enforces identical cardinality in each group, and obtains a minimum-maximum-coordinate-distance bijection using the Hungarian algorithm. Differences exceeding 0.002 pt fail. The same independent audit also checks rendered appearance, text, outlines and 258 section links per PDF. 

This is not a relaxation of the *destination* requirement: one link to a different page or URI, one extra or missing duplicate, or an unmatched rectangle outside tolerance fails.

## Browser-local personal-PDF integration proof (additional gate passed)

Independent mobile-browser test fixture in `daruri/qa/verify_dynamic_personal_browser.cjs`, against the same pinned experimental commit. This injects only a test UI into `personal-export.html` at load time and does **not** edit or publish the website.

- Mobile **WebKit** [Actions 39776277485](https://github.com/gnamma-research/booksite/actions/runs/39776277485): **PASS**, 86-page assembled Reading+glossary plus 1 page of P1/P2 personal notes, 1,070 source-side PDF links and 1 appendix-to-source return link; 3.433 seconds in the runner.
- Mobile **Chromium** [Actions 39776789358](https://github.com/gnamma-research/booksite/actions/runs/39776789358): **PASS**, same 87-page structure and links; 3.479 seconds in the runner.
- Both tests verified retained unanchored personal notes, English/Arabic synthetic note text in the searchable appendix, no added PDF comment popups, stable Reading Desk local storage, and no cross-origin or non-GET web requests.
- Inspected the rendered source page with its P1 marginal marker and endnotes page (both legible, no clipping or overlapping). The chosen ambiguous single-word quotation uses the exporter’s safe section fallback; **exact-word highlight coverage remains to be exercised separately with unambiguous verified source phrases**.

These are real WebKit/Chromium browser-engine results, not native Apple PDFKit or Android PDFium confirmations. Neither is a performance promise on an older mobile device with many personal notes.

## Remaining production gates (do not conflate)

1. **Native source Arabic search**: current published original Ibn Rushd pages were independently audited. Arabic source multiword phrases had **0 / 414** matching segments in each of 14 Arabic-containing canonical/A4 PDFs, despite visually correct Arabic. This is distinct from the merged and functional P-numbered *personal appendix* Unicode fix. Work in issue #44 and PR #38. A dynamic assembler preserving source pages **cannot fix this merely by appending new apparatus**.
2. **Browser assembly and personal export integration**: experiment branch contains `client.js`, `core.js`, and the `GnammaPersonalExportInline.registerDynamicEdition` bridge in `personal-export.js`. Still require end-to-end Chromium/WebKit/Android tests with real browser-local Reading Desk notes, P links in both directions, bookmarks, saved quotes, and fail-closed SHA map mismatches.
3. **Native PDF readers**: iOS PDFKit, Android PDFium and Acrobat/PDF.js must confirm taps, source destinations, RTL quote selection and reader return behaviour, including low-memory handsets.
4. **Site transition**: wire generator to the existing Editions interface only after acceptance. Approved 120 static PDFs remain independently accessible as fallback, preferably retained through an observed transition period. Offline package/PWA asset caching, browser memory, progress/error UX and mobile network failure need tests.
5. **Footnotes**: published Study real footnotes remain on the call page; scholarly Reference notes are section apparatus, which may legitimately continue on the next page. Preserve source-note policies. 

## Coordination

- The **experiment branch remains under its own owner**. Do not overwrite its ongoing code and avoid an unreviewed merge.
- Keep `daruri/personal-export*`, `daruri/index.html`, all approved PDF binaries, Pango word maps in PR #38 and existing releases unchanged until acceptance and rebasing.
- The QA script is independent and read-only. Future work can pin a newer candidate commit and rerun exact 120-profile certification; a result for this pinned SHA does not automatically certify future commits.
