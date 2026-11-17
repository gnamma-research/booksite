# Tahdhīb Stage 80 — Cairo p. 39 photographic completion and renewed source ledger

**Date:** 2 November 2026.  
**Controlling printed witness:** Saʿd al-Dīn al-Taftāzānī, *Tahdhīb al-Manṭiq wa-l-Kalām*, Cairo, Maṭbaʿat al-Saʿāda, 1330/1912; original **numbered p. 39**. The underlying source is the 128-page scan preserved in the project Library as `At-taftazaniSadAd-din1912_text.pdf`.

**Scope:** a **single-print, source-facing reinspection** of the complete main-text portion of Cairo p. 39, with three specific clause repairs. This is **not** an independently collated manuscript reading and not evidence of original authorial priority against other witnesses. The 995 AH al-Azhar manuscript and Princeton Garrett 4139Y remain uncited until the *specific folios* bearing the relevant wording are read.

## A. Exact printed readings now established

| Clause | Earlier provisional corpus | Cairo 1912 original p. 39, photograph | English/critical consequence |
|---|---|---|---|
| **KAL-039.03** | `مقدار هيئة غير قارة هي الحركة` | **`مقدار طبيعة غير قارة هي الحركة`** | Time is measure of a *non-abiding nature*, namely motion. The prior `هيئة` was a transcription error **in the working Cairo text**, not a demonstrated manuscript variant. |
| **KAL-039.04** | `ولامتناع فنائه [قراءة رابطة الاستنتاج غير محسومة] مقدار الحركة المستديرة` | **`ولامتناع فنائه لما مر مقدار الحركة المستديرة`** | The linking expression is **`لما مر`**, referring back to a previously supplied reason. No conjectural new verb is required. The geometrical contrast with rectilinear motion (`إذ المستقيمة تنقطع`) is retained. |
| **KAL-039.05** | `ولتقدير جميع الحركات به مقدار الأسرع منها` | **`ولتقدير جميع الحركات به مقدار أسرعها`** | The shorter genitive construction is the *Cairo* reading: time is the measure associated with the fastest motion. The longer working phrase must not be attributed to Cairo. |

### Continuous locus (Cairo printed p. 39, with editorial punctuation only)

```arabic
ولامتناع تألفه من الآنات متصل،
ولعدم استقراره مقدار طبيعة غير قارة هي الحركة،
ولامتناع فنائه لما مر مقدار الحركة المستديرة
إذ المستقيمة تنقطع،
ولتقدير جميع الحركات به مقدار أسرعها،
ومبناه على أصول الفلاسفة.
```

The syntax is compressed: the clauses enumerate reasons in the philosophical account of time as a continuous quantity and a magnitude of motion. The source's `لما مر` refers to a previously presented argument; it is **not** a missing finite verb. The philosophical model is presented and subsequently qualified by Taftāzānī with `ومبناه على أصول الفلاسفة`. The translation therefore reports the doctrine rather than silently endorsing it.

The page also contains the alternative conception `وقيل متجدد معلوم يقدر به متجدد موهوم` and the ancient view `والقدماء على أنه جوهر مستقل ...`; those clauses were retained in sequence. This page continues across p. 38 at its opening and p. 40 in its closing discussion of place.

## B. Change and verification scope

1. The canonical `tahdhib-al-kalam/edition/data.js` now carries **all three revised clauses** and edited English; `KAL-039.03` and `KAL-039.04` have been moved from `READING_NEEDS_RECHECK` to **`VISUAL_CHECKED`** on the evidence of the **same Cairo print**.
2. The original-page single-print checklist is now **109/113** (previously 108/113). The remaining original printed pages needing full resolution are **77, 80, 100, 124**. This is a **single-print** tally, not manuscript verification.
3. Total clause records remain **1,044**; the separate logic has **19 editorial divisions**. Stable clause IDs are unchanged.
4. The logic proof-scope corrections from [Stage 79](../../tahdhib-al-mantiq/edition/STAGE79_MODAL_AND_MODEL_AUDIT.md) remain in force. The English/Arabic canonical data change triggers the repository's existing six-PDF regeneration workflow. Publication/CI status must be checked separately; do not equate a GitHub commit with verified finished PDF publication.
5. The reader's automated QA now asserts the three p. 39 source strings and the **four** remaining outstanding printed pages.

## C. Outstanding source loci

| Page | Clause(s) | Still requiring independent source work |
|---|---|---|
| **77** | KAL-077.03, KAL-077.10 | Closing transition `مخافة الإطناب`; agreement/predicate wording describing `ذات الواجب`. |
| **80–81** | KAL-080.11 | Exact compressed reply following `تماثل قدرته قدرة الشاهد ... قلنا ممنوع` and text continuation across the page seam. |
| **100** | KAL-100.02 | Introductory wording attributing perpetual Sabbath/law claims. The purported Mosaic quotations are part of an opponent's argument and not independently authenticated quotations. |
| **124** | KAL-124.06 | Elliptical parsing of `وهم راكعون`, coordination vs circumstance and Jewish-prayer/humility alternatives. |

**Strict collation rule:** a reading of Cairo 1912 establishes only **Cairo 1912**. Differences in the separate al-Yazdī commentary-contained print are labelled printed-form comparisons, and an authorial parallel such as `Sharḥ al-Maqāṣid` is not an independent *Tahdhīb* textual witness. No manuscript variant may be claimed from a catalogue or a folio that has not been actually inspected.

## D. Current versioned project resources

- [Kalām reader](https://gnamma-research.github.io/booksite/texts/al-taftazani/tahdhib-al-kalam/edition/)
- [Logic reader](https://gnamma-research.github.io/booksite/texts/al-taftazani/tahdhib-al-mantiq/edition/)
- [Stage 79 formal-logic and reader QA dossier](../../tahdhib-al-mantiq/edition/STAGE79_MODAL_AND_MODEL_AUDIT.md)
- [Stage 77 register](STAGE77_CRUX_DOSSIER.md) — a historical record, explicitly superseded at p. 39 by this Stage 80 direct-print rereading
- [Source and translation status](EDITORIAL_STATUS.md)
- [1912 Cairo cataloguing record](https://waqfeya.com/books/%D8%AA%D9%87%D8%B0%D9%8A%D8%A8-%D8%A7%D9%84%D9%85%D9%86%D8%B7%D9%82-%D9%88%D8%A7%D9%84%D9%83%D9%84%D8%A7%D9%85-2bb5de6aa187474a9556cae235ad0fec)

**Source photographs:** Cairo p. 39 was inspected directly from the existing project scan. A photographed print page is evidence for its own reading, not for agreement with the al-Azhar or Princeton manuscripts.
