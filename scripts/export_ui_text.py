from __future__ import annotations

import html
import re
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
OUT = ROOT / "outputs" / "ui-text-export" / "程式介面文字.xlsx"

HAN = re.compile(r"[\u3400-\u9fff]")
QUOTED = re.compile(r"(?P<q>['\"`])(?P<s>(?:\\.|(?!\1).)*?)(?P=q)")
JSX_TEXT = re.compile(r">([^<>{}]*[\u3400-\u9fff][^<>{}]*)<")


def clean(value: str) -> str:
    value = re.sub(r"\\[nrt]", " ", value)
    value = re.sub(r"\$\{[^}]+\}", "{動態內容}", value)
    return re.sub(r"\s+", " ", value).strip()


def classify(line: str, value: str) -> str:
    if "placeholder=" in line:
        return "輸入提示"
    if "aria-label=" in line or "title=" in line:
        return "無障礙／提示"
    if "throw new Error" in line or "alert(" in line:
        return "錯誤／通知"
    if re.search(r"<(button|option)\b", line):
        return "按鈕／選項"
    if re.search(r"<(h[1-6]|PageTitle)\b", line):
        return "標題"
    return "介面文字"


rows: list[list[str | int]] = []
for path in sorted(SRC.rglob("*.ts")) + sorted(SRC.rglob("*.tsx")):
    if "test" in path.parts or path.name.endswith(".test.ts") or path.name.endswith(".test.tsx"):
        continue
    rel = path.relative_to(ROOT).as_posix()
    for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        found: list[str] = []
        found.extend(m.group(1) for m in JSX_TEXT.finditer(line))
        for match in QUOTED.finditer(line):
            text = match.group("s")
            if HAN.search(text):
                found.append(text)
        seen: set[str] = set()
        for raw in found:
            value = clean(raw)
            if not value or not HAN.search(value) or value in seen:
                continue
            seen.add(value)
            rows.append([len(rows) + 1, value, classify(line, value), rel, line_no])


def col_name(n: int) -> str:
    s = ""
    while n:
        n, r = divmod(n - 1, 26)
        s = chr(65 + r) + s
    return s


def cell(ref: str, value: str | int, style: int = 0) -> str:
    if isinstance(value, int):
        return f'<c r="{ref}" s="{style}"><v>{value}</v></c>'
    safe = html.escape(value, quote=False)
    return f'<c r="{ref}" s="{style}" t="inlineStr"><is><t xml:space="preserve">{safe}</t></is></c>'


headers = ["編號", "文字", "類型", "來源檔案", "行號"]
sheet_rows = []
for r_idx, data in enumerate([headers] + rows, 1):
    cells = "".join(cell(f"{col_name(c_idx)}{r_idx}", value, 1 if r_idx == 1 else 0) for c_idx, value in enumerate(data, 1))
    sheet_rows.append(f'<row r="{r_idx}" ht="{26 if r_idx == 1 else 20}" customHeight="1">{cells}</row>')

sheet_xml = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews><sheetView showGridLines="0" workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
  <cols><col min="1" max="1" width="9" customWidth="1"/><col min="2" max="2" width="60" customWidth="1"/><col min="3" max="3" width="18" customWidth="1"/><col min="4" max="4" width="48" customWidth="1"/><col min="5" max="5" width="10" customWidth="1"/></cols>
  <sheetData>{''.join(sheet_rows)}</sheetData>
  <autoFilter ref="A1:E{len(rows)+1}"/>
</worksheet>'''

styles_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2"><font><sz val="11"/><name val="Aptos"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Aptos"/></font></fonts>
  <fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0F766E"/><bgColor indexed="64"/></patternFill></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFill="1" applyFont="1" applyAlignment="1"><alignment vertical="center"/></xf></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>'''

files = {
    "[Content_Types].xml": '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>''',
    "_rels/.rels": '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>''',
    "xl/workbook.xml": '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="介面文字" sheetId="1" r:id="rId1"/></sheets></workbook>''',
    "xl/_rels/workbook.xml.rels": '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>''',
    "xl/worksheets/sheet1.xml": sheet_xml,
    "xl/styles.xml": styles_xml,
}

OUT.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as archive:
    for name, content in files.items():
        archive.writestr(name, content)

with zipfile.ZipFile(OUT) as archive:
    bad = archive.testzip()
    assert bad is None
    assert len(archive.namelist()) == len(files)

print(f"{OUT}|{len(rows)}")
