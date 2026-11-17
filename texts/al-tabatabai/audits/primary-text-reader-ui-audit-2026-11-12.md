# Primary-text-first reader audit — 12 November 2026

## Editorial decision

- **Manṭiq:** Muḥammad Riḍā al-Muẓaffar's *al-Manṭiq* belongs to the Logic/Manṭiq catalogue, with its honest incomplete-translation status.
- **Falsafa:** al-Ṭabāṭabāʾī's *Bidāyat al-Ḥikma* and *Nihāyat al-Ḥikma* are catalogued under Philosophy, not as principally ʿIrfān.
- The three-book comparative reading room remains available as a **cross-disciplinary route** rather than a misleading single disciplinary classification.
- *Qawāʿid al-Tawḥīd* with the independently attributed *Tamhīd* commentary remains under ʿIrfān and metaphysics.

## UI findings and repairs

1. The shared Hikma reader originally defaulted to a combined original/editorial heading display; the new default is recorded/original headings. A reader may deliberately select editorial headings in Display; they are suppressed in Focus/Section-focus surfaces.
2. The per-passage footnote renderer mixed explanatory lecture notes, translation caveats, critical variants and source metadata into the authorial reading surface. It now renders **only identifiable authorial notes** (Arabic authorial note or explicitly labelled authorial footnote/note, excluding paraphrase/editorial reports). Remaining notes and source locators are retained as raw data and exposed through **Tools → Editorial notes · apparatus**, searchable by passage, book and terms.
3. Curated cross-book conceptual pathways and related terms were appended to the text of individual passages. These are now accessible through **Tools → Related discussions**, still with source-target IDs and return-to-passage navigation. The Dictionary and Subject index remain separately available.
4. Explicitly labelled editorial-guide units are excluded from the primary passage search/reading flow, without deleting or rewriting source content. Authorial introductions, stage divisions, original text and bona fide commentary remain.
5. Qawāʿid source and commentary editorial/variant notes are no longer visually embedded in the reading area in Normal, Focus or Continuous. **Reading desk → Editorial & textual notes** contains the current matn unit and its corresponding sharḥ notes; manuscript reports and separate scholarly pages remain accessible.
6. The texts catalogue and bottom-dock library menu have aligned classifications; single-book breadcrumbs now return to **Texts** under their discipline rather than to a falsely grouped logic–philosophy category.

## Preservation boundaries

- No Arabic source wording, English translations, numbered units, stable paragraph IDs, dictionary entries, discussion-link records, witness decisions, or existing nine published Hikma PDF files are rewritten by this UI change.
- Authorial prefaces stay where their authors placed them; editorial prefaces and interpretations do not occupy the primary authorial reading flow.
- Scholar-facing audits, translation statuses and printed-witness caveats are preserved in dedicated edition/source views and the repository, not erased.
- The complete working Nihāya publication remains **complete relative to its named printed witnesses**, not independently human-certified or manuscript-established. Muẓaffar gaps and Book VI remain open.

## Verification

New frontend syntax and nav checks are required, as are desktop/mobile browser regressions for (a) a clean Bidāya passage; (b) editorial apparatus retrieval; (c) stable related-discussion navigation/return; (d) authorial footnote retention; (e) clean Qawāʿid focus/continuous modes; (f) language and PDF/edition links. Existing multi-engine workflows must be rerun on the change branch. Do not treat this file or a draft PR as live deployment evidence.
