# Tahdhīb — Stage 96: fourth-figure mood 8, properly quantified

**Date:** 2 November 2026. **Corpus:** al-Taftāzānī, *Tahdhīb al-Manṭiq*, Cairo 1330/1912, L11/L13–L16, original pp. 9–12. **Scope:** proof *within a clearly limited temporal shadow* of the post-Avicennan special negative, **not** a full verification of the historical necessity/possibility operators. No new Taftāzānī manuscript was collated and no Cairo text was amended. The separate Sanandajī–Wasīm project is unaffected.

## 1. Historical grounding and one important correction

The 2019 edition of *Sharḥ al-Mawāḍiʿ al-Mushkila*, p.89, sixth condition reads:

> كون الصغرى في الثامن من إحدى الخاصتين والكبرى من المنعكسة السوالب

Near translation: **In the eighth [fourth-figure mood], the minor is one of the two special [negative modal kinds], and the major is of a class whose negatives convert.** The two special classes are *mashrūṭa khāṣṣa* (LD2) and *ʿurfiyya khāṣṣa* (AD2). The six classes of the affirmative major, understood by their *convertible universal negatives*, are L, A, LD1, AD1, LD2, AD2 (Stage95 register). The major is AFFIRMATIVE; the technical label does not change its present polarity. This earlier commentary is probably by al-Kātibī; its attribution is not certain, and the source is **not** a manuscript of the later Taftāzānī *Tahdhīb*.

