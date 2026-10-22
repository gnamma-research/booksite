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


## Plain transliteration and search-result return (22 October update)

- Words + terms and Conceptual links accept academic diacritics, ordinary
  ASCII, doubled vowels (ijtihaad, qiyaas, ijmaa, usool, tawaatur),
  selected common spellings (sunnah, shariah), and known Arabizi numeral
  forms (3illa). This is curated terminology expansion, not unrestricted
  edit-distance matching. Exact words remains literal.
- Short prefixes like ij suggest ijtihad and ijma as clickable concepts.
- Cross-page search return lives in sessionStorage, not URL query strings.
  Returning restores query, source facet, corpus scope, sorting, search
  mode, concordance/results setting, number of loaded results and scroll.
- A small dismissible Back to search results control is available after
  opening result passages, note popups, legal applications, study guide
  results, private saved items, dictionary entries and published
  al-Mustasfa references. Dictionary's former Back to reading control
  becomes Back to search results when a search originated the visit.
- Back-to-reading behavior for ordinary (non-search) dictionary visits
  is retained. Private notes and search strings stay in this browser tab.
- Browser regressions: node daruri/qa/verify-search-return.cjs
  (16 cross-work and navigation checks, synthetic isolated browser data).


## Word proximity and further plain transliteration (22 October)

Proximity is available in Research search > Match > Proximity. Enter one
term in the main field and the second term below it. Choose a maximum
of 0, 1, 3, 5, 10, 20 or 50 intervening words, with optional word-order
restriction. Zero means adjacent. The engine never matches across
different authorial paragraphs or between the Arabic and English
translations. Other documents are matched within a single text field
(not across a joined title and note body). Results include the actual
word gap and two highlighted forms, including in the destination reader
where CSS Custom Highlights are supported.

Readable operators are accepted: ijtihad NEAR/5 taqlid (either order)
and ijtihad BEFORE/5 taqlid (required order). Entering the full operator
in the main field fills the visual controls. Curated bilingual terminology
equivalents and common attached Arabic particles are supported, but this
is not a morphological root search or AI semantic similarity search.

Plain Romanization now also accepts common alternatives for verified
technical terms, including ijtehad, ijtehaad, ijtahad, qeyas, kiyas,
al-qiyas, al qiyas, ijmaa, ejma, osool, hadees, takleed and maslahah.
An optional definite article is supported for known terminology.
Exact words remains a literal mode without automatic variant expansion.

Regex is NOT included in this release. An opt-in expert mode could use
a bounded non-backtracking engine with Unicode awareness. Arbitrary JS
regex execution risks catastrophic backtracking. It cannot substitute
for genuine Arabic lemmatization or morphological analysis.

The dedicated test suite is daruri/qa/verify-proximity.cjs and covers
word gaps, order, clitics, alternative transliterations, UI controls,
two-term highlighting, cross-book retrieval and mobile geometry.
The GitHub Actions workflow runs all three browser suites. The new
gnamma-proximity.js is versioned and cached by the service worker.
This change does not touch PDFs or the two-tab editions selector.
