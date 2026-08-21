param([Parameter(Mandatory=$true)][string]$InputPath,[Parameter(Mandatory=$true)][string]$OutputPath)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression

$changes=@{
  2='每天顧一點，生活慢慢就會順起來。'
  24='完成！這段時間已幫你記下來。'
  25='{動態內容} +{動態內容} 分鐘，已幫你記下來。'
  28='任務已刪除。'
  31='筆記已刪除。'
  34='目標已刪除。'
  37='專案已刪除。'
  40='先幫你收著。'
  63='備份完成。'
  64='資料匯入完成。'
  77='記好了！'
  78='改好了。'
  80='今天先顧好重要的事就好。'
  87='持續前進中'
  88='今天最重要的事'
  89='查看今天的所有任務'
  96='還有 1.5 小時可安排'
  97='進行中'
  101='專注'
  242='今天的健康紀錄已更新。'
  262='開始寫'
  320='任務已更新。'
  921='今天的學習'
  929='今天的科目分布'
}

[IO.Directory]::CreateDirectory((Split-Path -Parent $OutputPath))|Out-Null
[IO.File]::Copy($InputPath,$OutputPath,$true)
$stream=[IO.File]::Open($OutputPath,[IO.FileMode]::Open,[IO.FileAccess]::ReadWrite)
$zip=[IO.Compression.ZipArchive]::new($stream,[IO.Compression.ZipArchiveMode]::Update)
try{
  $entry=$zip.GetEntry('xl/worksheets/sheet2.xml')
  $reader=[IO.StreamReader]::new($entry.Open(),[Text.Encoding]::UTF8)
  try{[xml]$xml=$reader.ReadToEnd()}finally{$reader.Dispose()}
  $ns=[Xml.XmlNamespaceManager]::new($xml.NameTable)
  $ns.AddNamespace('m','http://schemas.openxmlformats.org/spreadsheetml/2006/main')
  foreach($rowNumber in $changes.Keys){
    $cell=$xml.SelectSingleNode("//m:row[@r='$rowNumber']/m:c[@r='C$rowNumber']",$ns)
    if(-not $cell){throw "Missing target cell C$rowNumber"}
    if($cell.t -eq 'inlineStr'){$cell.is.InnerText=$changes[$rowNumber]}
    else{
      while($cell.HasChildNodes){[void]$cell.RemoveChild($cell.FirstChild)}
      $cell.SetAttribute('t','inlineStr')
      $is=$xml.CreateElement('is','http://schemas.openxmlformats.org/spreadsheetml/2006/main')
      $t=$xml.CreateElement('t','http://schemas.openxmlformats.org/spreadsheetml/2006/main')
      $t.InnerText=$changes[$rowNumber];[void]$is.AppendChild($t);[void]$cell.AppendChild($is)
    }
  }
  $entry.Delete()
  $newEntry=$zip.CreateEntry('xl/worksheets/sheet2.xml',[IO.Compression.CompressionLevel]::Optimal)
  $writer=[IO.StreamWriter]::new($newEntry.Open(),[Text.UTF8Encoding]::new($false))
  try{$xml.Save($writer)}finally{$writer.Dispose()}
}finally{$zip.Dispose();$stream.Dispose()}

$stream=[IO.File]::OpenRead($OutputPath)
$zip=[IO.Compression.ZipArchive]::new($stream,[IO.Compression.ZipArchiveMode]::Read)
try{
  $entry=$zip.GetEntry('xl/worksheets/sheet2.xml');$reader=[IO.StreamReader]::new($entry.Open(),[Text.Encoding]::UTF8)
  try{[xml]$check=$reader.ReadToEnd()}finally{$reader.Dispose()}
  $ns=[Xml.XmlNamespaceManager]::new($check.NameTable);$ns.AddNamespace('m','http://schemas.openxmlformats.org/spreadsheetml/2006/main')
  foreach($rowNumber in $changes.Keys){$actual=$check.SelectSingleNode("//m:row[@r='$rowNumber']/m:c[@r='C$rowNumber']",$ns).InnerText;if($actual -ne $changes[$rowNumber]){throw "Verification failed at C$rowNumber"}}
  Write-Output "$OutputPath|$($changes.Count)|$($zip.Entries.Count)"
}finally{$zip.Dispose();$stream.Dispose()}
