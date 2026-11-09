# Stage 10 cumulative handoff — al-Mahāʾimī / Qūnawī

Date: **9 November 2026**. Work committed to `gnamma-research/booksite` on `master`.

## Current text layers

1. **Al-Mahāʾimī**, *Mashraʿ al-khuṣūṣ*: printed 2008 commentary pp.11–232. English first pass covers **all 222 printed pages**. Arabic imported for pp.11–149 and 230–232 (**142 pages**); pp.150–229 (**80 pages**) remain missing from the structured reader.
2. **Ṣadr al-Dīn al-Qūnawī**, separately printed *al-Nuṣūṣ*: seven English draft segments (not print-page aligned); online-source Arabic–English proofs of printed pp.235, 236, 267. Arabic still lacks page-specific imported transcription for pp.237–266 (**30 pages**).
3. **Independent online transcription** of Qūnawī: **47 Arabic–English excerpts**, about 8,147 Arabic words, now in the same matn/sharḥ reader, prominently labelled as *forum source*, without 2008 page-certainty. Existing independent Qūnawī corpus remains unchanged.
4. **Concordance**: 64 bidirectional contextual links, covering 61 distinct commentary pages, all targets checked as existing. Links do not claim sentence-by-sentence correspondence or philosophical agreement.

The corpus contains **278 entries**: 221 commentary sections, seven English Qūnawī sections, three appendix source proofs, and 47 independent online Arabic–English excerpts.

## Repository updates

- `texts/al-mahaimi/mashra-al-khusus/index.html`: Stage10 integrated layer-aware reader with 47 original-text sections and contextual links.
- `texts/al-mahaimi/mashra-al-khusus/data/parallel.json`: full source-labelled structured data, equal to the HTML's embedded JSON.
- `texts/al-mahaimi/mashra-al-khusus/editorial/APPARATUS_STAGE09.md`: existing source-critical apparatus, nine intra-2008-edition problems plus additional independent quotations.
- `texts/al-mahaimi/mashra-al-khusus/editorial/CONCORDANCE_STAGE10.md`: detailed 18-group inventory and **numbering mismatch warning**.
- `texts/al-mahaimi/mashra-al-khusus/data/coverage-stage10.json`: machine-readable status.
- `texts/manifest.json`, `texts/index.html`: corrected older 139-page catalogue entry.
- `tests/test_mahaimi_stage10.py` and `.github/workflows/mahaimi-stage10-integrity.yml`: committed regression checks.

## Critical cautions

- No photographic print-page collation; **zero actual manuscript collations**.
- Āshtiyānī's 335-page Qom edition (1421 AH, ISBN 964424804X) is bibliographically identified but its text was **not obtained or checked**. Do not cite it as a reading witness.
- The 2008 commentary quotation on p.232 reads **في الوجود**, while appended Qūnawī has **للوجود**; later reception by Jāmī supports the latter sense. Apparatus must retain both.
- Opening of final naṣṣ: 2008 commentary **توجب**, appended text **يوجب**, and separate online Qūnawī/Jāmī **بموجب**; keep variants, no unsupported critical emendation.
- The commentary's final `فإذا ظهرت آثار الوجود بشرط` remains syntactically incomplete in the online text and is followed by the printed editor's closing `آخره`; whether authorial or transmissional requires a physical edition/manuscript comparison.
- **Text numbering caution**: The forum's `QUN-NU-019-C` concerns affinities, whereas the working commentary places affinities under Text Twenty. Do not assign missing crosslinks by ordinal number alone.
- Original forum data includes text labelled as appended material; preserve those original warnings.

## Exact next actions

1. **Highest priority:** retrieve a scan/facsimile of printed p.232 and Āshtiyānī's edition, check the final sentence and APP-01/05.
2. Import commentary **Arabic pp.150–229**, page by page, separating Qūnawī lemmata from al-Mahāʾimī commentary and modern editor notes.
3. Import 2008 appendix **Arabic pp.237–266** and align the seven English sections against printed page boundaries.
4. Resolve the Qūnawī numbering differences by direct lemma matching, then expand contextual links for texts currently without links.
5. Verify sentences and variant readings against print facsimiles and real manuscripts before describing the work as a critical edition. Produce PDF only after this audit.

## Sources

- 2008 digital transcription https://ablibrary.net/book_content/b/9637/232
- Al-Mahāʾimī chapter 22 https://www.ibnalarabi.com/qunawi/khusus.php?id=32
- Āshtiyānī edition catalogue https://ge.nii.ac.jp/ncid/BA64748920
- Independent Qūnawī corpus https://github.com/gnamma-research/booksite/blob/master/texts/sadr-al-din-al-qunawi/al-nusus/data/parallel.json

**QA status:** Structural invariants were checked before committing the new HTML/JSON. Automated CI test and workflow have been committed, but a successful GitHub Actions run has not been independently observed. Live web deployment has also not been independently verified.
