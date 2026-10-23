#!/usr/bin/env python3
"""Compare 20 genuine jurisprudential terms against two contextual BERT indexes.

This is a reversible *shadow* experiment: count precisely where Gnamma's
sourced dictionary could repair a missing root or flag a misleading model
analysis, without editing the model or the deployed reader.

Example:
 python3 daruri/build/pilot_20_technical_terms.py \
  --daruri /private/morph-daruri-v1.json \
  --mustasfa /private/morph-mustasfa-v1.json \
  --out-dir /private/pilot20
"""
from __future__ import annotations
import argparse
import copy
import csv
import json
from collections import Counter, defaultdict
from pathlib import Path

from build_gnamma_morph_index import fold, words, load_sources, normalize_model_root
from propose_dictionary_morphology import sourced_lexicon, clitic_supported

ROOT = Path(__file__).resolve().parents[2]
TERMS = (
    "qiyās", "ʿilla", "ḥukm", "aṣl", "farʿ",
    "wājib", "ʿāmm", "khāṣṣ", "naṣṣ", "dalāla",
    "ẓāhir", "ijmāʿ", "ijtihād", "istiḥsān", "istiṣḥāb",
    "naskh", "nahy", "sharʿ", "khiṭāb", "bayān",
)
PROBES = ("بعض", "بعد", "الأمر", "الشارع", "تتبين", "إن")
NONPRIMARY = {"contextual-alternative", "contextual-backoff", "ambiguous"}


def partial_root_ok(raw: str, proposed: str) -> bool:
    """Reject proposals contradicted by known model consonants."""
    raw = str(raw or "")
    if not raw:
        return True  # Suggest only, no corroborating skeleton.
    if "#" not in raw:
        return not normalize_model_root(raw) or fold(normalize_model_root(raw)) == fold(proposed)
    units = raw.split(".")
    letters = fold(proposed)
    return len(units) == len(letters) and all(
        ch == "#" or fold(ch) == expected for ch, expected in zip(units, letters))


def sample(work: str, index: dict, source: dict[str, str],
           registry: dict, lexicon: dict) -> tuple[dict, dict]:
    if index.get("work") != work or index.get("schema") != "gnamma-morph-v1" or not index.get("contextual"):
        raise ValueError("Input is not a model-generated source-linked index for " + work)
    stats = {t: Counter() for t in TERMS}
    examples = {t: [] for t in TERMS}
    observed = {t: set() for t in TERMS}
    probes = {surface: Counter() for surface in PROBES}
    matched_locations = set()
    shadow_overlays: dict[tuple[str, int], dict] = {}
    for record in index.get("records", []):
        loc = record.get("id")
        if loc not in source:
            raise ValueError("Missing canonical text " + str(loc))
        tokens = words(source[loc])
        by_pos = defaultdict(list)
        for a in record.get("a", []):
            if not isinstance(a, list) or len(a) < 6:
                raise ValueError("Malformed analysis")
            i = a[0]
            if not isinstance(i, int) or not 0 <= i < len(tokens) or fold(tokens[i]) != fold(a[1]):
                raise ValueError(f"Source word drift at {loc}:{i}")
            by_pos[i].append(a)
        for i, surface in enumerate(tokens):
            analyses = by_pos.get(i, [])
            top = [a for a in analyses if a[5] not in NONPRIMARY]
            if len(top) > 1:
                raise ValueError(f"Multiple model top analyses at {loc}:{i}")
            primary = top[0] if top else None
            if surface in probes:
                x = probes[surface]
                x["occur"] += 1
                if not primary:
                    x["model_omitted"] += 1
                else:
                    key = fold(primary[2]) + "/" + fold(primary[3])
                    x["reading:" + key] += 1
                    if len(x) < 25:
                        x["example_id:" + loc + ":" + str(i)] += 1
            lexical_candidates = [
                e for e in lexicon.get(fold(surface), [])
                if e["term"] in stats and clitic_supported(surface, e, primary)
            ]
            for term in set(e["term"] for e in lexical_candidates):
                candidates = [e for e in lexical_candidates if e["term"] == term]
                if not candidates:
                    continue
                e = candidates[0]
                stat = stats[term]
                stat["matched"] += 1
                matched_locations.add((work,loc,i))
                observed[term].add(surface)
                if not primary:
                    stat["no_model_primary"] += 1
                    result = "model missing";why = "Human review required"
                else:
                    lemma = fold(primary[2]); root = fold(primary[3]); dict_lemma = fold(e["lemma"])
                    dict_root = e["root"]
                    if lemma == dict_lemma:
                        stat["same_dictionary_lemma"] += 1
                    elif e["match"] == "headword":
                        stat["headword_disagreement"] += 1
                    if root:
                        if root == dict_root:
                            stat["already_compatible_root"] += 1
                            result = "root present"; why = "Sense still unverified"
                        else:
                            stat["root_disagreement"] += 1
                            result = "root differs"; why = "Manual examination only"
                    elif dict_root:
                        stat["missing_model_root"] += 1
                        features = primary[7] if len(primary)>7 and isinstance(primary[7],dict) else {}
                        raw_root = features.get("raw_root","")
                        if partial_root_ok(raw_root,dict_root):
                            stat["dictionary_root_proposal"] += 1
                            result = "provisional root proposal"
                            why = ("Supported partial radicals; not gold" if raw_root else
                                   "Headword only; not gold")
                        else:
                            stat["incompatible_model_radicals"] += 1
                            result = "cannot propose root"
                            why = "Model root consonant skeleton contradicts dictionary"
                    else:
                        result="no dictionary root"; why="Need lexical evidence"
                # Test an actual, narrowly constrained repair in a SHADOW
                # overlay: only the identical indexed lemma, an absent root,
                # and a lexicon root compatible with the model's radicals.
                # Deliberately do not change the original BERT candidates.
                if primary and not fold(primary[3]) and e["root"] and fold(primary[2]) == fold(e["lemma"]):
                    feature = primary[7] if len(primary)>7 and isinstance(primary[7],dict) else {}
                    if partial_root_ok(feature.get("raw_root",""),e["root"]):
                        possible_roots = {candidate["root"] for candidate in lexical_candidates
                            if candidate["root"]}
                        if len(possible_roots) == 1:
                            key=(loc,i)
                            shadow_overlays[key] = {
                              "work":work, "passage_id":loc,"token_position":i,
                              "surface":surface,"model_lemma":primary[2],
                              "root_before":"","proposed_root":e["root"],
                              "source_term":term,
                              "sources":"; ".join(src["id"] for src in e["sources"]),
                              "root_basis":("partial-morphological-radicals" if feature.get("raw_root") else
                                 "dictionary-headword-only"),
                              "review_status":"UNVERIFIED PROPOSAL",
                              "reviewer":"","approved":""}
                            stat["eligible_shadow_proposals"] += 1
                        else:
                            stat["ambiguous_dictionary_roots_withheld"] += 1
                if len(examples[term]) < 3:
                    context = " ".join(tokens[max(0,i-7):min(len(tokens),i+8)])
                    example = {
                        "work":work,"passage_id":loc,"ordinal":i,"surface":surface,
                        "context":context,"model_lemma":primary[2] if primary else "",
                        "model_root":primary[3] if primary else "",
                        "model_gloss":(primary[7].get("gloss","") if primary and len(primary)>7 and
                            isinstance(primary[7],dict) else ""),
                        "dictionary_lemma":e["lemma"],"proposed_root":e["root"],
                        "result":result,"qualification":why,
                        "source_ids":[src["id"] for src in e["sources"]],
                        "source_dates":e["chronology"]
                    }
                    examples[term].append(example)
    return {
      "stats":{t:dict(c) for t,c in stats.items()},
      "examples":examples,
      "observed_forms":{t:sorted(formset) for t,formset in observed.items()},
      "shadow_overlays":list(shadow_overlays.values()),
      "unique_matches":len(matched_locations),
    }, {x:dict(counter) for x,counter in probes.items()}


