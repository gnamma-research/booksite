# Optional Ask AI workspace — implementation and QA (21 October 2026)

This independent feature is meant to preserve the current Darūrī reader, text, notes, study guide, PDF apparatus, themes and navigation. It introduces **no AI API keys, database or site-paid subscriptions**.

## Two routes
- **Free.ai**, using the officially documented `https://free.ai/embed/chat/` iframe. Visitors manually copy a prepared source-linked question into the iframe, and manually paste the answer into a Darūrī-owned import field. The site does not scrape iframe contents or claim to know available provider credits. The visitor may **Hide Free.ai on this device**; this disables the iframe and remembers the preference until the user restores it.
- **Use my AI**, offering a copy/share handoff to ChatGPT, Gemini, Claude, Duck.ai or any other installed assistant. Login and usage limits are the provider's, not Darūrī's. The Reading Desk import works independently of any external AI provider.

All provider output is a user-imported **AI-assisted private note**, explicitly labelled unverified. Question, answer, provider, optional personal reflection, timestamp and section or passage anchor are retained. Only the explicit Save action persists the answer in the existing browser-local Reading Desk, using its conflict-protected writer. Failed saves retain the popup draft in the current browser tab's session storage.

## Checks completed before feature-branch commit
- 123 browser automation assertions on a standalone representative Reader fixture at desktop 1440×900, tablet 768×1024, phone 390×844, small phone 320×640 and landscape 844×390.
- Tested initial lazy iframe load, embedded URL, no-popup startup, multi-entry contextual triggers, bilingual source context, complete source anchors, empty-answer validation, deliberate saving, provenance, saved reflection, failure retention, persistent hide/restore preference, returning draft, external AI link safety, Escape dismissal, popup bounds, HTML injection resistance and refusal to silently truncate oversized answers.
- Inspected desktop and mobile screenshots. The real third-party Free.ai iframe was deliberately blocked during automated tests to verify the graceful fallback.
- Static syntax and exact-match integration checks against current Reader, Reading Desk, service worker and download bundle. Main inline Reader JS parses and canonical corpus data remains unchanged.

## Browser/live QA still needed
This is **not** an assertion of successful use in iPhone Safari, live Free.ai availability, clipboard prompts on all browsers, or a full real-Reader rendering test. Verify the iframe live (including exhaustion/region blocking), Safari native sharing, keyboard and notch-safe geometry, focus return, cross-tab Reading Desk conflicts, and complete offline ZIP on physical devices. Do not publish a claim of verified mobile service uptime without those checks.

## Maintenance / rollback
New files are `ask-ai.js` and `ask-ai.css`. Integration is limited to their script/style tags, a one-line Reader connection, the small Reading Desk save method, service-worker cache and download-bundle manifest. Removing those integrations fully restores the prior feature set without migrating or deleting saved notes. Existing AI-assisted notes remain readable/exportable because they are ordinary labelled Reading Desk note records.
