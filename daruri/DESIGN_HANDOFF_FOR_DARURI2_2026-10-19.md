# Gnamma al-Ḍarūrī reader — design handoff for Darūrī 2
Date: 2026-10-19
Repository: https://github.com/gnamma-research/booksite
Canonical live reader: https://gnamma-research.github.io/booksite/daruri/
Dictionary: https://gnamma-research.github.io/booksite/daruri/dictionary.html
Branch: master

## Preservation rules
- Treat the current master version of `daruri/index.html` and `daruri/dictionary.html` as canonical for **interface, CSS, navigation, return-to-reading logic, themes, and controls**. Do not replace the website shell with HTML from a scholarly export.
- Darūrī 2 may update **source-controlled Arabic text, English translation, grammatical explanation, collation, textual variants, and note records only**. Retain all 259 section identities (258 numbered reader units + separately labelled copyist note) and existing stable concept/jump addresses.
- Keep the five reader palettes and dark/system modes unified between the reader and the full dictionary. The dictionary inherits saved reader appearance and has **no separate theme or Gnamma palette buttons**.
- The site's published `daruri/daruri.pdf` is the 170-page revised comparative bilingual PDF, accompanied by `daruri/bou-akl-2015-variant-report.pdf`. Replace these only with a newer source-verified scholarly PDF.

## Integrated reading header
- The editorial descriptive title carries a clickable **(E)** marker. If the source has an Arabic original heading, show its recorded English translation in English and parallel modes; show the original Arabic heading in Arabic and parallel modes.
- The reader has 47 attested printed Arabic headings with 47 corresponding English heading translations already stored in `editionData.sections`; do not invent a printed Arabic heading at locations lacking one.
- The large subtitle and repeated location-banner heading are visually suppressed. Keep one integrated heading, followed by tiny section, Arabic print pagination, and Gnamma PDF page references.
- **Source distinction is mandatory:** `sections[].pages` currently tracks **Jamāl al-Dīn al-ʿAlawī's 1994 Arabic edition**, not Bou Akl's 2015 pagination. Bou Akl 2015 is used for collation and specific documented emendations. Do not relabel al-ʿAlawī page numbers as Bou Akl pages until independently collated. `sections[].pdfPage` opens our Gnamma bilingual PDF.
- Arabic-only view should retain attested Arabic numbering or ordinal language *when present in the source heading*, but section keys such as §102 are our navigation units, not an authorial Arabic rubric.
- Display title and Arabic rubric with no extra literal “heading” label in the Arabic matn.

## Controls
- Language selector: exactly two independent buttons (`ع` and `EN`); selecting both shows parallel text and the final selected language cannot be deselected.
- Tashkīl appears as a checkbox inside the Reading apparatus dialogue, separate from the two persistent language buttons.
- The reading-apparatus modal has Tashkīl, Concepts, Technical vocabulary, Bidāya applications and Reading notes in displayed order; Contents navigation is in its own fieldset. The header has a direct toolbar switch and recoverable **Show header** control.
- Focus button remains in the compact reader toolbar. The right-hand context pane, its toolbar button, its header button and its apparatus preference have been retired entirely; the reader is a two-column desktop layout (contents + main text) and one-column mobile layout.
- Copy button uses `copyVisibleMatn(n)` to copy ALL section matn text in the selected language(s), including headings and precise Arabic source and Gnamma PDF page metadata. It does not copy apparatus footnotes.
- The separate Share button opens a genuine share-composition dialog, offering editorial title, original rubric (with English translation), first passage, highlighted selection (when any), full visible section, or link only. It generates a section permalink. Where supported it opens the native share sheet; otherwise the composed message is copied, distinct from Copy Matn.

## Concepts
- The academic index is sorted with English locale collation and all 302 headings can appear on its first page; indexed subtopics/jump links remain unchanged.
- Clicking a concept from a section must resolve its canonical parent and subtopic. Regression case: §102 “Transmission > reading before the teacher” must not show zero matches because of an obsolete search filter.
- Internal “aligned passages” counters and repetitive fallback messages have been removed or hidden from the public reading UI; alignment metadata must be preserved internally for fidelity and editorial maintenance.

## Unified dictionary
- The left menu has a single **Dictionary** route rather than separate competing “glossary” and “dictionary library” items.
- The quick glossary view provides short contextual technical definitions; the full dictionary now also supports in-place switches **Meaning**, **Historical sources**, **In the text**, and **All** (same 153 terms), through `article.dataset.dictView`.
- The full dictionary on mobile has a collapsible **Browse terms** panel, responsive two-column headword cards containing Arabic headwords and number of sourced dictionary excerpts, full-size (>=16px) native source-author dropdown, and no horizontal headword scroller. Source counts are **not** term frequencies in Ibn Rushd.
- Dictionary links and return-to-reading locations must be preserved; hashes `#term=<term>` (legacy) and `#view=<view>&term=<term>` (new) are both recognized.
- In the reader, legacy `#glossary` remains available for old bookmarks; do not remove or break it even if a later implementation makes the views fully unified.

