# Browser-only HTML → PDF: Darūrī A4 engineering verdict (23 October 2026)

**Status: proof of mechanism, no publication acceptance.** All code is isolated on research branches; live Editions UI and canonical PDFs have NOT been modified.

## Objective

Generate a complete native A4, vector, selectable PDF from the canonical `edition-r3-20261020.js` source HTML/structured text in a normal browser (including Safari/WebKit), with no server PDF endpoint, Playwright `page.pdf()` or Chrome DevTools print export, raster page screenshots, `window.print()` dialog, or prebuilt PDF page inputs. It must preserve *original fully vowelled Arabic* as searchable/copyable logical Unicode and include 258 section anchors, 414 authorial Arabic/English segments, text-layer reading order, accurate Study footnotes and all approved scholarly links.

## What has passed already

| Engine | Actual experimental result | Source/code |
|---|---|---|
| **WeasyPrint 68 + Pango** | 12/12 source designs regenerated from HTML, 836/836 visually/textually exact A4 pages; Study footnote pagination passes | [CI](https://github.com/gnamma-research/booksite/actions/runs/39855143997) |
| **HTML-origin WeasyPrint + pdf-lib** | 120/120 final editions from newly rendered HTML source+apparatus; 187,648 independently checked appendix links | [CI](https://github.com/gnamma-research/booksite/actions/runs/39861369212) |
| **Browser pdf-lib PDF assembly** | 120/120 when loaded with SHA-bound reusable PDFs, mobile Chromium/WebKit cancellation/privacy tests passed | [PR #62](https://github.com/gnamma-research/booksite/pull/62) |
| **jsafa-pdf 0.1.1** | Actual PDF Blob in Chromium 0.365s, WebKit 0.627s for short source excerpt (~46 KB). Arabic extraction 0/11 and source note GoTo 0; visual glyph corruption | [CI](https://github.com/gnamma-research/booksite/actions/runs/39874680476) |
| **paginate-for-print 1.1.2 + pages-to-pdf 0.4.1** | One-page Latin *and* Arabic smoke both timed out after 16s; 6-section and full-book cases stalled >180s; need debug layout/iframe callback | [minimal CI](https://github.com/gnamma-research/booksite/actions/runs/39876223420), [full CI](https://github.com/gnamma-research/booksite/actions/runs/39875527493) |
| **@vivliostyle/print 2.45.3 + pages-to-pdf 0.4.1** | Real browser Blob, 277ms 1-page English; 244ms 1-page Arabic; ~4.178s **complete 414-paragraph English**, 46 A4 pages, 1.125MB; bilingual 6-section excerpt 826ms Chromium, WebKit completes too | [CI](https://github.com/gnamma-research/booksite/actions/runs/39876888474) |

**A green test for actual generated PDF bytes does not imply release readiness.** The custom client PDF engine produces PDF bytes from HTML, but the source text and PDFs do not yet pass scholarly publication requirements.

## Independent byte-level extraction/render audit

Real downloaded PDFs were inspected in PyMuPDF/MuPDF, Poppler `pdfinfo`, and rendered page PNGs, using the original, deterministic 414-passages source ZIP from [draft PR #73](https://github.com/gnamma-research/booksite/pull/73).

- The 46-page **English browser PDF** is visually legible in Chromium first-page rendering, but the approved English Reading edition is **43** pages. **374/414** complete normalized English source paragraphs were contiguous in extracted text; 40 source paragraphs were broken across PDF-extraction operations. No link annotations. Modern scholarly cross-reference quality remains unproven.
- **One-page Arabic only** shows the Arabic phrase `وَفِي أَلْفَاظِهِ` on the page, but native extracted text is `وَفِيِأَلْفَاظِه`. PDF native exact find returns **zero** matches. The `font-family` actually embedded is fallback **LibertinusSerif**, not the intended Noto Naskh Arabic.
- **6-section bilingual Chromium**: malformed PDF font dictionaries warning in Poppler, broken Unicode layer, no native source §65 search, **0 GoTo footnote link annotations**. Bilingual WebKit 3-page PDF is **visibly garbled** (meaningless floating characters) and MuPDF reports `unknown cid font type` and `invalid key in dict`; `pdfinfo` reports `Illegal character ')'` and `Dictionary key must be a name object`. Independent normalized full-passage match: **0/11 Arabic + 0/11 English**. This is a hard release failure.
- Output `@pdfme/pdf-lib` CID subsets can be malformed even when library returns a `Uint8Array` without throwing. Font CSS appears to be lost or remapped to fallback `DejaVuSans`/`LibertinusSerif` in the writer. Serve bundled fallback fonts/ICC/WOFF2 WASM from same-origin `pages-to-pdf/public/`; this fixed `No fallback font available` build error, **but did not repair Arabic**. Recheck actual paginated iframe `@font-face` and computed Noto font selection, and whether `emitPdfFromWindow` honours it ([instrumented CI](https://github.com/gnamma-research/booksite/actions/runs/39878054314)).
- In particular `/ToUnicode` and glyph subset instructions must map originally supplied Arabic characters to actual shaped glyphs and preserve mark ordering. PDF/UA tagging *alone* does not repair the underlying character maps or search operations. R065 inline raised note marker must not split source Unicode sequence.

## Technical architecture recommendation

1. Preserve the **structured source JSON / standalone HTML as authoritative publication source**. The portable source ZIP (standalone HTML, TEI, JSONL, Shamela UTF-8 TXT/HTML candidates) belongs in Editions UI only after editorial/source rights review. The UI handoff is [#74](https://github.com/gnamma-research/booksite/issues/74), source-export [draft #73](https://github.com/gnamma-research/booksite/pull/73). Do not alter concurrent Editions code in this research branch.
2. **Ship ready-to-use readers through the proven modular PDF assembly** while researching genuine client HTML typesetting. Offline browser pdf-lib assembly retains verified A4 source pages/packets, link profiles and private user annotations; static originals remain rollback assets.
3. Real client HTML typesetting is promising using Vivliostyle, but needs either a repaired **DOM→PDF vector font/Unicode emitter** (upstream patch or controlled local fork) or an independent WASM text shaping/PDF writing backend retaining HarfBuzz cluster semantics. Do not use raster screenshots, which break native text search/copy.
4. **Preflight** must treat missing embedded fonts, malformed CID font dictionaries, absent `/ToUnicode`, section/note GoTos, wrong page count or baseline PDF pixel changes as hard errors. Run independent PDFium/PDFKit/MuPDF/Poppler/PDF.js on exact final bytes before presenting Download.
5. For Study, browser profile must reproduce all existing native note call/body pairings (119 bodies, 176 call anchors in audited default edition) and contain no handwritten/unsupported layout fallback. Test native IPhone/iPad as a separate runner; headless WebKit ≠ iOS Safari memory and print-download behavior.

## Release gate

Require all: 414/414 native Arabic original source searches and source-local highlighting, clean copied fully vowelled strings in PDFKit/PDFium/MuPDF/PDF.js, logical bilingual English/Arabic reading order, note call/body pagination and GoTo, 258/258 section destinations, 120/120 approved A4 PDF profile-equivalent outputs and 187,648 appendix links, no private data/network activity, legal licence compliance, cancellation/timeouts and real iPhone resource tests. See [#75](https://github.com/gnamma-research/booksite/issues/75), [Arabic gate #44](https://github.com/gnamma-research/booksite/issues/44), [coordination #50](https://github.com/gnamma-research/booksite/issues/50).

**Current status:** These gates are **not complete**. The real browser engine's small and complete English performance is encouraging, but claiming publication-quality Arabic HTML→PDF today would be misleading.
