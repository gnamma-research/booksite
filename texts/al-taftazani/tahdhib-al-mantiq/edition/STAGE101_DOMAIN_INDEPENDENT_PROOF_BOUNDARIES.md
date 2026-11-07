# Tahdhīb Stage 101 — domain-independent proofs of the three exceptional fourth-figure **temporal consequences**

**Date:** 3 November 2026. **Authorial base:** Saʿd al-Dīn al-Taftāzānī, *Tahdhīb al-Manṭiq*, Cairo 1330/1912, L11 and L14–L16. **Logical comparanda:** al-Kātibī, *al-Risālah al-Shamsiyyah* §§95–104; Tony Street (2024), edition/translation, §104 and modal Appendix Tables 1, 3, 4. **Purpose:** to distinguish independent proofs valid for **every** set of individuals and lived instants, from the historical 46-case modal-type crosswalk in Stage97. Neither kind of argument independently collates a Taftāzānī manuscript.

## Definitions and interpretive boundary

Let \(D\ne\varnothing\) be any set of individuals and \(T\ne\varnothing\) any set of instants, not necessarily finite; assume each predicate \(P,M,S\) is always false outside the individual's existence \(E(x,t)\). No closed-world or finite-domain assumption is used in the proofs below.

- \(\mathsf{Act}_x(A)\) := \(\exists t\in T\, A(x,t)\).
- \(\mathsf{Excl}_x(A,B)\) := \(\forall t\in T\,(A(x,t)\Rightarrow\neg B(x,t))\).
- **Special negative witness:** \(N^\ast_x(A,B):=\mathsf{Act}_x(A)\land \mathsf{Excl}_x(A,B)\land\mathsf{Act}_x(B)\). **Both** actualizations belong to the **same** individual \(x\).
- **Description-bound affirmative:** \(C_x(A,B):=\mathsf{Act}_x(A)\land\forall t(A(x,t)\Rightarrow B(x,t))\).
- **Universal affirmation:** \(U(A,B):=\forall x\in D\,\forall t(A(x,t)\Rightarrow B(x,t))\).
- **Universal special negative:** \(E^\ast(A,B):=\forall x\in D\,(\mathsf{Act}_x(A)\Rightarrow[\mathsf{Excl}_x(A,B)\land \mathsf{Act}_x(B)])\).
- **Ordinary negative particular:** \(O(A,B):=\exists x\in D\,\exists t\in T(A(x,t)\land\neg B(x,t))\).

A source-special *mashrūṭa khāṣṣa* adds necessity while a title is held; a source-special *ʿurfiyya khāṣṣa* adds permanence while held. Their rich historical distinctions are **not** defined by these temporal formulas. These formulas are necessary weaker consequences under one interpretation, not definitions that magically recover medieval modality.

## Theorem 1 — Special negative conversion in arbitrary domains

For every \(D,T\) and \(x\in D\), \(N^\ast_x(A,B)\iff N^\ast_x(B,A)\).

**Proof:** \(\mathsf{Act}_x(A)\) and \(\mathsf{Act}_x(B)\) simply exchange places. \(\forall t(A\Rightarrow\neg B)\) is equivalent to \(\forall t(B\Rightarrow\neg A)\) by classical contraposition at each \(t\). Thus all three conditions are preserved. □

This is a *temporal shadow* of the special conversion exception at Tahdhīb L14–15, not a demonstration that arbitrary medieval particular negatives convert. The classical qualification does work: ordinary \(O(A,B)\) does not imply \(O(B,A)\).

## Theorem 2 — Figure-IV mood VI (AOO) under its **stated bridge**

Assume \(N^\ast_x(M,S)\) for some \(x\in D\) and \(U(P,M)\). Then \(O(S,P)\).

**Proof:** \(N^\ast_x(M,S)\) supplies \(s\in T\) with \(S(x,s)\). Since \(M\) and \(S\) are disjoint throughout \(x\)'s life, \(\neg M(x,s)\). From \(U(P,M)\), \(P(x,s)\Rightarrow M(x,s)\). Hence \(\neg P(x,s)\), giving \(S(x,s)\land\neg P(x,s)\). Thus \(O(S,P)\). □

In the historical argument one first converts the special negative minor, then uses the second figure; this proof contracts those moves into a direct temporal derivation. Its **modal conclusion type**, e.g. perpetual \(A\) versus description-relative \(AD1\), still depends on precisely which additional necessity/permanence relation is licensed by the affirmative major. The theorem asserts neither type.

## Theorem 3 — Figure-IV mood VII (OAO) under its **stated bridge**

Assume \(N^\ast_x(P,M)\) for some \(x\) and \(U(M,S)\). Then \(O(S,P)\).

**Proof:** The special negative \(N^\ast_x(P,M)\) includes \(\exists m\in T\,M(x,m)\) and universal disjointness of \(P\) and \(M\) for the same \(x\). At \(m\), \(M(x,m)\) and therefore \(\neg P(x,m)\). The bridge \(U(M,S)\) implies \(S(x,m)\). Consequently \(S(x,m)\land\neg P(x,m)\), hence \(O(S,P)\). □