## Reader chrome revision, 19 October 2026
- Sidebar branding is the Gnamma mark with `gnamma RESEARCH`, without “Published by” or “Scholarly texts”.
- The reader's header displays the section number only once; the old duplicated location strip has been removed from the interactive DOM.
- The right contextual sidebar is retired and no link or toggle should reopen it. Scholarly notes remain in the in-text apparatus and dedicated reference views.
- The latest UI-only changes preserved the two embedded source data blocks (`editionData`, `dictionaryData`) byte-for-byte. Do not replace the 170-page published PDF or source text unless a separately verified Darūrī 2 revision is available.

## QA status and remaining limits
- Static checks passed for both inline JS programs on master (V8 compilation) and verified source structure: 259 reader records; 47 original Arabic headings with English translations; dictionary view tabs, mobile grid, and sorted index code present.
- This is NOT evidence of an end-to-end iPhone browser test. Test reader §102 (three language modes, vowel on/off, header E, copy, focus/sharing); dictionary tabs, search, native select sizing and exact back-to-reading; alphabetic index/jump; theme propagation; PDF link; and no-JavaScript fallback before definitive sign-off.
- Before applying later Darūrī 2 content, inspect current master and make content-only diffs; avoid overwriting these interface updates.


## Header switch revision · 19 October 2026
- The compact reader toolbar order is **Arabic / English (both independently selectable) → Focus → Save / Copy / Share → Header → Reading apparatus (book icon)**; Tashkīl is inside the apparatus dialog.
- Header is a direct, reversible switch using a recognizable **panel-with-top-header** glyph. It is **not** an option within the Reading apparatus dialog; retain technical terms, concepts, notes, applications and left contents there.
- When the header is hidden, the compact reader toolbar remains accessible at the top, with the header button indicating its current on/off state. A floating **Show header** recovery control uses the same header glyph instead of a settings gear, and can also exit Focus mode.
- Keep the separate appearance/preferences screen and no-JavaScript fallback intact. Do not add the retired right context sidebar.
- The Darūrī 2 editorial content-only updates must preserve these controls, event handlers and CSS.

## Toolbar and apparatus revision — 19 October 2026 (latest)
- The current published `daruri/index.html` on master is the design authority. This revision is **interface-only**: it must not be overwritten by a PDF conversion, scholarly data export, or older reader version.
- The toolbar has **exactly two independent language buttons**: `ع` for Arabic and `EN` for English. Turning on both uses `state.lang='parallel'`; turning one off shows the other alone. The last selected language cannot be turned off. No third “Both” button appears.
- Tashkīl is **not** a separate reader-toolbar button. It is an on/off switch at the top of the **Reading apparatus** dialog (`id="apparatusTashkil"`), updating `state.vowels`; the Arabic and English selections remain independent of it.
- Apparatus order matches the reading page: Tashkīl (matn), Concepts, Technical vocabulary, Bidāya applications, Reading notes. Contents navigation is in a separate `Navigation` fieldset. Header has its own dedicated toolbar switch.
- Next to **Focus**, the persistent toolbar has **Save**, **Copy**, and **Share** controls. They retain the same functions as the former actions beside the section heading, but the duplicate heading actions are now removed. Save updates the bookmark state; Copy exports the complete visible matn and displayed headings/metadata in the currently selected languages; Share opens the existing share composer.
- Compact toolbar remains accessible in focus mode; at phone width controls are tighter while labels remain available to screen readers via `aria-label` and `title`.
- Keep the reader’s source and apparatus data blocks unchanged. The 170-page PDF and separate Bou Akl variant report remain linked. Never assert that the displayed Arabic source page numbers are Bou Akl’s when they are from al-ʿAlawī 1994.
- Important QA still needed: interactively test the actual deployed page on iPhone/Safari, keyboard and screen reader interactions, last-language lock, apparatus tashkīl persistence, Save/Copy/Share actions after navigating sections, and returning from the full dictionary.

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


## 19 October 2026 — Integrated headings, copy and dictionary update

This section preserves the latest reader/dictionary fixes and **supersedes any older descriptions** of those elements. Apply scholarly revisions to content data only; preserve these features intact:

