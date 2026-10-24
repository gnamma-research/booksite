# Darūrī: full HTML→browser PDF benchmark — 24 October 2026

**Status: research-only, NO-GO for replacing Stage 1 on mobile.** This report supersedes short-source-only PDFs and avoids comparing with pre-rendered 12-PDF/15-packet assembly. All publication builds below start with Gnamma's original canonical **structured text and scholarly HTML**, source SHA-256 `e233057d26772249b17b456d9c8aeaf8fd7d5c293c9875c32569d29bb3d9e22e`. No published PDF page is used as a generator input.

## Tested original contents

Canonical Scholarly HTML built using Gnamma's existing Python **HTML-only source formatting functions**, not WeasyPrint/PDF; the visitor's ordinary browser does the pagination. Complete HTML (SHA-256 `e1be6f066965e7421f1d88a16480b7a9b2efac7eb34750f0b1918bcb17cd95c4`): **2,058,826 bytes**, 258 authorial sections, 414 original Arabic/English passage pairs, 625 original scholarly notes, 153 terminology dossiers, **157 complete selected historical dictionary articles** (283 Arabic/English dictionary paragraph pairs), 3455 internal and 275 external source hyperlinks, and 660 unique referenced internal target IDs.

Separate complete Reading input HTML built: English 612,746 bytes and fully vowelled Arabic 565,596 bytes, each original source verified. Study source from separate earlier trial: 414 original pairs; **118 unique** note bodies, **176 note call instances** (122 English/54 Arabic), with a possible **119th printed copy** of a repeated Qurʾān note in approved WeasyPrint.

## Actual complete outputs, normal desktop browsers

| Mode | Paged.js + browser print PDF | Typst WASM direct browser PDF |
| --- | --- | --- |
| **Full Scholarly** | **258 A4 pages, 2,973,917 bytes, ~10.1 seconds browser pagination; 12.27s browser load→QA PDF output** | **253 A4 pages, 13,138,388 bytes; 10.613s PDF compile Chromium, 8.576s WebKit; 11.268s/9.547s full HTML→Blob respectively** |
| PDF links | **4164**, zero invalid GoTo pages | **4937**, real direct GoTo targets |
| PDF internal navigation | **660 named original hyperlink targets; 258/258 authorial sections; 0 sidebar bookmarks** | **684 sidebar bookmarks; 0 names-tree entries, but many direct GoTo links**; extra links and direct targets require independent comparison |
| English Reading | **96 pages, 1,076,590 bytes, ~3.70s pagination; 2147 links; 258 authorial section names** | Not rerun on full publication template |
| Fully vowelled Arabic Reading | **67 pages, 672,088 bytes, ~1.61s pagination, 50 printed Qurʾān source note bodies, 54 calls all on same physical page** | Not rerun on full publication template |
| Arabic section destinations | **47/258** in standalone Arabic PDF (critical shortfall due nonlinked IDs) | Unknown; not certified |
| Study complete | **129 pages, 1,486,708 bytes, ~4.50s pagination; 118 note bodies, 176 calls, 174/176 same-page, 2 instances of ONE repeated Qurʾān note crossing page** | **81 pages, 3,037,447 bytes, ~7.5–8.4s direct browser PDF; 260 bookmarks, 559 links; note typography/navigation not certified** |
| Generated from prebuilt PDF assets | **No** | **No** |
| Client-side mechanism | Paged.js paginates real HTML locally; CI-only Chrome `page.pdf()` inspects user Print→Save equivalent; web page JS cannot guarantee direct PDF Blob | Typst WASM compiles a generated source layout from the exact canonical HTML to downloadable Blob in Chromium and WebKit |
| Release verdict | **Best-performing credible full Scholarly candidate, not approved** | Working full Scholarly proof, larger runtime/output, not approved |

Direct source HTML was prepared ahead as a static asset; **no visitor-side PDF pages were pre-rendered**. Python exists only in repository source build to construct original HTML from canonical data, not as a hosted PDF service. All full PDF pagination runs entirely in the browser.

