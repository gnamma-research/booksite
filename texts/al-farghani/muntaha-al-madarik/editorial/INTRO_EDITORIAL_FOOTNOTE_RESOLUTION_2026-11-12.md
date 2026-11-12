# Farghānī — final reviewed note-boundary reconciliation
**12 November 2026 · digitized Beirut (B2007) working source, introduction pp.18–145**

## Scope and results
The full 128-page source sequence and English working translation remain intact. A complete-source scan (rather than only the previously flagged 15) identified **16** digitized Arabic pages whose modern editorial footnote text was joined to the authorial prose. Footnote (1) on pp.20 and 25 was initially missed by the first heuristic; the full scan exposed it. The false-positive on p.26 was a *Qurʾānic verse number* (Q 30:7), preserved in the original reading. Thus **17 reviewed loci = 16 note separations + one non-note**.

Exact source-grade: these corrections are based on a named online Beirut edited-digital witness, whose structure marks the modern footer as *hāmish*. The online source's separate structure was directly rechecked for pp.20, 21, 23, 25 and 29. On other pages the distinct numbered bibliographic/glossary source footer and the preserved original raw text provide evidence, not newly inspected printed leaves.

All **16 raw page transcription strings are unchanged**; each can be reconstructed exactly as `reading_ar + " " + editorial_notes`. Earlier already isolated note content was kept, including all five numbered notes from p.20 and all four from p.23. The cleaned text appears in the page-aligned bilingual reader and the source Markdown; the notes are retained in per-page study apparatus. **39 of the 128 pages** now have identified separated modern editor notes. No prior partial translation claims or separate historical-print comparison reports are inflated.

## Reviewed pages
| B2007 page | Modern note start (short cue) | Authorial reading characters | Editorial notes (characters) | Decision |
|---:|---|---:|---:|---|
| 20 | (1) · رواه مسلم في صحيحه | 835 | 1584 | Reversibly separated modern note from source footer |
| 21 | (1) · أورده الحكيم الترمذي | 1758 | 290 | Reversibly separated modern note from source footer |
| 23 | (1) · هذا الأثر لم أجده | 1679 | 533 | Reversibly separated modern note from source footer |
| 25 | (1) · هذا الأثر لم أجده بلفظه | 1791 | 341 | Reversibly separated modern note from source footer |
| 29 | (1) · أورد العجلوني | 1834 | 96 | Reversibly separated modern note from source footer |
| 47 | (1) · أورده المناوي | 1687 | 129 | Reversibly separated modern note from source footer |
| 48 | (1) · عزاه السيوطي | 1539 | 161 | Reversibly separated modern note from source footer |
| 67 | (1) · الكيزان : جمع | 1950 | 36 | Reversibly separated modern note from source footer |
| 83 | (1) · الإلّية : ربانية | 1786 | 150 | Reversibly separated modern note from source footer |
| 87 | (1) · كذا بالأصل وهي غير | 1934 | 39 | Reversibly separated modern note from source footer |
| 112 | (1) · كذا بالأصل | 1700 | 18 | Reversibly separated modern note from source footer |
| 115 | (1) · هذا الخبر لم أجد | 1970 | 55 | Reversibly separated modern note from source footer |
| 118 | (1) · فذلك حسابه | 1993 | 134 | Reversibly separated modern note from source footer |
| 128 | (1) · الشّمس والشّموس | 1560 | 178 | Reversibly separated modern note from source footer |
| 130 | (1) · أورده العجلوني | 1842 | 67 | Reversibly separated modern note from source footer |
| 136 | (1) · أورده الإمام الجرجاني | 1859 | 54 | Reversibly separated modern note from source footer |
| 26 | Qurʾān, Q 30:7 | unchanged | 0 | Verse number retained, no editorial note |

## Preservation and limitations
- Preserve Farghānī’s unfinished sentence at any printed-page break rather than replacing it with editorial prose. Do not merge two page units into one and do not fabricate sentence completions.
- The source-portal notes and cross-references, which often begin with bibliographical expressions, are **modern editorial apparatus**, not Farghānī’s authorial matn. They are kept as historical witness metadata.
- The *parallel-introduction.html* and the source data/Markdown now agree; Arabic–English remains aligned **by printed page only**. No complete line-by-line comparison of the original 1876 printing, independent medieval manuscript verification, or full proofreading of the working English is claimed.
- Clearing 17 targeted digital flags **does not prove the entire Arabic source is free of uncertain readings, other editorial interpolations or omissions**. The printed witness and manuscript tasks remain separate.
- Future source regeneration in `tools/farghani/build_intro_parallel.py` uses a closed set of reviewed page-specific numbered footer cues and fails if a cue changes, preventing silent reversal.

## Audit trails
- `data/intro-arabic-b2007-digital.json`: original raw source and clean reading fields, recorded decision per page.
- `editorial/INTRO_SOURCE_AUDIT_019.json`: current aggregate, 559 selected source-check records remain unchanged.
- `editorial/INTRO_PAGE_COVERAGE_019.csv`: updated word counts, 128 page positions.
- `editorial/INTRO_ARABIC_DIGITAL_18_145_019.md`: clean main Arabic with hidden notes retained in details.
- `tests/farghani/verify_reader.py` and `tests/farghani/verify_browser.py`: link, text, original-source reversibility and view-layer regression gates.
