## 9 November 2026: No dead-end “unplaced” sources

The historical timeline and geographical map now distinguish what can be defensibly placed from what cannot:

* **764 Alreq catalogue records** receive a qualified chronological anchor from **19 individually identified author biographies** in `corpora/author-chronology.json`. The underlying Alreq records are unchanged. A date in the timeline means **author died in that year**, never that a specific book was composed, printed, copied or transmitted then. The original author biography is one click away.
* **3,393 Alreq entries still lack a sourced author death** in the mapped source register; additional undated contextual items from the canonical atlas remain separately counted. No date has been generated from the title, nisba, school label or another work with a similar name.
* Every timeline “unplaced” label now opens an **immediately visible, searchable bibliographic workbench above the map**, not a hidden/static card or an invisible list below a tall SVG. It has Arabic/Latin title and author search, pagination, direct work profiles, catalogue citation links and author biography links. Selecting a record displays its evidence in place. The workbench can be shared by URL and remains open after reload.
* The geographical map’s formerly passive “works unlocated” count now also opens a searchable catalogue with source links. Author lifetimes do **not** supply unsupported locations or work composition sites.
* Records assigned to the same author page are displayed as **catalogue siblings**, never as automatically inferred commentary, teacher/student or influence relationships. Such arrows still require independent evidence.

This behavior applies across fiqh, uṣūl, naḥw, ṣarf, balāgha, and all other sciences in the same atlas UI. New QA: `tests/verify_unplaced_workbench_browser.py`; source-integrity and browser CI: `.github/workflows/atlas-undated-workbench.yml`. Only independently researched dates/places may be added to the underlying registers.

---
## Continuous book traversal: timeline and complete source graph — 9 November 2026

The two **text-facing modes**—**Book timeline** and **Source network**—now share a persistent horizontal **Browse texts** rail. The selected book remains in focus while browsing:

- Use **Previous / Next**, the **Left / Right arrow keys**, touch **swipes**, or native horizontal scrolling through the cards. The selected work **and the visualization update automatically**. Clicking an individual card remains possible but is not necessary.
- Switch **Timeline ⇄ Source & reception graph** in the rail without changing the selected work. The timeline retains its original chronological SVG and automatically highlights the selected work or its dated/undated cluster. If a previously zoomed date range excludes a newly selected dated work, the range follows it at the same scale.
- Each source/reception graph now renders **all directly documented incoming and outgoing relationships immediately**, including every arrow and evidence card. The former eight-relationship cap and **Show further connected works** button have been removed. Larger graphs are vertically scrollable **but not lazily populated**.
- The **Source-linked** scope is the default browsing sequence, so arrowing through the network does not force a succession of unconnected catalogue records. Choose **All catalogued** to include every known work record, whether or not this research register has documented an influence relation. The scope and selected work persist in copied URLs.
- The word **direct** is crucial: longer inferential paths or mere membership in a textual family are *not* asserted as historically verified influence. Each real edge retains its separate relation type, certainty and citation.

Browser contract: `tests/verify_text_browsing_browser.py` exercises full cited network rendering, live traversal, active timeline highlighting, keyboard navigation, rail scrolling, scope/URL restoration and iPhone-sized touch swipes. Original source data and the geographical atlas are unchanged.

---

## Hanafi-style geographical atlas: authors and textual events (9 November 2026)

The live atlas now opens with **By century**, **By region**, and **Source network** in a restrained editorial interface, inspired by Hanafi Atlas's navigational hierarchy. A single science selector and search serves all intellectual sciences; the original chronological book diagram, principal-texts synopsis and catalogue remain in the same interface as secondary views.

The map is an **actual geographically projected SVG basemap** with simplified GSHHS-derived coastline geometry and modern WGS84 city reference points, not a cartesian dot plot. Distinct author and work symbols and a type selector allow readers to examine either the life/study/death places of scholars or independently attested text composition and recension events.

The source register `corpora/geo-events.json` contains **41 curated, citation-linked location events** (30 author events and 11 text events) across 28 cities. Examples include *al-Futūḥāt* begun at Mecca and recensed in Damascus, *Fuṣūṣ al-ḥikam* at Damascus, al-Kashshāf finished at Mecca, al-Nawawī's *Minhāj* at Damascus, Ibn Sīnā's *Shifāʾ* completed at Isfahan, and Ṣadrā's *al-Asfār* begun at Kahak and completed at Shiraz. Some reports provide an approximate city or scholarly context only; each is explicitly labelled, and selecting a city opens its source dossier.

**An author is not a text.** An author's birthplace or study city does not become a text's composition location; manuscript holdings require independently sourced witness records and are not inferred. Alreq's 4,157 undated catalogue records and OpenITI metadata remain available through search and the original book timeline, with an explicit **unplaced** count on the map. The map coverage is a researched first tranche, not complete geocoding of the full corpus.

