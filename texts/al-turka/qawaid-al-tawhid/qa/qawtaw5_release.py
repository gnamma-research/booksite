#!/usr/bin/env python3
"""Apply the recorded model-assisted comparison; never alter Arabic or infer review from hashes."""
from __future__ import annotations
import argparse, collections, hashlib, json, pathlib, re, subprocess
ROOT=pathlib.Path(__file__).resolve().parent.parent
DATE='2026-11-11'
PARTS=['1','2','3a','3b','4a','4b1','4b2','5a','5b']
STATUS=['checked','checked-with-note','corrected','corrected-with-note','corrected-with-source-crux','unresolved-reading']
EXPECTED='ae75f9fdd3830e63cbbc4991a1b3e2cbb192c76066854537b72b1a335efb1754'
def digest(s):return hashlib.sha256(s.encode() if isinstance(s,str) else s).hexdigest()
def read(p):return (ROOT/p).read_text(encoding='utf-8')
def obj(p):return json.loads(read(p))
def write(p,s):
 p=ROOT/p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s,encoding='utf-8')
def dump(p,o):write(p,json.dumps(o,ensure_ascii=False,indent=2)+'\n')
def assigned(p):
 s=read(p)
 if '.concat(' in s: start=s.index('.concat(')+len('.concat(')
 else:
  m=re.search(r'window\.GNAMMA_\w+\s*=\s*',s)
  if not m:raise ValueError('Not a JSON source module: '+str(p))
  start=m.end()
 while s[start].isspace():start+=1
 o,n=json.JSONDecoder().raw_decode(s[start:]);return s,start,start+n,o

def reconstruct():
 target='qa/qawtaw5-review.json'
 if (ROOT/target).exists():r=obj(target)
 else:
  ledger={u['id']:u for u in obj('qa/clause-ledger.json')['units']}
  r={'schema':'gnamma-model-assisted-clause-review-v2','date':DATE,'scope':'Detailed Arabic-to-English comparison against the retained electronic transcriptions; not independent human specialist or manuscript certification.','units':[],'additionalArabicSegmentsCompared':3759}
  for part in PARTS:
   rows=obj('qa/qawtaw5-review-part'+part+'.json')
   # Repair a transcription-of-the-review transport typo, not the reviewed Arabic.
   # The complete expanded-record checksum below independently guards every field.
   for row in rows:
    if row[0]=='SH-054' and row[1][2][0]==5:
     assert row[1][2][1:4]==[12,5,5]
     row[1][2][0]=9
     dump('qa/qawtaw5-review-part'+part+'.json',rows)
    uid,groups,corrections,notes=row;u=ledger[uid]
    r['units'].append({'id':uid,'arabicSha256':u['arabicSha256'],'englishSha256Before':u['englishSha256'],'sourceLocator':u['sourceLocator'],'groups':[dict(arStart=a,arEnd=b,enStart=c,enEnd=d,status=STATUS[k],note=n) for a,b,c,d,k,n in groups],'corrections':corrections,'notes':notes})
 if digest(json.dumps(r,ensure_ascii=False,sort_keys=True,separators=(',',':')))!=EXPECTED:raise ValueError('Review transfer fingerprint mismatch; stop rather than infer missing decisions')
 assert len(r['units'])==85 and sum(len(u['corrections']) for u in r['units'])==36
 dump(target,r);return r

