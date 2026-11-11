#!/usr/bin/env python3
"""Qawtaw8: settle working readings without emending either historical Arabic witness."""
import json, pathlib, hashlib, re
from html import escape
R=pathlib.Path(__file__).resolve().parent.parent
DEC={
'QT-052':('reading-settled','The final possible-attributes phrase is treated as explanatory apposition to possible thing; no unwitnessed Arabic deletion.'),
'QT-055':('reading-settled','Use printed H2014 بوجوه and ويقيّد in the preferred reading; retain بوجوب and بوجود as A variants.'),
'QT-059':('unrecovered-lacuna','The lost ancestral words cannot be established: retain the surviving text, distinguish the later SH-059 explanation and do not invent a restoration. Obtain Hādīzādeh IV:37–72 or a photographed early manuscript for a genuinely new comparison.'),
'QT-060':('reading-settled','Retain transmitted فوقع نفسه and translate its context as falling into false imaginings; do not claim the unattested correction فأوقع.'),
'QT-061':('witness-crux-open','Both witnesses retain غير المتسقة المنتظمة. Translate the function of logic as ordering noncoherent inquiries, but do not delete or add Arabic words without another witness. Cross-reference SH-061-F.'),
'SH-002':('witness-crux-open','The problematic ببطلان occurs in both A and H2014. Preserve invalid [sic] and the contextual contradiction, not the unverified opposite polarity.'),
'SH-011':('reading-settled','Read فمعلوم as a stated inference immediately challenged by كيف. Preserve the affirmative Arabic and indicate the dialectical/rhetorical turn without inserting [not].'),
'SH-031':('reading-settled','The glass/ray phrase is intelligible with the printed للزجاج; render radiance appearing in the glass, not as an asserted literal through.'),
'SH-049':('reading-settled','The repeated comprehensive determination occurs in both prints and can qualify the receptacle and manifesting form separately. Retain both; no unwitnessed deletion.'),
'SH-053':('reading-settled','يميني is an elliptical example of position: my right [side]. It is printed in H2014, not evidence that words are missing.'),
'SH-055':('reading-settled','Prefer H2014 إسعاف مقتضيات القوى and ويقيّد; render the domination of the holy faculty by lower dispositions. Do not purport to resolve every ambiguous pronoun.'),
'SH-061-E':('reading-settled','Use the shorter H2014 line for continuous reading; preserve the additional A phrase ما يميز به بعض ما فيه من البعض as a printed alternative, not as deleted authorial text.'),
'SH-061-F':('witness-crux-open','تصير is supported over electronic يصيرى, but the same paradoxical noncoherence/order phrase as QT-061 persists in both prints. Cross-reference QT-061.'),
'SH-061-A':('reading-settled','Use H2014 أفعاله وأحواله, keys to his actions and states; preserve A أقفاله and reported إقباله as alternatives without deciding stemmatic priority.')
}
assert len(DEC)==14
EDIT={
'QT-052':("the Real cannot depend upon something possible in order to be described by a perfectional attribute, we reply","the Real cannot depend upon something possible—even upon certain possible attributes—in order to be described by a perfectional attribute, we reply"),
'SH-011':("But if possibility means possibility in the strict sense, it is [not established] that a necessary nature's admitting individuals entails their strict possibility. How could that follow, when the two concepts are incompatible in predication?","But if possibility is understood in the strict sense, it is treated as evident that, were a necessary nature to admit individuals, they would be strictly possible. How, though, could that follow, when the two descriptions cannot both be predicated?"),
'SH-031':("its radiance appears through the glass, and","its radiance becomes apparent in the glass, and"),
'SH-053':("position, exemplified here by my right [the wording is uncertain];","position, exemplified by ‘my right [side]’ (يميني);"),
'SH-055':("The source's exact sentence here is disordered, but its subsequent causal point is explicit:","The printed construction concerning the sacred faculty’s bodily orientation is compressed, but the ensuing causal point is explicit:")
}
mods=['data/units.js','data/commentary.js','data/commentary-conclusion.js']+['data/commentary-introduction-%d.js'%n for n in range(1,5)]+['data/commentary-main-001-019.js','data/commentary-main-020-060.js']
witnesses=json.loads((R/'qa/qawtaw7-witness-register.json').read_text())['records']
wx={x['unit']:x for x in witnesses}
rows=[]; edited={}
for name in mods:
 p=R/name;s=p.read_text(encoding='utf8')
 if name=='data/units.js':i=s.index('{')
 elif '.concat(' in s:i=s.index('.concat(')+len('.concat(')
 else:i=re.search(r'window\.GNAMMA_\w+\s*=\s*',s).end()
 while s[i].isspace():i+=1
 ob,n=json.JSONDecoder().raw_decode(s[i:]);arr=ob['units'] if isinstance(ob,dict) else ob
 for u in arr:
  id=u['id']
  if id not in DEC:continue
  prior=(u['arabic'],u.get('readingArabic',u['arabic']))
  if id in EDIT:
   old,new=EDIT[id]
   assert u['english'].count(old)==1,('English source shifted',id)
   u['english']=u['english'].replace(old,new,1)
  assert prior==(u['arabic'],u.get('readingArabic',u['arabic'])),('source Arabic changed',id)
  status,why=DEC[id]
  note='Qawtaw8 adjudication: '+why
  u.setdefault('notes',[])
  if note not in u['notes']:u['notes'].append(note)
  u['qawtaw8']={'status':status,'note':why,'originalArabicPreserved':True,'comparatorArabicPreserved':True,'manuscriptsCollated':0}
  edited[id]=u
  rows.append({'unit':id,'status':status,'decision':why,'AArabic':u['arabic'],'workingArabic':u.get('readingArabic',u['arabic']),'workingEnglish':u['english'],'H2014':{'sourceLocations':wx[id]['sourceLocations'],'sourceUrl':wx[id]['sourceUrl'],'proposedReading':wx[id]['proposedReading']},'archetypalPrioritySettled':False,'originalArabicSHA256':hashlib.sha256(u['arabic'].encode()).hexdigest()})
 p.write_text(s[:i]+json.dumps(ob,ensure_ascii=False,indent=2)+s[i+n:],encoding='utf8')
