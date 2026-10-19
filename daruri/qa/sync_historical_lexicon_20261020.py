#!/usr/bin/env python3
"""One-time, idempotent historical-source synchronization into CURRENT index.html.
Never replaces reader CSS, app JS, static reading fallback, section numbering or text.
"""
import json, re, hashlib
from pathlib import Path
base=Path(__file__).resolve().parents[1]
page=base/'index.html'
external=json.loads((base/'dictionary-data.json').read_text(encoding='utf-8'))
raw=page.read_text(encoding='utf-8')
assert len(external['terms']) == 155
assert sum(k.startswith('v20261020-') for k in external['sources']) == 49
styles=lambda x: re.findall(r'<style\b[^>]*>[\s\S]*?</style>',x,re.I)
extract=lambda ident,x: re.search(r'<script\b(?=[^>]*\bid=["\']'+ident+r'["\'])[^>]*>([\s\S]*?)</script>',x,re.I).group(1)
static=lambda x:re.search(r'<noscript>[\s\S]*?</noscript>',x,re.I).group(0)
css=styles(raw)
book=extract('editionData',raw)
fallback=static(raw)
pattern=r'(<script\b(?=[^>]*\bid=["\']dictionaryData["\'])[^>]*>)([\s\S]*?)(</script\s*>)'
m=re.search(pattern,raw,re.I)
assert m, 'reader embedded dictionary not found'
data=json.loads(m.group(2))
assert len(data['terms']) == 155
added=[]
for sid,source in external['sources'].items():
    if not sid.startswith('v20261020-'):continue
    if sid not in data['sources']:
       data['sources'][sid]=source
       added.append(sid)
for term,entry in external['terms'].items():
    if term not in data['terms']:continue
    target=data['terms'][term]
    for sid in entry['sources']:
       if sid.startswith('v20261020-') and sid not in target['sources']:
          target['sources'].append(sid)
assert len(data['sources']) >= 232
payload=json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
updated=raw[:m.start(2)]+payload+raw[m.end(2):]
old='esc(gnDictionaryEra(src.author))'
new="esc((src.chronology?src.chronology+' · ':'')+(src.sourceDate||gnDictionaryEra(src.author))+(src.semanticMatch&&!['exact','exact_historical_phrase','exact_early_lemma'].includes(src.semanticMatch)?' · related evidence':''))"
if old in updated:
   assert updated.count(old)==1
   updated=updated.replace(old,new,1)
else:
   assert new in updated,'source date display cannot be identified'
assert styles(updated)==css
assert extract('editionData',updated)==book
assert static(updated)==fallback
assert updated.count('id="section=')==raw.count('id="section=')==259
assert updated.count('fb-passage-grid')==raw.count('fb-passage-grid')
assert len(re.findall(r'<script\b',updated,re.I))==len(re.findall(r'<script\b',raw,re.I))
if updated!=raw:page.write_text(updated,encoding='utf-8')
print(json.dumps({'embeddedHistoricalSources':len(data['sources']),'added':len(added),'readerStructureUnchanged':True,'cssUnchanged':True,'editionDataUnchanged':True,'staticFallbackUnchanged':True,'sha256':hashlib.sha256(updated.encode()).hexdigest()},ensure_ascii=False))