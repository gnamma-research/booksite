(function(root){'use strict';
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function normalize(s){return String(s??'').normalize('NFD').replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').toLowerCase();}
function words(s){return normalize(s).match(/[a-z0-9\u0621-\u064a\u0660-\u0669]+/g)||[];}
function compileQuery(input){
 const tokens=String(input).match(/"[^"]*"|\(|\)|[^\s()]+/g)||[];let pos=0;
 function term(){const t=tokens[pos++];if(!t)throw Error('Add a term after the operator.');if(t==='NOT')return{type:'not',a:term()};if(t==='('){const e=or();if(tokens[pos++]!==')')throw Error('Close the parenthesis.');return e;}if(['AND','OR',')'].includes(t)||/^NEAR\//.test(t))throw Error('Check the search operators.');if(t[0]==='"'&&t.at(-1)!=='"')throw Error('Close the quotation mark.');const w=words(t);if(!w.length)throw Error('Enter a word or phrase.');return{type:'term',words:w};}
 function near(){let a=term();while(/^NEAR\/\d+$/i.test(tokens[pos]||'')){let n=Number(tokens[pos++].split('/')[1]);if(n>100)throw Error('Use a proximity distance of 100 words or fewer.');a={type:'near',a,b:term(),n};}return a;}
 function and(){let a=near();while(pos<tokens.length&&tokens[pos]!==')'&&tokens[pos]!=='OR'){if(tokens[pos]==='AND')pos++;a={type:'and',a,b:near()};}return a;}
 function or(){let a=and();while(tokens[pos]==='OR'){pos++;a={type:'or',a,b:and()};}return a;}
 if(!tokens.length)throw Error('Enter a word, phrase, or verse reference.');if((String(input).match(/"/g)||[]).length%2)throw Error('Close the quotation mark.');const ast=or();if(pos!==tokens.length)throw Error('Check the parentheses.');
 function evaluate(node,w){if(node.type==='term'){const spans=[];for(let i=0;i<=w.length-node.words.length;i++)if(node.words.every((x,j)=>w[i+j]===x))spans.push([i,i+node.words.length-1]);return{ok:!!spans.length,spans};}const a=evaluate(node.a,w);if(node.type==='not')return{ok:!a.ok,spans:[]};const b=evaluate(node.b,w);if(node.type==='near'){const spans=[];for(const x of a.spans)for(const y of b.spans){const gap=Math.max(0,Math.max(x[0],y[0])-Math.min(x[1],y[1])-1);if(gap<=node.n)spans.push([Math.min(x[0],y[0]),Math.max(x[1],y[1])]);}return{ok:!!spans.length,spans};}return{ok:node.type==='and'?a.ok&&b.ok:a.ok||b.ok,spans:[...a.spans,...b.spans]};}
 return{text:String(input),test:s=>evaluate(ast,words(s)).ok,match:s=>evaluate(ast,words(s))};
}
function citation(r,anchor,quote){const base='Ibn ʿAjība, The Immense Ocean (al-Baḥr al-Madīd), vol. I, '+(r.q==='preface'?'author’s preface':'Q '+r.q)+', Cairo '+r.cairo+'.';return base+(anchor?' Web anchor: '+anchor+'.':'')+(quote?'\n“'+quote+'”':'');}
function validateDesk(data){
 if(!data||data.format!=='gnamma-reading-desk'||data.work!=='ibn-ajiba-bahr-vol1'||data.version!==1||!Array.isArray(data.items))throw Error('This is not a Baḥr al-Madīd Reading Desk backup.');
 if(data.items.length>5000)throw Error('This backup exceeds 5,000 entries.');
 return data.items.map(x=>{if(!x||typeof x.id!=='string'||x.id.length>180||!['bookmark','note','highlight'].includes(x.type)||typeof x.r!=='string'||!Number.isFinite(Date.parse(x.createdAt)))throw Error('The backup contains an invalid entry.');return{id:x.id,type:x.type,r:x.r.slice(0,100),anchor:String(x.anchor||'').slice(0,200),lang:['ar','en'].includes(x.lang)?x.lang:'en',quote:String(x.quote||'').slice(0,20000),note:String(x.note||'').slice(0,20000),createdAt:x.createdAt,updatedAt:Number.isFinite(Date.parse(x.updatedAt))?x.updatedAt:x.createdAt,archived:!!x.archived};});
}
function mergeDesk(existing,incoming){const out=existing.map(x=>({...x}));let added=0,conflicts=0;for(const x of incoming){const found=out.find(y=>y.id===x.id);if(!found){out.push({...x});added++;}else if(JSON.stringify(found)!==JSON.stringify(x)){const same=['type','r','anchor','lang','quote','note','createdAt','archived'].every(k=>(found[k]||'')===(x[k]||''));if(same)continue;const id=x.id+'-import-'+normalize(x.updatedAt).replace(/[^a-z0-9]/g,'');if(!out.some(y=>y.id===id)){out.push({...x,id});added++;conflicts++;}}}return{items:out,added,conflicts};}
root.BahrCore={escape,normalize,words,compileQuery,citation,validateDesk,mergeDesk};
})(typeof window==='undefined'?globalThis:window);
