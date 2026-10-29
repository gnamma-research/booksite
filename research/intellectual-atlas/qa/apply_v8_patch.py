"""One-time reproducible source migration for Atlas UX revision 7.1.

The compressed payload is an exact, line-indexed diff against revision 7,
not a runtime patch. The resulting atlas-app.js and site.css are ordinary
source files; this helper does not run on the website.

Run from repository root: python research/intellectual-atlas/qa/apply_v8_patch.py
"""
from pathlib import Path
import base64
import hashlib
import json
import re
import zlib

BASE=Path(__file__).resolve().parents[1]
payload=BASE/'qa/v8-code.patch.b64'
patch=json.loads(zlib.decompress(base64.b64decode(payload.read_text().strip())))
old_hashes={
    'atlas-app.js':'58dd6080de57aec27565e7e41eed68d4717e27afd3e4a2e24f4ed6f4c35fe1de',
    'site.css':'a1fa214df549de5ce8266e94ed475968b2ec37eaec04a7f6d6d9c134b1caff44'
}
new_hashes={
    'atlas-app.js':'586fff08f056a94e7e6e15addaac80be3f19a94e0f829c8853b123729db86842',
    'site.css':'3351214a131649e4f07ee45612e2f8e7498fa2596e4d3aec30311ede12c1abeb'
}
assert set(patch)==set(old_hashes)
for name,ops in patch.items():
    file=BASE/name
    original=file.read_bytes()
    assert hashlib.sha256(original).hexdigest()==old_hashes[name],name+' source has changed; reconcile instead of overwriting'
    lines=original.decode('utf-8').splitlines(keepends=True)
    for start,end,content in reversed(ops):
        assert 0<=start<=end<=len(lines)
        lines[start:end]=[content]
    output=''.join(lines).encode('utf-8')
    assert hashlib.sha256(output).hexdigest()==new_hashes[name],name+' patch hash did not match independently tested local source'
    file.write_bytes(output)

canonical=BASE/'downloads/intellectual-atlas-data.json'
data=json.loads(canonical.read_text(encoding='utf-8'))
assert data['revision']=='neoplatonic-bridge-7-2026-10-29'
for node in data['nodes']:
    if node['id']=='iji_mawaqif':
        t=node['temporal']
        assert (t['start'],t['end'])==(1330,1352)
        t.update({'kind':'multiple_stages','anchor':1352,
            'stages':[{'start':1330,'end':1333,'label':'early recension, c. 730–733 AH'},
                      {'start':1349,'end':1352,'label':'revised recension and authorial copy, 750–753 AH'}],
            'note':'Two documented recensional phases. A centre point at 1341 would invent a composition date. The label now follows the attested 1352 authorial copy; separate small markers indicate the earlier phase and revision, NOT 22 continuous years of writing.'})
        node['date_note']=node['date_note'].rstrip('.')+'. The chronological map displays two separate stages instead of a single continuous bar or misleading midpoint; source F26 is the 2025 research chronology.'
    elif node['id']=='plotinus_enneads':
        t=node['temporal']
        assert (t['start'],t['end'])==(254,301)
        t.update({'kind':'multiple_stages','anchor':301,
            'stages':[{'start':254,'end':269,'label':'Plotinus treatises, c. 254–269'},
                      {'start':301,'end':301,'label':'Porphyry’s editorial arrangement c. 301'}],
            'note':'Authorial treatises and the later six-Ennead editorial arrangement are distinct events. There is no claim of continuous composition 254–301.'})
        node['date_note']=node['date_note'].rstrip('.')+'. The 301 CE mark represents Porphyry’s edition, not Plotinus composing through 301.'

assert len(data['nodes'])==375 and len(data['edges'])==348
data.setdefault('notes',[]).append({
    'title':'Revision 7.1: evidence dates versus typography',
    'text':'A book label has no duration meaning. The separate small symbol marks a dated year, publication witness, upper/lower bound, uncertain window or separately evidenced revision phases. Al-Ījī’s Mawāqif and Plotinus’ Enneads previously had artificial midpoints between writing and editing stages. The revised chronology plots the separate recorded stages. Other source qualifications remain unaltered.',
    'sources':['F26','F35','G07','G06']
})
canonical.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

readme=BASE/'README.md'
s=readme.read_text(encoding='utf-8')
s+="""

## Interface revision 7.1 — continuous time travel and date evidence

The universal overview no longer jumps to a discrete centre on pointer
release. Drag its six-dot handle to translate the selected time window in
continuous increments; tap outside it for a deliberate seek. Drag/swipe the
main diagram with the same live date scale, rather than a temporary SVG
translation committed only when the finger lifts. Horizontal trackpad
scrolling is frame-scheduled; vertical scroll retains its native behavior.
The active window, chart axis and year captions remain synchronized.

Work labels are now visually separate, compact typographic callouts.
**Only the 9px square/diamond, bounded triangle, dotted possible date window,
or individually marked redaction stages express time.** The callout width is
never a duration of composition, circulation or publication. Each record's
source-qualified date meaning is also written in the detail drawer, for
keyboard and screen-reader access.

The staged al-Mawāqif revisions (c.1330–33 and 1349–52) and Plotinus'
treatises/editorial collection are plotted separately; the previously used
midpoints were not historical composition dates. The Ṭūsī Tajrīd remains a
*terminus ante quem* by the probable 669/1270–71 authorial witness; al-
Taftāzānī's Maqāṣid/Sharḥ has the detailed January 1383 completion evidence.
No exact day or composition year is invented for other uncertain works.

Regression: tests/verify_continuous_scrub_browser.py tests live motion before
release, bidirectional scroll intent, actual Chromium mobile touch gestures,
WebKit/Chromium layouts, the date glyph geometry and the separate-stage
provenance.
"""
readme.write_text(s,encoding='utf-8')

html=BASE/'index.html'
page=html.read_text(encoding='utf-8')
assert 'Revision 7 · 29 October 2026' in page
page=page.replace('Revision 7 · 29 October 2026','Revision 7.1 · 29 October 2026',1)
assert 'content="neoplatonic-bridge-7-2026-10-29"' in page
page=page.replace('content="neoplatonic-bridge-7-2026-10-29"','content="continuous-scrub-7.1-2026-10-29"',1)
html.write_text(page,encoding='utf-8')

builder=BASE/'build.py'
b=builder.read_text(encoding='utf-8')
assert "'status': 'working research'," in b
b=b.replace("'status': 'working research',","'status': 'working research',\n    'ui_revision': 'continuous-scrub-7.1-2026-10-29',\n    'date_marker_note': 'Marker is a dated event, bound, uncertainty window or distinct editing stage; label width is non-temporal.',",1)
builder.write_text(b,encoding='utf-8')
print('Applied source-level Atlas UI patch and independently qualified two multi-stage dates. Run build.py to resynchronize embedded JSON.')
