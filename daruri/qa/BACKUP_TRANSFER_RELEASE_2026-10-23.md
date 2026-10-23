# Darūrī Backup & Transfer — release and operations

**Purpose:** local-first private reading, with a single manual backup/restore workflow rather than background syncing. The existing top-right appearance/settings panel remains untouched.

## User workflow

**Reading Desk → Manage → Backup & Transfer** opens a compact sheet/dialog containing:

- **Download complete backup**: JSON compatible with the existing Reading Desk format, plus optional gnammaBackup metadata for the current work's reading place and appearance.
- **Share complete backup**: operating-system share sheet when available; fallback JSON download. No automatic upload.
- **Import a backup file**: preview, counts, and checkbox choices for bookmarks/source references, highlights, personal notes, reading-place offer (on by default if present) and appearance (off by default).
- **Back up to Google Drive / Restore from Google Drive**: enabled only once a legitimate site-owned Google OAuth Web client ID is configured; creates dated files in the user's own visible **Gnamma Backups** Drive folder; no backend and no continuous syncing.
- **Restored reading place** remains accessible under Backup & Transfer after **Not now**. Choosing **Resume** deliberately navigates to that section and remembers the previous device place for a **Return** action.

**Reading Desk → Manage → Export readable notes (.md)** and **Open Bin** remain unchanged. The JSON import/export data and the Reading Desk record schema are not replaced; previous backups lacking gnammaBackup can still be imported. The user does not have to connect Google.

## Format and compatibility

The full backup remains a version 1 gnamma-reading-desk JSON object containing its complete items array. New archives add an optional top-level gnammaBackup metadata object with schema version 1, createdAt timestamp, readingPlace ({work, section, segment, at}), and appearance. Older files without metadata continue to work.

Reading locations are validated against actual current edition section and paragraph IDs. Unlike a raw pixel offset, these are robust when moving from phone to desktop. **Import never writes an incoming location to the device's live daruri-reader-v2.n**. It preserves the suggestion separately under the local key gnamma-restored-reading-place-v1. Only a deliberate Resume updates the current place, then retains the former place for Return.

Only allowed appearance keys are applied, and only after the user opts in. Other unrelated reader state and the current reading position remain unchanged.

The existing duplicate ID, newer-record, conflict-copy, Bin, and storage-conflict logic is reused. A backup cannot silently replace all records on the device.

## Enable optional Google Drive

This release **does not** contain a Google OAuth Web client ID. That ID must be created by a site administrator in a Google Cloud project:

1. Enable the **Google Drive API** for the project.
2. Configure the OAuth consent screen appropriately for the public site, including privacy links and verification steps required by Google.
3. Create an **OAuth 2.0 client ID of type Web application**, authorising the exact origin https://gnamma-research.github.io (or the eventual Gnamma-owned website origin).
4. Replace the empty public clientId value in daruri/google-drive-config.js with the newly issued Google web client ID. The client ID is a public identifier: do **not** place a client secret or refresh token in a static website.
5. Deploy and test with a Google account. The API asks only for the scope https://www.googleapis.com/auth/drive.file. Authorisation is always user-initiated.

The web client uses Google Identity Services initTokenClient/requestAccessToken and a time-limited bearer token kept **in memory only** (not localStorage). The app creates a **Gnamma Backups** Drive folder if needed, and creates a new dated JSON file per backup. Google is not contacted merely because someone reads the text or writes notes. Google Drive backups are ordinary private files, **not end-to-end encrypted by Gnamma**. The reader's own Google account supplies storage space. A failed connection never disables local bookmarks/notes.

The direct browser multipart Drive upload is intentionally limited to 5 MB; larger complete JSON backups remain available for local download. Import supports files up to 12 MB. A small explanatory error is shown rather than sending data to an unintended backend.

## Testing and release limits

- Tests operate against temporary localhost browser contexts and synthetic localStorage records; no private user notes or Google account is touched.
- Run node daruri/qa/verify-reading-desk-redesign.js for legacy Reading Desk regressions.
- Run node daruri/qa/verify-backup-transfer-browser.cjs for browser tests of full file export, modal keyboard support, selective restoration, non-overwrite of current reading place, resume/return, older JSON compatibility, and **mocked** Google Drive OAuth/upload/list/download.
- The GitHub Reading Desk browser QA workflow also exercises Chromium and WebKit. Physical iOS Safari, Google production consent, and real Drive API calls require subsequent site-owner verification.

## Reference documentation

- https://developers.google.com/identity/oauth2/web/guides/use-token-model
- https://developers.google.com/workspace/drive/api/guides/create-file
- https://developers.google.com/workspace/drive/api/guides/manage-uploads
- https://developers.google.com/workspace/drive/api/guides/api-specific-auth
