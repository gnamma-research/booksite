# Tahdhīb — Stage 100: independent witness boundaries, p.77 closure, and genuine modal non-vacuity

**Date:** 3 November 2026. **Workstreams:** Taftāzānī's own *Tahdhīb al-Manṭiq wa-l-Kalām* (logic and kalām); a separate Sanandajī–Wasīm translation remains untouched. **Copy-text:** Cairo, Maṭbaʿat al-Saʿāda, 1330/1912. **Editorial status:** critical *working* edition, **not a definitive manuscript-collated text**.

## 1. What this stage establishes

1. Examined the source-critical history of the remaining Cairo **p.77, KAL-077.03** closure, and reopened the photograph of the original. The first small graphic group immediately before «على كل كلام في كل باب» looks like «وفاء» in the printed image; its syntax is unstable. Its exact authorial reading remains an **unresolved crux**; it has **not** been emended or certified on grounds of stylistic plausibility.
2. Located and visually inspected selected double-folio images of the **al-Azhar 995 AH manuscript**, Azhar private 2468, general 96067, 41 PDF images: <https://cp.alukah.net/Manu/Files/Manuscript_6154/Makhtotah.pdf>. Images 17–28 were examined for discussion sequence. We did **not** secure an indisputable manuscript folio, side and line containing the p.77 closure; **no variant from this manuscript is registered**. The date and shelfmarks are catalogued descriptions, not new readings from a copied colophon.
3. Clarified the status of **Princeton Garrett 4139Y**: the catalogue lists a 1714 *Tahdhīb al-manṭiq wa-l-kalām* component at fols. **1b–21b**, yet the more detailed origin/incipit entry calls that component «Tahdhīb al-manṭiq». Its inclusion of the *kalām* portion must **not be inferred from the title alone**. A contents/ending check against photographed fols. is needed before using it for Cairo p.77. Its public PDF endpoint returned a traffic-control challenge. Source: <https://digital-collections.princeton.edu/i/%D8%AA%D9%87%D8%B0%D9%8A%D8%A8-%D8%A7%D9%84%D9%85%D9%86%D8%B7%D9%82-%D9%88%D8%A7%D9%84%D9%83%D9%84%D8%A7%D9%85-%D8%A7%D9%84%D8%AE/item/6a23d92c-5192-4801-a8e9-c40fd9c9118d/metadata>.
4. Constructed a new **source-guided modal fragment** differentiating *referential* necessary/perpetual predication (`L`, `A`) from **description-relative** necessary/perpetual predication (`LD1`, `AD1`, `LD2`, `AD2`), with `lā-dawām` bound to the individual whose subject-description is at issue. It enumerates **6,561 complete one-person, two-world, two-time histories** for each of the **46** previously classified exceptional fourth-figure modal combinations. The results are in `verified_stage100_modal_distinctions.json`, deterministically produced by `verify_modal_distinctions.py`.
5. Discovered a **four-case non-vacuity objection** within the historically counted eighth mood (IEO): when its affirmative particular major has `L` or `A` referential semantics, and its universal special negative minor has `LD2` or `AD2` individual-wise `lā-dawām`, there is **no jointly satisfiable premise profile** in the proposed model. This is a feature/limitation of the explicit fragment, **not** a demonstrated error in al-Kātibī, Ibn Mubārakshāh or Street's historical classification.
6. Preserved **112/113 single-Cairo-print source checks**, **1,044 stable bilingual kalām clauses**, and **19 editorial logic divisions**. The only residual unresolved Cairo print page remains **77**, distinct from the stronger unresolved **multi-witness manuscript certification**.

## 2. Historical controls: do not conflate three forms of predication

Tony Street (ed., trans. and comm.), *Najm al-Dīn al-Kātibī's al-Risālah al-Shamsiyyah* (NYU Press, 2024), Appendix 2, **printed pp.329–344**, carefully distinguishes:

