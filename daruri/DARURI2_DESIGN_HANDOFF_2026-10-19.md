# Darūrī 2 ↔ Gnamma reader design handoff — 19 October 2026

## Canonical website design
Use the **latest `master` version of `daruri/index.html`**, plus `daruri/dictionary.html`, `daruri/sw.js`, and the site's existing Gnamma assets. **Do not overwrite these files with older Darūrī 2 HTML or CSS.** Bring new scholarly content into this design, not the other way round.

Reader: https://gnamma-research.github.io/booksite/daruri/
Dictionary: https://gnamma-research.github.io/booksite/daruri/dictionary.html

## Currently adopted presentation and behaviour
- Compact reading toolbar: independent `ع` and `EN` switches (both selected displays both; at least one stays selected), Focus, Save / Copy / Share, Header, and Apparatus. Tashkīl appears only inside the apparatus dialog. The retired right-hand context pane and its controls are not reinstated.
- Editorial English heading `(E)` sits next to the original Arabic rubric (when present); in English/bilingual view the original rubric's **English translation** also appears. Arabic-only view shows the original Arabic rubric (with the source's original part/section wording where present), without fabricated editorial Arabic.
- Integrated top heading + part/section and compact page references. Do not display “aligned passage” counts, repeat the title in a large location banner, or include a redundant Browse button.
- Tap `(E)` for the editorial/source legend. The page references currently retained in `origPage(s)` are from **al-ʿAlawī (1994)**; the comparative Arabic text draws on **Bou Akl (2015)**. A rigorous Bou Akl page-by-page crosswalk is needed before relabelling the former as Bou Akl pagination. `PDF` links refer to Gnamma's 170-page bilingual translation.
- Copy button extracts **all visible matn** plus displayed header according to current Arabic/English/bilingual selection and voweling preference. The separate Share button opens an option dialog: editorial heading, original heading, first passage, selected text, full section, or section permalink alone. It invokes the device share sheet when available, otherwise copies the selected linked message.
- Alphabetically ordered academic concept headings, correctly resolved concept/subtopic locations and direct jumps to numbered sections.
- One “Dictionary” entry in reader navigation; Quick definitions and Historical sources are clearly labelled view choices. The full historical dictionary displays classical source extracts, translations and related Darūrī occurrences in a mobile-friendly grid, without requiring horizontal scrolling.
- Reader palette, light/dark mode, saved reading location, glossary navigation, semantic links, mobile adaptations and no-JavaScript content must remain functional. Dictionary appearance follows reader settings (no redundant dictionary theme or Gnamma buttons). Header hiding has a fixed **Show header** recovery control, including exit from Focus mode. Sidebar branding is simply `gnamma RESEARCH` and the old duplicate section banner is removed.

## Scholarly data protocol
Preserve all 258 numbered sections, the separately distinguished copyist's note, the 416 alignment units (as **internal data**, never UI jargon), stable section IDs, term references, note anchors, applications and concept destinations.
Apply changes to Arabic transcription, English translation, tashkīl, English original-rubric translations, lexicon entries and scholarly notes using explicit source-provenance records. Do not claim full collation or definitive manuscript recension absent checking. New Darūrī 2 source-controlled content takes precedence over older readings only when its provenance/verification is established.

Current published PDF: `daruri/daruri.pdf` (170-page Bou Akl comparative bilingual edition). Variant report: `daruri/bou-akl-2015-variant-report.pdf`. The content-only Darūrī 2 package should be merged **into this shell**, not used as a replacement template.

## Outstanding validation
1. Confirm all latest Darūrī 2 content-package passages and notes are present in HTML, not just the PDF or selectively integrated.
2. Establish Bou Akl **printed-page** crosswalk for each relevant source passage before changing the currently labelled al-ʿAlawī values.
3. Perform actual iPhone/Safari and Android testing for the dictionary, heading-mode changes, focus/header restoration, Share and Copy independently, and return-to-reading anchors.
4. Validate regenerated PDF and HTML together after future translation revisions; refresh service worker cache.

This file is the handoff for the separate Darūrī 2 conversation: treat the GitHub master reader as the canonical design and apply subsequent editorial text updates to it.


