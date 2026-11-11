#!/usr/bin/env python3
"""Build a deterministic full Mahaimi handoff without altering the canonical text.

Run after build_mahaimi_exports.py and build_mahaimi_reader.py. The ZIP contains
the entire book directory, the relevant build/check tools, the catalogue and
the continuity protocol. External facsimiles remain referenced source witnesses.
"""
from pathlib import Path
import hashlib
import json
import zipfile

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'texts/al-mahaimi/mashra-al-khusus'
OUT = BASE / 'handoffs'
PREFIX = 'texts/al-mahaimi/mashra-al-khusus/'
TEXT_NAME = 'FULL_CUMULATIVE_STAGE13_REBUILD.md'
MANIFEST_NAME = 'STAGE13_REBUILD_MANIFEST.json'
ZIP_NAME = 'mahaimi-stage13-rebuild-full.zip'
EXCLUDED = {OUT / TEXT_NAME, OUT / MANIFEST_NAME, OUT / ZIP_NAME}
SOURCE_COMMIT = '9ae479aebe9e4fbd6eac81506dd4a9929c2eed70'
BASE_COMMIT = '2378a11a6c2e93e71b74518d9352d23fc3a9577b'
EXPECTED_CORPUS = 'b6767ba2831ba88946385da3f7119af9f8294a82751bb306271893f7f0e5861f'


def digest(binary):
    return hashlib.sha256(binary).hexdigest()


def record(path, binary):
    return {
        'path': path,
        'bytes': len(binary),
        'sha256': digest(binary),
        'git_blob_sha1': hashlib.sha1(b'blob ' + str(len(binary)).encode() + b'\0' + binary).hexdigest(),
    }


