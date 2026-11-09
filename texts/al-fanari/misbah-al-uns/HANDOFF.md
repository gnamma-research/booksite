# Miṣbāḥ al-Uns — cumulative translation / reader stage handoff (9 November 2026)

**Integrity statement: NOT FULLY CUMULATIVE.** The connected Files service can read the prior cumulative manuscript but does not currently authorize recovery of its original DOCX/PDF bytes. No earlier passages have been replaced. This stage preserves the exact prior-file identifiers, a complete newly imported section range, source/provenance registers and continuation boundary. Do **not** claim a complete restored §§1.1–4.820 reader or a critical edition.

## 1. What was actually done

- Created the review branch `research/misbah-tasawwuf-reader-20261108` within `gnamma-research/booksite`.
- Recovered the previously packaged **R10, §§4.538–4.562 (25 sections)** verbatim from `Misbah_R10_Continuation_4.538-4.562_2026-10-25.md`, restoring parallel Arabic from the pinned OpenITI witness. Stored as `r10.json`.
- Newly translated **R11, §§4.563–4.577 (15 sections)** directly from the same witness. Stored in `r11a.json` (563–572) and `r11b.json` (573–577). These are complete numbered first-pass passages, not summaries.
- Constructed and extended the responsive bilingual reader with Darūrī-family compact controls; link `index.html`, `reader.css`, `reader.js`. Imported R10–R14 = **283 consecutive first-pass Arabic/English entries (§§4.538–4.820)**.
- Added and updated `MANIFEST.json`: full source identifiers, exact page math, per-unit checksums, source loci, prior recovery pointers, and critical-grade flags.
- **R12 (9 Nov 2026):** translated §§4.578–4.610 (33 new first-pass bilingual units) directly from the pinned witness, in `r12a.json` and `r12b.json`; added `R12_EDITORIAL_APPARATUS.md`; regenerated the modular and portable readers. Pages 446–452 are now complete; p.453 has only §4.610 so far.
- **R13 (9 Nov 2026):** translated §§4.611–4.648 (38 additional bilingual first-pass units) in `r13a.json` and `r13b.json`; registered the sections and regenerated both modular and portable readers. Source pages **453–462 are completely covered**; §4.648 ends on p.463, but §4.649 also begins on p.463. Added `R13_EDITORIAL_APPARATUS.md`.
- **R14 (9 Nov 2026):** translated **172 new source-aligned bilingual sections, §§4.649–4.820**, in `r14a.json`–`r14i.json` (17+17+18+25+25+25+15+10+20 units), from the pinned OpenITI source. Extended `R14_EDITORIAL_APPARATUS.md`, manifest, modular reader and self-contained edition. Source pages **463–509** are newly fully covered, **p.510 incomplete**, and the next passage is **§4.821**. Current total: **507 / 720 whole pages = 70.4167%** and **283 bilingual reader units**, still without older §§1.1–4.537 in the online reader.
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
5. **R12 continuation:** `r12a.json` and `r12b.json` cover §§4.578–4.610, pp.446–453. Original R10/R11 JSON was preserved.
6. **R13 continuation:** `r13a.json` and `r13b.json` cover §§4.611–4.648. Last wholly translated page is **462**; §4.648 is on p.463 but §4.649 also begins there. All earlier incremental JSON files were preserved.
7. **R14 continuation:** `r14a.json`–`r14i.json` cover §§4.649–4.820, with §4.820 on p.510. Last wholly translated page **509**; §§4.538–4.820 form **283 consecutive bilingual passages** in the modular and portable readers. Earlier files remain intact.

Files 1–3 are in the user's Project/Library environment. Sources 4–7 and all sixteen reader JSON files are in the GitHub review branch. The modern medieval Latin dictionary uploaded in the current chat is unrelated and must not be treated as a source for this Arabic work.

## 4. Accurate progress and denominator

