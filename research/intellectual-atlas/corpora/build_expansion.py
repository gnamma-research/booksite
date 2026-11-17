#!/usr/bin/env python3
"""Reproducible OpenITI bibliographic discovery, NOT critical source collation.

Input: exact 2025-1-9 release metadata at the pinned RELEASE Git commit.
Output: one record per Arabic work, with a primary-version locator and explicit
machine-classification evidence. School and lineage labels are provisional and
never imply an author's agreement with the contents of another book.
"""
import csv
import hashlib
import io
import json
import re
import sys
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
SOURCE_COMMIT = "cfc4157a3cf2054c0888f133970a4eaa3e22e58c"
METADATA_BLOB = "bbe2503166ebb3100d5de2afba1dffc7a5e3718d"
METADATA = (
    "https://raw.githubusercontent.com/OpenITI/RELEASE/" + SOURCE_COMMIT +
    "/metadata/OpenITI_metadata_2025-1-9.tsv"
)
OUT = HERE / "expanded-bibliography.json"
LICENSE = "CC BY-NC-SA 4.0"
SCHOOLS = {
    "hanafi": ("الفقه الحنفي", "فقه حنفي", "فقه المذهب الحنفي"),
    "maliki": ("الفقه المالكي", "فقه مالكي", "فقه المذهب المالكي"),
    "shafii": ("الفقه الشافعي", "فقه شافعي", "فقه المذهب الشافعي"),
    "hanbali": ("الفقه الحنبلي", "فقه حنبلي", "فقه المذهب الحنبلي"),
}
# Interpretive *reception routes* on scholar records; never a claim that
# every work written by the scholar follows all positions of a grammar school.
GRAMMAR_LINEAGES = {
    "basran": ("KhalilFarahidi", "Sibawayhi", "Akhfash", "Mubarrad",
               "IbnSarrajNahwi", "IbnAhmadFarisi", "AbuSacidSirafi"),
    "kufan": ("Kisai", "Farra", "Thaclab", "IbnSikkit", "IbnDurayd"),
    "baghdadi": ("IbnJinni", "AbuHasanRummani", "IbnWarraq", "Zajjaji",
                 "Anbari", "AbuCaliFarisi", "IbnYacish"),
    "andalusi_maghribi": ("IbnCasfur", "IbnMalik", "IbnAjrum", "AbuHayyan",
                           "IbnMada", "Jazuli", "Suhayli", "Shatibi", "IbnHajib"),
    "egyptian_syrian": ("IbnHisham", "IbnCaqil", "Suyuti", "KhalidAzhari",
                        "Ashmuni", "Sabbani", "IbnNathim", "Muradi", "IbnJamac"),
    "later_commentarial": ("RadiAstarabadi", "Birgivi", "Jami", "Siyalkuti",
                           "Hariri", "Shurunbulali", "Khudari", "Kafawi"),
}
BALAGHA_LINEAGES = {
    "adab_badi": ("Jahiz", "IbnMutazz", "AbuHilal", "IbnRashiq",
                  "IbnAthir", "IbnAbiIsbac", "QudamaIbnJacfar", "IbnTabataba"),
    "nazm_ijaz": ("CabdQahirJurjani", "Baqillani", "AbuHasanRummani",
                  "Khattabi", "AbuSulaymanKhattabi"),
    "miftah_talkhis": ("Sakkaki", "Qazwini", "Taftazani", "BahaDinSubki",
                       "Idji", "Siyalkuti", "Dasuqi", "Karmani", "Isam"),
    "andalusi_maghribi": ("HazimQartajanni", "Sijilmasi", "IbnRashiq",
                           "IbnBanna", "IbnBassam"),
    "later_didactic": ("Suyuti", "Hashimi", "Maraghi", "Taftazani",
                       "Shawkani", "MuhammadAbuMusa"),
}