Al-Kātibī, *Shamsiyyah* §§103–104 (Tony Street's 2024 critical edition, original English text p.69, editorial explanation pp.252–254), explicitly describes the eighth mood as first **reversing the order** to derive a negative particular in figure I, then **converting the derived conclusion**, not the premises directly. His technical explanation (Street, p.252) makes the intermediate a *special* negative and assigns two separate modal roles to the premises: the original negative minor becomes the first-figure **major**, and the original affirmative particular major becomes the first-figure **minor**.

**Stage93's weak mode8 experiment was not an interpretation of these fully typed premises:** it used a single particular `Nsp(M,S;d)` for the negative minor and an instantaneous `∃t(P∧M)` for the affirmative major; hence its **30 countermodels among 66** are countermodels only to that deliberately weakened conjunction. The proper eighth-mood E negative is **universal over M subjects**, and the particular affirmative from the six descriptionally reliable types retains a relationship **throughout the witness's P-period**. These two repairs are logically independent.

## 2. Quantifiers and time scope (new Stage96 temporal *shadow*)

Use figure IV in the order: **major** I(P,M), **minor** E(M,S), **target** O(S,P). Let persons be `d∈D` and finite lived times `t∈T`; S/M/P imply existence, and complements are restricted to a person's existence. Distinct persons must never share the nonpermanence witness inadvertently.

For a given person d, write:

- `Nsp(X,Y;d)` iff (i) `∃t X(d,t)`; (ii) `∀t(X(d,t) ⇒ ¬Y(d,t))`; and (iii) `∃u Y(d,u)` during d's life. This is the temporal **consequence** of a special negative for one individual, not a sufficient condition for necessity.
- **Minor** `E_sp(M,S)` iff `∀d(∃t M(d,t) ⇒ Nsp(M,S;d))`. Universal quantity is essential; its special *lā-dawām* clause applies per actual M-subject, supplying a lived S-occasion for the same person.
- **Major** `I_desc(P,M)` iff `∃d [(∃t P(d,t)) ∧ ∀t(P(d,t) ⇒ M(d,t))]`. The I is PARTICULAR in quantity. Its P-witness is M throughout that witness's period of bearing P. This consequence is common to the six major classes; it does not assert that *every* P-subject is M, nor does it model possibility or necessity.
- **Target** `O_sp(S,P)` iff `∃d Nsp(S,P;d)`.

The actual medieval *LD2* entails necessary negative predication while the subject title holds, whereas *AD2* requires perpetual negative predication while it holds; they are **not identical**. The present shadow omits this distinction deliberately and only tests the shared temporal consequence. Historical *simple conversion* maps their **particular negative** forms to **particular AD2**; the final historical modality needs this conversion rule *and* the typed first-figure result, rather than merely `O(S,P)` in Boolean logic.

## 3. Source-aligned formal derivation

1. From **major** I_desc(P,M), take its single P-witness d: P holds for d at some `t₀`, and whenever d is P it is also M. Hence M(d,t₀).
2. Apply the **universal** E_sp(M,S) minor to that same d. It entails ¬S at **every** d-M occasion, and provides an actual d-S occasion `t₁` elsewhere in d's lifetime (the *lā-dawām* side). Since M and S exclude each other, `t₁` cannot be one of d's M occasions.
3. By `P(d,t) ⇒ M(d,t) ⇒ ¬S(d,t)`, every d-P occasion excludes S. Thus d realizes **Nsp(P,S;d)**: its P-title is actual, it excludes S while P, but S occurs at t₁. This is the needed intermediate *special negative particular* **O_sp(P,S)** obtained by the first-figure reduction.
4. By the special particular-negative conversion licensed in Tahdhīb L14–L15 and explained through *iftirāḍ* in al-Yazdī pp.83–84, convert O_sp(P,S) to **O_sp(S,P)**: d is S at t₁; there is no P wherever d is S (otherwise P would entail M and conflict with the negative minor); and d is P at t₀, supplying *lā-dawām* for the **converted** negative. Crucially all conditions refer to the SAME d.
5. At the historic source-typing level this conversion's output is an **AD2 particular negative** (*ʿurfiyya khāṣṣa*), whereas the present proof certifies only its weaker, non-modal temporal shadow.

The proof uses **universal quantity in the E minor**, **particular quantity in the I major**, **description-period predication**, **same-individual nonpermanence**, and the **special-negative conversion**. It does not need a falsely universal major nor a logically illicit conversion of arbitrary negative particulars.

## 4. Exhaustive finite check and ablations

New script `tools/tahdhib/verify_fourth_figure_mode8_temporal_shadow.py` enumerates **9^4 = 6,561** histories: two persons, two times each, and nine time-states (absent, or existent with independent S/M/P memberships). It directly checks the above quantified forms, both the intermediate and the conclusion, and three weaker forms.

| Premises checked | Profiles satisfying premises | Profiles violating the special conclusion |
|---|---:|---:|
| Correct `E_sp(M,S) ∧ I_desc(P,M)` | **128** | **0** |
| Replace descriptionally persistent I-major by a bare simultaneous `∃(P∧M)` | 248 | **112** |
| Drop the universal negative's person-bound *lā-dawām* clause | 801 | **581** |
| Replace universal E_sp minor by a particular Nsp(M,S) on possibly another person | 584 | **240** |

The counterexamples here are **finite temporal models** showing necessity of the modeled restrictions; they do not refute the original medieval modal conditions. The existing Stage93 results for a different weaker one-person premise specification remain valid and should not be erased or relabelled.

**Explicit first countermodel for bare I-major:** person d is P∧M∧¬S at time 0 and P∧S∧¬M at time 1. The negative special minor for M is true, and bare I(P,M) is true at time 0. But d is never S∧¬P, so the proposed conclusion fails. The descriptionally **persistent** major is false because d remains P while ceasing to be M.

**Explicit first countermodel for merely particular minor:** one person supplies a P∧M witness, but another person supplies the requisite negative-special M/S history. Since the negative special is not universal, it cannot be applied to the P-witness. The conclusion fails. Universal E is therefore doing substantive work beyond existence.

## 5. Historical research still open (do not mark certified)

1. **Necessity and possibility:** re-run the reasoning with `mashrūṭa` as *necessity as long as P or M* and `ʿurfiyya` as *perpetuity as long as P or M*, including possible/mental/external actualized subjects and existential scope of `lā-dawām`. The current valid temporal theorem is a *necessary shadow* of a richer proof, not its complete semantics.
2. **Twelve exact modal mixes:** Street (§104, commentary p.253) counts **2 × 6 = 12** eligible eighth-mood mixes. Map each individual mix to its **first-figure typed intermediate**, then apply the special particular conversion; do not use simple truth-functional O as a proxy for its final modal species.
3. **Source reading:** compare the relevant *Shamsiyyah* apparatus, Street's textual variants, the 2019 Arabic critical text at p.89 (including footnote 392), and Taftāzānī's independent *Sharḥ al-Shamsiyyah*. None of these by themselves certify a new reading of Taftāzānī's Cairo *Tahdhīb*.
4. **Unchanged kalām:** 1,044 bilingual clauses; **110/113** Cairo printed pages checked; **pp.77, 100, 124** remain uncertified. No completion status or manuscript witness has changed.

## 6. Exact references and textual-family boundaries

- Original Taftāzānī Cairo 1330/1912 logic L11/L13–L16, pp. 9–12: canonical NAMA data.js; Stage85–95 dossiers preserve the exact source Arabic and the separately documented printed variants.
- Al-Kātibī, *al-Risālah al-Shamsiyyah*, §§97, 103–104; Tony Street, ed., trans. and comm., *Najm al-Dīn al-Kātibī's al-Risālah al-Shamsiyyah* (NYU Press 2024), original English p.69; commentary pp.238, 252–254; Appendix 2 pp.333–335. https://dhjhkxawhe8q4.cloudfront.net/library-of-arabic-literature-wp/assets/20240530034338/9781479827510_WEB-1.pdf
- Ferruh Özpilavcı and Abdullah Öztop, eds., *Sharḥ al-Mawāḍiʿ al-Mushkila*, *Tahkik* 2/2 (2019), edited Arabic p.89, sixth condition and footnote 392. https://isamveri.org/pdfdrg/D04349/2019_2/2019_2_OZPILAVCIF_OZTOPA.pdf
- Al-Yazdī-associated *Ḥāshiya ʿalā Tahdhīb al-Manṭiq*, pp.83–84, individual-assumption proof of special-negative conversion: https://ablibrary.net/book_content/b/12170/83?lang=ar and https://ablibrary.net/book_content/b/12170/84?lang=ar. Commentary witness, not Taftāzānī manuscript variant.

**Editorial decision:** retain existing Taftāzānī Arabic, translations, counts, and stage-specific issue registers. Append this as Stage96 a narrowly proved *temporal* improvement on the eighth mood. Do not turn a valid temporal reduct into a claim that all twelve fully historical modal syllogisms have been certified.