def apply():
 r=reconstruct();review={u['id']:u for u in r['units']}
 prot={p:digest((ROOT/p).read_bytes()) for p in ['data/units.js','data/parallel-matn.md']}
 modules=[f'data/commentary-introduction-{i}.js' for i in range(1,5)]+['data/commentary-main-001-019.js','data/commentary-main-020-060.js']
 found={};changes=[]
 for p in modules:
  s,a,b,units=assigned(p);assert isinstance(units,list)
  for u in units:
   uid=u['id']
   if uid not in review:continue
   v=review[uid];assert digest(u['arabic'])==v['arabicSha256'],uid+' Arabic changed'
   original=u['english'];after=original
   if digest(original)==v['englishSha256Before']:
    for c in v['corrections']:
     assert after.count(c['old'])==1,(uid,'patch old string not unique',c['old'])
     after=after.replace(c['old'],c['new'])
   else:
    # Idempotent acceptance is exact: reverse each known edit and verify baseline hash.
    before=original
    for c in reversed(v['corrections']):
     assert before.count(c['new'])==1,(uid,'unexpected edited source')
     before=before.replace(c['new'],c['old'])
    assert digest(before)==v['englishSha256Before'],uid+' source drift'
   assert len(re.split(r'(?<=[.!?;])\s+',after.strip()))==len(re.split(r'(?<=[.!?;])\s+',original.strip())),uid+' sentence boundaries changed'
   u['english']=after
   notes=list(u.get('notes',[]))
   if uid=='SH-002':notes=[n for n in notes if 'The English bracket gives the contextual reading' not in n]
   extra=v['notes']+[f"Electronic-text comparison ({DATE}): "+g['note'] for g in v['groups'] if g['status']=='unresolved-reading']
   for n in extra:
    if n not in notes:notes.append(n)
   u['notes']=notes
   u['comparativeReview']={'date':DATE,'method':'model-assisted editorial Arabic-English comparison','coverage':'all recorded Arabic punctuation segments','manuscriptCollation':False,'independentHumanCertification':False,'hasUnresolvedReadings':any(g['status']=='unresolved-reading' for g in v['groups'])}
   found[uid]=u
   for c in v['corrections']:changes.append({'id':uid,'sourceLocator':v['sourceLocator'],**c})
  write(p,s[:a]+json.dumps(units,ensure_ascii=False,indent=2)+s[b:])
 assert set(found)==set(review)
 # Keep the English draft sources identical to the canonical JS modules.
 for p in sorted((ROOT/'data').glob('main-commentary-*.en.json')):
  o=json.loads(p.read_text(encoding='utf-8'));changed=False
  for u in o['units']:
   if u['id'] in found:
    revised=found[u['id']];u['english']=revised['english'];u['notes']=revised['notes'];changed=True
  if changed:p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 decisions=obj('qa/clause-review-adjudications-2026-11-09.json')
 byid={u['id']:u for u in decisions['units']}
 for v in r['units']:
  byid[v['id']]={'id':v['id'],'reviewerType':'model-assisted-editorial','reviewDate':DATE,'groups':v['groups']}
 decisions.update(schema='gnamma-cumulative-electronic-review-v2',date=DATE,reviewScope='All 171 extant bilingual units and 5,520 Arabic punctuation-derived segments have recorded comparative decisions against retained electronic Arabic; unresolved readings remain explicit. This is not independent manuscript collation or human specialist certification.',method='Model-assisted editorial comparison, not proportional automatic alignment. The 86 inherited records are retained as prior project review, not independently human-certified. Punctuation fragments may include quotation ellipses and are not always syntactic clauses.',units=list(byid.values()),claimedManuallyComparedArabicClauses=5520,comparedArabicSegments=5520,independentHumanCertification=False,noWitnessesCollated=True,issues='Complete working-text comparative coverage; unresolved textual cruces and QT-059 omission remain open.')
 assert len(decisions['units'])==171
 dump('qa/clause-review-adjudications-2026-11-09.json',decisions)
 dump('qa/qawtaw5-corrections.json',changes)
 lines=['# Qawtaw 5 — translation corrections','', '11 November 2026. Model-assisted comparison with retained electronic Arabic. All Arabic is unchanged; source cruces remain open.','']
 for i,c in enumerate(changes,1):
  lines += [f"## {i}. {c['id']} — {c['sourceLocator']}",'', '**Before:** '+c['old'],'','**Revised:** '+c['new'],'','**Reason:** '+c['reason'],'']
 write('editorial/QAWTAW5_CORRECTIONS_2026-11-11.md','\n'.join(lines))
 dump('qa/qawtaw5-protected-inputs.json',prot)
 for p,h in prot.items():assert digest((ROOT/p).read_bytes())==h,p+' changed'
 # Make the old workflow entry point call the current truthful ledger generator.
 write('qa/generate-clause-ledger.mjs',"#!/usr/bin/env node\nimport {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';import path from 'node:path';\nconst p=path.join(path.dirname(fileURLToPath(import.meta.url)),'qawtaw5_release.py');const r=spawnSync('python3',[p,'--ledger'],{stdio:'inherit'});process.exit(r.status??1);\n")
 # Publication labels: original translation date remains historical; review release is explicit.
 p='data/commentary-corpus.js';s=read(p);s=s.replace("updated:'2026-11-04'","updated:'2026-11-11'").replace('"updated": "2026-11-04"','"updated": "2026-11-11"');write(p,s)
 p='pdf/build_editions.py';s=read(p).replace("revision='2026-11-04'","revision='2026-11-11-qawtaw5'");write(p,s)
 p='qa/finalize-reading-edition.py';s=read(p)
 old="page=page.replace('href=\"./\"','href=\"'+base+'\"')"
 new="page=page.replace('href=\"clause-review.html\"','href=\"'+base+'clause-review.html\"').replace('href=\"./\"','href=\"'+base+'\"')"
 if old in s:write(p,s.replace(old,new))
 update_ui()
 print(json.dumps({'applied':True,'newComparedUnits':85,'newArabicSegments':3759,'wordingChanges':len(changes),'arabicUnchanged':True}))