def build():
    OUT.mkdir(exist_ok=True)
    raw = (BASE / 'data/parallel.json').read_bytes()
    assert digest(raw) == EXPECTED_CORPUS, 'Unexpected change to the recovered source text'
    corpus = json.loads(raw)
    ledger = json.loads((BASE / 'data/coverage-stage13.json').read_text())
    pending = sorted(set(range(11, 233)) - set(ledger['commentary']['documented_scan_compared_pages']))
    pages = {p: e for e in corpus if e['edition_layer'] == 'commentary'
             for p in range(e['printed_pages'][0], e['printed_pages'][1] + 1)}
    intro = [
        '# Mahāʾimī / Qūnawī — full cumulative text and apparatus', '',
        'Stage 13 · clean rebuild from the published Stage 11 base · 11 November 2026', '',
        'This file includes the entire current bilingual text, all available editorial records,',
        'the historical source archive and machine-readable provenance. Earlier records are',
        'preserved as history; their older progress counts are superseded by the current ledger.',
        'The companion ZIP also contains the reader source, PDFs, builders and integrity checks.', '',
        f'Production baseline: `{BASE_COMMIT}`. Recovered text source: `{SOURCE_COMMIT}`.',
        f'Canonical corpus SHA-256: `{EXPECTED_CORPUS}`.', '',
        'Coverage: commentary 222/222 pages; appendix 33/33; 254 units; 444 bilingual pairs.',
        'Commentary review against available Arabic: 222/222. Documented commentary scan',
        'comparison: 98/222. Appendix scan inspection: 33/33. Independent manuscripts collated: 0.', '',
        'The p.43 marked synopsis, absent scan pages 113–114 and unfinished p.232 ending',
        'remain explicit. Completeness of the saved text does not settle those source problems.', '',
        '## Continuation point', '',
        f'The next unrecorded print comparison begins at printed p.{pending[0]}.',
        'Do not restart the translation. Compare the existing Arabic and English with the image.', '',
        'Preceding source ending:', '', pages[pending[0] - 1]['pairs'][-1]['ar'][-250:], '',
        'Next source opening:', '', pages[pending[0]]['pairs'][0]['ar'][:300], '',
        '## Complete bilingual text', '', (BASE / 'data/parallel.md').read_text(), '',
        '# Complete editorial and provenance archive', '',
    ]
    appendices = sorted(p for p in (BASE / 'editorial').rglob('*') if p.is_file())
    appendices += sorted(p for p in (BASE / 'data').rglob('*')
                         if p.is_file() and p.name not in {'parallel.json', 'parallel.md'})
    for path in appendices:
        try:
            content = path.read_text(encoding='utf-8')
        except UnicodeDecodeError:
            continue
        intro += ['---', '', f'## Preserved file: {path.relative_to(BASE).as_posix()}', '']
        if path.suffix == '.md':
            intro += [content, '']
        else:
            intro += ['````' + ('json' if path.suffix == '.json' else 'text'), content, '````', '']
    full_text = '\n'.join(intro).encode('utf-8')
    (OUT / TEXT_NAME).write_bytes(full_text)

    files = sorted(p for p in BASE.rglob('*') if p.is_file() and p not in EXCLUDED)
    supporting = [
        'tools/build_mahaimi_exports.py', 'tools/build_mahaimi_reader.py',
        'tools/build_mahaimi_downloads.py', 'tools/build_mahaimi_handoff.py',
        'tests/test_mahaimi_stage10.py', 'tests/qunawi_reader_qa.js',
        '.github/workflows/mahaimi-stage10-integrity.yml',
        'docs/TRANSLATION_CONTINUITY_PROTOCOL.md', 'texts/manifest.json',
    ]
    files += [ROOT / p for p in supporting]
    payload = {p.relative_to(ROOT).as_posix(): p.read_bytes() for p in files}
    payload[PREFIX + 'handoffs/' + TEXT_NAME] = full_text
    manifest = {
        'schema': 'gnamma-mahaimi-full-cumulative-v1',
        'release_id': 'stage13-rebuild-from-stage11-20261111',
        'stage': 13, 'date': '2026-11-11',
        'production_base_commit': BASE_COMMIT,
        'recovered_source_commit': SOURCE_COMMIT,
        'canonical_corpus_sha256': EXPECTED_CORPUS,
        'canonical_text_unchanged_from_recovered_stage13': True,
        'new_translation_pages_in_this_rebuild': 0,
        'new_scan_comparisons_in_this_rebuild': 0,
        'counts': ledger['counts'],
        'source_sigla': {'B2008': 'al-Mazīdī 2008 electronic transcription and acquired print scan',
                         'A1421': 'Āshtiyānī Qom edition, identified but not independently collated',
                         'L5675': 'Leiden Or.5675, identified but not independently collated'},
        'grade': ledger['edition']['critical_status'],
        'remaining_commentary_scan_pages': pending,
        'scan_missing_pages': [113, 114],
        'continuation': {'printed_page': pending[0], 'task': 'Compare existing text with print image',
                         'preceding_source_ending': pages[pending[0]-1]['pairs'][-1]['ar'][-250:],
                         'restart_words': pages[pending[0]]['pairs'][0]['ar'][:300]},
        'previous_stage_links': ['editorial/HANDOFF_STAGE11.md',
                                  'editorial/HANDOFF_STAGE13_RECOVERY.md',
                                  'editorial/STAGE13_RECOVERY_AND_QA.md'],
        'scope': 'All available Mahaimi project files and the full cumulative bilingual text; external print/manuscript witnesses are referenced, not republished.',
        'external_dependencies': ['Cross-reader Qunawi QA additionally uses the separate sadr-al-din-al-qunawi/al-nusus project in the repository.',
                                   'Arabic display uses system fallbacks if the optional shared Arabic font stylesheet is unavailable.'],
        'publication': 'Source package snapshot; public deployment is verified separately from this archive.',
        'files': [record(p, b) for p, b in sorted(payload.items())],
    }
    manifest_bytes = (json.dumps(manifest, ensure_ascii=False, indent=2) + '\n').encode()
    (OUT / MANIFEST_NAME).write_bytes(manifest_bytes)
    payload[PREFIX + 'handoffs/' + MANIFEST_NAME] = manifest_bytes
    with zipfile.ZipFile(OUT / ZIP_NAME, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for name, binary in sorted(payload.items()):
            info = zipfile.ZipInfo(name, date_time=(2026, 11, 11, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            z.writestr(info, binary, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    with zipfile.ZipFile(OUT / ZIP_NAME) as z:
        assert z.testzip() is None
        for item in manifest['files']:
            binary = z.read(item['path'])
            assert len(binary) == item['bytes'] and digest(binary) == item['sha256'], item['path']
        assert z.read(PREFIX + 'data/parallel.json') == raw
    assert all(e['id'].encode() in full_text for e in corpus)
    print(json.dumps({'pass': True, 'archive_files': len(payload), 'bytes': (OUT / ZIP_NAME).stat().st_size,
                      'archive_sha256': digest((OUT / ZIP_NAME).read_bytes()),
                      'full_text_bytes': len(full_text), 'unit_ids_in_full_text': len(corpus),
                      'canonical_corpus_sha256': EXPECTED_CORPUS}))


if __name__ == '__main__':
    build()
