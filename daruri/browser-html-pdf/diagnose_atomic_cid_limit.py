#!/usr/bin/env python3
"""Diagnose ToUnicode atomic-CID extraction limits in nonrelease Daruri PDFs.

Pass the evidence.json and PDF artifact from real browser CI. Read-only:
never changes the PDF or authorial source, never substitutes glyphs.
This reports native PyMuPDF behavior ONLY, not a PDF-spec universal limit.
"""
import argparse
from collections import Counter
import json
from pathlib import Path
import fitz


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--pdf', required=True, type=Path)
    ap.add_argument('--evidence', required=True, type=Path)
    ap.add_argument('--out', type=Path)
    args = ap.parse_args()
    evidence = json.loads(args.evidence.read_text(encoding='utf-8'))
    rows = evidence['source_lines']
    assert evidence['source_paragraphs'] == 414 and len(rows) == evidence['source_line_count']
    processed = 0
    hits, misses = Counter(), Counter()
    examples = []
    with fitz.open(args.pdf) as doc:
        assert len(doc) == evidence['pages']
        for page_number, page in enumerate(doc, start=1):
            expected = [r for r in rows if r['page'] == page_number]
            spans = [z for block in page.get_text('dict')['blocks']
                     for line in block.get('lines', []) for z in line['spans']
                     if z.get('font') == 'GnammaVectorOriginalCID']
            if len(spans) != len(expected):
                raise ValueError(f'Page {page_number}: {len(spans)} actual versus '
                                 f'{len(expected)} expected semantic source spans')
            for row, sp in zip(expected, spans):
                original = row['phrase']
                recovered = sp['text']
                length = len(original)
                is_exact = recovered == original
                (hits if is_exact else misses)[length] += 1
                if not is_exact and len(examples) < 10:
                    examples.append({'id': row['unique_line_id'],
                                     'source_length': length,
                                     'first_native_codepoints': [f'U+{ord(c):04X}' for c in recovered[:8]],
                                     'expected_start': original[:38],
                                     'native_start': recovered[:38]})
                processed += 1
    assert processed == len(rows)
    pass_lengths = sorted(hits)
    fail_lengths = sorted(misses)
    observed_threshold = (max(pass_lengths) if pass_lengths and fail_lengths
                          and min(fail_lengths) == max(pass_lengths) + 1
                          and all(k <= max(pass_lengths) for k in hits)
                          and all(k > max(pass_lengths) for k in misses) else None)
    report = {
        'schema': 'gnamma-atomic-cid-native-extraction-diagnostic-v1',
        'native_engine': f'PyMuPDF {fitz.VersionBind}',
        'browser_source_engine': evidence.get('engine'),
        'nonrelease': True,
        'source_lines': processed,
        'native_exact': sum(hits.values()),
        'native_mismatched': sum(misses.values()),
        'longest_exact_source_line_chars': max(pass_lengths) if pass_lengths else None,
        'shortest_mismatched_source_line_chars': min(fail_lengths) if fail_lengths else None,
        'observed_exact_length_cutoff': observed_threshold,
        'exact_by_length': dict(sorted(hits.items())),
        'mismatched_by_length': dict(sorted(misses.items())),
        'sample_mismatches': examples,
        'warning': ('Observed cutoff is specific to this atomic CID/ToUnicode construction '
                    'and native extractor; it is NOT a PDF specification rule or permission '
                    'to shorten text. Full native source verification still fails.'),
    }
    print('GNAMMA_ATOMIC_CID_NATIVE_DIAGNOSTIC', json.dumps({
        k: report[k] for k in ('source_lines','native_exact','native_mismatched',
           'longest_exact_source_line_chars','shortest_mismatched_source_line_chars',
           'observed_exact_length_cutoff')
    }), flush=True)
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n',
                            encoding='utf-8')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
