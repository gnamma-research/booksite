#!/usr/bin/env python3
"""Tahdhib Stage120 -- cross-check bounded source labels, full H prefix and claims."""
from pathlib import Path
import hashlib,json,re
R=Path("texts/al-taftazani/tahdhib-al-mantiq/edition")
jd=lambda s:json.loads((R/s).read_text())
sh=lambda b:hashlib.sha256(b).hexdigest()
q258=jd("STAGE120_Q258_FIFTEEN_SOURCE_FRAGMENTS.json")
q294=jd("STAGE120_Q294_EIGHT_DIRECTIONAL_SYMBOLS.json")
old258=jd("STAGE118_Q258_49_DEFINITION_SOURCE_PHRASES.json")
old294=jd("STAGE118_Q294_105_SOURCE_SYMBOL_FAMILIES.json")
old19=jd("STAGE119_Q294_NINETEEN_DIRECT_GLYPHS.json")
assert len(old258["cells"])==49 and old258["counts"]["selected_phrase_english_glosses"]==24
assert len(old294["cells"])==105 and len(old19["entries"])==19
assert len(q258["entries"])==15 and len({x["id"] for x in q258["entries"]})==15
assert sum(x["grade"]=="cross-reference-only" for x in q258["entries"])==4
assert q258["cumulative_selected_source_phrases"]==39
for x in q258["entries"]:
    assert not x["whole_cell_certified"]
    assert (x["row"],x["column"]) in {(y["row"],y["column"]) for y in old258["cells"]}
    base=next(y for y in old258["cells"] if y["row"]==x["row"] and y["column"]==x["column"])
    assert base["reviewed_selected_arabic_phrase"] is None, x["id"]
assert len(q294["entries"])==8
assert len({x["id"] for x in q294["entries"]})==8
for x in q294["entries"]:
    base=next(y for y in old294["cells"] if y["row"]==x["row"] and y["column"]==x["column"])
    assert base["symbol_family"]=="I"
    assert x["sourceAr"]=="مط حم"
    assert not x["independentManuscriptCertified"]
    assert x["id"] not in {y["id"] for y in old19["entries"]}
assert q294["cumulativeSourceGlyphWorkingReadings"]==27
manifest=jd("STAGE120_CUMULATIVE_FILE_INTEGRITY.json")
old=(R/"batches/hawashi-all-sections-cumulative-stage119.md").read_bytes()
new=(R/"batches/hawashi-all-sections-cumulative-stage120.md").read_bytes()
assert new.startswith(old)
assert sh(old)==manifest["priorSHA256"]
assert sh(new)==manifest["newSHA256"]
assert len(new)==manifest["newBytes"]
assert len(re.findall(r"(?m)^## HWN-[A-Z0-9-]+",new.decode("utf-8")))==1090
assert manifest["originalTableAffected"]==4 and manifest["modernReferenceOnly"]==57
assert manifest["newWholePrintedHPagesCertified"]==0
assert manifest["newIndependentManuscriptVariants"]==0
assert manifest["newHistoricallyStrongProofsFor46ModalMixes"]==0
for x in manifest["appendices"]:
  b=(R/x["name"]).read_bytes()
  assert sh(b)==x["sha256"] and len(b)==x["bytes"]
reader=(R/"STAGE120_SOURCE_PHOTO_READER.html").read_text()
main=(R/"index.html").read_text()
assert "STAGE120_Q258_FIFTEEN_SOURCE_FRAGMENTS.json" in reader
assert "STAGE120_Q294_EIGHT_DIRECTIONAL_SYMBOLS.json" in reader
assert "STAGE120_SOURCE_PHOTO_READER.html" in main
assert "Stage114" in (R/"HANDOFF_LATEST.md").read_text()
assert "tables" in (R/"HANDOFF_LATEST.md").read_text().lower()
print(json.dumps({"verified":True,"fullCorpusRecords":1090,"Q258New":15,"Q258SelectedTotal":39,"Q294NewDirectedSigns":8,"Q294ExactTotal":27,"stage120SHA":sh(new)},ensure_ascii=False))
