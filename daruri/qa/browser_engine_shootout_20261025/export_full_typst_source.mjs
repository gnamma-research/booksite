#!/usr/bin/env node
/* Deterministically export the *same* 1.67MB Typst source produced in-browser
 * from the current canonical Gnamma Scholarly HTML. Feed it to the enhanced
 * Krilla engine for full-book Arabic copy, notes, dictionary and link testing.
 *
 * This does NOT source an existing scholarly PDF nor make edition edits.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {JSDOM} from 'jsdom';
import {makeTypstFromCanonicalHtml} from '../stage2_shootout/ultimate_html_to_typst.mjs';
const ROOT=path.resolve(import.meta.dirname,'../../..');
const input=process.argv[2]||path.join(ROOT,'daruri/qa/stage2_shootout/runtime_ultimate/scholarly.html');
const metaFile=process.argv[3]||path.join(ROOT,'daruri/qa/stage2_shootout/runtime_ultimate/scholarly.source.json');
const out=process.argv[4]||'/tmp/daruri-typst-enhanced/full-current-scholarly.typ';
fs.mkdirSync(path.dirname(out),{recursive:true});
const html=fs.readFileSync(input,'utf8');
const record=JSON.parse(fs.readFileSync(metaFile,'utf8'));
const sha=crypto.createHash('sha256').update(Buffer.from(html,'utf8')).digest('hex');
if(record.html_sha256!==sha)throw Error('Canonical Scholarly HTML hash mismatch');
const dom=new JSDOM('<!doctype html><html><body></body></html>');
globalThis.Node=dom.window.Node;
globalThis.DOMParser=dom.window.DOMParser;
const started=performance.now();
const {source,metrics}=makeTypstFromCanonicalHtml(html,record);
if(metrics.original_notes!==625||metrics.historical_articles!==157||metrics.historical_terms!==153)
 throw Error('Incomplete canonical source and historical reference content');
if(metrics.validated_internal_target_count!==660)
 throw Error('Unexpected missing destination groups');
if(metrics.dictionary_directory_original_entries!==153)
 throw Error('New 153-term numbered directory not present in Typst conversion');
if(source.length<1000000)throw Error('Truncated converted Scholarly source');
fs.writeFileSync(out,source,'utf8');
const hash=crypto.createHash('sha256').update(source,'utf8').digest('hex');
const report={
 schema:'gnamma-canonical-html-to-enhanced-typst-source-v1',
 source_html_sha256:sha,
 original_html_bytes:Buffer.byteLength(html,'utf8'),
 output_typst_sha256:hash,output_typst_chars:source.length,
 original_note_objects:metrics.original_notes,
 lexicon_terms:metrics.historical_terms,lexicon_articles:metrics.historical_articles,
 link_target_families:metrics.validated_internal_target_count,
 dictionary_directory_terms:metrics.dictionary_directory_original_entries,
 source_only_no_prebuilt_pdf:true,
 conversion_ms:Math.round(performance.now()-started),
 generated_typst:out,
 converter_stats:metrics
};
fs.writeFileSync(path.join(path.dirname(out),'source-export.json'),JSON.stringify(report,null,2)+'\n');
console.log('GNAMMA_ENHANCED_FULL_TYPST_SOURCE',JSON.stringify(report).slice(0,3100));
dom.window.close();
