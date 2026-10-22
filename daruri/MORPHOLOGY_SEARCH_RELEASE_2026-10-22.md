# Gnamma Darūrī: morphological search and word context

Development branch: \`feature/contextual-morph-search-20261022\`. Changes are
deliberately confined to search, morphology and word-context modules,
their included assets, tests, and distribution manifest. Do not overwrite
PDFs, scholarly note data, or reader controls from concurrent releases.

## Reader interaction

A single magnifier opens Quick Find. Typing/deletion are native and immediate.
Results update after 260ms of inactivity; the input element is not replaced
or refocused for each character. Press Enter to evaluate the current query
immediately. Expanded Research view shows a single set of work/content/match
controls; desktop source counts are optional. Sort, display, conditions,
proximity and concordance remain available without competing with the
initial interface.

For a recognised Arabic form, the result header offers Words, Exact,
Lemma, Root. Roman input may represent a transliterated full lemma (qiyās,
ijtihad) or explicit consonantal root (qys, jhd, ktb). Root search is a
derivational family, **not** a semantic synonym search. Results distinguish
surface wording, lemma, root, source and provisional analysis.

When clicking ordinary Arabic words, a word-context dialog offers:
1. Attested morphological analysis and its uncertainty;
2. If recorded, an actual glossary definition (separate, not silently merged);
3. Precisely anchored editorial/source notes, separately from section-wide
   notes not attributable to that word;
4. Private annotations and bookmarks by section or paragraph, without
   exposing their content through the public index;
5. Explicit independent search actions for exact / words / lemma / root.

Normal dictionary links **retain their dictionary popup** as the primary
action, with search links appended below. Existing note anchors **retain their
note action**. A selected text range keeps the Reading Desk selection
toolbar, with an optional Explore word action. Highlight colour or a bookmark
never makes a word a dictionary headword or authorial source quotation.
Nested editorial, personal, dictionary and search layers must not override
one another.

## Search index provenance and actual coverage

\`morph-lexicon.json\` is a hand-curated *initial* list of 56
lemma/root families with common forms and Roman alternatives. The corresponding
indexes were built from the **published text**, preserving exact IDs:

| Index | Corpus segments | Annotated segment records | Word tokens | Morphological analyses |
| --- | ---: | ---: | ---: | ---: |
| \`morph-daruri-v1.json\` | 416 | 394 | 21,686 | 2,178 |
| \`morph-mustasfa-v1.json\` | 2,977 | 2,615 | 179,650 | 17,304 |

The annotations are NOT complete morphological analyses of every word.
Homographs are preserved as multiple labelled candidates rather than resolved
without evidence. Some explicit context rules handle a tiny number of
constructions; these alone do NOT qualify as a contextual language model.
Do not treat source \`curated\` or \`ambiguous\` as independent verification
of a Classical Arabic lemma. Do not use an uncertain analysis as a positive
lemma match without review.

A reproducible *offline* model pipeline is supplied in
\`build/build_gnamma_morph_index.py\`. To generate a genuine contextual
candidate index, install compatible CAMeL Tools plus the licensed Arabic
BERT disambiguation package, then run:

\`\`\`sh
python3 daruri/build/build_gnamma_morph_index.py --mode bert --out-dir /tmp/morph-review
\`\`\`

This operates over sentence/context windows in each paragraph. CAMeL BERT's
MSA training is **not** validated classical legal Arabic; it requires manual
checking against a gold set for each historical corpus before publishing.
Never bundle language-model weights in the client. The current public
\`morph-*-v1.json\` files are **curated**, not BERT outputs.

## Performance and privacy

Morphological lexicon is small. Per-work static JSON indexes load only when
lemma/root search is used; al-Mustaṣfā is also loaded only when Gnamma Library
is chosen. This removes morphological analysis from keystrokes. The old
65ms full-modal rerender was replaced by a 260ms delayed results-pane-only
update; the input DOM stays stable and cacheable normalized strings reduce
recomputation. Need actual latency measurements on an iPhone before claiming
a numerical improvement.

Local Reading Desk records never enter the morphological build or network
and remain in the browser's existing storage schema. The word inspector is
read-only and does not mutate bookmarks/highlights/notes.

## Verification

\`\`\`sh
python3 daruri/build/build_gnamma_morph_index.py
node daruri/qa/verify-unified-search.cjs
node daruri/qa/verify-search-return.cjs
node daruri/qa/verify-proximity.cjs
node daruri/qa/verify-scholarly-patterns.cjs
node daruri/qa/verify-morphology.cjs
\`\`\`

The GitHub Actions search workflow executes the browser suites, script syntax,
and existing search index parity. Do not merge this branch until all green;
merge/rebase with the latest master to avoid erasing contemporaneous UI/PDF
changes. If the contextual BERT generation is not run and reviewed, label
it as *planned/available tooling*, never shipped contextual morphology.
