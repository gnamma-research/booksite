# Darūrī — personal annotations UI consistency (22 October 2026)

## Meaning in Editions

**My notes** selects personally written entries in the browser-local Reading Desk. **Bookmarks** selects saved sections, paragraphs, lexicon and other references. **Highlights** selects saved text quotations; they are no longer silently bundled under Bookmarks. The new controls match Reading Desk's three filters.

The advanced checkbox **Add in-text P links and mark matching quotations** is **not** an item selector. It requests P-numbered navigational links and verified quotation marking in a personalized PDF. The required searchable P appendix remains distinct from fixed publisher notes and scholarly apparatus. The original PDF is unchanged and private Reading Desk material is never uploaded.

## Icon contract

- Personal note/add/edit: one shared page-with-pencil SVG from `GnammaBookmarkUI.noteIcon()`.
- Bookmark: consistent ribbon, with the combined ¶ indicator for paragraph bookmarking.
- Highlight: the existing highlight-pencil SVG.
- Publisher/editor/source notes: visually distinct from all three private-item types.

The shared glyph now appears in reader selection and passage controls, Reading Desk creation and saved cards, dictionary note actions, Editions settings and the standalone personal-export screen. Legacy Editions controls also reuse the shared glyph.

## Compatibility and QA

No saved Reading Desk record/schema conversion. Old callers lacking `prefs.highlights` continue to treat the old combined Bookmarks/Highlights choice as before; the new screens pass all three preferences separately. Updated `qa/verify-personal-export.js` and added `qa/verify-personal-annotation-icons.js` to cover classification, privacy, legacy selection and the shared icon contract.
