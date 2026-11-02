# Tahdhīb Stage 79 — nonmodal proof repair and L10–L17 scope audit

**Date:** 2 November 2026  
**Work:** Saʿd al-Dīn al-Taftāzānī, *Tahdhīb al-Manṭiq wa-l-Kalām*  
**Source authority:** Cairo Maṭbaʿat al-Saʿāda, 1330/1912, pp. 3–14 for logic and pp. 15–127 for kalām.  
**Editorial level:** critical *working* text, **not** a definitive manuscript-collated edition.  
**Previous handoff:** [Stage 78 Cairo collation](STAGE78_CAIRO_LOGIC_COLLATION.md).

## 1. Verified problem and repair to the executable logical test

The previously committed `tools/tahdhib/verify_logic_core.py` described a 512-model test, but it generated its sets with `range(1, 1 << N)`: this produced **7 rather than 8** possible extensions of each term in a three-element universe, hence **343 models**, and excluded the empty extension. Such exclusion *silently imposed existential import on S, P and M*. It also defeated the script's own requirement that the four existentially sensitive moods have countermodels when the existence premise is omitted.

Stage 79 replaces this with `range(1 << N)`: **8³ = 512** interpretations, including empty terms. An independent check of the 19-mood categorical test gives the following four traditional moods with countermodels absent the designated existential hypothesis:

| Pedagogical mnemonic | Figure | Premises | Conclusion | Explicit existence condition in modern set model |
|---|---|---|---|---|
| Darapti | III | M–P (A); M–S (A) | S–P (I) | M is nonempty |
| Felapton | III | M–P (E); M–S (A) | S–P (O) | M is nonempty |
| Bramantip | IV | P–M (A); M–S (A) | S–P (I) | P (equivalently, under the major premise, the relevant P in M) is nonempty |
| Fesapo | IV | P–M (E); M–S (A) | S–P (O) | M is nonempty |

In the full 512-model set enumeration, each of these has **27 countermodel interpretations** when the relevant nonemptiness assumption is omitted; none remains once that assumption is enforced. The remaining fifteen moods hold without an additional existence assumption under the modern Boolean interpretation of A/E/I/O used by this program.

**Scope warning:** all such claims are about the explicitly defined modern three-element set model. They do not certify medieval modal propositions, figure conditions involving *fiʿliyya*, or the source's implicit conventions concerning subject existence. Mnemonic names are modern pedagogical labels in the verifier; they are not represented as Taftāzānī's vocabulary.

The script now adds explicit guards asserting 512 cases, all four expected existential exceptions, the four-value truth conditions for disjunction, safe material-conditional inferences, invalid affirmation-of-the-consequent and denial-of-the-antecedent patterns, and the scope of negation under quantified conjunction.

## 2. Direct unit-by-unit second-pass reasoning audit

This ledger combines the **existing Cairo-page-located corpus** with an independent modern test. It does not mark the full Arabic of any unit as independently manuscript-verified.

