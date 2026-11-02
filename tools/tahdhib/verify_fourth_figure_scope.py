#!/usr/bin/env python3
"""Eight commentary figure-IV patterns under explicitly NONMODAL A/E/I/O semantics.

This program tests a modern Boolean skeleton, not Taftazani's historical
modal syllogistic. Source: al-Yazdi's Sharh al-Tahdhib with separately signed
glosses, Shamela ed. (printed pp. 145–148). Figure IV: major P–M,
minor M–S, conclusion S–P. Ordinals are the commentary's.
"""
import itertools
import json
from pathlib import Path

U = tuple(range(3))
SETS = [frozenset(i for i in U if (mask >> i) & 1) for mask in range(8)]
MODELS = [dict(zip("SPM", a)) for a in itertools.product(SETS, repeat=3)]
assert len(MODELS) == 512

def pred(q, subject, predicate):
    if q == "A": return subject <= predicate
    if q == "E": return not bool(subject & predicate)
    if q == "I": return bool(subject & predicate)
    if q == "O": return bool(subject-predicate)
    raise ValueError(q)

# (commentary ordinal, minor quality, major quality, claimed conclusion)
PATTERNS = [
    (1,"A","A","I"), (2,"A","I","I"), (3,"E","A","E"),
    (4,"A","E","O"), (5,"I","E","O"), (6,"O","A","O"),
    (7,"A","O","O"), (8,"E","I","O"),
]
rows=[]
for ordinal, minor, major, conclusion in PATTERNS:
    cases = [m for m in MODELS if pred(minor,m["M"],m["S"])
                                  and pred(major,m["P"],m["M"])]
    fails = [m for m in cases if not pred(conclusion,m["S"],m["P"])]
    nonempty = [m for m in fails if all(m[t] for t in "SPM")]
    fmt = lambda m: ({t:sorted(m[t]) for t in "SPM"} if m else None)
    rows.append({
        "ordinal":ordinal, "minor":minor, "major":major,
        "conclusion":conclusion, "premise_models":len(cases),
        "boolean_countermodels":len(fails),
        "all_terms_nonempty_countermodels":len(nonempty),
        "first_boolean_countermodel":fmt(fails[0] if fails else None),
        "first_all_nonempty_countermodel":fmt(nonempty[0] if nonempty else None),
    })
assert [r["ordinal"] for r in rows if r["boolean_countermodels"]==0] == [2,3,5]
assert [r["ordinal"] for r in rows if r["boolean_countermodels"] and
        not r["all_terms_nonempty_countermodels"]] == [1,4]
assert [r["ordinal"] for r in rows if r["all_terms_nonempty_countermodels"]] == [6,7,8]

# Explicit existential bridge: pattern 1 requires a nonempty P;
# pattern 4 requires a nonempty M. This is still only Boolean.
for ordinal,term in ((1,"P"),(4,"M")):
    _,minor,major,conclusion = PATTERNS[ordinal-1]
    assert all(not (m[term] and pred(minor,m["M"],m["S"])
                   and pred(major,m["P"],m["M"]))
               or pred(conclusion,m["S"],m["P"]) for m in MODELS)

# The first five are precisely the five traditional nonmodal figure-IV
# moods already covered in verify_logic_core.py (including existence cases).
assert {(r["major"],r["minor"],r["conclusion"]) for r in rows[:5]} == {
    ("A","A","I"),("I","A","I"),("A","E","E"),
    ("E","A","O"),("E","I","O")}

# Stage91: source-aware reduction bridges for patterns 6–8.
# These do NOT assume conversion of an O-proposition without a justified
# historical modal license. They identify exactly where such a license
# must enter, following Katibi Shamsiyyah §§95–104 and Yazdi commentary.
pattern_by_number={n:(minor,major,conclusion) for n,minor,major,conclusion in PATTERNS}
assert pattern_by_number[6]==("O","A","O")
assert pattern_by_number[7]==("A","O","O")
assert pattern_by_number[8]==("E","I","O")
# The sixth mood's ONLY NEGATIVE premise is the minor, not the major.
# Nevertheless, the received Arabic of Shamsiyyah §103 / signed gloss
# speaks of "الكبرى في الضرب السادس من المنعكسة السوالب".
# Record as an unresolved source-internal crux rather than changing witnesses.
assert pattern_by_number[6][0] == "O" and pattern_by_number[6][1] == "A"

