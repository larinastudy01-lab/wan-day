param([Parameter(Mandatory=$true)][string]$Path,[string]$Sheet='xl/worksheets/sheet2.xml')
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression
$stream=[IO.File]::OpenRead($Path);$zip=[IO.Compression.ZipArchive]::new($stream,[IO.Compression.ZipArchiveMode]::Read)
try{$entry=$zip.GetEntry($Sheet);$reader=[IO.StreamReader]::new($entry.Open());try{[xml]$x=$reader.ReadToEnd()}finally{$reader.Dispose()};$ns=[Xml.XmlNamespaceManager]::new($x.NameTable);$ns.AddNamespace('m','http://schemas.openxmlformats.org/spreadsheetml/2006/main');foreach($row in $x.SelectNodes('//m:row',$ns)){ $map=@{};foreach($c in $row.SelectNodes('m:c',$ns)){$col=([regex]::Match($c.r,'^[A-Z]+')).Value;$map[$col]=if($c.t -eq 'inlineStr'){$c.is.InnerText}else{$c.v}};if($map['D'] -eq '建議修改'){[pscustomobject]@{Row=$row.r;Original=$map['B'];Suggested=$map['C'];Tone=$map['E'];Strategy=$map['F'];Note=$map['J']}} }}finally{$zip.Dispose();$stream.Dispose()}