def update_ui():
 p='clause-review.html';s=read(p)
 s=s.replace('distinguishes manually reviewed clauses from automatic candidate alignments.','records model-assisted comparison and unresolved readings separately from manuscript verification.')
 start=s.index('<p class="intro">');end=s.index('</p>',start)+4
 s=s[:start]+'<p class="intro">All <strong>5,520 Arabic punctuation-derived segments in 171 units</strong> have recorded Arabic–English comparison. This is <strong>model-assisted editorial review of retained electronic transcriptions</strong>, not independent human specialist certification or manuscript collation. “Compared” includes explicitly unresolved readings; it does not mean every source word is certain. Punctuation fragments are not always complete syntactic clauses. <a href="editorial/QAWTAW5_CUMULATIVE_HANDOFF_2026-11-11.md">Release and limitations</a>.</p>'+s[end:]
 s=s.replace('Manually reviewed proportion','Compared proportion, not an accuracy score').replace('>Manually reviewed<','>Compared<').replace("'✓ Manually inspected'","'Compared · '+r.reviewStatus").replace('individually inspected','compared').replace('English candidate alignment','Recorded English correspondence')
 old="  const response=await Promise.all(files.map(async url=>{const r=await fetch(url,{cache:'no-cache'});if(!r.ok)throw Error(url+': HTTP '+r.status);return r.text()}));\n  for(const text of response)for(const line of text.trim().split('\\n')){const r=JSON.parse(line);all.push(r);if(!byUnit.has(r.unit))byUnit.set(r.unit,[]);byUnit.get(r.unit).push(r)}"
 new="  const response=await fetch('qa/clause-ledger.json',{cache:'no-cache'});if(!response.ok)throw Error('Ledger: HTTP '+response.status);const ledger=await response.json();\n  for(const u of ledger.units)for(const a of u.arabicClauses){const status=a.review.status;const r={id:u.id+'-C'+String(a.n).padStart(3,'0'),unit:u.id,source:u.sourceLocator,arabic:a.text,englishCandidate:a.englishCorrespondence||'',manualReviewStatus:status!=='not-yet-individually-reviewed',reviewStatus:status,reviewNote:a.review.note||'',flags:a.riskMarkers||[]};all.push(r);if(!byUnit.has(r.unit))byUnit.set(r.unit,[]);byUnit.get(r.unit).push(r)}"
 if old in s:s=s.replace(old,new)
 elif "for(const u of ledger.units)" not in s:raise ValueError('Unexpected review reader loader')
 s=s.replace('<option value="pending">Not yet reviewed</option>','<option value="pending">Not yet reviewed</option><option value="unresolved">Unresolved source reading</option>')
 needle="  if(filter==='pending'&&x.manualReviewStatus)return false;"
 if "if(filter==='unresolved'" not in s:s=s.replace(needle,needle+"\n  if(filter==='unresolved'&&!/unresolved|crux/.test(x.reviewStatus))return false;")
 s=s.replace("(r.manualReviewStatus?'reviewed':'pending')","(/unresolved|crux/.test(r.reviewStatus)?'pending':(r.manualReviewStatus?'reviewed':'pending'))")
 write(p,s)
 for p in ['index.html','commentary.html']:
  s=read(p)
  if 'id="qawtaw5-release"' not in s:
   banner='<p id="qawtaw5-release" class="help-copy" style="max-width:76rem;margin:1rem auto;padding:0 1rem">11 November 2026: complete electronic-text comparison, 171/171 units. <a href="clause-review.html">Review records</a> · <a href="editorial/QAWTAW5_CUMULATIVE_HANDOFF_2026-11-11.md">Corrections and remaining uncertainties</a>. Not a manuscript-collated edition.</p>'
   s=s.replace('<main>',banner+'\n<main>',1)
  write(p,s)

