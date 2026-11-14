#!/usr/bin/env python3
"""Qawtaw10: clarify two technical readings; preserve A/N and H2014 Arabic and QT059."""
import hashlib,json,pathlib,re
R=pathlib.Path(__file__).resolve().parent.parent
TECH='Qawtaw10 (12 November 2026): «غير» can negate the whole established technical pair «المتسقة المنتظمة», not set two adjectives against each other. al-Ḥillī, al-Asrār al-khafiyya, contrasts sciences such as arithmetic/geometry, already internally ordered, with sciences needing logic: https://ablibrary.net/book_content/b/14487/49?lang=ar . Quṭb al-Dīn al-Rāzī similarly uses «العلوم المتسقة المنتظمة»: https://ablibrary.net/book_content/b/15419/16?lang=ar . This establishes an interpretative parallel, NOT an independent Ibn Turka manuscript reading. Both A and H2014 Arabic witnesses are preserved.'
NEG='Qawtaw10 (12 November 2026): A and H2014 both transmit «القطع ببطلان مسألة التوحيد». The negative may conflict with the preceding argument, but no new witness supplies a positive text; preserve its literal wording. The editorial concern belongs in the note, not as [sic] in continuous reading.'
P={
'QT-061':('as the instrumental science of logic stands in relation to theoretical sciences whose arguments require ordering.','as logic stands in relation to theoretical sciences not already coherent and systematically ordered.'),
'SH-061-F':('as the instrumental science of logic stands in relation to theoretical sciences requiring orderly arrangement.','as logic stands in relation to theoretical sciences not already coherent and systematically ordered.'),
'SH-002':('certainty that the doctrine of unity is invalid [sic] amounts to certainty','certainty that the doctrine of unity is invalid amounts to certainty')
}
def digest(s):return hashlib.sha256(s.encode('utf8')).hexdigest()
def parse(s):
 m=re.search(r'window\.GNAMMA_\w+\s*=\s*',s)
 assert m
 i=m.end()
 while s[i].isspace():i+=1
 x,n=json.JSONDecoder().raw_decode(s[i:]);return i,i+n,x
found={}
for fn in ['data/units.js','data/commentary-main-001-019.js','data/commentary-conclusion.js']:
 path=R/fn;s=path.read_text(encoding='utf8');a,b,x=parse(s)
 arr=x['units'] if isinstance(x,dict) else x
 for u in arr:
  id=u['id']
  if id not in P:continue
  old,new=P[id];before=(digest(u['arabic']),digest(u.get('readingArabic',u['arabic'])))
  if u['english'].count(old)==1:u['english']=u['english'].replace(old,new)
  else:assert u['english'].count(new)==1,(id,'unexpected English')
  note=NEG if id=='SH-002' else TECH
  u.setdefault('notes',[])
  if note not in u['notes']:u['notes'].append(note)
  if id=='SH-002':
   u['notes']=[n.replace('The English now preserves the received negative with [sic]','The English now preserves the negative; this note, not the reading prose, reports the anomaly') for n in u['notes']]
  u['qawtaw10']={'date':'2026-11-12','category':'received-negative-pending-independent-collation' if id=='SH-002' else 'interpretation-resolved-manuscript-not-collated','originalArabicPreserved':True,'comparatorArabicPreserved':True}
  assert before==(digest(u['arabic']),digest(u.get('readingArabic',u['arabic']))),id
  found[id]={'originalArabicSha256':before[0],'preferredArabicSha256':before[1],'english':u['english']}
 path.write_text(s[:a]+json.dumps(x,ensure_ascii=False,indent=2)+s[b:],encoding='utf8')
assert set(found)==set(P),list(found)
for fn in ['data/parallel-matn.md','data/parallel-matn-reading.md']:
 path=R/fn;s=path.read_text(encoding='utf8');old,new=P['QT-061']
 if old in s:s=s.replace(old,new)
 else:assert new in s,fn
 path.write_text(s,encoding='utf8')
