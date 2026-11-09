# Sīrah and the Making of Islamic Civilization · Gnamma Research

Public URL: `/research/seerah/` · source edition 1.4 · 46 matns + 46 shurūḥ.

The Research landing, reader, visual atlas and dossiers are four separate presentations of one work. **The canonical content is `data/chapters.json` and `data/dossiers.json`**, based on the preserved `editorial/source-edition-1.4.md`. This is a working *research edition*, not a completed critical collation of original Sīrah manuscripts.

## Reader contract

- Two text layers only: **Matn** or **Matn + Sharḥ**.
- Figures are contextual tools, not a third commentary layer. The seven figures are generated from `assets/figures.js`, using approximate location coordinates or labelled conceptual models.
- Bookmarks, current chapter and reading preferences stay in the reader's local browser storage. No account, server, analytics or user data transfer is involved.
- All 46 chapters are statically rendered in `read.html`; reading works without JavaScript. JavaScript enables search, bookmarks, mode switching and figures.
- The source register and nine critical dossiers are separately readable in `dossiers.html`.
- Direct PDF download is intentionally not a prerequisite for accessing any text.

## Regression gate

Run `node research/seerah/tests/verify.mjs` from repository root (Node 20+). Verify on a 320px and 390px mobile viewport, and desktop, that the navigation drawer closes, every chapter has the expected sharḥ, text modes preserve the selected chapter, and the seven SVG diagrams remain readable.

The figure routes are schematic; they are not reconstructed seventh-century travel paths. Reassess chronology, locations and source links before upgrading their editorial status.

## Next scholarly work

Primary-text manuscript collation of the Medinan agreements and al-Ḥudaybiyyah, source-aligned recensions of *al-Muwaṭṭaʾ*, and close reconstruction of later spiritual/ontological claims, followed by external specialist review. See `editorial/STATUS.md`.