| Unit | Cairo | Arabic anchor from the reader | Literal issue / editorial test | Result and remaining condition |
|---|---|---|---|---|
| **L10** | 7–8 | `ولا بد في الموجبة من وجود الموضوع إما محققا ... أو مقدرا ... أو ذهنا` | An affirmative requires a subject existence condition, but the three named forms distinguish *actual*, *supposed under real quantification*, and *mental* existence. | **Model-scope clarified:** modern set semantics alone is insufficient to interpret all three as though they had the same actual-world range. The printed clause and commentary must govern *ḥaqīqiyya*. |
| **L11** | 8–9 | `ضرورة النسبة ما دام ذات الموضوع موجودة`, `ما دام وصفه`, `وقد تقيد ... باللادوام الذاتي` | Eight simple modal forms and seven compound forms must retain subject-duration, description-duration, temporal, actuality and contrary-possibility distinctions. | **Taxonomy preserved:** no truth-functional substitution for the historical modalities. The Stage77 repair `الوقتيتان المطلقتان` stands subject to manuscript comparison. |
| **L12** | 9 | `الحقيقية`, `مانعة الجمع`, `مانعة الخلو` | Exactly-one-of-two vs not-both-true vs not-both-false are different inferential forms. | **Propositional skeleton tested**, with distinction between essential (*ʿinādiyya*) and coincidental (*ittifāqiyya*) still a historical/interpretative issue. |
| **L13** | 9–10 | `التناقض اختلاف قضيتين`, `في الكيف والكم والجهة` | Contradiction must reverse truth values with preserved subject and respect, and must take care with quantifier scope for compound modality. | **Modern negation scope tested**; compound traditional modal contradictions are not thereby certified. Stage78 Cairo-vs-other-print distinction retained. |
| **L14** | 10 | `والموجبة إنما تنعكس جزئية`, `والسالبة الكلية تنعكس كلية` | Check categorical conversion A→I with a witnessed subject, E→E and I→I; O does not generally convert. | **Nonmodal skeleton tested**; no general inference A→A, and `لا عكس للممكنتين` is a historical modal rule requiring a commentary argument, not a property of the Boolean skeleton. |
| **L15** | 11 | `تبديل نقيضي الطرفين مع بقاء الصدق والكيف، أو جعل نقيض الثاني أولا مع مخالفة الكيف` | Two descriptions of contraposition are provided. Their formalizations require careful treatment of quality, complemented terms, and existential import. | **Uncertified modal transformations**; do not conflate these with classical material-implication contraposition without further exegesis. |
| **L16** | 11–12 | `إيجاب الصغرى وفعليتها وكلية الكبرى` | Four-figure categorical structure and stated conditional/modal refinements. | **19 nonmodal mood test repaired**. The Cairo reading `مع الموجبة الموجبتين، ومع السالبة السالبتين` stays distinct from the other print's additions of `الكلية`. The historical modal figure rules remain open. |
| **L17** | 13 | `الاستثنائي ينتج من المتصلة وضع المقدم ورفع التالي` | Affirming antecedent / denying consequent are sound in a modern implicative model; affirming consequent / denying antecedent are not. Strict disjunction allows both forms; weak disjunctions license only one direction each. | **Schematic tests added.** The source's *luzūmiyya/ittifāqiyya* distinction must not be equated without argument to truth-functional material implication. |

### Specific source-versus-formalization constraints

- In L10, `المقدَّر` is *supposed* existence in the traditional classification, not an announcement that the subject is present in the actual world; `الذهني` is mental existence. An external-universe model loses that difference unless enriched.
- In L11, the eight simple forms are **ḍarūriyya muṭlaqa, mashrūṭa ʿāmma, waqtiyya muṭlaqa, muntashira muṭlaqa, dāʾima muṭlaqa, ʿurfiyya ʿāmma, muṭlaqa ʿāmma, mumkin(a) ʿāmma**. The seven compound forms add **mashrūṭa khāṣṣa, ʿurfiyya khāṣṣa, waqtiyya [khāṣṣa], muntashira [khāṣṣa], wujūdiyya lā-ḍarūriyya, wujūdiyya lā-dāʾima, mumkin(a) khāṣṣa**. Bracketed explanatory distinctions in the English taxonomy are not manuscript readings.
- For L12 the propositional truth functions are: **ḥaqīqiyya** P XOR Q; **māniʿat al-jamʿ** ¬(P∧Q); **māniʿat al-khulū** P∨Q. Inference from P to ¬Q is valid in the first two but not in the third; inference from ¬P to Q is valid in the first and third but not in the second. This is a reconstruction of the truth-functional skeleton, not a semantic theory of `ʿinād` and `ittifāq`.
- For L13, **¬∀x(A(x) ∧ B(x))** entails, indeed is equivalent to, **∃x(¬A(x) ∨ ¬B(x))**. It does *not* generally entail the conjunction **∃x¬A(x) ∧ ∃x¬B(x)**. The last distinction is important if the contradiction of a compound modal is applied individually to quantified subjects.
- For L14, universal affirmative conversion needs subject instantiation for the existential particular conclusion under the *modern Boolean* semantics: ∀x(S→P) plus ∃xS gives ∃x(P∧S). Unqualified ∀x(S→P) cannot supply it by itself.
- For L16, the figure labels in the source are governed by the middle term's positions, but the source additionally refers to actuality and permanence in ways that must not be inferred from this finite model.

