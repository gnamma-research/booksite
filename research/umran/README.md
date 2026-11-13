# Work, Vocation & ʿUmrān — Research subsite

**Location:** `/research/umran/` (listed in the Gnamma Research index).
**Stage:** public-facing research draft v3, 13 November 2026. The journal and fundraiser content remains a preliminary, source-attributed research corpus.
**Project:** a traditional account of human purpose, communal obligations, social sufficiency, and differentiated forms of contribution. Islam is the most fully articulated tradition in this edition; other traditions are not treated as interchangeable.

## Pages

- `index.html`: editorial landing page and starting paths
- `principles.html`: human end, farḍ kifāya, seven-test research method
- `needs.html`: fourteen searchable communal-need and capacity dossiers
- `needs.json`: machine-readable draft need records with unknown actual sufficiency status
- `vocations.html`: twelve introductory field and vocation studies
- `guide.html`: five-part decision guide and browser-local exploratory worksheet
- `pathways.html`: modes of contribution, opportunity publishing standard, no invented job listings
- `malaysia.html`: nine annotated Malaysian and Malaysia-associated juristic, educational and institutional research sources
- `malaysia.json`: source provenance and qualifications
- `projects.html`: ten source-linked LaunchGood campaign observations as community-needs leads, not verified shortages
- `projects.json`: structured campaign leads with source dates, claimed interventions and verification questions
- `evidence.html`: four worked source-linked sufficiency audits, distinguishing measured condition, provider output, official targets and campaign claims
- `assessments.json`: sources, quantitative observations, uncertainties, comparison principles and further evidence requirements for the four audits
- `assess.html`: private browser-local research assessment studio; generates an incomplete/complete-descriptive research memo without issuing legal or sufficiency verdicts
- `assess.js`, `evidence.css`: worksheet logic (clipboard, JSON export and print) and responsive evidence-desk styles
- `sources.html`: selected references, source types, limits, current evidentiary status and open questions
- `style.css`, `app.js`: local, no-build responsive stylesheet and progressive enhancement

## Evidence Desk and source-level interpretation

Four worked examples show distinct epistemic positions:

1. Penang: official household poverty and income statistics (2024), with official public zakat distribution (2025). These measure different units and periods, and do not establish benefit coverage or adequacy.
2. Malaysia education: OECD PISA 2025 learning indicators (released September 2026). Outcomes do not identify which teaching or curriculum capacity is lacking.
3. Malaysia mental health: NHMS 2023 population indicator and Ministry of Health psychiatrist-to-population ratio against its official target as of 1 April 2026. The target gap does not capture all mental-health provision.
4. Bangi: a closed LaunchGood education campaign. The quantities remain organiser claims, not independently evaluated outcomes.

`assessments.json` stores the source provenance, date, population, evidence type, normative question and data limitations for each observation. The assessment studio does not store or transmit input. It only evaluates whether the **investigator has described** the necessary fields, not whether facts or legal rulings are independently correct.

## Editorial safeguards

A proposed communal duty is not a claim of an actual shortage. Likewise, a LaunchGood campaign is an organiser narrative, not an independent finding that a community has a legal obligation or an unmet service threshold. The sample is purposive and non-representative; fundraising totals must not be used to rank duties. Ḥadd al-kifāyah in household welfare/zakat assessments is different from farḍ kifāya. Need records are provisional, with actual sufficiency status **unknown**. No automated assignment of personal duties or spiritual rankings. No live job opportunities are displayed unless source, validity date, and other essential details are verified. This is a research site, not a religious ruling or career placement service.

## Maintainer checklist

1. Verify original Arabic passages before asserting a definitive juristic position.
2. Distinguish normative obligation from empirical undersupply; log place and date for the latter.
3. Record contrary juristic positions and who is able to provide a binding ruling.
4. Ensure occupation pages distinguish output, personal formation, lawful means, and actual work conditions.
5. Keep accessible static content without JS; test mobile layout, filtering and worksheet before deployment.
6. Re-check original campaign URLs and source snapshots before citing them; do not imply the fundraising is ongoing.
7. Preserve existing Research and book-reader navigation.
8. Separate claims made by institutions from independent baseline evidence and credible evaluations.
9. Never equate public target values with a binding juristic minimum; never compare data using incompatible denominators, years or populations.
10. For numerical updates, revise `assessments.json` and the matching static page together; retain source dates and note any methodological discontinuities.
11. Avoid identifying vulnerable beneficiaries in any submitted research draft; browser-local input is not a substitute for a formal privacy review if server-side storage is ever introduced.

## Intellectual relationship

The information architecture is loosely analogous to the foundations, problem profiles, career reviews, guide and jobs listings on 80,000 Hours (https://80000hours.org/). Neither the site's ethics nor individual job recommendations are adopted.
