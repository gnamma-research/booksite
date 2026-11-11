#!/usr/bin/env python3
"""Reproducibly integrate Stage113 without replacing any historical source batch.
Run on the Stage112 source tree (or rerun against its saved checkpoint).
All generated products are derived from the manifest and the new full-Arabic source.
"""
import hashlib
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ED = ROOT / 'texts/al-taftazani/tahdhib-al-mantiq/edition'
TOOLS = ROOT / 'tools/tahdhib'
CHECKPOINT = ED / 'checkpoints/stage112'
STAGE = '113'
DATE = '2026-11-11'
PATCH_NAME = 'hawashi-concepts-stage113-source.json'
SECTIONS = [
    ('H-PREFACE', 'Preface', 'HWN-', 140),
    ('H-INTRO', 'Introduction to Logic', 'HWN-INTRO-', 82),
    ('H-DALALA', 'Signification', 'HWN-DALALA-', 91),
    ('H-MAFAHIM', 'Concepts and Universals', 'HWN-MAFAHIM-', 35),
]

def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(value, encoding='utf-8')

def dump(value):
    return json.dumps(value, ensure_ascii=False, indent=2) + '\n'

def js(name):
    raw = (ED / name).read_text(encoding='utf-8')
    return json.loads(raw[raw.index('window.GNAMMA_'):].split('=', 1)[1].strip().removesuffix(';'))

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def replace_once(text, old, new):
    if text.count(old) != 1:
        raise ValueError(f'Expected one exact source anchor: {old[:90]!r}; got {text.count(old)}')
    return text.replace(old, new, 1)

def checkpoint():
    CHECKPOINT.mkdir(parents=True, exist_ok=True)
    for name in ['HANDOFF_LATEST.md', 'progress-data.js', 'progress.html', 'hawashi-numbered-notes.html']:
        target = CHECKPOINT / name
        if not target.exists():
            shutil.copyfile(ED / name, target)
    archive = TOOLS / 'check_stage112_archive.py'
    if not archive.exists():
        shutil.copyfile(TOOLS / 'check_stage_handoff.py', archive)
    oldqa = TOOLS / 'handoff_reader_stage112_archive.mjs'
    if not oldqa.exists():
        shutil.copyfile(TOOLS / 'handoff_reader_qa.mjs', oldqa)
    data = (CHECKPOINT / 'progress-data.js').read_text(encoding='utf-8')
    data = json.loads(data[data.index('window.GNAMMA_'):].split('=', 1)[1].strip().removesuffix(';'))
    if data['stage'] != '112':
        raise ValueError('Checkpoint is not Stage112')
    return data

