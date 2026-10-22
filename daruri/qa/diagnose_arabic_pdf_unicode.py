#!/usr/bin/env python3
"""Read-only Unicode diagnosis: published Daruri CMaps and WeasyPrint fixtures.

Never rewrites an edition, a word map, a PDF manifest or an authorial passage.
Diagnostic results do not certify native viewer behaviour or layout parity.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

import fitz

SITE = Path(__file__).resolve().parents[1]
AR = re.compile(r'[ء-ي]+')


def fold_ar(value: str) -> str:
    value = unicodedata.normalize('NFKC', value).replace('\u0640', '')
    value = ''.join(c for c in value if not unicodedata.combining(c))
    value = value.translate(str.maketrans('أإآٱؤئىة', 'ااااوييه'))
    return ''.join(AR.findall(value))


def normalized_words(source: str) -> list[str]:
    # Preserve word boundaries when removing harakat: regex splitting on raw
    # combining marks would turn a vocalized Arabic *word* into many fragments.
    value = unicodedata.normalize('NFKC', source).replace('\u0640', '')
    value = ''.join(c for c in value if not unicodedata.combining(c))
    value = value.translate(str.maketrans('أإآٱؤئىة', 'ااااوييه'))
    return AR.findall(value)


def phrase_probes(source: str) -> list[str]:
    words = normalized_words(source)
    if len(words) < 4:
        return []
    starts = (0, max(0, len(words) // 2 - 2))
    return list(dict.fromkeys(' '.join(words[i:i + 4]) for i in starts))


def to_unicode_metrics(doc, page_numbers):
    seen, out = set(), []
    for page_num in page_numbers:
        for font in doc[page_num].get_fonts(full=True):
            xref = font[0]
            if xref in seen:
                continue
            seen.add(xref)
            tag, raw = doc.xref_get_key(xref, 'ToUnicode')
            if tag != 'xref':
                out.append({'font': font[3], 'xref': xref, 'to_unicode': tag})
                continue
            tu_xref = int(raw.split()[0])
            cmap = doc.xref_stream(tu_xref)
            # Direct bfchar entries only; bfrange is not counted here.
            pairs = re.findall(rb'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]*)>', cmap)
            empty = [key.decode('ascii') for key, value in pairs if not value]
            out.append({'font': font[3], 'xref': xref,
                        'to_unicode_xref': tu_xref, 'direct_pairs': len(pairs),
                        'empty_direct_pairs': len(empty), 'empty_keys_sample': empty[:12],
                        'cmap_sha256': hashlib.sha256(cmap).hexdigest()})
    return out


def extract_metrics(blob: bytes, expected: str) -> dict:
    with fitz.open(stream=blob, filetype='pdf') as pdf:
        probes = phrase_probes(expected)
        source_words = normalized_words(expected)

        def scores(sort):
            extracted = '\n'.join(page.get_text('text', sort=sort) for page in pdf)
            flat = fold_ar(extracted)
            return {'probe_hits': sum(fold_ar(p) in flat for p in probes),
                    'word_hits': sum(fold_ar(w) in flat for w in source_words),
                    'extracted_sample': extracted[:250]}

        return {'pages': len(pdf), 'probe_count': len(probes),
                'word_total': len(source_words),
                'logical_sort_false': scores(False),
                'geometric_sort_true': scores(True),
                'native_search_for_hits': sum(any(page.search_for(p) for page in pdf)
                                              for p in probes),
                'first_page_fonts': [font[3] for font in pdf[0].get_fonts()]}


def original_pdfs(site, sections):
    result = {}
    for rel in ('daruri-arabic.pdf', 'daruri-arabic-vowelled.pdf', 'daruri.pdf'):
        path = site / rel
        if not path.exists():
            result[rel] = {'skipped': 'not in checkout'}
            continue
        with fitz.open(path) as pdf:
            names = pdf.resolve_names()
            sample_sections = (1, 11, 23)
            source_pages = sorted({names[f'section-{n}']['page'] for n in sample_sections
                                   if f'section-{n}' in names})
            checks = []
            for n in sample_sections:
                anchor = names.get(f'section-{n}', {})
                if 'page' not in anchor:
                    continue
                first = anchor['page']
                following = names.get(f'section-{n+1}', {})
                last = following.get('page', first)
                authorial = sections[n-1]['segments'][0]
                source = authorial['ar'] if rel == 'daruri-arabic.pdf' else authorial.get('vocalized', authorial['ar'])
                probes = phrase_probes(source)
                pages = [pdf[p] for p in range(first, min(last + 1, len(pdf)))]
                variants = {}
                for sort in (False, True):
                    flat = fold_ar(''.join(page.get_text('text', sort=sort) for page in pages))
                    variants['sort_true' if sort else 'sort_false'] = sum(
                        fold_ar(q) in flat for q in probes)
                variants['search_for'] = sum(any(page.search_for(q) for page in pages)
                                             for q in probes)
                variants.update({'section': n, 'probes': len(probes)})
                checks.append(variants)
            result[rel] = {
                'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                'page_count': len(pdf),
                'sampled_pages_1based': [x + 1 for x in source_pages],
                'font_cmaps': to_unicode_metrics(pdf, source_pages),
                'passage_checks': checks,
                'source_extracted_unsorted': (
                    pdf[source_pages[0]].get_text('text', sort=False)[:350]
                    if source_pages else ''),
                'source_extracted_sorted': (
                    pdf[source_pages[0]].get_text('text', sort=True)[:350]
                    if source_pages else ''),
            }
    return result


def system_font(family):
    try:
        return subprocess.check_output(
            ['fc-match', '-f', '%{family}: %{file}', family],
            text=True, timeout=5).strip()
    except (OSError, subprocess.SubprocessError):
        return 'unavailable'


def fixture_tests(site, outdir, sections):
    from weasyprint import HTML, __version__ as wp_version
    from weasyprint.text.fonts import FontConfiguration

    samples = [(n, sections[n-1]['segments'][0]['ar']) for n in (1, 11, 23)]
    font_cases = {
        'bundled-naskh': site / 'build/fonts/NotoNaskhArabic-Regular.ttf',
        'system-naskh': Path(system_font('Noto Naskh Arabic').split(': ')[-1]),
        'system-amiri': Path(system_font('Amiri').split(': ')[-1]),
    }
    result = {'weasyprint': wp_version,
              'system_font_matches': {k: system_font(k)
                                      for k in ('Noto Naskh Arabic', 'Amiri')},
              'cases': {}}
    for label, fontpath in font_cases.items():
        result['cases'][label] = []
        for section, ar_text in samples:
            escaped = ar_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            font_rule = ("@font-face {font-family:'QAFixture'; src: url('" +
                         fontpath.resolve().as_uri() + "');}")
            markup = (
                '<!doctype html><html><head><meta charset="utf-8"><style>' +
                font_rule + ' @page {size:A4; margin:18mm}' +
                " body {font:16pt/1.65 'QAFixture';}" +
                ' .ar {direction:rtl; text-align:right}' +
                '</style></head><body><p class="ar" dir="rtl" lang="ar">' +
                escaped + '</p></body></html>')
            try:
                blob = HTML(string=markup, base_url=str(site)).write_pdf(
                    font_config=FontConfiguration())
                metrics = extract_metrics(blob, ar_text)
                metrics['section'] = section
                metrics['sha256'] = hashlib.sha256(blob).hexdigest()
                (outdir / f'probe-{label}-section-{section}.pdf').write_bytes(blob)
                with fitz.open(stream=blob, filetype='pdf') as pdf:
                    metrics['font_cmap'] = to_unicode_metrics(pdf, [0])
            except Exception as exc:
                metrics = {'section': section, 'error': str(exc),
                           'type': type(exc).__name__}
            result['cases'][label].append(metrics)
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--site-dir', type=Path, default=SITE)
    parser.add_argument('--output-dir', type=Path,
                        default=Path('/tmp/daruri-unicode-probe'))
    args = parser.parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    sys.path.insert(0, str(args.site_dir / 'qa'))
    from audit_native_source_and_notes import book_data
    sections = book_data(args.site_dir)

    report = {
        'version': 'arabic-cmap-fixture-20261022-v2',
        'published_read_only': original_pdfs(args.site_dir, sections),
        'controlled': fixture_tests(args.site_dir, args.output_dir, sections),
        'interpretation_limits': [
            'Searchable fixtures do not justify a production font swap: pages, shapes, anchors and word maps must remain compatible.',
            'Empty CMap entries are diagnostic only; nonempty mappings can also be wrong.',
            'PyMuPDF extraction/search do not certify Apple PDFKit, Acrobat, Android PDFium or PDF.js.',
            'Published PDFs, manifests, authorial text and personal word maps are never rewritten by this probe.',
        ],
    }
    (args.output_dir / 'report.json').write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    for name, data in report['published_read_only'].items():
        print('PUBLISHED', name, 'passages', data.get('passage_checks', []),
              'CMaps', [(f['font'], f.get('direct_pairs'), f.get('empty_direct_pairs'))
                        for f in data.get('font_cmaps', [])][:12], flush=True)
    for label, cases in report['controlled']['cases'].items():
        print('FIXTURE', label, [
            (item.get('section'), item.get('logical_sort_false', {}).get('probe_hits'),
             item.get('geometric_sort_true', {}).get('probe_hits'),
             item.get('native_search_for_hits'), item.get('probe_count'),
             item.get('first_page_fonts'), item.get('error')) for item in cases],
            flush=True)
    print('REPORT', args.output_dir / 'report.json', flush=True)


if __name__ == '__main__':
    main()
