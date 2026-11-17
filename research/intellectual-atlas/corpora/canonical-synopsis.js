/* GNAMMA classical philosophy/kalām: optional vertical principal-text synopsis.
 * Original 404 researched canonical works and 377 source-qualified relationships
 * remain authoritative. The regular original timeline is still the default.
 */
(()=>{
"use strict";
const esc=x=>String(x??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const fit=(x,n)=>String(x??"").length>n?String(x).slice(0,n-1)+"…":String(x??"");
const labels={ancient:"Ancient foundations",neoplatonic:"Neoplatonic",translation:"Greek–Arabic translation",
 falsafa:"Falsafa",avicennan:"Avicennan",ashari:"Ashʿarī kalām",maturidi:"Māturīdī kalām",
 mutazili:"Muʿtazilī",ishraqi:"Illuminationist",akbarian:"Akbarian",
 sadrian:"Ṣadrian",critical:"Later reception",sunni:"Sunni scholarship",imami:"Imāmī",
 christian:"Christian",jewish:"Jewish"};
let selected=new URLSearchParams(location.hash.slice(1)).get("cs")==="1";
function enabled(){return selected;}
function toggle(v){
 selected=!!v;const p=new URLSearchParams(location.hash.slice(1));
 if(selected)p.set("cs","1");else p.delete("cs");
 try{history.replaceState(null,"","#"+p.toString());}catch{}
}
function render({root,data,viewNodes,selectedId}){
 const main=root.querySelector("[data-main]");
 const relevant=viewNodes.filter(n=>n.title&&(n.node_type||"work")==="work");
 const degree=new Map(data.nodes.map(n=>[n.id,0]));
 data.edges.forEach(e=>{degree.set(e.source,(degree.get(e.source)||0)+1);degree.set(e.target,(degree.get(e.target)||0)+1);});
 const typeList=[...new Set(relevant.map(n=>n.tradition))].sort((a,b)=>(labels[a]||a).localeCompare(labels[b]||b));
 const chosen=new Map();
 typeList.forEach(type=>{
   const score=n=>(degree.get(n.id)||0)*11+(n.temporal?.anchor!=null?12:0);
   const books=relevant.filter(n=>n.tradition===type).sort((a,b)=>score(b)-score(a)).slice(0,11)
     .sort((a,b)=>(a.temporal?.anchor??9999)-(b.temporal?.anchor??9999));
   if(books.length)chosen.set(type,books);
 });
 const types=[...chosen.keys()],left=35,w=Math.max(380,left+types.length*242+25);
 const height=Math.max(380,95+Math.max(0,...[...chosen.values()].map(x=>x.length))*92+80);
 let heads="",lines="",nodes="",arrows=0;
 const positions=new Map();
 types.forEach((type,i)=>{
   const x=left+i*242,colW=210,mid=x+colW/2;
   heads+="<text class='dn-synopsis-head' x='"+x+"' y='28'>"+esc(fit(labels[type]||type,26))+"</text>"+
      "<text class='dn-synopsis-sub' x='"+x+"' y='45'>"+chosen.get(type).length+" selected texts</text>";
   lines+="<line class='dn-synopsis-lane' x1='"+mid+"' y1='60' x2='"+mid+"' y2='"+(height-25)+"'/>";
   chosen.get(type).forEach((book,j)=>{
     const y=92+j*92;
     nodes+="<g role='button' tabindex='0' data-work='"+esc(book.id)+"' aria-label='"+esc(book.title+" · "+book.date_label)+"'>"+
       "<rect class='dn-synopsis-node"+(book.id===selectedId?" dn-selected":"")+"' x='"+x+"' y='"+y+"' width='"+colW+"' height='70' rx='7'/>"+
       "<text class='ia-node-title' x='"+(x+9)+"' y='"+(y+22)+"'>"+esc(fit(book.title,27))+"</text>"+
       "<text class='ia-node-sub' x='"+(x+9)+"' y='"+(y+41)+"'>"+esc(fit(book.author,28))+"</text>"+
       "<text class='ia-node-date' x='"+(x+9)+"' y='"+(y+59)+"'>"+esc(fit(book.date_label,32))+"</text></g>";
     positions.set(book.id,{x:mid,y:y+35});
   });
 });
 data.edges.forEach(edge=>{
  const a=positions.get(edge.source),b=positions.get(edge.target);
  if(!a||!b)return;arrows++;
  const d="M"+a.x+","+(a.y+22)+" C"+(a.x+28)+","+(a.y+67)+" "+(b.x-28)+","+(b.y-70)+" "+b.x+","+(b.y-22);
  lines+="<g role='button' tabindex='0' data-edge='"+esc(edge.id)+"' aria-label='"+esc(edge.label||edge.relation)+"'>"+
    "<title>"+esc(edge.label||edge.relation)+" · open original source evidence</title>"+
    "<path class='dn-verified-relation' marker-end='url(#cs-arrow)' d='"+d+"'/></g>";
 });
 const defs="<defs><marker id='cs-arrow' viewBox='0 0 10 10' refX='9' refY='5' markerWidth='6' markerHeight='6' orient='auto'><path d='M1 1 L9 5 L1 9 Z' fill='#ad7d27'/></marker></defs>";
 main.innerHTML="<div class='ia-main-head'><div><h2>Philosophy &amp; kalām · Principal texts</h2>"+
  "<span class='ia-small'>"+positions.size+" highlighted original works · "+arrows+" source-qualified relationships · "+types.length+" scholarly traditions</span></div>"+
  "<div class='ia-actions'><button type='button' data-action='canonical-timeline'>← Original chronological atlas</button>"+
  "<button type='button' data-action='open-explore'>Other subjects</button></div></div>"+
  "<div class='dn-modes' role='group'><button type='button' data-action='canonical-timeline' aria-pressed='false'>Full historical atlas</button>"+
  "<button type='button' aria-pressed='true' disabled>Principal texts · vertical synopsis</button></div>"+
  "<p class='dn-caveat'>This is an abbreviated vertical reading of the same sourced work graph, not a replacement. Position shows the established date qualifications; a connecting arrow represents a separately cited relationship.</p>"+
  "<section class='dn-research'><div class='dn-map dn-summary-map' role='region' tabindex='0' aria-label='Scrollable vertical summary of primary works and evidenced relations'>"+
  "<svg xmlns='http://www.w3.org/2000/svg' role='group' data-canonical-synopsis width='"+w+"' height='"+height+"' viewBox='0 0 "+w+" "+height+"'>"+
    defs+heads+lines+nodes+"</svg></div>"+
  "<p class='dn-brief'>The full chronological map retains all original works, politics, dated markers and uncertainty; this selection is intentionally concise. Open any text or arrow for its original bibliographical evidence.</p></section>";
 return {works:positions.size,links:arrows};
}
window.GNCanonicalSynopsis={enabled,toggle,render};
})();
