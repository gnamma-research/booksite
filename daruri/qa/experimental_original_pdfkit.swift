// EXPERIMENTAL: native Apple PDFKit search in original Daruri Arabic pages.
// Read-only test of an isolated CIDFont source-layer PDF, not personal appendix.
// Not a substitute for iPhone Simulator, PDFium, Adobe Acrobat or full QA.
import Foundation
import PDFKit

guard CommandLine.arguments.count == 3 else {
  fputs("usage: experimental_original_pdfkit.swift original.pdf candidate.pdf\n", stderr)
  exit(2)
}
func check(_ filename: String, _ phrase: String) -> (Int,Int,[String]) {
  guard let pdf=PDFDocument(url:URL(fileURLWithPath:filename)) else {
    fputs("Cannot load PDF \(filename)\n",stderr);exit(2)
  }
  let hits=pdf.findString(phrase,withOptions:[])
  let sourcePage=pdf.page(at:0)!
  let onSource=hits.filter{ selection in
    selection.pages.contains(where: {$0 === sourcePage})
  }
  let snippets=onSource.prefix(3).map{$0.string ?? ""}
  print("FILE \(URL(fileURLWithPath:filename).lastPathComponent)")
  print("PAGES \(pdf.pageCount) HITS \(hits.count) FIRST_PAGE_HITS \(onSource.count)")
  print("SAMPLES \(snippets)")
  return (hits.count,onSource.count,snippets)
}
let phrase="أما بعد"
let old=check(CommandLine.arguments[1],phrase)
let repaired=check(CommandLine.arguments[2],phrase)
guard repaired.1 > 0 else {
  fputs("FAIL: PDFKit did not find Arabic source phrase on §1 page\n",stderr)
  exit(1)
}
print("PASS: native macOS PDFKit finds Arabic in source page, baseline first-page hits \(old.1), candidate \(repaired.1).")
