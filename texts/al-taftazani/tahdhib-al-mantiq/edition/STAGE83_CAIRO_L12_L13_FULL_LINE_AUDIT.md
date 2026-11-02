# Stage 83 — Cairo pp. 9–10 exact print checks (L12 and L13)

**Date:** 2 November 2026. **Scope:** Saʿd al-Dīn al-Taftāzānī, *Tahdhīb al-Manṭiq*, Cairo, Maṭbaʿat al-Saʿāda, 1330/1912, **original printed pages 9–10**.  
**Evidence:** direct enlarged photographs from the 128-page original-source scan (project Library: `At-taftazaniSadAd-din1912_text.pdf`). The previously recorded L12 comparisons with the separate matn embedded in *Sharḥ al-Tahdhīb* remain **printed-family differences**, not established manuscript variants. No 2017 critical-edition or manuscript readings are claimed.

## A. L12, categorical and conditional proposition division (Cairo p. 9)

### Exact newly corrected source expressions

| Locus | Previous Cairo-labelled working transcription | The wording visible in Cairo p. 9 | Significance |
|---|---|---|---|
| Disjunctive's objects | `بتنافي النسبتين` | **`بتنافي نسبتين`** | Printed indefiniteness matters for a **diplomatic transcription**, though it need not change the English truth-functional classification. |
| Joint truth/falsity | `صدقاً وكذباً معاً` | **`صدقاً وكذباً`** | `معاً` was an **editorial explicative insertion**, not a Cairo word. Translate “in truth and falsity together” if justified by context, but do not add `معاً` to the source. |
| Antecedent suppositions | `على جميع تقادير المقدم` | **`على جميع التقادير للمقدم`** | The definite `التقادير` and separate `لـ` are preserved. |
| Particular quantification | `أو بعضها مطلقاً فجزئية` | **`أو لبعضها مطلقاً جزئية`** | Preserve the construction and its unprefixed `جزئية`, not an editor's smoothing. |

These supplement **Stage 82's three confirmed printed differences**: Cairo `لعلاقة / وكل منها عنادية / لذات الجزأين`, versus the commentary-contained print `بعلاقة / وكل منهما عنادية / لذاتي الجزئين`. Thus L12's Cairo base now incorporates **seven individually localized line-level repairs** across Stages 82–83. This does not imply that the text has been collated against a separate manuscript.

**Restored central portion, Cairo p. 9 (editorial punctuation):**

> ومنفصلة إن حكم فيها بتنافي نسبتين أو لا تنافيهما صدقاً وكذباً وهي الحقيقية، أو صدقاً فقط فمانعة الجمع، أو كذباً فقط فمانعة الخلو. وكل منها عنادية إن كان التنافي لذات الجزأين وإلا فاتفاقية. ثم الحكم في الشرطية إن كان على جميع التقادير للمقدم فكلية، أو لبعضها مطلقاً جزئية، أو معيناً فشخصية، وإلا فمهملة.

The printed word `منها` looks back across **the three kinds of disjunction**. The intrinsic/coincidental criterion is therefore a further discrimination, not a fourth mutually exclusive disjunction-kind.

### Truth conditions: separate explanatory skeleton

For `P`, `Q` propositions, the model's **modern** truth-conditional rendering is:

- `ḥaqīqiyya`: `P XOR Q` (neither joint truth nor joint falsity).
- `māniʿat al-jamʿ`: `¬(P∧Q)` (joint truth forbidden, joint falsity permitted).
- `māniʿat al-khulū`: `P∨Q` (joint falsity forbidden, joint truth permitted).

**This does not establish the older distinction of intrinsic `ʿinādiyya` and coincidental `ittifāqiyya`**, which refers to the ground of the incompatibility, not merely to the truth values of a given case. Historical modality/time/subject supposition cannot be inferred solely from a four-row Boolean table.

## B. L13, the governing preposition in modal contradiction (Cairo p. 10)

The working data previously smoothed away the `lām` introducing several modal classes, leaving an ambiguous grammatical string.

**Source directly checked, Cairo p. 10:**

> والنقيض للضرورية الممكنة العامة، وللدائمة المطلقة العامة، وللمشروطة العامة الحينية الممكنة، وللعرفية العامة الحينية المطلقة، وللمركب المفهوم المردد بين نقيضي الجزأين، لكن في الجزئية بالنسبة إلى كل فرد.

The `lām` indicates the **proposition being contradicted**: “the contradictory **of** the necessary is the generally possible [of the contrary quality]”; and so forth. Retaining it is not a cosmetic choice, because a purely nominal list risks concealing the direction and scope of each operation. Conversely, the `lām` does **not** license treating medieval `ḍarūriyya`, `ḥīniyya` and `ʿurfiyya` as simple modern alethic operators.

The same Cairo pp. 9–10 reading from Stage 78 still applies: `التناقض اختلاف قضيتين` and `في الكيف والكم والجهة`, distinct from the other printed matn's definite `القضيتين` and inverted `كم/كيف` order. No invented additional L13 manuscript variant is claimed.

### Quantified compound contradiction

The statement about the negation of compound modalities is not adequately translated by saying that both parts must independently be false. In a modern schematic, an illustrative valid equivalence is

`¬∀x(A(x) ∧ B(x))  ⇔  ∃x(¬A(x) ∨ ¬B(x))`.

It is **not** generally equivalent to

`(∃x¬A(x)) ∧ (∃x¬B(x))`.

This formal fact just illustrates the need for a carefully scoped analysis of the text's `المفهوم المردد بين نقيضي الجزأين`, and of its qualification `لكن في الجزئية بالنسبة إلى كل فرد`. It is **not** presented as a historical proof of all Taftāzānī's traditional modal opposition rules.

## C. Integration and status

1. Corrected Arabic-only *source fields* `L.12` and `L.13` in the canonical bilingual data file. Existing stable IDs, source page spans and English draft remain intact; the new editorial notes explain which word is reconstructed versus printed.
2. Added assertions to CI for `نسبتين`, absence of editorial `معاً`, `التقادير للمقدم`, `أو لبعضها ... جزئية`, and the repeated `lām` of L13.
3. The existing GitHub action automatically regenerates the **three logic PDF formats** from precisely this source revision, alongside its standard six-edition reproducibility manifest. PDF publication is not considered complete until workflow success and checksums are confirmed.
4. Logic remains **19/19 bilingual divisions**; **8 printed comparisons** (not eight manuscript variants); medieval L11–L17 modal interpretation is an open research obligation.
5. Kalām remains **110/113 Cairo printed pages** and 1,044 bilingual records, with pp. 77, 100, 124 unresolved for independent witness review. See the separate Stage 84 commentary/source-distinction dossier.

**Do not confuse:** a textually verified *print reading*; a hypothetical authorial archetype; a later commentator's quotation; an English explicative phrase; or a modern mathematical reconstruction. Each is a separate editorial layer.