def units():
 _,_,_,m=assigned('data/units.js');return [{**u,'part':'matn'} for u in m['units']]+obj('data/commentary-corpus.json')['units']
def split(s,ar):
 pattern=r'(?<=[،؛.!؟])\s+' if ar else r'(?<=[.!?;])\s+'
 out=[];pos=0
 for i,t in enumerate(re.split(pattern,s.strip())):
  t=t.strip()
  if not t:continue
  start=s.index(t,pos);pos=start+len(t);out.append(dict(n=len(out)+1,startChar=start,endChar=pos,text=t))
 return out

def ledger():
 ds=obj('qa/clause-review-adjudications-2026-11-09.json');dm={u['id']:u for u in ds['units']};out=[];counts=collections.Counter();groups=collections.Counter();crux=[]
 md=['# Qawāʿid / Tamhīd — complete electronic-text comparative review','','**11 November 2026.** All 171 extant bilingual units have recorded comparison: 61 matn and 110 commentary units, 5,520 Arabic punctuation-derived segments. This model-assisted editorial review is not independent human specialist certification, manuscript collation, or proof that the underlying Arabic transmission is complete. Compared includes unresolved readings. QT-059 remains deferred.','','## Per-unit decisions','']
 for u in units():
  ar=split(u['arabic'],True);en=split(u['english'],False);decision=dm[u['id']];seen=set();loc=u.get('sourceLocator') or 'A pp. '+'–'.join(map(str,u.get('pages',[])))
  md+=['### '+u['id']+' — '+loc,'','| Arabic segments | English sentences | Result | Editorial finding |','|---|---|---|---|']
  for g in decision['groups']:
   a,b,c,d=g['arStart'],g['arEnd'],g['enStart'],g['enEnd'];assert 1<=a<=b<=len(ar) and 1<=c<=d<=len(en),(u['id'],g)
   assert not seen.intersection(range(a,b+1)),u['id']+' overlap';seen.update(range(a,b+1));counts[g['status']]+=b-a+1;groups[g['status']]+=1
   for n in range(a,b+1):ar[n-1].update(review={'status':g['status'],'englishSentenceStart':c,'englishSentenceEnd':d,'note':g['note']},englishCorrespondence=' '.join(x['text'] for x in en[c-1:d]),riskMarkers=[])
   note=g['note'].replace('|','\\|').replace('\n',' ');md.append(f"| {a}–{b} | {c}–{d} | {g['status']} | {note} |")
   if 'unresolved' in g['status'] or 'crux' in g['status']:crux.append({'id':u['id'],'sourceLocator':loc,'sourceUrl':u.get('sourceUrl',u.get('url')),'arabicSegmentRange':[a,b],'arabic':' '.join(x['text'] for x in ar[a-1:b]),'english':' '.join(x['text'] for x in en[c-1:d]),**g})
  assert len(seen)==len(ar),u['id']+' incomplete';md.append('')
  out.append(dict(id=u['id'],part=u.get('part'),matnId=u.get('matnId'),sourceEdition=u.get('sourceEdition','A'),sourceLocator=loc,sourceUrl=u.get('sourceUrl',u.get('url')),arabicSha256=digest(u['arabic']),englishSha256=digest(u['english']),arabicClauses=ar,englishSentences=en,manualComparativeReview=True,reviewMethod='model-assisted-editorial; legacy field manualComparativeReview denotes recorded comparison only',sourceWarnings=len(u.get('notes',[]))))
 total=sum(len(u['arabicClauses']) for u in out);assert total==5520 and len(out)==171
 summary=dict(schema='gnamma-clause-inventory-v2',date=DATE,totalBilingualUnits=171,originalMatnUnits=61,commentaryUnits=110,totalArabicPunctuationClauses=total,totalEnglishSentenceCandidates=sum(len(u['englishSentences']) for u in out),individuallyComparedArabicPunctuationClauses=total,individuallyComparedUnits=171,NOTIndividuallyComparedArabicClauses=0,statuses=dict(counts),groupStatuses=dict(groups),unresolvedOrSourceCruxGroups=len(crux),independentManuscriptsCollated=0,independentHumanCertification=False,editorialLimit='Complete comparison coverage is not certainty of every reading. Punctuation segments may be fragments. Retained electronic Arabic only; QT-059 lacuna deferred. No new manuscript or source-image collation.')
 dump('qa/clause-ledger.json',dict(summary=summary,units=out));dump('qa/qawtaw5-unresolved-register.json',crux);dump('qa/qawtaw5-summary.json',summary)
 text='\n'.join(md)+'\n'
 write('editorial/CLAUSE_REVIEW_COMPLETE_2026-11-11.md',text)
 write('editorial/CLAUSE_REVIEW_PASS1_2026-11-09.md','> Compatibility location for the cumulative ledger. The original pass was 9 November; this report supersedes its coverage counts.\n\n'+text)
 print(json.dumps(summary,ensure_ascii=False))

