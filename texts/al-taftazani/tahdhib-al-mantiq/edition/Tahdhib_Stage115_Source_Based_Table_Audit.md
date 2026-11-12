# Tahdhīb al-Manṭiq — Stage 115 source-based table audit

**12 November 2026. Scholarly apparatus, not the historical printed table.**

Stage114's complete 1,090-record, 14-section corpus is retained unchanged; this analysis follows the rules in `docs/TRANSLATION_CONTINUITY_PROTOCOL.md`. The missing tables are absent from the digital text, and neither the printed table images nor any independent manuscript facsimiles have been visually collated in this stage.

## Q300–301 · H-PROPOSITIONS-121 · 32 classified combinations

The historical prose describes a 45-cell layout: one corner, four restriction headers, eight row headers, and 32 intersections. It states **9 invalid, 7 valid recognised, 16 valid unrecognised**; the following is a **reconstruction of those logical outcomes from surrounding prose**, not a transcription of the original graphic. Rows follow the Q298–299 enumeration and headers the Q300 ordering. Q298–299 contain separately attributed modern *al-Taqrīb* material, while H121 is the later gloss on Q300–301.

**Key** R = صحيح معتبر (valid recognised); U = صحيح غير معتبر (valid unrecognised); X = غير صحيح (invalid).

| Simple proposition (البسيطة) | اللاضرورة الذاتية | اللاضرورة الوصفية | اللادوام الذاتي | اللادوام الوصفي |
|:--|:--:|:--:|:--:|:--:|
| الضرورية المطلقة · Absolute necessary | X | X | X | X |
| المشروطة العامة · General conditioned | U | X | R | X |
| الوقتية المطلقة · Absolute temporal | U | U | R | U |
| المنتشرة المطلقة · Absolute diffuse | U | U | R | U |
| الدائمة المطلقة · Absolute permanent | U | U | X | X |
| العرفية العامة · General customary | U | U | R | X |
| المطلقة العامة · General absolute | R | U | R | U |
| الممكنة العامة · General possible | R | U | U | U |

- **Seven recognised cases:** (1) general conditioned + essential nonpermanence → المشروطة الخاصة; (2) absolute temporal + essential nonpermanence → الوقتية; (3) absolute diffuse + essential nonpermanence → المنتشرة; (4) general customary + essential nonpermanence → العرفية الخاصة; (5) general absolute + essential nonnecessity → الوجودية اللاضرورية; (6) general absolute + essential nonpermanence → الوجودية اللادائمة; (7) general possible + essential nonnecessity → الممكنة الخاصة.
- **Nine invalid cases, expressly enumerated at Q300:** all four restrictions of absolute necessity; essential and descriptive nonpermanence on absolute permanence; descriptive nonnecessity and descriptive nonpermanence on general conditioned; descriptive nonpermanence on general customary.
- **Remaining sixteen:** valid but not conventionally recognised, inferred from the 32-case total and the foregoing explicit exclusions.

**Count check:** R=7, U=16, X=9, total 32; (8+1) × (4+1) = 45 including headers. The criterion for *descriptive* necessity is disputed within the commentary; these are historical judgments on the source's reading, not independently proved contemporary modal theorems.

**Arabic sources:** [Q298](https://ablibrary.net/book_content/b/12170/298?lang=ar) · [Q299](https://ablibrary.net/book_content/b/12170/299?lang=ar) · [Q300](https://ablibrary.net/book_content/b/12170/300?lang=ar) · [Q301](https://ablibrary.net/book_content/b/12170/301?lang=ar).

## Q308–310 · H-CONDITIONAL-040 · fifteen types

Let **C** = categorical (حملية), **K** = connected conditional (متصلة), **D** = disjunctive conditional (منفصلة).

**Nine ordered connected types:** C→C, C→K, C→D, K→C, K→K, K→D, D→C, D→K, D→D.

**Six unordered disjunctive types:** C/C, C/K, C/D, K/K, K/D, D/D.

The source treats antecedent/consequent entailment as asymmetric but the mutual opposition of disjunctive parts as reciprocal; therefore reversing the mixed elements introduces another connected kind, not another disjunctive kind. **The printed example cells at Q309 have not been recovered**, and the symbols above are editorial type signatures, not invented source examples. See [Q308](https://ablibrary.net/book_content/b/12170/308?lang=ar), [Q309](https://ablibrary.net/book_content/b/12170/309?lang=ar), [Q310](https://ablibrary.net/book_content/b/12170/310?lang=ar).

## Q258–259 · H-DEFINITION-019 · 49-case matrix and arithmetic crux

The source specifies seven definitional elements: proximate genus (الجنس القريب), remote genus (الجنس البعيد), proximate differentia (الفصل القريب), remote differentia (الفصل البعيد), species (النوع), proprium (الخاصة), and common accident (العرض العام). Its declared **7×7 = 49** two-element case *structure* is recoverable; **none of the original cell-by-cell validity grades is yet verified**. [Q258](https://ablibrary.net/book_content/b/12170/258?lang=ar).

At [Q259](https://ablibrary.net/book_content/b/12170/259?lang=ar), the source counts **450** five-element base combinations and **120** orders each, yet states **5,400** total. Their product is **54,000**. Record as an **internal arithmetical crux**, *not* an emended source reading. The historical counts of 56, 140 and 450 for 3, 4 and 5 elements also differ from the conventional numbers C(7,3)=35, C(7,4)=35, C(7,5)=21, which presuppose selection without repetition; the source's peculiar counting convention must not be silently replaced.

## Q293–294 · H-PROPOSITIONS-097 · unrecovered relation table

The text describes comparing fifteen modal propositions and gives abbreviations for inclusion, partial overlap and exclusion, but the table on Q294 is absent. It would be speculation to fill the **pairwise relation cells**. [Q293](https://ablibrary.net/book_content/b/12170/293?lang=ar) · [Q294](https://ablibrary.net/book_content/b/12170/294?lang=ar).

## Q387 · H-SCIENCES-029 · geometry

The explanatory prose seems to point to an illustrative diagram; the original figure is not in the digital extraction. [Q387](https://ablibrary.net/book_content/b/12170/387?lang=ar).

## Exact remaining work and certification

Retrieve independently inspectable photographed pages **Q258, Q294, Q300, Q309 and Q387**; verify page-number offsets and compare every real printed cell against the editorial matrices. No table-gap `translationStatus` has been upgraded; no H whole printed page or Y manuscript position is newly certified; the 46-modal-proof programme remains separate. The historical source spans Q127–395 and has **no untranslated forward section beyond Q395**. The 57 modern reference-only entries require their own attribution and permissions work; they are not assumed words of the glossator.

**Canonical source and recovery:** [Full H reader](hawashi-numbered-notes.html) · [Full Stage114 corpus in Markdown](batches/hawashi-all-sections-cumulative-stage114.md) · [Stage114 structured 1,090-record corpus](hawashi-effective-stage114.json) · [Stage115 appendix reader](Tahdhib_Stage115_Apparatus_Reader.html).
