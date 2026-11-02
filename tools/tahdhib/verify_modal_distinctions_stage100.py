#!/usr/bin/env python3
"""Tahdhib Stage100: diagnostic two-world/two-time modal fragment.

NOT medieval necessity semantics, historical modal entailment certification,
or an independently collated manuscript reading.
Source controls: Kātibī Shamsiyya §§103-104; Street 2024
Appendix 2 pp.329-344, and mixed-modal Tables pp.303-307.
"""
import itertools
import json
from pathlib import Path

W = range(2)
T = range(2)
STATES = ((0,0,0,0),) + tuple((1,*b) for b in itertools.product((0,1),repeat=3))
IND = {'S':1,'M':2,'P':3}
SIX = ('L','A','LD1','AD1','LD2','AD2')
SPECIAL = ('LD2','AD2')
ACTUAL7 = SIX + ('X1','LT2','LX2','X2','X~L')
assert len(STATES) == 9

def title(h,w,t,p):
    return bool(h[2*w+t][IND[p]])

def existent(h,w,t):
    return bool(h[2*w+t][0])

def actual(h,p):
    return any(title(h,0,t,p) for t in T)

def restricted_negative(h,p,q,necessary=False):
    worlds = W if necessary else (0,)
    return all(not(title(h,w,t,p) and title(h,w,t,q))
               for w in worlds for t in T)

def lived_not(h,p):
    return any(existent(h,0,t) and not title(h,0,t,p) for t in T)

def affirmative(h,subject,predicate,mode):
    if not actual(h,subject):
        return False
    if mode in ('L','A'):  # Referential necessity or perpetuity
        worlds = W if mode=='L' else (0,)
        core = all(not existent(h,w,t) or title(h,w,t,predicate)
                   for w in worlds for t in T)
    elif mode in SIX:  # Descriptionally restricted necessity/perpetuity
        worlds = W if mode.startswith('L') else (0,)
        core = all(not title(h,w,t,subject) or title(h,w,t,predicate)
                   for w in worlds for t in T)
        if mode in SPECIAL:
            core &= lived_not(h,predicate)
    elif mode in ACTUAL7:
        # Only weak actual consequences, NOT full X1/LT2/LX2/X2/X~L.
        core = any(title(h,0,t,subject) and title(h,0,t,predicate) for t in T)
        if mode=='X2':
            core &= lived_not(h,predicate)
        if mode=='X~L':
            core &= any(not title(h,1,t,predicate) for t in T)
    else:
        raise ValueError(mode)
    return bool(core)

def special_negative(h,p,q,kind):
    assert kind in SPECIAL
    return actual(h,p) and restricted_negative(h,p,q,kind=='LD2') and actual(h,q)

def O_AD1(h,p,q):
    return actual(h,p) and restricted_negative(h,p,q)

def O_A(h,p,q):
    return actual(h,p) and all(not existent(h,0,t) or not title(h,0,t,q)
                               for t in T)

def O_AD2(h,p,q):
    return O_AD1(h,p,q) and actual(h,q)

def O_X2_shadow(h,p,q):
    return any(title(h,0,t,p) and not title(h,0,t,q) for t in T) and actual(h,q)

def show(h):
    return [dict(world=w,time=t,exists=existent(h,w,t),
                S=title(h,w,t,'S'),M=title(h,w,t,'M'),P=title(h,w,t,'P'))
            for w in W for t in T]

histories = list(itertools.product(STATES,repeat=4))
assert len(histories)==6561
out = {
  'scope':'Source-guided, finite 2-world/2-time ONE-PERSON fragment; not a historical necessity proof',
  'histories_per_case':6561,
  'source_types':'Street 2024 Appendix 2 and mixed modal tables; not Taftazani manuscript readings',
  'mood6':{}, 'mood7':{}, 'mood8':{}
}

def test(premise,conclusion,stronger=None):
    n=bad=strict=actualP=0
    first_bad=first_strict=None
    for h in histories:
        if not premise(h):
            continue
        n+=1
        actualP+=int(actual(h,'P'))
        if not conclusion(h):
            bad+=1
            if first_bad is None:
                first_bad=show(h)
        if stronger is not None and not stronger(h):
            strict+=1
            if first_strict is None:
                first_strict=show(h)
    return dict(premises=n,countermodels=bad,
                with_actual_P=actualP, stronger_refutations=strict,
                first_countermodel=first_bad, first_strictness_witness=first_strict)

