GNAMMA BIDAYA INTEGRATION — 27 OCTOBER 2026

Public entry: research/bidaya/index.html
Edition I: research/bidaya/law/
Edition II: research/bidaya/human-life/
Wider research: reservoir.html inside either edition.

This imports the actual Usul–law–Rushd reader, not the three-topic Gnamma prototype.
The original hosted Site is retained without modification.

SOURCE OF TRUTH
The existing Usul–law–Rushd Work workspace supplies the canonical manuscripts,
source records and reader assets. The import preserves its eight-study public
reader and complete existing wider manuscript. Locally retained corpus-pilot.json
and corpus-reservoir.json record the imported HTML and source hash. The two
editions are generated from that same corpus. Their legal core is checked for
equality. The local legal-foundation.json is a generated structured index,
not a competing editorial master. New editorial IDs distinguish extracted
blocks that had no original ID; original heading, case and passage IDs remain.

To re-import from that workspace, with Python 3 and lxml available:
  python3 tools/bidaya/build.py SOURCE_WORKSPACE REPOSITORY_CHECKOUT
  python3 tools/bidaya/verify.py SOURCE_WORKSPACE REPOSITORY_CHECKOUT

Run inventory.py only to establish a new deliberate baseline, never to mask
unexpected differences. Existing imported source files are not edited by build.py.
The gateway, edition-navigation.js, source-navigation.js and gnamma-bidaya.css
are maintained directly in research/bidaya/. build.py leaves these in place.
The original publication/build pipeline is separate from this GitHub Pages import.

EDITION POLICY
Edition I removes the explicitly identified formation, social-effect, symbolic,
alchemical and interpretive-focus layers, retaining the legal and contextual
inquiry. Pure inward-exegesis blocks belong to Edition II. Technical legal
foundations and all344 annotated legal-core blocks in the wider reader remain.
Some old mixed or unclassified prose needs scholarly review; the layer mapping
does not certify every inference or attribute a new doctrine to Ibn Rushd.
Excluded passage anchors have a route to their Edition II context. Eight-study
and reservoir IDs retain their original page scope.

PRESERVATION AND REVIEW
shared/content-parity.json contains before/after scope and one preservation row
for each of the8 selected and72 wider representative studies.
The local source-inventory.json records132 unchanged authoritative input files.
shared/verification.json records text equality, source images and local links.
shared/browser-checks.json states the narrower browser-test boundary.
The81 shared source images preserve the original bytes. Full PDFs and private
source-library archives are not published.

The independent alternative-usul casebook, its edition-specific pages and the
qawanin dossier retain their existing files and identifiers. Earlier prototype
pages, including their provisional glossary, survive as prototype.html beside
the old edition routes. They are not the canonical Revision16 text.

Preserve all original source warnings. In particular, the REP-43 recommendation
to distinguish imposition from release of interdiction and foreground Q4:5–6
remains a research task, not a silent migration edit. No completion percentage
or exhaustive Bidāya interpretation is claimed.

PUBLICATION
Fetch the current master before updates; other chats also modify this repository.
Use a base tree from that head and an expected-SHA ref update. Do not overwrite
unrelated files, create a replacement Site or publish the complete source corpus.
Verify the Pages deployment and the live Research entry after the ref changes.
