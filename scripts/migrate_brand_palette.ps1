$ErrorActionPreference='Stop'
$root=if($PSScriptRoot){Split-Path -Parent $PSScriptRoot}else{(Get-Location).Path}
$cssPath=Join-Path $root 'src\styles.css'
$css=[IO.File]::ReadAllText($cssPath,[Text.Encoding]::UTF8)
$marker='}*{box-sizing:border-box}'
$idx=$css.IndexOf($marker)
if($idx -lt 0){throw 'Unable to locate the original root token block.'}
$body='*{box-sizing:border-box}'+$css.Substring($idx+$marker.Length)

$tokens=@'
:root{
  color-scheme:light;
  font-family:'DM Sans','Noto Sans TC',sans-serif;
  font-synthesis:none;
  --color-brand-50:#F1F7F5;--color-brand-100:#E7F0ED;--color-brand-200:#BCD0C8;--color-brand-300:#8FB4AC;--color-brand-400:#65AAA3;--color-brand-500:#2F7F7A;--color-brand-600:#296E69;--color-brand-700:#255F5B;--color-brand-800:#315B50;--color-brand-900:#203E37;
  --color-brand-primary:#2F7F7A;--color-brand-primary-hover:#296E69;--color-brand-primary-pressed:#255F5B;--color-brand-primary-dark:#315B50;--color-brand-disabled:#C7D4D0;--color-brand-accent:#E98A45;--color-brand-accent-soft:#F9E8DA;
  --color-bg-main:#F6F1E7;--color-bg-card:#FFFFFF;--color-bg-subtle:#F1EEE7;--color-bg-elevated:#FBFAF7;--color-surface-translucent:rgba(255,255,255,.78);
  --color-text-primary:#2D3330;--color-text-secondary:#66736E;--color-text-muted:#8C9792;--color-text-on-dark:#FFFFFF;--color-text-on-dark-secondary:#D9E5E1;
  --color-border:#DED8CD;--color-border-card:#E2DDD3;--color-border-hover:#BFCFC9;--color-border-active:#2F7F7A;--color-chart-grid:#E2DDD3;
  --color-study:#527F9A;--color-study-soft:#E7EFF4;--color-health:#6F8F78;--color-health-soft:#E8F1EA;--color-work:#7E748E;--color-work-soft:#EEE8F1;--color-finance:#C79C4F;--color-finance-soft:#FAF3DF;--color-habit:#D9825B;--color-habit-soft:#F7E9E2;
  --color-warning:#D8AE5B;--color-warning-soft:#FAF3DF;--color-danger:#B85C4A;--color-danger-hover:#A64E40;--color-danger-soft:#F7E9E5;--color-success:#5F8C70;--color-success-soft:#E8F1EA;--color-info:#527F9A;--color-info-soft:#E7EFF4;
  --color-focus-bg:#315B50;--color-focus-progress:#E98A45;--color-focus-complete:#D8AE5B;--color-overlay:rgba(24,33,31,.68);--color-overlay-strong:rgba(24,33,31,.82);--color-white-subtle:rgba(255,255,255,.06);--color-white-muted:rgba(255,255,255,.22);
  --shadow-card:0 4px 18px rgba(45,51,48,.06);--shadow-soft:rgba(45,51,48,.08);--shadow-medium:rgba(24,33,31,.22);--shadow-strong:rgba(24,33,31,.34);
  --ink:var(--color-text-primary);--muted:var(--color-text-secondary);--line:var(--color-border);--coral:var(--color-brand-accent);--green:var(--color-brand-primary);--cream:var(--color-bg-main);
  color:var(--color-text-primary);background:var(--color-bg-main);
}
@media(prefers-color-scheme:dark){:root{
  color-scheme:dark;--color-bg-main:#18211F;--color-bg-card:#293532;--color-bg-subtle:#222D2A;--color-bg-elevated:#293532;--color-surface-translucent:rgba(34,45,42,.84);
  --color-text-primary:#F4F1EA;--color-text-secondary:#BCC8C3;--color-text-muted:#91A09A;--color-border:#3A4844;--color-border-card:#3A4844;--color-border-hover:#52635E;--color-chart-grid:#3A4844;
  --color-brand-primary:#65AAA3;--color-brand-primary-hover:#79BAB3;--color-brand-primary-pressed:#57958E;--color-brand-primary-dark:#315B50;--color-brand-accent:#F0A96D;--color-brand-accent-soft:#4A382D;
  --color-study:#79A7BE;--color-study-soft:#263943;--color-health:#88AA91;--color-health-soft:#2B4032;--color-work:#A08EAF;--color-work-soft:#3A3340;--color-finance:#E0BE72;--color-finance-soft:#443C28;--color-habit:#E49A75;--color-habit-soft:#49342C;
  --color-warning:#E0BE72;--color-warning-soft:#443C28;--color-danger:#D47B69;--color-danger-hover:#E08A77;--color-danger-soft:#492F2B;--color-success:#7FB18D;--color-success-soft:#2B4032;--color-info:#79A7BE;--color-info-soft:#263943;
  --color-focus-bg:#222D2A;--color-focus-progress:#F0A96D;--color-focus-complete:#E0BE72;--shadow-card:0 4px 18px rgba(0,0,0,.18);--shadow-soft:rgba(0,0,0,.12);--shadow-medium:rgba(0,0,0,.28);--shadow-strong:rgba(0,0,0,.42);
}}
'@

