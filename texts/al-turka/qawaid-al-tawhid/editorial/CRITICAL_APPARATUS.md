# Qawāʿid al-Tawḥīd — critical apparatus and textual decisions (v0.9)

**Author:** Afḍal al-Dīn / Abū Ḥāmid Muḥammad Turka al-Iṣfahānī. **Commentator:** Ṣāʾin al-Dīn ʿAlī Ibn Turka.

**Date:** 3 November 2026. **Editorial status:** **PROVISIONAL, LACUNOSE, NOT MANUSCRIPT-COLLATED.**

This apparatus is a critical *audit of a working edition*, not a claim that a classical critical edition has already been established. It accompanies [the complete currently recovered bilingual set](../data/parallel-matn.md) and the [readable website](../). The original's quoted text reaches its explicit closing formula on Āshtiyānī's printed p.270, yet the transmitted source has at least one substantial reported loss (QT-059) and many unstable readings.

## 1. Scope of the present edition

- **61** source-located authorial quotations, QT-001–QT-061, reconstructed from the grandson's embedded **قال** passages in the 1982 Āshtiyānī *Tamhīd*, printed pp.48–270.
- **7044** whitespace-delimited Arabic tokens and **9359** English translation tokens in the current working dataset. They are word counts, **not** a page-exhaustiveness certificate.
- **69** entries in the current variant/problem register. They are **not** 69 independently collated variants: see the types below.
- An explicit first-person authorial closing at QT-061. Existence of a closing formula proves *that the last passage was found*, not that everything in the separate original manuscript survives between the beginning and the end.

### Classifications used

| Editorial type | Number | Meaning |
|---|---:|---|
| `reported-in-edition` | 50 | Reading reported in the electronic edition's apparatus (witness siglum not verified) |
| `unclassified-requires-image-check` | 3 | Source relationship cannot yet be classified without the printed photograph |
| `editorial-conjecture` | 14 | Conjectural reading, editorial correction, or hypothetical deletion; **not** an attested independent reading |
| `commentarial-parallel` | 1 | Interpretative parallel from the descendant's commentary; not a second manuscript witness |
| `reported-lacuna` | 1 | A reported textual lacuna, not a variant reading |

The underlying electronic transcription frequently reports notes marked خ and ظ. Without checking the image of the printed apparatus, one cannot confidently assign خ to a named manuscript, treat ظ as a witnessed variant, or decide the editor's preferred reading. All sources remain *provisional*.

## New catalogue incipit and separate original printed text (3 November 2026)

The existing apparatus enumerates **69 transcription/variant/conjecture records** from the previous electronic-edition audit. A **new catalogue-transcribed comparison** must be held separately, rather than deceptively increasing the number of witnessed Arabic variants:

