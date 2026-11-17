"""Independent finite-set audit of the editorial M-C-46 relation table.

The definitions below use ordinary sets, not the author's proof transformations.
Enumerating all B,C subsets through a four-element universe realizes every
emptiness pattern of the four Boolean regions; it is complete for these formulas.
"""
from itertools import product
from pathlib import Path
import json

OUT = Path(__file__).resolve().parents[1] / 'audits'

def proposition(form, subject, predicate):
    if form == 'A':
        return subject <= predicate
    if form == 'E':
        return not (subject & predicate)
    if form == 'I':
        return bool(subject & predicate)
    if form == 'O':
        return bool(subject - predicate)
    raise ValueError(form)

def subsets(universe):
    ordered = sorted(universe)
    return [frozenset(x for x, included in zip(ordered, mask) if included)
            for mask in product((False, True), repeat=len(ordered))]

# Each value names the proposition in an actual table cell and any extra premise.
rows = {
    'Contradictory': {
        'A': ('O', 'B', 'C', None), 'I': ('E', 'B', 'C', None),
        'E': ('I', 'B', 'C', None), 'O': ('A', 'B', 'C', None),
    },
    'Simple converse': {
        'A': ('I', 'C', 'B', 'B'), 'I': ('I', 'C', 'B', None),
        'E': ('E', 'C', 'B', None),
    },
    'Contrapositive retaining quality': {
        'A': ('A', 'notC', 'notB', None),
        'E': ('O', 'notC', 'notB', 'B'),
        'O': ('O', 'notC', 'notB', None),
    },
    'Contrapositive changing quality': {
        'A': ('E', 'notC', 'B', None),
        'E': ('I', 'notC', 'B', 'B'),
        'O': ('I', 'notC', 'B', None),
    },
    'Predicate-complemented form': {
        'A': ('E', 'B', 'notC', None), 'I': ('O', 'B', 'notC', None),
        'E': ('A', 'B', 'notC', None), 'O': ('I', 'B', 'notC', None),
    },
    'Both terms complemented': {
        'A': ('I', 'notB', 'notC', 'notC'),
        'E': ('O', 'notB', 'notC', 'C'),
    },
    'Subject-complemented form': {
        'A': ('O', 'notB', 'C', 'notC'),
        'E': ('I', 'notB', 'C', 'C'),
    },
}

models = []
for size in range(5):
    universe = frozenset(range(size))
    for b, c in product(subsets(universe), repeat=2):
        models.append({'U': universe, 'B': b, 'C': c,
                       'notB': universe - b, 'notC': universe - c})

def witness(model):
    return {key: sorted(model[key]) for key in ('U', 'B', 'C')}

results = []
for relation, cells in rows.items():
    for original, (form, subject, predicate, existence) in cells.items():
        checked = 0
        unconditional_failures = []
        guarded_failures = []
        conditional_necessity_failures = []
        for model in models:
            premise = proposition(original, model['B'], model['C'])
            conclusion = proposition(form, model[subject], model[predicate])
            if relation == 'Contradictory':
                checked += 1
                if conclusion != (not premise):
                    guarded_failures.append(witness(model))
                continue
            if not premise:
                continue
            checked += 1
            guard = bool(model[existence]) if existence else True
            if not conclusion:
                unconditional_failures.append(witness(model))
                if guard:
                    guarded_failures.append(witness(model))
            if existence and conclusion != guard:
                conditional_necessity_failures.append(witness(model))
        assert checked > 0, (relation, original, 'vacuous verification')
        assert not guarded_failures, (relation, original, guarded_failures)
        assert not conditional_necessity_failures, (relation, original, conditional_necessity_failures)
        if existence:
            assert unconditional_failures, (relation, original, 'unnecessary condition')
        results.append({
            'relation': relation,
            'original': f'{original}(B,C)',
            'cell': f'{form}({subject},{predicate})',
            'extraNonemptyClass': existence,
            'modelsChecked': checked,
            'failuresWithCondition': len(guarded_failures),
            'failuresWithoutCondition': len(unconditional_failures),
            'conditionNecessaryAndSufficientGivenOriginal': bool(existence),
            'smallestCountermodelWithoutCondition': unconditional_failures[0] if unconditional_failures else None,
        })

