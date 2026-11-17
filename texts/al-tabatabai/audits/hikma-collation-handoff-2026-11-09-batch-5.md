# GNAMMA Ḥikma programme · Stage V cumulative scholarly handoff

**Frozen:** 9 November 2026. **Branch:** `hikma-stage5-propositions-time-20261109`. **Repository:** `gnamma-research/booksite`. **Primary antecedent:** [Stage IV handoff](./hikma-collation-handoff-2026-11-09-batch-4.md), which itself preserves all preceding staged decisions. Use Stage V counts below in preference to inherited counts, without losing the earlier apparatus.

## I. Precise progress — five distinct measures

| Project / deliverable | Current verified inventory | Denominator / meaning | Caution |
|---|---:|---:|---|
| Ṭabāṭabāʾī, *Bidāyat al-Ḥikma*, paired working reader | 111 | 111 authorial units | No specialist-certified exhaustive witness collation |
| Ṭabāṭabāʾī, *Nihāyat al-Ḥikma*, paired working reader | 136 | 136 authorial units | Imported Arabic is a working transcription |
| *Nihāya* direct complete local bilingual unit reviews | **74** | 136 authorial units (**54.41%**) | **Four new** in this stage; separate from 136 automated integrity screens |
| *Nihāya* exhaustive independent second-print/manuscript collation | **0** | 136 authorial units | Limited inherited secondary spot checks do NOT constitute full collation |
| al-Muẓaffar, *al-Manṭiq*, original Arabic + working English selections | **62** | Unknown complete authorial unit count; **six books**, 455 printed pages in 1402 AH witness | **Nine** selected Book IV units; Books V and VI have zero local bilingual units |
| Combined local Arabic + working English reading units | **309** | 62 + 111 + 136 | The units differ substantially in length; **not** 309 pages |
| Independent specialist-verified chapters | **0** | All three texts | Never mark 'definitive' or 'expert certified' without actual review |

**Muẓaffar distribution:** Introduction **11**, Book I **11**, Book II **17**, Book III **14**, Book IV **9**, Book V **0**, Book VI **0**. The book/topic map is a **bibliographic map**, not a coverage certificate. Translation of selected material must not be confused with a full six-book work.

## II. New Muẓaffar source-grounded translation

The five authorial selections below continue from **M-C-04**, directly and in source order, and are saved as full paired Arabic–English working units in `../muzaffar-al-mantiq/data/book.json`.

| ID | Actual 1402 AH printed page span | Subject and source detail |
|---|---|---|
| **M-C-05** | 130–132 | Categorical by subject: singular, natural, indefinite, quantified (universal/particular); authorial examples; `Ishārāt` quotation and grammatical response |
| **M-C-06** | 132–133 | Why quantified cases govern inference; indefinites in force of particulars; important non-exclusivity of 'some' and four quantity/quality forms |
| **M-C-07** | 133–134 | `sūr` quantifiers and four Arabic symbolic abbreviations `كل / لا / ع / س`; maintain authorial signs |
| **M-C-08** | 134–136 | Conditional propositions personal, indefinite, and quantified, classified by circumstances/times, not categorical subject; all authored connected/disjunctive examples |
| **M-C-09** | 136–137 | Quantifier terminology for connected/disjunctive, all/none/some/not-all and negation-scope distinction |

**Source:** digital Arabic of Muḥammad Riḍā al-Muẓaffar, `https://lib.rafed.net/view.php?b_id=1604&page=133&type=c_fbook` and adjacent printed pp.130–137. Separate early 1968 Najaf ACO print `https://sites.dlib.nyu.edu/viewer/books/princeton_aco000780/1`, identified as public-domain by NYU, is **NOT** independently line-by-line collated for these five passages. The imported Arabic has editorial normalization (hamza/kāf/punctuation/paragraphs), not a diplomatic facsimile; source quotes and any exercise lines require independent print verification. The standalone original `M-K-08` symbolic proof remains a **conjecture** and `M-K-14` remains normalized rather than diplomatic. Do not remove these flags.

**Next Muẓaffar point:** Begin `M-C-10`, Book IV printed **p.138**, `تقسيمات الحملية` and first division `الذهنية، الخارجية، الحقيقية`; next continue negated predicates and modal assertions, then entire Book IV judgment rules, Books V and VI. Record all printed-page spans, subordinate argument/objection/reply, mathematical examples, exercises and later commentator notes separately. No fabricated source text.

## III. New *Nihāya* complete local readings (four units)

- **N-IX-02**, printed 1417 pp.251–253: weak and strong existence; continuity of potentially and actually received substantial form; matter, progressive gradation, `كمال أول لما بالقوة من حيث إنه بالقوة`; no English change.
- **N-IX-08**, printed 1417 pp.261–264: substantial motion proved from accidental motion; objection from supplementary external causes, reply involving accidents' *being-for-subject*; second proof, continuous substantial form, first and second motions, hard issue over successive instantaneous parts, universal matter. Retained the prior source note that this difficult expression is itself in the 1404 scanned print; **not** a new complete second-witness check.
- **N-IX-11**, printed 1417 pp.268–271: time as continuous, nonstable quantity; motion's individuation, instants as privative common limits, `ḥaraka qaṭʿiyya/tawassuṭiyya`, seven results, `dahr/sarmad` and the cited *Asfār*.
- **N-IX-14**, printed 1417 pp.273–276: six dependencies of motion; nature's inclination and agent, degrees of `quwwa/qudra`, complete vs incomplete cause, response to divine compulsion objection, time-before-time, pre-act power.

