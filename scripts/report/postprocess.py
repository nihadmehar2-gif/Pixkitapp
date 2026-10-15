"""Post-process the report docx for WPS compatibility (per docx skill toc.md):
1. Footer PAGE fields get explicit format switches (Roman for front matter, arabic for body).
2. Remove empty <w:pgNumType/> elements (cover section)."""
import zipfile, shutil, re, os, sys

SRC = "/home/z/my-project/download/PixKitApp-SEO-Report-and-Checklist.docx"
TMP = SRC + ".tmp"

with zipfile.ZipFile(SRC, "r") as zin:
    names = zin.namelist()
    items = {n: zin.read(n) for n in names}

# --- document.xml: remove empty pgNumType (docx-js emits for sections without pageNumbers)
doc = items["word/document.xml"].decode("utf-8")
before = doc.count("<w:pgNumType/>")
doc = doc.replace("<w:pgNumType/>", "")
items["word/document.xml"] = doc.encode("utf-8")
print(f"removed {before} empty pgNumType elements")

# --- footers: find which footer is referenced by which section.
# Sections in order: cover (no footer), front matter (Roman), body (arabic).
# Map footer files to sections by scanning document.xml sectPr order.
sect_footers = re.findall(r'<w:footerReference w:type="default" r:id="(rId\d+)"/>', doc)
rels = items["word/_rels/document.xml.rels"].decode("utf-8")
rid_to_file = dict(re.findall(r'Id="(rId\d+)"[^>]*Target="(footer\d+\.xml)"', rels))
footer_files = [rid_to_file.get(r) for r in sect_footers if rid_to_file.get(r)]
print("section footer files in order:", footer_files)

def patch_footer(name, fmt):
    xml = items[f"word/{name}"].decode("utf-8")
    xml2, n = re.subn(
        r'(<w:instrText[^>]*>)\s*PAGE\s*(</w:instrText>)',
        rf'\1 PAGE \\* {fmt} \\* MERGEFORMAT \2',
        xml)
    items[f"word/{name}"] = xml2.encode("utf-8")
    print(f"{name}: patched {n} PAGE fields -> \\* {fmt}")

# first footer-bearing section = front matter (Roman), second = body (arabic)
if len(footer_files) >= 1:
    patch_footer(footer_files[0], "ROMAN")
if len(footer_files) >= 2:
    for f in footer_files[1:]:
        patch_footer(f, "arabic")

with zipfile.ZipFile(TMP, "w", zipfile.ZIP_DEFLATED) as zout:
    for n in names:
        zout.writestr(n, items[n])
shutil.move(TMP, SRC)
print("post-processing done")
