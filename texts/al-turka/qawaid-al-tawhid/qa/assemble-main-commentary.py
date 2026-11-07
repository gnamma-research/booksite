#!/usr/bin/env python3
"""Assemble translated main commentary from reviewed Arabic; fail closed on any changed source.
Only this work's reader files and its own manifest entry are modified.
"""
from __future__ import annotations
import argparse, bisect, concurrent.futures, datetime, hashlib, json, pathlib, re, time, urllib.request

ROOT=pathlib.Path(__file__).resolve().parents[1]
EXPECTED={
'SH-001':'229d84b80dc81f1ceb964b8d8a082cf752cbc6c031f2bc8f634f3da762dff7e0',
'SH-002':'601361146efc50602cc8ec0b564458122d2ae0ac4d61936c6f39b0c5cd3d7e85',
'SH-003':'a002b41f67874f600f9ddec398918af0a9dc078ef262990451ae6dd027d484dd',
'SH-004':'973384090e2f84f2f61cf195356ee4590d280f200ad69be37c8682d0b2986afd',
'SH-005':'49896b9c9d8fda1d97d83221e8285e091dd9636ce80cb2d3563f08a793ec6618',
'SH-006':'076a2ef6e77ae2ef4f00727dc78e15fe697f99ec53b4b81485f81789e068906b',
'SH-007':'9c10643f4664a1a650f651b48a01d2915ecb5d95723a7c403ece54d1f9680611',
'SH-008':'4048db8be27957dbfb113ba49ee5886c444d578a49ad2aae12439e4e50624b83',
'SH-009':'fd282cd4b0904ca0b9e043bb245ecd54f22c60b89d93f1507c39cd1a8e803a8b',
'SH-010':'074d7d4a45d1685c3306c97548f9342a9498df718987610a02a7c5f43157405e',
'SH-011':'dc8e1c6a61678e752f17eb993dcd447b83e04bb7608c90b8554a5f770a4e741d',
'SH-012':'c773afc00b96d291e51e82ed039a55fc8789f1d22a2eeef3c10a2a64f6480f5d',
'SH-013':'321ead8369b2450ed63a493bbb046830db9ac74dea63bd39378cbdd23dab484f',
'SH-014':'0d1c5f90d24f72945d8025f4eec1127d9724654dab6b773d2de22b52e9eab45b',
'SH-015':'9e662b2effe688879c042d325ec7be322a54699259ffada83671824c91c4859b',
'SH-016':'24a85f9a2ad8cb083336c865d255ae09b6cc50abc96e40600c98d4803ea67fb4',
'SH-017':'3120af5d68b558dc1b76d3e2bff078e65fe26035a1894fef8d1ad8a6e29f96ba',
'SH-018':'906d132f21f88b3f272a6dcfc3bb1e3dc0c43b0564a66eed6c4709a69493f215',
'SH-019':'f497d8494fedb88fbe0d30efcdf6addbd12aec4827c0e7858e2dfb0b28e963d2'
}
LUMBARD='https://traditionalhikma.com/wp-content/uploads/2015/08/Annotated-translation-from-Tamhi%CC%84d-al-Qawa%CC%84%CA%BEid-of-Ibn-Turkah-al-Is%CC%A3faha%CC%84ni%CC%84-by-Joseph-Lumbard.pdf'

def normalized(s:str)->str:return re.sub(r'\s+',' ',s.strip())
def digest(s:str)->str:return hashlib.sha256(normalized(s).encode()).hexdigest()
def read(p:str)->str:return (ROOT/p).read_text(encoding='utf-8')
def write(p:str,s:str)->None:
 target=ROOT/p;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(s,encoding='utf-8')
def replace(s:str,old:str,new:str,label:str)->str:
 if old not in s:raise ValueError('Unexpected current file; patch not applied: '+label)
 return s.replace(old,new)

