# Reading Desk v5 — preservation, navigation and scholarly usability audit

**Date:** 21 October 2026. **Status:** Code committed to master; synthetic regression checks passed. **Not yet confirmed:** live Pages deployment, physical iOS Safari interaction and independent accessibility testing.

## Evidence and prioritisation

The user supplied an iPhone Safari screenshot showing a saved-item list card immediately above its details, with an apparently redundant `← Reading Desk` control inside the detail. The prior mobile stylesheet exposed this button at mobile widths regardless of route state. The code also retained both a list and a detail pane in inline mode, contrary to the intended standalone mobile detail experience.

A more serious loss-of-data path was reproduced before correction: old JSON contained an annotation whose source was absent from the currently loaded edition. Source validation discarded the record during loading, and a subsequent save rewrote the browser-local collection without it. The original unmodified browser data is not accessible to the website once a previous version has overwritten it; earlier user-exported backups remain the recovery option.

### Critical — corrected

- **Never silently discard saved material.** Unresolvable section, dictionary, index, edition, and unknown-future targets remain in the collection. Their quotation, note body, timestamps and unfamiliar metadata are preserved. Unresolved sources are visibly flagged, not silently redirected. An explicit relink dialog preserves the old target in a source-history entry. Reattachment to a selected quote paragraph requires the exact saved words to be present.
- **Protect unreadable storage.** Invalid JSON or unrecognised collection schema prevents all writes; the original raw data remains retrievable via the Reading Desk recovery control. Loading does not truncate collections exceeding the nominal 3,000-item addition limit.
- **Transactional storage behavior.** New-item creation, restoration, removal, permanent deletion and content revision are not represented as saved when storage writes fail. The mutable in-memory record is rolled back where an operation fails.
- **Retain chronological provenance.** Original user content is not shortened merely because it exceeds the current editor input limit. Imported/legacy date provenance remains distinguished from genuine creation and edit timestamps. Unknown envelope fields are retained.

### High — corrected

- **Mobile state correctness.** At phone widths, the list and dedicated item-detail panes are mutually exclusive. The `← Reading Desk` control appears only when a separate detail screen is active. Returning to the list preserves its scroll position.
- **Precise source navigation.** In-text controls attach the section and paragraph actually represented, including continuous reading. Shared source links may carry section, paragraph, language and a bounded selected phrase. The reader interprets those fragment fields and centers the target. Return state includes sorting, filtering, selection and any originating reading position carried through the separate dictionary page.
- **All-section highlights.** Source highlights use the item's actual section rather than rejecting saved selections outside the active section when continuous reading displays several sections.
- **Scholarly compilation.** A note attached to a long, late quotation prints its original exact words; excerpting prioritizes the saved selection rather than the opening 650 characters. Printed items belonging to one source paragraph are grouped, dates and languages remain configurable, and unavailable references are identified as archival.
- **Precise relationships.** Counts of directly linked personal notes use the full target identity. Notes to different quotes in the same paragraph are no longer falsely counted as direct annotations of each other.

### Medium — corrected

- Source-ordered saved items have paragraph separators. Note and bookmark categories, editor/history disclosure and archival warnings have restrained styling within the existing theme variables.
- The relink dialog provides keyboard focus handling and cancel/confirm actions; private marks remain optional and independent of editorial notes.

## Verification record

The deterministic, dependency-free regression suite is `daruri/qa/verify-reading-desk-redesign.js`: **19 tests passed** against the v5 script set in a synthetic DOM harness. This covers orphan retention and future metadata, corrupted storage, long notes, failed storage operations, mobile list/detail state, relinking with history, quotation printing, saved-note categorisation, continuous-section marks, and shared-link invariants.

Additional directed runtime tests passed for:
- Saving new items without dropping orphan notes.
- Relinking archival records without changing creation dates or the personal note body.
- Preserving collections larger than 3,000 entries and notes longer than 30,000 characters.
- Non-active-section annotation marks in continuous reading.
- Preserving user-selected wording in bilingual print even when the selected phrase occurs near the end of a very long paragraph.

The CI workflow is `.github/workflows/daruri-reading-desk-quality.yml` and is configured for source changes and manual dispatch. CI execution status was not independently confirmed during this chat. Manual physical-device checks are still required.

## Cache and release integration

Live HTML: `daruri/index.html` and `daruri/dictionary.html` reference `20261021-readingdesk5`. The service worker `daruri/sw.js` uses a matching cache generation and also pre-caches the previous v4/v3/v2 Reader assets for offline compatibility. `download-bundle.js` includes the current Reader JS, CSS and dictionary bridge. All work must be rebased on current master, not applied from a historical Darūrī ZIP or reader snapshot; preserve concurrent PDFs, Visuals and six-stage Study Guide updates.

## Unverified or optional later work

**High, test requirement:** Check the actual Pages-served files and a physical iPhone Safari session: open and close mobile details, test hardware browser Back versus the page's Back control, verify selecting text in Arabic and English, moving between Desk and dictionary, editing, printing, importing, and offline reload. Inspect VoiceOver and dynamic type, plus Android Chrome if available. Automated synthetic tests do not constitute a claim of real-device success.

**Medium, UX enhancement:** Native mobile browser-history integration for opening a saved detail (distinct from the functioning explicit Back button) and persisted history after app reload should be evaluated only after device tests, to avoid disrupting the existing hash-based reader navigation.

**Low, optional scholarship/product features:** Tags/collections, non-destructive note revision history, collaborative public annotations via Hypothesis, and account-based cross-device sync. These must remain separate from the private Reading Desk and are not required for the current defect corrections.

**Safety note:** Users should download a fresh JSON backup after successfully loading their existing Reading Desk. The site stores personal notes in browser-local storage; no server-side backup or automatic recovery of previously overwritten data is implied.


### Further integrity controls integrated in the same release

The note editor now uses lossless HTML escaping for the complete existing note body and dynamically preserves the length of older, oversized titles and bodies. Editing a title does not shorten an imported note whose text exceeds current new-note limits. Direct runtime verification preserved a 124,019-character note through an edit.

A concurrent narrow Reading Desk commit also added optimistic cross-tab storage comparisons. Changes detected in another tab now block overwriting writes and offer Reload saved items; the refresh path omits re-importing stale legacy section bookmarks. Its regression checks are included in the 19-test suite. The user's concurrent work on a separate Book PDF + personal notes export page was preserved rather than replaced by this audit.

### Test-environment limitations

All 16 regression checks were executed against the current connector-fetched v5 sources in a JavaScript synthetic DOM runtime. Script compilation and 13 cross-file release-reference checks also passed. A real iPhone browser session, VoiceOver, live GitHub Pages cache freshness, and a complete native print/PDF engine have not been instrumented from this chat. The associated GitHub Actions workflow is installed; successful remote runner execution has not been independently established.

### Final v5 publication reconciliation

A parallel update completed the same release safely: main reader HTML, historical dictionary HTML, offline bundle and service worker now all reference `20261021-readingdesk5` and retain prior cache compatibility. The regression harness currently passes **19 checks**, including malformed legacy IDs, broken source-history entries, previous-edition imports, and stale multi-tab write conflict handling. A nine-point cross-file reference check also passed. The substantive fixes described above remain valid; the cache suffix was advanced from v4 after final code hardening to prevent stale client assets.
