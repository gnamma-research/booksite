/* Daruri SHA-bound PDF assembler in a cancellable Web Worker.
 * This classic worker imports only first-party, same-origin pinned assets.
 * The caller owns its lifetime: terminating the worker cancels CPU assembly.
 * No Reading Desk material, localStorage, fetch calls or upload permissions.
 */
'use strict';
importScripts('../vendor/pdf-lib-1.17.1.min.js','core.js?v=20261022-worker1');
self.onmessage=async event=>{
 const item=event.data;
 if(!item||!Number.isInteger(item.id)||!item.options){
  self.postMessage({id:item?.id,error:'Malformed PDF assembly request'});
  return;
 }
 try{
  if(!self.GnammaDynamicPdf?.assemble||!self.PDFLib?.PDFDocument)
   throw Error('Trusted PDF assembly libraries unavailable in worker');
  const result=await self.GnammaDynamicPdf.assemble({
   ...item.options,lib:self.PDFLib
  });
  if(!(result.bytes instanceof Uint8Array)||!result.sha256)
   throw Error('Worker did not produce verified PDF bytes');
  self.postMessage({id:item.id,result},[result.bytes.buffer]);
 }catch(error){
  self.postMessage({
   id:item.id,error:String(error?.message||error||'PDF assembly failed')
  });
 }
};
