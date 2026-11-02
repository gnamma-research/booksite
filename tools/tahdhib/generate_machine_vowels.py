#!/usr/bin/env python3
"""Produce a separately labelled *unreviewed machine-vowelled* Arabic Tahdhīb.

This is NOT the authorial text, a manuscript variant, or a human-checked
tashkīl edition. Never modify data.js, unit IDs, English or source pagination.

Dependency: text2tashkeel (bundled ONNX; publicly released Apache-2.0 Python
package); record its installed version in the generated manifest.

A predicted mark is added ONLY on an unchanged original Arabic letter.
Even if a model proposes altered hamza/base letters or punctuation, this
publisher preserves the EXACT source base sequence. Original source harakāt
have priority.
"""
import argparse
import difflib
import hashlib
import importlib.metadata
import json
from pathlib import Path
import re
import unicodedata

MARKS=set(chr(x) for x in range(0x064B,0x0660))
MARKS.update(chr(x) for x in range(0x06D6,0x06EE))
MARKS.add('\u0670')

def strip(s):
    return ''.join(c for c in unicodedata.normalize('NFC',s) if c not in MARKS)

def clusters(s):
    blocks=[]
    for c in unicodedata.normalize('NFC',s):
        if c in MARKS:
            if blocks:blocks[-1][1]+=c
            continue
        blocks.append([c,''])
    return blocks

def transfer_marks(original,predicted):
    source=clusters(original)
    model=clusters(predicted)
    old=''.join(v[0] for v in source)
    new=''.join(v[0] for v in model)
    # Transfer marks from identical original base characters only.
    match=difflib.SequenceMatcher(None,old,new,autojunk=False)
    mapped={}
    for tag,a,b,c,d in match.get_opcodes():
        if tag!='equal':continue
        for index in range(b-a):
            mapped[a+index]=model[c+index][1]
    out=[]
    for pos,(letter,source_marks) in enumerate(source):
        # Never add predicted marks to punctuation/Latin symbols; preserve
        # pre-existing explicit marks even where the model disagrees.
        extra=mapped.get(pos,'') if '\u0621'<=letter<='\u064a' else ''
        marks=source_marks if source_marks else extra
        out.append(letter+marks)
    result=unicodedata.normalize('NFC',''.join(out))
    assert strip(result)==strip(original),'Generator altered the source letters'
    return result

def chunks(text,limit=180):
    # Maintain exact original whitespace and punctuation across chunks.
    pieces=re.findall(r'\S+\s*|\s+',text)
    current=''
    for piece in pieces:
        if current and len(current)+len(piece)>limit:
            yield current
            current=''
        if len(piece)>limit:
            if current:yield current
            yield piece
        else:
            current+=piece
    if current:yield current

def produce(source_file,model):
    source_bytes=source_file.read_bytes()
    raw=source_bytes.decode('utf-8').strip()
    marker='window.GNAMMA_CRITICAL_CORPUS='
    if not raw.startswith(marker):raise RuntimeError(f'Unexpected corpus header {source_file}')
    corpus=json.loads(raw[len(marker):].rstrip(';\n '))
    expected=1044 if 'kalam' in str(source_file) else 19
    assert len(corpus['units'])==expected
    mapping={}
    changed=with_any=skipped=0
    for num,u in enumerate(corpus['units'],1):
        ar=u['ar']
        # Original source contains historic brackets and occasional ellipses.
        # The model's punctuation is *never* adopted as source.
        segments=[]
        for part in chunks(strip(ar)):
            try:
                prediction=model.diacritize(part)
            except Exception as error:
                # Fail closed at the affected clause; do not silently accept
                # corrupt output or invent a model-supplied paragraph.
                raise RuntimeError(f'{source_file.name} unit {u["id"]}: model inference failure') from error
            segments.append(transfer_marks(part,prediction))
        candidate=transfer_marks(ar,''.join(segments))
        assert strip(candidate)==strip(ar),(source_file,u['id'])
        if candidate!=ar:changed+=1
        if any(c in MARKS for c in candidate):with_any+=1
        if candidate==ar:skipped+=1
        mapping[u['id']]=candidate
        if num%100==0:print(source_file.parent.parent.name,num,'/',expected,flush=True)
    result={
      'schema':'gnamma-tahdhib-unverified-machine-vowels-v1',
      'status':'AUTOMATIC UNREVIEWED DIACRITICS. NOT A SCHOLARLY OR MANUSCRIPT-CERTIFIED READING.',
      'work':corpus['work'],
      'source_sha256':hashlib.sha256(source_bytes).hexdigest(),
      'model':'text2tashkeel/rawi-ensemble',
      'generator':'tools/tahdhib/generate_machine_vowels.py',
      'python_package_version':importlib.metadata.version('text2tashkeel'),
      'unit_count':expected,
      'changed_units':changed,
      'units_with_any_diacritic':with_any,
      'unchanged_units':skipped,
      'units':mapping
    }
    prefix='window.GNAMMA_TAHDHIB_MACHINE_VOWELS='
    output=source_file.parent/'machine-vowels.js'
    output.write_text(prefix+json.dumps(result,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
    assert output.stat().st_size>expected*12
    for u in corpus['units']:
        assert strip(result['units'][u['id']])==strip(u['ar'])
    manifest=source_file.parent/'machine-vowels-manifest.json'
    manifest.write_text(json.dumps({k:v for k,v in result.items() if k!='units'},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('Generated',output,changed,'/',expected,'units changed',flush=True)

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--root',default='texts/al-taftazani')
    args=p.parse_args()
    from text2tashkeel import Diacritizer
    model=Diacritizer('rawi-ensemble')
    for slug in ('tahdhib-al-kalam','tahdhib-al-mantiq'):
        produce(Path(args.root)/slug/'edition'/'data.js',model)

if __name__=='__main__':main()