Implementation files: `atlas-geo.js`, `atlas-hanafi.css`, `atlas-unified.js`, `corpora/geo-events.json`; browser test: `tests/verify_unified_v3_browser.py`. Each event has citation and evidence status. URL state includes selected geographical century, region, type and city.

---

## One historical atlas for all sciences — 9 November 2026

The current main page is **a new, unified Hanafi-Atlas-inspired interface**, not the previous separately rendered Fiqh/Arabic source-map application. **Every subject opens the identical chronological SVG book map and identical controls**; subject changes alter source records and lanes only. All works remain searchable, and undated manuscript records remain visible as unplaced clusters without fictitious dates.

The five coordinated views are **Historical map**, **Source network** (directed *Rests on / Carried on by*), **Principal texts**, **Regions** (qualified regional-label index), and **Catalogue**. Each selected work uses the same evidence inspector, and every displayed relation is taken from a cited existing edge, never inferred from school membership or time overlap.

The audited 404-node / 377-edge graph is unchanged; it is serialized in `corpora/canonical-atlas.json` and embedded for compatibility with source-integrity checks. Separate OpenITI and Alreq records retain their original identities. The 30 pinned source versions preserve only their five established work relations. The earlier interface is archived in `legacy.html`.

Implementation: `atlas-unified.js`, `atlas-unified.css`, `index.html`; browser contract: `tests/verify_unified_v3_browser.py`; full methodological guide: [WORK_EXPLORER.md](WORK_EXPLORER.md). Run `python build.py` to validate source integrity and publication metadata; it must not overwrite the new page. The paragraphs below record earlier superseded screens and are preserved as an audit history.

---

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

## Subject-first interactive SVG graphs — Fiqh, early jurists, grammar and other sciences (7 November 2026)

**Current live-web design on this revision:** selecting **Explore → Fiqh**, **Hadith**, **Tafsīr**, or **Arabic language sciences** replaces the main map with a responsive, clickable **SVG graph of actual book nodes**. The old 32-card bibliography and the category-by-period bubble grid are historical predecessors, **not** the intended interface. Even the subject overview shows individual bibliographic books and authority nodes connected visibly to their subject/lineage hubs. Clicking a school/lineage circle **zooms into another diagram containing individual book nodes**. Clicking an Arabic book node opens its author, edition/source metadata, school-attribution evidence and clickable bibliographic citation in an unobtrusive detail panel while the diagram remains visible. Book nodes remain paginated **within the graph**, never substituted by a scrolling list. Native canvas scrolling, zoom controls, direct links and keyboard-operable SVG nodes work on desktop and mobile.

**Additional Fiqh classifications:** the original four legal school selectors have been supplemented with **Early jurists**, **Other schools**, and **Unassigned**, each opening their own SVG view. A separate **16-person sourced early-juristic register** at [corpora/early-jurists.json](corpora/early-jurists.json) represents:
- individual early legal specialists before doctrinal madhhabs crystallised;
- historically attested *personal juristic circles* (including al-Awzāʿī, Sufyān al-Thawrī, al-Layth b. Saʿd, Abū Thawr, Ibn Abī Laylā);
- distinct named non-four classical traditions (especially Ẓāhirī and Jarīrī);
- the named early eponyms of the later four madhhabs, **without retrojecting their later institutions back into their lifetimes**.

The jurist authorities keep separate status and historical citations, notably **Wael Hallaq, *The Origins and Evolution of Islamic Law*, chs. 3 and 7** and specialist scholarship on al-Thawrī. Early authorship is linked to a work **only when original source-book author metadata supports the link**; a circle does not acquire fake book nodes or unattested teacher/commentary edges. Other early jurists may still be represented with no independently digitised book. No modern Salafi identity is treated as a fifth classical madhhab.

**Other disciplines:** Grammar, Ṣarf, Balāgha and lexicography now each have their own SVG textual-line graph. Hadith and Tafsīr each show their **source-book node graph** (not claims of collated chains or Qurʾānic interpretations). Selecting Taṣawwuf retains its existing Fuṣūṣ source-linked graphical network; Philosophy selects a filtered graphical historical atlas; All returns to the complete graphical chronology. The genre selection must never silently open the catalogue or old text-reader list.

**Evidence boundary:** source-only dashed branches indicate a work is *catalogued under* a discipline/school or provisional research association. Solid arrows are limited to the pre-existing five individually documented text relationships when both relevant works appear in the same view. The 4,157 Alreq catalogue entries, 1,857 OpenITI work/version candidates, 30 GNAMMA-pinned source versions and 404 canonical historical nodes/377 historical edges keep separate identities and statuses; cross-register conceptual identity remains uncollated.

