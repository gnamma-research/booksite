# Enable optional Google Drive backups for Gnamma
23 October 2026 — manual Backup & Transfer, not automatic synchronisation

## What the owner needs
A Google account with access to Google Cloud Console, and authority to configure Gnamma's public website. No private OAuth client secret belongs in GitHub Pages. The OAuth web **client ID** is deliberately public; it simply identifies the website to Google's authorisation interface.

## Setup
1. Visit https://console.cloud.google.com/ and create or select a project called **Gnamma Research** (the name is only a suggestion).
2. Under **APIs & Services → Library**, enable **Google Drive API**.
3. Open **Google Auth Platform → Branding** and set the application name (e.g. Gnamma Reading Desk), contact email, homepage, privacy policy and support information.
4. Under **Audience**, choose **External** if readers outside your Google Workspace will use it. Add your own Google account under *Test users* while testing.
5. Under **Data access**, request only the non-sensitive scope `https://www.googleapis.com/auth/drive.file`. This lets Gnamma create and use its own dated backup files in the reader's Google Drive, not browse their entire Drive.
6. Under **Clients → Create client → Web application**, name the client (e.g. Gnamma Darūrī reader). Add this exact **Authorised JavaScript origin**: `https://gnamma-research.github.io`. Do not append `/booksite/daruri/`; an origin is only scheme plus hostname and optional port.
7. For the JavaScript token-client model, no redirect URI is necessary. Copy the generated **Client ID**, shaped like `NUMBER-TEXT.apps.googleusercontent.com`.
8. Update the PUBLIC value `clientId` in `daruri/google-drive-config.js`, preserving quotes and leaving all secret values out of the repository. Release the change with the site's cache-asset version updated; confirm the reader shows **Back up to Google Drive** and **Restore from Google Drive** under **Reading Desk → Manage → Backup & Transfer**.
9. Test with your own Google account before public release: back up on one device, retrieve on another, review the import summary, ensure the new device's current reading location and theme remain unchanged, then test deliberate Resume and Return.
10. If Google requires domain ownership or branding verification before production, complete it in Google Auth Platform. A custom domain owned by Gnamma may simplify verification and branding compared with `github.io`.

## Costs and limitations
Creating an OAuth client ID does not itself have a charge. Google Drive API **standard use** currently incurs no additional cost. As of May 2026, Drive API quotas changed for newly created projects, and Google plans charges for excessive usage later in 2026. Check quotas and billing terms in the console; do not promise unlimited zero-cost use.

Readers keep local access without Google. The browser-only authorisation can expire, so transfer happens on explicit user action; no background sync. A reader's organisation can prohibit third-party Drive access. Creating/using the user's Drive folder requires permission, and normal Drive quota applies. Never store Google access tokens, client secrets, service-account keys or personal backups in the GitHub repository.

Users can always **Download complete backup**, **Share complete backup** or **Import a backup file** without Google. JSON has a stable version 1 Reading Desk envelope with optional `gnammaBackup` reading-place and appearance metadata. Imports are merged and require explicit confirmation. A restored location is offered, never silently applied.

Google official resources:
- https://developers.google.com/workspace/guides/create-credentials
- https://developers.google.com/identity/oauth2/web/guides/use-token-model
- https://developers.google.com/workspace/drive/api/guides/api-specific-auth
- https://developers.google.com/workspace/drive/api/guides/limits
