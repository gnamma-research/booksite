#!/usr/bin/env python3
"""Read-only all-414 authorial Arabic source-search matrix (NON-RELEASE).

Compares geometric RTL ordering, logical draw order and native PyMuPDF search.
Vowelled files use the canonical vowelled text to pick *word boundaries*; direct
unvowelled native probes are reported separately and may be accent-sensitive.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import fitz

from audit_native_source_and_notes import book_data
from diagnose_arabic_pdf_unicode import fold_ar, phrase_probes

SITE = Path(__file__).resolve().parents[1]
CANONICAL = (
    ('daruri.pdf', True), ('daruri-arabic.pdf', False),
    ('daruri-arabic-vowelled.pdf', True), ('daruri-study.pdf', True),
)


def jobs(site):
    for filename, vowelled in CANONICAL:
        yield site / filename, filename, vowelled
    manifest = json.loads((site / 'editions/manifest.json').read_text(encoding='utf-8'))
    for entry in manifest['files']:
        mode = entry['language']
        if mode == 'english':
            continue
        yield (site / 'editions' / entry['file'], entry['file'],
               mode not in ('arabic', 'bilingual-unvowelled'))


def inspect_pdf(path, name, vowelled, sections):
    with fitz.open(path) as pdf:
        names = pdf.resolve_names()
        locations = {n: names[f'section-{n}']['page'] for n in range(1, 259)}
        if any(locations[n] > locations[n+1] for n in range(1, 258)):
            raise AssertionError('Section anchors must follow reading order')
        page_cache = {}
        stats = {
            'filename': name, 'pages': pdf.page_count,
            'segments_tested': 0, 'source_sort_false_any': 0,
            'source_sort_true_any': 0, 'native_search_any': 0,
            'source_sort_false_all': 0, 'source_sort_true_all': 0,
            'native_search_all': 0, 'native_phrase_hits': 0,
            'native_phrase_total': 0, 'unmatched_native_samples': [],
        }
        for section in sections:
            n = int(section['id'])
            first = locations[n]
            last = locations.get(n+1, min(first + 2, pdf.page_count - 1))
            if last - first > 12:
                raise ValueError(f'Section {n} spans more than 13 pages')
            pages = range(first, last + 1)
            for p in pages:
                if p not in page_cache:
                    page = pdf[p]
                    page_cache[p] = {
                        'logical': fold_ar(page.get_text('text', sort=False)),
                        'geometric': fold_ar(page.get_text('text', sort=True)),
                        'textpage': page.get_textpage(),
                        'page': page,
                    }
            logical = ''.join(page_cache[p]['logical'] for p in pages)
            geometric = ''.join(page_cache[p]['geometric'] for p in pages)
            for ix, segment in enumerate(section['segments'], 1):
                source = (segment.get('vocalized', segment['ar'])
                          if vowelled else segment['ar'])
                probes = phrase_probes(source)
                if not probes:
                    continue
                stats['segments_tested'] += 1
                logical_hits = sum(fold_ar(q) in logical for q in probes)
                geometric_hits = sum(fold_ar(q) in geometric for q in probes)
                native_hits = sum(any(
                    page_cache[p]['page'].search_for(q, textpage=page_cache[p]['textpage'])
                    for p in pages) for q in probes)
                stats['source_sort_false_any'] += logical_hits > 0
                stats['source_sort_true_any'] += geometric_hits > 0
                stats['native_search_any'] += native_hits > 0
                stats['source_sort_false_all'] += logical_hits == len(probes)
                stats['source_sort_true_all'] += geometric_hits == len(probes)
                stats['native_search_all'] += native_hits == len(probes)
                stats['native_phrase_hits'] += native_hits
                stats['native_phrase_total'] += len(probes)
                if native_hits < len(probes) and len(stats['unmatched_native_samples']) < 12:
                    stats['unmatched_native_samples'].append({
                        'section': n, 'segment': ix, 'native_hits': native_hits,
                        'probes': len(probes), 'source_start_page': first+1,
                        'source_prefix': source[:80],
                    })
        if stats['segments_tested'] != 414:
            raise AssertionError(f'Expected 414 authorial segments, got {stats["segments_tested"]}')
        return stats


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--site-dir', type=Path, default=SITE)
    parser.add_argument('--output', type=Path,
                        default=Path('/tmp/daruri-unicode-probe/414-matrix.json'))
    args = parser.parse_args()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    sections = book_data(args.site_dir)
    results = []
    for path, name, vowelled in jobs(args.site_dir):
        row = inspect_pdf(path, name, vowelled, sections)
        results.append(row)
        print('MATRIX', name,
              'native', f"{row['native_search_any']}/{row['segments_tested']}",
              'logical', f"{row['source_sort_false_any']}/{row['segments_tested']}",
              'geometric', f"{row['source_sort_true_any']}/{row['segments_tested']}",
              flush=True)
    args.output.write_text(
        json.dumps({
            'version': 'arabic-native-414-v1',
            'limitations': [
                'Native PyMuPDF search does not certify PDFKit/PDFium/Acrobat/PDF.js.',
                'Unvowelled phrase search in vowelled PDFs may be viewer/diacritic-sensitive.',
                'Four-word page-local probes do not prove correct highlighting or copy geometry.',
            ],
            'results': results,
        }, ensure_ascii=False, indent=2),
        encoding='utf-8')
    print('MATRIX_REPORT', str(args.output), flush=True)


if __name__ == '__main__':
    main()
