$ErrorActionPreference = 'Stop'
$root = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { (Get-Location).Path }
$src = Join-Path $root 'src'
$outDir = Join-Path $root 'outputs\ui-text-export'
$out = Join-Path $outDir '程式介面文字.xlsx'

function Escape-Xml([string]$text) { return [System.Security.SecurityElement]::Escape($text) }
function Cell([string]$ref, $value, [int]$style = 0) {
  if ($value -is [int]) { return "<c r=`"$ref`" s=`"$style`"><v>$value</v></c>" }
  $safe = Escape-Xml ([string]$value)
  return "<c r=`"$ref`" s=`"$style`" t=`"inlineStr`"><is><t xml:space=`"preserve`">$safe</t></is></c>"
}
function Col-Name([int]$n) {
  $s = ''
  while ($n -gt 0) { $n--; $s = [char](65 + ($n % 26)) + $s; $n = [math]::Floor($n / 26) }
  return $s
}

$rows = [System.Collections.Generic.List[object]]::new()
$id = 0
$files = Get-ChildItem -LiteralPath $src -Recurse -File | Where-Object { $_.Extension -in '.ts','.tsx' -and $_.Name -notmatch '\.test\.' -and $_.FullName -notmatch '[\\/]test[\\/]' } | Sort-Object FullName
foreach ($file in $files) {
  $lineNo = 0
  foreach ($line in [System.IO.File]::ReadLines($file.FullName)) {
    $lineNo++
    $found = [System.Collections.Generic.List[string]]::new()
    foreach ($m in [regex]::Matches($line, '>([^<>{}]*[\u3400-\u9fff][^<>{}]*)<')) { $found.Add($m.Groups[1].Value) }
    foreach ($m in [regex]::Matches($line, '([''"`])((?:\\.|(?!\1).)*?)\1')) {
      if ($m.Groups[2].Value -match '[\u3400-\u9fff]') { $found.Add($m.Groups[2].Value) }
    }
    $seen = @{}
    foreach ($raw in $found) {
      $value = ($raw -replace '\\[nrt]', ' ' -replace '\$\{[^}]+\}', '{動態內容}' -replace '\s+', ' ').Trim()
      if (-not $value -or $value -notmatch '[\u3400-\u9fff]' -or $seen.ContainsKey($value)) { continue }
      $seen[$value] = $true
      $type = if ($line -match 'placeholder=') {'輸入提示'} elseif ($line -match 'aria-label=|title=') {'無障礙／提示'} elseif ($line -match 'throw new Error|alert\(') {'錯誤／通知'} elseif ($line -match '<(button|option)\b') {'按鈕／選項'} elseif ($line -match '<(h[1-6]|PageTitle)\b') {'標題'} else {'介面文字'}
      $id++
      $rel = $file.FullName.Substring($root.Length + 1).Replace('\','/')
      $rows.Add(@($id, $value, $type, $rel, $lineNo))
    }
  }
}

$allRows = [System.Collections.Generic.List[object]]::new()
$allRows.Add(@('編號','文字','類型','來源檔案','行號'))
foreach ($row in $rows) { $allRows.Add($row) }
$sheetRows = [System.Text.StringBuilder]::new()
for ($r = 0; $r -lt $allRows.Count; $r++) {
  $cells = [System.Text.StringBuilder]::new()
  for ($c = 0; $c -lt 5; $c++) { [void]$cells.Append((Cell "$(Col-Name ($c+1))$($r+1)" $allRows[$r][$c] $(if ($r -eq 0) {1} else {0}))) }
  [void]$sheetRows.Append("<row r=`"$($r+1)`" ht=`"$(if ($r -eq 0) {26} else {20})`" customHeight=`"1`">$cells</row>")
}

$sheetXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView showGridLines="0" workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="1" width="9" customWidth="1"/><col min="2" max="2" width="60" customWidth="1"/><col min="3" max="3" width="18" customWidth="1"/><col min="4" max="4" width="48" customWidth="1"/><col min="5" max="5" width="10" customWidth="1"/></cols><sheetData>' + $sheetRows + '</sheetData><autoFilter ref="A1:E' + $allRows.Count + '"/></worksheet>'
$stylesXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Aptos"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Aptos"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0F766E"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFill="1" applyFont="1" applyAlignment="1"><alignment vertical="center"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>'
$parts = @{
  '[Content_Types].xml'='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>'
  '_rels/.rels'='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'
  'xl/workbook.xml'='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="介面文字" sheetId="1" r:id="rId1"/></sheets></workbook>'
  'xl/_rels/workbook.xml.rels'='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'
  'xl/worksheets/sheet1.xml'=$sheetXml
  'xl/styles.xml'=$stylesXml
}

[System.IO.Directory]::CreateDirectory($outDir) | Out-Null
if (Test-Path -LiteralPath $out) { Remove-Item -LiteralPath $out }
Add-Type -AssemblyName System.IO.Compression
$stream = [System.IO.File]::Open($out, [System.IO.FileMode]::CreateNew)
$zip = [System.IO.Compression.ZipArchive]::new($stream, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($name in $parts.Keys) {
    $entry = $zip.CreateEntry($name)
    $writer = [System.IO.StreamWriter]::new($entry.Open(), [System.Text.UTF8Encoding]::new($false))
    try { $writer.Write($parts[$name]) } finally { $writer.Dispose() }
  }
} finally { $zip.Dispose(); $stream.Dispose() }

$checkStream = [System.IO.File]::OpenRead($out)
$checkZip = [System.IO.Compression.ZipArchive]::new($checkStream, [System.IO.Compression.ZipArchiveMode]::Read)
try { if ($checkZip.Entries.Count -ne 6) { throw 'XLSX package verification failed.' } } finally { $checkZip.Dispose(); $checkStream.Dispose() }
Write-Output "$out|$($rows.Count)"
