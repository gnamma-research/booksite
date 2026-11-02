#!/usr/bin/env python3
"""Write versioned, reproducible source-to-PDF manifests for both Tahdhīb parts.

A PDF is *published* only after byte-hash and page-count verification; the
source's status flag remains a textual limitation, not a verified manuscript
claim.
"""
import hashlib, json, pathlib, argparse
from pypdf import PdfReader
parser=argparse.ArgumentParser()
parser.add_argument('--root',default='texts/al-taftazani')
args=parser.parse_args()
root=pathlib.Path(args.root)
for work_slug, short in [('tahdhib-al-kalam','kalam'),('tahdhib-al-mantiq','logic')]:
    base=root/work_slug/'edition'
    src=base/'data.js'
    raw=src.read_bytes()
    text=raw.decode('utf-8').strip()
    prefix='window.GNAMMA_CRITICAL_CORPUS='
    if not text.startswith(prefix):
        raise ValueError(f'Unexpected source header: {src}')
    corpus=json.loads(text[len(prefix):].rstrip(';\n '))
    n=len(corpus['units'])
    assert n == (1044 if short=='kalam' else 19), (short,n)
    files=[]
    for name,lang in [('parallel','bilingual'),('ar-only','arabic'),('en-only','english')]:
        file=base/'pdfs'/f'tahdhib-{short}-{name}.pdf'
        blob=file.read_bytes()
        assert len(blob)>10_000
        pdf=PdfReader(str(file))
        assert len(pdf.pages)>0
        files.append({'name':file.name,'purpose':lang,'sha256':hashlib.sha256(blob).hexdigest(),
                      'bytes':len(blob),'a4_pages':len(pdf.pages),'href':'pdfs/'+file.name})
    manifest={
        'schema':'gnamma-tahdhib-edition-publication-v1',
        'book':corpus['work'],
        'source':'data.js',
        'source_sha256':hashlib.sha256(raw).hexdigest(),
        'source_bytes':len(raw),
        'source_witness':corpus.get('witness',''),
        'editorial_status':corpus['editorial_status'],
        'unit_count':n,
        'page_or_division_count':len({unit['page'] for unit in corpus['units']}),
        'navigation_kind':corpus.get('navigation_kind','printed-page'),
        'unresolved_printed_pages_or_divisions':corpus.get('pending_pages',[]),
        'files':files,
        'description':'SHA-256 inventories are reproducibility records, NOT certificates of authorial fidelity or independent manuscript collation.'
    }
    target=base/'pdfs'/'edition_manifest.json'
    target.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(short, 'SOURCE',manifest['source_sha256'],'PDFS',[(x['name'],x['a4_pages']) for x in files])
