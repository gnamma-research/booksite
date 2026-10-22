# Darūrī notes, bookmarks and Reading Desk — extended UX audit

**Scope:** published Gnamma Darūrī reader, 22–23 October 2026. Tests used synthetic, disposable browser-local collections, not anyone's real saved notes. The baseline was the deployed reader on GitHub Pages; changes described as fixes were separately tested on a local copy before release.

## Coverage and verified working journeys

- Reader section and paragraph bookmarks, combined ribbon + ¶ mark, independent removal and restoration
- English exact-text highlights and text-anchored personal notes; save, edit, discard, and return to the source; mobile detail/list transitions
- Qurʾān references, Hadith source notes, ordinary scholarly/editorial notes, technical glossary, subject index, Bidāya applications, historical dictionary, and individual Study Guide lessons: bookmark, inspect in Reading Desk, and return to source
- Reading Desk four tabs, full-text filtering, source filtering, sorting, note editing, linked notes, source navigation, Bin, Undo and restoration
- User-only JSON and Markdown export; repeated import without duplication, corrupt-data protection, older bookmark migration, and multi-tab conflict protection
- Reading Desk PDF export in browser-emulated desktop and mobile Chromium: valid A4 PDF, personal note text included when enabled and excluded when disabled, no JavaScript errors in the tested workflow
- Keyboard editor entry, Escape and focus restoration; 60-step Tab traversal at desktop/mobile dimensions, and modal focus trapping for editorial and Qurʾān notes
- Automated WCAG-tagged axe scans for reader, Reading Desk, glossary, index, citation panels and historical dictionary. Six light palettes plus six dark palettes tested for Reading Desk detail text.

## Confirmed P1 mobile trap — corrected in the candidate release

At 390px viewport, selecting a personal note then **More → Move to Bin** previously retained `.gn-rd-mobile-detail-open` after the selected item disappeared from its filtered collection. The page hid the list, hero, manage controls and Back action: a blank detail view remained after Undo elapsed. The same state could follow restoring the final selected Bin item.

**Fix:** in `render()`, if mobile detail is active but the selected item is no longer in `matching()`, reset both the detail-only flag and stale selection before generating DOM. The candidate test now asserts that deleting, Undo, restoring, and exiting Bin preserve data and always leave a visible list.

## P2 search latency — corrected in the candidate release

The original Reading Desk rebuilt the full list on each input event. Seeded 3000-record Chromium tests found first-key delays around **452–475ms**. A short 150ms debounce defers heavy rendering while preserving the typed value; live-region results still update after the pause or immediately on Enter. Arabic composition events are respected. In local repeated 3000-record tests, individual keystrokes measured **1–11ms**, rather than hundreds of milliseconds; startup rendering still takes roughly one second and could benefit from future virtualization.

## P2 secondary contrast — corrected within Reading Desk

Axe detected repeated light-theme low contrast in Reading Desk date, source and privacy labels, including the translucent Gnamma open-landscape scheme. Scoped `:root[data-theme="light"] .gn-rd-page` rules use the palette's existing `--ink` rather than altering palette variables. The six light and six dark Reading Desk detail variants returned **0 axe color-contrast violations** in the targeted retest. Broader site-wide muted-label violations remain outside this patch.

## P3 naming and error messages — corrected in the candidate release

- Consistent collection language: **Bookmarks / Highlights / My notes**; filter reads **Source notes**, not **Book notes**
- Source actions distinguish **Open source note**, **Open dictionary entry**, **Open index entry**, **Open legal application**, **Open lesson**, versus **Open in text** for sections/paragraphs/quotations
- Saved highlight cards use an accessible **View highlight** name rather than mislabelling them as bookmarks
- Cross-tab conflict failures explain **Reading Desk changed in another tab; reload saved items** instead of the misleading generic storage-unavailable notice

## Still worth addressing separately

1. **Touch sizes / responsive controls:** some main-reader top-bar targets are ~28×28 CSS pixels on the mobile layout. They may satisfy WCAG 2.2's 24-pixel minimum subject to spacing, but fall below a comfortable ~44-pixel touch target. Increasing them requires a coordinated toolbar layout change, not a blanket CSS override.
2. **Broader page contrast:** muted tiny labels and some note links outside Reading Desk fail automated WCAG contrast or link-distinguishability checks. These should be resolved at the relevant component/theme tokens, with light/dark review across each palette.
3. **Annotation discovery:** some scholarly notes (e.g., N001 in §1) appear in only one source-language passage; in English-only mobile reading they remain accessible through **Notes**, but not always inline. Consider an in-language cue that does not falsely suggest a citation exists in the English text.
4. **Physical device/accessibility verification:** browser-emulated Chromium checks and automated scans are not substitutes for VoiceOver/TalkBack, actual iPhone Safari scroll/keyboard, or older device performance. Playwright WebKit is covered by GitHub CI when runner dependencies are present.
5. **Large collection initial render:** the typing problem is fixed, but rendering 3000 cards remains expensive. Future list virtualization/pagination should preserve source order and accessibility.
6. **PDF deep quality:** A4 reader-owned note export worked; native PDF search and source-book edition generation have independent release gates and must not be inferred from this UI audit.

## QA boundaries

All tests use disposable localStorage. No backend accounts or real user documents were modified. Note-popup return, bookmark icon geometry, labelled actions, one-item count, undo behavior, and historic dictionary roundtrips were verified. The CSS contrast checks were automated rather than a blanket certification of WCAG conformance.

**Regression:** `daruri/qa/verify-reading-desk-recovery-search.cjs` covers mobile deletion, Bin/Undo, Arabic search with long saved collections, preserving cursor focus and storage, and keyboard note editing in desktop/mobile Chromium and runner WebKit. Its separate workflow is `daruri-reading-desk-browser.yml`.
