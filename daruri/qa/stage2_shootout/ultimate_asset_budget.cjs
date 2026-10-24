#!/usr/bin/env node
/* Static-host first-visit file budget: analytical compression, NOT measured
 * GitHub Pages traffic or a server-side PDF render. Real browser network
 * requests are separately saved by ultimate_browser.cjs.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const here=__dirname,root=path.resolve(here,'../../..');
const fn=[
 {type:'original-complete-scholarly-html',path:path.join(here,'runtime_ultimate/scholarly.html')},
 {type:'browser-pagedjs',path:path.join(here,'node_modules/pagedjs/dist/paged.polyfill.js')}
];
const compact=process.env.GNAMMA_THREE_FONT_PROFILE==='1';
const fonts=compact?['NotoSans-Regular.ttf','NotoSerif-Regular.ttf','NotoNaskhArabic-Regular.ttf']:
 fs.readdirSync(path.join(root,'daruri/build/fonts')).filter(file=>file.endsWith('.ttf'));
for(const file of fonts)
 fn.push({type:'original-font',path:path.join(root,'daruri/build/fonts',file)});
const files=fn.map(item=>{
 const b=fs.readFileSync(item.path);
 return {type:item.type,file:path.basename(item.path),raw_bytes:b.length,
   gzip_bytes:zlib.gzipSync(b,{level:6}).length,
   brotli_bytes:zlib.brotliCompressSync(b,{
     params:{[zlib.constants.BROTLI_PARAM_QUALITY]:5}}).length};
});
const aggregate=(items,attr)=>items.reduce((a,b)=>a+b[attr],0);
const report={schema:'gnamma-client-pdf-github-pages-static-asset-budget-v1',
 engine:'Paged.js browser local HTML-to-PDF',
 raw_all_assets:aggregate(files,'raw_bytes'),
 gzip_all_assets:aggregate(files,'gzip_bytes'),
 brotli_all_assets:aggregate(files,'brotli_bytes'),
 original_html:files.find(x=>x.type==='original-complete-scholarly-html'),
 engine_js:files.find(x=>x.type==='browser-pagedjs'),
 font_count:files.filter(x=>x.type==='original-font').length,
 gzip_all_fonts:aggregate(files.filter(x=>x.type==='original-font'),'gzip_bytes'),
 files,
 footnote:'Analytical compression comparison. Actual GitHub CDN caching/content-encoding and visitor reuse vary.',
 github_pages_server_does_not_render_pdf:true};
const out=process.env.BENCH_OUT||'/tmp/gnamma-ultimate-static-budget';
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'asset-budget.json'),JSON.stringify(report,null,2)+'\n');
console.log('GNAMMA_STATIC_ASSET_BUDGET',JSON.stringify({
 raw_all_assets:report.raw_all_assets,gzip_all_assets:report.gzip_all_assets,
 brotli_all_assets:report.brotli_all_assets,
 source:report.original_html,engine:report.engine_js,
 font_count:report.font_count,gzip_all_fonts:report.gzip_all_fonts
}));
