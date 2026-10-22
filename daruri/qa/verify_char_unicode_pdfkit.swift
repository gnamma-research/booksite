// Native Apple PDFKit source-authorial Arabic acceptance, NOT FOR RELEASE.
// Consumes the approved checksum-bound Pango source map and temporary candidate.
// Tests both text discovery and location at the correct originally printed words.
import Foundation
import PDFKit

func fail(_ msg: String) -> Never {
    fputs("PDFKIT_SOURCE_QA_ERROR: \(msg)\n", stderr)
    exit(2)
}
guard CommandLine.arguments.count == 3 else {
    fail("Usage: verify_char_unicode_pdfkit.swift candidate.pdf source_map.json")
}
let pdfUrl = URL(fileURLWithPath: CommandLine.arguments[1])
let mapUrl = URL(fileURLWithPath: CommandLine.arguments[2])
guard let document = PDFDocument(url: pdfUrl) else { fail("Cannot read temporary PDF") }
let json: [String: Any]
do {
    guard let object = try JSONSerialization.jsonObject(with: Data(contentsOf: mapUrl))
             as? [String: Any] else { fail("Invalid source-map JSON") }
    json = object
} catch { fail("Cannot parse source map: \(error)") }
guard let segments = json["segments"] as? [String: [[Any]]] else {
    fail("Missing full Pango source segments")
}
func number(_ any: Any) -> Double? {
    return (any as? NSNumber)?.doubleValue
}
func pageNumber(_ word: [Any]) -> Int? {
    guard word.count >= 6, let n = number(word[1]) else { return nil }
    return Int(n)
}
let keys = segments.keys
    .filter { $0.hasSuffix(":ar") || $0.hasSuffix(":vocalized") }
    .sorted {
        func parts(_ key: String) -> [Int] {
            let nums = key.split(separator: ":").prefix(2)
            return nums.map { Int($0) ?? -1 }
        }
        return parts($0).lexicographicallyPrecedes(parts($1))
    }
guard keys.count == 414 else { fail("Expected 414 authorial segments, got \(keys.count)") }

var searchable = 0
var aligned = 0
var cleanSelections = 0
var sampledSelections = 0
var problems: [String] = []
for (index, key) in keys.enumerated() {
    guard let words = segments[key], let first = words.first,
          let physicalPage = pageNumber(first), physicalPage > 0,
          let page = document.page(at: physicalPage-1) else {
        fail("Invalid source map page for \(key)")
    }
    let samePage = words.filter { pageNumber($0) == physicalPage }
    guard samePage.count >= 2 else {
        fail("Segment \(key) has fewer than two words on its first page")
    }
    let firstTwo = Array(samePage.prefix(2))
    guard let a = firstTwo[0][0] as? String,
          let b = firstTwo[1][0] as? String else {
        fail("Non-string source word in \(key)")
    }
    let phrase = a + " " + b
    let results = document.findString(phrase, withOptions: [])
    let pageHits = results.filter {
        $0.pages.contains(where: { $0 === page })
    }
    searchable += !pageHits.isEmpty ? 1 : 0

    let relevant = firstTwo.compactMap { row -> CGRect? in
        guard let x0 = number(row[2]), let y0 = number(row[3]),
              let x1 = number(row[4]), let y1 = number(row[5]) else {
            return nil
        }
        let height = page.bounds(for: .mediaBox).height
        return CGRect(x: x0, y: height - y1, width: x1 - x0, height: y1-y0)
    }
    guard relevant.count == 2 else { fail("Malformed box in \(key)") }
    let expected = relevant[0].union(relevant[1])
    let correct = pageHits.contains {
        let observed = $0.bounds(for: page)
        let overlap = observed.intersection(expected)
        return !overlap.isNull && overlap.width > 1 && overlap.height > 1
    }
    aligned += correct ? 1 : 0
    if !correct && problems.count < 24 {
        problems.append("\(key): phrase=\(phrase), page=\(physicalPage), results=\(pageHits.count)")
    }
    if index % 24 == 0 {
        sampledSelections += 1
        if let selection = page.selection(for: expected),
           let copy = selection.string, !copy.contains("\u{FFFD}"),
           copy.contains(a) || copy.contains(b) {
            cleanSelections += 1
        } else if problems.count < 24 {
            let content = page.selection(for: expected)?.string ?? "<none>"
            problems.append("Copy selection \(key): \(content.prefix(95))")
        }
    }
}
print("PDFKIT_414_COVERAGE: searchable \(searchable)/414; aligned \(aligned)/414; clean_sampled_copy \(cleanSelections)/\(sampledSelections)")
for problem in problems { print("PDFKIT_DIAGNOSTIC: \(problem)") }
// This CI tests macOS PDFKit; real iOS PDFKit remains a separate acceptance test.
guard searchable == 414, aligned == 414, cleanSelections == sampledSelections else {
    fputs("PDFKIT_RELEASE_GATE_NOT_PASSED\n", stderr)
    exit(1)
}
print("PDFKIT_414_EXPERIMENT_PASS_NOT_RELEASE_CERTIFICATE")
