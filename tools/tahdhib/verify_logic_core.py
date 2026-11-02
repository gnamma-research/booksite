#!/usr/bin/env python3
"""Non-modal categorical/conditional regression checks for Tahdhīb logic.

The finite model is a modern explanatory reconstruction, NOT a proof of
Taftāzānī's full modal logic and NOT manuscript evidence.
"""
import itertools, json, pathlib
N=3
UNIVERSE=range(N)
SETS=[frozenset(i for i in UNIVERSE if mask & (1 << i)) for mask in range(1 << N)]
MODELS=[dict(zip("SPM",sets)) for sets in itertools.product(SETS, repeat=3)]
P={
 "A": lambda x,y:x <= y,
 "E": lambda x,y: not (x & y),
 "I": lambda x,y: bool(x & y),
 "O": lambda x,y: bool(x-y)
}
FIGURES={
 1:(("M","P"),("S","M")),
 2:(("P","M"),("S","M")),
 3:(("M","P"),("M","S")),
 4:(("P","M"),("M","S"))
}
# (mnemonic, figure, major, minor, conclusion, required nonempty term)
# Mnemonic labels are pedagogical; they are not quotations from Tahdhīb.
MOODS=[
 ("Barbara",1,"A","A","A",None),("Celarent",1,"E","A","E",None),
 ("Darii",1,"A","I","I",None),("Ferio",1,"E","I","O",None),
 ("Cesare",2,"E","A","E",None),("Camestres",2,"A","E","E",None),
 ("Festino",2,"E","I","O",None),("Baroco",2,"A","O","O",None),
 ("Darapti",3,"A","A","I","M"),("Disamis",3,"I","A","I",None),
 ("Datisi",3,"A","I","I",None),("Felapton",3,"E","A","O","M"),
 ("Bocardo",3,"O","A","O",None),("Ferison",3,"E","I","O",None),
 ("Bramantip",4,"A","A","I","P"),("Camenes",4,"A","E","E",None),
 ("Dimaris",4,"I","A","I",None),("Fesapo",4,"E","A","O","M"),
 ("Fresison",4,"E","I","O",None)
]
def premises(mood,model):
 _,fig,major,minor,_,_=mood
 (a,b),(c,d)=FIGURES[fig]
 return P[major](model[a],model[b]) and P[minor](model[c],model[d])
def satisfies(mood,model,require_existence):
 term=mood[-1]
 return (not require_existence or not term or bool(model[term])) and premises(mood,model)
def entails(mood,model):
 return P[mood[4]](model["S"],model["P"])
results=[]
for mood in MOODS:
 valid=[x for x in MODELS if satisfies(mood,x,True)]
 assert valid, mood
 assert all(entails(mood,m) for m in valid), (mood[0],valid)
 counter=next((m for m in MODELS if satisfies(mood,m,False) and not entails(mood,m)),None)
 assert (counter is not None)==bool(mood[-1]),(mood[0],counter)
 results.append(dict(name=mood[0],figure=mood[1],models_with_premises=len(valid),
                     existential_condition=mood[-1],unqualified_countermodel=(
                     {k:sorted(v) for k,v in counter.items()} if counter else None)))
# Positive and negative disjunctions are semantically distinct.
table=[]
for a,b in itertools.product((False,True),repeat=2):
 table.append(dict(P=a,Q=b,
                   haqiqiyya=a!=b, mani_al_jam=not(a and b),mani_al_khulu=a or b))
assert any(r['mani_al_jam'] and not r['P'] and not r['Q'] for r in table)
assert any(r['mani_al_khulu'] and r['P'] and r['Q'] for r in table)
# Universal affirmative does not generally convert universally; O not converse.
assert any(P['A'](m['S'],m['P']) and not P['A'](m['P'],m['S']) for m in MODELS)
assert any(P['O'](m['S'],m['P']) and not P['O'](m['P'],m['S']) for m in MODELS)
report={"domain_elements":N,"set_theoretic_models":len(MODELS),
        "test_scope":"Non-modal reconstruction only, not historic modal or manuscript certification",
        "categorical_moods":results,"disjunction_truth_table":table}
out=pathlib.Path(__file__).with_name("verified_nonmodal_results.json")
out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("PASS",len(MOODS),"nonmodal moods,",len(MODELS),"finite models; 4 conditional existential countermodels")
print("PASS three kinds of disjunction and two invalid-conversion counterexamples")
