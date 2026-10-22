import Foundation
import PDFKit
let file=URL(fileURLWithPath:CommandLine.arguments[1])
guard let doc=PDFDocument(url:file) else {fatalError("Unable to read personal PDF")}
let terms=["مقدمة","التحليل","العلوم الدقيقة","الحقيقة","Des idées françaises","SearchableTermGamma","P1"]
var result:[String:Any]=["pages":doc.pageCount]
for term in terms{
 let n=doc.findString(term,withOptions:[]).count
 result[term]=n
 print("PDFKIT term \(term) occurrences \(n)")
}
result["lastPageText"]=String((doc.page(at:doc.pageCount-1)?.string ?? "").prefix(1400))
let json=try JSONSerialization.data(withJSONObject:result,options:[.prettyPrinted,.sortedKeys])
try json.write(to:URL(fileURLWithPath:CommandLine.arguments[2]))
print("NATIVE_PAGE:",result["lastPageText"] ?? "")
for term in terms{ if (result[term] as? Int ?? 0)<1 {fputs("FAIL Arabic/PDF text search: \(term)\n",stderr);exit(2)}}
print("PASS native Apple PDFKit full mixed Arabic searchable and English links")