def fetch_page(p:int)->dict:
 from bs4 import BeautifulSoup
 url=f'https://ablibrary.net/book_content/b/17638/{p+196}?lang=ar'
 request=urllib.request.Request(url,headers={'User-Agent':'Gnamma source comparison: public medieval Arabic; no authentication'})
 with urllib.request.urlopen(request,timeout=25) as response:
  raw=response.read(1500000)
  if response.status!=200:raise ValueError(f'Page {p}: HTTP {response.status}')
 soup=BeautifulSoup(raw,'html.parser');article=soup.select_one('[itemprop="articleBody"]')
 if article is None:raise ValueError(f'Page {p}: articleBody absent')
 for e in article.select('[data-abl-content="remark"],nav'):e.decompose()
 # Include paragraph elements and poetry, not only span.select-text.
 text=article.get_text('\n',strip=True)
 if not text:raise ValueError(f'Page {p}: empty authorial text')
 time.sleep(.7)
 return {'printed_page':p,'url':url,'text':text,'html_sha256':hashlib.sha256(raw).hexdigest(),'extraction':'All visible article text after excluding marked editorial footnotes and navigation; includes prose paragraphs and verse'}

def assemble(source_path:pathlib.Path|None)->tuple[list[dict],dict]:
 if source_path:
  source=json.loads(source_path.read_text());pages=[p for p in source['pages'] if 48<=p['printed_page']<=95]
 else:
  with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:pages=list(pool.map(fetch_page,range(48,96)))
 pages.sort(key=lambda p:p['printed_page'])
 if [p['printed_page'] for p in pages]!=list(range(48,96)):raise ValueError('Source page coverage incomplete')
 source={'edition':'A: Ashtiyani digital transcription','retrieved':datetime.datetime.now(datetime.timezone.utc).isoformat(),'pages':pages,'scope':'Printed pp.48–95, medieval main text; not independently manuscript-collated'}
 full='';positions=[]
 for p in pages:positions.append((len(full),p['printed_page']));full+=p['text']+'\n\n'
 offsets=[p[0] for p in positions]
 page_at=lambda n:positions[bisect.bisect_right(offsets,n)-1][1]
 starts=list(re.finditer(r'(?m)^قال\s*:\s*«',full))
 if len(starts)<20:raise ValueError('Missing quoted-matn boundaries')
 drafts=[]
 for f in ['main-commentary-001-007.en.json','main-commentary-008-014.en.json','main-commentary-015-019.en.json']:drafts.extend(json.loads(read('data/'+f))['units'])
 if [u['id'] for u in drafts]!=list(EXPECTED):raise ValueError('Translation sequence changed')
 units=[];audit=[]
 for i,d in enumerate(drafts):
  end=starts[i+1].start();block=full[starts[i].start():end]
  aq=re.search(r'(?:\(\s*\d+\s*\)\s*)?أقول\s*:',block)
  if aq is None:raise ValueError(d['id']+': no commentary opening')
  begin=starts[i].start()+aq.start()
  trailing=re.search(r'\n\s*\[[^\]]*\]\s*$',full[begin:end])
  if trailing:end=begin+trailing.start()
  raw=full[begin:end].strip();sha=digest(raw)
  if sha!=EXPECTED[d['id']]:
   write('qa/source-mismatch-'+d['id']+'.txt',raw)
   raise ValueError(f"{d['id']}: reviewed Arabic differs: {sha}; expected {EXPECTED[d['id']]}")
  actual_pages=list(range(page_at(begin),page_at(end-1)+1))
  if actual_pages!=d['pages']:raise ValueError(d['id']+': page alignment changed')
  if normalized(d['sourceStart']) not in normalized(raw):raise ValueError(d['id']+': source opening mismatch')
  variant_re=r'\([^)]*-\s*خ(?:\s*ل)?[^)]*\)|\[[^\]]*-\s*ظ[^\]]*\]'
  variants=re.findall(variant_re,raw)
  arabic=re.sub(variant_re,'',raw)
  arabic=re.sub(r'^\(\s*\d+\s*\)\s*','',arabic)
  arabic=re.sub(r'«\s*\d+\s*»','',arabic)
  arabic=re.sub(r'[ \t]+',' ',arabic).strip()
  u={**d,'kind':'sharh','part':'main','sequence':i+1,'page':d['pages'][0],'sourceEdition':'A','sourceEditionLabel':'Āshtiyānī edition','sourceLocator':'A, printed pp. '+('–'.join(str(n) for n in [d['pages'][0],d['pages'][-1]]) if len(d['pages'])>1 else str(d['pages'][0])),'sourceUrl':f"https://ablibrary.net/book_content/b/17638/{d['pages'][0]+196}?lang=ar",'moreSourceUrls':[f'https://ablibrary.net/book_content/b/17638/{p+196}?lang=ar' for p in d['pages'][1:]],'arabic':arabic,'arabicSourceTranscription':raw,'sourceTextSha256':sha,'reportedApparatusStrings':variants,'ArabicSourceStatus':'reviewed-digital-Arabic; prose-and-verse-completeness-checked; no independent manuscript collation'}
  if d.get('lumbardPages'):u['lumbardComparator']={'title':'Establishing the Principles','translator':'Joseph E. B. Lumbard','pages':d['lumbardPages'],'url':LUMBARD,'role':'Checked comparator only; independent Arabic-based English'}
  if variants:u['notes']=[*u['notes'],'Inline reported readings retained separately from the reading text: '+'; '.join(variants)]
  units.append(u);audit.append({'id':u['id'],'matnId':u['matnId'],'pages':actual_pages,'reviewedSourceHashMatches':True,'arabicSourceWords':len(raw.split()),'englishWords':len(u['english'].split())})
 if 'عباراتنا' not in units[8]['arabic']:raise ValueError('Verse on p.71 missing')
 if 'امارات التميز' not in units[16]['arabic']:raise ValueError('Prose on p.92 missing')
 write('sources/A_MAIN_048_095.json',json.dumps(source,ensure_ascii=False,indent=2)+'\n')
 write('data/commentary-main-001-019.js','/* Source-checked main commentary, SH-001–019. Generated from retained Arabic and independent English drafts. */\nwindow.GNAMMA_TAMHID_MAIN = '+json.dumps(units,ensure_ascii=False,indent=2)+';\n')
 report={'date':'2026-11-03','units':19,'printed_page_span':[48,95],'reviewedSourceHashesMatched':19,'poem_p71_restored':True,'prose_p92_restored':True,'wholeCommentaryComplete':False,'rows':audit,'arabicSourceWords':sum(r['arabicSourceWords'] for r in audit),'englishWords':sum(r['englishWords'] for r in audit)}
 write('qa/main-source-alignment.json',json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 return units,report

def integrate(units:list[dict],report:dict)->None:
 s=read('data/commentary-corpus.js')
 if 'mainUnits:main.length' in s:raise ValueError('Main sections already integrated; stop rather than duplicate')
 s=replace(s,'const units=[...intro,...conclusion];',"const main=window.GNAMMA_TAMHID_MAIN||[];\n  const units=[...intro,...main,...conclusion];",'corpus order')
 s=replace(s,'introductionUnits:intro.length,conclusionUnits:conclusion.length','introductionUnits:intro.length,mainUnits:main.length,mainLastMatn:"QT-019",conclusionUnits:conclusion.length','corpus counts')
 s=s.replace('introduction and concluding discussion translated; intervening commentary pending','introduction, main commentary QT001–019, and concluding discussion translated; QT020–060 pending')
 s=s.replace("after:'SH-INTRO-040'","after:'SH-019'")
 s=s.replace('The intervening commentary on QT-001–QT-060 has not yet been continuously translated.','The commentary on QT-020–QT-060 remains untranslated; the continuous main translation currently ends at QT-019 (printed p.95).')
 s=s.replace("extent:'Closing commentary, printed pp.270–274'","extent:'Main commentary pp.48–95 and closing commentary pp.270–274'")
 write('data/commentary-corpus.js',s)
 s=read('commentary-main-bridge.js')
 s=replace(s,'const additional=window.GNAMMA_TAMHID_CONCLUSION||[];','const additional=[...(window.GNAMMA_TAMHID_MAIN||[]),...(window.GNAMMA_TAMHID_CONCLUSION||[])];','paired source inclusion')
 s=replace(s,'data.units.sort((a,b)=>(sequence[a.id]||99)-(sequence[b.id]||99));','data.units.sort((a,b)=>a.matnId.localeCompare(b.matnId)||(sequence[a.id]||0)-(sequence[b.id]||0));','paired order')
 s=s.replace('verifiedArabicPrintedPages:[270,271,272,273,274]','verifiedArabicPrintedPages:[...Array.from({length:48},(_,i)=>i+48),270,271,272,273,274]')
 s=s.replace('The linked concluding commentary is translated continuously.','The main commentary QT001–019 and the concluding commentary are translated continuously within their stated source ranges.')
 write('commentary-main-bridge.js',s)
 for name,anchor in [('index.html','<script src="commentary-main-bridge.js"></script>'),('commentary.html','<script src="data/commentary-corpus.js"></script>')]:
  s=read(name);s=replace(s,anchor,'<script src="data/commentary-main-001-019.js"></script>\n'+anchor,name+' scripts')
  if name=='index.html':
   s=s.replace('<span><b>6</b> concluding commentary units</span>','<span><b>19</b> main commentary sections</span><span><b>6</b> concluding commentary units</span>')
   s=s.replace('61 matn units · 6 linked closing commentary sections','61 matn units · 25 linked commentary sections')
   s=s.replace('The introduction and closing discussion are translated from the available Arabic; the intervening main commentary remains in progress.','The introduction, main commentary on QT-001–QT-019 (pp.48–95), and closing discussion are translated from the available Arabic. The commentary on QT-020–QT-060 remains in progress.')
  else:
   s=s.replace('<span><b id="total-count">46</b> bilingual units</span>','<span><b id="main-count">19</b> main commentary units</span><span><b id="total-count">65</b> bilingual units</span>')
   s=s.replace('The intervening commentary remains in progress and is explicitly marked as a gap, not silently skipped.','The continuous main commentary now reaches QT-019, printed p.95; QT-020–QT-060 remains explicitly marked as untranslated.')
   s=s.replace('commentary, compared with Joseph Lumbard','commentary, including main sections QT001–019, compared with Joseph Lumbard')
   s=s.replace('</style>','.text-pair .en,.text-pair .ar{white-space:pre-line}</style>')
  write(name,s)
 s=read('commentary-reader.js')
 s=replace(s,"(u.part==='introduction'?'Authorial introduction':'Closing commentary · linked to QT-061')","(u.part==='introduction'?'Authorial introduction':u.part==='main'?'Main commentary · linked to '+esc(u.matnId):'Closing commentary · linked to QT-061')",'part label')
 s=s.replace('40 introductory sections, then an explicitly marked gap, then the six sections of the closing discussion.','40 introductory sections, 19 continuous main commentary sections, an explicit untranslated interval, and six concluding sections.')
 s=s.replace('the main intervening commentary remains pending.','the commentary on QT-020–QT-060 remains pending.')
 s=s.replace("$('intro-count').textContent=corpus.coverage.introductionUnits;","$('main-count').textContent=corpus.coverage.mainUnits;$('intro-count').textContent=corpus.coverage.introductionUnits;")
 write('commentary-reader.js',s)
 s=read('reader.js')
 s=s.replace("presently at printed p.274. Untranslated locations remain clearly unfilled.","at pp.48–95 and 270–274. Untranslated locations remain clearly unfilled.")
 s=s.replace('Two verified excerpts at p.274, editorial policy and next sequence','Introduction, main QT001–019, closing discussion, and remaining interval')
 s=s.replace('The first source-checked excerpts are from the final Arabic page (p.274).','The introduction and main commentary through QT-019 are translated, along with the closing discussion.')
 s=s.replace('data-go-verified="yes">Open the first translated sharḥ passages (QT-061)','data-go-verified="yes">Open the translated commentary reader')
 s=s.replace('if(b.hasAttribute("data-go-verified")){chooseLayer("sharh");go(60);closeSheet();}', 'if(b.hasAttribute("data-go-verified")){window.location.assign("commentary.html");}')
 write('reader.js',s)
 css=read('reader.css')+'\n/* Keep paragraph divisions in full-length commentary translations. */\n.text-pair .en,.text-pair .ar{white-space:pre-line}\n'
 write('reader.css',css)
 # Expand, rather than weaken, the existing deterministic reader tests.
 s=read('qa/check-commentary.mjs')
 s=s.replace("'data/commentary-corpus.js'","'data/commentary-main-001-019.js','data/commentary-corpus.js'")
 s=s.replace('corpus.units.length,46','corpus.units.length,65').replace(').size,46',').size,65')
 s=s.replace('corpus.units.slice(40)','corpus.units.slice(59)')
 s=s.replace('u=>u.lumbardComparator).length,7','u=>u.lumbardComparator).length,13')
 s=s.replace("el('total-count').textContent,46","el('total-count').textContent,65")
 s=s.replace('||[]).length,46','||[]).length,65')
 s=s.replace("newButton.dataset.jump='40';newButton.attributes['data-jump']='40';","newButton.dataset.jump='59';newButton.attributes['data-jump']='59';")
 s=s.replace('concludingUnits:6,totalUnits:46','mainUnits:19,concludingUnits:6,totalUnits:65')
 s=s.replace("assert.equal(corpus.coverage.conclusionUnits,6);","assert.equal(corpus.coverage.conclusionUnits,6);\nassert.equal(corpus.coverage.mainUnits,19);\nfor(let i=0;i<19;i++){assert.equal(corpus.units[40+i].id,'SH-'+String(i+1).padStart(3,'0'));assert.equal(corpus.units[40+i].matnId,'QT-'+String(i+1).padStart(3,'0'));}\nassert.ok(corpus.units[48].arabic.includes('عباراتنا'));\nassert.ok(corpus.units[56].arabic.includes('امارات التميز'));")
 write('qa/check-commentary.mjs',s)
 # Only the Turka entry in the shared catalogue is changed.
 manifest_path=ROOT.parents[1]/'manifest.json'
 manifest=json.loads(manifest_path.read_text());entry=next(x for x in manifest['texts'] if x['id']=='turka-qawaid-tawhid')
 entry.update(sharh_units=65,sharh_introduction_units=40,sharh_main_units=19,sharh_conclusion_units=6,sharh_translation_status='introduction-and-main-QT001-019-and-conclusion-translated; QT020-060-pending',sharh_reader_url='texts/al-turka/qawaid-al-tawhid/commentary.html',sharh_translation_url='texts/al-turka/qawaid-al-tawhid/editorial/COMMENTARY_TRANSLATION.md',lumbard_commentary_standard_url='texts/al-turka/qawaid-al-tawhid/editorial/LUMBARD_COMMENTARY_STANDARD.md',note='61 separate matn units; 65 commentary units: 40 authorial introductory sections, 19 continuous main explanations on QT001–019 at Ashtiyani pp.48–95, and six closing sections at pp.270–274. Lumbard is checked where his selection overlaps. QT020–060 commentary remains untranslated; QT059 source omission remains noted and deferred. No independent manuscript collation is claimed.')
 manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
 rows='\n'.join(f"| {u['id']} | {u['matnId']} | {u['pages'][0]}–{u['pages'][-1]} | {u['section']} |" for u in units)
 status=f'''# Tamhīd al-Qawāʿid — current commentary translation

**3 November 2026 · continuation release.** The complete work remains the target. **65 bilingual commentary units** are now present: 40 authorial introductory units, 19 complete main explanations, and six concluding sections. The ancestor's 61-unit matn is separate and is not counted as translated commentary.

[Read the commentary](../commentary.html) · [Cumulative bilingual text](../data/parallel-commentary.md) · [Lumbard standard](LUMBARD_COMMENTARY_STANDARD.md).

## New continuous main translation

Every a-qulu passage on **QT-001–QT-019**, from the commentary opening on printed p.48 to its boundary before QT-020 on p.95, is translated in full, with the textual duplication in SH-008 explicitly noted. Nested authorial quotations and objection/reply structures remain distinct.

| Commentary | Matn | A pages | Subject |
|---|---|---|---|
{rows}

The source contains **{report['arabicSourceWords']} whitespace-delimited transcription tokens** across these sections (including punctuation and inline apparatus), and the new English contains **{report['englishWords']} whitespace-delimited words**. These are corpus measures, not a percentage of the whole book.

## Source recovery and verification

The earlier span-only HTML extraction omitted prose p.92 and a verse on p.71. Both are restored. All 19 assembled Arabic sections match separately recorded, reviewed SHA-256 source-text hashes. This checks transcription identity and section coverage, **not manuscript authenticity or philosophical correctness**. Modern footnotes are excluded; reported variants and interpretative corrections remain documented.

[Retained Arabic page source](../sources/A_MAIN_048_095.json) · [Source alignment audit](../qa/main-source-alignment.json).

The introduction uses **N**, the Nekounam edition's authorial text, with printed markers 19–42 and a final continuation without a new visible page marker. The main and concluding sections use **A**, the Ashtiyani transcription. Their page numbers are not interchangeable. The six closing IDs remain in historical source order C, D, E, F, A, B, at A pp.270–274.

## Lumbard

Joseph E. B. Lumbard's *Establishing the Principles*, pp.464–479, is a checked comparator. The opening six main sections overlap pp.468–479. The translation preserves Arabic negation, effect-to-cause inference, and technical distinctions even where a modern English rendering differs. No modern translation paragraphs have been reproduced as this edition's English.

## Remaining work

**QT-020–QT-060 commentary remains untranslated.** The reader explicitly marks this interval before the previously translated conclusion. QT-059's reported source omission remains deferred. The whole Tamhid is not finished, and independent manuscript collation is not claimed.

The reader keeps the matn separate, links the 19 new explanations under their proper QT IDs, preserves paragraph divisions, and provides continuous reading, source notes, search, bookmarks, personal notes, and bilingual text export. Software tests do not replace specialist philological review.
'''
 write('editorial/COMMENTARY_TRANSLATION.md',status)
 s=read('editorial/EDITORIAL_STATUS.md')
 current='## Current release — 65 commentary units (3 November 2026)\n\nThe authorial introduction (40 units), main explanations QT001–019 (19 units, A pp.48–95), and concluding discussion (6 units) are translated. QT020–060 remains pending. [Current source and translation register](COMMENTARY_TRANSLATION.md). Earlier stages below are historical and do not describe current coverage.\n\n'
 write('editorial/EDITORIAL_STATUS.md',current+s)
 s=read('editorial/LUMBARD_COMMENTARY_STANDARD.md')
 s+='\n## Main-commentary comparison — continuation release\n\nSH-001–006 are now compared with L pp.468–479. Arabic controls: burhan al-inn runs from effect to cause; SH-005 retains the negative in ليس مقصورا على اللفظ; SH-006 preserves the positive definition of possibility and the unless-clause about freedom from habitual assumptions. Defective Arabic is flagged, not silently replaced by English. SH-007–019 extend beyond Lumbard’s supplied selection and are translated directly from A.\n'
 write('editorial/LUMBARD_COMMENTARY_STANDARD.md',s)
 print(json.dumps(report,ensure_ascii=False))

if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--source',type=pathlib.Path);parser.add_argument('--assemble-only',action='store_true');args=parser.parse_args()
 units,report=assemble(args.source)
 if not args.assemble_only:integrate(units,report)
