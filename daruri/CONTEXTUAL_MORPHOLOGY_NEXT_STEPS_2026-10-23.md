# Gnamma — contextual Arabic morphology: implementation and release gate
Date: 23 October 2026
Branch: `feature/contextual-search-clarity-20261023`
Scope: Darūrī and al-Mustaṣfā reader search, no PDFs or apparatus modifications.

## What a reader can use now
- Fast Quick Find with a 260 ms idle-time search and stable input focus.
- Expanded Research Search with clearly named matching options:
  * Words & terms: written forms, common spellings and curated terminology
  * Exact word: normalized whole-word spelling, not literal Unicode-byte match
  * Forms of one word: lemma, i.e. morphological variants of a dictionary headword
  * Root family: derivational relatives, not synonyms or one grammatical word
  * Scholarly concepts: curated editorial relationships, not a morphology category
  * Nearby words / Advanced patterns: research-specific queries
- Each Research mode gives a human explanation immediately below the dropdown.
- Content/source filtering is not repeated as both tabs and a select on the Research screen.
- Sort order and concordance are in **More research options**; CSV download and source breakdown remain accessible.
- Tapped Arabic text is associated where possible with its **specific word position** in the published paragraph, not merely the same spelling somewhere else in that paragraph.
- Note anchors, lexical anchors, personal highlights/bookmarks and text selection keep independent click behavior; personal notes never enter public morphology datasets.

## What is *not* published
The two shipped `morph-*-v1.json` indexes remain the October 22 **curated, incomplete, provisional** datasets built from 56 preselected root/lemma families. They are NOT a full word-by-word disambiguation of Classical Arabic. Their provenance must be visible. The current word inspector must not present an arbitrary candidate as the author's certain grammatical meaning. Users may see incomplete or overlapping word-form and ordinary search results.

The **offline** `daruri/build/build_gnamma_morph_index.py --mode bert --out-dir /tmp/morph-review` pipeline can build contextual candidates using CAMeL's BERT model on complete paragraph windows, but no BERT output has been reviewed or committed to public reader assets as of this handoff. Model weights remain local, outside the browser bundle. Model availability, disk/memory, and processing time have not been benchmarked in this environment.

## Improvements in this branch
1. Convert CAMeL model roots (e.g. `ش.ر.ع`) to actual searchable Arabic `شرع`, and retain empty roots when the lemma is valid (e.g. certain particles).
2. Distinguish CAMeL sense IDs `شارِع_1` versus `شارِع_2` while displaying the lexical headword `شارِع`. Homographs with distinct lexical IDs should not be silently conflated by word-inspector display.
3. Bind a word tap to its paragraph-relative token position when verifiable. Fall back to explicitly provisional, unanchored form analysis when the DOM/published-token mapping is unclear. This prevents false precision.
4. Provide a reproducible adjudication sheet tool:
   ```sh
   python3 daruri/build/export_morph_review.py \
     --index /tmp/morph-review/morph-daruri-v1.json \
     --count 250 --output /tmp/daruri-review.csv
   ```
   It samples ambiguous + unambiguous occurrences, preserves the source passage ID and nearby words, includes suggested analyses, and **leaves reviewer judgment blank**.
5. CI syntax checks and dependency-free normalization/provenance/gold-export tests added to `.github/workflows/daruri-unified-search-qa.yml` in addition to existing browser search suites.

## Required steps before claiming *full* contextual morphology
1. On a suitable separate build machine, install a compatible CAMeL Tools release and the `disambig-bert-unfactored-msa` data package. Confirm the model and source witness licenses; do NOT commit model weights.
2. Run the contextual builder in a staging directory. Set `--include-all` if the goal is **every Arabic token**, not only the curated root-family subset. Preserve the original text and stable `passage:section:segment` / `arabic:page:paragraph` IDs, check token alignment (including diacritics and editorial anchors).
3. Export gold-review sheets from BOTH corpora. Human readers of classical Arabic/uṣūl al-fiqh should independently adjudicate a stratified sample of disputed and ordinary words, including lexical senses of `الشارع`, `الحكم`, `العلم`, `علة`, `القياس`, `ظاهر`, `الأصل` and `النص`. Use original sentence context.
4. Compute exact lemma, root, POS and lex-sense correctness by book, and separately for ambiguous tokens and terms of art. Track disagreements and review false-positive search matches. Set an explicit release threshold before promotion; do not equate model confidence with validation.
5. Only once the evaluation is acceptable, version a **new** contextual output schema, switch the browser's lazy index filename to it, invalidate the service-worker cache, run all iPhone & desktop regression suites, and review the deployed reader. Preserve an honest `automated, unchecked` label for unreviewed occurrences and `reviewed` only for adjudicated entries.
6. Model-free fallback remains, and normal reading/search should work without loading the optional contextual index. No inference should run on each keystroke.

## Work estimates (engineering-effort ranges, not promised delivery dates)
- UI clarification and source-occurrence plumbing: integrated on this branch; regression CI pending.
- Obtain/deploy model + run complete batch indexing and validate IDs: **2–5 developer-days** after local dependencies/weights are available; hardware speed not measured.
- Gold sampling, scholarly adjudication and error analysis: **1–3 calendar weeks** for the two current works if Arabic specialist review is available; could be longer for low-confidence or historically unusual constructions.
- Publishing reviewed contextual lookup and ensuring source/reader parity: another **2–4 developer-days**, subject to corpus/index compatibility.
- Whole library beyond these two books and concept-level semantic search: separate larger workstream.

Review and merge this feature branch through PR rather than replacing the main branch. Avoid overlapping updates to edition scripts, PDFs, Q/H/N notes, or personal Reading Desk controls.
