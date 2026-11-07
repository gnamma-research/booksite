# Tahdhīb–Darūrī reader parity audit (3 November 2026)

Compared source code: Darūrī website under daruri/ and both Tahdhīb editions under texts/al-taftazani. This is an implementation audit, not a claim of identical scholarly contents, full vocalization, or independently certified manuscript readings.

| Feature | Tahdhīb implementation | Parity assessment |
|---|---|---|
| Reading modes | Study (aligned source cards), Flow (connected paragraphs), Immersive (minimal chrome, flowing text) | Core parity |
| Continuous reading | Default Flow across all pages without clause boxes; paired editorial page-break ellipses suppressed in Flow only | Core parity |
| Parallel / Arabic / English | Independent language switches preserved across all three modes; mobile responsive | Core parity |
| Arabic vowels | Original / assisted partial / complete-units *unreviewed machine* overlay | Three working choices; not a grammatically verified scholarly tashkīl |
| Vowels coverage | 10 fully vocalized kalām clauses; 194 lexically assisted kalām clauses; 840 unchanged; logic 12 lexically assisted, 7 unchanged | Independent grammatical review still required |
| Font choices | Amiri, Scheherazade, Noto Arabic; literary serif, readable sans, Lexend English | Core parity |
| Font scale and themes | A+/A−, light/dark/sepia | Core parity; Darūrī has additional photographic themes |
| Headings | Original text headings separate from editorial logic divisions; source pages discreetly located | Partial provenance audit |
| Navigation | Persistent dock, stable source links, browser-local Back/Forward/Recent reading trail | Core functionality added; Darūrī has a richer origin-bridge design |
| Search | Arabic/English diacritic-insensitive literal search | Basic; Darūrī has advanced morphology/proximity |
| Bookmarks | Local source clause IDs retained | Core parity |
| Highlights | Private whole-clause highlights and JSON backup | Partial; no persistent word-range highlights |
| Personal notes | Browser-local per-clause notes, import/export JSON | Basic; Darūrī has a richer Reading Desk and bin |
| Citation | Copy exact unit/page and book | Core parity |
| Critical apparatus | Study retains source notes, printed-text variants, uncertainty flags | Core source-specific function |
| Terminology | 33-entry source-linked, clearly editorial Terms desk | Partial; not Darūrī's source-critical dictionary |
| Subject index | No full independent subject index | Missing |
| Qurʾān / hadith context | Not ported | Requires different source warrants, not direct transfer |
| PDFs | Six canonical source-qualified PDFs plus two separately hash-verified **UNREVIEWED machine-vowelled Arabic** PDFs | Eight published PDFs; Darūrī personal-annotation PDF compositor still not replicated |
| Privacy | Notes and highlights never sent to repository by the interface | Basic parity |
| Browser regression | New desktop/mobile experience tests plus original Study-source tests | Check final workflow result before certification |

## Textual and formal evidence boundary

Kalām: 1,044 Arabic–English units across Cairo 1912 printed pp. 15–127; 112/113 one-print page reviews; KAL-077.03 remains graphically uncertain. The 995 AH al-Azhar and Princeton manuscripts have NOT supplied exact folio/line variants certified for this crux.

Logic: 19 editorial units corresponding to Cairo pp. 3–14, with ten comparisons against another printed matn. The 46 special fourth-figure modal combinations have source-derived conclusion-type labels; not all historical modal necessity claims have been independently proved. The source-independent formal arguments in Stage 101 establish the three exceptional moods' temporal consequences for arbitrary domains under explicitly stated assumptions. Stage 100 established four non-vacuity gaps under one finite two-world semantics. Neither result warrants manuscript-critical definitive status.

Vocalization: This release offers a clearly labelled learner-oriented partial vocalization layer and unchanged primary Arabic. The original 1912 printed text must never be overwritten with guessed vowels. The two additional PDF reading aids preserve source consonants and openly flag automatic grammar/case-ending errors. A fully vowelled scholarly edition requires a grammatical second pass of the remaining 1,053 units (including logic) and independent textual collation.

## Integrity and release gates

The source Arabic, English and permanent clause IDs are in the canonical data.js files; Flow only changes presentation. All 1,063 units were checked in the initial vowelled-layer audit and ZERO consonantal changes occurred. Source-heading cards and original notes remain available in Study even when presentation collapses the 18 paired ellipsis continuations. Automated Playwright source-integrity and new immersive/mobile regression checks are in the Tahdhīb reader GitHub Actions workflow. Only report success after a final completed run against the intended commit; queued runs are not evidence of success.

## Still missing relative to Darūrī

