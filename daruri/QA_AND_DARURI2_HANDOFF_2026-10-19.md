# Darūrī publication QA and Darūrī 2 content handoff — 19 October 2026

## Deployed files
- `daruri/index.html` — existing Gnamma scholarly reader and static no-JavaScript fallback. Keep its layout, themes, apparatus UI, accessible controls and navigation.
- `daruri/dictionary.html` — full historical dictionary; uses the reader's palette and theme.
- `daruri/daruri.pdf` — revised **170-page** Bou Akl 2015 comparative edition, Git blob `5884c0637e304aaa95c15179bf95432392783b57`, SHA-256 `cb150727472dd34dd5549ca7ba0af42045e5bab198b5c1a8f7f4cd1555754b67`.
- `daruri/bou-akl-2015-variant-report.pdf` — corresponding variant report, Git blob `136ff1bd1f5223f6f31f1de705973eacb2257ce5`.
- `daruri/sw.js` — cache key bumped after PDF replacement; the two PDFs are optional offline assets.

## Verified checks
1. 259 reader records (258 authorial numbered sections plus the separately marked copyist's note) remain present.
2. The **416** aligned HTML passage records remain intact. The conceptual index still contains **302** main headings.
3. All **947** concept links were checked against the canonical index and their target section references. All resolved (including `Transmission > reading before the teacher` from §102).
4. 259 no-JavaScript reading sections, their PDF anchors and printed PDF labels, and 304 static contents rows were checked against the new 170-page PDF section-to-page map; no mismatches found.
5. The embedded HTML data's 258 numbered PDF page fields were updated, with the copyist's note mapped to PDF p. 144.
6. Compact controls, focus-mode toolbar, paired original/editorial headings with clickable `(E)` key, and apparatus dialog were preserved.
7. Git blob SHA values match the original PDF byte files. This is a **source/structure check**, not a claim of end-to-end iPhone browser interaction testing.

## Important remaining editorial integration
The current interactive reader's embedded Arabic–English **text and notes have not yet been replaced wholesale** by the most recent Darūrī 2 **content-only** package. The PDF and its section page links are updated, but an HTML text/apparatus parity claim would therefore be premature.

The latest content-only package was named:
`Gnamma_Daruri_BouAkl2015_ContentOnly_WebDev3_v2_2026-10-19.zip`.
It was generated in a separate Darūrī 2 conversation but was **not available as a source ZIP** through the current conversation mount or accessible Library entries. Do not reconstruct its complete source data by guessing from PDF text extraction.

When its original ZIP becomes available:
1. Verify checksum/package contents and read its content-only merge instructions.
2. Start from the **latest master reader**; DO NOT replace the HTML/CSS/JS shell or revert the newly fixed controls, concept navigation, theme persistence, or return positions.
3. Apply the new source-controlled Arabic, English translation, annotations and source/variant apparatus **only**, preserving all 258 section anchors and 416 alignment units.
4. Review the corrected loci identified in the Darūrī 2 handoff: §§20, 21, 76, 145, 152, 201, 203 and 218.
5. Recheck editorial note counts, source attributions and API-linked term/index addresses. Keep edition types distinguished: al-ʿAlawī 1994 and Bou Akl 2015.
6. Recheck reader PDF page mapping to the 170-page edition, then bump the offline cache and repeat iOS/mobile navigation QA.

Published scholarly status: a bilingual reading edition with editorial apparatus and comparative PDF, **not** a newly established manuscript recension.
