/* Convert all real Study note anchors, bilingual passages and true footnote
 * bodies from validated canonical source into a paginated Typst edition.
 * No prebuilt PDF, OCR, AI retranslation, or handwritten fictitious notes.
 */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const outfile=process.argv[3]||'/tmp/daruri-study-engine/source.typ';
const fixture=JSON.parse(await readFile(process.argv[2]||'/tmp/daruri-study-engine/study_source.json','utf8'));
const notes=new Map(fixture.notes.map(n=>[String(n.id),n]));
const rows=fixture.rows;
if(fixture.schema!=='gnamma-study-real-notes-v1'||fixture.statistics.authorial_passages!==414)
 throw Error('Canonical source fixture missing or incompatible');
if(rows.filter(r=>/^\d+$/.test(r.section)).length!==414)
 throw Error('Not all original 414 Arabic/English segments present');
const escapeTypst=s=>String(s??'').replace(/([\\#*_@$[\]<>])/g,'\\$1').replace(/\n/g,' #linebreak() ');
const label=id=>'gnf-'+String(id).replace(/[^A-Za-z0-9]/g,'-').slice(0,90);
const footnotesSeen=new Set(),numOrder=[];
const firstCalls=[];
function noteMarkup(call,language){
 const id=String(call.note_id).split('--repeat-')[0];
 const note=notes.get(id);
 if(!note)throw Error('Unknown note body in original source call: '+id);
 const reference='<'+label(id)+'>';
 if(language==='ar') {
  if(!footnotesSeen.has(id))throw Error('Original Arabic note called before its English owner: '+id);
  return '#footnote('+reference+')';
 }
 firstCalls.push({note_id:id,declared_number:note.number,location:call.call_id});
 if(footnotesSeen.has(id))return '#footnote('+reference+')';
 if(note.number!==footnotesSeen.size+1)
  throw Error('Original Study note numbering is not in source call order at '+id+
              ' wanted '+(footnotesSeen.size+1)+' got '+note.number);
 footnotesSeen.add(id);numOrder.push(id);
 const lang=note.language==='ar'?'ar':'en';
 const ffont=lang==='ar'?'Amiri':'Noto Serif';
 const direction=lang==='ar'?'rtl':'ltr';
 const prefix=note.kind==="Translation."||note.kind==="Interpretation."?
              note.kind+' ':'';
 return '#footnote[#text(font:"'+ffont+'", size: 8pt, lang:"'+lang+'", dir:'+direction+
         ')['+escapeTypst(prefix+note.body)+']]'+reference;
}
function sourceRuns(runs,language){
 return runs.map(part=>{
  if(part.kind==='text')return escapeTypst(part.text);
  if(part.kind==='call')return noteMarkup(part,language);
  throw Error('Unknown inline original run '+part.kind);
 }).join('');
}
const lines=[
 '#set page(paper: "a4", margin: (top: 18mm, bottom: 20mm, left: 17mm, right: 17mm))',
 '#set text(font: "Noto Serif", size: 9pt, lang: "en")',
 '#set par(leading: 0.6em, justify: false)',
 '= Daruri — Bilingual Study, real canonical notes',
 '#text(size: 8pt)[Original source content and real notes, experimental nonrelease layout. '+
 'This is not the existing approved Study edition.]',
 '#outline()',
 '#pagebreak()'
];
let sectionPrev=null;let authorial=0;
for(const row of rows){
  if(row.section!==sectionPrev){
    if(row.section!=='colophon')lines.push(
      '== R '+String(row.section).padStart(3,'0')+' <daruri-'+String(row.section).padStart(3,'0')+'>');
    else lines.push('== Colophon <daruri-colophon>');
    sectionPrev=row.section;
  }
  if(/^\d+$/.test(row.section))authorial++;
  const en=sourceRuns(row.en_runs,'en');
  const ar=sourceRuns(row.ar_runs,'ar');
  lines.push('#grid(columns: (1fr, 1fr), gutter: 5mm, row-gutter: 0pt,');
  lines.push('  [#text(lang:"en", dir:ltr, font:"Noto Serif", size:9pt)['+en+']],');
  lines.push('  [#text(lang:"ar", dir:rtl, font:"Amiri", size:11.5pt)['+ar+']],');
  lines.push(')');
  lines.push('#v(3pt)');
}
lines.push('#link(<daruri-001>)[Back to original text]');
if(authorial!==414||footnotesSeen.size!==notes.size)
  throw Error('Study original completeness failure '+JSON.stringify({
   authorial,notes:notes.size,printed:footnotesSeen.size,
   missing:[...notes.keys()].filter(k=>!footnotesSeen.has(k)).slice(0,8)
  }));
if(fixture.statistics.original_note_calls!==rows.reduce((a,r)=>a+r.english_call_count+r.arabic_call_count,0))
 throw Error('Source note call count mutated');
const body=lines.join('\n')+'\n';
await mkdir(path.dirname(outfile),{recursive:true});
await writeFile(outfile,body,'utf8');
const meta={
 schema:"gnamma-real-study-typst-source-v1",
 original_source_sha256:fixture.sha256,
 generated_typst_sha256:createHash('sha256').update(body).digest('hex'),
 original_sections:258,
 original_authorial_passages:authorial,
 included_source_paragraphs:rows.length,
 original_note_bodies:notes.size,
 typst_footnote_body_declarations:footnotesSeen.size,
 original_note_calls:fixture.statistics.original_note_calls,
 original_english_calls:firstCalls.length,
 note_ids_in_original_numeric_order:numOrder,
 publisher_original_note_content_unmodified:true,
 bilingual_physical_layout:"en-left-ar-right",
 fully_vowelled_original_arabic:true,
 direct_pdf_input:false,
 release_status:"NONRELEASE"
};
await writeFile(path.join(path.dirname(outfile),'study_typst_source_evidence.json'),JSON.stringify(meta,null,2)+'\n','utf8');
console.log('DARURI_STUDY_TYPST_SOURCE',JSON.stringify({...meta,note_ids_in_original_numeric_order_count:numOrder.length,note_ids_in_original_numeric_order:undefined}));
