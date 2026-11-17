# Sanandajī · Taqrīb al-Marām · Volume I — Stage 97 full continuation checkpoint

**17 November 2026 · cumulative source-linked working edition, not a finished critical translation.**

## Canonical witness and preservation

- **Single printed witness:** Būlāq 1318 AH scan `Original_Bulaq_1318_AH_Taqrib_al_Maram_scan.pdf` with SHA-256 `4addd660de68794f9d64e062e3b25a2782497b3342eb4580218c3e07e8d12134`, 632 PDF pages. Original Volume I page `I:p` = one-based physical PDF page `p + 13`.
- All **280** original source PNGs `source_images/I001.png`–`I280.png` and their SHA-256 values are preserved; prior Stage96 and earlier snapshots, provenance notes, scripts and translations are retained in this archive.
- The latest cumulative corpus is `Stage97_Cumulative_1401_Records.json`, with `FULL_CUMULATIVE_STAGE97.json` as parallel recovery file. Reader data is the Stage84 shards followed by **Stage85–97 overlays in order**, then `reader.js`.
- This checkpoint revises **only** previously Arabic-empty `I021.lower.02`, `I022.lower.02`, and `I025.lower.02`, preserving the prior overviews and titles as `stage97_prior_working_*` for audit. Attribution of these lower notes remains unassigned.

## Material added and corrected

- **I021.lower.02 (printed p.21, physical PDF p.34):** source phrases from the lower gloss's reported taxonomy of sceptical positions, distinguishing the *ʿinādiyyah* and *ʿindiyyah*. This is a report about views, not an attribution to verified historical philosophical schools. It does not repeat `I021.lower.01` (teacher guidance) or `I021.upper.02` (upper discussion of sophists).
- **I022.lower.02 (printed p.22, PDF p.35):** source clauses on sensory errors, judgments about universals, and intellectual first principles in relation to sensations. The old record title/overview over-emphasized the noncontradiction argument in the upper register; the reader-facing title is now assigned to the actual lower register and old metadata is retained.
- **I025.lower.02 (printed p.25, PDF p.38):** lower gloss differentiating the act of inquiry from the act of the inquirer and reporting the Active Intellect (*al-ʿaql al-faʿʿāl*) as a philosophical effusive principle. Its objection concerning divine choice is translated only as far as the source is securely transcribed. Earlier lower.01 and ruled/upper passages are not duplicated.
- **All are bounded selections, not complete individual records or pages.** Deliberately omitted sections are explicitly marked `[…]`. The adjacent already Arabic-bearing units are still liable to incomplete literal translation.

## Honest source-presence accounting

- **1,401** stable IDs; **1,267** records contain at least some Arabic; **133** genuine source records remain Arabic-empty (**114 lower**, **19 upper**); **one** retired non-source editorial record remains hidden for provenance.
- **0/279** printed body pages have gap-free all-register Arabic, literal English, and independent second proof. A manuscript collation is **not** being claimed or required for the present Būlāq single-witness work.

## Exact next record and order

**`I025.upper.02`**, printed **I:25**, physical combined PDF **page 38**, **upper** text. It begins in the discussion of whether knowledge falls under action and the necessity/effusion alternative. Its already-entered English is an overview only; verify upper text without duplicating `I025.lower.02` or `I025.ruled.01`.

Then **`I026.lower.02`** (I:26, physical PDF p.39), **`I027.lower.04`** (I:27, p.40), **`I027.upper.01`** (I:27, p.40), and `I028.lower.02/.03`, following the full `Stage97_Remaining_Arabic_Queue.csv` printed ordering for the remaining records. Review all previously Arabic-bearing records for incompletely transcribed clauses separately; source-presence count must never become a false completion percentage.

## Resume/verification rules

1. Open the **original Būlāq page image** and adjacent pages for each record. Trace start/end of quoted lemma and commentary register; never infer Arabic from an English overview.
2. Transcribe source phrases only where legible, use `[…]` for every omitted or uncertain span, translate the exact retained Arabic and preserve theological/logical distinctions.
3. Maintain separate upper main text, ruled notes and lower marginal commentary. No source-author assignment for the lower notes without evidence.
4. Append a stage overlay only where Arabic was blank; preserve all old content in prior snapshots and per-record prior-overview fields. Never rewrite existing translated passages silently.
5. Run `node stage97-corpus-ci.cjs`; inspect `Stage97_Browser_QA.json`. Do not claim visual browser or responsive acceptance unless it ran successfully.
6. Keep visible reading and focus modes free of project-stage counters and editorial apparatus. Keep *Tahdhīb al-Kalām* separate; leave `tahdhib-parallels.js` as inactive concordance.

## Reader checks and limitation

- **Corpus/source:** `node stage97-corpus-ci.cjs` passed, including preservation of 1,401 IDs and checksum parity against the original PDF and all 280 source PNGs.
- **Browser:** Direct `file://` navigation was blocked with `ERR_BLOCKED_BY_ADMINISTRATOR`. In-memory reconstruction of the same HTML, CSS and ordered scripts **passed** at 390, 768 and 1400 pixels: 1,401 data records, 1,267 Arabic-bearing, no JavaScript page errors, no horizontal overflow. A separate mobile/desktop check expanded the I:22 lower commentary and confirmed new Arabic text was visible. Screenshots and `Stage97_Browser_QA.json` are archived. This is **not** verification of deployment on GitHub Pages or acceptance of every interaction.
- **Scholarly caution:** Independent second proof still remains at zero pages. Correct the unverified connecting words in I:21 and I:25 before calling either source record continuous; I:22 also has unresolved connecting phrases.