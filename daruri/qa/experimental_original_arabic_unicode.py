#!/usr/bin/env python3
"""EXPERIMENTAL Daruri original-source Arabic search layer.

Consumes SHA-verified Pango coordinates from PR #38; never modifies the existing
PDF or its word maps. An invisible Type0/CIDFontType2 ToUnicode layer is appended
to a new diagnostic copy of the PDF. Do not publish output as an edition until
native PDFKit/PDFium/Acrobat/PDF.js and complete text/footnote/links checks pass.
"""
from __future__ import annotations
import argparse
from collections import defaultdict
import hashlib
import json
from pathlib import Path
import subprocess
import unicodedata
import fitz
from fontTools.ttLib import TTFont

def newobj(pdf, text="<<>>"):
    x = pdf.get_new_xref()
    pdf.update_object(x, text)
    return x

def stream(pdf, data):
    x = newobj(pdf, "<< /Length 0 >>")
    pdf.update_stream(x, data)
    return x

def cmap(tokens):
    lines = [
        "/CIDInit /ProcSet findresource begin", "12 dict begin", "begincmap",
        "/CIDSystemInfo << /Registry (Gnamma) /Ordering (OriginalText) /Supplement 0 >> def",
        "/CMapName /GnammaOriginalArabic def", "/CMapType 2 def",
        "1 begincodespacerange", "<0000> <FFFF>", "endcodespacerange"]
    for start in range(0, len(tokens), 100):
        group = tokens[start:start+100]
        lines.append(str(len(group)) + " beginbfchar")
        for cid, entry in group:
            # Explicit scalar reversal proved necessary for both MuPDF and Poppler
            # in the controlled UNVOWELLED pilot; vowelled is not yet certified.
            word = entry[0][::-1]
            lines.append(f"<{cid:04X}> <{word.encode('utf-16be').hex().upper()}>")
        lines.append("endbfchar")
    lines.extend(["endcmap", "CMapName currentdict /CMap defineresource pop", "end", "end"])
    return ("\n".join(lines) + "\n").encode("ascii")

def ordered_words(mapped, max_segments):
    keys = sorted((x for x in mapped["segments"] if x.endswith(":ar") or x.endswith(":vocalized")),
                  key=lambda k: (int(k.split(":")[0]), int(k.split(":")[1])))
    if max_segments: keys=keys[:max_segments]
    bypage=defaultdict(list)
    for key in keys:
        lines=[]
        for item in mapped["segments"][key]:
            word, num, x0, y0, x1, y1 = item
            if not word or not (x0 < x1 and y0 < y1):
                raise ValueError("Invalid Pango word rectangle")
            if lines and lines[-1][0] == num and abs(lines[-1][1]-y0) < 0.4:
                lines[-1][2].append(item)
            else:
                lines.append((num, y0, [item]))
        for num, y, rows in lines:
            # Preserve source line order; reverse only the horizontal word order.
            for row in sorted(rows, key=lambda z: z[2]):
                bypage[int(num)].append(row)
    return bypage, len(keys)

def same_links(links_a, links_b, tolerance=0.002):
    """Compare exact targets/multiplicity, ignoring PDF-object ID renumbering.

    Save/garbage collection can legitimately change link xrefs and introduce
    sub-millipoint coordinate roundoff without changing a link destination.
    """
    if len(links_a)!=len(links_b):return False
    def equal(a,b):
        ka=set(a)-{"xref"}; kb=set(b)-{"xref"}
        if ka!=kb:return False
        for key in ka:
            va,vb=a[key],b[key]
            if isinstance(va,(fitz.Rect,fitz.Point)):
                if type(va)!=type(vb) or len(va)!=len(vb):return False
                if any(abs(float(x)-float(y))>tolerance for x,y in zip(va,vb)):return False
            elif isinstance(va,float) and isinstance(vb,(float,int)):
                if abs(va-vb)>tolerance:return False
            elif va!=vb:return False
        return True
    pending=list(links_b)
    for item in links_a:
        where=next((i for i,other in enumerate(pending) if equal(item,other)),None)
        if where is None:return False
        pending.pop(where)
    return not pending