Implementation: [corpora/subject-graph.js](corpora/subject-graph.js), [corpora/bibliography-map.js](corpora/bibliography-map.js) (normalisation and version provenance), [corpora/early-jurists.json](corpora/early-jurists.json), and [tests/verify_subject_svg_graph_browser.py](tests/verify_subject_svg_graph_browser.py). The browser suite must confirm all subject buttons show SVG node networks with **no visible book list**, four madhhab classifications, Early and Other historical authorities, citation-panel interactions, portrait/landscape mobile navigation, zoom and deep-link preservation.

---

*The earlier dated technical notes below are retained for audit history; their old period-matrix/word-list interface descriptions are superseded by the SVG-first design above.*

---

## Full bibliographic work map integrated into GNAMMA — 7 November 2026

**Current interface:** the main **Texts in Time** atlas, under **Explore → Fiqh & uṣūl** or **Arabic language sciences → Grammar / Morphology / Balāgha**, now presents an actual **source-cited bibliographic category/period map**. This supersedes the older ten-book-only SVG and twelve-title manuscript previews described in historical notes below. Within the map, switch fiqh/uṣūl subjects, choose legal schools, filter by provenance and (for Arabic sciences) qualified author/text associations, select a category/time cluster, then inspect each individual work record and its original bibliographic link. Book records are paginated inside the atlas; a separate reader or external bibliography page is **not required**.

**Complete imported metadata:** [Alreq full category register](corpora/manuscript-full.json) includes **4,157 separately source-linked catalogue IDs** from the eight public fiqh/uṣūl/grammar/balāgha tables: 1,033 Ḥanafī fiqh; 380 Mālikī; 782 Shāfiʿī; 199 Ḥanbalī; 501 uṣūl; 892 naḥw; 109 ṣarf; 261 balāgha. The four uṣūl school associations found by manuscript-author epithets or uniquely cross-indexed authors are Ḥanafī 101, Mālikī 30, Shāfiʿī 119, Ḥanbalī 39; 212 uṣūl entries remain unassigned. These are **provisional catalogue associations**, not verified doctrinal school opinions. The separate [OpenITI pinned primary-version work register](corpora/expanded-bibliography.json) contributes **1,857 metadata candidates**, possibly overlapping the Alreq list. Source URLs are attached to **every displayed book**, rather than being mandatory text-reader links. A work can be known bibliographically without a digital text.

**Historical plotting:** only a work's available *author death year* is plotted in a period band; the text's composition/printing date is not inferred. All undated Alreq records stay in an explicitly **Unplaced** column. Multiple grammar and balāgha research associations can overlap; these are selective author/title classification aids, not established commentary genealogies. No fictitious arrows or forced 40–50-work counts for invented independent grammar schools are introduced.

**Non-conflation:** the **404 historically audited entries / 377 documented relationships** in the established philosophy/kalām atlas remain unchanged. The already pinned **30 GNAMMA reader versions**, five byte-matched local files and five bibliographically documented work-to-work links also remain separate. The new map does not assert that 4,157 manuscripts or 1,857 complete additional Arabic text files have been acquired, that cross-catalogue duplicates have been reconciled, or that legal opinions are passage-aligned. This is the comprehensive **bibliographical-information** stage requested, not critical source-text acquisition.

**Implementation and audit:** `corpora/bibliography-map.js` is loaded before `atlas-app.js`, draws clickable, accessible and mobile-scrollable category/period clusters, and exposes work-specific citation details within the main atlas. `corpora/build_manuscript_full.py` extracts the public category-table metadata with original links, maintaining author-school evidence labels and “undated” status; `corpora/manuscript-full.json` is the reproducible data snapshot. `tests/verify_full_bibliography_map_browser.py` tests all four school counts, full uṣūl and Arabic categories, real map clusters, source-detail deep links, and mobile/desktop layout. The source files should be rechecked when upstream catalogues change.

---

*Previous source-reader and bibliography rollout notes (historical versions) follow; their ten-book map descriptions are superseded by the complete bibliographic work map above.*

---

## Fiqh UI repair and genuine disciplinary source maps — 7 November 2026
     
**Fixed:** choosing **Explore → Fiqh & uṣūl** now changes the main map immediately. Before this patch the button only set `activeScience` inside the Explore overlay; no source book data was read and no atlas renderer was called. **Source maps** is a real sixth view, available from navigation and the mobile View selector; its state survives page reload via `#view=sources&science=fiqh&source_tab=...&madhhab=...`.

The visible Fiqh source map draws the **ten pinned legal/uṣūl works** from `corpora/registry.json`, grouped by Ḥanafī, Mālikī, Shāfiʿī, Ḥanbalī and comparative records. Selecting a madhhab changes the displayed work authorities; **Legal texts**, **Legal questions** and **Uṣūl method** are independently selectable. The methods view filters to books actually tagged `usul`; the legal-questions view explicitly reports that issue-level dossiers have **not** yet been collated, rather than inventing juridical positions. Every work opens its source reader. Work card dates are **author death dates**, never claims about composition. A source-search query updates these cards instead of searching the unrelated philosophical diagram.

