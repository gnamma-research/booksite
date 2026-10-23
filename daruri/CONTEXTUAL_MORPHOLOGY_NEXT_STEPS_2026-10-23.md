# Gnamma — contextual Arabic morphology: implementation and release gate
Date: 23 October 2026
Branch: `feature/contextual-search-clarity-20261023`
Scope: Darūrī and al-Mustaṣfā reader search, no PDFs or apparatus modifications.

## What a reader can use now
- Fast Quick Find with a 260 ms idle-time search and stable input focus.
- Expanded Research Search with clearly named matching options:
  * Words & terms: written forms, common spellings and curated terminology
  * Exact word: normalized whole-word spelling, not literal Unicode-byte match
  * Word forms: lemma, i.e. grammatical variants of a dictionary headword
  * Related words (root): derivational relatives, not synonyms or one grammatical word
  * Scholarly concepts: curated editorial relationships, not a morphology category
  * Nearby words / Advanced search: research-specific queries
- Each Research mode gives a human explanation immediately below the dropdown.
- Content/source filtering is not repeated as both tabs and a select on the Research screen.
- Sort order and concordance are in **More research options**; CSV download and source breakdown remain accessible.
- Tapped Arabic text is associated where possible with its **specific word position** in the published paragraph, not merely the same spelling somewhere else in that paragraph.
- Note anchors, lexical anchors, personal highlights/bookmarks and text selection keep independent click behavior; personal notes never enter public morphology datasets.

## What is *not* published
The two shipped `morph-*-v1.json` indexes remain the October 22 **curated, incomplete, provisional** datasets built from 56 preselected root/lemma families. They are NOT a full word-by-word disambiguation of Classical Arabic. Their provenance must be visible. The current word inspector must not present an arbitrary candidate as the author's certain grammatical meaning. Users may see incomplete or overlapping word-form and ordinary search results.

The **offline** `daruri/build/build_gnamma_morph_index.py --mode bert --out-dir /tmp/morph-review` pipeline now supports all analyzable lexical tokens by default, with sentence-level context windows and ranked alternative analyses for inspection. Alternatives never enter ordinary root/lemma search postings. Only diagnostic runs use `--curated-roots-only`. The builder refuses to overwrite the live curated files. No real BERT output has been reviewed or published as of this handoff. Model weights remain local, outside the browser bundle. Model availability, disk/memory, and processing time have not been benchmarked in this environment.

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
2. Run the contextual builder in a staging directory. The default BERT mode targets all analyzable lexical tokens; backoff guesses are not silently given roots. Run `--work daruri --max-paragraphs 50` for a smoke sample then `--max-paragraphs 0` for the full work. The opt-in manual GitHub Actions workflow `daruri-contextual-morphology-review.yml` can download model data and produce review artifacts for either work without writing to the live website. Preserve stable IDs and check token alignment.
3. Export gold-review sheets from BOTH corpora. Human readers of classical Arabic/uṣūl al-fiqh should independently adjudicate a stratified sample of disputed and ordinary words, including lexical senses of `الشارع`, `الحكم`, `العلم`, `علة`, `القياس`, `ظاهر`, `الأصل` and `النص`. Use original sentence context.
4. Compute exact lemma, root, POS and lex-sense correctness by book, separately for ambiguous tokens and terms of art. The `evaluate_morph_review.py` gate accepts only explicitly adjudicated rows and checks sample count plus accuracy; `--min-reviewed 250 --min-exact-accuracy 0.92` are provisional threshold examples, not editorial sign-off. Track disagreements and false-positive search matches; a model's rank is never a calibrated confidence percentage.
5. Only once evaluation and editorial authorization are acceptable, version a **new** contextual output schema, change the reader's lazy index filename, invalidate service-worker caches, repeat mobile and desktop checks, and inspect the deployed site. Model features are already displayed in an expandable word card, marked automatically proposed. Preserve an honest `automated, unchecked` label for unreviewed occurrences and `reviewed` only for adjudicated entries.
6. Model-free fallback remains, and normal reading/search should work without loading the optional contextual index. No inference should run on each keystroke.

## Current release boundary
The full reader browser regression suite passed on feature commit `0e9d91be`; later new evaluator/workflow commits require a fresh CI pass. The source-sensitive tests are synthetic: they validate code and provenance without claiming that Modern Standard Arabic BERT predictions are scholarly truth.

Model output explains a grammatical possibility, not automatically the *juristic sense* of a word such as `حكم` or `قياس`. Dictionary glosses are kept separately and labelled as automated. For a model sample, go to GitHub Actions → Daruri contextual morphology candidate review → Run workflow; choose one work and use 0 for all paragraphs. This workflow is manual to avoid repeated expensive downloads.

## Large-corpus performance and optional expert search
The currently published two source witnesses comprise about 201,000 Arabic tokens. A contextual index that stores multiple analyses and inflectional features per token is much larger than the current curated assets. Do **not** publish an unmeasured all-token JSON bundle to mobile Safari: first profile download, parse time and memory on an actual iPhone, and separate compact lemma/root search postings from source-occurrence detail shards if needed. Query and private Reading Desk data must not be transmitted to an AI service.

Once contextual analysis is trustworthy and fast, consider expert-only grammatical facets (noun/verb, case, mood), source-sensitive Arabic/English concordance, and combining morphological predicates with proximity. Keep these under research options rather than adding permanent controls to Quick Find.

## Work estimates (engineering-effort ranges, not promised delivery dates)
- UI clarification and source-occurrence plumbing: integrated on this branch; regression CI pending.
- Obtain/deploy model + run complete batch indexing and validate IDs: **2–5 developer-days** after local dependencies/weights are available; hardware speed not measured.
- Gold sampling, scholarly adjudication and error analysis: **1–3 calendar weeks** for the two current works if Arabic specialist review is available; could be longer for low-confidence or historically unusual constructions.
- Publishing reviewed contextual lookup and ensuring source/reader parity: another **2–4 developer-days**, subject to corpus/index compatibility.
- Whole library beyond these two books and concept-level semantic search: separate larger workstream.

Review and merge this feature branch through PR rather than replacing the main branch. Avoid overlapping updates to edition scripts, PDFs, Q/H/N notes, or personal Reading Desk controls.
