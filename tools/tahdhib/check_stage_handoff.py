#!/usr/bin/env python3
"""Tahdhīb Stage106 cumulative source audit.
Exact speaker and note IDs; do not confuse working searchable Arabic, note translation,
complete printed pages, independent manuscript certification, or modal verification.
"""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]/'texts/al-taftazani/tahdhib-al-mantiq/edition'

def data(file):
    s=(ROOT/file).read_text(encoding='utf-8')
    assert 'window.GNAMMA_' in s,file
    return json.loads(s[s.index('window.GNAMMA_'):].split('=',1)[1].strip().removesuffix(';'))

def main():
    s104=data('hawashi-numbered-notes-stage104.js')
    s105=data('hawashi-numbered-notes-stage105.js')
    names=[f'hawashi-numbered-notes-stage106{x}.js' for x in 'abcd']
    batches=[data(x) for x in names]
    p=data('progress-data.js')
    assert [x['id'] for x in s104['entries']]==[f'HWN-{i:03}' for i in range(1,19)]
    assert [x['noteNumber'] for x in s105['overrides']]==[2,8,9,12,15]
    assert [x['noteNumber'] for x in s105['appends']]==[19,20,21,22,23]
    assert [len(x['notes']) for x in batches]==[7,10,6,9]
    by_id={x['id']:x for x in s104['entries']}
    for x in s105['overrides']:
        assert x['id'] in by_id and by_id[x['id']]['status']=='partial_translation'
        by_id[x['id']]=x
    for x in s105['appends']:
        assert x['id'] not in by_id
        by_id[x['id']]=x
    for batch in batches:
        assert batch['stage']=='106'
        for x in batch['notes']:
            assert x['id'] not in by_id,x['id']
            by_id[x['id']]=x
    notes=sorted(by_id.values(),key=lambda n:n['noteNumber'])
    assert len(notes)==55
    assert [x['id'] for x in notes]==[f'HWN-{i:03}' for i in range(1,56)]
    full=[x['noteNumber'] for x in notes if x['status']=='complete_searchable_note']
    partial=[x['noteNumber'] for x in notes if x['status']=='partial_translation']
    assert len(full)==53 and partial==[1,25]
    assert full==[i for i in range(1,56) if i not in (1,25)]
    for n in notes:
        assert n.get('scanCertified') is False,n['id']
        assert n['pages'] and len(n['pages'])==len(n['sourceUrls'])
        assert set(n['pages'])<=set(range(127,145))
        assert all(n.get(k) for k in ('id','arabicLemma','english','speaker','editorial','status')),n['id']
        assert len(n['english'].split())>10,n['id']
        for page,url in zip(n['pages'],n['sourceUrls']):
            assert url in (
                f'https://ablibrary.net/book_content/b/12170/{page}',
                f'https://ablibrary.net/book_content/b/12170/{page}?lang=ar'
            ),(n['id'],url)
    arabic=[x for x in notes if x.get('arabicFullText')]
    assert len(arabic)==32
    assert [x['noteNumber'] for x in arabic]==list(range(24,56))
    assert all(x['arabicSourceStatus']=='searchable_Qum_diplomatic_first_pass' for x in arabic)
    assert [x['noteNumber'] for x in notes if x.get('unnumberedFollowing')]==[47,48]
    assert all(x['unnumberedFollowing'].get('ar') and x['unnumberedFollowing'].get('en') and x['unnumberedFollowing']['speaker']
               for x in notes if x.get('unnumberedFollowing'))
    assert len([x for x in batches[0]['notes'] if x['status']=='partial_translation'])==1
    assert s104['fullPrintedPagesTranslated']==0 and s104['photoCollated'] is False
    assert s105['fullPageTranslationsAdded']==0
    assert p['stage']=='106'
    assert p['noteLedger']['range']=='HWN-001–HWN-055'
    assert p['noteLedger']['fullyTranslatedFirstPass']==full
    assert p['noteLedger']['partiallyTranslated']==[1,25]
    assert p['noteLedger']['arabicFullSearchableNotes']==list(range(24,56))
    assert p['noteLedger']['sourcePhotographed'] is False
    assert [int(s['id']) for s in p['stages']]==[102,103,104,105,106]
    for s in p['stages']:
        assert s['files'] and all((ROOT/x).is_file() for x in s['files']),s['id']
        if s.get('report'):assert (ROOT/s['report']).is_file(),s['report']
    assert [(s['fullNoteCount'],s['partialNoteCount']) for s in p['stages'][-3:]]==[(12,6),(22,1),(53,2)]
    metrics={x['id']:(x['current'],x['total']) for x in p['metrics']}
    expected={'logic-matn':(19,19),'yazdi-first-pass':(110,110),'yazdi-photo':(0,110),
              'later-sampled':(52,274),'later-full':(0,274),'opening-notes':(53,55),
              'numbered-arabic':(32,55),'historical-classes':(46,46),'historical-proofs':(0,46)}
    assert metrics==expected,(metrics,expected)
    assert p['baseline']['laterGlossPages']==274 and p['baseline']['laterSampledPages']==52
    for f in ['HANDOFF_LATEST.md','progress.html','hawashi-numbered-notes.html',
              'stages/STAGE106_NUMBERED_TRANSLATION.md',
              'batches/hawashi-numbered-cumulative-hwn001-055.md']:
        assert (ROOT/f).is_file(),f
    h=(ROOT/'HANDOFF_LATEST.md').read_text()
    assert all(x in h for x in ('Stage 106','53 / 55','32 / 55','0 / 274','0 / 110','note56'))
    browser=(ROOT/'hawashi-numbered-notes.html').read_text()
    for s in ('stage104.js','stage105.js','stage106a.js','stage106b.js','stage106c.js','stage106d.js'):
        assert 'hawashi-numbered-notes-'+s in browser,s
    assert 'unnumberedFollowing' in browser and 'arabicFullText' in browser
    assert 'progress-data.js?v=20261109-106' in (ROOT/'progress.html').read_text()
    md=(ROOT/'batches/hawashi-numbered-cumulative-hwn001-055.md').read_text()
    assert md.count('## Note ')==55
    assert md.count('Unnumbered attached gloss (NOT a numbered note)')==2
    assert len(md)>90000
    for i in range(1,56):assert f'## Note {i} —' in md
    assert (ROOT/'batches/yazdi-main-batch-01-q7-66.md').is_file()
    assert (ROOT/'batches/yazdi-main-batch-02-q67-123.md').is_file()
    earlier=sum((data(f'hawashi-q{x}-data.js')['entries'] for x in ['125-139','140-154','155-178']),[])
    assert [x['page'] for x in earlier]==list(range(125,179))
    assert sum(x['type']=='selection' for x in earlier)==52
    assert all(x['fullPageTranslated'] is False and x['photoCollated'] is False for x in earlier)
    print('PASS Stage106: 55 unique notes (53 complete first-pass/2 partial), 32 full searchable-Arabic transcriptions, two unnumbered glosses, nine distinct metrics, 0 false completed pages, five immutable stage records')

if __name__=='__main__':
    main()