## Header switch revision · 19 October 2026
- The compact reader toolbar order is **Arabic / English / parallel → حَ/ح → Focus → Header → Reading apparatus (book icon)**.
- Header is a direct, reversible switch using a recognizable **panel-with-top-header** glyph. It is **not** an option within the Reading apparatus dialog; retain technical terms, concepts, notes, applications and left contents there.
- When the header is hidden, the compact reader toolbar remains accessible at the top, with the header button indicating its current on/off state. A floating **Show header** recovery control uses the same header glyph instead of a settings gear, and can also exit Focus mode.
- Keep the separate appearance/preferences screen and no-JavaScript fallback intact. Do not add the retired right context sidebar.
- The Darūrī 2 editorial content-only updates must preserve these controls, event handlers and CSS.

## 19 October toolbar update — supersedes old control list

The earlier “Currently adopted presentation” toolbar sentence above is now obsolete. Follow **master `daruri/index.html`** and `daruri/DESIGN_HANDOFF_FOR_DARURI2_2026-10-19.md` as the updated design contract. The controls now have **two independent language switches** (`ع`, `EN`), with at least one always selected and both selected meaning parallel mode. **No third Both button.** The separate toolbar vowel button is removed; the **Tashkīl** switch lives inside the Reading apparatus dialog. Its options are ordered in page sequence: Tashkīl, Concepts, Technical vocabulary, Bidāya applications, Reading notes; Contents navigation is a distinct fieldset. **Focus → Save / Copy / Share → Header → Apparatus** are clustered in the persistent toolbar, and section-heading action duplicates are removed. This is interface-only and preserves the Darūrī 2 scholarly data already present in the reader, the current 170-page PDF, and the comparative variant report. Do not reintroduce the retired right context sidebar.

## Canonical toolbar and context design — 19 October 2026 (latest; supersedes conflicting directions above)

The authoritative implementation is `daruri/index.html` on GitHub master. **Do not restore any older toolbar layout, source text, or stylesheet while applying Darūrī 2 editorial corrections.** The reader now uses one compact line of controls, in this exact visual order:

**`ع` + `EN` independent language switches | outlined Header | Reading apparatus | ⋯ Section actions | Reading context | Focus (last, far right)**.

- **Header:** one outlined button, using the same paper/transparent surface, accent ink and border as adjacent display buttons; no borderless grey styling. Hiding the complete header/chrome intentionally shows a single floating recovery button near the lower right; earlier wording claiming the toolbar stays visible after full chrome hiding is superseded.
- **Reading apparatus:** the book icon opens the existing switches for tashkīl, concepts, technical vocabulary, applications and notes. Do not duplicate them in other menus. `ع` and `EN` can be on independently, with at least one active.
- **Section actions:** the standalone Save, Copy and Share icons are **no longer three visible peers of the display toggles**. An outlined `⋯` icon opens a separate accessible menu labelled **Save section / Copy text / Share…**. Bookmark state, complete selected-language matn copying, and the existing share composer are retained; the menu closes after use, on outside click, or Escape.
- **Reading context:** the user expressly requested a right-hand control beside Focus. Its button opens a **new, responsive context sheet**, with the current section's indexed concepts, definitions, notes and Bidāya cross-references. The old permanent/right-rail implementation stays retired. The contextual sheet can be closed or dismissed, and is a mobile-friendly overlay. Do not remove the new button on the grounds that the older sidebar had been retired.
- **Focus:** always the furthest-right control, toggling concentrated reading on/off. Opening context while Focus is active exits Focus.
- **Responsive layout:** maintain distinct groups at narrow widths; do not reintroduce individual always-visible Save/Copy/Share icons or shrink controls to unreadable labels. Tooltips/ARIA labels carry the explanatory wording, while the toolbar remains icon-led.
- **Data integrity:** retain the already integrated Darūrī 2 readings, section IDs, notes, concept references, 170-page bilingual PDF and variant-report link. Changes listed here are **interface-only**. Existing source-page numbers are attributed to al-ʿAlawī 1994 unless an independently checked Bou Akl page crosswalk replaces them.

Implementation commits for this revision: `7124acff` (grouped controls), `32e42f86` (working responsive context sheet), `01058219` (Focus/context interaction).

**Validation limitation:** structural checks and JavaScript syntax checks were performed, but independent iPhone Safari interaction and layout regression testing remains necessary. Do not describe that testing as completed.


