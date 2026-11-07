#!/usr/bin/env python3
"""Select a bounded, linked bibliographic SAMPLE from public Alreq category pages.

Not a bulk mirror of the site and not manuscript/full-text acquisition. This
script reads only eight publicly rendered category tables. It never logs in,
bypasses access controls, fetches facsimiles, or represents listings as texts.
Copyright and database rights remain with their owners. Each selected record
links to its original catalogue page; no catalogue images or work content are copied.
"""
import hashlib
import json
import re
import urllib.request
from collections import defaultdict, Counter
from datetime import date
from pathlib import Path
from urllib.parse import urljoin
from bs4 import BeautifulSoup

OUT = Path(__file__).resolve().parent / "manuscript-shortlist.json"
BASE = "https://app.alreq.com"
CATEGORIES = {
    "fiqh_hanafi": "acd46fee-f542-4f08-6c77-08d67d8a208a",
    "fiqh_maliki": "74b62fc2-b16b-461c-6c78-08d67d8a208a",
    "fiqh_shafii": "5922d077-e8d0-4608-6c79-08d67d8a208a",
    "fiqh_hanbali": "f6d7dc4f-b531-4b53-6c7a-08d67d8a208a",
    "usul": "e118d410-c0f9-4e8d-6c7c-08d67d8a208a",
    "nahw": "3b74e894-2e5a-486f-3d43-08d79e7d278b",
    "sarf": "d0e58c8c-0fce-449b-c34f-08d7a2ae1677",
    "balagha": "2f18127e-8fed-4355-bfd5-08d68928d1ed",
}
# These are text-family SEARCH INDICATORS, not asserted commentary arrows.
GRAMMAR_FAMILIES = {
    "sibawayh": ("سيبويه", "الكتاب لسيبويه", "الكتاب لسيب"),
    "alfiyya": ("الألفية", "الفية", "ألفية", "ابن مالك"),
    "ajurrumiyya": ("الأجرومية", "الآجرومية", "الاجرومية", "الآجروم"),
    "mufassal": ("المفصل", "المفصّل"),
    "kafiya_shafiya": ("الكافية", "الشافية"),
    "egyptian_syntax": ("ابن هشام", "قطر الندى", "مغني اللبيب", "شذور الذهب"),
    "early_disagreements": ("البصريين", "الكوفيين", "الإنصاف", "الخلاف", "الفراء", "الكسائي"),
}
BALAGHA_ROUTES = {
    "badi_adab": ("البديع", "الصناعتين", "نقد", "الشعر", "الأدب", "البلاغة"),
    "nazm_ijaz": ("الإعجاز", "الاعجاز", "النظم", "الاستعارة", "الكناية", "دلائل", "أسرار البلاغة"),
    "miftah_talkhis": ("المفتاح", "التلخيص", "المطول", "المختصر", "السبكي", "السكاكي", "التفتازاني", "القزويني"),
    "maghribi_literary": ("القرطاجني", "السجلماسي", "المغربي", "القيرواني", "الأندلسي", "المراكشي"),
}


def fold(s):
    return re.sub(r"[\u064b-\u065f\u0670\u0640]", "", str(s or "")).replace("أ", "ا").replace("إ", "ا").replace("آ", "ا").strip()


def num(s):
    try:
        return max(0, int(str(s or "0").replace(",", "")))
    except ValueError:
        return 0


def normalize(s):
    return re.sub(r"\s+", " ", fold(s)).strip()


def top(records, limit):
    # The count of independently catalogued manuscript items is an
    # acquisition-priority signal, NOT a scholarly quality ranking.
    chosen, seen = [], set()
    for r in sorted(records, key=lambda x: (
            -min(x["reported_manuscripts"], 120),
            -min(x["reported_entries"], 80),
            len(x["title_ar"]), x["title_ar"])):
        if r["id"] in seen:
            continue
        if not r["title_ar"] or r["title_ar"] in ("رسالة", "حاشية", "كتاب"):
            continue
        chosen.append(r)
        seen.add(r["id"])
        if len(chosen) >= limit:
            break
    return chosen


