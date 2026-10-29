"""Validate and synchronize the Gnamma intellectual atlas (revision 5).
Canonical data: downloads/intellectual-atlas-data.json.
Do not use the older illustrated or offline editions to overwrite newer HTML.
Run: python research/intellectual-atlas/build.py
"""
from pathlib import Path
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parent
data = json.loads((ROOT/'downloads/intellectual-atlas-data.json').read_text(encoding='utf-8'))
node_ids = {n['id'] for n in data['nodes']}
edge_ids = {e['id'] for e in data['edges']}
source_ids = {s['id'] for s in data['sources']}
assert len(node_ids) == len(data['nodes']) >= 321
assert len(edge_ids) == len(data['edges']) >= 312
assert all(e['source'] in node_ids and e['target'] in node_ids for e in data['edges'])
assert all(set(n.get('sources', [])) <= source_ids for n in data['nodes'])
assert all(set(e.get('sources', [])) <= source_ids for e in data['edges'])

families = data.get('textual_families', [])
assert len(families) >= 12
assert len({f['id'] for f in families}) == len(families)
for f in families:
    members = f['member_ids']
    assert f['root'] in members
    assert len(set(members)) == len(members)
    assert set(members) <= node_ids
    assert f['record_count'] == len(members)

script = (ROOT/'atlas-app.js').read_text(encoding='utf-8')
assert 'data-text-family' in script
assert "textualMembers.get(state.textFamily)" in script
assert 'chooseTextFamily' in script
page_file = ROOT/'index.html'
page = page_file.read_text(encoding='utf-8')
assert 'id="ia-text-family-v3"' in page
pat = r'(<script type="application/json" data-atlas>)(.*?)(</script>)'
assert len(re.findall(pat, page, re.S)) == 1
embedded = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
page = re.sub(pat, lambda m: m.group(1) + embedded + m.group(3), page, count=1, flags=re.S)
page_file.write_text(page, encoding='utf-8')

downloads = {}
for p in sorted((ROOT/'downloads').iterdir()):
    if p.is_file() and p.suffix in {'.pdf', '.zip', '.json'}:
        downloads[p.name] = hashlib.sha256(p.read_bytes()).hexdigest()
manifest = {
    'title': 'Texts in Time · Islamic Intellectual Atlas',
    'revision': 'textual-families-5-2026-10-29',
    'status': 'working research',
    'entries': len(data['nodes']),
    'textual_relationships': len(data['edges']),
    'sources': len(data['sources']),
    'textual_family_routes': len(families),
    'textual_family_note': 'Book-centred curated subsets, not additional doctrinal schools; membership is selective',
    'tahdhib_added_entries': 26,
    'tahdhib_added_relationships': 26,
    'displayed_political_periods': 45,
    'displayed_events': 36,
    'individual_reign_rows': 0,
    'pdf_pages': {'illustrated_overview_legacy': 15, 'illustrated_reference_legacy': 204,
                  'complete_updated_register': 84, 'focused_tahdhib_supplement': 9},
    'pdf_note': 'Family navigation is web-only; illustrated volumes retain their original revision and the revision-4 evidence register remains complete.',
    'download_sha256': downloads,
}
(ROOT/'publication.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'entries': len(data['nodes']), 'relationships': len(data['edges']),
                  'textual_families': len(families), 'download_files': len(downloads)}))
