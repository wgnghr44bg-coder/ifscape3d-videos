# ALLE Quaternius CC0-pakketten downloaden -> assets\downloads\quaternius (niet in git; enkele GB, duurt lang)
# Gebruik (in de map ifscape3d-videos):  powershell -ExecutionPolicy Bypass -File tools\download-quaternius.ps1
# Nodig: je Google-inlog als cookies in %USERPROFILE%\.cache\gdown\cookies.txt (anders weigert Google: "Too many users").
# Nog eens draaien is veilig: bestanden die er al zijn worden overgeslagen, alleen ontbrekende worden opnieuw geprobeerd.
$ErrorActionPreference = "Continue"
$dest = "assets\downloads\quaternius"
New-Item -ItemType Directory -Force -Path $dest | Out-Null
if (-not (Select-String -Path .gitignore -Pattern "^assets/downloads/" -Quiet -ErrorAction SilentlyContinue)) { Add-Content .gitignore "assets/downloads/" }
if (-not (Test-Path "$env:USERPROFILE\.cache\gdown\cookies.txt")) { Write-Host "Let op: geen cookies.txt gevonden; Google weigert dan vaak." -ForegroundColor Yellow }
python -m pip install --quiet --upgrade gdown 2>$null

$index = (Invoke-WebRequest "https://quaternius.com/" -UseBasicParsing).Content
$packs = [regex]::Matches($index, '/packs/([a-z0-9]+)\.html') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
Write-Host "$($packs.Count) pakketten gevonden" -ForegroundColor Cyan

function Get-Pack($p, $id, $out) {
  # -c (continue): bestanden die er al helemaal zijn worden niet opnieuw gedownload
  $log = python -m gdown --folder "https://drive.google.com/drive/folders/$id" -O $out -c 2>&1 | Out-String
  $k = $log.IndexOf('Failed to download the following files')
  if ($k -lt 0) { return @() }
  return @([regex]::Matches($log.Substring($k), '(?m)^- (.+)$') | ForEach-Object { $_.Groups[1].Value.Trim() })
}

$report = @(); $i = 0
foreach ($p in $packs) {
  $i++
  $page = (Invoke-WebRequest "https://quaternius.com/packs/$p.html" -UseBasicParsing).Content
  $m = [regex]::Match($page, 'drive\.google\.com/drive/folders/([A-Za-z0-9_-]+)')
  if (-not $m.Success) { Write-Host "[$i/$($packs.Count)] $p : geen Drive-link (alleen via Patreon/itch)" -ForegroundColor DarkGray; continue }
  $id = $m.Groups[1].Value; $out = Join-Path $dest $p
  Write-Host "[$i/$($packs.Count)] $p" -ForegroundColor Cyan
  $bad = Get-Pack $p $id $out
  $ok = (Get-ChildItem $out -Recurse -File -ErrorAction SilentlyContinue).Count
  if ($bad.Count -eq 0) { Write-Host "  OK: $ok bestanden" -ForegroundColor Green }
  else { Write-Host "  $ok bestanden binnen, $($bad.Count) mislukt (wordt aan het eind opnieuw geprobeerd)" -ForegroundColor Yellow
         $report += [pscustomobject]@{ Pack = $p; Id = $id; Out = $out } }
  Start-Sleep -Seconds 6
}

# tweede ronde: alleen de pakketten met mislukte bestanden, na een pauze
$still = @()
if ($report.Count) {
  Write-Host "`nTweede ronde voor $($report.Count) pakketten (eerst 2 minuten pauze)..." -ForegroundColor Cyan
  Start-Sleep -Seconds 120
  foreach ($r in $report) {
    $bad = Get-Pack $r.Pack $r.Id $r.Out
    if ($bad.Count) { Write-Host "  $($r.Pack): nog $($bad.Count) mislukt" -ForegroundColor Yellow
                      $still += "$($r.Pack)  https://drive.google.com/drive/folders/$($r.Id)"; $still += ($bad | ForEach-Object { "    $_" }) }
    else { Write-Host "  $($r.Pack): nu compleet" -ForegroundColor Green }
    Start-Sleep -Seconds 6
  }
}
$still | Set-Content (Join-Path $dest "NIET-GELUKT.txt")
$total = (Get-ChildItem $dest -Recurse -File).Count; $size = [math]::Round(((Get-ChildItem $dest -Recurse -File | Measure-Object Length -Sum).Sum / 1GB), 2)
Write-Host "`nKlaar: $total bestanden, $size GB in $dest" -ForegroundColor Cyan
if ($still.Count) { Write-Host "Nog niet gelukt: zie $dest\NIET-GELUKT.txt. Draai het script later (paar uur) nog eens." -ForegroundColor Yellow }
else { Write-Host "Alles binnen. Verwijder nu je cookies: Remove-Item `"$env:USERPROFILE\.cache\gdown\cookies.txt`"" -ForegroundColor Green }
