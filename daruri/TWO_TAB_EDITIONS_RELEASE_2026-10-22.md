# Darūrī Editions — two-tab interface, personal PDF export, verified word destinations
Release candidate: 22 October 2026

## User-facing model

Two top-level tabs: **Reading & Study** and **Reference**.

Reading & Study includes independent EN/AR language choices and Arabic vowel marks,
followed by three profiles:
- **Reading** — clean A4 text, no publisher notes, with original source headings;
- **Study** — bilingual vowelled source, selected publisher notes and a basic index;
- **Custom** — expose publisher notes, recorded/editorial headings, glossary,
  extended index, Bidāya applications, and R/BA concordance.

Only exact combinations present in the approved static PDF manifest can be opened.
Study notes cannot be selected in English-only, Arabic-only, or unvowelled PDFs
unless new exact scholarly study source PDFs have been published. The canonical
Reference tab retains full source notes, historical dictionary, index,
concordance and applications.

**The personal PDF workflow is integrated inside both tabs**. There is no user-facing
external “Make personal copy” wizard: My notes, Bookmarks, choose/all entries,
linked personal references, verified quotation highlights, reliable dates and
appendix ordering are all on the Editions page. A local P-numbered appendix is
required and automatically enabled for any linked personal notes. The main
action changes from **Open PDF** to **Create my PDF** when annotations are selected.
The legacy personal-export.html remains available solely for existing bookmarks
and compatibility, using the same underlying browser-only exporter.

## Integrity and precision

- 12 existing, byte-for-byte preserved A4 Reading/Study source PDFs.
- 120 existing, byte-for-byte preserved apparatus PDFs.
- Five canonical scholarly/reading PDFs remain unchanged.
- 12 new SHA-256-bound base edition section/word maps generated directly from
  the unchanged published A4 PDFs. Each certifies all 258 section destinations.
- Additional English exact-word segments are offered **only** when a complete
  source segment has a unique native-PDF word-order and bounding-box match.
  See editions/maps/manifest.json for exact counts per base document.
- Direct PyMuPDF Arabic word extraction has demonstrably nonfaithful glyph
  decomposition/ordering for these PDFs. The builder refuses to certify
  those Arabic mappings: they continue using section-level personal-note links.
- The previous geometry audit successfully verified unchanged native word
  text and rectangles across all 120 apparatus PDFs: 10,200 source pages,
  9,634,785 word instances and no mismatches. Thus a certified exact base
  segment can safely be reused in its matching apparatus PDF, after verifying
  both the PDF SHA and base-map SHA.
- Ambiguous/repeated text, cross-page quotes, unmatched or uncertified segments
  always fall back to their certified section. Never manufacture coordinates.
- All personal data remain browser-local, never sent to a service. P-numbered
  notes use searchable appendices, standard GoTo links and no PDF comment popups.

## Regression contracts

- Two-tab/three-preset DOM plus 320/390px mobile width and real local creation of
  a P-note PDF with a verified clickable English phrase.
- Exact same PDF remains selected through Reading/Study/Reference changes;
  no automatic fallback to the canonical scholarly PDF.
- The standalone legacy personal exporter, PWA offline versioning, Reading Desk
  and unified search remain intact.
- Re-entering Editions remounts exporter listeners after its parent renderer
  reconstructs the page.
- Fail closed if word/section map, base PDF or apparatus metadata checksums differ.

## Further scholarly certification

Arabic exact-word highlighting can only be enabled after an independent
source-token-to-visible-glyph proof has passed. Do not treat preservation of
source-page geometry as certification of RTL word identity. Partial English
coverage is an explicit *safety* design, not evidence that unmatched words
were checked and found incorrect.
