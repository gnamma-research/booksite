// Native Apple PDFKit differential test of original Arabic SOURCE pages.
// Neither a short search hit nor a passed diagnostic certifies a production PDF.
import Foundation
import PDFKit

guard CommandLine.arguments.count == 3 else {
  fputs("usage: experimental_original_pdfkit.swift original.pdf candidate.pdf\n",stderr)
  exit(2)
}
let original=CommandLine.arguments[1]
let candidate=CommandLine.arguments[2]
let probes=[
  "أما بعد",
  "أما بعد حمدا لله",
  "أما بعد حمدا لله معلم البيان",
  "إن المعارف والعلوم ثلاثة أصناف",
  "فإن غرضي في هذا الكتاب"
]
func coverage(_ path:String)->[Int] {
  guard let pdf=PDFDocument(url:URL(fileURLWithPath:path)),let first=pdf.page(at:0) else {
    fputs("Cannot read PDF \(path)\n",stderr);exit(2)
  }
  var counts=[Int]()
  for phrase in probes {
    let matches=pdf.findString(phrase,withOptions:[])
    let source=matches.filter{$0.pages.contains(where: {$0 === first})}
    print("\(URL(fileURLWithPath:path).lastPathComponent) : \(phrase) : \(source.count) source hits")
    if let hit=source.first {
      let rect=hit.bounds(for:first)
      print("  source bbox: \(rect)")
    }
    counts.append(source.count)
  }
  return counts
}
let old=coverage(original)
let now=coverage(candidate)
let better=(1..<probes.count).filter{now[$0] > old[$0]}
print("BASELINE_COUNTS \(old)")
print("CANDIDATE_COUNTS \(now)")
print("IMPROVED_LONG_PROBES \(better)")
guard !better.isEmpty else {
  fputs("FAIL: candidate did not increase native PDFKit long Arabic phrase searching\n",stderr)
  exit(1)
}
print("PASS: Native macOS PDFKit original-source Arabic search shows measurable longer-phrase improvement.")
