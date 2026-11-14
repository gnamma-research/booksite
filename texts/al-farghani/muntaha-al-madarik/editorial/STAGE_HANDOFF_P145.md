# Farghānī · Muntahā al-madārik — completion of English introduction draft; first clause-based critical check

**9 November 2026 · GNAMMA / Texts → ʿIrfān and metaphysics · P145 milestone**

## What was completed in this turn

1. **Final installment**: B2007 pp.135–145 (11 printed pages), in `TRANSLATION_135_139.md` and `TRANSLATION_140_145.md`. P143 concludes the four foundations; **pp.144–145** are a separate `تتمة الديباجة` ("Continuation of the preface"), before the poem commentary.
2. **Cumulative English working master**: `WORKING_TRANSLATION_18_145.md` (B2007 pp.18–145; **128** consecutively numbered source pages). Former master `WORKING_TRANSLATION_18_134.md` remains preserved.
3. **First Arabic source-checking pass**: **80 authorial clauses**, B2007 **pp.18–23**, with Arabic, revised English, source and critical notes. `CRITICAL_TRANSLATION_18_23.md`; `CRITICAL_AUDIT_STAGE_001.md`; structured unit files `data/critical-pass-001-p18-20.js` and `data/critical-pass-002-p21-23.js`; browser-readable `critical-edition.html`. This is a first clause-by-clause **modern printed-digital source** check, **not** an early manuscript collation.
4. **Page-coverage evidence**: `CRITICAL_COVERAGE_REGISTER.json` covers all 128 source pages as separate records with independently distinguishable fields `english_working_draft`, `english_clause_checked_B2007`, `full_arabic_page_in_repo`, and `actual_manuscript_inspected`.
5. **GNAMMA**: 128-page compact English reader, critical review page with Arabic/English + note/source controls, collection index, archive, and updated edition status (verify git commits and hosting separately).

## Actual stage quality

The English **working draft** is structurally complete **for the introduction only**; all four foundations (ending p.143) and the concluding two-page preface (pp.144–145) are represented. The independent **source-language critical verification is NOT complete**: only six printed digital pages checked clause by clause (80 records). All 128 page headings in the master are present; the heading audit is an integrity check, not linguistic validation.

No I1876 printed images or medieval manuscript leaves have been compared at corresponding loci; no manuscript variants are established. The new p135–145 translation relies on a derivative Arabic transcript with B2007 printed markers, not a manuscript facsimile. Work on the subsequent verse commentary must not be added as though it belonged to the four foundations.

## Principal textual corrections and issues

- B2007 p.18: `تعيّن الأسماء` should normally be translated *determination of the names*, rather than simply *differentiation*.
- P18 `بطون المشتمل`, p19 `المطلب الغائبّ`, p19 `عمليّا ووجوديّا` and p23 the modal reference to undetermined hidden affairs are open critical issues.
- B2007 p.21: missing `من حيث واحديتها` restored in F007; modern print and late quotation in al-Fanārī support the form. This is an earlier **transcription correction**, not a manuscript-derived variant.
- Farghānī cites the "hidden treasure" saying as a divine report; do not present this as authenticated prophetic hadith. The statement "I cannot enumerate Your praise" is independently attested in Ṣaḥīḥ Muslim 486.
- P23 `فلم تعلم ولم يحكم بشيء منها إلّا بعد تعيّنها` is the author's wording as printed, a real philosophical problem deserving an apparatus note, not silent harmonization with divine omniscience.

## Primary witness and checkpoint paths

- Modern Arabic: https://ablibrary.net/book_content/b/9606/18?lang=ar and next pages through p23, directly inspected.
- Intro concluding Arabic: https://alshrefalm7sy.ahlamontada.com/t3214 (p135–145), derivative modern online transcription.
- 1876 Istanbul print (uncollated) https://sites.dlib.nyu.edu/viewer/books/princeton_aco000264/1?embed=1&lang=en
- Early manuscript catalogue: Yeni Camii 706 (identified; folio images not inspected).
- Later quotation: `Miṣbāḥ al-uns`, modern p183, https://ablibrary.net/book_content/b/4696/183?lang=ar.
- Repository critical issue: https://github.com/gnamma-research/booksite/issues/245.

## Exact next operation — critical checking, not more introductory translation

**Resume B2007 p.24**, continuing the sentence about `شؤون ذاتية` from p23. Arabic source: https://ablibrary.net/book_content/b/9606/24?lang=ar.

**Last reviewed Arabic at end of p23:** `وصفة بقائها وثباتها اعتبارا لبعض`—sentence incomplete until p24. First inspect B2007 p24, delimit the authorial text (not editor's footnotes), compare each clause with the English draft, and record source text, revised English, correction decision, and any crux in `data/critical-pass-003-p24-XX.js`.

**Manuscript-critical priority:** retrieve an actual facsimile leaf for I1876 corresponding to B2007 p18, produce a reliable printed-page concordance, then obtain/inspect Yeni Camii 706 and any independent witness. Record actual readings before claiming a definitive text.

## Full cumulative handoff policy

The canonical entire current-stage text and apparatus will be in `FULL_CUMULATIVE_P145.md`, accompanied by `STAGE_MANIFEST_P145.json`, which must record file SHAs and the exact boundary. Previous P34, P84 and P134 full archives remain immutable and must not be retranslated or replaced.

**Completion categories at P145:** English translation draft complete for introduction; Arabic-to-English clause verification begun; independent historical print/manuscript collation not begun; definitive critical edition NOT complete. Do not blur these distinctions.
