# Poly Pizza (low-poly, CC0 / CC-BY) downloaden per zoekwoord -> assets\downloads\polypizza (NIET in git:
# volgens de API-voorwaarden mag je de verzameling niet doorgeven; alleen modellen die je gebruikt gaan de repo in).
# API-sleutel (van poly.pizza/settings/api) staat in %USERPROFILE%\.polypizza-key.txt
#
#   Test (1 zoekwoord, laat zien wat de API teruggeeft):
#     powershell -ExecutionPolicy Bypass -File tools\download-polypizza.ps1 -Test
#   Alles (standaardlijst zoekwoorden):
#     powershell -ExecutionPolicy Bypass -File tools\download-polypizza.ps1
#   Eigen zoekwoorden:
#     powershell -ExecutionPolicy Bypass -File tools\download-polypizza.ps1 -Words "volcano","lighthouse" -PerWord 40
param([switch]$Test, [string[]]$Words, [int]$PerWord = 32)
$ErrorActionPreference = "Continue"
$keyFile = "$env:USERPROFILE\.polypizza-key.txt"
if (-not (Test-Path $keyFile)) { Write-Host "Geen API-sleutel in $keyFile" -ForegroundColor Red; exit 1 }
$key = (Get-Content $keyFile -Raw).Trim()
$headers = @{ "x-auth-token" = $key }
$dest = "assets\downloads\polypizza"
New-Item -ItemType Directory -Force -Path $dest | Out-Null
if (-not (Select-String -Path .gitignore -Pattern "^assets/downloads/" -Quiet -ErrorAction SilentlyContinue)) { Add-Content .gitignore "assets/downloads/" }

if (-not $Words) {
  $Words = @(
    # mensen en dieren
    "person","man","woman","child","crowd","police","firefighter","astronaut","soldier",
    "dog","cat","horse","cow","sheep","pig","chicken","bird","eagle","fish","shark","whale","dolphin","bear","wolf","deer","lion","elephant","giraffe","penguin","dinosaur","t-rex",
    # vervoer
    "car","bus","truck","taxi","ambulance","fire truck","police car","train","tram","bicycle","motorcycle","boat","ship","submarine","airplane","helicopter","rocket","satellite","space station","ufo",
    # gebouwen en stad
    "house","apartment","skyscraper","shop","church","castle","lighthouse","windmill","factory","power plant","bridge","tower","stadium","hospital","school","street lamp","traffic light","bench","fountain","statue",
    # natuur
    "tree","palm tree","pine tree","bush","flower","rock","mountain","volcano","island","iceberg","cactus","mushroom","grass","cloud","sun","moon","planet","earth","asteroid","meteor","crater",
    # spullen en effecten
    "phone","tv","computer","lamp","chair","table","bed","umbrella","tent","campfire","fire","explosion","snowman","sign","fence","barrier","crate","barrel"
  )
}
if ($Test) { $Words = @($Words[0]) }

function Search($q, $page) {
  $u = "https://api.poly.pizza/v1.1/search/" + [uri]::EscapeDataString($q) + "?Limit=32&Page=$page"
  try { return Invoke-RestMethod -Uri $u -Headers $headers -TimeoutSec 60 }
  catch { Write-Host "  zoekfout ($q): $($_.Exception.Message)" -ForegroundColor Yellow; return $null }
}

$creditsFile = Join-Path $dest "CREDITS.csv"
$seen = @{}
if (Test-Path $creditsFile) { Import-Csv $creditsFile | ForEach-Object { $seen[$_.ID] = $true } }
$new = @()

foreach ($w in $Words) {
  Write-Host "`n=== $w ===" -ForegroundColor Cyan
  $folder = Join-Path $dest ($w -replace '[^a-z0-9]+','-')
  New-Item -ItemType Directory -Force -Path $folder | Out-Null
  $got = 0; $page = 0
  while ($got -lt $PerWord) {
    $r = Search $w $page
    if (-not $r) { break }
    $items = if ($r.results) { $r.results } elseif ($r.Results) { $r.Results } else { @() }
    if ($Test) {
      Write-Host "Antwoord van de API (velden):" -ForegroundColor Cyan
      $r | Get-Member -MemberType NoteProperty | ForEach-Object { "  $($_.Name)" }
      if ($items.Count) { Write-Host "Eerste resultaat:" -ForegroundColor Cyan; $items[0] | ConvertTo-Json -Depth 4 | Select-Object -First 40 }
    }
    if (-not $items.Count) { break }
    foreach ($it in $items) {
      if ($got -ge $PerWord) { break }
      $id = $it.ID; if (-not $id) { $id = $it.Id }
      if ($seen[$id]) { continue }
      $lic = "$($it.Licence)$($it.License)"
      if ($lic -and $lic -notmatch "CC0|CC-BY|CC BY|Public") { continue }      # alleen CC0 / CC-BY
      $url = $it.Download; if (-not $url) { $url = $it.download }
      if (-not $url) { continue }
      $title = ("$($it.Title)" -replace '[^A-Za-z0-9 _-]','').Trim() -replace '\s+','-'
      $file = Join-Path $folder "$title-$id.glb"
      try { Invoke-WebRequest -Uri $url -OutFile $file -UseBasicParsing -TimeoutSec 120 } catch { Write-Host "  download mislukt: $title" -ForegroundColor Yellow; continue }
      $creator = if ($it.Creator.Username) { $it.Creator.Username } else { "$($it.Creator)" }
      $new += [pscustomobject]@{ ID = $id; Title = $it.Title; Word = $w; File = $file; Licence = $lic; Creator = $creator
                                 Attribution = $it.Attribution; Url = "https://poly.pizza/m/$id" }
      $seen[$id] = $true; $got++
    }
    if ($Test) { break }
    $page++; Start-Sleep -Milliseconds 400
  }
  Write-Host "  $got nieuwe modellen" -ForegroundColor Green
}
if ($new.Count) { $new | Export-Csv $creditsFile -NoTypeInformation -Append -Encoding UTF8 }
$total = (Get-ChildItem $dest -Recurse -Filter *.glb).Count
$size = [math]::Round(((Get-ChildItem $dest -Recurse -Filter *.glb | Measure-Object Length -Sum).Sum / 1MB), 1)
Write-Host "`nKlaar: $total modellen ($size MB) in $dest. Naamsvermelding per model: $creditsFile" -ForegroundColor Cyan
Write-Host "Bij gebruik in een video: zet 'Creator (Poly Pizza, licentie) + link' in upload.json -> credits."
