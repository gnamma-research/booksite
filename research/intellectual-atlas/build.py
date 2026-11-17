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
# Rebuild the distinct-work register from committed, source-linked research.
subprocess.run([sys.executable, str(ROOT/'corpora'/'build_fiqh_research.py')],
               check=True, capture_output=True, text=True)
fiqh_research=json.loads((ROOT/'corpora'/'fiqh-research.json').read_text(encoding='utf-8'))
hanafi_benchmark=json.loads((ROOT/'corpora'/'hanafi-atlas-benchmark.json').read_text(encoding='utf-8'))
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
assert 'atlas-app.js' not in page
assert 'atlas-geo.js' in page and 'atlas-hanafi.css' in page
geo=json.loads((ROOT/'corpora'/'geo-events.json').read_text(encoding='utf-8'))
assert len(geo['places'])>=28 and len(geo['events'])>=41
assert all(-90 <= p['lat'] <= 90 and -180 <= p['lon'] <= 180 for p in geo['places'])
place_map={p['id']:p for p in geo['places']}
assert len(place_map)==len(geo['places'])
assert len(set(e['id'] for e in geo['events']))==len(geo['events'])
for ge in geo['events']:
    assert ge['place_id'] in place_map
    assert ge['entity'] in ('author','work')
    assert ge['status'] in ('documented','source_attested','qualified')
    assert ge['citation_url'].startswith('https://')
    assert ge['note'] and ge['kind']
    if ge['entity']=='work':
        assert ge.get('work_id') in {'c:'+n for n in node_ids} or ge.get('reader_ids')
    if ge['entity']=='author':
        assert ge.get('canonical_authors') or ge.get('reader_ids')
assert sum(e['entity']=='work' for e in geo['events'])>=11
assert sum(e['entity']=='author' for e in geo['events'])>=30
embedded_match = re.search(r'<script type="application/json" data-atlas>(.*?)</script>', page, re.S)
assert embedded_match, "Published page must expose the immutable audited research records"
assert json.loads(embedded_match.group(1)) == data
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
author_chron=json.loads((ROOT/'corpora'/'author-chronology.json').read_text(encoding='utf-8'))
assert len(author_chron['entries'])>=19
author_urls={e['author_url']:e for e in author_chron['entries']}
assert len(author_urls)==len(author_chron['entries']), 'Duplicate or ambiguous author biography'
assert all(e['dating_event']=='author_death' and e['death_ah']>0 and
           e['source_url'].startswith('https://app.alreq.com/ar/Authors/Author/')
           and e['status'] in ('confirmed','disputed') for e in author_chron['entries'])
alreq_known=[w for w in bib_alreq['works'] if w.get('author_url') in author_urls]
assert len(alreq_known)==author_chron['catalogue_records_affected']==764
assert all(not w['text_acquired'] for w in alreq_known)
assert all(w.get('dating_status','').startswith('undated') for w in alreq_known), 'Do not mutate source catalogue dating claims'
manifest = {
    'title': 'Texts in Time · Islamic Intellectual Atlas',
    'revision': 'tajrid-critical-links-8-2026-10-31',
    'status': 'working research',
    'ui_revision': 'hanafi-geography-map-and-source-network-fiqh-research-2026-11-10',
    'mobile_interface_note': 'Books by century opens by default and all works are browsable. Fiqh has visible researched-work counts by madhhab; imported source records remain optional. One subject selector, search and shared views serve all sciences. The separate geographical map distinguishes documented author and work events from unlocated works.',
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
    'visual_modes': ['Books by century (default)','source and reception network','geographical map','By region interactive geography','principal texts','bibliographic catalogue'],
    'discipline_nav': ['mapped works','philosophy, kalām and logic','fiqh and uṣūl (integrated cited bibliography)','hadith (SVG book authorities)','tafsīr (SVG book authorities)','taṣawwuf (chronological source-work atlas)','Arabic language sciences (integrated cited bibliography)'],
    'textual_family_routes': len(families),
    'researched_fiqh': {
        'data_url':'corpora/fiqh-research.json',
        'coverage_and_comparison_url':'corpora/fiqh-coverage.html',
        **fiqh_research['metadata']['summary'],
        'counting_policy':fiqh_research['metadata']['counting_policy'],
        'scope':fiqh_research['metadata']['scope'],
        'full_text_acquisition_or_collation_claimed':False,
    },
    'hanafi_atlas_benchmark': {
        'data_url':'corpora/hanafi-atlas-benchmark.json',
        'catalogue_entries':len(hanafi_benchmark['works']),
        'core_entries':sum(w['benchmark_group']=='core68' for w in hanafi_benchmark['works']),
        'textual_relations':len(hanafi_benchmark['relations']),
        'contextual_relations_kept_separate':len(hanafi_benchmark['contextual_relations']),
        'original_reading_collection_books':23,
        'original_readers_reproduced_locally':False,
        'attribution_url':'https://www.hanafiatlas.com/about',
    },
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
    'chronology_enrichment': {
        'source': 'corpora/author-chronology.json',
        'alreq_author_biographies_checked': len(author_chron['entries']),
        'alreq_records_with_sourced_author_death_anchor': len(alreq_known),
        'alreq_records_still_without_author_death_anchor': len(bib_alreq['works'])-len(alreq_known),
        'event_type': 'author death, not book composition or manuscript copying',
        'unplaced_workflow': 'Immediate searchable source workbench in both chronology and geographic views',
        'automatic_same_title_merges': 0,
    },
    'geography': {'data_url':'corpora/geo-events.json','geocoded_events':len(geo['events']),'author_events':sum(e['entity']=='author' for e in geo['events']),'work_events':sum(e['entity']=='work' for e in geo['events']),'registered_places':len(geo['places']),'unplaced_research_caveat':'No automatic geolocation from an author nisba, text title or manuscript catalogue association.'},
    'bibliography_map': {
        'mode': 'single shared chronological renderer with source-date qualifications, undated source-record lanes, Hanafi-style bidirectional work-centred networks and optional principal-texts synopses',
        'openiti_primary_work_candidates': len(bib_openiti['works']),
        'alreq_source_linked_entries': len(bib_alreq['works']),
        'graph_renderer': 'atlas-unified.js',
        'graph_interactions': ['one shared year axis for all sciences','zoom and pan to era clusters','sourced author-death timeline anchors','visible undated workbench and Arabic title/author search','author/source identity and citations','school and early-jurist lanes','unplaced geography catalogue','source-evidence work panel','bidirectional text network','principal texts'],
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
    'textual_family_note': 'The 404/377 audited dataset remains unchanged and the earlier UI is archived. The geographic map has a small cited event sample (author biography vs text composition); it is not a complete geocoding of Alreq or OpenITI. No invented influence or manuscript dates.',
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

