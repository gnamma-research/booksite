# Darūrī — independent PDF continuation QA (22 October 2026)

## Scope and non-destructive rule
Recovered the handoff from the Gnamma Darūrī PDF Generation Strategy conversation. The current production baseline is GitHub `gnamma-research/booksite` master at `f267661024613a468a1399b9f7575533b70b6a78` (PR #41 merged). Dynamic assembly development belongs to `feature/daruri-on-demand-pdf-20261022`. Arabic Pango exact-word work belongs to open PR #38; do **not** duplicate or modify either feature branch from this QA branch. No approved publisher PDFs, reader UI, personal notes or master branch were modified in this QA exercise.

Separate **QA-only** branch: `qa/daruri-pdf-parity-20261022`. The baseline snapshot workflow is `.github/workflows/daruri-parity-baseline-20261022.yml`. GitHub Actions run [39771139359](https://github.com/gnamma-research/booksite/actions/runs/39771139359) completed successfully, retaining approved originals and the 414-segment source data as test evidence.

## Verified on actual PDF bytes
- Run [39770205348](https://github.com/gnamma-research/booksite/actions/runs/39770205348) from the parallel dynamic-assembly branch passed three representative strict page/text/geometry/bookmark tests:
  - Reading bilingual + glossary: **86/86 rendered pages**, **1,069/1,069** apparatus links equivalent to the approved PDF.
  - Reading English + full index/concordance: **68/68 rendered pages**, **1,725/1,725** apparatus links equivalent.
  - Study bilingual + all four apparatus elements, editorial titles on: **185/185 rendered pages**, **2,932/2,932** apparatus links equivalent. The corrected Unicode bookmark displays “Bidāya applications” properly.
- Independent PyMuPDF comparison of all **5,726 appendix links** matched the prebuilt PDFs (same page destinations, rectangles within 0.01 pt, destination point within 0.02 pt). Dynamic PDFs also retain native **original-base-page links** that some prebuilt apparatus PDFs had discarded. The additional base links must not be mistaken for missing apparatus parity:
  - Bilingual Reading: **5/5** links preserved identically from its 76-page original base.
  - Bilingual Study: **1,903/1,903** links preserved identically from its 143-page original base.
- This is strong evidence for the **three sampled combinations**, *not* certification of all 120 apparatus profiles, note appendices, platform PDF viewers or exact Arabic word identity.

## Blocking Arabic Unicode finding
Source: `daruri/edition-r3-20261020.js`, 258 sections and 414 recorded source segments. Test: Unicode-normalized contiguous five-word prefix from each authorial segment must survive PyMuPDF native PDF extraction, after flattening pages and whitespace (necessary but not sufficient for reliable copy/search).
- Canonical reference **Arabic 0/414**; canonical Arabic-only **0/414**; canonical vowelled Arabic-only **0/414**.
- A4 bilingual Reading Arabic **0/414**; A4 bilingual Study Arabic **0/414**.
- Canonical reference English **411/414**; A4 bilingual Reading English **414/414**.
- Original Arabic PDF text extraction contains non-faithful glyph/unicode mapping. A separately generated, visually invisible Arabic text overlay was also tested: unchanged pixels but reversed Arabic presentation forms and unsuccessful PDF phrase search. **Do not deploy it.**
- This is an **old published-source extraction problem**, not proof that the dynamic assembler introduced it. Pango PR #38 and source glyph mapping must be coordinated: a pixel-perfect box map alone does not repair native copy/search. Proper RTL source-token-to-extracted-Unicode mapping must pass both independent text and viewer tests.

## Remaining release gates (do not declare production ready)
1. Audit all **120** dynamic variants, not just the three representative PDFs: rendered pages, source geometry/text, exact TOC, 258 anchors, appendix links and base links, all SHA-bound.
2. Ensure faithful native Arabic copy/search on approved original-book PDFs, both vowelled and unvowelled, without visual alterations or false word highlights. Include Arabic diacritics, ligatures, contextual forms and repeated words.
3. Build locally with personal notes/bookmarks and P-numbered appended notes; verify correct forward and return links, personal data isolation, source footnotes and heading/navigation labels.
4. Exercise native iPhone PDFKit, Android PDFium and desktop readers on real generated binaries; earlier iOS native Arabic phrase navigation job had failed, so do not infer success from PyMuPDF.
5. Publish only after the exact dynamic output contracts and preset/state-selection behavior pass and existing static editions remain available as rollback.

No approved PDFs were edited or uploaded in this branch.
