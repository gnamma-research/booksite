# Sīrah and the Making of Islamic Civilization · Gnamma Research

Public URL: `/research/seerah/` · source edition 1.4, prose revision 1.4.1 · 46 matns + 46 shurūḥ.

The Research landing, reader, visual atlas and dossiers are four separate presentations of one work. **The canonical content is `data/chapters.json` and `data/dossiers.json`**, based on the preserved `editorial/source-edition-1.4.md`; the current fully synchronized manuscript is `editorial/current-edition-1.4.1.md`. This is a working *research edition*, not a completed critical collation of original Sīrah manuscripts.

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

## Writing policy

Use `editorial/STYLE_RULES.md`: speak directly about agents, practices and causes, not about what the narrative "shows" or what a reader "should" understand. Revisions must keep the structured source, static reader and complete current manuscript aligned.

## Next scholarly work

Primary-text manuscript collation of the Medinan agreements and al-Ḥudaybiyyah, source-aligned recensions of *al-Muwaṭṭaʾ*, and close reconstruction of later spiritual/ontological claims, followed by external specialist review. See `editorial/STATUS.md`.

## Research extension · 11 November 2026

Chapter 01 has a source-led expanded matn and sharḥ, synchronized in the static reader, canonical JSON and complete manuscript. See [the full research dossier](tafsir-research.html) and [the 46-chapter review map](revision-map.html). Chapter 02 has since been expanded and synchronized in the canonical JSON, static reader and complete manuscript; Chapters 03–46 remain at their previous research edition pending individual revisions.

## Muhammadan axial framework · 11 November 2026

The [Muhammadan Axis of ʿUmrān](editorial/MUHAMMADAN_AXIS_OF_UMRAN_METHOD.md) is the consolidated research methodology. It integrates prophetic comprehensiveness, the partial disciplinary traces, direct and mediated spiritual formation, individual encounters, family and household life, learned professions, institutions and the historical processes of ʿumrān. Read it alongside the earlier [prophetic integrality method](editorial/PROPHETIC_INTEGRALITY_AND_INHERITANCE_METHOD.md). These files govern subsequent revisions; their appearance does not certify uncompleted collation.

## Muhammadan Reality and Miʿrāj research · 11 November 2026

The [source-led dossier on the Muhammadan Reality, ascension, Logos and the relation of higher spiritual and earthly ʿumrān](editorial/MUHAMMADAN_REALITY_MIRAJ_HIGHER_AND_EARTHLY_UMRAN_RESEARCH_20261111.md) compares Ibn ʿArabī, al-Qūnawī, Farghānī, al-Mahāʾimī, Ibn Turka, al-Sulamī/Colby, Lings, Guénon, Schuon and the Burda. It records which passages were directly inspected and which remain uncollated. The continuous reader text remains unchanged by this methodological publication.
