#!/usr/bin/env python3
"""Synchronize reader release metadata after the five PDFs have been rebuilt.

Dry-run is the default and writes nothing. Copy the final five PDF files to the
daruri directory separately; --apply refuses to run until their bytes agree
with the rebuilt PDFs and their metadata. This tool never copies or edits PDFs,
publishes changes, regenerates the study guide, or serializes the whole HTML.
Use --refresh-study-companion when its separately rebuilt PDF and lesson data
also belong to this release; the installed PDF must match its build metadata.

Examples (from the repository root):
  python daruri/build/update_release.py --rebuilt-dir ../daruri_citation_audit/rebuilt
  python daruri/build/update_release.py --rebuilt-dir ../daruri_citation_audit/rebuilt --apply
  python daruri/build/update_release.py --rebuilt-dir ../daruri_citation_audit/rebuilt --check

--check exits 1 if the release still needs changes, and 2 for invalid inputs.
Only the five files listed in TARGETS may be written. Requires PyMuPDF (fitz)
to verify physical PDF page counts; the HTML parser uses the standard library.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import html
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import sys
import tempfile
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit


DEFAULT_REVISION = "daruri8-structure-20261020"
EDITION_JS = "edition-r3-20261020.js"
TARGETS = ("index.html", EDITION_JS, "pdf-editions-manifest.json", "download-bundle.js", "sw.js")
EDITIONS = {
    "daruri.pdf": ("scholarly", "reference", "Bilingual reference edition"),
    "daruri-study.pdf": ("study", "study", "Bilingual study edition"),
    "daruri-english.pdf": ("english", "english", "English reading edition"),
    "daruri-arabic.pdf": ("arabic", "arabic", "Arabic reading edition"),
    "daruri-arabic-vowelled.pdf": ("arabic-vowelled", "vowelled", "Arabic · fully vowelled edition"),
}
SECTION_IDS = {str(i) for i in range(1, 259)} | {"colophon"}
RELEASE_ASSETS = tuple(EDITIONS) + (
    EDITION_JS, "dictionary-r3-20261020.js", "source-reference-data.js", "download-bundle.js",
    "pdf-editions-manifest.json", "sw.js",
)
STUDY_RELEASE_ASSETS = ("daruri-study-guide.pdf", "study-guide-data.js", "study-guide.js")
PROTECTED = (
    "daruri-study-guide.pdf", "bou-akl-2015-variant-report.pdf",
    "study-guide-data.js", "study-guide.js", "study-guide.css",
)


class ReleaseError(Exception):
    pass


def require(condition, message):
    if not condition:
        raise ReleaseError(message)


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def replace_exact_count(pattern, replacement, text, count, label, flags=0):
    result, found = re.subn(pattern, replacement, text, flags=flags)
    require(found == count, f"{label}: expected {count} matches, found {found}")
    return result


class Element:
    def __init__(self, tag, attrs, start, open_end, parent):
        self.tag, self.attrs, self.start, self.open_end = tag, dict(attrs), start, open_end
        self.parent, self.children = parent, []
        self.close_start = self.end = open_end

    def has_class(self, name):
        return name in (self.attrs.get("class") or "").split()

    def descendants(self):
        for child in self.children:
            yield child
            yield from child.descendants()

    def ancestors(self):
        parent = self.parent
        while parent:
            yield parent
            parent = parent.parent


class SourceHTML(HTMLParser):
    """Track exact source spans without changing existing HTML formatting."""
    VOID = set("area base br col embed hr img input link meta param source track wbr".split())

    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.source, self.elements, self.stack = source, [], []
        self.lines = [0]
        self.lines.extend(m.end() for m in re.finditer("\n", source))
        self.feed(source)
        self.close()

    def position(self):
        row, column = self.getpos()
        return self.lines[row - 1] + column

    def handle_starttag(self, tag, attrs):
        start = self.position()
        node = Element(tag, attrs, start, start + len(self.get_starttag_text()), self.stack[-1] if self.stack else None)
        self.elements.append(node)
        if node.parent:
            node.parent.children.append(node)
        if tag not in self.VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self.VOID:
            self.stack.pop()

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i].tag == tag:
                node = self.stack[i]
                node.close_start = self.position()
                node.end = self.source.index(">", node.close_start) + 1
                del self.stack[i:]
                break


def attribute(start_tag, name, value):
    pattern = r"(\b" + re.escape(name) + r"\s*=\s*)([\"'])(.*?)\2"
    return replace_exact_count(
        pattern, lambda m: m[1] + m[2] + html.escape(str(value), quote=True) + m[2],
        start_tag, 1, f"attribute {name}", flags=re.S,
    )


def versioned_url(value, revision, page=None):
    split = urlsplit(html.unescape(value))
    query = [(k, v) for k, v in parse_qsl(split.query, keep_blank_values=True) if k != "v"]
    query.append(("v", revision))
    fragment = f"page={page}" if page is not None else split.fragment
    return urlunsplit((split.scheme, split.netloc, split.path, urlencode(query), fragment))


def version_asset_urls(source, revision, assets=RELEASE_ASSETS):
    # Match local URL tokens only. In particular, do not alter archive filenames,
    # historical document prose, or the independently versioned study assets.
    names = "|".join(re.escape(name) for name in sorted(assets, key=len, reverse=True))
    pattern = r"(?<![A-Za-z0-9_./-])(?:" + names + r")(?:(?:\?)[^#\s\"'\\<>]*)?(?=[#\s\"'\\<>]|$)"
    return re.sub(pattern, lambda m: versioned_url(m[0], revision), source)


def static_destination(node):
    if node.tag != "a":
        return None
    url = urlsplit(node.attrs.get("href") or "")
    if url.path != "daruri.pdf" or not re.fullmatch(r"page=\d+", url.fragment):
        return None
    for ancestor in node.ancestors():
        match = re.fullmatch(r"fb-heading-cite-(\d+|colophon)", ancestor.attrs.get("id") or "")
        if match:
            return match[1], int(url.fragment[5:]), "heading"
        if ancestor.has_class("fb-toc-row"):
            refs = {
                match[1] for child in ancestor.descendants()
                if child.tag == "a"
                and (match := re.fullmatch(r"#section=(\d+|colophon)", child.attrs.get("href") or ""))
            }
            require(len(refs) == 1, "A contents PDF link does not identify exactly one stable section")
            return refs.pop(), int(url.fragment[5:]), "contents"
    raise ReleaseError("Unmapped static scholarly PDF link at source offset " + str(node.start))


def apply_spans(source, patches):
    last = len(source)
    for start, end, replacement in sorted(patches, reverse=True):
        require(0 <= start <= end <= last, "Overlapping or invalid HTML source patches")
        source = source[:start] + replacement + source[end:]
        last = start
    return source


def update_html(source, metadata, revision, assets=RELEASE_ASSETS):
    parsed = SourceHTML(source)
    section_pages = metadata["daruri.pdf"]["section_pages"]
    patches, destinations, panel_counts = [], [], {filename: 0 for filename in EDITIONS}
    panel_keys = {entry[1]: filename for filename, entry in EDITIONS.items()}
    for node in parsed.elements:
        destination = static_destination(node)
        if destination:
            sid, old_page, kind = destination
            require(sid in section_pages, "Unknown reader section " + sid)
            new_page = section_pages[sid]
            opening = source[node.start:node.open_end]
            opening = attribute(opening, "href", versioned_url(node.attrs["href"], revision, new_page))
            label = node.attrs.get("aria-label") or ""
            label = replace_exact_count(r"(?<=at page )\d+", str(new_page), label, 1, "Static accessible PDF page")
            opening = attribute(opening, "aria-label", label)
            body = source[node.open_end:node.close_start]
            body = replace_exact_count(r"(PDF(?:\s+p\.)?\s+)\d+", lambda m: m[1] + str(new_page), body, 1, "Static visible PDF page")
            patches.append((node.start, node.end, opening + body + source[node.close_start:node.end]))
            destinations.append({"section": sid, "kind": kind, "from": old_page, "to": new_page})
        if node.tag == "a" and "data-pdf-edition" in node.attrs:
            key = node.attrs["data-pdf-edition"]
            require(key in panel_keys, "Unknown download panel edition " + str(key))
            filename = panel_keys[key]
            info = metadata[filename]
            require(urlsplit(node.attrs["href"]).path == filename, "Download edition/filename mismatch")
            size = f"{info['bytes'] / 1_000_000:.1f} MB"
            opening = attribute(source[node.start:node.open_end], "href", versioned_url(node.attrs["href"], revision))
            label = replace_exact_count(r"\d+ pages, [\d.]+ MB", f"{info['pages']} pages, {size}", node.attrs.get("aria-label") or "", 1, "Download accessible count")
            opening = attribute(opening, "aria-label", label)
            body = source[node.open_end:node.close_start]
            body = replace_exact_count(r'(<small class="gn-pdf-meta">)\d+ pages · [\d.]+ MB(</small>)', lambda m: m[1] + f"{info['pages']} pages · {size}" + m[2], body, 1, "Download visible count")
            patches.append((node.start, node.end, opening + body + source[node.close_start:node.end]))
            panel_counts[filename] += 1
    require(len(destinations) == 565, f"Expected 565 static PDF destinations, found {len(destinations)}")
    require(sum(d["kind"] == "heading" for d in destinations) == 259, "Expected 259 heading PDF links")
    require(sum(d["kind"] == "contents" for d in destinations) == 306, "Expected 306 contents PDF links")
    # Earlier layouts provided two five-edition download panels, but the newer
    # three-tier Editions interface renders choices from the manifest and keeps
    # five plain fallback download links in the static HTML. Do not require
    # obsolete data-pdf-edition attributes that are now absent by design.
    count_panel_links = sum(panel_counts.values())
    if count_panel_links:
        require(all(n == 2 for n in panel_counts.values()), "Incomplete legacy download panels")
    result = apply_spans(source, patches)
    fallback_updated = 0
    for filename, (_, _, title) in EDITIONS.items():
        label_pattern = re.escape(title) + r" \(\d+ pages\)"
        label_count = len(re.findall(label_pattern, result))
        require(label_count in (0, 2), "Unexpected legacy About edition-count layout")
        if label_count:
            result = replace_exact_count(label_pattern, f"{title} ({metadata[filename]['pages']} pages)", result, label_count, "Legacy About edition count")
        # Modern source-first fallback: each PDF appears once in an ordinary
        # filename-bound anchor. Update its displayed page count without
        # reintroducing removed panels or touching section-specific PDF links.
        fallback_pattern = (r'(<a\b[^>]*href="' + re.escape(filename) +
                            r'(?=[?"])[^"]*"[^>]*>[^<]*?\()\d+( pages\)</a>)')
        result, replaced = re.subn(
            fallback_pattern,
            lambda m, pages=metadata[filename]["pages"]: m[1] + str(pages) + m[2],
            result,
        )
        fallback_updated += replaced
        if not count_panel_links:
            require(replaced == 1, "Missing modern Editions fallback link: " + filename)
    reference_pattern = r"\d+-page bilingual reference PDF"
    reference_count = len(re.findall(reference_pattern, result))
    require(reference_count in (0, 2), "Unexpected legacy reference-description layout")
    if reference_count:
        result = replace_exact_count(reference_pattern, f"{metadata['daruri.pdf']['pages']}-page bilingual reference PDF", result, reference_count, "Legacy About reference description")
    result = version_asset_urls(result, revision, assets)
    # Preserve independently versioned guide/print assets. An explicit companion
    # refresh may advance the guide PDF, data and runtime URLs, never its content.
    for name in ("study-guide-data.js", "study-guide.js", "study-guide.css", "daruri-study-guide.pdf", "print.css", "print.js"):
        if name in assets:
            continue
        pattern = re.escape(name) + r"[^\s\"'\\<>]*"
        require(re.findall(pattern, source) == re.findall(pattern, result), "Changed study-guide asset URL " + name)
    new_parsed = SourceHTML(result)
    before_guide = [source[n.start:n.end] for n in parsed.elements if n.has_class("sg-fallback-level")]
    after_guide = [result[n.start:n.end] for n in new_parsed.elements if n.has_class("sg-fallback-level")]
    require(len(before_guide) == 84 and before_guide == after_guide, "Study guide fallback changed")
    new_destinations = [d for n in new_parsed.elements if (d := static_destination(n))]
    require(len(new_destinations) == 565 and all(page == section_pages[sid] for sid, page, _ in new_destinations), "Proposed static page map failed verification")
    return result, {
        "static_destinations": 565,
        "static_heading_destinations": 259,
        "static_contents_destinations": 306,
        "static_page_numbers_changed": sum(d["from"] != d["to"] for d in destinations),
        "download_panels": 2 if count_panel_links else 0,
        "download_links": count_panel_links,
        "modern_fallback_downloads": fallback_updated,
        "study_fallback_levels_preserved": 84,
    }


def update_edition(source, info):
    assignment = re.search(r'document\.getElementById\(["\']editionData["\']\)\.textContent\s*=\s*', source)
    require(assignment is not None, "Cannot find editionData assignment")
    encoded, length = json.JSONDecoder().raw_decode(source[assignment.end():])
    require(isinstance(encoded, str), "editionData assignment is not a JSON string")
    book = json.loads(encoded)
    original = copy.deepcopy(book)
    require(len(book.get("sections", [])) == 259, "Expected 259 dynamic section records")
    require({str(s["id"]) for s in book["sections"]} == SECTION_IDS, "Unexpected dynamic section IDs")
    changed = 0
    for section in book["sections"]:
        page = info["section_pages"][str(section["id"])]
        changed += section.get("pdfPage") != page
        section["pdfPage"] = page
    book["stats"]["totalPdfPages"] = info["pages"]
    require(len(book.get("notes", [])) == book["stats"].get("notes") == book["stats"].get("noteCount"), "Existing payload note counts are inconsistent; resolve before release")
    conserved = copy.deepcopy(book)
    for old_section, section in zip(original["sections"], conserved["sections"]):
        section["pdfPage"] = old_section.get("pdfPage")
    conserved["stats"]["totalPdfPages"] = original["stats"].get("totalPdfPages")
    require(conserved == original, "A non-pagination payload field changed")
    payload = json.dumps(book, ensure_ascii=False, separators=(",", ":"))
    result = source[:assignment.end()] + json.dumps(payload, ensure_ascii=False) + source[assignment.end() + length:]
    return result, {"dynamic_destinations": 259, "dynamic_page_numbers_changed": changed, "notes_preserved": len(book["notes"])}


def contents_pages(info):
    anchors = info["anchors"]
    starts = [(key, anchors[key]["page"]) for key in ("contents", "original-contents", "editorial-contents", "main-text") if key in anchors]
    require(starts and starts[-1][0] == "main-text", "Metadata missing main-text anchor")
    labels = {"contents": "part_overview", "original-contents": "original_headings", "editorial-contents": "editorial_section_titles"}
    result = {}
    require(all(a[1] <= b[1] for a, b in zip(starts, starts[1:])), "Invalid contents-page anchor order")
    # The compact source contents also carries the part/reference overview.
    # Its two named anchors may therefore share a physical page. Both labels
    # identify that same range, ending at the next distinct contents/body page.
    for i, (key, start) in enumerate(starts[:-1]):
        end = next((page for _, page in starts[i + 1:] if page > start), None)
        require(end is not None and 1 <= start < end <= info["pages"], "Invalid contents-page anchor range")
        result[labels[key]] = list(range(start, end))
    return result


def update_manifest(source, metadata, revision, edition_date, companion=None):
    manifest = json.loads(source)
    original_companions = copy.deepcopy(manifest.get("companions"))
    require(set(manifest["files"]) == set(EDITIONS), "Manifest must contain exactly the five reading editions")
    manifest["edition_date"] = edition_date
    manifest["source"] = "daruri8: source-based contents and bookmarks in all five editions; compact editorial section guides in scholarly, study and English editions; subject index before dictionary"
    manifest["citation_policy"] = "Qur’an source notes in all five reading editions; hadith source notes in the scholarly edition; original scholarly and study-note selections preserved"
    manifest["release_revision"] = revision
    manifest["generator"] = "daruri/build/build_editions.py"
    manifest["navigation_revision"] = revision
    manifest["navigation_note"] = "Reader PDF destinations are remapped by stable section ID from the rebuilt scholarly PDF's verified section anchors. All five editions have source-based contents and hierarchical bookmarks; scholarly, bilingual study and English editions also have explicitly editorial numbered section guides. Arabic editions use Arabic structural navigation. The later colophon is separate. The unchanged three-level study-guide companion is recorded under companions."
    for filename, info in metadata.items():
        row = manifest["files"][filename]
        if row.get("source_filename") != filename:
            row.setdefault("baseline_source", {k: row[k] for k in ("source_filename", "source_sha256") if k in row})
        row.update({
            "source_filename": filename, "source_sha256": info["sha256"],
            "sha256": info["sha256"], "size_bytes": info["bytes"], "pages": info["pages"],
            "default_for_text_links": filename == "daruri.pdf",
            "body_page_destinations_preserved": False,
            "contents_pages": contents_pages(info),
        })
    if companion is not None:
        original_companions["daruri-study-guide.pdf"].update({
            "sha256": companion["sha256"], "size_bytes": companion["bytes"],
            "pages": companion["pages"], "content_revision": revision,
            "build_metadata": "study/companion-metadata.json",
        })
        manifest["companions"]["daruri-study-guide.pdf"] = original_companions["daruri-study-guide.pdf"]
    require(manifest["companions"] == original_companions, "Unrelated companion manifest changed")
    return json.dumps(manifest, ensure_ascii=False, indent=2) + "\n"


def update_bundle(source, revision, assets=RELEASE_ASSETS):
    begin, end = "  // BEGIN DARURI RELEASE ASSETS", "  // END DARURI RELEASE ASSETS"
    # These paths control only network fetch versions. Archive entry names, the
    # complete sourceFiles() list, and independently released companions stay put.
    block = begin + "\n  const RELEASE_VERSION = " + json.dumps(revision) + ";\n  const RELEASE_ASSETS = new Set(" + json.dumps(list(assets), ensure_ascii=False) + ");\n" + end
    if begin in source:
        source = replace_exact_count(re.escape(begin) + r".*?" + re.escape(end), lambda _: block, source, 1, "Offline release version", flags=re.S)
    else:
        source = replace_exact_count(r"  'use strict';", lambda m: m[0] + "\n\n" + block, source, 1, "Offline release insertion")
    old = "  async function readFile(name, path) {\n    const url = new URL(path, root);"
    stamp = "\n    if (RELEASE_ASSETS.has(path.split('?')[0])) url.searchParams.set('v', RELEASE_VERSION);"
    if old + stamp not in source:
        require(source.count(old) == 1, "Offline bundle readFile signature changed")
        source = source.replace(old, old + stamp, 1)
    # Keep the explicit fetch URLs in sourceFiles() aligned with the reader and
    # worker as well as the runtime override. Archive entry names stay stable.
    def source_asset(match):
        archive, fetch = match[1], match[2]
        if urlsplit(fetch).path not in assets:
            return match[0]
        return "['" + archive + "', '" + versioned_url(fetch, revision) + "']"
    source = re.sub(r"\['(daruri/[^']+)',\s*'([^']+)'\]", source_asset, source)
    return source


def update_service_worker(source, revision, assets=RELEASE_ASSETS):
    source = replace_exact_count(r"const NAME=([\"']).*?\1;", lambda _: "const NAME=" + json.dumps("daruri-reader-" + revision) + ";", source, 1, "Service-worker cache name")
    return version_asset_urls(source, revision, assets)


def inspect_pdf(path):
    try:
        import fitz
    except ImportError as exc:
        raise ReleaseError("PyMuPDF (fitz) is required to verify physical PDF page counts") from exc
    data = path.read_bytes()
    require(data.startswith(b"%PDF-"), str(path) + " is not a PDF")
    with fitz.open(stream=data, filetype="pdf") as document:
        count = document.page_count
    return {"bytes": len(data), "sha256": sha256(data), "pages": count}


def load_metadata(rebuilt_dir):
    metadata, snapshots = {}, {}
    for filename, (edition, _, _) in EDITIONS.items():
        path = rebuilt_dir / (filename + ".metadata.json")
        raw = path.read_bytes()
        info = json.loads(raw)
        require(info.get("filename") == filename and info.get("edition") == edition, "Metadata edition mismatch: " + str(path))
        actual = inspect_pdf(rebuilt_dir / filename)
        require(all(info.get(k) == value for k, value in actual.items()), "Rebuilt PDF does not match its metadata: " + filename)
        require(set(info.get("section_pages", {})) == SECTION_IDS, "Incomplete rebuilt section map: " + filename)
        for sid, page in info["section_pages"].items():
            require(isinstance(page, int) and 1 <= page <= info["pages"], "Invalid section page: " + filename + "/" + sid)
            require(info.get("anchors", {}).get("section-" + sid, {}).get("page") == page, "Section map/anchor mismatch: " + filename + "/" + sid)
        metadata[filename] = info
        snapshots[path] = sha256(raw)
        snapshots[rebuilt_dir / filename] = actual["sha256"]
    require(all(k in metadata["daruri.pdf"]["anchors"] for k in ("original-contents", "editorial-contents")), "Scholarly PDF must preserve both contents lists")
    return metadata, snapshots


def prepare(daruri_dir, rebuilt_dir, revision, edition_date, refresh_study_companion=False):
    metadata, snapshots = load_metadata(rebuilt_dir)
    originals = {name: (daruri_dir / name).read_bytes() for name in TARGETS}
    for name, data in originals.items():
        snapshots[daruri_dir / name] = sha256(data)
    installed = {}
    for filename, info in metadata.items():
        path = daruri_dir / filename
        actual = inspect_pdf(path) if path.exists() else None
        matches = actual is not None and all(actual[k] == info[k] for k in actual)
        installed[filename] = {"pages": info["pages"], "size_bytes": info["bytes"], "sha256": info["sha256"], "installed_matches": matches}
        if actual:
            snapshots[path] = actual["sha256"]
    for path in [daruri_dir / name for name in PROTECTED] + sorted((daruri_dir / "study").glob("*")):
        if path.is_file():
            snapshots[path] = sha256(path.read_bytes())
    companion = inspect_pdf(daruri_dir / "daruri-study-guide.pdf")
    recorded = json.loads(originals["pdf-editions-manifest.json"])["companions"]["daruri-study-guide.pdf"]
    require(companion["pages"] == recorded["pages"] == 85, "Separate study-guide companion must remain 85 pages")
    if refresh_study_companion:
        guide_metadata = json.loads((daruri_dir / "study/companion-metadata.json").read_bytes())
        require(guide_metadata.get("file") == "daruri-study-guide.pdf", "Guide build metadata filename mismatch")
        for actual_key, metadata_key in (("pages", "pageCount"), ("bytes", "sizeBytes"), ("sha256", "sha256")):
            require(companion[actual_key] == guide_metadata.get(metadata_key), "Guide PDF/build metadata mismatch: " + metadata_key)
        require(guide_metadata.get("topics") == 28 and guide_metadata.get("lessons") == 84, "Guide build must retain 28 questions and 84 lesson versions")
        require(guide_metadata.get("sourceFiles"), "Guide build metadata must identify its lesson sources")
        for item in guide_metadata["sourceFiles"]:
            require(re.fullmatch(r"lessons-[0-9-]+\.json", item.get("file", "")), "Unexpected guide lesson source filename")
            path = daruri_dir / "study" / item["file"]
            require(sha256(path.read_bytes()) == item.get("sha256"), "Guide lesson source/build metadata mismatch: " + item["file"])
        if browser_data := guide_metadata.get("browserData"):
            require(browser_data.get("file") == "study-guide-data.js", "Unexpected guide browser-data filename")
            require(sha256((daruri_dir / "study-guide-data.js").read_bytes()) == browser_data.get("sha256"), "Guide browser data/build metadata mismatch")
    else:
        require(companion["sha256"] == recorded["sha256"] and companion["bytes"] == recorded["size_bytes"], "Companion PDF/manifest mismatch; verify its build metadata and use --refresh-study-companion for an authorized replacement")
    assets = RELEASE_ASSETS + (STUDY_RELEASE_ASSETS if refresh_study_companion else ())
    refreshed_companion = companion if refresh_study_companion else None
    text = {name: data.decode("utf-8") for name, data in originals.items()}
    proposed, report = {}, {"revision": revision, "pdfs": installed, "companion_pages_preserved": 85}
    report["study_companion"] = dict(companion, refreshed=refresh_study_companion)
    proposed["index.html"], html_report = update_html(text["index.html"], metadata, revision, assets)
    proposed[EDITION_JS], edition_report = update_edition(text[EDITION_JS], metadata["daruri.pdf"])
    report.update(html_report)
    report.update(edition_report)
    proposed["pdf-editions-manifest.json"] = update_manifest(text["pdf-editions-manifest.json"], metadata, revision, edition_date, refreshed_companion)
    proposed["download-bundle.js"] = update_bundle(text["download-bundle.js"], revision, assets)
    proposed["sw.js"] = update_service_worker(text["sw.js"], revision, assets)
    # A second pass is read-only and must make no changes. This catches cache
    # suffix accumulation and accidental repeated insertion before any writes.
    require(update_html(proposed["index.html"], metadata, revision, assets)[0] == proposed["index.html"], "HTML update is not idempotent")
    require(update_edition(proposed[EDITION_JS], metadata["daruri.pdf"])[0] == proposed[EDITION_JS], "Payload update is not idempotent")
    require(update_manifest(proposed["pdf-editions-manifest.json"], metadata, revision, edition_date, refreshed_companion) == proposed["pdf-editions-manifest.json"], "Manifest update is not idempotent")
    require(update_bundle(proposed["download-bundle.js"], revision, assets) == proposed["download-bundle.js"], "Bundle update is not idempotent")
    require(update_service_worker(proposed["sw.js"], revision, assets) == proposed["sw.js"], "Service-worker update is not idempotent")
    for name in ("study-guide-data.js", "study-guide.js", "study-guide.css", "daruri-study-guide.pdf", "bou-akl-2015-variant-report.pdf", "print.css", "print.js"):
        if name in assets:
            continue
        pattern = re.escape(name) + r"[^\s\"'\\<>]*"
        require(re.findall(pattern, text["sw.js"]) == re.findall(pattern, proposed["sw.js"]), "Changed independently released SW asset " + name)
    proposed = {name: value.encode("utf-8") for name, value in proposed.items()}
    changes = {name: data for name, data in proposed.items() if data != originals[name]}
    report["files_needing_update"] = [{"path": name, "before_sha256": sha256(originals[name]), "after_sha256": sha256(data), "size_bytes": len(data)} for name, data in changes.items()]
    report["all_installed_pdfs_match"] = all(info["installed_matches"] for info in installed.values())
    report["ready"] = not changes and report["all_installed_pdfs_match"]
    return changes, snapshots, report


def apply_changes(daruri_dir, changes, snapshots):
    # Detect a rebuild or concurrent source edit after preparation. All targets
    # are staged before the first replacement, then atomically replaced per file.
    for path, digest in snapshots.items():
        require(path.exists() and sha256(path.read_bytes()) == digest, "Input changed while preparing release; rerun: " + str(path))
    staged = []
    try:
        for name, data in changes.items():
            require(name in TARGETS, "Unapproved updater target " + name)
            target = daruri_dir / name
            with tempfile.NamedTemporaryFile(prefix=".daruri-release-", dir=daruri_dir, delete=False) as handle:
                temporary = Path(handle.name)
                staged.append((temporary, target))
                handle.write(data)
            os.chmod(temporary, target.stat().st_mode & 0o777)
        for temporary, target in staged:
            os.replace(temporary, target)
    finally:
        for temporary, _ in staged:
            temporary.unlink(missing_ok=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--daruri-dir", type=Path, default=Path(__file__).resolve().parent.parent)
    parser.add_argument("--rebuilt-dir", type=Path, required=True, help="Final rebuilt PDFs and their *.metadata.json files")
    parser.add_argument("--revision", default=DEFAULT_REVISION)
    parser.add_argument("--edition-date", default="2026-10-20")
    parser.add_argument("--refresh-study-companion", action="store_true", help="Verify the installed study companion against its build metadata and refresh its manifest plus PDF/data/runtime cache URLs")
    modes = parser.add_mutually_exclusive_group()
    modes.add_argument("--dry-run", action="store_true", help="Validate and preview without writing (default)")
    modes.add_argument("--check", action="store_true", help="Exit 1 if any release file or installed PDF differs")
    modes.add_argument("--apply", action="store_true", help="Write the five release files only after final PDFs have been copied")
    args = parser.parse_args()
    try:
        require(re.fullmatch(r"[A-Za-z0-9_-]+", args.revision), "Revision must contain only letters, digits, underscore, or hyphen")
        require(re.fullmatch(r"\d{4}-\d{2}-\d{2}", args.edition_date), "Edition date must use YYYY-MM-DD")
        daruri_dir, rebuilt_dir = args.daruri_dir.resolve(), args.rebuilt_dir.resolve()
        changes, snapshots, report = prepare(daruri_dir, rebuilt_dir, args.revision, args.edition_date, args.refresh_study_companion)
        report["mode"] = "apply" if args.apply else "check" if args.check else "dry-run"
        if args.apply:
            require(report["all_installed_pdfs_match"], "Copy the five final PDFs to daruri/ before --apply; installed files do not yet match rebuilt metadata")
            apply_changes(daruri_dir, changes, snapshots)
            report["files_written"] = list(changes)
            report["files_updated"] = report["files_needing_update"]
            report["files_needing_update"] = []
            report["ready"] = True
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return 1 if args.check and not report["ready"] else 0
    except (ReleaseError, OSError, ValueError, KeyError) as exc:
        print("Release updater: " + str(exc), file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
