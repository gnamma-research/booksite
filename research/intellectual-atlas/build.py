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

# The new atlas uses an external, byte-for-byte canonical dataset; no UI builder
# may silently overwrite the live page with a previous HTML shell.
unified_source = ROOT/'corpora'/'canonical-atlas.json'
assert unified_source.exists()
external = json.loads(unified_source.read_text(encoding='utf-8'))
assert external == data, "Published canonical graph must match the audited source JSON"
script = (ROOT/'atlas-unified.js').read_text(encoding='utf-8')
assert 'GNAMMAUnifiedAtlas' in script
assert all(k in script for k in ('function viewTimeline','function viewNetwork',
                                'function viewPrincipal','function viewGeography',
                                'function viewCatalogue','function evidencePanel'))
assert 'function initialSubject' in script and 'function subjectControls' in script
assert 'function loadMetadata' in script and 'function loadCanonical' in script
page = (ROOT/'index.html').read_text(encoding='utf-8')
assert 'id="gn-atlas"' in page
assert 'atlas-unified.js' in page and 'atlas-unified.css' in page
assert 'atlas-app.js' not in page and 'data-atlas' not in page
assert (ROOT/'legacy.html').exists()
legacy = (ROOT/'legacy.html').read_text(encoding='utf-8')
pat=r'<script type="application/json" data-atlas>(.*?)</script>'
legacy_match = re.search(pat,legacy,re.S)
assert legacy_match, "The previous audited reader must remain reproducible"
assert json.loads(legacy_match.group(1)) == data
# The old standalone UI is a historical archive, not the default atlas.

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
    'ui_revision': 'unified-hanafi-style-work-atlas-2026-11-09',
    'mobile_interface_note': 'All sciences now share one responsive search, source filter, map renderer and detail panel. Subject changes never switch to a separate map application. The Hanafi-inspired source-reception network records only audited relationships.',
    'whole_range_note': 'Use the shared year controls and zoomable era clusters; switch sciences without changing map interface.',
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
    'visual_modes': ['shared chronological work atlas','Hanafi-inspired source and reception network','vertical principal-texts synopsis','regional-label evidence index','source-linked catalogue','work evidence panel'],
    'discipline_nav': ['mapped works','philosophy, kalām and logic','fiqh and uṣūl (integrated cited bibliography)','hadith (SVG book authorities)','tafsīr (SVG book authorities)','taṣawwuf (chronological source-work atlas)','Arabic language sciences (integrated cited bibliography)'],
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
        'mode': 'single shared chronological renderer with source-date qualifications, undated source-record lanes, Hanafi-style bidirectional work-centred networks and optional principal-texts synopses',
        'openiti_primary_work_candidates': len(bib_openiti['works']),
        'alreq_source_linked_entries': len(bib_alreq['works']),
        'graph_renderer': 'atlas-unified.js',
        'graph_interactions': ['one shared year axis for all sciences','zoom and pan to era clusters','school and historical early-jurist lanes','unplaced works within same map','source-evidence work panel','Hanafi-style bidirectional network','curated-family and selective principal texts'],
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
    'textual_family_note': 'The 404/377 audited dataset remains unchanged, externalized as canonical-atlas.json, and the earlier UI is preserved in legacy.html. All subjects share the same historical map and work-centred network shell. No inferred influence or unsupported manuscript dates.',
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

