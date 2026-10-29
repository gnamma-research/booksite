# Texts in Time · Islamic Intellectual Atlas
Gnamma Research · revision 6 · 29 October 2026.

[Explore the live atlas](https://gnamma-research.github.io/booksite/research/intellectual-atlas/)
· [Tahdhīb source dossier](https://gnamma-research.github.io/booksite/research/intellectual-atlas/tahdhib/)

The atlas contains **331 scholarly/context records**, **312 individually qualified textual
relationships** and **317 source records**, plus 69 historical references. Its integrated chronology interleaves
empire periods, events and the dated textual network without individual ruler lanes.

## Three overlapping classifications — do not conflate them

**Intellectual traditions:** the long-lived philosophical or theological currents,
represented by existing colors and filters (Avicennan, Illuminationist, Akbarian,
Sunni kalām, Imāmī, Ṣadrian, etc.). These categories are non-exclusive receptions,
not proof of a writer's full doctrinal allegiance.

**Textual families:** explicitly named base works and selected commentaries or
glosses, represented by the equal-level **Textual family** selector. The twelve
routes are al-Shifāʾ, al-Ishārāt, Hidāyat al-ḥikma, Ḥikmat al-ishrāq,
al-ʿAqāʾid al-Nasafiyya, al-Maqāṣid, al-Mawāqif, Tajrīd al-iʿtiqād,
Tahdhīb al-manṭiq wa-l-kalām, Jawharat al-tawḥīd, Fuṣūṣ al-ḥikam and
al-Asfār. The full member list, root, and description of each are in
`downloads/intellectual-atlas-data.json` under `textual_families`.
The same text may participate in several families; the menu only traces works
recorded in this *selective* atlas. Textual-family membership does not
establish doctrinal agreement.

**Historical and regional networks:** a third, independent filter for places and
regional scholarly contexts, including Baghdad/Iraq, Khurasan, Transoxiana,
Ottoman Anatolia, Iranian centres, South Asia, Farangī Maḥall and Egypt. A
single record may satisfy multiple region descriptors. Filtering by a recorded
region is not evidence of residence, a face-to-face encounter, or influence.
This initial implementation relies on the catalogue's existing free-text
regional descriptions; it is not yet a critically verified biographical
itinerary or prosopography.

**Nested map hierarchy:** the complete dated chronology is the universal map;
intellectual traditions remain long-lived overlays; clicking **Browse textual
commentary families** or a route button in a work's detail panel opens a
selective commentary-family view. Individual works can occur in several
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
  contain the revision-6 routes, 10 ancient bridge entries or scrolling fixes.
- `downloads/Intellectual_Atlas_Reference_Revision4.pdf`: 84-page
  earlier revision-4 reference catalogue and evidence register of the
  **321-item** corpus, including Tahdhīb; not a complete revision-6 register.
- `downloads/Tahdhib_Genealogy_Addendum.pdf`: 9-page focused supplement.
- `downloads/Islamic_Intellectual_Timeline.pdf` and
  `downloads/Islamic_Timeline_Overview.pdf`: earlier illustrated maps
  from revision 2 (204 / 15 pages); retained with the historical edition label.
- `build.py`: validates and synchronizes the embedded data and manifest.
  It **must not** replace the current site with the older illustrated/ZIP version.

All dates, manuscript witnesses and source qualifications are retained.
A reported source is not a collated borrowing; a gloss need not endorse its
base work; a death or print date is not automatically composition. Political
coexistence is not intellectual influence. The catalogue is selective and
revisable. No complete third-party books or manuscript scans are redistributed.

## Revision 6 checks

Run `python research/intellectual-atlas/build.py` to validate the canonical
JSON, synchronize the HTML embed, and generate the current publication metadata.
Run `node --check research/intellectual-atlas/atlas-app.js` for syntax checking.
The test plan in `tests/README.md` covers scrolling, regional and textual
family navigation, mobile layout, date uncertainty and the Mughal interval.
