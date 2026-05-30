# Dev Log — May 7, 2026

**Commit:** `c243ca8` — Field guide aesthetic overhaul

---

## What we built

The goal was to make the app look and feel like a real battered field guide — messy, aged, dated. Not a clean modern UI.

### Loading screen
Replaced the plain spinner with a 🧭 compass inside the spinning ring. Location name now appears in Caveat handwriting font below. Added a small ruled field-note card that reads: "FIELD NOTE: Each rock layer took thousands — sometimes millions — of years to form."

### WikiImage states
All three states now look like a field notebook sketch pad:
- Loading → `✎ consulting field records…` on aged parchment with dashed border
- Not found → `[no illustration on file]` in Caveat handwriting
- Found → sepia filter on the photo, corner paper-fold effect, `fig. —` attribution instead of a plain caption

### Era dividers in Strata tab
Each era boundary now has a handwritten abbreviation stamp in the corner — Cz / Mz / Pz / pC — in Caveat font, tilted at −4°, coloured to match the era.

### Timeline tab
Periods with local rock or fossil data now show a handwritten ✓ checkmark. Their background gets faint ruled lines. Inactive "gap" periods are slightly more faded (42% opacity).

### Fossil period group headers
Circle bullet replaced with a rotated diamond. Counts now say "spp." instead of "taxa". Everything uses Special Elite typewriter font.

### Search and coordinate inputs
Replaced the rounded white input boxes with underline-only fields sitting directly on the parchment. Placeholders are italic and parchment-toned. The coordinate "GO →" button now matches the dark green GPS button style.

### Coverage disclaimer
Restyled from a plain info box into a proper ruled field-journal note card, matching the narrative card above it.

---

## Bugs fixed today
- `git index.lock` left by sandbox commit attempt — deleted manually on Windows, then committed fine
