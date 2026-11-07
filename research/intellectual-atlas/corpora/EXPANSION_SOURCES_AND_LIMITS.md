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
