# Darūrī — full Arabic browser PDF navigation repair proof (24 October 2026)

**Research-only. Do not deploy or replace signed publication PDFs.**

> **Owner priority correction, 24 October 2026:** Exact native PDF Arabic search (especially searching with tashkīl) is **NOT a current priority or release gate**. The site already supplies normalized/as-encoded Arabic search. Do not keep running multi-engine Arabic search experiments or block layout/navigation/footnote progress on that optional capability. The native-search comparisons below are historical diagnostic evidence only, retained for future reference. Evaluate separately whether readers can open, view, print and navigate the PDF normally; a MuPDF text-extraction subprocess failure is not proof of a viewer-opening failure. Current engineering priorities: direct on-device downloadable PDF Blob, readable source-faithful pages, all notes/footnote placement, section/bookmark/navigation links, resource use/mobile usability, offline delivery and cross-device viewing.

## Independent problem and exact intervention

The fully vowelled Arabic Reading edition generated from canonical Gnamma HTML using Paged.js 0.4.3 + Chromium Print-to-PDF had **47 of 258** original `section-N` named destinations, despite displaying the 258 section headings. Chromium creates named PDF targets when an ID is referenced by an internal `href`; many Arabic sections were not referenced by other live source hyperlinks.

On the isolated branch `research/daruri-arabic-pdf-destinations-proof-20261024`, `ultimate_html_fixture.py` adds an **opt-in, display:none and aria-hidden** collection of 258 empty backlinks `href="#section-N"` under `DARURI_NAV_BACKREF_TRIAL=1`. This alters **only generated research HTML**, not the canonical source JS, section text, visible headings, published PDFs, or master. The actual browser performs the pagination. CI's headless `page.pdf()` is only for native QA; it is not the public download mechanism.

