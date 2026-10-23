# Darūrī portable scholarly source: publication and rights review

**Release target:** `daruri/source/Daruri_Portable_Scholarly_Source.zip`  
**Proposed release:** 23 October 2026, source archive v1  
**Decision:** approve publication of the **existing Gnamma scholarly source snapshot** with explicit attribution and no new blanket licence. The publisher explicitly requested publication on 23 October 2026. This is an editorial/technical publication decision, **not legal advice or a claim of rights over another publisher's materials**.

## What this release is

A deterministic, machine-readable archive derived from the same canonical Gnamma source used by the already-published Darūrī reader. It is not a scan of a modern book, a newly collated manuscript, the offline Gnamma website package, or the PDF editions. The archive contains the historical Arabic source, Gnamma's working English translation and editorial vocalization, paragraph references, scholarly annotations, historical lexical witnesses and portable HTML/TEI/JSON/TXT representations. It has no private reader annotations or credentials.

## Attribution and differentiated rights

1. **Historical text:** Abū al-Walīd Ibn Rushd (d. 595/1198), *al-Ḍarūrī fī uṣūl al-fiqh*. The author's medieval wording is historical material; the original manuscript was not independently collated by Gnamma.
2. **Modern printed witnesses:** Jamāl al-Dīn al-ʿAlawī, ed., *al-Ḍarūrī fī uṣūl al-fiqh*, Beirut: Dār al-Gharb al-Islāmī, 1994. Consulted alongside Ziad Bou Akl, *Averroès, le philosophe et la Loi: édition, traduction et commentaire de l'Abrégé du Mustaṣfā*, De Gruyter, 2015. The modern editors' introductions, commentary, critical apparatus and French translation are **not** provided as licensed standalone works and are **not** newly licensed by this archive. Use the original works for citation and rights decisions.
3. **Historical dictionary sources:** Selected Arabic articles by al-Jurjānī, al-Munāwī, al-Tahānawī, al-Rāghib, al-Muṭarrizī, al-Suyūṭī (attributed), Ibn Manẓūr and al-Fayyūmī. Exact selected source witnesses and article links are recorded in `scholarly-data/full-headwords.json`. Digital transcriptions include OpenITI, Shamela, Wikisource, Arabic Lexicon and Arabic-keyboard.info; third-party transcription policies, source obligations and attribution survive inclusion in this archive.
4. **Editorial work:** Gnamma's English translation, vocalization, numbered R001–R258 segmentation, editorial headings, apparatus and research classifications are editorial, not historic original text. Public availability is **not** a grant of a permissive licence for every component. No rights in another party's existing edition or transcription are asserted.
5. **Religious source quotations:** Qurʾān and hadith references appear with attribution/qualifications. Source-location references are not blanket authorization to republish present-day translations from linked sites.

## Scope of authorization and retained limits

The publisher's request authorizes the project to **distribute this source snapshot**, with differentiated notices already present in the reader and archive README. It does **not** authorize claims of permission to reproduce third-party modern editions, nor does it determine the terms on which others can republish Gnamma's editorial work or the transcriptions of historical works. The source ZIP therefore has no unqualified CC0/CC BY/MIT claim; users must inspect the source-by-source provenance and applicable restrictions. Corrections and permissions concerns should be recorded in the repository issues before expanding scope.

This release contains no publisher PDF facsimiles, no modern French translation, and no personal Reading Desk data. Manuscript-level independence, accurate Shamela-v4 import, and comprehensive text-critical status are expressly **not** claimed.

## Technical gates

- Export from the immutable canonical reader used for the public Gnamma text, never OCR from a PDF or the offline-reader bundle.
- Verify all 258 authorial sections, 414 aligned passages, 46 recorded Arabic headings, 625 note records, two later copyist's colophon passages, 153 dictionary terms, 157 selected historical articles and 18 ZIP entries.
- Verify byte-identity of source scholarly-data files, source ZIP SHA-256 and byte count, deterministic regeneration, native ZIP signature and absence of personal browser storage.
- Commit ZIP, archive report and a matching `source-archive-manifest.json` together; do not activate a source download before both the source ZIP and exact hash manifest are published.
- Check the GitHub Pages release serves an actual ZIP (HTTP success, correct content type and size); test direct download and reader page separately. The reader retains independent offline ZIP and PDF controls.

**Release status flags** in `source-archive-manifest.json` mean this distribution review and editorial export verification have been satisfied. They **do not** certify a universal reproduction licence for third-party material.
