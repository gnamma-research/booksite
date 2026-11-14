"""Validate the GNAMMA primary-work discovery and manuscript *metadata* expansion.

No assertion here establishes that an Arabic full text, manuscript facsimile
or historical author-to-author influence has been collected or collated.
"""
import json
import re
from collections import Counter
from pathlib import Path

ROOT=Path(__file__).resolve().parent
oi=json.loads((ROOT/"expanded-bibliography.json").read_text(encoding="utf8"))
ms=json.loads((ROOT/"manuscript-shortlist.json").read_text(encoding="utf8"))
reader=json.loads((ROOT/"registry.json").read_text(encoding="utf8"))
assert oi["source_commit"]==reader["source_commit"]
assert oi["metadata_git_blob"]=="bbe2503166ebb3100d5de2afba1dffc7a5e3718d"
assert len(oi["works"])>1400
assert len(ms["works"])>=600
assert len({x["book_uri"] for x in oi["works"]})==len(oi["works"])
assert len({x["id"] for x in ms["works"]})==len(ms["works"])
assert oi["statistics"]["by_genre"]["fiqh"]>=500
assert oi["statistics"]["by_genre"]["usul"]>=150
assert oi["statistics"]["by_genre"]["nahw"]>=100
assert oi["statistics"]["by_genre"]["balagha"]>=200

for school in ("hanafi","maliki","shafii","hanbali"):
    assert ms["statistics"]["by_school"][school]["fiqh"]==40
    assert ms["statistics"]["by_school"][school]["usul"]>=30
    fiqh=[w for w in ms["works"] if w["school"]==school and "fiqh" in w["genres"]]
    usul=[w for w in ms["works"] if w["school"]==school and "usul" in w["genres"]]
    assert len(fiqh)==40 and len(usul)>=30
    assert all(w["school_evidence"] for w in fiqh+usul)
assert ms["statistics"]["by_genre"]["nahw"]>=150
assert ms["statistics"]["by_genre"]["balagha"]>=100
assert ms["statistics"]["unassigned_usul"]>=30
assert all(x["catalogue_url"].startswith("https://app.alreq.com/ar/AuthoredBooks/AuthoredBook/") for x in ms["works"])
assert all(x["reading_status"]=="manuscript catalogue only; no text or scan acquired" for x in ms["works"])
assert all(x["source_url"].startswith("https://github.com/OpenITI/RELEASE/blob/"+oi["source_commit"]+"/") for x in oi["works"])
assert all(x["reading_status"]=="OpenITI primary-version metadata (not locally verified)" for x in oi["works"])
assert all(x.get("school_evidence") or not x.get("school") for x in oi["works"])
assert not any(x.get("relations") or x.get("commentary_edges") for x in oi["works"]+ms["works"])

html=(ROOT/"expansion.html").read_text(encoding="utf8")
script=(ROOT/"expansion.js").read_text(encoding="utf8")
styles=(ROOT/"expansion.css").read_text(encoding="utf8")
assert "expansion.js" in html and "expansion.css" in html
for label in ('id="books"','id="science"','id="school"','id="lineage"','id="provenance"','id="pagination"','id="stats"'):
    assert label in html,label
assert all(term in script for term in ("expanded-bibliography.json","manuscript-shortlist.json","registry.json","sourceUrl","provenance"))
assert len(styles)>1500
atlas=(ROOT.parent/"atlas-app.js").read_text(encoding="utf8")
assert "sourceResearchExpansion" in atlas
assert "corpora/expansion.html" in atlas
assert 'manuscript-shortlist.json' in atlas
assert "40" in html or len(ms["works"])>=600
index=(ROOT.parent/"index.html").read_text(encoding="utf8")
assert 'corpora/expansion.html' in index
reader_html=(ROOT/"index.html").read_text(encoding="utf8")
assert 'expansion.html' in reader_html
canonical=json.loads((ROOT.parent/"downloads"/"intellectual-atlas-data.json").read_text(encoding="utf8"))
assert (len(canonical["nodes"]),len(canonical["edges"]))==(404,377)
assert len(reader["books"])==30 and len(reader["relationships"])==5
merged={w["book_uri"] for w in oi["works"]}
assert len(merged)>1400
print(json.dumps({
 "status":"PASS",
 "openiti_candidate_works":len(oi["works"]),
 "manuscript_catalogue_shortlist":len(ms["works"]),
 "already_verified_or_pinned_reader_versions":len(reader["books"]),
 "manuscript_school_counts":ms["statistics"]["by_school"],
 "manuscript_genres":ms["statistics"]["by_genre"],
 "lineage_classification":"provisional, overlap permitted",
 "canonical_atlas":"unchanged: 404/377",
},ensure_ascii=False,indent=2))