def load_corpus():
    html = (CHECKPOINT / 'hawashi-numbered-notes.html').read_text(encoding='utf-8')
    sources = re.findall(r'<script src="(hawashi-[^"?]+\.js)(?:\?[^\"]*)?">', html)
    if len(sources) != len(set(sources)):
        raise ValueError('Repeated source script')
    corpus = {}
    for filename in sources:
        data = js(filename)
        if 'overrides' in data:
            for record in data['overrides']:
                if record['id'] not in corpus:
                    raise ValueError('Unknown overridden ID ' + record['id'])
                corpus[record['id']] = dict(record)
            additions = data.get('appends', [])
        else:
            additions = data.get('entries', data.get('notes', data.get('records', [])))
        for record in additions:
            if record['id'] in corpus:
                raise ValueError('Duplicate ID ' + record['id'])
            corpus[record['id']] = dict(record)
    if len(corpus) != 324:
        raise ValueError('Stage112 baseline did not yield 324 records')
    amendment = json.loads((ED / PATCH_NAME).read_text(encoding='utf-8'))
    if amendment['stage'] != STAGE or amendment['verification']['newRecords'] != 24:
        raise ValueError('Wrong Stage113 source')
    def normalized(record):
        result = dict(record)
        result.update(sectionId='H-MAFAHIM', arabicSourceStatus='searchable_Qum_diplomatic_first_pass',
                      scanCertified=False, fullPrintedPageTranslated=False)
        result['sourceUrls'] = [f'https://ablibrary.net/book_content/b/12170/{p}?lang=ar' for p in result['pages']]
        result['revision'] = 'Stage113 full digital Arabic and consecutive English; no photo/manuscript certification'
        return result
    overrides = [normalized(n) for n in amendment['overrides']]
    additions = [normalized(n) for n in amendment['records']]
    for record in overrides:
        prior = corpus[record['id']]
        if prior['status'] != 'partial_translation' or prior.get('arabicFullText'):
            raise ValueError('Unexpected revision baseline ' + record['id'])
        corpus[record['id']] = record
    for record in additions:
        if record['id'] in corpus:
            raise ValueError('Duplicate Stage113 addition ' + record['id'])
        corpus[record['id']] = record
    for record in corpus.values():
        record.setdefault('sectionId', 'H-PREFACE')
        record.setdefault('localNoteNumber', record.get('noteNumber'))
    order = {s[0]: i for i, s in enumerate(SECTIONS)}
    records = sorted(corpus.values(), key=lambda n: (order[n['sectionId']], n['localNoteNumber']))
    for section, _, prefix, count in SECTIONS:
        group = [n for n in records if n['sectionId'] == section]
        if [n['id'] for n in group] != [prefix + f'{i:03}' for i in range(1, count+1)]:
            raise ValueError('Broken local numbering ' + section)
    return records, sources, overrides, additions

def stats(records):
    return {
        'indexedNotes': len(records),
        'completeEnglish': sum(n['status'] == 'complete_searchable_note' for n in records),
        'partialEnglish': sum(n['status'] == 'partial_translation' for n in records),
        'fullDigitalArabic': sum(bool(n.get('arabicFullText')) for n in records),
        'arabicLocatorsOnly': sum(not n.get('arabicFullText') for n in records),
        'unnumberedFollowing': sum(bool(n.get('unnumberedFollowing')) for n in records),
    }

def markdown(records, title):
    s = stats(records)
    out = [f'# {title}\n\nStage113 · {DATE} · GNAMMA WORKING UNCOLLATED edition.\n',
           'Full digital Arabic is not an independently photographed manuscript reading. English completion is a first-pass coverage flag, not certification of textual correctness. The whole H corpus extends to printed p400.\n',
           f"Indexed notes: {s['indexedNotes']}; first-pass English complete: {s['completeEnglish']}; partial: {s['partialEnglish']}; full digital Arabic: {s['fullDigitalArabic']}; locator-only: {s['arabicLocatorsOnly']}.\n",
           'No whole printed H page is certified complete. Original T matn, main Yazdi Y commentary, and these later H glosses are distinct texts.\n']
    previous = None
    labels = {s[0]: s[1] for s in SECTIONS}
    for n in records:
        if n['sectionId'] != previous:
            previous = n['sectionId']
            out += [f'\n# Section: {labels[previous]} — {previous}\n']
        status = 'FIRST-PASS English complete' if n['status'] == 'complete_searchable_note' else 'PARTIAL English'
        source_links = ' · '.join(f'[Qum {p}]({u})' for p, u in zip(n['pages'], n['sourceUrls']))
        out += [f"\n<a id=\"{n['id']}\"></a>\n## {n['id']} — local note {n['localNoteNumber']} — {status}\n",
                f"**Reported voice:** {n['speaker']}\n\n**Source:** {source_links}\n",
                '### Arabic — ' + ('full digital numbered unit; uncollated' if n.get('arabicFullText') else 'SHORT LOCATOR ONLY') + '\n',
                '<div lang="ar" dir="rtl">\n\n' + n.get('arabicFullText', n['arabicLemma']) + '\n\n</div>\n',
                '### Working English\n\n' + n['english'] + '\n',
                '### Editorial qualifications\n\n' + n['editorial'] + '\n']
        u = n.get('unnumberedFollowing')
        if u:
            out += ['### Separate UNNUMBERED passage — not a further numbered note\n',
                    f"**Voice:** {u['speaker']}\n",
                    '<div lang="ar" dir="rtl">\n\n' + u['ar'] + '\n\n</div>\n', u['en'] + '\n']
        out += ['---\n']
    out += ['\n## Recovery\nRead HANDOFF_LATEST.md and corpus-manifest.json. Next: HWN-MAFAHIM-036, printed Q225–226. Stage112 and earlier snapshots remain unchanged.\n']
    return '\n'.join(out)