for path in (R/'data').glob('main-commentary-*.en.json'):
 o=json.loads(path.read_text(encoding='utf8'));changed=False
 for u in o['units']:
  if u['id']!='SH-002':continue
  old,new=P['SH-002']
  if old in u['english']:u['english']=u['english'].replace(old,new);changed=True
  else:assert new in u['english'],'draft mismatch'
 if changed:path.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
prior=json.loads((R/'qa/qawtaw8-final14-dispositions.json').read_text(encoding='utf8'))
records=[]
for item in prior['records']:
 u=item['unit'];status=('semantic-reading-settled' if u in ['QT-061','SH-061-F'] else 'unresolved-negative' if u=='SH-002' else 'unrecovered-lacuna' if u=='QT-059' else item['status'])
 records.append({'id':u,'qawtaw8Status':item['status'],'currentStatus':status,'criticalTextEstablished':False,'comment':'Negative of a recognized technical pair; not manuscript-collated' if u in ['QT-061','SH-061-F'] else item['decision']})
assert len(records)==14
out={'schema':'gnamma-qawtaw10-v1','date':'2026-11-12','totalCases':14,'semanticOrReadingResolved':12,'unresolvedNegative':1,'unrecoveredAncestralLacuna':1,'independentManuscriptsCollated':0,'updatedUnits':found,'records':records,'technicalParallels':['https://ablibrary.net/book_content/b/14487/49?lang=ar','https://ablibrary.net/book_content/b/15419/16?lang=ar'],'latestHandoff':'editorial/QAWTAW10_SOURCE_RECOVERY_2026-11-12.md'}
(R/'qa/qawtaw10-final-status.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
p=R/'textual-decisions.html';s=p.read_text(encoding='utf8')
s=s.replace('Qawtaw 8 · Textual adjudications','Qawtaw 10 · Textual adjudications')
s=s.replace('Ten editorial readings adopted, three transmitted cruxes still disputed, and the unrecovered ancestral loss at QT-059.','Twelve working readings are settled; only the received SH-002 negative and the unrecovered ancestral QT-059 lacuna remain open.')
for id in ['QT-061','SH-061-F']:
 old='<details id="'+id+'" class="case" data-status="witness-crux-open"><summary><strong>'+id+'</strong><span>witness crux open</span></summary><div class="body">'
 new='<details id="'+id+'" class="case" data-status="reading-settled"><summary><strong>'+id+'</strong><span>interpretation settled (not manuscript-collated)</span></summary><div class="body"><p style="font-family:system-ui;color:#295c57"><b>Qawtaw10:</b> «غير» negates the compound technical expression «المتسقة المنتظمة». See <a href="editorial/QAWTAW10_SOURCE_RECOVERY_2026-11-12.md">the philological evidence</a>; neither original printed Arabic has been altered.</p>'
 assert s.count(old)==1,id;s=s.replace(old,new)
s=s.replace('<a href="qa/qawtaw8-final14-dispositions.json">Machine-readable data</a>','<a href="qa/qawtaw10-final-status.json">Current status data</a> · <a href="qa/qawtaw8-final14-dispositions.json">Qawtaw8 historical decisions</a>')
p.write_text(s,encoding='utf8')
for fn in ['index.html','commentary.html']:
 p=R/fn;s=p.read_text(encoding='utf8')
 n='<a href="textual-decisions.html">Textual decisions</a>'
 if n in s and 'QAWTAW10_SOURCE_RECOVERY_2026-11-12.md' not in s:s=s.replace(n,n+' · <a href="editorial/QAWTAW10_SOURCE_RECOVERY_2026-11-12.md">Critical status</a>')
 p.write_text(s,encoding='utf8')
print(json.dumps({'updated':list(found),'arabicUnchanged':True,'readingSettled':12,'outstandingNegative':1,'QT059Recovery':False}))