def fold(s):
    s = str(s or "").replace("ـ", "")
    s = re.sub(r"[\u064b-\u065f\u0670]", "", s)
    return s.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا").lower()


def one(s):
    return (s or "").split("::")[0].strip()


def positive_int(s):
    try:
        return max(0, int(s or "0"))
    except (ValueError, TypeError):
        return 0


def evidence_school(tags):
    found = []
    for school, phrases in SCHOOLS.items():
        hits = [t for t in tags if any(fold(q) in fold(t) for q in phrases)]
        if hits:
            found.append((school, hits[0]))
    if len(found) == 1:
        return found[0][0], "OpenITI category: " + found[0][1]
    return "", ""


def detect_disciplines(row):
    tags = [t.strip() for t in (row.get("tags") or "").split("::") if t.strip()]
    ts = " ".join(tags)
    title = fold(row.get("title_ar", ""))
    genres = []
    rationales = {}
    def add(genre, proof):
        if genre not in genres:
            genres.append(genre)
            rationales[genre] = proof
    school, school_proof = evidence_school(tags)
    if school:
        add("fiqh", school_proof)
    # Tags represent inherited digital-corpus classification, not verified
    # contents. Avoid classifying kalam texts called "al-Fiqh al-Akbar" as furu'.
    generic_fiqh = "_FIQH" in tags or "GAL@fiqh" in tags
    creed = any(p in title for p in ("الفقه الاكبر", "الفقه الابسط", "اصول الدين", "العقيده", "الاعتقاد"))
    if generic_fiqh and not creed:
        add("fiqh", "_FIQH / GAL@fiqh source tags")
    usul_tags = [t for t in tags if "أصول الفقه" in t or "اصول الفقه" in t or
                 "كتب أصول الفقه" in t or "مسائل أصولية" in t]
    title_usul = any(q in title for q in (
        "اصول الفقه", "الورقات", "جمع الجوامع", "البرهان في اصول",
        "المستصفى", "المنخول", "المحصول", "اللمع في اصول",
        "كشف الاسرار", "تقويم الادله", "التمهيد في اصول",
        "روضة الناظر", "شرح الكوكب المنير", "موافقات الشاطبي",
        "الارشته", "تنقيح الفصول", "توضيح الاصول",
        "مراقي السعود", "الموافقات", "الوجيز في اصول", "الاشارة في اصول",
    ))
    if usul_tags or (title_usul and not creed):
        add("usul", usul_tags[0] if usul_tags else "Title identifies legal theory")
    grammar_tags = [t for t in tags if t in ("_NAHW", "_SARF") or
                    "النحو والصرف" in t or "كتب النحو" in t]
    title_nahw = any(p in title for p in (
        "في النحو", "النحو ", "النحوي", "اعرب", "الاعراب", "اعراب",
        "الالفية", "الاجرو", "قطر الندى", "مغني اللبيب", "شرح المفصل",
        "شرح الكافية", "لباب الاعراب", "حروف المعاني", "عمل الحروف",
        "شرح الشافية", "المقتضب", "كتاب سيبويه", "علل النحو",
    ))
    title_sarf = any(p in title for p in (
        "التصريف", "في الصرف", "الصرف", "ابنيه", "بنية الكلمه",
        "المقصود", "الشافية", "الاشتقاق", "التصريف العزي",
    ))
    if grammar_tags or title_nahw:
        add("nahw", grammar_tags[0] if grammar_tags else "Grammar indicator in work title")
    if grammar_tags or title_sarf:
        add("sarf", grammar_tags[0] if grammar_tags else "Morphology indicator in work title")
    rhetoric_tags = [t for t in tags if t == "_BALAGHA" or
                     "البلاغة والفصاحة" in t or "الأدب والبلاغة" in t]
    rhetoric_title = any(p in title for p in (
        "البلاغه", "البديع", "البيان", "المعاني", "اعجاز",
        "المفتاح", "التلخيص", "المطول", "المثل السائر",
        "اسرار البلاغه", "دلالل الاعجاز", "دلائل الاعجاز",
        "الصناعتين", "علم الاستعاره", "الاستعاره والكنايه",
        "نقد الشعر", "نظم القران", "شرح التلخيص",
    ))
    non_treatise = (
        title.startswith(("ديوان", "منتخبات", "قصائد", "الاصمعيات", "المفضليات"))
        or "GAL@period-premuhammad" in ts
    )
    if (rhetoric_tags or rhetoric_title) and not non_treatise:
        add("balagha", rhetoric_tags[0] if rhetoric_tags else "Rhetoric indicator in title")
    if any(q in title for q in ("معجم", "قاموس", "المعاجم", "لسان العرب", "القاموس المحيط")):
        add("lugha", "Lexicon indicator in title")
    return genres, rationales, school, school_proof


