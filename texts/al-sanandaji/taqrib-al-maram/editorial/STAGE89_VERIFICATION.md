# Stage89 verification and strict editorial disposition

- Source: Būlāq print, 1318 AH. Original combined PDF SHA-256: `4addd660de68794f9d64e062e3b25a2782497b3342eb4580218c3e07e8d12134`. File unmodified, 20,835,714 bytes.
- Source images: **280 PNGs**, all names I001.png–I280.png present; per-image SHA-256 register included. The images were inherited from the Stage88 source-backed package without re-rendering or altering any source pixels.
- Source reading: ten bounded passages on I:10, 11, 13, 15, 16, 19 were manually checked against the print images, with deliberate ellipses where the remainder is not transcribed. They are an editorial first pass, not an independent second reading.
- Records: unchanged total **1,401 stable IDs**, **1,197** with some Arabic, **203** genuine source-oriented records with no Arabic, plus one retired synthetic editorial entry deliberately hidden.
- All body page positions I:2–280: contain some Arabic and English; **no original page is fully transcribed/translated in all registers or independently second-proofed**.
- Node source-corpus regression: PASS (1,401 IDs, stage scripts order, no false certified complete pages).
- Chromium with locally injected static resources: PASS at 390×844, 768×1024 and 1400×900. All 1,401 records loaded, expected Arabic visible, zero JavaScript exceptions, zero horizontal overflow.
- Arabic search → page I:13 → marginal excerpt: PASS; closed marginal commentary opens automatically when following a search hit.
- Browser limitation: direct file and localhost navigation were blocked by the local Chromium environment's administrative policy, so equivalent scripts/CSS were injected from verified local files for responsive tests. Real-device Safari acceptance remains outstanding.
- No external manuscript witnesses collated; no second-person textual certification.

## Next remaining critical tasks

1. Source-oriented Arabic-blank records: **203**, prioritized by layer in `STAGE89_UNTRANSCRIBED_RECORD_QUEUE.csv`.
2. Full original source-word transcription of partially entered entries, including the extensive printed ḥawāshī that are substantially longer than the current bounded excerpts.
3. Reconcile printed page and stream joins across the upper/main, ruled and lower sections and correct uncertain authorships; do not attribute anonymous notes to Wasīm.
4. Independently proof the original Arabic and all literal English line-by-line against the Būlāq facsimile. Only then begin marking pages complete and preparing definitive book/PDF exports.