#!/usr/bin/env python3
"""Apply H2014 printed comparison as a source-preserving reading layer.

The electronic A/N Arabic remains verbatim in each unit['arabic'].
Selected H2014 corrections appear only in unit['readingArabic'].
This is not an independently collated manuscript edition.
"""
from __future__ import annotations
import hashlib
import json
import pathlib
import re
from bs4 import BeautifulSoup
from qawtaw7_patchmap import A,E

ROOT=pathlib.Path(__file__).resolve().parent.parent
DOSSIER=ROOT/'qa/qawtaw6-comparator-dossier.html'

def sha(s):
    return hashlib.sha256(s.encode('utf-8')).hexdigest()

def dump(path,obj):
    (ROOT/path).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

def parse_module(path):
    s=(ROOT/path).read_text(encoding='utf-8')
    if path=='data/units.js':
        a=s.index('{')
    elif '.concat(' in s:
        a=s.index('.concat(')+len('.concat(')
    else:
        m=re.search(r'window\.GNAMMA_\w+\s*=\s*',s)
        if not m:raise AssertionError('Unexpected module '+path)
        a=m.end()
    while s[a].isspace():a+=1
    obj,n=json.JSONDecoder().raw_decode(s[a:])
    return s,a,a+n,obj

def parse_dossier():
    soup=BeautifulSoup(DOSSIER.read_text(encoding='utf-8'),'html.parser')
    rows=[]
    for x in soup.select('article.record'):
        h=x.select_one('h2').get_text(' ',strip=True)
        number=int(h.split('·')[0].strip())
        unit=h.split('·')[1].strip()
        meta=x.select_one('.meta')
        links=[a['href'] for a in meta.select('a[href]') if '.pdf' in a['href']]
        vals=[v for v in x.find_all('div',recursive=False)
              if 'field' not in (v.get('class') or [])]
        assert len(vals)==6,(unit,len(vals))
        rows.append({
          'number':number,'unit':unit,'status':x.get('data-status'),
          'originalArabic':vals[0].get_text(' ',strip=True),
          'originalEnglish':vals[1].get_text(' ',strip=True),
          'earlierDiagnosis':vals[2].get_text(' ',strip=True),
          'proposedReading':vals[3].get_text(' ',strip=True),
          'interpretation':vals[4].get_text(' ',strip=True),
          'editorialDecision':vals[5].get_text(' ',strip=True),
          'sourceUrl':links[0].split('#')[0] if links else None,
          'hLocators':re.findall(r'H2014/[12]:\d+',meta.get_text(' ',strip=True))
        })
    assert len(rows)==57 and [x['number'] for x in rows]==list(range(1,58))
    return rows

def apply():
    cases=parse_dossier()
    paths=['data/units.js','data/commentary.js','data/commentary-conclusion.js']
    paths += ['data/commentary-introduction-%d.js'%i for i in range(1,5)]
    paths += ['data/commentary-main-001-019.js','data/commentary-main-020-060.js']
    loaded=[]
    allunits={}
    for p in paths:
        source,a,b,obj=parse_module(p)
        units=obj['units'] if isinstance(obj,dict) else obj
        for u in units:
            if u['id'] in allunits:raise AssertionError('Duplicate '+u['id'])
            allunits[u['id']]=u
        loaded.append((p,source,a,b,obj))
    assert len(allunits)==171
    report=[]
    changed=set()
    ar_edits=en_edits=0
    for row in cases:
        k=row['number'];uid=row['unit'];u=allunits[uid]
        original=u['arabic'];preferred=u.get('readingArabic',original);english=u['english']
        previous=u.setdefault('witnessComparisons',[])
        if any(q.get('stage')=='Qawtaw7' and q.get('number')==k for q in previous):
            raise AssertionError('Already applied H2014 item: '+str(k))
        ar_changes=[]
        en_changes=[]
        for old,new in A.get(k,[]):
            if not old or old==new:continue
            if preferred.count(old)!=1:raise AssertionError((uid,'Arabic needle',old,preferred.count(old)))
            preferred=preferred.replace(old,new,1)
            ar_changes.append({'before':old,'after':new})
        for old,new in E.get(k,[]):
            if not old or old==new:continue
            if english.count(old)!=1:raise AssertionError((uid,'English needle',old,english.count(old)))
            english=english.replace(old,new,1)
            en_changes.append({'before':old,'after':new})
        if preferred!=original:u['readingArabic']=preferred
        u['english']=english
        witness={
          'stage':'Qawtaw7','number':k,'status':row['status'],
          'printedComparator':'H2014','sourceUrl':row['sourceUrl'],
          'sourceLocations':row['hLocators'],'sourceExcerpt':row['originalArabic'],
          'preferredReading':row['proposedReading'],
          'interpretation':row['interpretation'],
          'editorialDecision':row['editorialDecision'],
          'sourceStrength':'Typeset medieval quotation in modern printed commentary, no independent manuscript collation',
          'manuscriptCollation':False
        }
        previous.append(witness)
        note='Qawtaw7 / H2014 '+', '.join(row['hLocators'])+': '+row['status'].replace('-',' ')+'. Preferred: «'+row['proposedReading']+'». '+row['editorialDecision']+' The A/N electronic wording remains preserved in the witness apparatus.'
        if note not in u.get('notes',[]):u.setdefault('notes',[]).append(note)
        if ar_changes or en_changes:changed.add(uid)
        ar_edits+=len(ar_changes);en_edits+=len(en_changes)
        report.append({**row,'arabicChanges':ar_changes,'englishChanges':en_changes,
                       'originalArabicSHA256':sha(original),
                       'readingArabicSHA256':sha(preferred),
                       'changesApplied':bool(ar_changes or en_changes)})
    for path,s,a,b,obj in loaded:
        (ROOT/path).write_text(s[:a]+json.dumps(obj,ensure_ascii=False,indent=2)+s[b:],encoding='utf-8')
    for path in sorted((ROOT/'data').glob('main-commentary-*.en.json')):
        ob=json.loads(path.read_text(encoding='utf-8'))
        anychange=False
        for u in ob.get('units',[]):
            if u['id'] in allunits and allunits[u['id']].get('witnessComparisons'):
                canon=allunits[u['id']]
                u['english']=canon['english']
                u['notes']=canon.get('notes',[])
                anychange=True
        if anychange:
            path.write_text(json.dumps(ob,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    dump('qa/qawtaw7-witness-register.json',{
      'schema':'gnamma-qawtaw7-two-witness-register',
      'sourceBaseline':'Unmodified original A/N electronic transcription',
      'comparator':'H2014 typeset medieval quotation layer',
      'date':'2026-11-11','independentManuscriptsCollated':0,
      'records':report
    })
    summary={
      'totalFlags':57,'supportedPrinted':sum(x['status']=='supported-reading' for x in cases),
      'interpretivelyResolved':sum(x['status']=='resolved-interpretation' for x in cases),
      'partiallyResolved':sum(x['status']=='partial-resolution' for x in cases),
      'unresolved':sum(x['status']=='unresolved' for x in cases),
      'unrecoveredLacuna':sum(x['status']=='deferred-lacuna' for x in cases),
      'arabicReadingEdits':ar_edits,'englishEdits':en_edits,
      'affectedUnits':len(changed),'originalArabicPreserved':True,
      'independentManuscriptsCollated':0
    }
    dump('qa/qawtaw7-edit-report.json',summary)
    print(json.dumps(summary,ensure_ascii=False))
    assert ar_edits==53 and en_edits==16 and len(changed)==42

if __name__=='__main__':apply()