# Expose the two errors that generic "subject existence" language can conceal.
strong_counterexamples = []
for relation in ('Both terms complemented', 'Subject-complemented form'):
    for original in ('A', 'E'):
        form, subject, predicate, existence = rows[relation][original]
        failures = [m for m in models if m['B'] and
                    proposition(original, m['B'], m['C']) and
                    not proposition(form, m[subject], m[predicate])]
        assert failures
        strong_counterexamples.append({
            'relation': relation, 'original': original,
            'ordinarySubjectBNonempty': True,
            'countermodel': witness(failures[0]),
            'missingNonemptyClass': existence,
        })

# Independently disprove representative candidates at all seven dash positions.
# We demand all four terms B,C,notB,notC nonempty to avoid a vacuity-only failure.
dashes = [
    ('Simple converse', 'O', ('O', 'C', 'B')),
    ('Contrapositive retaining quality', 'I', ('I', 'notC', 'notB')),
    ('Contrapositive changing quality', 'I', ('O', 'notC', 'B')),
    ('Both terms complemented', 'I', ('A', 'notB', 'notC')),
    ('Both terms complemented', 'O', ('E', 'notB', 'notC')),
    ('Subject-complemented form', 'I', ('E', 'notB', 'C')),
    ('Subject-complemented form', 'O', ('A', 'notB', 'C')),
]
dash_results = []
for relation, original, (form, subject, predicate) in dashes:
    failures = [m for m in models if all(m[t] for t in ('B', 'C', 'notB', 'notC'))
                and proposition(original, m['B'], m['C'])
                and not proposition(form, m[subject], m[predicate])]
    assert failures, (relation, original, 'no counterexample found')
    dash_results.append({'relation': relation, 'original': f'{original}(B,C)',
                         'candidate': f'{form}({subject},{predicate})',
                         'countermodelWithAllFourTermsNonempty': witness(failures[0])})

note = (
    'The contradictory row gives the denial of the original; the other populated '
    'cells are presented as consequences of the original. In modern set semantics '
    'allowing empty terms, the simple converse of A(B,C) and both contrapositives '
    'of E(B,C) require B to be nonempty. The forms complementing both terms or '
    'the subject alone require different existence premises: from A(B,C), '
    'non-C must be nonempty; from E(B,C), C must be nonempty. These last premises '
    'do not follow merely from B being nonempty. The other populated consequences '
    'need no additional existence premise. The proofs on displayed pp190–191 '
    'give no separate statement that the required C or non-C class exists.'
)
report = {
    'scope': 'Editorial English reconstruction of Rafed displayed p193, M-C-46',
    'method': 'Direct finite-set semantics; all pairs B,C over domains of sizes 0 through 4',
    'modelCount': len(models),
    'completeness': 'Each formula depends only on which of the four Boolean regions B∩C, B∩notC, notB∩C, notB∩notC is nonempty. Domains of at most four elements realize every such pattern. Thus this finite enumeration is complete for the tested unary-predicate fragment, not a proof of all traditional syllogistic assumptions.',
    'populatedCells': len(results),
    'truthComplementCells': 4,
    'consequenceCells': len(results) - 4,
    'conditions': results,
    'subjectExistenceInsufficient': strong_counterexamples,
    'dashCounterexamples': dash_results,
    'proposedReplacementNote': note,
}
(OUT / 'muzaffar-table-finite-models-2026-11-10.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'models': len(models), 'cells': len(results),
                  'conditionalCells': sum(bool(r['extraNonemptyClass']) for r in results),
                  'unconditionalConsequenceCells': sum(not r['extraNonemptyClass'] and r['relation'] != 'Contradictory' for r in results),
                  'dashCounterexamples': len(dash_results), 'failures': 0}, indent=2))
