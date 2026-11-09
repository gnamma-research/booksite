# GNAMMA Hikma critical-text programme — fourth cumulative handoff

**Frozen:** 9 November 2026. **Working branch:** `hikma-nihaya-muzaffar-fourth-batch-20261109`. **Repository:** `gnamma-research/booksite`.  
**Prior source-of-truth:** [third-stage handoff](./hikma-collation-handoff-2026-11-09-batch-3.md). This fourth batch **supersedes numeric totals** but retains earlier warnings and reading decisions.

## Verifiable state of the research corpus

| Text | Arabic–English paired working units | Individually documented same-base local bilingual checks | Independently collated *complete* printed/manuscript witness | Specialist-certified |
| --- | ---: | ---: | ---: | ---: |
| Muḥammad Riḍā al-Muẓaffar, *al-Manṭiq* | **57 selected**: intro 11, Book I 11, Book II 17, Book III 14, Book IV **4** | Source-grounded working translations; not individually certified | **0** | 0 |
| Ṭabāṭabāʾī, *Bidāyat al-Ḥikma* | **111 / 111** | Older revisions; exhaustive independent review still outstanding | **0** | 0 |
| Ṭabāṭabāʾī, *Nihāyat al-Ḥikma* | **136 / 136** | **70 / 136** (**68** inherited + **2** new, IX.9/IX.10) | **0 / 136** | 0 |

**Aggregate working units now 304** (=57+111+136). These reading units are vastly different in length; 57 Muẓaffar selections do NOT mean 57/57 of his six complete books. Books V and VI have no local source-paired English; significant original passages of Books I–IV and exercises remain absent. All Nihāya 136 paired translations need independent whole-witness text collation; **66** units lack the documented same-base close reading.

## New primary Muẓaffar bilingual text — opening of Book IV

These are full prose readings of consecutive *selected sections*, not a claim that Book IV is finished.

| ID | Source printed page(s), 1402 AH Dār al-Taʿāruf | Subject |
| --- | --- | --- |
| `M-C-01` | **125–127** | What a proposition is: a complete expression apt, *in itself* (li-dhātihi), for truth or falsity. Exclusion of inshāʾ; objection about truthful/false questions, petition and wishing; solution by **implicated report** (dalāla iltizāmiyya). |
| `M-C-02` | **127–128** | Categorical vs conditional, all original examples and the distinction between subject-predicate union and relations between two originally complete reports. |
| `M-C-03` | **128–129** | Connected vs disjunctive conditionals; affirmation and negation of *the relation* itself, not of one constituent; quality (kayf) of a proposition. |
| `M-C-04` | **129–130** | Subject/predicate/copula; antecedent/consequent/connective; artificial naming of the two sides of disjunction. |

