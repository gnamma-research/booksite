#!/usr/bin/env python3
"""Check the complete canonical edition, its source limits and concordance.

The filename is retained because the existing repository workflow invokes it.
These checks validate edition integrity, not the truth of every translation.
"""
import json
import re
import hashlib
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'texts/al-mahaimi/mashra-al-khusus'
data=json.loads((BASE/'data/parallel.json').read_text())
ledger_path=max((BASE/'data').glob('coverage-stage*.json'),key=lambda p:int(re.search(r'stage(\d+)',p.name).group(1)))
ledger=json.loads(ledger_path.read_text())
html=(BASE/'index.html').read_text()
match=re.search(r'<script id="corpus-json" type="application/json">([\s\S]*?)</script>',html)
assert match and json.loads(match.group(1))==data, 'Reader corpus differs from canonical text'
by_id={e['id']:e for e in data}
assert len(by_id)==len(data)==254
assert all(e['edition_layer'] in ('commentary','qunawi_original_proof') for e in data)
commentary=[e for e in data if e['edition_layer']=='commentary']
appendix=[e for e in data if e['edition_layer']=='qunawi_original_proof']
assert len(commentary)==221 and len(appendix)==33
pages={}
for e in commentary:
    for p in range(e['printed_pages'][0],e['printed_pages'][1]+1):
        assert p not in pages, f'Duplicate commentary page {p}'
        pages[p]=e
assert set(pages)==set(range(11,233))
assert {e['printed_pages'][0] for e in appendix}==set(range(235,268))
assert all(e['printed_pages'][0]==e['printed_pages'][1] for e in appendix)
assert all(pair.get('ar','').strip() and pair.get('en','').strip() for e in data for pair in e['pairs'])
assert all(e['heading_is_editorial'] for e in data)
assert not ledger['commentary']['arabic_missing'] and not ledger['commentary']['english_missing']
assert ledger['counts']['commentary_arabic_pages']==ledger['counts']['commentary_english_pages']==222
assert ledger['counts']['appendix_arabic_pages']==ledger['counts']['appendix_english_pages']==33
assert ledger['edition']['manuscripts_collated']==0
assert set(ledger['commentary']['reviewed_pages'])|set(ledger['commentary']['review_pending_pages'])==set(range(11,233))
assert not (set(ledger['commentary']['reviewed_pages'])&set(ledger['commentary']['review_pending_pages']))
assert ledger['counts']['commentary_pages_reviewed_against_arabic']==len(ledger['commentary']['reviewed_pages'])
assert ledger['counts']['commentary_pages_with_documented_scan_comparison']==len(ledger['commentary']['documented_scan_compared_pages'])
assert set(ledger['commentary']['reviewed_pages'])==set(range(11,233)), 'Release still has unreviewed commentary pages'
assert not ledger['commentary']['review_pending_pages']

source_map=json.loads((BASE/'data/print-page-map-stage12.json').read_text())
mapped={x['printed_page']:x for x in source_map['pages']}
assert {p for p,x in mapped.items() if not x['available']}=={113,114}
assert mapped[11]['pdf_page']==12 and mapped[232]['pdf_page']==231 and mapped[267]['pdf_page']==266
assert set(mapped)==set(range(11,233))|set(range(235,268))

concordance=json.loads((BASE/'data/concordance-stage12.json').read_text())['links']
assert len(concordance)==ledger['counts']['shared_wording_links']
for link in concordance:
    a=by_id[link['appendix_id']];b=by_id[link['commentary_id']]
    assert a['edition_layer']=='qunawi_original_proof' and b['edition_layer']=='commentary'
    assert link['longest_shared_sequence_words']>=12
    assert any(x['target_id']==b['id'] for x in a['concordance_links'])
    assert any(x['target_id']==a['id'] for x in b['appendix_links'])
for e in data:
    for key in ('concordance_links','matn_links','appendix_links'):
        assert all(x['target_id'] in by_id for x in e.get(key,[])), 'Dangling source link'
archive=json.loads((BASE/'data/legacy-stage11-qunawi.json').read_text())
assert len(archive['entries'])==54
assert not ({e['id'] for e in archive['entries']}&set(by_id))

ending='\n'.join(p['ar'] for p in pages[232]['pairs'])
assert 'فإذا ظهرت آثار الوجود بشرط' in ending, 'The incomplete ending must remain visible'
assert 'في الوجود' in ending and 'للوجود' in ending, 'Do not harmonize lemma and gloss'
assert 'توجب' in '\n'.join(p['ar'] for p in pages[230]['pairs'])
assert 'يوجب' in by_id['QNW-WIT267']['pairs'][0]['ar']
manifest=json.loads((ROOT/'texts/manifest.json').read_text())
entry=next(e for e in manifest['texts'] if e['id']=='mahaimi-mashra-khusus')
assert entry['latest_working_stage']==ledger['stage'] and entry['section_count']==len(data)
assert entry['commentary_arabic_pending_printed_pages']==[]
assert entry['next_untranslated_printed_page'] is None
assert ledger_path.name in entry['page_coverage_manifest_url']
download=BASE/'downloads'
assert (download/'mahaimi-corpus.json').read_bytes()==(BASE/'data/parallel.json').read_bytes(), 'Structured download is stale'
assert (download/'mahaimi-bilingual.md').read_bytes()==(BASE/'data/parallel.md').read_bytes(), 'Markdown download is stale'
pdf_manifest=json.loads((download/'pdf-build-manifest.json').read_text())
assert pdf_manifest['canonical_corpus_sha256']==hashlib.sha256((BASE/'data/parallel.json').read_bytes()).hexdigest(), 'PDFs use an older corpus'
assert {x['file'] for x in pdf_manifest['files']}=={'mahaimi-english.pdf','mahaimi-bilingual.pdf','mahaimi-arabic.pdf'}
for record in pdf_manifest['files']:
    binary=(download/record['file']).read_bytes()
    assert binary.startswith(b'%PDF-') and len(binary)==record['bytes'] and record['pages']>0, 'Invalid PDF download'
    assert hashlib.sha256(binary).hexdigest()==record['sha256'], 'PDF digest mismatch'
print(json.dumps({'pass':True,'entries':len(data),'commentary_pages':len(pages),'appendix_pages':len(appendix),'shared_wording_links':len(concordance),'scan_missing_pages':[113,114],'manuscripts_collated':0}))
