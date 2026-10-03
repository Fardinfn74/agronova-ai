# Floating Nova Chat + Demo Feature Audit

## Goal
Make Nova reachable from anywhere in the demo workspace via a floating button in the bottom-right corner, and verify every promised demo feature is present and working.

## What will be built

### 1. Floating Nova chat
- Add a round floating button fixed to the bottom-right corner of the `/demo` workspace, using the Nova mascot and the clay/glass style.
- Tapping it opens a chat panel above the button (bottom-right, mobile-friendly, closes with an X or by tapping the button again).
- The panel reuses the existing Nova conversation: typed questions, quick prompts, English/Bengali answers, and replies aware of the currently selected field and scenario.
- The inline "Ask Nova" step in the guided flow stays, but both share the same chat so answers stay consistent.

### 2. Feature audit against the agreed list
Verify each item works in the browser and fix anything missing:
- Field Explorer with Bangladesh sample fields, map-like selection, EN/বাংলা toggle, online/offline state
- NASA evidence cards (SMAP, GPM, POWER, MODIS/VIIRS, SRTM) with dates, sources, resolutions, limitations, and Demo/Fresh labels
- Field health, alerts, and 7-day trend charts
- Rotation Lab with three scenarios, Action → Why → NASA Data layers, and trade-offs
- Side-by-side comparison and What-If sliders with before/after scores and the "Scenario assumptions, not forecasts" label
- Crop library, field history, saved scenarios, export/print, share, and the "How AgroNova works" view
- Evidence drawer answering "Why am I seeing this?"

## Technical details
- All changes stay in `src/routes/demo.tsx` (floating button + chat panel state) reusing the existing `Nova` component logic and `novaReply` from `src/lib/agronova-demo.ts`.
- No new routes, no backend, no new dependencies.

## Verification
- Click through the full flow on desktop and mobile widths; open and close the floating chat from every section; confirm no console errors and a clean build.
