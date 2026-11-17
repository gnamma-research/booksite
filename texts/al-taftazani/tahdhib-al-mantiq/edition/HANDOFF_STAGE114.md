# Tahdhīb Stage114 — LIVE PUBLICATION HANDOFF

**Source of truth:** `hawashi-effective-stage114.json` and `hawashi-numbered-notes.html` in `texts/al-taftazani/tahdhib-al-mantiq/edition/`. The full 14-section reader is published by GitHub only after merging the Stage114 publication pull request. The former Stage113 reader is preserved at `hawashi-numbered-notes-stage113-archive.html`.

**Totals:** 1,090 numbered positions across 14 historical local numbering series. 1,029 first-pass English renderings, four prose renderings missing source tables, and 57 reference-only modern additions. 79 inherited full digitally searchable Arabic notes and 1,011 without complete source Arabic in this export. No independently photo/manuscript-collated H printed pages or Y source positions. No full classical modal proof certificates added.

**Navigation:** [Full 14-section reader](hawashi-numbered-notes.html) · [Cumulative working Markdown](batches/hawashi-all-sections-cumulative-stage114.md) · [Stage114 publication status](progress-stage114.html) · [Previous Stage113 reader](hawashi-numbered-notes-stage113-archive.html).

---

# Tahdhīb Stage114 — full cumulative handoff

Date:11 November2026. **Priority implemented: end-to-end English first pass; no UI redesign or manuscript-critical expansion.**

## Delivered state

Read Complete_First_Pass.md, Offline_Reader.html, Progress_and_Manifest.json and Corpus.json. All1090 numbered source positions in14 historical sections are represented. There are1029 English first-pass renderings,4 visible-prose renderings with missing tables, and57 separately identified modern editorial references.742 positions were newly processed after Stage113;57 prior partial positions were revisited. The numbered English fields total105,924 words; new/replacement fields total72,330. These are calculated whitespace counts, not page counts.

This is a complete *end-to-end draft assembly*, not a certified unabridged translation of every item in the modern printed volume. Some arguments are compressed first-pass renderings; full literal alignment and proofreading remain necessary. The57 reference-only modern insertions are not claimed translated. The four table omissions remain real gaps. Replacing a prior partial with a reference does not count as translating it.

## Actual substantive end and numbering

H prose beginsQ127 and ends with Sciences note86/Q395. Q396 is blank/dot;Q397 contents heading;Q398–400 contents. The earlier assumption that new gloss prose continued throughQ400 was incorrect. Preserve14 independent local numbering systems; stable IDs are in Corpus.json. The full section census and allsource-hashes are in the manifest. Do not invent a single historical sequence1–1090.

## Source preservation

The complete public digital source cache was retrieved successfully in GitHub Actions run42959128971 (artifact13827754982) and mounted in this conversation as Tahdhib_Arabic_Source_Cache_127-400.zip. Arabic_Source_Cache_Manifest.json records all274 URLs, successful status and SHA256. The full raw cache is NOT redistributed in this delivery because it includes later editorial material; original URLs remain attached to every note. It is digital searchable text, not a photograph or independent manuscript.

## Files and reproducibility

Corpus.json contains the effective1090records, stableIDs, page links, English status, inherited metadata and source-unit hashes. Draft_Batches/translations contains allnewEnglish batch files;Draft_Batches/repairs contains all57revisions. Source_Census.json contains the section/localnote/page mapping and digitalArabic hashes without redistributing the full modern text. Immutable_Stage113_Records.json preserves all348baseline records for revision comparisons. The current draft can be regenerated from these records by assemble_from_records.py. SHA256SUMS.json authenticates delivered bytes, not translation correctness.

## Publication status

Stage113 is published in gnamma-research/booksite, PR292/commit8ce5c280addff3bb77afffb1dbacc6b52f460e4e. Stage114 has a complete GitHub publication candidate in branch `tahdhib-publish-stage114-20261111`, with the entire 1,090-note corpus embedded in `hawashi-numbered-notes.html` and reproduced in `batches/hawashi-all-sections-cumulative-stage114.md` plus `hawashi-effective-stage114.json`. This handoff records the publication candidate and should be updated with the actual merge commit only after CI passes. The reader is on the public GNAMMA website only after that merge and the site's deployment.

## Source/author distinctions

T=Taftāzānī original matn;Y=al-Yazdī principal commentary;H=the later mixed-author glosses translated here. Earlier mainY110positions/113blocks are already first-pass translated. No new Y manuscript collation has occurred. Modern al-Taqrīb, al-Karmī, Muṭahharī and similar insertions must not be silently presented as early glossator prose. Older signed commentary appearing after a modern entry is retained separately when identified. Existing unnumbered metadata is preserved but is not claimed an exhaustive census of every unnumbered insertion.

## Exact remaining work, not another forward translation start

There is **no unprocessed forward numbered historical section afterQ395** in this source census. Do not restart atConcepts36: it has now been processed through the end. Next work is:

1. Retrieve the four missing tables for Definition19/Q258, Propositions97/Q294, Propositions121/its cited pages, Conditional40/Q309. The HTML provides no readable cells; do not invent them. Sciences29's diagram wording is also flagged if present in its note.
2. Review the57modern reference-only entries in Reference_Only_and_Table_Gaps.json under an appropriate separate translation/permissions scope. They are not hidden historical gaps.
3. Proofread source readings and expand compressed arguments into an unabridged clause-aligned translation where required. Retain all disputes and source corrections as apparatus, not silent normalisations.
4. Import this full cumulative draft into the repo/reader and update whole-corpus first-pass progress separately from manuscript certification. Reuse the14sourceIDs and local sequences; do not duplicate the348baseline entries.
5. Only then resume fullArabic alignment, photographic/manuscript collation and the separate46modalproof programme. Certification remains0wholeHpages and0independentYpositions; no modalproof count is increased.

## Restart prompt

Continue from the Tahdhīb Stage114 full first-pass delivery archive, not Stage113's obsolete next-note pointer. LoadCorpus.json/Progress_and_Manifest.json and thishandoff. All1090source-numbered positions,14sections,Q127–395are represented:1029Englishfirstpass,4missing-tableprosenotes,57moderneditorialreferences;742newpositions and57oldpartialsrevisited. TheforwarddraftreachesSciences86/Q395. ThewebsitecurrentlyremainsStage113untilthisartifactisactuallyimported. Preserve source-unit hashes, previous348records and allnewbatches; reviewexactexceptions, importthecumulativeEnglishdraft, anddonotclaimmanuscriptcertification.