| Measurement | Value |
|---|---|
| Last consecutive translated passage | **§4.820** |
| Last fully translated printed source page | **p.509** (p.510 partly translated) |
| Completed pages, inclusive pp.3–509 | **507** |
| Total original pages, inclusive pp.3–722 | **720** |
| Translation draft coverage | **70.4167%** |
| Imported bilingual units into *this* reader | **283 (4.538–4.820)** |
| Earlier full working master in reader | **NO**, remains to be losslessly imported |
| Claimed prior 75% recovery package | Not recovered; no additional completion credited |
| Exact next section | **§4.821**, Khvājavī p.510 |
| 75% threshold | **540 complete pages**, i.e. through printed p.542 |
| More pages to 75% from current confirmed baseline | **33** |

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
2. Verify all 163 imported units against source boundaries and preserve original English from R10 exactly. Review R11–R14 against Khvājavī print and independent earlier textual witnesses. Never represent first-pass as collated.
3. Continue **from §4.701 on printed p.474** using the same pinned OpenITI source. Source begins `وأدار كرة الأرض وكانت هذه الحركة من هذا الملك بطالع السرطان ...` and continues the Great Shaykh's discussion of the earth and heavens. Retain quotation attribution, and do not treat the cosmological descriptions as validated contemporary science.
4. At each stage add a new `r15*.json` (etc.) and append its filename under `MANIFEST.json` → `readerImport.files`; the modular reader discovers new increments automatically. Rebuild `standalone.html`, update both coverage indicators and this complete handoff; record translation count and whole-source-page changes.
5. Promote to the **actual NAMA** Tasawwuf library only when the destination repo or editor is available and its Darūrī-compatible components can be compared. Do not silently merge the GNAMMA branch into a different public site.
6. Every stage should preserve an immutable source/provenance record. Mark any missing previous archive **NOT FULLY CUMULATIVE** until the byte-identical old master is included.

### Integrity locations

- New reader `index.html`, `reader.css`, `reader.js`; standalone offline page `standalone.html` contains all 163 bilingual sections and the full reader client in one HTML file.
- Newly integrated bilingual sections: `r10.json`, `r11a.json`, `r11b.json`, `r12a.json`, `r12b.json`, `r13a.json`, `r13b.json`, `r14a.json`, `r14b.json`, `r14c.json`.
- Source and stage register: `MANIFEST.json`, with stage problem registers: `R12_EDITORIAL_APPARATUS.md`, `R13_EDITORIAL_APPARATUS.md`, `R14_EDITORIAL_APPARATUS.md`.
- Earlier originals identified precisely above.
- Project governing protocol: `docs/TRANSLATION_CONTINUITY_PROTOCOL.md`.

*Stage is a working translation, not a definitive scholarly edition, not 75% complete, and not yet NAMA-deployed.*


## 8. Historical R12 problem register and checkpoint (9 November 2026; superseded by R13)

- The new continuation comprises **33 consecutively numbered bilingual passages (§§4.578–4.610)** in two machine-readable increments. It has not displaced any earlier translations.
- The metaphysical passage (§§4.578–4.581) distinguishes knowledge-determination from concrete self-appearance and differentiates the creaturely from the Real without positing indwelling or substantial fusion. See the detailed notes in `R12_EDITORIAL_APPARATUS.md`.
- The long cosmological quotation (§§4.584–4.606) must be checked against Ibn ʿArabī's `ʿUqlat al-mustawfiz`; the embedded `ابن مسرة الجيلي` and numerical/phonetic claims remain unverified witness readings.
- Fanārī's reply (§§4.607–4.609) proposes an imaginal/bodily reconciliation of Qūnawī's two celestial spheres and Ibn ʿArabī's four, drawing upon al-Farghānī. Independent collation of al-Farghānī and al-Jandī is required.
- Reader and standalone versions have been expanded and their manifests updated: **73 units**, **450/720 completely covered source pages**, **62.50%**. This count refers to translation draft *page reach*, not final editorial certification.
- **R12's former next boundary:** §4.611, p.453. Superseded first by R13, then R14; the current boundary is §4.751, p.489. A new passage should end on a section boundary and only credit a printed page after all sections beginning on it are translated.


## 9. R13 cumulative checkpoint and verified continuation boundary (9 November 2026)

- New first-pass source-aligned Arabic–English bilingual translation: **38 continuous sections (§§4.611–4.648)**, from the pinned OpenITI transcription. Complete section boundaries and source pages have been checked programmatically; manuscript collation and printed-image verification remain undone.
- Retains explicit al-Jandī quotation boundary (§§4.611–4.617), al-Farghānī quotation boundary (§§4.618–4.632), and Fanārī's own use of Qūnawī's *al-Nafaḥāt* and the Illuminationist hierarchy thereafter.
- Editorial issues in `R13_EDITORIAL_APPARATUS.md`, notably uncertain `أصل لخبان` (§4.630), problematic `وبعد الرب قصد` (§4.612), compressed count in §4.615, distinction of the three paradisal faces, and source identification for the Shīrāzī commentary quoted at §4.648.
- Translation draft reach: **460 fully completed printed pages (pp.3–462) out of 720 = 63.8889%**; §4.648 carries into p.463, but §4.649 is also on p.463, so p.463 is not credited. Imported reader: **111 bilingual sections (§§4.538–4.648)**; prior §§1.1–4.537 not yet losslessly imported.
- Modular reader, standalone offline reader, provenance manifest and handoff updated on branch `research/misbah-tasawwuf-reader-20261108`. No public NAMA deployment or promotion to the master branch is asserted.
- **R13's next boundary (now superseded):** §4.649 on p.463, `القاعدة الثانية: ان قوة التأثير بحسب كمال المؤثر وجودا أو ذاتا ...`. R14 has now covered it. Preserve `MANIFEST.json` and append future increments rather than replacing the prior translation.


