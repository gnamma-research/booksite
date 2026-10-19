# Darūrī 2 — current Gnamma web reader design handoff
Updated 19 October 2026. Read this alongside `QA_AND_DARURI2_HANDOFF_2026-10-19.md`.

## Canonical principle
The live layout/stylesheet and application logic in `daruri/index.html` are the current Gnamma reader design. **Integrate subsequent Darūrī 2 textual, translation, notes, variant and pagination updates into this reader; do not replace the current HTML/CSS/JS with an older self-contained reader.** Keep matching stable section IDs and alignment units, dictionary navigation, themes and mobile accessibility.

## Current reader interface
- The top reading toolbar is a single row, left to right: **Arabic / English language visibility** | **Save / Copy / Share**, three individually visible actions distributed across the available width | **Apparatus / Context** | **Header / Focus** at the far right. Thin dividers separate the groups. Actions are icon-first on narrow screens but independently focusable with meaningful accessible labels.
- The full apparatus opens a dialog with its detailed visibility options. Focus and header are separate toggles; when the header is hidden, the two independent floating recovery buttons must remain reachable.
- At the bottom *fixed dock*, the previous/next controls are **arrows only**, without adjacent section numbers or titles. The large middle section picker displays the *current* part, section reference and title. Do not conflate this dock with the different previous/next title links at the bottom of the reading page itself.
- Main reader header integrates the original Arabic rubric (and its English translation when English is displayed) with the editorial English title, marked with a clickable **(E)** explanation. The editorial section reference follows the **part heading on the same line and in the same font, weight and colour**, not in a separate secondary heading line. Keep the original Arabic rubric free of editorial page labels.
- Header citations identify the actual Arabic edition employed and the separate Gnamma translation PDF; do not assert that an al-ʿAlawī pagination field is a verified Bou Akl edition page.
- Copy acts on the whole visible matn, in the languages selected, with a concise header; it does not copy apparatus cards, hidden languages or unselected text.
- The full dictionary inherits the chosen palette/theme and offers accurate return-to-reading positions. Academic concept navigation must not reuse an unrelated stale search filter.

## Do not regress
1. Keep the Gnamma palettes and theme synchronization across reader, dictionary and apparatus.
2. Keep the 170-page bilingual Darūrī PDF, its PDF page map, and Bou Akl variant report aligned to the web reader unless Darūrī 2 supplies a *newer, verified replacement*.
3. Preserve the scholarly distinction between printed heading, editorial title, translation, and copyist text.
4. Retain the JS-free static reading fallback and keyboard/touch accessibility.
5. Changes to the text or source apparatus may require review of the index, word links, PDF destinations, translation and offline cache.

## Current publication status
The Gnamma repo incorporates Darūrī 2 comparative refinements and the 170-page PDF. The full content-only ZIP named `Gnamma_Daruri_BouAkl2015_ContentOnly_WebDev3_v2_2026-10-19.zip` was not verifiably merged as an intact source package when the QA note was written. Recheck this status before claiming complete editorial parity. Source/DOM checks are not equivalent to end-to-end iPhone testing.
