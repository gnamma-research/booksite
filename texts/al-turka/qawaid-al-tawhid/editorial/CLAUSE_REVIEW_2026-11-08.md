# Qawāʿid / Tamhīd — clause-level review ledger

**8 November 2026 | Current status: machine-indexed throughout, manual philological review ongoing.**

This is a *reviewable working ledger*, **not a claim that all clauses have been certified**. The 171 existing bilingual sections have been mechanically divided and mapped into **3,377** successive Arabic–English candidate alignments, with **1,798** review cues for potential shifts in negation, conditionals, exceptions and voices of objection/reply. These cues are intentionally overinclusive and **are not 1,798 proven errors**. Every Arabic/English segment is retained, but the proportion-based aligner sometimes associates neighbouring clauses imperfectly. Use the Arabic source itself, not the machine association, to adjudicate.

## Corpus-wide, complete machine mapping

| Source layer | Bilingual units | Candidate clause groups | Map |
|---|---:|---:|---|
| Original matn, Abū Ḥāmid Turka | 61 | 483 | [Matn](../qa/clause-map-matn.jsonl) |
| Authorial introduction, Ṣāʾin al-Dīn | 40 | 401 | [Introduction](../qa/clause-map-introduction.jsonl) |
| Main commentary I, SH-001–032 | 32 | 1,219 | [Main I](../qa/clause-map-main_001_032.jsonl) |
| Main commentary II, SH-033–060 and four connecting subsections | 32 | 1,234 | [Main II](../qa/clause-map-main_033_060.jsonl) |
| Conclusion, SH-061-C/D/E/F/A/B | 6 | 40 | [Conclusion](../qa/clause-map-conclusion.jsonl) |
| **Total** | **171** | **3,377** | |

The counts in the main-commentary rows refer to **32 source units each**, *not* 32 numbered lemmata each. Four additional units have -B suffixes. The compiler preserves the difference between Abū Ḥāmid's matn and separately quoted bridge passages from his writings.

Each line in a JSONL map has the original text fragment, an English *candidate* fragment, source-section identifier, and potential logical-marker review cues. **reviewStatus = machine-aligned—semantic equivalence not certified** must not be relabelled as verified until a human has read the corresponding Arabic and English with the source.

## Manual review completed in this pass

**148 / 3,377 candidate groups have been explicitly marked after Arabic–English reading:** 108 matn groups (QT-001–009 and thirteen additional doctrinally important matn lemmata), plus **all 40 concluding commentary groups**. The latter include fifteen manually reallocated literal glosses, with six groups explicitly carrying source-reading or interpretative uncertainty. The first nine matn lemmata include sixteen manually reallocated literal glosses correcting inaccuracies in the *machine alignment*, not independently proven inaccuracies in the already published complete English translation.

**3,229** candidate groups remain to be individually certified against their Arabic and any independent textual witness. The 1,798 machine cue flags should be used for prioritization, never counted as translation errors. The published source Arabic has not been conjecturally rewritten by the clause-index pass.

The manual record is embedded directly in each JSONL row under `manualReviewStatus`, `manualLiteralGloss`, `reviewNote` and `reviewDate`. For reviewed rows, a separate literal gloss may improve clause-level alignment without replacing the smoother published passage-level translation.

## Clause-level editorial findings from direct comparison

### 1. QT-058 versus SH-058: do not harmonize two different readings

- **Matn QT-058:** «وهكذا الكلام في النوم والسهر» — the regulation of sleep and *staying awake / sleeplessness*.
- **Commentary SH-058:** «وهكذا الكلام في النوم و السهو و ما يوجبهما من الجوع و الشبع» — literally, the same applies to sleep and *inadvertence or lapses of attention*, and to hunger and satiety that can produce them.
- **Finding:** the previous English of SH-058 rendered **السهو** with the **السهر** sense present in QT-058. The corrected commentary English now follows the displayed A digital reading. Nevertheless QT-058 is strong contextual evidence for **السهر** as a possible source-level alternative, and a different A reading cannot be ruled out until printed or manuscript inspection.
- **Disposition:** source words in the matn and commentary both retained; no silent Arabic emendation. Record the possible sahr/sahw issue at [SH-058](SH058_LEXICAL_CORRECTION_2026-11-07.md). **Status:** two witnesses/contexts juxtaposed, not independently collated manuscripts.

