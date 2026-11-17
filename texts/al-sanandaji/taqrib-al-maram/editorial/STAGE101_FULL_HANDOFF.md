# Sanandajī · *Taqrīb al-Marām* · Volume I — Stage 101 cumulative handoff

**17 November 2026. Canonical working source is the single Būlāq 1318 AH scan. No stage number or editorial history belongs in the continuous reader.**

## Canonical source, source checks and preservation

1. Exact predecessor: Stage100 archive. All prior Stage91–100 cumulative records, all Stage85–100 source overlays, reader source, source-selected readings, previous verification records, variants and proof notes are retained unchanged inside this Stage101 recovery archive.
2. Combined original: `Original_Bulaq_1318_AH_Taqrib_al_Maram_scan.pdf`, 632 PDF pages, SHA-256 `4addd660de68794f9d64e062e3b25a2782497b3342eb4580218c3e07e8d12134`. Printed Volume I p = one-based physical PDF page p+13. The 280 `source_images/I001.png`–`I280.png` SHA-256 values still match `SOURCE_IMAGE_SHA256.json`.
3. Current canonical working files: `Stage101_Cumulative_1401_Records.json` and `FULL_CUMULATIVE_STAGE101.json`. The only newly changed source records are `I033.lower.01`, `I036.lower.01`, `I036.lower.02`; original English overviews, titles, anchors, status, source-image aliases and source kinds are retained under `stage101_prior_working_*` on each changed record.
4. New overlay: `stage101-source-delta.js` loads **after** Stage100 and **before** `reader.js` in both reader HTML entrypoints. It refuses to overwrite already Arabic-bearing entries. The separate *Tahdhīb* reader and the inactive concordance were not modified.

## Three source selections and exact boundaries

- `I033.lower.01`, printed p33, physical PDF 46: initial «النقل» completes preceding I032.lower.02 «في العقل دون». The uncertain first connective is omitted. The note contrasts demonstrative certainty with probable testimony, and then introduces the necessary/substance/accident categories. Its end «التي لا سبيل للعقل إلى» crosses to I:34; do not fabricate an ending or overwrite the already partial I:34.
- `I036.lower.01`, printed p36, PDF49: the lower gloss contrasts immediacy in a particular conception of existence and the general conception; it also carefully distinguishes conceiving existence from conceiving knowledge. Opening continues the already existing I035.lower.02, which was not retranslated.
- `I036.lower.02`, same leaf and lower register: the printed lemma about children incapable of acquired inquiry illustrates the claim that the assent “A thing is either existent or nonexistent” is self-evident. The reflective assent **that this is self-evident** is distinguished from the first assent. The compact ending, including the contrast between proof and notice, remains an unproved omission.

**`Stage101_Bounded_AR_EN_Readings.md` contains the exact selected Arabic/English and explicit textual caveats. None of these three represents a whole printed record, and no passage is independently second-proofed.**

## Audited counts and outstanding obligations

- 1,401 stable source-linked IDs = 1,400 active + one retired synthetic hidden entry. **1,279** have some Arabic, **121** are genuine Arabic-empty (**104 lower**, **17 upper**).
- **0/279** complete all-register pages independently second-proofed. Neither manuscript collation nor full diplomatic Arabic established.
- `Stage101_Open_Proof_Obligations.csv` retains all **1,400** active obligations. It carries forward the unresolved I026.lower.02 connective preceding **فإنه حينئذ** and unresolved I:27–28 objections and translations; all earlier readings remain marked partial.
- `Stage101_Remaining_Arabic_Queue.csv`: all 121 genuine source-blank records (only the specified three were removed). Every Arabic-bearing record, whether old or new, still requires clause-by-clause review to establish a complete edition.
- The Stage101 CI requires no change to any unrelated record, matching scan + 280 page hashes, preservation of the critical I026 passage and predecessor translations, and the correct HTML/JS overlay order. Reader/browser results are separately reported in `Stage101_Browser_QA.json` after testing.

## Exact next continuation

**`I036.upper.01`** (Volume I printed p36, combined PDF physical page **49**), the next Arabic-empty source record. It is upper text, NOT the lower commentary just revised. Check sentence boundaries against I035.upper.01 and I036.upper.02 without retranslating either. Then **`I038.lower.01`** and **`I038.lower.02`** (printed p38, physical PDF page 51). Retain all independent-proof and unresolved-variant obligations on intervening records.

## Publication policy

Keep the clean, bilingual, study-first *Taqrīb* reader under `texts/al-sanandaji/taqrib-al-maram/`. Source notes and development stages belong in `editorial/`, not continuous/focus reading. Never merge with the separate *Tahdhīb al-Kalām* reader before both volumes of Sanandajī's commentary have complete literal translation and independent proof. The GitHub commit confirms repository text changes but does not itself establish live-site QA or scientific proof.