The same source-backed UI supports initial Hadith, Tafsīr and Arabic-language-sciences bibliographies, including naḥw and balāgha; existing bibliography-backed rhetoric edges remain distinct from the as-yet unmapped fiqh and isnād relations. No new nodes or historical edges were inserted into the **404-work / 377-relationship** canonical research atlas. The source registry remains **30 digital versions, five local verified mirrors and five bibliography-backed relations**. This is an actionable map of *source witnesses/works*, not a completed legal commentary map or critical edition.

**QA:** `tests/verify_current_science_ui_browser.py` exercises actual Fiqh selection, school-specific counts, uṣūl, hash reload, source search, Arabic rhetoric links, Hadith/Tafsīr entry, and responsive chrome in Chromium/WebKit. Legacy UI audit expectations of 386 entries / 20 families / three always-open drawers predate the current 404 / 21-family layout and must not be mistaken for a passing test of this UI.

---

Arabic source-corpus acquisition and verified mirrors — 7 November 2026

The [Arabic Source Library](corpora/) now provides **30 identifiable OpenITI digital Arabic source versions** from [OpenITI/RELEASE commit `cfc4157a3cf2054c0888f133970a4eaa3e22e58c`](https://github.com/OpenITI/RELEASE/tree/cfc4157a3cf2054c0888f133970a4eaa3e22e58c). These cover fiqh/uṣūl across the four Sunni madhhabs, hadith, tafsīr, taṣawwuf, naḥw, ṣarf, balāgha and lexicography. **Five complete digital source files** are mirrored in GNAMMA with exact Git blob SHA parity against OpenITI; **25 additional full digital files** are identified by pinned URLs and loaded by the browser on demand, with byte-integrity checking before displaying Arabic text. Five independently bibliographically evidenced work-level commentary/abridgment relations render as connected diagrams, including Nawawī's commentary on Muslim, Ibn ʿAqīl on the Alfiyya, and the al-Sakkākī → al-Qazwīnī → al-Taftāzānī rhetoric sequence.

Every version has exact source URL, OpenITI metadata, license (CC BY-NC-SA 4.0) and quality-warning fields. The source reader has right-to-left reading, page-block navigation, in-text finding, madhhab/discipline filters, source citations, version-level bibliographical provenance and crosslinks to the existing historical atlas where a canonical book identity is established. A [repeatable offline QA script](corpora/verify.py) checks source version identifiers, five local byte-level mirrors and the five evidenced relation records; GitHub Actions runs this on changes. Full verification status and source problems, including uncorrected OCR and omissions, are documented in [CORPUS_VERIFICATION.md](corpora/CORPUS_VERIFICATION.md).

**Scope boundary:** this is **verified digital source acquisition**, not a critical edition of every text. No new manuscript collation, systematic isnād analysis, legal-issue alignment or exhaustive coverage of the Islamic sciences has been certified; the original intellectual-historical atlas remains **404 entries / 377 qualified edges / 21 textual families**, distinct from the new 30-version source library. Prior offline atlas ZIPs predate this edition and should not be represented as current.

---

Mobile-first unified atlas navigation — 7 November 2026

The live **Texts in Time** page now places the historical diagram before the long research preface. The quick controls are **Search, Explore, a mobile View selector and an advanced-settings gear**. Desktop keeps direct view tabs. The old three above-map drawers for textual families, intellectual traditions and regional history are removed from the rendered interface; traditions, regions and chronology remain reachable through the advanced filters. The large research notes and downloads are collapsed after the diagram and can also be opened from Explore.

**Explore → Philosophy, kalām & logic** is a single group; existing source-verified textual families and author records are actionable. Choosing a family opens a new **Text Network** layout rather than forcing the dates into a branching genealogical tree. The canonical HTML and JSON still share the 404 nodes, 377 qualified relationships and 21 families. A diagram node opens its existing work record; an edge opens the existing date/relationship confidence and source citations. Timeline, Text Network, Relationships, Catalogue and Evidence remain alternative presentations of the same records; critical replies stay distinguished from commentary and borrowing.

Additional groups are shown without fabricated source data:
- **Fiqh & uṣūl**, with All / Ḥanafī / Mālikī / Shāfiʿī / Ḥanbalī choice and views for legal texts, questions and methods.
- **Hadith**, with separate Collections, Reports, Isnād and Commentaries routes.
- **Tafsīr & Qurʾānic sciences**, with passages, text families and questions.
- **Taṣawwuf**, with its existing `Fuṣūṣ` route, and separately described future corpora.
- **Arabic language sciences**, with naḥw, ṣarf, balāgha (maʿānī / bayān / badīʿ) and lexicography. Examples such as the `Alfiyya`, `Mughnī al-Labīb`, `Miftāḥ al-ʿUlūm`, `Talkhīṣ al-Miftāḥ` and `al-Muṭawwal` are explicitly **prospective** family candidates, not published source records.

No fiqh, hadith, tafsīr or Arabic grammar/rhetoric corpus was imported in this interface revision, and no new work-to-work edges are claimed. The earlier downloadable offline ZIP remains a historical snapshot and does not include these interface controls. This revision keeps earlier sharable atlas hashes and the Rāzī source-response evidence. For the implementation roadmap, see [Integrated Sciences Architecture](INTEGRATED_SCIENCES_ARCHITECTURE.md).

Textual-family revision — 7 November 2026

**No author-specific Rāzī button** is displayed in the atlas toolbar. Source-backed commentary/response links belong to the **named base-text families**, not to a special author category. The existing `al-Ishārāt` family retains Fakhr al-Dīn al-Rāzī's `razi_isharat` alongside Avicenna's base work, al-Ṭūsī's reply and Quṭb al-Dīn al-Rāzī al-Taḥtānī's adjudication. The existing `ʿUyūn` family retains Rāzī's `razi_sharh_uyun`. A new **`al-Muḥaṣṣal and its commentaries`** route contains `razi_muhassal`, al-Ṭūsī's critical `tusi_talkhis` and al-Kātibī's `katibi_mufassal`. Independent works that borrow from Rāzī are accessible through their evidence-linked reception records, not misleadingly included as direct commentaries. The same work may appear in multiple legitimate families but always has **one canonical record ID**.

Selecting a family that has evidenced critical edges reveals a **Critical links** checkbox adjacent to the family title in the existing status area. It restricts the visualization to that family's documented critiques/replies/adjudications without changing school colours, duplicating works, or adding controls to the top-level toolbar. The reader's existing author record button shows Rāzī's wider bibliography across families. The legacy `#responses=razi` URL is retained solely for previously shared links; the discoverable workflow is now through the text families, author records and normal relationship evidence. The source and confidence records are preserved. These routes are selective **work-level bibliographical relationships**, not yet passage-aligned critical editions.

Tajrīd critical-reader integration — revision 8, 31 October 2026

Current canonical data: 404 nodes, 377 textual relationships, 374 bibliographical sources. Added18 works/installments,15 sources and15 qualified edges; all224 Tajrīd source records and47 named/contextual work records map to stable IDs. This is bibliographical coverage, not complete collation.

Every mapped book can open its available reader passages. Reader links carry a validated reader route; the map selects the work, focuses connections and preserves an exact return link. Dossier chronology, uncertain attributions and undated composition remain qualified. Ghiyāth’s Tajrīd al-ghawāshī and al-Muḥākamāt share the existing work ID; Ragıp Paşa809 is the corrected witness.

Run build.py to validate the canonical data and synchronize index.html/publication.json. Revision8 offline ZIP embeds the current map; historical PDFs and revision7 ZIP remain earlier snapshots. The public Tajrīd reading package provides a complete static edition for offline use.


## Integrating fiqh, ḥadīth and the wider Islamic sciences

The next expansion should use one evidence-typed, passage-addressable graph rather than append unqualified scholar nodes. See [Integrated Sciences Architecture](INTEGRATED_SCIENCES_ARCHITECTURE.md) for a proposed multi-layer ontology, separate hadith isnād/matn/collection structures, historically qualified madhhab positions, a Qurʾān 5:6 / wuḍūʾ pilot, and the existing Ishārāt–Rāzī–Ṭūsī response chain as a second pilot. **This is a roadmap, not a claim that these corpora have been imported.**

Previous implementation history follows.

# Texts in Time · Islamic Intellectual Atlas
Gnamma Research · revision 7.2 · 30 October 2026.

[Explore the live atlas](https://gnamma-research.github.io/booksite/research/intellectual-atlas/)
· [Post-Sadrian Avicennian Summa](https://gnamma-research.github.io/booksite/research/intellectual-atlas/avicennian-summa/)
· [Tahdhīb source dossier](https://gnamma-research.github.io/booksite/research/intellectual-atlas/tahdhib/)

The atlas contains **386 scholarly/context records**, **362 individually qualified textual
relationships** and **359 scholarly sources**, plus 72 historical references. Its integrated chronology interleaves
empire periods, events and the dated textual network without individual ruler lanes.

## Three overlapping classifications — do not conflate them

**Intellectual traditions:** primary catalogue labels and selectively source-audited overlapping overlays for long-lived philosophical or theological currents,
represented by existing colors and filters (Avicennan, Illuminationist, Akbarian,
Sunni kalām, Greek Neoplatonic, Imāmī, Ṣadrian, etc., including audited but incomplete Ashʿarī and Māturīdī overlays). These categories are non-exclusive receptions,
not proof of a writer's full doctrinal allegiance.

**Textual families:** explicitly named base works and selected commentaries or
glosses, represented by the equal-level **Textual family** selector. The twenty
routes include al-Shifāʾ, al-Ishārāt, Hidāyat al-ḥikma, Ḥikmat al-ishrāq,
al-ʿAqāʾid al-Nasafiyya, al-Maqāṣid, al-Mawāqif, Tajrīd al-iʿtiqād,
Tahdhīb al-manṭiq wa-l-kalām, Jawharat al-tawḥīd, Fuṣūṣ al-ḥikam and
al-Asfār, plus the distinct al-Najāt and ʿUyūn al-ḥikma branches; and six source-critical families for Plato’s <em>Timaeus</em>, Aristotle’s <em>Metaphysics</em>, <em>Categories</em> and <em>Physics</em>, Arabic Plotinus, and Proclus’ <em>Elements of Theology</em> / the <em>Book of Causes</em>. The full member list, root, and description of each are in
`downloads/intellectual-atlas-data.json` under `textual_families`.
The same text may participate in several families; the menu only traces works
recorded in this *selective* atlas. Textual-family membership does not
establish doctrinal agreement.

**New Greek–Syriac–Arabic bridge:** the Athenian school (Syrianus, Proclus,
Damascius), Alexandrian Aristotelian/Platonic commentaries (Ammonius,
Philoponus, Olympiodorus, Simplicius and others), selected Syriac witnesses,
Arabic Plotinus, the Arabic Proclus and Book of Pure Good, and their different
Arabic and Latin receptions. The 44 new work or witness entries, 36 qualified
relations, six new textual-family routes and five scholarly-network bands do
not imply one uninterrupted master-to-pupil genealogy. An Arabic Proclus
Timaeus fragment is deliberately undated. Read `neoplatonism/index.html`.

**Historical and regional networks:** a third, independent filter for places and
regional scholarly contexts, including Baghdad/Iraq, Khurasan, Transoxiana,
Ottoman Anatolia, Iranian centres, South Asia, Farangī Maḥall and Egypt. A
single record may satisfy multiple region descriptors. Filtering by a recorded
region is not evidence of residence, a face-to-face encounter, or influence.
This initial implementation relies on the catalogue's existing free-text
regional descriptions; it is not yet a critically verified biographical
itinerary or prosopography.

**Nested map hierarchy:** the complete dated chronology is the universal map;
collapsible tradition summaries provide catalogue counts and dated spans;
clicking **Browse textual commentary families** or a route button in a work's
detail panel opens a selective commentary-family view. Matching regional
summary drawers provide contextual routes with approximate counts. Individual works can occur in several
textual routes and intellectual currents simultaneously, and the regional
filter may intersect either selection.

**Interaction:** the timeline has its own vertical scroll when it is taller
than the viewport, rather than trapping the mouse wheel for time travel.
Drag horizontally, use a horizontal trackpad gesture or Shift+wheel to pan
years; Ctrl/⌘+wheel zooms. On large screens, long detail panels also scroll
within their own column.

**Historical qualifications:** the Mughal dynasty (1526–1858) is shown
across a dashed 1540–1555 interruption in *control of Delhi*, explicitly
recognizing Suri rule; this is not a lacuna in the dynasty. Ten sourced
ancient bridge entries have been added for the previously underrepresented
Presocratic, Hellenistic and Roman periods. Their date ranges are expressly
approximate and do **not** create inferred influence links.

The 1387 **Tahdhīb** is *one two-part treatise*: the logic and kalām
analytical nodes are not separate authored books. Its 26 new entries and 26
relationships form an important textual commentary network, not a new
intellectual school. Read `tahdhib/index.html` for source and dating cautions.

## Post-Sadrian Avicennian programme (revision 7.2)

The expanded main atlas adds **11 works, 14 documentary relationships and 10 sources**
beyond the earlier 375/348/349 register. These include Narāqī's independent
*Jāmiʿ al-afkār*, the Khwānsārī–Sabzawārī response sequence, Khayrābādī's
*al-Hadiyya*, Malikshāhī's two-volume Persian *Ishārāt* commentary, and
new *al-Najāt* and *ʿUyūn al-ḥikma* commentary families. Catalogue
counts do not imply complete manuscript collation or finished translations.

[Read the Avicennian Summa pilot](avicennian-summa/) ·
[Source acquisition register](avicennian-summa/SOURCE_REGISTER.md).

The introductory pilot records 32 philosophical questions and five short Arabic–English
translation excerpts, each with a published-page link and distinct editorial
notes. The complete argument-unit translations and manuscript collation are
outstanding. A new developed chapter, [`On Contingency and Continuing Causation`](avicennian-summa/causal-dependence.html), adds a newly authored Arabic matn with English translations, three additional source lemmata from Narāqī, and an explicit comparison of proximal natural causes with continuing ontological dependence. The accessible 1904 Arabic printing of Khayrābādī's *al-Hadiyya* has been identified at https://ddl.ae/book/95961; no complete translation of it is claimed. This atlas does not redistribute commercial edition scans.

### New critical-chapter edition, 30 October 2026

The [ten-chapter bilingual critical reader](avicennian-summa/chapters/reader.html#ch01) now extends the original causation dossier with substantively translated and source-indexed studies of (1) mental existence and the nature considered in itself, (2) simple versus composite *jaʿl*, (3) substantial motion and the identity of the subject, (4) intellectual actualisation, imagination and personal identity, (5) the four causes and the Giver of Forms, (6) divine agency, cosmic necessity and plurality, (7) Narāqī's two critiques of *waḥdat al-wujūd* and his alternative, and (8) the three senses of universality and *nafs al-amr*, (9) the late Sunni kalām objections in the *Mawāqif* and *Maqāṣid* concerning prime matter, hylomorphism and mental existence, and (10) Avicenna–Narāqī–Aquinas on conservation, intermediary causes and divine agency. The original Arabic, English and relevant Latin passages are attributed separately, with printed edition variants where reported.

The [twenty-domain evidence audit](avicennian-summa/SYSTEMATIC_FINDINGS_AND_EVIDENCE_AUDIT.md) now lists each domain's translated primary passages, substantive findings and incompleteness, and the earlier [Narāqī causation dossier](avicennian-summa/primary-translation-causation.md) is included in the offline edition rather than stranded on a separate working branch.

**Important qualification:** The reader consists of major bounded argument units, selected extracts and analysis; it is **not** a complete, cross-manuscript critical translation of the entire late Avicennian tradition. The offline ZIP release includes all ten Markdown chapters, source files and the overview reader. No third-party printed book scans are distributed.

### Cumulative scholarly handoffs, 30 October 2026

The [ten-chapter integrated reader](avicennian-summa/chapters/reader.html#ch01) includes a new [conservation and secondary causation chapter](avicennian-summa/chapters/reader.html#ch10). Its [primary-source Markdown](avicennian-summa/chapters/10-conservation-first-cause-and-secondary-agency.md) directly compares Ibn Sīnā *Ilāhiyyāt* VI.1 pp.261–262 and VI.2 p.264; Narāqī I:38–42; and Aquinas *ST* I q.104 aa.1–3. Aquinas expressly acknowledges subordinate created conserving causes; this corrects an oversimplified prior reading of his view.

The immutable handoffs are [Stage 1](avicennian-summa/handoffs/STAGE_01_CORPUS_AUDIT.md), [Stage 2](avicennian-summa/handoffs/STAGE_02_TEN_CHAPTER_EDITION.md), and [Stage 3](avicennian-summa/handoffs/STAGE_03_RELEASE_HANDOFF.md). [HANDOFF_CURRENT](avicennian-summa/HANDOFF_CURRENT.md) is the authoritative restart point. These are packaged with the ten chapter source files in the Atlas offline ZIP. A successful site/UI release **does not** mean the uncollated twenty-domain primary corpus is a definitive critical edition.

## Current revision 7.2 downloadable editions

- `downloads/Intellectual_Atlas_Reference_Revision7.pdf`: full source-critical
  bibliography and relationship register, built from canonical JSON using
  `build_release.py` (metadata and evidence, not complete third-party books).
- `downloads/Gnamma_Intellectual_Atlas_Offline_Revision7.zip`: portable atlas,
  data, dossiers, and current PDF. Generated in release CI and committed with
  checksums; legacy PDFs are not included inside this new archive.
- `neoplatonism/index.html`: scholarly Neoplatonic transmission dossier
  organized by five historical scholarly networks and six new textual routes.

## Files and versions

- `index.html`: interactive atlas with embedded canonical research data.
- `atlas-app.js`: drag/zoom, time travel, all-record navigation, text-family
  selector, filters, selected-work panel, and evidence catalogue.
- `downloads/intellectual-atlas-data.json`: canonical complete dataset,
  including the textual-family membership registry.
- `tahdhib/index.html`: focused critical dossier on logic and kalām.
- `tahdhib-additions.json`: Tahdhīb additions and editorial cautions.
- `downloads/Islamic_Timeline_Website_Package.zip`: **earlier-version** offline viewer,
  canonical data of its own revision and the Tahdhīb dossier. It does **not**
  contain the revision-7 routes, 10 ancient bridge entries or scrolling fixes.
- `downloads/Intellectual_Atlas_Reference_Revision4.pdf`: 84-page
  earlier revision-4 reference catalogue and evidence register of the
  **321-item** corpus, including Tahdhīb; not a complete revision-7 register.
- `downloads/Tahdhib_Genealogy_Addendum.pdf`: 9-page focused supplement.
- `downloads/Islamic_Intellectual_Timeline.pdf` and
  `downloads/Islamic_Timeline_Overview.pdf`: earlier illustrated maps
  from revision 2 (204 / 15 pages); retained with the historical edition label.
- `build.py`: validates and synchronizes the embedded data and manifest.
  It **must not** replace the current site with the older illustrated/ZIP version.

All recorded dates, manuscript witnesses and source qualifications are retained.
A reported source is not a collated borrowing; a gloss need not endorse its
base work; a death or print date is not automatically composition. Political
coexistence is not intellectual influence. The catalogue is selective and
revisable. No complete third-party books or manuscript scans are redistributed.

## Revision 7 checks

Run `python research/intellectual-atlas/build.py` to validate the canonical
JSON, synchronize the HTML embed, and generate the current publication metadata.
Run `node --check research/intellectual-atlas/atlas-app.js` for syntax checking.
The test plan in `tests/README.md` covers scrolling, regional and textual
family navigation, mobile layout, date uncertainty and the Mughal interval.

The summary drawers report only recorded members; the broad Sunni kalām category
is retained, but selective, source-audited Ashʿarī and Māturīdī secondary
overlays now distinguish authorial affiliation from another school’s base text. Selecting a
textual family **preserves** existing independent regional, tradition and
relationship filters; use **Whole atlas** to reset them all.

## Release reproducibility

`python research/intellectual-atlas/build_release.py` rebuilds the reference
PDF and offline ZIP reproducibly from the canonical JSON plus site files.
The release workflow validates the PDF page count, Unicode text, archive
integrity, JSON counts and viewer assets, then commits only the generated
binaries and publication manifest on the default branch. The revised
browser QA checks Greek–Syriac–Arabic network bands as an independent layer.

**Editorial boundary:** 386 indexed records do not mean 386 verified manuscript
collations; several newly added temporal windows are deliberately approximate.
“Translated”, “paraphrased”, “commented on”, “criticized”, and “reported to be
influenced by” remain different evidence types.


## Interface revision 7.1 — continuous time travel and date evidence

The universal overview no longer jumps to a discrete centre on pointer
release. Drag its six-dot handle to translate the selected time window in
continuous increments; tap outside it for a deliberate seek. Drag/swipe the
main diagram with the same live date scale, rather than a temporary SVG
translation committed only when the finger lifts. Horizontal trackpad
scrolling is frame-scheduled; vertical scroll retains its native behavior.
The active window, chart axis and year captions remain synchronized.

Work labels are now visually separate, compact typographic callouts.
**Only the 9px square/diamond, bounded triangle, dotted possible date window,
or individually marked redaction stages express time.** The callout width is
never a duration of composition, circulation or publication. Each record's
source-qualified date meaning is also written in the detail drawer, for
keyboard and screen-reader access.

The staged al-Mawāqif revisions (c.1330–33 and 1349–52) and Plotinus'
treatises/editorial collection are plotted separately; the previously used
midpoints were not historical composition dates. The Ṭūsī Tajrīd remains a
*terminus ante quem* by the probable 669/1270–71 authorial witness; al-
Taftāzānī's Maqāṣid/Sharḥ has the detailed January 1383 completion evidence.
No exact day or composition year is invented for other uncertain works.

Regression: tests/verify_continuous_scrub_browser.py tests live motion before
release, bidirectional scroll intent, actual Chromium mobile touch gestures,
WebKit/Chromium layouts, the date glyph geometry and the separate-stage
provenance.

## Revision 7.1.2 — mobile-first entry and Whole atlas grip

On compact screens, long scholarly introductions, sources and downloads are
preserved inside a native **About this atlas** disclosure. Search and textual
family choices remain visible, while year inputs, region filters and secondary
settings are under **More options**. Three small shortcuts lead to intellectual
traditions, textual families and historical/region networks. A concise
**All years** button remains next to the graphic. The complete gesture/date
legend is available beneath the graphic instead of delaying it.

At the full historical scale (600 BCE–2026), the summary highlight necessarily
occupies the entire overview bar. Dragging its six-dot handle now restores a
movable zoomed time window and pans without a release-time jump. Tapping outside
the handle seeks the selected era; tapping the handle alone preserves the
complete overview. Arrow navigation and horizontal chart gestures likewise
restore a practical range when the complete span cannot physically pan.

The browser checks also assert the initial phone screen contains the top of
the actual graphic, not an expanded scholarly preface, and that the hidden
content is fully reachable on demand.

