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
 for term in terms {rec[term]=count(doc,term)}
 result.append(rec)
 print("\(name) \(terms.map{$0 + "="+String(rec[$0] as? Int ?? -1)}.joined(separator:" "))")
}
let bytes=try! JSONSerialization.data(withJSONObject:result,options:[.prettyPrinted,.sortedKeys])
try! bytes.write(to: URL(fileURLWithPath:"\(dir)/macos_pdfkit_results.json"))
if failing>0{exit(2)}
