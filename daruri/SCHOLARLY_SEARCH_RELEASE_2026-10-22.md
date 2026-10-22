# Gnamma Scholarly Pattern Search · 22 October 2026

## Scope and prior work

This release adds an optional *Scholarly patterns* search mode to the
existing Darūrī Quick Find, Research Search, positional proximity search,
private Reading Desk search, and al-Mustaṣfā cross-work discovery.

It is deliberately a bounded, readable query language rather than
unrestricted JavaScript regular expressions. The regular search field
still works for ordinary words, with curated bilingual transliteration
expansion. Quick Find remains the default when reopening search.

## Supported search expressions

- Boolean AND, OR, NOT, grouping, implicit AND, including expressions
  like qiyas AND (illa OR sabab).
- Exact phrases such as "legal reasoning".
- Word-level patterns, e.g. اجته* (word prefix), ق?اس (one unknown
  character), مس[ؤئ]ول (alternative letter), and bounded edit-distance
  matching, e.g. اجتهاد~1 or اجتهاد~2.
- Ordered or unordered proximity expressions (NEAR/N and BEFORE/N)
  with maximum intervening-word distance 0–50.
- Selected language/content fields ar:, en:, title:, body:,
  and record classifications type:, kind:.
- Same passage (default), section, editorial part, or work scope.
  Arabic, English, and editorial/authorial records are never silently
  concatenated as if they were one language or one passage.
- Normalized Arabic search or "As encoded in this edition".
  The latter is **not** an independently transcribed manuscript witness.

## Research interface

The expanded Research Search includes an optional visual condition
builder with AND, OR, AND NOT; terms, phrases, prefixes, letter
patterns, and one/two-letter fuzzy matching. It displays its composed
query before execution and rejects unsupported syntax rather than
dropping it. A plain-language search interpretation and explicit
scope label appear alongside results.

Section/part/work-level Boolean matches show supporting passage links
individually, without falsely implying all conditions occur in the
same authorial paragraph. Search-return navigation restores the query,
scope, spelling mode, filters, result scroll and original reading place.

Complex searches may be saved, rerun and deleted. Saved search
definitions remain in browser localStorage and are not uploaded.

## Security and limitations

The parser is bounded by query length, expression depth, term count,
pattern length, wildcard count, edit-distance limit and synonym count.
A custom Unicode-aware matcher uses deterministic bounded algorithms;
user-supplied strings are never executed, evaluated, or supplied to
the native JavaScript RegExp constructor.

This is not a full morphological stem/lemma/root index, open-ended
regular-expression language, AI semantic retrieval, or manuscript
witness collation. Those would require separate editorial and
technical development. Only data actually present in Darūrī and the
published al-Mustaṣfā working corpus can be searched.

The interface inherits the existing reader palette and avoids
altering the Editions selector, PDFs, bookmarks, reader controls,
or private annotation records.

## Release assets and tests

- daruri/gnamma-scholarly.js: lexer, Boolean grammar, pattern matching,
  fuzzy edit matching and readable query explanations.
- daruri/gnamma-scholarly.css: themed, responsive scholarly controls.
- daruri/gnamma-search.js: index integration, scoped evidence,
  visual builder, saved searches, navigation and result previews.
- daruri/qa/verify-scholarly-patterns.cjs: Playwright browser suite.

Build/test from repository root:

    node daruri/qa/verify-unified-search.cjs
    node daruri/qa/verify-search-return.cjs
    node daruri/qa/verify-proximity.cjs
    node daruri/qa/verify-scholarly-patterns.cjs

The GitHub Actions workflow daruri-unified-search-qa.yml executes all
four suites and checks the generated al-Mustaṣfā index.

The feature tests create only disposable browser profiles. Private
user research is not read, uploaded or modified by CI.

## Coordination

This release is rebased onto the current booksite master, including
the active Darūrī three-mode reading, navigation and PDF releases.
Only one CSS and JS inclusion is appended at the end of the reader,
and the service-worker cache is extended without dropping existing
assets. Avoid replacing master HTML from an older handoff.