### Corrected fonts and native readability

The first Scholarly Paged run used incorrect relative font URLs and produced 254 pages, 3,410,752 bytes, and at least one MuPDF native text-extraction crash. **Do not compare from that outdated build.** Corrected all scholarly font paths to original `/daruri/build/fonts`: latest CI [#40050204985](https://github.com/gnamma-research/booksite/actions/runs/40050204985) returned **258p / 2,973,917 bytes**, all 10 original fonts 200, no MuPDF per-page text process crashes, all 660 linked target names and 258 section names, complete body in Poppler. The same original fonts / source were used in separate proportional-memory [#40050743486](https://github.com/gnamma-research/booksite/actions/runs/40050743486) with the same PDF byte count. Different CI runs may serialize different PDF metadata/SHA; same page count/size/content-contract is not byte-identity guarantee.

An independent corrected-PDF content audit using source HTML SHA `e1be6f066965e7421f1d88a16480b7a9b2efac7eb34750f0b1918bcb17cd95c4` and PDF SHA `4d74ee365e2d022e1a965890734681c981617d9456ed85dd5313981d29f8260a` verified:

- 660/660 original *referenced* internal target names resolve; zero invalid GoTo target pages, all 258 `section-N` names.
- 416/416 original English text paragraph 25-ASCII-letter snippets in Poppler extraction.
- 283/283 original historical-article English paragraph 20-letter snippets.
- 617/617 note bodies long enough for 15 ASCII-Latin letters have a matching contiguous snippet; the remaining **eight are too short** for this probe. At the stronger 50-letter threshold 590/590 eligible note bodies matched (35 too short).
- 13/13 dictionary source-note 15-letter snippets.
- These are **partial source-fidelity probes**, not full string exact-collation of all Arabic, notes or dictionary entries; a repeated prose snippet could occasionally occur elsewhere in the PDF. Do not label a short normalized snippet a verified full original note. Visually inspect nonrelease pages 10,117,215,250 and more before production.

### Actual original notes in Scholarly vs Study

Study has real **page-bottom footnotes**; Paged physically printed 118/118 note bodies, with 2/176 source calls to repeated `QUR-R064-Q005` on the wrong page. Scholarly edition instead uses **section-local apparatus**, not page-bottom footnote floats. The Scholarly paginator's `0 page-bottom footnotes / 108 quran call nodes` is thus **expected** and must NOT be cited as 108 missing scholarly notes. The 625 source apparatus note bodies are in the HTML and content sample probes show them in the PDF. Only 50 of 625 original note IDs are named PDF link destinations, because most source scholarly note IDs were never referenced by a hyperlink in the original publication HTML; new feature "link to every note" requires new links rather than pretending all 625 are already clickable.

### Proportional browser memory and bandwidth (desktop Linux CI)

True Scholarly source layout via Paged.js in normal Chromium: **10,309ms pagination; 12,271ms browser page-load→QA PDF output; 13,504ms entire benchmark runner; 258 pages; 2,973,917 final bytes; 0 nonlocal/upload/PDF network requests.** Measured **802,327 KiB (783.5 MiB) peak Chromium process *proportional set size*** across up to 6 Chromium processes (via Linux /proc/PID/smaps_rollup); naive sum RSS 1,063,692 KiB (~1039 MiB) **double counts shared memory**. V8 page JS heap at end ~20.5MB is **not** total browser peak memory. Measurements desktop CI, **not an iPhone/iPad/Android measurement**. Physical mobile full Scholarly gate remains OPEN.

Static first-visit all-assets estimate from pinned production-format files, all 10 original font assets, and original full-Scholarly HTML (corrected): **7,610,552 raw bytes, 2,859,813 gzip, 2,444,021 Brotli**. Components: Scholarly HTML 2,058,826 raw / 443,658 gzip /350,827 Brotli; *bundled production* Paged.js polyfill **921,702 raw /161,557 gzip /151,077 Brotli**, all 10 Noto font files **2,254,598 gzip**. The development Vite-transformed polyfill was **~5.2MB on the wire**, NOT a representative minimized static production bundle; don't count Vite client HMR as deployment overhead. Brotli/gzip values are analytical compression comparisons; actual GitHub Pages CDN compression and caching must be verified on the published URL. Font subsetting/caching can reduce repeat downloads.

Typst WASM binary: **22,795,811 raw / 8,382,953 gzip** for `engine.core.wasm` alone, plus math font **1,306,384 raw / 864,879 gzip** and original Arabic/English fonts and source. Browser full source output **13.14MB**; faster only modestly on the finished Scholarly workload. Real mobile runtime memory not yet tested.

### GitHub Pages hosting decision

According to official [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits): **published site ≤1 GB**, **100 GB/month soft bandwidth**, **10 builds/hour soft unless custom Actions deployment**, **10 minute deployments**. This is static asset hosting, not server compute; HTML+JS+WASM browser PDF publishing is compatible. GitHub Pages cannot execute Python/Node on visitor requests, and **will not render** the PDF. Most computation is charged to the visitor's device. A 2.86 MB *first-use* transfer corresponds to roughly 35,000 uncached first-load visits per 100 GB soft monthly bandwidth before all other traffic/caching; rough planning sensitivity only, not a hard visitor limit. Keep static bundle/versioned immutable cache and avoid runtime CDNs. Test actual `application/wasm`, CORS, compressed content and offline caches before deployment.

### Editorial/release recommendation

**Selection:** Paged.js is the more compact, practical **complete Scholarly / Reading / Study HTML publishing foundation** tested to date, with Typst WASM a meaningful second implementation for genuinely one-click client PDF Blob and built-in 684 bookmark entries. **No automatic switch**: Paged output currently has 0 PDF outline bookmarks, standalone Arabic has only 47/258 named section destinations, Study has 2 same-page repeated-note call failures, and peak desktop Chromium proportional memory around **784 MiB**, far too large to assume mobile viability. Vivliostyle complete Scholarly was only lazily/partially rendered (first 59 original segments, no actual full PDF), so its full performance/notes are untested, not a failure. No existing approved PDF is removed; Stage 1 signed 12+15→120 remains production.

**Next engineering gates:** (1) fully verify Study repeat note source call/body same page; (2) add all 258 Arabic-only destinations and meaningful PDF sidebar outlines, perhaps via in-browser PDF postprocessing with complete links; (3) optimize fonts/JS and memory, test low-memory phones with actual Safari and Android; (4) full 625 note body exact-text/cross-language and 157 full dictionary article manual QA and reader navigation; (5) test offline and save/print UX. Only then retarget public downloads and subsequently retire old signed sources with archival rollback.

## Reproducible GitHub CI / branches

- [Source HTML no-PDF preflight #40050011165](https://github.com/gnamma-research/booksite/actions/runs/40050011165), source on `research/daruri-browser-full-scholarly-benchmark-20261024`
- [Correct-font 3-edition Paged full-book and Vivliostyle trials #40050204985](https://github.com/gnamma-research/booksite/actions/runs/40050204985)
- [Complete original HTML→Typst WASM direct-PDF Chromium & WebKit #40050516906](https://github.com/gnamma-research/booksite/actions/runs/40050516906); browser PDF jobs passed, release QA red because PDF has no named names-tree despite 4937 direct links/684 outline entries
- [Paged actual proportional memory and compressed bandwidth #40050743486](https://github.com/gnamma-research/booksite/actions/runs/40050743486)
- [Study all actual 118 note bodies/176 calls, QUR-R064 repeated exception #40046569206](https://github.com/gnamma-research/booksite/actions/runs/40046569206)
- All branches and PDFs **NONRELEASE**; original site/master unaffected by this workstream.
