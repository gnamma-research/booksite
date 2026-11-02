#!/usr/bin/env python3
"""Non-modal categorical/conditional regression checks for Tahdhīb logic.

The finite model is a modern explanatory reconstruction, NOT a proof of
Taftāzānī's full modal logic and NOT manuscript evidence.
"""
import itertools, json, pathlib
N=3
UNIVERSE=range(N)
# Include the empty extension: excluding it silently imposes existential import
# on every term, disguising countermodels to four traditional syllogistic moods.
SETS=[frozenset(i for i in UNIVERSE if mask & (1 << i)) for mask in range(1 << N)]
MODELS=[dict(zip("SPM",sets)) for sets in itertools.product(SETS, repeat=3)]
assert len(SETS) == 8 and len(MODELS) == 512, (
    "Universe must include empty terms for existential-premise QA")
assert any(not m["S"] and not m["P"] and not m["M"] for m in MODELS)
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
# Stage 79: ensure the four countermodels really depend on a nonempty term.
# This is a modern SET-THEORETIC interpretation, not a reconstruction of
# medieval modal, temporal or conditional proposition semantics.
needs_existence={m[0]:m[-1] for m in MOODS if m[-1]}
assert needs_existence=={"Darapti":"M","Felapton":"M",
                         "Bramantip":"P","Fesapo":"M"}
assert sum(bool(r["unqualified_countermodel"]) for r in results)==4

# Positive and negative disjunctions are semantically distinct.
table=[]
for a,b in itertools.product((False,True),repeat=2):
 table.append(dict(P=a,Q=b,
                   haqiqiyya=a!=b, mani_al_jam=not(a and b),mani_al_khulu=a or b))
assert any(r['mani_al_jam'] and not r['P'] and not r['Q'] for r in table)
assert any(r['mani_al_khulu'] and r['P'] and r['Q'] for r in table)
# L17: modern material-implication schematic checks only. Do not identify
# truth-functional implication with the historic luzumiyya without a commentary.
implies=lambda a,b: (not a) or b
for a,b in itertools.product((False,True),repeat=2):
    if implies(a,b) and a: assert b          # affirm antecedent (modus ponens)
    if implies(a,b) and not b: assert not a  # deny consequent (modus tollens)
    if a != b:
        assert (a and not b) or (b and not a) # strict disjunction
    if not (a and b) and a: assert not b     # prevents conjunction
    if (a or b) and not a: assert b          # prevents joint falsity
assert any(implies(a,b) and b and not a for a,b in itertools.product((False,True),repeat=2))
assert any(implies(a,b) and not a and b for a,b in itertools.product((False,True),repeat=2))
# L13: negation of universal conjunctive predication distributes to
# EXISTENTIAL disjunctive negation, not to conjunction of two existential negations.
for ps in itertools.product((False,True),repeat=2):
    for qs in itertools.product((False,True),repeat=2):
        lhs=not all(p and q for p,q in zip(ps,qs))
        rhs=any((not p) or (not q) for p,q in zip(ps,qs))
        assert lhs==rhs
assert (not all(p and q for p,q in zip((False,True),(True,True))))
assert not (any(not q for q in (True,True)))

# Stage 86: finite-set probes of the TWO verbal formulations of
# 'aks al-naqid (L15). These are NOT the medieval MODAL conversion rules.
# A: all S are P; E: no S are P; I: some S are P; O: some S are not P.
# Same-quality complement swap:  Q(S,P) => Q(non-P, non-S).
# Reverse-quality single complement: Q(S,P) => Q*(non-P, S).
# In Boolean set semantics, A and O validate both schemas; E and I
# have countermodels. Unlike a naive modern contraposition slogan,
# universal existence is NOT silently assumed.
univ=frozenset(UNIVERSE)
complement=lambda subset: univ-subset
opposite_quality={"A":"E","E":"A","I":"O","O":"I"}
contra_tests=[]
for quality in "AEIO":
    failures_equal=[]; failures_reverse=[]
    for subj,pred in itertools.product(SETS,repeat=2):
        if not P[quality](subj,pred):continue
        if not P[quality](complement(pred),complement(subj)):
            failures_equal.append((subj,pred))
        if not P[opposite_quality[quality]](complement(pred),subj):
            failures_reverse.append((subj,pred))
    predicted_valid=quality in ("A","O")
    assert (not failures_equal)==predicted_valid,(quality,failures_equal[:1])
    assert (not failures_reverse)==predicted_valid,(quality,failures_reverse[:1])
    contra_tests.append({
        "quality":quality,
        "complement_swap_valid":not failures_equal,
        "reversed_quality_valid":not failures_reverse,
        "complement_swap_first_countermodel":(
            {"S":sorted(failures_equal[0][0]),"P":sorted(failures_equal[0][1])}
            if failures_equal else None),
        "reversed_quality_first_countermodel":(
            {"S":sorted(failures_reverse[0][0]),"P":sorted(failures_reverse[0][1])}
            if failures_reverse else None),
    })
# L14 simple conversion (nonmodal skeleton), with existence explicitly fixed.
assert all((not P["E"](s,p)) or P["E"](p,s)
           for s,p in itertools.product(SETS,repeat=2))
assert all((not P["I"](s,p)) or P["I"](p,s)
           for s,p in itertools.product(SETS,repeat=2))
assert all((not P["A"](s,p)) or (not s) or P["I"](p,s)
           for s,p in itertools.product(SETS,repeat=2))
assert any(P["A"](s,p) and not P["I"](p,s)
           for s,p in itertools.product(SETS,repeat=2))
assert any(P["O"](s,p) and not P["O"](p,s)
           for s,p in itertools.product(SETS,repeat=2))

# Universal affirmative does not generally convert universally; O not converse.
assert any(P['A'](m['S'],m['P']) and not P['A'](m['P'],m['S']) for m in MODELS)
assert any(P['O'](m['S'],m['P']) and not P['O'](m['P'],m['S']) for m in MODELS)
report={"domain_elements":N,"set_theoretic_models":len(MODELS),
        "test_scope":"Non-modal reconstruction only, not historic modal or manuscript certification",
        "categorical_moods":results,"disjunction_truth_table":table,
        "nonmodal_contraposition_probe":contra_tests}
out=pathlib.Path(__file__).with_name("verified_nonmodal_results.json")
out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("PASS",len(MOODS),"nonmodal moods,",len(MODELS),
      "finite models including empty terms; 4 existential-premise countermodels")
print("PASS three kinds of disjunction, two invalid conversions,")
print("     material-conditional schematic and quantified-negation scope")
print("PASS both L15 nonmodal complement schemas: A and O valid, E and I have countermodels")
