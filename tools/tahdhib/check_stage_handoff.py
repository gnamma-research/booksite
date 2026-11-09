#!/usr/bin/env python3
"""Cumulative Tahdhīb Stage108 source/checkpoint QA:
differentiate an indexed note from a complete translated print page and
digitally searchable Arabic from a photo/manuscript-collated witness.
"""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]/'texts/al-taftazani/tahdhib-al-mantiq/edition'

def js(name):
    s=(ROOT/name).read_text(encoding='utf-8')
    assert 'window.GNAMMA_' in s,name
    return json.loads(s[s.index('window.GNAMMA_'):].split('=',1)[1].strip().removesuffix(';'))

def main():
    a=js('hawashi-numbered-notes-stage104.js')
    b=js('hawashi-numbered-notes-stage105.js')
    names=[f'hawashi-numbered-notes-stage106{x}.js' for x in 'abcd']+[
      f'hawashi-numbered-notes-stage107{x}.js' for x in 'abcdef']+[
      f'hawashi-numbered-notes-stage108{x}.js' for x in 'ab']
    batches=[js(name) for name in names]
    assert [len(batch['notes']) for batch in batches]==[7,10,6,9,10,10,10,10,8,7,6,10]
    assert [batch['stage'] for batch in batches]==['106']*4+['107']*6+['108']*2
    assert [n['noteNumber'] for n in a['entries']]==list(range(1,19))
    assert [n['noteNumber'] for n in b['overrides']]==[2,8,9,12,15]
    assert [n['noteNumber'] for n in b['appends']]==[19,20,21,22,23]
    by_id={n['id']:n for n in a['entries']}
    for n in b['overrides']:
        assert n['id'] in by_id and by_id[n['id']]['status']=='partial_translation',n['id']
        by_id[n['id']]=n
    for n in b['appends']:
        assert n['id'] not in by_id,n['id']
        by_id[n['id']]=n
    for batch in batches:
        for n in batch['notes']:
            assert n['id'] not in by_id,n['id']
            by_id[n['id']]=n
    notes=sorted(by_id.values(),key=lambda n:n['noteNumber'])
    assert len(notes)==126
    assert [n['id'] for n in notes]==[f'HWN-{i:03}' for i in range(1,127)]
    complete=[n['noteNumber'] for n in notes if n['status']=='complete_searchable_note']
    partial=[n['noteNumber'] for n in notes if n['status']=='partial_translation']
    assert len(complete)==122 and partial==[1,25,82,90],partial
    assert complete==[n for n in range(1,127) if n not in partial]
    arabic=[n['noteNumber'] for n in notes if n.get('arabicFullText')]
    assert arabic==list(range(24,76))+[114,115],arabic
    assert [n['noteNumber'] for n in notes if n.get('unnumberedFollowing')]==[47,48,71,86,90,112]
    assert all(n['scanCertified'] is False for n in notes)
    for n in notes:
        assert n['pages'] and len(n['pages'])==len(n['sourceUrls']),n['id']
        assert set(n['pages'])<=set(range(127,161)),n['id']
        assert all(n.get(k) for k in ('id','arabicLemma','english','speaker','editorial','status')),n['id']
        assert len(n['english'].split())>10 or (n['noteNumber']==44 and 'verse 22' in n['english']),n['id']
        for page,url in zip(n['pages'],n['sourceUrls']):
            assert url in (f'https://ablibrary.net/book_content/b/12170/{page}',
                           f'https://ablibrary.net/book_content/b/12170/{page}?lang=ar'),n['id']
        if n.get('arabicFullText'):
            assert n['arabicSourceStatus']=='searchable_Qum_diplomatic_first_pass',n['id']
        if n.get('unnumberedFollowing'):
            x=n['unnumberedFollowing']
            assert x['speaker'] and x['ar'] and x['en'],n['id']
    assert a['fullPrintedPagesTranslated']==0 and a['photoCollated'] is False
    assert b['fullPageTranslationsAdded']==0
    p=js('progress-data.js')
    assert p['stage']=='108' and p['updated']=='2026-11-09'
    assert p['noteLedger']['range']=='HWN-001–HWN-126'
    assert p['noteLedger']['fullyTranslatedFirstPass']==complete
    assert p['noteLedger']['partiallyTranslated']==partial
    assert p['noteLedger']['arabicFullSearchableNotes']==arabic
    assert p['noteLedger']['unnumberedFollowingRendered']==[47,48,71,86,90,112]
    assert p['noteLedger']['sourcePhotographed'] is False
    assert [int(s['id']) for s in p['stages']]==list(range(102,109))
    assert [(s['fullNoteCount'],s['partialNoteCount']) for s in p['stages'][-5:]]==[
       (12,6),(22,1),(53,2),(106,4),(122,4)]
    for stage in p['stages']:
        assert stage['files'] and all((ROOT/name).is_file() for name in stage['files']),stage['id']
        if stage.get('report'):assert (ROOT/stage['report']).is_file(),stage['report']
    metrics={x['id']:(x['current'],x['total']) for x in p['metrics']}
    target={'logic-matn':(19,19),'yazdi-first-pass':(110,110),'yazdi-photo':(0,110),
            'later-sampled':(52,274),'later-full':(0,274),'opening-notes':(122,126),
            'numbered-arabic':(54,126),'historical-classes':(46,46),'historical-proofs':(0,46)}
    assert metrics==target,(metrics,target)
    assert p['baseline']['laterGlossPages']==274 and p['baseline']['laterSampledPages']==52
    files=['HANDOFF_LATEST.md','progress.html','hawashi-numbered-notes.html',
           'stages/STAGE108_NOTES_111_126.md',
           'batches/hawashi-numbered-cumulative-hwn001-126.md',
           'batches/hawashi-numbered-cumulative-hwn001-110.md',
           'batches/hawashi-numbered-cumulative-hwn001-055.md',
           'batches/yazdi-main-batch-01-q7-66.md','batches/yazdi-main-batch-02-q67-123.md']
    assert all((ROOT/file).is_file() for file in files)
    handoff=(ROOT/'HANDOFF_LATEST.md').read_text()
    for token in ('Stage108','Stage109','122/126','54/126','0/274','0/110','HWN-127'):
        assert token in handoff,token
    reader=(ROOT/'hawashi-numbered-notes.html').read_text()
    for stagefile in ['stage104.js','stage105.js',*['stage106'+x+'.js' for x in 'abcd'],
                      *['stage107'+x+'.js' for x in 'abcdef'],*['stage108'+x+'.js' for x in 'ab']]:
        assert 'hawashi-numbered-notes-'+stagefile in reader,stagefile
    assert 'unnumberedFollowing' in reader and 'arabicFullText' in reader
    assert 'progress-data.js?v=20261109-108' in (ROOT/'progress.html').read_text()
    md=(ROOT/'batches/hawashi-numbered-cumulative-hwn001-126.md').read_text()
    assert md.count('## Note ')==126
    assert md.count('### Separately attributed UNNUMBERED gloss')==6
    assert len(md)>230000
    for n in range(1,127):assert f'## Note {n} —' in md,n
    older=sum((js(f'hawashi-q{x}-data.js')['entries'] for x in ('125-139','140-154','155-178')),[])
    assert [n['page'] for n in older]==list(range(125,179))
    assert sum(n['type']=='selection' for n in older)==52
    assert all(n['fullPageTranslated'] is False and n['photoCollated'] is False for n in older)
    print('PASS Stage108: 126 unique later gloss notes; 122 English complete first-pass, 4 partial; 54 digitally searchable Arabic; 6 separately attributed unnumbered glosses; nine distinct progress goals; seven immutable stage records; zero falsely certified H or Y pages')

if __name__=='__main__':
    main()