for special,major in itertools.product(SPECIAL,SIX):
    # Figure IV VI: O(M,S) special minor, A(P,M) major.
    # An empty P-class makes the universal A major vacuous; preserve that scope.
    def premise(h,sp=special,typ=major):
        return special_negative(h,'M','S',sp) and (
            affirmative(h,'P','M',typ) if actual(h,'P') else True)
    target = O_A if major in ('L','A') else O_AD1
    out['mood6'][f'{special}|{major}']=test(
        premise,lambda h,target=target:target(h,'S','P'),
        (lambda h:O_A(h,'S','P')) if major not in ('L','A') else None)

for special,minor in itertools.product(SPECIAL,ACTUAL7):
    # Figure IV VII: special O(P,M) major and universal A(M,S) minor.
    out['mood7'][f'{special}|{minor}']=test(
        lambda h,sp=special,typ=minor:special_negative(h,'P','M',sp)
                                    and affirmative(h,'M','S',typ),
        lambda h:O_X2_shadow(h,'S','P'))

for special,major in itertools.product(SPECIAL,SIX):
    # Figure IV VIII: I(P,M) major and E(M,S) universal special minor.
    # In a one-person universe E applies to the same major witness.
    out['mood8'][f'{special}|{major}']=test(
        lambda h,sp=special,typ=major:special_negative(h,'M','S',sp)
                                   and affirmative(h,'P','M',typ),
        lambda h:O_AD2(h,'S','P'))

assert sum(map(len,(out['mood6'],out['mood7'],out['mood8'])))==46
assert all(not z['countermodels'] for n in ('mood6','mood7','mood8')
           for z in out[n].values())
vacuous=sorted(k for k,z in out['mood8'].items() if z['premises']==0)
assert vacuous==['AD2|A','AD2|L','LD2|A','LD2|L'],vacuous
assert all(z['premises']>0 for k,z in out['mood8'].items() if k not in vacuous)
assert all(z['stronger_refutations']>0 for k,z in out['mood6'].items()
           if k.split('|')[1] not in ('L','A'))
assert all(z['with_actual_P']==0 for k,z in out['mood6'].items()
           if k.split('|')[1] in ('L','A'))

# Two-person constructive check: VI referential A/L major is not
# globally vacuous even though its one-person P witness cannot exist.
d0 = ((1,0,1,0),(1,1,0,0)) # M at t0, S at t1, never P.
d1 = ((1,0,1,1),(1,0,1,1)) # P and M throughout, never S.
assert any(r[2] for r in d0) and any(r[1] for r in d0)
assert all(not (r[1] and r[2]) and not r[3] for r in d0)
assert all(r[2] and r[3] for r in d1)
out['mood6_two_person_nonvacuity']={
  'special_negative_witness_d0':d0,
  'nonempty_referential_major_witness_d1':d1,
  'note':'Distinct individuals make VI L/A non-vacuous globally.'
}
out['eighth_mood_vacuous_cases']=vacuous
out['vacuity_lemma']=(
  'For a particular P witness under referential L/A(P,M), M holds throughout '
  'the witness lifetime. The universal special E(M,S) requires that same '
  'M subject both never S while M and sometimes S in its life: contradiction '
  'under these explicitly adopted semantic conditions.'
)
out['limitations']=[
 'Eight non-vacuous IEO cases proved only for the specified finite temporal result.',
 'The four referential-major IEO pairs are unsatisfiable in this model, not disproved in the historic calculus.',
 'Mode VII only models a WEAK X2 result, not the exact XD2/X2 contrast.',
 'Actuality, mental/real subject domains, essential necessity and individual reference vary among medieval authors.',
 '0 counterexamples is not a meaningful proof if there are 0 premises.'
]
output=Path(__file__).with_name('verified_modal_distinctions_stage100.json')
output.write_text(json.dumps(out,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print('PASS: 46 historically typed mixes checked in a strictly bounded temporal fragment')
print('PASS: 4 eighth-mood nonvacuity gaps:',', '.join(vacuous))
print('PASS: two-person VI referential-major nonempty construction')
print('PASS: strict descriptional versus perpetual distinctions in 8 VI mixes')
