# Darūrī bilingual Scholarly / Reference PDF — complete-browser research candidate

**Status (24 October 2026):** Full canonical Scholarly PDF generation and available automated structural/content checks **PASS in Chromium and WebKit** on exact GitHub commit `64e063feaf76b5861b594d76dd8d273bf5cacccf`. **NOT PUBLICATION-APPROVED:** actual iOS Safari/iOS PDFKit, Android PDF viewers, Adobe Acrobat, PDF/UA/accessibility, full Arabic copy/text semantics and final human editorial proof were not completed. Published Stage 1 PDFs and master remain untouched.

## Authoritative source and method

- Repository: `gnamma-research/booksite`; research branch `research/daruri-typst-scholarship-layout-20261024`, draft [PR #170](https://github.com/gnamma-research/booksite/pull/170).
- Source JS SHA-256: `e233057d26772249b17b456d9c8aeaf8fd7d5c293c9875c32569d29bb3d9e22e`; generated original Scholarly HTML SHA-256: `e1be6f066965e7421f1d88a16480b7a9b2efac7eb34750f0b1918bcb17cd95c4`; source HTML 2,058,826 bytes.
- Original scholarly input: 258 numbered authorial sections; 414 canonical paired passages / 416 bilingual display rows per language; **625 scholarly note objects, 153 term dossiers, 157 complete selected historical dictionary articles, 283 bilingual historical article paragraph rows**; original internal/external scholarly references.
- **Entirely browser-local** Typst WASM 1.0 worker generation from original HTML: PDF download as browser Blob, no source PDF inputs, remote PDF renderer, print-dialog export or upload of personal notes.
- Reproducible [Actions run #40136145221](https://github.com/gnamma-research/booksite/actions/runs/40136145221), **Chromium and WebKit both completed successfully**, including `ultimate_pdf_qa.py` and the independent `verify_scholarly_candidate.py` strict acceptance checks. Chromium and WebKit outputs were **byte-identical** at the pinned source and output hashes.

## Actual final browser PDF — both engines

| Property | Verified result |
| --- | ---: |
| A4 physical pages | **237** |
| Full PDF bytes, browser-generated Blob | **12,181,016 B** |
| Actual browser PDF SHA-256 | `836a1ed31575d08a740fef535be1715b3a48b70bc01198d2ad6888d2c1d1e020` |
| Total PDF outline entries | **941** |
| Numbered, descriptive original section bookmarks | **258/258**, valid page and coordinate, in order |
| Original editorial contents hyperlinks to correct numbered bookmark locations | **258/258** |
| Internal GoTo PDF link objects | **3,953**, zero invalid page indices |
| External PDF link objects | **286** |
| Distinct original external source URLs preserved | **99/99** |
| Non-A4 pages / native MuPDF text-reader process crashes | **0 / 0** |
| `qpdf --check`, Poppler text extraction, native structural QA | **PASS** |
| Original English authorial source passage content probe | **416/416** |
| Original scholarly-note eligible Latin prose probes | **591/591**, 625 original note objects; 34 excluded for fewer than 25 Latin chars |
| Historical dictionary English prose probes | **282/282** eligible, 283 original paragraphs |
| Complete English glossary definitions, normalized full-text | **153/153** |
| Original Arabic native search with tashkīl | **Not a release condition, per user direction** |

The output has one styled bilingual cover, the original editorial contents/guide without a redundant 20+-page generated Typst contents list, A4 page numbers, the full English-left/Arabic-right authorial text, complete section-local scholarly apparatus and selected historic dictionaries. The 258 descriptive PDF-only section headings do not create extra printed authorial headings. Actual page rendering was visually inspected across title, contents, main bilingual passages, reference/back matter and ending.

**Strong vs weak fidelity assertions:** 625 notes and 157 dictionary articles are definitively present in the validated source and browser converter; the PDF was subjected to independent normalized Latin opening/end probes, not an exact full bilingual/Arabic note-by-note character collation. A single mixed-bidi scholarly note received an independently checked English snippet exception; the original HTML note was never removed.

## Compressed deliverable (post-browser QA; not yet built into the browser exporter)

A **native PyMuPDF object/stream compression pass**, applied **after** the ordinary browser generated its full canonical PDF, produced a **5,853,089-byte** research PDF:

`6af9ebefb3d3e7dfe8e0d4ed87631959655c3e7adac3e2376fff1a6b7436af93` (SHA-256).

Compression preserves **237 pages, 941 bookmarks, 4,239 annotations**, and six representative pages (including cover, authorial/source, middle and final pages) were pixel-identical at the inspected rasterization scale. This is a **separate desktop compression proof**, **not** a claim that mobile browsers already generate a compressed 5.85 MB Blob without postprocessing. The verified browser-only uncompressed PDF size remains 12.18 MB.

## Known open publication gates

1. Physical current iPhone/iPad Safari + PDFKit, Android devices/viewers, and Acrobat: generation, memory, real tap navigation, offline and long document reliability. Linux Playwright WebKit is not an actual iPhone.
2. Memory/caching: on Linux CI aggregate Chromium RSS ~1.15 GB (naive sum, shared mappings double counted), so **do not advertise mobile viability** without PSS/device measurement and graceful low-memory fallback; self-host compiled Typst-WASM first-load bandwidth still needs production CDN/offline verification.
3. Native PDF `/Names` dictionary currently has zero original `section-N` names: direct PDF GoTo annotations and sidebar bookmarks **work** and passed QA, but compatibility with external legacy named-section links remains unproven.
4. Human editorial quality: full Arabic orthographic/diacritic presentation, bibliography/dictionary source accuracy, exact Arabic+English paired text and note-by-note collation, typographic proof, orphan/widow and accessibility/PDF/UA/reading order. No exact Arabic tashkīl-sensitive native PDF Find is required.
5. Study edition repeated Qurʾānic page-bottom footnote placement is an **independent** project gate, not a missing note in this scholarly section-local apparatus.
6. Public hosting integration: final device-aware download UX, offline/privacy, browser-side PDF compression if desired, and explicit sign-off before any promotion.

## Safe disposition

**Research candidate COMPLETE for automated end-to-end full Scholarly generation and strict structural QA; public release NO-GO until the remaining independent hardware/editorial gates are completed.** Preserve the signed Stage 1 `12 source + 15 packet → 120 choices` architecture and five canonical published PDFs; do not deploy this branch to `master` or replace existing PDFs by inference from CI green.

Reproduction code: `daruri/qa/stage2_shootout/ultimate_html_to_typst.mjs`, `ultimate_typst_browser.mjs`, `ultimate_pdf_qa.py`, `verify_scholarly_candidate.py`, and `.github/workflows/daruri-stage2-ultimate-typst-browser.yml` on the pinned research branch.
