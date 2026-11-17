# Future integrated Tahdhīb–Taqrīb reader — deferred design decision

**Decision recorded 13 November 2026.** Do **not** merge the two currently separate Gnamma books or expose a combined catalogue/menu item yet.

## Publication gate

Only undertake the merger **after both volumes of ʿAbd al-Qādir al-Sanandajī's *Taqrīb al-Marām*** have been completed to the agreed single-print critical-reading-edition standard. This means all printed upper commentary, embedded Taftāzānī lemmata, and ruled/lower annotations have been recorded, translated, and checked against the chosen Būlāq facsimile, with uncertain readings documented. Extensive manuscript collation is not required; do not conflate absence of manuscript collation with gaps in the printed text.

The companion *Tahdhīb al-Kalām* must also have reliable stable clause identifiers and final proofreading relevant to cross-work alignment. Do not infer that matching printed page numbers in different editions imply matching source passages.

## Intended eventual public organization

A single primary catalogue entry, likely **Tahdhīb al-Kalām (with Sanandajī's Taqrīb al-Marām commentary)**, should open a **study-first unified reading experience**:

- Main reading: Taftāzānī's parent work in Arabic/English, with a straightforward toggle to show Sanandajī's commentary on the same textual locus.
- Expandable secondary streams: Wasīm's positively attributed notes and other ruled/lower marginalia; unknown authorship must remain unassigned.
- Reader-selectable modes: *matn only*, *matn + sharḥ*, *full annotations*; parallel Arabic/English, comfortable continuous reading and focus on mobile.
- Stable bidirectional anchors: matn clause ⇄ commentary segment ⇄ relevant marginal note. Keep original printed page citations and independent witness identities for both source editions.
- Modern source handling: only verified parallels are automatically linked; uncertain correspondences remain unlinked or explicitly marked tentative.
- Reader UI is **not** a place for stage numbers, provenance dossiers, source QA dashboards, editorial history or production notes. Such material stays in an optional About / Editions & Sources layer or scholarly PDF.
- Preserve old standalone URLs as redirects or as distinct work views so citations/bookmarks continue to resolve.

## Interim policy: current work

Keep *Tahdhīb al-Kalām* and *Taqrīb al-Marām* as **separate public readers** with separate navigation and catalogue entries. Continue improving links **within each text** (page, passage, marginal note, return-to-reading, Quran/hadith/source references where securely identified). Keep the source-derived `tahdhib-parallels.js` concordance as an **unloaded editorial asset** for eventual unified alignment. Do not load it into either live reader or create a joint menu item in advance of the publication gate.

Review and implement this plan when both volumes of *Taqrīb al-Marām* satisfy the completion requirements; it is **not** an authorization for an unattended or scheduled future deployment.
