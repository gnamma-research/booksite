# Tahdhīb Stage 85 — Cairo L10–L11 original-page modal source audit

**Date:** 2 November 2026. **Controlled base:** Maṭbaʿat al-Saʿāda, Cairo, 1330/1912, original printed **p. 8** plus continuation at top of **p. 9**. **Work:** Taftāzānī, *Tahdhīb al-Manṭiq*, editorial divisions L10 (categorical propositions) and L11 (simple and compound modal propositions).

**Evidence type:** a second high-resolution visual reading of *one defined printed source* in the project’s 128-page Cairo scan (`At-taftazaniSadAd-din1912_text.pdf`). This audit does not claim an Azhar/Princeton manuscript variant, an authorial archetype, or full proof of the historical modal logic.

## I. Source-critical result: printed words versus editorial interpolations

### L10, affirmative predication and subject existence (Cairo p. 8)

The prior Cairo-labelled source had:
> ولا بد في الموجبة من وجود الموضوع **إما** محققاً **فهي** الخارجية أو مقدراً فالحقيقية أو ذهناً فالذهنية.

**The printed sentence reads:**
> ولا بد في الموجبة من وجود الموضوع محققاً **وهي** الخارجية أو مقدراً فالحقيقية أو ذهناً فالذهنية.

**Correction:** delete the editorial `إما`, restore `وهي`, and retain the three-way conceptual classification in English. Explanatory expansion of an Arabic ellipsis in translation is legitimate; insertion of unattested words in Cairo's *primary* Arabic is not.

**Semantic caution:** `khārijiyya` has realized subject existence, `ḥaqīqiyya` treats an individual supposition/estimation, and `dhihniyya` concerns mental existence. These are *not* all statements about the exact same extension in one actual-world set model. A modern finite-model checker must label its domain assumptions before drawing existential-import conclusions.

### L11, first two lines of modality treatment (Cairo p. 8)

| Earlier working Arabic labelled as Cairo | Actually in the Cairo print | Editorial consequence |
|---|---|---|
| `فتسمى معدولة وإلا فمحصلة` | **`فيسمى معدولاً`** | Cairo's expression is masculine; `وإلا فمحصلة` is an explanatory converse classification, not part of this Cairo sentence. |
| `وما به البيان جهة وإلا فمطلقة` | **`وما به البيان جهة`** | The standard `muṭlaqa` contrast can be explained, but not inserted as a printed `otherwise` clause. |
| `فإن كان الحكم فيها` | **`فإن كان الحكم في القضية`** | Preserve the full source noun. |
| `ما دام ذات الموضوع موجودة` | **`ما دام ذات الموضوع`** | `موجودة` is an explanatory gloss: semantic duration of subject existence may be explained in English, but the print does not contain the word. |
| `فمطلقة عامة، أو بعدم ضرورة خلافها فممكنة عامة` | **`فالمطلقة العامة، أو لعدم ضرورة خلافها فالممكنة العامة`** | Restore both definite articles and the `lām` in the expression denying necessity of the opposite. |
| `أو باللادوام الذاتي فتسمى الوجودية اللادائمة` | **`أو باللادوام الذاتي وتسمى الوجودية اللادائمة`** | Restore the source coordinating particle. |
| `باللاضرورة من الجانب الموافق أيضاً فتسمى الممكنة الخاصة` | **`بلا ضرورة الجانب الموافق أيضاً وتسمى الممكنة الخاصة`** | This sentence crosses the original Cairo p.8–9 seam. Do not invent `من`, and preserve `وتسمى`. |

The previously corrected wording **`العامتان والوقتيتان المطلقتان`** (Stage 77) stands, and the conjunction of the full two-page seam was checked for continuity. No change is made to the total editorial section count or the source numbering.

**The primary Arabic does not name `muḥaṣṣala` or introduce `muṭlaqa` with an `otherwise` in this particular passage.** Both may remain in a source-labelled commentary/explanatory note; they are not to be supplied as if written by the Cairo compositor. The English has been revised accordingly.

## II. Eight simple modal forms: category, condition, and modern schematic probe

This is a **translation-aid register** grounded in L11's Arabic wording. Mathematical formulas are **probes**, not authorized formalizations of Taftāzānī's historically specific systems.

Define `S(x,t)` as “the subject exists at time `t`”; `D(x,t)` as “the subject bears the relevant description then”; `P(x,t)` as “the positive predication applies then.” In a proposed modern interpretation `□` symbolizes necessity under a clearly specified modality. Its accessibility relation, especially between times and between subject descriptions, is **not** given in the matn and cannot be imposed silently.

