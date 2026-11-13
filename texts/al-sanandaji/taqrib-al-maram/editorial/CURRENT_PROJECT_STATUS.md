# Stage 87 — selected lower and upper source proof (13 November 2026)

**This newest note supersedes the Stage86 counts, not its retained historical dossier.** Ten existing text records were revised against the original Būlāq 1318 AH facsimile on printed **I:6, I:7, I:16 and I:17**. Seven previously anchor-only records now contain bounded, actual Arabic and matching literal English. This raises records with *some* Arabic from 1,171 to **1,178/1,401** (84.1%). **223** corpus records still have no typed Arabic, **including one editorial paraphrase now recognized as a non-source record**; **222 genuine printed-source records** remain for transcription, predominantly lower commentaries. Source positions containing at least some Arabic remain **279/279**. Complete, independently second-proofed all-register pages remain **0/279**.

**Source corrections:** The I:6 lower text about why this is the *kalām* division of a logic-and-kalām book is now represented by a sustained Arabic–English source span; the short middle-ruled I:6 words signed Faraj Allāh Zakī are separate, not attributed to Wasīm. The printed opening of the introduction on I:7 is restored to the **upper** stream and its independent-ruled gloss paraphrase (record `I007.ruled.01`) is retained archivally but hidden from normal reading and searching. New selections on I:16 clarify firm/nonfirm, true/false and stable/unstable assent; the I:17 ruled note describes the soul's motion among intelligibles as a similitude.

**Proof and reader:** see [Stage87 bilingual source readings](STAGE87_BOUNDED_AR_EN_I006_I017.md) and [Stage87 proof / browser audit](STAGE87_PROOF_AND_READER_AUDIT.md). Original PDF SHA-256: `4addd660de68794f9d64e062e3b25a2782497b3342eb4580218c3e07e8d12134`; source page p corresponds to PDF physical p+13. The source witness is unchanged. The public reader's clean study interface is unchanged, and the prior 1,401 stable IDs are preserved. A single-witness critical *working* edition is still not a completed critical edition; source words throughout the upper, ruled and lower streams and the independent second proof remain open. The two-volume merger with Taftāzānī is still deferred.

---

## Previous checkpoints (archival)

# Stage 86 — Volume I source-position coverage (13 November 2026)

**This checkpoint supersedes Stage 85's numerical summary below.** The public study reader remains deliberately unchanged in appearance, with no stage history in the continuous reading screen.

**Additional verified work:** 45 bounded Arabic–English passages on the 29 previously anchor-only printed pages **I:49–72 and I:74–78**. Each is anchored to the Būlāq 1318 AH scan; where source phrases are noncontiguous, the omission is marked. Earlier analytical English drafts are preserved in record metadata, not passed off as finished literal translation. See [Stage 86 bilingual source dossier](STAGE86_BOUND_SOURCE_READINGS_I049_I078.md).

**Coverage metrics, not completion metrics:** 280/280 printed Volume I positions are indexed (I:1 title leaf). 279/279 body-page positions have some working English and **279/279 now have some typed Arabic**, but many words and entire lower notes remain missing. **1,171/1,401** source-linked working records contain some Arabic, leaving 230 without it. **0/279** pages have a complete all-register diplomatic transcription, literal English translation and independent second proof. No manuscript collation is claimed or required for the chosen single-print working edition. See [strict page ledger](STAGE86_STRICT_PAGE_ACCEPTANCE.csv) and [machine metrics](STAGE86_METRICS.json).

**Verification:** no existing record IDs lost or duplicated. Local Chromium tests at 390px, 768px and 1400px passed for all 1,401 records, Arabic search, page navigation, focus mode, and no script errors or horizontal overflow. The full original 632-page PDF retains SHA-256 `4addd660de68794f9d64e062e3b25a2782497b3342eb4580218c3e07e8d12134`; all 280 facsimile PNG checksums match the preserved witness inventory. The source scan and images are in the research package, not public-site assets.

**Next real blocker:** establish every omitted upper, ruled and lower word, translate every printed marginal ḥāshiyah, check each author attribution and source continuity, and independently proof all 279 body pages. An uninterrupted corpus of page headings or isolated Arabic quotations does **not** satisfy this gate. Keep the separate *Tahdhīb al-Kalām* reader until both volumes of *Taqrīb* are genuinely final.

---

## Previous checkpoints (archival only)

# Stage 85 — Volume I text corrections and source-integrity checkpoint (13 November 2026)

