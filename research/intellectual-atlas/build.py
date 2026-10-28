"""Validate and synchronize the published Gnamma research atlas (revision 4).

Canonical source: downloads/intellectual-atlas-data.json.
The historical offline bundle is not used to regenerate the page; an older
bundle must never overwrite the current research dataset or interactive UI.

Run: python research/intellectual-atlas/build.py
"""
from pathlib import Path
import hashlib, json, re

ROOT=Path(__file__).resolve().parent
data_file=ROOT/'downloads'/'intellectual-atlas-data.json'
page_file=ROOT/'index.html'
data=json.loads(data_file.read_text(encoding='utf-8'))
ids={n['id'] for n in data['nodes']}
edges={e['id'] for e in data['edges']}
assert len(ids)==len(data['nodes'])
assert len(edges)==len(data['edges'])
assert all(e['source'] in ids and e['target'] in ids for e in data['edges'])
sources={s['id'] for s in data['sources']}
assert all(set(n.get('sources',[])) <= sources for n in data['nodes'])
assert all(set(e.get('sources',[])) <= sources for e in data['edges'])
assert len(data['nodes'])>=321 and len(data['edges'])>=312
assert any(n['id']=='tahdhib_complete' for n in data['nodes'])

page=page_file.read_text(encoding='utf-8')
pattern=r'(<script type="application/json" data-atlas>)(.*?)(</script>)'
assert len(re.findall(pattern,page,re.S))==1
replacement=json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
page=re.sub(pattern,lambda m:m.group(1)+replacement+m.group(3),page,count=1,flags=re.S)
page_file.write_text(page,encoding='utf-8')
downloads={}
for p in sorted((ROOT/'downloads').iterdir()):
    if p.is_file() and p.suffix in {'.pdf','.zip','.json'}:
        downloads[p.name]=hashlib.sha256(p.read_bytes()).hexdigest()
manifest={'title':'Texts in Time · Islamic Intellectual Atlas','revision':'tahdhib-4-2026-10-28',
          'status':'working research','entries':len(data['nodes']),
          'textual_relationships':len(data['edges']),'sources':len(data['sources']),
          'tahdhib_added_entries':26,'tahdhib_added_relationships':26,
          'displayed_political_periods':45,'displayed_events':36,
          'individual_reign_rows':0,'pdf_notes':'Revision 4 full register and focused supplement; earlier illustrated volumes retained separately',
          'downloads':downloads}
(ROOT/'publication.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'entries':len(data['nodes']),'relationships':len(data['edges']),'sources':len(data['sources']),'download_files':len(downloads)}))
