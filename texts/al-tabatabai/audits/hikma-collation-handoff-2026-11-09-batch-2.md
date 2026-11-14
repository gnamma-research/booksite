> **Newer cumulative stage:** [Third batch, 9 November 2026](hikma-collation-handoff-2026-11-09-batch-3.md) supersedes the totals below: 53 Muẓaffar selected passages, 68 of 136 Nihāya direct bilingual readings and three additional textual corrections. This batch-2 snapshot remains for provenance.

# Hikma critical edition — cumulative handoff, second 9 November 2026 batch

Repository: [gnamma-research/booksite](https://github.com/gnamma-research/booksite). Source branch: `hikma-complete-next-batch-20261109`. Preserve this handoff alongside [the first-round handoff](hikma-collation-handoff-2026-11-09.md).

## Verifiable scope

| Corpus | Local Arabic + working English | Local bilingual reading review | Independent complete textual collation | Expert-certified |
|---|---:|---:|---:|---:|
| Muẓaffar, al-Manṭiq | **46 selected units**, not full six books | New sections drafted from original searchable Arabic; 1968 print check pending | Not completed | 0 |
| Ṭabāṭabāʾī, Bidāyat al-Ḥikma | 111 / 111 units | Prior revision only; full external witness review outstanding | Not completed | 0 |
| Ṭabāṭabāʾī, Nihāyat al-Ḥikma | 136 / 136 units | **28 / 136** passages directly read against local Arabic (16 previous + 12 this batch) | Not completed; selected four spot checks against 1428 printed digital transcription | 0 |

**Summary of current work:** **293** local reading units across the three texts, but the units are *not comparable* in page length or evidentiary completeness. Nihāya English review by passage is 28/136 (~20.6%). Muẓaffar proportion of original authorial page text translated must **not** be inferred from the ratio of local units; its full six-book Arabic work is much larger.

### New Muẓaffar Book II units

| ID | Printed page(s) | Subject | Editorial status |
|---|---|---|---|
| M-K-08 | 65–67 | Complements of coextensive and inclusion-related universals | Conjectural repair of logically inconsistent symbolic proof; exact original remains in apparatus |
| M-K-09 | 67–69 | Complements of overlapping/disjoint universals | Printed formulas require independent check |
| M-K-10 | 70–73 | Species, genus, differentia | Working translation |
| M-K-11 | 73–75 | Relative species, higher/lower genus and differentia | Working translation |
| M-K-12 | 75–77 | Essential / accidental; proprium / common accident | Working translation |
| M-K-13 | 77–78 | Shared/compound properties and subclasses | Working translation |
| M-K-14 | 78–81 | Three technical senses of predication | **Normalized explanatory Arabic, not a diplomatic transcription** |
| M-K-15 | 84–86 | Natural, logical, intellectual universals | Working translation, continuation included |
| M-K-16 | 82–83 | Accidental attribution as predication versus inherence | Working translation |
| M-K-17 | 83–84 | Necessary/separable accidents and grades of evidential immediacy | Working translation |

Source: https://lib.rafed.net/view.php?b_id=1604&type=c_fbook (1402 AH Dār al-Taʿāruf digital transcription); independent early printed witness for future collation: https://sites.dlib.nyu.edu/viewer/books/princeton_aco000780/1 (NYU ACO 1968 digitization). Alternative digital witness: https://lib.rafed.net/view.php?b_id=1728&page=98&type=c_fbook (1421 AH).

**Source-critical example:** In M-K-08 p. 67 the digital source runs «لا جـ بدون لا ب» then «لا ب مع جـ» then «جـ بدون ب», a sequence that does not yield the alleged conclusion if B is more general than J. The expected sound argument uses an instance of «لا ب بدون لا جـ» to force «جـ بدون ب». The change is an **editorial logical conjecture**, not a variant attested in manuscript or early print. Retain the copy reading and prohibit silent correction.

**Outstanding from al-Manṭiq:** Book I after the initial four expressions passages; Book II missing exercises/micro-passages and replacement of M-K-14 with full diplomatic source; Book III divisions and other omitted subtopics; **all authorial text of Books IV, V, VI** and the complete editorial collation. The source map lists headings; it is not a substitute for source or translation.

### Additional Nihāya Arabic–English readings

Directly read against current stored Arabic in this batch: **N-V-01, N-V-02, N-V-04, N-V-07, N-VI-08, N-VI-11, N-VII-04, N-VII-05, N-VII-07, N-VII-08, N-X-03, N-X-04**. All are recorded individually in `nihaya-english-collation-triage-2026-11-09.json` along with the 16 earlier passages. Mechanically screened 136/136 units; that automated stage is **not** semantic verification.

The later editor's corrected printed transcription (1428 AH, ed. ʿAbbās ʿAlī al-Zāriʿī) was spot-checked at four loci: N-V-01 pp. 119–121; N-V-02 pp. 122–124; N-VII-07 pp. 257–258; N-VII-08 p. 259. These are *not* complete independent manuscript collations. Sources:
- https://lib.rafed.net/view.php?b_id=3108&page=119&type=c_fbook
- https://lib.rafed.net/view.php?b_id=3108&page=122&type=c_fbook
- https://lib.rafed.net/view.php?b_id=3108&page=257&type=c_fbook

**Concrete translation correction:** VII.8 «المتضايفان متكافئان وجوداً وعدماً وقوّةً وفعلا» formerly “two correlatives are coextensive in existence and nonexistence ...” now reads “two correlatives correspond necessarily in respect of existence and nonexistence, and likewise of potentiality and actuality”. The corrected English states simultaneity of existential/modal correlatives without falsely suggesting coextensive sets.

**Two source-layer notes:**
- V.2, 1428 AH editor p.123 n.1 argues against the *author's inference* that an externally realized conditioned quiddity entails independent existence of the lā-bi-sharṭ subdividend. This is editor's dissent, not an authorial claim or variant.
- VII.7, 1428 AH editor p.258 n.4 points out the historical scorpion-blindness illustration is biologically suspect because scorpions have eyes. Preserve the authorial «كما قيل», do not silently rewrite the matn.

### How to continue

1. Import and verify the remaining primary Arabic *Muẓaffar* systematically page by page. Never use an editorial paraphrase to fill absent source while labeling it authorial. Include every objection, reply, distinction, example and qualification in fresh English, with exact printed witnesses and explicit unit IDs.
2. Directly review each remaining `Nihāya` unit, preserving every logical operator, Arabic technical term, and source-specific qualification; second-source comparison as a **distinct** attestation status. 108/136 still lack local full direct review, and 136/136 lack external certified collation.
3. Resolve major conceptual targets—quiddity, independent/linking existence, cause/effect, substantial motion, intellectual abstraction, divine knowledge—as well as the lesser rhetorical and doctrinal passages. Avoid creating a scholarly certification flag from a regex or length test.
4. Keep `texts/al-tabatabai/audits/cross-book-review-register-2026-11-07.json` synchronized with source, stage and unit statuses, and preserve the existing eight 1428 AH printed-editor emendations with clear attribution.
5. Run `node texts/al-tabatabai/tools/audit-hikma.mjs`, Chromium/WebKit Playwright tests `tools/qa-browser.cjs`, and the nine A4 PDF build using `tools/build-pdfs.cjs`. The GitHub `.github/workflows/hikma-a4-pdf-release.yml` publishes only when content hashes match current master. Confirm green CI and the new `editions/manifest.json` before claiming publication.

**Release rule:** Never claim “complete full English collation,” “fully translated Muẓaffar,” “manuscript critically edited,” or “specialist certified” until those independent tasks are actually done and documented.