def download(cat):
    url = BASE + "/ar/Categories/Category/" + CATEGORIES[cat]
    req = urllib.request.Request(url, headers={"User-Agent": "GNAMMA-Academic-Catalogue/1.0 (metadata only)"})
    with urllib.request.urlopen(req, timeout=90) as response:
        data = response.read()
    dom = BeautifulSoup(data, "html.parser")
    rows = dom.select("table tbody tr")
    if len(rows) < 30:
        raise ValueError(f"Public table unexpectedly inaccessible for {cat}: {len(rows)} rows")
    result = []
    for tr in rows:
        td = tr.find_all("td", recursive=False)
        if len(td) < 5:
            continue
        anchor = td[1].find("a", href=True)
        if not anchor:
            continue
        book_url = urljoin(BASE, anchor["href"])
        author_link = td[2].find("a", href=True)
        author_url = urljoin(BASE, author_link["href"]) if author_link else ""
        uuid = book_url.rsplit("/", 1)[-1]
        result.append({
            "id": "alreq_" + uuid,
            "title_ar": normalize(td[1].get_text(" ", strip=True)),
            "author_ar": normalize(td[2].get_text(" ", strip=True)),
            "author_url": author_url,
            "catalogue_url": book_url,
            "reported_entries": num(td[3].get_text(" ", strip=True)),
            "reported_manuscripts": num(td[4].get_text(" ", strip=True)),
            "source_category": cat,
            "source_category_url": url,
        })
    print("ALREQ TABLE", cat, len(result), "public entries")
    return result, hashlib.sha256(data).hexdigest()


def family_hints(work, category):
    text = fold(work["title_ar"] + " " + work["author_ar"])
    options = GRAMMAR_FAMILIES if category in ("nahw", "sarf") else BALAGHA_ROUTES
    return [key for key, words in options.items() if any(fold(q) in text for q in words)]


def school_from_descriptor(author):
    name = fold(author)
    markers = {"hanafi": ("الحنفي", "الحنفية"), "maliki": ("المالكي", "المالكية"),
               "shafii": ("الشافعي", "الشافعية"), "hanbali": ("الحنبلي", "الحنابلة")}
    hits = [k for k, words in markers.items() if any(fold(w) in name for w in words)]
    return hits[0] if len(hits) == 1 else ""


