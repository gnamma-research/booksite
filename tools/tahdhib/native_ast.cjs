const fs=require('fs');let acorn;
try{acorn=require('acorn')}catch{acorn=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/ts-node/node_modules/acorn')}
const s=fs.readFileSync(process.argv[2],'utf8'),root=acorn.parse(s,{ecmaVersion:'latest',sourceType:'script'}),out=[];
function walk(n){if(!n||typeof n!=='object')return;if(n.type==='FunctionDeclaration')out.push({type:'function',name:n.id.name,start:n.start,end:n.end});if(n.type==='VariableDeclarator'&&n.id.type==='Identifier')out.push({type:'variable',name:n.id.name,start:n.init?.start,end:n.init?.end});for(const [k,v] of Object.entries(n)){if(k==='start'||k==='end')continue;if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v)}}walk(root);console.log(JSON.stringify(out));
