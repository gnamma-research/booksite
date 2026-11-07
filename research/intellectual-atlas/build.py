"""Validate and synchronize the Gnamma intellectual atlas (revision 8).
Canonical data: downloads/intellectual-atlas-data.json.
Do not use the older illustrated or offline editions to overwrite newer HTML.
Run: python research/intellectual-atlas/build.py
"""
from pathlib import Path
import hashlib
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parent
# Corpus-level evidence and byte integrity are validated independently of
# the historical atlas. A separate OpenITI version is NOT a new atlas node.
corpus_registry_file = ROOT/'corpora'/'registry.json'
corpus_registry = json.loads(corpus_registry_file.read_text(encoding='utf-8'))
subprocess.run([sys.executable, str(ROOT/'corpora'/'verify.py')],
               check=True, capture_output=True, text=True)
assert len(corpus_registry['books']) == 30
assert len(corpus_registry.get('relationships', [])) == 5
assert sum(bool(b.get('local_text')) for b in corpus_registry['books']) == 5
data = json.loads((ROOT/'downloads/intellectual-atlas-data.json').read_text(encoding='utf-8'))
node_ids = {n['id'] for n in data['nodes']}
edge_ids = {e['id'] for e in data['edges']}
source_ids = {s['id'] for s in data['sources']}
all_source_ids=source_ids|{s['id'] for s in data.get('history',{}).get('sources',[])}
assert len(source_ids) == len(data['sources']) >= 359
assert len(node_ids)==len(data['nodes'])
assert len(source_ids)+len(data.get('history',{}).get('sources',[]))==len(all_source_ids)
assert len(node_ids) == len(data['nodes']) >= 386
assert len(edge_ids) == len(data['edges']) >= 362
assert all(e['source'] in node_ids and e['target'] in node_ids for e in data['edges'])
assert all(set(n.get('sources', [])) <= all_source_ids for n in data['nodes'])
assert all(set(e.get('sources', [])) <= all_source_ids for e in data['edges'])

families = data.get('textual_families', [])
assert len(families) >= 20
assert {'najat','uyun','shifa','isharat','muhassal'} <= {f['id'] for f in families}
assert all(f['within_family_relationships'] == sum(e['source'] in f['member_ids'] and e['target'] in f['member_ids'] for e in data['edges']) for f in families)
assert len({f['id'] for f in families}) == len(families)
# A work remains a single canonical node even when multiple routes reference it.
family_by_id = {f['id']: f for f in families}
assert 'razi_isharat' in family_by_id['isharat']['member_ids']
assert 'razi_sharh_uyun' in family_by_id['uyun']['member_ids']
assert family_by_id['muhassal']['root'] == 'razi_muhassal'
assert set(family_by_id['muhassal']['member_ids']) == {'razi_muhassal','tusi_talkhis','katibi_mufassal'}
assert {'F_e08','F_e09'} == {e['id'] for e in data['edges'] if e['source'] in family_by_id['muhassal']['member_ids'] and e['target'] in family_by_id['muhassal']['member_ids']}

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
assert 'function drawTextNetwork' in script
assert 'function renderExplore' in script
assert "'arabic'" in script and "'balagha'" in script and "'nahw'" in script
assert "['fiqh','Fiqh & uṣūl']" in script and "['hadith','Hadith']" in script
assert 'data-explore-madhhab' in script and 'data-explore-family' in script
assert 'ia-explorer-shortcuts' not in script  # no more always-visible 3-drawer construction
assert 'data-family-critical' in script and 'criticalFamilyEdges' in script
assert 'ia-region-network-v3' in script
assert 'data-text-route' in script
assert 'ia-polity-gap' in script
assert "if(!event.shiftKey&&!horizontal" in script
mughal=next(p for p in data['history']['periods'] if p['id']=='HL_P13')
assert mughal['segments']==[[1526,1540],[1555,1858]]
assert {n['id'] for n in data['nodes']} >= {'pythagoras_anchor','parmenides_poem','early_stoa_corpus','sextus_outlines'}
assert data['revision']=='tajrid-critical-links-8-2026-10-31'
assert len(data['history'].get('networks',[])) == 5
assert len(data['history'].get('periods',[])) == 49
assert len(data['history'].get('events',[])) == 36
assert len(source_ids)==374 and len(node_ids)==404 and len(edge_ids)==377
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
assert 'id="ia-explore-panel"' in page and 'data-action="open-explore"' in page
assert 'data-view="network"' in page and 'data-view-picker' in page
assert page.index('class="ia-layout"') < page.index('class="gn-atlas-introduction"')
assert 'ia-razi-shortcut' not in page and 'data-action="razi-responses"' not in page
pat = r'(<script type="application/json" data-atlas>)(.*?)(</script>)'
assert len(re.findall(pat, page, re.S)) == 1
embedded = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
page = re.sub(pat, lambda m: m.group(1) + embedded + m.group(3), page, count=1, flags=re.S)
page_file.write_text(page, encoding='utf-8')

downloads = {}
for p in sorted((ROOT/'downloads').iterdir()):
    if p.is_file() and p.suffix in {'.pdf', '.zip', '.json'}:
        downloads[p.name] = hashlib.sha256(p.read_bytes()).hexdigest()
