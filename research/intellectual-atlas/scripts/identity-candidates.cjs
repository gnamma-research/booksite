(function GNIdentityCandidateScript() {
"use strict";
const fs=require("node:fs"),path=require("node:path");
const fromDir=path.resolve(__dirname,"..","corpora");
const oiPath=process.argv[2]||path.join(fromDir,"expanded-bibliography.json");
const msPath=process.argv[3]||path.join(fromDir,"manuscript-full.json");
const output=process.argv[4]||path.join(fromDir,"identity-review-candidates.json");
function normArabic(v){
 return String(v||"").normalize("NFKC").replace(/[\u064b-\u065f\u0670\u0640]/g,"")
 .replace(/[أإآٱ]/g,"ا").replace(/ى/g,"ي").replace(/ؤ/g,"و").replace(/ئ/g,"ي")
 .replace(/[^\p{L}\p{N}]+/gu," ").trim().replace(/\s+/g," ");
}
function tail3(v){return normArabic(v).split(" ").filter(Boolean).slice(-3).join(" ");}
function titleKey(v){return normArabic(v).replace(/^(كتاب|رسالة|شرح|حاشية)\s+/,"");}
function loadJSON(file){const v=JSON.parse(fs.readFileSync(file,"utf8"));if(!Array.isArray(v.works))throw Error("Expected works[] in "+file);return v.works;}
function key(s,t){return s+"\u0000"+t;}
const openiti=loadJSON(oiPath),alreq=loadJSON(msPath);
const oiByExact=new Map(),oiByTail=new Map();
for(const w of openiti){
 const t=titleKey(w.title_ar),a=normArabic(w.author_ar);
 if(!t||!a)continue;
 const k=key(t,a);if(!oiByExact.has(k))oiByExact.set(k,[]);
 oiByExact.get(k).push(w);
 const tkey=key(t,tail3(a));if(!oiByTail.has(tkey))oiByTail.set(tkey,[]);
 oiByTail.get(tkey).push(w);
}
const matches=[],seen=new Set();
for(const m of alreq){
 const title=titleKey(m.title_ar),author=normArabic(m.author_ar);
 if(!title||!author)continue;
 const exact=oiByExact.get(key(title,author))||[];
 const looser=exact.length?[]:(oiByTail.get(key(title,tail3(author)))||[]);
 for(const [rows,tier] of [[exact,"normalized_title_and_author"],[looser,"normalized_title_and_author_suffix"]]){
  for(const w of rows){
   const a=String(w.book_uri||""),b=String(m.id||"");
   if(!a||!b||seen.has(a+"\u0000"+b))continue;seen.add(a+"\u0000"+b);
   matches.push({
    candidate_id:"identity-candidate-"+(matches.length+1),
    left:{source:"OpenITI",record_id:a,title:w.title_ar||"",author:w.author_ar||"",source_url:w.source_url||""},
    right:{source:"Alreq",record_id:b,title:m.title_ar||"",author:m.author_ar||"",source_url:m.catalogue_url||""},
    match_basis:tier,status:"unreviewed_candidate",
    needs:["Check original title and author","Establish whether both identifiers refer to the same conceptual work","Distinguish recension, edition and catalogue witness","Record bibliographical or primary evidence before asserting identity"],
    canonical_work_id:null,evidence:[],reviewed_by:null
   });
  }
 }
}
matches.sort((a,b)=>a.left.record_id.localeCompare(b.left.record_id)||a.right.record_id.localeCompare(b.right.record_id));
const data={schema:"gnamma.identity-candidates/1",generated:new Date().toISOString(),
 input_counts:{openiti_records:openiti.length,alreq_records:alreq.length},
 candidate_count:matches.length,
 verified_identity_count:0,
 warning:"Automated title and author matches are discovery leads, not verified identical historical works. Do not convert any candidate into a graph identity without independent evidence and editorial review.",
 candidates:matches};
fs.writeFileSync(output,JSON.stringify(data,null,2)+"\n","utf8");
process.stdout.write(JSON.stringify({candidate_count:matches.length,output})+"\n");
})();
