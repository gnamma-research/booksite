# GNAMMA · Arabic Source Corpus Verification Register

**Status: source-attested corpus integration — 7 November 2026. Not a completed critical edition of any one work, and not a complete historical corpus of all Islamic sciences.**

## Scope and evidence of acquisition

- **28** curated canonical work/version records with links to the exact OpenITI source file, version-level metadata and Git blob identity.
- The source version is pinned to OpenITI/RELEASE commit `cfc4157a3cf2054c0888f133970a4eaa3e22e58c` (2026-02-09).
- **Five** Arabic source files have been copied completely (unaltered) into GNAMMA: al-Shāfiʿī's *al-Risāla*, al-Nawawī's *al-Arbaʿūn*, Ibn Mālik's *Alfiyya*, Ibn ʿArabī's *Fuṣūṣ*, and ʿAbd al-Qāhir al-Jurjānī's *Asrār al-balāgha*. Their Git blob SHAs **match** the corresponding OpenITI SHA values.
- **23** more text versions are not mirrored locally, but have pinned, source-checked files that the GNAMMA browser reader loads **on demand**. The reader performs an independent Git blob identity check after transfer. A source link is also exposed if network fetching is blocked.
- Every entry is a **specific digital version**. Its chapter divisions, headings, page markers, spelling, lacunae and published-edition genealogy may be imperfect. File identity is a necessary provenance condition, *not* proof that the historical Arabic text is critically edited or complete.

