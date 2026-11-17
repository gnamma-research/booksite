# Bibliographical audit: the 1293/1876 printing of Farghānī’s *Muntahā al-madārik*

**Status, 9 November 2026:** a bibliographical discovery, NOT an inspected page of the 1876 facsimile. The modern Beirut editor's transcription of the lithograph's ending is **indirect printed testimony**. Direct photographic comparison is reserved for the original Princeton/NYU I1876 scan.

## Primary published evidence, restricted and identified

1. **I1876 object (Princeton/NYU ACO):** `princeton_aco000264`, vol. I, catalogue gives Istanbul, 1293/1876, with publicly linked 245.67 MB high-res and 37.30 MB low-res facsimiles. [Catalogue / viewer](https://sites.dlib.nyu.edu/viewer/books/princeton_aco000264/1?embed=1&lang=en).
2. **B2007 editor's transcription of lithograph colophon:** the digital copy of Beirut vol. II, printed p.315, [direct source](https://ablibrary.net/book_content/b/9607/315?lang=ar), contains in a footnote the prior lithographic ending, including the phrases `فوقع طبعه في مكتب الصنائع` and `سنة ثلاث وتسعين بعد المائتين والألف`. It names the printing corrector `محمد شكري الأوفى`, identifies his teacher Aḥmad Ḍiyāʾ al-Dīn al-Gumushkhānawī, and refers to an order attributed to the Kashghar envoy Yaʿqūb Beg. Its own modern edition has not independently established the city of printing.
3. **Earlier copied-text notice included in that same later transcription:** `تمّ في سنة ثلاثين وسبعمائة`, at a khānqāh in Egypt, i.e. **730 AH**, after Farghānī's death (699 AH). Therefore this is **not a plausible authorial completion date**. It requires identification as a copyist's, exemplar's or transmitted colophon, and physical checking of the 1876 printing before any definite classification.
4. **Contradictory secondary catalogues:** Princeton ACO says **Istanbul**. Indiana University Bloomington catalogues a seemingly corresponding two-volume `Maktab al-Ṣanāyiʿ` printing **[Cairo?]**, and Chittick (2025, p.27 n.12) calls it Cairo 1876. Homerin's review (2009) cites Istanbul: Maktab al-Sanāʿī. We must not manufacture two editions, or assume there is only one, without physical title/ending comparison. [Indiana record](https://iucat.iu.edu/iub/2867614); [Chittick 2025](https://traditionalhikma.com/wp-content/uploads/2025/06/Farghani_on_Wahdat_al_Wujud_in_the_Four.pdf); [Homerin 2009](https://knowledge.uchicago.edu/record/1162).

## Hypotheses, NOT adopted readings

- The designation Maktab al-Ṣanāyiʿ may identify a printer, not unambiguously a city; the 1876 colophon passage reproduced in B2007 vol. II p315 does not by itself settle city.
- The earlier 730 AH formula may have been carried forward from the manuscript exemplar of the 1876 print. The original manuscript's identity and lineage are currently **unproved**. A date in a printed note is not an inspected dated manuscript.
- A stronger-than-usual need for an **I1876–B2007 page and textual concordance** follows, because B2007 may have reproduced errors from the print and the original printing itself might represent an uninspected exemplar family.

## Evidence acquisition status

A reproducible Princeton public-domain scan-ingestion script and a GitHub Actions workflow have been saved:
- [Script](../../../tools/farghani_iiif_ingest.py) (root-relative path should be checked from site deployment)
- [Workflow](https://github.com/gnamma-research/booksite/blob/master/.github/workflows/farghani-historical-facsimile-ingest.yml)
- [Specific GitHub run](https://github.com/gnamma-research/booksite/actions/runs/42536621038)

The workflow does **not** grant manuscript verification: each extracted scan requires actual visual inspection and reliable printed-page alignment; the same rule applies to 730 AH transmitted notice and to B2007 p19, p25, p29, p33–34 cruxes.

## Required first-hand verification

(1) Confirm the lithograph title/printing and final leaf in actual I1876 image; (2) verify the exact Arabic of both date notices and signs of whether a change of hand/text starts; (3) document copy, printed page and scan index; (4) compare a second 1876 holding to distinguish identical impression and separate printing; (5) relate the 730 date to its immediate ending/copyist context before using it in a stemma.
