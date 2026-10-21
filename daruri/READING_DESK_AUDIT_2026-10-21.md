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


## Reading Desk v5 and personal PDF export v2 — 21 October 2026, follow-up

The main bilingual reader and historical dictionary use Reading Desk v5 JS/CSS with cache-busted references. The same release preserves offline v4/v3/v2 compatibility. The Reading Desk JSON export now preserves unfamiliar top-level backup metadata as well as opaque record fields. A new regression checks JSON backup round trips.

Personal-PDF export v2 resolves a previously silent archival-data truncation: it reads the complete saved collection rather than only 3,000 records and retains the full original personal note text instead of cropping at 30,000 characters. Duplicate historical IDs become distinct export-only selection keys without altering localStorage. Legacy unknown/archived saved items can be selected for the appendix. The picker displays the first 240 matches and instructs readers to refine search for the rest, avoiding an unbounded mobile DOM. If the chosen PDF pop-up annotations cannot contain all source material, personal-PDF creation requires the complete appendix and explains why rather than discarding words. The unchanged published-PDF option remains the default, with no personal material included.

Versions: personal-export.html loads personal-export.js?v=2; service worker caches v2 and previously referenced v1; downloadable bundle also fetches v2. The separate personal-PDF implementation is not replaced and the five scholarly/reading edition PDFs have not been altered.

**Verified against current GitHub source in this session:** 20 Reading Desk synthetic-DOM regression checks and 18 personal-export model/invariant tests passed. All five JSON PDF section maps were checked: each metadata SHA-256 and page count matches its manifest edition and all 259 section pages for each fall within that edition. The continuous-reader user-note safety, mobile list/detail state, source relinking, long notes, old backups, duplicate IDs, and multi-tab protection remain covered by Reading Desk tests. Automated GitHub Actions definitions were expanded to run both suites on relevant pushes.

**Unverified:** GitHub Actions remote job completion, GitHub Pages live deployment/cache freshness, actual iPhone Safari/VoiceOver interaction, and native PDF annotation rendering in Apple Files/Acrobat. The public deployed pages could not be fetched through this chat's browsing interface. Further browser/physical-device QA is needed before asserting device compatibility. The full personal appendix uses image-backed pages and is not equivalent to a selectable, text-searchable tagged PDF; native PDF comment appearance varies by viewer. The underlying JSON backup should be saved separately, particularly before major upgrades.

## Reading Desk v6 and current PDF-map repair gate — 21 October 2026

The published Reading Desk reader, historical dictionary, service worker and offline bundle now use 20261021-readingdesk6. Native Desk details and printing retain the full text of old, very long personal notes; abbreviated shared excerpts are explicitly marked. All 22 Reading Desk synthetic-DOM regressions passed after this update. Existing Qur'an/Hadith source-note UI, personal-export v2, and scholarly PDFs were not rewritten by the Desk change.

A concurrent PDF publisher revised all five PDF file identities in pdf-editions-manifest.json without publishing matching build/release PDF source-map metadata. The personal PDF exporter correctly refuses the mismatch rather than attach notes to an unverified page. Earlier 18-exporter-test success predates this PDF revision; its current PDF-identity regression fails until identities are reconciled.

Added qa/verify_pdf_export_maps.py and .github/workflows/daruri-pdf-export-map-repair.yml. The new fail-closed check compares current PDF SHA-256 and byte count with its manifest, then verifies all 259 named section destinations in each actual PDF against the existing section-page map. Only if every edition passes does repair refresh the metadata identity and link/bookmark counts. It neither rewrites PDF contents nor guesses destinations. A five-edition synthetic test confirmed stale checksum repairs succeed if maps match and fail without writes if any page destination differs.

Metadata repair remains pending verification of GitHub Actions runner execution. Do not blindly copy new manifest hashes into old page metadata or weaken personal-export identity checks. Re-run the current 18 personal-export checks after publication. Physical iPhone Safari, native PDF annotation appearance, and public Pages cache freshness remain unverified by this chat.
