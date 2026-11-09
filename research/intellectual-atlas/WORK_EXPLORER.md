# GNAMMA Atlas: unified work explorer and critical data architecture

**Revision:** 9 November 2026 — feature branch \`feature/unified-work-explorer-20261109\`  
**Status:** implementation of the first connected work-explorer layer, with a formally specified next-stage ontology. The repository does **not** claim complete source reconciliation, passage collation, geospatial research or definitive coverage.

## User-facing experience

The established **Texts in Time** timeline remains the default historical map for the whole atlas and for each science. The original 404-entry historical dataset, 377 historical connections, full chronology, curated textual families, and separate vertical principal-text synopses are retained.

A new **Work explorer** tab offers:

1. A single searchable work catalogue spanning the audited philosophical/kalām network and the separately sourced OpenITI/Alreq/pinned records. Source identity is preserved; bibliographic records are *not* silently deduplicated.
2. A **directed, work-centred network** of explicit source-to-dependent relationships, with one- and two-hop exploration, both directions, qualified evidence and relationship-type filtering.
3. Selectable arrows which open their evidence, source URL, confidence and relation description, not a generic unqualified "influence" claim.
4. Named curated textual families (including *Fuṣūṣ*, *Tajrīd*, *Tahdhīb*, *Ishārāt* and major Greek–Arabic transmission families), without adding arrows from family membership.
5. Direct transitions into the explorer from the canonical historical-work detail and disciplinary bibliography-work detail, with shareable permalink state.
6. Full-source-bibliography search with filters by science, legal school and provenance. Unlinked Alreq manuscript catalogue records are **searchable and selectable**, with *no* synthetic textual arrows.
7. A carefully marked regional-label index. City coordinates describe names in canonical **regional-context strings**; they do not prove a text's place of composition, a scholar's itinerary or a manuscript's origin.
8. A coverage/limits view for observed corpus size, links, undated records and uneven evidence.
9. Export of the selected work neighbourhood as provenance-carrying JSON.

The explorer is not a replacement for the common-axis chronological map or the manually selected vertical synopsis. Its focus is the narrower question: *What is recorded as a source for this work and what is recorded as dependent on it?*

## Source layers and non-conflation

| Layer | Existing register | Meaning |
|---|---|---|
| Audited philosophy/kalām | Embedded atlas data: 404 entries / 377 relations | Historical items and relations of various types; work explorer restricts nodes to work-type records |
| OpenITI | \`corpora/expanded-bibliography.json\` | Work/version metadata and often approximate placement by **author death** |
| Alreq | \`corpora/manuscript-full.json\` | Manuscript-category records, normally unplaced in time |
| GNAMMA pinned | \`corpora/registry.json\` | 30 independently pinned source versions, with five explicitly documented bibliographical links |
| Scholarly identities | \`corpora/knowledge-graph-schema.json\` | **Target schema**, not a claim that historical entities have already been reconciled |

The browser uses the existing \`GNAtlasBibliography\` loader rather than fetching or normalizing the large registers twice. Its \`getData()\` adapter exposes the source objects already used by the chronological discipline maps. The current normalized book IDs remain \`oi:...\`, \`alreq:...\` or \`read:...\`; the explorer namespaces them as \`b:...\`, while historical canonical work IDs are namespaced \`c:...\`.

The mere existence of the same title and author in two registers is *not* an identity assertion. Reconciliation candidates are generated offline by \`scripts/identity-candidates.cjs\`. All generated matches remain \`unreviewed_candidate\` and require evaluation of cataloguing history, source authorship, textual scope, recensions and external bibliographical evidence.

### Relation semantics

Historical arrows are based solely on the 377-record canonical edge register (restricted to work-work endpoints) and the five pinned source registry links. The source graph may contain fewer visible relationships because some canonical relationships involve context items, some are outside the active family, some are provisional, and some lie outside the selected neighbourhood.

* \`commentary\`, \`gloss\`, \`critique\`, \`textual_use\`, \`translation_adaptation\` and other historical relation codes are preserved.
* The UI maps codes to broad **filter classes** but does not change the source claim.
* The direction is **source text → later text / dependent treatment** when that direction is established in the underlying register.
* No teacher/student, school membership, regional proximity, approximate date or title resemblance generates a work-work relationship.
* The **evidence** panel shows the precise source entries recorded in the register, confidence, evidence kind, and limitations.
* An unconnected work is not a historically unimportant work; it is a work without verified edges in this database.

## Canonical graph model

\`corpora/knowledge-graph-schema.json\` is a JSON Schema 2020-12 target that distinguishes people, compositions, work parts, recensions, manuscript witnesses, printed editions, digital versions, translations, passages, propositions and arguments, institutions, schools, places, and bibliographic records.

An **assertion** is distinct from both its subject/object entities and its evidence. It has a typed predicate, a source locator, verification status, epistemic strength and editorial scope. Identity itself is an assertion and is never merged automatically. A scholar's region and the provenance of a manuscript are different kinds of places, just as a composition date and the author's death are different time events.

The present browser adapter intentionally uses a smaller, read-only work-focused projection of this future graph. It does not claim to have transformed all manuscript, person and passage records into that target schema.

### Offline identity candidates

From repository root:

\`\`\`bash
node research/intellectual-atlas/scripts/identity-candidates.cjs
\`\`\`

The generator reads the existing Alreq and OpenITI metadata and writes \`research/intellectual-atlas/corpora/identity-review-candidates.json\` locally. This file contains title+author match **candidates** only, not certified same-work identities. Reviewers must enter evidence and separately approve each identity before it can change canonical work IDs.

Optional input and output paths can be supplied as the first three positional arguments for testing.

## URLs and interfaces

Open the atlas at:

\`https://gnamma-research.github.io/booksite/research/intellectual-atlas/#view=explorer\`

Explorer state lives under \`gnx_*\` URL parameters to avoid colliding with the older \`view\`, \`work\`, \`source_tab\`, \`sa_*\` and \`bib_*\` parameters. The new route preserves the selected canonical \`c:\` identity or bibliographical \`b:\` source identity, graph depth, direction, relation type, provenance, text family, school, science and current display.

Existing historical-atlas and disciplinary-subject routes continue to render their original maps.

The document-based UI uses one compact primary control line and a collapsible advanced filter section, with scrolling confined to the graph region on small screens. Focusable SVG nodes and edges are keyboard-activated with Enter or Space.

### Performance

Large bibliographic registers are loaded **once** by the existing shared normalization service. Search and filters operate over the resulting in-memory work register. The graph paints only a one- or two-hop neighbourhood with a cap of 11 records per outer layer, showing the count of hidden additional neighbours. Rendering uses SVG because the visible subgraph is intentionally small. A whole-corpus force-directed graph is *not* loaded into the DOM, and no extra WebGL dependency is introduced for a problem the current stage does not require.

At a much larger corpus size, the appropriate next step is indexed search and graph neighbourhood slicing at build time, rather than drawing every source record in a global network. Only then should WebGL or a graph database be considered.

## Research cautions and completion gates

**Implemented here:** navigation, unified search over the existing registers, source-to-dependent graph, evidentiary relation inspectors, source-map links, filtering, geographic regional-label index, JSON export, graph schema, and candidate-generation tooling.

**Not complete:**

- Historical duplicate resolution across OpenITI, Alreq and the canonical register; the generator only produces review leads.
- Verification of 30–40 works in **each** legal school and the larger 40–50-title grammar/rhetoric lines against editions and manuscripts. Existing registers are broader than their individually verified connections.
- A genuine historically sourced GIS atlas of composition, manuscript movements, study networks and holdings. The current regional view is explicitly an *index of mentioned cities*, not a route map.
- Whole-work manuscript collation, passage-to-passage alignments, philosophical argument maps, or exhaustive hadith isnād / tafsīr passage networks.
- Exhaustive mobile and Chromium/WebKit/Firefox performance certification on the 6,000+ external metadata records. New Playwright tests are provided; they must be run on a network-served local checkout before claiming final QA.

These deficits are tracked explicitly because ungrounded completion claims would make this research resource misleading.

## Verification

Serve the project root through an HTTP server (relative bibliographical fetches require HTTP, not \`file://\`). Run:

\`\`\`bash
python -m http.server 8123
python research/intellectual-atlas/tests/verify_work_explorer_browser.py
python research/intellectual-atlas/tests/verify_unified_subject_timeline_browser.py
\`\`\`

The new Playwright test checks graph rendering, directed canonical relationships, 5 pinned source relations, the large Alreq bibliography, non-invention of Alreq edges, source links, evidence details, family selection, geographic qualifications, JSON export, cross-view identity, deep-link reload and mobile overflow.

A smoke test of the new JavaScript module was performed with the actual embedded canonical data and 30 pinned reader records. It successfully initialized 379 work-type canonical nodes and 322 work-work edges, plus 30 pinned records and 5 links, and drew a 12-node / 13-edge *Fuṣūṣ* neighbourhood. This is **not** a substitute for the complete browser suite.

## Next scholarly priorities

1. Verify and curate the canonical work identities for legal schools, grammatical currents and balāgha lineages. Keep early juristic circles and historically attested non-four schools distinct from later four-school institutional identities.
2. Require exact edition or page-level citations for each new commentary, source, criticism, teacher relation or geographical claim. Review proposals rather than silently publishing them.
3. Link reader passages and apparatus to work entities, beginning with the existing *Tajrīd*, *Tahdhīb*, *Fuṣūṣ*, *Nuṣūṣ*, *Kashshāf* and GNAMMA critical-edition programmes.
4. Once dated composition and place assertions are reviewed, expand the regional index into a genuine georeferenced historical atlas.
5. Introduce an editorial queue and versioned assertions so scholarship can correct uncertain relationships while preserving the old audit trail.

The practical criterion for completion is not the node count but the ability to move from every discoverable work to its history, its documented textual context, its evidence, and—where available—its critical reader, without confusing a catalogue entry with a historical claim.
