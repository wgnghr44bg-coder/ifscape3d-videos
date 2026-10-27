# YouTube-standaard IfScape3D (What If)

Vastgelegd door de eigenaar, 27 okt 2026: elke What If-video krijgt dezelfde soort titel, beschrijving en tags
als de rest van het kanaal. Voorbeelden: "What if all the oceans dried up? #shorts",
"What if a black hole passed near Earth?" (lang).

## Titel
- `What if <vraag>?` – gewone hoofdletters, geen extra tekst tussen haakjes, geen emoji.
- Short (staand, ≤3 min): eindigt op ` #shorts`. Lange video (16:9): zonder `#shorts`.

## Beschrijving (Engels)
```
<1–2 prikkelende zinnen: "Imagine waking up tomorrow…" / "One moment you're …", met 1 emoji, twist niet verklappen>

<vraag aan de kijker met YOU> 👇

<alleen lange video: hoofdstukken, eerste regel 0:00>

#whatif #<onderwerp> #<onderwerp> #science #3danimation #shorts   ← #shorts alleen bij een Short
```
Kort houden: geen lange uitleg, geen "Chapters"-kopje, geen hashtags met hoofdletters.

## Tags (8–12)
`what if`, `what if <vraag>`, 3–6 onderwerpwoorden, `science`, `3d animation`, `ifscape3d`, en bij een Short `shorts`.

## Instellingen
- Privé uploaden met `YT_REFRESH_TOKEN="$YT_WHATIF_REFRESH_TOKEN" python3 vox-lux/tools/youtube_upload.py …`
  (zet zelf: niet voor kinderen, AI-label). Controleer via de API dat `snippet.channelTitle` = **IfScape3D**.
- Categorie **28** (Wetenschap en technologie): `--category 28`. Taal `en`.
- Thumbnail (lange video): de eigen thumbnail meesturen met `--thumbnail`.