| No. | Classical name | Express source condition | Schematic analytical question (not an edited source reading) |
|---|---|---|---|
| 1 | `ḍarūriyya muṭlaqa` / ضرورية مطلقة | ضرورة النسبة ما دام ذات الموضوع | Is predication necessary throughout the subject's own span, *as subject*? |
| 2 | `mashrūṭa ʿāmma` / مشروطة عامة | ضرورة ... ما دام وصفه | Is necessity tied to the subject's possessing its *description* rather than its existence without that description? |
| 3 | `waqtiyya muṭlaqa` / وقتية مطلقة | ضرورة ... في وقت معين | Is necessary predication asserted at a specified time? |
| 4 | `muntashira muṭlaqa` / منتشرة مطلقة | ضرورة ... في وقت غير معين | Is necessity asserted at an unspecified time, as distinct from necessity at all times? |
| 5 | `dāʾima muṭlaqa` / دائمة مطلقة | دوامها ما دام الذات | Does predication endure over the subject's existence without the stronger necessity claim? |
| 6 | `ʿurfiyya ʿāmma` / عرفية عامة | دوامها ما دام الوصف | Is permanence restricted to the interval of the predicative description? |
| 7 | `muṭlaqa ʿāmma` / مطلقة عامة | بفعليتها | Is the relation positively actual, without implying timelessness or intrinsic necessity? |
| 8 | `mumkina ʿāmma` / ممكنة عامة | لعدم ضرورة خلافها | Is the *contrary* not necessary? This is different from saying that the positive is already actual. |

**Counterexample to merging descriptions with subject-existence:** Suppose a person is a **writer** only during some years, but exists before and after. Necessity or permanence conditional on “being a writer” cannot be substituted into a claim lasting “as long as this person exists.” `∀t[D(x,t)→P(x,t)]` does not entail `∀t[S(x,t)→P(x,t)]` if the person exists without that description. Nor does temporal constancy `∀tP` by itself imply metaphysical necessity `□P`.

**Counterexample to merging actuality and possibility:** If a proposition is possibly true but not actual, then treating `mumkina ʿāmma` as `muṭlaqa ʿāmma` would be false. The exact traditional modal rule requires source and commentator-specific interpretation; this example merely guards against one obvious modern misreading.

## III. Seven compounded forms and the specific role of negative qualification

| Compound traditional name | Simple antecedent class | The qualifying expression preserved in Cairo |
|---|---|---|
| مشروطة خاصة / `mashrūṭa khāṣṣa` | mashrūṭa ʿāmma | قيد باللادوام الذاتي |
| عرفية خاصة / `ʿurfiyya khāṣṣa` | ʿurfiyya ʿāmma | قيد باللادوام الذاتي |
| وقتية [خاصة] / `waqtiyya` | waqtiyya muṭlaqa | قيد باللادوام الذاتي |
| منتشرة [خاصة] / `muntashira` | muntashira muṭlaqa | قيد باللادوام الذاتي |
| وجودية لاضرورية / `wujūdiyya lā-ḍarūriyya` | muṭlaqa ʿāmma | قيد باللاضرورة الذاتية |
| وجودية لادائمة / `wujūdiyya lā-dāʾima` | muṭlaqa ʿāmma | قيد باللادوام الذاتي |
| ممكنة خاصة / `mumkina khāṣṣa` | mumkin(a) ʿāmma | قيد **بلا ضرورة الجانب الموافق أيضاً** |

The **square-bracket gloss “khāṣṣa”** for the bare printed names `الوقتية` and `المنتشرة` is an editorial taxonomy clarifier, not a word silently inserted into Taftāzānī's Cairo Arabic. The source's `اللادوام` refers to a general-absolute proposition of **opposite quality** with the **same quantity**, while `اللاضرورة` refers to a general-possible proposition of **opposite quality** with the **same quantity**. This is how the text itself explains why the latter seven are *compound*, rather than simply differently named instances of necessity.

**Critical scope test:** A modal qualifier of `P` is not automatically the unrestricted truth-functional negation of `P`. The temporal scope (“as long as the subject exists” or “as long as it has the description”), quantified subject (“every” vs “some”), polarity, and modality must be fixed before negating. Where the compound includes both a positive base and a negative qualifying clause, its contradictory need not be described correctly by conjoining the negations of both components.

## IV. What is now done, and what is not

- **Corrected source:** L10 Cairo p.8 and L11 Cairo pp.8–9; preserves numbered editorial units `L.10` and `L.11`, and does not change the source location of either.
- **Corrected translation:** the L11 opening now marks `muḥaṣṣala` and the unqualified `muṭlaqa` as explanatory technical terms not explicitly named at that location of the Cairo print.
- **Regression:** GitHub CI now tests source existence wording, exact source passive/active forms, absence of editorial `وإلا` interpolations, full necessity structure, p.8–9 seam, the already verified `الوقتيتان المطلقتان`, and source modal negative qualifications.
- **Still open:** a manuscript-by-manuscript textual apparatus; formal truth/validity analysis of the *historical* modal conversions and syllogisms, especially L14–L16; source comparison of all remaining individual technical clauses.
- **Status counts unchanged:** 19 logic divisions, eight controlled **printed** differences (Stage 85's repairs are corrections against the same Cairo print, *not* new comparator witnesses); Kalām 1,044 clauses, 110/113 Cairo pages single-print checked, three cruxes at 77, 100 and 124.

### Next research sequence

The responsible next operations are (a) collating L14's modal simple-conversion list (Cairo p.10) with the same named modes in L11, (b) reading L15's two formulations of contraposition (p.11) without collapsing them, (c) validating every L16/17 inferential rule under explicitly scoped subject existence and time/description conditions, and (d) acquiring a folio-precise independent *Tahdhīb* witness for any claims that cannot be resolved from Cairo.

**Editorial safety rule:** a mathematical countermodel is a **test of a chosen formal interpretation**; it does not certify a source reading or prove that a medieval author used a specific possible-worlds semantics.
