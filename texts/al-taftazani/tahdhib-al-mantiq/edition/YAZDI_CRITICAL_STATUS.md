# Al-Yazdī’s Ḥāshiya on Tahdhīb al-Manṭiq — critical-edition register
**Version:** 2026-11-06 · **Status:** incomplete, source-transcribed working edition, not definitive

## Object of the edition
The intended object is **al-Taftāzānī’s short logic matn plus the complete main ḥāshiya of Mullā ʿAbd Allāh al-Yazdī**, paragraph aligned without treating separately printed marginal annotators as al-Yazdī. The Qum printed book has 400 numbered pages but its main passage runs through the concluding *Ajzāʾ al-ʿUlūm* on printed p.114, followed by extensive ancillary marginalia. The first portion of the printed volume also contains publisher and biographical material. Therefore “400 pages of unabridged al-Yazdī commentary” is the wrong denominator. Establish the first and last lines of the ḥāshiya by photographic verification before certifying a continuous edition.

El-Rouayheb identifies this as a **ḥāshiya** (gloss), rather than a complete quotation-based **sharḥ**: it typically cites the first words (*qawluhu*) of a lemma and comments on them. This distinction must govern segmentation. The *matn* and *ḥāshiya* are separate sources with two original authors, so editorial bilingual headings and topic labels are clearly marked *editorial*.

**A historical correction:** al-Yazdī’s death is recorded as **981/1573–74** in a contemporary chronicle. The commonly repeated **1015/1606–07** is apparently a confusion with a different scholar; see El-Rouayheb, *The Development of Arabic Logic (1200–1800)* (2019), 115–16.

## Witness register and evidential status
| Siglum | Witness | Actual evidence | Permissible use |
|---|---|---|---|
| **Q** | Qum, Muʾassasat al-Nashr al-Islāmī; searchable 400-page `al-Ḥāshiya ʿalā Tahdhīb al-Manṭiq`, www.ablibrary.net / Najaf Desert Library | Bilingual passages currently keyed to numbered Arabic pages; its **main sharḥ/ḥāshiya** must be distinguished from `هوامش` by others | Provisional reading base, not a manuscript archetype |
| **Q⁽¹⁾** | Qum 1405/1984 NYU/Princeton digitization, `princeton_aco000566`; bibliographic identity from NYU catalogue | Image-based control for Q; whether this matches the searchable pagination line for line still requires verification | Control edition *pending image collation* |
| **Q⁽⁸⁾** | Qum 1415/1994 eighth printing, 400 pp.; CiNii BA64687870 | Distinct listed impression; relationship to Q⁽¹⁾ untested | Bibliographic comparison only |
| **T** | Tehran print, NYU `princeton_aco000583` | Independent published printing, 17.92 MB low-resolution PDF listed | Candidate printed comparator; **zero** certified variants |
| **T¹³¹⁴** | Tehran lithograph 1314/1896, ~102 pp. main text noted by El-Rouayheb | Historical earlier print, possibly different layout and extensive marginal annotations | Candidate comparator, not yet line-collated |
| **M?** | Qatar Shaykh ʿAbd Allāh al-Anṣārī library catalogue no. 423, copied 1700, 1,087 pages; attributed `Sharḥ al-Tahdhīb` to al-Yazdī | Catalogue metadata only; the entry’s author death date repeats the later disputed 1015 date | **Identity unverified**; no variant authority until first/last folios checked |
| **K** | Cairo 1330/1912 *Tahdhīb* logic matn and a separate compared print in `edition/data.js` | Original 19 bilingual editorial sections and existing printed comparisons | Source of al-Taftāzānī’s *matn*, not of Yazdī’s gloss |
| **D** | Jalāl al-Dawānī *Ḥāshiyat Mullā Jalāl* (Princeton MS 2088, dated 1496/97) | A different writer’s commentary on the same source text | **Not a witness of al-Yazdī** |

**Sources**:
- Qum scan: https://sites.dlib.nyu.edu/viewer/books/princeton_aco000566/display?lang=en
- Tehran scan: https://sites.dlib.nyu.edu/viewer/books/princeton_aco000583/display?lang=ar
- Q searchable: https://ablibrary.net/book_content/b/12170/1?lang=ar
- Q alternative paginated: https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/114
- Qum eighth print: https://ci.nii.ac.jp/ncid/BA64687870
- Qatar catalogue: https://qatarch.com/alansari_library/book/423
- Princeton Dawānī manuscript: https://digital-collections.princeton.edu/i/حاشية-ملا-جلال-بر-تهذيب/item/610573e9-0bde-419d-a173-0577fa735457/metadata
- El-Rouayheb 2019: https://schwabe.ch/media/pdf/bc/d5/9c/MEMP2_El-Rouayheb_The-Development-of-Arabic-Logic-el.pdf

