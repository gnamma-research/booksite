# Nihāyat–Muẓaffar: canonical continuation

The working branch is **[`nihayat-active`](https://github.com/gnamma-research/booksite/tree/nihayat-active)**. Read the current files on that branch, even when arriving from an older conversation. The complete Nihāya printed-witness edition has been prepared; its current publication state is recorded separately.

## Small restart

1. Read only the [current state](https://github.com/gnamma-research/booksite/blob/nihayat-active/texts/al-tabatabai/audits/nihayat4-current-state.json) and [comparison register](https://github.com/gnamma-research/booksite/blob/nihayat-active/texts/al-tabatabai/audits/nihaya-external-comparison-register.json) from the same revision.
2. In a checkout, run `python3 texts/al-tabatabai/tools/resume-current.py`. It reads those two JSON files without network, archives, book bodies or old handoffs. With tool-only access, inspect the same two files.
3. Follow the returned state. A completed edition is not a new comparison queue. Open a source passage or historical report only for a specific new question or correction.

The entire Nihāya authorial corpus is translated, compared and incorporated. The [completion record](https://github.com/gnamma-research/booksite/blob/nihayat-active/texts/al-tabatabai/audits/nihaya-complete-edition-2026-11-11.json) explains the printed witnesses, textual decisions and retained cruxes. Source-grade distinctions remain explicit; no manuscript or independent human certification is claimed.

## Verification and separate work

Use `resume-current.py --check-text` when current source files are present and their hashes need checking. `verify-current-checkpoint.py` performs the deeper check after all files named in its manifest are available. A mismatch means inspect newer work; never reset it to satisfy an old snapshot.

[PR 290](https://github.com/gnamma-research/booksite/pull/290) tracks the integrated release. The current state records actual browser checks, PDF artifacts and publication evidence. Do not infer publication from source completion alone, and do not repeat completed release work after its verification is recorded.

Muẓaffar is a separate unfinished translation/review project: the saved Book V is complete, while earlier gaps and Book VI remain. Bidāya is a complete working translation. All three books share the reviewed discussion map and dictionary. Do not duplicate saved Muẓaffar units or relabel that selection as a complete book.

Older branches, reports and source archives remain historical evidence. Do not reload failed conversations, recursively read old handoffs, unpack the large archive, rebuild PDFs or launch browser suites during routine startup. This bounded continuation repair addresses observed repository defects; it does not establish the cause of a ChatGPT conversation error.
