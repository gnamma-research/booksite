# Late Avicennism — portable source-critical reader

**Stage 6 · 31 October 2026 · NAMA-ready deployment package**

This self-contained scholarly application follows the **Tajrīd comparative sourcebook**’s navigation, reading desk, bilingual controls, responsive design and source-compare workflow. It is staged in the connected GNAMMA repository **only as a portable integration source**. The NAMA site is distinct and its repository/hosting connection has not been identified. Do not describe this commit or a GNAMMA Pages preview as NAMA publication.

## How to open

Open `index.html` in a browser with these files in the **same directory**:

- `reader.css`, `reader-foundation.js`, `reader-pages.js`, `reader-extras.js`, `reader.js`.
- `corpus-primary.js` — six earlier translated source fascicles, eleven later primary fascicles, one mediated Indian quotation.
- `corpus-analysis.js` — ten thematic scholarly chapters, twenty domains and ten comparative questions.

These scripts do **not** call external APIs and can run from `file://` when downloaded together. A one-file `standalone.html` variant embeds all local assets for simpler migration.

## What the reader actually contains

| Category | Records | Editorial status |
|---|---:|---|
| Avicenna / Lāhījī / Aquinas primary translation fascicles | 6 | Bounded English working translations, Latin/Arabic source anchors selective |
| Later Persian, Indian and post-Tajrīd fascicles | 11 | Source-linked argument units; some reported voices are nested in other authors |
| Faḍl-i Ḥaqq al-Khayrābādī annex | 1 | **Mediated historical quotation**, not independent inspection of 1904 print |
| Scholarly comparative chapters | 10 | Editorial synthesis with selected historical excerpts |
| Systematic research questions | 20 | Evidence-linked, not twenty fully completed editions |
| Explicit source-comparison debates | 10 | Editorial juxtaposition of primary/mediated sources |
| Outstanding witness leads | 11 | Not presented as translated primary autographs |

**Important:** The Arabic/Persian toggle displays only the original-language phrases actually transcribed in the existing working documents, not a complete parallel text for the English passages. If no source anchor has been transcribed, the original column says so and links to the edited source. This avoids pretending to have completed an Arabic/Persian diplomatic edition or manuscript collation.

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

Run `python research/avicennism/tests/verify_reader.py` and the Playwright cross-browser checks from `tests/verify_browser.py`; check the corresponding workflow run. A successful content commit does not establish a successful browser test or public deployment.

See [NAMA_INTEGRATION.md](NAMA_INTEGRATION.md) for the exact copy/publish steps and the Research entry snippet.
