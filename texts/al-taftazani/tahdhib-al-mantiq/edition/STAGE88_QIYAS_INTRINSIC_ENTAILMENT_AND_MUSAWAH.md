# Tahdhīb Stage 88 — What “follows of itself” means in L16: source, premise, and logical form

**Date:** 2 November 2026.  
**Matn:** al-Taftāzānī, *Tahdhīb al-Manṭiq*, division **L16**, Cairo 1330/1912, original pp. **11–12**.  
**Explanatory source, separately identified:** al-Yazdī, *Ḥāshiya ʿalā Tahdhīb al-Manṭiq*, [printed p. 86](https://ablibrary.net/book_content/b/12170/86?lang=ar) and [p. 87](https://ablibrary.net/book_content/b/12170/87?lang=ar). Its printed matn, marginal glosses, and commentary-specific objections are **not substituted** for the Cairo-controlled author's Arabic.

**Scope of this stage:** reconstruct the function of **`يلزم لذاته`**, the distinction of a conclusion's matter and form, and the hidden-premise counterexample. This is an interpretative argument audit; it **does not** upgrade modal syllogistic rules or any manuscript collation.

## 1. Controlling authorial text

Cairo p. 11 opens the chapter:

> القياس قول مؤلف من قضايا يلزم لذاته قول آخر، فإن كان مذكوراً فيه بمادته وهيئته فاستثنائي وإلا فاقتراني حملي أو شرطي.

Provisional close English:

> A syllogism is a discourse composed of propositions such that another proposition follows of itself from their composition. If that other proposition is stated within [the syllogism] in both its material terms and its form, the syllogism is exceptive (*istisnāʾī*); otherwise, it is conjunctive (*iqtirānī*), categorical or conditional.

The source's `لذاته` does **not** mean that reasoning is a sheer psychologically automatic perception, nor that the premises require no semantic interpretation. It excludes a purported inference that needs an **additional, external premise** beyond the premises as deployed in the argument form being discussed.

## 2. What al-Yazdī says on pp. 86–87

His commentary distinguishes the functions of three phrases.

- **`قول مؤلف من قضايا`:** an articulated complex of propositions; the note considers whether mere composition (`tarkīb`) suffices and why `taʾlīf` suggests relevant combination rather than arbitrary juxtaposition.
- **`يلزم لذاته`:** unlike induction or analogy, the conclusion must follow from the relevant arrangement; importantly, the phrase excludes `qiyās al-musāwāh` when its inferential force depends on an omitted relational principle.
- **`بمادته وهيئته`:** the *matter* of a conclusion concerns the subject and predicate that enter it; its *form* concerns how they are ordered and whether affirmed or denied. The commentator notes the possibility of a conclusion appearing as a negated counterpart rather than in the same surface wording.

His example of the excluded case is:

> ألف مساوٍ لب، وب مساوٍ لج، [فـ]ألف مساوٍ لج.

The extra rule is:

> مساوي المساوي مساوٍ.

Al-Yazdī explicitly says that once this rule is supplied, the inference can be reorganized as syllogistic reasoning; **without** it the argument as stated does not instantiate a self-sufficient syllogistic form. See [p. 87](https://ablibrary.net/book_content/b/12170/87?lang=ar).

### Critical clarification concerning mathematical equality

Do **not** misreport this as the claim that actual mathematical equality could be nontransitive. Equality is transitive in mathematics. The commentator's point is that if the premises are treated as bare **relational propositions**, a chain of two binary relations does not fall automatically into one of the stipulated categorical figures without a principle concerning that relation. Whether that principle is counted as part of the logical rules, the interpretation of equality, or an independently stated premise depends on the formal system chosen.

## 3. An explicit relational proof probe

Let the domain be `U={0,1,2}`, and let `R(x,y)` be an otherwise unrestricted **binary relation**.

Premises: `R(0,1)` and `R(1,2)`. Conclusion proposed: `R(0,2)`.

**Countermodel without the additional premise:** define `R={(0,1),(1,2)}`. Both premises are true, but the conclusion false. Therefore the inference is **not valid for arbitrary binary relations**.

**Restored inference with a principle:**

> ∀x∀y∀z ((R(x,y) ∧ R(y,z)) → R(x,z))

Now the two premises plus transitivity entail the conclusion. This illustrates *in a modern metalanguage* why al-Yazdī insists on the missing premise. The verifier checks all **512** possible binary relations on three elements (`2⁹` relation assignments) and confirms that the two-premise chain has countermodels without the transitivity assumption and none when the assumption holds.

This set of 512 relation interpretations is **different** from the separate **512 three-term set assignments** already used for the 19 nonmodal categorical moods. The counts must not be conflated.

## 4. Matter and form in an exceptive example

Al-Yazdī illustrates the two directions of conditional exception:

> إن كان هذا إنساناً كان حيواناً، لكنه ليس بحيوان، [إذن] هذا ليس بإنسان.

and, with the antecedent instead:

> إن كان هذا إنساناً كان حيواناً، لكنه إنسان، [إذن] هذا حيوان.

The same conditional supplies the terms, but the additional premise either **denies the consequent** or **affirms the antecedent**. Their inferential directions are not interchangeable with the fallacies of affirming the consequent or denying the antecedent.

These are examples *in the later commentary* explaining the short Tahdhīb classification of exceptive reasoning; they are not additions to Cairo p. 11. Nor does this material-conditional truth-table interpretation settle the traditional distinction `luzūmiyya / ittifāqiyya`.

### Is the qualifying phrase “bi-māddatihi” redundant?

Al-Yazdī, p. 87, reports a criticism: since a conclusion cannot have its form without having some material terms, perhaps stating both is redundant in the definition. He nevertheless explicates what each word contributes. This should be read as a dispute about the **adequacy of the definition**, not as a discovered Cairo textual omission.

## 5. How this constrains the forthcoming figure audit

L16 then defines minor term (`aṣghar`), major term (`akbar`), middle term (`awsaṭ`), and the four figures by placement of the middle. The manuscript-length crux of historical modality begins when the text requires, for example, **an affirmative and actual minor** (`إيجاب الصغرى وفعليتها`), **a universal major** (`كلية الكبرى`), and particular additional restrictions on the second and fourth figures.

A modern 19-mood Boolean validity test shows which **nonmodal categorical combinations** entail a conclusion under specified existential assumptions. It cannot by itself justify:

- the temporal reading of `fiʿliyya`,
- duration while the subject bears a description,
- the conditions for conversion of various specific modal proposition classes,
- the fourth figure's modal restrictions.

Each of those must be matched to the **actual traditional commentary's argument** and its use of `ḥīniyya`, `mashrūṭa`, `ʿurfiyya`, `lā-dawām`, and `lā-ḍarūra`.

## 6. Versioned outputs and unchanged certification

- Added a non-authorial explanatory note to **L.16**; **no Arabic matn wording changed** at Stage 88.
- Extended `verify_logic_core.py` with all 512 arbitrary binary relation interpretations and a formal check of the extra transitivity premise; adds results to the generated proof JSON.
- Previous Stage 86: exact Cairo L15 vs other print; two 64-case nonmodal contraposition probes.
- Previous Stage 87: Cairo L17 corrections and separate unresolved connector issue; ten **printed-form** comparisons overall.
- **Logic:** 19 bilingual divisions, primary Cairo pp. 3–14. Not manuscript-collated or formally certified in its medieval modalities.
- **Kalām:** 1,044 bilingual clauses; 110/113 Cairo printed pages checked, pp. 77, 100, 124 remain open. Independent Sanandajī–Wasīm translation stream remains separate.

**Next task:** complete a source-bound *formal rule table* for L16 using the actual medieval modal operations by each figure, not a retrofitted modern schema. Begin with p. 11's `إيجاب الصغرى وفعليتها وكلية الكبرى` and the second figure's p. 12 restrictions, making every historical claim traceable to an al-Yazdī or related named commentary page.

**Methodological invariant:** “self-sufficient inference” is relative to the permitted inference rules and interpretations of a logic, and a commentary may explain those assumptions without being itself an independent textual witness to the original matn.
