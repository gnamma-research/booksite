# Tahdhīb Stage 82 — L12 Cairo conditional/disjunction collation and logical scope

**Date:** 2 November 2026  
**Work:** al-Taftāzānī, *Tahdhīb al-Manṭiq*, edition division **L12**, Cairo original **p. 9**.  
**Controlling source:** Cairo, Maṭbaʿat al-Saʿāda, 1330/1912.  
**Distinct printed comparator:** Matn inside *Sharḥ al-Tahdhīb*, [online page 13](https://www.arabicdawateislami.net/bookslibrary/3507/page/13).  
**Evidence class:** **direct comparison of two printed forms**, not a manuscript collation and not an assertion of which form Taftāzānī originally authored.

## A. Three source-facing differences on the same page

The Cairo printed page was reread at high magnification; the second printed source is available as text with original book page recorded separately.

| L12 part | Cairo 1912 p. 9 | Commentary-containing print, online p. 13 | Consequence |
|---|---|---|---|
| Connected conditional | `لزومية إن كان ذلك لعلاقة` | `لزومية إن كان ذلك بعلاقة` | Two close prepositional constructions; retain *lāmi* reading in Cairo. Both concern the explanatory connection rather than material implication alone. |
| Distribution of the intrinsic/coincidental classification | **`وكل منها عنادية`** | **`وكل منهما عنادية`** | Cairo's nondual `منها` naturally resumes the three immediately preceding disjunctive kinds. The alternate dual `منهما` requires an implicit pair/antecedent; neither must be silently normalized. |
| Cause of incompatibility | `إن كان التنافي لذات الجزأين` | `إن كان التنافي لذاتي الجزئين` | Different morphology and orthography around what is intrinsic to the two constituent propositions; preserve each printed witness's construction. |

The changes to the canonical Cairo L12 clause are **only** these directly established words. Other portions of the ongoing L12 transcription may have small printed differences and are **not** given a blanket word-level certificate by this three-locus comparison. In particular, the full sentence defining `munfaṣila` needs continued examination against the Cairo page without importing the comparator's longer `معا`.

**Cairo reading, repaired excerpt:**

> الشرطية متصلة إن حكم فيها بثبوت نسبة على تقدير أخرى أو نفيها، لزومية إن كان ذلك **لعلاقة** وإلا فاتفاقية. ... وكل **منها** عنادية إن كان التنافي **لذات الجزأين** وإلا فاتفاقية.

The online comparison reads `بعلاقة`, `كل منهما`, `لذاتي الجزئين`. These are source readings, **not** English editorial substitutes.

## B. The logical difference that must be preserved

The author first differentiates the **conditions under which a disjunction is true**, then distinguishes whether its oppositional basis is **intrinsic** (`ʿinādiyya`) or **merely coincidental** (`ittifāqiyya`). The two classifications answer **different questions**:

1. `ḥaqīqiyya` (true or strict disjunction): exactly one disjunct is true, excluding joint truth **and** joint falsity.
2. `māniʿat al-jamʿ` (prevents conjunction): two disjuncts cannot be true together, but **both may be false**.
3. `māniʿat al-khulū` (prevents joint falsity): two disjuncts cannot both be false, but **both may be true**.

**Modern truth-functional *skeleton*, without identifying it with complete traditional logical semantics:**

| P | Q | ḥaqīqiyya (XOR) | māniʿat al-jamʿ (¬(P∧Q)) | māniʿat al-khulū (P∨Q) |
|---|---|---|---|---|
| False | False | False | True | False |
| False | True | True | True | True |
| True | False | True | True | True |
| True | True | False | False | True |

The explanation for *why* a pair excludes joint truth or falsity is **not** fixed by these four truth-value rows. Example: `P`: “this number is even”; `Q`: “this number is odd” can yield an intrinsic incompatibility under a fixed integer domain. `P`: “the lamp is lit”; `Q`: “the door is open” may happen to have differing truth values in a particular observation, but that coincidence does not make a strict essential relation. Calling them `ʿinādiyya` solely because their observed truth values differ would be a modal/conceptual category error.

### Exceptive inferences to keep separate (L17 dependency)

- Given strict disjunction, **affirm P ⇒ deny Q**, and **deny P ⇒ affirm Q**; symmetric variants hold.
- Given a *preventing-conjunction* disjunction, **affirm P ⇒ deny Q** is valid, but **deny P ⇒ affirm Q** is not: the pair can both be false.
- Given a *preventing-exclusion* disjunction, **deny P ⇒ affirm Q** is valid, but **affirm P ⇒ deny Q** is not: the pair can both be true.

These are conditional modern representations of the relevant truth-function constraints; they do not independently prove that a *historically defined* `ʿinādiyya` relation can be reduced to truth-functional operations. A future commentary-facing review must explain the possible role of intrinsic repugnance, ontological impossibility, and quantifier/time qualifications.

### Why `منها` / `منهما` matters

On Cairo's grammar, the three preceding forms appear under **one further cross-classification**: each can be intrinsically opposed or coincidental, as applicable to the nature of its two members. The alternative dual could indicate a different syntactic antecedent and needs interpretation in the specific printed commentary. Do not infer a historical doctrinal disagreement from that grammatical variation alone without a commentator's explanation or manuscript evidence.

## C. Translation decision and data integration

Current Cairo L12 English makes the plural reference explicit:

> Each of the foregoing disjunctive forms is intrinsically opposed (*ʿinādiyya*) if the incompatibility derives from the two members themselves; otherwise its opposition is coincidental.

The base Arabic retains `وكل منها عنادية إن كان التنافي لذات الجزأين وإلا فاتفاقية`. The alternate printed text is saved with its own source URL in `witness_comparisons_stage77` (an inherited data-field name: it now contains *eight* printed comparisons, including later stages). The reader must show the Cairo Arabic in the main text and present the alternate in a source-labelled comparison panel.

**Release checks added:** the CI verifies `وكل منها`, `لعلاقة`, `لذات الجزأين` and eight printed comparisons, while browser QA visits L12 at desktop/mobile viewports to ensure Cairo main text does not silently adopt `وكل منهما`.

## D. Continuity and residual gates

- **Kalām:** Stage 81 remains **110/113 original printed pages** source checked, **1,044 bilingual clauses**, with residual readings at **77, 100, 124**. The p.124 grammatical connection remains explicitly uncertain.
- **Logic:** all 19 divisions are continuously bilingual. Their source-page locations have been checked against the controlling Cairo pp. 3–14, but this is not equivalent to complete second-pass proof verification of every modality.
- **Modal logic:** L11–L17 still require a **source-aligned traditional formal reconstruction**; ordinary truth tables do not establish what the source means by necessity *while the subject exists*, necessity *while a description holds*, actuality, duration, or nonpermanence.
- **Manuscripts:** no variant is claimed from the 995 AH al-Azhar manuscript or Princeton Garrett 4139Y until its actual cited folio and line can be read and associated with this clause.
- **Sanandajī–Wasīm:** remains a separate translation and critical-edition workstream and must not be absorbed into this Taftāzānī matn text.

**Next recommended source pass:** compare the remaining L10–L17 particles in Cairo pp. 7–13 to the commentary-containing matn at online pp. 13–15, especially `كلية/جزئية`, `الدوام/اللادوام`, and any changes in modal conditional clauses. For each, record precise folio/page, source wording, translation effect, and whether a countermodel depends on existential, temporal or modality assumptions.