**Source:** [original searchable 1402 Arabic with original printed page divisions](https://lib.rafed.net/view.php?b_id=1604&page=127&type=c_fbook). The [separate Princeton/NYU Arabic Collections Online 1968 scanned print](https://sites.dlib.nyu.edu/viewer/books/princeton_aco000780/1) is **identified but not independently collated**. Arabic presented in the data is punctuation/kāf-normalized; it is not a diplomatic print reproduction. The working English was prepared independently from the original Arabic. The complete original six-book work is NOT yet translated.

**Restart point:** Book IV next starts at printed **p.130** `أقسام القضية باعتبار الموضوع`, which classifies personal, natural, indefinite and quantified categoricals; then `لا اعتبار إلا بالمحصورات` pp.132–133, `السور وألفاظه` pp.133–134, quantified conditionals pp.134–137 and the later modal/reversal materials. Continue from `M-C-05`. Translate all authorial prose, restrictions, examples, exercise matter and footnote layer explicitly, marking missing material; verify via independent print eventually. At this stage there are **4** new Book IV selections, NOT all its content.

## New local Nihāya direct readings

### `N-IX-09` · On the substrate of motion, 1417 printed pp.265–266

In the base text [here](https://lib.rafed.net/view.php?b_id=1642&page=265&type=c_fbook) the author contrasts two cases:
1. Longitudinal/hierarchical substantial species: prime matter plus an earlier form serves as the subject for a later form; **putting on after putting on** (`اللُبس بعد اللُبس`) is cumulative intensification.
2. Parallel substantial species: successive forms alternate in an enduring matter; analogous to replacement by **stripping off and donning** (`الخَلع واللُبس`).

**New text-critical crux (unresolved):** The discussion of *the first, longitudinal* kind contains `لا بطريق الخلع واللبس كما في القسم الأول، بل بطريق اللبس بعد اللبس`. Here `كما في القسم الأول` points to the first kind while context explicitly ascribes the comparison to the **second** kind. A plausible editorial correction is `كما في القسم الثاني`. **This is a logical/internal conjecture, NOT a newly attested variant.** Keep the copied authorial Arabic unchanged. The working English similarly says “as in the former case” and needs a precise resolution **only after** comparing early 1404 print and later 1428 ed. al-Zāriʿī at exactly this locus. Record actual witness readings and page numbers with before/after; do not silently emend Arabic or claim a manuscript variant. The remainder of IX.9—composite vs simple motions, no descending motion, and bounded motion without indivisible temporal parts—has been read locally without other adopted correction.

### `N-IX-10` · On the agent of motion, pp.266–268

Base [here](https://lib.rafed.net/view.php?b_id=1642&page=266&type=c_fbook): locally matched the English explanation of the difference between mover and moved, substantial/accidental motion, separate ultimate agent, material causal conditions, the natural and forced types and the soul's command of embodied powers. `الطبيعة المقسورة` is “nature under compulsion”; it does not posit the external coercer as the continuing proximate moving principle. **No separate 1404/1428 witness comparison for this entire unit.**

Both review statuses and exact cautions were recorded in `nihaya-english-collation-triage-2026-11-09.json` and `cross-book-review-register-2026-11-07.json`. These are local textual checks, not independently certified collations.

## Synchronized repository paths

- `../muzaffar-al-mantiq/data/book.json`: appended `M-C-01`–`M-C-04`, Book IV stage and accurate source/translation status.
- `../muzaffar-al-mantiq/data/authorial-map.json`: updated Book IV selection counter to 4, total 57; all six books remain mapped bibliographically.
- `../muzaffar-al-mantiq/contents.html`: updated public coverage statement.
- `nihaya-english-collation-triage-2026-11-09.json`: now 70 same-base local checks; source-honest findings for IX.9 and IX.10.
- `cross-book-review-register-2026-11-07.json`: **304** per-unit entries, with new Muẓaffar records and Nihāya caveat and count.
- `../tools/audit-hikma.mjs`: dynamic count consistency and explicit guards for 57 Muẓaffar entries, 4 Book IV sections, 70 Nihāya local checks, 136 automated screens and 0 independent witness claims.

The previous `M-K-08` formula is **still an unresolved conjecture**, and `M-K-14` is still a normalized explanatory Arabic, not a diplomatic source. Keep both flagged. The eight specific 1428 printed editor variants in Nihāya remain explicitly attributed to the editor, not fabricated manuscript attestations.

## QA, PDFs and publication boundary

Reader QA workflow: `.github/workflows/hikma-reader-qa.yml`; run `node texts/al-tabatabai/tools/audit-hikma.mjs`, JavaScript syntax and Chromium/WebKit browser regression. Nine-PDF workflow: `.github/workflows/hikma-a4-pdf-release.yml`, triggered by a change to `*/data/book.json` on `master`, regenerates **Reading, Study and Reference** editions of all three books with source hashes and searchable A4, and publishes only when current. **A prior 53-section PDF manifest is stale relative to this 57-unit working branch.** Do not change PDF manifest counts by hand or claim new PDFs until the PDF workflow succeeds with verified SHA256 and committed catalog.

## Stage five actions

1. Continue **consecutively** with Book IV `M-C-05` and following actual Arabic source; cover all propositions, quantifiers, modalities, conditionals, contradiction, conversion; then Books V–VI. Preserve *all* examples, exercises and commentary layers; report separate page coverage, not only section counts.
2. Check the IX.9 cross-reference in the **two actual independently printed witnesses** (1404 scanned and 1428 two-volume) before adopting/rejecting any variant.
3. Review the remaining **66** Nihāya units locally clause-by-clause, with specific Arabic words in every correction register; then collate all 136 against real printed/manuscript exemplars in a distinct pass.
4. Independently source-compare all earlier Muẓaffar authorial passages, especially M-K-08 and M-K-14, correct where supported by prints, and ensure Arabic vs English alignment.
5. When merging, confirm green browser/source CI and source-hash synchronized **nine new PDFs** before reporting public editions as current. Do not mislabel checked working English as a definitive scholarly critical edition.

**Publication honesty:** 304 paired working units; **70/136** Nihāya local reads, **0/136** complete independent Nihāya witness collations, **0 specialist certified**, **57 incomplete Muẓaffar selected translations**. No manuscript stemma or definitive critical edition is claimed.