## Actual bilingual coverage
The website's `yazdi-layer-data.js` contains **167 selected passages** in all 19 logic divisions. **This is not 167 completed pages or 19 complete chapters.** The earliest previous source selections span pp.14–68 and later examples span pp.70–114. Sections are represented by samples, often only a sentence or paragraph per printed page.

The additional source-backed work on 2026-11-06 includes continuous treatment of the logical form of analogy, the **three necessary premises**, the contested **causal premise**, and **dawarān** as a proposed indication of a cause (Q p.107); one further passage explaining five arts by their **epistemic material** (Q p.110); the transferred naming of induction (Q p.105); and the previously omitted concluding sentence on a variant in the definition of the questions of a science (Q p.114).

**Printed p.114** is represented as a complete transcribed sequence of main-ḥāshiya comments in the searchable text (three established selection blocks plus the newly added variant qualification). Its translation remains **single-print checked, not critically certified**. Verifying original page boundaries, headings and printed layout against Q⁽¹⁾ and T is still necessary before it can be declared a certified page.

## Four key apparatus notes for review
**CR-01 · Matn vs ḥāshiya vs marginalia.** Introductory `فصل`, `خاتمة`, and quoted `قوله` lemmata are not all new prose by Yazdī; a `هوامش` section may quote `التقريب` or a named glossator. Each edited segment must store `speaker` and `source_layer` before publication.

**CR-02 · Q p.114, the reading `بالبرهان`.** Al-Yazdī reports `وأما ما وجد في بعض النسخ من التخصيص بقوله: بالبرهان فمن زيادة الناسخ`: he regards `بالبرهان` as a scribal addition in some copies. He **also allows a charitable construal**: the wording may reflect the usual case, or `burhān` could include `tanbīh` (drawing attention to a self-evident matter). Report both, distinguish `some copies` from independently identified witnesses, and do not silently delete `بالبرهان` from al-Taftāzānī’s matn.

**CR-03 · Q pp.105–107, the definition of analogy.** Yazdī sharply distinguishes *inspection/likening as an act* from the *premise-bearing inference* that qualifies as a `ḥujja`. It would be inaccurate to translate `tamthīl` consistently as “analogy” without occasionally specifying whether the operation or argument is meant. The asserted epistemic status of `dawarān` also belongs to the technical discussion of `ʿilla` in uṣūl al-fiqh.

**CR-04 · Q p.110, the five arts.** Distinguish matter (`mādda`) from figure/form (`ṣūra`). Poetry is classified by imaginative effect (`takhyīl`), rhetoric by probability (`ẓann`), demonstration by certainty (`yaqīn`), dialectic by recognized/conceded premises, and fallacy by inferior grounds. Never flatten all five to one modern inferential validity scheme.

## Definitive-edition release conditions
1. Enumerate every main-text lemma and paragraph from photographic Q scans; establish an exact begin/end boundary of Yazdī’s own contribution.
2. Translate **every** main-ḥāshiya paragraph, retaining contiguous order, original page and lemma alignment; mark gaps until gone.
3. Collate Q against Tehran and at least one verified, independently identified manuscript; record variant readings and the witness locations. Do not treat catalogues as transcriptions.
4. Explicitly mark all emendations, supplements, unclear readings, authorial alternatives and reported variants; retain an uncorrected diplomatic layer.
5. Proof the English against Arabic with a technical lexicon for modal logic, syllogistic figures, philosophy of science and uṣūl parallels.
6. Perform end-to-end bilingual rendering, iPhone/Safari and desktop accessibility audits; confirm the same source passage is reachable from matn, sharḥ, dictionary, subject index and print/PDF locators.
7. Only then issue a **critically certified edition** or a “complete translation”. Until then the UI says **working source-linked translation**.

## Reader parity
The compact logic-specific rail copies the current Darūrī arrangement in principle: a single top row with menu, actual Darūrī circular tile, reading/language controls, a book-layer choice and trailing search/focus/settings, plus the persistent three-part numbered bottom navigation. **Text layers have only two states**: `Matn` and `Matn + sharḥ`. All other former toolbar functions live in one short grouped menu. Unlike Darūrī, which has one authorial core text, the commentary stays optional and is marked incomplete.
