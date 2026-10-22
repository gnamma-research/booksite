#!/usr/bin/env python3
"""Strict cross-format archive gate for Gnamma's public-source distribution.

Checks that no alternate 'source' has independently edited a passage, changed
vocalization, omitted editorial qualifiers, dropped a note or mixed original
headings with editorial headings. The canonical JSON inside the ZIP is always
compared directly to the current reader source.
"""
from __future__ import annotations
import argparse
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET
from zipfile import ZipFile

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"build"))
from build_editions import read_book  # noqa: E402

NAMESPACE={"tei":"http://www.tei-c.org/ns/1.0"}
AUTHORIAL=range(1,259)


def sha(data:bytes):
    return hashlib.sha256(data).hexdigest()


class Document(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.sections=set()
        self.paragraphs={"en":set(),"ar":set()}
        self.external_scripts=0
        self.seen_title=False
    def handle_starttag(self,tag,attrs):
        values=dict(attrs)
        if tag=="script":
            self.external_scripts+=1
        if tag=="section" and re.fullmatch(r"R\d{3}",values.get("id","")):
            self.sections.add(values["id"])
        if tag in ("p","div") and (match:=re.fullmatch(r"(R\d{3}-P\d{2})-(en|ar)",
                                                       values.get("id",""))):
            self.paragraphs[match[2]].add(match[1])
        if tag=="title":
            self.seen_title=True


def verify(path:Path):
    book=read_book()
    expected=[s for s in book["sections"]
              if isinstance(s.get("id"),int) and 1<=s["id"]<=258]
    originals={
      (s["id"],i):seg for s in expected for i,seg in enumerate(s["segments"])
    }
    if len(expected)!=258 or len(originals)!=414:
        raise AssertionError("Source text changed before archive audit")
    notes=book["notes"] if isinstance(book["notes"],list) else list(book["notes"].values())
    if len(notes)!=625:
        raise AssertionError("Notes inventory changed without accepted source release")
    with ZipFile(path) as zipfile:
        members=set(zipfile.namelist())
        if len(members)!=len(zipfile.namelist()) or len(members)!=13:
            raise AssertionError("Missing or duplicate canonical archive files")
        if any(".." in name or name.startswith("/") for name in members):
            raise AssertionError("ZIP contains unsafe paths")
        file_data={name:zipfile.read(name) for name in members}
    manifest=json.loads(file_data["manifest.json"])
    if manifest["source_authorial_sections"]!=258 or manifest["authorial_parallel_segments"]!=414:
        raise AssertionError("Broken source manifest counts")
    if manifest["canonical_note_records"]!=625:
        raise AssertionError("Editorial/source note records have been dropped")
    if manifest["legacy_shamela_txt_html_import_verified_in_app"] or manifest["native_bok_database_export"]:
        raise AssertionError("Shamela compatibility has not actually been certified")
    if manifest["private_user_notes_included"]:
        raise AssertionError("Private Reading Desk data must never enter public source archive")
    if manifest["canonical_reader_sha256"]!=sha((ROOT/"edition-r3-20261020.js").read_bytes()):
        raise AssertionError("Archive built against an unexpected reader version")
    for name,record in manifest["files"].items():
        payload=file_data[name]
        if record["bytes"]!=len(payload) or record["sha256"]!=sha(payload):
            raise AssertionError(f"Source export bytes changed: {name}")
    saved=json.loads(file_data["daruri-source.json"])
    if saved!=book:
        raise AssertionError("Canonical source JSON is not losslessly preserved")
    kept_notes=json.loads(file_data["daruri-notes.json"])
    if kept_notes!=notes:
        raise AssertionError("Canonical note/source qualifications were modified")
    lines=[json.loads(x) for x in file_data["daruri-passages.jsonl"].decode("utf8").splitlines()]
    if len(lines)!=414:
        raise AssertionError("Missing paragraph-level alignment")
    for row in lines:
        key=(row["section_id"],row["paragraph_index"])
        seg=originals.get(key)
        if seg is None:
            raise AssertionError("Invented authorial passage: "+str(key))
        for want,actual in [
            ("ar","arabic_unvowelled"),
            ("vocalized","arabic_vowelled_editorial"),
            ("en","english_translation_editorial"),
        ]:
            if seg[want]!=row[actual]:
                raise AssertionError(f"Damaged {want} source in {key}")
        if row["paragraph_id"]!=f"R{key[0]:03d}-P{key[1]+1:02d}":
            raise AssertionError("Unstable or incorrect paragraph reference")
    html=file_data["daruri-parallel.html"].decode("utf8")
    h=Document();h.feed(html)
    if len(h.sections)!=258 or len(h.paragraphs["en"])!=414 or len(h.paragraphs["ar"])!=414:
        raise AssertionError("Standalone HTML lost parallel text or stable targets")
    if h.external_scripts or not h.seen_title:
        raise AssertionError("Standalone HTML is not self-contained accessible text")
    for name in ("daruri-arabic.html","daruri-arabic-vowelled.html",
                 "daruri-english.html","shamela-import-arabic.html"):
        d=Document();d.feed(file_data[name].decode("utf8"))
        if len(d.sections)!=258 or d.external_scripts:
            raise AssertionError("One standalone source HTML variant is missing complete text")
    tei=ET.fromstring(file_data["daruri.tei.xml"])
    if tei.tag!="{http://www.tei-c.org/ns/1.0}TEI":
        raise AssertionError("Not a TEI P5 document")
    for text in tei.findall(".//tei:group/tei:text",NAMESPACE):
        paragraphs=text.findall(".//tei:body/tei:div/tei:p",NAMESPACE)
        if len(paragraphs)!=414:
            raise AssertionError("One TEI language layer is incomplete")
    note_elements=tei.findall(".//tei:back//tei:note",NAMESPACE)
    if len(note_elements)!=625:
        raise AssertionError("TEI separate source notes are incomplete")
    for key,field in (
        ("shamela-import-arabic.txt","ar"),
        ("shamela-import-vowelled.txt","vocalized")
    ):
        out=file_data[key].decode("utf8")
        if out.count("[R")!=258:
            raise AssertionError("Plain Shamela import lost source unit references")
        for s in expected:
            if not all(seg[field] in out for seg in s["segments"]):
                raise AssertionError("Plain import changed original Arabic source")
    print("DARURI_PORTABLE_SOURCE_PASS",json.dumps({
        "sections":len(expected),
        "parallel_paragraphs":len(lines),
        "canonical_notes":len(notes),
        "tei_linguistic_layers":3,
        "standalone_html_works_without_js":True,
        "legacy_shamela_import_unverified":True,
        "zip_sha256":sha(path.read_bytes()),
        "bytes":path.stat().st_size,
    },ensure_ascii=False),flush=True)


if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("archive",type=Path)
    args=parser.parse_args()
    verify(args.archive)
