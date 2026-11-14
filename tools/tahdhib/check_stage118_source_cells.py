#!/usr/bin/env python3
"""Stage118 typed source evidence gate; no false critical-edition certification."""
from pathlib import Path
import hashlib,json,re
P=Path("texts/al-taftazani/tahdhib-al-mantiq/edition")
def get(path):return json.loads((P/path).read_text())
q=get("STAGE118_Q294_105_SOURCE_SYMBOL_FAMILIES.json")
d=get("STAGE118_Q258_49_DEFINITION_SOURCE_PHRASES.json")
assert len(q["cells"])==105 and q["distribution"]=={"I":61,"M":33,"D":11}
assert set(x["symbol_family"] for x in q["cells"])=={"I","M","D"}
assert len(set(x["id"] for x in q["cells"]))==105
assert all(x["column"]<x["row"] and x["row"]<=15 for x in q["cells"])
assert all(sum(x["row"]==r for x in q["cells"])==r-1 for r in range(2,16))
assert not any("verified" in x["status"] and "not" not in x["status"] for x in q["cells"])
assert len(d["cells"])==49 and d["counts"]["selected_phrase_english_glosses"]==24
assert len(set(x["id"] for x in d["cells"]))==49
assert all(1<=x["row"]<=7 and 1<=x["column"]<=7 for x in d["cells"])
assert all(not x["complete_cell_arabic_english_certified"] for x in d["cells"])
assert sum(bool(x["reviewed_selected_arabic_phrase"]) for x in d["cells"])==24
assert q["certified_full_modal_theorems_added"]==0
for p in ("STAGE118_SOURCE_CELL_READER.html","STAGE118_SOURCE_CELL_RESEARCH.md","STAGE118_Q309_SOURCE_REVIEW.md","HANDOFF_LATEST.md"):
 assert (P/p).is_file(),p
html=(P/"STAGE118_SOURCE_CELL_READER.html").read_text()
assert "STAGE118_Q294_105_SOURCE_SYMBOL_FAMILIES.json" in html
assert "STAGE118_Q258_49_DEFINITION_SOURCE_PHRASES.json" in html
assert "source-table-excerpts/print1405_Q294_table_excerpt.png" in html
assert "source-table-excerpts/print1405_Q258_table_excerpt.png" in html
assert "STAGE118_SOURCE_CELL_READER.html" in (P/"index.html").read_text()
assert (P/"batches/hawashi-all-sections-cumulative-stage117.md").is_file()
assert len(re.findall(r"(?m)^## HWN-[A-Z0-9-]+",(P/"batches/hawashi-all-sections-cumulative-stage117.md").read_text()))==1090
assert "49" in (P/"HANDOFF_LATEST.md").read_text()
print("PASS Stage118: 105 source families, 49 indexed definition pairs, 24 selected phrases, no certifications inflated, historical 1090 notes preserved")
