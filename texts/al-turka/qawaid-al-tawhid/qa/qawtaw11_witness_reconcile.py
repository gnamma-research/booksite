#!/usr/bin/env python3
"""Qawtaw11: append source-graded witness-acquisition findings without emending texts."""
from __future__ import annotations
import json, hashlib, pathlib, re
R=pathlib.Path(__file__).resolve().parent.parent
STAMP="Qawtaw11 source witness status (12 November 2026): "
N_SH=(STAMP+
 "An earlier 1315 AH / 1898 Tehran lithograph of Tamhid al-Qawaid (234 pp.; Tamhid pp. 2-181) "
 "has been bibliographically located via Kyoto NII BB28267336 and is listed as a free 1898 ebook "
 "on Google Play Books (item -Wku6DfHLa8C), but relevant SH-002 page images have NOT been inspected. "
 "The A and H2014 quotations both transmit القطع ببطلان مسألة التوحيد. Immediately before it stands "
 "إذ القطع ببطلان جميع الأحكام العقلية, whereas earlier the same objection reads "
 "القطع بحقية هذه المسألة. A POSSIBLE un-witnessed conjecture is "
 "القطع بحقية مسألة التوحيد, perhaps through scribal attraction of ببطلان from the preceding "
 "phrase. This is NOT an attested variant and is NOT adopted in the Arabic or continuous English. "
 "No independent historical page or manuscript has yet resolved this contradiction. "
 "Full source roster: editorial/QAWTAW11_INDEPENDENT_WITNESS_REGISTER_2026-11-12.md.")
N_QT=(STAMP+
 "The standalone original Qawaid al-Tawhid edited by Majid Hadizadeh is bibliographically attested "
 "in Nusus wa-Rasail min Turath Isfahan al-Ilmi al-Khalid IV:37-72. The publicly offered set "
 "at al-Feker comprises ONLY volumes I-III; volume IV pages have NOT been acquired or examined. "
 "The 1315 AH / 1898 Tehran lithograph of the Tamhid (quoted ancestor text within commentary) "
 "is a second promising printed lead, NOT yet collated. QT-059's current wording is extant, "
 "but the A source reports a substantive historical omission with unestablished locus and extent. "
 "No lost ancestral wording has been recovered or reconstructed. The descendant SH-059 must not "
 "be silently treated as a replacement original. "
 "Full source roster: editorial/QAWTAW11_INDEPENDENT_WITNESS_REGISTER_2026-11-12.md.")
def sha(s):return hashlib.sha256(s.encode('utf8')).hexdigest()
def assigned(p):
 s=p.read_text(encoding="utf8")
 # Exact assignment token, then a JSON object / array.
 m=re.search(r"window\.GNAMMA_[A-Z0-9_]+\s*=\s*",s)
 if not m:raise RuntimeError("Cannot identify canonical JS source: "+str(p))
 at=m.end()
 obj,n=json.JSONDecoder().raw_decode(s[at:].lstrip())
 offset=len(s[at:])-len(s[at:].lstrip())
 return s,at+offset,at+offset+n,obj
def save(p,s,a,b,obj):
 p.write_text(s[:a]+json.dumps(obj,ensure_ascii=False,indent=2)+s[b:],encoding='utf8')
history={}
for p,name,note in [(R/'data/units.js','QT-059',N_QT),(R/'data/commentary-main-001-019.js','SH-002',N_SH)]:
 s,a,b,obj=assigned(p)
 uu=obj['units'] if isinstance(obj,dict) else obj
 found=[u for u in uu if u['id']==name]
 assert len(found)==1,(p,name)
 u=found[0]
 old={k:sha(u[k]) for k in ['arabic','english'] if k in u}
 if 'readingArabic' in u:old['readingArabic']=sha(u['readingArabic'])
 if name=='SH-002':
  assert 'القطع بحقيَّة هذه المسألة' in u['arabic'] and 'القطع ببطلان مسألة التوحيد' in u['arabic'] and 'إذ القطع ببطلان جميع الأحكام العقلية' in u['arabic']
 else:assert 'وما قيل إنّ علوم النظّار مأخوذة من الحواسّ' in u['arabic']
 notes=u.setdefault('notes',[])
 if note not in notes:notes.append(note)
 after={k:sha(u[k]) for k in old}
 assert old==after,"An authorial string was changed"
 history[name]={'hashes':old,'readingNotEmended':True,'noteAppended':True}
 save(p,s,a,b,obj)