## 10. R14 cumulative checkpoint and interpretation guide (9 November 2026)

**New source-aligned first-pass translation:** §§4.649–4.700 (52 complete sections, 3 increments; historical R14a–c checkpoint, now superseded by §§4.701–4.750), Arabic and English side by side. **Last fully covered printed page:** 473 (471 of 720 = 65.4167%); §4.700 ends on p.474, but §4.701 begins there and is not yet translated. **Next:** §4.701, Khvājavī p.474. R10–R14 reader now has 163 entries (§§4.538–4.700), but is still NOT FULLY CUMULATIVE because §§1.1–4.537 remain in the separately identified master and have not been imported losslessly.

**Doctrinal stages:** §§4.649–4.658 distinguish divine efficacy from the finite rank yet indefinite continued effects of the intellects, and examine the mutakallimūn objection to perpetual effect. §§4.659–4.665 move from an Illuminationist analogy of ecstatic motion to Fanārī's own account of love, heat and layered manifestation. §§4.666–4.685 develop principles of correspondences between causes and recipients using historical elemental/alchemical analogies. §§4.686–4.696 introduce the Perfect Human as effect in form but agent in reality, explain al-Ḥallāj's maternal paradox, and require the qualification **'under different considerations'** for apparent opposites. The heading *Fifteenth Principle* occurs inside §4.696 in the electronic transcription. §§4.697–4.700 begin the Great Shaykh's cosmological quotation; distinguish creation **at** intermediary orientation from creation **by** an independent intermediary.

**Outstanding issues:** The detailed 18-point R14 register in `R14_EDITORIAL_APPARATUS.md` includes unresolved `انقطاع اثارهم بالكلية` (§4.649), `أو آخر ان معها لا أصلها` (§4.651), ambiguous metal terms (§4.677), the limmī/innī demonstrations (§4.680), source identification of §4.694's Fātiḥa commentary, and original quotation boundaries and provenance for §4.697 onwards. The OpenITI witness was checked for complete Arabic numbered sections and page-boundaries, **not** against printed-page images or manuscripts. Do not declare a definitive critical text.

**Branch/site status:** all R14 files, manifest, reader HTML and regenerated portable reader are on `research/misbah-tasawwuf-reader-20261108` of `gnamma-research/booksite`. This is not a verified deployment to either NAMA or GNAMMA's public master. Keep the branch reviewable; do not silently promote it.

## 11. R14d–e checkpoint (historical; superseded by §4.820)

**Stage R14d:** §§4.701–4.725, 25 complete Arabic-English sections, source pages 474–480; source voice changes from Great Shaykh cosmology to al-Jandī and then to al-Farghānī. Detailed notes and problematic text recorded section-by-section in `r14d.json` and in the extended `R14_EDITORIAL_APPARATUS.md`.

**Stage R14e:** §§4.726–4.750, 25 more complete Arabic-English sections, source pages 480–489. Includes the seven planetary heavens and governing divine Names, the fourfold progression of the loci of manifestation, time, ordinary versus immediate causation, the **Sixteenth Principle** heading (§4.737), the extended `ʿUqlat al-mustawfiz` quotation (§§4.738–4.748), and the start of al-Farghānī's graded Breath of the Merciful. Crucial source correction: §4.733 begins mid-line after §4.732 in the digital transcription; both numbered passages are separately retained.

**Current factual checkpoint:** continuous first-pass translation through **§4.750**. Last wholly translated printed page **488**; §4.750 continues to p.489 and §4.751 also begins there. Total **486 complete printed pages out of 720 = 67.50%**. Current GNAMMA review reader import is **213 consecutive bilingual entries, §§4.538–4.750**; older §§1.1–4.537 remain outside the reader in the previously identified master (raw-file restore not completed). The 75% threshold remains 540 complete pages, **54 additional whole pages**. *Do not equate 'source-page draft reach' with final critical certification.*

