# Darūrī word-position verification, 22 October 2026

## Verified result

A read-only GitHub Actions audit successfully checked all **120 apparatus PDFs** from release `20261022-complete-a4-apparatus-matrix`:

- 12 independently published A4 base editions.
- 90 Reading apparatus variants and 30 Study apparatus variants.
- **10,200 original source pages** compared with their merged descendants.
- **9,634,785 extracted PDF word instances**, with Unicode content, sequence, and all four word-rectangle coordinates hashed.
- **Zero** moved word rectangles, mismatched extracted words or pages with invalid word geometry.
- CI run: https://github.com/gnamma-research/booksite/actions/runs/39701181790

This confirms exact preservation of word-level **PDF extraction geometry** by apparatus assembly. It does not establish exact correspondence to any specific authorial source token, uniqueness of matched quotations, or correctness of RTL glyph grouping. Do not label the 120 apparatus word maps as complete or claim precise highlights until those additional checks pass.

## Required second-stage verification

1. Reconstruct each of the 12 A4 base edition layouts from the authoritative source. Add neutral token identifiers without changing typography.
2. Reject a layout when its page count, segment anchors, text geometry or rendered glyph layout differs from the published PDF. Check Arabic-vowelled, Arabic-unvowelled and bilingual RTL geometries separately.
3. Produce SHA-256-bound per-segment word rectangles for qualifying source tokens, with explicit coverage, nonmatching segments and language flags.
4. Exercise saved English and Arabic quotations, including repeated phrases, context prefixes/suffixes, diacritics and cross-page cases. A fuzzy or ambiguous match must not become a clickable exact-word highlight.
5. Reuse the base map for the 120 derived apparatus PDFs only because the present audit established their source pages' word-coordinate invariance. Bind the map to each PDF's `source_base` checksum and independently check the final PDF checksum.
6. Verify clickable personal P-note links and return links in iOS PDFKit, Android PDFium and desktop readers. Provide section-level fallback for any unsupported case.

## Editions product implication

The Reading and Study tabs can be merged into a **Reading & Study** tab with a clean text preset, a Study preset (only where a matching Study base is prebuilt) and a Custom profile. The Reference tab uses the full canonical scholarly PDF and adds optional personal notes/bookmarks locally. Include **all** personal-PDF export options in each tab; no additional 'Make personal copy' page is needed.

A separate source-to-word precision audit is still required; this geometry audit is not that certification.