Full real-Paged.js source-to-browser-to-PDF [CI #40100126329](https://github.com/gnamma-research/booksite/actions/runs/40100126329) **passed** the strict native requirement of all 258 named section destinations. Original authorial source SHA-256 stays `e233057d26772249b17b456d9c8aeaf8fd7d5c293c9875c32569d29bb3d9e22e`.

## Independent byte, page, geometry, reader comparison

The original unpatched source-derived Arabic PDF came from [CI #40050204985](https://github.com/gnamma-research/booksite/actions/runs/40050204985), artifact `12543038181`, SHA-256 `f41b4f6a2fde802338d6d47f6679c6d93fd3fe4472fc6da254eb21dc5034889a`.
The patched PDF came from [CI #40100126329](https://github.com/gnamma-research/booksite/actions/runs/40100126329), artifact `12562108959`, SHA-256 `f21171a9f662eb94e8e4739346d5ef3a7135bffcff265102f273b06c78058147`.

| Independently measured feature | Baseline | Hidden-backref proof |
| --- | ---: | ---: |
| A4 pages | 67 | **67** |
| Original named section destinations | **47/258** | **258/258** |
| All named PDF targets | 98 | 309 |
| PDF bytes | 672,088 | 681,051 (+8,963) |
| PDF link annotations | 204 | 204 |
| Actual page-bottom Arabic source note bodies | 50 | 50 |
| Original source note call markers | 54 | 54 |
| Call-to-body cross-page problems | 0 | 0 |
| Invalid native GoTo page references | 0 | 0 |
| Native PDF sidebar outline entries | 0 | 0 — still an open gate |

Independent local verification using **PyMuPDF 1.26.7, Poppler pdftotext, PDFium via pypdfium2**:

- **67/67 full pages rendered pixel-identically** before vs after at 0.85-scale grayscale (exact sample byte comparison, not perceptual similarity).
- **Full-document Poppler `pdftotext -layout` is byte-identical**, identical SHA-256 `4953171ccf401e96e18cd24e2fadab537feacc361484cc699dc97175b512c8f0`.
- **PDFium page text extraction is identical across all 67 pages**, identical SHA-256 `e9279ae99f91e9f07894594cf24a657b4021d27385d0724bfd2cc30701a198d0`. Both versions extracted 257,430 characters with no PDFium exceptions.
- All **204** original hyperlink hit rectangles, target page numbers and physical target coordinates are identical. All **48 stable baseline named targets** (47 source sections plus one other) retain their original page and coordinates.
- **50 Paged.js-generated random note-UUID named targets change string identifiers across runs**. The 50 new random note names have the same physical destinations and existing link hit boxes; this explains why a naive comparison of named-link strings incorrectly reports drift. Canonical original note IDs are a separate question; do not promise persistent UUID bookmarks from the print engine.
- Corrected HTML expands from 565,596 to 572,547 bytes to add the hidden references. This benchmark changes HTML SHA-256 by design; the canonical text JS SHA remains unchanged.

## Important uncorrected reader failure

**MuPDF / PyMuPDF 1.26.7 full text extraction crashes (SIGSEGV) on the same seven Arabic PDF pages in both versions: physical pages 8, 22, 33, 34, 37, 41, 59.** This was independently reproduced by the native PDF QA subprocess checks. The navigation repair did **not** introduce or fix it. PDFium extracted all pages without exceptions and Poppler also extracted full-document text, but neither proves dependable copy, Arabic vowel accuracy, precise word-level selection, iOS PDFKit, Android readers, or Adobe Acrobat. Treat the MuPDF text-extraction crash as a **compatibility observation pending real viewer-opening tests**; exact search-with-vowels is intentionally outside the present acceptance criteria. Do not claim this PDF is fully native-search-certified.

## Decision and next gates

**Accept as a narrow technical proof**: adding hidden source backlinks to the *browser input HTML* can make Chromium/Paged.js retain 258/258 valid original section names without affecting pages, notes, existing click destinations or visible/text output. It is not a complete distribution upgrade: PDF outlines/bookmarks are still absent, ordinary browser Print/Save is required, and repeat-note Study placement, mobile memory, physical device tests, and full Arabic source fidelity remain open. Do not merge this branch onto public `master` or replace Stage 1.

Additional gated development should separately solve: (1) actual native-PDF text extractor crashes/copy/search across PDFium, MuPDF, Poppler, PDF.js and physical readers; (2) meaningful browser-output PDF sidebar bookmark outlines without corrupting 258 named sections; (3) Study `QUR-R064-Q005` two misplaced markers; (4) ~784 MiB Scholarly desktop peak PSS and true low-memory phone trials; (5) exact 625-note scholarly content proof and detailed typography. Keep these as separate QA claims and do not infer a release from a green workflow.

## Archived native PDFium search diagnostic — informational only, deprioritized

Follow-up native PDFium/PyPDFium2 verification of **all 258** original section-openings used the exact first source word, or the first two source words, in either original vowelled or stripped-diacritic form. Each query searched the named section's actual PDF target page **and the following page**. This is native PDFium's actual `PdfTextPage.search` implementation, **not** merely a string check on extracted PDF text.

| Original authorial source query on corresponding page(s) | Paged full Scholarly (258 pages) | This branch's Paged Arabic Reading (67 pages) |
|---|---:|---:|
| First original word with diacritics | **1/258** | **1/258** |
| First original word stripped of diacritics | **12/258** | **1/258** |
| First two words with diacritics | **0/258** | **0/258** |
| First two words stripped of diacritics | **2/258** | **0/258** |

The first Scholarly original HTML has 416 Arabic source segment elements (414 canonical source paragraph units, plus editorial layout-specific segments), yet after NFKC/Arabic-letter-only normalization the first 40 consecutive Arabic letters of **0/412 eligible segments** appeared in full-PDF PDFium extracted text. MuPDF found 101/412 and Poppler 115/412 of those very permissively normalized 40-letter opening sequences. This confirms serious reader-dependent Arabic logical-text order problems on the **Paged.js** full edition, distinct from the earlier vector-outline experiment, even though visible pages render correctly.

**Interpretation:** the search outcome is not equivalent to optical/rendered Arabic source fidelity and does not test every viewer or exact physical highlight rectangle. Nonetheless **native Arabic exact word-search tests did not pass** on both real browser-generated editions. Adding hidden backlinks fixes named navigation only; it does not repair malformed Arabic glyph-to-Unicode mappings, punctuation/diacritic order or native selection geometry. Neither PDF should be advertised as fully native-searchable. MuPDF's seven existing Arabic-only pages with text extraction SIGSEGV remain a separate issue for later diagnosis; do not infer that the PDF is unreadable in ordinary viewers. Do not conflate this with link QA and do not release.
