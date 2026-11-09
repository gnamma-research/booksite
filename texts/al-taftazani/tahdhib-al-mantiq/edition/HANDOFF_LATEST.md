# GNAMMA Tahdhīb al-Manṭiq — LATEST FULL CUMULATIVE HANDOFF

**Current Stage 109 · 9 November 2026 · persistent recovery point for broken chats.**

**Repository:** [gnamma-research/booksite](https://github.com/gnamma-research/booksite), default `master`. **Root:** `texts/al-taftazani/tahdhib-al-mantiq/edition/`. Stage108 was merged via [PR #264](https://github.com/gnamma-research/booksite/pull/264), squash commit `1bbfde34b1800a131b6cdb0b7007ea9fbcd6cb62` after logical core and Chromium/WebKit checks passed. Stage109 is on `tahdhib-cumulative-stage109-20261109` until its own PR merges; check actual master before claiming deployment.

**CRITICAL change in source structure:** The **later prefatory glosses end at numbered note 140 on Qum printed p164**. At **Qum printed p165** a **NEW HISTORICAL SECTION** begins: `حواشي مقدمة علم المنطق` with **its own note (1)**. A next-stage edition must NOT silently call that note141 or overwrite the old note1. Use a new stable ID namespace, **`HWN-INTRO-001`**, and separate source section `H-INTRO`. A section's local numbers are not global numbers across the entire bound volume.

## Mandatory FIRST files to read after any chat fails

1. This `HANDOFF_LATEST.md`, always the complete current narrative, not a brief snippet.
2. [`progress-data.js`](progress-data.js) — canonical **nine separately sourced progress bars** and preserved stage ledger 102–109; [`progress.html`](progress.html) renders it.
3. [`stages/STAGE109_PREFACE_COMPLETION_AND_RESET.md`](stages/STAGE109_PREFACE_COMPLETION_AND_RESET.md) — Stage109 immutable scholarly dossier, 14 new source-indexed notes, verified Q165 numbering reset and Stage110 exact restart.
4. [`batches/hawashi-preface-numbered-cumulative-hwn001-140.md`](batches/hawashi-preface-numbered-cumulative-hwn001-140.md): the latest entire historical **H PREFACE** numbered-notes corpus. **140 distinct notes, 136 first-pass complete English, partial IDs 1/25/82/90, 54 digitally searchable full Arabic note transcriptions and 86 Arabic locators, six separately attributed unnumbered texts.** Approximately 22,561 current numbered-note English words, including partial note prose; not a complete printed-page Arabic edition.
5. Source files, required for reproducible reconstruction without double-counting revisions: [Stage104](hawashi-numbered-notes-stage104.js) base 1–18; [Stage105](hawashi-numbered-notes-stage105.js) five prior overrides and five appended notes 19–23; Stage106 [a](hawashi-numbered-notes-stage106a.js), [b](hawashi-numbered-notes-stage106b.js), [c](hawashi-numbered-notes-stage106c.js), [d](hawashi-numbered-notes-stage106d.js) new 24–55; Stage107 [a](hawashi-numbered-notes-stage107a.js), [b](hawashi-numbered-notes-stage107b.js), [c](hawashi-numbered-notes-stage107c.js), [d](hawashi-numbered-notes-stage107d.js), [e](hawashi-numbered-notes-stage107e.js), [f](hawashi-numbered-notes-stage107f.js) new 56–110; Stage108 [a](hawashi-numbered-notes-stage108a.js), [b](hawashi-numbered-notes-stage108b.js) new 111–126; and new [Stage109a](hawashi-numbered-notes-stage109a.js) 127–140.
6. [`hawashi-numbered-notes.html`](hawashi-numbered-notes.html) — searchable reader (loads these source files), distinct from shorter [H 52-page excerpt sampler](hawashi-q125-178.html) and original T/Y main two-mode reader.
7. [Earlier cumulative H snapshots](batches/hawashi-numbered-cumulative-hwn001-126.md), [Stage108 report](stages/STAGE108_NOTES_111_126.md), [Stage103 Y manuscript candidate register](STAGE103_WITNESS_CANDIDATES_AND_LAYER_IDENTITIES.md), [Stage101 historical modal proof limits](STAGE101_DOMAIN_INDEPENDENT_PROOF_BOUNDARIES.md), [al-Yazdī full working two-batch release](YAZDI_TWO_BATCH_RELEASE_2026-11-07.md).

## Non-conflatable textual families (most important scholarly safeguard)

- **T = Saʿd al-Dīn al-Taftāzānī ORIGINAL matn**, *Tahdhīb al-Manṭiq wa-l-Kalām*. Logic has 19 working bilingual editorial divisions; separate kalām has 1,044 stable bilingual clauses. Neither equals a later glossator's text.
- **Y = Mullā ʿAbd Allāh al-Yazdī's principal commentary** in Qum bound text pp.7–123, followed by a **separate nonauthorial printed closing notice**. **110/110 substantive printed source positions working Arabic–English**, in two cumulative Markdown batches and 113 source blocks, **0/110 independently photo/manuscript-certified**. Excluded structural/main-prose-absent positions 20,21,38,52,53,85,109. Priority true witness cruxes Q24,37,95–101,108,114,117 and terminal p123. An al-Azhar copy of *Taftāzānī's matn* is not automatically a manuscript of *Yazdī's commentary*.
- **H = later *ḥawāshī al-ḥāshiya*** in the 400-page Qum volume: **title Q125, blank Q126, later substantive text Q127–400 = 274 printed positions**. Multiple signed or quoted authors Mīrzā Muḥammad ʿAlī, Shaykh ʿAbd al-Raḥīm, Dawwānī, reported al-Taqrīb, al-Rāghib, modern inserts. A book-level metadata field naming Yazdī is NOT authorship of every H note. H is subdivided into **multiple local numbered sections**, now definitely established at the **p165** boundary.

## Nine separate progress bars — EXACT Stage109 counts

| Goal | Actual current numerator / denominator | Interpretation |
|---|---:|---|
| T logic original matn working bilingual editorial divisions | **19/19** | First-pass translation, not manuscript-certified |
| Y principal commentary working Qum substantive page positions | **110/110** | 113 source bilingual blocks; not independently certified |
| Y photographed/independently manuscript-collated principal positions | **0/110** | Source candidates only, no genuine recorded independent variants |
| H later-gloss PRINTED positions with older short selected Arabic lemma/English analytic source samples | **52/274** | Q127–178 excerpt-level sampling, not complete pages |
| H COMPLETELY translated AND independently photo-verified printed positions | **0/274** | No page claimed complete, even with numbered-note first passes |
| H PREFACE (Q127–164) numbered notes with complete first-pass English | **136/140** | Four partial IDs **HWN-001, HWN-025, HWN-082, HWN-090**. This is complete historical preface note enumeration, NOT the whole later 274-page H volume |
| H PREFACE notes with FULL digitally searchable working Arabic transcription | **54/140** | Notes24–75 and114–115 only; **86 Arabic locator-only notes**; zero facsimile certified |
| Exceptional fourth-figure source-classified historical modal combinations | **46/46** | A source typology, not complete independent classical modal theorem proofs |
| Full classical modal consequence types independently proved | **0/46** | Stage101 establishes weaker temporal implications only |

**Nine metrics cannot be combined as one percent.** The source-note first-pass count 136 does not mean 136 complete printed pages; the entire H prose print has 274 positions. The new H-INTRO section starting p165 has **zero numbered notes yet fully translated in this Stage109** and should get its own denominator/bar when Stage110 produces actual notes. Do not claim Stage109 completes the entire gloss corpus.

## Stage109 ACTUAL additions

- New immutable [`hawashi-numbered-notes-stage109a.js`](hawashi-numbered-notes-stage109a.js): **14 final prefatory numbered H notes 127–140** across printed Q161–164, **2,104 new English first-pass words** and 14 SHORT Arabic locator lemmata only, speaker attributes and source URLs preserved, `scanCertified:false`.
- New cumulative [140-note Arabic–English working Markdown](batches/hawashi-preface-numbered-cumulative-hwn001-140.md), 277K+ characters, reconstructed from prior original source files and overlays. Earlier snapshots 55/110/126 retained.
- Updated current [numbered note reader](hawashi-numbered-notes.html) with all 140 notes and visible notice that a new section begins with p165 local note1. **Never add 141** for this new historical source note.
- Updated [`progress-data.js`](progress-data.js) records 136/140 English and 54/140 Arabic; `noteLedger.nextSection` describes H-INTRO: `{id:"H-INTRO",printedStartPage:165,localFirstNote:1,stableFirstId:"HWN-INTRO-001"}`. Historical source note after p165 is NOT yet translated in this stage.
- New immutable [Stage109 report](stages/STAGE109_PREFACE_COMPLETION_AND_RESET.md), updated [progress dashboard](progress.html) and source/browser QA. Existing T 19 logic and kalām 1044 clauses unchanged. No photograph manuscript work completed.

## Main source/control findings in final preface notes

- **127–128 p161:** *tawakkul* as using permitted causes while relying on God, and the difference between its technical spiritual sense and lexically simple reliance. Quoted hadith needs authentication.
- **129–130 p161:** `lammā` as temporal adverb vs particle (time and alleged causality), Ibn Khurūf's yesterday/today objection, and the logical difference between indefinite `muqaddima` and definite “the first division.” Earlier text implicitly declared two sciences, logic and kalām.
- **131–134 p162:** status of title vs titled content; logic-as-discipline vs first division of a written book; when a literal container cannot be identical with what it contains. Narrow scope of `lām al-ʿahd` cannot alone prove all definiteness is impossible.
- **135–140 pp162–164:** seven referents for the *book's division* (words, meanings, written marks and combinations) crossed with five referents for *logic*: 35 possibilities. Several would make “meanings in meanings” or “content in itself”, improperly identifying container and contents. The glosses distinguish *malaka* (settled acquired disposition) from *ḥāl* (removable state), a part–whole repair, conceptual viewpoints and the need to supply `acquisition`, `explanation` or `attainment` for idiomatic syntax. **Note 140 closes on p164**.
- **p165 NEW section:** `حواشي مقدمة علم المنطق` explicitly starts with local `(1)`. Stable ID in future **`HWN-INTRO-001`**, `sectionId:"H-INTRO"`, `localNoteNumber:1`. Not another source note numbered `(141)`.

## Existing evidence gaps to carry forward without claiming completion

1. Four preface numbered English drafts remain incomplete: **HWN-001** (modern source inserts at Q127), **HWN-025** (ambiguous `به` and `وق` p135), **HWN-082** (uncertain `الاستقراء` p149) and **HWN-090** (p151–152 quoted `al-Taqrīb`/author boundary). Record actual photograph/line before emending.
2. **86/140 PREFACE numbered notes still have only short Arabic source lemmata**, and 54 full digital Arabic notes have no facsimile verification. Author signatures at page seams may be distorted by online printing conventions; no genuine manuscript variant has been established for Y.
3. **Six separate UNNUMBERED** H gloss passages following notes [47,48,71,86,90,112] are in the corpus; many more may exist on pages not yet fully processed, especially modern editorial quotations. These prevent false whole-page completion.
4. Distinct Y critical text must be collated with actual manuscripts, not merely online searchable Qum/Gujarat/Tehran prints or an adjacent T manuscript. Stage103 source census gives shelfmark candidates.
5. The **46 exceptional modal source categories** are historical taxonomy only. Full necessary/perpetual modalities, subject-description changes, temporal/modal import and personal `lā-dawām` must be independently justified; 0/46 complete classical modal theorems certified.
6. Keep compact Darūrī style main reader EXACTLY two principal text states: `Matn`, `Matn + sharḥ`; H is a separate companion. Final public PDF exports need genuine photographic collation and expert proofreading before calling them definitive.

## NEXT STAGE110 — exact source, branching and quality gates

**FIRST:** [Qum p165](https://ablibrary.net/book_content/b/12170/165?lang=ar), heading `حواشي مقدمة علم المنطق`, numbered local **(1)**. Do not continue global note141. Open local sequence using `HWN-INTRO-001` and `sectionId=H-INTRO`. This first note considers whether “introduction” is the predicate of an omitted `hādhihi` or subject of an omitted predicate; challenges regarding indefinite predicates; difference between a science's actual intellectual introduction and a book's preliminary discourse. Source local note(2) starts on Q165 and continues next printed page(s). Additional pages likely begin distinct topic and might need own section after that; inspect carefully.
- Create `hawashi-introduction-notes-stage110a.js` with `id, sectionId, localNoteNumber, pages, sourceUrls, speaker, arabicLemma or arabicFullText, english, status, scanCertified:false`.
- Update reader to group by section and **separate numbering**, not sort p165 note1 between p127 notes1 and2. Test that `HWN-001` and `HWN-INTRO-001` both exist and refer to different sources.
- Add additional bounded H-INTRO note progress bar when real new records exist. Preserve the earlier **PREFACE 136/140 and 54/140** bars as completed research components. The whole H printed-page certification remains **0/274** until truly photographed and every layer translated.
- Generate new complete cumulative bilingual artifact incorporating BOTH source sections, with visible book headings and local note numbering; preserve current 140-note preface snapshot.
- Add immutable `stages/STAGE110_<topic>.md`, update all relevant bars/denominators, full `HANDOFF_LATEST.md`, tests, and merge only if logical core + browser checks green.
- Parallel research priorities: finish the four partial notes with genuine Qum photos; fully transcribe 86 Arabic locator-only notes; secure actual Y manuscript witness and line-collate disputed readings.

## Minimal restart prompt

> Continue **GNAMMA Tahdhīb Stage110** from the latest merged `master` of `gnamma-research/booksite`. First read `texts/al-taftazani/tahdhib-al-mantiq/edition/HANDOFF_LATEST.md`, `progress-data.js`, `stages/STAGE109_PREFACE_COMPLETION_AND_RESET.md`, `batches/hawashi-preface-numbered-cumulative-hwn001-140.md` and Stage104–109 note source files. Stage109 covers the *later PREFACE* H notes1–140 Q127–164, **136 complete first-pass English, 4 partial (1,25,82,90), 54 full digital Arabic and 86 locators**, six unnumbered, zero of 274 H printed pages fully collated and zero of 110 Y manuscript-certified; modal 46 classes, zero full proofs. **CRITICAL: Qum p165 starts NEW local section `حواشي مقدمة علم المنطق` with new note (1). Use `HWN-INTRO-001` not `HWN-141`, create separate chapter/section progress and source bilingual notes, preserve earlier numbering and full staged handoff.** Update cumulative corpus, nine existing bars plus new section metrics, immutable stage report, tests, and merge after green CI.

**This is an exact completed-state research handoff, not a promise of future background work.**
