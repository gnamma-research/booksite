#!/usr/bin/env python3
"""Verify the current saved Nihayat continuation without replaying old work.

Checks file identity, unit accounting, integrated review receipts and publication
status. It does not certify scholarly correctness. The historical recovery guard
remains available for the original Stage IX snapshot only.
"""
import hashlib
import json
import subprocess
import sys
from pathlib import Path

HIKMA = Path(__file__).resolve().parents[1]
ROOT = HIKMA.parents[1]


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def main():
    problems = []
    state = read(HIKMA / 'audits/nihayat4-current-state.json')
    current = state.get('current', state.get('recovered', {}))
    manifest_path = current.get('checkpointManifest')
    if not manifest_path:
        print(json.dumps({'status': 'checkpoint-not-finalized',
                          'instruction': 'Read current state and inspect saved work. Do not reset to a historical recovery manifest.'}, indent=2))
        return 2
    manifest = read(HIKMA / manifest_path)
    for row in manifest['files']:
        p = ROOT / row['path']
        if not p.is_file():
            problems.append('Missing checkpoint file: ' + row['path'])
        elif sha(p.read_bytes()) != row['sha256']:
            problems.append('File changed after checkpoint: ' + row['path'])

    books = {}
    for slug, expected in current['pairedUnitsByBook'].items():
        b = read(HIKMA / slug / 'data/book.json')
        books[slug] = b
        ids = [u['id'] for u in b['units']]
        if len(ids) != expected or len(set(ids)) != expected:
            problems.append('Unit count or duplicate identifier: ' + slug)
        if any(not u.get('arabic', '').strip() or not u.get('english', '').strip() for u in b['units']):
            problems.append('Missing bilingual body: ' + slug)
    m_ids = {u['id'] for u in books['muzaffar-al-mantiq']['units']}
    if not {f'M-V-{i:02d}' for i in range(1, 41)} <= m_ids:
        problems.append('Recovered Muzaffar Book V units have been lost')

    n = {u['id']: u for u in books['nihayat-al-hikma']['units']}
    register = read(HIKMA / 'audits/nihaya-external-comparison-register.json')
    rows = register['units']
    if {r['unitID'] for r in rows} != set(n) or len(rows) != len(n):
        problems.append('External comparison register must contain each Nihaya unit exactly once')
    completed = {r['unitID'] for r in rows if r['comparisonComplete']}
    integrated = {r['unitID'] for r in rows if r['findingsIncorporated']}
    if not integrated <= completed:
        problems.append('An incorporated unit lacks a completed comparison')
    for key, actual in [('nihayaExternalComparisonRecords', len(completed)),
                        ('nihayaExternalComparisonsIntegrated', len(integrated)),
                        ('nihayaExternalComparisonsRemaining', len(n) - len(completed))]:
        if current.get(key) != actual:
            problems.append('Stale current-state count: ' + key)
    if set(state['nextWork']['remainingExternalUnitIds']) != set(n) - completed:
        problems.append('Restart queue includes completed units or omits pending units')
    for r in rows:
        if not r['findingsIncorporated']:
            continue
        u = n[r['unitID']]
        if r.get('currentArabicSha256') != sha(u['arabic'].encode()) or r.get('currentEnglishSha256') != sha(u['english'].encode()):
            problems.append('Integrated receipt does not match current text: ' + r['unitID'])
        if not r.get('evidenceReports'):
            problems.append('Integrated receipt lacks evidence: ' + r['unitID'])
        for evidence in r.get('evidenceReports', []):
            if not (HIKMA / evidence.split('#', 1)[0]).is_file():
                problems.append('Evidence file missing: ' + evidence)
        if r.get('independentHumanCertification') is not False or r.get('manuscriptCollation') is not False:
            problems.append('Unsupported source-grade claim: ' + r['unitID'])
    receipt = read(HIKMA / 'audits/nihaya-stage10-integration-receipt.json')
    receipt_ids = [r['unitID'] for r in receipt['units']]
    if len(receipt_ids) != len(set(receipt_ids)):
        problems.append('A unit has been incorporated twice')
    if set(receipt_ids) | {'N-IX-09'} != integrated:
        problems.append('Register does not agree with immutable unit receipts')
    for r in receipt['units']:
        u = n[r['unitID']]
        if sha(u['arabic'].encode()) != r['afterArabicSha256'] or sha(u['english'].encode()) != r['afterEnglishSha256']:
            problems.append('Text changed after incorporation: ' + r['unitID'])
    for r in receipt['plans']:
        p = HIKMA / r['path']
        if not p.is_file() or sha(p.read_bytes()) != r['sha256']:
            problems.append('Saved plan missing or changed: ' + r['path'])
    decisions = receipt.get('decisions', [])
    decision_ids = [d['decisionID'] for d in decisions]
    if len(decision_ids) != len(set(decision_ids)):
        problems.append('A Stage X decision has been recorded twice')

    pdf_status = 'not-source-matched'
    pdf_manifest = HIKMA / 'editions/manifest.json'
    if pdf_manifest.exists():
        editions = read(pdf_manifest).get('files', [])
        matches = 0
        for e in editions:
            slug = e['filename'].split('-' + e['mode'] + '-A4.pdf')[0]
            source = HIKMA / slug / 'data/book.json'
            p = HIKMA / 'editions' / e['filename']
            ok = source.exists() and e.get('source_sha256') == sha(source.read_bytes()) and p.exists() and e.get('sha256') == sha(p.read_bytes())
            if e.get('supplement_sha256'):
                ok = ok and e['supplement_sha256'] == sha((HIKMA / 'nihayat-al-hikma/data/editorial-supplement.json').read_bytes())
            matches += bool(ok)
        pdf_status = f'{matches}/{len(editions)} source-matched files in this checkout'
    try:
        head = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    except (OSError, subprocess.CalledProcessError):
        head = None
    print(json.dumps({'status': 'failed' if problems else 'passed',
                      'scope': 'Current file identity and continuation accounting; not scholarly or publication certification',
                      'checkoutCommit': head,
                      'recordedContentCommit': state['preservation'].get('contentCommit'),
                      'filesChecked': len(manifest['files']),
                      'pairedUnits': {k: len(v['units']) for k, v in books.items()},
                      'externalCompared': len(completed),
                      'externalIncorporated': len(integrated),
                      'externalPending': len(n) - len(completed),
                      'nextNewUnit': state['nextWork'].get('firstNewExternalComparison'),
                      'pdfStatus': pdf_status,
                      'publication': state.get('published', {}),
                      'problems': problems}, ensure_ascii=False, indent=2))
    return bool(problems)


if __name__ == '__main__':
    sys.exit(main())
