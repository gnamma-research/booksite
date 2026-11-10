#!/usr/bin/env python3
"""Build the shared reading apparatus from recorded editorial links and book text.

Word matching produces labelled lexical occurrences only. It never creates a
conceptual cross-reference. Paragraph identifiers are retained through text
corrections; additions receive new serials instead of renumbering later anchors.
"""
from pathlib import Path
import difflib
import hashlib
import json
import re
import unicodedata

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'data/study-index.json'
ANCHORS = ROOT / 'data/paragraph-anchors.json'
BOOKS = {'M': 'muzaffar-al-mantiq', 'B': 'bidayat-al-hikma', 'N': 'nihayat-al-hikma'}

def norm(s):
    s = unicodedata.normalize('NFD', str(s or ''))
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return s.replace('ـ','').translate(str.maketrans('إأآٱى','ااااي')).lower()

def clean(s):
    return re.sub(r'\*+', '', str(s)).strip()

def table_row(line):
    if '|' not in line: return None
    parts = re.split(r'(?<!\\)\|',line.strip())
    if line.strip().startswith('|'): parts.pop(0)
    if line.strip().endswith('|'): parts.pop()
    return [p.strip() for p in parts]

def paragraphs(value):
    lines = str(value or '').strip().splitlines(); result=[]; buf=[]; i=0
    def flush():
        if buf: result.append('\n'.join(buf)); buf.clear()
    while i < len(lines):
        if not lines[i].strip(): flush(); i+=1; continue
        h=table_row(lines[i]); r=table_row(lines[i+1]) if i+1<len(lines) else None
        if h and len(h)>1 and r and len(h)==len(r) and all(re.fullmatch(r':?-{3,}:?',c) for c in r):
            flush();i+=2
            while i<len(lines) and (row:=table_row(lines[i])) and len(row)==len(h): i+=1
        else: buf.append(lines[i]);i+=1
    flush();return result

def category(label):
    for group, words in [
      ('Divine reality and creation', ['necessary existent','first intellect','imaginal','true unity','separate intellect']),
      ('Knowledge and truth', ['knowledge','intellect','intelligible','soul','conception','assent','truth','fact of the matter','considered']),
      ('Universals and definition', ['definition','genus','species','differentia','predicate','universal','sign','expression','coextensiveness','proprium','descriptive','essential','accidental','verbal','explanatory','whether','what?']),
      ('Modality and causation', ['cause','causality','causal','necess','possibility','contingency','intrinsic','circular','regress','production','rule of the one']),
      ('Change and time', ['motion','time','rest','origin','beginningless','potency','potential']),
      ('Categories and composition', ['matter','form','quantity','quality','substance','accident','relation']),
      ('Unity and opposition', ['unity','contradiction','contrary','contrariety','privation','possession','opposition','correlation','predication'])]:
        if any(w in label.lower() for w in words): return group
    return 'Being and quiddity'