bridges={}
# Sixth: if its special O minor CAN be converted to O(S,M), reduction
# to figure II licenses the desired negative particular.
sixth=[m for m in MODELS if pred("O",m["M"],m["S"])
                         and pred("A",m["P"],m["M"])]
assert sixth and all(pred("O",m["S"],m["P"]) for m in sixth
                     if pred("O",m["S"],m["M"]))
bridges["6"]={
  "required_historical_conversion":"O(M,S) -> O(S,M), from a specially qualified minor",
  "reduction":"second figure, O(S,M) and A(P,M) -> O(S,P)",
  "cases_in_boolean_model_where_conversion_license_holds":
       sum(pred("O",m["S"],m["M"]) for m in sixth),
  "conditional_inference_valid":True,
  "license_proved_by_boolean_model":False,
}
# Seventh: if the special O major CAN be converted to O(M,P),
# reduction to figure III licenses the negative particular.
seventh=[m for m in MODELS if pred("A",m["M"],m["S"])
                           and pred("O",m["P"],m["M"])]
assert seventh and all(pred("O",m["S"],m["P"]) for m in seventh
                       if pred("O",m["M"],m["P"]))
bridges["7"]={
  "required_historical_conversion":"O(P,M) -> O(M,P), from a specially qualified major",
  "reduction":"third figure, A(M,S) and O(M,P) -> O(S,P)",
  "cases_in_boolean_model_where_conversion_license_holds":
       sum(pred("O",m["M"],m["P"]) for m in seventh),
  "conditional_inference_valid":True,
  "license_proved_by_boolean_model":False,
}
# Eighth: simply reversing the order produces a first-figure
# negative particular in THE REVERSE DIRECTION, O(P,S).
# Obtaining O(S,P) demands a separate historical conversion of that
# RESULT; ordinary Boolean O propositions do NOT so convert.
eighth=[m for m in MODELS if pred("E",m["M"],m["S"])
                          and pred("I",m["P"],m["M"])]
assert eighth and all(pred("O",m["P"],m["S"]) for m in eighth)
assert any(not pred("O",m["S"],m["P"]) for m in eighth)
bridges["8"]={
  "always_entails_intermediate":"O(P,S), from I(P,M) and E(M,S)",
  "required_historical_conversion":"O(P,S) -> O(S,P), of the resulting specially modulated conclusion",
  "reduction":"reversed order to first figure, then converse of resulting conclusion",
  "intermediate_step_valid":True,
  "license_proved_by_boolean_model":False,
}
source_direction_issue={
  "earlier_source":"al-Katibi, Shamsiyyah, §§95.8, 103–104; Tony Street 2024 pp.65, 68–69",
  "reported_Arabic":"كون الكبرى في السادس من المنعكسة السوالب",
  "semantic_problem":"sixth mood has a negative minor and affirmative major",
  "independent_internal_evidence":"§104 explicitly obtains the sixth by conversion of the minor",
  "editorial_status":"unresolved internal source wording; do not silently emend الكبرى to الصغرى",
}

report={
    "scope":"Modern Boolean interpretation only; historical modal restrictions NOT certified",
    "source":"Al-Yazdi Sharh al-Tahdhib and signed glosses, printed pp.145–148 (Shamela 04553)",
    "domain_size":len(U), "set_assignments":len(MODELS),
    "figure":"IV: major P-M, minor M-S, result S-P",
    "patterns":rows,
    "unqualified_boolean_valid":[2,3,5],
    "existence_required":[{"ordinal":1,"term":"P"},{"ordinal":4,"term":"M"}],
    "not_valid_merely_by_nonemptiness":[6,7,8],
    "reduction_bridges":bridges,
    "shamsiyya_sixth_major_minor_crux":source_direction_issue,
}
out=Path(__file__).with_name("verified_fourth_figure_scope.json")
out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("PASS: 8 commentary figure-IV patterns tested over 512 models")
print("PASS: 2,3,5 Boolean valid; 1,4 require existence; 6,7,8 need more than existence")
print("PASS: modes 6/7 reduce conditionally on licensed premise conversion; mode 8 entails reverse O, not converse")
for r in rows:
    print(f"  {r['ordinal']}: {r['minor']}/{r['major']} => {r['conclusion']}: "
          f"{r['boolean_countermodels']} failures; "
          f"{r['all_terms_nonempty_countermodels']} nonempty failures")