def main():
    p = checkpoint()
    records, sources, overrides, additions = load_corpus()
    s = stats(records)
    expected = dict(indexedNotes=348, completeEnglish=291, partialEnglish=57, fullDigitalArabic=79,
                    arabicLocatorsOnly=269, unnumberedFollowing=11)
    if s != expected:
        raise ValueError((s, expected))
    concepts = [n for n in records if n['sectionId'] == 'H-MAFAHIM']
    patchjs = '/* Stage113: full source-aligned replacements/additions; original stages immutable. */\nwindow.GNAMMA_HAWASHI_STAGE113_PATCH=' + dump({'stage': STAGE, 'overrides': overrides, 'appends': additions}).rstrip() + ';\n'
    write(ED / 'hawashi-concepts-stage113-patch.js', patchjs)
    immutable = {name: sha(ED / name) for name in sources + [PATCH_NAME]}
    manifest = {
        'stage': STAGE, 'updated': DATE, 'baseStage': '112', 'baseSources': sources,
        'amendments': [PATCH_NAME], 'immutableSha256': immutable, 'totals': s,
        'sections': [{'id': sid, 'name': name, 'prefix': prefix, **stats([n for n in records if n['sectionId'] == sid])} for sid, name, prefix, _ in SECTIONS],
        'next': {'id': 'HWN-MAFAHIM-036', 'printedPages': [225, 226]},
        'fullHPrintedPagesCertified': 0, 'independentYManuscriptPositionsCertified': 0,
        'recordFile': 'hawashi-effective-stage113.json',
    }
    write(ED / 'corpus-manifest.json', dump(manifest))
    write(ED / manifest['recordFile'], dump({'stage': STAGE, 'records': records}))
    allpath = 'batches/hawashi-all-sections-cumulative-stage113.md'
    conceptpath = 'batches/hawashi-concepts-numbered-cumulative-maf001-035.md'
    write(ED / allpath, markdown(records, 'Tahdhib — complete current four-section H corpus'))
    write(ED / conceptpath, markdown(concepts, 'Tahdhib — Concepts and Universals, local notes 1–35'))
    p['stage'] = STAGE
    p['updated'] = DATE
    for metric in p['metrics']:
        if metric['id'] == 'mafahim-notes':
            metric.update(current=30, total=35, label='H-MAFAHIM Q216–225 · first-pass English notes', note='30/35 first-pass English complete; partial notes4,5,6,9,10. Note2 revised from full digital Arabic; notes12–35 fully transcribed and translated.')
        if metric['id'] == 'mafahim-arabic':
            metric.update(current=25, total=35, label='H-MAFAHIM Q216–225 · full digital Arabic note transcriptions', note='Full digital Arabic for note2 and notes12–35, 25 units; not photographed or independently manuscript-collated.')
    ledger = p['mafahimLedger']
    ledger.update(indexedNotes=35, lastProcessedQumPrintedPage=225,
                  completedEnglish=[n['localNoteNumber'] for n in concepts if n['status'] == 'complete_searchable_note'],
                  partiallyTranslated=[n['localNoteNumber'] for n in concepts if n['status'] == 'partial_translation'],
                  fullDigitizedArabicNotes=[n['localNoteNumber'] for n in concepts if n.get('arabicFullText')],
                  unnumberedFollowingRendered=[20], nextLocalNote=36, nextSourcePage=225)
    p['noteLedger']['nextSection'].update(notesIndexed=35, notesTranslated=30, notesPartial=5,
                                         notesArabicTranscribed=25, lastProcessedQumPage=225, nextLocalNote=36)
    p['overallLaterGlossNoteLedger'].update(s)
    p['currentRelease'].update(allSectionsCumulativeMarkdown=allpath, conceptsCumulativeMarkdown=conceptpath,
                               manifest='corpus-manifest.json')
    reportpath = 'stages/STAGE113_FULL_ARABIC_AND_RELEASE_RECOVERY.md'
    newfiles = [PATCH_NAME, 'hawashi-concepts-stage113-patch.js', manifest['recordFile'], 'corpus-manifest.json',
                allpath, conceptpath, reportpath, 'HANDOFF_LATEST.md', 'progress-data.js', 'progress.html', 'hawashi-numbered-notes.html']
    p['stages'].append({'id': STAGE, 'date': DATE, 'title': 'Full Arabic–English Concepts12–35; complete revised Concepts2; release recovery',
                        'sourcePages': '216;221–225', 'noteRange': 'H-MAFAHIM 12–35 plus revised2',
                        'fullNoteCount': 24, 'partialNoteCount': 0, 'revisedPartialCompleted': 1,
                        'arabicNoteCount': 25, 'certifiedPages': 0, 'report': reportpath, 'files': newfiles})
    write(ED / 'progress-data.js', '/* Stage113 derived from immutable historical source batches. */\nwindow.GNAMMA_TAHDHIB_PROGRESS=' + dump(p).rstrip() + ';\n')
    reader = (CHECKPOINT / 'hawashi-numbered-notes.html').read_text(encoding='utf-8')
    reader = reader.replace('Cumulative edition · Stage 112', 'Cumulative edition · Stage 113')
    notice = ('Four historical H sections with distinct local numbering. <strong>348 numbered records: 291 first-pass English complete, 57 partial.</strong> '
              'There are <strong>79 full digital Arabic notes</strong> (54 Preface and25 Concepts) and269 Arabic locators. '
              'Stage113 adds full Arabic and English for Concepts12–35 and completes a replacement for Concepts2. '
              'Eleven unnumbered passages are separately attributed. <strong>No whole H printed page or independent Y manuscript reading is certified.</strong>')
    reader, count = re.subn(r'<div class="notice">.*?</div>', '<div class="notice">' + notice + '</div>', reader, count=1, flags=re.S)
    if count != 1: raise ValueError('Reader notice missing')
    reader = reader.replace('H-MAFAHIM 5/11 English', 'H-MAFAHIM 30/35 English')
    reader = reader.replace('batches/hawashi-all-sections-cumulative-stage112.md', allpath)
    reader = reader.replace('batches/hawashi-concepts-numbered-cumulative-maf001-011.md', conceptpath)
    reader = reader.replace('Concepts notes 1–11', 'Concepts notes 1–35')
    anchor = '<script src="hawashi-concepts-notes-stage112a.js?v=20261109-112"></script>'
    reader = replace_once(reader, anchor, anchor + '\n<script src="hawashi-concepts-stage113-patch.js?v=20261111-113"></script>')
    merger = """const amendment113=window.GNAMMA_HAWASHI_STAGE113_PATCH;
if(!amendment113){document.getElementById('notes').textContent='Stage113 data unavailable';return;}
for(const n of amendment113.overrides){if(!byId.has(n.id))throw Error('Unknown revised note '+n.id);byId.set(n.id,n);}
for(const n of amendment113.appends){if(byId.has(n.id))throw Error('Duplicate new note '+n.id);byId.set(n.id,n);}
"""
    reader = replace_once(reader, 'const entries=[...byId.values()]', merger + 'const entries=[...byId.values()]')
    write(ED / 'hawashi-numbered-notes.html', reader)
    dashboard = (CHECKPOINT / 'progress.html').read_text(encoding='utf-8')
    dashboard = dashboard.replace('progress-data.js?v=20261109-112', 'progress-data.js?v=20261111-113')
    dashboard = dashboard.replace('hawashi-all-sections-cumulative-stage112.md', 'hawashi-all-sections-cumulative-stage113.md')
    dashboard = dashboard.replace('hawashi-concepts-numbered-cumulative-maf001-011.md', 'hawashi-concepts-numbered-cumulative-maf001-035.md')
    dashboard = dashboard.replace('324 indexed records', '348 indexed records').replace('Concepts / Universals · local 1–11', 'Concepts / Universals · local 1–35').replace('H-MAFAHIM Qum 216–221', 'H-MAFAHIM Qum 216–225')
    write(ED / 'progress.html', dashboard)
    partial_lines = []
    for sid, title, _, _ in SECTIONS:
        partials = [str(n['localNoteNumber']) for n in records if n['sectionId'] == sid and n['status'] == 'partial_translation']
        partial_lines.append(f'- **{title}:** ' + ', '.join(partials))
    table = '\n'.join('| '+row['name']+' | '+str(row['completeEnglish'])+'/'+str(row['indexedNotes'])+' | '+str(row['fullDigitalArabic'])+'/'+str(row['indexedNotes'])+' |' for row in manifest['sections'])
    words = sum(len(n['english'].split()) for n in overrides + additions)
    report = f'''# Stage113 — full Arabic/English units and release recovery

Date: {DATE}. Source: searchable Qum printed text, not independently photographed.

## Actual delta

24 NEW numbered Concepts notes12–35, plus a complete replacement for previously partial Concepts2. All25 records include the entire digitally readable Arabic numbered unit and a consecutive English translation. The resulting English fields total {words} whitespace-separated words (including the replacement, not an additive count over the old draft). One additional unnumbered text after20 is kept distinct. Earlier sources and snapshots remain unchanged.

## Exact totals

| Section | First-pass English complete | Full digital Arabic |
|---|---:|---:|
{table}

Total348 numbered records;291 first-pass English complete;57 partial;79 full digital Arabic;269 locator-only;11 unnumbered passages. ZERO/274 complete photo-collated H printed pages; ZERO/110 independently manuscript-certified Y positions;46 source-classified modal cases butZERO/46 certified full historical proofs.

## Source findings requiring care

Concepts13 (Q221–222) rejects simply ignoring empty terms and proposes extending predicability from real to hypothetical predication. Concepts14 preserves a different speaker's narrower restriction; do not flatten disagreement. Concepts17 compares two temporal treatments of sleeping/waking. Concepts19 explicitly makes the affirmative propositions general-absolute and the negatives perpetual. Concepts22 and27 preserve the objection from existential import: a negative with a complemented predicate need not imply the corresponding affirmative when the subject is nonexistent. Concepts25's digital wording is problematic and has NOT been silently rewritten. The unnumbered Q224 note's ‘whole constitutes its particulars’ and its example's predicative orientation remain flagged. These issues are translated, not declared resolved by a modern set-theoretic model.

## Technical release recovery

Stage111 PR269 merged as05f28ed5bb62071d3c072683216dabee6e2ee99f; Stage112 PR280 merged asdbba5a88c63c02b8c134db2ef51aa0dad1a52a83. The faulty ‘Note index’ counter was replaced by exact numbered sequences. The original test commands were preserved byte-for-byte in ci-contract-stage112.yml (Git blob1cbbb87bcfc971fb313304f4fe71a0ef753682ef) and executed on Ubuntu24.04, avoiding the incompatibility between the formerly floating Ubuntu26.04 runner and pinned Playwright1.56.1. No test was removed. A recovery archive includes cumulative texts, all source stages, source checksums, handoff and reader; no font files.

## Next exact source

HWN-MAFAHIM-036 starts Q225 and continues Q226. Read the continuation before marking it translated. Whole H continues to Q400. Finish57 partial notes,269 Arabic-locator gaps, actual printed-photo and independent Y witness collation before claiming definitive completion.
'''
    write(ED / reportpath, report)
    handoff = f'''# GNAMMA Tahdhib — LATEST FULL CUMULATIVE HANDOFF

**Stage113 · {DATE} · WORKING UNCOLLATED edition.**
Repository gnamma-research/booksite; root texts/al-taftazani/tahdhib-al-mantiq/edition/.

## Publication and recovery

Stage111 PR269 is merged (05f28ed5bb62071d3c072683216dabee6e2ee99f). Stage112 PR280 is merged (dbba5a88c63c02b8c134db2ef51aa0dad1a52a83). Stage113 is built on branch tahdhib-source-complete-stage113-20261111; check its PR/actual master before claiming deployment. No work is running asynchronously on the strength of this document.

Read, in order: this handoff; corpus-manifest.json; progress-data.js; {reportpath}; {allpath}; {conceptpath}. The previous Stage112 narrative is preserved in checkpoints/stage112/HANDOFF_LATEST.md, and every immutable source batch and cumulative snapshot remains available. The manifest names every source, the Stage113 replacement overlay, and SHA256 of all immutable source files. hawashi-effective-stage113.json is a derived complete record set, not an independent witness.

## Exact current text and counts

| Historical H section | Complete first-pass English | Full digital Arabic |
|---|---:|---:|
{table}

**348 numbered records;291 first-pass English complete;57 partial;79 full searchable Arabic notes;269 Arabic locators;11 separately attributed unnumbered passages.** The15 dashboard measures keep main T/Y translation, H note translation, full Arabic, manuscript certification and modal proofs separate. No whole H printed page is certified:0/274. No principal Y position is independently manuscript-certified:0/110.46 historical modal classes are identified, but0/46 full historical proof cases are certified.

## Source families and numbering

T=Taftazani original matn:19 logic editorial units and separate1,044 kalam clauses. Y=Yazdi principal commentary Q7–123:110 substantive printed positions/113 blocks translated in first pass, no independent manuscript certification. H=later mixed-author glosses, rubricQ125, blankQ126, proseQ127–400 (274 printed positions). Whole-volume metadata naming Yazdi is not per-note authorship.

H-PREFACE Q127–164 has local1–140 (HWN-001 onward); H-INTRO Q165–187 local1–82 (HWN-INTRO-); H-DALALA Q188–215 local1–91 (HWN-DALALA-); H-MAFAHIM beginsQ216 with a NEW local1 and is now indexed through35/Q225 (HWN-MAFAHIM-). Never invent Preface141, Introduction83 or Signification92 at those rubric resets. Inspect every later heading before assigning a new ID.

## Actual Stage113 work

Full readable digital Arabic and consecutive English for24 new Concepts12–35 plus revised Concepts2;25 full source units, not25 complete printed pages. Concepts2 replaces its earlier partial translation; its original Stage112 draft remains in source history. The source Arabic is NOT a facsimile or a verified manuscript. ArabicFullText means digital-source transcription only. New note25 and the unnumbered note after20 have explicitly flagged readings; these have not been silently corrected. Every scanCertified flag remains false.

Theoretical distinctions preserved: cognitive quality vs represented quiddity; real vs hypothetical predicability for empty concepts; rival restrictions by different glossators; temporal cases of equality; source-specific general-absolute vs perpetual propositions; existential-import objection to double-negation transformations. Translating the arguments does not certify them as universal modern logical theorems.

## Remaining partially translated records

{chr(10).join(partial_lines)}

In addition,269 numbered notes still have only short Arabic locators; full original Arabic must be entered and checked. H material afterQ225 throughQ400 remains to be processed. Unnumbered historical and modern quotations on each page must be inventoried, not silently assigned to the adjacent numbered speaker. Main Y collation must use genuine Y manuscripts, not automatically copies of Taftazani's T matn. Priority Y cruxesQ24,37,95–101,108,114,117,123; Stage103 has candidate witnesses only. Stage101 formal work proves restricted modern temporal implications, not the46 full classical modal cases.

## Reader, generation and tests

hawashi-numbered-notes.html displays all four sections and applies the Stage113 overlay by stable ID. progress.html renders the15 independent metrics. The original T/Y main reader still has exactly Matn and Matn+sharh modes. Full cumulative Markdown is generated from the source manifest, not assembled from chat summaries.

Run python tools/tahdhib/build_stage113.py to regenerate Stage113 from its immutable Stage112 checkpoint. It will fail rather than silently accept an unexpected baseline. Run python tools/tahdhib/check_stage_handoff.py: this first runs the complete preserved Stage112 source audit against its checkpoint, then validates the new manifest, source hashes, IDs, counts and full-Arabic fields. run_ci_contract.py runs the unchanged older source/logic/browser shell commands, whose content is Git-blob-verified. handoff_reader_qa.mjs checks the updated totals and all four sections in Chromium/WebKit. build_recovery_bundle.py exports text/code, current cumulative corpus and SHA256 manifest, excluding fonts/binaries.

## Exact next source and continuation contract

Next is **HWN-MAFAHIM-036**, beginning at https://ablibrary.net/book_content/b/12170/225?lang=ar and continuing onto printed226. Do NOT infer its conclusion from the opening sentence. Continue source-order and local numbering, preserving full Arabic alongside each new translation wherever available. Every stage must add immutable source records/report, preserve historical overrides, regenerate full cumulative text and state, update this entire handoff and15 metrics, and pass source plus Chromium/WebKit checks before merge. Record an actual PR/commit only after verification.

### New-chat starter

Continue GNAMMA Tahdhib Stage114 from actual latest master. First read this HANDOFF_LATEST.md, corpus-manifest.json, progress-data.js, Stage113 report and full Stage113 cumulative Markdown. Current348 numbered H records across four historical series;291 first-pass English complete,57 partial;79 full digital Arabic,269 locators,11 unnumbered. ZERO/274 whole H pages photo-collated;ZERO/110 Y manuscript certified;46 modal classes butZERO full proofs. Start HWN-MAFAHIM-036 atQ225→226. Preserve existing source snapshots and attribution; use full Arabic and consecutive English rather than extending summary-only coverage. Rebuild cumulative files, honest metrics, complete handoff and tests.
'''
    write(ED / 'HANDOFF_LATEST.md', handoff)
    qa = (TOOLS / 'handoff_reader_stage112_archive.mjs').read_text(encoding='utf-8')
    for old, new in [('Stage112','Stage113'), ('[5,11],[0,11]','[30,35],[25,35]'),
                     ("'5/11'", "'30/35'"), ("includes('0/11')", "includes('25/35')"),
                     ('===324','===348'),('===266','===291'),('===58','===57'),('===10','===11'),
                     ("['H-MAFAHIM',11,5,6]", "['H-MAFAHIM',35,30,5]"),
                     ('===11,\'Missing immutable Stages 102–112\'', '===12,\'Missing immutable Stages 102–113\''),
                     ('===11,\'Search clear lost Concepts source notes\'', '===35,\'Search clear lost Concepts source notes\''),
                     ('HWN-MAFAHIM-011','HWN-MAFAHIM-035'),
                     ('hawashi-all-sections-cumulative-stage112.md','hawashi-all-sections-cumulative-stage113.md')]:
        qa = qa.replace(old, new)
    write(TOOLS / 'handoff_reader_qa.mjs', qa)
    write(TOOLS / 'check_stage_handoff.py', NEW_AUDIT)
    print('Built Stage113:', dump(s))

