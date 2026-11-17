# Sanandajī · Taqrīb al-Marām · Volume I — Stage 98 full continuation handoff

**17 November 2026. This is a cumulative, single-witness working edition, not a complete scholarly translation.**

## Copytext and preservation

- Būlāq 1318 AH original image-only scan `Original_Bulaq_1318_AH_Taqrib_al_Maram_scan.pdf`, original SHA-256 `4addd660de68794f9d64e062e3b25a2782497b3342eb4580218c3e07e8d12134`, 632 physical pages. For Volume I, physical PDF one-based page = printed page + 13.
- Preserve all 280 original page images, their checksums `SOURCE_IMAGE_SHA256.json`, all Stage91–97 data snapshots, earlier stage overlays, original source crop evidence and scholarly notes. Do not replace existing Arabic-bearing records from any earlier stage.
- The new cumulative data are `Stage98_Cumulative_1401_Records.json` and `FULL_CUMULATIVE_STAGE98.json`. The clean reader uses the 11 Stage84 shards followed by Stage85–98 deltas in numeric order, then `reader.js`.

## Stage98 additions

1. `I025.upper.02` (printed I:25, physical PDF page 38, upper): original **reply** “وأجيب بأن الفعل الآخر هنا إفادة العلم وهي فعل” followed by parenthesized al-Taftāzānī lemmata “(أو) بطريق (الوجوب)” and the necessity clause. Unlike the previous Stage97 I025.lower.02, this is not the marginal commentary. The objection itself remains in `I025.upper.01` and is **not** duplicated.
2. `I026.lower.02` (printed I:26, physical PDF page 39, lower, authorial voice unassigned): an extended first-pass literal translation from immediately after the current `I026.lower.01`. It contrasts **rational entailment** of the conclusion with **customary succession**, and distinguishes a voluntary agent's non-production of both antecedent and consequent from the supposition of producing the antecedent without the consequent. Multiple source clauses are translated, but a potentially crucial negative/connective immediately before **فإنه حينئذ** has not been established and is explicitly omitted. Preserve that as open, not reconciled.

## Real source-presence accounting

- 1,401 original stable source-linked IDs retained; **1,269** records have some typed Arabic, **131** genuinely Arabic-blank (113 lower, 18 upper); one retired synthetic editorial record remains hidden.
- **0/279** body pages have received exhaustive all-register Arabic transcription, literal English, and independent second proof. Many existing Arabic-bearing records are snippets or only interpretive English; an increase in Arabic-bearing records is NOT a completeness percentage.
- No manuscript collation performed; Būlāq single-copy scholarly edition does not require one for the current stage. Attribution of anonymous lower marginal glosses remains unresolved.

## Precise next source pointer

**`I027.upper.01` — printed Volume I page 27, physical combined PDF page 40, upper text**. This record contains the short closing predicate to the sentence begun on I:26; inspect the original `source_images/I027.png` and the end of `I026.upper.01`, and do not duplicate what is already source-transcribed. Then **`I027.lower.04`** (same printed page), **`I028.lower.02`**, **`I028.lower.03`** in printed order. The queue is `Stage98_Remaining_Arabic_Queue.csv`. Older Stage97 narrative mentioned I027.lower.04 before the upper record, but the source-linked queue now places the upper-record gap first.

## Reader and scholarly policy

- Preserve reader modes, deep links/bookmarks, optional ruled and lower registers, source layer distinctions, separate Tahdhīb reader, and inactive `tahdhib-parallels.js` concordance.
- Keep project stage markers and editorial notes out of continuous reading and focus modes; edition status belongs in editorial/about resources.
- Do not claim these two bounded passages as complete pages; independent second proof remains an outstanding obligation, especially the opening of I026.lower.02 and all inherited source lacunae.
- Execute `node stage98-corpus-ci.cjs`. Browser QA output, if run, must report actual checks and limitations without claiming live deployment.

## Executed Stage98 checks

- `node stage97-corpus-ci.cjs` passed on the inherited original Stage97 materials.
- `node stage98-corpus-ci.cjs` passed after the two new overlays: all 1,401 stable IDs retained, precisely two previously blank records filled with bounded readings, 1,269 records with some Arabic, 131 genuine Arabic-empty, and SHA-256 parity for the original scan and all 280 source PNGs.
- Reconstructed in-memory Chromium reader tested at **390, 768 and 1400 px** with upper text on I:25 and newly typed lower Arabic on I:26, no JavaScript page errors or horizontal overflow. Search and focus were tested at mobile width. Lower commentary was **opened programmatically**; native click/tap expansion and the public deployed site were not verified. See `Stage98_Browser_QA.json` and the screenshots. This does **not** imply all-reader UI acceptance.
- Remaining distinct tasks: second-proof the ambiguous connective immediately before **فإنه حينئذ** in `I026.lower.02`, check line punctuation and author attribution; independently proof all earlier selected excerpts and complete the many omitted clauses across both registers.