#!/usr/bin/env python3
"""Validate five fresh, structure-preserving al-Daruri PDF builds.

Only replaces the five PDF binaries and their hash/page manifest. Never rewrites
reader HTML, navigation, study materials, personal annotations, or Arabic text.
"""
import argparse
import hashlib
import json
import shutil
from pathlib import Path
import fitz

NAMES = ('daruri.pdf', 'daruri-study.pdf', 'daruri-english.pdf',
         'daruri-arabic.pdf', 'daruri-arabic-vowelled.pdf')
MIN_PAGES = (150, 80, 50, 40, 40)


def validate_and_publish(source: Path, site: Path):
    manifest_file = site / 'pdf-editions-manifest.json'
    manifest = json.loads(manifest_file.read_text(encoding='utf-8'))
    report = {}
    for index, filename in enumerate(NAMES):
        pdf_path = source / filename
        meta_path = source / (filename + '.metadata.json')
        assert pdf_path.is_file() and meta_path.is_file(), filename
        meta = json.loads(meta_path.read_text(encoding='utf-8'))
        assert meta['main_text_validation']['ok'], filename + ' source notes'
        assert meta['footnote_pagination']['ok'], filename + ' pagination'
        if meta.get('application_footnote_pagination') is not None:
            assert meta['application_footnote_pagination']['ok'], filename + ' application pagination'
        with fitz.open(pdf_path) as document:
            pages = len(document)
            assert pages >= MIN_PAGES[index], (filename, pages)
            outline = document.get_toc()
            assert len(outline) >= 45, (filename, 'outline too short')
            destinations = meta['section_pages']
            assert len(destinations) >= 259, (filename, 'missing section map')
            assert all(1 <= int(page) <= pages for page in destinations.values()), filename
            link_count = sum(len(page.get_links()) for page in document)
            assert link_count > 100, (filename, link_count)
            if filename == 'daruri.pdf':
                text_pages = [p for p in document if 'Verse wording' in p.get_text()]
                assert text_pages, 'Verified Quran source excerpt missing'
                example = '\n'.join(p.get_text() for p in text_pages)
                assert example.count('Verse wording') >= 3, 'Expected three exact comparison excerpts'
                assert 'https://quran.com/' not in example, 'Raw Quran URL visibly printed'
                external = [link.get('uri', '') for p in text_pages for link in p.get_links()]
                assert any(u.startswith('https://quran.com/') for u in external), 'Source link URI lost'
            old_pages = manifest['files'][filename]['pages']
            # Source/contents structural changes beyond source-note typography
            # require separate editorial approval; do not silently publish them.
            assert abs(pages - old_pages) <= 4, (filename, 'unexpected reflow', old_pages, pages)
        sha = hashlib.sha256(pdf_path.read_bytes()).hexdigest()
        assert sha == meta['sha256'], filename + ' checksum mismatch'
        shutil.copy2(pdf_path, site / filename)
        record = manifest['files'][filename]
        record.update(sha256=sha, source_sha256=sha, size_bytes=pdf_path.stat().st_size, pages=pages)
        report[filename] = {'pages': pages, 'links': link_count, 'bookmarks': len(outline), 'sha256': sha}
    manifest['edition_date'] = '2026-10-21'
    manifest['release_revision'] = 'daruri9-source-notes-20261021'
    manifest['citation_presentation_revision'] = '20261021-source-notes1'
    manifest_file.write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    (source/'source-note-pdf-qa.json').write_text(json.dumps(report, indent=2)+'\n')
    print(json.dumps(report, indent=2))

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output-dir', type=Path, required=True)
    parser.add_argument('--site-dir', type=Path, required=True)
    args = parser.parse_args()
    validate_and_publish(args.output_dir, args.site_dir)