#!/usr/bin/env node
/** Compatibility entrypoint: the former Arabic-outline check now verifies
 * the user's replacement Ar / En labels and their shared typography.
 * Run: node daruri/qa/verify-arabic-toggle-geometry.js [reader-html]
 * Arabic/English transition behavior is covered by verify-language-cycle.js.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(process.argv[2]||path.resolve(__dirname,'..','index.html'),'utf8');
const renderer=html.match(/function languageButtons\(\) \{[\s\S]*?\n\}/)?.[0];
assert(renderer,'Missing language button renderer');
let cases=0;
for(const lang of ['english','arabic','parallel'])for(const vowels of [false,true]){
 const markup=vm.runInNewContext(renderer+'\nlanguageButtons()',{state:{lang,vowels}});
 const arabic=markup.match(/<button\b[^>]*data-language-toggle="arabic"[\s\S]*?<\/button>/)?.[0];
 const english=markup.match(/<button\b[^>]*data-language-toggle="english"[\s\S]*?<\/button>/)?.[0];
 assert(arabic&&english,'Both language buttons remain present');
 for(const [button,label]of [[arabic,'Ar'],[english,'En']]){
  const span=button.match(/<span\b[^>]*class="gn-language-label"[^>]*>([^<]*)<\/span>/);
  assert(span,'Both buttons use the shared label class');assert.equal(span[1],label,'Exact requested capitalization');
  assert.match(span[0],/aria-hidden="true"/,'Descriptive button labels remain the accessible names');
  assert.doesNotMatch(button,/<svg\b|[\u0600-\u06ff]|style=/,'No retired Arabic glyph, outline, or one-off inline typography');
  assert.match(button,/aria-label="[^"]+"/);assert.match(button,/title="[^"]+"/);
 }
 const expected=lang==='english'?'off':vowels?'vowelled':'plain';
 assert(arabic.includes('data-arabic-state="'+expected+'"'),'Arabic state remains explicit');
 assert(arabic.includes('aria-pressed="'+(lang!=='english')+'"'));
 assert(english.includes('aria-pressed="'+(lang!=='arabic')+'"'));
 assert.match(arabic,/Show Arabic|Show Arabic with tashkīl|Hide Arabic|Remove tashkīl/,'Arabic cycle remains described');
 cases++;
}
const rule=html.match(/#readingControls\s+#persistentLanguages\s+\[data-language-toggle\]\s+\.gn-language-label\s*\{([^}]+)\}/)?.[1]?.replace(/\s+/g,'');
assert(rule,'One selector gives both labels the same typography');
assert.match(rule,/font:600clamp\(11px,2\.7vw,14px\)\/1var\(--sans,system-ui,sans-serif\)!important/,'Same sans typeface, size, weight and line height');
assert.match(rule,/display:block!important/);assert.match(rule,/letter-spacing:0!important/);
assert.match(rule,/text-transform:none!important/,'Case stays Ar and En');assert.match(rule,/opacity:1!important/,'Both label shapes remain equally opaque');
assert(!/#readingControls\s+#persistentLanguages\s+\[data-language-toggle=[^\]]+\]\s+\.gn-language-label\s*\{/.test(html),'No language-specific label typography override');
console.log('PASS: '+cases+' language/vowelling combinations retain exact Ar/En labels, descriptive accessible states and one shared typeface, size and weight.');
