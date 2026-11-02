#!/usr/bin/env python3
"""Tahdhīb Stage96: fourth-figure I-E-O, *temporal shadow only*.

Independent historical controls: al-Kātibī, Shamsiyyah §§97, 103-104;
Street (2024) pp. 238, 252-254, Appendix 2 pp. 333-335;
Özpilavcı--Öztop (2019), Sharh al-Mawadi' al-Mushkila p.89.

This proves a bounded finite-time implication, not historic metaphysical
necessity, manuscript agreement, or the historical full modal syllogistic.
Order for figure IV: affirmative PARTICULAR major I(P,M), universal NEGATIVE
special minor E(M,S), target particular NEGATIVE special O(S,P).
"""
import itertools
import json
from pathlib import Path

# State E,S,M,P: absence or existence plus 3 freely varying attributes.
STATES = ((0,0,0,0),) + tuple((1,*bits) for bits in itertools.product((0,1),repeat=3))
PEOPLE = range(2)
TIMES = range(2)
COUNTS = {'full':0,'weak_major':0,'no_nonpermanence':0,'merely_particular_minor':0}
FAILURES = {k:[] for k in COUNTS if k!='full'}
assert len(STATES)==9

def life(history,person):
    return history[2*person:2*person+2]

def titles(history,person):
    rows=life(history,person)
    return {name:tuple(bool(v[i]) for v in rows) for name,i in [('E',0),('S',1),('M',2),('P',3)]}

def some(u): return any(u)

def excludes(u,v): return all(not(a and b) for a,b in zip(u,v))

def entails(u,v): return all((not a) or b for a,b in zip(u,v))

def negative_special(d,subject,predicate):
    """One subject x; subject has an actual occasion, is never predicate
    while bearing the subject title, but bears predicate some other lived time.
    The non-permanence witness has exactly the SAME x (Stage94)."""
    return some(d[subject]) and excludes(d[subject],d[predicate]) and some(d[predicate])

def universal_special_negative(history):
    """Each individual ever M obeys the negative special E(M,S) compound."""
    return all(not some(d['M']) or negative_special(d,'M','S')
               for d in (titles(history,p) for p in PEOPLE))

def weak_universal_negative(history):
    return all(excludes(d['M'],d['S']) for d in
               (titles(history,p) for p in PEOPLE))

def particular_descriptional_affirmative(history):
    """One P witness, on all occasions while P, bears M.
    The strength here is only a temporal consequence of one of the six
    designated modal classes (not an interpretation of modal necessity)."""
    return any(some(d['P']) and entails(d['P'],d['M']) for d in
               (titles(history,p) for p in PEOPLE))

def bare_particular_affirmative(history):
    return any(any(a and b for a,b in zip(d['P'],d['M'])) for d in
               (titles(history,p) for p in PEOPLE))

def conclusion(history):
    return any(negative_special(titles(history,p),'S','P') for p in PEOPLE)

def intermediate(history):
    return any(negative_special(titles(history,p),'P','S') for p in PEOPLE)

def display(history):
    return [dict(person=p,time=t,exists=bool(row[0]),S=bool(row[1]),
                 M=bool(row[2]),P=bool(row[3]))
            for p in PEOPLE for t,row in enumerate(life(history,p))]

def check():
    total=0
    for h in itertools.product(STATES,repeat=4):
        total+=1
        negative=universal_special_negative(h)
        major=particular_descriptional_affirmative(h)
        target=conclusion(h)
        if negative and major:
            COUNTS['full']+=1
            assert intermediate(h), ('intermediate failure',display(h))
            assert target, ('valid stage96 temporal implication failed',display(h))
        tests={
            'weak_major':negative and bare_particular_affirmative(h),
            'no_nonpermanence':weak_universal_negative(h) and major,
            'merely_particular_minor':major and any(
                negative_special(titles(h,p),'M','S') for p in PEOPLE)
        }
        for name,holds in tests.items():
            if holds:
                COUNTS[name]+=1
                if not target:
                    FAILURES[name].append(h)
    assert total==9**4==6561
    assert COUNTS['full']>0
    assert all(FAILURES.values())
    report={
        'scope':'Bounded 2-person / 2-time model of I-E-O; temporal SHADOW, not historical modal necessity',
        'people':2,'times':2,'states_per_person_time':9,'histories':total,
        'figure4_mode8':{'major':'I(P,M), one P witness with P=>M throughout its P-period',
          'minor':'E_special(M,S), every M witness is never S while M and is S at another lived time',
          'intermediate':'O_special(P,S) for the very witness of major',
          'conclusion':'O_special(S,P), by same-witness special conversion',
          'premise_models':COUNTS['full'],'countermodels':0},
        'ablations':{
          name:{'premise_models':COUNTS[name],'countermodels':len(bad),
                'first_counterexample':display(bad[0])} for name,bad in FAILURES.items()},
        'interpretation':[
          'Original mode8 negative minor is universal E, not the particular Nsp assumed in Stage93 exploratory probe.',
          'The I major has a particular individual who is M throughout that individual’s P-description.',
          'A universal E_special minor carries a same-individual nonpermanence S-occasion to that P witness.',
          'The result is a special customary O in this temporal shadow, not automatically a proof of LD2 necessity.'
        ],
        'limits':['Only two times/two individuals; no metaphysical necessity or possible worlds',
                  'Assumes the customary temporal consequences of the six convertible-negative classes',
                  'An existence countermodel does not settle the traditional full modal logic',
                  'No independent Tahdhib manuscript was collated']
    }
    output=Path(__file__).with_name('verified_fourth_figure_mode8_temporal_shadow.json')
    output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('PASS',total,'histories;',COUNTS['full'],'full premise profiles, no failed intermediate or conclusion')
    for name,fail in FAILURES.items():
        print('EXPECTED',name,'counterexamples',len(fail),'of',COUNTS[name],'premise profiles')
    return report

if __name__=='__main__': check()
