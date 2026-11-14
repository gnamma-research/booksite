# Miṣbāḥ al-Uns R16 continuation

14 November 2026. Current review branch: `research/misbah-r16-85pct-20261114` in `gnamma-research/booksite`.

## Current result

The reader contains **664 bilingual passages**, continuously numbered **§§4.538–4.1141, then §§5.1–5.60**. The next passage is **§5.61**, source label **615**. Recorded whole-source-page draft reach is **612/720 = 85%**, through label 614, with label 615 incomplete. This uses the inherited stage counting convention, not an independently verified physical-page mapping.

This is **not a fully cumulative edition**: the earlier master through §4.537 has not been imported. It is a **first-pass translation from an electronic witness**, not a manuscript-collated or printed-image-verified critical edition. The 85% is inherited cumulative translation-page reach, not the fraction of the whole book available in this reader.

## What this stage adds and preserves

- 413 previously registered passages were preserved without changing any of their 21 JSON files or manifest entries.
- During this turn, the original review branch acquired four unregistered increments, `r15f.json`–`r15i.json`, covering **85 passages, §§4.951–4.1035**. These were recovered from commit `440b974d8c966fe5f2cbfb0b6f9737cd4039d9f5` and preserved byte-for-byte as the canonical reader text.
- **166 new passages, §§4.1036–4.1141 and §§5.1–5.60**, were translated and stored in `r16a.json`–`r16g.json`: **69,621 source Arabic characters** and **16,933 English words**. Counts use the normalized Arabic body and whitespace-separated English tokens.
- A contemporaneous alternative draft of §§4.951–4.1035 is retained under `variants/`. It is excluded from the reader and counted as zero new coverage.
- Both modular and portable readers are regenerated. Navigation now sorts by division and section, so §4.1141 leads to §5.1. Complete numbered units and embedded headings are retained.
- The earlier handoff, including its historical inconsistent checkpoints, survives unaltered in `history/HANDOFF_pre_R16.md`. This current handoff takes precedence for continuation.

The request for another ten percentage points is represented by advancing the registered 75% checkpoint to 85%; it includes integrating the 85 pre-existing but unregistered passages as well as the 166 genuinely new translations. Do not describe all 251 reader additions as newly translated in this stage.

## Source and identity

Work: Shams al-Dīn Muḥammad ibn Ḥamza al-Fanārī, *Miṣbāḥ al-uns*, commentary on Ṣadr al-Dīn al-Qūnawī’s *Miftāḥ al-ghayb*.

Printed edition identified by the inherited record: Muḥammad Khvājavī, Tehran, Mawlā, 1416 AH / 1374 SH; third printing 1430 AH.

Digital witness: `OpenITI/0850AH/data/0834IbnHamzaFanari/0834IbnHamzaFanari.MisbahUns/0834IbnHamzaFanari.MisbahUns.Shia004692-ara1`.

Pinned revision: `e2715c62fb458ce3ddc43b962cd55677cdd7bc35`; Git blob: `7dc10e1d6db58ff524d05e820139dc1aa4ef8a07`. Exact source bytes are included in `source/OpenITI-Misbah.txt`, with the Git blob independently recomputed.

OpenITI line-continuation prefixes, page tags and `ms` tokens are removed from reader Arabic, and whitespace is collapsed. Lexical readings and parenthetical editor-note calls remain unchanged. No unseen footnote contents are invented. Raw offsets and source markers accompany all new entries.

Three numbering repairs are explicit: §5.4 has a line-broken marker; the electronic markers `520 - 5` and `521 - 5` are assigned reader labels §§5.20–21 on sequential evidence. These repairs are not Arabic lexical emendations.

## Prior master still requiring recovery

`Misbah_Cumulative_Master_English_First.docx`: Library ID `libfile_f5e835f5ad4c8191888b1bf5bcd5aef4`, file ID `file_00000000c7148208bf32df13c1af79f8`, version `1`, 908,705 bytes. Its identity was resolved afresh; byte retrieval failed because the transfer runtime could not reach its service. It has not been silently reconstructed or replaced. Earlier §§1.1–4.537 therefore remain outside this reader. Its inherited coverage claim remains marked as inherited rather than newly verified.

All earlier R12–R14 apparatus files remain present. R15 notes remain within their original passage entries. See `R16_EDITORIAL_APPARATUS.md` for new uncertainties and `R16_INTEGRITY.json` for preservation evidence.

## Exact next boundary

Last translated: §5.60, ending:

> ديها، لأدركه لها في مقام تجريدها، ثم يدركها من حيث جملتها وجمعيتها بجملته وجمعيته، فلم يختلف عليه أمر ولم ينتقض عليه حال ولا حكم، ولولا القيود الآتي ذكرها لاستمر حكم هذا الشهود، ولكن الجمعية الكمالية تمنع من ذلك، لأنها تقتضى الاستيعاب المستلزم للظهور بكل وصف والتلبس بكل حال وحكم.

Next untranslated: **§5.61**, source label 615:

> ومن نتائج هذا الكشف الكامل معرفة صاحبه غاية ما أدرك كل مفكر بفكره ومعرفة سبب تخطئة الناظرين بعضهم بعضا، ومن أي وجه أصابوا وأخطأوا، ومعرفة مراتب الذائقين والمقلدة ومن له الحكم عليهم والمقامات التي أوجب تعشقهم وتقيدهم، ومعرفة من له أهلية الترقي ومن ليس له، فيفهم اعذار الخلائق أجمعين وهم له منكرون وبمكانته جاهلون. فهذا يا اخوانى حال المتمكنين من أهل الله في كشفهم التام ولا تظنوها الغاية التامة، فما من طامة الا وفوقها طامة.

Continue from this exact unit using the pinned witness. Inspect current branches before drafting: the earlier review branch was receiving concurrent increments during this turn. Preserve these R16 files and all earlier variants. Append new data, update the manifest and both reader forms, and recompute complete-page reach only after all passages touching a label are complete.

## Validation and deployment

Sequence, missing/duplicate IDs, prior JSON byte identity, all new Arabic source spans, source blob identity, manifest hashes, page arithmetic and portable/modular parity have passed structural checks. Browser preview could not be completed because local file navigation was blocked by URL policy and a local HTTP server could not bind. No visual or interactive QA pass is claimed.

The work is saved on an isolated GNAMMA review branch based on `440b974d8c966fe5f2cbfb0b6f9737cd4039d9f5`. It is not merged to the public branch and is not a verified NAMA deployment. No permission or publishing claim is implied by the files’ presence here.
