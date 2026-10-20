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
| Menu visibility / appearance work | No completion or live publisher acknowledgement established by this coordination check. Inspect current master and the relevant task before assuming work is pending or duplicating it. |

### Next upload: one publisher for each overlapping target

**Publisher claim: menu accessibility and Arabic glyph follow-up.** Targets: `daruri/index.html`, `daruri/sw.js`, menu accessibility QA and release records. Base `3c4bfb2a66eaf4fd7dd317d0cab8f7a618498299`, preserving all completed font, menu, lesson-print and Bidāya-link releases. Claimed 2026-10-20 16:15 UTC; expires 16:30 UTC. Scope: a 1pt smaller Arabic toggle glyph, keyboard focus in compact navigation, and header-recovery controls behind modal dialogs. No font files, print data, PDFs or saved packages are being changed.

Previous claim: unclaimed. The self-contained lesson printing release is published and live. Its publisher released the claim at 2026-10-20 16:06 UTC after successful deployment and exact verification of all seven changed live runtime/page assets. No print, PDF or saved-package upload remains active.

Previous publisher record: The English reading typefaces publisher released its claim at 2026-10-20 15:49 UTC after source and live-deployment verification. The earlier saved Usul ZIP/pointer access blocker remains recorded; no saved-package upload is running.

### Queued lesson print-note cleanup

The study-guide/printing chat is preparing the user’s requested removal of manuscript/collation apparatus from lesson handouts. Its local code is ready: `lesson-print.js` keeps 441 study-note records, excludes 187 apparatus/editorial-only records, and makes 17 print-only adaptations so grammar, interpretation and source explanations survive. The full 628-note scholarly corpus is untouched. Endnote numbering and links are being checked across all 84 lesson versions.

**Coordination:** the menu accessibility / Arabic glyph publisher retains its active claim above. The print publisher will merge that completed release before changing `index.html` and `sw.js`; its only reader integration edits are the lesson-print asset URL and cache revision. Please preserve `lesson-print.js`, `print.js`, `print.css`, source data and all completed printing work. The print-note upload will not change fonts, menus, application links, PDFs or saved packages. This is an explicit queued handoff, not a second claim on the current upload.

1. Before uploading, fetch this file and latest `master`. Check whether the intended change is already present. Completed work above needs no further upload.
2. A chat ready to publish should claim its exact overlapping targets here (for example `daruri/index.html` and the Usul reader ZIP), recording its chat/task name, current base commit, UTC claim time and expiry. Use the current file blob SHA when updating the claim: if another claimant wins, reread rather than overwrite it. Allow 15 minutes per claim, renewing only while an operation is actually active. An expired claim does not authorize a stale publisher to continue.
3. Other chats can continue preparing focused changes, but should hand the named publisher a patch or a commit based on its stated base. They should not start another upload of the same full reader or ZIP. Unrelated preparation can proceed in parallel.
4. Immediately before committing, verify both the claim and latest branch head. Merge newer changes and publish with the expected head check; never force-push or replace the live reader from an older ZIP. If a tool times out, check the actual branch/file result before retrying.
5. Publish the combined ready website changes once, then have that same publisher save the matching Usul snapshot and update its pointer once. Reuse unchanged PDF bytes. Record the resulting commit and deployment result here, and release the claim promptly.

For this release, repeated standalone blob uploads of the approximately 3.4 MB reader stalled. A single Git tree request with the large HTML in the tree entry’s `content` and small supporting files referenced by their blob SHAs completed successfully. This is an observed fallback for this repository, not evidence that GitHub’s deployment queue caused the delays.

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

## Completed source-reference work

**Reader Notes-card revision: `daruri7-notes-20261020`.** Main-text source references appear first in the existing Notes card, with source counts beside the opener. The 628 main-text notes are unchanged; 12 clearly scoped application-source notes add to the appropriate passage/application cards. Source text, qualifications, section IDs, PDFs and page maps are preserved. `source-reference-data.js` is generated from the scholarly mappings and included in the page, offline package and service-worker core. The Usul project’s complete website snapshot is identified by `DARURI_CURRENT_READER.txt`; refresh latest `master` before editing it. See [CURRENT_RELEASE.md](CURRENT_RELEASE.md) and `qa/verify-reader-source-notes.js`.

**Current revision: `daruri6-sources-20261020`; artifact validation is complete for the five reading PDFs, study companion and source-note integration.** The central release handoff records the publication commit and subsequent deployed-byte verification. The integration includes current public base `c4958e20dfca358e702570dc1f2f8c23bb9fec89` and preserves its monochrome printing and the earlier `3dafec5db27f4b1ff59eec7e9a92f496055a7a55` study-card footer links.

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
