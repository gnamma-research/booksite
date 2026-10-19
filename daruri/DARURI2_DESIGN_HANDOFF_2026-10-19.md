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