# Keep the bibliographic layer independent from the 404 verified historical
# work network, and independent from the 30 pinned reader editions.
bib_openiti = json.loads((ROOT/'corpora'/'expanded-bibliography.json').read_text(encoding='utf-8'))
bib_alreq = json.loads((ROOT/'corpora'/'manuscript-full.json').read_text(encoding='utf-8'))
early_register = json.loads((ROOT/'corpora'/'early-jurists.json').read_text(encoding='utf-8'))
assert len(early_register['authorities']) >= 16
assert len(bib_openiti['works']) >= 1800
assert bib_alreq['statistics']['distinct_catalogue_ids'] == 4157
assert all(not r['text_acquired'] for r in bib_alreq['works'])
manifest = {
    'title': 'Texts in Time · Islamic Intellectual Atlas',
    'revision': 'tajrid-critical-links-8-2026-10-31',
    'status': 'working research',
    'ui_revision': 'integrated-source-bibliography-map-subject-first-svg-2026-11-07',
    'mobile_interface_note': 'Every subject opens a real clickable SVG network of work and authority nodes, not a book-list screen; zoom and drill from juristic circles to cited books. Includes early personal circles and named non-four schools, plus grammar/balagha and book-level Hadith/Tafsir. Manuscript-only books are undated unless cited author evidence exists.',
    'whole_range_note': 'Drag the six-dot grip from Whole atlas to restore a movable focus window, or tap another time on the overview to seek.',
    'date_marker_note': 'Marker is a dated event, bound, uncertainty window or distinct editing stage; label width is non-temporal.',
    'entries': len(data['nodes']),
    'textual_relationships': len(data['edges']),
    'sources': len(data['sources']),
    'historical_sources': len(data['history']['sources']),
    'ancient_bridge_entries': 10,
    'neoplatonic_new_entries': 44,
    'neoplatonic_new_relationships': 36,
    'scholarly_networks': len(data['history']['networks']),
    'classification_layers': ['intellectual tradition','textual family','regional/historical network','browse discipline','source-linked bibliographic category map','separate source-text witness catalogue'],
    'visual_modes': ['chronological timeline','source-backed text network','work connections','catalogue','evidence/audit','source-attested disciplinary work maps','full citation-linked work map','subject-first interactive SVG book-node graph'],
    'discipline_nav': ['mapped works','philosophy, kalām and logic','fiqh and uṣūl (integrated cited bibliography)','hadith (SVG book authorities)','tafsīr (SVG book authorities)','taṣawwuf (selective mapped texts and source tranche)','Arabic language sciences (integrated cited bibliography)'],
    'textual_family_routes': len(families),
    'source_corpus': {
        'url': 'corpora/',
        'index': 'corpora/registry.json',
        'verification_register': 'corpora/CORPUS_VERIFICATION.md',
        'source_repository': corpus_registry['source_repository'],
        'pinned_commit': corpus_registry['source_commit'],
        'digital_versions': len(corpus_registry['books']),
        'mirrored_byte_identical': sum(bool(b.get('local_text')) for b in corpus_registry['books']),
        'on_demand_remote_versions': sum(not b.get('local_text') for b in corpus_registry['books']),
        'bibliography_evidenced_work_relations': len(corpus_registry['relationships']),
        'print_manuscript_collations_claimed': 0,
        'complete_corpora_claimed': False,
        'license': corpus_registry['license'],
    },
    'bibliography_map': {
        'mode': 'source-cited category and author-death period map, undated works unplaced',
        'openiti_primary_work_candidates': len(bib_openiti['works']),
        'alreq_source_linked_entries': len(bib_alreq['works']),
        'graph_renderer': 'corpora/subject-graph.js',
        'graph_interactions': ['SVG work nodes','school and early jurist nodes','named non-four circles','visual drill-down','source citation side panel','zoom and scroll'],
        'registered_early_historical_authorities': len(early_register['authorities']),
        'alreq_fiqh_by_school': bib_alreq['statistics']['by_school'],
        'alreq_nahw_entries': bib_alreq['statistics']['by_genre']['nahw'],
        'alreq_sarf_entries': bib_alreq['statistics']['by_genre']['sarf'],
        'alreq_balagha_entries': bib_alreq['statistics']['by_genre']['balagha'],
        'cross_catalogue_conceptual_identity_collated': False,
        'text_or_manuscript_acquired_from_alreq': False,
        'historical_influence_edges_generated': 0,
        'primary_source_registers': ['corpora/expanded-bibliography.json','corpora/manuscript-full.json'],
    },
    'textual_family_note': 'The 21 philosophical/kalām families retain canonical IDs and evidence-qualified edges. Fiqh, usul, Hadith, Tafsir and Arabic source bibliography now uses subject-specific SVG work networks, including qualified pre-school and non-four-school jurists; no fictitious legal-opinion or commentary edges are inferred.',
    'tahdhib_added_entries': 26,
    'avicennian_extension_entries': 11,
    'avicennian_new_textual_routes': 2,
    'tahdhib_added_relationships': 26,
    'displayed_political_periods': len([p for p in data['history']['periods'] if p['id'] != 'HEP05']),
    'displayed_events': len(data['history']['events']),
    'download_current_pdf': None,
    'download_current_offline': 'Gnamma_Intellectual_Atlas_Offline_Revision8.zip',
    'individual_reign_rows': 0,
    'pdf_pages': {'illustrated_overview_legacy': 15, 'illustrated_reference_legacy': 204,
                  'historical_revision7_register': 84, 'focused_tahdhib_supplement': 9},
    'pdf_note': ('The live atlas now includes subject-specific interactive SVG graphs of cited books, jurists and classical legal schools, including 2025 OpenITI work candidates and Alreq source catalogue entries. '
                 'The revision 8 offline ZIP and older PDFs predate these additions; they are historical snapshots. '
                 'Catalogue references are not acquired manuscript scans, verified complete texts or legal-opinion graphs.'),
    'download_sha256': downloads,
    'reader_navigation_revision': 'tajrid-reader-ui-3-2026-10-31',
    'reader_return_links': 'Preserve safe debate views, passage context, filters and comparison selection.',
}
(ROOT/'publication.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'entries': len(data['nodes']), 'relationships': len(data['edges']),
                  'textual_families': len(families), 'download_files': len(downloads)}))

