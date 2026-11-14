# Farghānī — Stage XVIII introduction-reader quality and error audit
**11 November 2026 · focus strictly on the 128-page English introduction and selected critical reader.**

## Editorial and source boundaries
Working English page labels 18–145: **128/128**; selected Arabic–English source checks: **559**, of which 283 are B2007 edited-digitized excerpt checks (pp18–60) and 276 are derivative transcript excerpt checks (pp61–145). Historical I1876 print photos have 15 bounded phrase comparisons (7 differences, 8 bounded agreements); **0 medieval manuscript variants** and **0 wholly proofread Arabic printed pages**. The work is **not** a linguistically definitive critical edition merely because the interface and page coverage now pass QA. The *Tāʾiyya* verse commentary is intentionally excluded.

## Reader architecture implemented
- Canonical full working introduction: `../continuous-translation.html`. Original page anchors `b2007-p18` through `b2007-p145` and five foundation/preface boundaries retained.
- Full-text index searches **English paragraphs on all 128 page labels**, not merely the 32 extracts. Text remains static HTML and readable without JavaScript.
- Contents with page/foundation navigation, individual source/notes panel, source-grade handoff to `critical-edition.html?page=...`, bookmarks and recent reading place in local browser storage, reading-progress indicator, font scaling, full/standard text width, paper/mist/night appearance, print layout, quiet focus with Exit/ESC, citation copying.
- Narrow-screen UI: opaque sticky header/navigation and discreet “Aa · Tools” panel for advanced options; desktop exposes controls without a mobile panel; tested with 390px phones and 1440px desktop.
- Historical source and editorial notes: separate, collapsed scholarly apparatus **128 source entries, 70 optional notes**. No commentary in the continuous reading prose. Curated original 32-extract bilingual view remains available but is explicitly labelled partial rather than the full introduction.
- Critical selected-record reader: still **559**, now renders 60 at a time to avoid loading all records into the DOM on mobile, supports filters/search and page deep links, collapsed original 1876 print photograph evidence, source grades and print-all mode.

## Concrete textual-display errors found and repaired
| Locus | Defect | Disposition |
|---|---|---|
| 11 page openings | Bracketed “Continuing p…” labels interrupted authorial prose | Removed markers; kept translated sentences |
| B2007 pp92,124 | Editor's progress/status paragraphs embedded within translation | Moved to the keyed scholarly apparatus |
| B2007 p83 | Literal `*<em>…istiwāʾ***` | Repaired HTML emphasis and retained meaning |
| B2007 p113 | Literal Markdown `**prophethood …**` appeared in HTML | Converted to correct semantic bold emphasis |
| B2007 p21 | Broken nested emphasis around `wāḥidiyya/aḥadiyya` | Normalized valid emphasis without changing wording |
| B2007 p31 | Malformed `*<em>existence</em>*` | Normalized English/Arabic term emphasis |
| B2007 p34 | Bad nested markup inflated emphasis through divine-name explanation; multiple escaped Markdown title delimiters | Corrected nine exact formatting fragments, preserving wording |
| B2007 p34 in canonical Markdown | Earlier online digital `الحضرة العملية` was incorrectly still shown as running English | Aligned source Markdown and HTML with already recorded photographed I1876 `الحضرة العمائية`, “Cloud-like Presence”; digital variant remains in scholarly apparatus |
| Navigation jump | Double sticky offset caused p70 selected to display p69 as current | Removed duplicate `scroll-padding-top`, retained section offset; end-to-end browser checks verify |
| Reader scope | 32-extract page claimed introduction unfinished | Clarified English introduction is complete *as a working draft*; 32 selected Arabic extracts are partial |
| Source links | 128 link-only paragraphs and 70 notes interrupted continuous reading | Relocated out of running prose; original page keys unchanged |

No new substantive authorial Arabic readings were independently established in Stage XVIII. The p34 choice derives from the *existing* historical-print comparison, not a new manuscript observation.

## Automated regression and accessibility checks
`tests/farghani/verify_reader.py` tests:
- Full 128 source sections in order, all 128 original anchors, 5 major parts, 128 source apparatus entries, minimum 850 English paragraphs.
- 559 machine-readable selected critical records across 128 source labels and the exact 283/276 provenance division.
- Semantic HTML closure/unique IDs, local links, source grades, critical reader hooks, missing text protection.
- Absence of bracketed continuation fragments, literal Markdown/HTML emphasis corruption, leaked progress notes.
- Correct p34 source render and catalogue count.

`tests/farghani/verify_browser.py` tests:
- Chromium and WebKit (Safari engine) desktop and phone navigation, search, bookmarked pages and persistence.
- Correct page indicator when jumping; notes per page; text sizing/theme/compact phone advanced controls; focus and exit; print mode.
- No horizontal overflow and no JavaScript exceptions; 559 critical records loading, page-filtered selected records and screenshots.

Workflow: `.github/workflows/farghani-introduction-reader-qa.yml` uses supported Playwright Ubuntu Noble container. Historical browser pass: [run 42973208161](https://github.com/gnamma-research/booksite/actions/runs/42973208161) tested Chromium + WebKit on desktop and phone (4/4 passed); screenshots in attached run artifact. **Always check the newest workflow run for the final Stage XVIII commit separately.**

## Preserved full recovery
- [Stage XVIII entire working English, selected bilingual data and book-specific reader source archive](FULL_CUMULATIVE_READER_018.md), with each file’s SHA/byte length.
- [Stage XVII before-state and prior archive](FULL_CUMULATIVE_READER_017.md).
- The actual photographed JPEG facsimiles are still separate under `../facsimile-I1876-hires/images/`, and the site's shared base stylesheet resides under `../../al-turka/qawaid-al-tawhid/reader.css`.
- No copyrighted modern scan is embedded as a redistributable PDF; unavailable source candidates do not count as inspected.

## Remaining honest limitations
- Exhaustive *linguistic source collation* of the 128-page English draft against an independently authenticated full Arabic copy-text remains outside the completed interface QA.
- The original B2007 physical printed pages and manuscript folios at disputed loci remain uninspected.
- Actual end-user perception on every individual iOS device cannot be proved from automated WebKit screenshots alone, but the WebKit mobile and Chromium mobile interaction paths are covered.

**Reader-specific next step:** preserve future successful browser QA on each change and resolve any new reported failures before release; do not expand into main poem commentary.
