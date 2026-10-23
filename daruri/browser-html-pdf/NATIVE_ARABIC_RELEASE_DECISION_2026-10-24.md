# Darūrī Stage 2 — native Arabic PDF no-go (24 October 2026)

**VERDICT: NOT RELEASE-READY.** This is an independent audit of real Chromium/WebKit browser-generated experimental PDFs, not proof that correct browser PDF is theoretically impossible. No production PDF, reader, or Stage 1 input was changed.

## Pinned evidence

- Branch: research/daruri-browser-outline-semantic-20261023. Tested SHA 7bb85a0ae8f4533bbce485b750ea332fc6018ad4; stacked draft PR #133.
- [CI run 40005108965](https://github.com/gnamma-research/booksite/actions/runs/40005108965): actual full-source PDF artifacts in Chromium/WebKit. The immediate “No ToUnicode CMap” failure was an incorrectly double-escaped QA regex, **not** absence of a CMap. Independent native QA still finds real release failures.
- Original source reader JS SHA-256: e233057d26772249b17b456d9c8aeaf8fd7d5c293c9875c32569d29bb3d9e22e. Source: 414 Arabic passages / 258 numbered sections / 2,279 test lines.
- Original Arabic font SHA-256: 6c042a068e908821b1b5f6665963db5d8a89d0b29adb1b054188f82f27ab81a4.
- Chromium PDF: 190 pages, 13,900,429 bytes, SHA-256 405aa79fe7f035a1da1a71e54021285383318f3f9b288352a7d14f29048bc140.
- WebKit PDF: 190 pages, 13,837,090 bytes, SHA-256 5b18abca12186128b50e8aef20caa8662507841a30765d27d6c9a7fa6bf34383.
- Native check engines: MuPDF 1.26.7, PDFium 149.0.7825.0, Poppler 25.06.0. No physical iOS/Android/Acrobat confirmation.

## Independent results from actual full PDFs

| Native diagnostic | Chromium | WebKit |
| --- | ---: | ---: |
| Source lines / full-line marked ActualText operators | 2,279 / 2,279 | 2,279 / 2,279 |
| Valid short ToUnicode fallback entries (maximum 60 bytes) | 2,279 | 2,279 |
| **MuPDF exact full-source-line native search** | **2,185 / 2,279** | **2,185 / 2,279** |
| **MuPDF exact source-rectangle text retrieval** | **1,831 / 2,279** | **1,831 / 2,279** |
| MuPDF exact source line in separate extraction span | 1,701 / 2,279 | 1,701 / 2,279 |
| MuPDF two-word paragraph opening search | 410 / 414 | 410 / 414 |
| **PDFium exact original full-line substring extraction** | **0 / 2,279** | Not independently rerun |
| **PDFium first-word native search on 190 pages** | **0 / 190** | Not independently rerun |
| **Poppler -raw/-layout exact original full-line extraction** | **0 / 2,279** | Not independently rerun |
| Raster source page images | 0 | 0 |
| Hyperlinks / bookmarks / named destinations | 0 / 0 / 0 | 0 / 0 / 0 |

**Native precise word geometry FAIL:** For a middle-word query from each of 413 eligible original paragraph openings, MuPDF found a hit in 411, but **390/413 returned zero-width word boxes**; only four had a weak plausible width and were not individually certified. Whole-line Unicode encoded as one CID cannot represent accurately positioned individual authorial words.

**Visible font safety:** Noto did not include U+27E8/U+27E9; there are 12 left and 12 right mathematical editorial brackets. All 24 were drawn as vector fallbacks while original Unicode was preserved. The PDF uses genuine vector glyph paths but its loose 190-page research layout lacks official formatting, bilingual columns, source notes and page-level apparatus.

## Root cause and direction-change experiment

- Overlong CMap destinations previously yielded only 133/2,279 exact MuPDF source lines. A <=60-byte CMap fallback plus full original line ActualText on the **same** source text operation improved MuPDF substantially but cannot ensure complete search, correct copy, or cross-reader/word boxes.
- MuPDF sometimes joins or reverses adjacent Arabic lines and includes source-label snippets in region copying.
- PDFium and Poppler reorder Arabic/diacritics visually. In an unchanged-pixel first-page experiment, scalar-reversing ActualText yielded six PDFium first-word hits of twelve but **zero complete lines in PDFium, MuPDF and Poppler**. Grapheme reversal also failed. Do not reverse the original text to placate one reader.
- Fontkit shaped glyph IDs and their codePoints are not reliable unique original source Unicode associations after Arabic substitutions. The credible alternative is source-derived glyph-cluster mapping, not the current one-CID-per-line method.

## Go/no-go and workstream boundary

1. **Do not publish or merge draft #133, #84 or #86.** Keep Stage 1’s already proven 12 signed A4 sources, 15 packets, 120 signed link profiles and five canonical PDFs. Native original-source Arabic PDF search remains a **separate blocker #44** even in the Stage 1 files.
2. **Do not repeat** unchanged full-line CID, hidden duplicate Unicode, reversed RTL, unchanged JS PDF emitter experiments, or the prior 120/120 pixel+link matrix.
3. Next possible true-browser approach: preserve DOM source Unicode offsets through **HarfBuzz grapheme/glyph clusters**, assign occurrence-specific CID/ToUnicode associations, and emit native text at the actual original **word boxes**. First require eleven original excerpts and the §65 inline note to pass **precise single-word and multiword search/copy** in MuPDF, PDFium, Poppler and PDF.js. Only then try all 414 passages.
4. All release gates remain open: original Arabic+English and 258 destinations, Study 176 note calls / 119 bodies, scholarly notes, 12 source/120 apparatus layout and link parity, native iOS/Android/Acrobat behavior, resource budget, and licences.
5. If native browser-only text emission cannot meet the same acceptance tests, the current reproducible HTML→WeasyPrint/Pango typesetting + browser-local signed packet assembly is the safer deployment route, while the HTML reader retains precise word interactions.

**Record, do not relaunch:** [120/120 parity evidence](https://github.com/gnamma-research/booksite/actions/runs/39774573713), [Stage 2 prior-art registry / issue #75](https://github.com/gnamma-research/booksite/issues/75), [source search release gate #44](https://github.com/gnamma-research/booksite/issues/44).
