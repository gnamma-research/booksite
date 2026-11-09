# Farghānī, *Muntahā al-madārik*: first independent historical-print collation

**9 November 2026 · Evidence grade: direct visual inspection of a historic printed facsimile.**

## Witnesses and page concordance

- **I1876**, *Muntahā al-madārik*, 1293/1876 historical printing, Princeton University Libraries / NYU Arabic Collections Online, volume I, public scan set `princeton_aco000264`. Directly examined **I1876 printed p. 18, scan index 22 of a 368-page low-resolution PDF** (scan label visibly shows printed page ١٨; scan index is independently established by opening the scan itself).
- **B2007**, modern Beirut edited text by ʿĀṣim Ibrāhīm al-Kayyālī, volume I **printed p.34**, digital page https://ablibrary.net/book_content/b/9606/34?lang=ar. Context: naming the second determination under the consideration of a comprehensive intermediary between unity and multiplicity.
- **B2007 internal comparison**, p.36, https://ablibrary.net/book_content/b/9606/36?lang=ar, uses `الحضرة العمائية` for the same Cloud-like Presence.
- **Media provenance:** original PDF https://mc.dlib.nyu.edu/files/books/princeton_aco000264/princeton_aco000264_lo.pdf, **SHA256 `d2c73c571e869df040f263b5146a1f42ce33f691a9c4a556c1e6eb01f3bf8f87`** (37,299,689 bytes, 368 scans); derived source PNG/JPEG in [retrieved GitHub Actions artifact](https://github.com/gnamma-research/booksite/actions/runs/42536981050/artifacts/13639926426), acquired with tool [farghani_iiif_ingest.py](https://github.com/gnamma-research/booksite/blob/master/tools/farghani_iiif_ingest.py). JPEG scan #22 derived SHA256 `5dafe2aaa9561e85c128f22b07c5642a64cbac96fbf79b3aad8ef1941d1d10bf`. Images are resized review copies, not a manuscript edition.

## Collation C005-01: the Cloud-like Presence

| Textual locus | Reading | Evidence |
|---|---|---|
| I1876, printed **p.18**, PDF scan **22**, near upper body line 6 | `مفصّلة متميّزة سمّي بالحضرة العمائية` | Direct inspection of the photographed 1876 printing. Word and immediate context visible. Modern punctuation and vocalization in this register are editorial. |
| B2007, printed **p.34** | `مفصّلة متميّزة سمّي بالحضرة العملية` | Modern edited digital Arabic from same paragraph. |
| B2007, printed **p.36**, internal same-referent parallel | `فمسمّى بالحضرة العمائية` | Internal doctrinal and lexical parallel (not a second independent witness). |

**Recommended edited lemma for B2007 p.34 corresponding to I1876 p.18: `الحضرة العمائية` (the Cloud-like Presence).** Apparatus: `العمائية I1876 (ص ١٨، الصورة ٢٢)؛ العملية B2007 (ص ٣٤)`. The independent historical printing removes the previous need to mark `العمائية` merely as a conjecture. There is a real **printed-text difference** between I1876 and B2007. It does **not** establish which reading was present in any specific medieval manuscript, since none has yet been photographed and collated here. It does not establish that I1876 is the authorial archetype in general.

**Meaning:** *al-ʿamāʾiyya* connects to the Akbarī `ʿamāʾ` or Cloud, an intermediary and comprehensive locus of the second determination. The Beirut `al-ʿamaliyya` would mean practical/operative and contradicts the same-referent p36 usage; the historic print confirms that the existing working English **“Cloud-like Presence”** need not be changed at this point.

## Methodological caution

The scan set is identified, and a first **individual textual locus** has been visually collated. This is **NOT** a page-by-page independent text-check for I1876 p18 or surrounding pages. The remaining cruxes (B2007 p18–33, particularly `في عون هذا` at p33) remain unresolved until their exact visual readings are transcribed and compared. **No medieval manuscript variants have been verified.** The full 128-page Arabic critical edition is not constituted merely by this single historical print difference.

## Source preservation and reproducibility

- [Princeton/NYU scan viewer](https://sites.dlib.nyu.edu/viewer/books/princeton_aco000264/1?embed=1&lang=en) / [low resolution PDF](https://mc.dlib.nyu.edu/files/books/princeton_aco000264/princeton_aco000264_lo.pdf).
- [GitHub Actions artifact holding 59 digitized historic scan images and contact sheets](https://github.com/gnamma-research/booksite/actions/runs/42536981050/artifacts/13639926426).
- Page locator at p18 (I1876) = scan22 (1-indexed). B2007 p34 is a separate coordinate, not an equation of printed page numbers.
- Date, scan index, exact printed lemma, witness status and proof class are registered in `CRITICAL_LOCUS_REGISTER_004.json`, `WITNESS_REGISTER.json` and `COLLATION_MATRIX_I1876_005.csv`.
