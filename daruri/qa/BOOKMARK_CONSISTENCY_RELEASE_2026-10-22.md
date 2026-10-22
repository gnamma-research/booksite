# Darūrī — consistent bookmark and highlight UI (22 October 2026)

## Reader-facing convention

- **Bookmark** (ribbon + small plus) marks an unsaved location or reference.
- **Remove bookmark** (same ribbon + check) moves that saved reference to the recoverable Bin. Repeating the click has the same meaning across the section, paragraph, historical dictionary, subject index, applications, and footnote popups.
- **Bookmark paragraph** uses a single compact composite symbol: the same ribbon with a tightly overlapping ¶ at its lower right, rather than two separated symbols. The check replaces the plus when the paragraph is already bookmarked.
- **View in Reading Desk** is a separate, non-destructive action, available for already-bookmarked references. The bottom dock marks are status/navigation counters, never remove controls.
- **Highlight selected words** uses the highlighter icon, not the bookmark ribbon. Reading Desk tabs are **All / Bookmarks / Highlights / My notes**.
- **Reading Desk** names the complete private collection; **bookmarks**, **highlights**, and **personal notes** are record types. Saved searches are a separate, deliberately named search feature.

The same bookmark-ui.js icon definitions and bookmark-ui.css theme-neutral styling are loaded by the reader and historical dictionary. The reader's existing local-storage schema (gnamma-reading-desk-v1) and links (#bookmarks) are unchanged; no migration or loss of notes, dates, or anchors is expected. A remove action is a recoverable move to Bin, not permanent deletion.

## Scholarly reference labelling

Qurʾān and Hadith sources now show recognizable citations in Reading Desk instead of opaque internal IDs. For example, the saved source note at §167 uses “Qurʾān · al-Aʿrāf 7:26 · §167”. Where a reference cannot be resolved, its stable ID remains the fallback.

## Testing and concurrency

Browser-driven local tests covered desktop (1160 px) and mobile (390 px), section and paragraph add/remove; a visual geometry check found ¶ overlaps the bookmark outline by approximately 3 px at both widths; footnote bookmarking, viewing, removal, persistence, and source display; dictionary add/remove; and selected-text highlight classification. Script errors: none in tested flows. The automated Reading Desk regression fixture now loads the shared icon script. These are Chromium tests, not physical Safari/iOS-device certification.

This change was rebased on the Qurʾān-context commits of 22 October rather than overwriting their inline-note features. Main entry HTML is patched in-place; the new stylesheet/scripts have cache-busting version tags to avoid a stale asset mismatch.
