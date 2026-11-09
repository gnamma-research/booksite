#!/usr/bin/env python3
"""Stage105 cumulative Tahdhīb source-integrity audit.
Never mistake source-page excerpts, revised notes, or catalogue leads for whole pages.
"""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]/'texts/al-taftazani/tahdhib-al-mantiq/edition'

def js_data(name):
    source=(ROOT/name).read_text(encoding='utf-8')
    source=source[source.index('window.GNAMMA_'):]
    return json.loads(source.split('=',1)[1].strip().removesuffix(';'))

def verify():
    first=js_data('hawashi-numbered-notes-stage104.js')
    patch=js_data('hawashi-numbered-notes-stage105.js')
    progress=js_data('progress-data.js')
    previous=first['entries']
    assert [n['id'] for n in previous]==[f'HWN-{i:03}' for i in range(1,19)]
    assert [n['noteNumber'] for n in previous]==list(range(1,19))
    assert [n['noteNumber'] for n in previous if n['status']=='complete_searchable_note']==[3,4,5,6,7,10,11,13,14,16,17,18]
    assert first['fullPrintedPagesTranslated']==0 and first['photoCollated'] is False
    overrides=patch['overrides'];appends=patch['appends']
    assert [n['noteNumber'] for n in overrides]==[2,8,9,12,15]
    assert [n['noteNumber'] for n in appends]==[19,20,21,22,23]
    assert patch['stage']=='105' and patch['fullPageTranslationsAdded']==0
    assert patch['completeNotesUpgraded']==5 and patch['newCompleteNotes']==5
    assert all(n['status']=='complete_searchable_note' for n in overrides+appends)
    assert all('Stage105' in n['revision'] for n in overrides+appends)
    by_id={n['id']:n for n in previous}
    for n in overrides:
        assert n['id'] in by_id and by_id[n['id']]['status']=='partial_translation'
        by_id[n['id']]=n
    for n in appends:
        assert n['id'] not in by_id
        by_id[n['id']]=n
    notes=sorted(by_id.values(),key=lambda n:n['noteNumber'])
    assert len(notes)==23 and [n['id'] for n in notes]==[f'HWN-{i:03}' for i in range(1,24)]
    full=[n['noteNumber'] for n in notes if n['status']=='complete_searchable_note']
    partial=[n['noteNumber'] for n in notes if n['status']=='partial_translation']
    assert full==list(range(2,24)) and partial==[1]
    for n in notes:
        assert n['scanCertified'] is False,n['id']
        assert set(n['pages'])<=set(range(127,136)) and n['pages'],n['id']
        assert len(n['pages'])==len(n['sourceUrls']),n['id']
        assert n['sourceUrls']==[f'https://ablibrary.net/book_content/b/12170/{page}' for page in n['pages']],n['id']
        assert all(n.get(key) for key in ['id','english','arabicLemma','speaker','editorial']),n['id']
        assert len(n['english'].split())>12,n['id']
    assert progress['stage']=='105' and progress['updated']=='2026-11-09'
    assert progress['noteLedger']['fullyTranslatedFirstPass']==full
    assert progress['noteLedger']['partiallyTranslated']==partial
    assert progress['noteLedger']['range']=='HWN-001–HWN-023'
    stages=progress['stages']
    assert [int(s['id']) for s in stages]==[102,103,104,105]
    for s in stages:
        assert s['files'] and all((ROOT/name).is_file() for name in s['files']),(s['id'],s['files'])
        if s.get('report'):assert (ROOT/s['report']).is_file(),s['report']
    assert stages[-2]['fullNoteCount']==12 and stages[-2]['partialNoteCount']==6
    assert stages[-1]['fullNoteCount']==22 and stages[-1]['partialNoteCount']==1
    metrics={m['id']:m for m in progress['metrics']}
    expected={'logic-matn':(19,19),'yazdi-first-pass':(110,110),'yazdi-photo':(0,110),
              'later-sampled':(52,274),'later-full':(0,274),'opening-notes':(22,23),
              'historical-classes':(46,46),'historical-proofs':(0,46)}
    assert set(metrics)==set(expected)
    assert {key:(m['current'],m['total']) for key,m in metrics.items()}==expected
    assert progress['baseline']['laterGlossPages']==400-127+1
    assert progress['baseline']['laterSampledPages']==178-127+1
    for item in ['progress.html','hawashi-numbered-notes.html','HANDOFF_LATEST.md',
                 'stages/STAGE104_TRANSLATION_AND_PROGRESS.md','stages/STAGE105_COMPLETION_AND_GUIDANCE.md',
                 'STAGE103_WITNESS_CANDIDATES_AND_LAYER_IDENTITIES.md']:
        assert (ROOT/item).is_file(),item
    page=(ROOT/'hawashi-numbered-notes.html').read_text(encoding='utf-8')
    dash=(ROOT/'progress.html').read_text(encoding='utf-8')
    handoff=(ROOT/'HANDOFF_LATEST.md').read_text(encoding='utf-8')
    menu=(ROOT/'logic-daruri-reader.js').read_text(encoding='utf-8')
    assert 'hawashi-numbered-notes-stage104.js' in page and 'hawashi-numbered-notes-stage105.js' in page
    assert 'patch.overrides' in page and 'patch.appends' in page
    assert 'progress-data.js?v=20261109-105' in dash and 'noteLedger' in dash
    assert "window.location.href='progress.html'" in menu
    assert '22/23' in handoff and '0/274' in handoff and '0/110' in handoff
    assert 'Stage106' in handoff and 'HWN-001' in handoff
    assert (ROOT/'batches/yazdi-main-batch-01-q7-66.md').is_file()
    assert (ROOT/'batches/yazdi-main-batch-02-q67-123.md').is_file()
    earlier=sum([js_data('hawashi-q125-139-data.js')['entries'],
                 js_data('hawashi-q140-154-data.js')['entries'],
                 js_data('hawashi-q155-178-data.js')['entries']],[])
    assert [x['page'] for x in earlier]==list(range(125,179))
    assert sum(x['type']=='selection' for x in earlier)==52
    assert all(x['fullPageTranslated'] is False and x['photoCollated'] is False for x in earlier)
    print('PASS Stage105 cumulative source/handoff: 23 unique notes, 22 complete first-pass, 1 partial, 8 coherent goal metrics, 4 immutable stages, zero falsely completed pages')

if __name__=='__main__':
    verify()