The historical reduction first converts the special negative major, then uses the third figure. Its conclusion's traditional \(XD2/X2\) classification is NOT independently established by this theorem.

## Theorem 4 — Figure-IV mood VIII (IEO) under its **stated bridge**

Assume \(E^\ast(M,S)\) and \(\exists x\in D\,C_x(P,M)\). Then \(\exists x\in D\,N^\ast_x(S,P)\), and therefore \(O(S,P)\).

**Proof:** Take a witness \(d\in D\) satisfying \(C_d(P,M)\). There is \(p\in T\) with \(P(d,p)\). The description-bound part ensures \(P(d,t)\Rightarrow M(d,t)\) for **all** instants \(t\). Hence \(M(d,p)\), so \(\mathsf{Act}_d(M)\). Apply universal \(E^\ast(M,S)\) **to that same \(d\)**. We obtain \(M(d,t)\Rightarrow\neg S(d,t)\) for all \(t\), as well as some \(s\in T\) with \(S(d,s)\). Therefore \(P(d,t)\Rightarrow M(d,t)\Rightarrow\neg S(d,t)\) at every instant, so \(N^\ast_d(P,S)\) is true: \(P\) occurs at \(p\), excludes \(S\) while \(P\), and \(S\) occurs at \(s\). Theorem 1 converts this to \(N^\ast_d(S,P)\), establishing the required special negative temporal result. □

This is exactly the **reverse premises → first figure → convert the obtained special negative particular** order reported in al-Kātibī §104. Nothing here presumes ordinary \(O(P,S)\) may be converted without the special same-individual nonpermanence condition.

## Essential qualifications and independent negative tests

1. The universal quantity of mood VIII's negative minor is indispensable. A particular special \(N^\ast_y(M,S)\) about \(y\) cannot be applied to the distinct individual \(d\) witnessing \(P\), unless \(y=d\). Stage96 found explicit countermodels.
2. If mood VIII's particular major means only **some simultaneous** \(P\land M\), its witness may cease to be \(M\) while remaining \(P\). The first-figure intermediate special negative need not follow. Stage96 found 112 countermodels on 6,561 profiles after this weakening.
3. The \(\exists t\,S(x,t)\) consequence of the special negative's \(\mathit{lā\text{-}dawām}\) is indispensable in all three proofs. Stage97's 6,561-profile tests yielded countermodels to weakening it.
4. The above arbitrary-domain proofs do **not** certify necessity of a predication at other possible worlds, permitted description changes, mental versus external subject existence, or scope of existential import. In Stage100, four IEO pairs combining a referential necessary/perpetual major with a universal special negative minor were **unsatisfiable under one explicit interpretation**. A zero-counterexample test on an empty antecedent class is vacuous, not a proof of independent historical validity.
5. The 46-case Stage97 table is a **source-derived typology**: VI 12 cases, VII 22 cases, VIII 12 cases. Source type labels \(A,AD1,XD2,X2,AD2\) are not conclusions of the present four theorems. Every one of the 46 remains conditional on the historical theory's full modality and applicability conditions.

**Summary of genuinely independent result:** The conversion lemma and three categorical/temporal implication theorems are now proved for **arbitrary domains and times**, not only enumerated small models, under fully stated assumptions. **What is *not* proved:** all 46 historical modal-strength consequences, the authenticity of any undeciphered manuscript readings, or a “definitive” multi-witness edition.

## Source and textual preservation

- Source Arabic: [Cairo 1912 facsimile, 128 pages](https://waqfeya.com/books/%D8%AA%D9%87%D8%B0%D9%8A%D8%A8-%D8%A7%D9%84%D9%85%D9%86%D8%B7%D9%82-%D9%88%D8%A7%D9%84%D9%83%D9%84%D8%A7%D9%85-2bb5de6aa187474a9556cae235ad0fec).
- Al-Kātibī, *al-Shamsiyyah* §§95–104: Tony Street, *Najm al-Dīn al-Kātibī's al-Risālah al-Shamsiyyah* (NYU Press, 2024), original pp.64–69, commentary pp.252–254, appendix modal Tables 1,3,4 pp.303–307. [Scholarly PDF](https://dhjhkxawhe8q4.cloudfront.net/library-of-arabic-literature-wp/assets/20240530034338/9781479827510_WEB-1.pdf).
- Early expanded six-condition commentary, Özpilavcı–Öztop (2019) p.89: [critical Arabic edition](https://isamveri.org/pdfdrg/D04349/2019_2/2019_2_OZPILAVCIF_OZTOPA.pdf).
- Stage100 source-evidenced countermodels: [dossier](STAGE100_MODAL_NONVACUITY_AND_INDEPENDENT_WITNESS_STATUS.md).
- All Arabic clauses, bracketed reconstructions and source notes remain in their respective authorial/editorial/commentary layers. The separate al-Sanandajī–Wasīm project is not silently incorporated.
