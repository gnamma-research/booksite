# GNAMMA Tahdhīb al-Manṭiq — LATEST CUMULATIVE HANDOFF

**Current stage 107 · 9 November 2026 · authoritative restart point for failed / truncated chats.**

**Canonical GitHub repository:** [gnamma-research/booksite](https://github.com/gnamma-research/booksite), default `master`. **Project root:** `texts/al-taftazani/tahdhib-al-mantiq/edition/`. Stage106 merged in [PR #261](https://github.com/gnamma-research/booksite/pull/261), commit `e94baf08772afb80c3553fcd798255a7a9072c44`. Stage107 resides on `tahdhib-cumulative-stage107-20261109` pending verified PR merge. Check the actual branch and latest merge before declaring files published.

**Stage policy:** This `HANDOFF_LATEST.md` is fully rewritten for each stage, while previous `stages/STAGE###` reports, underlying source batches, revisions and cumulative snapshots remain intact. Never regenerate from a chat summary alone; reconstruct from repository data.

## THE FIRST FILES TO READ in the next conversation

1. **This file `HANDOFF_LATEST.md`** — complete current state, next note, unresolved cruxes and verification recipe.
2. [`progress-data.js`](progress-data.js), machine-readable **NINE** source-graded metrics and immutable stage ledger **102–107**. The web [`progress.html`](progress.html) renders actual bars and status labels, not estimates.
3. [`stages/STAGE107_NOTES_056_110.md`](stages/STAGE107_NOTES_056_110.md), exact source-based report for the 55 new numbered glosses, their Arabic status, English and attribution cruxes.
4. [`batches/hawashi-numbered-cumulative-hwn001-110.md`](batches/hawashi-numbered-cumulative-hwn001-110.md), a self-contained **222K-character** cumulative annotated Arabic–English working Markdown for **ALL numbered notes 1–110**. 106 have complete first-pass English arguments; **1, 25, 82, 90** remain partial. Fifty-two numbered notes have full searchable-Arabic text; the other 58 have only short Arabic locator lemmas. FIVE attached unnumbered texts are separately displayed.
5. [`hawashi-numbered-notes.html`](hawashi-numbered-notes.html), searchable bilingual note reader; automatically aggregates stable note IDs from Stage104, Stage105, Stage106a–d and Stage107a–f without duplication. [`hawashi-q125-178.html`](hawashi-q125-178.html) is an OLDER **52-page short excerpt/analysis** reader, not proof of complete translation.
6. Previous immutable reports: [Stage104](stages/STAGE104_TRANSLATION_AND_PROGRESS.md), [Stage105](stages/STAGE105_COMPLETION_AND_GUIDANCE.md), [Stage106](stages/STAGE106_NUMBERED_TRANSLATION.md), plus [Stage103 witness candidate census](STAGE103_WITNESS_CANDIDATES_AND_LAYER_IDENTITIES.md), [Stage101 independent modal theorem boundary](STAGE101_DOMAIN_INDEPENDENT_PROOF_BOUNDARIES.md), and [complete first-pass principal Y commentary batch register](YAZDI_TWO_BATCH_RELEASE_2026-11-07.md).

## Textual families (DO NOT CONFLATE)

- **T**: Saʿd al-Dīn al-Taftāzānī's *Tahdhīb al-Manṭiq wa-l-Kalām* original matn, including **19 editorial logic divisions** and a separate **1,044-clause kalām** reader. All are working bilingual, not independently manuscript-certified here.
- **Y**: Mullā ʿAbd Allāh al-Yazdī's principal Arabic `ḥāshiya` on the logic text, Qum printed **Q7–Q123**. The printed p123 authorial prayer is distinct from a later completion notice. **110/110 substantive printed source positions** have working Arabic–English in two cumulative Markdown batches and HTML readers, **0/110 independently photographic/manuscript-certified**; seven other positions Q20,21,38,52,53,85,109 have no independently delineated authorial main text. Check Q24, Q37, Q95–101, Q108, Q114, Q117, Q123, and actual independent witness identity before any emendation.
- **H**: later ***ḥawāshī al-ḥāshiya***, separate mixed-author annotations after p123, starting with heading **Q125**, blank **Q126** and actual note prose **Q127**. The Qum edition has **274 later prose printed positions Q127–Q400**, including numbered notes, unnumbered notes, quotations and even modern editorial interpolations. Contributors include Mīrzā Muḥammad ʿAlī, Shaykh ʿAbd al-Raḥīm, quoted `al-Taqrīb`, al-Dawwānī, al-Rāghib and others. **Book-level catalogue naming Yazdī does NOT make him the author of H notes.** Manuscripts of T are not automatically independent Y or H witnesses.

## EXACT nine concurrent progress metrics as of Stage107

| Distinct goal | Current / scoped total | Scholarly qualification |
|---|---:|---|
| Original logic T matn, first-pass bilingual divisions | **19/19** | Translation; not definitive manuscript collation |
| Principal Y commentary, first-pass source Qum substantive pages | **110/110** | 113 working bilingual blocks, seven structural positions excluded |
| Principal Y photo/manuscript-certified pages | **0/110** | Manuscript leads identified but not independently collated |
| Later H print positions with short selected lemma excerpts/analyses | **52/274** | Older Q127–178 source-page *samples*, not complete pages |
| Later H FULL translated and photo-verified printed pages | **0/274** | Multiple numbered/unnumbered texts per page; no page can yet be certified complete |
| Later H *numbered notes* with full first-pass English in indexed opening cohort | **106/110** | Four incomplete numbers **1, 25, 82, 90**; total H note population beyond 110 unknown; NOT whole-work percent |
| Later H *numbered notes* with complete DIGITALLY SEARCHABLE Arabic transcription | **52/110** | Only notes24–75; 58 others have locators; ZERO photo-collated |
| Historical exceptional fourth-figure modal combinations source-classified | **46/46** | Historical taxonomy, NOT full independently derived modal proofs |
| Classical modal consequence types independently proved in full source semantics | **0/46** | Stage101 establishes weaker conditional temporal-shadows only |

**These are incomparable denominators and may never be added or conflated.** Zero of 274 later pages is fully certified even though 106 notes carry first-pass English. The original main Y may be 100% working-translated but remains 0% multi-witness certified. On H, Stage107 adds **55 new consecutive numbered notes, 53 marked complete first-pass, two partial**, not 55 complete Arabic facing pages or photographed pages.

## Translation/source data and exact aggregation

For reproducibility, load these files **in this order**:
1. `hawashi-numbered-notes-stage104.js`: original notes 1–18, some partial.
2. `hawashi-numbered-notes-stage105.js`: **overrides** for 2,8,9,12,15 and **appends** 19–23. Old versions retained in Stage104.
3. `hawashi-numbered-notes-stage106a.js` … `stage106d.js`: new 24–55; Arabic working transcription all 32, English. Stage106 25 partial due `به` / `وق.`.
4. `hawashi-numbered-notes-stage107a.js` … `stage107f.js`: new **56–110**. Batches a/b (56–75) contain 20 digitally searchable full Arabic working note transcriptions, and c/d/e/f (76–110) contain **35 Arabic locator lemmata only** with English. Notes **82** and **90** partial because the source reading and speaker boundaries respectively are uncertain.
5. The full source-aligned cumulative result is published to `batches/hawashi-numbered-cumulative-hwn001-110.md`, while the earlier 001–055 snapshot remains for audit/reversion.

**Arabic source representation is graded:** `arabicFullText` means *digitally searchable Qum source text, working transcription*, **not photographed facsimile**; `arabicLemma` alone means short locator, NOT a full Arabic edition. `scanCertified:false` stays on every record. In the reader, Arabic full vs locator is labelled immediately above the passage; English whole-note vs partial is separately labelled. This is one dedicated H companion: primary T+Y reader retains exactly the two *Matn* and *Matn + sharḥ* states.

**Five UNNUMBERED texts following notes 47,48,71,86,90** are separately attributed and counted outside all numbered denominators. Modern quotations in older pp127/132/134 require independent editorial attribution, not automatic incorporation.

## New substantive arguments studied in Stage107

- **56–65:** grammatical causal-accusative and circumstances; abstract `hudā/nūr` as participle or intensive predication; the prepositional phrase attached to following the Prophet, not his receiving an additional honour.
- **66–75:** `ikhtiṣāṣ` vs `ḥaṣr` (some authorities distinguish specification from exclusion), real vs relative restriction; etymology and meanings of `āl/ahl`; sources on Companions; distinct senses of `ṣidq/ḥaqq` and direction of correspondence.
- **76–78:** problem of defining a `qaḍiyya` as a report that admits `ṣidq/kadhib` without circularly defining “proposition” by “true/false report.” Distinguish report, correspondence relation and conventional use. 
- **79–85:** causative `bāʾ`, plural construct supposedly expressing universality, long competing definitions of `ẓarf laghw` (expressed governor) vs `ẓarf mustaqarr` (omitted governor) and general/specific predicate. **82** partial: `ويحتمل الاستقراء` suspected textual/context crux, independently inspect image.
- **86–95:** `ghāyāt` adverbs with removed complements; three statuses of omission; demonstrative “this” indicating what is mentally ordered rather than simply a physical book, with an **unresolved separate al-Taqrīb quotation** in **90**; seven book referent candidates and acceptability of `sawāʾ ... aw/am`. 
- **96–103:** mental vs verbal speech, *book titles as names of kinds*, abstract “refinement” predicated of concrete book by emphatic metaphor or suppressed predicate; `majāz al-ḥadhf` vs addition.
- **104:** full first-pass account of logic as `āla qānūniyya`; logical rules must be **observed** to prevent error; definition is `rasm` (relational instrumental end), not `ḥadd` (essence).
- **105–110:** bodily `maʿād`, distinction between philosophical method *not formally requiring Islamic conformity* and method *requiring disagreement* (the latter does not follow); coordination and `min` of genus vs part.

## Mandatory outstanding scholarly tasks

**A. H complete work.** Next source-numbered note **111**, Qum **p156–157**, extensive grammatical logic of genitive construction and relative extensions of `ʿaqāʾid al-Islām`. Continue **112** p157 on `islām` vs `īmān`, then note113 onward p158. One particularly long **unnumbered reported Imāmī excursus** follows note112 and must be separately labelled, not assigned falsely to author Y or counted as note113.

**B. Resolve previous gaps without invented text.** Notes **1** (Q127 modern inserted source boundary), **25** (Q135 `به`/terminal `وق`), **82** (Q149 doubtful `استقراء` construction) and **90** (Q151→152 separate al-Taqrīb quotation and demonstrative reference) remain partial. Obtain actual printed-page photographs and align Arabic source, not merely guess plausible wordings.

**C. Full Arabic for 58 notes** (1–23 and 76–110) currently have locator only. When images are available, transcribe independent full Arabic and align each English clause. Do not count digital full-text transcription as independent photographic manuscript collation.

**D. Y critical edition.** Q7–123 first pass is already complete—do NOT translate the same 110 pages repeatedly. Secure genuine independent Y witnesses from Stage103, verify incipit/explicit/family, collate problematic loci Q24/37/95–101/108/114/117/123, record actual variants by image and line. Kalām original T source with 1,044 clauses is a distinct project.

**E. Historical logic:** work from Stage101's weak temporal theorems and 46 historically source-classified modal combinations. Full modal truth conditions (life, times, worlds, subject description, same-individual `lā-dawām`, quantifier scope) and independent proofs remain unsatisfied. A zero-counterexample test is not automatically a nonvacuous theorem.

**F. Publication:** Keep compact Darūrī style and two primary states; H companion supports Arabic (full/locator), English and source/witness notes. Export final PDFs only after photographic collation and peer proofreading. Update the GNAMMA site itself via verified merges; a staging PR is not a deployed site.

## EVERY STAGE: mandatory cumulative, immutable and tested deliverables

1. New **immutable** `hawashi-numbered-notes-stage108a.js` etc with exact note IDs, page URLs, speaker, full/locator Arabic grade, English whole/partial grade, and separate unnumbered addenda.
2. New **immutable** `stages/STAGE108_<topic>.md` with per-note source ranges, real word counts, source and textual problems, actual delta and next note.
3. Regenerate entire `batches/hawashi-numbered-cumulative-hwn001-NEWEST.md`; retain old snapshots. Do not overwrite past translations or forget stage overlays.
4. Update `progress-data.js` **all nine metric denominators** (especially bounded cohort 106/110 and Arabic 52/110); `progress.html`, main H reader, and **entire** `HANDOFF_LATEST.md` with exact restart. Never call a translated *note* a translated *printed page*.
5. Run `python tools/tahdhib/check_stage_handoff.py`, `python tools/tahdhib/verify_logic_core.py`, and Chromium/WebKit Playwright checks `node tools/tahdhib/handoff_reader_qa.mjs` and established Tahdhīb reader QA. Merge only after green CI.
6. Give exact PR URL and commit if merged; never promise to continue asynchronously or falsely infer server deployment.

## Copy-paste minimal starter after another chat failure

> Continue Tahdhīb **Stage108** from the latest merged GitHub `master` of `gnamma-research/booksite`. FIRST read `texts/al-taftazani/tahdhib-al-mantiq/edition/HANDOFF_LATEST.md`, `progress-data.js`, `stages/STAGE107_NOTES_056_110.md`, `batches/hawashi-numbered-cumulative-hwn001-110.md`, and the Stage104/105/106a-d/107a-f note source files. Current working corpus: **110 consecutively numbered later H glosses Q127–156, 106 complete first-pass English, four partial (1,25,82,90); 52 full searchable Arabic notes24–75, 58 locator-only; FIVE separate unnumbered excerpts; 0/274 entire H printed pages fully translated/collated; 0/110 Y principal pages manuscript-certified; 46 modal classes sourced but 0 full classical proofs.** Continue complete source-numbered note111 across Q156→157, note112 and later; preserve separately attributed Shiʿi excursion on faith; update cumulative Markdown, nine progress bars, entire handoff and rigorous CI; merge only upon success.

**Last rule: this is a working digital-text edition with transparent evidence grades, not a definitive manuscript-collated edition.**
