# Tahdhīb al-Manṭiq — Volume I Stage131 consolidated bilingual reader and source audit

**15 November 2026.** The completed deliverable of this stage is a private integrated four-layer *reading edition*, not a falsely declared definitive multi-manuscript critical edition. Preserve the [Stage130 cumulative handoff](HANDOFF_STAGE130.md), the [Stage125 source proof dossier](HANDOFF_STAGE125.md), [Stage124 critical completion gate](STAGE124_CRITICAL_VERIFICATION_GATE.md), and all original Stage114 historical records.

## Four genuinely distinct voices and coverage

- **T original matn:** 19 Arabic/English logic divisions retained without alteration.
- **Y principal al-Yazdī commentary:** [all 113 distinct source-order bilingual blocks consolidated into one versioned JSON](yazdi-113-bilingual-consolidated.json), covering Qum pages 7–123, 19,323 Arabic and 23,891 baseline English whitespace-token words, with three fuller preferred English passages kept separate from original fields. No longer necessary to reconstruct from twenty disparate source files; the online native reader shows T/Y in one flow.
- **H later historical ḥawāshī:** all 1,090 numbered records and all old Arabic and English field SHA256 values preserved in the **private study HTML**. Historical first-pass status remains 1,029 English prose, four prose translated with incomplete original tables, and 57 separately attributed modern-reference entries. Stages through 130 accumulated 104 preferred fuller historical H readings. Here **all 29 definition-section H notes were checked against digitally recovered Arabic at argument/terminology level**; [11 precise English source/signature corrections](stage131-h-definition-english-patches.json) increase the private reader's preferred count to **115**; two further source-facing syllogism expansions (HWN-SYLLOGISM-013 and -056, the equality syllogism’s intrinsically productive result and the different proof procedures for second-figure moods) bring it to **117**. The public H pane applies the 11 patches on top of 21 prior Stage130 preferred English overrides, with previous text available in closed apparatus. The 29-note check does not claim full manuscript collation.
- **M separately attributable modern insertions:** 57 modern-reference source positions plus 8 further embedded attributions in the private reading layer, not mingled with historical H speakers.

## Reader now implemented

The **private** standalone Stage131 HTML has all T/H/M text and 137 searchable Arabic/English technical glossary entries. It adds a same-page Y bilingual 113-block reader, paragraph/topic navigation, Arabic/English/parallel controls, source links, search, notes, bookmarks, and focus/immersive reading. The 113 Y Arabic/English strings are downloaded from the versioned public JSON once and cached by the browser if possible, or may be imported from the user-downloaded JSON for offline study. This Y source is **not embedded** in the HTML and therefore requires first sync/import: do not advertise it as fully offline without Y being imported.

The private reader preserves original source records, modern/private rights separation, prior English in expandable apparatus, and separately indexed Q258/Q294/Q300/Q309 source photographs and source-critical dossier. Reader QA: 32 checks passed in Chromium 1440/390 using an explicitly **synthetic Y import test fixture**. Do not confuse simulated import acceptance with checking the 113 actual Arabic/English readings in a physical iPhone or Safari browser.

**Public** [main Tahdhīb reader](index.html) and [Volume I hub](volume-i-hub.html) retain the T+Y display and optional searchable H pane; the [11 Stage131 English-only corrections](stage131-h-definition-english-patches.json) are overlaid without mutating the canonical H source data. Automated public Chromium/WebKit test now asserts all 11 expected substitutions and that no source replacement was silently skipped. Publication status is subject to observed repository Pages build and QA, not merely a Git commit.

## Historical-source proof gates still unresolved

- **Arabic digital source:** recovered 1,090/1,090 records reproducibly, while 11 older Stage114 census SHA discrepancies remain unexplained; digital extraction checks are not independent photographic or manuscript verification.
- **Q258** 49 source locators: 12 short `انظر` and 37 substantive cells still needing complete literal original Arabic/English and full second-print comparison.
- **Q294** 104/105 provisional core symbols, one unresolved; all direction, description and time-qualification strokes still require individual second-print checking and historical semantic justification.
- **Q300** 32/32 provisional one-print symbols, second-print checking outstanding.
- **Q309** 12 working examples and 3 instruction rows; four complex phrasings and two print/digital witness wording differences require final adjudication.
- **Formal logic:** 46 historically classified mixed fourth-figure modal cases have conditional source-rule derivations. No independently certified unrestricted historical necessity-strength proofs with coherent existence/nonvacuity and description conditions have been established; four cases are premise-unsatisfiable in one explicit finite semantic model.
- Hundreds of historical H source clauses, Y textual seams and authentic authorial manuscripts still lack independent critical checking. **916 historical/prose H positions lack preferred fuller English, despite the older first-pass translation and some argument-level reviews**. This is not final unabridged English certification.
- Full republishing of the modern edited digital-source Arabic publicly requires copyright and attribution review. Private research distribution and public English-only overlays are deliberately separate.

## Continuation

The Stage131 private full research package (distributed separately to the owner) holds the HTML, current 29-note audit and corrections, integrity manifest, QA, and the unchanged full Stage130 cumulative archive. Do not restart previous translation or overwrite original H/T/Y witnesses; retain true completion grades. Proceed to Volume II only after Volume I's stipulated acceptance tests can be honestly met.
