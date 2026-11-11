#!/usr/bin/env python3
"""Build the self-contained Mahaimi reader from the canonical corpus and current ledger.

Usage: python tools/build_mahaimi_reader.py [--ledger data/coverage-stage12.json]
The generated index embeds its CSS, JS and data so Download → Offline reader works.
No corpus text is edited by this builder.
"""
import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'texts/al-mahaimi/mashra-al-khusus'


def embedded_json(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')


def build(ledger_path=None, output=None):
    corpus = json.loads((BASE / 'data/parallel.json').read_text(encoding='utf-8'))
    if ledger_path:
        path = Path(ledger_path)
        if not path.is_absolute():
            path = BASE / path
    else:
        candidates = list((BASE / 'data').glob('coverage-stage*.json'))
        path = max(candidates, key=lambda p: int(re.search(r'stage(\d+)', p.name).group(1))) if candidates else None
    ledger = json.loads(path.read_text(encoding='utf-8')) if path else {}
    commentary = [x for x in corpus if x.get('edition_layer') == 'commentary']
    commentary_pages = {n for x in commentary for n in range(x['printed_pages'][0], x['printed_pages'][1] + 1)}
    arabic_pages = {n for x in commentary if any(p.get('ar', '').strip() for p in x.get('pairs', [])) for n in range(x['printed_pages'][0], x['printed_pages'][1] + 1)}
    english_pages = {n for x in commentary if any(p.get('en', '').strip() for p in x.get('pairs', [])) for n in range(x['printed_pages'][0], x['printed_pages'][1] + 1)}
    proofs = {n for x in corpus if x.get('edition_layer') == 'qunawi_original_proof' and any(p.get('ar', '').strip() for p in x.get('pairs', [])) for n in range(x['printed_pages'][0], x['printed_pages'][1] + 1)}
    proof_english = {n for x in corpus if x.get('edition_layer') == 'qunawi_original_proof' and any(p.get('en', '').strip() for p in x.get('pairs', [])) for n in range(x['printed_pages'][0], x['printed_pages'][1] + 1)}
    summary = {
        'stage': str(ledger.get('stage', 'working')),
        'date': ledger.get('date', ''),
        'entries': len(corpus),
        'commentary_pages': len(commentary_pages),
        'commentary_english_pages': len(english_pages),
        'commentary_arabic_pages': len(arabic_pages),
        'commentary_missing_arabic': sorted(commentary_pages - arabic_pages),
        'appendix_arabic_pages': len(proofs),
        'appendix_english_pages': len(proof_english),
        'appendix_total_pages': 33,
        'manuscript_collated_pages': ledger.get('edition', {}).get('manuscripts_collated', 0),
        'ledger_path': str(path.relative_to(BASE)) if path else '',
        'handoff_path': 'editorial/HANDOFF.md',
    }
    shell = (BASE / 'reader-shell.html').read_text(encoding='utf-8')
    replacements = {
        '__READER_STYLES__': (BASE / 'reader.css').read_text(encoding='utf-8'),
        '__READER_SCRIPT__': (BASE / 'reader.js').read_text(encoding='utf-8'),
        '__CORPUS_JSON__': embedded_json(corpus),
        '__COVERAGE_JSON__': embedded_json({'summary': summary, 'ledger': ledger}),
    }
    for token, value in replacements.items():
        assert shell.count(token) == 1, f'Expected one {token}'
        shell = shell.replace(token, value)
    target = Path(output) if output else BASE / 'index.html'
    if not target.is_absolute():
        target = BASE / target
    target.write_text(shell, encoding='utf-8')
    print(json.dumps({'reader': str(target), 'summary': summary}, ensure_ascii=False))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ledger')
    parser.add_argument('--output', help='Optional preview path; default is the published index.html')
    args = parser.parse_args()
    build(args.ledger, args.output)
