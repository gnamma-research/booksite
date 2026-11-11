# Nihāyat–Muẓaffar: canonical continuation

The working branch is **[`nihayat-active`](https://github.com/gnamma-research/booksite/tree/nihayat-active)**. Start there even when this file was opened on `master` or from an older conversation. Publication and saved research are separate; the default website branch may contain an older published edition.

## Small restart

1. Read the [current state](https://github.com/gnamma-research/booksite/blob/nihayat-active/texts/al-tabatabai/audits/nihayat4-current-state.json) and [external comparison register](https://github.com/gnamma-research/booksite/blob/nihayat-active/texts/al-tabatabai/audits/nihaya-external-comparison-register.json) from the same branch revision.
2. In a checkout of that branch, run `python3 texts/al-tabatabai/tools/resume-current.py`. Its default reads only those two JSON files, verifies their accounting and next pending ID, and prints a compact result. For tool-only access, inspect those same two files; do not fetch the entire corpus just to determine the next task.
3. Open the one unfinished unit and source pages required for the chosen task. Save each completed unit or coherent batch, update the state and register together, and continue.

Counts and the next unit belong in the state and register, not in copied handoff prose. The preserved Stage X source checkpoint is [`1a967009`](https://github.com/gnamma-research/booksite/commit/1a967009e52f36923362b3a96e67574491314942). The restart repair retains its 387 bilingual units and 93 incorporated comparisons. These figures identify that preserved checkpoint; later progress must be read from the current files.

## Deeper checks and remaining release work

Use `resume-current.py --check-text` when actual book files are present and text hashes need checking. The existing `verify-current-checkpoint.py` performs full checkpoint verification after its listed files have been materialized. Neither check certifies scholarly correctness or publication. The canonical continuation is tracked in [PR 290](https://github.com/gnamma-research/booksite/pull/290); inspect the actual current checks rather than assuming a requested run exists.

The saved Muẓaffar Book V draft and integrated Nihāya reports are retained. Muẓaffar review and Book VI, the remaining Nihāya comparisons, and the nine-PDF release are distinct queues in the state. Do not restart completed translation or replay integrated reports. Older dated branches, reports and archives remain historical evidence. Load them only for a specific evidence question; do not reload failed conversations, unpack the large archive, rebuild PDFs or launch browser suites as routine startup.

If the small check detects a mismatch, reconcile the named records. Do not reset to an older branch or silently discard later work. This repair addresses demonstrated continuation defects; it does not establish or repair the cause of a ChatGPT conversation error.