def main():
    tables, hashes = {}, {}
    for category in CATEGORIES:
        tables[category], hashes[category] = download(category)
    # Compare the stable *author URL* with school-specific legal collections.
    # This author-based cross-index does not prove an individual uṣūl doctrine.
    authors = defaultdict(set)
    for cat in list(CATEGORIES)[:4]:
        school = cat.split("_")[-1]
        for x in tables[cat]:
            if x["author_url"]:
                authors[x["author_url"]].add(school)
    chosen, selected = [], set()

    def push(work, category, school="", label="", reason=""):
        # One catalogue work may appear in multiple categories. Do not duplicate
        # its bibliographical entity; accumulate category memberships instead.
        w = dict(work)
        w["genres"] = [("fiqh" if category.startswith("fiqh_") else category)]
        w["school"] = school
        w["school_evidence"] = reason
        w["lineages"] = family_hints(w, category) if category in ("nahw", "sarf", "balagha") else []
        w["reading_status"] = "manuscript catalogue only; no text or scan acquired"
        w["provenance"] = "Publicly visible Alreq category table, sampled by manuscript count"
        w["reception_label_status"] = "search route only; not an evidenced historical edge"
        if w["id"] in selected:
            old = next(x for x in chosen if x["id"] == w["id"])
            old["genres"] = list(dict.fromkeys(old["genres"] + w["genres"]))
            old["lineages"] = list(dict.fromkeys(old["lineages"] + w["lineages"]))
            return
        selected.add(w["id"])
        chosen.append(w)

    for cat in ("fiqh_hanafi", "fiqh_maliki", "fiqh_shafii", "fiqh_hanbali"):
        school = cat.split("_")[-1]
        for w in top(tables[cat], 40):
            push(w, cat, school, "fiqh",
                 f"Catalogue work classified under {school} fiqh")
    usul_schools = defaultdict(list)
    no_school = []
    for x in tables["usul"]:
        descriptor = school_from_descriptor(x["author_ar"])
        previous = authors.get(x["author_url"], set())
        school = descriptor or (next(iter(previous)) if len(previous) == 1 else "")
        if school:
            reason = ("Author school epithet in catalogue" if descriptor
                      else "Author URL cross-indexed uniquely in catalogue's fiqh school collections")
            item = dict(x)
            item["school_evidence"] = reason
            usul_schools[school].append(item)
        else:
            no_school.append(x)
    for school in ("hanafi", "maliki", "shafii", "hanbali"):
        for x in top(usul_schools[school], 40):
            push(x, "usul", school, "usul", x["school_evidence"])
    # The uncategorised remainder is important, especially for the
    # mutakallimin/fuqaha/mixed methodological traditions.
    for x in top(no_school, 65):
        push(x, "usul", "", "usul",
             "No single defensible author-school assignment in these catalogued records")
    # Grammar and morphology: distinct works, several nominal commentarial
    # families; no spurious Basra/Kufa classification by title alone.
    for x in top(tables["nahw"], 160):
        push(x, "nahw")
    for x in top(tables["sarf"], 60):
        push(x, "sarf")
    # Balagha covers different disciplines (ma'ani/bayan/badi') and
    # historical routes; spread 120 records across identified patterns.
    rhetoric = tables["balagha"]
    chosen_rhet = []
    for route in BALAGHA_ROUTES:
        candidates = [x for x in rhetoric if route in family_hints(x, "balagha")]
        chosen_rhet += top(candidates, 30)
    taken = {w["id"] for w in chosen_rhet}
    chosen_rhet += top([x for x in rhetoric if x["id"] not in taken], max(0, 120 - len(taken)))
    for x in chosen_rhet:
        push(x, "balagha")

    chosen.sort(key=lambda x: (x["genres"][0], x["school"], -x["reported_manuscripts"], x["title_ar"]))
    counts = {
        "by_genre": {g: sum(g in x["genres"] for x in chosen)
                     for g in ("fiqh", "usul", "nahw", "sarf", "balagha")},
        "by_school": {
            school: {
                "fiqh": sum("fiqh" in x["genres"] and x["school"] == school for x in chosen),
                "usul": sum("usul" in x["genres"] and x["school"] == school for x in chosen),
            } for school in ("hanafi", "maliki", "shafii", "hanbali")
        },
        "unassigned_usul": sum("usul" in x["genres"] and not x["school"] for x in chosen),
        "unique_bibliographic_records": len(chosen),
        "candidate_duplicates_across_sources": "not yet automatically reconciled with OpenITI work authorities",
    }
    out = {
        "schema_version": 1,
        "catalogue": "Alreq publicly visible manuscript-bibliography category pages",
        "source_home": BASE + "/ar/Categories",
        "access_and_rights": "Bibliographical metadata excerpt with explicit source links. No manuscript images, subscription content, private records, or full texts are redistributed. Source rights remain with their owners.",
        "snapshot_date": str(date.today()),
        "selection": "Capped illustrative research bibliography: 40 sampled fiqh works per legal school; up to 40 uṣūl per defensibly identified school; 160 naḥw + 60 ṣarf; around 120 balāgha. Priority uses number of manuscript entries, not automatic scholarly rank.",
        "cautions": [
            "Catalogue manuscript numbers are source-reported, not independently checked against holdings.",
            "School label on a fiqh item refers to the catalogue category, never an author's timeless settled ruling.",
            "School label on uṣūl items can come from an author's school epithet or unique author-level crossindex and must be reviewed separately.",
            "Grammar and rhetoric family hints are title and author keyword navigation, not verified commentary edges.",
            "A manuscript catalogue record does not grant access to a scan or an editable full text.",
            "The sample is not exhaustive; unselected manuscripts remain at the source catalogue, and duplicates with OpenITI require reconciliation.",
        ],
        "source_category_urls": {
            cat: BASE + "/ar/Categories/Category/" + uuid for cat, uuid in CATEGORIES.items()
        },
        "response_sha256": hashes,
        "source_category_totals": {cat: len(rows) for cat, rows in tables.items()},
        "statistics": counts,
        "works": chosen,
    }
    if counts["by_genre"]["fiqh"] < 140 or counts["by_genre"]["nahw"] < 150 or counts["by_genre"]["balagha"] < 100:
        raise RuntimeError("Selection unexpectedly incomplete: " + json.dumps(counts))
    OUT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf8")
    print(json.dumps(counts, ensure_ascii=False, indent=2))
    print("WROTE", OUT, OUT.stat().st_size, "bytes")


if __name__ == "__main__":
    main()
