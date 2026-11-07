# Miṣbāḥ al-Uns — cumulative translation / reader stage handoff (8 November 2026)

**Integrity statement: NOT FULLY CUMULATIVE.** The connected Files service can read the prior cumulative manuscript but does not currently authorize recovery of its original DOCX/PDF bytes. No earlier passages have been replaced. This stage preserves the exact prior-file identifiers, a complete newly imported section range, source/provenance registers and continuation boundary. Do **not** claim a complete restored 1.1–4.577 reader or a critical edition.

## 1. What was actually done

- Created the review branch `research/misbah-tasawwuf-reader-20261108` within `gnamma-research/booksite`.
- Recovered the previously packaged **R10, §§4.538–4.562 (25 sections)** verbatim from `Misbah_R10_Continuation_4.538-4.562_2026-10-25.md`, restoring parallel Arabic from the pinned OpenITI witness. Stored as `r10.json`.
- Newly translated **R11, §§4.563–4.577 (15 sections)** directly from the same witness. Stored in `r11a.json` (563–572) and `r11b.json` (573–577). These are complete numbered first-pass passages, not summaries.
- Constructed a responsive bilingual reader with Darūrī-family compact controls; link `index.html`, `reader.css`, `reader.js`. Imported R10+R11 = 40 consecutive complete Arabic/English entries.
- Added `MANIFEST.json`: full source identifiers, exact page math, per-unit checksums, source loci, prior recovery pointers, and critical-grade flags.
- Added this handoff; catalog integration should be reviewed in the same branch.

## 2. Exact source / working edition

**Work:** Shams al-Dīn Muḥammad ibn Ḥamza al-Fanārī (d. 834 AH), *Miṣbāḥ al-uns*, exposition of Ṣadr al-Dīn al-Qūnawī’s *Miftāḥ al-ghayb*.

**Printed base:** Muḥammad Khvājavī, Tehran: Intishārāt-i Mawlā, 1416 AH / 1374 SH (1995–96), third printing 1430 AH. Digitised main text is not itself a critical or manuscript-collated edition.

**OpenITI:** `OpenITI/0850AH`, `data/0834IbnHamzaFanari/0834IbnHamzaFanari.MisbahUns/0834IbnHamzaFanari.MisbahUns.Shia004692-ara1`.
- Pinned commit `e2715c62fb458ce3ddc43b962cd55677cdd7bc35`.
- Blob SHA `7dc10e1d6db58ff524d05e820139dc1aa4ef8a07`.
- Printed source page tags `PageV00P...`; source pages **3–722 inclusive = 720**.

Do not confuse modern editor notes with Fanārī, Fanārī’s quotations of Qūnawī, or the passage drawn from al-Jandī and Ibn ʿArabī. Arabic in the reader is transcribed from OpenITI, lightly whitespace-normalised without conjectural emendation.

## 3. Prior master and precedence

1. **Earliest continuous English-first source-aligned master:** `Misbah_Cumulative_Master_English_First.docx` (File ID `file_00000000c7148208bf32df13c1af79f8`). Its title page reports earlier parallel work through §4.299 and cumulative translation **through §4.537**, complete pp.3–434 (432/720 = 60%). Some later passages are English-first, requiring placement of Arabic in parallel. Files service text is readable; raw DOCX bytes were **not** materialised.
2. **Earlier bilingual master:** `Misbah_XXXII_Cumulative_Master.docx` (File ID `file_00000000c45882089fe6bfc948dadb77`), reaches §4.227 / p.362; superseded for forward English scope but remains useful for apparatus and Arabic alignment. Raw unavailable.
3. **R10 standalone increment:** `Misbah_R10_Continuation_4.538-4.562_2026-10-25.md`, File ID `file_0000000029248208bff24c1ba1b17cb9`; DOCX File ID `file_000000000de48208b20e85ab6e867a22`; manifest File ID `file_00000000a06c8208ab74920bd1343ddb`. Packaged coverage pp.3–441 inclusive (439 pages / 60.9722%); p.442 entered, incomplete.
4. **R11 new in this branch:** `r11a.json` and `r11b.json`, sections 4.563–4.577, end with complete printed p.445. They are first-pass English translations with original Arabic beside them; no claim of printed/manuscript verification.

Files 1–3 are in the user's Project/Library environment. Source files 4 and the three reader JSON files are in the GitHub review branch. The modern medieval Latin dictionary uploaded in the current chat is unrelated and must not be treated as a source for this Arabic work.

## 4. Accurate progress and denominator

