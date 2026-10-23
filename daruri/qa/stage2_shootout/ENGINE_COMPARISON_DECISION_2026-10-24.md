# Darūrī Stage 2 — comparative PDF compiler engineering results (24 October 2026)

**Release status: NO GO.** This is the evidence-driven result of real, isolated source-to-PDF tests, not a proposal to replace the live reader or its certified modular PDF assembler.

## Provenance and production isolation

- Canonical Darūrī source: `daruri/edition-r3-20261020.js`, SHA-256 `e233057d26772249b17b456d9c8aeaf8fd7d5c293c9875c32569d29bb3d9e22e`. Six fixed original Arabic source excerpts and all **414 original Arabic/English paragraphs** in 258 numbered reading units. No PDFs were used as document source.
- Stage 1 stable route: **12 signed A4 PDF bases + 15 reusable appendix packets + 120 SHA-bound options + five canonical PDFs**; prior strict [120/120 structural/pixel/link CI](https://github.com/gnamma-research/booksite/actions/runs/39774573713). This remains published; original Stage 1 Arabic search is a separate open issue #44.
- All experiments are research-only branches. No commits to master, publication assets or approved Stage 1 source/packet/map bytes from this shootout.

## Source-to-PDF alternatives actually executed

| Family, original-Arabic variant | Actual output | MuPDF exact original 2-word source | PDFium exact | Poppler `pdftotext -layout` | Result |
| --- | --- | ---: | ---: | ---: | --- |
| **Typst WASM, fully vowelled / Noto Naskh** | 3-page 130KB PDF | 0/6 | 0/6 | 0/6 | Native text fail |
| **Typst WASM, fully vowelled / Noto Sans Arabic** | 3-page 112KB PDF | 0/6 | 0/6 | 0/6 | Native text fail |
| **Typst WASM, fully vowelled / Amiri** | 3-page 97KB PDF | 0/6 | 0/6 | 0/6 | Native text fail |
| Typst WASM, unvowelled / Noto Naskh | 3-page 78KB PDF | 0/6 | 0/6 | 0/6 | Native text fail |
| **Typst WASM, unvowelled / Noto Sans Arabic** | 3-page 53KB PDF | **6/6** | **6/6** | **6/6** | Micro proof only |
| **Typst WASM, unvowelled / Amiri** | 3-page 74KB PDF | **6/6** | **6/6** | **6/6** | Micro proof only |
| **BusyTeX WASM XeLaTeX, fully vowelled** | Browser 30KB PDF | 0/6 | 0/6 | 0/6 | Engine runs; semantics fail |
| **BusyTeX WASM LuaLaTeX, fully vowelled** | Browser 50KB PDF | 0/6 | 0/6 | 0/6 | Engine runs; semantics fail |
| Native XeLaTeX/LuaLaTeX, fully vowelled | Local PDF with scholarly note/link trials | 0/6 | 0/6 | Not certified | Semantics fail |
| **WeasyPrint/Pango, fully vowelled** | Local PDF | 0/6 | 0/6 | Not certified | Semantics fail |
| **WeasyPrint/Pango, unvowelled / Amiri** | 2-page 156KB PDF | **6/6** | **6/6** | **6/6** | Service-side option |
| Native Chromium CDP/Print-to-PDF, fully vowelled | Local 103KB PDF | PyMuPDF extraction crashed in isolated process | Not certified | RTL incorrect | Not ordinary-browser Blob; reject |
| Vivliostyle + pages-to-pdf, custom vector/CID and similar engines | See archived prior-art ledger | Previously failed strict native Unicode / PDF syntax / copy/word geometry | failed | failed | Do not repeat identical trials |

The six original source excerpts include R001, R022, R038, R064, R065, R258, with a separate actual §65 Arabic note stress phrase and synthetic footnote for the smaller tests. The complete original Study and Scholarly apparatus was **not** typeset by these templates.

## Full 414-source-scale verification

| Full bilingual/unvowelled engine | Pages | PDF bytes | Compile | MuPDF 2-word exact | PDFium 2-word exact | Poppler layout 2-word exact |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| **Typst WASM / Amiri** | 98 | 1,370,728 | ~3.4 seconds, Node WASM | **411/414** | **413/414** | **377/414** |
| Typst WASM / Noto Sans Arabic | 95 | 1,286,459 | ~2.1 seconds, Node WASM | 372/414 | 372/414 | 347/414 |
| **WeasyPrint/Pango / Amiri** | 105 | 546,520 | ~3.9 seconds, local Python | **411/414** | **409/414** | **374/414** |

Full Typst original source includes all **414 real Arabic passages and 414 English translations**, with **415 outline entries and 428 links**. The full Amiri output is substantially better than Noto Sans for original Arabic native search; it is **not yet exact text fidelity**. Specific MuPDF misses include R053-P01 `ولكن ها` extracted `و لكن ها`, R105-P03 `ولكن على` extracted with added whitespace, R107-P02 `الكرخي` becoming `ا لكرخي`; PDFium has a bracket-in-source failure R076-P02. All are original-word identity concerns, not merely a failing numeric assertion.

A separate **letters-only, Unicode-normalized first-phrase** check (removing vowel marks, punctuation and all spacing) for the full Amiri PDF finds **414/414** MuPDF and PDFium, **391/414** Poppler-layout. It is **deliberately not an exact-search or correct-copy certification**. Noto Sans is weaker: 372/414 MuPDF and 373/414 PDFium under the same normalized check.

**Word geometry correction:** MuPDF's `search_for(word)` often returns one glyph rectangle per Arabic letter. The median *individual fragment* width of ~3pt must **not** be interpreted as the full word width. Grouping contiguous glyph rectangles on the correct first source line yields plausible bounded first-word regions on **412/414** original paragraph openings, median composite width ~18pt. The remaining exact-word cases R053-P01 and R105-P03 fail. These grouped regions need image-verified accuracy, repeated-occurrence disambiguation and native PDFium/Apple PDFKit validation before publication.

**Word/passage depth:** In an independent page-scoped, letter-normalized (not whitespace-exact) search test, the full Amiri PDF yielded MuPDF first **5 / 10 / 20 words: 410 / 399 / 369** of 414, and PDFium **414 / 414 / 414** after filtering to Arabic letters/digits. This exposes native reader differences and provides no release claim.

## Real ordinary-browser compilation (no prebuilt PDF, no server PDF)

- Typst WASM **Chromium and WebKit six-source** [CI #40037332673](https://github.com/gnamma-research/booksite/actions/runs/40037332673): both passed browser blob-download/security mechanism; Chromium ~204ms, WebKit ~373ms; source unchanged; actual vowelled native search 0/6.
- **Complete 414 bilingual source via browser WebKit** [CI #40038326942](https://github.com/gnamma-research/booksite/actions/runs/40038326942): **98 pages, 1,370,822 bytes, ~2.67 seconds**, 415 outline entries, 428 links, no CDP print/server PDF or prebuilt PDF. This establishes real full-book client-side mechanism. Chromium complete-book job is distinct: do not claim full Chromium success unless its job is independently green.
- BusyTeX WASM Chromium [CI #40037507257](https://github.com/gnamma-research/booksite/actions/runs/40037507257): actual XeLaTeX and LuaLaTeX PDF blobs, both ~2.2-2.3 seconds; each only one page/no outlines or links and 0/6 exact original vowelled search. Packages for broader scholarly templates and licences require separate validation.
- Node WASM full six-variant native source searches: [CI #40037306499](https://github.com/gnamma-research/booksite/actions/runs/40037306499). Native 414-source full build: [CI #40037646571](https://github.com/gnamma-research/booksite/actions/runs/40037646571). **Red gate is intentional** where any source search fails.

## What remains unproven — nonnegotiable publication gates

- **Fully vowelled Arabic original source** exactly searchable and copyable in MuPDF, PDFium, Poppler and PDF.js: **zero currently certified implementations**.
- Arabic *individual word* and multiword hit geometry, complete source copying, correct bidi order, repeated phrases and isolated diacritics, and real iOS Safari/PDFKit and Android PDFium.
- Approved Reading/Study/Scholarly layouts: bilingual Arabic-right/English-left, true same-page **176 Study note calls/119 printed note bodies**, scholarly dictionary/glossary/indices, **258 original section anchors**, original hyperlinks, 12 signed A4/120 profile-equivalent output.
- Device memory and cancellation, offline usage and caching, legal licences for compiler/font bundles.
- PrinceXML/DocRaptor commercial rendering, Tectonic WASM and other inaccessible/licensed engines **were not executed** in this suite; lack of execution is **not** a recorded failure. Previous Vivliostyle/Paged/native PDF emitter variants were tested in the prior-art ledger; do not re-execute unchanged tests.

## Engineering choice

**A. Release-safe today:** keep the published Stage 1 signed-PDF composer; use original HTML reader for exact Arabic word annotations. No new Stage2 PDF option should be advertised as a scholarly edition.

**B. Continue an isolated Stage 2 prototype:** Typst WASM + Amiri for a **plain unvowelled** browser-generated research PDF, with explicit label `NOT AN APPROVED EDITION` and no claim of correct word-search, vocalization or Study apparatus. Real 414-source browser generation is proven in WebKit; full production certification is not.

**C. Next high-leverage work:** diagnose the specific 3 MuPDF / 1 PDFium original-word extraction failures and the Poppler discrepancy at source-cluster/CID mapping; then test all native viewers on *correctly combined* search rectangles. Compare PDF.js separately. Only when cross-reader exact unvowelled source is sound should the scholarly layout and fully vowelled branch be built.

**D. If a server is acceptable:** WeasyPrint with Amiri can generate a full source PDF quickly (~4s) but retains exact-search failures and requires a separate service. A licensed Prince evaluation is a new controlled candidate, not a production assumption.

**DO NOT** merge experimental branches, reintroduce the 120 retired variant PDFs, call browser byte-generation a text-correct result, or declare 414/414 correct from punctuation/whitespace-stripped searches.
