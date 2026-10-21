'use strict';
// Standard PDF navigation may be a direct /Dest array or /A << /S /GoTo /D ... >>.
// The action form is required for Android's native PDFium goto-link parser.
const {PDFName,PDFArray}=require('pdf-lib');
module.exports=function navigationDestination(pdf,annotation){
  let raw=annotation.get(PDFName.of('Dest'));
  if(!raw){
    const actionRef=annotation.get(PDFName.of('A'));
    if(!actionRef)return null;
    const action=pdf.context.lookup(actionRef);
    if(String(action?.get(PDFName.of('S')))!=='/GoTo')return null;
    raw=action.get(PDFName.of('D'));
  }
  const item=raw?pdf.context.lookup(raw):null;
  return item instanceof PDFArray?item:null;
};
