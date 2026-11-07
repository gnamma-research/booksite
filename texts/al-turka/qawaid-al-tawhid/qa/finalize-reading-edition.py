#!/usr/bin/env python3
"""Finalize the source-based reading edition. No network or conjectural Arabic completion."""
from __future__ import annotations
import argparse, hashlib, json, pathlib, re, subprocess

def digest(b): return hashlib.sha256(b).hexdigest()
def assigned(s): return json.loads(s[s.index('{',s.index('window.GNAMMA_')):s.rfind('}')+1])

def main(root):
    read=lambda name:(root/name).read_text(encoding='utf-8')
    def write(name,text):
        p=root/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text,encoding='utf-8')
    protected=['data/units.js','data/parallel-matn.md','data/commentary-main-001-019.js','data/commentary-main-020-060.js']
    before={f:digest((root/f).read_bytes()) for f in protected}
    data=assigned(read('data/commentary.js'))
    if [u['id'] for u in data['units']]!=['SH-061-A','SH-061-B']:raise RuntimeError('Unexpected final-page module')
    data['updated']='2026-11-04';data['state']='final-closing-excerpts-source-module'
    data['coverage']['scopeNote']='This file retains SH-061-A/B only. It is one source module, not the whole corpus. The complete 110-unit translation is assembled in commentary-corpus.js; all main commentary is available in the linked reader.'
    data['queue']=[]
    data['policy']['sourceScope']='Closing excerpts from A p.274. See commentary-corpus.js for the complete source-scoped introduction, main commentary and conclusion.'
    u=data['units'][0]
    if not any(s in u['english'] for s in ['keys to his closures and states','keys to his locks and states']):raise RuntimeError('Unexpected SH-061-A wording')
    u['english']=u['english'].replace('keys to his closures and states','keys to his locks and states')
    u['notes'][1]='Printed alternatives: أقفاله وأحواله / إقباله وأحواله / أفعاله وأحواله. “Locks and states” preserves the displayed metaphor of keys and locks; it does not decide between the reported alternatives. No independent manuscript has been collated.'
    write('data/commentary.js','/* Gnamma: preserved final-page source module, SH-061-A/B.\n   The complete 110-unit translation is assembled in commentary-corpus.js. */\nwindow.GNAMMA_TAMHID_SHARH = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n')
    reader=read('reader.js').replace('Commentary reserved','Commentary data unavailable')
    reader=reader.replace("The commentary for '+esc(u.id)+' has not yet been source-checked and translated. Its place is reserved here; no reconstructed Arabic is displayed.","The linked commentary for '+esc(u.id)+' did not load. The complete available translation is in the commentary reader; this is a loading issue, not an untranslated passage.")
    reader=reader.replace('opens the grandson’s translation and its reserved locations','opens the complete available translation of the grandson’s commentary')
    write('reader.js',reader)
    bridge=read('commentary-main-bridge.js')
    if "data.state='complete-source-scoped-main-commentary'" not in bridge:
        needle='  data.coverage={...data.coverage,'
        if bridge.count(needle)!=1:raise RuntimeError('Unexpected bridge implementation')
        bridge=bridge.replace(needle,"  data.state='complete-source-scoped-main-commentary';\n  data.queue=Array.from({length:61},(_,i)=>{const matnId='QT-'+String(i+1).padStart(3,'0');const linked=data.units.filter(u=>u.matnId===matnId);return {matnId,status:linked.length?'translated-in-consulted-source':'source-data-missing',unitIds:linked.map(u=>u.id)};});\n"+needle)
        write('commentary-main-bridge.js',bridge)
    subprocess.run(['node',str(root/'qa/check-commentary.mjs')],check=True)
    subprocess.run(['node',str(root/'qa/export-commentary.mjs')],check=True)
    corpus=json.loads(read('data/commentary-corpus.json'));units=corpus['units'];assert len(units)==110
    exports={f:read(f) for f in ['data/parallel-commentary.md','data/commentary-english.md']};checks=[]
    for u in units:
        for field,export in [('arabic','data/parallel-commentary.md'),('english','data/parallel-commentary.md'),('english','data/commentary-english.md')]:
            if u[field] not in exports[export]:raise RuntimeError('Export lost '+u['id']+' '+field)
        if u.get('sourceTextSha256'):
            h=digest(re.sub(r'\s+',' ',u['arabicSourceTranscription'].strip()).encode())
            if h!=u['sourceTextSha256']:raise RuntimeError('Source mismatch '+u['id'])
            checks.append({'unit':u['id'],'recordedSourceHashReproduced':True})
    assert len(checks)==64
    assert set(u['matnId'] for u in units if u.get('matnId'))=={f'QT-{i:03}' for i in range(1,62)}
    for f in protected:
        if digest((root/f).read_bytes())!=before[f]:raise RuntimeError('Protected text changed: '+f)
    page=read('commentary.html');css=read('reader.css').replace('url("../../../assets/gnamma-landscape.webp")','none')
    page=page.replace('<link rel="stylesheet" href="reader.css">','<style>'+css+'</style>')
    page=re.sub(r'<link rel="icon"[^>]+>','',page)
    page=re.sub(r'<img src="../../../assets/gnamma-mark.svg"[^>]*>','',page)
    page=re.sub(r'<script src="[^"]+"></script>','',page)
    base='https://gnamma-research.github.io/booksite/texts/al-turka/qawaid-al-tawhid/'
    page=page.replace('href="./"','href="'+base+'"').replace('href="editorial/','href="'+base+'editorial/')
    logic=read('commentary-reader.js').replace('href="editorial/','href="'+base+'editorial/').replace('href="./#','href="'+base+'#')
    serial=json.dumps(corpus,ensure_ascii=False).replace('<','\\u003c')
    page=page.replace('</body>','<script>window.GNAMMA_TAMHID_CORPUS = '+serial+';</script>\n<script>'+logic.replace('</script','<\\/script')+'</script>\n</body>')
    page=page.replace('id="reading-status" class="reader-status">Opening commentary…','id="reading-status" class="reader-status">110 sections · single-file edition')
    write('downloads/Tamhid_Complete_Commentary_Reading_Edition.html',page)
    report={'date':'2026-11-04','scope':'final source-based reading edition; no newly recovered manuscript text','commentaryUnits':110,'matnUnits':61,'linkedMatnUnits':61,'introductoryUnits':40,'mainUnits':64,'concludingUnits':6,'englishWords':sum(len(u['english'].split()) for u in units),'allArabicEnglishExportSectionsPresent':True,'recordedMainSourceHashesReproduced':len(checks),'sourceHashChecks':checks,'fourAncestralBridgesSeparatelyAttributed':sum(bool(u.get('precedingMatn')) for u in units)==4,'protectedTextsUnchanged':before,'qt059OriginalLacuna':'noted and deferred, no reconstruction','freshSourceWebsiteAccess':'not part of this audit; retained electronic sources used','independentManuscriptsCollated':0,'completeAvailableSourceTranslation':True,'manuscriptCriticalEditionComplete':False,'browserInteractionTest':'synthetic DOM suite rerun successfully; no real-device visual claim','readabilityCorrection':'SH-061-A: closures -> locks for أقفاله; Arabic unchanged; variant note preserved','stalePilotQueueRemoved':True,'singleFileReaderGenerated':True,'singleFileSha256':digest(page.encode())}
    write('qa/final-reading-audit.json',json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    note='''# Final reading-edition check — 4 November 2026

The **110-unit source-based commentary translation is complete** in the consulted sequence. This check does not add alleged source text or claim completion of manuscript collation.

## Verified in this pass

The reader's synthetic interaction tests were rerun. Every Arabic and English section is present in the cumulative bilingual export, and every English section in the English export. All 61 matn IDs have linked commentary. All 64 recorded main-commentary source hashes were reproduced from preserved electronic transcriptions. The original matn and the two main-commentary source files were not altered. Four additional ancestor quotations remain separately attributed.

A stale queue in the old two-excerpt module still described the main sections as awaiting translation. That obsolete queue has been removed; the main reader builds coverage from sections actually loaded. A missing-data fallback identifies a loading problem rather than suggesting that a translated passage is unfinished. The help text no longer describes reserved translation slots.

SH-061-A's literal “closures” has been changed to “locks” for **أقفاله**, preserving the key-and-lock image and reported alternatives. No Arabic word has been replaced. This is a local readability correction, not a claim to have resolved every philological difficulty.

## Scope

The introduction follows N, while the main and concluding commentary follow A. The mixed edition basis remains explicit. The reported ancestral loss at QT-059 remains noted and deferred; the surviving SH-059 commentary does not reconstruct it. Outstanding variants are documented, not hidden.

The audit checks retained electronic sources and the exported translation, not newly inspected manuscripts. It establishes no stemma; a real-device visual test is not claimed. The complete working translation remains open to specialist corrections without being an unfinished first translation.

## Reading files

[Complete reader](../commentary.html) · [Bilingual Markdown](../data/parallel-commentary.md) · [English Markdown](../data/commentary-english.md) · [Single-file edition](../downloads/Tamhid_Complete_Commentary_Reading_Edition.html) · [Audit](../qa/final-reading-audit.json).

The single-file edition embeds translation and controls; reference links remain online. Local notes require a browser permitting storage for local files. No font files are bundled.
'''
    write('editorial/FINAL_READING_EDITION_CHECK.md',note)
    print(json.dumps({k:v for k,v in report.items() if k not in ['sourceHashChecks','protectedTextsUnchanged']},ensure_ascii=False,indent=2))

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--root',type=pathlib.Path,default=pathlib.Path(__file__).resolve().parent.parent)
    main(p.parse_args().root.resolve())
