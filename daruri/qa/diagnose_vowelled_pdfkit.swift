// Diagnostic ONLY: report exactly what native macOS PDFKit sees for vowelled
// source text, not just pass/fail search. Never modifies or writes a PDF.
import Foundation
import PDFKit

guard CommandLine.arguments.count >= 3 else {
  fputs("usage: swift diagnose_vowelled_pdfkit.swift file.pdf source-map.json\n",stderr)
  exit(2)
}
guard let doc=PDFDocument(url: URL(fileURLWithPath: CommandLine.arguments[1])),
      let page=doc.page(at:0) else {
  fputs("PDFKit could not open file\n",stderr);exit(2)
}
let mURL=URL(fileURLWithPath:CommandLine.arguments[2])
let data=try Data(contentsOf:mURL)
guard let map=try JSONSerialization.jsonObject(with:data) as? [String:Any],
      let segments=map["segments"] as? [String:[[Any]]],
      let first=segments["1:0:vocalized"] ?? segments["1:0:ar"], first.count >= 8 else {
  fputs("Missing original first source phrase\n",stderr);exit(2)
}
func value(_ x:Any)->Double { (x as? NSNumber)?.doubleValue ?? 0 }
func printable(_ str:String, maxLen:Int=160) -> String {
  let escaped=String(str.prefix(maxLen)).unicodeScalars.map {
    s in
    if s.value < 32 || s.value==0xfffd {return String(format:"\\u{%04X}",s.value)}
    return String(s)
  }.joined()
  return escaped
}
func scalars(_ text:String,lim:Int=60)->String {
  text.unicodeScalars.prefix(lim).map {String(format:"U+%04X", $0.value)}.joined(separator:" ")
}
let phrase=first.prefix(2).compactMap {$0[0] as? String}.joined(separator:" ")
let prefix=first.prefix(5).compactMap {$0[0] as? String}.joined(separator:" ")
let pageText=page.string ?? ""
let firstRect=first.prefix(2).map {row -> CGRect in
  let x0=value(row[2]),y0=value(row[3]),x1=value(row[4]),y1=value(row[5])
  return CGRect(x:x0,y:page.bounds(for:.mediaBox).height-y1,width:x1-x0,height:y1-y0)
}.reduce(CGRect.null){$0.union($1)}
let selection=page.selection(for:firstRect)?.string ?? "<nil>"
let displayOptions: [(String,String)]=[
  ("EXACT",phrase),
  ("UP_TO_5",prefix),
  ("NFC",phrase.precomposedStringWithCanonicalMapping),
  ("NFD",phrase.decomposedStringWithCanonicalMapping),
  ("STRIP_DIACRITICS",String(phrase.unicodeScalars.filter{scalar in
    !CharacterSet.nonBaseCharacters.contains(scalar)
  }.map{Character($0)})),
  ("REVERSE_SCALARS",String(phrase.unicodeScalars.reversed().map{Character($0)})),
  ("COPY_SELECTION",selection),
  ("COPY_REVERSED",String(selection.unicodeScalars.reversed().map{Character($0)})),
]
print("PDFKIT_DIAG first_profile=\(CommandLine.arguments[1])")
print("PDFKIT_DIAG expected=\(printable(phrase))")
print("PDFKIT_DIAG expected_scalars=\(scalars(phrase))")
print("PDFKIT_DIAG rect=\(firstRect)")
print("PDFKIT_DIAG selected=\(printable(selection, maxLen:220))")
print("PDFKIT_DIAG selected_scalars=\(scalars(selection,lim:120))")
print("PDFKIT_DIAG page_prefix=\(printable(pageText,maxLen:600))")
print("PDFKIT_DIAG page_scalars=\(scalars(pageText,lim:130))")
for (kind,needle) in displayOptions {
 let found=doc.findString(needle,withOptions:[])
 let pagehits=found.filter {$0.pages.contains(where:{$0 === page})}
 let good=pagehits.filter {
  let overlap=$0.bounds(for:page).intersection(firstRect)
  return !overlap.isNull && overlap.width>1 && overlap.height>1
 }
 print("PDFKIT_DIAG_SEARCH \(kind) exact_count=\(pagehits.count) source_box_hits=\(good.count) needle=\(printable(needle,maxLen:100)) scalars=\(scalars(needle,lim:35))")
}
