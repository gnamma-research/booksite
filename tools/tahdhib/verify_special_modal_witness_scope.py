#!/usr/bin/env python3
"""Two-person/two-time quantifier binding in special-modal conversion.

NOT medieval necessity semantics. Each person's temporal title/nonpermanence
clauses must be checked with the SAME individual, not split existentially.
Sources: al-Yazdi Hashiya pp.83-84; al-Katibi Shamsiyyah §84; Tahdhib L13.
"""
import itertools
import json
from pathlib import Path

STATES=((0,0,0),(1,0,0),(1,0,1),(1,1,0),(1,1,1))
PEOPLE=(0,1)
MODELS=list(itertools.product(STATES,repeat=4))
assert len(MODELS)==625

def life(model,who): return model[2*who:2*who+2]
def flags(model,who):
    e,s,p=zip(*life(model,who))
    nonp=tuple(bool(ex and not pr) for ex,pr in zip(e,p))
    return dict(
      S=any(s),P=any(p),nonP=any(nonp),
      separated=all(not (a and b) for a,b in zip(s,p)),
      S_implies_P=all((not a) or b for a,b in zip(s,p)),
      nonP_implies_nonS=all((not a) or (not b)
                           for a,b in zip(nonp,s)),
    )
def as_json(model):
    return [dict(person=who,t=t,exists=bool(e),S=bool(s),P=bool(p))
            for who in PEOPLE for t,(e,s,p) in enumerate(life(model,who))]

counts={k:0 for k in ('negative_strong','negative_weak','positive_strong','positive_weak')}
negative_fail=[];positive_fail=[]
for h in MODELS:
    cs=[flags(h,k) for k in PEOPLE]
    # The correct particular compound preserves one bound witness.
    nstrong=any(c['S'] and c['separated'] and c['P'] for c in cs)
    nresult=any(c['P'] and c['separated'] and c['S'] for c in cs)
    pstrong=any(c['S'] and c['S_implies_P'] and c['nonP'] for c in cs)
    presult=any(c['nonP'] and c['nonP_implies_nonS'] and c['S'] for c in cs)
    # WRONG weaker reading uses one individual for source predication
    # and potentially a DIFFERENT individual for la-dawam.
    nweak=any(c['S'] and c['separated'] for c in cs) and any(c['P'] for c in cs)
    pweak=any(c['S'] and c['S_implies_P'] for c in cs) and any(c['nonP'] for c in cs)
    assert not nstrong or nresult
    assert not pstrong or presult
    for key,cond in (('negative_strong',nstrong),('negative_weak',nweak),
                     ('positive_strong',pstrong),('positive_weak',pweak)):
        counts[key]+=bool(cond)
    if nweak and not nresult:negative_fail.append(h)
    if pweak and not presult:positive_fail.append(h)
assert negative_fail and positive_fail
assert len(negative_fail)==140 and len(positive_fail)==140
example=((1,1,0),(0,0,0),(1,0,1),(0,0,0))
assert example in negative_fail
report=dict(
 scope='Two-individual temporal quantifier binding, NOT medieval modal certification',
 two_individuals=True,two_times=True,life_states_per_time=5,
 interpretations=len(MODELS),
 negative_bound=dict(antecedents=counts['negative_strong'],countermodels=0),
 negative_split=dict(antecedents=counts['negative_weak'],countermodels=len(negative_fail),
                     counterexample=as_json(negative_fail[0]),
                     different_people_example=as_json(example)),
 positive_bound=dict(antecedents=counts['positive_strong'],countermodels=0),
 positive_split=dict(antecedents=counts['positive_weak'],countermodels=len(positive_fail),
                     counterexample=as_json(positive_fail[0])),
 lesson='EXISTS x with all three clauses; not independent EXISTS x/y across components',
 limitations=['Only temporal persistence, not traditional necessity or possible worlds',
              'Other sorts of ancient proposition quantification are not certified'])
if __name__=='__main__':
    Path(__file__).with_name('verified_special_modal_witness_scope.json').write_text(
      json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('PASS 625 two-person profiles: same-witness conversions have no failures')
    print('PASS split-witness countermodels:',len(negative_fail),len(positive_fail))
