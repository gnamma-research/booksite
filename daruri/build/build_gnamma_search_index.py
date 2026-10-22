#!/usr/bin/env python3
"""Build a read-only, provenance-aware companion index for the published Mustasfa working reader.
No private annotations are read, stored, or uploaded. English coverage is explicitly partial.
"""
from pathlib import Path
import json
import re
root=Path(__file__).resolve().parents[2]
mustasfa=root/'texts/al-ghazali/al-mustasfa'
src=(mustasfa/'assets/data.js').read_text(encoding='utf-8')
match=re.fullmatch(r'\s*window\.MUSTASFA_DATA\s*=\s*(\{.*\})\s*;\s*',src,re.S)
if not match: raise RuntimeError('MUSTASFA_DATA does not have its expected assignment format')
data=json.loads(match.group(1))
arabic=json.loads((root/'arabic/full-arabic-pages.json').read_text(encoding='utf-8'))
if arabic.get('schema')!='gnamma-mustasfa-arabic-v1':raise RuntimeError('Arabic witness schema mismatch')
out=[]
for s in data['sections']:
    out.append(dict(id='translated:'+s['id'],type='other',subtype='Selected bilingual passage',
        section=s['id'],locator=s.get('sourcePage',s['id']),title=s['title'],
        ar=s.get('ar',''),en=s.get('en',''),body=' '.join(str(n.get('text','')) for n in s.get('notes',[])),
        url='../texts/al-ghazali/al-mustasfa/#read='+s['id'],tag='selected-translation'))
for t in data['terms']:
    out.append(dict(id='term:'+t['id'],type='other',subtype='Technical term',
        section='',locator='Al-Mustaṣfā terminology',title=t.get('tr',t['id']),ar=t.get('ar',''),
        en=t.get('en',''),body=t.get('quick',''),tag='verified-glossary',
        url='../texts/al-ghazali/al-mustasfa/#glossary'))
for c in data['crosswork']:
    out.append(dict(id='comparison:'+c['id'],type='other',subtype='Documented cross-work evidence',
        section=c.get('mustasfa',''),locator=c.get('relation',''),
        title='Cross-work source · '+c.get('term',''),ar=c.get('workQuoteAr',''),
        en=c.get('workQuoteEn',''),body=c.get('note',''),
        tag=c.get('relation',''),url='../texts/al-ghazali/al-mustasfa/#concordance'))
for d in data['dictionaries']:
    out.append(dict(id='lexicon:'+d.get('term','')+':'+str(len(out)),type='other',
        subtype='Historical dictionary excerpt',section='',locator=d.get('source',''),
        title=d.get('term',''),ar=d.get('ar',''),en=d.get('en',''),
        body=d.get('note',''),tag='historical-excerpt',
        url='../texts/al-ghazali/al-mustasfa/#glossary'))
result={'schema':'gnamma-search-v1','work':'mustasfa',
   'title':'al-Mustaṣfā min ʿIlm al-Uṣūl','generatedFrom':'published mustasfa assets/data.js and full-arabic-pages.json',
   'status':'Complete OpenITI Arabic witness; only selected paragraphs translated. Not a critically collated Arabic edition.',
   'license':arabic.get('license','CC BY-NC-SA 4.0'),
   'arabicCorpusUrl':'../../../arabic/full-arabic-pages.json',
   'arabicParagraphCount':sum(len(p['paragraphs']) for p in arabic['pages']),
   'records':out}
target=mustasfa/'data/gnamma-search-index.json'
target.write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
print('records:',len(out),'bytes:',target.stat().st_size,'translated:',len(data['sections']),
      'Arabic witness paragraphs:',sum(len(p['paragraphs']) for p in arabic['pages']))
