# Texts in Time · Islamic Intellectual Atlas
Gnamma Research · revision 7 · 29 October 2026.

[Explore the live atlas](https://gnamma-research.github.io/booksite/research/intellectual-atlas/)
· [Tahdhīb source dossier](https://gnamma-research.github.io/booksite/research/intellectual-atlas/tahdhib/)

The atlas contains **375 scholarly/context records**, **348 individually qualified textual
relationships** and **349 scholarly sources**, plus 72 historical references. Its integrated chronology interleaves
empire periods, events and the dated textual network without individual ruler lanes.

## Three overlapping classifications — do not conflate them

**Intellectual traditions:** primary catalogue labels and selectively source-audited overlapping overlays for long-lived philosophical or theological currents,
represented by existing colors and filters (Avicennan, Illuminationist, Akbarian,
Sunni kalām, Greek Neoplatonic, Imāmī, Ṣadrian, etc., including audited but incomplete Ashʿarī and Māturīdī overlays). These categories are non-exclusive receptions,
not proof of a writer's full doctrinal allegiance.

**Textual families:** explicitly named base works and selected commentaries or
glosses, represented by the equal-level **Textual family** selector. The eighteen
routes include al-Shifāʾ, al-Ishārāt, Hidāyat al-ḥikma, Ḥikmat al-ishrāq,
al-ʿAqāʾid al-Nasafiyya, al-Maqāṣid, al-Mawāqif, Tajrīd al-iʿtiqād,
Tahdhīb al-manṭiq wa-l-kalām, Jawharat al-tawḥīd, Fuṣūṣ al-ḥikam and
al-Asfār; and six source-critical families for Plato’s <em>Timaeus</em>, Aristotle’s <em>Metaphysics</em>, <em>Categories</em> and <em>Physics</em>, Arabic Plotinus, and Proclus’ <em>Elements of Theology</em> / the <em>Book of Causes</em>. The full member list, root, and description of each are in
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

## Current revision 7 downloadable editions

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

**Editorial boundary:** 375 indexed records do not mean 375 verified manuscript
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
