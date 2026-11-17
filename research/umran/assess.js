"use strict";
(function () {
 const form=document.getElementById("sufficiency-studio");
 const output=document.getElementById("studio-output");
 if(!form||!output)return;
 const memo=document.getElementById("studio-memo"),status=document.getElementById("studio-status"),feedback=document.getElementById("studio-feedback");
 let lastText="",lastRecord=null;
 const labels={
  function:"Function",scale:"Geographic or institutional scale",location:"Location/association",population:"Population concerned",period:"Observation period",
  legalStatus:"Preliminary legal classification",normativeSource:"Normative source",requiredGood:"Required good or avoided harm",
  standard:"Standard of adequate provision",standardSource:"Authority for standard",
  demand:"Measured need or condition",demandSource:"Demand source/date",demandUnit:"Demand unit",
  supply:"Existing provision",supplySource:"Provision source/date",supplyUnit:"Supply unit",
  comparison:"Comparability and interpretation",alternatives:"Alternative means",roles:"Qualified and enabling roles",uncertainties:"Further checks and contrary evidence"
 };
 const inputKeys=Object.keys(labels);
 function collect(){
  const data=new FormData(form),out={};
  for(const key of inputKeys){out[key]=String(data.get(key)||"").trim();}
  return out;
 }
 function gate(name,yes,description){return {name,completed:Boolean(yes),description};}
 function evaluate(d){
  const checks=[
    gate("Defined community and function",d.function&&d.location&&d.population&&d.period,"A bounded function, affected population, place and time"),
    gate("Normative argument recorded",d.requiredGood&&d.normativeSource&&d.legalStatus,"A proposed ruling with its authority—not a fatwa"),
    gate("Adequacy standard recorded",d.standard&&d.standardSource,"A measurable standard and the grounds for it"),
    gate("Demand source recorded",d.demand&&d.demandSource&&d.demandUnit,"An observed condition with a dated source and population unit"),
    gate("Provision source recorded",d.supply&&d.supplySource&&d.supplyUnit,"Existing public/private/charitable provision with compatible coverage"),
    gate("Interpretation and alternatives recorded",d.comparison&&d.alternatives&&d.roles&&d.uncertainties,"A qualified interpretation, alternatives and review questions")
  ];
  const covered=checks.filter(c=>c.completed).length;
  const readiness=covered===6?"All descriptive sections supplied; external verification required":covered>=3?"Partially documented; further evidence and review required":"Exploratory outline; fundamental evidence still missing";
  return {checks,readiness,completed:covered,total:checks.length};
 }
 function format(d,review){
  const lines=[
   "ʿUMRĀN — COMMUNAL SUFFICIENCY RESEARCH MEMO",
   "Draft generated: "+new Date().toISOString(),
   "Purpose: research record only; not an assessment verdict, a fatwa or a personal duty.",
   "EVIDENCE READINESS: "+review.readiness,
   "",
   "CHECKLIST (user supplied; not externally validated)"
  ];
  review.checks.forEach(g=>lines.push((g.completed?"[described] ":"[missing] ")+g.name+" — "+g.description));
  lines.push("");
  let section="";
  for(const [key,label] of Object.entries(labels)){
   const next=key==="function"?"SCOPE":key==="legalStatus"?"JURISTIC QUESTION":key==="standard"?"ADEQUACY STANDARD":key==="demand"?"EMPIRICAL CONDITION":key==="comparison"?"ANALYSIS AND ACTION":null;
   if(next&&next!==section){section=next;lines.push("\n"+section);}
   lines.push(label+": "+(d[key]||"[not supplied]"));
  }
  lines.push("","LIMITS","An official target is not automatically a legal minimum. A project narrative is not proof of inadequate provision. Different denominators, years or populations cannot establish coverage without a method. Personal duties require qualified legal and contextual judgment.");
  return lines.join("\n");
 }
 form.addEventListener("submit",function(event){
  event.preventDefault();
  const d=collect(),review=evaluate(d);
  lastRecord={meta:{product:"ʿUmrān research studio",version:"1.0",generated_at:new Date().toISOString(),conclusion_status:"No verified sufficiency verdict or personal religious obligation"},fields:d,evidence_readiness:review};
  lastText=format(d,review);memo.textContent=lastText;
  status.textContent=review.readiness+" ("+review.completed+" of "+review.total+" descriptive checks recorded).";
  output.hidden=false;feedback.textContent="";
  output.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
 });
 form.addEventListener("reset",function(){output.hidden=true;lastRecord=null;lastText="";feedback.textContent=""});
 document.getElementById("studio-copy").addEventListener("click",async function(){
  if(!lastText)return;
  try{
   if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(lastText);}
   else{const t=document.createElement("textarea");t.value=lastText;t.setAttribute("readonly","");t.style.position="fixed";t.style.opacity="0";document.body.appendChild(t);t.select();const ok=document.execCommand("copy");t.remove();if(!ok)throw Error("Copy not supported");}
   feedback.textContent="Memo copied to the clipboard.";
  }catch(e){feedback.textContent="Automatic copy was unavailable. Select the memo text to copy it manually.";}
 });
 document.getElementById("studio-export").addEventListener("click",function(){
  if(!lastRecord)return;
  const blob=new Blob([JSON.stringify(lastRecord,null,2)],{type:"application/json;charset=utf-8"});
  const url=URL.createObjectURL(blob),link=document.createElement("a");
  link.href=url;link.download="umran-sufficiency-research-draft.json";document.body.appendChild(link);link.click();link.remove();
  URL.revokeObjectURL(url);feedback.textContent="Export requested in your browser; check your downloads.";
 });
 document.getElementById("studio-print").addEventListener("click",function(){
  if(!lastText)return;window.print();
 });
})();