- **Original headings:** The editorial English title has a clickable (E) key. The original printed Arabic heading, when available, and its existing English translation are shown alongside the editorial title, rather than as another full-width heading. The Arabic-only setting displays the original Arabic rubric and any part/order words actually printed there. Do not invent Arabic text for editorial-only titles.
- **Copy:** The Section actions → Copy text action copies the **complete matn in all currently visible languages**, with editorial title (E) only in English/parallel modes, original Arabic/English rubric as appropriate, section number, accurately attributed source page and the translation PDF page. It excludes apparatus and editor-only alignment metadata.
- **Arabic page authority:** The reader knows six independently checked Bou Akl (2015) Arabic page correspondences: reader §§2→118, 3→120, 20→132, 21→132, 203→284 and 218→294. These show `Bou Akl ’15`. **All other Arabic pages are labelled al-ʿAlawī ’94**, not falsely relabelled Bou Akl; add 2015 locators only from a separately verified crosswalk. `PDF` indicates the Gnamma 170-page bilingual translation, not either printed Arabic edition.
- **Technical terms:** The left-menu entry is a single **Dictionary · معجم**, with Quick definitions and Historical dictionary linked as complementary views. In the historical dictionary, the source/explanation/occurrences tabs remain; the headword browser uses a responsive two-column-or-more grid on mobile, with an explicit Show all button instead of a horizontally draggable or clipped strip. The source-author dropdown has iOS-friendly 16px font and sufficient height.
- **Concept index:** All 302 main entries sort alphabetically for display. A source-to-index verification of the 947 section concept links on current master found all 947 had a matching canonical subtopic in the correct section; preserve this mapping and the target-focus navigation.
- **Apparatus navigation:** Do not add a Contents panel checkbox to Reading apparatus. Contents is opened by the top-left navigation button; the right-hand contextual sheet is separately toggled beside Focus.
- **No jargon:** Do not display “aligned passage(s)” in the public reader. Editors may retain alignment metadata internally.
- **Design validation:** JavaScript and JSON script blocks passed compilation/parsing checks on the committed reader and dictionary; **this does not establish iPhone Safari end-to-end testing or confirm CDN propagation**.

Relevant commits: `3b3a692f` (remove redundant Contents option), `44edcaf8` (heading/page/copy), `0af2ac1c` (dictionary browser). The master branch may contain later improvements; always merge onto its current tree.

## 19 October 2026 — Framed post-matn reading apparatus (latest)

Keep the Reading Context button in the toolbar, but do not confuse its contextual side sheet with the apparatus beneath the main bilingual text.
On every reading section, the latter now has a light dividing rule, a small 'Reading apparatus' caption, and independent theme-aware, bordered cards for Concepts, Technical vocabulary, Bidāya applications, and Textual & editorial notes.
The authoritative code is in daruri/index.html on master: CSS style block gnamma-aftertext-cards-20261019; HTML rendered by the afterText variable inside renderReader(), wrapping existing tags, defs, appCards, and noteCards without altering their content or section IDs.
On phones the card padding/gap scales down; Focus mode hides the post-matn apparatus. Maintain all existing sections, content and links while integrating future Daruri2 editorial corrections.
Implementation: https://github.com/gnamma-research/booksite/commit/b8aae518fdd10173a3ec556bca37aa852d69252d
Quality limit: GitHub markup/source checks only so far; an independent interactive mobile Safari run remains to be completed.


## 19 October 2026 — Focus and hidden-header state correction (supersedes older conflicting advice)

**Canonical source:** `daruri/index.html` on master, commits `60fc0095` and `d6abc985`. Do not apply an earlier CSS shell that changes these states.

- **Focus** and **Hide header** are different actions. Focus suppresses the masthead and peripheral apparatus but keeps the compact control strip visible, with its Focus control usable to exit. Focus **never** shows the floating `#restoreHeader` control at lower right.
- **Hide header** deliberately removes **all** reading chrome as one group: masthead, language switches, header toggle, book/apparatus menu, section Save/Copy/Share, reading context, Focus, progress display, bottom dock/navigation, and left contents. The main matn remains. While the header is intentionally hidden and Focus is off, one small lower-right `#restoreHeader` recovery button is visible to restore the full chrome.
- State sync: `applyCleanReader()` sets `#restoreHeader.hidden = state.showHeader || state.focusMode`, and normalizes an impossible legacy state where Focus and hidden header are both saved. `setVisibility('header', …)` also exits Focus to avoid trapping the user without a recovery control. The final CSS override is `#gnamma-independent-focus-header-20261019`.
- **No duplicate controls.** Do not add a second floating Focus toggle, duplicate language buttons, or restore button in Focus mode. Keep the right-hand Reading Context sheet toggle immediately before the far-right Focus icon when chrome is shown.
- **Source integrity:** These commits are UI-only; no Darūrī 2 text, headings, editorial notes, concept mappings, dictionary entries, 170-page PDF or variants were changed. Cache key updated to `daruri-reader-v20261019m`.
- **QA:** JavaScript source compiles and structural DOM/CSS selector checks pass. A live iPhone/Safari end-to-end interaction test is still required, particularly Focus on/off, Hide header / floating restore, and reload with a saved hidden-header preference.
