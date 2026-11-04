# Tahdhīb / Darūrī — source-based interface audit

**Review date:** 4 November 2026. **Scope:** published Gnamma Darūrī reader (`daruri/index.html` and its scripts), the shared Tahdhīb reader (`texts/al-taftazani/tahdhib-al-kalam/edition/`), the parallel logic edition, and the main Gnamma Books menu.

This audit describes actual code and observable feature contracts, not a claim that similarly named buttons necessarily behave identically. The two Tahdhīb books retain their separate primary texts, IDs and PDF manifests. There is deliberately no substitution of Darūrī’s legal-source data for logic or kalām material.

| Darūrī feature and intended use | Tahdhīb logic and kalām now | Remaining difference |
|---|---|---|
| Books are grouped by scholarly discipline in the global menu | **Matched:** Logic and Kalām remain separate; direct /edition/ URLs in Books menu, main catalogue, manifest and reader toolbar | Old overview pages survive for compatibility |
| Section navigation and location picker | **Functional:** dedicated Contents, Search and persistent dock in both Tahdhīb books | Darūrī’s deeper original/editorial hierarchy, origin history and navigation bridge are not cloned |
| Read from beginning to end | **Functional:** full source appears as one scroll in Flow | Darūrī has additional section/part navigation and source anchor semantics |
| Immersive reading | **Functional:** same continuous source, reduced chrome | Some hide/restore header interactions differ from Darūrī |
| Study mode and critical notes | **Functional:** original aligned passage cards and separate textual variants remain available | Default main reading remains clean; technical source cards differ |
| Reading languages | **Functional:** Arabic, English and parallel; same three choices in both Tahdhīb books | Mobile layout is scrollable rather than Darūrī’s fixed compact controls |
| Arabic vowels | **Partial:** original, partial-assisted and separately labelled unreviewed machine layer | No fully proofed vocalization; quick toggle is not grammatically verified |
| Arabic and English font families | **Matched core:** Amiri, Scheherazade, Noto; literary serif, Source Sans, Lexend | Darūrī has book-specific font-scale preservation and more granular mobile layout |
| Page styles and colours | **Matched names:** quiet/book/structured and all six Darūrī-named palettes | Darūrī photographic/background rendering is not yet identical |
| Language column order | **Functional** and browser-local persistent | Stacked mobile-language order is not equally configurable |
| Icon grammar | **Mostly matched:** source SVG paths for Contents, Read, Study, Notes, Visuals, Dictionary, Search, Help, Book library, edition download, and actual bookmark ribbon/check component | Not every contextual action uses the complete Darūrī icon set |
| Reading Desk and saved items | **Partial:** clause bookmarks, highlights, notes, Saved list, recent locations and navigation history | No Darūrī-equivalent unified per-word highlight geometry, recoverable Bin, full cross-book backup/transfer or PDF annotation compositor |
| Dictionary | **Partial:** independent source-linked glossary and subject index | Darūrī’s historical dictionary breadth, morphology, context popups and Arabic word selection are not all ported |
| Search | **Partial:** bilingual and diacritic-insensitive literal search | Darūrī proximity, morphology and indexed subject search are not equal |
| Reader apparatus/layers | **Matched interface contract:** Layers menu in both volumes; al-Yazdī appears only in logic, off by default, user enabled and persisted | **Translation incomplete:** checked selections on L.02–L.09 are available; other divisions deliberately show no faux text |
| Source attribution for commentary | **Matched principle:** separate bilingual Arabic/English layer, cited original page, no other authors’ lower-register glosses silently ascribed to Yazdī | Edition-wide lemma-by-lemma collation of the c.400-page commentary not yet done |
| Regular reading footnotes | **Cleaned:** no general list of hyperlinks to other commentators in the main logic sidebar; al-Yazdī only in optional layer | Original Study mode retains necessary textual apparatus |
| Kalām commentary navigation | **Functional:** Taqrīb al-Marām as a separate existing book from the Layers menu | A fully aligned, translated Sanandajī inline layer is a distinct research project |
| Edition PDF downloads | **Functional:** existing canonical bilingual/Arabic/English files and original SHA verification | Darūrī personal-PDF annotations and exact location mapping not ported |
| Stable citations | **Maintained:** L.01–L.19 and KAL-015.01 etc unchanged | Old legacy overview anchors not all semantically identical to new source locators |
| Source integrity | **Maintained:** this branch does not edit either `data.js` corpus or PDF manifests | Interface tests do not confer manuscript-critical status |
| Mobile touch and keyboard accessibility | **Automated browser tests** run Chromium and WebKit at 390px and 1440px | Not a substitute for physical iPhone VoiceOver, landscape and print QA |

## Translation layer provenance

Primary selected source: ʿAbd Allāh ibn al-Ḥusayn al-Yazdī, `al-Ḥāshiya ʿalā Tahdhīb al-Manṭiq`, Qum edition, searchable text at `https://ablibrary.net/book_content/b/12170/`; independent bibliographic record and digitized PDF at `https://sites.dlib.nyu.edu/viewer/books/princeton_aco000566/display?lang=en`.

**Initial verified selection:** 59 Arabic/English passages sourced from printed pp. 14–19, 22–27, 30–37 and 46–50, assigned only to L.02–L.09. Main `شرح` text has been separated from `هامش` footnotes, including other writers and quotations from `al-Taqrīb`. In some places the translation deliberately selects coherent sentences rather than every line of the printed page. The layer is therefore **a source-checked partial translation**, not a complete commentary translation, and it must never be identified otherwise.

## Source and presentation controls

- The original Tahdhīb Arabic and English remain in `edition/data.js` and the existing edition PDFs.
- New translations reside in `yazdi-layer-data.js` and render only on explicit selection.
- The source panel can be toggled in the same **Layers** menu in both readers. The logic toggle has an actual effect; the kalām menu opens the separate existing commentary book.
- No list of unrelated commentary sources or bibliographic stage logs is inserted as ordinary footnotes.
- Any further selected translations must contain exact source-page locators and distinguish al-Yazdī’s main commentary from the edition’s marginal voices.
- Future full coverage requires continuous translation and review of the remaining original commentary, with each lemma and page tracked. No timeline or current completion percentage is inferred from the number of selected passages.

## Regressions required before a public release

1. Both public readers retain the full 19 / 1,044 unit counts; all original corpus SHA hashes unchanged.
2. Toggle al-Yazdī on, off, and on again; verify persistence after reload.
3. Exactly 59 translated passages appear on logic L.02–L.09; no translated commentary cards appear on uncompleted divisions or the kalām reader.
4. In Arabic-only and English-only modes, the corresponding language controls also apply to the commentary.
5. Study/Read/Immersive, small-screen scrolling, keyboard focus and modal dismissal work with the selected layer.
6. Book links in the site catalogue, Gnamma bottom menu and reader Books sheet all point to canonical /edition/ pages.
7. No different-commentator footnote shelves appear in the principal reading experience; PDF bytes are unchanged.