def main():
    old=json.loads(ANCHORS.read_text()) if ANCHORS.exists() else json.loads(OUT.read_text()) if OUT.exists() else {}
    corpus={k:json.loads((ROOT/slug/'data/book.json').read_text()) for k,slug in BOOKS.items()}
    source={u['id']:u for b in corpus.values() for u in b['units']}
    curated=json.loads((ROOT/'data/editorial-connections.json').read_text())
    metadata={}; pm={}; raw_paragraphs={}; lookup={}; retired=dict(old.get('retiredParagraphs',{}))
    for code,b in corpus.items():
      stages={str(s['id']):s for s in b['stages']}
      for u in b['units']:
        uid=u['id']; stage=stages[str(u['stage'])]
        authorial = u.get('authorialBook', stage.get('bookNumber'))
        if code=='M' and authorial is None: authorial=0 if u['stage']=='0' else 3 if u['stage'] in ['I','II','III'] else {'L':1,'K':2,'C':4,'V':5,'VI':6}.get(u['stage'])
        metadata[uid]={'id':uid,'title':u['title'],'arabicTitle':u['arabicTitle'],'stage':u['stage'],'stageTitle':stage['title'],'chapter':u.get('chapter'),'source':u.get('source',{}),'authorialBook':int(authorial) if authorial is not None else None}
        pm[uid]={}
        for lang,short in [('english','en'),('arabic','ar')]:
          ps=paragraphs(u.get(lang,'')); raw_paragraphs[(uid,lang)]=ps
          fingerprints=[hashlib.sha256(p.encode()).hexdigest() for p in ps]
          previous=old.get('paragraphs',{}).get(uid,{}).get(lang,[])
          serial=max([int(p['id'].rsplit('-',1)[1]) for p in previous]+[0])
          ids=[None]*len(ps)
          matcher=difflib.SequenceMatcher(a=[p['fingerprint'] for p in previous],b=fingerprints,autojunk=False)
          for op,a,b,c,d in matcher.get_opcodes():
            if op=='equal' or (op=='replace' and b-a==d-c):
              for oi,ni in zip(range(a,b),range(c,d)):ids[ni]=previous[oi]['id']
          for i in range(len(ps)):
            if ids[i] is None:serial+=1;ids[i]=f'para-{uid}-{short}-{serial:03}'
          for p in previous:
            if p['id'] not in ids:retired[p['id']]='passage-'+uid
          pm[uid][lang]=[{'id':id,'fingerprint':fp} for id,fp in zip(ids,fingerprints)]
          for i,id in enumerate(ids):lookup[id]={'unit':uid,'language':lang,'ordinal':i+1}
    def resolve(point):
      p=dict(point);uid=p['unit'];lang=p.get('language','english');quote=p.get('quote','')
      if uid not in source: raise ValueError('Missing target unit: '+uid)
      if quote:
        matches=[i for i,para in enumerate(raw_paragraphs[(uid,lang)]) if quote in para]
        if len(matches)!=1:raise ValueError(f'Anchor must be unique: {uid} {quote[:65]} ({len(matches)} matches)')
        p['paragraph']=pm[uid][lang][matches[0]]['id']
      return p
    links=[]
    for item in curated['links']:
      item=dict(item);item['from']=resolve(item['from']);item['to']=resolve(item['to']);links.append(item)
    terms=[]; replaced=set()
    for t in curated['terms']:
      t=dict(t);replaced.update(t.pop('replaces',[]));t['discussions']=[resolve(p) for p in t.get('discussions',[])];t['recordedReferences']=[];t['bookDefinitions']=[];terms.append(t)
    by_label={t['label'].lower():t for t in terms}
    replacement_map={name:t for original,t in zip(curated['terms'],terms) for name in original.get('replaces',[])}
    # Keep separate meanings apart; only merge the same explicitly named entry.
    for code,b in corpus.items():
      entries=list(b.get('glossary',[]))
      if code=='N':entries+=json.loads((ROOT/BOOKS['N']/'data/editorial-supplement.json').read_text()).get('glossary',[])
      for e in entries:
        label=e.get('english') or e.get('term'); key=label.lower()
        target=replacement_map.get(label) or by_label.get(key)
        if not target:
          slug=re.sub('[^a-z0-9]+','-',norm(label)).strip('-')
          target={'id':'term-'+slug,'label':label,'arabic':e.get('arabic',''),'transliteration':e.get('term',''),'definition':e.get('definition',''),'category':category(label),'aliases':[],'discussions':[],'recordedReferences':[],'bookDefinitions':[]}
          terms.append(target);by_label[key]=target
        for alias in [e.get('arabic',''),e.get('english',''),e.get('term','')]:
          if alias and alias not in target['aliases']:target['aliases'].append(alias)
        definition={'book':code,'definition':e.get('definition','')}
        if definition not in target['bookDefinitions']:target['bookDefinitions'].append(definition)
        uid=e.get('passageId')
        if not uid:
          match=re.search(r'#(?:passage-)?([MBN]-[A-Z0-9-]+)',e.get('sourceUrl',''))
          if match:uid=match.group(1)
        if uid in source and not any(r['unit']==uid for r in target['recordedReferences']):target['recordedReferences'].append({'unit':uid,'provenance':'Explicit location recorded in the existing edition glossary.'})
    # Broad combined entries retain their own definitions. They are not silently
    # substituted for the single, technically distinguished senses above.
    records=[]
    for (uid,lang),ps in raw_paragraphs.items():
      for i,p in enumerate(ps):records.append((uid,lang,pm[uid][lang][i]['id'],clean(p),norm(clean(p))))
    for t in terms:
      aliases=set([t['label'],t['arabic'],t['transliteration'],*t['aliases']]); en=[];ar=[]
      for alias in aliases:
        for bit in re.split(r'\s*/\s*|\s*;\s*',alias):
          n=norm(bit).strip()
          if len(n)<3:continue
          if re.search(r'[\u0621-\u064a]',n):
            # Article and conjunction prefixes are allowed, not arbitrary stems.
            words=n.split();pieces=[]
            for w in words:
              w=re.sub('^ال','',w);pieces.append(r'(?:ال)?'+re.escape(w))
            ar.append(r'(?<![\u0621-\u064a])(?:[وفبلك])?'+r'\s+'.join(pieces)+r'(?![\u0621-\u064a])')
          else:en.append(r'(?<![a-z])'+re.escape(n)+r'(?:s)?(?![a-z])')
      patterns={'english':re.compile('|'.join(en)) if en else None,'arabic':re.compile('|'.join(ar)) if ar else None};hits=[]
      for uid,lang,pid,p,n in records:
        pattern=patterns[lang]
        match=pattern.search(n) if pattern else None
        if match:
          # Use the opening sentence rather than pretending normalized offsets
          # are reliable offsets into the marked Arabic original.
          snippet=p[:200]+('…' if len(p)>200 else '')
          hits.append({'unit':uid,'paragraph':pid,'language':lang,'snippet':snippet})
      t['occurrences']=hits;t['aliases']=sorted(set(t['aliases']));t['reviewStatus']='reviewed-discussions-and-separately-labelled-lexical-matches'
    terms.sort(key=lambda t:t['label'].casefold())
    occurrence_total=sum(len(t['occurrences']) for t in terms)
    occurrence_dir=ROOT/'data/occurrences';occurrence_dir.mkdir(exist_ok=True)
    for term in terms:
      occurrences=term.pop('occurrences')
      term['occurrenceCounts']={code:sum(h['unit'].startswith(code+'-') for h in occurrences) for code in BOOKS}
      (occurrence_dir/(term['id']+'.json')).write_text(json.dumps(occurrences,ensure_ascii=False,separators=(',',':'))+'\n')
    ANCHORS.write_text(json.dumps({'paragraphs':pm,'retiredParagraphs':retired},ensure_ascii=False,separators=(',',':'))+'\n')
    compact_pm={uid:{lang:[{'id':row['id']} for row in rows] for lang,rows in langs.items()} for uid,langs in pm.items()}
    result={'schema':1,'generated':'2026-11-10','policy':curated['policy'],'books':{k:{'title':b['title'],'slug':BOOKS[k],'units':len(b['units'])} for k,b in corpus.items()},'units':metadata,'paragraphs':compact_pm,'retiredParagraphs':retired,'links':links,'terms':terms,'authorialMap':json.loads((ROOT/BOOKS['M']/'data/authorial-map.json').read_text())}
    OUT.parent.mkdir(exist_ok=True);OUT.write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n')
    print(json.dumps({'units':len(metadata),'paragraphs':len(lookup),'terms':len(terms),'curatedLinks':len(links),'lexicalOccurrences':occurrence_total,'bytes':OUT.stat().st_size}))

if __name__=='__main__': main()
