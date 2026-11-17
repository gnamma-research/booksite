# Iznīqī — Stage D full cumulative byte receipt and manuscript catalogue audit
**Date:** 17 November 2026. **Scope:** only al-Iznīqī's *Risāla fī sharḥ Subḥānaka mā ʿarafnāka ḥaqqa maʿrifatika*.

## Complete current reading edition — preserved without modification
- 22/22 printed source pages (831–852), 100% single-printed-edition reading translation.
- 7,968 Arabic words, 12,379 English translated words, 78 existing editorial notes.
- All eleven canonical `text-*.md` source chunks, November 11 bilingual master, Arabic master, English master, original editions, reader/exports, source manifests and prior research checkpoints kept intact. This does **not** imply 22/22 manuscript-critical proof.
- None of the separate Mahāʾimī, Farghānī, Miṣbāḥ, Qawāʿid, Qūnawī shared corpora/readers were modified.

## Migration finally completed for the seven named November 9 originals
- Originally recovered by exact Git blob reference on this isolated branch in commit `0f63aa587b49fbcfd2503c052c863e4939e7fb24`.
- Project-specific GitHub Actions workflow `.github/workflows/izniqi-historical-delivery.yml`, run **44072809794**, verified each of the seven original Git blob hashes and emitted eight ZIP entries (seven historical raw files and proof JSON): https://github.com/gnamma-research/booksite/actions/runs/44072809794.
- The Actions artifact `14322598068` was downloaded to the local environment as `IZNIQI_NOV09_EXACT_SEVEN_GIT_ORIGINALS.zip`. Independently in Python, **seven of seven** originals matched their original recorded Git SHA1 and upstream SHA256. They were copied into `HISTORICAL_ORIGINALS_NOV09/` **without editing**. The former November 9 cumulative first-pass master and five stage segments and original November 9 coverage JSON remain under their own names, NOT mixed into the November 11 canonical translation.
- New full self-contained local archive: `IZNIQI_FULL_CUMULATIVE_HANDOFF_20261117D_VERIFIED.zip` (63 files, 2,706,035 bytes, SHA256 `0749d4a4c8f1baa285442677de2381248da0744a5751cdae01c049f10b099c53`). This local archive contains original raw Nov9 streams **and** the complete November 11 reading edition, two earlier release ZIPs, reader and PDF, all available manifests, research ledgers, source notes, the optional importer and exact file SHA manifest. ZIP read integrity and raw historical blob checks pass.
- The historical Stage C handoff remains separately preserved; the previous `0/7` transfer failure is historical and superseded by a **7/7** actual byte receipt.
- A universal count of every possible earlier project document is **unknown**. Named seven-file receipt is verified; do not invent a 100% all-history denominator or archive old chats.

## Separate progress bars to preserve at every later stage
| Track | Verified / Denominator | Percentage | Grade |
| --- | ---: | ---: | --- |
| Reading translation | 22/22 source pages | **100%** | Single printed edition, not manuscript-critical |
| Independent manuscript collation | 0/22 source pages | **0%** | No actual manuscript leaf read |
| Printed p848 original witnesses | 0/4 described edited witnesses | **0%** | Candidate fifth Yazma Bağışlar 4345 tracked separately |
| Canonical source chunks | 11/11 verified | **100%** | By published checksums |
| November 9 original raw byte receipt | 7/7 files | **100%** | Independently verified Git SHA and SHA256 |
| Global historical-work inventory | unknown/unknown | **unknown** | Do not derive from the seven identified |
| Complete quotation authentication | unknown/unknown | **unknown** | Several reports investigated, not complete census |

## Catalogue continuation — Yazma Bağışlar 4345
The reference entry by Reşat Öngören in *TDV İslâm Ansiklopedisi*, **Kutbüddinzâde İznikî**, specifically lists Süleymaniye Library, Yazma Bağışlar no. **4345** with the *Sharḥ Subḥānaka* treatise in its work-list item 5: https://islamansiklopedisi.org.tr/kutbuddinzade-izniki.
The same reference lists other works in no. 4345; the separate father-author biography pinpoints **4345 fol. 173a–b** for a citation found in *Iḥtijāj Ādam maʿa Mūsā*, a different work: https://islamansiklopedisi.org.tr/kutbuddin-izniki. This folio should **not** be recycled as the location of p848. Thus no independently confirmed folio, incipit, colophon or public manuscript scan for this specific treatise was obtained from 4345.
Continue to treat 4345 as an additional candidate beyond the four manuscripts of Balaban–Çalışkan; do not silently merge editions or make up readings.

## Two unresolved printed p848 cruxes
- `يعني ينقلب الوصف ولا يزول` — tension with impossibility of changing essences. Hypothetical negation is **conjecture**, not a witness.
- `ويلزم منه أن لا يكون لغير الله وجود إمكاني ولا فعل كسبي ... لأنه خرم` — potential logical contradiction. Hypothetical `ولا يلزم` **conjectural**.
- Their existing Arabic, English and historical alternatives are all preserved. No emendation adopted. No manuscript original leaf checked, so **0/4** is the honest denominator.

## Remaining source questions and exact frontier
Acquire freely accessible actual folio images corresponding to printed p848 between `وأن انقلاب الحقائق ممتنع` and `وكان في عينه وشهوده كل الأشياء هالكا`; independently determine precise shelfmark, folio face, line and corrections for each described copy. Reconcile Nuruosmaniye 2888/2388 and 2398/1 and determine 4345's work-specific folio span using a catalogue or manuscript, without contacting libraries or committing to fees absent authorization. Continue chains of transmission of p841/p848/p852 reports and distinguish textual circulation from authenticated Prophetic attribution. No external image request or payment has been initiated.

**Archive gate:** no historical chat is to be archived until full receipt verified across its applicable scope. This remains regular Chat. At the *next* stage, create the entire full cumulative recoverable package again with updated checksums and these separate progress metrics, not only another delta.
