# Tahdhīb Stage 90 — Cairo p. 12: the exact final result formula of figure IV

**Date:** 2 November 2026. **Subject:** direct reinspection of the original Cairo 1330/1912 printed **p. 12** of Saʿd al-Dīn al-Taftāzānī's *Tahdhīb al-Manṭiq*. The source is the 128-page Library scan `At-taftazaniSadAd-din1912_text.pdf`, enlarged and inspected directly, not inferred from a later *Sharḥ*. This is **single-print evidence only**, not a collated manuscript reading.

## 1. Four transcription-level corrections in L.16

| L16 locus | Former Cairo-labelled working text | Original Cairo p. 12 photograph | Status |
|---|---|---|---|
| The conditional use of possible premisses | `وكون الممكنة مع ضرورة` | **`وكون الممكنة مع ضرورية`** | Corrected source noun from `ضرورة` to adjective/substantival `ضرورية`. |
| Paired negatives in figure IV | `وكليتها مع الموجبة الجزئية` | **`وكليتهما مع الموجبة الجزئية`** | Restore the **dual** pronoun: the universal of the two negative quantities, in the previously enumerated `السالبتان`. |
| Order of result's affirmative quantity | `جزئية موجبة` | **`موجبة جزئية`** | Printed word order is qualitative then quantitative. |
| Conditional predicate's gender/ellipsis | `إن لم تكن بسلب` | **`إن لم يكن بسلب`** | Printed `يكن` is masculine, not feminine `تكن`; do not normalize the Arabic to the supposed feminine antecedent. |

Combined and retaining only editorial punctuation, the directly rechecked Cairo phrase is:

> ... والسالبتان مع الموجبة الكلية، **وكليتهما مع الموجبة الجزئية موجبة جزئية إن لم يكن بسلب وإلا فسالبة**، بالخلف أو بعكس الترتيب ثم النتيجة ...

For the second figure the direct source reads:

> ... وكون الممكنة مع **ضرورية** أو مع كبرى مشروطة ...

These photographed words replace earlier prose in the continuous L16 Arabic field, **without changing its stable ID, Arabic surrounding clauses, or Cairo p. 12 locator**.

## 2. Why the exact word order matters

The earlier sequence **`جزئية موجبة ... وإلا فسالبة`** made it unusually easy to treat the adjective “particular” as necessarily governing both a positive and negative outcome. The corrected Cairo sequence begins **`موجبة جزئية`**: a particular affirmative is indicated for the wholly affirmative patterns; otherwise the short text says only **`فسالبة`**, a negative, **without repeating a categorical quantity**.

This does **not** by itself prove all eight later-commentary configurations, but it is entirely consistent with the commentator's explicit recognition that the universal negative minor + universal affirmative major combination (his fourth-figure pattern **3**) yields a **universal negative**. The modern nonmodal test confirms that `E(M,S)` and `A(P,M)` entail `E(S,P)` directly, including cases with empty term extensions. See the separate source-backed [Stage89 eight-pattern dossier](STAGE89_FOUR_FIGURES_MODAL_SOURCE_AND_BOOLEAN_BOUNDARIES.md).

The dual **`كليتهما`** is also meaningful: following **`السالبتان`** (the universal and particular negative possibilities), it isolates the **universal one of that pair** when combined with a particular affirmative major premise. Losing the `م` in a single-pronoun normalization hides this structural relationship. The exact orientation is then interpreted in the separately identified modal-commentary table, **not** inserted as additional Cairo wording.

The bare `ضرورية` is likewise the **classification of a proposition** (a necessary modal premise), not merely an abstract relation of necessity (`ضرورة`): retaining that adjective matters in a passage enumerating classes of modal propositions.

## 3. Witness independence and grammatical caution

The running matn in the separately printed *Sharḥ al-Tahdhīb* is itself a **different printed textual witness**; where it expands first-figure quantities or fourth-figure rules, those expressions are not borrowed into the Cairo print. The later commentary's explanation of eight candidate fourth-figure combinations and its marginal glosses supply an **interpretative aid**, not decisive evidence of manuscript agreement.

The Cairo phrase `إن لم يكن بسلب` is retained as read even though modern Arabic editorial instincts might favor feminine concord. Its implicit subject should be considered in commentary; one must not silently emend it to `تكن` without an independent *Tahdhīb* witness.

## 4. Editional changes and controls

1. `texts/al-taftazani/tahdhib-al-mantiq/edition/data.js`, L.16: four **source-text-level** repairs against Cairo p. 12 and a source note explaining the grammatical and inferential consequences.
2. `STAGE89_FOUR_FIGURES_MODAL_SOURCE_AND_BOOLEAN_BOUNDARIES.md`: updated the provisional quoted phrase and inserted an explicit Stage90 supersession notice, while preserving its source-versus-modern-model distinction.
3. `.github/workflows/tahdhib-reader-ci.yml`: positive and negative regression assertions lock both Cairo readouts against accidental reversal.
4. The standard reproducible six-PDF publication workflow should regenerate from this new canonical corpus. Its successful completion and source-hash verification must be observed separately before calling it a published match.
5. **No change to the count of ten distinct printed comparisons**, because Stage90 corrects the transcription of the **same Cairo print**, not a newly collated source.
6. **No Kalām count change:** 1,044 bilingual clauses, 110/113 Cairo page checks, residual pp. 77, 100, 124.

## 5. Next substantive proof obligation

The mathematical Stage89 matrix exposes three patterns—his figure-IV **6**, **7**, **8**—that fail under unqualified Boolean interpretation even when every term extension is nonempty. The marginal note (signed `سل`) in the separately printed al-Yazdī tradition, printed p. 145, introduces additional modal/convertibility restrictions for those configurations. A full historical proof must:

- reconstruct the exact truth conditions of those restricted `mujawwahāt` from commentary source pages;
- show which temporal and subject-description qualifications permit conversion or actualization;
- derive the conclusion while preserving the proper historical quantity, quality and time scope;
- give a countermodel to any proposed rule when an assumed historical condition is omitted;
- not call the nonmodal failure a refutation of Taftāzānī or al-Yazdī.

**Editorial stopping condition:** Until these historical modal rules have been independently established, the text can have a **corrected Cairo diplomatic passage** and a **modern Boolean test**, but not an unqualified statement that the traditional modal proof has been formally certified.
