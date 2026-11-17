"""Verify the full revised corpus against independent review records and canonical Quran data."""
import json,re
from pathlib import Path
p=Path('texts/al-zamakhshari/al-kashshaf')
e=json.loads((p/'edition.json').read_text());a=json.loads((p/'reviewed-corpus.json').read_text())
by={s['id']:s for b in a['books'] for s in b['segments']}
layers=[s for r in e['records'] for s in r['layers']]
assert len(e['records'])==123 and len(layers)==277 and len({s['id'] for s in layers})==277
q=json.loads((p/'quran.json').read_text())['verses']
for r in e['records']:
    for v in r['verses']:
        assert v['ar']==q[v['key']]['ar'],v['key']
        assert v['en']==q[v['key']]['en'],v['key']
    for s in r['layers']:
        assert s['ar']==by[s['id']]['arabic'],s['id']
        assert s['text']==by[s['id']]['text'],s['id']
        assert s['review']['new_scan_collation'] is False
        assert s['review']['final_scholarly_approval'] is False
        for copy in ['complete-reading-copy.txt','bilingual-reading-copy.txt','downloads/Kashshaf-Tibi-C07.txt']:
            assert s['text'] in (p/copy).read_text(),(s['id'],copy)
        assert s['ar'] in (p/'bilingual-reading-copy.txt').read_text(),s['id']
assert e['review']['arabic_lacunae']==['T113.06']
assert 'kingship (mulk, مُلْك) is general, whereas ownership (milk, مِلْك) is particular' in by['K001.12']['text']
assert 'فجوة في النقل الإلكتروني' in by['T113.06']['arabic']
assert 'والذي بعثك بالحق' in by['T108.04']['arabic']
assert len(json.loads((p/'review-ledger.json').read_text())['adopted_corrections'])==26
print('PASS: 277 reviewed bilingual sections; 123 Quran-first units; exact Quran data; cumulative text copies; explicit review limits.')
