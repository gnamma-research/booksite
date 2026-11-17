# Translation-continuity and no-retranslation protocol

**Effective 7 November 2026.** Governing operational instruction for all continued scholarly translation, edition and reader projects in this repository.

## Non-negotiable invariant
**Before translating, recover the last complete canonical corpus and all subsequent changes. Never translate a passage again merely because a new chat cannot find an earlier file.** When recovery is incomplete, identify the missing asset, use its existing source reference, and recover it first. Never silently replace substantive translation with summaries or preparatory text.

## Mandatory pre-stage audit
1. Search project/Library/GitHub for original source, latest *complete* canonical text, recent staged drafts, notes, variants, readers, prior handoffs and forked revision branches, including dates.
2. Record every source's exact path, edition, revision, SHA/size where available, last verified locus and inherited quality status. Resolve precedence explicitly, **without deletion of alternatives**.
3. Confirm distinctions: Arabic transcription vs printed image; English draft vs sentence-checked translation; separate *matn* vs *sharḥ*; explanation vs exact translation; working website vs public deployment.
4. Compute an actual gap ledger from recovered originals. Start **only at a gap**, or log a justified correction with before/after and the source.
5. Do not claim that a file is missing merely because a prior chat's attachments are not mounted. Search Library, project, repo branches and manifests first.

## Output-first stage
1. Primary measurable output: **new Arabic source characters and corresponding full English translations**, with exact source loci and boundaries. For the Sharḥ al-Maqāṣid, stage goal is **10–20% of the entire source's original Arabic characters**, not 10% of notes or units. If below target, report the real fraction and continue in a later stage rather than relabeling preparation as translation.
2. Translate every objection, reply, quotation, qualification and example. Record skipped/corrupt source spans instead of inventing text.
3. For verification, certify only what has been compared Arabic-to-English clause by clause; a continuous English draft does not equal a checked edition.
4. Production-ready website updates must expose true coverage and grade. Never publish draft as fully verified or claim deployment from a local file or unmerged branch.

## Mandatory publication of the full handoff on GNAMMA (8 November 2026)

At **every new translation stage** for a GNAMMA book, the stage is not closed merely by saving a progress summary. Preserve the **entire cumulative recoverable corpus and available editorial apparatus** in a self-contained, uniquely named file (for example `FULL_CUMULATIVE_P84.md`) together with a machine-readable, revision-pinned stage manifest recording source sigla, per-file blob SHAs and byte counts, new and cumulative coverage, gaps, grade, exact restart words and previous-stage links. Older handoffs remain immutable snapshots.

**The GNAMMA site's book landing page and reader must expose a visible “Full cumulative handoff” link,** with a stable archive index showing the current and historical stages. Update the library catalogue and book manifest, publish the new stage's exact status, and check that linked files are accessible; then verify the Pages deployment independently. A commit or queued build is not a confirmed live deployment.

For the Farghānī edition see `texts/al-farghani/muntaha-al-madarik/handoffs.html` and `editorial/HANDOFFS.md`. At P84 the comprehensive saved archive includes the 67-page English working draft, 32 Arabic–English extracts and all existing apparatus, but **does not constitute the missing continuous Arabic copy-text or a collated critical edition**.

## Full cumulative handoff at **every** stage
- Canonical complete matn and sharḥ (all previous source text, English, notes, apparatus, variant history, source registers, glossary and reader source files), not a short status digest with links.
- Newly completed material plus **unchanged previous** materials, no replacement of old variants.
- Machine-readable per-unit/per-page provenance, grade and content hashes; exact total text counts and denominator.
- An exact continuation pointer with preceding/following source lines; unresolved editorial issues and next tasks.
- User-facing copy/branch/ZIP and integrity test. If any asset cannot be physically included, mark the handoff **NOT FULLY CUMULATIVE**, retain its canonical location and explain why.
- Compare the new manifest with the previous one: unchanged count and hashes preserved, new count accurately separated.
- The next chat MUST read this protocol and latest handoff before translating.

## Concrete Sharḥ al-Maqāṣid recovery (7 November 2026)
Canonical preservation branch: `research/taftazani-maqasid-cumulative-20261107` of `gnamma-research/booksite`.

- **Independent matn:** `texts/al-taftazani/sharh-al-maqasid/canonical/MAQASID_MATN_C1_2026-10-30.md` — C1 English translation, 5,346 lines; introduction, six divisions and colophon; sentence-by-sentence Arabic verification **not complete**.
- **Sharḥ:** `texts/al-taftazani/sharh-al-maqasid/canonical/sharh_v5/MANIFEST.json` — losslessly preserved reader data: 851 units (17 files), 235 notes, 81 apparatus entries, glossary, terminal appendix, original reader shell; mixed-grade.
- **Duplicated later matn work:** 7–20 November-6 continuation stages must be compared against canonical C1, not counted as new independent coverage.
- A prior audit showed 487/851 legacy Sharḥ records without attached Arabic and mistaken identification of earlier English offsets as Arabic offsets.
- **Site identity caution:** NAMA and GNAMMA are not automatically the same site. A GNAMMA research branch is a durable staging backup, **not** evidence of publishing to the distinct NAMA website.

## Claims standard
Dates, percentages, word counts, "complete," "verified," "deployed," and "cumulative" require independent evidence. Otherwise state draft / estimated / unresolved. Neither the presence of a ZIP nor its hash proves linguistic accuracy.
