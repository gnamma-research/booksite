#!/usr/bin/env python3
"""Tahdhīb Stage109 exact source/translation status, prefatory section and new numbering boundary.
Preserve all prior stages and prevent wrongly renumbering H-INTRO local note1 as preface note141.
"""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]/'texts/al-taftazani/tahdhib-al-mantiq/edition'

def read(name):
 s=(ROOT/name).read_text(encoding='utf-8')
 assert 'window.GNAMMA_' in s,name
 return json.loads(s[s.index('window.GNAMMA_'):].split('=',1)[1].strip().removesuffix(';'))

def audit():
 a=read('hawashi-numbered-notes-stage104.js')
 b=read('hawashi-numbered-notes-stage105.js')
 batches=[read(f'hawashi-numbered-notes-stage106{x}.js') for x in 'abcd']+[
  read(f'hawashi-numbered-notes-stage107{x}.js') for x in 'abcdef']+[
  read(f'hawashi-numbered-notes-stage108{x}.js') for x in 'ab']+[
  read('hawashi-numbered-notes-stage109a.js')]
 assert [len(batch['notes']) for batch in batches]==[7,10,6,9,10,10,10,10,8,7,6,10,14]
 assert [batch['stage'] for batch in batches]==['106']*4+['107']*6+['108']*2+['109']
 assert a['fullPrintedPagesTranslated']==0 and a['photoCollated'] is False
 assert b['fullPageTranslationsAdded']==0
 by_id={n['id']:n for n in a['entries']}
 assert [n['noteNumber'] for n in b['overrides']]==[2,8,9,12,15]
 assert [n['noteNumber'] for n in b['appends']]==[19,20,21,22,23]
 for n in b['overrides']:
  assert n['id'] in by_id and by_id[n['id']]['status']=='partial_translation'
  by_id[n['id']]=n
 for n in b['appends']:
  assert n['id'] not in by_id
  by_id[n['id']]=n
 for batch in batches:
  for n in batch['notes']:
   assert n['id'] not in by_id,n['id']
   by_id[n['id']]=n
 notes=sorted(by_id.values(),key=lambda x:x['noteNumber'])
 assert len(notes)==140
 assert [n['id'] for n in notes]==[f'HWN-{i:03}' for i in range(1,141)]
 complete=[n['noteNumber'] for n in notes if n['status']=='complete_searchable_note']
 partial=[n['noteNumber'] for n in notes if n['status']=='partial_translation']
 assert len(complete)==136 and partial==[1,25,82,90]
 fullArabic=[n['noteNumber'] for n in notes if n.get('arabicFullText')]
 assert fullArabic==list(range(24,76))+[114,115]
 assert [n['noteNumber'] for n in notes if n.get('unnumberedFollowing')]==[47,48,71,86,90,112]
 for n in notes:
  assert n.get('scanCertified') is False,n['id']
  assert n['pages'] and len(n['pages'])==len(n['sourceUrls'])
  assert set(n['pages'])<=set(range(127,165))
  assert all(n.get(k) for k in ('id','arabicLemma','english','speaker','editorial','status'))
  assert len(n['english'].split())>10 or (n['noteNumber']==44 and 'verse 22' in n['english']),n['id']
  for page,url in zip(n['pages'],n['sourceUrls']):
   assert url in (f'https://ablibrary.net/book_content/b/12170/{page}',
                  f'https://ablibrary.net/book_content/b/12170/{page}?lang=ar'),n['id']
  if n.get('arabicFullText'):
   assert n['arabicSourceStatus']=='searchable_Qum_diplomatic_first_pass'
  if n.get('unnumberedFollowing'):
   u=n['unnumberedFollowing']
   assert u['speaker'] and u['ar'] and u['en']
 assert notes[-1]['noteNumber']==140 and notes[-1]['pages']==[163,164]
 stage109=batches[-1]
 assert stage109['sectionId']=='H-PREFACE' and stage109['printedRange']=='161–164'
 assert [n['noteNumber'] for n in stage109['notes']]==list(range(127,141))
 assert all(n['sectionId']=='H-PREFACE' and n['arabicSourceStatus']=='short_lemma_only'
            and n['scanCertified'] is False for n in stage109['notes'])
 # At Q165 the source numbering RESTARTS at local (1), do not insert as 141:
 assert not any(n['noteNumber']==141 or n['id']=='HWN-141' for n in notes)
 p=read('progress-data.js')
 assert p['stage']=='109'
 assert p['noteLedger']['range']=='H-PREFACE: HWN-001–HWN-140'
 assert p['noteLedger']['fullyTranslatedFirstPass']==complete
 assert p['noteLedger']['partiallyTranslated']==partial
 assert p['noteLedger']['arabicFullSearchableNotes']==fullArabic
 assert p['noteLedger']['sourcePhotographed'] is False
 assert p['noteLedger']['prefaceSectionClosedAtPrintedPage']==164
 nxt=p['noteLedger']['nextSection']
 assert nxt['id']=='H-INTRO' and nxt['printedStartPage']==165 and nxt['localFirstNote']==1
 assert nxt['stableFirstId']=='HWN-INTRO-001' and nxt['notesTranslated']==0
 assert [int(s['id']) for s in p['stages']]==list(range(102,110))
 assert [(s['fullNoteCount'],s['partialNoteCount']) for s in p['stages'][-3:]]==[
  (106,4),(122,4),(136,4)]
 for st in p['stages']:
  assert st['files'] and all((ROOT/name).is_file() for name in st['files']),st['id']
  if st.get('report'):assert (ROOT/st['report']).is_file(),st['report']
 metrics={m['id']:(m['current'],m['total']) for m in p['metrics']}
 expected={'logic-matn':(19,19),'yazdi-first-pass':(110,110),'yazdi-photo':(0,110),
           'later-sampled':(52,274),'later-full':(0,274),'opening-notes':(136,140),
           'numbered-arabic':(54,140),'historical-classes':(46,46),'historical-proofs':(0,46)}
 assert metrics==expected,(metrics,expected)
 assert p['baseline']['laterGlossPages']==274
 assert p['baseline']['laterSampledPages']==52
 for name in ['HANDOFF_LATEST.md','progress.html','hawashi-numbered-notes.html',
              'stages/STAGE109_PREFACE_COMPLETION_AND_RESET.md',
              'batches/hawashi-preface-numbered-cumulative-hwn001-140.md',
              'batches/hawashi-numbered-cumulative-hwn001-126.md',
              'batches/yazdi-main-batch-01-q7-66.md','batches/yazdi-main-batch-02-q67-123.md']:
  assert (ROOT/name).is_file(),name
 handoff=(ROOT/'HANDOFF_LATEST.md').read_text(encoding='utf-8')
 for token in ('Stage109','Stage110','136/140','54/140','0/274','0/110','HWN-INTRO-001','Qum p165'):
  assert token in handoff,token
 browser=(ROOT/'hawashi-numbered-notes.html').read_text(encoding='utf-8')
 for name in ['stage104.js','stage105.js',*['stage106'+c+'.js' for c in 'abcd'],
              *['stage107'+c+'.js' for c in 'abcdef'],*['stage108'+c+'.js' for c in 'ab'],'stage109a.js']:
  assert 'hawashi-numbered-notes-'+name in browser,name
 assert 'NEW section' in browser and 'Qum p.165' in browser
 assert 'progress-data.js?v=20261109-109' in (ROOT/'progress.html').read_text()
 md=(ROOT/'batches/hawashi-preface-numbered-cumulative-hwn001-140.md').read_text()
 assert md.count('## Note ')==140
 assert md.count('### Separately attributed UNNUMBERED gloss')==6
 assert len(md)>255000
 for n in range(1,141):assert f'## Note {n} —' in md
 assert 'حواشي مقدمة علم المنطق' in md and 'HWN-INTRO-001' in md
 previous=sum((read('hawashi-q'+x+'-data.js')['entries'] for x in ('125-139','140-154','155-178')),[])
 assert [n['page'] for n in previous]==list(range(125,179))
 assert sum(n['type']=='selection' for n in previous)==52
 assert all(n['fullPageTranslated'] is False and n['photoCollated'] is False for n in previous)
 print('PASS Stage109: 140 prefatory notes; 136 English first-pass, 4 partial; 54 working Arabic; Q165 new section note1 reserved; 9 honest metrics, eight immutable stages; 0 certified printed pages')

if __name__=='__main__':
 audit()
