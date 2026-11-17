# Mahāʾimī / Qūnawī — recovery receipt audit (17 November 2026)

**Status: PARTIAL RECEIPT ONLY. Do not archive the former chat, restart translation, merge, deploy, or assert that the full cumulative handoff is complete.**

## Non-destructive audit base
- Repository: `gnamma-research/booksite`.
- Source branch: `recovery/mahaimi-stage13-20261111`, head checked as `24e89e2b6f4ff7d9b73e24bad0cf556e6efa68f7`.
- This audit lives on a separate branch `audit/mahaimi-receipt-20261117`; it does not change source edition files or the recovery branch.
- The earlier Stage12 fallback `mahaimi-complete-edition` at `bc97d46b4052855884fe48c95780cfb2d80ed46b` is retained, but is not the active frontier.
- Master was checked: it does not expose `data/coverage-stage13.json` or `editorial/review-stage13/review-index.json` at their Stage13 locations; `data/parallel.json` has a distinct Git blob (`fb6530c38cbd21af401049ff8863d8485d3ef46e`). A direct comparison to master reported divergence, so merge and website publication remain unverified.

## Actually fetched and parsed
- Canonical `texts/al-mahaimi/mashra-al-khusus/data/parallel.json` by direct Git blob endpoint, blob SHA `7d1427842bfa0074253e31cfae8426f5e99fdb4b` (normal file fetch yielded empty transport content). The returned JSON contained approximately 1,650,867 characters and was successfully parsed.
- Independently enumerated: **254 unique IDs / entries**, **444 nonempty Arabic–English pairs**, **222 covered commentary printed pages (11–232)** and **33 covered Qūnawī appendix printed pages (235–267)**; no duplicate IDs or empty bilingual pairs found.
- Read and parsed the **complete** `editorial/review-stage13/review-index.json`: **222 reviewed pages**, **222 review records**, **98 scan-compared pages**, seven historical scan reconciliations.
- Read and parsed complete `editorial/review-stage12/review-index.json` (165 reviewed / 91 scan comparisons) and all three Stage13 detailed correction reports:
  - `review_41_60.json`: 20 pages, 35 English changes, 12 notes, 0 new scan comparisons.
  - `review_94_105_125_130.json`: 18 pages, 26 changes, 10 notes, 0 new scan comparisons.
  - `review_131_149.json`: 19 pages, 24 changes, 8 notes, 3 title changes, 0 new scan comparisons.
  - Total new Stage13 records in these reports: **85 English changes, 30 notes, 3 title changes**, distinct from any separate claim of 157 cumulative corrections.
- Read `data/coverage-stage13.json` in full; opened the Stage13 editorial HANDOFF, EDITION_STATUS, STAGE13_RECOVERY_AND_QA, TEXTUAL_NOTES, source-acquisition record and PDF-build manifest.
- The GitHub Stage13 records agree that the print image comparison is **98/222**, leaving **124** commentary pages. This does **not** reconcile the older conversation's reported **148/222**, leaving **72**; the purported newer ZIP ledger has not been recovered. Preserve both competing figures with provenance until actual newer bytes are inspected.

## Missing material inventory
Exact artifact names reported in the former conversation but **not recovered as files/bytes** despite targeted previous-conversation/Library search, Library browsing, GitHub filename search and branch history inspection:
1. `MAHAIMI_STAGE13_FULL_CUMULATIVE.zip` (~18 MB, 164 purported members).
2. `HANDOFF_STAGE13.md` (standalone cumulative ZIP handoff; not interchangeable with the repository `editorial/HANDOFF.md`).
3. `VERIFICATION_STAGE13.md` (standalone).
4. `stage13-archive-verification.json`.
5. The exact local checkpoint `7b0a0f47` and its source archive / recovery manifests.
6. Any post-repository Stage13 scan-check ledger substantiating 148 comparisons / 72 outstanding pages.

**Recovered related file, not missing:** `editorial/TEXTUAL_NOTES.md` on the source branch was read completely. It has not been proven byte-identical to a separate local archive member of the same name.

**Additional assets not locally byte-validated:** the original 2008 print scan `machra3-khosous.pdf`, electronic source export, English/Arabic/bilingual built PDFs as downloadable binary files, all older history/164 ZIP members. Their paths, provenance or hashes may be recorded in GitHub; such pointers are not full receipt.

## Exact continuation frontier (do not begin translation)
1. **First recover the reported ZIP and its manifest and verify each of its 164 members, checksums, coverage and source lineage.** Check whether any Stage14 or later progress exists before accepting even the ZIP as current.
2. Compare claimed 148 image-checked pages against exact Stage13 `review-index.json` list of 98; identify the additional 50 by page number and verify their scan evidence. Do not silently substitute a total. If no later proof is found, retain Stage13 repository ledger 98/222.
3. On the branch ledger, the **first scan comparison not yet documented is printed p.22**, followed by p.24, p.25, p.28, p.29, p.30, etc. Do not redo p.21 or other positively recorded pages. Printed pp.113–114 have electronic text but are absent from the acquired scan, so request replacement witnesses rather than claim image comparison.
4. Resolve flagged p.43 passage 1 synopsis and other defective readings only against actual sources; leave commentary ending p.232 unreconstructed; independently acquire/collate Āshtiyānī and Leiden Or.5675.
5. Do not conflate lemma, commentary, quoted authorities, modern editorial notes, and separate Qūnawī appendix. Keep reader study-first, scholarly apparatus separately accessible, and preserve PDFs, dictionaries, indices, links and full source distinctions.
6. Verify publish/merge and public-site state **separately**. Do not push Stage13 over newer master or archive any prior conversation without full receipt and verified continuation material.

## Origin of this audit
Made through direct connector reads and complete in-memory JSON parsing on 17 November 2026, not by retranslation or reconstruction from summaries. Records above are audit findings; no edition text or translations were changed.
