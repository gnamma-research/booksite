# Stage 04 Production Audit — al-Mahāʾimī

**Scope:** new printed pp.89–138 = 50 consecutive pages; preserved pp.11–88; cumulative 128/272 nominal printed pages (47.06%).

**Positive checks**

- All 50 page IDs `MSH-P089` through `MSH-P138` present once in the new and cumulative Markdown and structured data.
- All 77 previous structured sections retained byte-for-byte as JSON objects and all previous cumulative Markdown preserved as an unchanged prefix.
- Structured corpus contains 127 sections and 426 aligned bilingual units; 169 units newly added this stage.
- New pages have full page-source Arabic transcription and corresponding first-pass English rendering; 34 pages have paragraph pairs and 16 have page-level alignment awaiting finer subdivision.
- Self-contained HTML reader's embedded JSON parses with all 127 sections; inline JavaScript passed `node --check`.
- Modern editor's footnotes are excluded from authorial text; selected problematic readings are documented in the apparatus.
- Bibliography, glossary and proposition register updated; no manuscript variants invented.

**Unresolved issues / not certified**

1. 2008 printed images and Āshtiyānī 2000/01 edition not independently compared; “source-transcribed” means online working text only.
2. Several online Arabic readings may be erroneous or improperly punctuated; see `Textual_Apparatus.md`.
3. Sixteen pages lack confident paragraph-level alignment, although their whole text is included.
4. The apparent 20/21/22-numbered-text discrepancy remains unresolved.
5. Independent original quotations, scriptural reference checks, and specialist verification pending.
6. GitHub deployment status recorded separately after remote update; local build checks do not prove publication.

**Next consecutive page:** 139. **Next planned 50-page interval:** 139–188.

## Local file hashes

| File | Bytes | SHA-256 |
|---|---:|---|
| `Corpus_Inventory_and_Concordance.md` | 18,036 | `c33d529935daf1ab2fcf69339997bb342cb738772fb20d1727c8e7b3328d56cc` |
| `GNAMMA_Mashra_Parallel.json` | 867,349 | `a1ecd5e828107236f84ff5755c90974d3d8d2d0ee4694afe25009276497ef4b7` |
| `GNAMMA_Mashra_Reader.html` | 840,061 | `939534bfbcef0cc8e7356bd8d3765939a80228a19229923d162f4ffe2ed0f58b` |
| `Mashra_Cumulative_Bilingual.md` | 852,116 | `ff585f274031521dd306834d2a3b38ce669de2cbc07f69f2b1ac8fd7a91ff1ab` |
| `Mashra_Handoff.md` | 6,550 | `90bf877142aa821d008abd9e58e27b9a84de03e0444c24118eed4bcf2fa9ecf7` |
| `Mashra_New_Bilingual_pp89-138.md` | 325,453 | `5a74ce68c179a296fa89a9aee26386fc36f18ea108326823ae2e1d809796007b` |
| `Register_of_Metaphysical_Perspectives.md` | 116,662 | `acdfef3a3177392c5ed2196225493f2e1dc7192c9885ec2bb3be77d49762bfb8` |
| `Stage04_Comparative_Findings.md` | 8,780 | `42931184e9c8d1b2fcfdb15b9b64b2176b8c9f89927e6bd39bbe8c0feea96cd4` |
| `Stage04_New_Register.json` | 36,394 | `2be12e6dc901f8547d1778eea8ac94e398d05aaa51625586d1408194a466c303` |
| `Stage04_Translated_Page_Manifest.json` | 8,576 | `9d34f0b2e6933e1c183dd1c79a3c45c2fd04b6614a4fc0cc85d23f5af6e9a0f6` |
| `Technical_Glossary.md` | 32,076 | `168becb6e9894582cc94a64b96fb846eb40edbb65e1ae36b8ca50c5ac33f6b3e` |
| `Textual_Apparatus.md` | 36,570 | `6ecc807aeb5e1403e11f68a8ed4fac9b6909e1aab5002940e38daa169ced2cb6` |
