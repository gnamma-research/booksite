# GNAMMA Tahdhīb — LATEST CUMULATIVE HANDOFF

**Stage 108 · 9 November 2026 · definitive restart document for a truncated/failed chat, NOT a definitive manuscript edition.**

**Repo:** [gnamma-research/booksite](https://github.com/gnamma-research/booksite), default `master`. **Project root:** `texts/al-taftazani/tahdhib-al-mantiq/edition/`. **Stage107 was MERGED** as [PR #262](https://github.com/gnamma-research/booksite/pull/262), commit `7805a519287f967a8c211a49e94103569ddabb44` after Tahdhīb logical-core and Chromium/WebKit tests passed. Stage108 changes are on `tahdhib-cumulative-stage108-20261109` until their own PR is merged; confirm master/branch before claiming deployment.

**Durability contract:** this file is **fully rewritten and cumulative**, but older `stages/STAGE###` reports, source-JS batches and cumulative Markdown snapshots remain immutable. Do not use a chat summary as the source of truth when source files are present.

## Read in this precise order after a conversation failure

1. This `HANDOFF_LATEST.md`.
2. [`progress-data.js`](progress-data.js) (canonical machine-readable **nine separate progress bars** and stage ledger 102–108); [`progress.html`](progress.html) (live web dashboard).
3. [`stages/STAGE108_NOTES_111_126.md`](stages/STAGE108_NOTES_111_126.md) (immutable source-critical report, note-specific actual work and next steps).
4. [`batches/hawashi-numbered-cumulative-hwn001-126.md`](batches/hawashi-numbered-cumulative-hwn001-126.md): **latest complete cumulative Markdown** for 126 consecutively numbered later-gloss H notes. About 20,457 English words in the current note fields, 122 first-pass complete English and four partial; 54 full digitally searchable Arabic note transcriptions and 72 short Arabic locator phrases; six unnumbered separately attributed glosses. It is not a complete photographic Arabic–English edition.
5. To reconstruct actual data instead of retyping: [Stage104 base notes](hawashi-numbered-notes-stage104.js); [Stage105 override/appends](hawashi-numbered-notes-stage105.js); Stage106 [a](hawashi-numbered-notes-stage106a.js), [b](hawashi-numbered-notes-stage106b.js), [c](hawashi-numbered-notes-stage106c.js), [d](hawashi-numbered-notes-stage106d.js); Stage107 [a](hawashi-numbered-notes-stage107a.js), [b](hawashi-numbered-notes-stage107b.js), [c](hawashi-numbered-notes-stage107c.js), [d](hawashi-numbered-notes-stage107d.js), [e](hawashi-numbered-notes-stage107e.js), [f](hawashi-numbered-notes-stage107f.js); Stage108 [a](hawashi-numbered-notes-stage108a.js), [b](hawashi-numbered-notes-stage108b.js). Stable IDs `HWN-001`…`HWN-126` must be unique. Stage105 versions must override older English rather than count as new notes.
6. [`hawashi-numbered-notes.html`](hawashi-numbered-notes.html) is the mobile, searchable bilingual working reader. [`hawashi-q125-178.html`](hawashi-q125-178.html) is the earlier shorter excerpt-only companion and does NOT represent 52 full pages translated.
7. Critical dependencies: [Stage103 witness inventory](STAGE103_WITNESS_CANDIDATES_AND_LAYER_IDENTITIES.md), [Stage101 proof boundary](STAGE101_DOMAIN_INDEPENDENT_PROOF_BOUNDARIES.md), [principal Y two-batch working translation register](YAZDI_TWO_BATCH_RELEASE_2026-11-07.md), prior [Stage107 report](stages/STAGE107_NOTES_056_110.md).

## Three different textual families — never mix

- **T = Saʿd al-Dīn al-Taftāzānī original *Tahdhīb al-Manṭiq wa-l-Kalām***. Logic reader has **19** editorial units translated; separate kalām has **1,044** stable translated clauses. Not independently manuscript-certified in this H continuation.
- **Y = Mullā ʿAbd Allāh al-Yazdī principal `Ḥāshiya/Sharḥ`** of the logic portion. In the Qum volume its principal author's discourse is Q7–123, with separate nonauthorial completion notice. **110/110 substantive Qum printed positions (113 bilingual blocks) complete in SEARCHABLE-PRINT FIRST PASS**, but **0/110** independently photo/manuscript collated. Missing/structural main-text positions Q20/21/38/52/53/85/109. Correct core cruxes Q24, Q37 (possible missing continuation), Q95–101, Q108 (`حكم عليه كل كل`), Q114, Q117 and Q123 only with actual second witnesses. Do NOT use manuscripts of T as automatic Y variants.
- **H = LATER `ḥawāshī al-ḥāshiya`**, introduced at Q125, blank Q126, substance Q127 onward. **Q127–400 inclusive = 274 later printed positions.** Multiple separately signed voices—Mīrzā Muḥammad ʿAlī, Shaykh ʿAbd al-Raḥīm, other historians and quotations of `al-Taqrīb`, Dawwānī, al-Rāghib, etc. This entire Stage104–108 numbered-note corpus is H, not Y. Printed volume’s catalogue label listing Yazdī as author is not passage-specific attribution. Some additional quotations are modern and must be clearly distinguished.

## EXACT Stage108 cumulative progress — nine independent denominators

| Objective | Current | What the bar actually certifies |
|---|---:|---|
| Taftāzānī T logic matn, bilingual editorial units | **19/19** | Working first-pass source |
| Main al-Yazdī Y principal commentary, substantive Qum page positions translated | **110/110** | Working source-English, 113 nonoverlapping blocks |
| Main Y principal positions independently manuscript/photo certified | **0/110** | Candidate witnesses are not certified readings |
| H printed page positions with earlier short excerpt/analytic sample | **52/274** | Q127–178 *selected excerpts*, not whole page translation |
| H entire printed pages completely translated **and** photographically collated | **0/274** | No false note→page inference |
| H consecutively numbered opening notes Q127–160 with complete first-pass English | **122/126** | Partial: **HWN-001, HWN-025, HWN-082, HWN-090**; scoped local note cohort, NOT all H notes |
| H numbered notes with full *digitally searchable* Arabic note text | **54/126** | Full working Arabic for **24–75 and 114–115**, **72** locator-only; **zero photograph certified** |
| 4th-figure exceptional modal types historically classified | **46/46** | Historically source typed, not independently derived |
| 4th-figure complete medieval modal theorems independently proved | **0/46** | Stage101 proved limited temporal consequences conditional on explicit assumptions |

**These numbers use different units.** A first-pass translated numbered note does not render any whole printed page complete. A digitized searchable source is not a photographed manuscript witness. 122/126 expresses only **our now-enumerated opening cohort** and must not become “97% of all H.” Pages Q161–400 remain to be systematically processed.

## Stage108 actually completed vs unresolved

- **16 new notes HWN-111…126** on Qum pp156–160, split into immutable [108a](hawashi-numbered-notes-stage108a.js) (111–116, 6 notes) and [108b](hawashi-numbered-notes-stage108b.js) (117–126, 10 notes). All sixteen contain first-pass English renderings, totalling about **2,815 additional English words**. Full searchable-Arabic working transcriptions were added for notes **114 and 115** only; the other 14 have short Arabic locators.
- **One new UNNUMBERED quoted essay** after note112 Q157–158: explicitly ascribed to Mīrzā Muḥammad ʿAlī, distinguishes outward Islam from inward faith and quotes an Imāmī report. It is *not* secretly added as note113 or a teaching of Y/T, and its isnād has not been authenticated. **Six unnumbered** passage records now appear after notes **47,48,71,86,90,112**.
- **111** uses the four relations of universals to classify grammatical iḍāfa and contests the reading of “the beliefs of Islam” as `bayānī` rather than `lāmī`; **112** distinguishes heart's assent and spoken profession; **113** treats the lexical root j-n-n with printed speaker siglum M–B **not identified**; **114–115** show real vs component and rhetorical attribution; **116–119** treat omitted governors, teacher/student and `taḍmīn`; **120–123** treat `lā siyamā` and three grammatical cases; **124–126** instrumental form, `ʿiṣām` and `sajʿ` vs Qurʾānic `fawāṣil`.
- No new manuscript photographs, no independently collated Y variant, no completed full H printed page, no new full-classical modal proof. The four incomplete HWN IDs **001/025/082/090** remain unresolved intentionally.

## SOURCE GRADE, ASSESSMENT AND PUBLICATION RULES

- Every note record must include stable `HWN-###` ID, exact printed Qum source-page URL(s), reported speaker/voice, English whole/partial status, short Arabic lemma or full digital Arabic, `scanCertified:false` unless independent scan/folio/line actually verified.
- `arabicFullText` is **not** a photograph; it is the searchable print's working text. `arabicLemma` alone is a locator, not full historical Arabic. NEVER imply all 126 notes are bilingual transcription-complete. English completion and Arabic transcription need distinct progress bars.
- A printed page may have **several numbered notes, unnumbered quoted passages and modern insertions**. No printed page counts as translated until each substantive layer is accounted for and photographed. Current completely translated/collated H-page count remains **0/274**.
- Alternative interpretations and controversial transmitted reports (including faith vs Islam among different madhhabs, lexicon of jinn, prophet/messenger status) stay attributed to the historical speaker, not endorsed as authenticated.
- Primary T+Y main reader retains only **two text states: Matn and Matn + sharḥ**; H stays a separate compact companion accessible through References. No third principal text mode.
- PDF/print exports should be regenerated only after real text checking; if derived from current source they must bear **WORKING UNCOLLATED** warnings.
- Independent Y witness work: obtain genuine manuscripts/catalogue-confirmed identities from Stage103, line-by-line compare substantive cruxes; do not call an independent print a manuscript or make up variants.
- Historical modal proof status: 46 typed cases, full Avicennan modality (life/subject-descriptor/world/time/ʿadam al-dawām and quantifiers) unproved. Do not infer a medieval theorem merely from no counterexamples in finite models.

## NEXT Stage109 — precise order, sources, and deliverables

**Start at HWN-127** on [Qum p161](https://ablibrary.net/book_content/b/12170/161?lang=ar), not Q179 simply because an earlier excerpt companion reached Q178.

- **127–128:** *tawakkul* as refraining from efforts outside human power, using permitted causes, refusing to regard oneself as creator of their effects; distinction between spiritual prescription and lexical relying on someone. The quoted “tie your camel and trust God” requires independent hadith checking.
- **129–130:** `lammā` as causal/time connective, difference between “being when” and “because,” prior implicit identification of the logic/kalām two divisions, definiteness of “the first division” vs the introduction, and whether the explanatory `fa-` and past-tense clauses are appropriate.
- Continue **131+** in sequence on Q162 and after; never skip hard notes, hide unnumbered notes or assign one page's speaker to every note. Complete note111's printed-page signature review and Q157 unnumbered quotation if better facsimiles become available.
- Independently revisit four partial HWN IDs: 1 (modern interpolations), 25 (unclear `به`/`وق.`), 82 (`ويحتمل الاستقراء` reading), 90 (Q151–152 al-Taqrīb attribution seam).
- Parallel full Arabic for the 72 locator-only notes; independently verify Y manuscript readings.
- Add `hawashi-numbered-notes-stage109a.js` etc as **new immutable files**, regenerate new complete `batches/hawashi-numbered-cumulative-hwn001-NEWEST.md` without deleting old snapshots; add `stages/STAGE109_*.md` with source links/word count/deltas/gaps; update all nine bars in `progress-data.js`, the responsive reader and **entire** `HANDOFF_LATEST.md`, and run complete Python+Chromium/WebKit QA. Merge only on green Tahdhīb checks and state the actual PR/commit.

### Minimal prompt after future chat failure

> Continue GNAMMA Tahdhīb **Stage109** from latest merged `master` at `gnamma-research/booksite`. First read `texts/al-taftazani/tahdhib-al-mantiq/edition/HANDOFF_LATEST.md`, `progress-data.js`, `stages/STAGE108_NOTES_111_126.md`, `batches/hawashi-numbered-cumulative-hwn001-126.md`, and Stage104/105/106a-d/107a-f/108a-b JS data. Actual numbered H corpus: **126 unique notes Q127–160; 122 first-pass English complete, four partial (1,25,82,90), 54 with full digitally searchable Arabic, 72 Arabic locators, six separately attributed unnumbered glosses. ZERO of 274 H printed positions fully collated, ZERO of 110 principal Y positions independently manuscript-certified, 46 modal source types but ZERO fully independently proved.** Start numbered note127 Q161 and proceed consecutively, with distinct speakers, unnumbered notes and source pages. At each stage add immutable translations/report, regenerate cumulative Markdown, update nine independent progress bars and full handoff, pass QA and merge only after verified success.

**The work is preserved. This handoff is a precise current-state register, not a promise of asynchronous future processing.**
