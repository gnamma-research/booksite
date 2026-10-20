# Darūrī release coordination — 20 October 2026

The user has asked the current Darūrī chats to coordinate site and PDF updates. Use the latest `master` as the shared publication source; make narrow changes and never replace the reader from an older handoff ZIP.

## Shared upload coordination — 20 October 2026, 15:28 UTC

The user has requested coordination because several chats are attempting to upload the same reader. **This Notes/PDF chat has finished publishing and has no upload running. Do not repeat its reader, PDF or Usul ZIP upload.**

### Confirmed publication state

| Work | Confirmed state |
| --- | --- |
| Qur’an/hadith Notes cards | Published in [`89cdd5f`](https://github.com/gnamma-research/booksite/commit/89cdd5fe3e097a6f825af1460de17a5c37561bc9); Pages run [39445052306](https://github.com/gnamma-research/booksite/actions/runs/39445052306) succeeded. |
| Desktop/mobile language order and landscape layout | Published in [`7f5eaef`](https://github.com/gnamma-research/booksite/commit/7f5eaef6977fd25c1e863f4373aef2e43cb37ce8), directly on top of the Notes commit; Pages run [39446189017](https://github.com/gnamma-research/booksite/actions/runs/39446189017) succeeded at 15:12:47 UTC. |
| Usul reader source package | `Daruri_Current_Reader_Website_2026-10-20.zip` is already saved in `/Usul-law-rushd`. Its snapshot is the Notes commit `89cdd5f`; fetch current master for later layout or other changes. |
| Current GitHub deployment queue | At 15:26:53 UTC: zero queued and zero in-progress Actions runs. This does not show another chat’s unfinished local work or API upload calls. |
| Menu visibility / appearance work | Published and live in `c7bf12a` at 17:04 UTC; see the completed compact-navigation and reading-style record below. |

### Next upload: one publisher for each overlapping target

**Publisher claim: Reading Desk implementation chat.** Targets: `daruri/index.html`, `daruri/dictionary.html`, `daruri/reading-desk.js`, `daruri/reading-desk.css`, `daruri/reading-desk-dictionary.js`, `daruri/sw.js` and focused QA/release notes. Based on current master after the Visuals and five-PDF structure releases. Claimed 2026-10-20 19:07 UTC; expires 19:22 UTC. This publisher is preparing the approved local Reading Desk bookmark/notes/bin/transfer/share/print feature and will preserve other releases. No PDF or Usul ZIP replacement.

Previous claim: unclaimed. The icon-led Visuals refinement is published in `df4563ee43e50296fbf0bd0863fe3643b560c121`; GitHub Pages run [39480333437](https://github.com/gnamma-research/booksite/actions/runs/39480333437) completed successfully at 19:05 UTC. The font/design publisher releases its claim here. New work must start from current master and preserve the Visuals panel, the newer homepage/contents/subject-index structure, and the rebuilt five-PDF release.

Previous publisher record: The contents, subject index and five-PDF structure release is published and verified live. This study/contents publisher released its claim at 2026-10-20 18:03 UTC. New work must preserve its rebuilt page maps, current Ar/En labels, subject assets and heading hierarchy.

Previous publisher record: The Arabic toggle ink-fit correction is published and live. Its publisher released the claim at 2026-10-20 16:53 UTC after successful deployment and live outline/state verification. The queued compact menu/reading-style publisher can now merge current master and publish its approved work, preserving this glyph correction. No menu/navigation upload remains active.

Previous publisher record: The Arabic toggle and menu accessibility follow-up is published and live. This publisher released its claim at 2026-10-20 16:20:52 UTC after live browser and deployment verification. The queued study-note cleanup can now publish from latest master; no menu upload remains active.

Previous claim: unclaimed. The self-contained lesson printing release is published and live. Its publisher released the claim at 2026-10-20 16:06 UTC after successful deployment and exact verification of all seven changed live runtime/page assets. No print, PDF or saved-package upload remains active.

Previous publisher record: The English reading typefaces publisher released its claim at 2026-10-20 15:49 UTC after source and live-deployment verification. The earlier saved Usul ZIP/pointer access blocker remains recorded; no saved-package upload is running.

### Icon-led Visuals controls — completed, 20 October 2026

**Published:** [`df4563e`](https://github.com/gnamma-research/booksite/commit/df4563ee43e50296fbf0bd0863fe3643b560c121); [Pages run 39480333437](https://github.com/gnamma-research/booksite/actions/runs/39480333437) succeeded at 19:05 UTC. Runtime/cache revision: `20261020-visuals1`.

The enhanced appearance dialog is now **Visuals**. The word Visuals remains fixed in the header; the space beside it reports the last selected category and option while the dialog is open. Page style, Arabic font, English font and palette are direct icon/specimen buttons rather than visible dropdowns. Text size stays **A− / percentage / A+**. Page layout keeps the responsive Arabic-left/right or Arabic-above/below diagrams. The palette category uses an artist’s-palette icon; the page-style and page-layout rows use dedicated page/layout line icons. Direct option buttons deliberately omit `title` tooltips and retain accessible names.

Arabic font specimens use the actual installed Amiri, Scheherazade New and Noto Naskh Arabic faces while the left Arabic category marker remains fixed. English choices are now **Original**, **Source Sans 3** and **Lexend**, using self-hosted official Google Fonts files so the three specimens and reading faces are visually distinct. Existing saved preference keys are retained for backward compatibility. The duplicate System / Light / Dark row is hidden from Visuals; the existing main appearance control remains authoritative. The no-JavaScript fallback retains its theme controls because that top-level scripted control is unavailable there.

Focused asset versions, service-worker entries and the Complete package include the Visuals controller and current font files/licences. The standalone historical dictionary uses the same saved English font preference through the shared stylesheet. The commit does **not** alter any reading PDF, scholarly text, Notes records, study data, homepage/source prose, subject-index data or contents hierarchy. Commit inspection confirms the changed paths are limited to appearance/runtime/font/offline/QA assets.

Static validation confirms three page-style, three Arabic-font and three English-font direct choices, the palette and layout icons, no visible duplicate theme group, current asset versions, main-reader JavaScript syntax, Visuals-controller syntax and offline asset wiring. The committed index blob is `e1edc6a6f677831933843654b62f3d069cd35824`; compact Visuals CSS `75d475871c7efbbccd1307b7c86927e328401cfb`; controller `29df00cd7990b04c06e89415c35b894b243af719`. A full physical-device visual pass is not claimed.

### Concise homepage and source explanation — completed, 20 October 2026

**Published and live:** [`bfb6127`](https://github.com/gnamma-research/booksite/commit/bfb6127b95ea3484a1ce1c779c20b8dc50ac6c07); [Pages run 39475729350](https://github.com/gnamma-research/booksite/actions/runs/39475729350) succeeded. The reader, service worker and Complete package script all returned HTTP 200 and matched the committed Git blobs. Runtime revision: `20261020-home1`.

Enhanced and native Home views now briefly describe the work, current study/navigation/bookmark features, all five PDF editions, self-contained lesson printing and font/colour choices. The architectural palettes are described as inspiration and the later Nasrid period is distinguished. A short source summary explains al-ʿAlawī’s base and Bou Akl’s selected corrections. About adds primary edition links, mediated Escorial MS 1235 evidence and the historical/technical dictionary basis of the AI-assisted translation. It no longer claims unimplemented personal notes. The long production checklist is replaced by the concise introduction.

Actual reader checks passed for the home route, all six palette choices and selection, all five PDF links, Contents/Study/Subject index/Dictionary/Bookmarks/About navigation, the manuscript explanation and resume to §49. All 259 section records are present; exact comparison confirms no changes outside Home/About and the specified style/version edits. PDFs, main text, notes and study data are unchanged. See `qa/home-introduction-release-20261020.json`. No new physical-device visual test is claimed. Other chats should merge from this release before publishing overlapping reader/cache assets.

### Subject index and contents print follow-up — completed, 20 October 2026

**Published and live:** [`28f2338`](https://github.com/gnamma-research/booksite/commit/28f2338fd64bcfcd6476059bbc12cab1ad95622f); [Pages run 39472504421](https://github.com/gnamma-research/booksite/actions/runs/39472504421) succeeded. All seven changed public reader/runtime/style files returned HTTP 200 and matched the tested bytes. Cache/runtime revision: `20261020-indexprint1`.

The new subject browser had a real print gap: closed groups and index records omitted their subtopics. A module-owned beforeprint/afterprint cycle now expands only the current matching result set and restores disclosures, saved preferences, question/filter/view, focus and page/nested scroll. Queued print-only toggle events cannot overwrite the user's choices. Monochrome print rules make subtopics pageable, suppress unused controls/markers and reveal the native fallback entries. Contents printouts also hide mode-selection controls while retaining the selected guide's heading and explanation. Matching reader, dictionary, service-worker and Complete package asset URLs are published together.

Focused print/cancel checks, the full-reader subject-index integration and all eight contents groups pass. All 63 offline bundle source files exist, and explicit runtime versions plus default current-PDF versions are verified. Reader/dictionary text was preserved byte for byte apart from asset URLs; the five PDF hashes remain unchanged. Historical release statements now explicitly identify old pagination and snapshots. The standalone Historical Lexicon is not a linked public download, so no stale supplementary PDF was replaced. See `qa/index-print-live-release-20261020.json`. These are runtime and deployed-byte checks; no new physical-device or live visual print test is claimed.

### Contents, subject index and PDF structure — completed, 20 October 2026

**Published and live:** [`52ee8a1`](https://github.com/gnamma-research/booksite/commit/52ee8a18952304b8315770e0c7822e2a02840662); [Pages run 39471054037](https://github.com/gnamma-research/booksite/actions/runs/39471054037) succeeded. All 15 changed public reader/PDF/assets returned HTTP 200 and matched the tested bytes, including all five PDFs. Page counts are now **243 reference / 131 study / 97 English / 73 Arabic / 69 vowelled Arabic**. Recorded contents is one page in every edition; the first three also have four compact pages of explicitly editorial section titles. The website has collapsible source/editorial contents, source-first reader headings, subject/A–Z index browsing and the index before the dictionary. All 565 static and 259 dynamic PDF destinations are remapped. All 84 self-contained lesson printouts, all 259 reader source-note routes, exact index/application returns, source/corpus, language, Focus and compact-menu gates pass. Current Ar/En controls and the unchanged 85-page study companion are preserved. See `build/release/` and `qa/structure-live-release-20261020.json` for verification.

The latest user request asks for a deep investigation of original parts/chapters, subject-index groupings and placing the dictionary after the academic index. The completed [audit and concrete design recommendation](qa/CONTENTS_AND_SUBJECT_INDEX_AUDIT_2026-10-20.md) uses current master `6d7025a` and all five actual reading PDFs. The audit describes the pre-redesign baseline; the implementation approved in the subsequent user request is completed in the release above.

The audit validated the existing 46-heading parent map. At that earlier baseline, the original-contents tree was always expanded, source rubrics did not govern PDF bookmarks, and only the scholarly PDF had detailed source-heading contents. **Those defects are corrected in the completed release above.** Its four-part structure, safe boundary cases, eight subject groups, index-before-dictionary order, Arabic navigation and rebuilt page maps are now the integration baseline. Preserve these changes alongside the compact-menu, font, source-note and study-print releases. The topic groups remain editorial browsing aids, not new authorial chapters.

### Lesson print-note cleanup — completed 20 October 2026

**Published and live:** [`5fca4e2`](https://github.com/gnamma-research/booksite/commit/5fca4e28c7be9eeb5606f7a05e653a85a15a46cd). [Pages run 39456749409](https://github.com/gnamma-research/booksite/actions/runs/39456749409) succeeded at 16:22:23 UTC. The release integrates the completed menu/accessibility and Arabic-glyph update (`8a466ee`), Bidāya application links (`f2d4286`) and current font/printing work. The other publisher’s released claim and queued handoff were respected before the combined upload.

Lesson printouts omit 187 manuscript/collation/editorial-only note records and select from 441 study records, keeping all grammar, Qur’an/hadith source, interpretation and scholarly-context records. Seventeen mixed records receive print-only trims or vocabulary explanations. Full Arabic/English readings, source qualifications, selected fonts and monochrome layout remain. The canonical 628-note scholarly corpus, screen Notes cards, downloadable PDFs and saved packages are unchanged.

Verification: all 84 lesson print cases pass, including complete bilingual readings, useful-note retention, excluded apparatus, consecutive numbering, resolved note calls/references and exact screen-state restoration; heading/language/focus gates also pass. All five changed source-file hashes match tested local files. The deployed `index.html`, `lesson-print.js` and `sw.js` each returned HTTP200 and matched byte for byte. Cache/asset revision: `20261020-studynotes1`. No duplicate print/PDF upload is needed.

1. Before uploading, fetch this file and latest `master`. Check whether the intended change is already present. Completed work above needs no further upload.
2. A chat ready to publish should claim its exact overlapping targets here (for example `daruri/index.html` and the Usul reader ZIP), recording its chat/task name, current base commit, UTC claim time and expiry. Use the current file blob SHA when updating the claim: if another claimant wins, reread rather than overwrite it. Allow 15 minutes per claim, renewing only while an operation is actually active. An expired claim does not authorize a stale publisher to continue.
3. Other chats can continue preparing focused changes, but should hand the named publisher a patch or a commit based on its stated base. They should not start another upload of the same full reader or ZIP. Unrelated preparation can proceed in parallel.
4. Immediately before committing, verify both the claim and latest branch head. Merge newer changes and publish with the expected head check; never force-push or replace the live reader from an older ZIP. If a tool times out, check the actual branch/file result before retrying.
5. Publish the combined ready website changes once, then have that same publisher save the matching Usul snapshot and update its pointer once. Reuse unchanged PDF bytes. Record the resulting commit and deployment result here, and release the claim promptly.

For this release, repeated standalone blob uploads of the approximately 3.4 MB reader stalled. A single Git tree request with the large HTML in the tree entry’s `content` and small supporting files referenced by their blob SHAs completed successfully. This is an observed fallback for this repository, not evidence that GitHub’s deployment queue caused the delays.

## Compact navigation and reading styles — completed, 20 October 2026

**Published and live:** [`c7bf12a`](https://github.com/gnamma-research/booksite/commit/c7bf12ab9e7f4e964ec0a308ff750f2b0e9780bf). [Pages run 39462643746](https://github.com/gnamma-research/booksite/actions/runs/39462643746) succeeded at 17:04:01 UTC. The user explicitly authorized this scope at 16:33 UTC. Publication waited for the other chat's claim to be released, merged its Arabic-toggle ink-fit correction from `948be5a`, and used the latest master plus an expected-head check. The corrected `languageButtons()` function and complete glyph-containing style block were preserved byte for byte.

The seven principal destinations remain direct ordinary menu items, including Saved passages without extra prominence. Home and About remain in the footer; Jump to part and Downloads are closed native disclosures. Type & appearance now has one compact Quiet reading / Book page / Structured page selector, compact size/font rows, always-visible responsive Arabic/English layout diagrams with accessible names, and expanded System/Light/Dark plus all six visual palettes. Menu sample/Preview text is removed. Amiri + Original remain the default faces; existing saved choices are retained. Notes availability and state are independent of the selected style. New assets are included in the offline cache and browser-generated Complete package (ZIP).

Validation: ten compact-menu/style groups, glyph geometry, nine language cases, 11 menu-accessibility groups, 128 navigation cases plus nine exact reading returns, Focus 0–3, heading/corpus (259 sections / 416 passages), ten application-link groups, all 84 study and lesson-print variants, 28 study reading/return sequences and all 259 section Notes/source checks pass. The seven affected gates were rerun after the glyph merge. Static scholarly content, Notes records, study content, print behaviour and current PDF bytes are preserved.

All nine changed committed-file hashes match the tested local files. All six deployed reader/runtime/style files (`index.html`, `compact-menu.css`, `reading-styles.css`, `reading-styles.js`, `download-bundle.js`, `sw.js`) returned HTTP 200 and matched byte for byte at 17:04 UTC. Browser visual verification was unavailable because the connected browser could not initialize; no screenshot or physical-device visual pass is claimed. Cache/asset revision: `20261020-menu1`. No PDF was regenerated and no saved Usul-package upload was attempted; the prior saved-package access limitation remains recorded.

Approved scope: retain direct Read the text, Contents, Study guide, Dictionary, Academic index, Bidāya applications and Saved passages destinations; collapse Downloads and Jump to part/Quickly continue; provide Quiet reading / Book page / Structured page through one compact Page style selector; retain the three Arabic and three English font choices with Amiri + Original defaults; remove menu sample/Preview text; keep Page layout visible with responsive Arabic/English position glyphs and accessible labels; keep existing colours expanded as visual palettes. Style changes must preserve notes availability/state, font/palette settings, independent column/stack language order, exact reading returns, print and recent accessibility/source updates. This supersedes the earlier preview-only proposal and its Text & notes label.

This approved scope is now complete. Other chats should preserve the released controls and styles when making focused changes from latest master. The publication claim is released; existing PDFs and completed releases remain current.

## Self-contained lesson print release — 20 October 2026

**Published and live:** [`d6f320e`](https://github.com/gnamma-research/booksite/commit/d6f320ee4e405c50ccba74100933e4421dc9dfce). [Pages run 39454086832](https://github.com/gnamma-research/booksite/actions/runs/39454086832) succeeded at 16:04:49 UTC. Preserves the menu/navigation release `e68fb88`, both font selectors, source-note cards, language order and current PDF editions.

All 84 lesson versions now print full assigned Arabic and English passages, supplementary explicitly referenced sections, complete relevant endnotes (including grammar and source references), key terms, tasks, feedback and editorial Bidāya case summaries. Eight Advanced lessons have labelled print-only offline task adaptations or local alternatives. Added source content is generated only for printing and removed afterwards; screen lesson content stays unchanged. The selected Arabic/English faces and monochrome layout are retained, with readable Arabic in notes. `lesson-print.js` is included in the offline bundle and cache `20261020-lessonprint1`.

Verification: all nine changed committed file hashes matched tested local files. All seven deployed page/runtime assets returned HTTP 200 and matched byte for byte, including the large reader. All84 completeness/state-restoration checks and current reader/menu regression gates pass. Four rendered print samples (Purpose/Basic, Transmission/Intermediate, Transmission/Advanced, Meaning/Intermediate) contain complete paired source text and numbered endnotes; all pages are grayscale and text stays within page bounds. This is offline PDF rendering plus live-byte validation, not a physical-phone print-dialog test. No downloadable reading PDF or study companion was regenerated; the new packets are produced by Print this lesson/browser printing. No saved Usul-package upload was attempted.

## English reading typefaces release — 20 October 2026

**Published and live:** [`6d431dc`](https://github.com/gnamma-research/booksite/commit/6d431dca575243e05e023548bc2095012cff5b5b). [Pages run 39451749601](https://github.com/gnamma-research/booksite/actions/runs/39451749601) succeeded at 15:48:40 UTC.

Type & appearance now offers Original (default), Source Serif 4 and Literata beside the Arabic choices. New readers start with **Amiri + Original**. Each language has an independent saved preference and preview; Original preserves the reader's native serif stack. Optional English fonts include normal/italic variable forms, with local assets, licences and provenance. Prose choices carry through notes, dictionary translations, study text and browser printing, with native fallback controls. Interface/title fonts stay independent.

Verification: 16 committed file hashes match the prepared change. All 11 changed runtime, stylesheet and font assets were fetched from the live site and matched exact local bytes; the four new fonts are served as `font/woff2`. Existing heading/language/focus gates and 38 focused behavior checks pass. Same-frame and separate-frame font changes preserve the first visible passage in controlled geometry checks. Physical-phone/browser visual testing is not claimed. The earlier Notes, language-layout, Arabic font and PDF releases are retained.

The saved Usul ZIP/pointer was not rewritten: the preceding authenticated saved-file access blocker remains unresolved. The canonical published source is on GitHub. Do not repeat the completed reader/font upload.

## Arabic typeface release — 20 October 2026

**Published and live:** [`04a4faf`](https://github.com/gnamma-research/booksite/commit/04a4fafc6b9a5c87eb49d4700ce4fa61cde01dcd), based on the current Notes and layout releases plus the shared upload coordination. [Pages run 39449359301](https://github.com/gnamma-research/booksite/actions/runs/39449359301) succeeded at 15:33:01 UTC.

The existing Type & appearance panel now offers Amiri (default), Scheherazade New and Noto Naskh Arabic, with a preview and a saved reader preference. Six full-repertoire local font files cover regular and bold; selection also applies to the standalone dictionary and browser printing. Offline assets and caches were updated. Scholarly text, navigation, source notes, PDFs and their maps are retained.

Verification: all 19 committed file hashes match the prepared change; all 13 deployed runtime, stylesheet and font files match local bytes, and the six fonts are served as `font/woff2`. The existing heading/language/focus gates and 20 focused preference/loading/race checks pass. Browser visual rendering and a physical-phone check were not performed.

**Saved-package status:** the matching source snapshot is available from the pinned GitHub commit. Updating `/Usul-law-rushd/Daruri_Current_Reader_Website_2026-10-20.zip` and `DARURI_CURRENT_READER.txt` could not proceed because authenticated saved-file access failed. Both existing saved files remain unchanged. A future publisher should refresh them from the latest master through the normal authorized file route; do not repeat the completed reader/font upload.

## Historical source-reference publication and preserved content

The source-note policies and corpus counts below remain applicable. The PDF counts and contents-page locations describe the earlier citation release; use **`daruri8-structure-20261020`** and the current manifest for the latest files and page destinations.

**Reader Notes-card revision: `daruri7-notes-20261020`.** Main-text source references appear first in the existing Notes card, with source counts beside the opener. The 628 main-text notes are unchanged; 12 clearly scoped application-source notes add to the appropriate passage/application cards. Source text, qualifications, section IDs, PDFs and page maps are preserved. `source-reference-data.js` is generated from the scholarly mappings and included in the page, offline package and service-worker core. The Usul project’s complete website snapshot is identified by `DARURI_CURRENT_READER.txt`; refresh latest `master` before editing it. See [CURRENT_RELEASE.md](CURRENT_RELEASE.md) and `qa/verify-reader-source-notes.js`.

**Historical citation revision: `daruri6-sources-20261020`; artifact validation was completed for the five reading PDFs, study companion and source-note integration.** The central release handoff records that publication and its deployed-byte verification. The integration included then-current public base `c4958e20dfca358e702570dc1f2f8c23bb9fec89` and preserved its monochrome printing and the earlier `3dafec5db27f4b1ff59eec7e9a92f496055a7a55` study-card footer links.

- **Citation policy and reading PDFs:** Qur’an source footnotes appear in all five editions; hadith source references appear only in the scholarly edition. Page counts are **254 scholarly / 139 bilingual study / 105 English / 80 Arabic / 76 fully vowelled Arabic**. The scholarly main-text apparatus contains **628 notes** (542 previous notes, with 22 mixed notes split while retaining commentary, plus 53 Qur’an and 33 hadith source notes). The bilingual study edition contains **121 distinct footnotes**. Keep `daruri.pdf` as the default target for reader and heading links.
- **Text and contents:** retain **259 section records, 416 aligned passages, 157 full-headword articles and 153 term dossiers**. Original headings remain 46 source records and editorial titles remain 258 navigation descriptions. In the scholarly PDF, the original-heading list is now on **pp. 4–5** and editorial section titles begin on **p. 6**. The rebuilt pages require **565 static destinations** (306 contents and 259 heading-popup links) and **259 dynamic page values** to be rederived by stable section ID from verified build metadata.
- **Study guide:** retain 28 questions × Basic (Foundations), Intermediate (Close Reading), and Advanced (Research), arranged into eight teaching units. Source: `daruri/study/lessons-*.json`; runtime: `study-guide-data.js`, `study-guide.js`, and `study-guide.css`. The separate **85-page** `daruri-study-guide.pdf` companion is generated from those same 84 lesson versions. Its source update adds Qur’an 12:82 for “Ask the village” and 17:23 for “Uff” as numbered same-page footnotes on companion pp. 57 and 65, with matching local source notes in the website’s enhanced and no-JavaScript examples. PDF metadata, retained lesson fields, links, bookmarks and source-note integration checks pass. This companion is distinct from `daruri-study.pdf`. Preserve the current study-card links and shared `print.css`/`print.js` preparation/restoration behavior.
- **Canonical release and central copies:** use [CURRENT_RELEASE.md](CURRENT_RELEASE.md), [pdf-editions-manifest.json](pdf-editions-manifest.json), `build/build_editions.py`, `build/update_release.py`, and `build/data/` on current `master`. Central Usul project copies should use the same stable filenames and match the published manifest hashes. The standalone Historical Lexicon is a separate companion and central update; it is not a sixth reading edition. Earlier printed-source, private Bou Akl and manuscript-evidence qualifications remain in force.

## Integration contract

1. Fetch latest `master` immediately before publishing. Reapply focused edits on top of any newer contents/PDF changes; do not force push.
2. If the reference PDF changes, remap all static and dynamic `pdfPage` destinations by stable reader section IDs, including heading popups. A uniform page offset is insufficient.
3. Study lesson links use `#study?topic=<stable-id>&level=basic|intermediate|advanced`; reader section anchors remain stable as `#section=<number>`.
4. The study companion must be generated from the shared lesson JSON so website and PDF explanations, tasks and feedback agree. Keep authorial text, editorial explanations, reported positions and research assignments distinct.
5. Update both five-edition download panels, the download ZIP, PDF metadata and service-worker assets together. When the study companion changes, verify its bytes against `study/companion-metadata.json` and refresh its manifest and PDF/data/runtime cache URLs. Preserve newer independent stylesheet and print asset versions when merging cache changes.
6. Run the existing heading, language and focus checks plus new guide checks, then verify the actual GitHub Pages URLs and PDF downloads.

The current source-reference checks are recorded in [qa/source-reference-release-20261020.json](qa/source-reference-release-20261020.json). Release documentation must distinguish local checks from publication and actual GitHub Pages verification.

## Historical study-guide publication

The earlier study-guide release included all 28 questions at all three levels and an 85-page companion built from the same JSON sources. Its publication was independent of the then-separate contents/PDF work, and retained the five reading PDFs with their checksums and section destinations. Initial implementation baseline: `9071d49a584e807b7000a7446843d4da2e9aa92b`; the coordination note from `6a2fd23` was merged before publication in `e5e44918994cfa568553f3af6fbc68b045417a9c`.

Validation: all 84 lesson renders, 28 assigned-reading sequences and returns, feedback/scroll restoration, level-specific progress, filter/search navigation, print/share behavior, reader preferences, and malformed/direct URLs; existing heading, language and focus checks; all 258 reference-PDF destinations; full PDF content/link/bookmark verification and rendered layout review. Guide companion build provenance is in `study/companion-metadata.json`.

The other chats’ original-versus-editorial contents changes were not yet committed at that historical integration point. They were incorporated in the subsequent contents release below; this paragraph is not an outstanding task. Later releases must preserve the guide and use its shared source files.

## Historical contents integration

The contents integration was published in `27213bbeeb8f4a04a29f1862261b938721a48688`. This documentation update adds [CURRENT_RELEASE.md](CURRENT_RELEASE.md) as the detailed release record and [qa/ORIGINAL_HEADINGS.md](qa/ORIGINAL_HEADINGS.md) as the evidence for the 46-heading source hierarchy. It separates that hierarchy from all 258 editorial section titles in both reader modes, retains ancestors when filtering, and preserves reading returns and toggle focus. The published study-guide release `e5e44918994cfa568553f3af6fbc68b045417a9c`—84 lesson versions and its 85-page companion—is retained.

At that integration stage, the separately requested PDF contents regeneration was still pending and the five reading PDFs remained the daruri4 baseline. The following patch completed it. All workstreams may update reader or PDF content where their task requires it; these records coordinate merges and do not freeze files. Revised PDFs must accompany their section-based physical-page maps, manifest, download package and matching cache URLs.

### Earlier contents patch — completed before the citation rebuild

The contents/PDF chat integrated the published study guide (`e5e4491`) and the other upload chat’s original-heading hierarchy (`27213bb`). Both implementations are retained. The website now explicitly says “Two contents lists, one text”, labels the tabs “Original headings · 46” and “Editorial section titles · 258”, and remembers the selected view. The source-heading hierarchy and contextual return behavior remain intact.

That earlier patch corrected all five reading PDFs. Its reference had 261 pages: a restored 46-heading contents list was appended on pp. 260–261 and linked from the front, while the existing detailed contents on pp. 3–6 were labelled editorial. Short lists in every edition were labelled as overviews. The other four page counts were 129/98/81/92. Existing body page addresses were preserved, so that patch did not require section remapping. Its manifest, five PDF cache versions and offline bundle were updated together. These historical page counts and destinations are superseded by the citation rebuild above.

Verification of that contents patch: 6,823 existing PDF links and 1,693 bookmarks retained their exact destinations; 646 unchanged pages had identical extracted text; all 15 changed/new pages were rendered and inspected. New internal links and the heading, language, focus and 84-lesson guide checks passed. Its reproducible patcher and audit remain in `qa/clarify_pdf_contents_20261020.py` and `qa/pdf-contents-audit-20261020.json`. Future edits should use the current canonical manifest and build sources, retaining the two contents systems; historical patch bytes and older ZIPs do not replace current `master`.

### Concurrent study and print corrections retained

`3dafec5db27f4b1ff59eec7e9a92f496055a7a55` made all 84 study-card footer destinations usable links, with accessible question labels and 44-pixel minimum tap targets. `c4958e20dfca358e702570dc1f2f8c23bb9fec89` added shared monochrome browser printing for reader, study, contents/reference and standalone dictionary views, including disclosure preparation and restoration and level labels on printed lessons. The citation integration retains both corrections and the print assets in the offline bundle and service worker. The final study/print QA passes with both source-note calls, unchanged lesson routes, enhanced and no-JavaScript source notes, print preparation/restoration, all 84 lesson renders and the existing reading-return checks. Verify publication separately.


## Menu visibility and sizing — completed 20 October 2026

Published in [`e68fb88`](https://github.com/gnamma-research/booksite/commit/e68fb885599313d5fb79c002b02239fc679f38cf). [Pages run 39453282052](https://github.com/gnamma-research/booksite/actions/runs/39453282052) succeeded at 15:58:57 UTC. The final source was merged over the completed English/Arabic fonts, Notes and language-order releases; unchanged source and font assets are retained.

Menu, Search, Appearance and Display remain visible across reference views. Reading-specific language/actions/Focus controls are scoped to reading; saved reading Focus/header choices no longer hide reference navigation. A shared responsive toolbar size resolves conflicting button dimensions. The standalone dictionary has an eight-destination site menu.

Verified: 128 runtime route/mode/header/viewport cases and nine exact-reading-return cases, plus existing focus, heading/corpus and language gates. The committed reader, dictionary and new QA hashes match the tested local files. Live browser confirmed four equal 38×38 toolbar buttons on Academic index; persistent Study guide toolbar; Display dialog with both font groups; return to §49 with all ten visible reader buttons equal 38×38; and the historical dictionary menu opening and navigating to Study guide. Mobile state logic is covered; physical iPhone visual testing is not claimed. This task did not rewrite the Usul saved ZIP or PDFs. No repeat menu upload is needed.


## Bidāya application prose links — completed 20 October 2026

Published in [`f2d4286`](https://github.com/gnamma-research/booksite/commit/f2d4286b767d7eb7aeb266b8695c79478f743589). [Pages run 39455150826](https://github.com/gnamma-research/booksite/actions/runs/39455150826) succeeded at 16:11:27 UTC. The final source retains the published font choices, language order, menu/navigation repair and self-contained lesson printing. The live reader and service worker both return HTTP 200 and match the exact tested Git blob hashes (`3aa79a4611a3688e3ad76f03bd98baaa331499a6` and `1bd52ee847ae56efebfc79dcc0a8b10535247363`).

Explicit section references inside Bidāya summary prose are clickable across application lists, detail windows, reader callouts and mobile popups; both native fallback presentations also have section links. All 28 summaries retain their original text; the 11 cited summaries contain 14 printed section-number links per presentation, including both endpoints of ranges. The contextual Back button returns to the same application window with its underlying reading/list/study context, filters, scroll and focus restored, including same-section and nested returns. Primary and related-section buttons inside the windows share that return behavior.

Verification: all ten `qa/verify-application-links.js` runtime groups pass with the actual reader and exact core/study data, including native modified clicks, filtered detail returns, Next navigation, mobile and inline cards, direct application URLs, nested Contents/application returns, dictionary context and an actual study lesson. Heading/navigation, language-cycle and Focus checks also pass with 259 sections and 416 passages preserved. Geometry is controlled in JSDOM; this is navigation and scroll-state verification, not physical-device visual testing. Offline cache revision is `20261020-apprefs1`; newer print/font/data asset URLs are retained. This task does not replace PDFs or the saved Usul package.


## Arabic toggle and menu accessibility — completed 20 October 2026

Published in [`8a466ee`](https://github.com/gnamma-research/booksite/commit/8a466ee7a1c9ba84cf3492f4fc5ac1b673010aa5). The following coordination-only commit `5c58c18` triggered [successful Pages run 39456257799](https://github.com/gnamma-research/booksite/actions/runs/39456257799), completed at 16:19:00 UTC; it includes the same verified reader change. The earlier run for the source commit was superseded by this documentation deployment.

The Arabic toggle glyph is exactly 1pt smaller throughout its responsive scale; the button retains the common toolbar dimensions. Compact navigation now contains keyboard focus, makes the surrounding page inert, restores the opener on close, and focuses the main pane on navigation. Ordinary dialogs close the drawer consistently, preserve its opener, and keep the header-recovery controls below their backdrop and inert.

Validation: all 11 focused menu accessibility groups, all 10 Bidāya application-return groups, 128 reference-navigation cases plus nine reading-return cases, and existing heading/corpus, language and Focus gates pass. Committed reader and QA bytes match the tested files. Live browser measured the Arabic glyph changing from 24px to 22.6667px inside the same 38×38 button, with line box height reduced from 28.078px to 26.516px. Live Display dialog verified inert main/shell/recovery controls, Shift+Tab containment, Escape closure and restored focus. Physical iPhone rendering is not claimed. All newer font, lesson-print and Bidāya-link changes are retained. Cache revision: navigation2. No repeat menu or glyph upload is needed.


## Arabic toggle ink-fit correction — completed, 20 October 2026

**Published and live:** [`948be5a`](https://github.com/gnamma-research/booksite/commit/948be5a7c378a63f8a399f652fe364f48505bf29). [Pages run 39461135330](https://github.com/gnamma-research/booksite/actions/runs/39461135330) succeeded at 16:52:11 UTC. This supersedes the earlier 1pt-only glyph adjustment. The correction is based on current lesson-note source `a90009b21` and preserves the font/design chat’s queued, approved compact-menu work.

The Arabic button now uses the existing Amiri ayn and fatḥa as inline outline paths with a shared padded viewBox. Actual ink lies at y=3..21 in a 24-unit square; the base letter stays fixed when the accent toggles. The SVG has explicit responsive pixel dimensions and no font-dependent text layout, so reading-font selection, fallback fonts, baseline metrics and text autosizing cannot make the letter protrude. The common button size and all three language states remain intact.

Verification: the new geometry QA evaluates actual quadratic-curve extrema and every button size from 24 to 38px in 0.25px steps, retaining at least 4.250px clearance inside a hypothetical 1px border. All nine language transitions, 128 reference-navigation cases plus nine exact reading returns, and existing Focus/corpus/inline-syntax checks pass. All four committed file hashes match tested local files. Live browser verified the new outlined glyph, 26px SVG inside a 38px button, actual ink bottom clearance of 9.25px for both plain and vowelled states, and a working off → plain → vowelled cycle. The vowelled union has equal 9.25px top/bottom clearance. Physical iPhone testing is not claimed.

Changed runtime files: `daruri/index.html`, `daruri/sw.js`; cache revision `20261020-arabicfit1`. New `qa/verify-arabic-toggle-geometry.js` and adjusted `qa/verify-language-cycle.js` protect the geometry and state semantics. The queued compact-menu publisher should keep the inline paths and their dedicated CSS, run both QA checks on its merged reader, and retain the uniform toolbar-size contract. No PDFs or saved packages were uploaded.


## Matching Ar / En language labels — completed, 20 October 2026

Published in [`896bd3c`](https://github.com/gnamma-research/booksite/commit/896bd3c9c4ca95c6c2fe6ab5259c3ee38775a729). [Pages run 39468284065](https://github.com/gnamma-research/booksite/actions/runs/39468284065) status: completed; conclusion: success. The user explicitly requested replacement of the Arabic letter with `Ar` and English with `En` (capital initial, lowercase second letter), superseding both earlier outline revisions and the pending bold-glyph proposal.

Both visible labels now use a single shared rule with the same sans typeface, responsive size, weight600, line-height1, opacity1 and exact casing. The old outlined glyph and its font/size/opacity rules are removed. Existing Arabic off/plain/vowelled semantics, accessible names, English visibility, uniform button dimensions and the completed compact-menu/reading-style release are retained. Cache revision: `20261020-language-labels1`.

Verification: all nine language transitions and six language/vowelling renderer combinations pass; inline reader JavaScript parses; committed reader and QA hashes match the tested files. Live browser confirmed actual `Ar` and `En` labels with identical Inter14px, weight600, line-height14px and opacity1 inside matching38×38px buttons; both labels were visually inspected together. The historical geometry-QA entrypoint now checks text-label consistency so shared release checks continue to work. No PDF or saved-package upload was performed.
