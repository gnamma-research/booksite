# Intellectual atlas — current restart point

Updated 10 November 2026. This file describes the fiqh research release and takes precedence over older UI descriptions in the chronological README history. Preserve concurrent work elsewhere in `gnamma-research/booksite`.

## User objective

Continue the feature comparison with Hanafi Atlas and make the fiqh corpus substantial across madhhabs. The user specifically required hundreds of works, coverage of the Hanafi comparator's books, a substantial Shafiʿi tradition, and research across many articles and catalogues. Do not substitute a large imported-record count for researched distinct works.

## Implemented corpus

| Tradition | Distinct researched fiqh works |
|---|---:|
| Hanafi | 125 |
| Shafiʿi | 104 |
| Maliki | 97 |
| Hanbali | 66 |
| Zahiri | 4 |
| Imami / Jaʿfari | 19 |
| Zaydi | 9 |
| Ibadi | 7 |
| **Total** | **431** |

The register contains **247 sourced textual relationships**, **281 cited source URLs across 25 domains**, 334 works with numerical author-death years, one additional qualified boundary anchor, and 96 works without a plotted date. Death dates, boundaries and range midpoints are labelled and never become composition dates. Bibliographical identification does not claim full-text acquisition or critical collation.

The **Hanafi Atlas benchmark** is a separate Biography & ṭabaqāt subject: **84 entries = 68 core + 16 supplementary**. It preserves 74 textual relationships and 18 contextual teacher/family ties separately, as well as all 92 original links. The UI displays the textual relationships only. Doubtful existence, disputed attribution, lost/manuscript/printed status, and qualified dates are retained. Attribution: Hanafi Biographical Atlas, based on Huzeyfe Çeker; https://www.hanafiatlas.com/about explicitly permits credited dataset reuse. Its 23-book reading collection remains on the original site; it has not been reproduced locally.

## Source and build locations

- `corpora/research/hanafi.json`
- `corpora/research/shafii.json`
- `corpora/research/maliki-hanbali.json`
- `corpora/research/other-schools.json`
- `corpora/research/hanafi-benchmark-source.json`
- `corpora/build_fiqh_research.py` validates and combines those committed inputs.
- `corpora/fiqh-research.json` is the generated distinct-work register loaded by the UI.
- `corpora/hanafi-atlas-benchmark.json` is the attributed benchmark register loaded by the UI.
- `corpora/fiqh-coverage.html` is the public feature comparison, school-count table and searchable full bibliography with per-work citations.

`python research/intellectual-atlas/build.py` also rebuilds these outputs and updates `publication.json`. Rebuilding must be deterministic. The old philosophical/theological corpus stays at **404 nodes, 377 edges, 21 families**. OpenITI's 1,857 and Alreq's 4,157 records retain their separate identity and original metadata.

## Interface behavior

- **Books by century** is the default view; **All works** is the default browse scope.
- Fiqh opens the **researched** corpus. Visible madhhab buttons display the distinct-work totals.
- **Include imported records** exposes the overlapping OpenITI/Alreq layer. `source_tier=all` must survive reload even when a subject defaults to researched data.
- **Biography & ṭabaqāt** defaults to the benchmark collection. Its works never inflate fiqh totals.
- **Early jurists & other circles** includes both the early and named non-four-school person records. They are not counted as books.
- The common timeline, network, catalogue, search, principal-text and geographic controls remain available across subjects.
- Relation groups include commentary/gloss, abridgement, versification, synthesis/reworking, completion/continuation, criticism, textual use and translation. Teacher and family ties do not imply textual dependence.
- Geographic coverage remains the independently sourced 41-event register across all subjects. Linking an exact fiqh identity to an existing pinned reader preserves existing location dossiers; it does not create new geographic claims.

## Editorial decisions to preserve

- Do not count editions, volumes, aliases or separately published parts as additional authored works.
- A composite printed volume can contain several actual authored works; keep those identities separate when the source supports them.
- Preserve Wiqāya's preferred author and conflicting Walwālijiyya attributions; do not turn uncertain chronology into a fixed death year.
- Keep Ghazali's Khulāṣa linked to Muzani, not an assumed Wajiz chain; Nawawi al-Jawi's Nihayat al-zayn comments on Qurrat al-ʿayn.
- Ramli's fatwas are the father's, compiled by the son; do not double-count.
- Mudawwana is compiled/transmitted through Sahnun and Ibn al-Qasim, not simply authored by Malik alone.
- Distinguish Majd al-Din's Muharrar, Mardawi's Tanqih, and the actual authors of accompanying glosses.
- Historical Hanbali material remains included. The user did not request a modern Salafi commentary expansion.
- The smaller Zahiri/Imami/Zaydi/Ibadi lists are initial selections. No Ismaʿili work register is claimed in this release.

## Verification and deployment

- `node --check research/intellectual-atlas/atlas-unified.js`
- `python research/intellectual-atlas/build.py`
- `python research/intellectual-atlas/corpora/verify_expansion.py`
- `node research/intellectual-atlas/tests/verify_fiqh_research.js`
- Existing browser contracts: `verify_unified_v3_browser.py`, `verify_text_browsing_browser.py`, `verify_unplaced_workbench_browser.py`. Their fixtures now state when they require geographical, linked-only or Alreq views.
- `.github/workflows/atlas-unified-v3.yml` validates reproducible corpus outputs, integration checks and browser behavior. `.github/workflows/atlas-undated-workbench.yml` preserves the existing date/geographic regression checks.

Publish against the latest master tree with an expected-head lease; never overwrite unrelated parallel reader work. Confirm the deployed corpus JSON, school counts, source scope reload, network evidence, benchmark collection and coverage page before reporting the release live. The public route is https://gnamma-research.github.io/booksite/research/intellectual-atlas/#subject=fiqh.

## Remaining research

The present release establishes a substantial selected bibliography, not exhaustive school coverage. Continue identity reconciliation across the separate imported sources, additional book-level relationships, and independently sourced geography. Full reader acquisition, edition/manuscript comparison, passage-level reception, teacher/person networks and the benchmark's person/report indexing remain separate work; counts alone do not establish feature parity.