# Ensure standalone main-English draft notes remain synchronized for the booksite export.
p=R/'data/main-commentary-001-007.en.json'
if p.exists():
 ob=json.loads(p.read_text(encoding='utf8'))
 arr=ob['units'] if isinstance(ob,dict) else ob
 for u in arr:
  if u['id']=='SH-002':
   nn=u.setdefault('notes',[])
   if N_SH not in nn:nn.append(N_SH)
 p.write_text(json.dumps(ob,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
# User-facing critical witness desk, away from continuous reading.
p=R/'textual-decisions.html'
s=p.read_text(encoding='utf8')
anchor='<footer><a href="editorial/QAWTAW8_FINAL_FOURTEEN_ADJUDICATIONS.md">'
add=(
 '<aside id="qawtaw11-source-register" style="background:#e8eee9;padding:18px;border-radius:12px;margin:25px 0">'
 '<h2>Earlier printed witnesses — acquisition status</h2>'
 '<p><strong>SH-002:</strong> the 1315 AH / 1898 Tehran lithograph (Tamhid pages 2–181) is '
 'catalogued, but the disputed page itself has not been collated. Its only proposed alternative, '
 '<span lang="ar" dir="rtl">القطع بحقّيّة مسألة التوحيد</span>, is an <em>unattested editorial conjecture</em>, '
 'not another witness reading. The received <span lang="ar" dir="rtl">ببطلان</span> remains in the text.</p>'
 '<p><strong>QT-059:</strong> Hādīzādeh’s standalone edited ancestor is located in volume IV, '
 'pages 37–72, of <em>Nuṣūṣ wa-Rasāʾil min Turāth Iṣfahān</em>. Those pages were not acquired; '
 'no missing words are restored.</p>'
 '<p><a href="editorial/QAWTAW11_INDEPENDENT_WITNESS_REGISTER_2026-11-12.md">'
 'Full source comparison, acquisition references and bilingual request templates</a> · '
 '<a href="qa/qawtaw11-witness-status.json">Machine-readable witness status</a> · '
 '<a href="https://play.google.com/store/books/details?id=-Wku6DfHLa8C" target="_blank" rel="noopener">'
 'Free 1898 lithograph catalogue</a></p></aside>')
if 'id="qawtaw11-source-register"' not in s:
 assert anchor in s,"Cannot locate scholarly footer"
 s=s.replace(anchor,add+anchor,1)
p.write_text(s,encoding='utf8')
record={
 'schema':'gnamma-qawtaw11-witness-acquisition-v1',
 'researchDate':'2026-11-12',
 'workingElectronicComparison':'171/171 bilingual units; 5520/5520 original Arabic punctuation segments',
 'editorialUnresolved':['SH-002 negative','QT-059 ancestral lacuna'],
 'actualNewPagesInspected':0,
 'newIndependentManuscriptCollations':0,
 'arabicEditorialConjectureAdopted':False,
 'sourceHashes':history,
 'newlyLocatedPrints':[
  {'id':'L1898','kind':'historical printed commentary','title':'Kitab al-Tamhid fi Sharh Qawaid al-Tawhid','date':'1315 AH / 1898','extent':'234 pp, Tamhid pp.2-181','holdingCatalogue':'https://ge.nii.ac.jp/ncid/BB28267336','secondCatalogue':'https://kias.sakura.ne.jp/ibnarabi/index.php/Sain_al-Din_Turka','freeEbookListing':'https://play.google.com/store/books/details?id=-Wku6DfHLa8C','passageImagesExamined':False,'notes':'Google Play free listing and Kyoto catalog attest title/date/extent; not that actual relevant folios have been read or the sources have independent manuscript descent.'},
  {'id':'HIV','kind':'edited standalone original matn','title':'Qawaid al-Tawhid, ed. Majid Hadizadeh, Nusus wa-Rasail min Turath Isfahan al-Ilmi al-Khalid IV','extent':'pp.37-72','catalogue':'https://m.imamhussain.org/lib/15','retailer':'https://mahdroo.ir/shop/category/book/author/484480-sl5s','availablePartialCollection':'https://alfeker.net/b/3875/','passageImagesExamined':False,'notes':'Available al-Feker volumes are I-III; volume IV missing from public collection verified.'},
  {'id':'BL128/2','kind':'old commentary manuscript','date':'869-871 AH','catalogue':'https://searcharchives.bl.uk/catalog/040-003784927','passageImagesExamined':False,'notes':'No digital images in viewed catalog; request targeted folios.'},
  {'id':'R2003','kind':'modern edited commentary','catalogue':'https://www.shiabooks.net/library.php?id=7969','passageImagesExamined':False},
  {'id':'N2014','kind':'modern edited commentary','catalogue':'https://ayatollahnekounam.com/2018/07/16/التمهید-فی-شرح-قواعد-التوحید-الطلیعه-و/','passageImagesExamined':False}
 ],
 'SH002':{'sourceEvidence':['A printed pp.49-52 negative','H2014/1:224 negative'],'earlierPositive':'القطع بحقيّة هذه المسألة','adjacentQuotation':'إذ القطع ببطلان جميع الأحكام العقلية','laterNegative':'القطع ببطلان مسألة التوحيد','editorialHypothesis':'القطع بحقيّة مسألة التوحيد','hypothesisCertainty':'unattested conjecture only; plausible attraction from preceding ببطلان','acceptedArabic':'unchanged negative','actualNewIndependentReading':False},
 'QT059':{'beginning':'وما قيل إنّ علوم النظّار مأخوذة من الحواسّ','end':'وأمّا الثاني فلما بيّنّاه في كتبنا المعمولة في صناعة الحكمة','lacuna':'reported by earlier editor; exact location, extent and lost wording not verified','actualNewWordsRecovered':0,'standaloneOriginalEditionInspected':False},
 'canonicalHandoff':'editorial/QAWTAW11_INDEPENDENT_WITNESS_REGISTER_2026-11-12.md'
}
(R/'qa/qawtaw11-witness-status.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'preservedSourceStrings':True,'criticalNotesAppended':2,'casePageLinked':True,'newHistoricalTextsRead':0,'reportedLacunaRestoredWords':0},ensure_ascii=False))