assert len(edited)==14
for p in sorted((R/'data').glob('main-commentary-*.en.json')):
 ob=json.loads(p.read_text(encoding='utf8'));touch=False
 for u in ob['units']:
  if u['id'] in edited:
   u['english']=edited[u['id']]['english'];u['notes']=edited[u['id']]['notes'];touch=True
 if touch:p.write_text(json.dumps(ob,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
out={'schema':'gnamma-qawtaw8-14-dispositions','date':'2026-11-11','count':14,'readingSettled':10,'witnessCruxOpen':3,'unrecoveredAncestralLacuna':1,'newIndependentManuscriptCollations':0,'records':rows}
(R/'qa/qawtaw8-final14-dispositions.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
md=['# Qawtaw 8 — final editorial disposition of the fourteen residual problems','','**11 November 2026.** Ten are settled for a transparent working reading; three have genuinely unresolved transmitted wording and QT-059 has an unrecovered ancestral lacuna. This does not certify a critical manuscript edition.','','The base A/N Arabic and the H2014-derived reading layer are both **unaltered**. H2014 is a modern typeset medieval-text comparator, not an independently collated codex.','']
for r in sorted(rows,key=lambda x:int(wx[x['unit']]['number'])):
 md+=['## '+r['unit']+' — '+r['status'],'','**Original Arabic (A):** '+r['AArabic'],'','**H2014-based working text:** '+r['workingArabic'],'','**Reading decision:** '+r['decision'],'','**Current English:** '+r['workingEnglish'],'','**Comparator:** '+', '.join(r['H2014']['sourceLocations'])+' ('+r['H2014']['sourceUrl']+')','']
md+=['## QT-059 source acquisition boundary','', 'The separate original matn edited by Majīd Hādīzādeh in Nuṣūṣ wa-Rasāʾil min Turāth Iṣfahān al-ʿIlmī al-Khālid IV:37–72 is bibliographically attested (al-Khizāna 2018, p.521, no.301), but has **not** been acquired or compared. It may be informative but cannot be claimed to recover any words. SH-059 belongs to the descendant and cannot fill the lacuna.','','## Future critical work','', 'Acquire photographs of A original and at least one independent original-matn or commentary witness; collate marked negatives, QT-059 loss, and the contradictory adjective sequence in QT-061/SH-061-F. Existing comparisons cover 171 extant working units but do not certify the manuscript archetype.']
(R/'editorial/QAWTAW8_FINAL_FOURTEEN_ADJUDICATIONS.md').write_text('\n'.join(md)+'\n',encoding='utf8')
# Standalone scholarly page: no editorial prefatory interruptions in continuous reading.
blocks=[]
for r in sorted(rows,key=lambda x:int(wx[x['unit']]['number'])):
 id=r['unit'];status=r['status'];target='commentary.html' if id.startswith('SH-') else './'
 blocks.append('<details id="'+id+'" class="case" data-status="'+status+'"><summary><strong>'+id+'</strong><span>'+status.replace('-',' ')+'</span></summary><div class="body"><h3>Original Arabic (A/N)</h3><p lang="ar" dir="rtl" class="ar">'+escape(r['AArabic'])+'</p><h3>Preferred printed working Arabic</h3><p lang="ar" dir="rtl" class="ar">'+escape(r['workingArabic'])+'</p><p>'+escape(r['decision'])+'</p><p><b>English:</b> '+escape(r['workingEnglish'])+'</p><p><a href="'+target+'#'+id+'">Read passage</a> · <a target="_blank" rel="noopener" href="'+escape(r['H2014']['sourceUrl'])+'">Printed witness</a></p></div></details>')
css='body{background:#f5f2ed;color:#263a37;font:16px/1.55 Georgia,serif;margin:0}main{max-width:940px;margin:auto;padding:26px 22px 80px}h1{font-size:36px}header{background:#e3e1d6;padding:15px 24px;font:15px system-ui}a{color:#26625b}summary{cursor:pointer;display:flex;justify-content:space-between;gap:15px;padding:16px 18px;font:15px system-ui}summary span{color:#63756c}.case{background:#fffefa;border:1px solid #d8d3c9;border-radius:11px;margin:14px 0}.body{padding:5px 20px 20px;border-top:1px solid #eee}.ar{font:23px/1.9 Amiri,serif;background:#f6f3eb;padding:12px;border-radius:7px}label{font:13px system-ui}input,select{font:14px system-ui;padding:10px;margin:5px}h3{font:600 12px system-ui;color:#68756e}footer{margin-top:30px;font:14px system-ui}'
page='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Qawtaw 8 · Textual adjudications</title><style>'+css+'</style><header><a href="./">GNAMMA · Qawāʿid al-Tawḥīd</a></header><main><h1>Fourteen textual questions</h1><p>Ten editorial readings adopted, three transmitted cruxes still disputed, and the unrecovered ancestral loss at QT-059. Base Arabic and preferred print remain separate. No manuscript-critical completeness claim.</p><label>Search <input id="q" placeholder="Passage or Arabic text"></label><label>Filter <select id="filter"><option value="all">All</option><option value="reading-settled">Reading settled</option><option value="witness-crux-open">Textual crux</option><option value="unrecovered-lacuna">Ancestral lacuna</option></select></label><span id="count">14</span>'+''.join(blocks)+'<footer><a href="editorial/QAWTAW8_FINAL_FOURTEEN_ADJUDICATIONS.md">Complete research record</a> · <a href="qa/qawtaw8-final14-dispositions.json">Machine-readable data</a></footer></main><script>const ds=[...document.querySelectorAll(".case")],q=document.querySelector("#q"),f=document.querySelector("#filter"),c=document.querySelector("#count");function change(){let n=0;for(const d of ds){let ok=(f.value==="all"||d.dataset.status===f.value)&&d.textContent.toLowerCase().includes(q.value.toLowerCase());d.hidden=!ok;if(ok)n++}c.textContent=n}q.oninput=f.onchange=change;change();</script></html>'
(R/'textual-decisions.html').write_text(page,encoding='utf8')
for name in ('index.html','commentary.html'):
 p=R/name;s=p.read_text(encoding='utf8')
 if name=='commentary.html':
  s=re.sub(r'<p id="qawtaw(?:5|7)-release"[^>]*>.*?</p>\s*','',s,flags=re.S)
 needle='<a href="clause-review.html">Clause-by-clause review</a>'
 if needle in s and 'href="textual-decisions.html"' not in s:s=s.replace(needle,needle+' · <a href="textual-decisions.html">Textual decisions</a>')
 p.write_text(s,encoding='utf8')
# Fix an older PDF script mismatch: commentary PDFs must display readingArabic too.
p=R/'pdf/build_editions.py';s=p.read_text(encoding='utf8')
old="pair(c['arabic'],c['english'],lang)"
new="pair(c.get('readingArabic',c['arabic']),c['english'],lang)"
if old in s:p.write_text(s.replace(old,new),encoding='utf8')
print(json.dumps({'changedEnglishUnits':len(EDIT),'editorialReadingSettled':10,'stillOpenTextual':3,'lostWords':1,'arabicPreserved':True}))
