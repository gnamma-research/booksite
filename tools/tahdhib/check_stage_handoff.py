#!/usr/bin/env python3
"""Deterministic Tahdhīb Stage107 cumulative translation, source and recovery-handoff audit.
Checks note-level translational status, WITHOUT equating notes to complete printed pages
or a searchable Arabic string to a photographically certified manuscript.
"""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]/'texts/al-taftazani/tahdhib-al-mantiq/edition'

def data(name):
    s=(ROOT/name).read_text(encoding='utf-8')
    assert 'window.GNAMMA_' in s,name
    return json.loads(s[s.index('window.GNAMMA_'):].split('=',1)[1].strip().removesuffix(';'))

def main():
    first=data('hawashi-numbered-notes-stage104.js')
    changes=data('hawashi-numbered-notes-stage105.js')
    batch_names=[f'hawashi-numbered-notes-stage106{x}.js' for x in 'abcd']+[
        f'hawashi-numbered-notes-stage107{x}.js' for x in 'abcdef']
    batches=[data(name) for name in batch_names]
    assert [len(b['notes']) for b in batches]==[7,10,6,9,10,10,10,10,8,7]
    assert [b['stage'] for b in batches]==['106']*4+['107']*6
    assert [x['noteNumber'] for x in first['entries']]==list(range(1,19))
    assert [x['noteNumber'] for x in changes['overrides']]==[2,8,9,12,15]
    assert [x['noteNumber'] for x in changes['appends']]==[19,20,21,22,23]
    by_id={n['id']:n for n in first['entries']}
    for n in changes['overrides']:
        assert n['id'] in by_id and by_id[n['id']]['status']=='partial_translation'
        by_id[n['id']]=n
    for n in changes['appends']:
        assert n['id'] not in by_id
        by_id[n['id']]=n
    for b in batches:
        for n in b['notes']:
            assert n['id'] not in by_id,n['id']
            by_id[n['id']]=n
    notes=sorted(by_id.values(),key=lambda n:n['noteNumber'])
    assert len(notes)==110
    assert [n['id'] for n in notes]==[f'HWN-{i:03}' for i in range(1,111)]
    complete=[n['noteNumber'] for n in notes if n['status']=='complete_searchable_note']
    partial=[n['noteNumber'] for n in notes if n['status']=='partial_translation']
    assert len(complete)==106 and partial==[1,25,82,90],partial
    assert complete==[i for i in range(1,111) if i not in partial]
    arabic=[n['noteNumber'] for n in notes if n.get('arabicFullText')]
    assert arabic==list(range(24,76)),arabic
    assert [n['noteNumber'] for n in notes if n.get('unnumberedFollowing')]==[47,48,71,86,90]
    for n in notes:
        assert n.get('scanCertified') is False,n['id']
        assert n['pages'] and len(n['pages'])==len(n['sourceUrls']),n['id']
        assert set(n['pages'])<=set(range(127,157)),n['id']
        assert all(n.get(k) for k in ('id','arabicLemma','english','speaker','editorial','status')),n['id']
        assert len(n['english'].split())>10 or (n['noteNumber']==44 and 'verse 22' in n['english']),n['id']
        assert n['sourceUrls']==[
            next(u for u in [f'https://ablibrary.net/book_content/b/12170/{page}',
                              f'https://ablibrary.net/book_content/b/12170/{page}?lang=ar']
                 if u==url)
            for page,url in zip(n['pages'],n['sourceUrls'])
        ],n['id']
        if n.get('arabicFullText'):
            assert n['arabicSourceStatus']=='searchable_Qum_diplomatic_first_pass',n['id']
        else:
            assert len(n['arabicLemma'])>=4,n['id']
        if n.get('unnumberedFollowing'):
            u=n['unnumberedFollowing']
            assert u.get('ar') and u.get('en') and u.get('speaker'),n['id']
    assert first['fullPrintedPagesTranslated']==0 and first['photoCollated'] is False
    assert changes['fullPageTranslationsAdded']==0
    p=data('progress-data.js')
    assert p['stage']=='107' and p['updated']=='2026-11-09'
    assert p['noteLedger']['range']=='HWN-001–HWN-110'
    assert p['noteLedger']['fullyTranslatedFirstPass']==complete
    assert p['noteLedger']['partiallyTranslated']==partial
    assert p['noteLedger']['arabicFullSearchableNotes']==arabic
    assert p['noteLedger']['sourcePhotographed'] is False
    assert p['noteLedger']['unnumberedFollowingRendered']==[47,48,71,86,90]
    stages=p['stages']
    assert [int(s['id']) for s in stages]==list(range(102,108))
    assert [(s['fullNoteCount'],s['partialNoteCount']) for s in stages[-4:]]==[
        (12,6),(22,1),(53,2),(106,4)]
    for stage in stages:
        assert stage['files'] and all((ROOT/f).is_file() for f in stage['files']),stage['id']
        if stage.get('report'):assert (ROOT/stage['report']).is_file(),stage['report']
    metrics={m['id']:(m['current'],m['total']) for m in p['metrics']}
    expected={'logic-matn':(19,19),'yazdi-first-pass':(110,110),'yazdi-photo':(0,110),
              'later-sampled':(52,274),'later-full':(0,274),'opening-notes':(106,110),
              'numbered-arabic':(52,110),'historical-classes':(46,46),'historical-proofs':(0,46)}
    assert metrics==expected,(metrics,expected)
    assert p['baseline']['laterGlossPages']==400-127+1
    assert p['baseline']['laterSampledPages']==178-127+1
    paths=['HANDOFF_LATEST.md','progress.html','hawashi-numbered-notes.html',
           'stages/STAGE107_NOTES_056_110.md','batches/hawashi-numbered-cumulative-hwn001-110.md',
           'batches/hawashi-numbered-cumulative-hwn001-055.md',
           'batches/yazdi-main-batch-01-q7-66.md','batches/yazdi-main-batch-02-q67-123.md']
    assert all((ROOT/f).is_file() for f in paths)
    handoff=(ROOT/'HANDOFF_LATEST.md').read_text(encoding='utf-8')
    assert all(x in handoff for x in ('Stage107','Stage108','106/110','52/110','0/110',
                                      '0/274','note111','HWN-001')) or all(
                                      x in handoff for x in ('Stage107','Stage108','106 / 110','52 / 110',
                                                             '0 / 110','0 / 274','note111','HWN-001'))
    reader=(ROOT/'hawashi-numbered-notes.html').read_text(encoding='utf-8')
    for f in ['stage104.js','stage105.js',*['stage106'+x+'.js' for x in 'abcd'],
              *['stage107'+x+'.js' for x in 'abcdef']]:
        assert 'hawashi-numbered-notes-'+f in reader,f
    assert 'unnumberedFollowing' in reader and 'arabicFullText' in reader
    assert 'progress-data.js?v=20261109-107' in (ROOT/'progress.html').read_text()
    md=(ROOT/'batches/hawashi-numbered-cumulative-hwn001-110.md').read_text()
    assert md.count('## Note ')==110
    assert md.count('### Adjacent UNNUMBERED gloss')==5
    assert len(md)>190000
    for i in range(1,111):assert f'## Note {i} —' in md
    old=sum((data(f'hawashi-q{x}-data.js')['entries'] for x in ('125-139','140-154','155-178')),[])
    assert [n['page'] for n in old]==list(range(125,179))
    assert sum(n['type']=='selection' for n in old)==52
    assert all(n['fullPageTranslated'] is False and n['photoCollated'] is False for n in old)
    print('PASS Tahdhīb Stage107 cumulative: 110 numbered notes, 106 complete first-pass English, 4 partial, 52 full digitized Arabic, 5 separately authored unnumbered glosses, 9 independent metrics, 6 stage reports, 0 false certified pages')

if __name__=='__main__':
    main()
