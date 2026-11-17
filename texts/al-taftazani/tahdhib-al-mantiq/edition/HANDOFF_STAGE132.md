# Tahdhīb al-Manṭiq — Stage132 cumulative H translation checkpoint

**17 November 2026.** Continue from [Stage131](HANDOFF_STAGE131.md); this is a source-facing, **English-only** additive release. No source Arabic, baseline English, numbered gloss, T matn, Y commentary block, or previous handoff was overwritten.

## Actual work completed

- The 26 historical positions of **H-CONTRAPOSITION** and all 36 numbered positions of **H-INDUCTION** were reviewed at the level of the available recovered digital Arabic. The latter includes **three modern editorial records**, kept in M rather than historical H. Across the 62 records: **13 new fuller historical translations**; **31 existing English translations checked against Arabic and retained**; **15 previously preferred fuller historical translations preserved without retranslation**; **3 already translated modern references left under their modern attribution**.
- [Five contraposition English additions](stage132-contraposition-preferred-english.json) and [eight induction/analogy additions](stage132-induction-preferred-english.json) contain source-linked English **without publishing the rights-sensitive recovered Arabic**. Both are now loaded by the clean [main public reader](index.html) into the same-page historical gloss pane, with the older English available in collapsed scholarly notes. The existing Stage130 and Stage131 overlays remain unmodified and applied before Stage132.
- In the **private** cumulative Stage132 HTML, all 19 T matn units, 1,090 H records and 137 contextual lexicon entries persist. **All 1,090 Arabic strings and their 1,090 earlier English fields are unchanged**, verified by pre/post SHA-256 comparisons. Thirteen `englishPreferred` fields were added; no prior preferred translation was overwritten. The Y main commentary remains available via the consolidated 113-block bilingual import/sync as in Stage131.
- Historically numbered H prose positions with a preferred fuller English now total **130**, up from 117 at Stage131. Of the 1,033 historical/prose positions (1,029 old first-pass prose + four table-affected notes), **903 still have no preferred fuller English**. Many of those have usable earlier English, but a full clause-certified critical translation must not be inferred from that fact.

## New concrete textual crux

At **HWN-CONTRAPOSITION-003, digital Qum p.336**, the source gives one valid contradiction argument, then a second alleged derivation using the printed premises `بعض ما ليس ج ب` and `كل ج ب` and asserting `بعض ما ليس ب ب`. The second conclusion does **not follow** from those literal premises. The current digitally indexed Arabic at https://ablibrary.net/book_content/b/12170/336?lang=ar agrees with the recovered string. The translation preserves the actual wording and puts the logical defect in scholarly apparatus. No hypothetical authorial emendation is imposed without printed/manuscript evidence.

Other additions retain the exact direction and quantity of contraposition, proof through supposition versus a counterexample, the procedural versus technical meaning of induction, two competing methods of determining a legal analogy's cause, and objections to inferring causal priority solely from concomitance. The crocodile note is translated as historical testimony, not modern natural history.

## Validation

- GitHub Actions **Tahdhīb actual reader and logic verification** for commit `59afa4f93cd9b9645c414bb1caa4ab05d3d74ae1` reported **logical-core success and reader-chromium success**. Subsequent concurrent repository commits may restart or cancel duplicate runs without invalidating this observed completed job result.
- The private Stage132 HTML's embedded JSON parses, and its complete T/H/dictionary counts match Stage131. Python pre/post comparisons verify source and first-pass English preservation. `node --check` passes for its embedded JavaScript. The container's separate full-scale Playwright navigation run was blocked or timed out, so **do not claim private end-to-end browser certification**; public GNAMMA Chromium/WebKit workflow coverage is a separate evidence scope.
- No independent complete manuscript-page collation or historically unrestricted necessity-modal proof is newly claimed.

## Next precise continuation — Stage133

1. Start **H-ARTS**, the five logical arts (38 historical H positions), especially the longer **HWN-ARTS-001, -002, -037, -038**, where precise distinctions between matter and form, dialectic and sophistry, and formally invalid versus materially false argument must be preserved. Retain earlier preferred H-ARTS-012, -018, -036; do not retranslate them. For the rest, record source-reviewed/retained separately from genuinely rewritten English.
2. Follow with **H-SCIENCES** (86 numbered historical gloss positions) and then source-ordered unrevised portions of the larger H sections; preserve both the main H corpus and all previous full/partial reviewed notes.
3. Continue separate original printed-table verification: Q258's **37 substantive incomplete definition cells**, Q294's one unresolved core and second-print qualifier strokes, Q309's difficult witness differences; preserve Q300's 32 first-print readings.
4. Investigate the **11 older Stage114/Stage122 extraction SHA differences** against exact original extraction bytes where recoverable; do not pretend hash differences prove manuscript variants. Continue clause-by-clause T/Y/H English and real manuscript collation. Establish the 46 exceptional fourth-figure historical modal results only with explicitly justified semantics, non-vacuity and proof/countermodel, not conditional tables alone.

**Designation:** substantial integrated research/study edition and source-aligned English continuation. Volume I is **not yet a fully verified final four-layer critical translation**, and Volume II has not begun.