Original source: [OpenITI initiative](https://openiti.org/documentation/) · [source repository and exact commit](https://github.com/OpenITI/RELEASE/tree/cfc4157a3cf2054c0888f133970a4eaa3e22e58c) · [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). Preserve OpenITI attribution and license notices, avoid commercial redistribution, and do not conceal source/edition qualifiers.

## Quality gates

| Gate | Result | Meaning |
|---|---|---|
| Named work, attributed author, specific OpenITI version file exists | **28/28** | Exact GitHub paths and blob SHA verified in OpenITI version repository and RELEASE |
| Version-level metadata and annotations examined | **28/28** | Catalogued commentary/issue flags, provenance data and edition caveats preserved |
| Complete source file mirrored byte-for-byte in GNAMMA | **5/28** | Exact Git SHA-1 blob identity comparison against OpenITI |
| Pinned remote source for on-demand full-file reading | **23/28** | No claim about all future network or browser CORS conditions |
| Text aligned to a print edition and independently line-by-line collation | **0/28** newly performed | Provider annotations/edition references are not GNAMMA manuscript collation |
| Source-verified isn'tād network, matn variants, legal issue alignments | **not complete** | New textual relationships cannot be inferred merely from source availability |
| Complete corpus of every science / every madhhab / every commentary | **not complete** | Current registry is a deliberately curated first tranche |

**Important defects already in source version metadata:**

- The chosen **al-Nawawī, Arbaʿūn** digitization is reported to omit an author-identification paragraph and part of the conclusion of the printed comparison edition. "Full file" is not "complete historical work."
- The **Sībawayh Kitāb** version is flagged for redundant portions, mixed marginal material, page-order issues and some differences from the printed comparator.
- The **Qazwīnī, Talkhīṣ al-Miftāḥ** version is marked **UNCORRECTED_OCR**; it must not serve as a verified quotation without collation.
- **al-Bukhārī, Ṣaḥīḥ** has RANDOM_CHARS and a warning about title and pagination discrepancies; **Ṣaḥīḥ Muslim** has PAGINATION warnings.
- The selected **Ibn ʿArabī, Fuṣūṣ** version is postcorrected OCR for which a second proofreading is recommended.
- **al-Shāfiʿī, Risāla** derives from Library of Arabic Literature's Arabic edition, retains paragraph identifiers, and is *not interchangeable* with other printed textual recensions.

## Complete acquisition register

The following inventory identifies every work and its **specific digital textual witness**, not a textually exhaustive version of the author's work. `Mirrored` means only that original OpenITI bytes are copied locally and byte-equivalence verified. A work may carry multiple disciplines and madhhab labels.

| Work | Sciences | Madhhab | OpenITI version (source) | Acquisition |
|---|---|---|---|---|
| al-Muwaṭṭaʾ — Mālik ibn Anas | hadith, fiqh | maliki | [`0179MalikIbnAnas.Muwatta.Shamela0001699-ara1.completed`](https://github.com/OpenITI/RELEASE/blob/cfc4157a3cf2054c0888f133970a4eaa3e22e58c/data/0179MalikIbnAnas/Muwatta/0179MalikIbnAnas.Muwatta.Shamela0001699-ara1.completed) | Pinned remote · 1.40 MB |
| al-Kitāb — Sībawayh | arabic, nahw, sarf | — | [`0180Sibawayhi.KitabSibawayhi.Shamela0023018-ara1.mARkdown`](https://github.com/OpenITI/RELEASE/blob/cfc4157a3cf2054c0888f133970a4eaa3e22e58c/data/0180Sibawayhi/KitabSibawayhi/0180Sibawayhi.KitabSibawayhi.Shamela0023018-ara1.mARkdown) | Pinned remote · 2.69 MB |
| al-Risāla — al-Shāfiʿī | fiqh, usul | shafii | [`0204Shafici.Risala.LAL2013020402-ara2`](https://github.com/OpenITI/RELEASE/blob/cfc4157a3cf2054c0888f133970a4eaa3e22e58c/data/0204Shafici/Risala/0204Shafici.Risala.LAL2013020402-ara2) | Mirrored · byte matched · 0.46 MB |
| al-Umm — al-Shāfiʿī | fiqh | shafii | [`0204Shafici.Umm.JK000147-ara1`](https://github.com/OpenITI/RELEASE/blob/cfc4157a3cf2054c0888f133970a4eaa3e22e58c/data/0204Shafici/Umm/0204Shafici.Umm.JK000147-ara1) | Pinned remote · 10.83 MB |
| Ṣaḥīḥ al-Bukhārī — al-Bukhārī | hadith | — | [`0256Bukhari.Sahih.JK000110-ara1.completed`](https://github.com/OpenITI/RELEASE/blob/cfc4157a3cf2054c0888f133970a4eaa3e22e58c/data/0256Bukhari/Sahih/0256Bukhari.Sahih.JK000110-ara1.completed) | Pinned remote · 5.52 MB |
| Ṣaḥīḥ Muslim — Muslim ibn al-Ḥajjāj | hadith | — | [`0261Muslim.Sahih.Shamela0001727-ara1.mARkdown`](https://github.com/OpenITI/RELEASE/blob/cfc4157a3cf2054c0888f133970a4eaa3e22e58c/data/0261Muslim/Sahih/0261Muslim.Sahih.Shamela0001727-ara1.mARkdown) | Pinned remote · 4.93 MB |
| Jāmiʿ al-bayān — al-Ṭabarī | tafsir | — | [`0310Tabari.JamicBayan.JK000164-ara1`](https://github.com/OpenITI/RELEASE/blob/cfc4157a3cf2054c0888f133970a4eaa3e22e58c/data/0310Tabari/JamicBayan/0310Tabari.JamicBayan.JK000164-ara1) | Pinned remote · 26.36 MB |
| al-Risāla al-Qushayriyya — al-Qushayrī | tasawwuf | — | [`0465IbnHawazinQushayri.RisalaQushayriyya.JK009321-ara1`](https://github.com/OpenITI/RELEASE/blob/cfc4157a3cf2054c0888f133970a4eaa3e22e58c/data/0465IbnHawazinQushayri/RisalaQushayriyya/0465IbnHawazinQushayri.RisalaQushayriyya.JK009321-ara1) | Pinned remote · 1.14 MB |
| Laṭāʾif al-ishārāt — al-Qushayrī | tafsir, tasawwuf | — | [`0465IbnHawazinQushayri.LataifIsharat.JK009257-ara1`](https://github.com/OpenITI/RELEASE/blob/cfc4157a3cf2054c0888f133970a4eaa3e22e58c/data/0465IbnHawazinQushayri/LataifIsharat/0465IbnHawazinQushayri.LataifIsharat.JK009257-ara1) | Pinned remote · 3.26 MB |
| Dalāʾil al-iʿjāz — ʿAbd al-Qāhir al-Jurjānī | arabic, balagha | — | [`0471CabdQahirJurjani.DalailIcjaz.JK001019-ara1`](https://github.com/OpenITI/RELEASE/blob/cfc4157a3cf2054c0888f133970a4eaa3e22e58c/data/0471CabdQahirJurjani/DalailIcjaz/0471CabdQahirJurjani.DalailIcjaz.JK001019-ara1) | Pinned remote · 0.91 MB |
| Asrār al-balāgha — ʿAbd al-Qāhir al-Jurjānī | arabic, balagha | — | [`0471CabdQahirJurjani.AsrarBalagha.JK006906-ara1`](https://github.com/OpenITI/RELEASE/blob/cfc4157a3cf2054c0888f133970a4eaa3e22e58c/data/0471CabdQahirJurjani/AsrarBalagha/0471CabdQahirJurjani.AsrarBalagha.JK006906-ara1) | Mirrored · byte matched · 0.69 MB |
| al-Mabsūṭ — al-Sarakhsī | fiqh | hanafi | [`0483IbnAhmadSarakhsi.Mabsut.JK000266-ara1`](https://github.com/OpenITI/RELEASE/blob/cfc4157a3cf2054c0888f133970a4eaa3e22e58c/data/0483IbnAhmadSarakhsi/Mabsut/0483IbnAhmadSarakhsi.Mabsut.JK000266-ara1) | Pinned remote · 23.44 MB |
| Uṣūl al-Sarakhsī — al-Sarakhsī | fiqh, usul | hanafi | [`0483IbnAhmadSarakhsi.Usul.JK000211-ara1`](https://github.com/OpenITI/RELEASE/blob/cfc4157a3cf2054c0888f133970a4eaa3e22e58c/data/0483IbnAhmadSarakhsi/Usul/0483IbnAhmadSarakhsi.Usul.JK000211-ara1) | Pinned remote · 2.17 MB |
| Bidāyat al-mujtahid — Ibn Rushd al-Ḥafīd | fiqh, usul | comparative | [`0595IbnRushdHafid.BidayatMujtahid.JK000222-ara1`](https://github.com/OpenITI/RELEASE/blob/cfc4157a3cf2054c0888f133970a4eaa3e22e58c/data/0595IbnRushdHafid/BidayatMujtahid/0595IbnRushdHafid.BidayatMujtahid.JK000222-ara1) | Pinned remote · 2.90 MB |
| al-Mughnī — Ibn Qudāma | fiqh | hanbali | [`0620IbnQudamaMaqdisi.Mughni.JK000154-ara1`](https://github.com/OpenITI/RELEASE/blob/cfc4157a3cf2054c0888f133970a4eaa3e22e58c/data/0620IbnQudamaMaqdisi/Mughni/0620IbnQudamaMaqdisi.Mughni.JK000154-ara1) | Pinned remote · 16.40 MB |
| Rawḍat al-nāẓir — Ibn Qudāma | fiqh, usul | hanbali | [`0620IbnQudamaMaqdisi.RawdatNazir.JK000156-ara1`](https://github.com/OpenITI/RELEASE/blob/cfc4157a3cf2054c0888f133970a4eaa3e22e58c/data/0620IbnQudamaMaqdisi/RawdatNazir/0620IbnQudamaMaqdisi.RawdatNazir.JK000156-ara1) | Pinned remote · 0.69 MB |
| Miftāḥ al-ʿulūm — al-Sakkākī | arabic, balagha, nahw | — | [`0626IbnMuhammadKhwarazmiSakkaki.MiftahCulum.JK010081-ara1`](https://github.com/OpenITI/RELEASE/blob/cfc4157a3cf2054c0888f133970a4eaa3e22e58c/data/0626IbnMuhammadKhwarazmiSakkaki/MiftahCulum/0626IbnMuhammadKhwarazmiSakkaki.MiftahCulum.JK010081-ara1) | Pinned remote · 1.32 MB |
| Fuṣūṣ al-ḥikam — Ibn ʿArabī | tasawwuf, philosophy | — | [`0638IbnCarabi.FususHikam.Kraken21042913-ara1.mARkdown`](https://github.com/OpenITI/RELEASE/blob/cfc4157a3cf2054c0888f133970a4eaa3e22e58c/data/0638IbnCarabi/FususHikam/0638IbnCarabi.FususHikam.Kraken21042913-ara1.mARkdown) | Mirrored · byte matched · 0.40 MB |
| Alfiyyat Ibn Mālik — Ibn Mālik | arabic, nahw, sarf | — | [`0672IbnMalik.Alfiyya.Shamela0008522-ara1`](https://github.com/OpenITI/RELEASE/blob/cfc4157a3cf2054c0888f133970a4eaa3e22e58c/data/0672IbnMalik/Alfiyya/0672IbnMalik.Alfiyya.Shamela0008522-ara1) | Mirrored · byte matched · 0.10 MB |
| al-Arbaʿūn al-Nawawiyya — al-Nawawī | hadith | — | [`0676Nawawi.ArbacunaNawawiyya.Shamela0012836-ara1.mARkdown`](https://github.com/OpenITI/RELEASE/blob/cfc4157a3cf2054c0888f133970a4eaa3e22e58c/data/0676Nawawi/ArbacunaNawawiyya/0676Nawawi.ArbacunaNawawiyya.Shamela0012836-ara1.mARkdown) | Mirrored · byte matched · 0.04 MB |
| Minhāj al-ṭālibīn — al-Nawawī | fiqh | shafii | [`0676Nawawi.MinhajTalibin.JK001168-ara1`](https://github.com/OpenITI/RELEASE/blob/cfc4157a3cf2054c0888f133970a4eaa3e22e58c/data/0676Nawawi/MinhajTalibin/0676Nawawi.MinhajTalibin.JK001168-ara1) | Pinned remote · 0.73 MB |
| al-Īḍāḥ fī ʿulūm al-balāgha — al-Qazwīnī | arabic, balagha | — | [`0739JalalDinQazwini.IdahFiCulumBalagha.JK001001-ara1`](https://github.com/OpenITI/RELEASE/blob/cfc4157a3cf2054c0888f133970a4eaa3e22e58c/data/0739JalalDinQazwini/IdahFiCulumBalagha/0739JalalDinQazwini.IdahFiCulumBalagha.JK001001-ara1) | Pinned remote · 0.72 MB |
| Talkhīṣ al-Miftāḥ — al-Qazwīnī | arabic, balagha | — | [`0739JalalDinQazwini.TalkhisMiftah.Kraken220201000819-ara1`](https://github.com/OpenITI/RELEASE/blob/cfc4157a3cf2054c0888f133970a4eaa3e22e58c/data/0739JalalDinQazwini/TalkhisMiftah/0739JalalDinQazwini.TalkhisMiftah.Kraken220201000819-ara1) | Pinned remote · 0.48 MB |
| Mughnī al-labīb — Ibn Hishām | arabic, nahw | — | [`0761JamalDinIbnHisham.MughniLabib.JK001131-ara1`](https://github.com/OpenITI/RELEASE/blob/cfc4157a3cf2054c0888f133970a4eaa3e22e58c/data/0761JamalDinIbnHisham/MughniLabib/0761JamalDinIbnHisham.MughniLabib.JK001131-ara1) | Pinned remote · 1.50 MB |
| Mukhtaṣar al-maʿānī — al-Taftāzānī | arabic, balagha | — | [`0792IbnCumarTaftazani.MukhtasarMacani.ShamAY0033799-ara1`](https://github.com/OpenITI/RELEASE/blob/cfc4157a3cf2054c0888f133970a4eaa3e22e58c/data/0792IbnCumarTaftazani/MukhtasarMacani/0792IbnCumarTaftazani.MukhtasarMacani.ShamAY0033799-ara1) | Pinned remote · 0.82 MB |
| al-Kashshāf — al-Zamakhsharī | tafsir, arabic, balagha | — | [`0538JarAllahZamakhshari.Kashshaf.JK001496-ara1`](https://github.com/OpenITI/RELEASE/blob/cfc4157a3cf2054c0888f133970a4eaa3e22e58c/data/0538JarAllahZamakhshari/Kashshaf/0538JarAllahZamakhshari.Kashshaf.JK001496-ara1) | Pinned remote · 8.06 MB |
| al-Mufaṣṣal fī ṣanʿat al-iʿrāb — al-Zamakhsharī | arabic, nahw | — | [`0538JarAllahZamakhshari.MufassalFiSuncatIcrab.JK001224-ara1`](https://github.com/OpenITI/RELEASE/blob/cfc4157a3cf2054c0888f133970a4eaa3e22e58c/data/0538JarAllahZamakhshari/MufassalFiSuncatIcrab/0538JarAllahZamakhshari.MufassalFiSuncatIcrab.JK001224-ara1) | Pinned remote · 0.49 MB |
| Asās al-balāgha — al-Zamakhsharī | arabic, lugha, balagha | — | [`0538JarAllahZamakhshari.AsasBalagha.JK007032-ara1`](https://github.com/OpenITI/RELEASE/blob/cfc4157a3cf2054c0888f133970a4eaa3e22e58c/data/0538JarAllahZamakhshari/AsasBalagha/0538JarAllahZamakhshari.AsasBalagha.JK007032-ara1) | Pinned remote · 2.95 MB |

## Reader and research integration

The **Corpus Library** page at `research/intellectual-atlas/corpora/` provides: discipline and madhhab filters; searching by title, author, Arabic and OpenITI identifiers; separate source-version metadata; a complete-file fetch (locally mirrored or pinned external version); in-browser Git SHA-1 blob integrity checking; paged right-to-left reading; internal search; printable markers where present; and copyable version-level citations.

**No invented stemmas or hadith numbering:** an OpenITI digitization supplies textual material and some page markers, but the source register itself does not establish direct school affiliation of every later commentator, direct citations between works, an authenticated hadith isnād graph or edition-independent hadith number mappings. Nor does it provide automatically reliable Qurʾānic āyah alignment. These remain independent tasks.

**GNAMMA intellectual atlas continuity:** the existing 404 catalog nodes, 377 evidence-qualified edges, and 21 textual families are unchanged. A source is linked to an existing atlas node only after verifying identical work identity (e.g. Ibn ʿArabī's *Fuṣūṣ*). Do not equate one OpenITI version with an entire work or invent a new historical relation because both texts appear in this registry.

## Repeatable verification steps

1. Read `registry.json`. For each entry inspect its `openiti.version_uri`, `openiti.source_page`, `openiti.metadata_url`, `openiti.blob_sha` and `openiti.quality_note`.
2. Retrieve the original source from the **pinned** commit, not the moving `master` branch, and verify the Git blob object identity: SHA-1 over the bytes of `blob <byte_length>\0<exact-file-bytes>`.
3. For a mirrored work compare its GNAMMA repository blob SHA to the source SHA. All five current mirrors passed this check on 7 November 2026.
4. For independent textual claims compare the exact passage against the *specified printed edition or manuscript*: verify headings, page and hadith numbering, omissions, editorial insertions, variants and attribution. Record the verification at passage level before claiming a scholarly critical text.
5. Do not mark a work "fully edited" until the complete collation, editorial apparatus and scholarly review are finished and separately documented.

The 28-book curated index is an acquisition milestone, not completion of the entire fiqh, hadith, tafsīr, taṣawwuf, naḥw or balāgha corpora.