- **QT-001, A base:** «الحمد لوليّه، والصلاة على نبيّه محمد وآله. وبعد، فإن تقرير مسألة التوحيد ...»
- **F, published *FANKHĀ* shared work-level incipit:** «الحمدلله رب العالمین و الصلوة علی نبیه محمد و آله اجمعین فان تقریر مسئلة التوحید ...»; [catalogue](https://www.fahares.net/w/51946), manuscript catalogue entries [M₁](https://www.fahares.net/m/242468), [M₂](https://www.fahares.net/m/242469), [M₃](https://www.fahares.net/m/242470). **Source grade C, catalogue report, not direct photographs; F is a common incipit repeated in all entries, not three independent collations.**
- Bibliographer Āghā Buzurg al-Ṭihrānī's *al-Dharīʿa*, XVII, entry 952 also quotes an A-type incipit «الحمد لوليه ...»; this is another secondary report, not a codex.
- **QT-061:** F's shared explicit includes «وهذا آخر ما اردنا ان نورده فی هذه الرساله», consistent with A. The coincidence of final formula does not establish that intervening matn is intact.
- **P₁ — new printed original-matn comparator:** *Qawāʿid al-Tawḥīd*, ed. **Majīd Hādīzādeh**, *Nuṣūṣ wa-Rasāʾil min Turāth Iṣfahān al-ʿIlmī al-Khālid*, IV:37–72, bibliographically confirmed against photographed [*al-Khizāna* p.521 no.301](https://bibliography.mk.iq/files/0080f66f58b21603.pdf). **Actual edited pages not accessed**. Do not attribute any proposed QT-059 restoration to P₁.
- **QT-059 remains lacunose:** No original scanned copy has been obtained or read. A substantive defect cannot be emended by speculative doctrinal reconstruction.

Detailed [manuscript recovery and bibliography dossier](MANUSCRIPT_COLLATION_DOSSIER.md); [61-unit structured collation register](COLLATION_REGISTER.json). **No change of Arabic base text is licensed yet.**

## 2. Source hierarchy and sigla

| Siglum | Source | Actual use in this edition |
|---|---|---|
| **A** | Ibn Turka, *Tamhīd*, ed. Jalāl al-Dīn Āshtiyānī, Tehran, second edition 1360 Sh/1982; [digital transcription](https://ablibrary.net/book_content/b/17638/244?lang=ar) | **Only actual Arabic base examined during the earlier translation stages** (electronic transcription, lightly normalized; page photographs not compared). |
| **T₁** | 1315 AH / 1898 Tehran printing, 234 pp.; [bibliographical notice](https://kias.sakura.ne.jp/ibnarabi/index.php/Sain_al-Din_Turka), [Google Play scan listing](https://play.google.com/store/books/details?id=-Wku6DfHLa8C) | Located bibliographically; **text not collated**. |
| **A₁** | Āshtiyānī earlier Tehran printing, 1976; [edition chronology](https://kias.sakura.ne.jp/ibnarabi/index.php/Sain_al-Din_Turka) | Bibliographical antecedent; not a fresh witness until a direct copy is read. |
| **Ḥ** | Edited/annotated by Ḥasan-zādeh Āmulī, Qum 1381 Sh / 2002–03, [WorldCat record](https://search.worldcat.org/title/64451311) | Located bibliographically; **no Arabic page-by-page collation performed**. |
| **R** | Edited/annotated by Ḥasan al-Ramaḍānī al-Khurāsānī, Beirut, 2018, 676 pp., [publisher](https://darmaarefhekmiya.org/) | Additional printing available in publication records; no Arabic collation performed. |
| **M₁** | Mashhad Farhang va Honar MS alif-28, reported copy of original by Aḥmad ibn ʿAlī al-Bayhaqī dated 851 AH | Manuscript **lead only** in inherited working register; direct catalog images, foliation and shelfmark require verification. |
| **M₂** | Mashhad Astan-i Quds Riḍawī MS 812, reported copy dated 1067 AH, ca. 18 ff. | Manuscript **lead only**, not seen or collated. |
| **M₃** | Mashhad Astan-i Quds Riḍawī MS 822 | Manuscript **lead only**, not seen or collated. |
| **L** | Joseph E. B. Lumbard, “Establishing the Principles,” *An Anthology of Philosophy in Persia* IV, 464–479; [selection PDF](https://traditionalhikma.com/wp-content/uploads/2015/08/Annotated-translation-from-Tamhi%CC%84d-al-Qawa%CC%84%CA%BEid-of-Ibn-Turkah-al-Is%CC%A3faha%CC%84ni%CC%84-by-Joseph-Lumbard.pdf) | Useful **English translation comparator**, principally QT-001–006. **Not an Arabic manuscript witness**. |
| **D** | Āghā Buzurg al-Ṭihrānī, *al-Dharīʿa*, vol.17 entry 952, [bibliographical text](https://www.masaha.org/book/view/1689/page/238) | Confirms the ancestor's distinct *Qawāʿid* and the opening incipit; **not a collation witness**. |

**No stemma codicum is justified:** no independent manuscript has been directly compared with the adopted text. Nor can modern editions be counted as independent codices without tracing their exemplar relationships. In particular, the famous unrelated *al-Tamhīd li-Qawāʿid al-Tawḥīd* of Abū al-Muʿīn al-Nasafī is **not** a witness to this Akbarian text.

## 3. Editorial conventions

1. **Arabic text:** provisional readable normalization of A's online transcription. Ordinary punctuation and diacritics are modern; no claim of a diplomatic text. The printed and transcribed word forms must be separately preserved once photographed.
2. **English:** independent translation of the recovered matn, not a copy of Lumbard. Terms such as *wujūd*, *taʿayyun*, *iʿdād*, *ifāḍa*, *ḥads*, *fikr*, *ʿaql*, *shakhṣiyya* and *malaka* are interpreted contextually.
3. **Authorship:** original author's **قال** quotations only; the descendant's **أقول**, Persian marginalia, modern headings and quotations from the ancestor's *other* books are excluded.
4. **Variant register:** quoted alternatives follow the existing editorial notebook and must be checked against photographed print and explicit manuscript sigla. A conjecture is never promoted to a manuscript reading by grammatical plausibility alone.
5. **Losses:** mark the QT-059 loss as **⟦سقط: مقدارُه غيرُ متحقَّق⟧** *in the apparatus, not as silently invented Arabic inside the matn*. Its exact position and extent require direct inspection.
6. **No silently imposed philosophy:** a later commentator's fuller Akbarian account cannot establish the ancestor's exact claim where the surviving words are ambiguous. Rival voices in nested **فإن قيل...قلنا** arguments remain rival voices.
7. **Edition completeness:** “quoted sequence found through the end” means only that 61 lemmata were extracted from the available commentary. It is *not* proof that a separately circulating original matn would contain no other wording.

## 4. High-priority textual decisions

**D1 — QT-005, printed p.55 (semantic sharing).** Retain the distinction between a common *meaning* of existence and the stronger metaphysical unity elaborated by the grandson. Lumbard's corresponding English is useful for interpretative comparison but not a substitute for the Arabic.

**D2 — QT-024, p.109 (بالفرض / بالعرض).** Flag as a conceptual alternative. A difference between 'by supposition' and 'incidentally' changes the logic of the argument about mental and external existence. No definitive preference without witnesses.

**D3 — QT-025, pp.111–112 (عن / عين).** The contextual preference for عين is not automatically the printed ancestor's wording. Preserve the transmitted base and label the grandson's paraphrase secondary.

**D4 — QT-035–036, pp.154–161 (extra or repeated matter).** Do not delete suspected dittography before photographed comparison. Repeated passages and competing titles of related works remain open.

**D5 — QT-043, p.194 (repetition and faculties).** Keep separate the printed الحاسّة/الحادسة alternative from the modern conjecture about repeated wording.

**D6 — QT-052, p.237 (syntax).** The lemma of the reported discrepancy does not itself establish a continuous grammatical base; request a full leaf image before alteration.

**D7 — QT-054, p.248 (doubled clause and adopted correction).** The normalized reader already uses العقل where the registered base-like form is العقلي. Mark this as editorial normalization pending photographic validation; do not call the reader diplomatic.

**D8 — QT-056, p.253 (negative).** Preserve the printed فلا يجوز and set an interpretative flag where it opposes the nearby therapy-of-contraries argument. The addition of إلا is a conjecture, not a witnessed reading.

**D9 — QT-059, pp.262–264 (physical omission).** The reported substantial scribal loss prevents a complete critical edition. The surviving translation ends/continues around the reported omission; exact insertion of a replacement is barred without another witness.

**D10 — QT-060, p.267 (silent conjectures).** The reader currently prints المغرقة and فليتقِ while variant records point to printed-like المفرفة and فيتقن. Their adoption is acknowledged as conjectural normalization; source photographs are required for a diplomatic copy. The apparatus makes the mismatch searchable.

**D11 — QT-061, p.270 (last passage).** The final question of conflicting unveilings and the need for logical discrimination is an original author's conclusion. The following **أقول** is a separate work layer.

## 5. Complete per-lemma apparatus

Every item below represents what the current working edition **records**. It is not newly verified against T₁, Ḥ, R, or manuscripts. Absence of a recorded alternative is *not proof that the witnesses agree*.

### QT-001 — Opening: the difficulty of tawḥīd

- **Location:** Āshtiyānī pp. 48. **Quoted Arabic incipit:** الحمد لوليّه، والصلاة على نبيّه محمد وآله. وبعد، فإن تقرير مسألة التوحيد على النحو الذي ذهب إلي…
- **Source link:** https://ablibrary.net/book_content/b/17638/244?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 0 variant/conjecture/lacuna entries.

*No explicit variant entry currently recorded. This does not establish textual unanimity.*

**Specific critical judgement:** Incipit should be checked against the bibliographical citation in al-Dharīʿa and Lumbard's translated selection. The bibliographical quotation is abridged and cannot prove an omission of Muḥammad.


---

### QT-002 — The opponents’ psychological objection

- **Location:** Āshtiyānī pp. 49. **Quoted Arabic incipit:** فإن الأكثرين منهم يزعمون أن القطع بها يدلّ على استحكام سوء المزاج في موضوعات القوى النفسانية، و…
- **Source link:** https://ablibrary.net/book_content/b/17638/245?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 1 variant/conjecture/lacuna entry.

1. **reported-in-edition** — lemma: `احتراق` ; alternative/observation: `احتراف`.
   Āshtiyānī's edition reports 'احتراف' as an alternative, signalled خ; verify against printed page and manuscript sigla. Reading reported in the electronic edition's apparatus (witness siglum not verified)



---

### QT-003 — Reversing the objection

- **Location:** Āshtiyānī pp. 52. **Quoted Arabic incipit:** لكن لمّا كان الأمر على خلاف ما ظنّوه، بل على عكس ما تخيّلوه…
- **Source link:** https://ablibrary.net/book_content/b/17638/248?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 0 variant/conjecture/lacuna entries.

*No explicit variant entry currently recorded. This does not establish textual unanimity.*



---

### QT-004 — The purpose of the treatise and exhortation

- **Location:** Āshtiyānī pp. 53–54. **Quoted Arabic incipit:** أردت أن أكتب رسالة، أوضح فيها حقّية مذهب العارفين، وبطلان قول الطاعنين من المنكرين، مشتملة على …
- **Source link:** https://ablibrary.net/book_content/b/17638/249?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 6 variant/conjecture/lacuna entries.

1. **reported-in-edition** — lemma: `حقّية` ; alternative/observation: `حقيقة`.
   Both are recorded; base signifies the truth/rightfulness of the doctrine, variant could mean its reality/nature. Reading reported in the electronic edition's apparatus (witness siglum not verified)

2. **reported-in-edition** — lemma: `من الحدس` ; alternative/observation: `بالحدس`.
   Reported variation in preposition. Reading reported in the electronic edition's apparatus (witness siglum not verified)

3. **reported-in-edition** — lemma: `وأردنا` ; alternative/observation: `ورأينا`.
   Reported reading alters the verb, and removes the abrupt shift from singular to plural. Reading reported in the electronic edition's apparatus (witness siglum not verified)

4. **unclassified-requires-image-check** — lemma: `المناظرين` ; alternative/observation: `الناظرين`.
   Disputants versus speculative investigators. Source relationship cannot yet be classified without the printed photograph

5. **unclassified-requires-image-check** — lemma: `نشدّ` ; alternative/observation: `تشتدّ`.
   Changes verbal subject and the syntax of 'desire'. Source relationship cannot yet be classified without the printed photograph

6. **editorial-conjecture** — lemma: `والبقاء` ; alternative/observation: `بالبقاء [digital transcription uncertain]`.
   The digitized witness reads يالبقاء in its variant note, plausibly an OCR/transcription error; manuscript or printed-image confirmation pending. Conjectural reading, editorial correction, or hypothetical deletion; **not** an attested independent reading

**Specific critical judgement:** Distinguish the Aristotelian/Avicennian technical ḥads from a general inspiratory experience. Not every change in Lumbard's English is an Arabic variant.


---

### QT-005 — Existence is common in meaning, not merely in word

- **Location:** Āshtiyānī pp. 55. **Quoted Arabic incipit:** اعلم أن الوجود مشترك بين الوجودات الخاصّة كلّها لا بحسب اللفظ، بل بحسب المعنى، كما بيّنّاه في س…
- **Source link:** https://ablibrary.net/book_content/b/17638/251?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 0 variant/conjecture/lacuna entries.

*No explicit variant entry currently recorded. This does not establish textual unanimity.*

**Specific critical judgement:** The statement about existence being shared 'in meaning' must not be converted into a mereological claim. Lumbard's English rendering is a comparator, not an Arabic witness.


---

### QT-006 — The necessity of the reality of existence

- **Location:** Āshtiyānī pp. 59–60. **Quoted Arabic incipit:** ومن البيّن أن حقيقته من حيث هي هي لا يقبل العدم لذاتها، لامتناع اتّصاف أحد النقيضين بالآخر، وام…
- **Source link:** https://ablibrary.net/book_content/b/17638/255?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 0 variant/conjecture/lacuna entries.

*No explicit variant entry currently recorded. This does not establish textual unanimity.*

**Specific critical judgement:** A short proof of necessity; the grandson adds independent demonstrations. The Arabic gender agreement in the printed quote remains under scrutiny.


---

### QT-007 — The necessary reality cannot be qualified

- **Location:** Āshtiyānī pp. 63–64. **Quoted Arabic incipit:** وتلك الحقيقة الواجبة لذاتها غير المأخوذة بقيد العموم، إذ لا تحقّق للأمر العام من حيث هو عام في …
- **Source link:** https://ablibrary.net/book_content/b/17638/259?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 0 variant/conjecture/lacuna entries.

*No explicit variant entry currently recorded. This does not establish textual unanimity.*



---

### QT-008 — Objection: the necessary nature as a correlate of common existence

- **Location:** Āshtiyānī pp. 67. **Quoted Arabic incipit:** فلئن قيل: إن الحقيقة الواجبة هي الطبيعة التي هي من ملزومات ما ذُكر من الوجود الذي يشترك فيه جمي…
- **Source link:** https://ablibrary.net/book_content/b/17638/263?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 0 variant/conjecture/lacuna entries.

*No explicit variant entry currently recorded. This does not establish textual unanimity.*



---

### QT-009 — Objection developed: predication of existence by gradation

- **Location:** Āshtiyānī pp. 68. **Quoted Arabic incipit:** ولا يلزم من هذا أن تكون تلك الحقيقة من الماهيّات المغايرة للوجود، فيكون مؤثّرة للوجود لا بشرط ا…
- **Source link:** https://ablibrary.net/book_content/b/17638/264?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 0 variant/conjecture/lacuna entries.

*No explicit variant entry currently recorded. This does not establish textual unanimity.*



---

### QT-010 — The 'twice existent' objection

- **Location:** Āshtiyānī pp. 71. **Quoted Arabic incipit:** ولا يلزم أن تكون تلك الحقيقة موجودة مرّتين، كسائر الوجودات الباقية، فإن الموجودية المشتركة بينه…
- **Source link:** https://ablibrary.net/book_content/b/17638/267?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 0 variant/conjecture/lacuna entries.

*No explicit variant entry currently recorded. This does not establish textual unanimity.*



---

### QT-011 — Reply: intrinsic and extrinsic modal status of instances

- **Location:** Āshtiyānī pp. 72. **Quoted Arabic incipit:** قلنا: إن الطبيعة الواجبة الملزومة لمطلق الوجود إن صحّ أن تكون ذات أفراد ذهنية أو عقلية، فلو وُج…
- **Source link:** https://ablibrary.net/book_content/b/17638/268?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 0 variant/conjecture/lacuna entries.

*No explicit variant entry currently recorded. This does not establish textual unanimity.*



---

### QT-012 — Intrinsic determination and the impossibility of multiple instances

- **Location:** Āshtiyānī pp. 74. **Quoted Arabic incipit:** وإن لم يمكن أن تكون ذات أفراد ذهنية أو عقلية، إمّا لأن تعيّنها نفس حقيقتها في الخارج، أو لأنها …
- **Source link:** https://ablibrary.net/book_content/b/17638/270?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 0 variant/conjecture/lacuna entries.

*No explicit variant entry currently recorded. This does not establish textual unanimity.*



---

### QT-013 — The dilemma of distinct existence and a supposed necessary nature

- **Location:** Āshtiyānī pp. 78. **Quoted Arabic incipit:** فإن كانت حقيقته من حيث هي مغايرة لحقيقة الوجود الخارجي والكون العيني الذي تتكون به الماهيات [ال…
- **Source link:** https://ablibrary.net/book_content/b/17638/274?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 2 variant/conjecture/lacuna entries.

1. **reported-in-edition** — lemma: `فيه` ; alternative/observation: `فيها`.
   Reported printed alternative in the clause واشتراكها فيه; grammatical antecedent needs collation. Reading reported in the electronic edition's apparatus (witness siglum not verified)

2. **reported-in-edition** — lemma: `لشيء` ; alternative/observation: `شيء`.
   The digital edition prints a redundant-looking alternative; neither an independent witness nor a justified emendation yet. Reading reported in the electronic edition's apparatus (witness siglum not verified)



---

### QT-014 — Indistinguishable similars cannot have opposite ontological roles

- **Location:** Āshtiyānī pp. 81. **Quoted Arabic incipit:** على أن اجتماع الأمثال واختصاص أحد المتماثلين بالحالّية والآخر بالمحلّية، واتصاف أحدهما بصفة دون…
- **Source link:** https://ablibrary.net/book_content/b/17638/277?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 0 variant/conjecture/lacuna entries.

*No explicit variant entry currently recorded. This does not establish textual unanimity.*



---

### QT-015 — Two alternatives for tashkīk—and the circularity of its proof

- **Location:** Āshtiyānī pp. 82–83. **Quoted Arabic incipit:** ثم إن الوجود الحاصل للماهيات المختلفة والطبائع المتخالفة لا يقبل الوجود والعدم لذاته لما أشير إ…
- **Source link:** https://ablibrary.net/book_content/b/17638/278?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 0 variant/conjecture/lacuna entries.

*No explicit variant entry currently recorded. This does not establish textual unanimity.*

**Specific critical judgement:** Keep distinct the adversary's graded predication thesis from the author's own endorsement; philosophical controversy does not authorize an automatic Sadrian reading.


---

### QT-016 — Can determination itself have differing meanings?

- **Location:** Āshtiyānī pp. 87. **Quoted Arabic incipit:** ثم إنا نقول: إن مفهوم تلك الطبيعة غير مفهوم شيء من التعيّنات التي هي من العوارض المستدعية لتحقّ…
- **Source link:** https://ablibrary.net/book_content/b/17638/283?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 1 variant/conjecture/lacuna entry.

1. **reported-in-edition** — lemma: `الحقيقة` ; alternative/observation: `حقيقته`.
   Reported in printed edition in the final 'كنه الحقيقة' clause. Reading reported in the electronic edition's apparatus (witness siglum not verified)



---

### QT-017 — Intrinsic determination is not merely bare thisness

- **Location:** Āshtiyānī pp. 89–90. **Quoted Arabic incipit:** ثم إن معنى كون تعيّنها نفسها في الأعيان، هو أنها يمتاز عمّا عداها بنفسها لا بصفة زائدة عليها في…
- **Source link:** https://ablibrary.net/book_content/b/17638/285?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 0 variant/conjecture/lacuna entries.

*No explicit variant entry currently recorded. This does not establish textual unanimity.*



---

### QT-018 — The Necessary is intellect, intellection, and intelligible

- **Location:** Āshtiyānī pp. 93. **Quoted Arabic incipit:** ولا نسلّم أنها غير معقولة لشيء من العقول، فإنّا قد برهنّا في سائر كتبنا الحكمية أنها عاقلة ومعق…
- **Source link:** https://ablibrary.net/book_content/b/17638/289?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 1 variant/conjecture/lacuna entry.

1. **reported-in-edition** — lemma: `معقولة` ; alternative/observation: `معقولية`.
   Printed alternative before لأكثر العقول; alters morphology and may require emendation. Reading reported in the electronic edition's apparatus (witness siglum not verified)



---

### QT-019 — Relation to something other is not necessarily contrariety

- **Location:** Āshtiyānī pp. 94. **Quoted Arabic incipit:** ولا نسلّم أنه يمتنع اقترانها بالغير واقتران الغير بها لو لم يُرد بالغير المنافي أو المقابل، لما…
- **Source link:** https://ablibrary.net/book_content/b/17638/290?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 0 variant/conjecture/lacuna entries.

*No explicit variant entry currently recorded. This does not establish textual unanimity.*



---

### QT-020 — A reciprocal objection against unrestricted necessary existence

- **Location:** Āshtiyānī pp. 95. **Quoted Arabic incipit:** فلئن قيل: لو صحّ ما ذكرتموه في بيان أن الواجب لذاته لا يجوز أن يكون تلك الطبيعة الملزومة للوجود…
- **Source link:** https://ablibrary.net/book_content/b/17638/291?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 1 variant/conjecture/lacuna entry.

1. **reported-in-edition** — lemma: `بعين` ; alternative/observation: `لعين`.
   Digitized print records لعين as alternative near the final predicate; the antecedent and case-ending remain unsettled. Reading reported in the electronic edition's apparatus (witness siglum not verified) **Anchor alert:** the recorded base lemma is not found verbatim in the current Arabic working reading.

**Specific critical judgement:** The variant record's lemma بعين is absent verbatim from the current normalized Arabic. Until the photographed print is read, the exact anchor and syntax cannot be guaranteed.


---

### QT-021 — Necessity need not restrict absolute existence

- **Location:** Āshtiyānī pp. 98. **Quoted Arabic incipit:** فلئن قيل: إن الحقيقة المطلقة لو كانت واجبة لذاتها قائمة بنفسها، لما كانت مطلقة، بل كانت مقيّدة …
- **Source link:** https://ablibrary.net/book_content/b/17638/294?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 0 variant/conjecture/lacuna entries.

*No explicit variant entry currently recorded. This does not establish textual unanimity.*



---

### QT-022 — Why answer objections even after a demonstration?

- **Location:** Āshtiyānī pp. 100–101. **Quoted Arabic incipit:** فلئن قيل: لو صحّ أن تكون حقيقته المطلقة من حيث هي مطلقة قائمة بنفسها بحسب الوجود في الأعيان، من…
- **Source link:** https://ablibrary.net/book_content/b/17638/296?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 0 variant/conjecture/lacuna entries.

*No explicit variant entry currently recorded. This does not establish textual unanimity.*



---

### QT-023 — Four ways to understand a particular existent

- **Location:** Āshtiyānī pp. 106. **Quoted Arabic incipit:** ومن الضروري أن دعوى الضرورة في محلّ النزاع غير مسموعة. على أن الوجود الخاصّ الممكن الذي ذُكر، ل…
- **Source link:** https://ablibrary.net/book_content/b/17638/302?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 0 variant/conjecture/lacuna entries.

*No explicit variant entry currently recorded. This does not establish textual unanimity.*



---

### QT-024 — Mental existence and external existence are one in essence

- **Location:** Āshtiyānī pp. 109. **Quoted Arabic incipit:** فلئن قيل: إن الوجود الذهني الذي يمتنع أن يوجد في الأعيان فرد من أفراد الوجود المطلق الذي يكون م…
- **Source link:** https://ablibrary.net/book_content/b/17638/305?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 1 variant/conjecture/lacuna entry.

1. **reported-in-edition** — lemma: `بالفرض` ; alternative/observation: `بالعرض`.
   Reported printed alternative; materially changes the epistemic/ontological description of conceptual existentness. Reading reported in the electronic edition's apparatus (witness siglum not verified)

**Specific critical judgement:** بالفرض and بالعرض are not interchangeable. The former locates the distinction 'by supposition'; the latter can make it 'accidental' or 'by concomitance'. No preference can be proved from a single transcription.


---

### QT-025 — The First Principle cannot be one separate species among existents

- **Location:** Āshtiyānī pp. 111–112. **Quoted Arabic incipit:** تنبيه: اعلم أن اعتقاد كون المبدأ الأول الواجب بذاته أنيّة خاصّة نوعيّة، يلزم من فرضها على ما يق…
- **Source link:** https://ablibrary.net/book_content/b/17638/307?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 1 variant/conjecture/lacuna entry.

1. **reported-in-edition** — lemma: `يتبيّن` ; alternative/observation: `يبيّن`.
   Reported printed variant in the appeal to certainty. Reading reported in the electronic edition's apparatus (witness siglum not verified)

**Specific critical judgement:** The printed string تكون طبيعته عن تلك الأكوان is philosophically strained, whereas the grandson paraphrases عين طبيعتها on p.114. This is internal interpretative evidence only. Preserve the printed عن, and flag عين as a possible correction, not an independent variant.


---

### QT-026 — Why absolute existence, not its determinations, is primordial

- **Location:** Āshtiyānī pp. 114. **Quoted Arabic incipit:** ومتى عرفت هذا فنقول: إنّ من الأولى الأوجب أن نجعل الكون الحقيقيّ العينيّ الكون المطلق الذي يحيط…
- **Source link:** https://ablibrary.net/book_content/b/17638/310?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 0 variant/conjecture/lacuna entries.

*No explicit variant entry currently recorded. This does not establish textual unanimity.*



---

### QT-027 — Pure absolute existence and the non-attribution of names

- **Location:** Āshtiyānī pp. 118. **Quoted Arabic incipit:** ومتى تقرّر هذا عرفت أنّ الحقّ هو الوجود المطلق الذي لا اختلاف فيه ولا تكثّر، بل هو محض الوجود ب…
- **Source link:** https://ablibrary.net/book_content/b/17638/314?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 2 variant/conjecture/lacuna entries.

1. **reported-in-edition** — lemma: `عرفت` ; alternative/observation: `عرّف`.
   Reported variant affecting verbal form at the opening. Reading reported in the electronic edition's apparatus (witness siglum not verified)

2. **reported-in-edition** — lemma: `التحقيق` ; alternative/observation: `التحقق`.
   Alternative reading at the closing statement about contradiction. Reading reported in the electronic edition's apparatus (witness siglum not verified)



---

### QT-028 — Knowledge as the first relation of the Absolute Essence

- **Location:** Āshtiyānī pp. 121. **Quoted Arabic incipit:** واعلم أنّ تلك الهويّة المطلقة الواحدة بالوحدة الحقيقيّة تلزمها النسبة العلميّة أولاً بحصول نفسه…
- **Source link:** https://ablibrary.net/book_content/b/17638/317?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 0 variant/conjecture/lacuna entries.

*No explicit variant entry currently recorded. This does not establish textual unanimity.*



---

### QT-029 — Knowing the Essence entails knowledge of its necessary attributes

- **Location:** Āshtiyānī pp. 130–131. **Quoted Arabic incipit:** ثم إن إدراكها لذاتها يتضمّن إدراك سائر الصفات التي تلزمها، لكونها عين ذاتها، وإدراك جميع ما تست…
- **Source link:** https://ablibrary.net/book_content/b/17638/326?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 0 variant/conjecture/lacuna entries.

*No explicit variant entry currently recorded. This does not establish textual unanimity.*



---

### QT-030 — Comprehensive divine knowledge and a criticism of Peripatetic causality

- **Location:** Āshtiyānī pp. 133. **Quoted Arabic incipit:** ويوجبه أيضاً على النسق المنتظم في الوجود الخارجي علماً إجمالياً جمعياً لا تفصيلياً، لا لما قيل:…
- **Source link:** https://ablibrary.net/book_content/b/17638/329?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 2 variant/conjecture/lacuna entries.

1. **reported-in-edition** — lemma: `أنها` ; alternative/observation: `كونها`.
   Editorially signalled alternative [كونها - ظ] inside the phrase من حيث هي أنها مغايرة. Reading reported in the electronic edition's apparatus (witness siglum not verified)

2. **editorial-conjecture** — lemma: `غير الفرضيين` ; alternative/observation: `العرضيين`.
   Editorially conjectured [العرضيين - ظ]; affects whether existence is excluded as merely supposed or as accidental. Conjectural reading, editorial correction, or hypothetical deletion; **not** an attested independent reading

**Specific critical judgement:** Source has الفرضيين versus an editorially suggested العرضيين. This may change the metaphysical claim; current Arabic should not be silently rationalized.


---

### QT-031 — Knowing and being known do not necessitate two divine realities

- **Location:** Āshtiyānī pp. 137–138. **Quoted Arabic incipit:** فإن قيل: العاقليّة يقابل المعقوليّة، فعند انتفاء المغايرة فلا عاقليّة ولا معقوليّة. قلنا: لو صح…
- **Source link:** https://ablibrary.net/book_content/b/17638/333?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 1 variant/conjecture/lacuna entry.

1. **reported-in-edition** — lemma: `فإن قيل` ; alternative/observation: `فلئن قيل`.
   Printed alternative at opening of the objection. Reading reported in the electronic edition's apparatus (witness siglum not verified)



---

### QT-032 — Manifestation from hiddenness into witnessing

- **Location:** Āshtiyānī pp. 141. **Quoted Arabic incipit:** ثم إنها اقتضت الظهور والبروز من حدّ الغيب إلى حدّ الشهادة، وحصول تلك الصفات والتعيّنات متمايزة …
- **Source link:** https://ablibrary.net/book_content/b/17638/337?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 0 variant/conjecture/lacuna entries.

*No explicit variant entry currently recorded. This does not establish textual unanimity.*



---

### QT-033 — The worlds of spirits, image, and bodies

- **Location:** Āshtiyānī pp. 143–144. **Quoted Arabic incipit:** فأوجدت عالم الأرواح، أي عالم العقول والنفوس، فإن ظهور الجود فيه أتمّ من عالم المعاني، ثم عالم ا…
- **Source link:** https://ablibrary.net/book_content/b/17638/339?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 1 variant/conjecture/lacuna entry.

1. **reported-in-edition** — lemma: `ملخّص` ; alternative/observation: `تلخيص`.
   Reported alternative near reference to arguments in the author's other philosophical books. Reading reported in the electronic edition's apparatus (witness siglum not verified)



---

### QT-034 — Six objections: possibility, generation, imagination, and the scale of perfection

- **Location:** Āshtiyānī pp. 148–149. **Quoted Arabic incipit:** فلئن قيل: فعلى هذا لا سبيل إلى القول بالإمكان، لكون الوجود واجباً بالذات، وكون الماهيّات والنسب…
- **Source link:** https://ablibrary.net/book_content/b/17638/344?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 2 variant/conjecture/lacuna entries.

1. **editorial-conjecture** — lemma: `أنبتوها` ; alternative/observation: `أثبتوها [editorial conjecture only]`.
   Digital text reads أنبتوها, but context requires critical verification; أثبتوها is not independently attested in the consulted witnesses. Conjectural reading, editorial correction, or hypothetical deletion; **not** an attested independent reading

2. **reported-in-edition** — lemma: `بنا إلى التطويل` ; alternative/observation: `بنا على التطويل / إلى التطويل`.
   Digital edition has problematic بنا على التطويل and editor-supplied إلى التطويل; English normalizes the idiom but Arabic witness still requires image-checking. Reading reported in the electronic edition's apparatus (witness siglum not verified)



---

### QT-035 — What bears possibility? Existing quiddities versus existence itself

- **Location:** Āshtiyānī pp. 154. **Quoted Arabic incipit:** قلنا: إن موضوعات الإمكان ومتعلّقاته بالطبع هي التعيّنات، ولا نسلّم أن الماهيّات والنسب والإضافا…
- **Source link:** https://ablibrary.net/book_content/b/17638/350?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 3 variant/conjecture/lacuna entries.

1. **reported-in-edition** — lemma: `فإنها لو قارنها الوجود صارت موجودة بالضرورة` ; alternative/observation: `فإنها لو قارنت الوجود`.
   Second formulation signalled خ ل, with a stray الوجود in the digitized text after the parenthesis. Reading reported in the electronic edition's apparatus (witness siglum not verified)

2. **reported-in-edition** — lemma: `الماهية` ; alternative/observation: `الماهيات`.
   Printed alternative in ولو كانت الماهية. Reading reported in the electronic edition's apparatus (witness siglum not verified)

3. **editorial-conjecture** — lemma: `العوارض الذهنية` ; alternative/observation: `العدمية [editorial suggestion]`.
   Digitized base shows الذهنية with [العدمية - ظ]; choose only after image and witness checks. Conjectural reading, editorial correction, or hypothetical deletion; **not** an attested independent reading

**Specific critical judgement:** The two presentations of the existence/quiddity relation and an extra الوجود need comparison with the actual page layout, not a speculative deletion.


---

### QT-036 — Kinds and modes of manifestation at successive levels

- **Location:** Āshtiyānī pp. 160–161. **Quoted Arabic incipit:** وأما الطبيعة النوعيّة التي يشمل النوع العيني والعقلي، لمّا اقتضت الظهور العيني تعيّنت بالتعيّن …
- **Source link:** https://ablibrary.net/book_content/b/17638/356?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 3 variant/conjecture/lacuna entries.

1. **reported-in-edition** — lemma: `في الظهور` ; alternative/observation: `في الطور`.
   The digital base reads في الظهور with في الطور marked as a variant; BASE في الظهور is retained in Arabic pending independent collation. Reading reported in the electronic edition's apparatus (witness siglum not verified)

2. **reported-in-edition** — lemma: `الحكمة المنيعة` ; alternative/observation: `الحكمة المتقنة / الحكمة المتبعة`.
   Three reported readings of the separately authored work's title. Reading reported in the electronic edition's apparatus (witness siglum not verified)

3. **editorial-conjecture** — lemma: `وحصل باعتبار بعض صفات أخر… [twice]` ; alternative/observation: `one occurrence [unverified conjecture]`.
   Apparent repeated line, preserved; independent print comparison required. Conjectural reading, editorial correction, or hypothetical deletion; **not** an attested independent reading **Anchor note:** this is a descriptive or composite issue, not a literal continuous lemma.

**Specific critical judgement:** Reported repeated sentence needs a full-page photographic comparison. No claim of dittography can be definitive without a witness; the title of the ancestor's *other* work also has multiple reported forms.


---

### QT-037 — Why greater manifestation may occur at the lowest ontological level

- **Location:** Āshtiyānī pp. 164. **Quoted Arabic incipit:** وأما حديث الأكمليّة بحسب ظهور الوجود في المرتبة الأخيرة، فلعلّهم أرادوا بها أن ما يكون مدركاً ع…
- **Source link:** https://ablibrary.net/book_content/b/17638/360?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 2 variant/conjecture/lacuna entries.

1. **reported-in-edition** — lemma: `الإنية المدركة المتصرفة الأخيرة` ; alternative/observation: `الإنية المدركة المتصرفة في المرتبة الأخيرة`.
   Editorially reported option resolves the elliptical designation of the last level. Reading reported in the electronic edition's apparatus (witness siglum not verified)

2. **reported-in-edition** — lemma: `هي` ; alternative/observation: `هو`.
   Reported alternative in subordinate relative clause relating higher levels. Reading reported in the electronic edition's apparatus (witness siglum not verified)



---

### QT-038 — The perfected human being, stable cognitive dispositions, and death

- **Location:** Āshtiyānī pp. 167. **Quoted Arabic incipit:** والإنسان المستكمل لا يكون كماله إلا بأن تحصل له ملكات هذه الإدراكات في مراتبها، ولا يكون الإدرا…
- **Source link:** https://ablibrary.net/book_content/b/17638/363?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 0 variant/conjecture/lacuna entries.

*No explicit variant entry currently recorded. This does not establish textual unanimity.*



---

### QT-039 — The need for a comprehensive manifestation of the One

- **Location:** Āshtiyānī pp. 172–173. **Quoted Arabic incipit:** وإذا عرفت هذا فنقول: إن تلك الهويّة الواحدة بالوحدة الحقيقيّة لما غلب فيها أحكام الوحدة على أحك…
- **Source link:** https://ablibrary.net/book_content/b/17638/368?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 2 variant/conjecture/lacuna entries.

1. **reported-in-edition** — lemma: `تحت` ; alternative/observation: `بحسب`.
   Printed alternative after انمحى الكثرة: under the domination versus by reason of domination. Reading reported in the electronic edition's apparatus (witness siglum not verified)

2. **reported-in-edition** — lemma: `الحقائق الظلية` ; alternative/observation: `والمجالي الظلمانية`.
   Variant replaces shadow-like realities with darker loci of manifestation; material doctrinal difference. Reading reported in the electronic edition's apparatus (witness siglum not verified)



---

### QT-040 — Volitional self-disclosure in the Perfect Human

- **Location:** Āshtiyānī pp. 180. **Quoted Arabic incipit:** فانبعث انبعاثاً إراديّاً إلى المظهر الكلّي والكون الجامع الحاصر للأمر الإلهي، وهو الإنسان الكام…
- **Source link:** https://ablibrary.net/book_content/b/17638/376?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 1 variant/conjecture/lacuna entry.

1. **reported-in-edition** — lemma: `شأنه` ; alternative/observation: `نشئاته`.
   Reported alternative in بما في شأنه الكلية. Reading reported in the electronic edition's apparatus (witness siglum not verified)



---

### QT-041 — Critique of the mirror analogy: intellectual vision versus sensory vision

- **Location:** Āshtiyānī pp. 185–186. **Quoted Arabic incipit:** وما قيل: «إن رؤية الشيء نفسه بنفسه ما هي مثل رؤيته نفسه في أمر آخر يكون له كالمرآة، فإنه يظهر ل…
- **Source link:** https://ablibrary.net/book_content/b/17638/381?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 1 variant/conjecture/lacuna entry.

1. **reported-in-edition** — lemma: `تجلّيه له` ; alternative/observation: `تجلّيه فيه`.
   Reported variant in nested mirror quotation, at p. 186. Reading reported in the electronic edition's apparatus (witness siglum not verified)

**Specific critical judgement:** The author quotes Ibn ʿArabī and then offers criticism. Nested quotation attribution must preserve the speaker transition; the grandson's later defence cannot be inserted into the matn.


---

### QT-042 — Can the entire human cosmos mirror the complete divine image?

- **Location:** Āshtiyānī pp. 189–190. **Quoted Arabic incipit:** فإن قيل: العقل الأوّل لا يصلح لمرآتيّة صورته الجامعة لسائر صفاته الكماليّة والتعيّنات الأسمائيّ…
- **Source link:** https://ablibrary.net/book_content/b/17638/385?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 1 variant/conjecture/lacuna entry.

1. **reported-in-edition** — lemma: `موقياً` ; alternative/observation: `موق`.
   Digitized base offers an unclear double form in the first-page objection; morphology requires image-based verification. Reading reported in the electronic edition's apparatus (witness siglum not verified)



---

### QT-043 — Three possible subjects of the perfect mirror—and the infinity of human perfections

- **Location:** Āshtiyānī pp. 193–194–195. **Quoted Arabic incipit:** على أنّا نقول: إن حقيقة الحق وصورته الحقيقيّة لو كانت نفس حقيقة الإنسان وصورته، لم يبق فرق بين …
- **Source link:** https://ablibrary.net/book_content/b/17638/389?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 3 variant/conjecture/lacuna entries.

1. **reported-in-edition** — lemma: `الحاسّة` ; alternative/observation: `الحادسة`.
   Reported alternative p.194: sensory versus intuiting faculty; technically consequential. Reading reported in the electronic edition's apparatus (witness siglum not verified)

2. **reported-in-edition** — lemma: `النوع الإنساني` ; alternative/observation: `نوع الإنسان`.
   Alternative noted with the later expression جميع الكمالات الممكنة لنوع الإنساني. Reading reported in the electronic edition's apparatus (witness siglum not verified) **Anchor alert:** the recorded base lemma is not found verbatim in the current Arabic working reading.

3. **editorial-conjecture** — lemma: `لصحّ أن يقال ... لصحّ أن يقال` ; alternative/observation: `editorial suggestion: delete repeated passage`.
   Āshtiyānī's footnote (citing Mīrzā Hāshim) sees a scribal duplication; the transmitted wording is preserved pending witness collation. Conjectural reading, editorial correction, or hypothetical deletion; **not** an attested independent reading **Anchor note:** this is a descriptive or composite issue, not a literal continuous lemma.

**Specific critical judgement:** The electronic variant lemma النوع الإنساني does not occur verbatim in the current normalized Arabic, and the proposed deletion of repeated لصحّ is an editorial conjecture. Both are separately flagged.


---

### QT-044 — Can the cosmos be the mirror without making divine perfection dependent on it?

- **Location:** Āshtiyānī pp. 197–198. **Quoted Arabic incipit:** وحينئذ لو صحّ أن يجعل ذلك المظهر جميع أجزاء العالم الذي يكون من جملته الإنسان وأشخاصه، ثمّ إنّ …
- **Source link:** https://ablibrary.net/book_content/b/17638/393?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 2 variant/conjecture/lacuna entries.

1. **reported-in-edition** — lemma: `فلئن قيل` ; alternative/observation: `فلئن قلتم`.
   Printed alternative on p.198. Reading reported in the electronic edition's apparatus (witness siglum not verified)

2. **reported-in-edition** — lemma: `إلى بعض` ; alternative/observation: `إلى البعض`.
   Reported difference in the phrase انضمام بعضها إلى بعض. Reading reported in the electronic edition's apparatus (witness siglum not verified)



---

### QT-045 — Objection: detachment from bodily faculties versus the comprehensiveness of the Perfect Human

- **Location:** Āshtiyānī pp. 202–203. **Quoted Arabic incipit:** ثمّ إنّهم قد اتّفقوا على أنّ وصول الإنسان إلى حدّ الكمال الحقيقي لا يمكن إلّا بانحلال العقد وال…
- **Source link:** https://ablibrary.net/book_content/b/17638/398?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 1 variant/conjecture/lacuna entry.

1. **reported-in-edition** — lemma: `تقوية القوى القدسيّة` ; alternative/observation: `وتقوى القوى / وتقوى للقوى`.
   Printed alternatives in p.202; prefer coherent base 'strengthening holy faculties' until independent witness checking. Reading reported in the electronic edition's apparatus (witness siglum not verified)



---

### QT-046 — Objection: if perfection transcends intellect and expression, how can it be attained?

- **Location:** Āshtiyānī pp. 206–207. **Quoted Arabic incipit:** ثمّ إنّ من البيّن أنّ الكمال الذي يقولون به كالأمر الممتنع، لأنّه لو وصل إليه السالك وأدركه، لم…
- **Source link:** https://ablibrary.net/book_content/b/17638/402?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 2 variant/conjecture/lacuna entries.

1. **reported-in-edition** — lemma: `وبيّن` ; alternative/observation: `فإن`.
   Printed alternative before the claim about continual consideration of the Absolute. Reading reported in the electronic edition's apparatus (witness siglum not verified)

2. **editorial-conjecture** — lemma: `غايتها` ; alternative/observation: `غاياتها [unwitnessed editorial normalization]`.
   Singular as transmitted after plural pronouns; do not silently assume the corrected plural is an actual variant. Conjectural reading, editorial correction, or hypothetical deletion; **not** an attested independent reading



---

### QT-047 — Dialectical counter-objection: ascetic practice, humoral imbalance, and the validity of perception

- **Location:** Āshtiyānī pp. 212–213. **Quoted Arabic incipit:** على أنّا نقول: إنّ الكمالات الفعليّة المستندة إلى الحجج القويّة والبراهين القاطعة، الحاصلة للنف…
- **Source link:** https://ablibrary.net/book_content/b/17638/408?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 3 variant/conjecture/lacuna entries.

1. **commentarial-parallel** — lemma: `المناقض` ; alternative/observation: `المناقص (in grandson's reprise)`.
   Possible printed error, not manuscript-assigned. Interpretative parallel from the descendant's commentary; not a second manuscript witness

2. **reported-in-edition** — lemma: `تكليفيّة` ; alternative/observation: `تكلّفيّة`.
   Printed alternative for acquired psychic habit. Reading reported in the electronic edition's apparatus (witness siglum not verified)

3. **reported-in-edition** — lemma: `المولّدة للكيموسات` ; alternative/observation: `المؤديّة للكيموسات`.
   Printed p.212 alternative; check source images. Reading reported in the electronic edition's apparatus (witness siglum not verified)

**Specific critical judgement:** المناقص appears in the descendant's explanatory reprise, not in an independently collated original. The sense 'deficiencies' is reasonable but is not a witnessed Arabic variant.


---

### QT-048 — Four degrees of the comprehensive manifestation and the Perfect Human's modes of knowing

- **Location:** Āshtiyānī pp. 215–216–217–218. **Quoted Arabic incipit:** قلنا: إنّ المظهر الكامل هو الكون الجامع الحاصر لجميع المظاهر في سائر المراتب الموجودة فيه، فإنّ…
- **Source link:** https://ablibrary.net/book_content/b/17638/411?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 0 variant/conjecture/lacuna entries.

*No explicit variant entry currently recorded. This does not establish textual unanimity.*

**Specific critical judgement:** A long Persian editorial annotation interrupts printed pagination; it is excluded from the ancestor's quote. The masculine verbal agreement with الحقيقة needs print verification.


---

### QT-049 — The form of the whole, active and receptive determinations, and the One manifest in many respects

- **Location:** Āshtiyānī pp. 224–225. **Quoted Arabic incipit:** ولا بدّ أن يراد بحقيقة الكلّ وصورته الوجود المتعيّن بسائر التعيّنات التي بها يكون مصدراً لجميع …
- **Source link:** https://ablibrary.net/book_content/b/17638/420?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 2 variant/conjecture/lacuna entries.

1. **reported-in-edition** — lemma: `المأخوذة` ; alternative/observation: `الموجودة`.
   Printed p.224 alternative. Reading reported in the electronic edition's apparatus (witness siglum not verified)

2. **reported-in-edition** — lemma: `حقيقة الحقائق الحقّيّة` ; alternative/observation: `الحقّة`.
   Printed alternative; meaningfulness requires further collation. Reading reported in the electronic edition's apparatus (witness siglum not verified)



---

### QT-050 — Why an embodied soul can be a genuine natural unity while the cosmos is only an aggregate

- **Location:** Āshtiyānī pp. 228–229–230. **Quoted Arabic incipit:** ونحن قد بيّنّا في العلوم الحقيقيّة الأصليّة أنّ من الممكن أن يتألّف من جزئيّات العناصر أبدان مع…
- **Source link:** https://ablibrary.net/book_content/b/17638/424?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 1 variant/conjecture/lacuna entry.

1. **reported-in-edition** — lemma: `أفعال` ; alternative/observation: `أفعالها`.
   Printed p.228 alternative in a body–faculty clause. Reading reported in the electronic edition's apparatus (witness siglum not verified)



---

### QT-051 — Finite noble species, lesser species, and perfection shared within the human kind

- **Location:** Āshtiyānī pp. 234. **Quoted Arabic incipit:** وقد بيّن أيضاً فيها أنّ الأنواع الشريفة التي يمكن أن يصدر عنها الأفعال الكماليّة متناهية، ولا ا…
- **Source link:** https://ablibrary.net/book_content/b/17638/430?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 2 variant/conjecture/lacuna entries.

1. **editorial-conjecture** — lemma: `وبصدر` ; alternative/observation: `ويصدر (editorial conjecture, not attested here)`.
   Apparent printing/transcription problem p.234. Conjectural reading, editorial correction, or hypothetical deletion; **not** an attested independent reading

2. **reported-in-edition** — lemma: `هاهنا` ; alternative/observation: `منها`.
   Printed alternative p.234. Reading reported in the electronic edition's apparatus (witness siglum not verified)



---

### QT-052 — Can the Real's manifestation depend upon determinations without compromising necessity?

- **Location:** Āshtiyānī pp. 237. **Quoted Arabic incipit:** ولا يمتنع أن يتوقّف الحقّ في الاتّصاف ببعض الصفات والتعيّنات على صفات وتعيّنات أخر لاحقة به من …
- **Source link:** https://ablibrary.net/book_content/b/17638/433?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 1 variant/conjecture/lacuna entry.

1. **editorial-conjecture** — lemma: `الاتّصاف بصفة كماليّة على أمر ممكن — ببعض الصفات الممكنة` ; alternative/observation: `Reconstruction of clause order unresolved`.
   Printed p.237 includes an awkward disrupted insertion; source photograph needed. Conjectural reading, editorial correction, or hypothetical deletion; **not** an attested independent reading

**Specific critical judgement:** The surviving syntax may include displaced words around اتصاف and صفة كمالية. The English supplies a coherent argument; a critical reading cannot yet be selected.


---

### QT-053 — The senses under the holy faculty: real comprehensiveness without suppressing the lower powers

- **Location:** Āshtiyānī pp. 243–244. **Quoted Arabic incipit:** فلا يلزم أن تكون الإدراكات الحسّيّة والوهميّة والفكريّة غير معتبرة لو كان الكمال الحقيقي والإدر…
- **Source link:** https://ablibrary.net/book_content/b/17638/439?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 2 variant/conjecture/lacuna entries.

1. **reported-in-edition** — lemma: `هربت` ; alternative/observation: `هُذّبت`.
   Printed alternative for the transformation of the lower faculties. Reading reported in the electronic edition's apparatus (witness siglum not verified)

2. **reported-in-edition** — lemma: `يتحرّك` ; alternative/observation: `يحرّك`.
   Printed p.244 alternative; changes active vs transitive sense. Reading reported in the electronic edition's apparatus (witness siglum not verified)



---

### QT-054 — Knowledge beyond discursive thought need not be beyond intellect or expression

- **Location:** Āshtiyānī pp. 248. **Quoted Arabic incipit:** ولا نسلّم أنّ العقل لا يدرك كلّ ما يدرك في الطور الذي هو فوق العقل. نعم، إنّ من الأشياء الخفيّة…
- **Source link:** https://ablibrary.net/book_content/b/17638/444?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 2 variant/conjecture/lacuna entries.

1. **editorial-conjecture** — lemma: `العقلي` ; alternative/observation: `العقل [contextual conjecture]`.
   Digital p.248 shows an intrusive final yāʾ. Conjectural reading, editorial correction, or hypothetical deletion; **not** an attested independent reading **Anchor alert:** the recorded base lemma is not found verbatim in the current Arabic working reading.

2. **editorial-conjecture** — lemma: `بتوسّط استخراج الأوساط ... على أنّ الحافظة (repeated)` ; alternative/observation: `possible dittography, not independently witnessed`.
   The duplicated phrase is retained and marked; original boundaries cannot yet be reconstructed. Conjectural reading, editorial correction, or hypothetical deletion; **not** an attested independent reading **Anchor note:** this is a descriptive or composite issue, not a literal continuous lemma.

**Specific critical judgement:** The reading lemma العقلي is absent from the current working Arabic, which already has the proposed العقل. The written edition has therefore silently normalized at least this word; the electronic reading is not a diplomatic transcript. Its doubled argument about middle terms remains visible.


---

### QT-055 — Sustained contemplation can alter acquired dispositions and subordinate the bodily faculties

- **Location:** Āshtiyānī pp. 249–250. **Quoted Arabic incipit:** وبيّن أنّ دوام المراقبة والمواظبة على ما ذكرنا من الملاحظة مع ملازمة الآداب والشروط المعتبرة عن…
- **Source link:** https://ablibrary.net/book_content/b/17638/445?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 2 variant/conjecture/lacuna entries.

1. **reported-in-edition** — lemma: `بوجوب مطاوعتها` ; alternative/observation: `بوجود مطاوعتها`.
   Printed p.250 alternative. Reading reported in the electronic edition's apparatus (witness siglum not verified)

2. **reported-in-edition** — lemma: `تقيّد انجذابها` ; alternative/observation: `ويفيد انجذابها`.
   Printed p.250 alternative with awkward source grammar. Reading reported in the electronic edition's apparatus (witness siglum not verified)



---

### QT-056 — Against confusing reason with delusion: disciplined ascetic practice, temperamental balance, and moral purification

- **Location:** Āshtiyānī pp. 252–253–254–255. **Quoted Arabic incipit:** ومن جعل المعارف العقليّة والعلوم اليقينيّة المستندة إلى البراهين القطعيّة، الحاصلة للإنسان المع…
- **Source link:** https://ablibrary.net/book_content/b/17638/448?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 3 variant/conjecture/lacuna entries.

1. **editorial-conjecture** — lemma: `فلا يجوز بالنسبة إلى المرتاضين` ; alternative/observation: `فلا يجوز إلّا بالنسبة إلى ... [conjecture]`.
   Print's negative conflicts with its surrounding therapeutic argument. Do not silently emend. Conjectural reading, editorial correction, or hypothetical deletion; **not** an attested independent reading

2. **reported-in-edition** — lemma: `الأحقّ` ; alternative/observation: `الأخلق`.
   Printed p.252 alternatives. Reading reported in the electronic edition's apparatus (witness siglum not verified)

3. **reported-in-edition** — lemma: `مخالفة النفس في طريق التعليم والنظر` ; alternative/observation: `في طريقة التعليم والنظر`.
   Printed p.255 alternative. Reading reported in the electronic edition's apparatus (witness siglum not verified) **Anchor alert:** the recorded base lemma is not found verbatim in the current Arabic working reading.

**Specific critical judgement:** The printed negative فلا يجوز in the discussion of cultivating contrary dispositions conflicts with the subsequent therapeutic principle. Do not change it to فلا يجوز إلا without manuscript support. This is a conceptual and philological crux, not a harmless grammatical fix.


---

### QT-057 — Why philosophers regard the contemplative path as possible but difficult

- **Location:** Āshtiyānī pp. 257–258. **Quoted Arabic incipit:** واعلم أنّ المحقّقين من النظّار لا ينكرون إمكان طريق التصوّف وإفضاءه إلى المقصد على الندور، لكنّ…
- **Source link:** https://ablibrary.net/book_content/b/17638/453?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 2 variant/conjecture/lacuna entries.

1. **reported-in-edition** — lemma: `لاتّضح` ; alternative/observation: `لانفتح`.
   Printed p.258 alternative. Reading reported in the electronic edition's apparatus (witness siglum not verified)

2. **unclassified-requires-image-check** — lemma: `أوفق` ; alternative/observation: `أوثق`.
   Final descriptor 'more fitting' vs 'more reliable'. Source relationship cannot yet be classified without the printed photograph



---

### QT-058 — Contemplation and disciplined inquiry require the same conditions of clarity and equilibrium

- **Location:** Āshtiyānī pp. 260. **Quoted Arabic incipit:** وأمّا نحن فنقول: إنّ كلّ شرط يعتبر في طريق التصوّف فلا بدّ من اعتباره في طريق النظر عند التحقيق…
- **Source link:** https://ablibrary.net/book_content/b/17638/456?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 0 variant/conjecture/lacuna entries.

*No explicit variant entry currently recorded. This does not establish textual unanimity.*



---

### QT-059 — Sense and intellect are preparatory causes in both paths; the effusion of knowledge is from the First Principle [LACUNOSE]

- **Location:** Āshtiyānī pp. 262–263–264. **Quoted Arabic incipit:** وما قيل إنّ علوم النظّار مأخوذة من الحواسّ وعلوم أصحاب المجاهدة مأخوذة من المبدأ الفيّاض فليس ب…
- **Source link:** https://ablibrary.net/book_content/b/17638/458?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 1 variant/conjecture/lacuna entry.

1. **reported-lacuna** — lemma: `The quoted matn is incomplete in the printed transmission` ; alternative/observation: `More than one page reportedly omitted by copyists`.
   Editorial Persian n.1 on pp.262–263, not a conjectural fill or translated commentary. **Do not treat as a normal variant.** **Anchor note:** this is a descriptive or composite issue, not a literal continuous lemma.

**Specific critical judgement:** MAJOR LACUNA. Āshtiyānī's editorial note reports an omission exceeding a page of the author's words in its exemplars around pp.262–264. No reconstruction is licensed, and the grandson's later explanatory paragraphs are not the grandfather's exact lost wording.


---

### QT-060 — Two legitimate routes to unveiled knowledge, both requiring purification

- **Location:** Āshtiyānī pp. 266–267. **Quoted Arabic incipit:** على أنّا نقول: إنّ العلوم كلّها موجودة فينا، لما ستعرفه لو تأمّلت في المباحث السالفة، لكنّها مخ…
- **Source link:** https://ablibrary.net/book_content/b/17638/462?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 3 variant/conjecture/lacuna entries.

1. **reported-in-edition** — lemma: `فوقع نفسه` ; alternative/observation: `فأوقع نفسه`.
   Printed p.267 alternative; first is grammatically suspect. Reading reported in the electronic edition's apparatus (witness siglum not verified)

2. **editorial-conjecture** — lemma: `المفرفة` ; alternative/observation: `المغرقة [editorial conjecture]`.
   The source marks this probable correction. Conjectural reading, editorial correction, or hypothetical deletion; **not** an attested independent reading **Anchor alert:** the recorded base lemma is not found verbatim in the current Arabic working reading.

3. **editorial-conjecture** — lemma: `فيتقن خبث` ; alternative/observation: `فليتقِ خبث [editorial conjecture]`.
   Printed ending appears corrupt; English chooses a plausible imperative. Conjectural reading, editorial correction, or hypothetical deletion; **not** an attested independent reading **Anchor alert:** the recorded base lemma is not found verbatim in the current Arabic working reading.

**Specific critical judgement:** The reading text displays المغرقة and فليتقِ, while its variant register identifies base-like digital readings المفرفة and فيتقن. This indicates two conjectures have already been adopted without diplomatic retention; they must be marked as conjectural in the present provisional reading, and cannot be counted as manuscript-supported corrections.


---

### QT-061 — The final criterion: logic, contradictory unveilings, rational preparation, and the perfected teacher

- **Location:** Āshtiyānī pp. 269–270. **Quoted Arabic incipit:** دقيقة: قد بقي هاهنا بحث مفيد لا بدّ وأن نشير إليه إشارة خفيّة. اعلم أنّ أصحاب النظر والتعليم عن…
- **Source link:** https://ablibrary.net/book_content/b/17638/465?lang=ar. **Editorial classification:** provisional quotation from one digitized printed edition; no independent photographic or manuscript collation.
- **Recorded issues:** 2 variant/conjecture/lacuna entries.

1. **reported-in-edition** — lemma: `وترتيبها` ; alternative/observation: `وتزيينها`.
   Printed p.270 variant. Reading reported in the electronic edition's apparatus (witness siglum not verified)

2. **reported-in-edition** — lemma: `غير المتّسقة المنتظمة` ; alternative/observation: `غير المنسّقة المنتظمة`.
   Printed alternative; syntax remains uncertain. Reading reported in the electronic edition's apparatus (witness siglum not verified)

**Specific critical judgement:** The author explicitly ends the treatise here. The difference between المـنسقة and المـتسقة, and the phrase غير المتسقة المنتظمة, must be resolved on a photographed witness, rather than by translating away the tension.


## 6. Final critical-edition gates

**Completed at working-edition level:** the complete currently recoverable chain of 61 quotations through the original closing formula, independently authored English translations, source-locus map, distinct commentary boundary, and typed preliminary apparatus.

**Not completed:** independent photographic transcription of A, collation of T₁/Ḥ/R and independent manuscripts, reconstruction of QT-059 from a true alternate source, stemmatic analysis, systematic collation of omissions between quoted lemmata, and full philological proofreading against original pages.

**Editorial verdict:** **A bilingual sourcebook with a critical apparatus exists, but a definitive critical edition does not yet exist.** It would be misleading to put “text established” or “critical edition complete” on its title page.

_Gnamma Research · apparatus v0.9 · 3 November 2026._
