# Tahdhīb — Stage 110: new Ḥawāshī on the Introduction to Logic, locally numbered 1–49

**Date:** 9 November 2026 · **Repository:** `gnamma-research/booksite` · **Source family:** H, later `ḥawāshī al-ḥāshiya`; this is **NOT** Taftāzānī's original matn T or al-Yazdī's principal commentary Y.

## Actual scholarly output

**49 newly indexed numbered H-INTRO glosses**, from Qum searchable printed **pp.165–178**, with stable IDs **`HWN-INTRO-001` … `HWN-INTRO-049`**, independent of the historic **140 numbered H-PREFACE glosses** Q127–164. The Qum source explicitly opens `حواشي مقدمة علم المنطق` with local note `(1)` on [p.165](https://ablibrary.net/book_content/b/12170/165?lang=ar). Do not invent a continuation "preface note 141" or overwrite `HWN-001` with the new `HWN-INTRO-001`.

The added records contain **6,233 newly authored English words**, comprising **41 complete first-pass English renderings of the short/medium digitally visible numbered notes and eight PARTIAL renderings** for long, composite or unattributed units: **2,7,10,19,20,23,30,42**. Source names, precise Qum page URLs, separate full/partial markers, short Arabic locator lemma, and `scanCertified:false` are stored in four immutable JS batches:

| Stage110 batch | Local historical notes | Printed Qum pages | Complete first-pass English | Partial | Arabic source |
|---|---:|---|---:|---:|---|
| [a](../hawashi-introduction-notes-stage110a.js) | 1–10 | 165–168 | **7** | 2,7,10 | Locator phrases only |
| [b](../hawashi-introduction-notes-stage110b.js) | 11–19 | 168–170 | **8** | 19 | Locator phrases only |
| [c](../hawashi-introduction-notes-stage110c.js) | 20–34 | 170–174 | **12** | 20,23,30 | Locator phrases only |
| [d](../hawashi-introduction-notes-stage110d.js) | 35–49 | 175–178 | **14** | 42 | Locator phrases only |
| **Total** | **49** | **165–178** | **41** | **8** | **0 full Arabic note transcriptions** |

**Two separately attributed modern printed additions** following local notes **18** and **29** (Shaykh Muḥammad al-Karmī) are displayed as UNNUMBERED attached texts in their own separate speaker fields. Neither is counted as a new historical numbered gloss or attributed to sixteenth-century Yazdī.

**Cumulative working H text after Stage110:** **189 distinct numbered notes** in two *historically independent* local series: **H-PREFACE 140 (136 complete English, four partial) + H-INTRO 49 (41 complete English, eight partial)**, so **177 first-pass complete English and 12 PARTIAL across this indexed cohort**. The prior Preface **54** digitally searchable full-Arabic note transcriptions remain, while **86 Preface + 49 Introduction = 135 locator-only Arabic records**. **Eight** unnumbered attached glosses total across both sections.

## Exactly reproducible deliverables

1. [Full Introduction section source](../batches/hawashi-introduction-numbered-cumulative-intro001-049.md), local note IDs 1–49, working English and Arabic locators plus 2 unnumbered modern citations.
2. [Entire combined H corpus](../batches/hawashi-all-sections-cumulative-stage110.md): **356K-character** Markdown with both full section snapshots, stable note anchors and separate historical numbering. Previous full H-PREFACE [140-note snapshot](../batches/hawashi-preface-numbered-cumulative-hwn001-140.md) preserved.
3. [Interactive H numbered-note reader](../hawashi-numbered-notes.html), now with an explicit Preface/Introduction selector, two independent IDs for historical note (1), distinct section headings, source links, search and complete/partial filters. **The original main T/Y reader retains exactly two states** Matn / Matn+sharḥ; the later H is a separate companion, not a third principal text mode.
4. [Machine progress ledger](../progress-data.js) has **11 separate evidence-graded metrics** (previous nine plus **H-INTRO English 41/49** and **H-INTRO full Arabic 0/49**) and keeps all earlier Stage102–109 counts unchanged; visible [progress dashboard](../progress.html).
5. [`HANDOFF_LATEST.md`](../HANDOFF_LATEST.md) holds the *complete* next-chat recovery context; this report is immutable.

## Reading results: philosophical and philological developments

- **Local 1–2, pp165–166:** distinguishing the *book's written prologue* from the *science's intellectual preliminaries* (definition, subject, purpose). The genitive and “containment” puzzles arise only when a preface is made identical with the matters said to be “in” it. Local 2 includes separate glossators and remains **partial**. <https://ablibrary.net/book_content/b/12170/165?lang=ar>
- **3–9, pp166–167:** printed definition of logic as a rule-governed error-preventing instrument; report of an *unverified copy variant* `وجه (خ ل)`; logic's formal subject as previously known conceptual/assent matters leading to unknowns; the vanguard-of-the-army etymology of *muqaddima*; logical *premise* vs science/book *introduction*. Item 7 is PARTIAL because the printed passage combines etymology and multiple authors. <https://ablibrary.net/book_content/b/12170/166?lang=ar>
- **10–18, pp167–168:** whether verbal and intellectual introductions are strictly necessary for the discipline, how words are means to meanings, and a logical distinction between book *in words* vs book *in meanings*. Local 18 contrasts knowledge as form, reception and cognitive relation; the modern al-Karmī criticism of “form” definitions stays independently attributed and excerpt-only. <https://ablibrary.net/book_content/b/12170/168?lang=ar>
- **19–23, pp169–172:** prior understanding of “knowledge” without a definition; whether awareness of one's own mental act entails understanding the lexical assignment of the word `ʿilm`; attempted circularity objection to defining knowledge; **three theories of `taṣdīq`**—simple act of assent, compound of four conceptual constituents, or three cognitions to which judgment accrues. The long historical comparison of proposition vs assent remains **partial**. <https://ablibrary.net/book_content/b/12170/171?lang=ar>
- **24–34, pp173–174:** distinction between **judgment as mental act** and **the proposition's constituent predicative relation**; old vs late philosophical three-/four-part models; the critical text's “occurrence/nonoccurrence” debate, with a later al-Karmī quotation separately attached after note29. The classification of imagination, doubt, conjecture, opinion, false belief, compound ignorance, imitation and certainty is source-specific; DO NOT conflate different schools' uses. <https://ablibrary.net/book_content/b/12170/174?lang=ar>
- **35–42, pp175–177:** `iqtisām` as transitive division of each of *taṣawwur* and *taṣdīq* into necessary/acquired; the distinction between **cognitions obtainable without inquiry** and **cognitions whose acquisition necessarily depends on inquiry** (sudden intuition); *kināya* in two directions of concomitance and its logical weakness when the concomitant is merely more general than what it implies. The supposed proof that not all cognition can be theoretical requires an extra premise prohibiting cross-type circular acquisition; full philosophical regress discussion in local 42 is **partial**. <https://ablibrary.net/book_content/b/12170/176?lang=ar>
- **43–49, pp177–178:** examples of immediate conceptual/assent cognition, sense faculty vs universal abstraction, cosmological definitions attributed to the historical glossator, simple-vs-composite doctrine's effect on necessary/theoretical assent, and critique of `maʿqūl` versus `maʿlūm` in defining inquiry. Local 49 ends within p178, and **local note50 begins near the foot of p178 and continues on p179.** It has not been translated in this stage. <https://ablibrary.net/book_content/b/12170/178?lang=ar>

## Non-negotiable completion limits

- Stage110 **did not transcribe the complete Arabic** of any of the 49 new notes; Arabic fields are *short locator lemmata only*. This is deliberately a separate **0/49** progress bar from English **41/49**.
- **0/274 later H printed pages** are independently photographically/fully source-certified. The new records cover several numbered notes per printed page and quote late inserted text; no page may be counted just because its selected notes have English.
- **0/110 principal Y commentary pages** are independently manuscript certified. The existing two cumulative Qum-print main-commentary translations (110 substantive source positions) are preserved, not retranscribed.
- 46 historical exceptional modal combinations classified, **0/46 complete traditional source-semantic theorems proved**. New material offers useful arguments but no additional formal certificate.
- Short citation or copy-variant item (e.g. local4) is truly a short printed unit, not padded prose. First-pass completeness applies only to the exact numbered unit's readable scope.
- Source signatures/wordings and specific hadith, Qurʾānic glosses and modern printed comments require independent photographed page and bibliographical checks before a critical edition. The original main T/Y two-level reader remains unchanged.

## Exact next stage: Stage111

Read [Qum p178](https://ablibrary.net/book_content/b/12170/178?lang=ar) from local note **(50)**, carrying its continuation through [p179](https://ablibrary.net/book_content/b/12170/179?lang=ar), then proceed local notes **51–60** on p179–180 before continuing to p181 and beyond. The next arguments include **how an unknown may be sought when partly known**, conceptual vs assertoric acquisition, the meaning of a logical *qānūn* as a universal premise applied to an individual case, and reported variants in the order of the principal commentary's lemmas. A later section heading may change local numbering again: inspect every heading before assigning IDs.

Each future stage must append immutable source records and stage report, preserve both prior H section snapshots, regenerate the whole two-section cumulative Markdown and **full** `HANDOFF_LATEST.md`, recalculate section-specific progress, verify source identity and run logical-core+Chromium/WebKit QA. Do not mark partial notes 2,7,10,19,20,23,30,42 complete until their entire Arabic is transcribed and attribution/cross-page seams checked.

### Exact new-chat restart prompt

> Continue GNAMMA Tahdhīb Stage111 at latest merged `master` of `gnamma-research/booksite`. Read `texts/al-taftazani/tahdhib-al-mantiq/edition/HANDOFF_LATEST.md`, `progress-data.js`, `stages/STAGE110_INTRODUCTION_NUMBERING_AND_NOTES.md`, `batches/hawashi-all-sections-cumulative-stage110.md` and source JS Stage104–110. The Preface H local1–140 has **136 first-pass English complete, four partial, 54 full digital Arabic, 86 locators**. The separate H-INTRO local1–49 (Q165–178) has **41 first-pass English complete, eight partial, 0 full Arabic and 49 locators**, with 2 separate modern unnumbered quotes. Source numbering RESTARTED at Q165, so use `HWN-INTRO-050` next, NOT `HWN-141`. Whole later H printed pages fully photographically certified **0/274**, principal Y pages manuscript-certified **0/110**, 46 special modal types classified but 0 fully classically proven. Begin local note50 Q178→179 and continue; preserve local IDs, report source grades, update both-section cumulative, eleven progress bars and complete handoff, test and merge.