Full historical dictionary; source-linked subject index; advanced Arabic morphological search; exact scholarly PDF anchor maps and private appendix compositor; word-range persistent highlights; *grammatically verified* full vowelled Tahdhīb; independent manuscript-critical definitive edition and all-world modal semantics certification. Those are separate scholarly/software tasks rather than existing features with different names.

Bottom line: the core text-reading experience is deliberately book-like and substantially aligned; specialized scholarly apparatus, complete tashkīl and critical certification remain explicitly partial.


## November 3 update: machine-vowelled editions and history

The separately generated machine-vowel overlay has a manifest verifying preservation of the complete printed source letters and source SHA-256 for every one of **1,063** source units. Both Arabic candidate PDFs were built and published with PDF hashes (**kalām: 59 pages; logic: 8 pages**). These are not publisher-critical vocalized editions; errors are conspicuous in the logic proem and must be corrected before a verified release. Source links and a user-visible PDF link are gated on exact data.js/overlay hashes. The reader now also has Back/Forward/Recent controls in local browser storage. Final browser QA on the current commit must still be consulted before claiming every device mode passed.

## Stage 102 — common Darūrī-style book shell (3 November 2026)

### Architecture

Both Tahdhīb books now import the **same** shared navigation module (texts/shared/tahdhib-daruri-shell.js), stylesheet (texts/shared/tahdhib-daruri-shell.css), and the **actual Darūrī bookmark-icon library** (daruri/bookmark-ui.js). The original source texts, stable IDs, apparatus, PDF files and hash manifests are unchanged. Both default top-level Tahdhīb URLs lead to the fuller /edition/ reader, while older user deep links and the ?legacy=1 option remain accessible.

### One menu and reading-mode contract for both books

| Control | Behaviour in BOTH books | Status |
|---|---|---|
| Contents, Search | Current-book page/division navigator and bilingual search | Active; advanced morphology/proximity missing |
| Read | One continuous, unboxed Flow across all source pages/divisions | Shared; no forced page-only scope |
| Study | Aligned Arabic–English clause cards, source notes and textual variants | Shared; defaults to one page/division |
| Immersive | Same complete continuous text, with nonreading furniture suppressed | Shared; continuous rather than paginated |
| Language | Arabic-only, English-only, and Arabic/English parallel | Shared controls |
| Vowels | Original, partially assisted, automatic **UNREVIEWED** candidate | Shared; not a proofread vocalized text |
| Visuals | Quiet/book/structured page styles, Arabic/English fonts, text size, appearance, column order, source-page locators | Shared; Darūrī photographic palettes absent |
| Saved | Browser-local bookmarks, highlights, personal notes, and reading history | Shared; Darūrī cross-book bin/transfer not ported |
| Bookmark icons | Original Darūrī ribbon/check SVG in Study cards, Contents, Flow actions and Saved control | Actual shared component |
| Notes | Per-clause notes, critical apparatus, private JSON import/export | Shared |
| Editions | Source-hash-gated PDFs and structured exports | Original files retained |
| Help | Common explanations and work-specific editorial links | Shared |
| Bottom dock | Persistent current location, previous/next, shared line-icon grammar | Shared; richer cross-view bridge absent |

### Regression and scholarly release gates

1. On both default book routes, verify that one uninterrupted scroll reaches the final clause without a Next button, in Flow and Immersive. Returning to Study may use page-sized cards. Source headings remain distinguished from editorial headings; no editorial continuation ellipses should become authorial punctuation.
2. Check iPhone Safari portrait/landscape, desktop keyboard navigation, modal dismissal, language/vowel toggles and column order, font/appearance persistence, highlights and notes, Saved and Back/Forward/Recent, and print/PDF options. A static syntax check is not a full browser test.
3. Respect PDF manifest SHA-256 integrity checks: canonical PDFs remain the same until new source-based certified editions exist; machine-vowelled PDFs remain separately marked unreviewed.
4. Finish independent photographic witness collation before any definitive critical edition claim. Kalām remains 1,044 bilingual clauses, 112/113 pages checked against Cairo 1912, with **KAL-077.03 on original p.77 unresolved**; the 995 AH al-Azhar folio concordance is not yet secure. Logic remains 19 bilingual divisions with ten other-printed-text comparisons and unresolved historical modal proof/collation questions. No UI work upgrades the authority of either underlying text.
5. Still outstanding from Darūrī: full source-critical dictionary, advanced Arabic morphology/proximity search, cross-book Reading Desk and bin, exact PDF locator map, full grammatical proof of the vowelled Arabic, photographic themes, and specialist source indexes.

**Verification status:** repository source and JavaScript syntax can be audited here; production deployment, browser execution, and mobile QA should not be represented as passed without an observed test run.