**The public study reader remains visually unchanged.** Forty-three first-pass, source-positioned Arabic–English readings were added on **36 printed pages I:13–48**, replacing selected interpretive overviews with bounded literal excerpts. Earlier summaries are preserved as source-record metadata but are not inserted into continuous reading. See [source readings, I:13–48](STAGE85_SOURCE_READINGS_I013_I048.md).

**What has changed:** the working corpus still contains **1,401 unique records**. **250/279 body pages** now contain *some typed Arabic* (Stage84: 214); **1,126/1,401** records contain some typed Arabic (Stage84: 1,083). **29/279 body pages** still lack typed Arabic (I:49–72 and I:74–78). These are **not** percentages of text completely translated. English working passages occur on all 279 body-page positions but remain summary or incomplete on many pages. Whole-page multi-register Arabic/English critically accepted: **0/279**; second independent proof: **0/279**; manuscript collation: **0**.

**Source witness:** 1318 AH Būlāq two-volume scan (632 PDF pages), SHA-256 `4addd660de68794f9d64e062e3b25a2782497b3342eb4580218c3e07e8d12134`. All 280 Volume I source PNGs retain the Stage81 SHA-256 values; the combined PDF checksum matches. Original printed I:p = physical combined PDF p+13.

**Publication implementation:** `stage85-source-delta.js` loads after the eleven inherited records shards and before the clean `reader.js` in both the book landing page and historical alias. It only updates pre-existing stable IDs; it does not introduce a combined Tahdhīb/Taqrīb reader or a new menu item. Source/QA history remains outside the reader UI. Desktop/tablet/mobile sized checks passed on embedded Chromium, confirming 1,401 loaded records, revised passages and no JS errors; live-site iOS Safari acceptance remains outstanding.

**Next strict proof requirement:** resolve the 29 anchor-only pages; then do complete line-by-line transcription and literal translation for all upper, ruled and lower commentary throughout 279 body pages. Do not convert source-page presence into completed critical pages.

---

## Earlier Stage 84 and prior checkpoints

# Stage 84 — public Volume I text-first working reader (13 November 2026)

> **Reader architecture decision · 13 November 2026:** Keep *Tahdhīb al-Kalām* and *Taqrīb al-Marām* as separate public readers until both commentary volumes are complete and checked. A future unified matn–sharḥ interface is described in [the deferred reader design](FUTURE_TAHDHIB_TAQRIB_UNIFIED_READER.md). The matched-phrase concordance remains an inactive editorial asset; do not expose a combined menu item yet.

**Public repository update:** `stage84-reader.html` and eleven `stage84-data/records-NN.js` modules are now committed to the Gnamma booksite GitHub repository. The new text reader indexes all **280** Volume I printed page positions and all **1,401** provisional records. Stage 83's offline-only status below is now historical. The **facsimile image files and original combined PDF are not yet hosted on the public site**; they remain in the separate Stage 84 offline research package. Browser Pages deployment and actual mobile Safari must be verified separately.

**Increment this stage:** 12 selected, source-image-reread Arabic/English records on printed pages **I:8–12**, with text and translation linked by ID. Those passages cover the definition of kalām; distinctions between doctrinal and practical knowledge; certain proofs; the Companions' early discipline labels; and the knowable as theological subject. Previous interpretive English overviews remain in hidden reading apparatus. See [Stage 84 source rereads](STAGE84_I008_I012_SOURCE_REREADS.md).

**Metrics, from source corpus:** 279/279 body positions have some provisional English. **214/279** body pages now contain some typed Arabic; **65/279** still have only locating quotations. **1,083/1,401** indexed records contain some typed Arabic, and **318** are anchors-only. **0/279** complete pages independently proofed or accepted. Manuscript collation **0** (not required for a single-witness Būlāq-based critical reading edition).

**Priority:** complete and literally translate I:13–72 and I:74–78 where no typed Arabic has yet been entered; simultaneously check all printed lower ḥawāshī and the upper commentary rather than mistaking a page-indexed summary for a complete translation. Independently proof text against source images before labeling any entire page final. The public reader is a helpful working edition, not the finished definitive volume.

**Public reader path:** [Volume I · Stage 84](../stage84-reader.html). Original source-image reader remains the packaged offline edition until facsimiles can be hosted without breaking links.

---

## Archived historical checkpoints

# Stage 83 — Volume I working-edition checkpoint (13 November 2026)

**Supersedes the Stage 82 numerical checkpoint below; the older notices remain archival.**

