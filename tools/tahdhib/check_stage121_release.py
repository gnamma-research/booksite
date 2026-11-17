#!/usr/bin/env python3
"""Stage121 immutable-source/cell-grading test; no false critical-edition claim."""
from pathlib import Path
from hashlib import sha256
import json,re
P=Path("texts/al-taftazani/tahdhib-al-mantiq/edition")
def js(name):return json.loads((P/name).read_text())
def hashb(b):return sha256(b).hexdigest()
q258=js("STAGE121_Q258_TEN_LAST_LOCATOR_READINGS.json")
q294=js("STAGE121_Q294_TWENTY_SOURCE_DIRECTIONS.json")
base258=js("STAGE118_Q258_49_DEFINITION_SOURCE_PHRASES.json")
mid258=js("STAGE120_Q258_FIFTEEN_SOURCE_FRAGMENTS.json")
base294=js("STAGE118_Q294_105_SOURCE_SYMBOL_FAMILIES.json")
mid294=js("STAGE119_Q294_NINETEEN_DIRECT_GLYPHS.json")
newmid294=js("STAGE120_Q294_EIGHT_DIRECTIONAL_SYMBOLS.json")
assert len(base258["cells"])==49 and base258["counts"]["selected_phrase_english_glosses"]==24
old258={x["id"] for x in base258["cells"] if x["reviewed_selected_arabic_phrase"]}|{x["id"] for x in mid258["entries"]}
new258={x["id"] for x in q258["entries"]}
assert len(old258)==39 and len(new258)==10 and old258.isdisjoint(new258)
assert len(old258|new258)==49
assert sum(x["full_cell_text_read"] for x in q258["entries"])==7
assert sum(not x["full_cell_text_read"] for x in q258["entries"])==3
assert all(x["arabic_visible"] in ("انظر","غير صحيح") for x in q258["entries"])
assert sum(x["grade"]=="cross-reference-only" for x in mid258["entries"])==4
assert q258["cumulative_complete_short_cross_reference_cells"]==11
assert q258["remaining_full_substantive_cells_for_diplomatic_translation"]==38
assert q258["cumulative_full_substantive_verdict_cells_certified"]==0

prior294={x["id"] for x in mid294["entries"]}|{x["id"] for x in newmid294["entries"]}
assert len(prior294)==27
added294={x["id"] for x in q294["entries"]}
assert len(added294)==20 and prior294.isdisjoint(added294)
assert len(prior294|added294)==47
assert len(base294["cells"])==105
assert q294["unread_core_readings"]==58
assert q294["lower_more_general"]==10 and q294["upper_more_general"]==10
assert all(x["source_glyph_working"] in ("مط حم","مط فم") and not x["independent_semantic_proof"] for x in q294["entries"])
for x in q294["entries"]:
    original=next(y for y in base294["cells"] if y["id"]==x["id"])
    assert original["symbol_family"]=="I",x["id"]
assert q294["cumulative_individual_core_readings"]==47

info=js("STAGE121_CUMULATIVE_FILE_INTEGRITY.json")
old=(P/"batches/hawashi-all-sections-cumulative-stage120.md").read_bytes()
new=(P/"batches/hawashi-all-sections-cumulative-stage121.md").read_bytes()
assert new.startswith(old)
assert len(old)==info["priorFullBytes"] and hashb(old)==info["priorFullSHA256"]
assert len(new)==info["currentBytes"] and hashb(new)==info["currentSHA256"]
assert len(re.findall(r"(?m)^## HWN-[A-Z0-9-]+",new.decode("utf-8")))==1090
assert info["Q258AllSelected"]==49 and info["Q294IndividualGlyphsCumulative"]==47
assert info["newWholeHistoricalHPrintedPagesCertified"]==0
assert info["newOriginalTOrYManuscriptVariants"]==0 and info["newHistoricalModal46StrongProofs"]==0
assert info["inheritedTableAffected"]==4 and info["inheritedModernReferences"]==57
for f in info["appendices"]:
    b=Path(f["path"]).read_bytes()
    assert len(b)==f["bytes"] and hashb(b)==f["sha256"]
assert "STAGE121_SOURCE_READER.html" in (P/"index.html").read_text()
ui=(P/"STAGE121_SOURCE_READER.html").read_text()
for name in ("STAGE121_Q258_TEN_LAST_LOCATOR_READINGS.json","STAGE121_Q294_TWENTY_SOURCE_DIRECTIONS.json","source-table-excerpts/print1405_Q258_table_excerpt.png","source-table-excerpts/print1405_Q294_table_excerpt.png"):
    assert name in ui
assert "Stage114" in (P/"HANDOFF_LATEST.md").read_text()
assert "tables" in (P/"HANDOFF_LATEST.md").read_text().lower()
print(json.dumps({"passed":True,"HNotes":1090,"Q258readings":49,"Q258crossrefs":11,"Q258substantiveFullCellsStillOpen":38,"Q294directionCoreReadings":47,"Q294remaining":58,"Q294newUpper":10,"Q294newLower":10,"modalProofsAdded":0},ensure_ascii=False))
