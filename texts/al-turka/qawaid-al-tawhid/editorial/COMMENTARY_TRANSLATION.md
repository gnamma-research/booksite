# Tamhīd al-Qawāʿid — Arabic–English commentary translation

**Ṣāʾin al-Dīn ʿAlī Ibn Turka**, commenting on his ancestor Abū Ḥāmid Turka's *Qawāʿid al-Tawḥīd*.

**Current release: 3 November 2026.** The translation target is the **whole medieval commentary**, not a selection. This release contains **46 translated bilingual sections: 40 introductory units and 6 concluding units**. The intervening main commentary is still untranslated. No whole-work percentage or complete-work claim is made.

[Read the commentary from the beginning](../commentary.html) · [Return to the matn reader](../) · [Lumbard comparison standard](LUMBARD_COMMENTARY_STANDARD.md).

## 1. Material completed

### Continuous authorial introduction: SH-INTRO-001–040

The **entire authorial opening available in the consulted online Arabic edition** is translated, from its doxology through the sentence ending the prolegomenon. This includes the author's preface and the extended systematic discussion omitted from Lumbard's published opening selection.

The source is **N**, the medieval Arabic text reproduced in Muḥammad Riḍā al-Nekounam's edition, Tehran: Ṣubḥ-i Fardā, 1393 SH. Its online printed markers run from **19 through 42**, followed by a final continuation without a further visible page-ending marker. The final sections preserve that locator instead of inventing a photographed page number. **These are not Āshtiyānī's page numbers.**

[Primary Arabic source N](https://ayatollahnekounam.com/2018/07/16/التمهید-فی-شرح-قواعد-التوحید-الطلیعه-و/).

| Units | Authorial discussion |
|---|---|
| 001–008 | Praise, prophetic inheritance, rational and experiential knowledge, the ancestor's treatise, and the purpose of this commentary |
| 009–017 | The highest science; music and arithmetic as an example of subordination; unrestricted existence; Avicenna's subject of metaphysics; proper predicates and divine names |
| 018–022 | Conceptual and assertoric principles, how they become known, tests of unveiling, scientific questions, and the limits of the formal-science analogy |
| 023–031 | Two technical vocabularies; hypothetical, mental and extramental existence; nafs al-amr; truth; the higher intellect; an Ibn Arabi quotation; criticism of merely relational existentness |
| 032–040 | Absolute and relational unity, genuine and relational plurality, conceptual abstraction, the Real and creation, divine names and fixed entities, necessity and possibility |

Modern editorial prefaces, inline explanatory glosses, and footnotes have been **excluded**, not silently translated as Ibn Turka's prose. His genuine nested quotations remain identified. Several defective readings are preserved with interpretative notes; this is not a manuscript-established diplomatic transcription.

### Continuous closing commentary: six sections, Āshtiyānī pp.270–274

The source is **A**, the digitized Āshtiyānī text. The final discussion beginning with **أقول** after the ancestor's closing matn is translated continuously across the consulted pages. These sections appear in source order, notwithstanding the historical lettering of the two original pilot IDs:

| Order | Unit | Printed pages | Discussion |
|---|---|---|---|
| 1 | SH-061-C | 270–271 | Why the last subtle point asks about a criterion of knowledge |
| 2 | SH-061-D | 271 | Immediate experience does not resolve disagreement among experiencers |
| 3 | SH-061-E | 271–272 | Unequal capacities still leave a need for discriminating standards |
| 4 | SH-061-F | 272–273 | Intellectual formation and acquired discrimination, illustrated by poetic metre and music |
| 5 | SH-061-A | 274 | The perfected guide and the measure appropriate to each station |
| 6 | SH-061-B | 274 | The commentator's own conclusion |

[Primary Arabic A, p.270](https://ablibrary.net/book_content/b/17638/466?lang=ar) · [271](https://ablibrary.net/book_content/b/17638/467?lang=ar) · [272](https://ablibrary.net/book_content/b/17638/468?lang=ar) · [273](https://ablibrary.net/book_content/b/17638/469?lang=ar) · [274](https://ablibrary.net/book_content/b/17638/470?lang=ar).

The long modern Arabic/Persian footnotes and the later Āshtiyānī editorial colophon are excluded. The old pilot sections SH-061-A/B are preserved rather than needlessly renumbered.

## 2. Joseph E. B. Lumbard as a checked standard

Lumbard's “Establishing the Principles,” *An Anthology of Philosophy in Persia*, IV, pp.464–479, is used to check the opening terminology and interpretations where his selection overlaps. The first seven new introductory units contain precise comparator page references. His early matn/commentary selections remain relevant to the subsequent translation.

[Published Lumbard selection](https://traditionalhikma.com/wp-content/uploads/2015/08/Annotated-translation-from-Tamhi%CC%84d-al-Qawa%CC%84%CA%BEid-of-Ibn-Turkah-al-Is%CC%A3faha%CC%84ni%CC%84-by-Joseph-Lumbard.pdf).

The Arabic controls the translation. English wording is independently composed, not reproduced from the modern translation. Technical choices and significant departures are documented in [LUMBARD_COMMENTARY_STANDARD.md](LUMBARD_COMMENTARY_STANDARD.md). No reading in Lumbard's English is counted automatically as an Arabic witness.

## 3. What remains untranslated

The **main intervening commentary on QT-001–QT-060** has not yet been continuously translated. The standalone reader places a conspicuous gap between SH-INTRO-040 and the closing discussion. A translated beginning and ending must not be mistaken for a completed whole work.

The predecessor's 61-unit *Qawāʿid* matn remains separate, not 61 additional translated sections of the grandson's commentary. QT-059's previously reported source omission remains noted and deferred; it has not been reconstructed from commentary or speculation.

## 4. Reader and files

The dedicated [commentary reader](../commentary.html) opens at the beginning, supports Arabic/English visibility, normal and continuous reading, source links, notes, bookmarks, search, and a browser-generated bilingual Markdown export. The main reader's **Together** view displays the six closing sections under QT-061; **Sharḥ** opens the full commentary workspace.

Data files:
- [Introduction 001–010](../data/commentary-introduction-1.js)
- [Introduction 011–022](../data/commentary-introduction-2.js)
- [Introduction 023–032](../data/commentary-introduction-3.js)
- [Introduction 033–040](../data/commentary-introduction-4.js)
- [Closing discussion C–F](../data/commentary-conclusion.js), with [preserved pilot A–B](../data/commentary.js)
- [Integrated corpus and coverage metadata](../data/commentary-corpus.js)

Deterministic corpus and simulated reader tests are in [qa/check-commentary.mjs](../qa/check-commentary.mjs). A test suite's presence is not evidence that its latest run passed; consult the actual workflow result. A real-device iPhone Safari visual acceptance test is not claimed.

**Release distinction:** the consulted online authorial introduction and concluding discussion are translated; the complete *Tamhīd* is **not yet finished**.
