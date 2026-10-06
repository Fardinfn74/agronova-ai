# 02 — Functional Requirements Document (FRD)

Each requirement has a priority: **P0** = must-have for hackathon demo, **P1** = should-have if time allows, **P2** = post-hackathon roadmap.

## FR-1 Farm Profile & Field Mapping — P0

- **User story:** As a farmer, I want to mark my field on a map so the app knows exactly which satellite pixel(s) to read for me.
- **Acceptance criteria:**
  - User can search/pin a location or drag a map marker (Leaflet + OpenStreetMap, free).
  - User can optionally draw a polygon for exact field boundary; falls back to a default radius (e.g., 100m) around a single pin if skipped.
  - User selects crop type from a preset list (rice, wheat, maize, cotton, vegetables, etc.) and approximate planting date.
  - Farm is saved to `farms` table with lat/lng + optional polygon geometry.

## FR-2 Satellite Data Dashboard — P0

- **User story:** As a farmer, I want to see, in simple terms, how my field is doing right now.
- **Acceptance criteria:**
  - Dashboard shows 4 cards: Soil Moisture, Rainfall (recent + forecast), Vegetation Health (NDVI), Temperature/Heat Stress.
  - Each card shows a simple status (Good / Watch / Act Now) with color + icon, not raw numbers as the primary display (raw numbers available on tap/expand for power users like extension officers).
  - Data refreshed on a daily cron job and cached (see 14_ARCHITECTURE.md) — dashboard never calls NASA APIs directly from the client.

## FR-3 AI Irrigation Advisor — P0

- **User story:** As a farmer, I want to know if I should irrigate today.
- **Acceptance criteria:**
  - Combines SMAP soil moisture + GPM rainfall forecast + crop water-need profile.
  - Outputs one clear action ("Irrigate today, ~20mm" / "Skip — rain expected in 2 days" / "Soil moisture adequate").
  - Includes 1-sentence plain-language "why," citing the data source and date.

## FR-4 Crop Calendar & Planting/Harvest Advisor — P1

- Suggests optimal planting window using historical + current NASA POWER climate data for the field's location and selected crop.
- Flags harvest-readiness risk if heavy rain is forecast near expected harvest date.

## FR-5 Pest & Disease Risk Alerts — P1

- Uses NDVI/EVI drop-detection (unexpected vegetation decline vs. expected crop-stage curve) + temperature/humidity proxies as an early-warning signal.
- Alert explicitly says "possible stress detected — inspect your field for pests/disease," never a definitive diagnosis (no image-based diagnosis in MVP; see 07_AI_AGENT_SPEC.md guardrails).

## FR-6 Weather & Extreme Event Alerts — P0

- Drought risk (sustained low soil moisture trend), flood risk (GPM heavy-rain forecast), heatwave risk (LST anomaly).
- Push notification (in-app) for MVP; SMS/WhatsApp channel architecture defined in 03_TRD.md as P2 live integration.

## FR-7 Multilingual UI (i18n) — P0

- Language switcher available on every screen (flag/globe icon, no login required to change).
- MVP ships English, Bengali, Hindi fully verified; Spanish and Swahili at P1.
- Any other language: on-demand AI translation of UI strings + recommendations, cached per-language after first request (see 07_AI_AGENT_SPEC.md).

## FR-8 Voice Assistant / Text-to-Speech — P1

- Tap-to-listen icon on every recommendation card, using free browser Web Speech API (client-side, no cost) with graceful fallback if a language isn't supported by the device's TTS voices.

## FR-9 AI Chatbot — P0

- Free-text or voice input box; farmer can ask questions like "why is my field dry."
- Chatbot answers are grounded only in the farmer's own cached satellite data + a small agronomy knowledge base — never invents data.
- Responds in the farmer's selected language.

## FR-10 SMS/WhatsApp Alerts — P2 (architecture only for hackathon)

- Designed against Twilio free-trial credits / WhatsApp Cloud API sandbox; not required to be live for demo but the API contract is specified in 06_API_SPEC.md so it's a fast follow.

## FR-11 Offline Mode / Low-Bandwidth PWA — P1

- App installable as a PWA; last-synced dashboard + recommendations available with no connection.
- All images/icons optimized (SVG/WebP), total first-load payload target <1MB.

## FR-12 Community Knowledge Hub — P2

- Farmers can post short tips ("this variety handled the last dry spell well"); moderated, geotagged so tips surface to nearby farmers.

## FR-13 NGO/Admin Analytics Dashboard — P1

- Aggregate, anonymized view across all farms in a region: how many are in "Act Now" irrigation state, drought-risk heatmap.

## FR-14 Onboarding & Accessibility — P0

- Icon-first onboarding (minimal text), language selection is the _first_ screen before anything else loads.
- Large tap targets (≥48px), high color contrast, no reliance on color alone (icon + label always paired).