### 2. SH-002: a reversal within the transmitted objection

- **A's commentary reads:** «القطع ببطلان مسألة التوحيد قطع ببطلان جميع أقسام اليقينيات».
- **Literal force:** certainty that the doctrine of unity is *invalid* entails rejecting all classes of certainties.
- **Existing translation reads:** “certainty [in this doctrine of unity] would amount to certainty in the invalidity of all classes of certain cognition.”
- **Finding:** the bracketed English substitutes the opposite polarity required by the argument's dialectical context; it is **interpretation**, not what the A Arabic literally says. The existing SH-002 note already acknowledges this defect. Its reading is not independently resolved.
- **Disposition:** do not certify the clause as literally translated. If issuing a fully diplomatic English edition, include the received wording with **[sic]** and give the contextual correction in the apparatus, rather than hiding the inversion.

### 3. SH-001 / QT-001: opening doxology and interpretation

- SH-001 cites and interprets **«الحمد لوليّه»**; A's historical matn and bibliographical testimony report this wording.
- The current QT-001 reading deliberately adopts the independently reported **«الحمد لله رب العالمين»**, with the A alternative in the apparatus.
- The commentary English paraphrases the first formula as praise directed to the rightful recipient, rather than giving an exact lexical equivalent of **وليّه**.
- **Disposition:** retain the two distinct versions and the commentary's interpretation, but do not present QT-001's preferred opening as a critically established consensus of three independent manuscript folios.

### 4. SH-INTRO-025: printed disjunction with missing negation

- The N Arabic has **«أو يكن»** where the following **«فإن لم يكن»** indicates a negative alternative.
- The English supplies “or does not” by contextual interpretation. The existing note records this; it is **not** an independently established emendation.
- **Disposition:** preserve Arabic and mark English as conjectural at the clause level until N's printed image and independent witnesses are checked.

### 5. QT-047: **المناقض** versus **المناقص**

- The original lemma's printed **المناقض** is not lexically the same as **المناقص**, reported in the grandson's immediate commentary.
- The English “deficiencies” follows the latter contextual reading. The working apparatus already records this.
- **Disposition:** keep this as a textual decision with a transparent source note; do not label it an unproblematic literal equivalence.

### 6. QT-054: duplicated or corrupt electronic Arabic clause

- The working QT-054 contains a repeated phrase about extracting middle terms and combining them with the extremities. The English marks the repetition with an editorial bracket rather than pretending it is natural authorial prose.
- **Disposition:** retain the duplicate in the source-backed reading and inspect print images before removing it. It is not a verified emendation.

### 7. SH-061-A/F: metaphysical guidance and fragile readings

- **SH-061-A:** **أقفاله** (“his locks”) is the displayed form; **إقباله** and **أفعاله** are printed alternatives, not independent codex readings. This changes how one understands the perfected guide's keys.
- **SH-061-F:** problematic web readings **يصيرى**, **والملوك**, and **الغير المنسّقة المنتظمة** require direct source-image comparison. The English uses contextual interpretation and should not silently assert manuscript authority.
- See the [closing commentary's five-page review](CONCLUSION_270_274_SOURCE_REVIEW.md).

## Next priority for genuine semantic certification

Compare clause-by-clause the *actual A/N wording* and the selected English for (i) SH-001–024, the proof of unrestricted existence and the `tashkīk` objection; (ii) SH-025–035, the first determination, divine knowledge and causality; (iii) SH-036–054, worlds, soul and Perfect Human; (iv) SH-055–061, intellectual inquiry, purification and the criterion of spiritual knowledge; and (v) the whole original QT-001–061 matn. Check every negative, modality, subject of predication, quotation boundary and objection/reply attribution. The clause index makes it possible to assign and track this review without losing passages.

**Completion distinction:** Corpus and candidate clause mapping **complete**; manual review of all 3,377 candidate alignments **not complete**; independent manuscript collation **not complete**; QT-059 recovery **deferred**. Do not call this a definitive critical edition.
