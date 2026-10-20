# Daruri Arabic reader fonts

These six self-hosted WOFF2 files cover regular (400) and bold (700) in Amiri, Scheherazade New, and Noto Naskh Arabic. Include `fonts/font-faces.css` from the reader, or copy its `@font-face` rules with paths adjusted to the stylesheet location.

All fonts are distributed under the SIL Open Font License 1.1. The original copyright notices and full licence texts are included in the three `OFL-*.txt` files. Keep these files with any downloadable bundle.

## Preparation

The source files came from the official Google Fonts repository. `SOURCES.json` records source URLs, checksums, versions, output sizes, and verification results.

- Amiri and Scheherazade New: the complete official regular and bold TrueType files were compressed to WOFF2, without subsetting or editing their glyphs, names, or shaping data.
- Noto Naskh Arabic: the official variable TrueType file was instantiated at weight 400 and 700 with fontTools, then compressed to WOFF2. These static instances are distributed under the same OFL.

The complete glyph inventory was retained in every font. Verification confirms the intended weights, unchanged character maps and shaping tables across compression, Arabic mark-to-base and mark-to-mark positioning features, and coverage of every Arabic code point present in the reader at preparation time. This verifies font structure and character coverage; final page layout and rendering should also be reviewed in a browser.

## Official sources

- Amiri: https://github.com/google/fonts/tree/main/ofl/amiri
- Scheherazade New: https://github.com/google/fonts/tree/main/ofl/scheherazadenew
- Noto Naskh Arabic: https://github.com/google/fonts/tree/main/ofl/notonaskharabic

All six files are complete fonts rather than script subsets, so no remote font request is needed for Arabic letters, marks, numerals, or the other characters included by each source font.
