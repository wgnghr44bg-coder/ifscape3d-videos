# Maakt een cartoon-video helemaal op de pc: ophalen, (eenmalig) installeren, stem, tijden, beeld, kopie naar Video's.
# Gebruik (PowerShell, in de map ifscape3d-videos):
#   powershell -ExecutionPolicy Bypass -File tools\cartoon\maak-video.ps1
#   powershell -ExecutionPolicy Bypass -File tools\cartoon\maak-video.ps1 -Map 2026-10-20-clone-yourself -NieuweStem
param(
  [string]$Map = "2026-10-20-clone-yourself",
  [string]$Branch = "claude/video-what-if-simple-xxvouf",
  [string]$VoxLux = "..\vox-lux-alteraqon",
  [string]$StemPython = "C:\Users\rane\Documents\Standaardproject\whatif\stem-env\Scripts\python.exe",
  [string]$Uit = "C:\Users\rane\Videos\alteraqon\ifscape3d",
  [switch]$NieuweStem,   # stem opnieuw maken, ook als voice.mp3 er al is
  [switch]$GeenPush      # stem en tijden niet terug naar GitHub sturen
)
$ErrorActionPreference = "Stop"
function Stap($t) { Write-Host "`n=== $t ===" -ForegroundColor Cyan }
function Check($wat) { if ($LASTEXITCODE -ne 0) { Write-Host "FOUT bij: $wat" -ForegroundColor Red; exit 1 } }

Set-Location (Resolve-Path "$PSScriptRoot\..\..")
if (-not (Test-Path $VoxLux)) { $VoxLux = "..\vox-lux" }
$VoxLux = (Resolve-Path $VoxLux).Path
$MapPad = Join-Path (Get-Location) $Map

Stap "1. Nieuwste versie ophalen ($Branch)"
git fetch origin $Branch; Check "git fetch"
git checkout $Branch; Check "git checkout"
git pull origin $Branch; Check "git pull"
Push-Location $VoxLux; git pull; Pop-Location

Stap "2. Programma's controleren"
foreach ($p in "node", "npm", "ffmpeg", "python") {
  if (-not (Get-Command $p -ErrorAction SilentlyContinue)) { Write-Host "$p ontbreekt. Installeer het eerst (node: https://nodejs.org)." -ForegroundColor Red; exit 1 }
}
if (-not (Test-Path $StemPython)) { Write-Host "Stem-python niet gevonden: $StemPython" -ForegroundColor Red; exit 1 }
if (-not (Test-Path "node_modules\playwright")) {
  Write-Host "Playwright installeren (eenmalig)..."
  npm install playwright; Check "npm install playwright"
  npx playwright install chromium; Check "playwright install chromium"
}

Stap "3. Stem maken (Chatterbox, gratis)"
if ($NieuweStem -or -not (Test-Path "$MapPad\voice.mp3")) {
  Push-Location $VoxLux
  & $StemPython tools\comfy\make_voice_local.py $MapPad
  $code = $LASTEXITCODE; Pop-Location
  if ($code -ne 0) { Write-Host "FOUT bij: stem maken" -ForegroundColor Red; exit 1 }
} else { Write-Host "voice.mp3 bestaat al (gebruik -NieuweStem om opnieuw te maken)." }

Stap "4. Tijden uit de stem"
python tools\cartoon\timing.py $Map --vox-lux $VoxLux; Check "timing.py"

Stap "5. Video maken"
node tools\cartoon\render.mjs $Map; Check "render.mjs"

Stap "6. Kopie naar $Uit"
New-Item -ItemType Directory -Force -Path $Uit | Out-Null
$slug = ($Map -replace '^\d{4}-\d{2}-\d{2}-', '')
Copy-Item "$MapPad\build\video.mp4" (Join-Path $Uit "$slug.mp4") -Force

if (-not $GeenPush) {
  Stap "7. Stem + tijden naar GitHub (zodat Claude kan meekijken)"
  git add "$Map\voice.mp3" "$Map\voice-times.tsv" "$Map\timing.json" "$Map\CHECK.jpg"
  git commit -m "Stem + tijden voor $Map (gemaakt op de pc)"
  if ($LASTEXITCODE -eq 0) { git push origin $Branch }
}
Write-Host "`nKLAAR: $(Join-Path $Uit "$slug.mp4")" -ForegroundColor Green
