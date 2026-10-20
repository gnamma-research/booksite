# Daruri English typeface choices

The original native font stack remains the default. Its menu label should be `Original · Iowan / Palatino`, and its CSS stack must stay exactly:

```css
'Iowan Old Style','Palatino Linotype','Book Antiqua',Georgia,serif
```

No proprietary font files are included. The two optional open alternatives are Source Serif 4 and Literata.

## Integration

Load `fonts/english-font-faces.css` from the reader. It defines four complete variable WOFF2 fonts: normal and italic for each family. Each file includes the weight range 200–900, so normal/italic and regular/bold are all supported by the same four files. CSS family names are exactly `Source Serif 4` and `Literata`.

Append the original native stack after the chosen alternative. Set `font-optical-sizing: auto` on the reading text; the fonts can then adapt to text size while preserving reader-controlled weight. Avoid hard-coding `font-variation-settings` unless an explicit optical-size override is intended.

Source Serif 4 has `wght` 200–900 and `opsz` 8–60 (default 20). Literata has `wght` 200–900 and `opsz` 7–72 (default 12). These ranges were read from the actual font files. The `@font-face` rules use `font-display: swap` and same-directory URLs.

## Coverage and preparation

The full official Google Fonts source files were compressed to WOFF2 without subsetting, axis pinning, or changes to glyphs, names, shaping, or variation data. Source Serif 4 is version 4.004; Literata is version 3.103. Original font sources, checksums, output checksums, versions, axes, and validation results are recorded in `ENGLISH-SOURCES.json`.

All four fonts contain the reader’s visible Latin letters, modifier letters, ordinary punctuation, and transliteration letters, including ā ī ū ḥ ṣ ṭ ḍ ẓ and their capitals. The ʿ and ʾ characters and the relevant decomposed combining marks were also checked. The mathematical editorial brackets ⟨ ⟩ and colophon symbol ※ are not in these fonts and use the native/browser fallback; other missing UI symbols are listed in the JSON record. JavaScript regex range endpoints were excluded from the visible-text coverage check.

Font structure and coverage were verified with fontTools; final visual spacing, italic appearance, and rendering should be reviewed in the integrated reader. Literata’s italic is intentionally relatively upright, rather than a conventional heavily slanted italic.

## Licensing

Both families use the SIL Open Font License 1.1. Their original copyright notices and complete licences are in `OFL-Source-Serif-4.txt` and `OFL-Literata.txt`. Keep those files with the fonts in offline bundles.

## Official design and source references

- Source Serif 4 specimen and design description: https://adobe-fonts.github.io/source-serif/
- Adobe on Source Serif optical sizes: https://blog.adobe.com/en/publish/2021/03/04/source-serif-gets-optical-sizes
- Source Serif 4 source distribution: https://github.com/google/fonts/tree/main/ofl/sourceserif4
- Literata project and design description: https://github.com/googlefonts/literata
- TypeTogether’s Literata page: https://www.type-together.com/literata-font
- Literata source distribution: https://github.com/google/fonts/tree/main/ofl/literata

Source Serif 4 was designed for extended text across sizes, weights, and languages, with optical sizes adapted to their intended use. Literata was conceived for continuous digital reading and originated with Google Play Books. These are documented design intentions; they are not evidence that one family is universally faster or more comfortable for every reader.
