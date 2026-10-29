"""Validate and synchronize the Gnamma intellectual atlas (revision 7).
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
all_source_ids=source_ids|{s['id'] for s in data.get('history',{}).get('sources',[])}
assert len(source_ids) == len(data['sources']) >= 349
assert len(node_ids)==len(data['nodes'])
assert len(source_ids)+len(data.get('history',{}).get('sources',[]))==len(all_source_ids)
assert len(node_ids) == len(data['nodes']) >= 375
assert len(edge_ids) == len(data['edges']) >= 348
assert all(e['source'] in node_ids and e['target'] in node_ids for e in data['edges'])
assert all(set(n.get('sources', [])) <= all_source_ids for n in data['nodes'])
assert all(set(e.get('sources', [])) <= all_source_ids for e in data['edges'])

families = data.get('textual_families', [])
assert len(families) >= 18
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
assert 'ia-region-network-v3' in script
assert 'data-text-route' in script
assert 'ia-polity-gap' in script
assert "if(!event.shiftKey&&!horizontal" in script
mughal=next(p for p in data['history']['periods'] if p['id']=='HL_P13')
assert mughal['segments']==[[1526,1540],[1555,1858]]
assert {n['id'] for n in data['nodes']} >= {'pythagoras_anchor','parmenides_poem','early_stoa_corpus','sextus_outlines'}
assert data['revision']=='neoplatonic-bridge-7-2026-10-29'
assert len(data['history'].get('networks',[])) == 5
assert len(data['history'].get('periods',[])) == 49
assert len(data['history'].get('events',[])) == 36
assert len(source_ids)==349 and len(node_ids)==375 and len(edge_ids)==348
assert {'plotinus_transmission','proclus_elements','aristotle_metaphysics','aristotle_physics','plato_timaeus','aristotle_categories'} <= {f['id'] for f in families}
palette={'ancient','neoplatonic','ashari','maturidi','translation','christian','jewish','falsafa','avicennan','ishraqi','akbarian','mutazili','sunni','imami','sadrian','critical','context'}
assert all(n.get('tradition') in palette for n in data['nodes'])
assert all(set(n.get('intellectual_traditions',[]))<=palette for n in data['nodes'])
assert all(set(c.get('sources',[]))<=all_source_ids for n in data['nodes'] for c in n.get('classification_evidence',[]))
assert all(n.get('temporal',{}).get('anchor') is None for n in data['nodes'] if n['id']=='arabic_proclus_timaeus')
for n in data['history']['networks']:
    assert n['start']<n['end'] and set(n.get('sources',[])) <= all_source_ids
for e in data['edges']:
    assert e.get('evidence') and e.get('sources') and set(e['sources'])<=all_source_ids
assert all((not n.get('temporal') or n['temporal'].get('anchor') is None or
            (n['temporal'].get('start') is None or n['temporal']['anchor']>=n['temporal']['start']) and
            (n['temporal'].get('end') is None or n['temporal']['anchor']<=n['temporal']['end'])) for n in data['nodes'])
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
    'revision': 'neoplatonic-bridge-7-2026-10-29',
    'status': 'working research',
    'entries': len(data['nodes']),
    'textual_relationships': len(data['edges']),
    'sources': len(data['sources']),
    'historical_sources': len(data['history']['sources']),
    'ancient_bridge_entries': 10,
    'neoplatonic_new_entries': 44,
    'neoplatonic_new_relationships': 36,
    'scholarly_networks': len(data['history']['networks']),
    'classification_layers': ['intellectual tradition','textual family','regional/historical network'],
    'textual_family_routes': len(families),
    'textual_family_note': 'Book-centred selective commentary/translation/reception networks; a source work can be in several families without implying doctrinal agreement',
    'tahdhib_added_entries': 26,
    'tahdhib_added_relationships': 26,
    'displayed_political_periods': len([p for p in data['history']['periods'] if p['id'] != 'HEP05']),
    'displayed_events': len(data['history']['events']),
    'download_current_pdf': 'Intellectual_Atlas_Reference_Revision7.pdf',
    'download_current_offline': 'Gnamma_Intellectual_Atlas_Offline_Revision7.zip',
    'individual_reign_rows': 0,
    'pdf_pages': {'illustrated_overview_legacy': 15, 'illustrated_reference_legacy': 204,
                  'complete_updated_register': 84, 'focused_tahdhib_supplement': 9},
    'pdf_note': ('The revision-7 PDF and offline ZIP are built from this canonical dataset by build_release.py. '
                 'Historical PDFs from revisions 2 and 4 retain earlier scholarship and are marked legacy.'),
    'download_sha256': downloads,
}
(ROOT/'publication.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'entries': len(data['nodes']), 'relationships': len(data['edges']),
                  'textual_families': len(families), 'download_files': len(downloads)}))
