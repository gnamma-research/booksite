# Tahdhīb Stage 94 — The witness must remain the same individual across a compound proposition

**Date:** 2 November 2026. **Work:** al-Taftāzānī, *Tahdhīb al-Manṭiq*, editorial divisions L13–L16. **Scope:** a formally explicit and source-linked **quantifier/witness test**, not an emendation to Cairo Arabic, a proof of every modal form, or manuscript collation.

## 1. The precise semantic problem

L13, Cairo original pp.9–10, ends its compressed rule for contradictories of compound modalities with the qualification:

> لكن في الجزئية بالنسبة إلى كل فرد

The exact clause requires commentary-based exegesis; it is not safe to replace it with modern unrestricted De Morgan laws. It at least warns the translator that **particularity, individual subjects and modal components interact**.

In the proof of special conversion, al-Yazdī, *Ḥāshiya ʿalā Tahdhīb*, [printed p.83](https://ablibrary.net/book_content/b/12170/83?lang=ar) and [p.84](https://ablibrary.net/book_content/b/12170/84?lang=ar), repeatedly fixes a single actual individual `d` by *iftirāḍ*. It is this same `d` that bears the original subject title, gains or lacks the predicate at another time by `lā-dawām`, and is then reclassified under the conversely predicated title.

Tony Street's critical edition of al-Kātibī's *Shamsiyyah* (2024), Appendix 2 pp.343–344, describes the special-conventional particular forms as cases in which **some of those very subjects** undergo the nonpermanent temporal contrast. This is independent explanation of the same quantifier discipline, not a textual witness to Taftāzānī's Cairo copy.

## 2. Do not split the existential witness

For predicates `A(x)`, `B(x)`, the propositions are not equivalent:

`∃x[A(x) ∧ B(x)]` versus `(∃x A(x)) ∧ (∃y B(y))`.

The first binds the two clauses to **one and the same individual**. The second permits two entirely different people.

For the special negative, the **strong source-facing temporal shadow** is:

`∃x{[∃t S(x,t)] ∧ [∀t(S(x,t)→¬P(x,t))] ∧ [∃t(E(x,t)∧P(x,t))]}`.

Here the nonpermanence claim has **not** escaped the scope of `∃x`: the individual for whom P later obtains is the subject already used in the first two clauses.

The **wrong weakening** is:

`{∃x[(∃t S(x,t)) ∧ ∀t(S(x,t)→¬P(x,t))]} ∧ {∃y∃t P(y,t)}`.

**Counterexample:** Individual A bears S but never P; Individual B bears P but never S. Both weak clauses are true. But **no one individual** bears S at one occasion and P at another. The special converse that requires both subject instantiations for the same person cannot follow.

The positive-special case has the corresponding problem. It is insufficient for one person to be S and P throughout their S-period while a different person has a non-P occasion. The source's `lā-dawām` clause must be bound to the original individual used for the positive particular.

## 3. Exhaustive two-individual / two-time test

The deterministic [Stage94 verifier](../../../../tools/tahdhib/verify_special_modal_witness_scope.py) uses:

- **Two independent individuals** `a`, `b`;
- **Two time instants** per individual;
- Five states for each person-time: absent or existent with one of the four combinations of S/P;
- `5^(2×2) = 625` fully enumerated interpretations.

| Source reading in this bounded model | Valid with one bound witness? | Counterexamples when nonpermanence may be witnessed by a different individual |
|---|---:|---:|
| Special negative → special negative simple converse | Yes, none of 625 models fail when the same person satisfies all clauses | **140** |
| Special affirmative → special negative contrapositive | Yes, none of 625 models fail when the same person satisfies all clauses | **140** |

Each of the 140 counterexamples is a complete **model of the weaker split-scope antecedent** in which the corresponding conclusion fails. The JSON report provides counterexample assignments, including the particularly simple case where one person is S-only and the other is P-only.

**Do not overread this:** the program tests the existential *binding* and temporal persistence features that the commentary requires. It does not certify an accessibility relation for `ḍarūrah`, prove an origin-specific definition of `mashrūṭa` versus `ʿurfiyya`, or fix the subject-possibility semantics of `ḥaqīqiyya`.

## 4. Translation and edition implications

- When translating a *particular compound modal*, maintain pronoun/subject continuity so the reader can tell that the negative and nonpermanent components concern the **same relevant individual(s)**. Avoid English that accidentally turns one compound proposition into two unrelated existentials.
- L13's `لكن في الجزئية بالنسبة إلى كل فرد` should be treated as a **source-located warning about individual qualification**; exact traditional semantics remain to be resolved from al-Yazdī and the Shamsiyya commentators. The above modern quantifier analysis is explanatory only.
- In L14–L15, the actual `d` supplied by `iftirāḍ` remains fixed through both steps of each special conversion. Replacing it with an existentially different witness would break the intended proof.
- For L16's fourth figure, a *special negative* cannot be licensed simply because some positive and some negative extension exist somewhere in the whole domain. The modal conditions have to apply to the **same individual** used to produce the conclusion, under its relevant descriptions.

## 5. Work completed and remaining

**Executable evidence:** `tools/tahdhib/verify_special_modal_witness_scope.py` reports 625 models, valid same-witness forms, and 140 countermodels under either witness-splitting relaxation. Integrated into the same CI that runs the Stage93 125/729-time-profile checker and the older nonmodal proof scripts.

**Authorial Arabic:** unchanged. No new print/manuscript variants claimed.  
**Logic:** 19 editorial divisions and ten printed comparisons.  
**Kalām:** 1,044 bilingual clauses; **110/113** Cairo single-print pages, outstanding pp. **77, 100, 124**.  
**Independent commentary stream:** Sanandajī–Wasīm remains a separate critical-edition task; this stage cites al-Yazdī and al-Kātibī to explain the authorial Tahdhīb logic without retranslating the Sanandajī–Wasīm corpus.

### Next source gate

Prepare a **typed modal rule ledger** based on the six proposition classes *whose negative forms convert*, as distinguished in Quṭb al-Dīn al-Rāzī's *Taḥrīr al-Qawāʿid* and Street's Shamsiyya edition. Distinguish: (1) classes of propositions, (2) actual quality/quantity of a given premise, (3) the two *special* forms allowing particular negative conversion, and (4) what conclusion modality each licensed reduction really yields. Only then attempt a full historical semantics for fourth-figure moods 6–8.
