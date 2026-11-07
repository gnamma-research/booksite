# Qawāʿid / Tamhīd reader — Darūrī-family feature parity audit

**Release:** 3 November 2026. **Target:** `texts/al-turka/qawaid-al-tawhid/`. **Design references:** `daruri/DARURI2_CURRENT_DESIGN_HANDOFF.md`, `daruri/EDITION_UI_OPTIONS_AUDIT_2026-10-22.md`, `texts/ibn-ajiba/al-bahr-al-madid/index.html`.

This is a **shared reading design pattern**, not an exact port of Darūrī's research data or unrelated tools. Source content remains separate and attributable. The matn is fully presented insofar as the working source transcription survives (61 QT lemmata); the sharḥ is **not** fully translated (2 verified passages at p.274 only).

## Implemented

| Capability | Qawāʿid behavior | Implementation |
|---|---|---|
| Compact Gnamma header | Contents icon on left, book identity centred on desktop, Search / Theme / Settings icons on right; smaller mobile row | `index.html`, `reader.css` |
| Two independent languages | Arabic and English may be toggled independently; at least one remains visible, both side-by-side desktop / stacked phone | `reader.js` |
| Three textual layers | **Matn** (61 original lemmata), **Together** (adds verified linked sharḥ), **Sharḥ** (only commentary translation and explicit pending slots) | `data/units.js`, `data/commentary.js` |
| Four reading states | Normal → Focus 1 → Focus 2 → Continuous → Normal, recovery button during hidden-header modes | `reader.js`, `reader.css` |
| Unboxed immersive flow | Continuous renders one flowing, full-length reading scroll with minimal separators and all 61 matn IDs, not a stack of cards | `data-focus=3` styles |
| Source and doctrinal distinction | QT and SH identifiers and precise printed-page links; old genealogical author vs descendant; later editor's colophon excluded | `COMMENTARY_TRANSLATION.md` |
| Current-location dock | Previous + numbered ID / central unit selector / next + numbered ID; in continuous mode central location remains, arrows hidden | `#reading-dock` |
| Table of contents | 61 searchable stable QT IDs, and dot on the lemma with translated sharḥ | `#sheet` |
| Cross-layer search | Searches Arabic and English matn, translated sharḥ and editorial notes | `searchResults()` |
| Visual choice | Parchment, horizon, night; optional Gnamma landscape backdrop | `#settings-button` |
| Text settings | Font scale, line height, reading width, and source-note visibility | `sheetMarkup("settings")` |
| Personal Reading Desk | Browser-local saved bookmarks; personal notes keyed by section ID; JSON export; no accounts or telemetry | `state.personal`, `state.bookmarks` |
| Source links and permalinks | Source URLs; `#QT-...` deep links; copy passage URL | `reader.js` |
| Accessible controls | Labels, button states, skip link, dialog close, keyboard arrows, reduced-motion setting, print rules | HTML/CSS/JS |

## Intentionally not represented as already available

- **Full vowelled Arabic**: the present original digital text is not an independently checked fully vowelled edition; no artificial harakāt toggle is displayed.
- **Complete grandson's commentary**: only SH-061-A and SH-061-B from the final p.274 have verified Arabic and English. The rest are pending; the missing passages must never masquerade as translated.
- **Personal PDF generation / multiple published PDFs**: Darūrī offers actual released PDFs, but this book currently has no corresponding verified edition inventory. The Qawāʿid reader does not display PDF choices that do not exist.
- **Full historical lexical popup and morphology**: Darūrī uses a much larger carefully matched dictionary. A comparable apparatus has not yet been built for this new work.
- **Offline service-worker archive**: not asserted in this release; external source pages may remain inaccessible.
- **Full iOS Safari visual acceptance**: synthetic client-state and integrity tests ran; a real-device visual pass remains open.

## Test evidence, run during creation

- Exact HTML IDs referenced in reader code: **all present** except dynamic search/note input IDs, which the dialog renders on opening.
- JavaScript compiled without syntax error; initial matn render showed Arabic QT-001 and English; mock UI test reached **Sharḥ mode** with both pilot passages, passed through Focus 3 continuous mode and restored Focus 0.
- Arabic/English toggle retained at least one language; search returned nonempty results; contents displayed QT-061.
- Source dataset **61** unique matn IDs and **2** commentary IDs; both commentary items correctly reference **QT-061** and link to online Āshtiyānī printed p.274.
- CSS brace blocks balanced. This is a static / simulated test, not actual Safari, accessibility-tree or visual screenshot verification.

## Remaining editorial / development work

1. Recover verified Arabic of the commentary's introductory pp.3–47, then progress through **أقول** lemmata in original order, each with stable SH and QT cross-references.
2. Run mobile/browser visual acceptance on the public URL; verify Arabic layout, focus recovery and dock safe areas on iPhone Safari.
3. Only when reliable lexical/diacritic and full text evidence exists, add dictionary, morphology, historical gloss overlays and fully vowelled Arabic.

_Gnamma Research · reading shell v1 / commentary stage 01 · 3 November 2026._
