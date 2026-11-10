#!/usr/bin/env python3
"""Apply explicit Stage X editorial plans, with exact preimages and receipts.

Usage: python3 .../integrate-nihaya-stage10.py PLAN.json ... [--apply]
The default is a dry run. Applied decision IDs may never be silently replayed.
Historical comparison reports and the Stage VIII adoption ledger stay intact.
"""
import argparse
import copy
import hashlib
import json
from collections import Counter
from pathlib import Path

H = Path(__file__).resolve().parents[1]
A = H / 'audits'
DATE = '2026-11-11'


def read(p):
    return json.loads(Path(p).read_text(encoding='utf-8'))


def sha(s):
    return hashlib.sha256(s.encode() if isinstance(s, str) else s).hexdigest()


def dump(p, value):
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def add_note(notes, note):
    note = copy.deepcopy(note)
    if note.get('arabic') and note.get('english'):
        note['text'] = note['english']
    found = [i for i, old in enumerate(notes) if note.get('id') and old.get('id') == note['id']]
    if found:
        assert len(found) == 1 and notes[found[0]] == note, ('Conflicting note identity', note.get('id'))
    elif note not in notes:
        notes.append(note)
    return note


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('plans', nargs='+', type=Path)
    ap.add_argument('--apply', action='store_true')
    args = ap.parse_args()
    book_path = H / 'nihayat-al-hikma/data/book.json'
    extra_path = H / 'nihayat-al-hikma/data/editorial-supplement.json'
    book = read(book_path)
    extra = read(extra_path)
    original = copy.deepcopy(book)
    units = {u['id']: u for u in book['units']}
    previous = read(A / 'nihaya-adopted-textual-decisions-2026-11-10.json')
    current_ledger = A / 'nihaya-adopted-textual-decisions-current.json'
    ledger = read(current_ledger) if current_ledger.exists() else copy.deepcopy(previous)
    receipt_path = A / 'nihaya-stage10-integration-receipt.json'
    receipt = read(receipt_path) if receipt_path.exists() else {
        'schema': 'nihaya-stage10-integration-receipt-v1', 'date': DATE,
        'method': 'Recovered complete-unit reports are reconciled against exact source preimages; selected difficult loci were reinspected. New complete comparisons retain their own source coverage. This receipt proves applied operations and source accounting, not manuscript or human certification.',
        'plans': [], 'units': [], 'decisions': [], 'inheritedDecisionsPreserved': 13,
    }
    saved_ids = [r['unitID'] for r in receipt['units']]
    assert len(saved_ids) == len(set(saved_ids)), 'Duplicate unit receipts'
    for saved in receipt['units']:
        u = units[saved['unitID']]
        assert sha(u['arabic']) == saved['afterArabicSha256'] and sha(u['english']) == saved['afterEnglishSha256'], ('Previously reviewed text changed; reconcile before continuing', saved['unitID'])
    for saved in receipt['plans']:
        p = H / saved['path']
        assert p.is_file() and sha(p.read_bytes()) == saved['sha256'], ('Saved integration plan missing or changed', saved['path'])
    recorded = {d['decisionID'] for d in receipt['decisions']}
    old_by_id = {u['id']: u for u in original['units']}
    new_decisions = []
    receipts = []
    for path in args.plans:
        path = path.resolve()
        assert path.is_relative_to(H), 'Save the plan inside the project before applying it'
        plan = read(path)
        rows = plan['units']
        if isinstance(plan.get('decisions'), list):
            decisions = copy.deepcopy(plan['decisions'])
        else:
            decisions = [dict(d, unitID=r['unitID']) for r in rows for d in r.get('decisions', [])]
        decisions.extend(copy.deepcopy(plan.get('metadataCorrections', [])))
        incoming_ids = [d['decisionID'] for d in decisions]
        assert len(incoming_ids) == len(set(incoming_ids)), 'Duplicate IDs in plan'
        assert not recorded.intersection(incoming_ids), 'Plan already applied: inspect the receipt instead of restarting'
        recorded.update(incoming_ids)
        for row in rows:
            uid = row['unitID']
            u = units[uid]
            base = row.get('base', {})
            preimage = row.get('preimage', {})
            ar_hash = row.get('arabicPreimageSha256') or row.get('preimageArabicSha256') or base.get('arabicSha256') or preimage.get('arabicSHA256')
            en_hash = row.get('englishPreimageSha256') or row.get('preimageEnglishSha256') or base.get('englishSha256') or preimage.get('englishSHA256')
            assert ar_hash and en_hash, ('Missing preimage hashes', uid)
            assert sha(u['arabic']) == ar_hash and sha(u['english']) == en_hash, ('Source changed since review', uid)
            assert not any(x['unitID'] == uid for x in receipt['units'] + receipts), ('Unit already integrated', uid)
            receipts.append({'unitID': uid, 'reviewID': row.get('reviewID', row.get('reviewId')),
                             'plan': str(path.relative_to(H)) if path.is_relative_to(H) else path.name,
                             'beforeArabicSha256': ar_hash, 'beforeEnglishSha256': en_hash,
                             'decisionIDs': [d['decisionID'] for d in decisions if d['unitID'] == uid],
                             'expectedPostimage':row.get('expectedPostimage')})
        for d in decisions:
            u = units[d['unitID']]
            op = d.get('operation', 'append' if d.get('old') is None else 'replace')
            field = d['field']
            disposition = d['disposition']
            applied = False
            if disposition == 'adopt' and field in ('arabic', 'english', 'arabicTitle', 'title') and op in ('replace', 'replace-substring'):
                assert isinstance(d['old'], str) and d['old'], d['decisionID']
                count = u[field].count(d['old'])
                assert count == d.get('expectedOccurrences', 1), (d['decisionID'], 'Anchor count', count)
                u[field] = u[field].replace(d['old'], d['new'], count)
                applied = True
            elif op == 'replace-exact-object':
                # Repair only the current copy of ledger metadata. Historical
                # Stage VIII evidence remains immutable and separately linked.
                if field.startswith('nihayat-al-hikma/data/book.json/'):
                    collection = u['notes']
                elif field.startswith('nihayat-al-hikma/data/editorial-supplement.json/'):
                    collection = extra['criticalNotes']
                elif field.startswith('audits/nihaya-adopted-textual-decisions-2026-11-10.json/'):
                    collection = ledger['decisions']
                    d['actualTarget'] = field.replace('nihaya-adopted-textual-decisions-2026-11-10.json','nihaya-adopted-textual-decisions-current.json')
                else:
                    raise ValueError(('Unknown metadata target', field))
                matches = [i for i, item in enumerate(collection) if item == d['old']]
                assert len(matches) == 1, (d['decisionID'], 'Metadata preimage mismatch')
                collection[matches[0]] = copy.deepcopy(d['new'])
                applied = True
            elif op in ('replace-note', 'replace-shared-critical-note', 'replace-exact-note'):
                matches = [i for i, n in enumerate(u['notes']) if n == d['old']]
                assert len(matches) == 1, (d['decisionID'], 'Note preimage mismatch')
                note = copy.deepcopy(d['new'])
                if note.get('arabic') and note.get('english'):
                    note['text'] = note['english']
                u['notes'][matches[0]] = note
                if op == 'replace-shared-critical-note':
                    found = [i for i, n in enumerate(extra['criticalNotes']) if n == d['old']]
                    assert len(found) == 1, (d['decisionID'], 'Shared note preimage mismatch')
                    extra['criticalNotes'][found[0]] = copy.deepcopy(note)
                applied = True
            elif op in ('append-note', 'append-authorial-note', 'append-shared-critical-note') or (field == 'notes' and d.get('old') is None and isinstance(d.get('new'), dict)):
                note = add_note(u.setdefault('notes', []), d['new'])
                if op == 'append-shared-critical-note':
                    add_note(extra['criticalNotes'], note)
                applied = True
            elif op in ('retain', 'record-no-change') or disposition in ('apparatus-only', 'deferred', 'defer', 'preserve'):
                pass
            else:
                raise ValueError(('Unhandled operation', d))
            if d.get('criticalNote'):
                note = add_note(extra['criticalNotes'], d['criticalNote'])
                add_note(u['notes'], note)
            d['operationApplied'] = applied
            d['appliedOn'] = DATE
            new_decisions.append(d)
        receipt['plans'].append({'path': str(path.relative_to(H)) if path.is_relative_to(H) else path.name,
                                 'sha256': sha(path.read_bytes()), 'units': [r['unitID'] for r in rows],
                                 'decisions': len(decisions)})

    # Every unit receives a public source note, even when no wording changes.
    for row in receipts:
        uid = row['unitID']; ds = [d for d in new_decisions if d['unitID'] == uid]
        existing = next((d.get('criticalNoteID') for d in ds if d.get('operation') == 'append-shared-critical-note'), None)
        if existing:
            row['criticalNoteID'] = existing
        else:
            nid = 'N10-COLLATION-' + uid[2:]
            lines = ['Complete external comparison reconciled in Stage X. The early 1404 witness is a printed facsimile and the later 1428 witness is an edited digital presentation. No manuscript collation or independent human certification is claimed.']
            for d in ds:
                if d['field'] not in ('arabic', 'english', 'arabicTitle', 'title') or d.get('classification') == 'layout-only':
                    continue
                label = 'Adopted' if d['disposition'] == 'adopt' else 'Recorded; authorial text retained'
                evidence=d.get('evidence', '')
                if isinstance(evidence,dict):
                    evidence='1404 pp. '+','.join(map(str,evidence.get('earlyPrintedPages',[])))+'; 1428 vol. '+str(evidence.get('laterVolume',''))+' pp. '+','.join(map(str,evidence.get('laterPrintedPages',[])))+(' n. '+str(evidence['laterFootnote']) if evidence.get('laterFootnote') else '')
                elif isinstance(evidence,list):
                    evidence='; '.join(str(e.get('witness',''))+' p.'+str(e.get('page','')) for e in evidence)
                old_display=' '.join(str(d.get('old','')).split())
                new_display=' '.join(str(d.get('new','')).split())
                lines.append(f"{label}: {old_display} → {new_display}. {d.get('reason', '')} Grade: {d.get('sourceGrade','')}." + (f" Source: {evidence}" if evidence else ''))
            n = {'id': nid, 'passageId': uid, 'type': 'External comparison and editorial decisions',
                 'text': '\n\n'.join(lines), 'source': '1404 printed facsimile and 1428 edited digital presentation; exact coverage and decisions in ' + row['plan'],
                 'url': 'https://lib.rafed.net/view.php?b_id=3108&type=c_fbook' if units[uid]['stage'] in ('0','I','II','III','IV','V','VI','VII') else 'https://lib.rafed.net/view.php?b_id=3109&type=c_fbook',
                 'evidenceReport': '../../' + row['plan'], 'status': 'Completed external comparison reconciled; no human certification'}
            add_note(extra['criticalNotes'], n); add_note(units[uid]['notes'], n)
            row['criticalNoteID'] = nid
        row['afterArabicSha256'] = sha(units[uid]['arabic'])
        row['afterEnglishSha256'] = sha(units[uid]['english'])
        expected=row.get('expectedPostimage')
        if expected:
            assert expected['arabicSHA256']==row['afterArabicSha256'] and expected['englishSHA256']==row['afterEnglishSha256'], ('Postimage differs from reviewed plan',uid)
        row['bodyChanged'] = row['beforeArabicSha256'] != row['afterArabicSha256'] or row['beforeEnglishSha256'] != row['afterEnglishSha256']

    for decision_index, d in enumerate(new_decisions):
        if not d['operationApplied'] or d['field'] != 'arabic' or not isinstance(d.get('old'), str):
            continue
        classification = d.get('classification', d.get('sourceGrade', 'unspecified'))
        mixed_later_reading = d.get('sourceGrade', '').startswith('unfootnoted-later-consonantal-reading')
        if mixed_later_reading:
            classification = 'attested-later-edition-reading-unfootnoted'
        if not mixed_later_reading and (classification in ('N1', 'N2', 'R1', 'layout-only', 'mechanical-vocalization-repair') or d.get('category') in ('orthographicCorrections','vocalizationCorrections','heading-punctuation-repair')):
            ledger.setdefault('stage10LayoutOperations', []).append({'id': d['decisionID'], 'passageId': d['unitID'], 'before': d['old'], 'after': d['new'], 'classification': classification})
            continue
        if classification.startswith('explicit-later-editor-emendation;'):
            classification='explicit-later-editor-emendation'
        elif classification.startswith('unfootnoted-later-edition-reading;'):
            classification='attested-later-edition-reading-unfootnoted'
        note_id = d.get('criticalNoteID') or d.get('criticalNote', {}).get('id') or next(r['criticalNoteID'] for r in receipts if r['unitID'] == d['unitID'])
        final_reading = d['new']
        for later in new_decisions[decision_index + 1:]:
            if later['unitID'] == d['unitID'] and later['field'] == 'arabic' and later['operationApplied'] and isinstance(later.get('old'), str) and later['old']:
                final_reading = final_reading.replace(later['old'], later['new'])
        ledger['decisions'].append({'id': d['decisionID'], 'passageId': d['unitID'], 'criticalNoteId': note_id, 'stage': 'X',
                                   'classification': classification, 'replacements': d.get('ledgerReplacements', [{'before': d['old'], 'after': final_reading}]),
                                   'applicationReplacement': {'before': d['old'], 'after': d['new']},
                                   'source': d.get('evidence'), 'sourceGrade': d.get('sourceGrade'),
                                   'reason': d.get('reason'), 'manuscriptAttestationClaimed': False})
    receipt['units'].extend(receipts)
    receipt['decisions'].extend(new_decisions)
    # Earlier adoptions remain semantic invariants; spacing can be repaired later.
    compact = lambda s: ''.join(s.split())
    for d in previous['decisions']:
        for replacement in d['replacements']:
            assert compact(replacement['after']) in compact(units[d['passageId']]['arabic']), ('Earlier adoption lost', d['id'])
    completed = {'N-IX-09'} | {r['unitID'] for r in receipt['units']}
    registry_path = A / 'nihaya-external-comparison-register.json'
    if registry_path.exists():
        prior_completed = {r['unitID'] for r in read(registry_path)['units'] if r['comparisonComplete']}
        assert prior_completed <= completed, 'Previously completed comparisons would be lost; reconcile pending records first'
    total = len(completed)
    receipt['summary'] = {'integratedNewUnits': len(receipt['units']), 'cumulativeExternalUnitsIncorporated': total,
                          'bodyChangedUnits': sum(r['bodyChanged'] for r in receipt['units']),
                          'appliedOperations': sum(d['operationApplied'] for d in receipt['decisions']),
                          'appliedBodyOperationsByField': dict(Counter(d['field'] for d in receipt['decisions'] if d['operationApplied'] and d['field'] in ('arabic','english','title','arabicTitle'))),
                          'remainingExternalUnits': len(units)-total}
    grade_counts = Counter(d['classification'] for d in ledger['decisions'])
    ledger['updated'] = DATE
    ledger['title'] = 'Nihaya cumulative adopted textual decisions through Stage X'
    ledger['historicalLedger'] = 'nihaya-adopted-textual-decisions-2026-11-10.json'
    ledger['summary'] = {'textualDecisions': len(ledger['decisions']), 'arabicStringReplacements': sum(len(d['replacements']) for d in ledger['decisions']),
                         'byClassification': dict(grade_counts), 'explicitLaterEditorialEmendations': grade_counts['explicit-later-editor-emendation'] + grade_counts['L1'],
                         'laterEditionReadingsWithoutSpecificVariantFootnote': grade_counts['attested-later-edition-reading-unfootnoted'] + grade_counts['L2'],
                         'stage10LayoutOperations': len(ledger.get('stage10LayoutOperations', []))}
    status = f'136/136 complete local Arabic–English readings; {total}/136 complete external-unit comparisons incorporated after reconciliation with the 1404 printed facsimile and the 1428 edited digital presentation. {136-total} external comparisons remain. Recovered reports and fresh comparisons retain distinct records. No manuscript collation or independent human specialist certification is claimed.'
    book['editorialStatus'].update({'collation': status, 'lastReviewed': DATE, 'completeExternalWitnessComparisons': total,
                                   'adoptedTextualDecisions': len(ledger['decisions']), 'adoptedArabicStringReplacements': ledger['summary']['arabicStringReplacements'],
                                   'adoptedEditorialEmendations': ledger['summary']['explicitLaterEditorialEmendations'],
                                   'adoptedLaterEditionReadingsWithoutVariantFootnote': ledger['summary']['laterEditionReadingsWithoutSpecificVariantFootnote'],
                                   'textualDecisionLedger': '../../audits/nihaya-adopted-textual-decisions-current.json'})
    extra.update({'updated': DATE, 'statusNote': status, 'textualDecisionLedger': '../../audits/nihaya-adopted-textual-decisions-current.json'})
    registry = {'schema':'nihaya-external-comparison-register-v1','updated':DATE,'countingPolicy':'A completed comparison and incorporated findings are separate states. Incorporation records adopted, retained and deferred readings; it does not mean all proposals were adopted.','summary':{'total':136,'compared':total,'incorporated':total,'remaining':136-total},'units':[]}
    rmap = {r['unitID']:r for r in receipt['units']}
    for uid,u in units.items():
        reports = ['audits/nihaya-ix9-external-collation-2026-11-10.json'] if uid=='N-IX-09' else [rmap[uid]['plan']] if uid in rmap else []
        registry['units'].append({'unitID':uid,'comparisonComplete':uid in completed,'findingsIncorporated':uid in completed,
                                  'currentArabicSha256':sha(u['arabic']),'currentEnglishSha256':sha(u['english']),
                                  'evidenceReports':reports,'independentHumanCertification':False,'manuscriptCollation':False})
    triage = read(A/'nihaya-english-collation-triage-2026-11-09.json')
    review = read(A/'cross-book-review-register-2026-11-07.json')
    for r in triage['rows']:
        u=units[r['id']]
        r.update({'title':u['title'],'arabicChars':len(u['arabic']),'englishChars':len(u['english']),
                  'arabicParagraphs':len(u['arabic'].split('\n\n')),'englishParagraphs':len(u['english'].split('\n\n')),
                  'englishToArabicCharRatio':round(len(u['english'])/len(u['arabic']),3)})
        er=r['englishReview'];er.update({'currentArabicSha256':sha(u['arabic']),'currentEnglishSha256':sha(u['english'])})
        if r['id'] in completed:
            er.update({'independentWitnessCollation':True,'externalExpertCertification':False,'sourceGrade':status,
                       'externalComparisonRecord':'nihaya-external-comparison-register.json#'+r['id']})
            if r['id'] in rmap:
                er['externalIntegrationReceipt']='nihaya-stage10-integration-receipt.json#'+r['id']
                er['priorLocalFinding']=er.get('priorLocalFinding',er.get('finding'))
                er['finding']='Complete-unit external review reconciled, with adopted and retained decisions in '+rmap[r['id']]['plan']+'. The exact current Arabic and English hashes are recorded.'
    triage['updated']=DATE
    triage['scope']=status
    triage['methodNote']='Historical local readings remain linked; external comparisons are now counted from the cumulative incorporated-unit register, not from old targeted spot-check totals.'
    triage['summary'].update({'arabicCharacters':sum(len(u['arabic']) for u in units.values()),'englishCharacters':sum(len(u['english']) for u in units.values()),'independentlyReconciledAgainstCompleteSecondWitness':total,'stage10IntegratedUnits':len(receipt['units'])})
    trmap={r['id']:r for r in triage['rows']}
    for r in review['entries']:
        if r['id'] not in units:continue
        u=units[r['id']];t=trmap[r['id']]
        r.update({'title':u['title'],'arabicCharacters':len(u['arabic']),'englishCharacters':len(u['english']),'editorialNotes':len(u['notes']),
                  'supplementalCriticalNoteIds':[n['id'] for n in extra['criticalNotes'] if n['passageId']==r['id']]})
        r['englishCollation'].update({'arabicParagraphs':t['arabicParagraphs'],'englishParagraphs':t['englishParagraphs'],
                                      'independentlyCollated':r['id'] in completed,'externalExpertCertification':False,
                                      'currentArabicSha256':sha(u['arabic']),'currentEnglishSha256':sha(u['english'])})
        if r['id'] in completed:
            r.update({'translationAssessment':'Complete working Arabic–English unit compared with external printed/digital witnesses and findings incorporated; not human specialist-certified or manuscript-collated.',
                      'sourceEditionReviewed':'1404 printed facsimile and 1428 edited digital presentation; exact coverage in external comparison register.',
                      'sourceAssessment':'Completed external-unit comparison; adopted, retained and deferred readings distinguished in the apparatus.',
                      'nextReview':'Independent specialist review, outstanding textual cruxes and separately quoted source works.'})
            r['englishCollation']['sourceGrade']=status
            r['englishCollation']['finding']=t['englishReview']['finding']
    review['summary']['date']=DATE
    review['summary']['N'].update({'englishIndependentlyCollated':total,'completeExternalWitnessUnits':total,
                                  'supplementaryCriticalNotes':len(extra['criticalNotes']),'adoptedTextualDecisions':len(ledger['decisions']),
                                  'adoptedArabicStringReplacements':ledger['summary']['arabicStringReplacements'],
                                  'adoptedPrintedEditorialEmendations':ledger['summary']['explicitLaterEditorialEmendations'],
                                  'adoptedLaterEditionReadings':ledger['summary']['laterEditionReadingsWithoutSpecificVariantFootnote'],
                                  'independentArabicCollationMeaning':f'False denotes no complete whole-work or manuscript collation. {total}/136 units have documented complete printed/digital comparison.'})
    english=['NIHĀYAT AL-ḤIKMA',book['author'],'English working translation · revised 11 November 2026',
             'Coverage: 136/136 reading units, including 130 numbered chapters.',book['editorialStatus']['translationMethod'],status,
             book['editorialStatus']['pagination'],'Authorial notes, translation notes and later editorial apparatus are explicitly distinguished.','']
    stage=None
    stages={str(s['id']):s for s in book['stages']}
    for u in book['units']:
        if u['stage']!=stage:
            stage=u['stage'];english.extend(['',stages[str(stage)]['title'],''])
        source=u['source'];english.extend([u['id']+' · '+u['title'],'Source: '+source['edition']+', p. '+source['page'],source['url'],'',u['english'],''])
        for n in u.get('notes',[]):
            english.extend(['['+n.get('type','note')+'] '+n.get('english',n.get('text','')),''])
    # Preflight all output first; a failed anchor leaves canonical files untouched.
    assert len({n['id'] for n in extra['criticalNotes']})==len(extra['criticalNotes'])
    outputs={book_path:book,extra_path:extra,current_ledger:ledger,receipt_path:receipt,A/'nihaya-external-comparison-register.json':registry,
             A/'nihaya-english-collation-triage-2026-11-09.json':triage,A/'cross-book-review-register-2026-11-07.json':review}
    if args.apply:
        for p,data in outputs.items():dump(p,data)
        (H/'nihayat-al-hikma/data/nihayat-al-hikma-english.txt').write_text('\n'.join(line.rstrip() for line in english).rstrip()+'\n')
    print(json.dumps({'mode':'applied' if args.apply else 'dry-run','newUnits':len(receipts),'newDecisions':len(new_decisions),'cumulative':receipt['summary'],'ledger':ledger['summary'],'outputs':len(outputs)+1},ensure_ascii=False,indent=2))


if __name__=='__main__':
    main()