- Source witness: Būlāq 1318 AH print, original 632-page combined PDF SHA-256 `4addd660de68794f9d64e062e3b25a2782497b3342eb4580218c3e07e8d12134`. All 280 Volume I source-image SHA-256 values rechecked against the Stage 81 image register; none changed.
- Source inventory: **280/280** printed numbered leaves including title leaf I:1; **279/279** body pages have *some provisional English*, not complete English translation.
- Typed Arabic: **209/279 body pages contain at least one typed Arabic passage** (Stage 82 was 204); **70/279** still have only Arabic locating anchors, specifically **I:8–72 and I:74–78**. In the same 1,401-record corpus, **1,071** records have some typed Arabic and **330** have locating anchors only.
- **Eight bounded source-facing Arabic/English rereads** on I:3–7: `I003.upper.01`, `I003.wasim.01`, `I004.upper.01`, `I004.wasim.01`, `I005.upper.01`, `I005.wasim.01`, `I006.upper.01`, `I007.upper.01`. Earlier interpretive overviews are retained in hidden reader apparatus; do not count these selected printed spans as complete pages. See [Stage 83 source rereads](STAGE83_BOUNDED_SOURCE_READINGS_I003_I007.md).
- Certified complete **0/279**. Manuscript collation **0** (not required for the planned Būlāq-based first scholarly reading edition). Long printed ḥawāshī and numerous upper clauses remain untranscribed or rendered interpretively. Second proof of the entire volume is still open.
- Stage 83 full-volume offline reader adds stable passage citations/deep links, a per-page outline, and corrected Flow-mode refresh on language/layer/page navigation. QA passed on Chromium at 390×844, 768×1024, and 1400×900, including source image loading and last printed page I:280. **Real-device iOS Safari not certified.**
- **Website state:** this public GitHub checkout still offers the older Volume I reader through **I:198**. The full-volume Stage 83 working HTML, source images and dataset are held in the separate recovery package supplied to the editor; **they are not deployed on the public website**. Do not advertise this as a definitive Volume I, and do not fabricate a URL to the offline package.
- Next source task: printed **I:8–16**, with full registration of upper matn/sharḥ, ruled and lower commentary, and literal alignment, then I:17–72 and I:74–78. Do not conflate source-position presence, any typed Arabic, or source-image checks with final bilingual page acceptance.

---

## Archived Stage 82 and historical checkpoints

# Stage 82 — updated volume I research/release status (13 November 2026)

**This notice supersedes the historical 7 November 2026 first-pass counters below.** Those older counters describe what was actually mounted on the public website at that time, and are retained only as provenance.

**What exists outside the public site:** a 280-page **source-facsimile-linked offline reader** using the Stage 81 corpus, with a new Stage 82 mobile-first reading shell and explicit scholarly caveats. It includes 280 numbered images (I:1 bibliographic title leaf), **279/279 body positions with some provisional English**, **1,401 source-linked working records**, **1,063 records with typed Arabic**, and **338 records with Arabic locating anchors only**. The strict page ledger reports **204/279 body pages with any typed Arabic and 75/279 without any typed continuous Arabic** (I:3–72 and I:74–78). This is *coverage of some entered material*, not whole-page or full-register completion. **0/279 pages independently proven complete; 0 manuscript pages collated**.

**What is publicly hosted in this GitHub checkout:** the earlier **Volume I reader still stops at I:198**; the newer full-volume offline reader and source images have **not** been deployed. The public Volume II reader retains its separately documented working status. The offline Stage 82 package was delivered through the research conversation, not through this repository; therefore no broken or invented public download URL is supplied here.

**Editor priority:** (1) transcribe every printed register, especially the 75 anchor-only pages; (2) fully translate unrendered marginal glosses, resolve continuity and source ambiguities; (3) perform an independent facsimile-to-Arabic/English proof page by page, documenting conjectures and verified attributions; (4) integrate the verified dataset with the Darūrī-style reader conventions, and test on real mobile Safari; (5) then publish a **Būlāq-based critically annotated bilingual reading edition**. Extensive manuscript collation is **not a prerequisite** to this edition; manuscript catalogue leads are not inspected witnesses.

