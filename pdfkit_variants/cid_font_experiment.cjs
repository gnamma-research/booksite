'use strict';
// Probe a real embedded CIDFontType2 + explicit CIDToGIDMap + ToUnicode.
// Completely synthetic. Does not alter the approved published PDFs.
const fs=require('node:fs'),path=require('node:path');
const {PDFDocument,PDFName,PDFString,PDFHexString,PDFNumber,PDFOperator}=require(path.resolve(__dirname,'../daruri/qa/node_modules/pdf-lib'));
const fontkit=require(path.resolve(__dirname,'../daruri/qa/node_modules/fontkit'));
const out=path.resolve(__dirname,'cidfont_test.pdf');
const raw=fs.readFileSync(path.resolve(__dirname,'../daruri/vendor/NotoNaskhArabic-Regular.ttf'));
const font=fontkit.create(raw);
const arabic='مقدمة العلوم الدقيقة بين الحقيقة والأصول؛ والتحليل';
const arabic2='والتحليل والبيان في أصول الفقه ونتائج الاجتهاد';
const phrases=[arabic,arabic2];
function cMapText(pairs){
 const dest=cp=>cp.toString(16).toUpperCase().padStart(4,'0');
 const data=pairs.map(([id,c])=>'<'+id.toString(16).padStart(4,'0')+'> <'+dest(c.codePointAt(0))+'>').join('\n');
 return ['/CIDInit /ProcSet findresource begin','12 dict begin','begincmap',
 '/CIDSystemInfo << /Registry (Gnamma) /Ordering (ExactUnicode) /Supplement 0 >> def',
 '/CMapName /GnammaExactCIDUnicode def','/CMapType 2 def',
 '1 begincodespacerange','<0000> <FFFF>','endcodespacerange',
 pairs.length+' beginbfchar',data,'endbfchar',
 'endcmap','CMapName currentdict /CMap defineresource pop','end','end'].join('\n')+'\n';
}
async function run(){
 const pdf=await PDFDocument.create();pdf.setTitle('Gnamma macOS PDFKit Type0 Unicode Experiment');
 const chars=[...new Set([...phrases.join('')])],cid=new Map(chars.map((c,i)=>[c,i+1]));
 const gids=Buffer.alloc((chars.length+1)*2);
 for (const [i,ch] of chars.entries()){
   const gl=font.glyphForCodePoint(ch.codePointAt(0));
   if(!gl||gl.id===0)console.log('MISSING',ch,ch.codePointAt(0));
   gids.writeUInt16BE(gl?.id||0,2*(i+1));
 }
 const rawFont=pdf.context.register(pdf.context.flateStream(raw));
 const fd=pdf.context.obj({
  Type:PDFName.of('FontDescriptor'),
  FontName:PDFName.of('GnammaNaskhCID'),
  Flags:4,FontBBox:[-400,-400,1500,1500],
  ItalicAngle:0,Ascent:1069,Descent:-634,CapHeight:1000,StemV:80,
  FontFile2:rawFont
 });
 const fdRef=pdf.context.register(fd);
 const gidRef=pdf.context.register(pdf.context.flateStream(gids));
 const cidf=pdf.context.obj({
  Type:PDFName.of('Font'),Subtype:PDFName.of('CIDFontType2'),
  BaseFont:PDFName.of('GnammaNaskhCID'),
  CIDSystemInfo:pdf.context.obj({
   Registry:PDFString.of('Adobe'),Ordering:PDFString.of('Identity'),Supplement:0
  }),
  FontDescriptor:fdRef,DW:500,
  CIDToGIDMap:gidRef
 });
 const cidRef=pdf.context.register(cidf);
 const cm=pdf.context.register(pdf.context.flateStream(Buffer.from(cMapText([...cid].map(([ch,id])=>[id,ch])),'utf8')));
 const type0=pdf.context.obj({
  Type:PDFName.of('Font'),Subtype:PDFName.of('Type0'),
  BaseFont:PDFName.of('GnammaNaskhCID'),
  Encoding:PDFName.of('Identity-H'),DescendantFonts:[cidRef],ToUnicode:cm
 });
 const fontRef=pdf.context.register(type0);
 const ps=[
  {variant:'logical_tr3',transform:x=>x,mode:3},
  {variant:'reversechars_tr3',transform:x=>Array.from(x).reverse().join(''),mode:3},
  {variant:'reversewords_tr3',transform:x=>x.split(' ').reverse().join(' '),mode:3},
  {variant:'logical_tr0_white',transform:x=>x,mode:0,white:true},
  {variant:'reversechars_tr0_white',transform:x=>Array.from(x).reverse().join(''),mode:0,white:true},
  {variant:'reversewords_tr0_white',transform:x=>x.split(' ').reverse().join(' '),mode:0,white:true},
  {variant:'logical_tr0_black',transform:x=>x,mode:0},
  {variant:'reversechars_tr0_black',transform:x=>Array.from(x).reverse().join(''),mode:0},
  {variant:'reversedchars_actualtext',transform:x=>Array.from(x).reverse().join(''),mode:3,actualText:true},
 ];
 for (let index=0;index<ps.length;index++){
  const cfg=ps[index],page=pdf.addPage([595.28,841.89]);
  page.node.setFontDictionary(PDFName.of('GNA'),fontRef);
  const label=await pdf.embedFont('Helvetica');
  page.drawText('CID Unicode test: '+cfg.variant,{x:40,y:800,size:14,font:label});
  for(let j=0;j<phrases.length;j++){
   const text=cfg.transform(phrases[j]),hex=Array.from(text).map(c=>cid.get(c).toString(16).padStart(4,'0')).join('');
   const {PDFName,PDFNumber,PDFOperator,PDFHexString}=require(path.resolve(__dirname,'../daruri/qa/node_modules/pdf-lib'));
   if(cfg.actualText){
    const rtl=Array.from(phrases[j]).reverse().join('');
    page.pushOperators(PDFOperator.of('BDC',[PDFName.of('Span'),pdf.context.obj({ActualText:PDFHexString.fromText(rtl)})]));
   }
   page.pushOperators(PDFOperator.of('BT'),
    PDFOperator.of('Tf',[PDFName.of('GNA'),PDFNumber.of(13)]),
    PDFOperator.of('Tr',[PDFNumber.of(cfg.mode)]));
   if(cfg.white)page.pushOperators(PDFOperator.of('rg',[PDFNumber.of(1),PDFNumber.of(1),PDFNumber.of(1)]));
   page.pushOperators(PDFOperator.of('Tm',[PDFNumber.of(1),PDFNumber.of(0),PDFNumber.of(0),PDFNumber.of(1),PDFNumber.of(45),PDFNumber.of(730-j*46)]),
    PDFOperator.of('Tj',[PDFHexString.of(hex)]),
    PDFOperator.of('ET'));
   if(cfg.actualText)page.pushOperators(PDFOperator.of('EMC'));
  }
 }
 await fs.promises.writeFile(out,await pdf.save({useObjectStreams:false}));
 console.log(JSON.stringify({path:out,pages:ps.length,fontBytes:raw.length,cids:chars.length,size:fs.statSync(out).size,configs:ps.map(x=>x.variant)}));
}
run().catch(e=>{console.error(e);process.exitCode=1});