**Exact restart:** **§4.751, Khvājavī p.489**, continuing al-Farghānī's account of `النفس الرحماني`. Retrieve from the pinned OpenITI commit/blob named in §2. Add `r14f.json` or `r15a.json` for the next complete block. Append filenames to `MANIFEST.json` and increment `readerImport.units`; record per-section Arabic/English, pages, and hashes; ensure `standalone.html` embeds the same total. The previous increment groups must be preserved byte-for-byte.

**Open issues:** physical Khvājavī-page check; quotation-boundary control; `انقطاع آثارهم` (§4.649); obscure mountain verb (§4.708); `ثم كلامه` (§4.719); broken section marker (§4.733, repaired in aligned data); source-authentication of visionary and transmitted reports (§§4.738–4.748); note that premodern cosmography is not current empirical science. See `R14_EDITORIAL_APPARATUS.md`.

**Deployment status:** Source files and reader commits are on GNAMMA's `research/misbah-tasawwuf-reader-20261108` review branch. No evidence of merge into public `master` or deployment to the distinct NAMA site. Do not announce either as complete.

## 12. R14f–i: current cumulative handoff (9 November 2026)

**Forward translation completed in this extension:** `r14f.json` §§4.751–4.775 (25 passages, printed pp.489–496), `r14g.json` §§4.776–4.790 (15, pp.496–501), `r14h.json` §§4.791–4.800 (10, pp.501–504), and `r14i.json` §§4.801–4.820 (20, pp.504–510). The four files are complete numbered bilingual first-pass translation units; original Arabic is preserved from the fixed digital witness. **No printed-page images or independent manuscripts have yet been collated.**

**Key architecture:** al-Farghānī's Presence of Necessity versus Presence of Knowledge/Possibility; human as the comprehensive isthmus; mineral, vegetal and animal degrees; Adam's comprehensive temperament and knowledge of the Names; the four conditions of vicegerency; al-Farghānī's controversial list of eighteen putative angelic defects (§4.771); the source's interpretation of Iblīs; descent of the divine command without change of place; distinction between chronological creation and ontological descent; the analytic ascent back from human form; and the irreducible relational consideration of the perfected knower (§§4.789–4.790).

**New chapter and subsequent discussion:** after the end of the long spiritual orientation passage, §4.790 contains the explicit **Second Chapter of Unveiling the Universal Mystery** heading. §§4.791–4.800 distinguish realities from their degrees, universal/particular loci of manifestation, and Absolute Being as such from Being in its relational aspect; §4.800 includes two grammatical readings of `وحكمه`. §§4.801–4.810 distinguish enacted and spoken Book, cosmic `kitāb mubīn`, prophetic scriptures and the Muḥammadan Qurʾān, and aspects of Pen and Tablet. §§4.811–4.820 explain Nature's two considerations, four leading Names and their angelic manifestations, and the universal mercy of `al-Raḥmān` versus the particularised mercy of `al-Raḥīm`.

**Important open questions:** the angelic fault enumeration in §4.771 must be represented as al-Farghānī's interpretive thesis, not as unanimous theology; §4.762's image hadith variants require independent isnād research; Ibn ʿArabī/Qūnawī quotations and `al-Falak al-Sulaymānī` identification need confirmation; R14i contains uncertain `فعلى وقولي` §4.803, obscure §4.813 syntax, and provisional **1121** stellar universals in §4.817. All are documented in `R14_EDITORIAL_APPARATUS.md` and in per-entry `notes` fields.

**Current measurable state:** continuous first-pass translated text through **§4.820**. Last wholly covered printed page **509**; §4.820 reaches p.510 but §4.821 begins there. Whole pages **507 of 720 = 70.4167%**, hence **33 complete pages** remain to reach 75% (p.542). Modular and portable GNAMMA branch readers contain **283 consecutive bilingual passages, §§4.538–4.820**, in **16 immutable JSON groups**. Prior master **§§1.1–4.537 has NOT been losslessly imported**; the reader is **not fully cumulative**, despite the continuous translation-page count. No critical manuscript collation has been completed.

**Exact restart:** **§4.821, p.510**, continuing the comparative discussion of the Throne, Footstool, `al-Raḥmān` and `al-Raḥīm`. Use the same fixed OpenITI source path and blob as §2; add new increment file and entries to `MANIFEST.json`, then regenerate `standalone.html`, update `index.html`, append this handoff, and preserve every prior JSON verbatim.

**Site status:** work remains on `research/misbah-tasawwuf-reader-20261108` of `gnamma-research/booksite`, not confirmed live on GNAMMA main or the separate NAMA website.