def book_record(row, genres, proofs, school, school_proof, author_school):
    uri = row["book"]
    version = row["version_uri"]
    local_path = row.get("local_path", "").strip()
    # Work-level scholarly association is a weaker cue than text-category label.
    school_source = "text metadata category" if school else ""
    if not school and "usul" in genres and author_school:
        school = author_school
        school_source = "author-level metadata from another legal work; review work's own school context"
    author_uri = uri.split(".", 1)[0]
    lineages = []
    if any(g in genres for g in ("nahw", "sarf")):
        lineages += ["grammar:" + label for label, cues in GRAMMAR_LINEAGES.items()
                     if any(cue.lower() in author_uri.lower() for cue in cues)]
    if "balagha" in genres:
        lineages += ["balagha:" + label for label, cues in BALAGHA_LINEAGES.items()
                     if any(cue.lower() in author_uri.lower() for cue in cues)]
    # Without an explicit author signal, a text is unassigned, never dropped.
    title = one(row.get("title_ar", "")) or row.get("title_lat") or uri.split(".")[-1]
    author = one(row.get("author_ar")) or one(row.get("author_lat")) or author_uri
    death = positive_int(row.get("date")) or positive_int(uri[:4])
    source = "https://github.com/OpenITI/RELEASE/blob/" + SOURCE_COMMIT + "/" + local_path
    return {
        "id": "oi_" + re.sub(r"[^A-Za-z0-9_]+", "_", uri),
        "book_uri": uri,
        "version_uri": version,
        "title_ar": title,
        "title_lat": one(row.get("title_lat")),
        "author_ar": author,
        "author_lat": one(row.get("author_lat_shuhra")) or one(row.get("author_lat")),
        "death_ah": death,
        "genres": genres,
        "genre_evidence": proofs,
        "school": school or "",
        "school_evidence": school_proof or school_source,
        "school_evidence_level": school_source or "unassigned",
        "lineages": lineages,
        "lineage_evidence": "author-name association; not a proven genealogy" if lineages else "",
        "reading_status": "OpenITI primary-version metadata (not locally verified)",
        "source_url": source,
        "book_url": "https://github.com/OpenITI/RELEASE/tree/" + SOURCE_COMMIT +
                    "/data/" + local_path.split("/")[1] + "/" + uri,
        "edition_note": (row.get("ed_info") or "")[:340],
        "ocr_warning": row.get("uncorrected_OCR", "").lower() == "true" or
                       "UNCORRECTED_OCR" in row.get("tags", ""),
        "parts_metadata": (row.get("parts") or "")[:100],
        "tokens": positive_int(row.get("tok_length")),
    }


def get_bytes():
    local = next((a for a in sys.argv[1:] if not a.startswith("--")), "")
    if local:
        return Path(local).read_bytes()
    req = urllib.request.Request(METADATA, headers={"User-Agent": "GNAMMA-Bibliography/1.0"})
    with urllib.request.urlopen(req, timeout=120) as resp:
        return resp.read()