- **`A` — dāʾima muṭlaqa (perpetual, referential):** a predicate holds throughout the referent's life, not only when it bears its currently used subject-title. `L` is the necessity-oriented referential class.
- **`AD1` — ʿurfiyya ʿāmma (customary-general):** a predicate holds throughout the subject's **description-period**. `LD1` is its necessity-oriented general conditioned form.
- **`AD2` and `LD2` — the special descriptional compounds:** they add an individual-wise `lā-dawām` condition. For a universal special **negative** `E(M,S)`, the classical gloss combines exclusion of S while M with an **S occurrence for each relevant M-subject** during its life (Street Appendix 2 p.333 for LD2 e; pp.342–344 for the analogous customary family).

Al-Kātibī *Shamsiyyah* §§103–104 treats the last three fourth-figure modes under extra conditions and reductions; Street's commentary **pp.252–254** counts 12 sixth, 22 seventh and 12 eighth eligible combinations. The modal **result tables** in Street **pp.303–307** are adopted from **Ibn Mubārakshāh's** later commentary and must not be represented as verbatim Taftāzānī propositions. Primary edition: <https://dhjhkxawhe8q4.cloudfront.net/library-of-arabic-literature-wp/assets/20240530034338/9781479827510_WEB-1.pdf>.

These class distinctions are historically warranted; the finite algorithm translating them into 2 worlds and 2 times is **our proposed explanatory model**, not a textual stipulation by al-Kātibī. In particular it has no independent semantics for Avicennan essence, necessity across all times/worlds, subject-mode alternatives or mental/external/existential propositions.

## 3. The reproducible 46-mix audit: stronger result and countervailing gaps

| Mood | Historical mixes | Source-output types (from later tables) | Finite source-guided audit |
|---|---:|---|---|
| VI (AOO) | 12 | O(A) × 4; O(AD1) × 8 | All have no counterexample to the **tested** temporal consequence; 8 descriptional-major cases admit models refuting the *stronger* perpetual O(A) conclusion. |
| VII (OAO) | 22 | O(XD2) × 12; O(X2) × 10 | No counterexample to an explicitly **weaker** existential/nonperpetual `O(X2)` shadow. Exact XD2 versus X2 historical semantics are **not established** by this. |
| VIII (IEO) | 12 | O(AD2) × 12 | 8 cases have satisfying antecedents with zero failures of the temporal O(AD2) consequence; **4 `L/A` affirmative-major cases have zero satisfying antecedents** in this model. |
| **TOTAL** | **46** | Historically source-typed | **Not 46 independently verified necessity theorems** |

The four eighth-mood premise-pairs with zero antecedents:

| VIII universal E-special negative minor | VIII particular affirmative major | Satisfiable in this model? |
|---|---|---|
| `LD2` | `L` | No |
| `LD2` | `A` | No |
| `AD2` | `L` | No |
| `AD2` | `A` | No |

### 3.1 Analytic explanation: why the four are incompatible under the adopted scope

