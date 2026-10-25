'use strict';
/* Verify that the actual published scholarly ZIP matches the navigable
 * Editions manifest. This never changes source material or downloads data. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'..');
const meta=JSON.parse(fs.readFileSync(path.join(base,'source-archive-manifest.json'),'utf8'));
const file=path.join(base,'source/Daruri_Portable_Scholarly_Source.zip');
const bytes=fs.readFileSync(file);
const actual={sha256:crypto.createHash('sha256').update(bytes).digest('hex'),
 size_bytes:bytes.length,header:bytes.subarray(0,4).toString('hex')};
const expected={sha256:meta.sha256,size_bytes:meta.size_bytes};
console.log('SOURCE ARCHIVE ACTUAL '+JSON.stringify(actual));
console.log('SOURCE ARCHIVE MANIFEST '+JSON.stringify({version:meta.version,...expected}));
assert.equal(actual.header,'504b0304','Source archive is not a ZIP');
assert.equal(meta.status,'published','Do not expose unpublished source');
assert.equal(meta.editorial_review,'approved');
assert.equal(meta.rights_review,'approved');
assert.equal(meta.file,'source/Daruri_Portable_Scholarly_Source.zip');
assert.equal(meta.size_bytes,actual.size_bytes,'Published manifest hides updated ZIP due to byte-length mismatch');
assert.equal(meta.sha256,actual.sha256,'Published manifest refers to another archive revision');
console.log('PASS: exact signed scholarly source ZIP is exposed with current size and SHA-256');