The reviewed base Arabic is in `../nihayat-al-hikma/data/book.json`. Individual source-location and findings are in `nihaya-english-collation-triage-2026-11-09.json` and `cross-book-review-register-2026-11-07.json`. **These are complete local same-base bilingual readings, not an independently attested critical text or reviewer certification.**

### III.a Precisely corrected translation in IX.11

- **Base authorial wording:** `وكل آني الوجود من الحوادث ... منطبق على الآن ، والحركة التوسّطيّة منطبقةٌ عليه بواسطة القطعيّة`.
- **Before:** “Intermediate motion corresponds to **time** through traversal motion.”
- **After:** “Intermediate motion corresponds to **the instant** through traversal motion.”
- **Reason:** the immediately preceding referent of `عليه` is `الآن`; later treatment of the “flowing instant” is expressly metaphorical. This is an **English translation repair**, not an emendation of the Arabic or a discovered manuscript variant.
- **Where corrected:** the source-of-truth `../nihayat-al-hikma/data/book.json` English field and unit notes, plus continuous `../nihayat-al-hikma/data/nihayat-al-hikma-english.txt`. The triage and 309-unit review ledger record the change with the 1417 source link.
- **Source to reverify independently:** `https://lib.rafed.net/view.php?b_id=1642&page=269&type=c_fbook`, printed pp.269–270.

### III.b Earlier textual conjecture remains unresolved

In `N-IX-09` (pp.264–266) the authorial base text retains `لا بطريق الخلع واللبس كما في القسم الأوّل`. Internal structure suggests **`الثاني`**, but no independent 1404 or 1428 witness has yet been checked at the exact place. The `N1417-IX09-REFERENCE-01` supplement note makes this **UNADOPTED conjecture** visible beside the reader passage; do not overwrite Arabic, manufacture variant attestation, or remove the public warning.

## IV. Repository files touched and reproducibility

- `../muzaffar-al-mantiq/data/book.json`: new `M-C-05`–`M-C-09`, 62 selections.
- `../muzaffar-al-mantiq/data/authorial-map.json`: exact Book IV 9, overall 62; six-book bibliographic coverage remains clear.
- `../muzaffar-al-mantiq/contents.html`: corrected user-facing coverage.
- `../nihayat-al-hikma/data/book.json`: actual IX.11 English and notes change, all 136 authorial readings preserved.
- `../nihayat-al-hikma/data/nihayat-al-hikma-english.txt`: matching prose correction in continuous edition.
- `nihaya-english-collation-triage-2026-11-09.json`: 136 screen rows, **74** complete local reviews, 4 new, 1 source-driven English correction; 0 complete independent second-witness.
- `cross-book-review-register-2026-11-07.json`: **309 distinct** corpus unit IDs, source grades and local review status.
- `../tools/audit-hikma.mjs`: preserve strict 62, 9 Book IV, 74 locally checked, 136-screen and IX.11 repaired referent checks.
- `../nihayat-al-hikma/data/editorial-supplement.json`: **unchanged** (9 notes), including the visible, explicitly unadopted IX.9 conjecture.

Reader and browser verification commands:

```sh
node texts/al-tabatabai/tools/audit-hikma.mjs
node --check texts/al-tabatabai/assets/hikma-reader.js
node --check texts/al-tabatabai/assets/hikma-combined.js
node --check texts/al-tabatabai/assets/hikma-refinements.js
node texts/al-tabatabai/tools/qa-browser.cjs
```

Reader QA workflow `.github/workflows/hikma-reader-qa.yml` runs audit and browser tests on PR. After successful merge into `master`, `.github/workflows/hikma-a4-pdf-release.yml` must produce and verify the nine independent source-hash-matched A4 PDFs (three each for Muẓaffar, Bidāya and Nihāya). The old PDF manifest remains stale until the new workflow completes with valid SHA256 and commits updated PDFs and `editions/manifest.json`. Do not adjust manifest counters without generating actual searchable PDFs.

## V. Next-stage obligations

1. Resume **M-C-10** p.138 and continue consecutively throughout Book IV, Book V, Book VI. Work from real Arabic, preserving argument length and all subissues rather than padding status with summaries.
2. Check N-IX-09 disputed reference against actual 1404 scanned and 1428 vol.2 images, record exact *diplomatic* before/after and printed page in the critical-note registry; conjecture is not adopted in Stage V.
3. Review **62 remaining Nihāya units locally**, then independently collate all 136 units against printed witnesses and (if available) manuscripts. Full same-base local review is not external collation.
4. Recheck M-K-08 copied symbols and M-K-14 reconstructed Arabic against facsimile or early printed witness; do not silently promote conjectures into authorial matn.
5. If branch merging/release automation has not yet succeeded, **check actual QA/PDF run status** and repair any failure. The commit handoff is durable regardless.

**Non-negotiable editorial status:** 309 source-paired selected/complete working units, 74/136 local Nihāya checks, **0/136** independently complete witness collations and **0** specialist-verified chapters. Neither PDF count nor automated lint certifies source authenticity.