Let an actual individual *d* witness `I(P,M)` with referential `L` or `A` major. By that proposition's chosen referential truth condition, *d* bears M at **every time of its actual life**, not merely on the occasions that *d* is P. The universal special `E(M,S)` negative applies to every M-subject and entails **(a)** no S while M and **(b)** an S occasion somewhere in that **same individual's** life (the negative's `lā-dawām`). Since M holds throughout d's life, (b) contradicts (a). This is a logical argument independent of the number of persons or time instants **provided one accepts these explicit definitions**.

This neither disproves a particular medieval proof nor authorizes removing four cases from the **historically reported 12**. Medieval works can include formally described combinations without promising independently realizable antecedents; Street Appendix 2 p.343 explicitly lists a different *non-perpetual perpetual* compound and labels it an **impossible proposition**. Investigation must determine whether this eighth-mood incompatibility is similarly recognized, or whether a finer notion of necessity, subject-world domains or modal qualification changes it.

### 3.2 Why the sixth mood's L/A cases are *not* globally vacuous

In a **one-person** model, an actual P witness with referential A/L and a special negative M/S witness cannot be the **same person**. However, two distinct persons **do** satisfy the universal referential `A(P,M)` major and particular special O(M,S) minor together:

- d0: M at t0, S at t1, never P. This supplies O-special(M,S).
- d1: P and M throughout its life, never S. This is an actual P subject satisfying the referential A(P,M) major.

The particular perpetual negative O(A)(S,P) follows through d0. Thus the **VI** major's quantity and the **VIII** major's particular witness condition must not be confused. An overstrong claim that all L/A configurations are inconsistent would itself be false.

### 3.3 Necessary strictness witness for descriptional versus referential conclusions

For all eight sixth-mood cases with **descriptional** major types `LD1`, `AD1`, `LD2`, `AD2`, the finite checker exhibits profiles in which O(AD1) follows but O(A) fails. Example of the principle: an S witness is never P *while it bears the title S*, yet may become P at another time outside the S-period. The traditional conclusion's modality therefore carries real additional content that a plain Boolean negative would erase.

## 4. Witness and certification ledger

| Layer | Achievement | Certification limit |
|---|---|---|
| Authorial translation | Logic 19 divisions; kalām 1,044 bilingual clauses over printed pp.15–127 | A complete **working** bilingual corpus, not a claim of 1,044 independently manuscript-verified readings |
| Cairo printed base | 112/113 pages directly checked | p.77 `KAL-077.03` uncertain printed opening; cannot promote to 113/113 |
| 995 AH Azhar manuscript | Digitized witness opened; selected images reviewed | **No** folio+side+line collation established for p.77; zero certified variant readings |
| 1714 Princeton Garrett 4139Y | Bibliographic component examined | Inclusion of kalām portion is unclear in detailed catalogue fields; downloadable image access challenged; zero variant readings |
| Modern edited 2017 printing | Identified bibliographically | Exact text not consulted; zero variant readings |
| Modal source history | All 46 source-classified cases and reduction maps | Modal fragment shows four vacuous VIII cases and XD2/X2 gap; not full historical necessity proof |
| Publication | Existing six bilingual/monolingual canonical NAMA PDFs and CI | Verify again after source/notes change; PDF hashes are **publication checks**, not authorial proof |

## 5. Required research to cross the remaining *definitive* gates

1. **Locate p.77 in an independent Tahdhīb manuscript** by searching for the sequence «والجن كذلك» → «الباب الخامس في الإلهيات» in photographed folios. Record manuscript repository, shelfmark, side and line, first-word form, and any omission. The p.77 first word should remain bracketed/in issue notes until then.
2. **Collate at least one complete independent manuscript** across all disputed Cairo readings, including pp.100,124 previously restored against the print. No scanned witness may be silently substituted as an authorial reading.
3. **Derive actual modal truth conditions** for every one of the six convertible-negative types, five additional actual classes, particular and universal quantifier scope, mental/external/ḥaqīqiyya subjects, and `lā-dawām` independently from al-Kātibī and his commentaries. Then check the 46 entailments with witness-based proofs and countermodels that do **not** depend on arbitrary finite-world semantics.
4. Resolve the original Cairo logic **L17 conditional connector** from a second witness; record genuine alternative print readings, do not silently emend.
5. Preserve Sanandajī–Wasīm as a wholly independent source-facing translation stream.

### Editorial decision

**Do not mark the textual or semantic work 'definitive'**. This stage materially advances it: it fixes the witness-status boundary, verifies 46 explicit modal-premise/output tuples, supplies a stronger executable distinction between referential/descriptional modalities, finds an actual non-vacuity issue affecting four specific eighth-mood combinations, and preserves the honest single-print p.77 uncertainty. The historically reported 46 modal combinations are **retained**, with their conditional-proof status visible to readers.