## Navigation and post-matn cards — 19 October 2026 (supersedes earlier footer/header directions)

- **Use the latest master `daruri/index.html` as the canonical Gnamma interface.** This update is presentation-only; preserve its Darūrī 2 Arabic/English matn, Bou Akl/ʿAlawī attribution distinctions, note links, dictionary and PDF assets.
- **Integrated title:** Show the navigation section reference (`sectionRef(s.id)`, for example §102) immediately alongside the editorial/original section title, *not* as a separate line beneath the editorial title. The section number must remain visible in Arabic-only, English-only and parallel modes. The paired source/English rubrics and clickable `(E)` editorial key remain as before. The small Arabic-edition and Gnamma-PDF page citations remain separate.
- **Post-matn apparatus:** The concepts, technical vocabulary, Bidāya applications and reading notes live in individually bordered, theme-aware, responsive cards inside `.gn-reading-aftertext` (added on master). Keep their anchors, author/source distinctions, buttons and toggles; do not flatten them back into continuous text or discard notes. On narrow devices these stack vertically.
- **Section navigation:** At the bottom of the matn, the two adjoining section buttons show **destination section titles** with small directional arrows, but without visible “Previous” or “Next”. The persistent bottom reader dock similarly presents the preceding/following section titles (two-line ellipsis where needed); the centre retains the current section and jump control. Their accessible labels still explain direction.
- **Section picker:** Keep part-selection buttons and searchable sections, but **remove the redundant “Previous part” and “Next part” controls** and their unused container.
- **Full header hiding:** Switching Header off hides the complete top navigation, compact reader controls, reading progress and reader dock, not merely the Darūrī masthead. A single floating recovery icon restores them. Explicit high-specificity CSS takes precedence over previous rules that unintentionally kept the toolbar visible. Focus remains a separate reversible mode.
- **Copy matn:** Keep full visible selected-language content, with the section reference grouped in the copied header rather than repeated in the page metadata.
- **QA:** The structural checks and inline runtime-script syntax check have passed. Independent iPhone/Safari UI verification remains outstanding. Once changes to Darūrī 2 source files are merged, bump `daruri/sw.js` cache and retest all navigation, dictionary and apparatus controls.

Implementation: GitHub commit `d5fa5a8` (interface), followed by an offline cache update. This handoff supersedes earlier contradictory “toolbar remains visible with Header off” language.


## 19 October 2026 — Latest hidden-header Focus recovery (supersedes any contrary guidance above)
Canonical live reader source: `daruri/index.html` on master, UI commit `3f2c94e630d273e62eb7eb94c220c78c322fbacc`; offline update `dbe98f8a23db954c4d096c5cdfca83c96e00b44c`.

- **Preserve the bottom reader dock**: previous **arrow + section number** | broad central **current section title/jump** | next **section number + arrow**. Do **not** put adjacent section titles back into these narrow side controls. Longer adjacent titles belong only in the separate **post-matn** navigation.
- **Page-top heading**: the part designation and section reference occupy **one same-style line**, e.g. `Part II · §102`. Retain the adjacent editorial (E) heading, its English translation of an original rubric and original Arabic wording as selected.
- **Hide header**: continue hiding all top/navigation chrome. At bottom-right a small **two-button recovery group** (`#hiddenHeaderRecovery`) appears: **Restore header** (`#restoreHeader`) and **Focus** (`#hiddenHeaderFocus`); both stay usable.
- **Focus may now be activated while the header is hidden.** Its on/off state is visibly indicated (`aria-pressed`); Focus hides the post-matn cards (`.gn-reading-aftertext`) and extra chapter navigation. Press the same Focus icon again to return to the normal hidden-header reading view. Restoring the header returns to the normal chrome view and exits Focus.
- **Focus without Hide header** keeps its normal compact-toolbar Focus control and **does not** show the floating group. This latest user-requested dual recovery **explicitly supersedes** earlier instructions that prohibited a secondary Focus control whenever the header was hidden.
- Do not overwrite the current Gnamma UI/HTML/CSS/JS while merging Darūrī 2 scholarly text and annotations. Source edits only; keep the 170-page PDF map, theme, dictionary return positions and corrected index links.
- Verified syntactically and in four simulated UI-state combinations (header shown/hidden × Focus on/off). Full live iPhone Safari testing is **not yet confirmed**.
