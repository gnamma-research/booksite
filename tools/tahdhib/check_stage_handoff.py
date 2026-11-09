#!/usr/bin/env python3
"""Deterministic Tahdhīb progress and recovery-handoff audit.
No transcript/page is accepted as complete merely because its heading or selected lemma exists.
"""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]/'texts/al-taftazani/tahdhib-al-mantiq/edition'

def js_data(name):
    source=(ROOT/name).read_text(encoding='utf-8')
    assert source.startswith('/*') and 'window.GNAMMA_' in source, name
    source=source[source.index('window.GNAMMA_'):]
    return json.loads(source.split('=',1)[1].strip().removesuffix(';'))

def verify():
    notes=js_data('hawashi-numbered-notes-stage104.js')
    p=js_data('progress-data.js')
    raw=notes['entries']
    assert len(raw)==18
    assert [n['id'] for n in raw]==[f'HWN-{i:03}' for i in range(1,19)]
    assert [n['noteNumber'] for n in raw]==list(range(1,19))
    full=[n['noteNumber'] for n in raw if n['status']=='complete_searchable_note']
    partial=[n['noteNumber'] for n in raw if n['status']=='partial_translation']
    assert full==[3,4,5,6,7,10,11,13,14,16,17,18]
    assert partial==[1,2,8,9,12,15]
    assert len(full)==12 and len(partial)==6
    assert notes['fullPrintedPagesTranslated']==0 and notes['photoCollated'] is False
    for n in raw:
        assert not n['scanCertified'],n['id']
        assert n['pages'] and set(n['pages'])<=set(range(127,135)),n['id']
        assert len(n['pages'])==len(n['sourceUrls']),n['id']
        assert n['sourceUrls']==[f'https://ablibrary.net/book_content/b/12170/{page}' for page in n['pages']],n['id']
        assert all(n.get(k) for k in ('english','speaker','editorial','arabicLemma')),n['id']
        assert len(n['english'].split())>12,n['id']
    assert notes['completeVisibleNotes']==len(full)
    assert notes['partialNotes']==len(partial)
    assert p['stage']=='104' and p['updated']=='2026-11-09'
    stages=p['stages']
    assert [int(s['id']) for s in stages]==[102,103,104]
    for s in stages:
        assert s['files'] and all((ROOT/name).is_file() for name in s['files']),(s['id'],s['files'])
        if s.get('report'):
            assert (ROOT/s['report']).is_file(),s['report']
    assert stages[-1]['fullNoteCount']==len(full) and stages[-1]['partialNoteCount']==len(partial)
    assert p['noteLedger']['fullyTranslatedFirstPass']==full and p['noteLedger']['partiallyTranslated']==partial
    m={x['id']:x for x in p['metrics']}
    assert len(m)==8 and all(0<=x['current']<=x['total'] and x['total']>0 for x in m.values())
    expect={
      'logic-matn':(19,19),'yazdi-first-pass':(110,110),'yazdi-photo':(0,110),
      'later-sampled':(52,274),'later-full':(0,274),'opening-notes':(len(full),18),
      'historical-classes':(46,46),'historical-proofs':(0,46)}
    assert {key:(val['current'],val['total']) for key,val in m.items()}==expect
    assert p['baseline']['laterGlossPages']==400-127+1
    assert p['baseline']['laterSampledPages']==178-127+1
    for file in ['progress.html','hawashi-numbered-notes.html','HANDOFF_LATEST.md',
                 'stages/STAGE104_TRANSLATION_AND_PROGRESS.md',
                 'STAGE103_WITNESS_CANDIDATES_AND_LAYER_IDENTITIES.md']:
        assert (ROOT/file).is_file(),file
    dashboard=(ROOT/'progress.html').read_text()
    note_reader=(ROOT/'hawashi-numbered-notes.html').read_text()
    handoff=(ROOT/'HANDOFF_LATEST.md').read_text()
    menu=(ROOT/'logic-daruri-reader.js').read_text()
    assert '<progress' not in dashboard or 'make(\'progress\')' in dashboard
    assert 'progress-data.js' in dashboard and 'noteLedger' in dashboard
    assert 'hawashi-numbered-notes-stage104.js' in note_reader
    assert 'complete_searchable_note' in note_reader and 'partial_translation' in note_reader
    assert "window.location.href='progress.html'" in menu
    assert '0/274' in handoff and '12/18' in handoff and '0/110' in handoff
    assert 'six' in handoff.lower() or '6' in handoff
    # Preserve primary-main printed coverage and existing prior H source.
    assert (ROOT/'batches/yazdi-main-batch-01-q7-66.md').is_file()
    assert (ROOT/'batches/yazdi-main-batch-02-q67-123.md').is_file()
    a=js_data('hawashi-q125-139-data.js')['entries']
    b=js_data('hawashi-q140-154-data.js')['entries']
    c=js_data('hawashi-q155-178-data.js')['entries']
    positions=a+b+c
    assert [x['page'] for x in positions]==list(range(125,179))
    assert sum(x['type']=='selection' for x in positions)==52
    assert all(x['fullPageTranslated'] is False for x in positions)
    assert all(x['photoCollated'] is False for x in positions)
    print('PASS Tahdhīb cumulative handoff: 18 notes, 12 complete first-pass, 6 partial, 8 honest progress bars, stage reports, 0 complete H pages, preserved 110-page Y main translation')

if __name__=='__main__':
    verify()