$exact=@{
  '#fff'='var(--color-bg-card)';'#ffffff'='var(--color-bg-card)';'#263a2d'='var(--color-focus-bg)';'#1d2821'='var(--color-brand-primary-dark)';'#1e2922'='var(--color-text-primary)';'#242923'='var(--color-text-primary)';
  '#dd7048'='var(--color-brand-accent)';'#d96e49'='var(--color-brand-accent)';'#df7954'='var(--color-brand-accent)';'#e99a75'='var(--color-brand-accent)';'#e89a74'='var(--color-brand-accent)';
  '#476b58'='var(--color-brand-primary)';'#466b57'='var(--color-brand-primary)';'#607d8b'='var(--color-study)';'#c19b45'='var(--color-finance)';'#b28a3d'='var(--color-finance)';'#806b8c'='var(--color-work)';
  '#f4f1ea'='var(--color-bg-main)';'#f5f1e9'='var(--color-bg-main)';'#f4f1eb'='var(--color-bg-main)';'#fbfaf7'='var(--color-bg-elevated)';'#e6e2d9'='var(--color-border)';'#ded8cd'='var(--color-border)';
  '#777'='var(--color-text-secondary)';'#888'='var(--color-text-secondary)';'#999'='var(--color-text-muted)';'#aaa'='var(--color-text-muted)';'#ccc'='var(--color-border-hover)';
  '#f8e4dc'='var(--color-danger-soft)';'#f9e5de'='var(--color-danger-soft)';'#f3e9cd'='var(--color-warning-soft)';'#f5ecd2'='var(--color-warning-soft)';'#e3ebe6'='var(--color-brand-100)';'#e2ebe5'='var(--color-health-soft)';'#e2edf2'='var(--color-info-soft)';'#eee7f2'='var(--color-work-soft)';
  '#3331'='var(--shadow-soft)';'#0003'='var(--shadow-medium)';'#0004'='var(--shadow-medium)';'#0005'='var(--shadow-strong)';'#0007'='var(--color-overlay)';'#fff9'='var(--color-surface-translucent)';'#ffffff10'='var(--color-white-subtle)';'#ffffff05'='var(--color-white-subtle)';'#ffffff38'='var(--color-white-muted)';'#111a15a6'='var(--color-overlay)';
  '#d96e4918'='color-mix(in srgb,var(--color-brand-accent) 10%,transparent)';'#d96e4915'='color-mix(in srgb,var(--color-brand-accent) 8%,transparent)';'#d96e4914'='color-mix(in srgb,var(--color-brand-accent) 8%,transparent)';'#d96e491c'='color-mix(in srgb,var(--color-brand-accent) 11%,transparent)';'#d96e4930'='color-mix(in srgb,var(--color-brand-accent) 19%,transparent)';'#df795438'='color-mix(in srgb,var(--color-brand-accent) 22%,transparent)';'#263a2d14'='color-mix(in srgb,var(--color-brand-primary-dark) 8%,transparent)';'#263a2d18'='color-mix(in srgb,var(--color-brand-primary-dark) 9%,transparent)';'#263a2d1c'='color-mix(in srgb,var(--color-brand-primary-dark) 11%,transparent)';'#34403008'='var(--shadow-soft)';'#72d99a20'='color-mix(in srgb,var(--color-success) 13%,transparent)'
}
$palette=@{
  '--color-brand-primary'='#2F7F7A';'--color-brand-primary-dark'='#315B50';'--color-brand-accent'='#E98A45';'--color-bg-main'='#F6F1E7';'--color-bg-card'='#FFFFFF';'--color-bg-subtle'='#F1EEE7';'--color-text-primary'='#2D3330';'--color-text-secondary'='#66736E';'--color-text-muted'='#8C9792';'--color-border'='#DED8CD';'--color-border-hover'='#BFCFC9';'--color-study'='#527F9A';'--color-study-soft'='#E7EFF4';'--color-health'='#6F8F78';'--color-health-soft'='#E8F1EA';'--color-work'='#7E748E';'--color-work-soft'='#EEE8F1';'--color-finance'='#C79C4F';'--color-finance-soft'='#FAF3DF';'--color-habit'='#D9825B';'--color-habit-soft'='#F7E9E2';'--color-danger'='#B85C4A';'--color-danger-soft'='#F7E9E5';'--color-success'='#5F8C70';'--color-success-soft'='#E8F1EA'
}
function Rgb([string]$hex){$h=$hex.TrimStart('#');if($h.Length -eq 3){$h=($h[0].ToString()*2)+($h[1].ToString()*2)+($h[2].ToString()*2)};return @([Convert]::ToInt32($h.Substring(0,2),16),[Convert]::ToInt32($h.Substring(2,2),16),[Convert]::ToInt32($h.Substring(4,2),16))}
function Closest([string]$hex){$rgb=Rgb $hex;$best=$null;$distance=[double]::PositiveInfinity;foreach($pair in $palette.GetEnumerator()){$p=Rgb $pair.Value;$d=[math]::Pow($rgb[0]-$p[0],2)+[math]::Pow($rgb[1]-$p[1],2)+[math]::Pow($rgb[2]-$p[2],2);if($d -lt $distance){$distance=$d;$best=$pair.Key}};return "var($best)"}
$body=[regex]::Replace($body,'#[0-9A-Fa-f]{3,8}\b',{param($m)$key=$m.Value.ToLower();if($exact.ContainsKey($key)){return $exact[$key]};if($key.Length -in 5,9){return 'var(--shadow-soft)'};return Closest $key})
[IO.File]::WriteAllText($cssPath,$tokens+$body,[Text.UTF8Encoding]::new($false))

$seedPath=Join-Path $root 'src\domain\seeds.ts';$seed=[IO.File]::ReadAllText($seedPath,[Text.Encoding]::UTF8)
$seed=$seed.Replace("'#dd7048'",'uiColors.accent').Replace("'#476b58'",'uiColors.brand').Replace("'#607d8b'",'uiColors.study').Replace("'#c19b45'",'uiColors.finance').Replace("'#b28a3d'",'uiColors.finance')
[IO.File]::WriteAllText($seedPath,$seed,[Text.UTF8Encoding]::new($false))
