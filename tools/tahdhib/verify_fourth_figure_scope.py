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

report={
    "scope":"Modern Boolean interpretation only; historical modal restrictions NOT certified",
    "source":"Al-Yazdi Sharh al-Tahdhib and signed glosses, printed pp.145–148 (Shamela 04553)",
    "domain_size":len(U), "set_assignments":len(MODELS),
    "figure":"IV: major P-M, minor M-S, result S-P",
    "patterns":rows,
    "unqualified_boolean_valid":[2,3,5],
    "existence_required":[{"ordinal":1,"term":"P"},{"ordinal":4,"term":"M"}],
    "not_valid_merely_by_nonemptiness":[6,7,8],
}
out=Path(__file__).with_name("verified_fourth_figure_scope.json")
out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("PASS: 8 commentary figure-IV patterns tested over 512 models")
print("PASS: 2,3,5 Boolean valid; 1,4 require existence; 6,7,8 need more than existence")
for r in rows:
    print(f"  {r['ordinal']}: {r['minor']}/{r['major']} => {r['conclusion']}: "
          f"{r['boolean_countermodels']} failures; "
          f"{r['all_terms_nonempty_countermodels']} nonempty failures")
