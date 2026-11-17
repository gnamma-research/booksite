#!/usr/bin/env python3
"""Assemble the reviewed commentary translation from two fixed source snapshots.
No conjectural Arabic completion, network requests, or unrelated repository edits.
"""
from __future__ import annotations
import argparse, bisect, hashlib, json, pathlib, re

def hash_bytes(b): return hashlib.sha256(b).hexdigest()
def norm(s): return re.sub(r'\s+', ' ', s.strip())
def source_hash(s): return hash_bytes(norm(s).encode())

def build(root, source13, source_final):
    read=lambda p:(root/p).read_text(encoding='utf-8')
    def write(p,s):
        f=root/p;f.parent.mkdir(parents=True,exist_ok=True);f.write_text(s,encoding='utf-8')
    def patch(s,a,b,label):
        if a not in s: raise ValueError('Unexpected current file: '+label)
        return s.replace(a,b)
    expected=['205df0f7f57d4ad89e3e4ec39834e224bc25bf1955282eef4ff0d7abc3a7b0b3','59b4dde195934665f53cc9f9799e2dcde655b220de263206e0540a724f111548']
    for f,h in zip([source13,source_final],expected):
        if hash_bytes(f.read_bytes())!=h:raise ValueError('Source snapshot changed: '+str(f))
    matn_hash=hash_bytes((root/'data/units.js').read_bytes())
    pages={p['printed_page']:p for p in json.loads(source13.read_text())['pages']}
    pages.update({p['printed_page']:p for p in json.loads(source_final.read_text())['pages']})
    if sorted(pages)!=list(range(95,271)):raise ValueError('Non-contiguous source pages')
    full='';positions=[];retained=[];excluded=[]
    for n,p in sorted(pages.items()):
        if p.get('error'):raise ValueError('Source retrieval error')
        text=p['text']
        if '\nهامش\n' in text:
            text,tail=text.split('\nهامش\n',1)
            excluded.append({'page':n,'reason':'untagged later editorial tail headed هامش','excludedTailSha256':source_hash(tail)})
        positions.append((len(full),n));full+=text+'\n\n'
        retained.append({'printed_page':n,'url':p['url'],'html_sha256':p.get('html_sha256'),'text':text})
    if [x['page'] for x in excluded]!=[205,208,219,240]:raise ValueError('Unexpected unmarked note boundaries')
    offsets=[x[0] for x in positions]
    page_at=lambda i:positions[bisect.bisect_right(offsets,i)-1][1]
    markers=list(re.finditer(r'(?m)^قال\s*(?:«\s*\d+\s*»\s*)?:\s*',full))
    ids=[]
    for i in range(20,61):
        ids.append(f'SH-{i:03d}')
        if i in [35,36,39,40]:ids.append(f'SH-{i:03d}-B')
    if len(markers)!=len(ids)+1:raise ValueError('Unexpected number of source quotation boundaries')
    drafts={}; repaired_draft_json=[]
    for f in sorted((root/'data').glob('main-commentary-*.en.json')):
        original=f.read_text(encoding='utf-8')
        try:
            draft_data=json.loads(original)
        except json.JSONDecodeError:
            # Two earlier JSON uploads contained literal line breaks inside strings.
            # Preserve the decoded English, changing only its JSON serialization.
            draft_data=json.loads(original,strict=False)
            normalized=json.dumps(draft_data,ensure_ascii=False,indent=2)+'\n'
            assert json.loads(normalized)==draft_data
            f.write_text(normalized,encoding='utf-8')
            repaired_draft_json.append(f.name)
        for u in draft_data['units']:
            if u['id'] in drafts:raise ValueError('Duplicate draft '+u['id'])
            drafts[u['id']]=u
    if not all(i in drafts for i in ids):raise ValueError('Missing translations')
    bridges=json.loads(read('data/commentary-bridge-translations.json'))['bridges']
    variant_re=r'\([^)]*-\s*خ(?:\s*ل)?[^)]*\)|\[[^\]]*-\s*ظ[^\]]*\]'
    def clean(t):
        t=re.sub(variant_re,'',t)
        t=re.sub(r'^\(\s*\d+\s*\)\s*','',t)
        t=re.sub(r'«\s*\d+\s*»','',t)
        return re.sub(r'[ \t]+',' ',t).strip()
    units=[];audit=[]
    for i,(id,a,b) in enumerate(zip(ids,markers,markers[1:])):
        block=full[a.end():b.start()]
        aq=re.search(r'(?:\(\s*\d+\s*\)\s*)?أقول\s*:',block)
        if aq is None:raise ValueError('No a-qulu: '+id)
        begin=a.end()+aq.start();end=b.start()
        tail=re.search(r'\n\s*\[[^\]]*\]\s*$',full[begin:end])
        if tail:end=begin+tail.start()
        raw=full[begin:end].strip();draft=drafts[id]
        actual_pages=list(range(page_at(begin),page_at(end-1)+1))
        if draft['pages']!=actual_pages:raise ValueError(f'Page mismatch {id}: {actual_pages} vs {draft["pages"]}')
        if len(re.findall(r'(?:^|\n)(?:\(\s*\d+\s*\)\s*)?أقول\s*:',raw))!=1:raise ValueError('Merged commentary boundaries '+id)
        if not draft['english'].strip():raise ValueError('Empty English '+id)
        variants=re.findall(variant_re,raw)
        u={**draft,'kind':'sharh','part':'main','sequence':20+i,'page':actual_pages[0],
           'sourceEdition':'A','sourceEditionLabel':'Āshtiyānī edition','sourceLocator':'A, printed pp. '+str(actual_pages[0])+'–'+str(actual_pages[-1]),
           'sourceUrl':f'https://ablibrary.net/book_content/b/17638/{actual_pages[0]+196}?lang=ar',
           'moreSourceUrls':[f'https://ablibrary.net/book_content/b/17638/{p+196}?lang=ar' for p in actual_pages[1:]],
           'arabic':clean(raw),'arabicSourceTranscription':raw,'sourceTextSha256':source_hash(raw),
           'reportedApparatusStrings':variants,'ArabicSourceStatus':'complete electronic source passage; modern marked and identified unmarked notes excluded; no manuscript collation'}
        if id in bridges:
            quoted=block[:aq.start()].strip()
            u['precedingMatn']={**bridges[id],'arabic':clean(quoted),'arabicSourceTranscription':quoted,'sourceTextSha256':source_hash(quoted),'attribution':'Abū Ḥāmid Turka — ancestral matn, not descendant commentary'}
            u.pop('precedingMatnEnglish',None)
        if variants:u['notes']=[*u['notes'],'Reported electronic apparatus strings, not independent manuscript readings: '+'; '.join(variants)]
        units.append(u)
        audit.append({'id':id,'matnId':u['matnId'],'pages':actual_pages,'sourceTextSha256':u['sourceTextSha256'],'englishSha256':hash_bytes(u['english'].encode()),'arabicTokensIncludingApparatus':len(raw.split()),'englishWords':len(u['english'].split()),'additionalMatnQuotation':id in bridges})
    if len(units)!=45:raise ValueError('Wrong new section count')
    for id in ['SH-026','SH-029','SH-032','SH-048','SH-057','SH-060']:
        u=next(x for x in units if x['id']==id)
        if 'شعر' not in u['arabic'] and id!='SH-032':raise ValueError('Poetry marker absent '+id)
    write('data/commentary-main-020-060.js','/* Continuous main commentary, SH-020–060 plus four authorial bridges. Source-based working translation. */\nwindow.GNAMMA_TAMHID_MAIN = (window.GNAMMA_TAMHID_MAIN || []).concat('+json.dumps(units,ensure_ascii=False,indent=2)+');\n')
    write('sources/A_MAIN_095_270.json',json.dumps({'edition':'A: Ashtiyani electronic transcription','scope':'Medieval main text, printed pp.95–270; marked notes and identified tails excluded','sourceSnapshotSha256':expected,'excludedUnmarkedTails':excluded,'pages':retained},ensure_ascii=False,indent=2)+'\n')
    report={'date':'2026-11-04','newMainSections':45,'totalMainSections':64,'sourcePageSpan':[95,270],'newCommentaryPageSpan':[95,269],'wholeAvailableSourceSequenceTranslated':True,'independentlyCollatedManuscripts':0,'unchangedMatnSha256':matn_hash,'excludedUnmarkedTails':excluded,'repairedDraftJsonWithoutTextChange':repaired_draft_json,'rows':audit,'newEnglishWords':sum(r['englishWords'] for r in audit)}
    write('qa/complete-source-alignment.json',json.dumps(report,ensure_ascii=False,indent=2)+'\n')

    s=read('data/commentary-corpus.js')
    s=s.replace("updated:'2026-11-03'","updated:'2026-11-04'")
    s=patch(s,"status:'partial-full-work-translation: introduction, main commentary QT001–019, and concluding discussion translated; QT020–060 pending'","status:'complete-source-based-working-translation; independent manuscript collation and specialist review outstanding'",'corpus status')
    s=s.replace('mainLastMatn:"QT-019"','mainLastMatn:"QT-060",additionalMainBridgeUnits:4')
    s=s.replace('wholeCommentaryComplete:false','wholeCommentaryComplete:true,sourceScopedTranslationComplete:true,manuscriptCriticalEditionComplete:false')
    s=s.replace("extent:'Main commentary pp.48–95 and closing commentary pp.270–274'","extent:'Continuous main commentary pp.48–269 and closing commentary pp.270–274; four additional ancestral bridges retained'")
    s,n=re.subn(r"    gap:\{[^\n]*\},", "    gap:{active:false,after:null,before:null,description:'No untranslated interval remains in the consulted authorial sequence. The reported lost ancestral text at QT-059 remains separately noted and unreconstructed.'},",s)
    if n!=1:raise ValueError('Unexpected gap object')
    write('data/commentary-corpus.js',s)
    for name in ['index.html','commentary.html']:
        s=read(name)
        s=patch(s,'<script src="data/commentary-main-001-019.js"></script>','<script src="data/commentary-main-001-019.js"></script>\n<script src="data/commentary-main-020-060.js"></script>',name+' source loading')
        s=s.replace('25 linked commentary sections','70 linked commentary sections')
        s=s.replace('<b>19</b> main commentary sections','<b>64</b> main commentary sections')
        s=s.replace('id="main-count">19','id="main-count">64').replace('id="total-count">65','id="total-count">110')
        if name=='index.html':
            s=s.replace('The introduction, main commentary on QT-001–QT-019 (pp.48–95), and closing discussion are translated from the available Arabic. The commentary on QT-020–QT-060 remains in progress.','The authorial introduction, all main commentary through QT-060, and the closing discussion are now translated from the consulted Arabic sources: 110 bilingual commentary units, including four short connecting sections. This is a complete source-based working translation, not a manuscript-established critical edition.')
        else:
            s=s.replace('Ṣāʾin al-Dīn Ibn Turka’s authorial introduction and closing discussion, translated from the Arabic.','Ṣāʾin al-Dīn Ibn Turka’s authorial introduction, continuous main commentary, and closing discussion, translated from the Arabic.')
            s=s.replace('The continuous main commentary now reaches QT-019, printed p.95; QT-020–QT-060 remains explicitly marked as untranslated.','The main commentary now runs continuously from Āshtiyānī p.48 through the closing discussion on p.274, including four additional connecting sections. The consulted authorial sequence is fully translated; philological review remains open.')
        write(name,s)
    s=read('commentary-main-bridge.js')
    s=s.replace('verifiedArabicPrintedPages:[...Array.from({length:48},(_,i)=>i+48),270,271,272,273,274]','verifiedArabicPrintedPages:Array.from({length:227},(_,i)=>i+48)')
    s=s.replace('The main commentary QT001–019 and the concluding commentary are translated continuously within their stated source ranges.','All main commentary QT001–060, four connecting sections, and the concluding discussion are translated continuously within the consulted sources.')
    s=s.replace('a.matnId.localeCompare(b.matnId)||(sequence[a.id]||0)-(sequence[b.id]||0)','a.matnId.localeCompare(b.matnId)||(sequence[a.id]||a.sequence||0)-(sequence[b.id]||b.sequence||0)')
    write('commentary-main-bridge.js',s)
    s=read('commentary-reader.js')
    s=s.replace('if(u.id===corpus.gap.before)','if(corpus.gap.active&&u.id===corpus.gap.before)')
    s=s.replace("if(u.part==='conclusion')html+=gap();","if(corpus.gap.active&&u.part==='conclusion')html+=gap();")
    s=s.replace('u.id===corpus.gap.before?','corpus.gap.active&&u.id===corpus.gap.before?')
    s=s.replace('40 introductory sections, 19 continuous main commentary sections, an explicit untranslated interval, and six concluding sections.','40 introductory sections, 64 continuous main commentary sections (including four connecting passages), and six concluding sections.')
    s=s.replace('<b>The whole work is not yet translated.</b> The introduction and concluding discussion are complete in the consulted online sources; the commentary on QT-020–QT-060 remains pending. No percentage of the whole has been invented.','<b>The consulted authorial sequence is now fully translated.</b> This complete source-based draft does not claim independent manuscript collation or final philological certainty. QT-059’s reported lost ancestral wording remains noted and unreconstructed.')
    bridge="const bridge=u.precedingMatn?'<aside class=\"source-bridge\"><p class=\"part-name\">'+esc(u.precedingMatn.label)+'</p><div class=\"text-pair\"><div class=\"ar\" lang=\"ar\" dir=\"rtl\">'+esc(u.precedingMatn.arabic)+'</div><div class=\"en\">'+esc(u.precedingMatn.english)+'</div></div></aside>':'';"
    s=patch(s,'function unitHTML(u,i){','function unitHTML(u,i){\n '+bridge,'bridge rendering')
    s=patch(s,"return '<article class=\"reading-block\"","return bridge+'<article class=\"reading-block\"",'bridge prefix')
    s=patch(s,"lines.push('## '+u.id+' · '+u.section", "if(u.precedingMatn)lines.push('### '+u.precedingMatn.label,u.precedingMatn.arabic,'',u.precedingMatn.english,'');lines.push('## '+u.id+' · '+u.section",'browser export bridges')
    write('commentary-reader.js',s)
    s=read('reader.js')
    s=s.replace('at pp.48–95 and 270–274. Untranslated locations remain clearly unfilled.','through the continuous main sequence at pp.48–274. The introduction is in the separate commentary reader.')
    s=s.replace('Introduction, main QT001–019, closing discussion, and remaining interval','Complete available commentary: introduction, QT001–060, four bridges, and conclusion')
    s=s.replace('The introduction and main commentary through QT-019 are translated, along with the closing discussion.','The introduction, all main commentary through QT-060, and the closing discussion are translated, including four additional connecting passages.')
    s=patch(s,"'<h4>'+esc(c.section)+'</h4>'+textPair(c.arabic,c.english)","(c.precedingMatn?'<aside class=\"source-bridge\"><p class=\"part-name\">'+esc(c.precedingMatn.label)+'</p>'+textPair(c.precedingMatn.arabic,c.precedingMatn.english)+'</aside>':'')+'<h4>'+esc(c.section)+'</h4>'+textPair(c.arabic,c.english)",'paired bridge')
    write('reader.js',s)
    write('reader.css',read('reader.css')+'\n/* Attribution for previously unnumbered ancestral bridges. */\n.source-bridge{margin:24px 0;padding:18px;border:1px solid var(--line);border-radius:10px;background:var(--wash)}.source-bridge .part-name{font:600 12px ui-sans-serif,system-ui;color:var(--accent);margin:0 0 14px}.source-bridge .text-pair .ar{font-size:calc(21px * var(--scale))}.source-bridge .text-pair .en{font-size:calc(16px * var(--scale))}\n')
    s=read('qa/check-commentary.mjs')
    s=s.replace("'data/commentary-main-001-019.js'","'data/commentary-main-001-019.js','data/commentary-main-020-060.js'")
    s=s.replace('corpus.units.length,65','corpus.units.length,110').replace(').size,65',').size,110').replace('corpus.coverage.mainUnits,19','corpus.coverage.mainUnits,64')
    s=s.replace('corpus.coverage.wholeCommentaryComplete,false','corpus.coverage.wholeCommentaryComplete,true').replace('corpus.units.slice(59)','corpus.units.slice(104)')
    s=s.replace("el('total-count').textContent,65","el('total-count').textContent,110").replace('||[]).length,65','||[]).length,110')
    s=s.replace('class="corpus-gap"/g)||[]).length,1','class="corpus-gap"/g)||[]).length,0')
    s=s.replace("newButton.dataset.jump='59';newButton.attributes['data-jump']='59';","newButton.dataset.jump='104';newButton.attributes['data-jump']='104';")
    s=s.replace("assert.ok(el('reading-list').innerHTML.includes('Intervening commentary not yet translated'));","assert.ok(!el('reading-list').innerHTML.includes('Intervening commentary not yet translated'));")
    s=s.replace('mainUnits:19,concludingUnits:6,totalUnits:65','mainUnits:64,concludingUnits:6,totalUnits:110').replace('wholeCommentaryComplete:false','wholeCommentaryComplete:true')
    s=s.replace('assert.equal(corpus.coverage.mainUnits,64);',"assert.equal(corpus.coverage.mainUnits,64);\nfor(let i=1;i<=60;i++){assert.equal(corpus.units.filter(u=>u.id==='SH-'+String(i).padStart(3,'0')).length,1);}\nassert.equal(corpus.units.filter(u=>u.precedingMatn).length,4);\nassert.equal(corpus.gap.active,false);\nassert.ok(corpus.units.find(u=>u.id==='SH-043').arabic.startsWith('أقول'));\nfor(const u of corpus.units.filter(u=>u.part==='main'))assert.ok(!u.arabic.includes('هامش'),'Unremoved note '+u.id);\n")
    write('qa/check-commentary.mjs',s)
    export="""import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const context=vm.createContext({window:{}});
const files=['commentary.js','commentary-introduction-1.js','commentary-introduction-2.js','commentary-introduction-3.js','commentary-introduction-4.js','commentary-conclusion.js','commentary-main-001-019.js','commentary-main-020-060.js','commentary-corpus.js'];
for(const f of files)new vm.Script(fs.readFileSync(path.join(root,'data',f),'utf8'),{filename:f}).runInContext(context);
const c=context.window.GNAMMA_TAMHID_CORPUS;assert.equal(c.units.length,110);assert.equal(c.coverage.mainUnits,64);assert.equal(c.gap.active,false);
const head=['# Tamhīd al-Qawāʿid — complete available Arabic–English working translation','','**Ṣāʾin al-Dīn Ibn Turka**','','4 November 2026','','40 introductory units, 64 main commentary units (including four connecting explanations), and six concluding units. All authorial commentary in the consulted sources is translated. This is a source-based draft, not a manuscript-established critical edition. The lost ancestral material reported at QT-059 is not reconstructed.','','The introduction follows edition N; the main commentary follows edition A, pp.48–274. Joseph E. B. Lumbard is a checked comparator for his overlapping selections, not the English copy-text.','','## Contents','',...c.units.map(u=>'- '+u.id+' — '+u.section),'','---',''];
const lines=[...head],english=[...head];let part='';
for(const u of c.units){if(u.part!==part){part=u.part;const h='# '+({introduction:'I. Authorial introduction',main:'II. Continuous main commentary',conclusion:'III. Concluding discussion'})[part];lines.push(h,'');english.push(h,'');}
const header=['## '+u.id+' — '+u.section,'','**Source:** '+u.sourceLocator,'',u.sourceUrl,''];lines.push(...header);english.push(...header);
if(u.precedingMatn){lines.push('### '+u.precedingMatn.label,'',u.precedingMatn.arabic,'',u.precedingMatn.english,'');english.push('### '+u.precedingMatn.label,'',u.precedingMatn.english,'');}
lines.push('### Commentary — Arabic','',u.arabic,'','### Commentary — English','',u.english,'');english.push(u.english,'');
if(u.notes?.length){const n=['### Textual and translation notes','',...u.notes.map((s,i)=>(i+1)+'. '+s),''];lines.push(...n);english.push(...n);}lines.push('---','');english.push('---','');}
fs.writeFileSync(path.join(root,'data/parallel-commentary.md'),lines.join('\\n'));fs.writeFileSync(path.join(root,'data/commentary-english.md'),english.join('\\n'));fs.writeFileSync(path.join(root,'data/commentary-corpus.json'),JSON.stringify(c,null,2)+'\\n');
const totals={units:c.units.length,introduction:40,main:64,conclusion:6,additionalAncestralBridges:4,englishWords:c.units.reduce((n,u)=>n+u.english.trim().split(/\\s+/).length,0),bridgeEnglishWords:c.units.reduce((n,u)=>n+(u.precedingMatn?.english.trim().split(/\\s+/).length||0),0),newlyIntegratedEnglishWords:c.units.filter(u=>u.part==='main'&&u.sequence>=20).reduce((n,u)=>n+u.english.trim().split(/\\s+/).length,0),completeAvailableSourceTranslation:true,manuscriptCriticalEditionComplete:false};fs.writeFileSync(path.join(root,'qa/commentary-export-report.json'),JSON.stringify(totals,null,2)+'\\n');console.log(JSON.stringify(totals,null,2));
"""
    write('qa/export-commentary.mjs',export)
    manifest_path=root.parents[1]/'manifest.json'
    manifest=json.loads(manifest_path.read_text());entry=next(e for e in manifest['texts'] if e['id']=='turka-qawaid-tawhid')
    entry.update(sharh_units=110,sharh_introduction_units=40,sharh_main_units=64,sharh_conclusion_units=6,sharh_translation_status='complete-available-source-working-translation; manuscript-critical-validation-pending',sharh_translation_complete_in_consulted_sources=True,sharh_reader_url='texts/al-turka/qawaid-al-tawhid/commentary.html',note='61 unchanged original matn units, plus 110 translated commentary units: 40 introductory, 64 continuous main explanations including four additional connecting passages, and six concluding units. All authorial commentary in the consulted N introduction and A pp.48–274 is translated. Lumbard is checked where his selection overlaps. The reported QT059 loss remains noted and unreconstructed. Complete source-based working translation; independent manuscript collation and specialist review remain open.')
    manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    rows='\n'.join(f"| {u['id']} | {u['pages'][0]}–{u['pages'][-1]} | {u['section']} |" for u in units)
    status=f'''# Tamhīd al-Qawāʿid — complete available commentary translation

**4 November 2026.** The consulted authorial sequence is now translated throughout: **110 Arabic–English commentary units** (40 introductory, 64 main explanations, and 6 concluding sections). This is a **complete source-based working translation**, not a manuscript-established critical edition or a claim that lost historical wording has been restored.

[Read from the beginning](../commentary.html) · [Continue at SH-020](../commentary.html#SH-020) · [Arabic–English text](../data/parallel-commentary.md) · [English text](../data/commentary-english.md).

## Coverage

The introduction follows the medieval text in edition **N** (online printed markers 19–42 and its unnumbered final continuation). The main commentary follows edition **A**, Āshtiyānī's online transcription, continuously from the first **أقول** at p.48 through the conclusion at p.274. N and A page numbers are not interchangeable.

The original 61-unit Qawāʿid reader remains unchanged. Four additional ancestral connecting quotations, with their own commentary, are now retained at their source positions: SH-035-B, SH-036-B, SH-039-B, and SH-040-B. Their attribution is explicitly separate. The following main additions are integrated:

| Commentary | A pages | Subject |
|---|---|---|
{rows}

The newly integrated 45 main passages contain **{report['newEnglishWords']:,} English words**, excluding the four separately translated ancestral connecting quotations. Cumulative counts are in [the export report](../qa/commentary-export-report.json).

## Source integrity and uncertainty

All 176 source pages from p.95 through p.270 were retained from two fixed, reviewed retrieval snapshots. The assembler validates those snapshot hashes before extracting the 45 commentary passages. It accepts quotation boundaries without an opening guillemet (needed at QT-043) and boundaries with an intervening footnote marker (needed at QT-032). The four untagged later editorial tails on pp.205, 208, 219 and 240 are excluded in addition to the site's marked modern notes. Prose paragraphs and poetry are included. [Alignment record](../qa/complete-source-alignment.json).

This demonstrates electronic source identity and continuity, not manuscript authenticity or a final philosophical adjudication. Duplications and damaged readings are explicitly noted; plausible English interpretations are not misrepresented as independently attested Arabic corrections. Arguments attributed to opponents remain distinct from replies.

## Lumbard and QT-059

Joseph E. B. Lumbard's translation remains a checked comparator for the preface and early main sections within his selection. The later commentary lies outside that selection and is independently translated from Arabic with consistent terminology. [Comparison standard](LUMBARD_COMMENTARY_STANDARD.md).

The reported missing words of the **ancestor's matn at QT-059** remain noted and deferred, as requested. SH-059 translates the surviving **descendant's commentary**; it does not reconstruct the lost original passage. No further source acquisition is made a precondition for using this edition.

## Reading and review

The previous untranslated interval is removed because the main translation now reaches the already translated conclusion. The Together view provides commentary for every QT unit and displays the additional ancestral quotations with separate labels. Continuous reading, bookmarks, notes, search, and text export remain available. A complete translation does not dispense with specialist philological review or independent manuscript collation.
'''
    write('editorial/COMMENTARY_TRANSLATION.md',status)
    write('editorial/STAGE14_COMPLETE_AVAILABLE_COMMENTARY.md',status)
    write('editorial/EDITORIAL_STATUS.md','## Current release — complete available commentary (4 November 2026)\n\n110 bilingual commentary units now cover the consulted authorial introduction, every main explanation, four connecting sections and the conclusion. QT-059’s lost ancestor wording remains deferred, not reconstructed. [Current full status](COMMENTARY_TRANSLATION.md). Earlier stages below are historical.\n\n'+read('editorial/EDITORIAL_STATUS.md'))
    write('editorial/LUMBARD_COMMENTARY_STANDARD.md',read('editorial/LUMBARD_COMMENTARY_STANDARD.md')+'\n## Completion of the consulted commentary (4 November 2026)\n\nThe 110-unit commentary now runs continuously through its conclusion. Later sections exceed Lumbard’s supplied selection and use the established terminology without implying that his English supplies their text. Source uncertainty and all departures remain distinguishable from manuscript readings.\n')
    if hash_bytes((root/'data/units.js').read_bytes())!=matn_hash:raise ValueError('Original matn altered')
    print(json.dumps({'newSections':45,'totalMain':64,'totalCommentary':110,'newEnglishWords':report['newEnglishWords'],'unchangedMatnHash':matn_hash},indent=2))

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--root',type=pathlib.Path,default=pathlib.Path(__file__).resolve().parents[1]);p.add_argument('--source13',type=pathlib.Path,required=True);p.add_argument('--source-final',type=pathlib.Path,required=True);a=p.parse_args();build(a.root,a.source13,a.source_final)
