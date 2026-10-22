import Foundation
import PDFKit
let file=URL(fileURLWithPath:CommandLine.arguments[1])
let output=URL(fileURLWithPath:CommandLine.arguments[2])
guard let d=PDFDocument(url:file) else {fatalError("Cannot load CIDFont PDF")}
let queries=["مقدمة","التحليل","العلوم الدقيقة","الحقيقة","أصول الفقه","والتحليل","والبيان","بِسْمِ","بسم","اللَّهِ","الله","الرَّحْمَٰنِ","الرحمن","الْحَمْدُ","الحمد"]
var byPage:[[String:Any]]=[]
for n in 0..<d.pageCount{
 let page=d.page(at:n)!
 var row:[String:Any]=["index":n,"page":n+1,"text":String((page.string ?? "").prefix(1300))]
 for query in queries {
  row[query]=d.findString(query,withOptions:[]).filter{selection in
   selection.pages.contains{d.index(for:$0)==n}
  }.count
 }
 byPage.append(row)
 print("PAGE \(n+1) text=\(String((page.string ?? "").prefix(200)))")
 print("SEARCH \(queries.map{$0 + ":" + String(row[$0] as? Int ?? 0)}.joined(separator:" "))")
}
try JSONSerialization.data(withJSONObject:byPage,options:[.prettyPrinted,.sortedKeys])
 .write(to:output)
print("Saved \(output.path)")
