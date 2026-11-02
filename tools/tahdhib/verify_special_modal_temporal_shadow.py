#!/usr/bin/env python3
"""Finite-time explanatory SHADOW of special-modal conversion in Tahdhib L14-15.

Sources: al-Yazdi, Hashiya ala Tahdhib, printed pp.83-84; al-Katibi,
Shamsiyyah §§76, 83-84; Tony Street 2024, Appendix 2, AD2 types.
NOT a reconstruction of medieval necessity, modality, or reference conditions.
Temporal persistence while a subject-description is borne is only a WEAKER
shadow of the traditional 'necessary/permanent as long as it is described'.
"""
import itertools
import json
from pathlib import Path

TIMES = range(3)
# One individual's life can be absent at a time, or present with S/P
# set independently. Complements are relative to times of existence.
STATES = ((0,0,0),(1,0,0),(1,0,1),(1,1,0),(1,1,1))
HISTORIES = list(itertools.product(STATES,repeat=3))
assert len(HISTORIES)==125

def flags(h):
    e,s,p = zip(*h)
    np = tuple(bool(ex and not pr) for ex,pr in zip(e,p))
    return dict(
        s_actual=any(s), p_actual=any(p), notp_actual=any(np),
        no_s_p=all(not (a and b) for a,b in zip(s,p)),
        p_while_s=all((not a) or b for a,b in zip(s,p)),
        no_p_s=all(not (a and b) for a,b in zip(p,s)),
        nots_while_notp=all((not a) or (not b) for a,b in zip(np,s)))

def show(h):
    return [dict(t=t,exists=bool(e),S=bool(s),P=bool(p))
            for t,(e,s,p) in enumerate(h)]

def entails_and_ablations(source,result):
    yes=0
    for h in HISTORIES:
        f=flags(h)
        if all(f[x] for x in source):
            yes+=1
            assert all(f[x] for x in result), (source,result,show(h))
    assert yes>0
    ablations=[]
    for dropped in source:
        cases=[h for h in HISTORIES if
               all(flags(h)[x] for x in source if x!=dropped) and
               not all(flags(h)[x] for x in result)]
        assert cases, dropped
        ablations.append(dict(omitted=dropped,countermodels=len(cases),
                              first_countermodel=show(cases[0])))
    return dict(antecedent_models=yes,valid_in_model=True,ablations=ablations)

# Negative special: some S is (not P) throughout its S-description;
# 'la-dawam' contributes some P-occasion in that very individual's life.
# Converse exchanges S and P. Existence of BOTH titles matters.
negative=entails_and_ablations(
    ('s_actual','no_s_p','p_actual'),
    ('p_actual','no_p_s','s_actual'))

# Positive special: some S is P throughout S-description, but at some
# lived time that individual is not P. Its negative contrapositive has
# subject (existent and not P), and predicate S under negative quality.
positive=entails_and_ablations(
    ('s_actual','p_while_s','notp_actual'),
    ('notp_actual','nots_while_notp','s_actual'))

# For modes 6 and 7 test only the same-witness temporal skeleton.
# For mode 8, a special negative MINOR plus an unqualified I major is
# INSUFFICIENT: the historical modal-class restriction remains essential.
STATES3=((0,0,0,0),)+tuple((1,*bits) for bits in
                           itertools.product((0,1),repeat=3))
TRIPLES=list(itertools.product(STATES3,repeat=3))
assert len(TRIPLES)==729

def sets(h):
    return {k:tuple(bool(row[j]) for row in h)
            for k,j in (('S',1),('M',2),('P',3))}
def nsp(d,a,b):
    x,y=d[a],d[b]
    return any(x) and any(y) and all(not (i and j) for i,j in zip(x,y))
def universal(d,a,b):
    return all((not i) or j for i,j in zip(d[a],d[b]))
def some_both(d,a,b):
    return any(i and j for i,j in zip(d[a],d[b]))
def some_not(d,a,b):
    return any(i and not j for i,j in zip(d[a],d[b]))
def display(h):
    return [dict(t=t,exists=bool(e),S=bool(s),M=bool(m),P=bool(p))
            for t,(e,s,m,p) in enumerate(h)]

patterns={
  'mode6_special_negative_minor': lambda d:nsp(d,'M','S') and universal(d,'P','M'),
  'mode7_special_negative_major': lambda d:nsp(d,'P','M') and universal(d,'M','S'),
  'mode8_special_negative_minor_only':lambda d:nsp(d,'M','S') and some_both(d,'P','M'),
}
probes={}
for name,antecedent in patterns.items():
    yes=[]; failures=[]
    for h in TRIPLES:
        d=sets(h)
        if antecedent(d):
            yes.append(h)
            if not some_not(d,'S','P'):failures.append(h)
    assert yes
    assert (not failures)==(name!='mode8_special_negative_minor_only')
    probes[name]=dict(premise_models=len(yes),countermodels=len(failures),
                      first_countermodel=display(failures[0]) if failures else None)
# A merely ordinary O(M,S) is not enough for mode 6.
drop_special=[h for h in TRIPLES if some_not(sets(h),'M','S') and
              universal(sets(h),'P','M') and
              not some_not(sets(h),'S','P')]
assert drop_special
probes['mode6_ordinary_O_instead_of_special']={
    'countermodels':len(drop_special),
    'first_countermodel':display(drop_special[0])}

report=dict(
 scope='Finite-time one-witness explanatory shadow ONLY; not historical modal validity',
 sources=['al-Yazdi Hashiya pp.83-84','al-Katibi Shamsiyyah §§76,83-84',
          'Tony Street 2024 Appendix 2 AD2 pp.343-344'],
 time_instants=3,life_states_per_instant=5,life_histories=125,
 negative_special_simple_conversion=negative,
 positive_special_contraposition=positive,
 fourth_figure_single_witness_histories=729,
 fourth_figure_probes=probes,
 limitations=['The S-description can vary across life but necessity is not modeled',
  'Nonpermanence and title actualization refer to SAME individual',
  'Complements exclude times outside existence',
  'Many-individual quantification is NOT modeled',
  'Mode8 major modal-class restriction and conclusion modality NOT proved'])
if __name__=='__main__':
    out=Path(__file__).with_name('verified_special_modal_temporal_shadow.json')
    out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('PASS 125 life histories: both special conversion SHADOWS')
    print('PASS 3 ablation countermodel sets for each conversion')
    print('PASS 729 three-term time histories: mode6/7, mode8 underconstrained')
    for name,entry in probes.items():
        print(' ',name,':',entry['countermodels'],'countermodels')