def main():
    raw = get_bytes()
    sha = hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\0" + raw).hexdigest()
    if sha != METADATA_BLOB:
        raise RuntimeError("Pinned OpenITI metadata Git blob mismatch: " + sha)
    reader = csv.DictReader(io.StringIO(raw.decode("utf-8-sig")), delimiter="\t")
    required = {"version_uri", "language", "book", "title_ar", "local_path", "tags", "status"}
    if not required.issubset(reader.fieldnames or []):
        raise ValueError("OpenITI metadata TSV format changed")
    primary = {}
    for r in reader:
        if r.get("language") != "ara" or r.get("status", "").lower() != "pri":
            continue
        book = r.get("book")
        if not book or not r.get("local_path"):
            continue
        # Multiple primary candidates for one work: prefer longest identified
        # digital version; never count two versions as two distinct works.
        if book not in primary or positive_int(r.get("char_length")) > positive_int(primary[book].get("char_length")):
            primary[book] = r
    if len(primary) < 8000:
        raise ValueError("Unexpectedly few distinct primary works")

    classified = {}
    affiliation = defaultdict(set)
    for uri, row in primary.items():
        classified[uri] = detect_disciplines(row)
        genres, proof, school, school_proof = classified[uri]
        if school:
            affiliation[uri.split(".", 1)[0]].add(school)
    works = []
    for uri, row in primary.items():
        genres, proofs, school, school_proof = classified[uri]
        if not any(g in genres for g in ("fiqh", "usul", "nahw", "sarf", "balagha", "lugha")):
            continue
        authors_schools = affiliation.get(uri.split(".", 1)[0], set())
        author_school = next(iter(authors_schools)) if len(authors_schools) == 1 else ""
        works.append(book_record(row, genres, proofs, school, school_proof, author_school))
    works.sort(key=lambda x: (x["death_ah"], x["book_uri"]))
    ids = [r["book_uri"] for r in works]
    assert len(ids) == len(set(ids))
    school_counts = {
        school: {
            "fiqh": sum("fiqh" in x["genres"] and x["school"] == school for x in works),
            "usul": sum("usul" in x["genres"] and x["school"] == school for x in works),
        }
        for school in SCHOOLS
    }
    genre_counts = {g: sum(g in x["genres"] for x in works)
                    for g in ("fiqh", "usul", "nahw", "sarf", "balagha", "lugha")}
    out = {
        "schema_version": 1,
        "generated_from": "OpenITI RELEASE 2025-1-9 metadata",
        "source_commit": SOURCE_COMMIT,
        "metadata_git_blob": METADATA_BLOB,
        "license": LICENSE,
        "license_url": "https://creativecommons.org/licenses/by-nc-sa/4.0/",
        "metadata_url": METADATA,
        "method": [
            "Distinct works (book URI) are counted once; primary version chosen deterministically.",
            "Source URL identifies an OpenITI digital version, not a separately collated/verified edition or GNAMMA-hosted text.",
            "Genres are provisional, derived from inherited release tags or title indicators and require specialist review.",
            "School from a source category is a classification of that file; a school inferred only from author-level categorisation is weaker and never automatically a legal opinion.",
            "Grammar and balagha lineages are intentionally overlapping author-based research routes, not exclusive historical memberships.",
            "Dates are author death dates, not book composition dates; the parts field is not proof of complete multi-volume coverage.",
            "No commentator, isnad, doctrinal or legal-question edges were generated from these classifications.",
        ],
        "statistics": {
            "primary_arabic_works_in_release": len(primary),
            "indexed_candidates": len(works),
            "by_genre": genre_counts,
            "by_school": school_counts,
            "ocr_caution": sum(x["ocr_warning"] for x in works),
            "lineage_counts": dict(Counter(z for x in works for z in x["lineages"])),
        },
        "works": works,
    }
    OUT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(json.dumps(out["statistics"], ensure_ascii=False, indent=2))
    print("WROTE", OUT, OUT.stat().st_size, "bytes")


if __name__ == "__main__":
    main()
