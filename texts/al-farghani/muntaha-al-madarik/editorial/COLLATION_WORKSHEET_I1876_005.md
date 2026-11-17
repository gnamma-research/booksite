# Farghānī · I1876-to-manuscript working collation worksheet

**Status 9 November 2026:** photographic retrieval attempt launched; no I1876 image or manuscript reading has been visually checked in this project as of creation. A blank in the [CSV collation matrix](COLLATION_MATRIX_I1876_005.csv) means **not inspected**, never agreement with B2007. Only I1876 after photographic verification and historical codices actually seen may provide an independent textual reading.

## The immediate task

The [Princeton/NYU source](https://sites.dlib.nyu.edu/viewer/books/princeton_aco000264/1?embed=1&lang=en) indexes an 1876 volume I scan (368 canvases in machine-readable IIIF). A [reproducible script](https://github.com/gnamma-research/booksite/blob/master/tools/farghani_iiif_ingest.py) targets initial scan leaves and records the downloaded image URL, original PDF SHA-256, derived JPEG SHA-256, and contact sheets. **Scan ordinal is not the printed page number**. A separate physical printed-page concordance must be made by visually identifying each page label, opening sentence and ending sentence.

The immediate B2007 cruxes are the 12 loci in `CRITICAL_LOCUS_REGISTER_004.json`. After matching source pages, transcribe **exact** I1876 readings and line locations, attach images as evidence, and record whether they agree/differ from B2007. The 730 AH notice quoted in B2007 vol II p315 must be treated as evidence of an older transmission layer, not Farghānī's composition date (he died 699 AH).

## Acceptance tests for a critical text

- **Image provenance:** image and/or PDF source URL and SHA256; scan index, printed I1876 page, line, orientation; image visibly reviewed
- **Independent reading:** at least two independent photographed witnesses at each corrected locus; readings entered separately and with evidence; scribal alterations identified
- **Copy-text reason:** explicit ranking based on shared innovations and errors, not copy age alone
- **Editorial intervention:** `printed` / `MS-variant` / `orthographic-normalization` / `conjecture` / `translation-revision` are different values
- **Translation lockstep:** English revised only after Arabic lemma is settled, with a separate explanation of metaphysical register
- **Reproducibility:** original edition image and normalized image hashes; no silent transcription or source conflation

## Print-provenance note

[B2007, vol II p315](https://ablibrary.net/book_content/b/9607/315?lang=ar) reproduces the 1876 lithograph's ending, which names Muḥammad Shukrī al-ʿŪfī, `Maktab al-Ṣanāyiʿ`, and 1293 AH. It also contains an earlier 730 AH notice located in Egypt, chronologically **after the author**. A critical edition must inspect the original scanned final leaf and determine whether the 730 notice reproduces a copied manuscript colophon; the modern reproduced extract does not prove this. Princeton catalogues the printing as Istanbul, other scholars/catalogues Cairo/Bulaq; the colophon excerpt alone doesn't resolve the city.

## Current controls

- Critical English working draft for B2007 pp18–145 preserved in [full cumulative IV](FULL_CUMULATIVE_CRITICAL_004.md)
- 198 selected earlier digital Arabic–English checks, not 198 manuscript comparisons
- Nine priority manuscript codices in [witness census](WITNESS_CENSUS_CRITICAL_004.md)
- True independently attested manuscript variants: **zero** pending facsimile examination
