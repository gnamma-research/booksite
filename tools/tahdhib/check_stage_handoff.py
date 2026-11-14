#!/usr/bin/env python3
"""Preserve Stage112 audit and verify all Stage113 derived records against immutable sources."""
import hashlib
import importlib.util
import json
import tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
ED=ROOT/'texts/al-taftazani/tahdhib-al-mantiq/edition'

def main():
    spec=importlib.util.spec_from_file_location('stage112_archive', ROOT/'tools/tahdhib/check_stage112_archive.py')
    old=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(old)
    with tempfile.TemporaryDirectory() as folder:
        temp=Path(folder)
        for item in ED.iterdir():
            (temp/item.name).symlink_to(item, target_is_directory=item.is_dir())
        for name in ['HANDOFF_LATEST.md','progress-data.js','progress.html','hawashi-numbered-notes.html']:
            (temp/name).unlink()
            (temp/name).write_bytes((ED/'checkpoints/stage112'/name).read_bytes())
        old.ROOT=temp
        old.audit()
    manifest=json.loads((ED/'corpus-manifest.json').read_text())
    for name, digest in manifest['immutableSha256'].items():
        assert hashlib.sha256((ED/name).read_bytes()).hexdigest()==digest,name
    data=json.loads((ED/manifest['recordFile']).read_text())
    rows=data['records']
    assert data['stage']=='113' and len(rows)==348
    assert len({n['id'] for n in rows})==348
    expected=[('H-PREFACE','HWN-',140,136,54),('H-INTRO','HWN-INTRO-',82,66,0),('H-DALALA','HWN-DALALA-',91,59,0),('H-MAFAHIM','HWN-MAFAHIM-',35,30,25)]
    for sid,prefix,count,english,arabic in expected:
        group=[n for n in rows if n['sectionId']==sid]
        assert [n['id'] for n in group]==[prefix+f'{i:03}' for i in range(1,count+1)]
        assert sum(n['status']=='complete_searchable_note' for n in group)==english
        assert sum(bool(n.get('arabicFullText')) for n in group)==arabic
    for n in rows:
        assert n['scanCertified'] is False,n['id']
        assert all(n.get(k) for k in ['id','speaker','english','arabicLemma','editorial','sourceUrls']),n['id']
        assert len(n['pages'])==len(n['sourceUrls']),n['id']
    patch=json.loads((ED/'hawashi-concepts-stage113-source.json').read_text())
    assert [n['localNoteNumber'] for n in patch['records']]==list(range(12,36))
    assert [n['localNoteNumber'] for n in patch['overrides']]==[2]
    latest={n['id']:n for n in rows}
    for n in patch['records']+patch['overrides']:
        assert n['arabicFullText']==latest[n['id']]['arabicFullText']
        assert n['english']==latest[n['id']]['english']
    assert sum(n['status']=='complete_searchable_note' for n in rows)==291
    assert sum(n['status']=='partial_translation' for n in rows)==57
    assert sum(bool(n.get('arabicFullText')) for n in rows)==79
    assert sum(bool(n.get('unnumberedFollowing')) for n in rows)==11
    raw=(ED/'progress-data.js').read_text()
    progress=json.loads(raw[raw.index('window.GNAMMA_'):].split('=',1)[1].strip().removesuffix(';'))
    assert progress['stage']=='113' and len(progress['stages'])==12
    assert len(progress['metrics'])==15
    metrics={n['id']:(n['current'],n['total']) for n in progress['metrics']}
    assert metrics['mafahim-notes']==(30,35) and metrics['mafahim-arabic']==(25,35)
    assert metrics['yazdi-photo']==(0,110) and metrics['later-full']==(0,274) and metrics['historical-proofs']==(0,46)
    assert progress['mafahimLedger']['partiallyTranslated']==[4,5,6,9,10]
    assert progress['mafahimLedger']['fullDigitizedArabicNotes']==[2]+list(range(12,36))
    md=(ED/progress['currentRelease']['allSectionsCumulativeMarkdown']).read_text()
    for n in rows:
        assert ('## '+n['id']+' — local note ') in md,n['id']
        assert n['english'] in md,n['id']
        assert n.get('arabicFullText',n['arabicLemma']) in md,n['id']
    assert 'HWN-MAFAHIM-036' in (ED/'HANDOFF_STAGE113.md').read_text()
    print('PASS Stage113: preserved every Stage112 source check;348 unique notes,291/57 English,79 full Arabic,11 unnumbered;0 fabricated photo certifications')

if __name__=='__main__':
    main()
