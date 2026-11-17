#!/usr/bin/env python3
"""Publish H2014 preferred reading without concealing A/N or mixing apparatus into reading."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parent.parent

def swap(name,pairs):
    p=ROOT/name
    s=p.read_text(encoding='utf-8')
    for old,new in pairs:
        if old in s:s=s.replace(old,new)
        elif new in s:pass
        else:raise AssertionError((name,'missing source',old[:90]))
    p.write_text(s,encoding='utf-8')

swap('commentary-reader.js',[
 ('+esc(u.arabic)+','+esc(u.readingArabic||u.arabic)+'),
 ("'### Arabic',u.arabic,'','### English'","'### Arabic (preferred printed reading)',u.readingArabic||u.arabic,'','### English'"),
 ("[u.id,u.section,u.arabic,u.english","[u.id,u.section,u.readingArabic||u.arabic,u.arabic,u.english"),
])
swap('reader.js',[
 ("textPair(u.arabic,u.english)","textPair(u.readingArabic||u.arabic,u.english)"),
 ("u.id,u.title,u.arabic,u.english","u.id,u.title,u.readingArabic||u.arabic,u.arabic,u.english"),
])
swap('layered-reader.js',[
 ("pair(u.arabic,u.english)","pair(u.readingArabic||u.arabic,u.english)"),
 ("u.id,u.title,u.arabic,u.english","u.id,u.title,u.readingArabic||u.arabic,u.arabic,u.english"),
])
swap('qa/export-commentary.mjs',[
 ("'### Commentary — Arabic','',u.arabic","'### Commentary — Arabic (preferred H2014 when supported)','',u.readingArabic||u.arabic"),
])
swap('qa/finalize-reading-edition.py',[
 ("for field,export in [('arabic','data/parallel-commentary.md'),('english','data/parallel-commentary.md'),('english','data/commentary-english.md')]:\n            if u[field] not in exports[export]",
  "for field,export in [('arabic','data/parallel-commentary.md'),('english','data/parallel-commentary.md'),('english','data/commentary-english.md')]:\n            if (u.get('readingArabic',u['arabic']) if field=='arabic' else u[field]) not in exports[export]"),
 ("['keys to his closures and states','keys to his locks and states']",
  "['keys to his closures and states','keys to his locks and states','keys to his actions and states']"),
 ("u['notes'][1]='Printed alternatives: أقفاله وأحواله / إقباله وأحواله / أفعاله وأحواله. “Locks and states” preserves the displayed metaphor of keys and locks; it does not decide between the reported alternatives. No independent manuscript has been collated.'",
  "u['notes'][1]='H2014 II:598 prints أفعاله وأحواله (actions and states), adopted provisionally for reading; A reads أقفاله وأحواله (locks and states), and إقباله is also reported. All remain recorded as printed alternatives. No original manuscript has been independently collated.'"),
])
swap('pdf/build_editions.py',[
 ("assert 'sleep and lapses of attention' in SH058[0]['english'], 'SH-058 correction not propagated into PDF corpus'",
  "assert 'sleep and wakefulness' in SH058[0]['english'], 'Qawtaw7 H2014 reading not propagated into PDF corpus'"),
 ("assert 'The same applies to sleep and wakefulness' not in SH058[0]['english'], 'Stale SH-058 translation in PDF corpus'",
  "assert 'sleep and lapses of attention' not in SH058[0]['english'], 'Superseded SH-058 A reading remains in preferred English'"),
 ("pair(u['arabic'],u['english'],lang)","pair(u.get('readingArabic',u['arabic']),u['english'],lang)"),
])
p='data/commentary-corpus.js'
s=(ROOT/p).read_text(encoding='utf-8')
s=s.replace("updated:'2026-11-11'","updated:'2026-11-11-Qawtaw7'")
(ROOT/p).write_text(s,encoding='utf-8')
# Preserve the Q5 comparison as an audit of the original electronic witness,
# but explain the H2014-based English change in the SH-061-E mapping.
p=ROOT/'qa/clause-review-adjudications-2026-11-09.json'
dec=json.loads(p.read_text(encoding='utf-8'))
group=next(x for x in dec['units'] if x['id']=='SH-061-E')['groups'][-1]
group['note']="H2014 II:596 omits A's part-to-part wording here. The present English follows H as a working reading; A remains preserved. No independent original manuscript collation."
p.write_text(json.dumps(dec,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for name in ['index.html','commentary.html']:
    p=ROOT/name
    s=p.read_text(encoding='utf-8')
    if 'id="qawtaw7-release"' not in s:
        banner='<p id="qawtaw7-release" class="help-copy" style="max-width:76rem;margin:1rem auto;padding:0 1rem">Qawtaw 7: source-supported printed readings have been incorporated into this reading edition. Original A/N Arabic and all unresolved variants remain available in the <a href="qa/qawtaw7-witness-register.json">witness register</a> and <a href="editorial/QAWTAW7_CUMULATIVE_HANDOFF_2026-11-11.md">scholarly status</a>. No manuscript-critical claim.</p>'
        s=s.replace('<main>',banner+'\n<main>',1)
    p.write_text(s,encoding='utf-8')
p=ROOT/'data/units.js'
s=p.read_text(encoding='utf-8')
matn=json.loads(s[s.index('{'):s.rindex('}')+1])['units']
lines=['# Qawāʿid al-Tawḥīd — source-supported working reading','',
       '**Abū Ḥāmid Turka, 61 surviving lemmata.** H2014 printed corrections where attested; original A/N wording remains accessible in parallel-matn.md and units.js. QT-059 has a reported unrecovered omission. No original manuscript has been collated.','']
for u in matn:
    lines.extend(['## '+u['id']+' · '+u['title'],'','**Arabic — printed-supported working reading**','',
                  u.get('readingArabic',u['arabic']),'','**English**','',u['english'],''])
    if u.get('witnessComparisons'):
        lines.extend(['<details><summary>Print and variant apparatus</summary>',''])
        for w in u['witnessComparisons']:
            lines.append('- '+w['status']+' · '+', '.join(w['sourceLocations'])+': '+w['preferredReading']+' — '+w['interpretation'])
        lines.extend(['','</details>',''])
(ROOT/'data/parallel-matn-reading.md').write_text('\n'.join(lines),encoding='utf-8')
print('Qawtaw7 readers and exporters now prefer H2014 only where supported, keeping the full earlier A/N witness.')
