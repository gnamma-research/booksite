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
