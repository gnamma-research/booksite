#!/usr/bin/env python3
"""Verify published Daruri PDFs and their section-page metadata without guesswork.

--repair can update checksum, size and link totals only after all 259 named
PDF section destinations exactly match the existing verified section map.
No PDF content is rewritten. All five editions validate before any write.
"""
import argparse
import hashlib
import json
import os
import tempfile
from pathlib import Path

import fitz

PDF_FILES = (
    'daruri.pdf', 'daruri-study.pdf', 'daruri-english.pdf',
    'daruri-arabic.pdf', 'daruri-arabic-vowelled.pdf',
)
SECTION_IDS = tuple(str(i) for i in range(1, 259)) + ('colophon',)


def inspect(site: Path):
    manifest = json.loads((site / 'pdf-editions-manifest.json').read_text(encoding='utf-8'))
    prepared = []
    for filename in PDF_FILES:
        published = site / filename
        meta_path = site / 'build' / 'release' / (filename + '.metadata.json')
        data = published.read_bytes()
        sha = hashlib.sha256(data).hexdigest()
        published_identity = manifest['files'][filename]
        if sha != published_identity['sha256']:
            raise ValueError(f'{filename}: published PDF checksum disagrees with manifest')
        if len(data) != published_identity['size_bytes']:
            raise ValueError(f'{filename}: published PDF size disagrees with manifest')
        meta = json.loads(meta_path.read_text(encoding='utf-8'))
        if meta.get('filename') != filename:
            raise ValueError(f'{filename}: source-page metadata refers to a different PDF')
        with fitz.open(published) as pdf:
            if pdf.page_count != int(published_identity['pages']):
                raise ValueError(f'{filename}: published PDF page count disagrees with manifest')
            names = pdf.resolve_names()
            failures = []
            for section_id in SECTION_IDS:
                dest = names.get('section-' + section_id)
                actual_page = dest.get('page', -1) if isinstance(dest, dict) else -1
                expected_page = meta.get('section_pages', {}).get(section_id)
                if actual_page < 0 or expected_page is None or int(expected_page) != actual_page + 1:
                    failures.append((section_id, expected_page, actual_page + 1 if actual_page >= 0 else 'missing'))
            if failures:
                raise ValueError(
                    f'{filename}: {len(failures)} source-page destinations changed or missing, '
                    f'first five: {failures[:5]}. Rebuild the complete page map; never patch checksums.'
                )
            toc_count = len(pdf.get_toc())
            link_count = sum(len(page.get_links()) for page in pdf)
            if toc_count < 45 or link_count < 100:
                raise ValueError(f'{filename}: required bookmarks/source links missing')
            meta['sha256'] = sha
            meta['bytes'] = len(data)
            meta['pages'] = pdf.page_count
            meta['links'] = link_count
            meta['bookmarks'] = toc_count
            meta['source_map_verified'] = {
                'pdf_sha256': sha,
                'method': 'All 259 named PDF section destinations match recorded source pages',
                'count': len(SECTION_IDS),
            }
            prepared.append((meta_path, meta, filename, sha))
    return prepared


def run(site: Path, repair: bool):
    prepared = inspect(site)  # Validate every edition before modifying any file.
    if not repair:
        stale = [filename for meta_path, _meta, filename, sha in prepared
                 if json.loads(meta_path.read_text(encoding='utf-8')).get('sha256') != sha]
        if stale:
            raise ValueError(
                f'Personal-export source metadata out of date for {stale}. '
                'Run --repair only after all destinations match.'
            )
        print('PASS: five PDF identities and 259 section destinations per edition')
        return
    for meta_path, meta, filename, sha in prepared:
        if json.loads(meta_path.read_text(encoding='utf-8')) == meta:
            print(f'PASS unchanged {filename}: {sha[:12]}')
            continue
        with tempfile.NamedTemporaryFile('w', encoding='utf-8',
                                         dir=meta_path.parent, delete=False) as tmp:
            tmp.write(json.dumps(meta, ensure_ascii=False, indent=2) + '\n')
            temp_name = tmp.name
        try:
            os.replace(temp_name, meta_path)
        finally:
            if os.path.exists(temp_name):
                os.unlink(temp_name)
        print(f'UPDATED verified source metadata for {filename}: {sha[:12]}')
    run(site, repair=False)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--site-dir', type=Path,
                        default=Path(__file__).resolve().parents[1])
    parser.add_argument('--repair', action='store_true')
    args = parser.parse_args()
    try:
        run(args.site_dir, args.repair)
    except (OSError, ValueError, KeyError, fitz.FileDataError) as exc:
        parser.exit(1, 'FAIL: ' + str(exc) + '\n')
