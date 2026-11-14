# Tahdhīb Stage 93 — Two special modal conversions, with explicit witness and lifetime scope

**Date:** 2 November 2026. **Project:** Taftāzānī, *Tahdhīb al-Manṭiq*, Cairo 1330/1912, editorial divisions **L11 and L14–L16**. This is a **source-facing interpretation and bounded formal reconstruction**, not manuscript collation, not a new Cairo reading, and not a full model of medieval modal necessity.

## 1. Primary-text and commentary controls

**Taftāzānī's Cairo base:** L11 distinguishes *mashrūṭa khāṣṣa* and *ʿurfiyya khāṣṣa* through an added **lā-dawām dhātī** condition (the denial that the predicate's relation remains true during the subject's entire life). L14 gives the ordinary restriction on simple conversion of particular negatives; L15 singles out the **two special forms** as an exceptional particular conversion requiring further proof. The Arabic of L11, L14 and L15 is retained as established in Stages 85–86; **no commentary phrase is inserted into the Cairo matn**.

**Commentary witnesses, not Tahdhīb manuscript variants:**

- al-Yazdī, *Ḥāshiya ʿalā Tahdhīb al-Manṭiq*, [p.83](https://ablibrary.net/book_content/b/12170/83?lang=ar): demonstrates **particular special negative → special conventional negative by simple conversion** using an assumed individual `d`. The negative is sustained as long as the witness is described as J; the added non-permanence gives a time when that very witness is B.
- The same commentary, [pp.83–84](https://ablibrary.net/book_content/b/12170/84?lang=ar), demonstrates **particular special affirmative → negative special conventional by contraposition**, with subject not-B and negative predicate J. Here the added non-permanence supplies an occasion when the same witness is **not B**.
- al-Kātibī, *al-Risālah al-Shamsiyyah*, §§76.2, 83.4 and 84.1, as critically edited by Tony Street (2024), pp.47–54, independently presents related modal conversion rules: [complete bilingual source](https://dhjhkxawhe8q4.cloudfront.net/library-of-arabic-literature-wp/assets/20240530034338/9781479827510_WEB-1.pdf). Street's **Appendix 2, pp.343–344**, identifies the *ʿurfiyya lā-dāʾima li-l-baʿḍ* (AD2) negative as including both (i) negation throughout the period that the subject title holds and (ii) a positive occurrence for that same subject during its life.
- The modal restrictions themselves are historically nontrivial: the near-contemporary 691 AH manuscript-based commentary edited by Özpilavcı–Öztop (2019), p.89, has **six** conditions for fourth-figure productivity, including both the special negative premise and a condition on the opposite form of the major: [2019 edition](https://isamveri.org/pdfdrg/D04349/2019_2/2019_2_OZPILAVCIF_OZTOPA.pdf).

**Source caution:** This is an explanation of the *logic* of an exceptional conversion. A later printed commentary or a modern edition is not an independently witnessed variant of Taftāzānī's Cairo Arabic. Nor does agreement among these sources prove a literal author-to-author borrowing relationship.

## 2. A finite-time model with one explicitly bound witness

Let `d` be one individual with three times `t=0,1,2`. Let:

- `E(d,t)` = the individual exists at time t.
- `S(d,t)` = d bears the **subject description** S at t.
- `P(d,t)` = d bears the **predicate description** P at t.
- `not-P(d,t)` = **E(d,t) AND NOT P(d,t)**. The term-complement is explicitly **relative to existence**: times before d exists do not count as a non-P subject.
- `S` and `P` imply existence at their respective times.

The finite checker enumerates **5 choices per time** (absent; or existent with each of four S/P combinations), hence **5³ = 125** complete life histories.

This models *temporal persistence while the description is borne*. It does **not** interpret the medieval necessity operator, metaphysical accessibility, a necessary predicate at all possible worlds, or the difference between *ʿurfiyya* and *mashrūṭa* in every context. In particular, “necessary while S” is **stronger** than the simple throughout-the-life-time implication used below, so the model only tests a *weaker common temporal consequence* of the two forms.

## 3. Proof I — special negative by simple conversion

**Commentary proof anchor** (al-Yazdī p.83): an assumed d is J in actuality and B in actuality at a distinct occasion, because of `lā-dawām`. While d is J, it is not B. Therefore, while it is B, it is not J, and the two actual occurrences make the negative converse **nonpermanent** in the proper sense.

For the **same individual** d, define a negative particular *special temporal shadow* `Nsp(S,P;d)` by:

1. `∃t S(d,t)` — the subject title is actually instantiated.
2. `∀t[S(d,t) ⇒ ¬P(d,t)]` — P is absent throughout d's S-period.
3. `∃t[E(d,t) ∧ P(d,t)]` — during d's life P occurs at some time. This is the relevant *positive occurrence supplied by non-permanence* of the negative judgment.

Then, for the **same d**, `Nsp(S,P;d) ⇒ Nsp(P,S;d)`.

**Formal proof:** (i) Existence of P as the new subject follows from premise (3). (ii) If P and S held simultaneously, premise (2) would fail, so throughout the new P-period not-S holds. (iii) Original S actualization from premise (1) supplies the converse's essential non-permanence: S does obtain at some time during d's life. The converse inherits all three clauses.

Importantly, a mere `O(S,P)`—“some S is not P”—does **not** provide premise (3). This is why one cannot apply the conversion to an ordinary negative particular.

## 4. Proof II — special affirmative by conversion of the contradicted terms

Al-Yazdī pp.83–84 assumes d among the J subjects, with B when d is J, but (through `lā-dawām`) an occasion on which the same d is **not B**. It then derives that no non-B occasion can also be J, since that would contradict the first predication. The resulting negative proposition has **non-B** as its subject and **J** as its predicate.

Define the special affirmative temporal shadow `Asp(S,P;d)` by:

1. `∃t S(d,t)` — actual subject.
2. `∀t[S(d,t) ⇒ P(d,t)]` — P throughout the time d bears S.
3. `∃t[E(d,t) ∧ ¬P(d,t)]` — d has a lived *non-P* occasion, supplied by nonpermanence.

**Result:** `Asp(S,P;d) ⇒ Nsp(non-P,S;d)`, where the new title `non-P` holds only at lived times that P does not.

**Formal proof:** Condition (3) supplies the new *non-P subject* at a time. From (2), any occasion on which d is non-P cannot be S, hence the required negative predicate. Condition (1) supplies an S occasion and therefore the converse's *non-permanence* relative to d. No special theorem about all negative particulars was used.

The traditional *necessary* variant may entail these temporal commitments, but one cannot promote this proof to necessary/possible-world modal validity **without** determining its conditions from a specific historical commentary.

## 5. Fully enumerated proof checks and countermodels

The script [`verify_special_modal_temporal_shadow.py`](../../../../tools/tahdhib/verify_special_modal_temporal_shadow.py) checks every one of the **125** life histories:

| Tested form | Life histories satisfying all three premisses | Cases where proposed converse fails |
|---|---:|---:|
| Special negative → simple negative converse | 18 | **0** |
| Special affirmative → negative contrapositive | 18 | **0** |

It then **deletes one premise at a time** while keeping the other two, and searches for counterexamples:

| Removed condition | Failing histories for negative conversion | Failing histories for affirmative contraposition |
|---|---:|---:|
| Original title S actually instantiated | 19 | 19 |
| Relation holds throughout the S-period | 61 | 61 |
| Correct nonpermanence occurrence | 19 | 19 |

Thus this model requires all three, not just the existence of any object or a generic assertion of possible truth. Its JSON report includes a fully specified first countermodel for each omission; a green test only certifies this explicit finite **model**, not the medieval logic.

## 6. Application to fourth-figure modes 6–8, with the same bounded scope

To avoid accidental confusion with modal necessity, the script additionally enumerates **729 one-witness, three-time profiles** for the three terms S/M/P (9 states per time: individual absent or present with any of 8 term combinations).

**Mode 6** (special negative minor, affirmative major): Suppose `Nsp(M,S;d)` and `∀t(P⇒M)`. The negative special premise produces a time where **S but not M**, and the major then entails **not P** then. Thus a particular negative `O(S,P)` holds in the restricted temporal shadow. The exhaustive model has **42** antecedent profiles and **0** counterexamples.

**Mode 7** (special negative major, affirmative minor): Suppose `Nsp(P,M;d)` and `∀t(M⇒S)`. The special negative major produces a time with **M but not P**; the affirmative minor establishes S there. Hence particular `O(S,P)`. **54** antecedent profiles and **0** counterexamples.

**Mode 8 remains underconstrained:** Suppose merely `Nsp(M,S;d)` and `∃t(P∧M)`. It does **not** follow that there exists a time when S is not P, since P can also hold throughout the S-period. Of **66** antecedent profiles, **30** are counterexamples. The third moment of a simple countermodel has S=P while M is absent. The *separate condition on the major's modal class* in the six-rule Kātibī commentary is therefore not dispensable.

As a control, replace the mode-6 **special** negative by an ordinary instantaneous `O(M,S)`, leaving the same universal affirmative major. The checker then finds **98** counterexamples. The positive occurrence of S that `lā-dawām` supplies is doing actual inferential work.

**Crucial limitation:** These results concern one shared individual through three times and permanent-as-long-as-title **shadows**. They are not a complete many-individual quantified model, do not establish the exact *mashrūṭa/ʿurfiyya* modalities inherited by the conclusions, and do not establish which member of the **six convertible-negative classes** each major belongs to. A full historical logic proof still requires the traditional modal operator, subject-description qualification, and modal conclusion typing.

## 7. Change ledger / status

- **Created** a deterministic Python test and reproducible JSON report for both special conversions, six assumption-ablation classes, and modes 6–8 in time-varying subject extensions.
- **CI:** the Tahdhīb logic workflow runs the program and retains its result alongside the 512-set categorical, 64-pair contraposition, and eight-fourth-figure reports.
- **Primary Arabic:** **unchanged**. The exact Cairo L11/L14/L15/L16 transcriptions established earlier are preserved.
- **Commentary apparatus:** pending source-labelled notes for the actual temporal proof, without replacing Taftāzānī's text.
- **Certification counts:** logic 19 bilingual editorial divisions and **ten printed-text comparisons**; Kalām **1,044 bilingual clauses** and **110/113 Cairo printed pages**, with page cruces **77, 100, 124**. No manuscript certificate is added.

**Next formal obligation:** bind the existential witness across all pieces of a compound proposition when quantifying over many individuals. This directly intersects L13's warning `لكن في الجزئية بالنسبة إلى كل فرد`: a positive occurrence for a *different individual* is not generally sufficient to supply nonpermanence for the originally assumed witness. The next test must disambiguate same-individual from cross-individual scope before attempting a full multi-person modal semantics.