| Measurement | Value |
|---|---|
| Last consecutive translated passage | §4.577 |
| Last fully translated printed source page | p.445 |
| Completed pages, inclusive pp.3–445 | **443** |
| Total original pages, inclusive pp.3–722 | **720** |
| Translation draft coverage | **61.5278%** |
| Imported bilingual units into *this* new reader | **40 (4.538–4.577)** |
| Earlier full working master in reader | **NO**, remains to be losslessly imported |
| Claimed prior 75% recovery package | Not recovered; no additional completion credited |
| Exact next section | **§4.578**, Khvājavī p.446 |
| 75% threshold | **540 complete pages**, i.e. through printed p.542 |
| More pages to 75% from current confirmed baseline | **97** |

Do not confuse a displayed percentage of source pages translated with the fraction of passages currently imported into a site. Reader import is a late segment, not a complete online edition.

## 5. Editorial problem register (R11)

- **§4.563:** Determine the quotation boundary between Ibn ʿArabī’s Sethian *Fuṣūṣ* text and al-Jandī’s discussion, using the *Fuṣūṣ* and his *Sharḥ*, not assumptions.
- **§4.565:** Terms such as `مُشركون` and `محجوبون` belong to the quotation’s hierarchy of witnessing; gloss them without ungrounded doctrinal generalisations.
- **§4.566:** Verify `مدرجة عينه الثابتة` and its implied degrees; investigate the claimed thirty-six stations of tawḥīd.
- **§4.567:** Unvowelled `الموحد والموحد` requires differentiated vocalisation in English; mark as interpretation pending collation.
- **§4.573:** `لكونه خيرا فقد أو مأمورا به` remains syntactically uncertain in the electronic witness. Do not silently repair the Arabic. `فبي يسمع` likewise needs hadith/commentary comparison.
- **§4.574:** Translate `التمحض` and `التشكيك` without assuming modern scepticism; compare the earlier Akbarian technical use.
- **§4.575:** The prayer formula is reproduced as quoted, not independently authenticated.
- **§4.576:** The reciprocal mirrors preserve two distinct considerations: the Real as the locus for realised determinations and determinations as the loci of divine manifestation.
- **§4.577:** The third characterisation explicitly denies absolute manifestation of the Essence *qua* Essence.

Previously flagged R10 problems (reports in §4.538, difficult `فمن قال` §4.539, textual sequences §§4.542/4.550/4.559, and the theological reversal §§4.560–4.561) remain open and MUST carry forward from the R10 apparatus. Premodern reproductive claims §§4.545–4.546 are preserved as historical source claims, not contemporary medical knowledge.

## 6. Reader and controls

Path: `texts/al-fanari/misbah-al-uns/`.

Reader implements: compact icon toolbar; Contents, Search, Appearance/Aa, Study/Apparatus, Focus levels 0–3; Reading Desk; modes Read/Study/Research; Arabic / English / both; light/dark; Darūrī palettes; size controls; per-section bookmark, highlight and local note; section-level anchors; six-action bottom dock; keyboard shortcuts; honest page-coverage meter; per-unit source and critical status; mobile CSS and print styling. All notes/bookmarks are local to the current browser; not server-synchronised.

**Site identity:** the authenticated connected repository is GNAMMA, not an independently verified NAMA site. A GNAMMA review branch does not prove public deployment to NAMA or to GNAMMA Pages. **Do not label it as live on NAMA.**

## 7. Continuation instructions

1. Obtain the prior DOCX/PDF master *in original bytes* if possible; restore §§1.1–4.537 to a canonical, section-aligned Arabic/English data model, with notes and apparatus **without rewriting or summarising** earlier translations. Carry original source variants with hashes.
2. Verify the 40 currently imported units against source boundaries and preserve original English from R10 exactly. Review R11 against Khvājavī print and independent early textual witnesses. Never represent first-pass as collated.
3. Continue **from §4.578 on printed p.446** using the same pinned OpenITI source. Source text begins `وإنما كان أتم لاشتماله على جهة ربط الوحدة بالكثرة...`; the preceding §4.577 ends `كالمفاتيح الأول وسدنتها التي هي أمهات صفات الألوهية.`
4. At each stage add a new `r12*.json` (etc.), update `MANIFEST.json`, website data loading, *both* progress indicators, and this complete handoff; record translation count and whole-source-page changes.
5. Promote to the **actual NAMA** Tasawwuf library only when the destination repo or editor is available and its Darūrī-compatible components can be compared. Do not silently merge the GNAMMA branch into a different public site.
6. Every stage should preserve an immutable source/provenance record. Mark any missing previous archive **NOT FULLY CUMULATIVE** until the byte-identical old master is included.

### Integrity locations

- New reader `index.html`, `reader.css`, `reader.js`.
- Newly integrated bilingual sections: `r10.json`, `r11a.json`, `r11b.json`.
- Source and stage register: `MANIFEST.json`.
- Earlier originals identified precisely above.
- Project governing protocol: `docs/TRANSLATION_CONTINUITY_PROTOCOL.md`.

*Stage is a working translation, not a definitive scholarly edition, not 75% complete, and not yet NAMA-deployed.*
