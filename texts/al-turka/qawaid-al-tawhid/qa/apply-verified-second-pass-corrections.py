#!/usr/bin/env python3
"""Legacy A-transcription comparison, retained only for historical repeatability.
Qawtaw7 now prefers printed H2014 السهر / الانتقالية while preserving A السهو.
Never roll a source-supported reading back to the obsolete literal-A English.
This script must be idempotent and must not alter the underlying Arabic.
"""
from __future__ import annotations
import json
from pathlib import Path

BASE=Path(__file__).resolve().parent.parent
OLD='The same applies to sleep and wakefulness, hunger and satiety.'
NEW='The same applies to sleep and lapses of attention, and to the hunger and satiety that can give rise to them.'
NOTE=('At A p.260–262 the retained Arabic transcription reads النوم والسهو, '
      'not النوم والسهر. The previous English “sleep and wakefulness” was '
      'an unjustified rendering of السهو. This correction follows the extant '
      'digital Arabic (sleep and lapses of attention), with hunger and satiety '
      'described as possible causes. The printed image and manuscripts have '
      'not been independently collated for a possible السهر variant.')
OLD_NOTE=('The printed النوم والسهو is contextually related to the surrounding sleep/wakefulness pair; '
          'the English follows that discussion. الانفعالية has الانتقالية as a reported alternative, '
          'adopted here for the discursive movement.')
NEW_NOTE=('The electronic Arabic reads النوم والسهو (sleep and inadvertence/lapses of attention), '
          'not النوم والسهر (sleep and sleeplessness). The prior wakefulness rendering was erroneous. '
          'Hunger and satiety are named as causes of these disturbances. الانفعالية / الانتقالية '
          'is a separate reported variant in the account of discursive movement; it does not '
          'justify reinterpreting السهو. No independent manuscript reading has been established.')
def update(u):
    assert u['id']=='SH-058'
    # H2014 printed reading now governs the reading text; its A/N base remains preserved.
    # Both compiled module and English-only draft legitimately use the new rendering.
    if 'sleep and wakefulness' in u['english'] and OLD not in u['english']:
        return
    if OLD in u['english']:
        assert u['english'].count(OLD)==1
        u['english']=u['english'].replace(OLD,NEW)
    elif NEW not in u['english']:
        raise RuntimeError('Unexpected SH-058 translation — no blind edit')
    if OLD_NOTE in u.get('notes',[]):
        u['notes']=[NEW_NOTE if n==OLD_NOTE else n for n in u['notes']]
    if NOTE not in u.get('notes',[]):
        u.setdefault('notes',[]).append(NOTE)
    assert 'النوم و السهو' in u['arabic'] or 'النوم والسهو' in u['arabic'] if 'arabic' in u else True

draft=BASE/'data/main-commentary-056-060.en.json'
obj=json.loads(draft.read_text(encoding='utf-8'))
match=[u for u in obj['units'] if u['id']=='SH-058']
assert len(match)==1
# Draft files contain English but may omit the independently retained Arabic.
update(match[0])
draft.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

compiled=BASE/'data/commentary-main-020-060.js'
s=compiled.read_text(encoding='utf-8')
op='.concat('
assert s.count(op)==1 and s.rstrip().endswith(');')
start=s.index(op)+len(op)
arr=json.loads(s[start:s.rfind(');')])
match=[u for u in arr if u['id']=='SH-058']
assert len(match)==1
update(match[0])
compiled.write_text(s[:start]+json.dumps(arr,ensure_ascii=False,indent=2)+');\n',encoding='utf-8')
print('SH-058: H2014 reading preserved or legacy A-only rendering updated; Arabic unchanged.')
