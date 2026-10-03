# AgroNova Interactive Demo

## Goal
Keep the existing landing page and add a polished, clickable `/demo` workspace that demonstrates the complete farmer journey using clearly dated Bangladesh sample data. Live NASA connections, accounts, and permanent saving will remain upgrade points rather than being simulated as real.

## What will be built

### 1. Landing-page entry
- Add a prominent **Try Demo Field** action to the current landing page.
- Preserve the current story, visual style, and centered hero.

### 2. Farmer workspace
- Add a responsive workspace with simple navigation, large controls, EN/বাংলা switching, online/offline status, and a guided progress path.
- Start with Bangladesh demo fields, location search, map-like field selection, coordinates, crop, season, field size, water availability, and farmer priority.

### 3. NASA evidence and field health
- Present dated demo observations for NASA POWER, GPM, SMAP, and MODIS/VIIRS, including value, unit, freshness, source, resolution, and limitations.
- Show field health, risk alerts, irrigation guidance, vegetation stress, and 7-day/30-day/seasonal trend charts.
- Clearly label every value as Demo, Fresh, Recent, Stale, or Unavailable.

### 4. Rotation Lab — primary experience
- Generate three deterministic crop-rotation scenarios from the chosen field inputs.
- Compare water, rainfall, temperature, soil, seasonal fit, climate resilience, and farmer-priority alignment.
- Explain each result in three layers: **Action → Why → NASA Data**.
- Add crop calendar and crop knowledge views for rice, wheat, maize, mustard, lentil, potato, and vegetables.

### 5. What-If simulator
- Add rainfall, water availability, temperature, and season-length controls.
- Recalculate scenario indicators immediately and show before/after changes with explanations.
- Always display: **Scenario assumptions, not forecasts.**

### 6. Nova assistant and traceability
- Add a demo Nova conversation that answers preset and typed questions from the currently selected field and scenario.
- Support English and Bengali explanations.
- Add a NASA Evidence drawer showing the exact observation, date, location, processing step, and limitation behind recommendations.

### 7. Supporting demo features
- Add field history, saved demo scenarios, export/print summary, share action, low-connectivity state, cached-data message, loading/empty/error states, and a “How AgroNova Works” transparency view.
- Keep all claims careful: no invented live readings, yield guarantees, disease detection, or exact irrigation volumes.

## Technical details
- Use separate TanStack routes for `/` and `/demo`, with unique page metadata.
- Keep demo calculations and sample content in one typed data module so evidence remains consistent everywhere.
- Use only the existing AgroNova design tokens and tactile clay/glass/skeuomorphic system.
- Use the existing chart library for readable trends and native browser print/share behavior for the demo export flow.
- Store only temporary demo choices locally in the browser; no cloud services are needed for this version.

## Verification
- Test the full flow: Field → NASA Data → Rotation Lab → Compare → What-If → Nova → Evidence → Export.
- Check desktop and mobile layouts, English/Bengali switching, offline labeling, console errors, and final build health.
