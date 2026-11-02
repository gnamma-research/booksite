(()=>{"use strict";
const all=[];for(const v of [["I",280,13],["II",335,295]]){for(let p=1;p<=v[1];p++)all.push({volume:v[0],page:p,pdf:p+v[2],first:(v[0]==="I"&&p>=8&&p<=280)||(v[0]==="II"&&((p>=2&&p<=314)||(p>=321&&p<=335))),wasim:v[0]==="II"&&p===117});}
const $=id=>document.getElementById(id),vol=$("volume"),filter=$("coverage"),printed=$("printed"),items=$("pages");
let index=0;const per=36;
function collection(){const p=+printed.value;return all.filter(x=>(vol.value==="all"||x.volume===vol.value)&&(!p||x.page===p)&&(filter.value==="all"||(filter.value==="first"&&x.first)||(filter.value==="wasim"&&x.wasim)||(filter.value==="pending"&&!x.first&&!x.wasim)));}
function draw(){const matching=collection();const max=Math.max(0,Math.ceil(matching.length/per)-1);index=Math.min(max,Math.max(0,index));const selected=matching.slice(index*per,(index+1)*per);items.replaceChildren();
 for(const r of selected){const li=document.createElement("li"),title=document.createElement("strong");title.textContent="Vol. "+r.volume+" · printed p."+r.page;li.append(title);
 const status=document.createElement("small");status.textContent="Scan PDF p."+r.pdf+" · "+(r.wasim?"One attributed Wasīm excerpt, incomplete":r.volume==="II"&&r.page>=315&&r.page<=320?"COLOPHON / ENDORSEMENT / PRINTED INDEX — not running sharḥ":r.volume==="II"&&r.page>=321?"Post-index imamate continuation — provenance not critically settled":r.volume==="II"&&r.page===1?"VOLUME PART-TITLE/paratext, no running sharḥ":r.volume==="I"&&r.page===222?"ONLY marginal continuation · upper text absent":r.first?"Provisional English, NOT full text":"Translation not yet entered");li.append(status);
 if(r.first||r.wasim){const a=document.createElement("a");a.textContent="Read existing selection";a.href=r.wasim?"./#u-W-II-117-01":(r.volume==="I"&&r.page>=81?"./#u-P1-"+String(r.page).padStart(3,"0"):"./");li.append(a)}
 items.append(li)}
 $("summary").textContent=matching.length+" source pages match. Indexed: 615/615. English context/selected phrases on 601 numbered page positions (including marginal-only I:222; excluding II:1 title and II:315–320 separately printed colophon, endorsements and index). No word-complete translation claims; one previously attributed Wasīm fragment. Complete jointly verified pages: 0/615.";
 $("position").textContent=matching.length?"Batch "+(index+1)+" of "+Math.ceil(matching.length/per):"No matches";$("prev").disabled=index===0;$("next").disabled=index>=max;}
[vol,filter,printed].forEach(x=>x.addEventListener("input",()=>{index=0;draw()}));
$("atlas-form").addEventListener("reset",()=>{index=0;setTimeout(draw,0)});
$("prev").addEventListener("click",()=>{index--;draw()});
$("next").addEventListener("click",()=>{index++;draw()});
draw();
})();