# GNAMMA Tahdhīb — LATEST FULL CUMULATIVE HANDOFF

**9 November 2026 · Stage 111 · canonical recovery state, not a definitive critical manuscript edition.**

**GitHub repository:** [gnamma-research/booksite](https://github.com/gnamma-research/booksite), default `master`, root `texts/al-taftazani/tahdhib-al-mantiq/edition/`. Stage110 merged as [PR #266](https://github.com/gnamma-research/booksite/pull/266), commit `0e844f357d579536e541042640aab03e819d564d`. **Stage111 is in `tahdhib-cumulative-stage111-20261109` until its own PR passes source and Chromium/WebKit checks and merges**. Check the actual branch and PR before declaring it published.

This handoff is **updated cumulatively** after each stage. Prior `stages/STAGE###` reports, initial/overlay source files and full cumulative snapshots are immutable. No single chat history needs to be recovered if these source files are read first.

## FIRST: read the canonical files, in this order

1. **This `HANDOFF_LATEST.md`** and [machine-readable progress ledger](progress-data.js), which displays **THIRTEEN** evidence-graded independent metrics and stage history 102–111 via [progress.html](progress.html).
2. [Immutable Stage111 critical report](stages/STAGE111_INTRODUCTION_AND_SIGNIFICATION.md): exact note ranges, findings, 53 new note records, 39 complete working English, 14 partial, historical chapter reset Q188, source limitations, next note.
3. [Current whole three-section H cumulative Markdown](batches/hawashi-all-sections-cumulative-stage111.md), a complete ~420K-character snapshot of all currently translated/analysed later-gloss numbered notes; preserves historical local numbering and separately attributed unnumbered additions.
4. Individual cumulative section snapshots: [H-PREFACE notes 1–140](batches/hawashi-preface-numbered-cumulative-hwn001-140.md) (Q127–164), [H-INTRO notes 1–82](batches/hawashi-introduction-numbered-cumulative-intro001-082.md) (Q165–187), and [H-DALALA notes 1–20](batches/hawashi-signification-numbered-cumulative-dal001-020.md) (Q188–191).
5. Working source data needed for exact reconstruction: `hawashi-numbered-notes-stage104.js` (first 18), `hawashi-numbered-notes-stage105.js` (five prior **overrides**, five **appends**; do not double count), `hawashi-numbered-notes-stage106a..d.js`, `hawashi-numbered-notes-stage107a..f.js`, `hawashi-numbered-notes-stage108a..b.js`, `hawashi-numbered-notes-stage109a.js`; `hawashi-introduction-notes-stage110a..d.js`; NEW `hawashi-introduction-notes-stage111a.js`, `hawashi-introduction-notes-stage111b.js`; NEW `hawashi-signification-notes-stage111a.js`. These are the actual content, not chat summaries.
6. [Section-aware three-series reader](hawashi-numbered-notes.html): shows H-PREFACE `HWN-001`, H-INTRO `HWN-INTRO-001`, H-DALALA `HWN-DALALA-001` as three distinct historical notes all numbered locally “1.” It does not change the original T/Y main reader's two display states.
7. [Independent Y witness candidate inventory](STAGE103_WITNESS_CANDIDATES_AND_LAYER_IDENTITIES.md), [Stage101 formal proof limitations](STAGE101_DOMAIN_INDEPENDENT_PROOF_BOUNDARIES.md), [al-Yazdī main working two-batch translation](YAZDI_TWO_BATCH_RELEASE_2026-11-07.md) and the older [short 52-page excerpt H sampler](hawashi-q125-178.html), which must not be mistaken for complete printed-page translations.

## Textual-family boundaries and historical note numbering — NON-NEGOTIABLE

- **T:** Saʿd al-Dīn al-Taftāzānī original `Tahdhīb al-Manṭiq wa-l-Kalām`, 19 logic editorial divisions working bilingual, separate kalām corpus 1,044 stable clauses. Manuscripts of T are not automatically witnesses to al-Yazdī.
- **Y:** Mullā ʿAbd Allāh al-Yazdī's principal logic commentary in Qum printed pp7–123, with original authorial conclusion and separate later printed completion note; **110/110** substantive printed positions translated in first pass, 113 bilingual blocks, **0/110 independently photographically or manuscript-collated**. Structural/nonprincipal positions Q20,21,38,52,53,85,109 excluded. Specific cruxes needing actual independent Y manuscripts: Q24, Q37, Q95–101, Q108, Q114, Q117, Q123. Printed Tehran/Gujarat comparators are NOT automatically independent manuscripts.
- **H:** later `ḥawāshī al-ḥāshiya` after the Q125 heading, Q126 blank, actual prose **Q127–400 = 274 printed positions**, mixed speakers, quotations and modern insertions, NOT automatically authored by al-Yazdī. The Qum searchable web page is NOT a verified scanned witness. **The local numbering explicitly restarts at Q165 and Q188**:
  - `H-PREFACE`: Q127–164, historical local numbers 1–140, stable IDs **`HWN-001`–`HWN-140`**.
  - `H-INTRO`: Q165–187, heading `حواشي مقدمة علم المنطق`, historical local numbers **1–82**, stable IDs **`HWN-INTRO-001`–`HWN-INTRO-082`**.
  - `H-DALALA`: Q188 onward, heading `حواشي التصورات « بحث الدلالات »`, historical local numbers currently **1–20**, stable IDs **`HWN-DALALA-001`–`HWN-DALALA-020`**. Source continues beyond Q191.

**Never give an H-INTRO note the false source number 141 or a signification note the false source number 83 or 223.** The editorial ID namespaces preserve each authentic printed section's local numbering. New headings after Q191 must be inspected before further source IDs are assigned.

## EXACT 13 distinct progress bars — Stage111

| Objective | Actual current | Scope and what it cannot show |
|---|---:|---|
| T original logic matn working bilingual divisions | **19/19** | Not a critical manuscript edition |
| Y main principal commentary working English Qum source positions | **110/110** | Working first pass and 113 bilingual units only |
| Y principal independently photographed/manuscript-certified positions | **0/110** | No collated independent Y variants |
| H Qum printed positions with old short excerpt/source-page analytic sample | **52/274** | Short selections Q127–178; not full translated pages |
| H entire printed pages completely translated AND photographically collated | **0/274** | No page meets both standards |
| H-PREFACE numbered notes complete first-pass English | **136/140** | Partial 1,25,82,90; whole preface note series enumerated |
| H-PREFACE full digital searchable Arabic note transcription | **54/140** | Only 24–75 and114–115 full working Arabic; 86 locator-only |
| H-INTRO numbered notes complete first-pass English | **66/82** | Sixteen partial; Q187 closes historic section |
| H-INTRO full digital source Arabic note transcription | **0/82** | All locator-only; source-photo certification zero |
| H-DALALA numbered notes complete first-pass English | **14/20** | Six partial 1,12,13,14,15,18; section unfinished |
| H-DALALA full digital searchable Arabic note transcription | **0/20** | All Arabic locator-only |
| Exceptional fourth-figure historical modal types classified | **46/46** | Source taxonomy, NOT independent theorems |
| Full historical modal entailment types independently proved | **0/46** | Stage101 only proves restricted temporal consequences |

**Combined H recorded cohort = 242 HISTORICALLY LOCALLY numbered items, 216 marked complete first-pass English, 26 partial**. **54 full digitally searchable-Arabic notes, 188 short locator-only notes**, and **nine separately attributed unnumbered passages**, INCLUDING the extended note73 H-INTRO intrinsic/foreign-accident gloss. This is not a percentage of the whole unprocessed later-gloss Q127–400 volume; the unknown total later numbered-note population exceeds 242. **0/274 fully translated and photo-collated printed positions remains the only truthful whole-print-page certification.**

## Stage111 ACTUAL additions and source audit

Three immutable source files: `hawashi-introduction-notes-stage111a.js` (H-INTRO 50–64, 15 records, 12 complete English, three partial: 50,58,64, Q178–182), `hawashi-introduction-notes-stage111b.js` (H-INTRO 65–82, 18 records, 13 complete English, five partial: 68,71,73,75,77, Q182–187) and `hawashi-signification-notes-stage111a.js` (new H-DALALA local1–20, Q188–191, 20 records, 14 complete English, six partial: 1,12,13,14,15,18). **53 new records, approximately 3,720 first-pass English words.** Every new note has a short original-source Arabic locator, source-page URL(s), a reported speaker and `scanCertified:false`; NONE has a full Arabic transcript yet.

An **UNNUMBERED** separately signed extra passage after H-INTRO note73 (Mīrzā Muḥammad ʿAlī, intrinsic and extrinsic accidents) remains independent and is not counted as note74. The old H-INTRO modern quoted additions after 18,29 remain independent. Total all H sections **nine unnumbered**.

Main philological points in Stage111:
- **H-INTRO 50–64:** inquiry paradox (sought unknown must be partly known), semantic range of `ʿilm`, a universal `qānūn` applying to a particular grammatical agent, logic as normative instrument, noncontradiction in the same person's changing judgments and the rule that `muraʿāt` (observance), not mere possession, protects thought. Notes50,58,64 partial.
- **H-INTRO 65–82:** need for logic in *both* acquiring conceptions and acquiring assent; conditional circularity/regress argument; first-figure immediate rules and later learned ones; science subject as the thing whose `ʿawāriḍ dhātiyya` are investigated; mediating properties and the disputed more-general constituent. **Capacity to lead** to the unknown qualifies logical subject, while **how it leads** is a property studied. Notes68,71,73,75,77 partial. Section **CLOSES with note82 on Q187**.
- **H-DALALA 1–20:** Q188 heading restarts numbering. `Muṭābaqa` whole meaning, `taḍammun` included part, `iltizām` external concomitant. Lexical instruments are instrumental, not the primary object of logic; conventional/natural/rational verbal/nonverbal types, learned assignment vs a naturally elicited sound, nonsense sound behind a wall as rational indication of an unseen speaker. Historical six-type category (2×3) based on induction vs an alleged rational trichotomy, with attention to differences between philosophers, Arabic grammarians and uṣūlīs. Six long notes remain partial; no note's full Arabic text photographed.

**All source URLs** follow `https://ablibrary.net/book_content/b/12170/<printed-page>?lang=ar`. The Qum library front end lists al-Yazdī as whole-volume author, but that is not provenance for signed H annotations. Independently identify source note boundaries and quoted speakers before proposing text emendations or authorial conclusions.

## Main unfinished scholarly tasks (explicitly NOT completed)

**(A) H full translation:** Continue H-DALALA local **note21** on Qum printed **p191–192**, then all following local notes in source order; check every later section heading and reset its own numbering. Q191–400 remain to be covered beyond the current 20 signification notes; already visited Q127–191 is NOT fully translated page-for-page because many unnumbered and source Arabic texts remain unfinished.

**(B) 188 Arabic locator-only note transcripts:** 86 H-PREFACE, all 82 H-INTRO and all 20 H-DALALA. Get full Arabic source and genuine Qum page photographs, identify signatures and quote boundaries. The existing 54 digitized full Arabic notes also require photo-check. Preserve all historical variants with manuscript identifier/folio/line, not simulated readings.

**(C) 26 partially translated H numbered notes:** Preface four (1,25,82,90); Introduction sixteen (2,7,10,19,20,23,30,42,50,58,64,68,71,73,75,77); Signification six (1,12,13,14,15,18). Do not set any complete until its actual full source is translated including cross-page continuations and separately attributed quotations.

**(D) Main Y textual critical edition:** source candidate census completed, 110 principal Qum pages translated in first pass; 0 manuscript-certified. Verify copy-family identities and independent witnesses, priority Q24/37/95–101/108/114/117/123, then record actual variants and correct Arabic/English. An edition based solely on a digital searchable print is not definitive.

**(E) Formal modal logic:** 46 historical fourth-figure types source-classified, 0 independently proved with original full modal semantics (subject/time/world/existential/same-individual `lā-dawām`). Work on these independently of translation and keep proof certificates separately.

**(F) GNAMMA reader/PDF:** original T+Y two modes `Matn` and `Matn + sharḥ` remain. H now a three-section searchable companion with original Qum links, English full/partial labels and Arabic full/locator labels. Do not describe any generated PDF as verified until all Arabic/witness/prose passed source audits. Keep the style consistent with Darūrī without inventing a third principal text mode.

## Stage-by-stage durability contract

For every stage: (1) create **immutable** new source JS with source `sectionId`, local note ID, page(s), original Arabic full/locator grade, English complete/partial grade, reported speaker and explicit unnumbered additions; (2) create immutable `stages/STAGE###_*.md` with exact new notes, pages, word counts, partial IDs, source findings and next source; (3) regenerate ALL current individual-section snapshots and combined H source corpus under a **new** filename, retaining earlier snapshots; (4) update ALL research progress measures and `progress-data.js` stage ledger, responsive H reader and full `HANDOFF_LATEST.md`; (5) run `python tools/tahdhib/check_stage_handoff.py`, `python tools/tahdhib/verify_logic_core.py`, all other Tahdhīb source and browser tests including `node tools/tahdhib/handoff_reader_qa.mjs` on Chromium+WebKit; (6) merge only after green Tahdhīb CI and record exact PR/merge SHA in next handoff. A separate Atlas CI failure is not automatically a Tahdhīb failure, but a Tahdhīb workflow failure cannot be ignored.

## Minimal future-chat restart prompt (exact)

> Continue **GNAMMA Tahdhīb Stage112** from latest merged GitHub `master` of `gnamma-research/booksite`. FIRST read `texts/al-taftazani/tahdhib-al-mantiq/edition/HANDOFF_LATEST.md`, `progress-data.js`, `stages/STAGE111_INTRODUCTION_AND_SIGNIFICATION.md`, `batches/hawashi-all-sections-cumulative-stage111.md`, and Stage104–111 source files. H has three independent historical source-numbered sections: Preface Q127–164 140 notes (136 complete English/4 partial;54 full digital Arabic), Introduction Q165–187 82 notes (66 complete English/16 partial;0 full Arabic), Signification Q188–191 20 notes (14 complete English/6 partial;0 full Arabic). Combined 242 indexed numbered records, 216 first-pass complete-English,26 partial;54 full digital Arabic,188 locator-only,9 separate unnumbered items. **0/274** later-H printed pages fully translated + independently photo-collated; **0/110** main al-Yazdī manuscript-certified; 46 exceptional modal classes classified but0 fully source-semantically proved. Start **HWN-DALALA-021** at Qum p191→192, continue numbered notes and preserve any further section resets. Create source-grounded immutable batch, full combined cumulative artifacts, update thirteen honest bars and entire handoff, run verification and merge only on green CI.

**This handoff records actual synchronous work and its limits; it makes no promise of background completion or claims about unseen manuscripts.**
