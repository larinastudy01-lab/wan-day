param([Parameter(Mandatory=$true)][string]$Path)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression
$stream=[IO.File]::OpenRead($Path)
$zip=[IO.Compression.ZipArchive]::new($stream,[IO.Compression.ZipArchiveMode]::Read)
try {
  $shared=@()
  $ss=$zip.GetEntry('xl/sharedStrings.xml')
  if($ss){$rd=[IO.StreamReader]::new($ss.Open());try{[xml]$sx=$rd.ReadToEnd()}finally{$rd.Dispose()};$ns=[Xml.XmlNamespaceManager]::new($sx.NameTable);$ns.AddNamespace('m','http://schemas.openxmlformats.org/spreadsheetml/2006/main');foreach($si in $sx.SelectNodes('//m:si',$ns)){$shared+=($si.InnerText)}}
  foreach($entry in $zip.Entries | Where-Object {$_.FullName -match '^xl/worksheets/sheet\d+\.xml$'} | Sort-Object FullName){
    $rd=[IO.StreamReader]::new($entry.Open());try{[xml]$x=$rd.ReadToEnd()}finally{$rd.Dispose()}
    $ns=[Xml.XmlNamespaceManager]::new($x.NameTable);$ns.AddNamespace('m','http://schemas.openxmlformats.org/spreadsheetml/2006/main')
    Write-Output "--- $($entry.FullName) rows=$($x.SelectNodes('//m:row',$ns).Count) ---"
    foreach($row in $x.SelectNodes('//m:row',$ns) | Select-Object -First 15){
      $vals=@();foreach($c in $row.SelectNodes('m:c',$ns)){if($c.t -eq 'inlineStr'){$v=$c.is.InnerText}elseif($c.t -eq 's'){$v=$shared[[int]$c.v]}else{$v=$c.v};$vals+="$($c.r)=$v"};Write-Output ($vals -join ' | ')
    }
  }
} finally {$zip.Dispose();$stream.Dispose()}
