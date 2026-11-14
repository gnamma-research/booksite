# Taqrīb al-Marām — Volume I · Stage 88 editorial and reader audit

**Checkpoint:** 14 November 2026. **Source:** Būlāq 1318 AH, combined 632-page source scan, SHA-256 `4addd660de68794f9d64e062e3b25a2782497b3342eb4580218c3e07e8d12134`. Printed Volume I page p corresponds to combined physical PDF page p+13. The source scan and 280 inherited Volume I page-image files are unchanged.

## Actual changes

Nine existing indexed source records on printed I:8, 9, 10, 11, 17, 18, 19 and 22 gained bounded Arabic passages and directly aligned English first-pass readings. The earlier explanatory English was preserved in `stage88_prior_working_overview`; the visible reader uses the new bounded English rather than presenting the old interpretive overview as a literal translation. No new source authorship is inferred. See `Stage88_Bounded_AR_EN_Readings.md` for the Arabic, English, precise source locations and qualifications.

## Exact status

| Measure | Current | Interpretation |
|---|---:|---|
| Original Volume I printed positions indexed | 280/280 | Bibliographic title leaf + 279 body pages |
| Volume I body positions with some typed Arabic | 279/279 | Not page-complete Arabic |
| Unique working records | 1,401/1,401 | All inherited IDs retained |
| Records with some typed Arabic | 1,187/1,401 | 9 more than Stage 87 |
| Records still lacking typed Arabic | 214 | Includes 1 earlier synthetic editorial record hidden from readers |
| Genuine printed-source records lacking typed Arabic | 213 | Transcription backlog |
| Critically completed all-register pages | 0/279 | Full Arabic, complete literal English, second proof not certified |
| Manuscript collation completed | 0 | Not required for intended Būlāq-based initial single-print edition |

The residual 213-record count does **not** quantify untranslated printed words. Some already partially transcribed records contain long unentered marginal passages; these remain the principal substantive workload.

## Reader and corpus integrity

- Node.js cumulative-source check: **pass**, 1,401 stable records and all source-stage patches ordered correctly.
- Chromium rendering with scripts inlined for the local test harness: **pass** at 390×844, 768×1024 and 1400×900. No horizontal overflow or uncaught JavaScript exceptions; page selection and focus-mode switching tested. Page 8's new lower Arabic is available under the collapsed marginal layer.
- Full source PDF checksum: **unchanged**; original Volume I page-image inventory: **280**.
- Real iOS Safari acceptance, live web deployment, independent second philological proof and all-register translation: **not certified by the local checks**.

## Remaining critical path

1. Transcribe and literally translate the 213 printed-source records with no entered Arabic, prioritizing the long lower ruled and bottom ḥawāshī.
2. Revisit the partially transcribed records to ensure **every printed Arabic word** in upper, middle and lower layers is accounted for (not merely a locating quote or opening excerpt).
3. Verify the complete English clause by clause, normalize cross-page joins, correct doubtful readings without silently conjecturing, and verify authorial attribution of marginal voices.
4. Obtain a separate second pass against the Būlāq facsimile and record acceptance by page and register.
5. Keep the public reader study-first; keep production notes in the source archive. Continue the two-volume merger deferral until Volume II is final.

**Editorial rule:** The visible statement '279 pages with some Arabic' is an index-presence metric only; **never** call it '100% Arabic transcription' or claim a finished critical edition.