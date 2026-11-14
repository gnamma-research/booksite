#!/usr/bin/env python3
"""Stage97 finite-time *shadow* for fourth-figure moods VI/VII.
NOT an entailment of historical necessity or any particular modal result type.
"""
from itertools import product
from pathlib import Path
import json
STATES=((0,0,0,0),)+tuple((1,*x) for x in product((0,1),repeat=3))
PERSONS=(0,1)
def attrs(h,p,n):
    return [bool(h[2*p+t][{'S':1,'M':2,'P':3}[n]]) for t in (0,1)]
def incl(a,b): return all((not x) or y for x,y in zip(a,b))
def disjoint(a,b):return all(not(x and y) for x,y in zip(a,b))
def special(h,p,a,b):
    x,y=attrs(h,p,a),attrs(h,p,b)
    return any(x) and any(y) and disjoint(x,y)
def weak_special(h,p,a,b):
    x,y=attrs(h,p,a),attrs(h,p,b)
    return any(x) and disjoint(x,y)
def bridge(h,a,b,universal=True):
    checks=[incl(attrs(h,p,a),attrs(h,p,b)) for p in PERSONS]
    return all(checks) if universal else any(checks)
def target(h):
    return any(any(x and not y for x,y in zip(attrs(h,p,'S'),attrs(h,p,'P')))
               for p in PERSONS)
def show(h):
    return [dict(person=p,time=t,exists=bool(r[0]),S=bool(r[1]),
                 M=bool(r[2]),P=bool(r[3]))
            for p in PERSONS for t,r in enumerate(h[2*p:2*p+2])]
routes={'VI':(('M','S'),('P','M')),'VII':(('P','M'),('M','S'))}
report={'scope':'2-person 2-time temporal SHADOW; NOT historical modal necessity',
        'histories':6561,'modal_type_claims_proven':False,'moods':{}}
for mood,((a,b),(c,d)) in routes.items():
    full=weaker_neg=weaker_bridge=0
    nfail=bfail=0
    ne=be=None
    for h in product(STATES,repeat=4):
        neg=any(special(h,p,a,b) for p in PERSONS)
        pos=bridge(h,c,d)
        result=target(h)
        if neg and pos:
            full+=1
            assert result,(mood,'proper premises failed',show(h))
        if any(weak_special(h,p,a,b) for p in PERSONS) and pos:
            weaker_neg+=1
            if not result:
                nfail+=1
                if ne is None:ne=show(h)
        if neg and bridge(h,c,d,universal=False):
            weaker_bridge+=1
            if not result:
                bfail+=1
                if be is None:be=show(h)
    assert (full,nfail,bfail)==(376,456,200),(mood,full,nfail,bfail)
    report['moods'][mood]={'full_premise_histories':full,'full_countermodels':0,
      'drop_subject_nonpermanence':{'antecedents':weaker_neg,'countermodels':nfail,
                                   'counterexample':ne},
      'weaken_universal_affirmative_bridge':{'antecedents':weaker_bridge,
                                  'countermodels':bfail,'counterexample':be}}
Path(__file__).with_name('verified_fourth_figure_modes6_7_temporal_shadow.json').write_text(
 json.dumps(report,indent=2)+'\n',encoding='utf-8')
print('PASS Stage97 VI/VII temporal shadows: 6,561 histories; 376 full cases per mood; 0 failures')
