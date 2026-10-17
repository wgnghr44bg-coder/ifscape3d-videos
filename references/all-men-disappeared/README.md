# Reference props – all-men-disappeared

Voorbeeldbeelden + code die je direct in `all-men-disappeared/scene.html` kunt overnemen (zelfde low-poly stijl).

| Beeld | Wat het laat zien |
|---|---|
| `ref-coat.jpg` | jas (verfrommeld, kleur van het shirt), kleine donkere schoenen, telefoon met licht scherm en een kleine gloed |
| `ref-car.jpg` | auto met doorzichtige ramen, lege stoelen en stuur: je ziet dat niemand rijdt |
| `ref-women.jpg` | vrouw knielt bij een jas (rechts), twee vrouwen omhelzen elkaar (midden), vrouw bukt naar een jas (links) |

## Code: `props.js`
- `makeCoatSet(ctx, { color, phone, seed })` – jas + schoenen (+ telefoon). Zet hem óp de ondergrond: y = 0.2 op de stoep, y = 0 op de weg.
- `makePhone(ctx)` – `phone.userData.setOn(0|1)` om te knipperen.
- `makeEmptyCar(ctx, color)` – zelfde maat als `carMesh()`, geeft `{ g, body, wheels }`.
- `makeWoman(ctx, { shirt, hair, skirt })` + `poseWoman(w, 'stand'|'kneel'|'hug'|'pickup'|'turn', k)` – k = 0..1 laat de houding geleidelijk ontstaan.
- `ctx = { THREE, lam, shadowed }` – precies zoals in scene.html.

Voorbeeld van gebruik en camerastandpunten: `ref.html` (VIEWS bovenaan: coat, car, women).
