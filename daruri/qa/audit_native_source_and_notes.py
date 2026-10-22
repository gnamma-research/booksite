#!/usr/bin/env python3
"""Read-only release audit for native PDF search and source-note placement.

This is a diagnostic, NOT a visual proof or native Apple/Android test.
No PDFs or existing manifests are modified.
"""
import argparse
import collections
import hashlib
import json
import re
import sys
import unicodedata
from pathlib import Path

import fitz

HERE = Path(__file__).resolve().parent
SITE = HERE.parent
CANONICAL = ('daruri.pdf', 'daruri-study.pdf', 'daruri-english.pdf',
             'daruri-arabic.pdf', 'daruri-arabic-vowelled.pdf')
AR = re.compile(r'[\u0621-\u064a]+')
EN = re.compile('[a-z]+')
NOTE = re.compile(r'^(N\d{3}|QUR-[A-Za-z0-9-]+(?:--repeat-\d+)?|BA15-[A-Za-z0-9-]+)$')


def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as handle:
        for part in iter(lambda: handle.read(1024 * 1024), b''):
            digest.update(part)
    return digest.hexdigest()


def book_data(site):
    source = (site / 'edition-r3-20261020.js').read_text(encoding='utf-8')
    match = re.search(r'textContent\s*=\s*("(?:[^"\\]|\\.)*")\s*;', source, re.S)
    if not match:
        raise ValueError('Canonical edition payload missing')
    book = json.loads(json.loads(match.group(1)))
    sections = [s for s in book['sections'] if str(s['id']).isdigit()]
    assert len(sections) == 258
    assert sum(len(s['segments']) for s in sections) == 414
    return sections


def normalized(text, language, spaces=False):
    text = unicodedata.normalize('NFKC', text or '').replace('\u0640', '')
    text = ''.join(c for c in text if not unicodedata.combining(c))
    if language == 'ar':
        text = text.translate(str.maketrans('أإآٱؤئىة', 'ااااوييه'))
        tokens = AR.findall(text)
    else:
        tokens = EN.findall(text.lower())
    return ' '.join(tokens) if spaces else ''.join(tokens)


