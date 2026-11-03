# Qawāʿid al-Tawḥīd — Editorial status
**Gnamma Research bilingual source-critical working edition · initiated 2 November, audited 3 November 2026**

## Current editorial decision — QT-059 temporarily set aside (3 November 2026)

**The bilingual reading edition may proceed without a reconstruction of QT-059.** The 61 authorial lemmata currently present in the online source transcription have Arabic and English. At QT-059 (Āshtiyānī pp.262–264), the existing transcription provides the surviving quoted text, while the printed editor's note reportedly describes a loss in the transmitted ancestor's wording. No replacement text is invented; the lacuna is documented **only** as a source note in QT-059 and the critical apparatus. The project does not need a PDF to keep publishing and using the extant translation.

The source pages [262](https://ablibrary.net/book_content/b/17638/458?lang=ar), [263](https://ablibrary.net/book_content/b/17638/459?lang=ar), and [264](https://ablibrary.net/book_content/b/17638/460?lang=ar) were **not accessible on a fresh check on 3 November 2026**. Thus the loss remains *previously reported, not independently confirmed anew in this check*. Future recovery from another witness is optional and **deferred**; it should not delay the present bilingual reader. This is still **not** a diplomatically or stemmatically established critical edition, and the outstanding print-image/manuscript collation remains a separate scholarly upgrade.

## Stage 11 — Reader parity and separate commentary translation (3 November 2026)

**Implemented in the live source tree:** Darūrī-family compact header and appearance settings; independent Arabic/English visibility (at least one language always active); source-graded **Matn / Together / Sharḥ** views; four focus levels including a flowing, all-sections continuous scroll without repeated cards; mobile bottom section dock; contents/search; browser-local bookmarks and personal notes with JSON export; passage permalinks, notes and edition links. Interface files: [reader.css](../reader.css), [reader.js](../reader.js), [index.html](../).

**Independent sharḥ layer created:** [data/commentary.js](../data/commentary.js) with two Arabic–English commentary passages [SH-061-A/B](COMMENTARY_TRANSLATION.md), **directly linked to the printed Arabic on p.274** at the end of Ṣāʾin al-Dīn's Tamhīd. The first explains the perfected guide and the measure peculiar to each spiritual station; the second is the grandson's final sentence. This is *not* the earlier ancestor's conclusion at QT-061 or the separate editor Āshtiyānī's colophon following the commentary. The separate commentary's initial pp.3–47 and the remaining **أقول** passages are still **untranslated**, with spaces reserved under stable matn IDs. We have **begun**, not finished, the commentary translation.

**Original matn preserved:** 61 units and their English translations continue to load from unchanged [data/units.js](../data/units.js). The earlier decision to adopt «الحمد لله رب العالمين» in the reader and defer QT-059 recovery remains as documented. Source notes and the critical apparatus retain open textual uncertainty.

**QA limitation:** Source integrity, cross-layer ID references, data loads, code syntax and initial rendering were tested in a synthetic DOM harness; a real Safari/iOS visual acceptance test has **not** yet been performed. Reader parity is at the level of core interaction **patterns**, not a claim that the full Darūrī historical dictionary, five PDF editions, offline archive or all bespoke scholarly tools have been copied.

## Scope, order of operations
1. **Matn first:** reconstruct and translate the complete original *Qawāʿid al-Tawḥīd* of Abū Ḥāmid / Afḍal al-Dīn Muḥammad Turka al-Iṣfahānī, separately from the much longer commentary by his descendant Ṣāʾin al-Dīn ʿAlī ibn Turka.
2. **Establish the matn:** trace the *qāla* quotation chain through the *Tamhīd*, check printed page photographs, obtain and compare independent manuscript copies of the ancestor's shorter text, register substantive and orthographic variants, and submit the translation for technical review.
3. **Translate the sharḥ in a separate layer:** now started with the independently checked closing passages p.274; continue the original introductory sections and all subsequent *a-qūlu* explanations only as their Arabic is verified. Never insert them into the ancestor's English prose.

## Current work completed
- **61** source-located ancestor quotation lemmata, QT-001–QT-061, reproduced in normalized but source-located Arabic and independently translated into scholarly English (not manuscript-collated).
- Printed locus mapping: **Āshtiyānī's Arabic pp. 48–270**, with separate source-page links for every quotation; the many pages of the descendant's commentary are not falsely represented as translated matn.
- Exclusion of the descendant's own extensive introduction (beginning at printed p. 3) and commentary from the matn layer.
- First-pass register of seven reported printed variants in the first six ancestral quotations; none yet independently assigned to manuscript witnesses, without attributing readings to uninspected manuscripts.
- Translator notes informed by the sharḥ, particularly his identification of Peripatetics and mutakallimūn (p. 49), and his gloss on *ḥads* (p. 54).

## Stage 02: the Avicennian–Akbarian dialectic (pp. 63–74)

- **QT-007 (pp. 63–64):** the necessary reality is not universal *qua* universal, nor specified through a negative or positive distinct qualification; otherwise composition or extrinsic dependence follows.
- **QT-008–010 (pp. 67, 68, 71):** a position is introduced in the form of an **objection**, elaborating a nature to which common existence is attached and a **tashkīk** account of its predication. These are *qāla* quotations but **not the ancestor's own endorsed conclusion**.
- **QT-011–012 (pp. 72, 74):** a reply based on the intrinsic possibility of hypothesized individuals of a necessary nature and the alternative of intrinsic determination. The commentator’s intervening paragraphs are excluded.
- The new passages have been checked against the electronic Arabic page transcriptions **only**. They are provisional; none has been image- or manuscript-collated. Joseph Lumbard's selection ends during the commentary after QT-006 and cannot be used as a translation comparator for these later lemmata.

## Stage 03: necessary reality, determination, and mental existence (pp. 78–109)

Twelve more **ancestor's quoted lemmata** have been translated **QT-013–QT-024**; all 24 current units are aligned in [parallel-matn.md](../data/parallel-matn.md) and the interactive reader. Boundary criterion: each recovered segment is introduced by **قال** and ends before the next **أقول**; intervening grandson's explanation and Qajar glosses are excluded.

| Unit | Base printed pages | Principal point / special control |
|---|---|---|
| QT-013 | 78 | Dilemma about a separate necessary nature: equivocally distinct or impossible intrinsically necessary concomitant; two alternative readings registered. |
| QT-014 | 81 | Contradictory ontological roles of supposed identicals: inherence versus substratum. |
| QT-015 | 82–83 | Anti-*tashkīk* dialectic; a merely possible objection versus a proposed proof. The latter risks **muṣādara ʿalā l-maṭlūb**. |
| QT-016 | 87 | Concept of intrinsic determination; its universal intelligible meaning and relational predication. |
| QT-017 | 89–90 | Essence-identical determination without reduction to sheer individual *shakhṣiyya*; anomalous masculine Arabic predicates preserved. |
| QT-018 | 93 | Necessary reality as intellect, knower and known; knowing by aspects need not comprehend essence. |
| QT-019 | 94 | Different modes of association with non-opposed relations and conditions, not an external physical coupling. |
| QT-020 | 95 | Reciprocal philosophical objection; **unsettled grammar and potential corruption** in final Arabic phrase. English interpretation provisional. |
| QT-021 | 98 | Necessary characteristics need not restrict unrestricted existence. |
| QT-022 | 100–101 | Why philosophical disputation still answers objections despite the claimant's demonstration; **ḥads** and public pedagogy. |
| QT-023 | 106 | Four readings of particular existence: unqualified subject, accident alone, composite, subject qua qualified. |
| QT-024 | 109 | Mental and extramental existence are one in reality though distinct in conceptual consideration; major **بالفرض/بالعرض** alternative. |

**Limits:** these are checked against the *electronic transcription of Āshtiyānī's printed edition*, not against photographs or independent manuscripts. Terminology and philosophical glosses informed by the grandson's **أقول** are clearly presented as **editorial notes**. Only the **earlier QT-001–006** fall within Lumbard's translated selection; his published English cannot be used as a comparison for QT-013–024.

**Independent critical correction:** Āshtiyānī's later note at Arabic printed p. 86 expressly says the author and commentator treat *tashkīk ʿāmmī* while leaving *tashkīk khāṣṣī* undeveloped. This is *his* interpretation, not a statement of the ancestral matn. The new translation does not silently assimilate the argument to later Ṣadrian *tashkīk*.

## Stage 04: positive Akbarian metaphysics, the unity of Being and names (pp. 111–121)

After the rigorous anti-*tashkīk* dialectic, the author proceeds to state the positive position. Four more authorial **قال** passages have been extracted and translated:

- **QT-025, pp. 111–112:** *Tanbīh* against describing the First Principle as a particular species-like objective entity standing in estrangement from its effects, while also being included under universal being. **Textual crux:** the printed wording **تكون طبيعته عن تلك الأكوان** appears suspect; grandson paraphrases **عين طبيعتها** on p. 114, but the Arabic remains unemended pending collation.
- **QT-026, p. 114:** the priority of unrestricted objective existence over determinate things qua determinate, which are analyzed through intelligible notions and conceptual relations.
- **QT-027, p. 118:** the one Real identified with unrestricted existence, and the inapplicability of names and predicates **without taking determinations into consideration**. Printed variants for **عرفت/عرّف** and **التحقيق/التحقق** retained.
- **QT-028, p. 121:** the self-presence of the Absolute Essence and the first relation of knowledge, followed conceptually by necessity, causal necessitation, and effusion; the grandson explains the deliberately philosophical term **حصول** at p. 128.

These passages are **not** the grandson's long construction of the first determination, Muḥammadan Reality, and divine names found in his own commentary at pp. 122–128. The 28 currently selected lemmata are complete as an aligned bilingual working set but the ancestor's **whole treatise remains incomplete**. No additional printed photographic or manuscript witnesses have yet been verified.

## Stage 05: epistemology, objections, anthropology and the mirror (printed pp. 130–190)

**New in this stage:** 14 independent bilingual authorial lemmata **QT-029–QT-042** from printed pages **130–190**, added to the main reader and [parallel working text](../data/parallel-matn.md). Only the ancestor's **قال** quotations are translated. Most text between them is the grandson's **أقول** commentary or modern glosses and is intentionally omitted.

**New doctrinal groupings:**

- **QT-029–031 (pp. 130–138):** reflexive knowledge, knowledge of the divine attributes and fixed entities, criticism of the Peripatetic premise ‘knowledge of cause entails knowledge of a distinct effect,’ and knowledge of self without real knower–known plurality.
- **QT-032–033 (pp. 141–144):** disclosure from hiddenness and the graded ontological realms of spirits, imaginal forms and bodies; medieval celestial cosmology remains the author's historical position.
- **QT-034–035 (pp. 148–154):** an extended **reported objection**, not an endorsed assertion, attacks possibility, creation, hierarchy and the imaginal world; the direct reply distinguishes unrestricted real **wujūd** from conceptual/predicable **mawjūdiyya**.
- **QT-036–039 (pp. 160–173):** determined forms and species, more comprehensive sensory and intellectual manifestations, acquisition of spiritual **malakāt**, and the need for a comprehensive manifestation of unity in plurality.
- **QT-040–042 (pp. 180–190):** Perfect Human, the volitional character of manifestation, **the ancestor's criticism of an Ibn ʿArabī mirror simile**, and a further objection/reply about whether the entire human cosmos reveals *every* divine determination.

**Publication warning:** the digital source is a **single modern Arabic printed transcription**, not proofed manuscript photographs. Apparent text corruption or anomaly is flagged at QT-030 (غير الفرضيين/العرضيين), QT-031 (يكون حاصلة), QT-033 (الجود/الوجود), QT-034 (أنبتوها/أثبتوها conjecture), QT-035 (duplicated الوجود), QT-036 (repeated clause), QT-037 (الإنية / المرتبة الأخيرة), QT-039 (source syntax), QT-041 (بالذات بالعرض) and QT-042 (موقياً/موق). **No manuscripts were independently collated in this stage.**

**Attribution alert:** the long passages on divine names, celestial cosmology, Qūnawī's metaphysical principles, and perfect-human ontology that follow the grandfather's brief quotations often belong to the **grandson**. Their presence in the same printed page does not make them original matn. Lumbard's English selection ends near Arabic p. 63 and does not cover these passages.

## Stage 06: exhaustive mirrorhood, perfection and cognitive restriction (pp. 193–207)

Four additional original ancestor **قال** quotations have been isolated, verified in the printed-edition electronic transcription and independently translated as **QT-043–QT-046**, bringing the total to **46 bilingual authorial lemmata**. The latest quoted source ends on **printed p. 207**. These are the *grandfather's matn*, not the grandson's intervening or subsequent **أقول** paragraphs.

| Locus | Printed pages | Argument and editorial boundaries |
|---|---|---|
| **QT-043** | **193–195** | Three candidates for the exhaustive divine mirror: identity with human reality; unrestricted existence; or existence determined by the full range of divine names and relations. The latter might imply the macrocosm instead of any particular person, while unbounded kinds and differing human perfections contest exhaustive individual mirroring. Original quote ends p.195 at **أقول**. The published editor argues that p.194's repeated **لصحّ أن يقال** is scribal; **not silently removed**. |
| **QT-044** | **197–198** | A dilemma from **final causality (علّة غائيّة)** and the Necessary's intrinsic sufficiency: either the cosmic manifestation supplies no real divine perfection, or one of the Necessary's perfections appears to depend upon possible, originated existence. The quotation includes the ancestor's own internal **فلئن قيل ... قلنا**. Closes before (1) **أقول** p.198. |
| **QT-045** | **202–203** | An argumentative *report* that mystical perfection requires detachment from the sensory and bodily faculties; this is used to challenge describing a disembodied perfected intellect as the comprehensive cosmic totality. **Reported objection, not a final rejection of Sufism**. Closes before (1) **أقول** p.203; the long Persian and Arabic glossing pp.203–205 is not inserted. |
| **QT-046** | **206–207** | A further objection: supposed gnosis beyond intellect is not amenable to ordinary intellectual apprehension or verbal expression, while acquired natural constraints cannot be removed merely by ceasing to attend to them. Closes at the printed **أقول** p.207. The subsequent many pages of rational and psychological analysis are the descendant's commentary. |

**Important source controls and uncertainties:** In QT-043, the editor reports **الحاسّة/الحادسة** and a probable duplicate string; at QT-044, **فلئن قيل/فلئن قلتم** and **بعض/البعض**; at QT-045, **تقوية/تقوى** and the case of **القوى**; at QT-046, **وبيّن/فإن** and the source's grammatically strained **أن يصل ... القوّة**. The Arabic has been lightly normalized; **independent photographed print comparison and manuscript collation remain unperformed**.

The recovery chain has now covered quoted lemmata through p.207, but p.208 onward has not been exhaustively checked for all remaining ancestor citations; do not assign an unwitnessed QT-047 or claim complete extraction. The *Tamhīd* continues far beyond the latest translated lemma.

## Stage 07: the embodied human, comprehensive manifestation, and divine attributes (pp. 212–237)

Six further **ancestor's قال quotations, QT-047–QT-052**, have been separately translated and placed into the bilingual reader.

| ID | Printed pages | Boundary / principal argument |
|---|---|---|
| QT-047 | 212–213 | An extended hypothetical counter-objection comparing orderly demonstration with supposedly disordered ascetic perception; finishes before grandson's أقول p.213. |
| QT-048 | 215–218 | Four levels of comprehensive being; intellectual, estimative, imaginative and sensory apprehension in the Perfect Human. The printed p.216 and p.217 contain interleaved Persian editor notes excluded from the quote. |
| QT-049 | 224–225 | Difference between active and passive determinations and unrestricted reality under its distinct relative aspects. |
| QT-050 | 228–230 | True natural composite of body and separate soul contrasted with mere aggregate of cosmic principles; printed p.229 has intrusive Persian commentary. |
| QT-051 | 234 | Finite superior types, inferior types and kind-wide versus particular perfections. |
| QT-052 | 237 | Possible relative attributes versus divine necessity, including a problematic broken printed clause. |

**Latest translated ancestor's matn ends on printed p.237.** All passages remain *provisional transcriptions* from one digital edition, not manuscript-collated readings or a claim of a complete original. The grandson's reply starting p.237 is excluded. P.238 onward has not been exhaustively extracted.

**Open textual cruxes:** QT-047 المناقض/المناقص, تكليفية/تكلّفية, obscure التفرس; QT-048 authorial agreement يدرك with الحقيقة; QT-049 المأخوذة/الموجودة and reported alternatives; QT-050 أفعال/أفعالها; QT-051 وبصدر/ويصدر conjecture; QT-052 displaced bصفة كمالية ... ببعض الصفات الممكنة. Printed-page photos and independent manuscripts are mandatory before treating these as settled.

## Stage 08: surviving conclusion of the ancestor's Qawāʿid, pp. 243–270

**Nine newly extracted and translated original lemmata, QT-053–QT-061.**

| Unit | Arabic printed pp. | Boundaries and position |
|---|---|---|
| QT-053 | 243–244 | Sensory, estimative and intellectual faculties can remain active under the holy faculty; replies to the perfection–comprehensiveness objection. Ends before (1) أقول p.244. |
| QT-054 | 248 | Beyond the *discursive* faculty is not beyond intellect in every sense; expression is possible. Printed phrase duplicated; reported as corrupt. |
| QT-055 | 249–250 | Contemplation and the subordination of the bodily powers; stronger opposing causes can displace habitual activity. |
| QT-056 | 252–255 | Extended defence of balanced discipline and properly qualified asceticism; condemns excessive hunger/sleeplessness; moral preparation necessary for contemplative and demonstrative inquiry alike. P.254–255 Persian notes excluded. |
| QT-057 | 257–258 | **Reported** philosophers' assessment of contemplative discipline as possible but rare/difficult. Not the final authorial view. |
| QT-058 | 260 | **Author's own reply**, introduced وأما نحن: both routes require ordered psychic faculties, moderate temperament, and avoidance of distraction. |
| QT-059 | 262–264 | Senses are preparatory in **both** paths and the effusive Principle is the source of intelligible knowledge. **SUBSTANTIAL LACUNA:** the editor reports omissions longer than one page in the ancestor's text. The surviving abbreviated quotation is translated but cannot be treated as textually complete. |
| QT-060 | 266–267 | **Both routes are genuine**; contemplation and disciplined reasoning each require purification; critique of disputatious book learning without virtue. |
| QT-061 | 269–270 | The closing *daqīqa*: conflicting unveilings require discrimination informed by logic and theoretical knowledge, unless a perfected guide provides direction. **Author explicitly ends his treatise** at p.270. |

### Status of original matn versus edition

**Established:** The grandson's commentary embeds original quotations through printed p.270, where the grandfather says **«وهذا آخر ما أردنا أن نورده في هذه الرسالة»**. The last marked original quotation is QT-061; the descendant resumes with **(1) أقول** on p.270 and concludes his commentary separately on p.274. The **61** identified printed lemmata are available in aligned Arabic/English.

**Not established:** This is not a complete ancestral critical edition. Most importantly the base's marginal note at pp.262–263 states that its exemplars omitted **more than one page** of the original at QT-059. Other conspicuous corruptions include a duplicated clause QT-054; a logically inverted negative in QT-056; unusual grammatical forms at QT-053/055; and several disputed readings QT-060/061. Earlier lemmata also require page-image verification and comparison against independent manuscripts (e.g. early Mashhad and AQR holdings).

**Do not backfill** the missing ancestor text from the grandson's **أقول** paraphrase, Persian editor remarks, or modern interpretive summaries. Obtain independent shorter-matn manuscript witnesses and alternative editions before calling the translation textually complete.

## Stage 09: source-critical integrity audit (3 November 2026)

This stage improves the **critical apparatus and editorial reliability**, **not** the manuscript basis of the Arabic. The full 61-lemma bilingual text is in [parallel-matn.md](../data/parallel-matn.md); the [per-lemma critical apparatus](CRITICAL_APPARATUS.md) includes all recorded readings and source links.

### Completed checks

- Gnamma catalogue and public reader now consistently display **61** authorial lemmata, from base printed p.48 through the explicit authorial conclusion on p.270. The previous website badge saying **46** was out of date and has been corrected.
- The existing problem register contains **69** entries: **50** readings/alternatives as reported in the *electronic* Āshtiyānī apparatus, **14** editorial conjectures, **1** parallel in the grandson's commentary, **1** major reported loss in the original, and **3** entries where the precise source category cannot be established without checking images. These are **not 69 collated manuscript variants**.
- All 61 reader units now carry an explicit witness status: 0 independently collated manuscripts, no independent leaf-image verification, and distinct authorial **قال** / commentator **أقول** layers.
- Automated Arabic-normalization checks found **six recorded base-lemma labels absent verbatim** from their corresponding current Arabic reader units: **QT-020, QT-043, QT-054, QT-056 and two labels in QT-060**. These are tagged in the apparatus instead of silently declared authenticated.
- **QT-054 and QT-060** are especially revealing: at least some proposed grammatical improvements were already incorporated into the *normalized reading text* although the apparatus still cites their unrevised electronic base forms. This is a reason **not to label the Arabic diplomatic**.

### Remaining material barriers

The reported multi-line/more-than-page loss at **QT-059, printed pp.262–264**, remains unresolved. The 1898 Tehran printing, Āshtiyānī's 1976/1982 editions, the Ḥasan-zādeh Āmulī 1381 SH / 2002–03 edition, and independent ancestor manuscript leads have not been actually collated against one another in this stage. An independent manuscript with the lost portion is required to repair a lacuna responsibly. None of the grandson's explanatory prose may stand in for unknown ancestral words.

**Critical edition verdict:** the presently published material is a **source-critical bilingual working edition with a full preliminary apparatus**, **not a definitive, exhaustively collated critical edition**. Reaching the original conclusion and listing manuscripts are not the same as establishing the original.

## Stage 10: independent manuscript catalogue verification and separate matn witness (3 November 2026)

**New [manuscript collation dossier](MANUSCRIPT_COLLATION_DOSSIER.md) and [machine-readable 61-locus register](COLLATION_REGISTER.json).**

The **three independently catalogued copies of the original matn** are verified to their own Fahares pages: [Farhang va Honar alif-28, copied 851 AH](https://www.fahares.net/m/242468), [Āstān Quds 812, 1067 AH and 18 folios](https://www.fahares.net/m/242469), and [Āstān Quds 822, undated](https://www.fahares.net/m/242470). This verifies **catalogue identification only**, not visual readings or manuscript collation.

The catalogue's **shared work-level incipit** reads «الحمد لله رب العالمين والصلاة على نبيه محمد وآله أجمعين» while the electronic Āshtiyānī original extract in QT-001 opens «الحمد لوليّه والصلاة على نبيّه محمد وآله». These are substantially different. This difference is preserved *as catalogue report F*, while the public QT-001 reading adopts «الحمد لله رب العالمين» editorially. A's competing wording remains in the apparatus; no critical manuscript judgement is claimed. Do not attribute the same catalogue quotation to M₁, M₂ and M₃ as three independent readings. Both catalogue and Gnamma agree about the original **closing formula**, QT-061.

A **separate edition of the original matn**, edited by **Majīd Hādīzādeh**, is now bibliographically verified in *Nuṣūṣ wa-Rasāʾil min Turāth Iṣfahān al-ʿIlmī al-Khālid*, **vol. IV pp.37–72** (2018 journal *al-Khizāna*, p.521, no.301; journal PDF screenshot checked). **The 36 printed pages have not been acquired**, so their contents and the possibility that QT-059 is restored remain undetermined. The previously found online PDF set comprises only vols. I–III.

Astan Quds's documented digital manuscript-request process is [digital.aqr.ir](https://digital.aqr.ir/), subject to library access rules. No submission or reply occurred in this task; both Persian and Arabic draft requests are saved in the dossier. **Zero original manuscript folios read; zero independent collated manuscript variants; QT-059 substantial omission remains open.**

## Short editorial decision — opening convention (3 November 2026)

Per the project's house style, QT-001 now begins **«الحمد لله رب العالمين»**, a conventional opening reported in the Fahares work-level catalogue. The Arabic source-copy wording **«الحمد لوليّه»** is not deleted from the historical apparatus. The decision affects only the *reader's opening formula*; it does not imply that a manuscript leaf has been inspected. No further editorial time should be spent on the opening until the more serious defects are resolved: **QT-059's missing text, witness collation, and the 61-lemma completeness/translation audit**.

## What this edition is NOT
- NOT the entire original treatise.
- NOT a manuscript-collated, stemmatically established, fully critical edition.
- NOT a translation of Ṣāʾin al-Dīn Ibn Turka's *Tamhīd*.
- NOT a diplomatic transcription of a photographed Arabic printing. Current base is the published digital transcription, lightly normalized for an accessible reader.
- NOT a witness comparison with the 1898, 2005, 2002–03 or 2018 published editions, since these have not yet been textually collated here.

## Textual handling
- **Ancestor's lemmata**: generally introduced in the published sharḥ by `قال: «…»`. A quotation may continue over the page boundary, with the commentator speaking only after the closing guillemet and `أقول`.
- **Commentator's layer**: `أقول: …`, supplementary proofs, and explanations of the ancestor are excluded from both Arabic matn and translated text. Their doctrinal use is confined to separately labelled notes.
- **Bracketed topical headings** in the printed commentary are editorial or commentator-layer headings and are *not* ascribed to the ancestor.
- **Variants**: readings followed by `خ` are recorded as reported by the printed edition, not independently assigned to specific manuscript witnesses. Uncertain transcriptions are tagged.
- **Source coordinates**: printed Arabic p. 48 corresponds to digital page index 244 in the online transcription. This is not PDF image page 244.
- **Paragraph and clause identifiers**: QT-001 etc. identify authorial units, not traditional section numbering. The independent manuscript sequence remains to be checked.

## Translation discipline
Preserve *wujūd* (existence), *wujūdāt khāṣṣa* (particular existences), *ishtirāk maʿnawī* (sharing a meaning), *ḥads* (intellectual intuition), *fikr* (discursive thought), *ḍarūrī* (necessary), *wājib li-dhātihi* (necessary through itself) and *taʿayyun* (determination) consistently, specifying when the commentator shifts technical senses from Avicennian philosophy to Akbarian thought. Do not read the strong ontological conclusion of the sharḥ back into the matn's initial semantic claim without explicit textual warrant.

## Quality gates still open
- [ ] Obtain photographic copies of the published base and page-check all Arabic lemmata.
- [ ] Systematically extract every subsequent ancestor's *qāla* in the sharḥ.
- [ ] Check whether any matn-only material is missing from the sharḥ through independent witnesses.
- [ ] Collate early Mashhad manuscript copy dated 851 AH and AQR 812/822 against base text.
- [ ] Collate additional modern printed editions against base.
- [ ] Review palaeographic variants, lemma boundaries, repetitions and omissions.
- [ ] Reassess translation and doctrinal terminology clause by clause, including authorial pronouns.
- [ ] Mark matn complete only when each witness line has a recorded corresponding translation.
- [ ] Undertake independent sharḥ translation **after** matn completion.

**External bibliography and witness leads:** see [WITNESS_REGISTER.md](WITNESS_REGISTER.md). **Current text:** [parallel-matn.md](../data/parallel-matn.md).

**English translation comparator:** Joseph E. B. Lumbard, “Establishing the Principles,” *An Anthology of Philosophy in Persia*, vol. IV, pp. 464–479. A clause-by-clause [Lumbard comparison and attribution audit](LUMBARD_COMPARISON.md) now tracks his technical choices, identifies his editorial-heading note, and distinguishes quotations from the ancestor's *other* works from the original *Qawāʿid* matn. The new English translation is independently authored, not reproduced from Lumbard.

_Gnamma Research · editorial status v0.9 · 3 November 2026_


**Technical bridge glossary:** [Matn-anchored Avicennian–Akbarian terminology](TECHNICAL_GLOSSARY.md), with distinct layers for original claims, objections, and later glosses.
