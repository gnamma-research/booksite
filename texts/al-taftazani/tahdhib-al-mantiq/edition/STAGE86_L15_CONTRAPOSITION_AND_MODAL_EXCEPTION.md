# Tahdhīb Stage 86 — Cairo L15, contraposition and the exceptional modal conversions

**Date:** 2 November 2026  
**Author:** Saʿd al-Dīn al-Taftāzānī, *Tahdhīb al-Manṭiq*  
**Primary copy-text:** Cairo, Maṭbaʿat al-Saʿāda, 1330 AH/1912, **original printed p. 11**. Reinspected as a high-resolution photograph from the project Library PDF `At-taftazaniSadAd-din1912_text.pdf`.  
**Separate printed witness:** *Sharḥ al-Tahdhīb* matn, [Arabic Dawate Islami online p. 14](https://www.arabicdawateislami.net/bookslibrary/3507/page/14); this is not a manuscript collation.  
**Expository source:** al-Yazdī, *Ḥāshiya ʿalā Tahdhīb al-Manṭiq*, [printed p. 83](https://ablibrary.net/book_content/b/12170/83?lang=ar) and [p. 84](https://ablibrary.net/book_content/b/12170/84?lang=ar). Comments and quotations from these pages must not be transplanted into the Cairo matn.

## A. Printed text: where a previous working edition inadvertently merged sources

The previous L15 Cairo-labelled text contained:

> وحكم الموجبات ههنا حكم السوالب في المستوي وبالعكس. والبيان البيان والنقض النقض. وقد بين انعكاس الخاصتين من الموجبة الجزئية ههنا ومن السالبة الجزئية ثمة إلى العرفية الخاصة بالافتراض فتأمل.

Direct enlarged photographic rereading of Cairo **p. 11** yields:

> وحكم الموجبات ههنا حكم السوالب في العكس المستوي وبالعكس. والبيان البيان والنقض النقض، وبين انعكاس الخاصتين من الموجبة الجزئية هنا والسالبة الجزئية ثمة إلى العرفية الخاصة.

The latter is the **controlled Cairo transcription** now in `L.15`. Editorial punctuation is supplied for readability; the printed Arabic is unvowelled at `وبين` and that word's exact voice is therefore **not** silently prescribed by a later commentary's spelling.

| L15 locus | Cairo 1912 p. 11 | Matn with al-Yazdī, online p. 14 | Editorial action |
|---|---|---|---|
| Rule reference | `في العكس المستوي` | `في المستوي` | Restored `العكس` to Cairo; do not omit the explicit reference in the primary Arabic. |
| Final proposition's opening | `وبين انعكاس الخاصتين` | `وقد بُيّن انعكاس الخاصتين` | The latter explicitly says something has already been shown. Cairo lacks `قد`; the unvowelled form may be exhortatory. Translator's inference belongs in a note. |
| Minor temporal deixis | `من الموجبة الجزئية هنا والسالبة الجزئية ثمة` | `من الموجبة الجزئية ههنا ومن السالبة الجزئية ثمة` | The current Arabic reproduces Cairo's `هنا` and does not add the second `من`. |
| Closing proof qualification | Ends at `العرفية الخاصة` | Adds `بالافتراض. فتأمل.` | Both belong to this **other printed text**. Their logical content can be explained in notes, but not inserted into Cairo's shorter ending. |

**Significant consequence:** the previous English translation began “By assuming an instance ... it has been shown ... Reflect upon this”, giving the commentary print's proof method as though it were Cairo's. The new English presents the clause as **calling for the special conversion to be established**, but labels that reading provisional because `وبين` is unvowelled.

This is **the ninth confirmed *printed*-form comparison** in the existing corpus's (historically named) `witness_comparisons_stage77` field. Such a count is not a tally of independent manuscripts, and it does not settle autograph priority.

## B. Two forms of ʿaks al-naqīḍ: modern Boolean probes

Taftāzānī opens the chapter by giving two verbal constructions:

> عكس النقيض تبديل نقيضي الطرفين مع بقاء الصدق والكيف، أو جعل نقيض الثاني أولاً مع مخالفة الكيف.

A modern model can test **logical shapes** without claiming that it proves any of the author's historical temporal/modal restrictions.

Fix an interpretation with a non-empty three-element universe `U`. Each predicate `S` and `P` may denote **any** of the eight subsets of U, including empty and universal extensions. Let:

- **A(S,P)**: every S is P;
- **E(S,P)**: no S is P;
- **I(S,P)**: at least one S is P;
- **O(S,P)**: at least one S is not P;
- `¬S` and `¬P` are complements relative to U.

Two schematic renderings for a source proposition `Q(S,P)`:

**Form 1: exchange the contradictory terms and preserve quality.** Compare `Q(S,P)` with `Q(¬P,¬S)`.

**Form 2: put the contradictory of the second term first and reverse quality.** Compare `Q(S,P)` with `Q*(¬P,S)`, where Q* reverses affirmative and negative while preserving A/E or I/O quantity (A↔E, I↔O).

A complete enumeration of **8² = 64** pairs gives:

| Original category | Form 1 (same quality) | Form 2 (quality reversed) |
|---|---|---|
| A, universal affirmative | Valid | Valid |
| E, universal negative | **Not valid** without extra conditions | **Not valid** without extra conditions |
| I, particular affirmative | **Not valid** without extra conditions | **Not valid** without extra conditions |
| O, particular negative | Valid | Valid |

**Concrete countermodel for E:** Let S=∅ and P=∅ in a three-element universe. `E(S,P)` holds vacuously, but `E(¬P,¬S)` is false (both complements are U); correspondingly, `A(¬P,S)` is false. The absence of explicit subject instantiation is essential here.

**Concrete countermodel for I:** Let S={1}, P=U. `I(S,P)` holds, but `I(¬P,¬S)` fails because ¬P is empty; likewise `O(¬P,S)` fails.

**Why O works:** `O(S,P)` asserts `∃x(S(x)∧¬P(x))`. With complement swap, `O(¬P,¬S)` asserts `∃x(¬P(x)∧¬¬S(x))`: exactly the same existential condition. With opposite quality, `I(¬P,S)` says the same thing.

**Why A works:** `A(S,P)` says `S⊆P`, equivalent to `¬P⊆¬S`, and equivalently that no ¬P is S.

This mathematical exercise does **not** establish Taftāzānī's modal contraposition tables. It also must not be used to relabel the categories `mashrūṭa khāṣṣa`, `ʿurfiyya khāṣṣa`, `ḥīniyya`, and `lā-dawām` as if they had ordinary timeless subset semantics. The script `tools/tahdhib/verify_logic_core.py` now runs the 64-case probes **in addition to** its older 512 three-term-model and 19-mood tests. Its generated JSON report identifies failures and provides countermodels.

## C. The actual exceptional modal question in L14–L15

Cairo **p. 10**, L14, states the *general* simple-conversion rule:

> والجزئية لا تنعكس أصلاً لجواز عموم الموضوع أو المقدم.

On Cairo **p. 11**, L15, the last sentence specifically treats the **two special modal forms**, indicating a conversion into `العرفية الخاصة`:

> ... انعكاس الخاصتين من الموجبة الجزئية هنا والسالبة الجزئية ثمة إلى العرفية الخاصة.

The word `ثمة` points back to **simple conversion**; `هنا` points to **contraposition**. Thus “a particular negative never converts” is too broad if treated as a *blanket historical claim about every modal proposition*. L14's English has been adjusted to “does not **in general** convert”, with a cross-reference to the exception.

### What the historical commentary actually contributes

Al-Yazdī, p. 83–84, gives an **iftirāḍ** demonstration of the special modes. In the case of a negative particular under simple conversion, he names a specific individual (`d`) under the subject (`ج`) and uses the `lā-dawām` component to establish a second actual predication with the former predicate (`ب`). He then attempts the time/description-dependent **negative** part of the converse by reductio, exploiting how the two descriptions can obtain in the same subject. For positive particular under contraposition, he likewise takes a witness and establishes the required positive actual component / negative duration component in the transformed proposition, arguing by contradiction if the condition fails.

His proof is not the timeless assertion `O(S,P) ⇒ O(P,S)` (which is false). Rather, the extra **specific modal qualification** supplies precisely the conditions the ordinary categorical schema leaves absent. The commentary also contains a further explanatory gloss distinguishing that exception from the unrestricted negation of particular conversions. See [al-Yazdī p. 83](https://ablibrary.net/book_content/b/12170/83?lang=ar), [p. 84](https://ablibrary.net/book_content/b/12170/84?lang=ar).

**Unresolved historical proof gate:** reconstruct, for each `khāṣṣa` form, the quantification over subjects, the interval for the actual predicate, the interval over which the subject/title obtains, the scope of `lā-dawām`, and the apparent requirements for switching between subject description and actualization. A bare possible-worlds `◇` symbol or truth-functional table would be misleading unless those interpretations are justified from the commentary's definitions.

## D. Editorial changes and status

1. **Canonical main corpus:** repaired `L.15` Arabic and translation against Cairo p. 11, with the shortened ending and caution about vocalizing `وبين`.
2. **Source apparatus:** added the **ninth printed comparison**, with both printed texts and exact source URLs.
3. **L14 translation:** qualified its general claim about particular negative conversion to avoid suppressing the specific modal exception in L15.
4. **Formal regression:** added explicit 64-interpretation tests for both modern complement-based contraposition schemas, including countermodels for E and I, and reviewed the ordinary nonmodal A→I, E→E, I→I, O conversion restrictions.
5. **Source-integrity QA:** the test suite asserts `في العكس المستوي` and `وبين انعكاس الخاصتين`, forbids falsely inserting `بالافتراض` and `فتأمل` in the Cairo base, and checks the printed alternative is separately visible on the reader's L15 page at all supported device viewports.
6. **Kalām remains untouched:** 1,044 bilingual clauses, **110/113** Cairo printed pages single-print checked, still unresolved at pp. **77, 100, 124**. No new manuscript reading has been assigned to this stage.

### Next gate

Cairo printed **p. 13**, L17, has condensed sentence structures in conditional syllogisms and exceptive inference that need literal checking. Then finish the L16 modal figure conditions at p. 12 with an **explicit commentary-based argument per condition**, without letting the existing modern categorical 19-mood test stand in as proof of historical modality. For the three residual Kalām pages, locate a legible folio/line in the al-Azhar or Princeton manuscript before promoting any variant.
