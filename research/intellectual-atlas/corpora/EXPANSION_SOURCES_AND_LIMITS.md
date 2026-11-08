## Shared historical atlas and vertical principal-text synopses — 8 November 2026

**Current canonical experience.** The user-selected subject is now treated in the **same temporal-cartographic idiom as the established philosophy/kalām GNAMMA atlas**. The default **Full historical atlas** maps source-linked book authorities against one CE year axis, uses approximate *author death* markers where available, groups crowded eras into zoomable century/period clusters, offers common year-window navigation, pan and zoom, and opens individual work citations on selection. Category lanes represent the four madhhabs or qualified scholarly/textual traditions. The earlier bespoke SVG hub-and-spoke book network and the 32-card catalogue are superseded as the primary subject interface.

**The second diagram, *Principal texts · vertical synopsis*, is deliberately different in purpose, not a substitute for the full chronology.** It condenses each category/school to a selective set of high-signal texts, displaying them from earlier to later down a column with the author and death-date evidence. Plain vertical tracks express only belonging to a named line; arrows are restricted to the five individually documented Arabic corpus relationships and a small set of explicitly sourced edition-based relationships, when both endpoints exist among actual work authorities. The existing philosophy/kalām timeline has the same optional companion vertical synopsis drawn directly from its 404 audited historical work nodes and 377 existing evidence-qualified edges. No anonymous source nodes or synthetic transmission arrows are created.

**All subject choices:** Fiqh, uṣūl, grammar/naḥw, morphology/ṣarf, balāgha, lexicography, Hadith, tafsīr and taṣawwuf open a common-axis historical book atlas, and each supports the vertical condensed diagram. Philosophy and kalām retain their original integrated historical atlas, with an added vertical-summary button. Hadith individual report-isnād chains and tafsīr passage-level arguments remain unavailable because those passages have not been collated; the subject atlas displays cited *books*, not inferred report or interpretation networks. The historically evidenced Fuṣūṣ commentary family remains independently accessible through the existing canonical textual-family controls.

**Important chronological limit:** the pinned OpenITI 2025 metadata records contain author death dates for many work candidates; the corresponding plotted CE date is approximate (622 + (AH−1)×0.970224), not an attested composition date. **All 4,157 Alreq public manuscript-category records are undated in the imported tables.** They remain explicitly **unplaced** and accessible as interactive graphical source-work nodes, without being fictionalised into the time axis. Bibliographic counts are source-specific (1,857 OpenITI candidates plus 4,157 manuscript-category entries; underlying conceptual duplicate work identities remain unresolved). The 30 pinned source reader items overlap the OpenITI list.

**Early law and non-four-school figures:** the Fiqh atlas retains *Early jurists*, *Other schools* and *Unassigned* categories, using a separately sourced 16-person record with individual authority, personal school/following, historically named non-four school and founding eponym categories. Early jurists are placed by separately recorded death dates. A jurist being associated with a personal circle does not make that circle equivalent to later institutionalised Ḥanafī, Mālikī, Shāfiʿī or Ḥanbalī traditions. No modern Salafi identity is introduced as a classical fifth school. Relevant historiography: Wael Hallaq, *The Origins and Evolution of Islamic Law*, chapters 3, 6–7; the existing historic register links to the chapter. The documented al-Marghīnānī *Bidāyat al-Mubtadī/al-Hidāya* relation, and its use of al-Qudūrī and al-Jāmiʿ al-Ṣaghīr, is sourced to published editorial discussion and rendered only if both actual work records can be identified.

Implementation: `corpora/discipline-atlas.js` (common-axis historical book map and selective vertical synopsis), `corpora/canonical-synopsis.js` (existing original philosophy/kalām atlas vertical counterpart), `corpora/bibliography-map.js` (separate OpenITI/Alreq source normalisation) and `atlas-app.js` (one Explore navigation). The broad `tests/verify_unified_subject_timeline_browser.py` checks actual desktop/mobile subject transitions, zoomed-era book markers, individual source citations, manuscript-only unplaced diagrams, vertically condensed works, and the original canonical timeline.

These are scholarly **bibliographic** maps, not a completed critical edition, manuscript acquisition programme or exhaustively evidenced school-transmission study. A graphical connection is deliberately not made where bibliographic support is absent.

---

