/* Personal PDF searchable text and verified word-level source annotations.
 * Pure JavaScript in the browser. All assets hosted by the static Gnamma site.
 * Section fallback is mandatory if word geometry cannot be verified. */
(() => {
  'use strict';
  const tidy=s=>String(s||'').normalize('NFKD').replace(/\p{M}/gu,'').replace(/[^\p{L}\p{N}]/gu,'').toLocaleLowerCase('en');
  const {PDFName,PDFHexString}=()=>window.PDFLib; // resolved after PDF library loads
  function sourceMatch(words,target){
    if(!Array.isArray(words)||!words.length||!target||!target.quote)return null;
    const needle=tidy(target.quote);
    if(needle.length<8||needle.length>12000)return null;
    const items=[],ranges=[];let text='';
    for(let i=0;i<words.length;i++){
      const w=words[i],word=tidy(w[0]);if(!word)continue;
      if(!Number.isFinite(w[1])||![2,3,4,5].every(k=>Number.isFinite(w[k])))continue;
      const start=text.length;text+=word;
      ranges.push({start,end:text.length,w,word,index:i});
    }
    if(!text)return null;
    let at=-1;const matches=[];while((at=text.indexOf(needle,at+1))>=0){
      const end=at+needle.length;
      const span=ranges.filter(r=>r.end>at&&r.start<end);
      if(!span.length)continue;
      const before=text.slice(Math.max(0,at-100),at);
      const after=text.slice(end,end+100);
      const p=tidy(target.prefix||'').slice(-80),s=tidy(target.suffix||'').slice(0,80);
      let score=0;
      if(p&&before.endsWith(p))score+=4;
      if(s&&after.startsWith(s))score+=4;
      // Positions close to the saved source offset get a small tie-break.
      score+=Math.max(0,1-Math.abs((Number(target.offset)||0)-at)/Math.max(100,text.length));
      const uniquePages=[...new Set(span.map(r=>r.w[1]))];
      if(uniquePages.length!==1)continue; // span across pages needs separate handling.
      const page=uniquePages[0];
      const rects=[];
      for(const r of span){
        const w=r.w,b={x0:w[2],y0:w[3],x1:w[4],y1:w[5]};
        if(b.x1<=b.x0||b.y1<=b.y0)continue;
        // Merge only adjacent words within the same baseline.
        const previous=rects.at(-1);
        if(previous&&Math.abs(previous.y0-b.y0)<3.5&&Math.abs(previous.y1-b.y1)<3.5&&b.x0<=previous.x1+14&&b.x0>=previous.x0-4){
          previous.x0=Math.min(previous.x0,b.x0);previous.x1=Math.max(previous.x1,b.x1);
          previous.y0=Math.min(previous.y0,b.y0);previous.y1=Math.max(previous.y1,b.y1);
        }else rects.push(b);
      }
      if(!rects.length||rects.length>15)continue;
      matches.push({page,rects,score,at});
      if(matches.length>20)break;
    }
    if(!matches.length)return null;
    matches.sort((a,b)=>b.score-a.score);
    // A repeated quotation must not acquire an arbitrary wrong highlight.
    if(matches.length>1&&matches[0].score-matches[1].score<2.5)return null;
    const chosen=matches[0];
    if(chosen.rects.some(r=>r.x0<0||r.y0<0||r.x1>6000||r.y1>6000))return null;
    return {page:chosen.page,rects:chosen.rects,score:chosen.score};
  }
  function addHighlight(pdf,page,matching,body,label){
    if(!matching?.rects?.length)return false;
    const {PDFName,PDFHexString}=window.PDFLib;
    const size=page.getSize(),quad=[],bounds=[Infinity,Infinity,-Infinity,-Infinity];
    for(const r of matching.rects){
      if(r.x1>size.width+1||r.y1>size.height+1||r.x0<0||r.y0<0)return false;
      const upper=size.height-r.y0,lower=size.height-r.y1;
      quad.push(r.x0,upper,r.x1,upper,r.x0,lower,r.x1,lower);
      bounds[0]=Math.min(bounds[0],r.x0);
      bounds[1]=Math.min(bounds[1],lower);
      bounds[2]=Math.max(bounds[2],r.x1);
      bounds[3]=Math.max(bounds[3],upper);
    }
    const a=pdf.context.obj({
      Type:PDFName.of('Annot'),Subtype:PDFName.of('Highlight'),
      Rect:bounds,QuadPoints:quad,
      C:[1,.83,.32],CA:0.28,F:4,
      Contents:PDFHexString.fromText(body.slice(0,30000)),
      T:PDFHexString.fromText(label.slice(0,240))
    });
    const ref=pdf.context.register(a),k=PDFName.of('Annots');
    let existing=page.node.lookup(k,window.PDFLib.PDFArray);
    if(!existing){existing=pdf.context.obj([]);page.node.set(k,existing);}
    existing.push(ref);
    return true;
  }
  const scriptPromise=new Map();
  function ensureScript(url,globalName){
    if(window[globalName])return Promise.resolve(window[globalName]);
    if(scriptPromise.has(url))return scriptPromise.get(url);
    const job=new Promise((resolve,reject)=>{
      const s=document.createElement('script');s.src=url;s.async=true;
      const t=setTimeout(()=>{s.remove();reject(Error('Unicode text engine timed out'));},16000);
      s.onload=()=>{clearTimeout(t);window[globalName]?resolve(window[globalName]):reject(Error('Unicode engine did not initialize'));};
      s.onerror=()=>{clearTimeout(t);s.remove();reject(Error('Cannot load the locally hosted Unicode text engine'));};
      document.head.append(s);
    });
    scriptPromise.set(url,job);return job;
  }
  async function searchableFonts(pdf,root){
    const kit=await ensureScript(new URL('vendor/fontkit-1.1.1.umd.min.js',root).href,'fontkit');
    pdf.registerFontkit(kit);
    const names=['NotoSerif-Regular.ttf','NotoNaskhArabic-Regular.ttf'];
    const bytes=await Promise.all(names.map(async name=>{
      const res=await fetch(new URL('vendor/'+name,root));
      if(!res.ok)throw Error('Locally hosted Unicode font unavailable: '+name);
      return res.arrayBuffer();
    }));
    const [latin,arabic]=await Promise.all(bytes.map(b=>pdf.embedFont(b,{subset:true})));
    return {latin,arabic,latinSet:new Set(latin.getCharacterSet()),arabicSet:new Set(arabic.getCharacterSet()),missing:new Set()};
  }
  function fontRuns(text,fonts,size){
    const runs=[];let last=null;
    for(const point of Array.from(String(text||''))){
      const cp=point.codePointAt(0);
      if(cp<32&&cp!==9)continue;
      let font=fonts.latin;
      if(/[\u0600-\u08FF]/u.test(point)&&fonts.arabicSet.has(cp))font=fonts.arabic;
      else if(!fonts.latinSet.has(cp)){
        if(fonts.arabicSet.has(cp))font=fonts.arabic;
        else{fonts.missing.add(point);font=fonts.latin;}
      }
      const ch=(font===fonts.latin&&!fonts.latinSet.has(cp))?'?':point;
      if(last?.font===font)last.text+=ch;
      else {last={font,text:ch};runs.push(last);}
    }
    return runs.map(x=>({...x,width:x.font.widthOfTextAtSize(x.text,size)}));
  }
  function textOverlay(pdf,page,searchLines,sheet,fonts){
    let n=0;const W=sheet.W,H=sheet.H,pad=sheet.padding;
    for(const line of searchLines){
      const s=String(line.text||'');if(!s.trim())continue;
      const size=Math.max(8,Math.min(18,(line.size||26)/2));
      const runs=fontRuns(s,fonts,size);
      if(!runs.length)continue;
      const width=runs.reduce((a,r)=>a+r.width,0);
      let x=(line.rtl?(W-pad)/2-width:(pad+(line.indent||0))/2);
      const y=(H-line.y)/2;
      for(const run of runs){
        if(run.text){page.drawText(run.text,{x,y,size,font:run.font,opacity:0});n++;}
        x+=run.width;
      }
    }
    return n;
  }
  window.GnammaPdfUpgrade={sourceMatch,addHighlight,searchableFonts,textOverlay,tidy};
})();