# ALLE Quaternius CC0-pakketten downloaden -> assets\downloads\quaternius (niet in git; enkele GB, duurt lang)
# Gebruik (in de map ifscape3d-videos):  powershell -ExecutionPolicy Bypass -File tools\download-quaternius.ps1
# Nog eens draaien gaat verder waar het was: wat er al staat wordt overgeslagen.
$ErrorActionPreference = "Continue"
$dest = "assets\downloads\quaternius"
New-Item -ItemType Directory -Force -Path $dest | Out-Null
if (-not (Select-String -Path .gitignore -Pattern "^assets/downloads/" -Quiet -ErrorAction SilentlyContinue)) { Add-Content .gitignore "assets/downloads/" }
python -m pip install --quiet --upgrade gdown

$index = (Invoke-WebRequest "https://quaternius.com/" -UseBasicParsing).Content
$packs = [regex]::Matches($index, '/packs/([a-z0-9]+)\.html') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
Write-Host "$($packs.Count) pakketten gevonden" -ForegroundColor Cyan

$failed = @(); $i = 0
foreach ($p in $packs) {
  $i++
  $out = Join-Path $dest $p
  if ((Get-ChildItem $out -Recurse -File -ErrorAction SilentlyContinue | Where-Object Length -gt 10KB).Count -gt 0) {
    Write-Host "[$i/$($packs.Count)] $p staat er al" -ForegroundColor DarkGray; continue
  }
  $page = (Invoke-WebRequest "https://quaternius.com/packs/$p.html" -UseBasicParsing).Content
  $m = [regex]::Match($page, 'drive\.google\.com/drive/folders/([A-Za-z0-9_-]+)')
  if (-not $m.Success) { Write-Host "[$i] $p : geen Drive-link (alleen via Patreon/itch)" -ForegroundColor DarkYellow; continue }
  $id = $m.Groups[1].Value
  Write-Host "[$i/$($packs.Count)] $p" -ForegroundColor Cyan
  python -m gdown --folder "https://drive.google.com/drive/folders/$id" -O $out --remaining-ok 2>&1 | Tee-Object -Variable log | Out-Null
  $files = (Get-ChildItem $out -Recurse -File -ErrorAction SilentlyContinue | Where-Object Length -gt 10KB).Count
  if ($log -match "Failed to download|Too many users" -or $files -eq 0) {
    Write-Host "  niet (helemaal) gelukt" -ForegroundColor Yellow
    $failed += "$p  https://drive.google.com/drive/folders/$id"
  } else { Write-Host "  OK: $files bestanden" -ForegroundColor Green }
  Start-Sleep -Seconds 8
}
$failed | Set-Content (Join-Path $dest "NIET-GELUKT.txt")
Write-Host "`nKlaar. Niet gelukt: $($failed.Count) (lijst in $dest\NIET-GELUKT.txt)" -ForegroundColor Cyan
Write-Host "Draai het script later nog eens: wat er al staat wordt overgeslagen."