NEW_AUDIT = '''#!/usr/bin/env python3
"""Preserve Stage112 audit and verify all Stage113 derived records against immutable sources."""
import hashlib
import importlib.util
import json
import tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
ED=ROOT/'texts/al-taftazani/tahdhib-al-mantiq/edition'

def main():
    spec=importlib.util.spec_from_file_location('stage112_archive', ROOT/'tools/tahdhib/check_stage112_archive.py')
    old=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(old)
    with tempfile.TemporaryDirectory() as folder:
        temp=Path(folder)
        for item in ED.iterdir():
            (temp/item.name).symlink_to(item, target_is_directory=item.is_dir())
        for name in ['HANDOFF_LATEST.md','progress-data.js','progress.html','hawashi-numbered-notes.html']:
            (temp/name).unlink()
            (temp/name).write_bytes((ED/'checkpoints/stage112'/name).read_bytes())
        old.ROOT=temp
        old.audit()
    manifest=json.loads((ED/'corpus-manifest.json').read_text())
    for name, digest in manifest['immutableSha256'].items():
        assert hashlib.sha256((ED/name).read_bytes()).hexdigest()==digest,name
    data=json.loads((ED/manifest['recordFile']).read_text())
    rows=data['records']
    assert data['stage']=='113' and len(rows)==348
    assert len({n['id'] for n in rows})==348
    expected=[('H-PREFACE','HWN-',140,136,54),('H-INTRO','HWN-INTRO-',82,66,0),('H-DALALA','HWN-DALALA-',91,59,0),('H-MAFAHIM','HWN-MAFAHIM-',35,30,25)]
    for sid,prefix,count,english,arabic in expected:
        group=[n for n in rows if n['sectionId']==sid]
        assert [n['id'] for n in group]==[prefix+f'{i:03}' for i in range(1,count+1)]
        assert sum(n['status']=='complete_searchable_note' for n in group)==english
        assert sum(bool(n.get('arabicFullText')) for n in group)==arabic
    for n in rows:
        assert n['scanCertified'] is False,n['id']
        assert all(n.get(k) for k in ['id','speaker','english','arabicLemma','editorial','sourceUrls']),n['id']
        assert len(n['pages'])==len(n['sourceUrls']),n['id']
    patch=json.loads((ED/'hawashi-concepts-stage113-source.json').read_text())
    assert [n['localNoteNumber'] for n in patch['records']]==list(range(12,36))
    assert [n['localNoteNumber'] for n in patch['overrides']]==[2]
    latest={n['id']:n for n in rows}
    for n in patch['records']+patch['overrides']:
        assert n['arabicFullText']==latest[n['id']]['arabicFullText']
        assert n['english']==latest[n['id']]['english']
    assert sum(n['status']=='complete_searchable_note' for n in rows)==291
    assert sum(n['status']=='partial_translation' for n in rows)==57
    assert sum(bool(n.get('arabicFullText')) for n in rows)==79
    assert sum(bool(n.get('unnumberedFollowing')) for n in rows)==11
    raw=(ED/'progress-data.js').read_text()
    progress=json.loads(raw[raw.index('window.GNAMMA_'):].split('=',1)[1].strip().removesuffix(';'))
    assert progress['stage']=='113' and len(progress['stages'])==12
    assert len(progress['metrics'])==15
    metrics={n['id']:(n['current'],n['total']) for n in progress['metrics']}
    assert metrics['mafahim-notes']==(30,35) and metrics['mafahim-arabic']==(25,35)
    assert metrics['yazdi-photo']==(0,110) and metrics['later-full']==(0,274) and metrics['historical-proofs']==(0,46)
    assert progress['mafahimLedger']['partiallyTranslated']==[4,5,6,9,10]
    assert progress['mafahimLedger']['fullDigitizedArabicNotes']==[2]+list(range(12,36))
    md=(ED/progress['currentRelease']['allSectionsCumulativeMarkdown']).read_text()
    for n in rows:
        assert ('## '+n['id']+' — local note ') in md,n['id']
        assert n['english'] in md,n['id']
        assert n.get('arabicFullText',n['arabicLemma']) in md,n['id']
    assert 'HWN-MAFAHIM-036' in (ED/'HANDOFF_LATEST.md').read_text()
    print('PASS Stage113: preserved every Stage112 source check;348 unique notes,291/57 English,79 full Arabic,11 unnumbered;0 fabricated photo certifications')

if __name__=='__main__':
    main()
'''

if __name__ == '__main__':
    main()
