# GNAMMA Hikma critical-text programme — cumulative third-stage handoff
**Date:** 9 November 2026 · **Branch:** `hikma-nihaya-muzaffar-third-batch-20261109` · **Repository:** `gnamma-research/booksite`

This handoff supersedes the totals in [batch 2](hikma-collation-handoff-2026-11-09-batch-2.md) while preserving all its notes, scope limitations and decisions. The README/reader's claim of working coverage must **never** imply a certified definitive critical text.

## Summary of verified repository coverage

| Project | Authorial Arabic + working English locally | Direct local Arabic/English reading checks | Independent full witness collation | Expert-verified |
| --- | ---: | ---: | ---: | ---: |
| Muḥammad Riḍā al-Muẓaffar, *al-Manṭiq* | **53** selected reading sections, not all six books | New original selected Book I sections translated; 1968 scan not fully checked | No | 0 |
| Ṭabāṭabāʾī, *Bidāyat al-Ḥikma* | 111 of 111 authorial units | Prior working translation; independent review incomplete | No | 0 |
| Ṭabāṭabāʾī, *Nihāyat al-Ḥikma* | 136 of 136 authorial units | **68/136** documented complete local Arabic–English reading checks (28 previous + **40 new**) | No; selective five 1428 digitally transcribed source spot checks | 0 |

**Total combined locally paired reading units: 300** (53 + 111 + 136). These vary greatly in length. Automatic completeness/paragraph checks for Nihāya are 136/136 but **are not equivalent** to the 68 direct local bilingual readings, let alone full independent critical comparison. The remaining local direct Nihāya readings total 68, and all 136 still require independently verified exhaustive Arabic source variants and specialist assessment.

## New Muẓaffar Book I authorial sections (pp. 38–53, 1402 AH searchable Arabic source)

| ID | Topic | Printed pages |
| --- | --- | --- |
| M-L-05 | Specific, equivocal, transferred, newly coined, literal and figurative expressions; explicit vs community-enacted semantic transfer | 38–41 |
| M-L-06 | Synonymy and conceptual difference, distinct from disjointness of individuals | 42–43 |
| M-L-07 | Differences, similarity, and opposition; shared genus/species versus conceptual difference | 43–45 |
| M-L-08 | Contradiction, possession/privation, contrariety, correlation | 45–47 |
| M-L-09 | Simple and compound expressions, complete versus incomplete | 49–50 |
| M-L-10 | Assertion versus performative/nonassertoric speech: logic of true/false and enactment | 50–51 |
| M-L-11 | Verb, noun, particle and dependent relational signification; special treatment of kāna | 51–53 |

Source: [al-Manṭiq, Dār al-Taʿāruf (1402 AH) searchable Arabic](https://lib.rafed.net/view.php?b_id=1604&type=c_fbook); early independent [NYU ACO 1968 printed scan](https://sites.dlib.nyu.edu/viewer/books/princeton_aco000780/1) remains to be visually collated page by page. The new Arabic is **source-grounded and paragraph-transcribed but punctuation-normalized**. The original author's full exercises, subdivisions and remaining text still require checking; do not call these diplomatic printed transcriptions.

Prior batch M-K-08 remains an explicit unsolved contradictory-symbol proof in the digital original, and M-K-14 is still a labelled normalized reconstruction rather than a fully diplomatic authorial reading. Preserve these warnings.

### Major *al-Manṭiq* gaps
- Book I beyond the newly imported primary text, including full exercises and additional discussions.
- Book II concluding particulars and some ancillary sections; verify all provisional text.
- Book III division and omitted content not yet transcribed beyond 14 earlier selections.
- **Books IV, V, and VI: no locally translated authorial content**. These are propositions; inference/syllogism; demonstrative and other arguments. Do not infer coverage from a complete bibliographic topic map.
- All authorial source requires independent early printed witness checking before “scholarly critical edition”.

## Nihāya: newly read 40 passage IDs, direct against stored authorial Arabic

**Four introductory passages:** `N-IV-PRE`, `N-VI-PRE`, `N-XI-PRE`, `N-XII-PRE`.

**Existence and modality:** `N-II-01`, `N-IV-07`, `N-VII-01`, `N-X-06`, `N-X-07`, `N-X-08`.

**Substance, categories and causality:** `N-VI-03`, `N-VI-18`, `N-VI-19`, `N-VI-20`, `N-VI-21`, `N-VIII-01`, `N-VIII-02`, `N-VIII-06`, `N-VIII-08`, `N-VIII-09`, `N-VIII-10`, `N-VIII-15`.

**Motion and time:** `N-IX-PRE`, `N-IX-01`, `N-IX-04`, `N-IX-05`, `N-IX-06`, `N-IX-07`, `N-IX-13`, `N-X-05`.

**Intellect and divine metaphysics:** `N-XI-04`, `N-XI-05`, `N-XI-06`, `N-XI-11`, `N-XI-14`, `N-XII-03`, `N-XII-05`, `N-XII-07`, `N-XII-19`.

The source and translation for each are checked for the principal distinctions, examples, objections, answers and qualified conclusions. More fine-grained sentence-by-sentence independent collation is still required. Exact findings and statuses, one per ID, are in `nihaya-english-collation-triage-2026-11-09.json`. The eight earlier 1428 printed editor critical apparatus notes remain separate from authorial text.

### Three specific text corrections

1. **Stage XI introduction `N-XI-PRE`**: «العقل» refers to **intellect**, not “intellection.” Corrected opening to “Although the heading uses ‘intellect’ (al-ʿaql)—a term conventionally applied to universal rather than particular apprehension—the investigation extends to both.” Local Arabic and English directly checked.
2. **Stage VI.19 `N-VI-19`**: «الصورة الخياليّة المجرّدة من الكمّ» is **imaginal form divested of quantity**, not an “imaginal form of quantity that is immaterial.” Corrected the modifying phrase, with source note; single relevant clause cross-checked in [1428 revised edition, vol. 1, printed p. 228](https://lib.rafed.net/view.php?b_id=3108&page=237&type=c_fbook). This is a digitally transcribed printed witness check, **not manuscript attestation**.
3. **Stage VIII.10 `N-VIII-10`**: imported «االمشهور» (duplicated initial alif) corrected to «المشهور». Orthographic repair only, with note. No thesis or philosophical reading silently altered.

### Policy for next research batch
- Primary task: review the remaining **68** entire Nihāya units directly, clause by clause, including each negation, qualification, counterargument, source quotation, and Sanskrit/Greek terminology as applicable. In an independent stage, collate each with **multiple actual printed/manuscript sources** with exact page, before/after and adopted/rejected variant evidence. Do not conflate this with the 136-unit automatic scan.
- Separately complete Muẓaffar all six original books from verifiable Arabic, then compare English with each witness and certify only upon actual review. Consider replacing M-K-14 with exact original and resolving M-K-08 first.
- Preserve whether notes are authorial (marked «منه رحمه الله»), later printed editor's commentary, translator's note or merely hypothesis.
- Update `texts/al-tabatabai/audits/cross-book-review-register-2026-11-07.json` with every changed unit and `texts/al-tabatabai/audits/nihaya-english-collation-triage-2026-11-09.json`.
- Tests: `node texts/al-tabatabai/tools/audit-hikma.mjs`, JavaScript syntax, Chromium and WebKit browser QA; on merged `master` PDF workflow `hikma-a4-pdf-release.yml` must regenerate all nine searchable A4 editions and validate SHA256 against source and manifest. Verify results, do not claim PDF publication based on a queued run.

**Editorial status: working original text and translation, direct partial review; not a complete scholarly critical edition.**