def report(result: dict, dictionary: dict, out: Path) -> dict:
    out.mkdir(parents=True,exist_ok=True)
    rows = []
    for term in TERMS:
        entry=dictionary["terms"][term]
        a=result["books"]["daruri"]["stats"][term]
        b=result["books"]["mustasfa"]["stats"][term]
        src=[dictionary["sources"].get(s,{}) for s in entry.get("sources",[]) if s in dictionary["sources"]]
        citations="; ".join(f'{x.get("author","")}: {x.get("work","")}' for x in src[:3])
        r={"term":term,"headword":entry.get("lemma",""),
           "dictionary_root":entry.get("root",""),
           "daruri_occurrences":a.get("matched",0),
           "mustasfa_occurrences":b.get("matched",0),
           "model_missing_root":a.get("missing_model_root",0)+b.get("missing_model_root",0),
           "dictionary_root_proposals":a.get("dictionary_root_proposal",0)+b.get("dictionary_root_proposal",0),
           "eligible_shadow_root_proposals":a.get("eligible_shadow_proposals",0)+b.get("eligible_shadow_proposals",0),
           "existing_model_root_matches":a.get("already_compatible_root",0)+b.get("already_compatible_root",0),
           "root_disagreements":a.get("root_disagreement",0)+b.get("root_disagreement",0),
           "lemma_disagreements_at_headword":a.get("headword_disagreement",0)+b.get("headword_disagreement",0),
           "no_model_primary":a.get("no_model_primary",0)+b.get("no_model_primary",0),
           "source_evidence":citations,
           "example_daruri":next((x["context"] for x in result["books"]["daruri"]["examples"][term]),""),
           "example_mustasfa":next((x["context"] for x in result["books"]["mustasfa"]["examples"][term]),""),
           "review_status":"NOT REVIEWED",
           "reviewed_lemma":"","reviewed_root":"","reviewed_sense":"","reviewer":""}
        rows.append(r)
    fields=list(rows[0])
    patches=[p for book in ("daruri","mustasfa") for p in result["books"][book]["shadow_overlays"]]
    if len({(p["work"],p["passage_id"],p["token_position"]) for p in patches})!=len(patches):
        raise ValueError("Ambiguous shadow overlay source position")
    with (out/"20-terms-shadow-root-proposals.csv").open(
          "w",encoding="utf-8-sig",newline="") as handle:
        w=csv.DictWriter(handle,fieldnames=list(patches[0]) if patches else
          ["work","passage_id","token_position","surface","proposed_root"])
        w.writeheader();w.writerows(patches)
    with (out/"20-terms-comparison.csv").open("w",encoding="utf-8-sig",newline="") as handle:
        w=csv.DictWriter(handle,fieldnames=fields);w.writeheader();w.writerows(rows)
    totals={key:sum(row[key] for row in rows) for key in (
       "daruri_occurrences","mustasfa_occurrences","model_missing_root",
       "dictionary_root_proposals","eligible_shadow_root_proposals",
       "existing_model_root_matches",
       "root_disagreements","lemma_disagreements_at_headword","no_model_primary")}
    summary={"terms":len(rows),"totals":totals,
      "scope":"20 sourced technical entries, exact word/alias and analyzer-supported clitics",
      "method":"No model changes. Count compatible dictionary root as a provisional proposal, not a correction.",
      "shadow_overlay_count":len(patches),
      "limitations":[
        "Not an independent reviewed gold set: improvements are coverage proposals, not proven accuracy.",
        "Later dictionary definitions cannot automatically be attributed to medieval authors.",
        "Root suggestions cannot fix technical lexical senses or missing morphological candidates.",
        "No model output or public website index was overwritten."],
      "books":result["books"],"adversarial_word_readings":result["probes"]}
    (out/"20-terms-results.json").write_text(
       json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    lines=["# 20-term Gnamma technical dictionary pilot",
       "",
       "**Source-based shadow experiment. No changes to published morphology.**",
       "",
       "| Headword | Darūrī hits | Mustaṣfā hits | Blank model roots | Shadow-repair candidates | Existing compatible roots |",
       "|---|---:|---:|---:|---:|---:|"]
    for r in rows:
        lines.append(f'| {r["headword"]} | {r["daruri_occurrences"]} | {r["mustasfa_occurrences"]} | '
           f'{r["model_missing_root"]} | {r["eligible_shadow_root_proposals"]} | '
           f'{r["existing_model_root_matches"]} |')
    lines+=["","**These counts measure possible coverage repair, not grammatical accuracy.**",
       "",f'Aggregated: {totals}.',"",
       "## Evidence and limitations",
       "* Each proposal retains source paragraph/token coordinates and dictionary work/author identifiers in the JSON/CSV.",
       "* A shadow root proposal requires a SOURCE-ALIGNED primary model reading, identical dictionary lemma, unique dictionary root, and compatible radical skeleton where present.",
       "* Shadow root overlay entries are separate CSV records with review fields intentionally blank.",
       "* No automatic replacement of a model reading, technical sense or translated gloss is authorized.",
       "* Ambiguous homographs, speculative prefixes and competing lexical interpretations need reviewer adjudication.",
       "* An independent held-out classical Arabic evaluation is necessary before release.",
       "",
       "## Adversarial words not fixed by a technical headword list",
       "| Word | Darūrī occurrences | Mustaṣfā occurrences |",
       "|---|---:|---:|"]
    for w in PROBES:
        a=result["probes"]["daruri"][w].get("occur",0)
        b=result["probes"]["mustasfa"][w].get("occur",0)
        lines.append(f"| {w} | {a} | {b} |")
    (out/"20-terms-report.md").write_text("\n".join(lines)+"\n",encoding="utf-8")
    return summary


def main():
    cli=argparse.ArgumentParser()
    cli.add_argument("--daruri",type=Path,required=True)
    cli.add_argument("--mustasfa",type=Path,required=True)
    cli.add_argument("--dictionary",type=Path,default=ROOT/"daruri/dictionary-data.json")
    cli.add_argument("--out-dir",type=Path,required=True)
    args=cli.parse_args()
    registry=json.loads(args.dictionary.read_text(encoding="utf-8"))
    if len(TERMS)!=20 or len(set(TERMS))!=20:
        raise ValueError("Pilot requires exactly twenty distinct terms")
    for t in TERMS:
        if t not in registry.get("terms",{}):
            raise ValueError("Unknown sourced technical term: "+t)
    lookup=sourced_lexicon(registry)
    sources=load_sources()
    result={"books":{},"probes":{}}
    for work,path in [("daruri",args.daruri),("mustasfa",args.mustasfa)]:
        index=json.loads(path.read_text(encoding="utf-8"))
        before=copy.deepcopy(index)
        result["books"][work],result["probes"][work]=sample(
            work,index,dict(sources[work]),registry,lookup)
        if index!=before:
            raise AssertionError("The test must not mutate AI analyses")
    summary=report(result,registry,args.out_dir)
    print(json.dumps(summary["totals"],indent=2))
    print("20-term trial complete; originals and live website unchanged.")


if __name__=="__main__":
    main()
