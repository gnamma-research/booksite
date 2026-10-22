# Unified scholarly search — Darūrī / Gnamma, 22 October 2026

Canonical repository: gnamma-research/booksite. New modules: daruri/gnamma-search.js and daruri/gnamma-search.css.

The goal is one scholarly search workspace behind the same magnifying glass, preserving the current reader, Reading Desk, apparatus, PDFs, themes, and user-owned browser storage.

## Implemented

- Quick Find presents up to six initial results, with All / Text / Mine shortcuts and an option to expand.
- Research Search has filters for core text, editorial and critical notes, source references, dictionaries, concepts, Bidāya, lessons, notes, highlights, and bookmarks. Sorting, CSV export, and a keyword-in-context concordance are available. Exports containing private entries require confirmation.
- Exact section and source IDs (examples: §120, N001, B10) resolve before keyword matches. Authorial text results identify numbered paragraphs and highlight the corresponding text.
- Arabic vowel and hamza normalization, Latin accent normalization, whole-word matching, constrained Arabic clitics and a curated bilingual technical-term registry. Quoted phrases match as contiguous normalized phrases. No unchecked claim of Arabic morphological root parsing is made.
- Complete counts: there is no legacy 90-result limit. Research results appear in pages of 40.
- Private Reading Desk notes and highlights are indexed **only locally** and are never uploaded. Existing saved items are not mutated by the search module.
- Published dictionary source quotations and author names in Darūrī are searchable. Dictionary opening preserves a return-to-reading location.
- Selecting Gnamma Library lazily loads a generated al-Mustaṣfā index of the 2,977 paragraphs of the complete OpenITI Arabic reading witness, 111 selected bilingual/overlapping translated excerpts, terms and documented editorial comparisons. Its English translation remains partial and its Arabic source has not been newly manuscript-collated.
- A curated concept lookup connects existing Gnamma index subtopics and some bilingual terminology; each nonliteral result carries an editorial classification. This is not AI semantic retrieval.

## Preservation and architecture

The existing Darūrī reader still owns the source text, language views, Reading Desk, note popup, section controls, printing, source citations, and the PDF selector. The enhancement is loaded with one CSS link and one JavaScript tag near the end of daruri/index.html. The old search remains available as a fallback if the enhancement fails. The service worker has a new cache generation and pre-caches these two files.

Public indexes are static and generated at build time. Private notes remain in their existing localStorage dataset. As the library expands, each newly published full work should emit a similar versioned JSON index. Other Gnamma previews are not yet represented as full searchable books.

## Verification

Run from the project root with Playwright installed:

    python3 daruri/build/build_gnamma_search_index.py
    node daruri/qa/verify-unified-search.cjs

The browser suite has its own isolated browser profile and a synthetic personal note, rather than accessing or changing a user's notes. The Actions workflow daruri-unified-search-qa.yml runs source/index parity and the automated Playwright checks.

22 October 2026 preflight: 15/15 local browser regression tests passed, including 390px phone layout, Arabic and English query forms, direct IDs, exact note opening, in-text highlighting, private note creation/search, dictionaries and cross-text retrieval.

## Known boundaries

The index includes Darūrī and the working al-Mustaṣfā reader, but not yet every Gnamma preview or externally hosted corpus. Root/lemma parsing, AI-generated similarity, account-level cross-device synchronisation and collaborative annotations such as Hypothesis would require additional scoped work and privacy controls; none of these are represented here as completed features.

## Parallel-change coordination

Before updating the public default branch, rebase on its **current** tip. Other chats frequently publish PDF apparatus variants and change the edition configuration. This release should touch only the two search assets, their QA/build scripts, the generated al-Mustaṣfā index, its single reader inclusion, and the service-worker cache list. Never overwrite colleagues' PDF or apparatus updates. After merging, check the live GitHub Pages reader and repeat browser QA against the deployed URL.
