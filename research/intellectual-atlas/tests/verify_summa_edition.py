"""GNAMMA Avicennian Summa: self-contained bilingual critical reader checks.

Run from the repository root:
    python research/intellectual-atlas/tests/verify_summa_edition.py

This tests published content integration, navigation and readable source
materials. It cannot certify historical arguments or manuscript variants.
"""
from pathlib import Path
from html.parser import HTMLParser
import re, sys

root=Path(__file__).resolve().parents[1]
summa=root/'avicennian-summa'
chapter_dir=summa/'chapters'
reader=(chapter_dir/'reader.html').read_text(encoding='utf-8')
landing=(summa/'index.html').read_text(encoding='utf-8')
index=(chapter_dir/'index.html').read_text(encoding='utf-8')
audit=(summa/'SYSTEMATIC_FINDINGS_AND_EVIDENCE_AUDIT.md').read_text(encoding='utf-8')
register=(summa/'SOURCE_REGISTER.md').read_text(encoding='utf-8')
release=(root/'build_release.py').read_text(encoding='utf-8')

mds=sorted(chapter_dir.glob('[0-9][0-9]-*.md'))
assert len(mds)==10, f'Expected 10 translated chapters, got {len(mds)}'
assert (chapter_dir/'reader.html').stat().st_size>120000
assert all(p.stat().st_size>8000 for p in mds), 'A chapter appears truncated'
assert all(re.search(r'[\u0600-\u06ff]',p.read_text(encoding='utf-8')) for p in mds)
assert all('http' in p.read_text(encoding='utf-8') for p in mds), 'Primary locator missing'
assert 'Twenty-domain' in audit or 'Twenty domains' in audit
assert '| 20.' in audit
assert 'manuscript' in reader.lower() and 'not' in reader.lower()

class Collector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.articles=[]
        self.ids=[]
        self.hashes=[]
        self.rtl=0
        self.links=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if a.get('id'):self.ids.append(a['id'])
        if tag=='article' and a.get('id','').startswith('ch'):self.articles.append(a['id'])
        if a.get('dir')=='rtl':self.rtl+=1
        if tag=='a':
            u=a.get('href','')
            self.links.append(u)
            if u.startswith('#'):self.hashes.append(u[1:])

p=Collector();p.feed(reader)
ids=['ch'+str(i).zfill(2) for i in range(1,11)]
assert p.articles==ids, f'Article order {p.articles}'
assert len(p.ids)==len(set(p.ids)), 'Duplicate HTML ids'
assert p.rtl>=18, 'Missing Arabic RTL typography'
assert set(p.hashes)<=set(p.ids), 'Broken internal chapter hash'
assert all('reader.html#'+x in index for x in ids), 'Index has missing reader routes'
assert all('id="'+x+'"' in reader for x in ids), 'Chapter articles missing'
assert all(p.name in reader for p in mds), 'Source Markdown links missing'
assert all(p.name in release for p in mds), 'Offline ZIP source list incomplete'
assert 'chapters/reader.html' in landing and 'chapters/reader.html' in register
assert 'chapters/reader.html' in release
assert (summa/'primary-translation-causation.md').is_file()
assert (summa/'AT_AVICENNIAN_FINDINGS_1.md').is_file()
assert (summa/'HANDOFF_CURRENT.md').is_file()
assert all((summa/'handoffs'/f'STAGE_{n:02d}_{suffix}.md').is_file() for n,suffix in ((1,'CORPUS_AUDIT'),(2,'TEN_CHAPTER_EDITION'),(3,'RELEASE_HANDOFF')))
assert 'ch10' in reader and 'q.104' in reader
assert 'HANDOFF_CURRENT.md' in release

# Stage 4: verify actual complete bounded primary-source translation files
# and their public/offline integration, without implying manuscript certification.
fascicles={
    'fascicle-e':'PRIMARY_TRANSLATION_FASCICLE_E_AVICENNA_VI1.md',
    'fascicle-b':'PRIMARY_TRANSLATION_FASCICLE_B_AVICENNA_VI2.md',
    'fascicle-d':'PRIMARY_TRANSLATION_FASCICLE_D_AVICENNA_IX5.md',
    'fascicle-c':'PRIMARY_TRANSLATION_FASCICLE_C_LAHIJI_PREFERENCE.md',
}
primary=(summa/'primary-translations.html').read_text(encoding='utf-8')
assert primary.startswith('<!doctype html>'), 'Missing public primary translation reader'
assert primary.count('<article id="fascicle-')==4, 'Expected four complete primary fascicle articles'
assert primary.count('</article>')==4, 'Malformed fascicle article closure'
assert all(f'id="{id_}"' in primary and f'href="#{id_}"' in primary
           for id_ in fascicles), 'Missing fascicle navigation'
assert len(primary)>85000, 'Primary translation reader appears truncated'
assert '§23 [263]' in primary and '§19.' in primary and '§17 [413]' in primary
assert '§24.10' in primary, 'One or more translation endings not present'
assert all((summa/name).is_file() and (summa/name).stat().st_size>12000
           for name in fascicles.values()), 'A source translation file missing or incomplete'
assert all('primary-translations.html' in page
           for page in (landing,index,reader)), 'Public reader navigation incomplete'
assert all(name in release for name in fascicles.values()), 'Offline source file omitted'
assert 'primary-translations.html' in release, 'Offline HTML reader omitted'
assert 'STAGE_04_PRIMARY_TRANSLATION_FASCICLES.md' in release
assert (summa/'handoffs'/'STAGE_04_PRIMARY_TRANSLATION_FASCICLES.md').is_file()
assert 'AV-01E' in register and 'AV-09C' in register

print({
    'critical_chapters':len(mds),
    'complete_bounded_fascicles':len(fascicles),
    'html_article_ids':len(p.articles),
    'rtl_blocks':p.rtl,
    'links':len(p.links),
    'whole_system_domains':20,
    'reader_bytes':(chapter_dir/'reader.html').stat().st_size,
    'status':'static integration passed; philological collation is not certified'
})
