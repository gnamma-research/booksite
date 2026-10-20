'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
module.exports=function loadBook(html){
 const m=html.match(/<script[^>]*id="editionData"[^>]*>([\s\S]*?)<\/script>/);
 if(!m)throw Error('Missing editionData');
 let book=JSON.parse(m[1]);
 if(!book.sections){
   const data={textContent:m[1]};
   vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'..','edition-r3-20261020.js'),'utf8'),{
     document:{getElementById:id=>{if(id!=='editionData')throw Error('Unexpected data target');return data;}}
   },{timeout:3000});
   book=JSON.parse(data.textContent);
 }
 return book;
};