def sample_phrases(source, language):
    words = normalized(source, language, True).split()
    if len(words) < 3:
        return []
    starts = (0, max(0, len(words) // 2 - 1))
    phrases = [normalized(' '.join(words[p:p + 4]), language) for p in starts]
    return list(dict.fromkeys(s for s in phrases if len(s) >= 10))


def source_destinations(doc):
    names = doc.resolve_names()
    starts = {}
    for section in range(1, 259):
        entry = names.get(f'section-{section}')
        if not isinstance(entry, dict) or not isinstance(entry.get('page'), int):
            raise ValueError(f'Missing named section-{section}')
        page = entry['page']
        if page < 0 or page >= doc.page_count:
            raise ValueError(f'Invalid section-{section} page')
        starts[section] = page
    if any(starts[n] > starts[n + 1] for n in range(1, 258)):
        raise ValueError('Source sections are not in page order')
    return names, starts


def audit_search(doc, sections, starts, language):
    cache = {}
    matched, full, tested = 0, 0, 0
    unmatched = []
    for section in sections:
        n = int(section['id'])
        first = starts[n]
        last = starts.get(n + 1, min(first + 2, doc.page_count - 1))
        if last - first > 12:
            raise ValueError(f'Section-{n} extends across >13 pages')
        for p in range(first, last + 1):
            if p not in cache:
                cache[p] = normalized(doc[p].get_text('text', sort=True), language)
        region = ''.join(cache[p] for p in range(first, last + 1))
        field = 'ar' if language == 'ar' else 'en'
        for ix, segment in enumerate(section['segments'], 1):
            probes = sample_phrases(segment[field], language)
            if not probes:
                continue
            tested += 1
            count = sum(s in region for s in probes)
            matched += count > 0
            full += count == len(probes)
            if count != len(probes) and len(unmatched) < 30:
                unmatched.append({
                    'section': n, 'segment': ix, 'page_start': first + 1,
                    'matched': count, 'total': len(probes),
                    'source_prefix': segment[field][:80],
                })
    return {
        'segments_tested': tested, 'any_phrase_matched': matched,
        'all_phrases_matched': full,
        'coverage_fraction': round(matched / tested, 4) if tested else None,
        'unmatched_samples': unmatched,
    }


def source_call(name, names):
    if name.startswith('call-'):
        body = name[5:]
        return ('publisher', body, body) if NOTE.fullmatch(body) else None
    if name.startswith('qcall--'):
        pieces = name.split('--')
        if len(pieces) >= 4 and pieces[1].startswith('QUR-'):
            body, ordinal = pieces[1:3]
            candidate = f'{body}--repeat-{ordinal}' if ordinal.isdigit() and int(ordinal) > 0 else body
            return ('quran', body, candidate if candidate in names else body)
    return None


def audit_notes(names, pages):
    pairs = set()
    missing = []
    for name, dest in names.items():
        matched = source_call(name, names)
        if not matched:
            continue
        kind, body, target = matched
        resolved = names.get(target)
        if not isinstance(resolved, dict):
            missing.append((name, target))
            continue
        a, b = dest.get('page'), resolved.get('page')
        if not isinstance(a, int) or not isinstance(b, int) or min(a, b) < 0 or max(a, b) >= pages:
            missing.append((name, target, 'invalid page'))
            continue
        pairs.add((kind, body, a, b))
    mismatches = sorted(pair for pair in pairs if pair[2] != pair[3])
    offsets = collections.Counter(target - call for _, _, call, target in pairs)
    return {
        'note_body_anchors': sum(bool(NOTE.fullmatch(name)) for name in names),
        'distinct_call_body_pairs': len(pairs),
        'cross_page_pairs': len(mismatches),
        'page_offsets': {str(n): count for n, count in sorted(offsets.items())},
        'missing_targets': missing[:35],
        'cross_page_examples': [
            {'type': kind, 'note': note, 'call_page': src + 1,
             'body_page': dst + 1, 'page_delta': dst - src}
            for kind, note, src, dst in mismatches[:35]
        ],
        '_render_pages': sorted({p for _, _, a, b in mismatches[:2] for p in (a, b)}),
    }


def audit_pdf(path, record, sections, expect_ar, expect_en, output, evidence=2):
    row = {'file': str(path), 'sha256': sha256(path), 'bytes': path.stat().st_size}
    problems = []
    if record:
        if row['sha256'] != record.get('sha256'):
            problems.append('Published SHA mismatch')
        if row['bytes'] != record.get('size_bytes', record.get('bytes')):
            problems.append('Published byte-size mismatch')
    with fitz.open(path) as doc:
        row['pages'] = doc.page_count
        if record and doc.page_count != record.get('pages'):
            problems.append('Published page count mismatch')
        names, starts = source_destinations(doc)
        row['section_destinations'] = len(starts)
        for language, enabled in (('ar', expect_ar), ('en', expect_en)):
            if enabled:
                row[f'native_source_{language}'] = audit_search(doc, sections, starts, language)
        notes = audit_notes(names, doc.page_count)
        pages_to_render = notes.pop('_render_pages')
        row['source_notes'] = notes
        if notes['missing_targets']:
            problems.append('Missing source note body anchors')
        invalid = []
        count = 0
        for p, page in enumerate(doc):
            for link in page.get_links():
                count += 1
                target = link.get('page')
                if link.get('kind') == fitz.LINK_GOTO and (
                    not isinstance(target, int) or not 0 <= target < doc.page_count
                ):
                    invalid.append((p + 1, target))
        row['links'] = count
        row['invalid_link_targets'] = invalid[:30]
        if invalid:
            problems.append(f'{len(invalid)} invalid internal links')
        for page_number in pages_to_render[:2 * evidence]:
            name = path.stem.replace(' ', '_')
            doc[page_number].get_pixmap(
                matrix=fitz.Matrix(1.25, 1.25), alpha=False
            ).save(output / f'{name}-cross-page-note-p{page_number + 1}.png')
    row['integrity_errors'] = problems
    return row


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--site-dir', type=Path, default=SITE)
    parser.add_argument('--output-dir', type=Path, default=Path('/tmp/daruri-release-audit'))
    parser.add_argument('--scope', choices=('canonical', 'base'), default='base')
    parser.add_argument('--render-evidence', type=int, default=2)
    parser.add_argument('--strict', action='store_true')
    parser.add_argument('--note-policy', choices=('undecided', 'same-page', 'adjacent', 'section'),
                        default='undecided')
    parser.add_argument('--min-source-coverage', type=float, default=0.98)
    args = parser.parse_args()
    site = args.site_dir
    output = args.output_dir
    output.mkdir(parents=True, exist_ok=True)
    sections = book_data(site)
    primary = json.loads((site / 'pdf-editions-manifest.json').read_text())['files']
    jobs = [(site / name, primary[name],
             name != 'daruri-english.pdf',
             name not in ('daruri-arabic.pdf', 'daruri-arabic-vowelled.pdf'))
            for name in CANONICAL]
    if args.scope == 'base':
        base = json.loads((site / 'editions/manifest.json').read_text())
        for item in base['files']:
            mode = item['language']
            jobs.append((site / 'editions' / item['file'], item,
                         mode != 'english', mode not in ('arabic', 'arabic-vowelled')))
    results, errors = [], []
    for path, record, arabic, english in jobs:
        try:
            item = audit_pdf(path, record, sections, arabic, english,
                             output, args.render_evidence)
        except Exception as error:
            item = {'file': str(path), 'integrity_errors': [f'{type(error).__name__}: {error}']}
        results.append(item)
        errors += [f'{path.name}: {x}' for x in item['integrity_errors']]
        print('AUDIT', path.name,
              'Arabic', item.get('native_source_ar', {}).get('coverage_fraction'),
              'English', item.get('native_source_en', {}).get('coverage_fraction'),
              'cross-page notes', item.get('source_notes', {}).get('cross_page_pairs'),
              'integrity issues', len(item['integrity_errors']), flush=True)
    blockers = errors.copy()
    if args.strict:
        if args.note_policy == 'undecided':
            blockers.append('Editorial footnote-placement policy is undecided')
        for item in results:
            for language in ('ar', 'en'):
                coverage = item.get(f'native_source_{language}')
                if coverage and (coverage['coverage_fraction'] or 0) < args.min_source_coverage:
                    blockers.append(f"{Path(item['file']).name}: {language} source search below minimum")
            if args.note_policy == 'same-page' and item.get('source_notes', {}).get('cross_page_pairs', 0):
                blockers.append(f"{Path(item['file']).name}: source note crosses a page")
            if args.note_policy == 'adjacent' and any(
                abs(int(delta)) > 1 for delta in item.get('source_notes', {}).get('page_offsets', {})
            ):
                blockers.append(f"{Path(item['file']).name}: note >1 page from call")
    report = {'version': '20261022-native-source-footnotes-v1',
              'strict': args.strict, 'note_policy': args.note_policy,
              'results': results, 'blockers': blockers,
              'release_approved': bool(args.strict and not blockers)}
    (output / 'native-source-note-audit.json').write_text(
        json.dumps(report, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    lines = [
        '# Native source search + source notes (read-only release audit)', '',
        'Matching a phrase in an extracted text layer is a prerequisite, **not**',
        'proof of PDF.js/iOS PDFKit/Android PDFium search or pixel-correct highlights.', '',
        '| PDF | Arabic source matches | English source matches | Off-page notes | Integrity errors |',
        '|---|---:|---:|---:|---:|',
    ]
    for item in results:
        def fraction(code):
            result = item.get(f'native_source_{code}')
            return f"{result['any_phrase_matched']}/{result['segments_tested']}" if result else '—'
        lines.append(f"| {Path(item['file']).name} | {fraction('ar')} | {fraction('en')} | "
                     f"{item.get('source_notes', {}).get('cross_page_pairs', '—')} | "
                     f"{len(item['integrity_errors'])} |")
    lines += ['', 'Off-page note calls may be intentional section apparatus: do not treat',
              'them as valid footnotes without an explicit editorial decision.', '',
              '## Release blockers', '']
    lines += [f'- {x}' for x in blockers[:120]] or ['- None detected by this diagnostic.']
    lines += ['', 'Independent mobile, Acrobat, PDF.js, footnote visual and full apparatus',
              'equivalence checks are still required. This audit never modifies PDFs.']
    (output / 'native-source-note-audit.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print('RESULT', 'PASS' if not blockers else 'BLOCKED', len(blockers), flush=True)
    return 1 if errors or (args.strict and blockers) else 0


if __name__ == '__main__':
    sys.exit(main())