def build(source, mapping_file, font_path, output, max_segments, diagnostic=False):
    source=Path(source);mapping_file=Path(mapping_file)
    font_path=Path(font_path);output=Path(output)
    if source.resolve()==output.resolve() or output.exists():
        raise ValueError("Refusing overwrite of source or an existing PDF")
    manifest=json.loads(mapping_file.read_text(encoding="utf-8"))
    digest=hashlib.sha256(source.read_bytes()).hexdigest()
    if manifest["source_sha256"] != digest:
        raise ValueError("Refusing mismatched SHA-bound source/Pango map")
    page_words, count=ordered_words(manifest,max_segments)
    tokens=[(i, item) for i,item in enumerate((w for n in sorted(page_words) for w in page_words[n]), 1)]
    if not tokens or len(tokens)>65000:raise ValueError("Unsupported number of Arabic words")
    tt=TTFont(str(font_path)); marker_gid=tt.getGlyphID(tt.getBestCmap()[ord("ا")])
    gids=bytearray(2*(len(tokens)+1))
    widths=[]
    pages=defaultdict(list)
    for cid,(word,num,x0,y0,x1,y1) in tokens:
        gids[2*cid]=marker_gid>>8;gids[2*cid+1]=marker_gid&255
        widths.append(f"{cid} [{max(100,min(10000,round((x1-x0)/13*1000)))}]")
        pages[int(num)].append((cid,x0,y0))
    with fitz.open(source) as pdf:
        embedded=stream(pdf,font_path.read_bytes())
        descriptor=newobj(pdf,
            "<< /Type /FontDescriptor /FontName /GnammaOriginalArabic /Flags 4 "
            "/FontBBox [-600 -700 1700 1500] /ItalicAngle 0 /Ascent 1069 /Descent -634 "
            f"/CapHeight 900 /StemV 80 /FontFile2 {embedded} 0 R >>")
        cmapgid=stream(pdf,bytes(gids))
        descendant=newobj(pdf,
            "<< /Type /Font /Subtype /CIDFontType2 /BaseFont /GnammaOriginalArabic "
            "/CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> "
            f"/FontDescriptor {descriptor} 0 R /DW 500 /W [{' '.join(widths)}] "
            f"/CIDToGIDMap {cmapgid} 0 R >>")
        unicode_map=stream(pdf,cmap(tokens))
        type0=("<< /Type /Font /Subtype /Type0 /BaseFont /GnammaOriginalArabic "
               f"/Encoding /Identity-H /DescendantFonts [{descendant} 0 R] "
               f"/ToUnicode {unicode_map} 0 R >>")
        for num, rows in sorted(pages.items()):
            if not 1 <= num <= len(pdf):raise ValueError("Pango page outside document")
            p=pdf[num-1]
            p.wrap_contents()
            fontref=p.insert_font(fontname="GnammaSem",fontfile=str(font_path))
            pdf.update_object(fontref,type0)
            commands=["q", "BT", "/GnammaSem 13 Tf", "3 Tr"]
            for cid,x0,y0 in rows:
                ypdf=p.rect.height-(y0+16)
                commands.extend([f"1 0 0 1 {x0:.3f} {ypdf:.3f} Tm",f"<{cid:04X}> Tj"])
            commands.extend(["ET", "Q"])
            newstream=stream(pdf,("\n".join(commands)+"\n").encode("ascii"))
            refs=p.get_contents()
            pdf.xref_set_key(p.xref,"Contents","["+" ".join(f"{x} 0 R" for x in refs+[newstream])+"]")
        output.parent.mkdir(parents=True,exist_ok=True)
        pdf.save(output,garbage=4,deflate=True)
    with fitz.open(source) as a,fitz.open(output) as b:
        if len(a)!=len(b) or a.get_toc()!=b.get_toc():raise RuntimeError("Page/outline parity failed")
        for i in range(len(a)):
            if not same_links(a[i].get_links(),b[i].get_links()):
                raise RuntimeError("Semantic link target or geometry changed, page "+str(i+1))
            if a[i].get_pixmap(alpha=False).samples!=b[i].get_pixmap(alpha=False).samples:
                raise RuntimeError("Rendered pixels changed, page "+str(i+1))
        # Native extraction and search are checked independently, not assumed
        # from ToUnicode definitions.
        first_key=sorted((k for k in manifest["segments"] if k.endswith((":ar",":vocalized"))),
                         key=lambda k:(int(k.split(":")[0]),int(k.split(":")[1])))[0]
        first_words=manifest["segments"][first_key]
        phrase=first_words[0][0]+" "+first_words[1][0]
        source_page=int(first_words[0][1])
        mupdf=bool(b[source_page-1].search_for(phrase))
        poppler=subprocess.check_output(
            ["pdftotext","-f",str(source_page),"-l",str(source_page),str(output),"-"],
            timeout=35).decode("utf-8","replace")
        poppler_ok=phrase in poppler
        report={"experimental":True,"source_sha256":digest,"segments":count,
                "arabic_words":len(tokens),"augmented_pages":len(pages),"pages_preserved":len(a),
                "pixels_identical":True,"all_links_preserved":True,
                "pilot_phrase":phrase,"pilot_page":source_page,
                "mupdf_phrase_found":mupdf,"poppler_phrase_found":poppler_ok,
                "source_pdf_untouched":True,"diagnostic_only":diagnostic}
        print(json.dumps(report,ensure_ascii=False,indent=2),flush=True)
        if count and not (mupdf and poppler_ok) and not diagnostic:
            raise RuntimeError("Two-engine original-Arabic phrase smoke failed")
        return report

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--input",required=True)
    parser.add_argument("--map",required=True)
    parser.add_argument("--font",required=True)
    parser.add_argument("--output",required=True)
    parser.add_argument("--limit",type=int,default=1)
    parser.add_argument("--report")
    parser.add_argument("--diagnostic",action="store_true")
    args=parser.parse_args()
    results=build(args.input,args.map,args.font,args.output,args.limit,args.diagnostic)
    if args.report:
        Path(args.report).write_text(json.dumps(results,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
