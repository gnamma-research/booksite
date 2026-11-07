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

## Clause-by-clause verification checkpoint — 8 November 2026

**1,000 of 3,377** machine-proposed Arabic–English groups have been individually read at the working-text level and marked with `manualReviewStatus`; **2,377** remain without this level of inspection.

| Textual layer | Groups indexed | Groups inspected against Arabic |
|---|---:|---:|
| 61 original Qawāʿid matn lemmata | 483 | **108** |
| 40 introductory commentary sections | 401 | **141** |
| Main commentary SH-001–032 | 1,219 | **329** |
| Main commentary SH-033–060 including connecting sections | 1,234 | **382** |
| Six closing commentary sections | 40 | **40** |
| **Total** | **3,377** | **1,000** |

Reviewed main commentary sections include SH-002, 015, 017, 023, 028 and 030 (gradation; two modes of determination; possible existents; four primordial names and cognitive presence; divine knowledge), as well as SH-033–036, 036-B, 040-B, 054, 058, 059 and 060 (imaginal existence; knowledge of particulars; intellect and unveiling; the two paths of inquiry, their conditions and qualifications). Reviews of selected matn and introduction units are marked in their respective JSONL maps. The entire six-section conclusion has been read in its 40 candidate groups.

These records distinguish **approved passage-level meaning**, a more literal **clause-specific gloss**, and **unresolved source variants**. A machine-generated candidate fragment often drifts across adjacent clauses. The fact that a separate gloss is supplied does not, without a further argument, establish a mistranslation in the fluent continuous English. In particular, 1,798 algorithmic warning cues are not 1,798 errors.

The available A/N printed-text transcriptions have been read where specified, but manuscript folios have **not** been collated. None of these 713 is certified as having independent manuscript agreement; QT-059's lost ancestral portion remains deferred. The **2,377** remaining groups should not be called manually verified.

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
