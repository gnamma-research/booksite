#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'subject-index-data.json'),'utf8'));
if(process.argv.includes('--fallback')){
 const book=require('./load-book')(fs.readFileSync(path.join(root,'index.html'),'utf8'));
 const indices=new Map(book.index.map((entry,i)=>[entry.term,i]));
 const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const groups=data.groups.concat(data.facets.filter(f=>f.id==='edition'));
 const markup='<div class="fb-subject-browser"><h2>Browse by subject</h2><p>Editorial groupings connect related discussions. An entry can appear in several subjects. The complete alphabetical index follows.</p>'+groups.map(g=>'<details class="fb-subject-group"><summary>'+esc(g.title)+'</summary><p>'+esc(g.description)+'</p><ul>'+g.terms.slice().sort((a,b)=>a.localeCompare(b,'en',{sensitivity:'base'})).map(term=>'<li><a href="#fb-index-'+indices.get(term)+'">'+esc(term)+'</a></li>').join('')+'</ul></details>').join('')+'</div>';
 process.stdout.write(markup);process.exit(0);
}
const output='/* Generated from subject-index-data.json by qa/export-subject-index-data.js. */\nwindow.DARURI_SUBJECT_INDEX = '+JSON.stringify(data)+';\n';
const destination=path.join(root,'subject-index-data.js');
if(process.argv.includes('--check')){
 if(!fs.existsSync(destination)||fs.readFileSync(destination,'utf8')!==output)throw new Error('Subject-index browser data is out of date.');
 console.log('Subject-index JSON and browser export agree.');
}else{fs.writeFileSync(destination,output);console.log('Wrote subject-index-data.js');}
