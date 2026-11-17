#!/usr/bin/env python3
"""Stage 13: deterministic assembly, source verification and scoped reader update.
The ten English draft files are human-reviewed translations, not generated here.
Input is the exact archived Arabic source sample acquired for this installment.
"""
from __future__ import annotations
import argparse, bisect, hashlib, json, pathlib, re, zipfile

BASE = pathlib.Path(__file__).resolve().parent.parent
DATE = '2026-11-04'
EXPECTED = {
'SH-020':'6565c065da74d5de3d6444a7d3adcaa02f47db718409a57fc62e95227b5dba52',
'SH-021':'9f6459fee6b60518def07cfb4e71baef683a7266e49644e0089250dc4e429972',
'SH-022':'a3dd9fec15470a9aa9e6413a8a2a37f52a1cfbd12efff4e0c26d71dd1b154457',
'SH-023':'ee8084f31ea17d447b5382d6db167b61e316913c5c59769f4f0d4475a7dd63b0',
'SH-024':'82ca347c6df01db3e5c49a8b197922390752cf5aab16313b9d127a101dc3415c',
'SH-025':'fcdb2cc9673abb9d7aca1296f0cff3ade99b7b922be71fb5e4cf6ddff8569d112a',
'SH-026':'76930e7ed722350eaaf78d48de08c3f561c225173c469b44f2850a8c05cfa370',
'SH-027':'07c5abfbde4d29bd87d33bf8a2c9a17fae2f7889b287779eb2dc608b5b8dadea',
'SH-028':'0f49b8719790ddc663f5aaf15b7f3deb1c52fe3473bffcfcfa6a142e894d59ab',
'SH-029':'c39c501abe5f18b77b05e099b75bcfd4a1f22ce38db3c0b34d41cde5f4cc9af2',
'SH-030':'7ee591212fd003200cd8a8f0a17292f53720fc9b07006fa62290497bdfb2ce8e',
'SH-031':'b941a20724da95a6ff6d7167e4e442f19e46d2d80513d1c3f4ddb5d27a194d76',
'SH-032':'b233ecc0cdb6febdd1767e4ac9735af750a2682f4712f0973c9ca47bdb63e9e6',
'SH-033':'8702a282c36b0bf062816ba87e962fb22ac08216575e7d3282690b1c572fdc83',
'SH-034':'85593363f25b436a24d7e4396d532d470577cebc4d3854bdee51d5d2b87412fa',
'SH-035':'9576fc3e64fc4b4dede7308c7ce9a15d456da2173c7195b7cabab9eaf5cea976',
'SH-035-B':'0ab53d83bf728a37d834b4fb6e5c628883c5672d4f168f786df2d3cc38181048',
'SH-036':'44f2de434f7cf99e5e803744c4d0f4e59a1a48063652c6eb54bb2ed3de0bf136',
'SH-036-B':'44a91f5163fa2e55c8a64950f6504a9815f3520e8200b4442f120e198b4ffff2',
'SH-037':'d313444e9a512cb8677fe4c4d9b0543b428781f88c87dcef27d3a986e55f72d8',
'SH-038':'77871fc831fcbb06b267fdce97849e0df34dad34985172e2ebc028242b7532f8'
}
# Source hashes are checked before any publication. Correct values are never
# inferred from the current download merely to make a failed check pass.
DRAFTS = ['020-022','023-025','026-027','028','029-030','031-032','033','034-035','035b-036b','037-038']
NEW_JS = 'data/commentary-main-020-038.js'

def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def read(name: str) -> str:
    return (BASE / name).read_text(encoding='utf-8')

def write(name: str, text: str) -> None:
    p = BASE / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text, encoding='utf-8')

def replace(text: str, old: str, new: str, label: str, count: int = 1) -> str:
    actual = text.count(old)
    if actual != count:
        raise RuntimeError(f'{label}: expected {count} occurrences, found {actual}: {old[:90]}')
    return text.replace(old, new)

def patch(name: str, pairs: list[tuple[str,str]]) -> None:
    s = read(name)
    for a,b in pairs:
        s = replace(s,a,b,name)
    write(name,s)