**Known critical loci:** I:2 contains three different printed voices (Sanandajī upper, signed Faraj Allāh Zakī ruled notice, Wasīm's separate lower preface); I:73 requires qualified readings of `قارنها`, `لم`, `⟦للمقولية⟧`; I:222's conjectural `[حصولها]` derives from a *Sharḥ al-Maqāṣid* parallel and is **not a manuscript variant**; I:88, I:112 and I:253 have same-editor image rereads, not independent page certification. Do not silently attribute every ḥāshiyah to Wasīm.

**Reading modes available in the offline Stage 82 package:** Read, Flow, Study, Source, Focus; Arabic/English/both; independent authorial layers; full source PDF location, 280-page contents, text-only search with normalized Arabic and an explicitly heuristic approximate stem option; basic technical term glossary; saved reader notes/bookmarks where supported. Browser checks on 390px/1400px viewports found no script errors or horizontal overflow. A full dictionary/root analyzer and real-device iOS Safari acceptance remain open.

---

## Archival status: 7 November 2026 (retained unchanged)

# Taqrīb al-Marām — authoritative project status and continuation handoff

**Updated 7 November 2026 — first-pass checkpoint I:198.** This is the current status for website editors, GitHub contributors and new ChatGPT sessions. It supersedes older stage labels that counted pages merely touched.

## Source and boundaries

- Primary PDF: `taqribmaram(2).pdf`, **632 image-only physical pages**, SHA-256 `4addd660de68794f9d64e062e3b25a2782497b3342eb4580218c3e07e8d12134`.
- **615 original numbered positions**, Volume I:1–280 (280) and Volume II:1–335 (335).
- Volume I original printed p → physical PDF page p+13 (1-based); Volume II p → physical p+295.
- Upper register combines al-Taftāzānī's parenthesized *Tahdhīb* lemmas and ʿAbd al-Qādir al-Sanandajī's *sharḥ*. Lower separately ruled annotations may belong to other authors. Only the self-identified preface I:2–5 can be securely attached to Muḥammad Wasīm in this corpus.

## Progress (different denominators — do NOT merge)

| Measurement | Actual | Meaning |
|---|---:|---|
| **This first-pass batch** | **50/50 original positions**, I:149–198 | Each position has new English source-reading passages; lower text substantially incomplete. NOT 50 all-register translations |
| **Volume I first-pass draft presence** | **197/280**, positions I:2–198 | Selected/upper English and some lower commentary; variable literal completeness |
| **Volume II draft presence** | **300/335**, positions II:15–314 | 100 attempted full-span upper readings (II:215–314), 200 shorter/provisional (II:15–214); lower text substantially unfinished |
| **Whole-book page positions with some English** | **497/615 = 80.8%** | *Presence of English only*, NOT percent of text translated |
| **Positions without comparable English** | **118/615 = 19.2%** | I:1; I:199–280; II:1–14; II:315–335 |
| **Independently critically certified, all-register pages** | **0/615** | No complete critical certification or full manuscript collation |

**Do not call the 80.8% figure “translation complete”**: large amounts of the printed lower glosses remain untranslated, as do uncertain or summarized parts of the upper register. The I:149–198 English is a source-facing **first-pass** working reading, often partly interpretive rather than literal; only explicit translated clauses count as actual translation.

## Live working corpus and reader

- [Volume I page-by-page working reader](../volume-i.html), original I:2–198.
- [Volume II cumulative reader](../cumulative.html), original II:15–314, with Stage48–52 source corrections layered on the earlier Stage51 corpus.
- [Layered book desk](../), which retains selections and original voice controls.
- The *full Volume I cumulative working source* is split for GitHub into four `volume-i-part*.js` data modules and a downloadable Markdown master maintained separately in the cross-chat handoff bundle. These page entries are drafts, not a finished edition.
- Canonical Volume II Stage51 corpus modules and subsequent source correction scripts remain in this folder; do not overwrite them with older Stage51 exports.

## Next translation batch and editorial method

- Next contiguous Volume I reading: **I:199–248** (50 source positions). Then I:249–280; then missing II:1–14 and II:315–335, while returning to uncollated margins throughout.
- Each batch: inspect the original Arabic; translate upper text in sequence; separately translate lower commentary; record embedded matn and responsible author where supported; mark each omission; retain exact printed page.
- First-pass drafting should be efficient, but do not invent Arabic, silently substitute synopses, or claim a whole page complete when clauses remain.
- Regenerate the *complete cumulative project handoff* after each batch (both volumes, 615-row ledger, source location, website/repo state and next tasks).
- Show **two distinct progress bars**: source positions containing some English; independently complete all-register pages. Show a batch-specific 50/50 or 60/60 bar, clearly labelled first-pass position coverage.

## Current milestone content

Volume I I:149–166: the one–many causation principle, body power, causes, infinite regress and opposition to circular dependence. I:167 begins Book Three on **accidents**. I:167–184: inherence, persistence, distinct accidents and the beginning of **quantity**. I:185–192: continuity, number, magnitude, time and motion. I:193–198: **place and vacuum**, including the thought experiment of separating closely fitting surfaces and the time needed for air to enter.

**Important**: These are topical navigation aids, not substitute translations. Source PDF remains authoritative; earlier editorial review of the working text is incomplete. Website publication confirms a GitHub update only, not automatic verification of GitHub Pages deployment.