*Technical notes below document previous intermediate interfaces and are superseded where they describe a subject-first hub-and-spoke graph, period matrix, or list as the current default.*

---

## Subject-first graph interface and early jurists (7 November 2026)

The current atlas now uses the imported bibliography **as graphical nodes**, never as the primary output of a generic list or a period-count heatmap. It has distinct **interactive SVG** networks for each science: school and text-family hubs branch to Arabic-titled individual book nodes; selecting a hub redraws the graph at finer detail, and selecting a book opens its exact source citation in a detail panel.

The four later Sunni madhhabs are not projected into early Islamic history. The additional **Early jurists** and **Other schools** graph routes include differentiated personal juristic circles, individually known jurists, historically named non-four traditions, and early eponyms of later schools. The [16-entry sourced historical register](early-jurists.json) has specific status and historical citation URLs, and books are associated with historical jurists only from author metadata. This does not assert that all early scholars founded lasting doctrinal schools. Historiographical references include Hallaq's *Origins and Evolution of Islamic Law* (Cambridge, chapter 7), plus specialist historical study of al-Thawrī.

The actual source datasets remain the **4,157 linked catalogue entries** and **1,857 pinned-release OpenITI candidates**. No claim of complete Arabic text acquisition, manuscript collation, or cross-catalogue deduplication is implied by drawing book nodes on a graph.

---

## 7 November 2026 — complete bibliographic categories now integrated into the actual GNAMMA map

The original **714-record prioritised Alreq shortlist** described below has been superseded for map coverage by `manuscript-full.json`, the **complete 4,157-record snapshot** of the eight publicly visible category lists. Its category counts are: four fiqh schools (1,033 / 380 / 782 / 199), uṣūl (501), naḥw (892), ṣarf (109), and balāgha (261). The earlier shortlist is retained as a historical acquisition-priority sample, not the limit of the main map.

The actual [Texts in Time atlas](../) now renders the OpenITI candidate register and the full Alreq bibliography as separately sourced **bibliographic nodes within category-by-author-death-period clusters**. Clicking a cluster lists its works, and each work opens a citation detail within the atlas. **No text acquisition is necessary for this stage.** OpenITI author death years support limited dated placement; Alreq-only records remain undated. Overlapping school/title associations do not become unverified influence or commentary arrows.

Two sources may describe the same work; **4,157 + 1,857 must never be presented as 6,014 independently established historical works** until author/title/recension identities are reconciled. The count is of source-specific records/candidates, and the 30 pinned source reader items overlap the OpenITI list. Catalogue item/URL citation and the strength of each school label are retained.

---

# GNAMMA — Expanded bibliography of fiqh, uṣūl, grammar and balāgha

*Working source-acquisition and classification register · 7 November 2026*

## What was actually acquired

**Three separate layers, not one merged count of fully digitised texts.**

1. The original GNAMMA Arabic Source Library remains **30 pinned OpenITI versions**, five byte-matched locally, and five independently evidenced work-level relationships. This is the only existing tier backed by version-specific verification and a working Arabic reader.
2. The reproducible OpenITI 2025.1.9 metadata extraction identifies **1,857 unique work-level candidates**, including 1,006 tagged fiqh, 234 uṣūl, 223 naḥw and 484 balāgha candidates. These genres overlap. The OpenITI 2025 metadata TSV carries 14,107 version rows and 8,756 distinct Arabic primary-status work URIs. The generator uses one candidate record per work (the longest declared primary-version candidate), pinned release URL and release Git object identity. It **does not** download or verify these 1,857 complete Arabic texts, independently inspect their editions, or collate their manuscript witnesses.
3. A separately attributed selection of **714 distinct bibliographic manuscript catalogue records** was sampled from the publicly readable Alreq category lists. For **each four Sunni madhhabs, 40 fiqh titles** were included. For uṣūl, Ḥanafī **40**, Mālikī **30**, Shāfiʿī **40**, Ḥanbalī **39**, plus **65 unassigned uṣūl** records. Also selected: **160 naḥw**, **60 ṣarf**, and **120 balāgha** records. As these are catalogue references, **no manuscript scans, PDFs or complete Arabic texts were acquired** from Alreq. Its original catalogue URL is attached to each record. This is a prioritised sample, not an exhaustive or peer-reviewed census.

