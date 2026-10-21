# Darūrī — current release and coordination record

Updated 20 October 2026. Read the shared [active release coordination note](DARURI_RELEASE_COORDINATION_2026-10-20.md) alongside this record, [the PDF manifest](pdf-editions-manifest.json), and the latest `master` source when integrating parallel work. The current reading-PDF release is **`daruri8-structure-20261020`**, described first below. Later sections preserve release history; their earlier page counts, layouts and snapshot identities must not be used as the current baseline.

Canonical repository: `gnamma-research/booksite`, branch `master`.

Canonical reader: [https://gnamma-research.github.io/booksite/daruri/](https://gnamma-research.github.io/booksite/daruri/).

## Concise homepage and edition sources — `20261020-home1`

**Published and live:** [`bfb6127`](https://github.com/gnamma-research/booksite/commit/bfb6127b95ea3484a1ce1c779c20b8dc50ac6c07). [Pages run 39475729350](https://github.com/gnamma-research/booksite/actions/runs/39475729350) succeeded. All three changed public assets returned HTTP 200 and matched the committed Git blob hashes. Actual reader checks passed for Home, all six colour choices and selection, five PDF links, six destination routes, the About statement and resume to §49.

The Home view now briefly describes Ibn Rushd’s work, Arabic/English reading, three study levels, the Subject index, historical Dictionary, section bookmarks, five PDF editions and self-contained lesson printouts. Font, text-size, Focus and architectural colour choices are described without claiming a historically reconstructed palette. The enhanced and native home views share the same introduction; the palette chooser is a compact disclosure.

The Arabic-source summary identifies al-ʿAlawī’s 1994 edition and selected consequential corrections from Bou Akl’s 2015 critical edition. About identifies Escorial MS 1235 evidence as mediated through Bou Akl’s apparatus and distinguishes manuscript support from conjecture. The translation account names grammatical/contextual checking and historical/technical dictionaries while retaining the AI-assistance disclosure. The stale personal-note claim, old home counts and long production checklist were removed from the introduction. Source links are available in About.

Validation: both inline JavaScript blocks and the changed service worker/package script parse; isolated Home/About renders preserve saved-section resume, five current PDF links and the palette initializer; native destinations exist. Exact comparison confirms all source outside Home/About and the listed style/version updates is unchanged. Reading PDFs remain `daruri8-structure-20261020`. Runtime revisions are coordinated in the reader, service worker and Complete package. See `qa/home-introduction-release-20261020.json`. The same record includes successful live deployment and actual reader checks.

## Index and contents printing follow-up — `20261020-indexprint1`

**Published and live:** [28f2338](https://github.com/gnamma-research/booksite/commit/28f2338fd64bcfcd6476059bbc12cab1ad95622f). [Pages run 39472504421](https://github.com/gnamma-research/booksite/actions/runs/39472504421) succeeded. All seven changed public reader/runtime/style files returned HTTP 200 and matched the tested bytes; see [the live verification record](qa/index-print-live-release-20261020.json).

The subject index now prints all subtopics and section references in the current By subject or A–Z result set, including entries that are collapsed on screen. Printing retains the selected search, filter and question. Closing or cancelling print restores the exact disclosures, preferences, focus, page scroll and nested scroll; queued print-only toggle events cannot change saved choices. The print layout hides controls and decorative disclosure/count markers and allows the text to paginate. Native fallback index entries are also exposed in print.

Contents printouts hide their mode-selection controls while retaining the selected guide's heading and explanatory text. Their existing disclosure restoration is preserved. Runtime URLs, the service-worker cache and the Complete package include the matching print assets. Historical sections in this record and the coordination note are explicitly distinguished from the current release to prevent reuse of old PDF pagination.

This follow-up does not rebuild or replace any PDF. The five reading editions and their page maps remain the verified `daruri8-structure-20261020` release below. The standalone Historical Lexicon is not a linked public download; no stale standalone PDF needs replacement. Focused validation uses `qa/verify-subject-index-print.js` and the existing full-reader subject-index and contents checks. Publication and live verification are recorded in the shared coordination note.

## Source structure, subject browsing and compact PDF contents — `daruri8-structure-20261020`

**Published and live:** [52ee8a1](https://github.com/gnamma-research/booksite/commit/52ee8a18952304b8315770e0c7822e2a02840662). [Pages run 39471054037](https://github.com/gnamma-research/booksite/actions/runs/39471054037) succeeded. All 15 changed public reader/PDF/assets returned HTTP 200 and matched the tested files byte for byte, including all five reading PDFs.

The user approved the complete contents/index redesign on 20 October 2026, explicitly retaining a compact editorial section guide in the bilingual reference, bilingual study and English reading editions. The two Arabic editions use only the recorded-heading contents. This release integrates the live `Ar`/`En` button labels (`896bd3c`) and preserves the compact menus, three reading styles, fonts, source notes and self-contained study printing.

The website now presents **Book structure** and **Editorial section titles** within the same collapsible part frame. The opening starts open and the four parts closed; saved disclosure state, Expand all / Collapse all, search ancestry and exact reference returns work in both modes. The 46 recorded Arabic rubrics and English translations retain their verified hierarchy. Generic headings receive explicitly identified prose-supported or editorial topic captions. Source rubrics are primary in normal, continuous and native reading; distinct editorial descriptions are subordinate and labelled, while unheaded units are labelled Editorial section. The later colophon remains separate.

**Subject index** precedes **Dictionary** in both menus. Its By subject and A–Z views share the unchanged 302 headings and 1,011 subentries. Eight editorial subject groups cross-list related entries; People and schools and Edition/source control filters, four question routes, Arabic/alias/subtopic search, and saved view preferences improve access. Section jumps and returns restore the query, selected view/filter/question, disclosures, focus and scroll. A matching native subject browser and alphabetical index remain available without JavaScript. The canonical taxonomy is `subject-index-data.json`; its browser export and PDF subject guides use the same definitions.

| Stable filename | Pages | Recorded contents | Editorial section guide |
| --- | ---: | --- | --- |
| `daruri.pdf` | 243 | p. 3 | pp. 4–7 |
| `daruri-study.pdf` | 131 | p. 3 | pp. 4–7 |
| `daruri-english.pdf` | 97 | p. 3 | pp. 4–7 |
| `daruri-arabic.pdf` | 73 | p. 3 | None |
| `daruri-arabic-vowelled.pdf` | 69 | p. 3 | None |

Each PDF has a one-page recorded-heading contents list. The three English-containing editions add a compact four-page guide to all 258 editorial titles, explicitly distinguished from Ibn Rushd's headings. Full editorial descriptions no longer interrupt the PDF body. The recorded rubrics and small R/BA reference markers organize the text. Primary bookmarks follow the validated source hierarchy; the editorial bookmark branch is separate, the colophon is outside Part IV, and Arabic editions have Arabic structural navigation. Subject indexes precede dictionaries/glossaries. All text is black, with no images or decorative fills. Each edition is shorter than its predecessor.

All 565 static and 259 dynamic website PDF destinations are rederived from verified visible section anchors, including headings that move across a page break. The manifest, five PDFs, page maps, offline assets and cache are updated together. The 85-page teaching companion, 28 questions/84 lesson versions, all 628 main-text notes, 416 aligned passages and source qualifications are preserved. Per-edition build metadata and the PDF verification record are retained in `build/release/`.

Validation covers all five PDF source/footnote contracts, all 46 source outline entries, the 258-entry editorial outlines in the three requested editions, 47 visible source/colophon destinations, monochrome text and page bounds. The rendered contents and representative bilingual/Arabic chapter and reference pages were visually reviewed. Website gates cover the complete heading/corpus, language and Focus contracts, compact menus, source-first headings, contents disclosure/search/returns, full subject-index navigation, application returns, reader source notes and all 84 lesson printouts. Website DOM geometry is simulated; an attempted live visual browser connection was unavailable, so physical-device visual verification is not claimed. Publication and deployed-byte results are recorded in the shared coordination note.

## Earlier releases and preserved features

The records below explain earlier changes that the current release preserves. Their publication-time PDF counts, contents pages and saved snapshots are historical. Use the current manifest and the source-structure release above for today's files and destinations.

### Compact navigation and reading styles — `20261020-menu1`

The user approved these changes on 20 October 2026. The main menu keeps Read the text, Contents, Study guide, Dictionary, Academic index, Bidāya applications and Saved passages as ordinary direct destinations. Home and About remain in the footer. Jump to part and Downloads are closed native disclosures; all five reading PDFs and the complete offline package remain accessible. The no-JavaScript navigation retains its working static destinations.

Type & appearance uses compact rows for page style, reading size and the two font choices. The three styles are **Quiet reading** (default), **Book page** and **Structured page**. They adjust screen spacing, heading hierarchy, rules, gutters and apparatus surfaces; notes availability and open/closed state remain independent. The new label Structured page supersedes the earlier proposal Text & notes. Arabic stays Amiri by default, with Scheherazade New and Noto Naskh Arabic; English stays Original by default, with Source Serif 4 and Literata.

Menu sample text and font-preview paragraphs are removed. Page layout remains visible, using accessible Arabic/English letter diagrams: side-by-side choices for two columns, stacked choices at the reader's narrow breakpoint. The independent right/left and top/bottom preferences retain their existing defaults and saved values. Colours stays expanded with System/Light/Dark and all six existing visual palette choices. Gnamma landscape backgrounds and palette preferences remain available.

The isolated `reading-styles.css`, `reading-styles.js` and `compact-menu.css` are included in the service worker and offline ZIP. `pageStyle` joins the existing preference record and uses the shared visible-passage anchor when changed. Native fallback style/font selects work with CSS, including font selection during printing. Screen-style rules leave the existing monochrome print treatment and current PDF bytes untouched.

Validation: heading/corpus (259 sections, 416 passages), language, Focus 0–3, 11 menu-accessibility groups, 128 global-navigation cases plus nine exact returns, ten compact-menu/style groups, ten application-link groups, all 84 lesson render/print variants, 28 study reading/return sequences, and the full 259-section Notes/source checks pass. Static reading/study content and scholarly data are preserved. Deployment and live-browser verification are recorded in the shared coordination note once complete; local runtime checks do not by themselves establish visual-browser correctness.

## Reader Notes cards — `daruri7-notes-20261020`

The Notes link beneath each passage includes the verified Qur’an and hadith sources from the scholarly PDF. The card presents these sources first, with clear kind labels, the original reference text and clickable sources, followed by separately scoped Bidāya application references and the remaining textual, grammatical, translation and interpretive notes. The adjacent summary reports source-note counts; these are not counts of verses or external links.

All **628 main-text note records** and their section associations are retained exactly, including the **53 Qur’an and 33 hadith source notes**, all 22 earlier mixed-note splits and unresolved-attribution notices without external links. **12 application-source notes** now accompany their primary passages and application cards, for **640 total records across the passage Notes cards**. Existing Bidāya book/chapter citations remain. Dictionary-report notes belong to the full historical articles in the scholarly apparatus; website excerpts that omit those quotations do not acquire misleading source attributions.

The source data asset is generated by `build/build_source_reference_data.py`. Source ordering and counts share one renderer, and closing a Notes card restores focus to its opener without changing the section or reading position. The no-JavaScript application cards, offline download and service-worker assets include the application references. Run `qa/verify-reader-source-notes.js` alongside the existing reader contracts when editing this flow.

At the Notes-card publication, the citation-release PDFs and page maps were unchanged. **The later `daruri8-structure-20261020` release supersedes that pagination and those PDF bytes.** The saved Usul package `Daruri_Current_Reader_Website_2026-10-20.zip` and its `DARURI_CURRENT_READER.txt` pointer identify the earlier Notes commit `89cdd5f`; they are not a snapshot of the current structure release. Fetch current `master` before continuing website work, or use the live reader's Complete package download for current reader assets and PDFs.

## Citation release — `daruri6-sources-20261020`

**Published in `b7af8f07915ea38f41bc9dc9727cdfccb5296d8a`; all five reading PDFs and the study companion were verified against their live downloads.** The central release handoff records the publication commit and deployed-byte verification. The citation work incorporates public base `c4958e20dfca358e702570dc1f2f8c23bb9fec89`, including the study-card link correction and shared monochrome browser printing recorded below.

| Stable website filename | Edition | Pages |
| --- | --- | ---: |
| `daruri.pdf` | Bilingual scholarly reference, with full headwords | 254 |
| `daruri-study.pdf` | Bilingual study | 139 |
| `daruri-english.pdf` | English reading | 105 |
| `daruri-arabic.pdf` | Arabic reading | 80 |
| `daruri-arabic-vowelled.pdf` | Arabic fully vowelled | 76 |

**Citation policy:** Qur’an source footnotes appear in all five editions. Hadith source references belong to the scholarly edition only. Arabic and English quotations in the bilingual editions share a source note. Sources are identified separately from translation, textual and interpretive comments; qualifications for composites, ellipses and transmitted readings are retained.

The scholarly main-text apparatus contains **628 notes**: the previous 542 notes, with **22 mixed notes split while preserving their commentary**, plus **53 Qur’an source notes and 33 hadith source notes**. The bilingual study edition contains **121 distinct footnotes**. The release preserves **259 section records** (258 numbered authorial sections and the separate colophon), **416 aligned passages**, **157 full-headword articles** and **153 term dossiers**. The authorial text, existing translations, original headings and Bou Akl source distinctions remain intact.

The scholarly PDF places **Original headings on pp. 4–5** and begins **Editorial section titles on p. 6**. Its new pagination requires a fresh map from stable section IDs to physical PDF pages. The release updater rederives **565 static destinations** (306 contents links and 259 heading-popup links) and **259 dynamic `sections[].pdfPage` values** from the rebuilt scholarly PDF metadata. Source-edition Arabic page references remain a separate system.

`daruri.pdf` remains the destination for reader text and heading-reference links. The other four editions remain separate download choices. The manifest is the authoritative record of each current filename, byte size, SHA-256 checksum, page count and default-for-text-links flag. Both download panels, their accessible labels, the offline ZIP and service-worker versions must accompany each PDF replacement.

The separate `daruri-study-guide.pdf` companion has **85 pages**, generated from the same **28 questions × three levels (84 lesson versions)** as the website guide. It now includes numbered source footnotes for “Ask the village” (Qur’an 12:82, companion p. 57) and “Uff” (Qur’an 17:23, companion p. 65). Both appear on the same page as their quotations, and the shared website examples have corresponding local source notes in enhanced and no-JavaScript views. This companion is additional to the five reading editions and does not replace `daruri-study.pdf`. Its current checksum and size belong under `companions` in the manifest; build provenance is in `study/companion-metadata.json`. The standalone Historical Lexicon is a separate companion; its updated central copy does not add a sixth reading edition.

### Canonical files for future Darūrī and Usul chats

Use [this record on current `master`](https://github.com/gnamma-research/booksite/blob/master/daruri/CURRENT_RELEASE.md), the [current PDF manifest](https://github.com/gnamma-research/booksite/blob/master/daruri/pdf-editions-manifest.json), and the [live reader](https://gnamma-research.github.io/booksite/daruri/) to identify the release. Central copies in the Usul project should point here and match the manifest hashes; dated handoffs and ZIPs retain their historical provenance.

Reproducible publication sources are `edition-r3-20261020.js`, `dictionary-r3-20261020.js`, the source mappings under `build/data/`, and [build/build_editions.py](build/build_editions.py). [build/update_release.py](build/update_release.py) provides read-only dry-run/check modes and the final metadata/page-map update. The current source-reference release checks are recorded in [qa/source-reference-release-20261020.json](qa/source-reference-release-20261020.json). Preserve the printed Arabic base, private Bou Akl material and manuscript-evidence qualifications recorded in earlier handoffs; the generated PDFs are reading products, not replacement witnesses.

## Publication history before the citation release

The five-PDF release was published in `f7fe0c8460e7d70f141166fba277f9ed7d9bd7d5`. Commit `9071d49a584e807b7000a7446843d4da2e9aa92b` then versioned the changed PDF/data URLs for returning readers. Its GitHub Pages deployment completed successfully. The study guide was published in `e5e44918994cfa568553f3af6fbc68b045417a9c`. The audit began from the later public source `4ca2f7bba12092b05ceb1d51536d5d8c850fa216`. These commit references document the timeline; current `master` is the integration source.

## Published contents update

Commit `27213bbeeb8f4a04a29f1862261b938721a48688` publishes the contents integration on top of the study-guide release. The two guides now expose different navigation structures in both the enhanced reader and the no-JavaScript fallback:

- **Original headings:** 46 main-text heading records from the Arabic edition, displayed in a conservative hierarchy. Preserve the recorded Arabic and existing English translations, including generic headings such as “Chapter.” The parent map and its textual evidence are documented in [qa/ORIGINAL_HEADINGS.md](qa/ORIGINAL_HEADINGS.md).
- **Editorial titles:** 258 descriptive titles, one for every numbered main-text section, grouped by the editor's topical part labels.
- The unheaded opening, §§1–9, has a separate access link explicitly marked as a navigation aid. Do not manufacture an original Arabic rubric for it.
- The copyist's colophon and ownership record remain separate from the main-text hierarchy. They add one entry to each guide.
- Original-heading filtering retains ancestors for context and searches displayed heading fields. The website labels the two choices “Original headings · 46” and “Editorial section titles · 258” under “Two contents lists, one text”. Mode changes preserve the reading-return control and keyboard focus, and the selected view is saved. Following a section and returning to Contents must retain the selected mode, query and place.

The existence of a heading in the Arabic edition is not by itself proof of its manuscript provenance or attribution to Ibn Rushd. Keep printed-source headings, editorial navigation labels and later manuscript records distinct.

## Earlier contents and guide workstreams

| Workstream | Recorded scope | Status of the earlier contents release |
| --- | --- | --- |
| “Check Daruri Text Ways” | Clarify the two contents systems in the PDFs as well as on the website; regenerate and upload the affected PDFs. | Completed before the citation rebuild: reference 261 pages, others 129/98/81/92. Original-heading contents were appended on pp. 260–261, with existing body destinations unchanged. See the historical `qa/pdf-contents-audit-20261020.json`. The current citation pagination is recorded above. |
| “Study Guide Improvement Review” | Develop basic, intermediate and advanced study routes across the 28 study questions, and correct identified issues. | Published in `e5e44918994cfa568553f3af6fbc68b045417a9c`: all 84 lesson versions across 28 questions and an 85-page companion, with shared lesson sources and reader integration. Preserve these files and any subsequent guide fixes when merging contents/PDF work. |

These historical statuses come from recorded updates and repository inspection. They do not imply acknowledgement from another live chat. The shared coordination note was published at `6a2fd23ffcfd670c82a6b4e54b9a11186f4007f1`, followed by the study-guide release at `e5e44918994cfa568553f3af6fbc68b045417a9c`. The earlier PDF contents audit verified 6,823 existing links, 1,693 existing bookmarks and 646 unchanged pages; all 15 changed/new pages were rendered and inspected. Those figures describe the contents patch, not the later citation rebuild. Recheck current artifacts and `master` before integrating.

All current workstreams remain authorized to update both PDFs and reader wherever their task requires it. This record is a merge guide, not a file lock or a freeze on later improvements.

## Merge and publication invariants

1. Fetch the latest `master` HEAD and relevant blobs immediately before preparing a publication. Apply surgical changes to that current source. Do not replace `daruri/index.html` with an older ZIP, PDF-derived reconstruction or stale handoff copy.
2. Preserve unrelated work, especially the study-guide runtime, `study/` lesson sources, `daruri-study-guide.pdf`, shared `print.css`/`print.js`, reader integration, themes, Arabic/English and vowel controls, focus modes, numbered dock, dictionary/context returns, scholarly text, notes, source labels and stable section anchors. The current corpus has 259 section records, including the separate colophon, and 416 aligned passages.
3. Publish related files in one commit/tree, using a compare-and-swap `expected_sha` check on the branch update with `force: false`. If HEAD changed, fetch it and merge the actual differences before retrying. Never force an older whole-file version over another chat's work.
4. Replace PDFs at the stable filenames above. Every reference-PDF replacement requires a fresh **section-ID to physical-PDF-page map**, derived from the new PDF's bookmarks or verified destinations. Do not apply a global page offset: sections that formerly shared a page can move to different pages.
5. Update all **306 static contents PDF links** and **259 static heading-popup PDF links**—565 static destinations in total—plus all **259 dynamic `sections[].pdfPage` values**. Update the displayed PDF page text and accessible labels with the destinations. Source-edition Arabic pagination is a separate reference system and must not be overwritten with Gnamma PDF page numbers.
6. Update the manifest's source filenames, byte sizes, SHA-256 checksums and page counts. Keep both five-link download panels, their edition descriptions/page counts, and the five main PDF entries in `download-bundle.js` consistent. Any revised study companion must match its build metadata and receive matching manifest and cache updates; preserve its runtime, the supplementary Bou Akl variant report, print assets and the rest of the offline package.
7. Version changed PDF/data/script URLs and align service-worker cache URLs with them. Increment the service-worker cache name for the release. Returning readers must receive the new page map together with its matching PDF.
8. Run the relevant checks described in [qa/EDITING_LARGE_READER.md](qa/EDITING_LARGE_READER.md), including heading, language and focus checks. Verify the deployed files and navigation, including both contents routes, filtered ancestor paths, return position, all five PDF downloads and the offline bundle. Distinguish source checks, browser checks and real-device checks in the release report.

When parallel work is incorporated, update this record with its actual artifact/checksum and publication status. Keep planned, implemented and deployed work distinguishable.

## Study-card links correction — 20 October 2026

Commit `3dafec5db27f4b1ff59eec7e9a92f496055a7a55` made the Foundations, Close Reading and Research labels at the bottom of all 28 study cards actual links to the question at the selected level. Each link has a 44-pixel minimum tap height and an accessible label naming the question; heading links remain available. The guide integration check verifies all 84 footer destinations, clicks through the nested arrow at all three levels, and checks heading focus. At that commit, runtime and stylesheet URLs used `20261020-study2`, with a refreshed service-worker cache. The subsequent print and citation updates retain this behavior while advancing the changed asset versions. The link correction itself did not alter lesson sources or PDF content.

## Monochrome website printing — 20 October 2026

Commit `c4958e20dfca358e702570dc1f2f8c23bb9fec89` added a shared `print.css` for the reader, study guide, contents/reference views and standalone dictionary. It overrides every screen palette with white paper and black text, removes decorative images/controls/fills/shadows, uses English serif and Arabic Naskh-style font stacks, and retains fine rules and semantic line diagrams. Print layouts release scrolling containers and long passage pairs for pagination. Browser printing and lesson buttons share `print.js`; lesson disclosures and the current dictionary view are prepared for print and restored afterwards, and printed lessons identify their study level. The offline ZIP and service-worker cache include both print assets. Screen themes and the PDF editions were not reformatted by that website-print change. Its guide QA passes on the citation-integrated reader, including disclosure preparation/restoration, all 84 lesson versions, all three footer-link levels, both Qur’an source-note calls without route changes, matching no-JavaScript notes and notes retained during printing.

## Independent bilingual order and landscape phones — 20 October 2026

The coupled order setting from commit `75928270eb1bacad1f8a84fb07e42a9ed2d94264` is replaced by independent preferences. **Arabic right** is the default for side-by-side passages; **Arabic top** is the default when passages stack. Display / Type & appearance shows **Two columns · Arabic position** (Arabic left/right) or **One column · Arabic position** (Arabic top/bottom) according to the layout. Rotating a phone changes the visible setting without coupling the choices.

Preferences use `daruri-reader-v2.parallelArabicSide` and `daruri-reader-v2.stackedArabicOrder`. The previous `parallelOrder` value is ignored so new defaults apply to returning readers. Normal and all Focus modes share the settings. The no-JavaScript panel provides native radio controls and the same defaults without persistence, respecting its 840px stack separately from the enhanced reader's 590px stack.

On coarse-pointer landscape devices at most 1024px wide and 500px high, a 230px desktop sidebar and tall controls previously consumed much of the screen. These phones now use overlay navigation and full reading width, a 44px header, compact toolbar/dock, reduced Focus spacing and left/right notch safe areas. Dock buttons retain a minimum 44px height. Other viewport layouts retain their existing rules.

CSS reorders existing passages with matching gutters/dividers and visible-passage preservation. Arabic direction, scholarly text, all 259 section subtrees and 416 passages, notes, stable IDs, PDFs and offline assets are preserved, including the concurrent daruri7 source-note card changes and source-reference-data.js. Service-worker cache and registration advance to `20261020-responsive-order2`.

Validation: heading/navigation, language, Focus/corpus and JavaScript syntax checks pass. Runtime checks cover all four order combinations, right/top defaults with clean and legacy storage, selected controls, save/reload, invalid inputs, unavailable storage and retained reader state. Eight viewport/pointer cases cover portrait and landscape phones, tablets and desktop pointers. Static section subtrees and corpus loader placeholders are unchanged. Browser access was unavailable, so no live visual or real-device test is claimed. Publication is tracked by the containing commit and its GitHub Pages deployment.

## Arabic reading typefaces — 20 October 2026

Type & appearance now offers Amiri (the default), Scheherazade New and Noto Naskh Arabic, with an Arabic preview beside the existing independent reading-size controls. The validated choice is saved as `arabicFont` in `daruri-reader-v2` and restored before initial layout. Switching waits for both real Regular and Bold faces, then preserves the visible passage without rebuilding text or changing language, vowel, order or Focus preferences. Failed loads retain the previous choice; overlapping requests cannot apply an older selection.

All six full-repertoire WOFF2 files are self-hosted in `fonts/`, with their OFL notices and exact source/checksum provenance in `fonts/SOURCES.json`. `arabic-fonts.css` supplies the shared family variable. The standalone historical dictionary follows the same saved preference, browser printing retains the selected Arabic face within the existing monochrome layout, and the native no-JavaScript reader offers the three choices without persistence. The offline package includes the fonts and licence files; service-worker cache and changed resource URLs use `20261020-fonts1`.

Validation: the heading/navigation, language and Focus contracts pass. Focused Node runtime checks cover valid/invalid/default saved choices, save/reload, both weights, load failures and timeout, unavailable storage/API and competing selections. Font coverage and shaping-table checks are recorded in the font provenance. Local visual-browser and real-device testing was unavailable; do not describe those as completed. Scholarly text, source payloads, stable section destinations, PDF bytes, themes and the independent language-order controls are preserved. Publication is identified by the containing commit and its Pages deployment.


Publication: source commit [`04a4faf`](https://github.com/gnamma-research/booksite/commit/04a4fafc6b9a5c87eb49d4700ce4fa61cde01dcd); [GitHub Pages run 39449359301](https://github.com/gnamma-research/booksite/actions/runs/39449359301) completed successfully on 2026-10-20 at 15:33:01 UTC. All 13 deployed runtime, stylesheet and font assets were fetched from the public site and matched the prepared local bytes; all six fonts were served as `font/woff2`. This is deployed-byte verification, in addition to the automated checks above; no real-device visual check is claimed.

Saved source package: the separate Usul ZIP/pointer refresh was blocked by authenticated saved-file access. Those existing saved files remain unchanged; the pinned source commit above contains the complete published font change.

## English reading typefaces — 20 October 2026

The existing Type & appearance panel now offers Original (default), Source Serif 4 and Literata for English reading. Initial preferences are Amiri + Original; established reader choices remain respected. Original retains the exact reader stack (`Iowan Old Style`, `Palatino Linotype`, `Book Antiqua`, Georgia, serif), with each supporting surface retaining its previous default. Interface and title typography remain independent. Each selector has a sample and saves its own preference in the existing reader settings.

The two optional English families are locally hosted with full normal and italic variable files (weights 200–900 and optical sizes). The four files total 1,567,532 bytes. Full repertoires, scholarly Latin transliteration and combining marks are retained; native fallbacks cover the few editorial symbols outside these families. Original uses the native device fonts and needs no download. Font licences and exact source/checksum provenance are included in the offline package.

Selected English type is applied to reader prose, notes, definitions, dictionary translations, study prose and browser printing, including the native fallback reader. Arabic settings, content, PDF bytes/maps, navigation, colours and reading sizes are preserved. Changes to both font choices that finish within one frame now share the first reading-position anchor. Cache revision: `20261020-fonts2`; the unchanged Arabic stylesheet keeps its previous revision.

Validation: existing heading/navigation, language-cycle and focus-mode gates pass (259 sections and 416 passages). All 38 focused checks pass: 18 English/integration and 20 Arabic regression checks, including native reset, failed/timeout loading, stale requests, storage restrictions, independent selections, persistence, and same-frame/separate-frame scroll preservation. The font files retain cmap, layout and variation tables. These checks use static inspection and controlled runtime mocks; no physical-phone visual test is claimed. Publication and deployed-byte verification are recorded in the release-coordination file after deployment.

The separate saved Usul ZIP/pointer access blocker from the preceding release remains recorded; no duplicate saved-package upload is in progress.


## Navigation and menu consistency — 20 October 2026

Menu, Search, Appearance and Display now stay available on the reader's reference views, including the academic index and study guide. Reading-only controls appear only in the reader, while the existing return-to-reading action preserves the saved passage. A shared responsive size aligns the toolbar buttons; saved Focus/header preferences apply to reading rather than hiding reference navigation. The standalone historical dictionary also has a compact site menu. This release preserves the newer source-note cards and independent Arabic-side/stacked-order preferences and selectable Arabic and English fonts, and bumps the offline cache to navigation1.

Validation: global navigation runtime regression across 128 view/mode/header/viewport combinations and nine return paths, plus focus, language-cycle and heading-contract checks. Live deployment is checked after publication.


## Self-contained lesson printing — 20 October 2026

“Print this lesson” and browser printing of an individual study lesson now assemble a complete bilingual handout from the current edition data. Every assigned section appears in full, with editorially vowelled Arabic followed by its complete English translation, stable reader numbers and edition references. Additional reader sections explicitly cited in the explanation, tasks or printed case summaries are included once as supplementary readings. The screen language setting does not remove either language from the packet.

The endnotes select study-relevant notes from each printed section’s `noteIds`: grammar, vocabulary, translation, interpretation, scholarship and Qur’an/hadith sources, with selected Bidāya case source notes and lesson-example citations. The later study-note cleanup below excludes manuscript/collation apparatus and removes those parts of mixed notes only in print. Explicit note-ID cross-references are resolved within the retained study notes without mistaking Bou Akl paragraph numbers for reader section IDs. Passage-specific calls use the existing passage/anchor metadata; general notes are attached to their section. The complete key terms, explanations, tasks, feedback and editorial case summaries remain available on paper.

Eight Advanced lessons use labelled print-only task adaptations or select an existing local alternative where the web lesson requires another work. Printed work is answerable from the handout; suggestions to consult external primary sources remain optional further research, and editorial summaries are never relabelled as primary text. The normal screen lessons and downloadable companion sources are unchanged.

`lesson-print.js` generates the packet synchronously from already-loaded data; shared `print.js` prepares/restores disclosures and removes all additions after printing or cancellation. Print-only content stays hidden on screen. The print button allows the selected locally hosted language fonts to load before opening the dialog. The monochrome layout, selected English/Arabic typefaces and natural pagination are retained, with readable Arabic inside endnotes. The new module is included in the offline bundle and service-worker cache (`20261020-lessonprint1`).

Validation: `qa/verify-lesson-print.js` checks all 84 lesson versions for exact full Arabic/English passage coverage, reading order, unique supplementary passages and notes, complete note text, local note links, idempotence, screen restoration, retained route/preferences, browser events and button/font-readiness behavior. Existing study-guide, heading/language/focus and current menu-navigation checks are retained. Four offline print samples cover opening grammar, long transmission readings at two levels and interpretation of meaning; rendered text is black, pages are grayscale and no text exceeds page bounds. These are offline PDF layout checks, not physical-phone print-dialog verification. Publication and deployed-byte verification are recorded separately in the shared coordination note.


## Bidāya application prose links and return — 20 October 2026

Explicit Darūrī section citations inside the application summaries are now clickable in the applications list, detail dialog, reader callouts and mobile application popup. The 11 cited summaries contain 14 printed section numbers; each has a validated target, including both printed endpoints of ranges. Original wording, section symbols, conjunctions, punctuation and possessives are preserved. Both no-JavaScript application presentations receive native section links. Qur’an references and Bidāya book/chapter locators are not interpreted as Darūrī section numbers.

Following a citation shows the existing contextual return bar labelled “Back to Bidāya application B01” (or the corresponding application). Returning reopens the same application window and restores its underlying reader, filtered list or study lesson, page and dialog scroll, and keyboard focus. It also works after following Next/Previous, for a citation to the currently open section, and through nested application/reference returns. Primary and related-section buttons inside application windows share the same return behavior. Native modified-click link behavior is retained.

Validation: `qa/verify-application-links.js` exercises the actual reader and exact edition, dictionary, source-reference and study modules in JSDOM. Ten regression groups cover all 28 unchanged summaries on all four enhanced surfaces and both fallback presentations, valid/invalid citation parsing, Oxford-comma lists, range endpoints, native modified-click behavior, primary/related section buttons, filtered list/detail return, direct application URLs, mobile popup, same-section/inline reading, nested application and Contents return, dictionary-origin retention, and an actual study lesson return. Controlled geometry checks verify navigation, scroll bookkeeping and focus; they do not claim physical-device visual testing. Existing heading/navigation, language-cycle and focus-mode checks also pass with 259 sections and 416 passages preserved.

The change is applied over the current English-font, menu/navigation and self-contained lesson printing releases. Offline cache revision: `20261020-apprefs1`; existing font, print, study and data asset versions are retained. Source text, translation payloads, PDF bytes and page maps are unchanged. Publication and deployment are recorded in the shared release-coordination note.


## Arabic toggle and navigation focus follow-up — 20 October 2026

The Arabic toolbar glyph is 1pt smaller at every responsive size, following the reader’s request, with the shared button dimensions retained. Compact navigation now contains keyboard focus, makes background content inert, restores focus on close, and returns focus to the main pane on navigation. Drawer-to-dialog transitions preserve the original opener, and closing a drawer cannot unlock an active dialog. Hidden-header recovery controls remain below modal backdrops and become inert with the other background controls. Desktop sidebar navigation remains nonmodal. Offline cache: navigation2.

Validation: 11 focused runtime accessibility groups; 128 reference-navigation cases plus nine exact-reading returns; existing Focus, language and heading/corpus gates. Latest Arabic/English fonts, full lesson-print packets and Bidāya prose-link releases are retained. Physical-device visual testing is recorded separately from DOM behavior tests.


## Study notes in lesson printouts — 20 October 2026

Lesson printouts now omit manuscript variants, textual collation and editorial-only apparatus. All 184 textual-kind records are excluded, along with the restoration-only crux N013 and editorial-only translation notes N050/N091. The useful command/commander distinction in N027 is retained as a short Vocabulary note. The resulting study selection contains 441 of the 628 main-text note records, including all 260 grammar, 53 Qur’an-source, 33 hadith-source, 22 scholarly-context and 11 interpretive records. Individual lessons include the relevant subset; their application and teaching-example sources remain additional.

Seventeen retained records receive narrowly scoped print-only adaptations: manuscript comments are removed from mixed notes while their grammar or interpretation survives, and references to omitted apparatus are replaced with the relevant local explanation. Qur’an/hadith wording qualifications and unresolved-attribution notices remain. The canonical scholarly corpus, screen Notes cards and PDF editions are unchanged. Source Arabic and English are printed in full, and notes form one consecutive, deduplicated sequence with valid local calls.

The changed lesson module uses `20261020-studynotes1`, with a matching offline cache and reader registration. The release incorporates the current Bidāya application links and menu-accessibility/Arabic-glyph follow-up. Validation: all 84 packet cases check bilingual completeness, useful-note retention, omitted apparatus, adapted explanations, continuous numbering, resolved references and exact screen-state restoration. Existing heading/language/focus gates pass. Deployment and exact live-file verification are recorded in the shared coordination note after publication.

## Reading Desk — 20 October 2026

The former Saved passages destination now reads **Reading Desk**, retaining route `#bookmarks` and migrating existing section bookmarks. A separate browser-local collection supports whole sections, exact Arabic or English word/phrase selections, paragraphs, individual scholarly notes, dictionary entries (including the historical dictionary), academic-index topics, Bidāya applications, and study lessons at their chosen level. Readers can create titled or untitled personal notes attached to a source or as freestanding observations.

The Desk includes **All, Text, Notes, Dictionary, Index, Bidāya, Lessons**, search, bilingual context preview, original-quotation highlighting, full paragraph/section expansion, source reopening, and **Back to Reading Desk**. Reader text and paragraph-level controls expose saved counts and personal notes in normal reading, while Focus modes and explicit hidden-notes settings suppress persistent indicators. CSS Highlights provide precise marks where supported; source links and cards work without the Highlight API. For unresolvable edited selections, the original quotation remains preserved and no unrelated occurrence is silently substituted.

Deletion moves to a recoverable **Bin** with immediate Undo, Restore, Restore all, and confirmed permanent deletion. Browser-local JSON **Download backup / Share backup / Import** supports merging across devices without accounts or a central database. Item-level sharing/email and printer-friendly bilingual output are available; the website never sends email without the reader choosing a native mail/share action. Current PDF editions, original text, scholarly notes, source mappings, fonts, contents, study printing and layout preferences are unchanged. Files `reading-desk.js`, `reading-desk.css`, `reading-desk-dictionary.js` are part of the offline package and SW cache `20261020-readingdesk1`. Javascript syntax validation and a mocked runtime smoke test of legacy migration, bookmark addition, category rendering and backup format pass. Mobile browser appearance, screen readers and physical-device file sharing require device verification and are not claimed from these static checks.


## Reading Desk print and toolbar QA — 20 October 2026

The Reading Desk action toolbar now groups New note / Download backup / Share backup / Import separately from **Print visible items** and **Bin**. At narrow viewport widths these two latter controls stay in one left-aligned row rather than leaving Bin stranded at the right on a new line. The grouped layout retains accessible tap targets, all saved-item tabs and the existing palettes.

**Printing one item no longer prints the whole Desk.** The item Print control opens a persistent in-page preview labelled *1 selected entry* containing only that item's content, source and any personal note. The preview offers a user-triggered **Print this item** and **Close preview**; it does not remove its printable DOM from an early mobile `afterprint` event. **Print visible items** separately previews only the entries in the active category/search, with its count. Print CSS hides the surrounding website and preview buttons. The preview's Escape/Tab handling and focus return are separate from the personal-note editor; no pop-up tab is created. Bilingual reading text, font choices and print-only study lessons retain their prior behaviour.

Validation for `20261020-readingdesk2`: JS syntax and actual reader integration strings pass, as does `qa/verify-reading-desk-print.js` (single-entry scope, exclusion of unrelated entries, filtered-list scope, persistent preview, explicit Close/focus, Bin/toolbar and print CSS). Controlled Chromium viewport screenshots at 375, 393, 428, 768 and 1280 px show Bin on the same line as Print visible items with no horizontal overflow; controlled print-media checks at 375, 428, 768 and 1280 px hide the original Desk and print controls and expose exactly one selected printable article. These are controlled browser simulations and regression tests, **not** physical iOS or live-browser visual testing. The service worker and complete download package version the revised JS/CSS; the current Visuals, dictionary, scholarly text, five PDFs and page maps are preserved. Publication and actual Pages deployment should be verified separately.


## Six-stage Darūrī study pathway — 21 October 2026

The website's Study Guide route now uses six stages for all 28 topics across eight units: recognise, distinguish, explain, reconstruct, evaluate, apply. The existing Basic/Intermediate/Advanced depth choices, 84 lessons, their 168 written tasks, feedback, Bidāya connections and source navigation are retained. New Basic checks: 64 four-option questions, comprising ten for the opening argument and two for each other topic. Every checked answer supplies the editorial key, explanation and source link. Selections and successful checks are browser-local, not external grading or the shaykh's answer key.

Source: study/foundation-checks.json. Authoritative lessons remain study/lessons-01-09.json, lessons-10-18.json and lessons-19-28.json; study/build-guide.py now compiles the question bank with them. Basic readings for purpose now include §6 and those for ruling include §38. The browser data, runtime, CSS and index use cache query 20261021-study-path1. Preserve all three study asset references in any subsequent edit to index.html or sw.js, while merging with the newest concurrent reader and menu revisions. The service worker was concurrently updated by another website task; this change was rebased onto the latest cache rather than reverting it.

The no-JavaScript guide now includes 28 staged assessment groups and 64 hidden-answer entries. Validation: 28 topics, 64 questions, four-option keys balanced 16/16/17/15, no missing Basic reading references, 84 existing study-level sections retained, JS syntax and reference links consistent. Re-run qa/verify-study-checks.js, qa/verify-study-guide.js and existing print/reader regression checks after later merges. Physical iPhone visual QA has not been established in this editing session. The downloadable daruri-study-guide.pdf remains the earlier companion: new question sets are website-only pending a separately regenerated PDF.


## Editions & Printing catalog — 21 October 2026

The dedicated #editions route is organised in the approved order: (1) Reading & Printing, (2) Study, (3) Reference. It is available from the left navigation, Home, and the existing Downloads menus. Those five original PDF links remain available with their existing destinations; the no-JavaScript fallback provides the same ordered tiers and published file links.

Reading & Printing now has a browser-side A4 configurator: language (English, Arabic, bilingual), one/two columns (parallel or stacked for bilingual), vowel marks, comfortable/balanced/compact margin presets, no/essential notes, full text/major part/lesson/section range. The preview is generated from the current canonical text, not a placeholder. Print / Save as PDF uses the browser's own print dialog and does not upload text or user data. The desktop and mobile layout responds to current reader palettes. The full source remains unabridged for selected complete sections.

Study provides the published fixed bilingual study PDF, the companion study guide, and a separate custom Study print configuration with selected translation, interpretation and source notes. Reference stays a fixed link to the scholarly PDF and is intentionally not customisable.

Both Reading and Study have the optional 'Include editorial section titles' checkbox. Source headings are always present and are never labelled editorial. The reading preset defaults to OFF; study defaults to ON. Existing editorial descriptions are English only in the canonical reader data; when enabled in an Arabic-only printout, the titles remain visibly labelled English editorial descriptions rather than being presented as authorial Arabic headings.

Browser assets: editions.js and editions.css, version 20261021-editions1. Their versions must remain matched in index.html and sw.js. Both are included in download-bundle.js. The PDF build source, build/print_editions.py, supports optional --editorial-titles on/off. Its default is OFF, to keep the A4 compact editions minimal. qa/verify-editions-configurator.js tests route integration and title/format selection using all 258 authorial sections / 414 bilingual passage pairs.

The original published scholarly and bilingual-study PDF binaries have not been silently replaced, because the owner requested review of page designs first. Source generation for bilingual PDFs has been adjusted toward English-left/Arabic-right. The published legacy file page maps and the scholarly reference PDF URLs remain intact pending approved replacement and revalidation. Do not conflate the interactive browser Save as PDF option with a downloadable pre-built PDF for every option.


## Reading Desk timestamp, annotation and print redesign — 21 October 2026

The personal Reading Desk now distinguishes Bookmarks and My notes, with a separate source-type filter and sorts by creation date, personal-note edit date, source order, and title. Entry from the reader uses actual paragraph section and segment in continuous reading. Saved passage indicators open compact local annotation panels; mobile selection uses a dedicated detail view. Bilingual source returns preserve the selected Desk item, sorting/filter state, and return location.

New bookmarks and notes record a trustworthy creation timestamp, and note content revisions record a distinct modification date. Deleting/restoring does not change the textual revision date. Earlier records without proven creation dates are conservatively labelled Recorded / original date unverified, or Previously saved / original date unknown for legacy migration. Existing JSON backups remain version-1 compatible. Import avoids creating duplicate items solely because date metadata was added.

Printing now defaults to source order independently from the screen, with chronological/as-displayed choices, bilingual source options, personal-note inclusion, optional dates and full passages. Source-ordered repeats are grouped. Readable Markdown export supplements the JSON backup. Reading Desk Tools and the existing Visuals modal, where available, expose an independent private-marks toggle without changing scholarly notes or reading focus controls.

Changed: reading-desk.js, reading-desk.css, reading-desk-dictionary.js, sw.js, download-bundle.js; added qa/verify-reading-desk-redesign.js. Offline cache revision 20261021-readingdesk3 also caches the old referenced reader URLs for offline compatibility. Code syntax checks and an 11-check simulated interface/print suite passed. Committed Node regression script, physical iPhone Safari behavior, and live GitHub Pages publication need separate verification. Preserve the concurrent scholarly PDF, Visuals, navigation, and study-guide changes when continuing work.


## Reading Desk v4 safety and mobile quality audit — 21 October 2026

Current source of truth: [READING_DESK_AUDIT_2026-10-21.md](READING_DESK_AUDIT_2026-10-21.md). Previous version dropped notes with unresolvable sources during loading and permanently removed them when a later save rewrote localStorage. Version 4 preserves unresolved and unknown records, retains older metadata and oversized imported note text, blocks writes if the stored JSON is unreadable, and exposes source-relinking with preserved provenance. Previously overwritten notes cannot be reconstructed without an earlier backup.

The attached iPhone screenshot exposed a redundant Back-to-Reading-Desk button in a visible inline detail; the mobile CSS now makes list/detail states mutually exclusive and shows the return control only for the dedicated detail state. Source-order grouping and exact linked-note counts were corrected. Continuous reading highlights now use actual section identifiers. Printed bilingual note-only selections retain exact quotations, and externally shared source links include paragraphs and optional bounded quote text. The separate dictionary return state retains the originating reading position.

Published asset/cache suffix: `20261021-readingdesk4`. Updated reader HTML, dictionary HTML, reading-desk.js, reading-desk.css, dictionary bridge, offline bundle and service worker (v3/v2 offline compatibility preserved). QA: 11 reproducible synthetic-DOM tests in `qa/verify-reading-desk-redesign.js` passed, and `.github/workflows/daruri-reading-desk-quality.yml` supplies future CI checks. Physical Safari and live Pages verification are **not** claimed; follow the audit's remaining priority list. Preserve concurrent reader, Visuals, compact-print editions, PDF and study-guide edits.


## Reading Desk v5 integrated release — 21 October 2026

Final audit and QA: [READING_DESK_AUDIT_2026-10-21.md](READING_DESK_AUDIT_2026-10-21.md). The original screenshot defect (a redundant mobile Back to Reading Desk button displayed beside an inline item preview) is corrected by separating mobile collection and detail modes. The confirmed note-loss bug on missing/renamed source references is corrected with lossless archival display, recoverable source relinking and preservation of source history; corrupted storage and stale tabs cannot silently overwrite newer notes. Edits to unusually large imported notes no longer truncate their text, and malfunctioning or duplicate-ID records remain archived. Long bilingual quotation printing and continuous-reading marks were corrected without altering edition content.

**Version consistency checked:** main reader and historical dictionary use `20261021-readingdesk5`, as do the offline service worker and package generator; older asset references remain cached. **Validation:** 19 synthetic DOM regression checks and 9 version-integration checks passed on connector-fetched source. GitHub Actions workflow is installed; runner and live Pages/iOS Safari status remain unconfirmed. Do not claim physical-device QA from synthetic checks. Preserve concurrent PDF/print editions and personal-export page work.

## Reading Desk v5 — preservation, navigation, and cache release (21 October 2026)

Scope: Narrow fixes to the private Reading Desk, its CSS, the historical dictionary hook, the offline/download asset manifest, and regression tests. Scholarly PDF editions, the separate personal PDF export, study guide, dictionaries, themes, and editorial notes were not replaced.

Safety: Previously saved notes remain in their collection even when a section, paragraph, editorial note, dictionary term, or future-format source is unavailable. Malformed records, duplicate IDs, long historical notes, extra metadata, and previous collections over 3,000 items are preserved; corrupted/unsupported collections are protected from overwrites and can be downloaded untouched. Unresolved records remain accessible and may be relinked, preserving old source history; quotations are validated before relinking. Failed storage writes roll back in-memory edits/deletions. Stale parallel browser tabs cannot overwrite a newer collection and may reload it.

Interface: Mobile Reading Desk list view no longer shows a meaningless Back button or stacks a selected detail beneath the list; a true dedicated detail route has its own Back action. Source locations, precise share links, continuous-reading annotation marks, bilingual context, dates, and personal-mark preferences are preserved. Printing retains exact saved quotations, even from the end of very long paragraphs; users retain Arabic/English and private-note inclusion controls.

Activation: index.html, dictionary.html, download-bundle.js and sw.js now reference 20261021-readingdesk5; the service worker cache name was bumped. Older v4/v3 reader script paths remain in the cache for offline compatibility. Reproducible check: node daruri/qa/verify-reading-desk-redesign.js.

Verification: 19 synthetic-DOM regressions passed in the JavaScript runtime (data preservation, malformed imports, duplicate IDs, chronology, mobile states, source relinking, long-print excerpts, continuous reading, and stale-tab conflict recovery). All 13 reader/dictionary/offline asset reference and source syntax checks passed. Physical iPhone Safari and live Pages deployment were not accessible for independent verification. A new service worker may require a fresh page load to take control. Keep this v5 release when merging concurrent edits.


## Reading Desk v5 and personal PDF export v2 — 21 October 2026, follow-up

The main bilingual reader and historical dictionary use Reading Desk v5 JS/CSS with cache-busted references. The same release preserves offline v4/v3/v2 compatibility. The Reading Desk JSON export now preserves unfamiliar top-level backup metadata as well as opaque record fields. A new regression checks JSON backup round trips.

Personal-PDF export v2 resolves a previously silent archival-data truncation: it reads the complete saved collection rather than only 3,000 records and retains the full original personal note text instead of cropping at 30,000 characters. Duplicate historical IDs become distinct export-only selection keys without altering localStorage. Legacy unknown/archived saved items can be selected for the appendix. The picker displays the first 240 matches and instructs readers to refine search for the rest, avoiding an unbounded mobile DOM. If the chosen PDF pop-up annotations cannot contain all source material, personal-PDF creation requires the complete appendix and explains why rather than discarding words. The unchanged published-PDF option remains the default, with no personal material included.

Versions: personal-export.html loads personal-export.js?v=2; service worker caches v2 and previously referenced v1; downloadable bundle also fetches v2. The separate personal-PDF implementation is not replaced and the five scholarly/reading edition PDFs have not been altered.

**Verified against current GitHub source in this session:** 20 Reading Desk synthetic-DOM regression checks and 18 personal-export model/invariant tests passed. All five JSON PDF section maps were checked: each metadata SHA-256 and page count matches its manifest edition and all 259 section pages for each fall within that edition. The continuous-reader user-note safety, mobile list/detail state, source relinking, long notes, old backups, duplicate IDs, and multi-tab protection remain covered by Reading Desk tests. Automated GitHub Actions definitions were expanded to run both suites on relevant pushes.

**Unverified:** GitHub Actions remote job completion, GitHub Pages live deployment/cache freshness, actual iPhone Safari/VoiceOver interaction, and native PDF annotation rendering in Apple Files/Acrobat. The public deployed pages could not be fetched through this chat's browsing interface. Further browser/physical-device QA is needed before asserting device compatibility. The full personal appendix uses image-backed pages and is not equivalent to a selectable, text-searchable tagged PDF; native PDF comment appearance varies by viewer. The underlying JSON backup should be saved separately, particularly before major upgrades.


## Direct A4 Reading and Study editions — 21 October 2026

Published the ten new complete-text PDF options under daruri/editions/, separate from the canonical five reader PDFs. Their authoritative machine-readable list is daruri/editions/manifest.json; all entries include sizes and SHA-256 hashes. Reading & Printing precedes Study, which precedes scholarly Reference on the Editions & Printing route (#editions). Ready-made download and PDF-reader links are exposed only when the verified manifest is reachable, while browser-local custom print/Save-as-PDF, section and lesson selections remain available. Editorial descriptive headings are optional at both Reading and Study levels; recorded source rubrics are always retained.

Released page counts (editorial headings off/on): bilingual Reading 76/82; English 43/47; unvowelled Arabic 36/41; vowelled Arabic 37/42; bilingual Study 131/143. The Study PDFs retain all 121 selected notes and the Qur'an source references with validated footnote pagination; the Reading PDFs contain no scholarly apparatus. Newly generated bilingual files place Arabic on the physical right. PDF bookmark outlines, metadata and clickable contents are provided; an iPad viewer may not honor the initial outline-pane preference.

Producer scripts: daruri/build/print_editions.py, daruri/build/build_editions.py and daruri/build/publish_editions.py. Additive automated publication: .github/workflows/daruri-a4-editions.yml; verification: .github/workflows/daruri-editions-qa.yml, daruri/qa/verify-ready-editions.js and daruri/qa/verify-editions-configurator.js. The PDF build and edition-selector QA runs succeeded. The release preserves daruri/daruri.pdf, its original page map and all existing section citations, five canonical PDF filenames, indexes, notes and Reader/Reading Desk. Do not replace the reference PDF or copy its page map from a compact PDF. Further editions development must merge with the latest master and preserve source-note and personal-print work.
