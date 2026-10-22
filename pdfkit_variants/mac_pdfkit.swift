import Foundation
import PDFKit
func count(_ d: PDFDocument,_ s:String)->Int{d.findString(s,withOptions:[]).count}
let dir=CommandLine.arguments[1]
let fm=FileManager.default
let variants=["baseline","type3_tr0","type3_tr0_forward","type3_tr3_forward","hybrid_fontkit_tr3","hybrid_fontkit_tr0","type3_tr0_1pt"]
var failing=0
var result:[[String:Any]]=[]
for name in variants{
 let url=URL(fileURLWithPath:"\(dir)/\(name).pdf")
 guard fm.fileExists(atPath:url.path),let doc=PDFDocument(url:url) else {
  print("NOT_FOUND \(name)");failing+=1;continue
 }
 let terms=["مقدمة","التحليل","العلوم الدقيقة","والتحليل","Des idées françaises","P1"]
 var rec:[String:Any]=["variant":name,"pages":doc.pageCount]
 let appendix=doc.page(at:doc.pageCount-1)?.string ?? ""
 let textScalars=appendix.unicodeScalars.map{String(format:"%04X",$0.value)}
 rec["appendix_text_preview"]=String(appendix.prefix(900))
 rec["appendix_scalars"]=textScalars.prefix(220).joined(separator:" ")
 rec["appendix_length"]=appendix.count
 rec["reversedSearch"]=count(doc,String("التحليل".reversed()))
 rec["containsArabicPageString"]=appendix.unicodeScalars.contains{($0.value>=0x600 && $0.value<=0x6FF)}
 
 for term in terms {rec[term]=count(doc,term)}
 result.append(rec)
 print("\(name) \(terms.map{$0 + "="+String(rec[$0] as? Int ?? -1)}.joined(separator:" "))")
 print("PREVIEW_"+name+":"+String(appendix.prefix(400)))
 
}
let bytes=try! JSONSerialization.data(withJSONObject:result,options:[.prettyPrinted,.sortedKeys])
try! bytes.write(to: URL(fileURLWithPath:"\(dir)/macos_pdfkit_results.json"))
if failing>0{exit(2)}
