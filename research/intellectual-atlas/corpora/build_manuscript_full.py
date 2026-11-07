#!/usr/bin/env python3
"""GNAMMA: import ALL visible bibliographic records in eight Alreq categories.

Source-linked metadata only. Does not request manuscript scans, private pages,
reader material, or whole texts. A category/author association is not an
unqualified commentary or school-doctrine relationship.
"""
import hashlib
import json
from collections import defaultdict, Counter
from pathlib import Path
from datetime import date

from build_manuscript_select import (
    CATEGORIES, download, family_hints, school_from_descriptor, BASE
)

OUT=Path(__file__).resolve().parent / "manuscript-full.json"
LEGAL=("hanafi","maliki","shafii","hanbali")


def main():
    tables,checks={},{}
    for category in CATEGORIES:
        rows,sha=download(category)
        tables[category]=rows
        checks[category]=sha

    # Unique external catalogue IDs within the fetched category descriptions,
    # not assumptions about unique conceptual works across other corpora.
    unique={}
    author_schools=defaultdict(set)
    for category in ("fiqh_hanafi","fiqh_maliki","fiqh_shafii","fiqh_hanbali"):
        school=category.split("_",1)[1]
        for record in tables[category]:
            if record["author_url"]:
                author_schools[record["author_url"]].add(school)

    for category, rows in tables.items():
        genre="fiqh" if category.startswith("fiqh_") else category
        for r in rows:
            id=r["id"]
            if id not in unique:
                unique[id]={
                    "id":id,
                    "title_ar":r["title_ar"],
                    "author_ar":r["author_ar"],
                    "author_url":r["author_url"],
                    "catalogue_url":r["catalogue_url"],
                    "genres":[],
                    "madhhabs":[],
                    "school_evidence":[],
                    "lineages":[],
                    "reported_manuscripts":r["reported_manuscripts"],
                    "reported_entries":r["reported_entries"],
                    "categories":[],
                    "category_urls":[],
                    "dating_status":"undated; no author death year supplied by this category table",
                    "source_kind":"Alreq public manuscript bibliography",
                    "text_acquired":False,
                }
            x=unique[id]
            if genre not in x["genres"]:x["genres"].append(genre)
            if category not in x["categories"]:x["categories"].append(category)
            if r["source_category_url"] not in x["category_urls"]:
                x["category_urls"].append(r["source_category_url"])
            x["reported_manuscripts"]=max(x["reported_manuscripts"],r["reported_manuscripts"])
            x["reported_entries"]=max(x["reported_entries"],r["reported_entries"])
            if category.startswith("fiqh_"):
                school=category.split("_",1)[1]
                if school not in x["madhhabs"]:
                    x["madhhabs"].append(school)
                    x["school_evidence"].append({
                      "school":school,"basis":"catalogue category",
                      "source":r["source_category_url"]
                    })
            if category in ("nahw","sarf","balagha"):
                for hint in family_hints(r,category):
                    line=("grammar:" if category in ("nahw","sarf") else "balagha:")+hint
                    if line not in x["lineages"]:x["lineages"].append(line)

    # Uṣūl is not automatically bound to one madhhab. An author's
    # school epithet/unique catalogue appearance is a qualified lead only.
    for x in unique.values():
        if "usul" not in x["genres"]:
            continue
        if x["madhhabs"]:
            continue
        descriptor=school_from_descriptor(x["author_ar"])
        linked=author_schools.get(x["author_url"],set())
        if descriptor:
            x["madhhabs"]=[descriptor]
            x["school_evidence"]=[{
                "school":descriptor,
                "basis":"author epithet in catalogue, provisional for this work",
                "source":x["catalogue_url"]
            }]
        elif len(linked)==1:
            school=next(iter(linked))
            x["madhhabs"]=[school]
            x["school_evidence"]=[{
                "school":school,
                "basis":"author-URL cross-index, provisional for this uṣūl work",
                "source":x["catalogue_url"]
            }]
        elif len(linked)>1:
            x["school_ambiguity"]="Author appears in multiple legal-school categories; no single-school inference"

    works=sorted(unique.values(),key=lambda x:(x["genres"][0],x["title_ar"],x["id"]))
    total=sum(len(rows) for rows in tables.values())
    genre_counts={g:sum(g in x["genres"] for x in works)
                  for g in ("fiqh","usul","nahw","sarf","balagha")}
    school_counts={
      school:{g:sum(g in x["genres"] and school in x["madhhabs"] for x in works)
              for g in ("fiqh","usul")}
      for school in LEGAL
    }
    counts={
        "public_category_rows":total,
        "distinct_catalogue_ids":len(works),
        "by_genre":genre_counts,
        "by_school":school_counts,
        "usul_unassigned":sum("usul" in x["genres"] and not x["madhhabs"] for x in works),
        "with_grammar_family_keyword":sum(any(t.startswith("grammar:") for t in x["lineages"]) for x in works),
        "with_balagha_strand_keyword":sum(any(t.startswith("balagha:") for t in x["lineages"]) for x in works),
    }
    assert total>=3500 and len(works)>=3300,counts
    for school in LEGAL:
        assert school_counts[school]["fiqh"]>=150
        assert school_counts[school]["usul"]>=25
    assert genre_counts["nahw"]>=750 and genre_counts["balagha"]>=240,counts
    assert all(x["catalogue_url"].startswith(BASE+"/ar/AuthoredBooks/AuthoredBook/")
               and x["genres"] and x["categories"] for x in works)
    assert len({x["id"] for x in works})==len(works)
    out={
      "schema_version":2,
      "title":"GNAMMA Islamic sciences public manuscript bibliography layer",
      "source":"Alreq public category index; externally attributed work-level references",
      "source_url":BASE+"/ar/Categories",
      "snapshot_date":date.today().isoformat(),
      "scope":"Eight publicly displayed book-category lists; full table metadata, not facsimiles, editions or complete Arabic texts",
      "categories":{category:BASE+"/ar/Categories/Category/"+uuid for category,uuid in CATEGORIES.items()},
      "html_sha256":checks,
      "statistics":counts,
      "evidence_policy":[
        "Work links are original catalogue pages; categories are catalogue attributions, not GNAMMA manuscript collations",
        "School classification for fiqh comes from the source category; for uṣūl author epithets/cross-indexes are provisional",
        "Keyword-based grammar and rhetoric family associations are navigational, never commentary/influence edges",
        "Undated catalogue entries are not assigned fictional medieval dates; recorded manuscript counts are unverified",
        "Same catalogue ID across category lists is one record; duplicates with OpenITI not asserted to be distinct conceptual works",
        "No full texts or third-party images were acquired"
      ],
      "works":works,
    }
    OUT.write_text(json.dumps(out,ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf8")
    print(json.dumps(counts,ensure_ascii=False,indent=2),flush=True)
    print("FULL BIBLIOGRAPHY",OUT,OUT.stat().st_size,"bytes",flush=True)


if __name__=="__main__":
    main()
