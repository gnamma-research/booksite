# GNAMMA Atlas — unified historical and textual maps
**Release candidate:** 9 November 2026  
**Main entry:** `research/intellectual-atlas/index.html`  
**Previous UI preserved:** `legacy.html` (historical comparison only)

## Design principle

**One interface and one chronological SVG renderer for every science.** Selecting Fiqh, Uṣūl, Naḥw, Ṣarf, Balāgha, Tafsīr, Hadith, Taṣawwuf or Philosophy/Kalām changes the displayed work records and the relevant historical classification lanes, *not* the toolbar or map application.

The new screen follows the user-centered ideas of [Hanafi Biographical Atlas](https://www.hanafiatlas.com/network): choose a work, ask what it rests on and what continued it, inspect an evidence-qualified source network, then return to the historical context. The GNAMMA interface is an independent implementation over distinct scholarly source registers.

## Views

- **Historical map (default)** — the same time-axis and controls for every science. Clusters contain actual work references, can be zoomed into, and retain an interactive 'unplaced' lane for undated manuscript metadata. Search always reaches any indexed work.
- **Source network** — one selected work at the centre, directed sources on the left ('Rests on') and later reception on the right ('Carried on by'). Each displayed relationship has a dedicated evidence action with original type, claim, confidence and bibliography. No school association or shared date becomes a textual edge.
- **Principal texts** — a selective vertical view, with documented arrows *only where actual research relationships exist*. The 21 audited textual families retain their curatorial membership. Disciplinary book samples are marked provisional, never called definitive curricula.
- **Regions** — a qualified gazetteer index of cities actually named in the *audited region labels*. It does not manufacture composition places, manuscript origins or scholarly travel routes.
- **Catalogue** — complete source-linked discovery, including undated records, without fabricating work identities or influence links.

The work inspector is shared across all views: title in Arabic/Latin where available, author, type of date, source register, original citation, incoming/outgoing links, and warnings.

## Data provenance

| Register | How it is used | What it does **not** mean |
|---|---|---|
| Audited canonical data, 404 entries / 377 source-qualified relationship records | Historical intellectual network with original source citations, textual families, chronology | Exhaustive historical influence or manuscript collation |
| OpenITI 2025 expanded bibliography, 1,857 metadata candidates | Source work/version entries, often dated by author death | 1,857 new independently audited relationships |
| Alreq manuscript bibliography, 4,157 catalogue IDs | Source-linked undated bibliographic records | 4,157 verified distinct works or acquired manuscripts |
| GNAMMA source registry, 30 pinned versions / five documented links | Specific pinned references and external bibliographic links | Whole-text critical edition or additional invented edges |
| Curated early jurists, 16 person records | Historical authors/circles and non-four-school presences | Later four-madhhab institutions retrojected to early people |

OpenITI and Alreq records remain separate. Duplicate book identities are not merged by title or author similarity. The project requires independent evidence to promote a suggested identity or relation.

The external `corpora/canonical-atlas.json` is the unchanged 404/377 research payload. The same data is also embedded for compatibility with scholarly integrity checks, avoiding a second download. The former interactive shell is archived in `legacy.html`. New code does **not** load the previous disciplinary atlas scripts; this is an actual replacement of the separate interfaces.

## Date rules

- Original audited entries preserve their recorded range, terminus and qualified plot anchor, rather than replacing them with invented composition dates.
- OpenITI and pinned versions with a death AH date are positioned by an **approximate conversion of the author’s death date**. The tooltip and inspector always say this is not the text's composition date.
- Alreq entries lacking a defensible date remain **unplaced**, reachable from the same map.
- Historical jurist markers are persons, not fabricated books.
- The map is a visualization of *available evidence*, not proof that unwritten or unpreserved works did not exist.

## Reproduction and regression testing

From the repository root:

```sh
python research/intellectual-atlas/build.py
python -m http.server 8123
python research/intellectual-atlas/tests/verify_unified_v3_browser.py
```

The E2E test covers all ten subject transitions, uniform controls, 6,000+ bibliographic source records, source/reception network, relationship evidence, Arabic search, principal-texts, regions, catalogue, deep links, mobile and horizontal containment.

`tests/verify_unified_subject_timeline_browser.py` is the compatibility entry point for the new contract. The previous obsolete visual assertions remain available as `tests/verify_legacy_subject_timeline_browser.py` and run against `legacy.html` for historical comparison if required. Other source-integrity scripts are retained.

## Research still required

This application **does not claim** that the full school-by-school genealogies, manuscript recension comparisons, 30–40 and 40–50-text curated school lists, an explicitly evidenced historical GIS of composition/teaching, or passage-level doctrinal comparisons are finished. The schema and data record boundaries allow these to be added responsibly. The scientific standard for the remaining work is source-level verification and editorial review, not visual density or guessed influence arrows.

The immediate production criterion is that the live root URL opens this uniform interface, that one can switch between all sciences without changing the map or controls, and that every actual arrow can be inspected for its bibliography.
