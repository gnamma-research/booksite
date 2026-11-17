# Stage 11 cumulative handoff — al-Mahāʾimī / Qūnawī (10 November 2026)

**Working repo:** `gnamma-research/booksite`, `master`; reader at `texts/al-mahaimi/mashra-al-khusus/index.html`. The new critical-witness register is `editorial/WITNESS_REGISTER_STAGE11.md`. This is a *working text*, **not** a definitive critical edition.

## Progress in distinct dimensions

| Measure | Completed | Remaining |
|---|---|---|
| Al-Mahāʾimī first-pass English | **222/222** printed commentary pages (11–232) | Clause-level accuracy audit; problems noted |
| Al-Mahāʾimī Arabic in reader | **142/222** (11–149 and 230–232) | **80** pages, pp.150–229 |
| Qūnawī original, 2008 appendix Arabic | **5/33** digitally indexed page proofs (235–238,267) | **28**, pp.239–266 |
| Additional Qūnawī online Arabic–English | 47 excerpts from **separate forum transcription** | Entire 2008 page and textual collation |
| Commentarial correspondence | 64 contextual **plus 19** 2008 same-edition Arabic lemma matches | Expand and verify; *not* manuscript variants |
| Actual manuscript witnesses **identified** | **1**, Leiden University Libraries **Or. 5675** | Obtain legal facsimile and catalogue end folios |
| Manuscript facsimile images **inspected by project** | **0** | Full source inspection |
| Manuscript folios **critically collated** | **0** | Manuscript/textual comparison |
| Āshtiyānī edition | Bibliographically identified, 335pp, Qom 1421AH | Acquire copy; no readings assumed |
| Reader data | **280 entries** in synchronized inline HTML and JSON | Source completion and apparatus audit |

## Accomplished this stage

- Imported Qūnawī original's existing 2008 digital indexed Arabic–English proof pages **237–238** into `data/parallel.json` and HTML; pages 235,236,267 were already there.
- Built 19 lemma-based *reversible* links (min. 15 unique matching normalized Arabic five-token phrases) between Qūnawī appendix pp.235–238,267 and commentary pages 72,74–90,230–232. This is exact lexical overlap in the **same edition**, not evidence from an independent MS. `data/appendix-lemma-concordance-stage11.json`.
- Preserved existing 64 links to 47 separately transcribed forum matn excerpts; source-specific numbering and statuses preserved.
- Fixed a dead reader apparatus link; added witness/register UI and progress ledger, kept Arabic-missing blanks explicit.
- Updated `tests/test_mahaimi_stage10.py` for **Stage11** (filename retained for continuity), `texts/manifest.json`, and `data/coverage-stage11.json`. A Stage11 CI test passed after the initial page-proof import; inspect latest runs before claiming overall green.
- **New manuscript identified:** Leiden University Libraries **Or. 5675**, 362 Arabic folios, dated 1142 AH (1729–30), once owned by Sultan Muḥammad Shifāʾ of Banten. Wittkam's *Inventory*, vol.6 (Leiden 2007), printed p.183. A.C.S. Peacock reports copyist Muḥyī al-Dīn b. Shaykh ʿAbd al-Shakūr b. ʿAbd al-Karīm b. al-Sulṭān Abū al-Mafākhir; his figure captions identify beginning and colophon imagery. The Gregorian conversion 1142/1749 in one figure caption is inconsistent: 1142 AH is 1729–30 CE. This is a **catalogue-authenticated acquisition target**, not a collated text.
- **New reception insight:** a 2025 peer-reviewed paper by Muhammad Dluha Luthfillah analyzes the Or.5675 manuscript's *interlinear Javanese* translation, particularly the grammatical particle `utawi`. DOI 10.5617/jais.12698. Record as interlinear teaching/reception evidence, distinct from the Arabic textual witness itself.
- Source accession test in research runner: `ablibrary.net` disallowed automated fetch by `robots.txt`; `najafdesertlibrary.com` returned HTTP 403; `ibnalarabi.com` TLS failed. No restrictions bypassed. Therefore the **80 + 28 missing Arabic pages were NOT bulk imported**.

## Unresolved readings and priorities

1. 2008 embedded Qūnawī quotation (commentary p.230) `توجب`; appendix p.267 `يوجب`; independent online text/reception `بموجب`. Distinguish the witness of each reading, no arbitrary preferred text.
2. 2008 p.232 `الظهور في الوجود` vs appendix p.267 `الظهور للوجود`; latter also in Jāmī's reported quotation. This is not yet a manuscript-collated stemma.
3. 2008 commentary electronic text on p.232 stops abruptly at `فإذا ظهرت آثار الوجود بشرط` and prints `آخره`; do not fill in the rest from Qūnawī's different original text.
4. 2008 appendix p.236 repeats `علمه بنفسه في نفسه في نفسه`; preserve while an actual source image and manuscript witnesses are sought.
5. **Immediate high-priority acquisition:** manuscript **Leiden Or.5675** last folios and colophon + Āshtiyānī edition. Only after the original page images are present can we establish the true text at p.232 and start actual variant collation.
6. Import commentary Arabic pp.150–229 and original Arabic pp.239–266 from an authorized digitization or user-supplied scans; retain printed page headers, Qūnawī/matn vs al-Mahāʾimī/sharḥ voices, editorial notes separate; then audit first-pass English clause by clause.

## Links

- Reader: https://github.com/gnamma-research/booksite/blob/master/texts/al-mahaimi/mashra-al-khusus/index.html
- Exact ledger: https://github.com/gnamma-research/booksite/blob/master/texts/al-mahaimi/mashra-al-khusus/data/coverage-stage11.json
- Apparatus: https://github.com/gnamma-research/booksite/blob/master/texts/al-mahaimi/mashra-al-khusus/editorial/APPARATUS_STAGE09.md
- Witness register: https://github.com/gnamma-research/booksite/blob/master/texts/al-mahaimi/mashra-al-khusus/editorial/WITNESS_REGISTER_STAGE11.md
- Wittkam, Leiden Or.5675 catalogue p.183: https://bibliography.mk.iq/files/0e8ddc804348667f.pdf
- Peacock, *Arabic Literary Culture in Southeast Asia*: https://urn.ub.unibe.ch/urn%3Ach%3Aslsp%3Azbz%3A9004548785%3Aihv%3Apdf
- Luthfillah (2025): https://doi.org/10.5617/jais.12698
- Āshtiyānī Qom edition NCID BA64748920: https://ge.nii.ac.jp/ncid/BA64748920
- Source access probe `tools/mahaimi_page_probe.py` and `.github/workflows/mahaimi-source-probe.yml` documented in GitHub actions. No automated source scraping claimed.

## For next continuation

Focus on **content acquisition and collation**, not cosmetic UI or further summarization. If scans cannot be lawfully retrieved, verify this and preserve 142/222 and 5/33 as-is. Never represent a planned stage, a catalogued witness, or a standalone translated section as a manuscript-collated Arabic page. Report all three coverage rates in progress messages.