The source categories themselves list many more entries: Ḥanafī fiqh 1,033, Mālikī fiqh 380, Shāfiʿī fiqh 782, Ḥanbalī fiqh 199, uṣūl 501, naḥw 892, ṣarf 109, balāgha 261 on the inspected public pages (snapshot 7 November 2026). **These numbers represent public catalogue rows, not unique works verified by GNAMMA.** Attributed bibliographic metadata should not be copied or redistributed as images or complete third-party texts.

## School and scholarly classification

The four **fiqh** categories inherit the catalogue's legal-school topic label. Their use does not establish an author's legal opinion or a madhhab's relied-upon doctrine. For the **uṣūl** subset, an author's explicit school epithet or a unique author-URL cross-index in a fiqh category supplies a *provisional attribution*; the record reports which. This is weaker than a work's own title, colophon or a specialist biographical study. Where no support appears, uṣūl is **unassigned**, not forced to fit a quota.

In grammar, **Basran**, **Kufan**, **Baghdadi**, **Andalusian–Maghribi**, **Egyptian–Syrian**, and **later commentarial** are overlapping research associations, not six mutually exclusive or stable schools. The OpenITI builder offers **author-name-based provisional routes**; no claim of 40 independently attested works for each association is made (currently these heuristic groups are far smaller and very uneven). In balāgha, **adab/badīʿ**, **naẓm/iʿjāz**, **Miftāḥ–Talkhīṣ commentary**, **Andalusian–Maghribi**, and **later pedagogical/commentarial** are *strands* rather than doctrinal denominations. The manuscript shortlist uses named work-family and title-keyword navigation; that does **not** assert that one title is actually a commentary on another.

Crucially, **a 40–50-work quota is a research target, never evidence of six historically discrete grammar schools**. For later scholarship, use text families, teachers, geographic networks, pedagogic institutions and documented direct commentary edges independently.

## Script and provenance register

- `build_expansion.py`: pinned official OpenITI metadata, checksum, primary-work dedup, genre and school clues, overlapping exploratory lineages; output `expanded-bibliography.json`.
- `build_manuscript_select.py`: eight publicly accessible Alreq category tables and bounded manuscript-frequency-prioritised selection; output `manuscript-shortlist.json` with author, title, catalogue URL, category, school evidence and counts.
- `verify_expansion.py`: reproducible structural invariants, unique IDs, school counts, provenance labels, separation from the 404/377 historical research atlas.
- `expansion.html`, `expansion.js`, `expansion.css`: mobile-first searching and filtering with source-evidence tiers and actual original links.
- `index.html` and the GNAMMA `Texts in Time` source map retain the first 30 reader records separately. The Fiqh map links to source-classified manuscript-book previews and to the complete expanded bibliography.

OpenITI source: [pinned RELEASE commit](https://github.com/OpenITI/RELEASE/tree/cfc4157a3cf2054c0888f133970a4eaa3e22e58c), [metadata source](https://github.com/OpenITI/RELEASE/blob/cfc4157a3cf2054c0888f133970a4eaa3e22e58c/metadata/OpenITI_metadata_2025-1-9.tsv), license CC BY-NC-SA 4.0 per the existing GNAMMA verified-source registry. Alreq's [original category register](https://app.alreq.com/ar/Categories) remains authoritative for its bibliographic entries and manuscript counts.

## Gaps that remain

- **Rights and acquisition**: complete original text files for OpenITI candidates (including their volume completeness), source Git SHA content parity, manuscript scans/permission and editorial collation.
- **Bibliographic reconciliation**: join Alreq and OpenITI only after matching author authority, exact title, edition/recension, manuscript work identifiers; remove cross-source duplicates. Never add the counts from their two sources as an unqualified unique-work total.
- **Historical scholarly work**: check uṣūl school assignments, early Kufan/Basran lineages and authorship uncertainties; distinguish original treatises, summaries, commentaries, glosses, collected legal opinions and compendia.
- **Source-bearing networks**: only add commentary, critique, teacher-student, jurisprudential opinion and rhetorical influence edges when an attested passage, bibliographic testimony or manuscript colophon supports them.
- **Reader and PDFs**: bibliography alone does not make additional editions readable in GNAMMA, and no new PDFs or offline packages have yet been built.

The purpose of this stage is a *large actionable bibliographic acquisition index* whose record labels make it clear exactly what has—and has not—been verified.
