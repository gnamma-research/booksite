# GNAMMA Tahdhīb al-Manṭiq — LATEST FULL CUMULATIVE HANDOFF

**Stage 112 · 9 November 2026 · persistent recovery source for any new chat or interrupted workflow.**

**Canonical repo:** [gnamma-research/booksite](https://github.com/gnamma-research/booksite), `master`; root `texts/al-taftazani/tahdhib-al-mantiq/edition/`. **Stage111 is on PR [#269](https://github.com/gnamma-research/booksite/pull/269) until it is verified merged; Stage112 is staged on `tahdhib-cumulative-stage112-20261109` branched from Stage111. Check actual PR/commit and current master before assuming anything deployed.** Stage110 is safely merged as [PR #266](https://github.com/gnamma-research/booksite/pull/266), commit `0e844f357d579536e541042640aab03e819d564d`.

**Durable restoration rule:** This file is cumulatively REWRITTEN at each stage, but earlier `stages/STAGE###` reports, original source-JS files, source variants and cumulative Markdown snapshots remain immutable. If the chat fails, read these files, not past claims from a conversation summary. Work is synchronous per stage; do not promise unseen future translation or scan work.

## FIRST read these files after any failure

1. This `HANDOFF_LATEST.md`—source family, current state, exact next printed source and update contract.
2. [`progress-data.js`](progress-data.js): **15** source-graded independent progress metrics and Stage102–112 ledger; [progress.html](progress.html) displays the bars.
3. [Immutable Stage112 report](stages/STAGE112_SIGNIFICATION_AND_CONCEPTS.md): 82 new numbered notes with source links, 50 complete first-pass English and 32 partial, speaker boundaries, critical findings and p216 section reset.
4. [Latest **full four-section H cumulative Markdown**](batches/hawashi-all-sections-cumulative-stage112.md): ~529K characters, **324 distinct historically locally numbered records, 266 marked complete first-pass English, 58 partial, ten separate unnumbered texts**. The component snapshots and their histories are preserved:
   - [Preface notes 1–140](batches/hawashi-preface-numbered-cumulative-hwn001-140.md) Q127–164.
   - [Introduction notes 1–82](batches/hawashi-introduction-numbered-cumulative-intro001-082.md) Q165–187.
   - [Signification notes 1–91](batches/hawashi-signification-numbered-cumulative-dal001-091.md) Q188–215.
   - [Concepts / Universals notes 1–11](batches/hawashi-concepts-numbered-cumulative-maf001-011.md) Q216–221.
5. [Section-aware H reader](hawashi-numbered-notes.html), offering FOUR different historic sections, local note IDs, search and complete/partial filters. Main Taftāzānī/Yazdī reader retains exactly two text states (Matn, Matn + sharḥ); H is a supporting companion, not a new principal mode.
6. Actual source JS, in historical reconstruction order: `hawashi-numbered-notes-stage104.js`, `hawashi-numbered-notes-stage105.js` (**overrides** 2,8,9,12,15 then appends 19–23), `hawashi-numbered-notes-stage106a-d.js`, `hawashi-numbered-notes-stage107a-f.js`, `hawashi-numbered-notes-stage108a-b.js`, `hawashi-numbered-notes-stage109a.js`; `hawashi-introduction-notes-stage110a-d.js`, `hawashi-introduction-notes-stage111a-b.js`; `hawashi-signification-notes-stage111a.js`, NEW `hawashi-signification-notes-stage112a-d.js`; NEW `hawashi-concepts-notes-stage112a.js`. Never count an overridden earlier note twice.
7. [Stage103 independent Y witness candidate inventory](STAGE103_WITNESS_CANDIDATES_AND_LAYER_IDENTITIES.md), [Stage101 modal-proof limits](STAGE101_DOMAIN_INDEPENDENT_PROOF_BOUNDARIES.md), [full first-pass main al-Yazdī two-batch translation register](YAZDI_TWO_BATCH_RELEASE_2026-11-07.md) and original [52 H page excerpt samples](hawashi-q125-178.html) (NOT 52 complete translated pages).

## THREE textual families, FOUR *H* historically separate numbered sections

- **T:** Saʿd al-Dīn al-Taftāzānī's *Tahdhīb al-Manṭiq wa-l-Kalām*, original matn: **19** working bilingual logic editorial divisions; separate **1,044** Kalām stable translated clauses. Different witness family from Y/H.
- **Y:** Mullā ʿAbd Allāh al-Yazdī's principal *ḥāshiya* on the logic matn, Qum principal pp7–123, ending with authorial prayer and a distinct later completion notice. **110/110 substantive Qum printed positions working bilingual**, in 113 blocks, **0/110 independently photographed/manuscript-certified**. Seven structural/nonprincipal-only positions Q20,21,38,52,53,85,109 excluded. Actual textual cruxes Q24,37,95–101,108,114,117 and p123 require genuine Y independent witness/line evidence. An Arabic Taftāzānī matn manuscript does not establish a Yazdī commentary variant.
- **H:** *Ḥawāshī al-ḥāshiya* bound after Y, Q125 rubric, Q126 blank, actual later gloss prose **Q127–400 inclusive = 274 printed positions**. This contains multiple differently signed glossators, quoted al-Taqrīb, modern additions and several independent local numbering series. Volume metadata giving Yazdī as author does NOT establish he wrote these separate annotations. The four historical local note systems currently processed are:

| H source section | Qum printed | Authentic local numbered range | Stable editorial IDs |
|---|---|---:|---|
| **H-PREFACE** | 127–164 | 1–140 | `HWN-001`–`HWN-140` |
| **H-INTRO** (`حواشي مقدمة علم المنطق`) | 165–187 | 1–82 | `HWN-INTRO-001`–`HWN-INTRO-082` |
| **H-DALALA** (`حواشي التصورات « بحث الدلالات »`) | 188–215 | 1–91 | `HWN-DALALA-001`–`HWN-DALALA-091` |
| **H-MAFAHIM** (`حواشي المفاهيم`) | 216 onward | 1–11 CURRENT | `HWN-MAFAHIM-001`–`HWN-MAFAHIM-011` |

**Do not invent “preface note141,” “intro note83” or “signification note92.”** Each source rubric at Q165, Q188 and Q216 restarts at (1). Stable IDs preserve distinct note identities. Future pages may restart again.

## EXACT 15 distinct evidence-graded progress bars, Stage112

| Objective | True current numerator / denominator | Measurement boundaries |
|---|---:|---|
| T logic matn working bilingual editorial divisions | **19/19** | Preliminary complete, no new manuscript certification |
| Y principal Arabic–English commentary substantive Qum source positions | **110/110** | Working first pass, 113 bilingual blocks |
| Y principal commentary independently photographic/manuscript-certified positions | **0/110** | No independent original Y witness readings yet |
| H later Qum printed positions with short excerpt/argument samples | **52/274** | Q127–178 old excerpts, NOT fully translated pages |
| H entire printed positions fully translated, fully transcribed and photographically certified | **0/274** | Note-level progress does not imply printed-page completion |
| H-PREFACE working English complete first-pass numbered notes | **136/140** | Four partial 1,25,82,90 |
| H-PREFACE FULL digitally searchable-Arabic note transcriptions | **54/140** | Notes24–75 and114–115 only; 86 Arabic locator-only |
| H-INTRO working English complete first-pass numbered notes | **66/82** | 16 partial; section ends Q187 |
| H-INTRO FULL digital Arabic note transcriptions | **0/82** | All Arabic short locator-only |
| H-DALALA working English complete first-pass numbered notes | **59/91** | 32 partial; section ends Q215 |
| H-DALALA FULL digital Arabic note transcriptions | **0/91** | All 91 Arabic short locator-only |
| **NEW H-MAFAHIM** working English first-pass numbered notes | **5/11** | Six partial 2,4,5,6,9,10; section ongoing Q216– |
| **NEW H-MAFAHIM** FULL digital Arabic note transcriptions | **0/11** | All 11 Arabic locator-only |
| Historically sourced special modal fourth-figure classes classified | **46/46** | Source typology, not independently proved |
| Full traditional modal consequences independently established | **0/46** | Stage101 restricted temporal models only |

**DO NOT ADD OR AVERAGE THESE DENOMINATORS.** Current working H cohort **324 different historical numbered notes = 266 complete first-pass English renderings, 58 partial**, and **54 digitally searchable full-Arabic working note texts vs 270 Arabic locator-only**; **ten** UNNUMBERED separate quoted glosses are displayed. However these 324 notes are not all later H notes Q127–400 and are not 324 completely translated printed pages. **0/274** is the truthful combined source/photographic whole-page certification measure.

## WHAT STAGE112 ADDED (actual source record, not planned tasks)

- **71 new H-DALALA numbered records 21–91**, Qum printed pp191–215 in `hawashi-signification-notes-stage112a.js` … `stage112d.js`; **45 complete first-pass English, 26 PARTIAL**. Signification's *authentic* local numbering ends with note91 on Q215.
- **NEW H-MAFAHIM section**, beginning [Q216](https://ablibrary.net/book_content/b/12170/216?lang=ar) with new historical local note (1), indexed through note11 on Q221 in `hawashi-concepts-notes-stage112a.js`; **5 first-pass English complete, six partial**, no full Arabic transcription.
- **82 new source-linked note records** and about **8,378 additional English words** in actual note fields (including partial passages). Each has `sectionId`, stable local number, printable Qum URL, source voice as reported, Arabic short locator, English full/partial flag, and `scanCertified:false`. No invented independent variants, no claim of complete Arabic source transcriptions in this batch.
- A separately introduced **unnumbered ʿAbd al-Raḥīm gloss after DALALA note74 Q210** is stored with its own voice, not counted as historical note75. Total across H sections now 10 distinct unnumbered additions.
- Complete new individual snapshots: [Signification 1–91](batches/hawashi-signification-numbered-cumulative-dal001-091.md), [Concepts 1–11](batches/hawashi-concepts-numbered-cumulative-maf001-011.md), and [all FOUR sections full cumulative](batches/hawashi-all-sections-cumulative-stage112.md), about 529K characters. Prior 55/110/126/140, Stage110 and Stage111 combined snapshots remain preserved.
- [Section-aware H reader](hawashi-numbered-notes.html) now offers four independent source section choices and source-tagged counts, with no collision among `HWN-001`, `HWN-INTRO-001`, `HWN-DALALA-001`, `HWN-MAFAHIM-001`. The main original T/Y reader is unchanged.
- [Machine progress](progress-data.js) expanded to 15 metrics and Stage102–112 history. No other unrelated GNAMMA or Tahdhīb original-matn data changed.

## Most important scholarly arguments in Stage112

1. **Q191–196: `muṭābaqa` / `taḍammun` / `iltizām`.** Meaning/signification species depend on the **respect** in which a word denotes whole, part or external concomitant. The same signified item can occur under multiple assignments. Implicative signification requires a special evident necessary connection; not every external relation is implied. Arguments that inclusion and implication entail whole meaning rely on separating word assignment and speaker's actual intent. Regress of concomitants and reciprocal entailment need logical care.
2. **Q197–202: simple/compound and intention.** A source word's segment is not a compound just because it could signify something under *another* assignment. Avicenna and al-Ṭūsī are quoted concerning utterer's intended sense; later logicians distinguish heard sound's evocation of assigned meaning from the speaker's actual intended meaning. The dispute may be largely terminological but is not purely so without distinguishing what is counted as `dalāla`. `Inshāʾ` as speech act and `khabar` as apt for truth/falsity must remain separate.
3. **Q203–208: assignment and the noun/verb/particle division.** Logicians' `ism/kalima/adāt` may differ from grammarians' `ism/fiʿl/ḥarf`, especially defective verbs, pronouns, verb-names. General assignment to a universal versus general assignment covering particulars under it is debated for demonstratives and other expressions. *Waḍʿ* (designation) must not be collapsed into *istiʿmāl* (an actual use).
4. **Q209–210: univocal vs graded predication.** A universal may apply equally to real or only possible instances *under counterfactual conditions*. `Mushakkik` gradation can concern causal priority or intensity; these are not identical. A long separate ʿAbd al-Raḥīm source after 74 is preserved as UNNUMBERED.
5. **Q211–215: homonymy, transfer and figurative meaning.** `Mushtarak` involves separate primary assignments; `manqūl` involves a conventional transfer; `ḥaqīqa` is literal *relative to current convention*; `majāz` is transferred with indicator that blocks simple literal interpretation. A previous meaning need not be totally unused for transfer to have occurred. Source p215 is the end of H-DALALA's numbered sequence.
6. **Q216–221 NEW concepts section:** Distinguishes a particular mental form **as an inhering psychic quality** from the *quiddity/content represented* considered in mental existence; universality belongs in the second respect. `Farḍ` in “universal may apply to many” is intellectual admissibility, not arbitrary verbal supposition; an imagined distant individual is still one individual even when unidentified. Empty and impossible universal concepts pose hard questions for logical predicability. The concept “necessary existent” is universal at the level of signification, notwithstanding the uniqueness proof. Separately signed al-Ahrī remarks contrast general and special possibility, and the source discusses an unending succession vs infinite actual simultaneous assemblage.

## UNFINISHED AND SOURCE HONESTY — requirements before any definitive edition

1. **The rest of H through p400:** Next is **H-MAFAHIM local note 12** at [printed Qum p221](https://ablibrary.net/book_content/b/12170/221?lang=ar), then p222 onward. New headings may reset numbering; inspect before assigning IDs. Current H notes cover only printed p127–221 and include many partial English records; no complete later H English volume yet.
2. **Full Arabic transcription for 270 locator-only notes** (86 PREFACE,82 INTRO,91 DALALA,11 MAFAHIM) and independent photographed source/author signature control. The 54 previous full *digitally searchable* Arabic records also lack independent photo/manuscript control. Do not call them source-certified.
3. **58 partial H numbered notes**, including old four PREFACE,16 INTRO,32 DALALA, six MAFAHIM; finish actual source clause translation rather than converting selected English arguments to complete from inference. Distinguish additional unnumbered historical and modern source prose on each printed page.
4. **Y principal critical collation** from actual independently verified manuscripts (Stage103 census), prioritize Q24,37,95–101,108,114,117,123. First-pass Y English is already done; don't redo it without a variant reason.
5. **Traditional modal logic**: 46 exceptional historical figure-four source classes identified, 0 independently certified full ancient/late-Avicennan modal consequence proofs. Develop full temporal/essential/description-relative and existential semantics before theorem certification.
6. **Final public reader/PDF:** Keep original T/Y two modes, H supporting four-section reader. Final Arabic/English PDF claimed scholarly definitive only after real collation and proofreading; otherwise label WORKING UNCOLLATED.

## EVERY FUTURE STAGE: mandatory recovery contract

Create immutable new `hawashi-concepts-notes-stage113a.js` etc (or new section upon historical numbering reset), preserving distinct ID namespace, printed page links and speaker. Create immutable `stages/STAGE113_*.md` with actual note counts, source pages, English word counts, partial IDs and proof/variant limits. Generate **new** complete individual-section and all-section cumulative Markdown while preserving Stage112, update all **15** source-graded metrics in `progress-data.js`, update four-section reader, and rewrite entire `HANDOFF_LATEST.md`. Run `python tools/tahdhib/check_stage_handoff.py`, `python tools/tahdhib/verify_logic_core.py`, historical source integrity and Chromium/WebKit `node tools/tahdhib/handoff_reader_qa.mjs`; merge only on green Tahdhīb CI, record actual PR and merge SHA.

## Minimal copy/paste restart prompt after chat failure

> Continue **GNAMMA Tahdhīb Stage113** from latest `master` of `gnamma-research/booksite`. FIRST read `texts/al-taftazani/tahdhib-al-mantiq/edition/HANDOFF_LATEST.md`, `progress-data.js`, `stages/STAGE112_SIGNIFICATION_AND_CONCEPTS.md`, `batches/hawashi-all-sections-cumulative-stage112.md` and source JS Stage104–112. Current H has FOUR authentic locally numbered sections: Preface 136/140 first-pass English,54/140 full digital Arabic (Q127–164); Introduction 66/82 English,0/82 full Arabic (Q165–187); Signification 59/91 English,0/91 full Arabic (Q188–215); Concepts 5/11 English,0/11 full Arabic (Q216–221). **Combined324 locally numbered source records,266 complete first-pass English,58 partial,54 full digital Arabic and270 locator-only;10 separate unnumbered**. **0/274 later H printed pages fully translated and independently photographically collated**, **0/110 principal Y independently manuscript certified**, 46 historical modal classes source catalogued but0 full original-semantics proofs. Begin **HWN-MAFAHIM-012 at Qum p221** and proceed source-order, keeping section resets distinct, producing immutable next-stage translation, full updated four-section cumulative, fifteen honest bars, full handoff, and green CI before merging.

**This handoff describes completed synchronous draft work and its limitations. It does not assert future/background activity or unseen manuscript evidence.**
