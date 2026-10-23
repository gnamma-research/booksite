/* OAuth client IDs are public identifiers, not secrets.
 * Site owner: create a Google OAuth Web client with the reader's HTTPS origin
 * in Authorized JavaScript origins, enable the Google Drive API, and fill in
 * the public client ID below. Until configured, local backup/import remains
 * fully functional and Google Drive controls clearly show that they are off.
 */
window.GnammaDriveConfig=window.GnammaDriveConfig||{clientId:''};
