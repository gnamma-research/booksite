# Tahdhīb — Stage 77 source-facing corrections and residual cruces

**Revision:** 2 November 2026. **Controlling print:** Cairo, Maṭbaʿat al-Saʿāda, 1330/1912. This note belongs to the **authorial matn**; no al-Sanandajī/Wasīm commentary has been silently imported.

## Newly verified logic corrections

Direct photographic inspection of the Cairo 1912 logic pages established three previously mis-transcribed terms:

| Clause | 1912 locus | Earlier transcription | Repaired Cairo reading | Critical consequence |
|---|---|---|---|---|
| L.11 | p. 8 | «وقد تقيد العامتان والوقتيتان باللادوام الذاتي» | «وقد تقيد العامتان والوقتيتان **المطلقتان** باللادوام الذاتي» | The non-permanence qualification belongs to both *absolute* temporal forms. |
| L.14 | p. 10 | «والسالبة الكلية تنعكس كلية **والإلزام** سلب الشيء عن نفسه» | «والسالبة الكلية تنعكس كلية **وإلا لزم** سلب الشيء عن نفسه» | Restores the reductio supporting universal-negative conversion. |
| L.16 | pp. 11–12 | «لينتج الموجبتان مع الموجبة والموجبتين ومع السالبة السالبتين بالضرورة» | «لينتج الموجبتان مع الموجبة **الكلية** الموجبتين، ومع السالبة **الكلية** السالبتين بالضرورة» | Restores the two universal-major qualifications across the printed-page seam. |

These corrections are present in **both** the original and enhanced NAMA logic readers. The affected clause translations have not been promoted to *manuscript certified*.

### Two visible differences between printed forms

- **L.18 — certainty taxonomies:** Cairo 1912 p. 13 has «والنظريات». The commentary-contained printed matn in *Sharḥ al-Tahdhīb*, [online p. 15](https://www.arabicdawateislami.net/bookslibrary/3507/page/15), has «والفطريات». These are not interchangeable epistemic categories. Keep both with distinct sigla pending independent manuscript comparison.
- **L.19 — ending:** Cairo 1912 p. 14 concludes «والله أعلم بالصواب» after defining *muqaddimāt*. The same online [p. 15](https://www.arabicdawateislami.net/bookslibrary/3507/page/15) continues with the *ruʾūs thamāniya* (eight introductory headings) discussion. Do not append this material to the Cairo base text without explaining the edition difference.

## Five residual *kalām* source questions

| Printed page | Clause | What has been read from the source | Why no final certificate? |
|---|---|---|---|
| 39 | KAL-039.04 | Time's continuity and the distinction between the circular motion that may continue and rectilinear motion that ceases. | The exact inferential linking word around «ولامتناع فنائه» is unclear. |
| 77 | KAL-077.03 / KAL-077.10 | The closure refers to discussions omitted «مخافة الإطناب»; the Necessary is unlike other essences, beginningless and everlasting. | The opening closure words and gender/construction of «ذات الواجب مخالف» still need a second textual witness. |
| 80–81 | KAL-080.11 | The claim «تماثل قدرته قدرة الشاهد فلا تختلف آثارهما» is followed by «قلنا ممنوع» and a response continuing over the printed page seam. | The wording that explains divine power/attribution of originated events has not yet been diplomatically certified. |
| 100 | KAL-100.02 | The deniers cite «تمسكوا بالسبت أبدا» and «هذه شريعة مؤبدة ما دامت السماوات والأرض» to dispute abrogation. | The phrase introducing the purported Mosaic quotations is doubtful; *Sharḥ al-Maqāṣid* is an **authorial parallel**, not a manuscript reading. |
| 124 | KAL-124.06 | The construal of «وهم راكعون» concerns syntactic coordination versus another reading, Jewish prayer and humility («خاضعون»). | The exact abbreviated syntax requires a second witness; the broader author's treatment explains, but does not establish, the shorter wording. |

The prior Stage 75 certification remains **108/113 printed kalām pages**. No new kalām source page is falsely promoted here.

## Independent witnesses located (not yet textually collated)

- **Al-Azhar manuscript**, copied late Ṣafar 995 AH, 40 folios, Azhar private **2468**, general **96067**; [catalogue](https://www.alukah.net/moalem/8011/103964/). The linked [facsimile URL](https://api.alukah.net/Manu/Files/Manuscript_6154/Makhtotah.pdf) could not be retrieved in this session.
- **Princeton Garrett 4139Y**, 1126 AH/1714 CE, *Tahdhīb* in fols. **1b–21b**, part of a larger composite manuscript; [Princeton catalogue](https://digital-collections.princeton.edu/i/%D8%AA%D9%87%D8%B0%D9%8A%D8%A8-%D8%A7%D9%84%D9%85%D9%86%D8%B7%D9%82-%D9%88%D8%A7%D9%84%D9%83%D9%84%D8%A7%D9%85-%D8%A7%D9%84%D8%AE/item/6a23d92c-5192-4801-a8e9-c40fd9c9118d/metadata).
- **2017 edition**, ed. ʿImād al-Suhaylī / Masʿūd Aḥmad Saʿīdī; [university catalogue](https://maktabat.mu.edu.sa/bib/41056) reports **464 pp.**, but [publisher listing](https://daraldeyaa.net/index.php/books/view/302) reports **364 pp.**. Confirm an actual copy before determining its edition page count.

Authorial *Sharḥ al-Maqāṣid* parallels (interpretative comparanda only):
[time and circular motion](https://ablibrary.net/book_content/b/9290/187?lang=ar) ·
[the Sabbath formula](https://ablibrary.net/book_content/b/9293/44?lang=ar) ·
[the «وهم راكعون» debate](https://ablibrary.net/book_content/b/9293/271?lang=ar).

## Independent logical test programme

A new executable [non-modal core test](../../../../tools/tahdhib/verify_logic_core.py) enumerates 512 valuations over three predicates, checking nineteen traditional categorical moods under their explicit existential premises, plus the different truth conditions of *ḥaqīqiyya*, *māniʿat al-jamʿ*, *māniʿat al-khulū*. It also records failures if conditional nonempty-term hypotheses are dropped.

**Methodological limitation:** successful finite-model tests do not settle Taftāzānī's *historical modal semantics*, and his modal rules cannot be inferred merely from an anachronistic Boolean formalization. The next source round must verify L10–L17 in the original wording and an independent manuscript, with commentary by al-Yazdī and the relevant glosses as interpretative aids rather than substitutes for the matn.

### Release rule

Keep this issue register, stage number, exact Cairo page and variant status attached to each translated reading. Until a genuinely independent *Tahdhīb* witness is read at a locus, a tempting solution from *Sharḥ al-Maqāṣid* remains explanatory, **not** textually certified.
