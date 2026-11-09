# Hikma critical edition — cumulative handoff (9 November 2026)

## Ground truth

Repository: `gnamma-research/booksite`. Work branch: `nihaya-collation-muzaffar-20261109`. PR: https://github.com/gnamma-research/booksite/pull/259.

There are **three** different states, not one conflated "translated" state:

1. **Local original Arabic imported and paired with working English.** Nihāya 136/136 units; Bidāya 111/111; Muẓaffar **36** local selections out of a six-book Arabic work, not a complete imported text.
2. **Automatic source-to-translation structural triage.** Nihāya 136/136 mechanically screened; 111 Arabic/English paragraph counts differ (not evidence of omission), 63 by three or more, and eight lexical-spot-check signals; see `nihaya-english-collation-triage-2026-11-09.json`.
3. **Independent, checked, defensible critical bilingual edition.** NOT COMPLETE. Six selected Nihāya passages were read directly against the local Arabic (N-I-01, N-II-02, N-VII-02, N-IX-12, N-XI-12, N-XII-15) without an independent line-by-line printed-witness collation or external expert certification; the remainder have not yet undergone an equivalent local reading in this stage. Do not call the 136-screen "full English collation".

## Added Muẓaffar authorial Book II reading passages (the whole original book remains incomplete)

| Reading ID | Source printed page(s) | Subject |
| --- | --- | --- |
| M-K-01 | 56–57 | Universal versus particular |
| M-K-02 | 57 | Hypothetical instances; Necessary Existent |
| M-K-03 | 58 | Relative particular |
| M-K-04 | 59 | Uniform versus graded universal |
| M-K-05 | 61 | Concept versus miṣdāq |
| M-K-06 | 61–62 | ʿUnwān / muʿanwan; first and common predication |
| M-K-07 | 63–65 | Four relations between extensions of universals |

Transcriptions and translations are in `../muzaffar-al-mantiq/data/book.json`. Source registration: `../muzaffar-al-mantiq/data/authorial-map.json`.

**Source:** https://lib.rafed.net/view.php?b_id=1604&type=c_fbook (Dār al-Taʿāruf 1402 AH searchable Arabic, 455 pages). **Separate early printed witness:** https://sites.dlib.nyu.edu/viewer/books/princeton_aco000780/1 (1968 Princeton / ACO digitization, catalogued public-domain; not fully collated in this stage).

Book II has further chapters on complementary relations, five predicables, species/genus/differentia, essential vs accidental, predication and logical/natural/intellectual universals. Books IV–VI have **no local Arabic–English reading units** in this edition. All must be translated from the original, not merely outlined. Book I and III also have omissions.

## Nihāya English collation protocol (next work)

1. Use `../nihayat-al-hikma/data/book.json` authorial Arabic as **a starting transcription, not a definitive exemplar**. Pair it with the current working English and retain source URLs.
2. For each of 136 stable unit IDs, track **individual propositions, premises, objections, replies, restrictions, negations, and quotations** rather than relying on same-length paragraphs.
3. Independently open the 1404 AH Qum printed scan and corrected 1428 AH al-Zāriʿī volumes where applicable; separate printing, editor glosses (including erroneous historical attributions) and authorial notes. NEVER silently promote a later editor's conjecture to a manuscript reading. See the eight existing entries in `../nihayat-al-hikma/data/editorial-supplement.json`.
4. Review Arabic and English sentence-by-sentence and note corrections with exact before/after, page/URL and status (translation correction, Arabic source variant, optional interpretation, verified citation). Record whether each has independent witness proof and actual scholarly reviewer attestation.
5. Priority: metaphysical vocabulary (wujūd/mafhūm/miṣdāq; fī nafsihi/li-nafsihi/bi-nafsihi; imkān; ʿilla/maʿlūl); motion in substance (stage IX), intellection (XI), necessary existent and attributes (XII). Prioritization is not certification of the other stages.
6. Update the individual passage notes and translation carefully; review `audits/cross-book-review-register-2026-11-07.json`; regenerate and verify all nine A4 PDFs and manifest only from the final sources. Browser QA must pass Chromium **and** WebKit.

## Reproducibility & publication

- Data integrity: `node texts/al-tabatabai/tools/audit-hikma.mjs`
- Browser: `node texts/al-tabatabai/tools/qa-browser.cjs` with Playwright and local HTTP server.
- PDFs (all nine): `node texts/al-tabatabai/tools/build-pdfs.cjs` with Playwright Chromium; publishing workflow is `.github/workflows/hikma-a4-pdf-release.yml`.
- No manuscript-expert certification or completion claims should appear on the public reader. The intended next step is real collation, not manufacturing "verified" statuses by algorithm.

### Progress (this branch)
- Muẓaffar bilingual source entries: **36**; seven additions in Book II.
- Nihāya 136 working English entries: **136** (unchanged).
- Automated structural review: **136 / 136**.
- Local bilingual rereading documented in this stage: **6 / 136**.
- Fully independent collations completed in this stage: **0 / 136**.
- New reader PDFs: **not claimed until source-hash workflow regeneration and verification**.
