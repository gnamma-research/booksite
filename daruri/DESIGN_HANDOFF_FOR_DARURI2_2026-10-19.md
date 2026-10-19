# Gnamma al-Ḍarūrī reader — design handoff for Darūrī 2
Date: 2026-10-19
Repository: https://github.com/gnamma-research/booksite
Canonical live reader: https://gnamma-research.github.io/booksite/daruri/
Dictionary: https://gnamma-research.github.io/booksite/daruri/dictionary.html
Branch: master

## Preservation rules
- Treat the current master version of `daruri/index.html` and `daruri/dictionary.html` as canonical for **interface, CSS, navigation, return-to-reading logic, themes, and controls**. Do not replace the website shell with HTML from a scholarly export.
- Darūrī 2 may update **source-controlled Arabic text, English translation, grammatical explanation, collation, textual variants, and note records only**. Retain all 259 section identities (258 numbered reader units + separately labelled copyist note) and existing stable concept/jump addresses.
- Keep the five reader palettes and dark/system modes unified between the reader and the full dictionary. The dictionary inherits saved reader appearance and has **no separate theme or Gnamma palette buttons**.
- The site's published `daruri/daruri.pdf` is the 170-page revised comparative bilingual PDF, accompanied by `daruri/bou-akl-2015-variant-report.pdf`. Replace these only with a newer source-verified scholarly PDF.

## Integrated reading header
- The editorial descriptive title carries a clickable **(E)** marker. If the source has an Arabic original heading, show its recorded English translation in English and parallel modes; show the original Arabic heading in Arabic and parallel modes.
- The reader has 47 attested printed Arabic headings with 47 corresponding English heading translations already stored in `editionData.sections`; do not invent a printed Arabic heading at locations lacking one.
- The large subtitle and repeated location-banner heading are visually suppressed. Keep one integrated heading, followed by tiny section, Arabic print pagination, and Gnamma PDF page references.
- **Source distinction is mandatory:** `sections[].pages` currently tracks **Jamāl al-Dīn al-ʿAlawī's 1994 Arabic edition**, not Bou Akl's 2015 pagination. Bou Akl 2015 is used for collation and specific documented emendations. Do not relabel al-ʿAlawī page numbers as Bou Akl pages until independently collated. `sections[].pdfPage` opens our Gnamma bilingual PDF.
- Arabic-only view should retain attested Arabic numbering or ordinal language *when present in the source heading*, but section keys such as §102 are our navigation units, not an authorial Arabic rubric.
- Display title and Arabic rubric with no extra literal “heading” label in the Arabic matn.

## Controls
- Language selector: Arabic / English / parallel symbol buttons.
- Tashkīl/vowel control uses **حَ / ح** (ḥarakāt), distinct from the Arabic language button.
- Single reading-apparatus modal with switches for technical vocabulary, concepts, notes, applications, the header and left contents panel. Header visibility is always recoverable using the fixed **Show header** control, which also exits Focus mode.
- Focus button remains in the compact reader toolbar. The right-hand context pane, its toolbar button, its header button and its apparatus preference have been retired entirely; the reader is a two-column desktop layout (contents + main text) and one-column mobile layout.
- Copy button uses `copyVisibleMatn(n)` to copy ALL section matn text in the selected language(s), including headings and precise Arabic source and Gnamma PDF page metadata. It does not copy apparatus footnotes.
- The separate Share button opens a genuine share-composition dialog, offering editorial title, original rubric (with English translation), first passage, highlighted selection (when any), full visible section, or link only. It generates a section permalink. Where supported it opens the native share sheet; otherwise the composed message is copied, distinct from Copy Matn.

## Concepts
- The academic index is sorted with English locale collation and all 302 headings can appear on its first page; indexed subtopics/jump links remain unchanged.
- Clicking a concept from a section must resolve its canonical parent and subtopic. Regression case: §102 “Transmission > reading before the teacher” must not show zero matches because of an obsolete search filter.
- Internal “aligned passages” counters and repetitive fallback messages have been removed or hidden from the public reading UI; alignment metadata must be preserved internally for fidelity and editorial maintenance.

## Unified dictionary
- The left menu has a single **Dictionary** route rather than separate competing “glossary” and “dictionary library” items.
- The quick glossary view provides short contextual technical definitions; the full dictionary now also supports in-place switches **Meaning**, **Historical sources**, **In the text**, and **All** (same 153 terms), through `article.dataset.dictView`.
- The full dictionary on mobile has a collapsible **Browse terms** panel, responsive two-column headword cards containing Arabic headwords and number of sourced dictionary excerpts, full-size (>=16px) native source-author dropdown, and no horizontal headword scroller. Source counts are **not** term frequencies in Ibn Rushd.
- Dictionary links and return-to-reading locations must be preserved; hashes `#term=<term>` (legacy) and `#view=<view>&term=<term>` (new) are both recognized.
- In the reader, legacy `#glossary` remains available for old bookmarks; do not remove or break it even if a later implementation makes the views fully unified.

## Reader chrome revision, 19 October 2026
- Sidebar branding is the Gnamma mark with `gnamma RESEARCH`, without “Published by” or “Scholarly texts”.
- The reader's header displays the section number only once; the old duplicated location strip has been removed from the interactive DOM.
- The right contextual sidebar is retired and no link or toggle should reopen it. Scholarly notes remain in the in-text apparatus and dedicated reference views.
- The latest UI-only changes preserved the two embedded source data blocks (`editionData`, `dictionaryData`) byte-for-byte. Do not replace the 170-page published PDF or source text unless a separately verified Darūrī 2 revision is available.

## QA status and remaining limits
- Static checks passed for both inline JS programs on master (V8 compilation) and verified source structure: 259 reader records; 47 original Arabic headings with English translations; dictionary view tabs, mobile grid, and sorted index code present.
- This is NOT evidence of an end-to-end iPhone browser test. Test reader §102 (three language modes, vowel on/off, header E, copy, focus/sharing); dictionary tabs, search, native select sizing and exact back-to-reading; alphabetic index/jump; theme propagation; PDF link; and no-JavaScript fallback before definitive sign-off.
- Before applying later Darūrī 2 content, inspect current master and make content-only diffs; avoid overwriting these interface updates.
