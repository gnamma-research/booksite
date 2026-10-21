# Darūrī Editions interface — option audit (22 October 2026)

Status: design proposal; not a claim that every proposed control has been deployed.
The three top-level tabs **Reading / Study / Reference** should remain.

## Recommendation: Compact rows (Option A)

Visible within each edition tab, in this order:
1. **Text** — EN and AR independently switchable, at least one required; Arabic vowel marks shown only when AR is active.
2. **Headings** — Recorded / Editorial guide.
3. **Include** — Glossary, Index, Applications, Concordance, with small, consistent line icons and real text labels.
4. **My copy** — My notes, Bookmarks; a direct local-export link only when personal annotations are selected.
5. **Selected PDF** — short persistent factual specification and exact availability.
6. **Open PDF** — a single centered, full-width primary action (no duplicate Read/Download/Print buttons).
7. **More settings** — supplementary rare tools, aligned SVG chevron, no font glyph.

### Per-tab semantic differences

**Reading**
- Publisher notes are absent by definition; don't show selectable Full/Selected publication notes.
- Show English or bilingual apparatus variants as available only when a *verified exact PDF and map* exist.
- For Arabic-only Reading, English-language apparatus must not be silently attached; communicate ineligibility.
- A4 and side-by-side bilingual layout are inherited by the published PDF, not offered as fake alternatives.

**Study**
- Baseline publication contains Selected publisher notes and a Basic index.
- A Full index is additional, not a replacement: explain that the standard Basic index remains.
- Scholarly-only hadith source notes are excluded from Reading and Study.
- Only currently published Study language/layout profiles should be selectable. Do not present nonexistent translations as downloadable.

**Reference**
- The canonical published bilingual scholarly PDF already contains its full publisher apparatus,
  historical dictionary, full index, applications and R/BA concordance.
- Show those items as an *inventory* with labels, not as toggles suggesting an unpublished
  scholarly PDF exists without them.
- Personal notes/bookmarks can still be appended locally to that exact PDF.

## Label audit

| Existing label | Proposed visible label | Method |
|---|---|---|
| Customize | More settings / Options | SVG chevron at far right or plus/minus (never a baseline-sensitive Unicode glyph) |
| Text selection | Content | Remove from published PDF settings until partial PDFs actually exist |
| Complete work | Full text | Status, not a multi-choice control |
| Paper: A4 · Published print size | A4 | Document metadata, not a choice |
| Bilingual arrangement: Side by side / Stacked | Parallel | Metadata for published PDF; Stacked hidden until prebuilt |
| Print density: Published / Compact | Print layout | Hide unless compact PDF is real |
| Recorded headings | Recorded | Word label |
| Editorial headings | Editorial guide | Word label |
| Publisher notes | Edition notes | Read-only tier-specific summary |
| Include my notes | My notes | Toggle with small pen icon |
| Include my bookmarks | Bookmarks | Toggle with small bookmark icon |
| Glossary / dictionary | Glossary | Line icon + word; historical dictionary must retain its full label on Reference |
| Subject index | Index | Line icon + word; Basic/Full detail in the summary |
| Bidāya applications | Applications | Word label; explanatory tooltip |
| Textual concordance (R/BA) | Concordance | Word label; contextual explanation 'R/BA correspondences' |
| Open local personal PDF tools | Make personal PDF | Link in My copy |

## Alternatives

**A. Compact rows**: no nested category tabs, four readable rows and centered Open PDF;
best for mobile and frequent use. Preferred.

**B. Guided groups**: Text and headings / Study apparatus / My Reading Desk, each with short
explanatory text. Better for first-time readers, but more scrolling.

**C. Settings + document preview**: two-pane desktop design, settings left and summary
right; mobile stacks the panes. Better for desktop publishing workflows.

## Contract

- Do not generate public PDFs at request time.
- Never offer or substitute an unverified combination.
- Leave private notes in the browser; append P-numbered pages only on the user's device.
- Keep 258 source-section maps and apparatus-entry maps bound to exact PDF SHA.
- Continue to treat unverified word-level precision as a safe section-level fallback.
- Keep the three existing edition tabs and existing reader color themes intact.
- If many static PDFs are added, keep the public manifest compact; maps load only for
  the selected PDF rather than every variant.