def verify():
 review=reconstruct();c={u['id']:u for u in units()};led=obj('qa/clause-ledger.json');assert led['summary']['NOTIndividuallyComparedArabicClauses']==0
 for u in led['units']:assert u['arabicSha256']==digest(c[u['id']]['arabic'])
 for v in review['units']:
  u=c[v['id']];assert digest(u['arabic'])==v['arabicSha256'];assert u['english'] in read('data/parallel-commentary.md');assert u['english'] in read('data/commentary-english.md')
  for change in v['corrections']:assert change['new'] in u['english'],v['id']
 html=read('downloads/Tamhid_Complete_Commentary_Reading_Edition.html')
 m=re.search(r'window\.GNAMMA_TAMHID_CORPUS = (\{.*?\});</script>',html,re.S);assert m,'Standalone embedded corpus missing'
 embedded={u['id']:u for u in json.loads(m.group(1))['units']}
 for uid in ['SH-002','SH-009','SH-013','SH-041','SH-051','SH-058']:assert c[uid]['english']==embedded[uid]['english'],uid+' standalone parity'
 for p,h in obj('qa/qawtaw5-protected-inputs.json').items():assert digest((ROOT/p).read_bytes())==h,p+' protected text changed'
 assert 'English bracket gives the contextual reading' not in ' '.join(c['SH-002']['notes'])
 result=dict(passed=True,date=DATE,units=171,arabicSegments=5520,addedComparedUnits=85,addedComparedArabicSegments=3759,wordingChanges=36,arabicUnchanged=True,matnFilesUnchanged=True,compiledMarkdownStandaloneParity=True,independentManuscriptsCollated=0,independentHumanCertification=False)
 dump('qa/qawtaw5-release-tests.json',result);print(json.dumps(result))

if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--root',type=pathlib.Path);ap.add_argument('--ledger',action='store_true');ap.add_argument('--verify',action='store_true');args=ap.parse_args()
 if args.root:ROOT=args.root.resolve()
 if args.ledger:ledger()
 elif args.verify:verify()
 else:apply()