## 3. Updated Kalām crux control after reinspection of the Cairo scan

Original **Cairo numbered** pages **39, 77, 80, 100 and 124** were re-opened and visually inspected in the library's 128-page scan titled `At-taftazaniSadAd-din1912_text.pdf`. They remain **five unresolved loci**: a rereading of *the same print* is not a second independent witness or a manuscript collation.

| Cairo page / current clause | What the direct scan clarifies | What remains unresolved |
|---|---|---|
| 39 / `KAL-039.04` | The time passage moves from continuity to movement and invokes *circular* as opposed to rectilinear movement, which ceases. | Exact joining/syntactic wording around `ولامتناع فنائه`; no missing word may be supplied as confirmed Cairo text. |
| 77 / `KAL-077.03` and `KAL-077.10` | The first passage explicitly closes with `مخافة الإطناب والله الهادي إلى طريق الصواب`; the later passage contrasts `ذات الواجب` with other essences. | The opening of the closing sentence remains visibly difficult; the predicate `مخالف`/possible feminine correction requires a second witness. |
| 80–81 / `KAL-080.11` | The denial `قلنا ممنوع` is visibly followed by a further compressed justification about power and the attribution of originated events to God; it must not disappear from the eventual continuous translation. | Exact letters and segmentation around that justification and its transition over the next page. |
| 100 / `KAL-100.02` | A pair of purported Mosaic formulae is invoked as an objection concerning abrogation and then answered; it is not a report of two independently authenticated Mosaic quotations. | The text immediately introducing the quoted formulae cannot be upgraded from the current provisional status. |
| 124 / `KAL-124.06` | The argument turns on **wa-hum rākiʿūn** as *ʿaṭf* versus a circumstantial clause, and on bowing in prayer versus humility. | The exact highly compressed matn syntax is still witness-dependent. *Sharḥ al-Maqāṣid* (authorial parallel, not independent Tahdhīb witness) clarifies the reasoning, especially [pp. 269–271](https://ablibrary.net/book_content/b/9293/269?lang=ar). |

**Certification count unchanged:** 1,044 bilingual Kalām clauses, **108/113** full-page single-print checks, **five pages pending**. The current reader may keep the explanatory brackets; they must never be advertised as verbatim Cairo Arabic.

The [al-Azhar 995 AH manuscript catalogue](https://cp.alukah.net/library/0/103964/) identifies a 40-folio manuscript and its [linked facsimile](https://cp.alukah.net/Manu/Files/Manuscript_6154/Makhtotah.pdf), but the facsimile pages could not be reliably rendered for checking in this stage. Consequently **zero manuscript readings are claimed**. The different [al-Yazdī-commentary print](https://www.arabicdawateislami.net/bookslibrary/3507/page/11) remains a separate printed comparator.

## 4. Stage 79 output and Stage 80 gate

**Changed:** `tools/tahdhib/verify_logic_core.py` now correctly enumerates 512 models and adds independent logical scope assertions.  
**Added:** This dossier logs the philosophical and textual interpretation of that code change.  
**Not changed:** The 19-unit online Arabic/English reader corpus, its PDF outputs, or the five provisional Kalām readings. No PDF synchronization is required until corpus text changes.

**Next gate:** select a genuinely readable manuscript facsimile; identify folio locations for all five cruxes; collate character by character with Cairo 1912 and the other printed matn; complete commentary-specific exposition of L11–L17 before certifying their modal transformations; only then revise the shared source dataset and regenerate bilingual PDFs. Treat al-Sanandajī + Wasīm as an entirely separate critical-edition workstream.

**Project QA rule:** a green computational test says a *specified modern model* validates a *specified modern formula*. It does not show that a disputed Arabic reading is correct, that a traditional modal rule has those semantics, or that a manuscript says what a printed commentary says.
