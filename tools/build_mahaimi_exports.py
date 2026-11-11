#!/usr/bin/env python3
"""Regenerate the readable and structured downloads from the canonical corpus."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'texts/al-mahaimi/mashra-al-khusus'


def build():
    source = BASE / 'data/parallel.json'
    corpus = json.loads(source.read_text(encoding='utf-8'))
    ledgers = list((BASE / 'data').glob('coverage-stage*.json'))
    current = max(ledgers, key=lambda p: int(re.search(r'stage(\d+)', p.name).group(1)))
    ledger = json.loads(current.read_text(encoding='utf-8'))
    counts = ledger['counts']
    bits = ['# Al-Mahāʾimī: Mashraʿ al-khuṣūṣ, with Qūnawī’s al-Nuṣūṣ', '',
            f"Stage {ledger['stage']} · {ledger['date']} · Source-based working edition", '',
            'Arabic and English cover commentary pp.11–232 and the separate Qūnawī appendix pp.235–267.',
            f"Commentary translation review: {counts['commentary_pages_reviewed_against_arabic']}/222 pages. Documented commentary scan comparison: {counts['commentary_pages_with_documented_scan_comparison']}/222 pages.",
            'No independent manuscript collation is claimed. Printed pp.113–114 are absent from the acquired scan. The incomplete final commentary sentence on p.232 remains unreconstructed.', '']
    last_layer = None
    for entry in corpus:
        if entry['edition_layer'] != last_layer:
            last_layer = entry['edition_layer']
            bits += ['# ' + ('Al-Mahāʾimī’s commentary' if last_layer == 'commentary' else 'Qūnawī’s separate original'), '']
        a, b = entry['printed_pages']
        label = str(a) if a == b else f'{a}–{b}'
        bits += [f"## {entry['id']} · Printed p. {label} · {entry['title']}", '',
                 f"Source: {entry['source_url']}", '', f"Speaker: {entry.get('speaker_layer', '')}", '']
        for pair in entry['pairs']:
            bits += [f"### Arabic · passage {pair['sequence']}", '', pair['ar'], '',
                     f"### English · passage {pair['sequence']}", '', pair['en'], '']
        if entry.get('editorial_note'):
            bits += ['### Editorial note', '', entry['editorial_note'], '']
        links = entry.get('concordance_links', []) + entry.get('matn_links', []) + entry.get('appendix_links', [])
        if links:
            bits += ['Related passage IDs: ' + ', '.join(dict.fromkeys(x['target_id'] for x in links)), '']
    text = '\n'.join(bits).rstrip() + '\n'
    downloads = BASE / 'downloads'
    downloads.mkdir(exist_ok=True)
    (BASE / 'data/parallel.md').write_text(text, encoding='utf-8')
    (downloads / 'mahaimi-bilingual.md').write_text(text, encoding='utf-8')
    (downloads / 'mahaimi-corpus.json').write_bytes(source.read_bytes())
    print(json.dumps({'stage': ledger['stage'], 'entries': len(corpus), 'bilingual_pairs': sum(len(e['pairs']) for e in corpus), 'markdown_bytes': len(text.encode('utf-8'))}))


if __name__ == '__main__':
    build()
