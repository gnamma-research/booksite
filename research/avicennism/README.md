# Late Avicennism — portable source-critical reader

**Stage 8 · 31 October 2026 · contextual, nonduplicative Late Avicennism edition · NAMA-ready portable package**

This self-contained scholarly application follows the **Tajrīd comparative sourcebook**’s navigation, reading desk, bilingual controls, responsive design and source-compare workflow. It is staged in the connected GNAMMA repository **only as a portable integration source**. The NAMA site is distinct and its repository/hosting connection has not been identified. Do not describe this commit or a GNAMMA Pages preview as NAMA publication.

## How to open

Open `index.html` in a browser with these files in the **same directory**:

- `reader.css`, `reader-foundation.js`, `reader-pages.js`, `reader-extras.js`, `reader-context.js`, `reader-scope.js`, `reader.js`.
- `corpus-primary.js` — six baseline source fascicles, fifteen late Persian/Indian/post-*Tajrīd* fascicles, one mediated Indian quotation.
- `corpus-analysis.js` — ten scholarly chapters and the background concept atlas.
- `argument-apparatus.js` — generated from explicit passage contexts, source-justified argument links, exact Tajrīd overlap and twelve post-Asfār transformation dossiers. Regenerate using `python research/avicennism/build_apparatus.py`, then `python research/avicennism/build_standalone.py`.

These scripts do **not** call external APIs and can run from `file://` when downloaded together. A one-file `standalone.html` variant embeds all local assets for simpler migration.

## What the reader actually contains

| Category | Records | Editorial status |
|---|---:|---|
| Avicenna / Lāhījī / Aquinas primary translation fascicles | 6 | Bounded English working translations, Latin/Arabic source anchors selective |
| Later Persian, Indian and post-Tajrīd fascicles | 15 | Source-linked argument units; some reported voices are nested in other authors |
| Faḍl-i Ḥaqq al-Khayrābādī annex | 1 | **Mediated historical quotation**, not independent inspection of 1904 print |
| Scholarly comparative chapters | 10 | Editorial synthesis with selected historical excerpts |
| Systematic research questions | 20 | Evidence-linked, not twenty fully completed editions |
| Explicit source-comparison debates | 10 | Editorial juxtaposition of primary/mediated sources |
| Outstanding witness leads | 11 | Not presented as translated primary autographs |

**Important:** The Arabic/Persian toggle displays only the original-language phrases actually transcribed in the existing working documents, not a complete parallel text for the English passages. If no source anchor has been transcribed, the original column says so and links to the edited source. This avoids pretending to have completed an Arabic/Persian diplomatic edition or manuscript collation.

## Distinctive later research — and what has been repaired

The independent **Tajrīd sourcebook** at `research/tajrid/` currently indexes 224 source records, 837 inherited Ṭūsī text units and 47 named/contextual works; these are heterogeneous source statuses, not 224 complete collations. This project **does not retranslate its sourcebook**. [Exact overlap register](TAJRID_DEDUP_AND_POST_ASFAR_SCOPE.json) locates shared pages: Lāhījī *Shawāriq* I:90–91 (Tajrīd NEW05/NEW06) and *Sharḥ al-Maqāṣid* p.79 (SN01/SN03), while noting distinct Astarābādī volume II vs Tajrīd volume I loci. Matching author/work without the same argument is not an exact duplicate.

A substantially new **independent Persian textual unit** is reconstructed in consecutive printed order: Lāhījī *Gawhar-i murād* Book III Sections I–VIII, **pp.278–309 (32 pages)**. It links what is made, unity/procession, separate intellects, elemental forms, rational souls, temporal dependence and willing. These are **connected working English renderings**, not a full Persian diplomatic edition or a collation of manuscript variants. [Stage 7 cumulative handoff](../intellectual-atlas/avicennian-summa/handoffs/STAGE_07_POST_ASFAR_DISTINCT_AND_TAJRID_DEDUP.md).

The new reader provides **What changed after Asfār?** (12 source-graded independent historical questions), **Tajrīd overlap audit**, **Historical transmission** (16 overlapping source families), **whole available contextual reading** (no short-excerpt cutoff) and **evidence-explicit comparisons** (never chosen by keyword similarity). Eight major research streams currently have no directly translated primary source; the displayed historical map states this.

### Integrity tests

- `python research/avicennism/build_apparatus.py --check` and `build_standalone.py --check`.
- `python research/avicennism/tests/verify_reader.py` and `verify_context_integrity.py`.
- `python research/avicennism/tests/verify_browser.py --browser chromium` and `--browser webkit` using a local HTTP server.
- `python research/avicennism/build_portable.py` creates the NAMA-ready ZIP with the modular and standalone editions.

**The entire centuries-long later tradition is not exhaustively translated**, and bibliographical works are never counted as direct witnesses. The goal is a truthful reader and a reproducible research basis.

## Reader actions

The app includes search across source text and editorial notes; a source/author/type catalogue; selection of sections; deep links; parallel English/original-anchor display; ten witness comparisons; twenty-domain map; witness register; dictionary; text size, order and theme settings; bookmarking; note-taking; note export/import; printing. Notes are held in browser local storage, not sent to a server.

## Source of truth and version control

- Historical English translation working files: `research/intellectual-atlas/avicennian-summa/PRIMARY_TRANSLATION_FASCICLE_*.md`
- Later commentary working files: `research/intellectual-atlas/avicennian-summa/LATE_FASCICLE_*.md`
- Separate mediated annex: `research/intellectual-atlas/avicennian-summa/INDIAN_PRIMARY_QUOTATION_01_KHAYRABADI_HEAT.md`
- Ten analytical chapters: `research/intellectual-atlas/avicennian-summa/chapters/`
- Witness status ledger: `research/intellectual-atlas/avicennian-summa/LATE_WITNESS_REGISTER_2026_10_31.json`
- Cumulative handoff: `research/intellectual-atlas/avicennian-summa/handoffs/STAGE_05_LATE_COMMENTATORS.md`

A source retranslation should update the Markdown first, then regenerate `corpus-primary.js`/`corpus-analysis.js`, revalidate the reader, and rebuild the one-file edition. Do not directly edit a duplicated English translation in the JavaScript corpus if the scholarly master also needs the correction.

## CI and release

Run `python research/avicennism/tests/verify_reader.py`, `verify_context_integrity.py`, and the Playwright cross-browser checks from `tests/verify_browser.py`; check the corresponding workflow run. A successful content commit does not establish a successful browser test or public deployment.

See [NAMA_INTEGRATION.md](NAMA_INTEGRATION.md) for the exact copy/publish steps and the Research entry snippet.