def clean_arabic(raw: str) -> str:
    # Preserve wording, poetry, and paragraph sequence. Only remove markers and
    # displayed print-variant insertions; the untouched raw text is also retained.
    s = re.sub(r'\([^)]*-\s*خ(?:\s*ل)?[^)]*\)|\[[^\]]*-\s*ظ[^\]]*\]', '', raw)
    s = re.sub(r'«\s*\d+\s*»', '', s)
    s = re.sub(r'^\(\s*\d+\s*\)\s*(?=أقول)', '', s)
    return '\n'.join(re.sub(r'[ \t]+',' ',line).strip() for line in s.splitlines()).strip()

def assemble(source_zip: pathlib.Path) -> tuple[list[dict], dict]:
    with zipfile.ZipFile(source_zip) as z:
        names = [n for n in z.namelist() if n.endswith('source-pages.json')]
        if len(names) != 1: raise RuntimeError('Ambiguous or absent source-pages.json')
        source = json.loads(z.read(names[0]))
    pages = source['pages']
    if [p['printed_page'] for p in pages] != list(range(95,178)):
        raise RuntimeError('Expected complete source sequence 95–177')
    if source.get('failures') or any('error' in p for p in pages):
        raise RuntimeError('Source retrieval contains failures')
    full = ''; positions = []
    for p in pages:
        positions.append((len(full),p['printed_page']))
        full += p['text'] + '\n\n'
    offsets = [x[0] for x in positions]
    page_at = lambda n: positions[bisect.bisect_right(offsets,n)-1][1]
    starts = list(re.finditer(r'(?m)^قال\s*(?:«\s*\d+\s*»\s*)?:\s*«',full))
    keys = list(range(20,36)) + ['35B',36,'36B',37,38,39,'39B']
    if len(starts) != len(keys): raise RuntimeError('Unexpected authorial quotation boundaries')
    source_units = {}
    for j,m in enumerate(starts[:-1]):
        end = starts[j+1].start()
        block = full[m.start():end]
        aq = re.search(r'(?:\(\s*\d+\s*\)\s*)?أقول\s*:',block)
        if not aq: raise RuntimeError(f'No commentary boundary after source lemma {keys[j]}')
        begin = m.start()+aq.start()
        trail = re.search(r'\n\s*\[[^\]]*\]\s*$',full[begin:end])
        if trail: end = begin+trail.start()
        while full[end-1].isspace(): end-=1
        raw = full[begin:end].strip()
        k = keys[j]
        id_ = f'SH-{k:03d}' if isinstance(k,int) else 'SH-'+k[:2].zfill(3)+'-B'
        source_units[id_] = {'raw':raw,'pages':list(range(page_at(begin),page_at(end-1)+1)),
          'quote':full[m.start():begin].strip(),
          'hash':sha(re.sub(r'\s+',' ',raw).encode('utf-8'))}
    drafts = {}
    for suffix in DRAFTS:
        name = f'data/main-commentary-{suffix}.en.json'
        # Draft transport may contain literal newlines in JSON strings. Preserve
        # their text while writing a strictly valid canonical JSON representation.
        obj = json.loads(read(name),strict=False)
        for u in obj['units']:
            if u['id'] in drafts: raise RuntimeError('Duplicate translation '+u['id'])
            drafts[u['id']] = u
        write(name,json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
    if set(drafts)!=set(EXPECTED): raise RuntimeError('Unexpected translated-unit set')
    units = []; checks = []
    for seq,id_ in enumerate(EXPECTED,20):
        src = source_units[id_]; u = dict(drafts[id_])
        if src['hash']!=EXPECTED[id_]:
            raise RuntimeError(f'Reviewed Arabic hash mismatch {id_}: {src["hash"]} != {EXPECTED[id_]}')
        if u['pages']!=src['pages']: raise RuntimeError('Page boundary mismatch '+id_)
        if not u['english'].strip() or not u.get('notes'): raise RuntimeError('Incomplete translation '+id_)
        u.update(sequence=seq,part='main',kind='sharh',page=u['pages'][0],
          sourceEdition='A',sourceEditionLabel='Āshtiyānī edition',
          sourceLocator='A, printed pp. '+str(u['pages'][0])+'–'+str(u['pages'][-1]),
          sourceUrl=f'https://ablibrary.net/book_content/b/17638/{u["pages"][0]+196}?lang=ar',
          moreSourceUrls=[f'https://ablibrary.net/book_content/b/17638/{p+196}?lang=ar' for p in u['pages'][1:]],
          arabic=clean_arabic(src['raw']),arabicSourceTranscription=src['raw'],sourceTextSha256=src['hash'],
          ArabicSourceStatus='reviewed electronic printed-edition transcription; modern remarks excluded; not manuscript-collated',
          translationDate=DATE)
        if id_.endswith('-B'):
            if not u.get('precedingMatnEnglish'): raise RuntimeError('Missing bridge-quotation translation')
            u['precedingMatnArabic']=clean_arabic(src['quote'])
            u['bridgeAttribution']='Ancestor’s additional bridge quotation; separate from the descendant’s commentary; existing QT numbering preserved.'
        units.append(u)
        checks.append({'id':id_,'pages':u['pages'],'sourceTextSha256':src['hash'],'matchesReviewedSource':True})
    write(NEW_JS,'/* Tamhīd stage 13: 21 independently translated explanations, A pp.95–172. */\nwindow.GNAMMA_TAMHID_MAIN = (window.GNAMMA_TAMHID_MAIN || []).concat('+json.dumps(units,ensure_ascii=False,indent=2)+');\n')
    clean_pages=[{k:p[k] for k in ('printed_page','url','html_sha256','text','words') if k in p} for p in pages if p['printed_page']<=172]
    write('sources/A_MAIN_095_172.json',json.dumps({'sourceEdition':'A','scope':'Medieval main text, printed pp.95–172; marked modern editorial remarks excluded.','pages':clean_pages},ensure_ascii=False,indent=2)+'\n')
    report={'date':DATE,'newCommentaryUnits':len(units),'newMainMatnRange':['QT-020','QT-038'],'sourcePageRange':[95,172],
      'nextUntranslatedMatn':'QT-039','checks':checks,'allReviewedHashesMatch':True,
      'newEnglishWords':sum(len(u['english'].split()) for u in units),
      'bridgeQuotationEnglishWords':sum(len(u.get('precedingMatnEnglish','').split()) for u in units),
      'independentManuscriptsCollated':0,'wholeWorkComplete':False}
    return units,report

def integrate() -> None:
    old='<script src="data/commentary-main-001-019.js"></script>'
    for name in ['index.html','commentary.html']:
        patch(name,[(old,old+'\n<script src="'+NEW_JS+'"></script>')])
    patch('data/commentary-corpus.js',[
      ("updated:'2026-11-03'","updated:'2026-11-04'"),
      ('QT001–019','QT001–038'),('QT020–060','QT039–060'),
      ('mainLastMatn:"QT-019"','mainLastMatn:"QT-038"'),
      ('Main commentary pp.48–95','Main commentary pp.48–172'),
      ("after:'SH-019'","after:'SH-038'"),
      ('The commentary on QT-020–QT-060 remains untranslated; the continuous main translation currently ends at QT-019 (printed p.95).','The commentary on QT-039–QT-060 remains untranslated; the continuous main translation currently ends at QT-038 (printed p.172). Two additional explanations are retained under SH-035-B and SH-036-B.')])
    patch('commentary-main-bridge.js',[
      ('Array.from({length:48},(_,i)=>i+48)','Array.from({length:125},(_,i)=>i+48)'),
      ('main commentary QT001–019','main commentary QT001–038')])
    patch('index.html',[
      ('<b>19</b> main commentary sections','<b>40</b> main commentary sections'),
      ('QT-001–QT-019 (pp.48–95)','QT-001–QT-038 (pp.48–172), including two additional bridge explanations'),
      ('QT-020–QT-060 remains in progress','QT-039–QT-060 remains in progress')])
    patch('commentary.html',[
      ('id="main-count">19','id="main-count">40'),('id="total-count">65','id="total-count">86'),
      ('now reaches QT-019, printed p.95; QT-020–QT-060','now reaches QT-038, printed p.172, including two additional bridge explanations; QT-039–QT-060'),
      ('authorial introduction and closing discussion, translated from the Arabic','authorial introduction, main commentary through QT-038, and closing discussion, translated from the Arabic')])
    s=read('commentary-reader.js')
    s=replace(s,'19 continuous main commentary sections','40 continuous main commentary sections through QT-038 (including two bridge explanations)','commentary contents')
    s=replace(s,'QT-020–QT-060 remains pending','QT-039–QT-060 remains pending','commentary source panel')
    helper="""function bridgeHTML(u){
 if(!u.precedingMatnArabic)return '';
 return '<aside class="layer-note bridge-quotation"><strong>Ancestor’s bridge quotation · distinct from the commentary</strong><div class="text-pair"><div class="ar" lang="ar" dir="rtl">'+esc(u.precedingMatnArabic)+'</div><div class="en" lang="en">'+esc(u.precedingMatnEnglish)+'</div></div></aside>';
}
"""
    s=replace(s,'function unitHTML(u,i){',helper+'function unitHTML(u,i){','commentary bridge helper')
    s=replace(s,"+esc(u.section)+'</h2><div class=\"text-pair\">'","+esc(u.section)+'</h2>'+bridgeHTML(u)+'<div class=\"text-pair\">'",'commentary bridge display') if False else s
    # The next fragment includes the opening Arabic container, avoiding accidental
    # replacements elsewhere in the two-column renderer.
    s=replace(s,"+esc(u.section)+'</h2><div class=\"text-pair\"><div class=\"ar\"", "+esc(u.section)+'</h2>'+bridgeHTML(u)+'<div class=\"text-pair\"><div class=\"ar\"",'commentary bridge insertion')
    s=replace(s,"name='Tamhid_Introduction_and_Conclusion_AR_EN.md'","name='Tamhid_Commentary_Available_AR_EN.md'",'commentary export name')
    s=replace(s,"lines.push('## '+u.id+' · '+u.section,u.sourceLocator,u.sourceUrl,'','### Arabic'", "if(u.precedingMatnArabic)lines.push('### Ancestor bridge quotation (separate voice)',u.precedingMatnArabic,u.precedingMatnEnglish,'');lines.push('## '+u.id+' · '+u.section,u.sourceLocator,u.sourceUrl,'','### Arabic'",'commentary export bridge')
    write('commentary-reader.js',s)
    s=read('reader.js')
    old="'<h4>'+esc(c.section)+'</h4>'+textPair(c.arabic,c.english)"
    new="'<h4>'+esc(c.section)+'</h4>'+(c.precedingMatnArabic?'<aside class=\"layer-note bridge-quotation\"><strong>Ancestor’s bridge quotation · not commentary</strong>'+textPair(c.precedingMatnArabic,c.precedingMatnEnglish)+'</aside>':'')+textPair(c.arabic,c.english)"
    s=replace(s,old,new,'paired reader bridge');write('reader.js',s)

    # Retain all earlier tests and strengthen the sequence/bridge assertions.
    s=read('qa/check-commentary.mjs')
    s=replace(s,"'data/commentary-main-001-019.js','data/commentary-corpus.js'","'data/commentary-main-001-019.js','"+NEW_JS+"','data/commentary-corpus.js'",'QA source files')
    for a,b in [('corpus.units.length,65','corpus.units.length,86'),('corpus.coverage.mainUnits,19','corpus.coverage.mainUnits,40'),('.size,65','.size,86'),('corpus.units.slice(59)','corpus.units.slice(80)'),("el('total-count').textContent,65","el('total-count').textContent,86"),("/g)||[]).length,65","/g)||[]).length,86"),("newButton.dataset.jump='59';newButton.attributes['data-jump']='59'","newButton.dataset.jump='80';newButton.attributes['data-jump']='80'"),('mainUnits:19','mainUnits:40'),('totalUnits:65','totalUnits:86')]:
        s=replace(s,a,b,'QA '+a)
    extra="""const expectedMain=[];for(let n=1;n<=38;n++){expectedMain.push('SH-'+String(n).padStart(3,'0'));if(n===35||n===36)expectedMain.push('SH-'+String(n).padStart(3,'0')+'-B');}
assert.deepEqual(Array.from(corpus.units.slice(40,80),u=>u.id),expectedMain);
assert.equal(corpus.coverage.mainLastMatn,'QT-038');assert.equal(corpus.gap.after,'SH-038');assert.ok(corpus.gap.description.includes('QT-039'));
for(const id of ['SH-035-B','SH-036-B']){const u=corpus.units.find(x=>x.id===id);assert.ok(u.precedingMatnArabic.startsWith('قال'));assert.ok(u.precedingMatnEnglish.length>30);assert.ok(!u.arabic.startsWith('قال'));}
assert.ok(corpus.units.find(u=>u.id==='SH-032').arabic.includes('النفس'));
assert.ok(corpus.units.find(u=>u.id==='SH-038').english.includes('textually unsettled'));
const alignment=JSON.parse(read('qa/stage13-source-alignment.json'));assert.equal(alignment.checks.length,21);assert.ok(alignment.checks.every(x=>x.matchesReviewedSource));
"""
    s=replace(s,'// The final online continuation',extra+'\n// The final online continuation','QA added checks')
    s=replace(s,"assert.equal((el('reading-list').innerHTML.match(/class=\"corpus-gap\"/g)||[]).length,1);", "assert.equal((el('reading-list').innerHTML.match(/class=\"corpus-gap\"/g)||[]).length,1);\nassert.equal((el('reading-list').innerHTML.match(/bridge-quotation/g)||[]).length,2);",'QA rendered bridge count')
    write('qa/check-commentary.mjs',s)

    manifest_path=BASE.parents[1]/'manifest.json'
    m=json.loads(manifest_path.read_text(encoding='utf-8'))
    other_before=[x for x in m['texts'] if x.get('id')!='turka-qawaid-tawhid']
    item=next(x for x in m['texts'] if x['id']=='turka-qawaid-tawhid')
    item.update(sharh_units=86,sharh_translation_status='40 introduction + 40 main commentary sections through QT038 + 6 concluding sections; QT039–060 pending',sharh_main_units=40,sharh_last_matn='QT-038',sharh_reading_url='texts/al-turka/qawaid-al-tawhid/commentary.html',note='61 unchanged ancestral matn units. Separate Tamhid translation: 40 introductory sections, 40 main explanations through QT-038 (A pp.48–172, including SH-035-B and SH-036-B), and six concluding sections. 86 bilingual commentary units in all. QT-039–QT-060 remains untranslated. Lumbard is a checked comparator where his selection overlaps; later passages are independently translated from Arabic. QT-059 omission remains noted and deferred. Source-hash verification does not constitute independent manuscript collation.')
    if other_before!=[x for x in m['texts'] if x.get('id')!='turka-qawaid-tawhid']:raise RuntimeError('Unrelated catalogue entries changed')
    m['updated']=DATE;manifest_path.write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

def main() -> None:
    args=argparse.ArgumentParser();args.add_argument('--source-zip',type=pathlib.Path,required=True);opt=args.parse_args()
    protected=['data/units.js','data/parallel-matn.md','data/commentary-main-001-019.js']
    before={p:sha((BASE/p).read_bytes()) for p in protected}
    units,report=assemble(opt.source_zip)
    integrate()
    report['protectedFilesUnchanged']={p:before[p]==sha((BASE/p).read_bytes()) for p in protected}
    if not all(report['protectedFilesUnchanged'].values()):raise RuntimeError('Protected earlier text changed')
    write('qa/stage13-source-alignment.json',json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k!='checks'},ensure_ascii=False,indent=2))

if __name__=='__main__':main()
