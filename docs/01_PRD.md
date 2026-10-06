# 01 — Product Requirements Document (PRD)

**Project:** AgroNova (working name — see README for renaming notes)
**Challenge:** NASA Space Apps Challenge 2026 — _Field Shift: Adapting Farms with NASA Data_
**Team:** Voyagers

---

## 1. Elevator Pitch

AgroNova turns raw NASA Earth-observation data (soil moisture, rainfall, vegetation health, land surface temperature) into plain-language, voice-and-icon-friendly farming decisions — delivered in the farmer's own language, on any device, even over SMS. It is a decision-support system, not a data dashboard: a farmer never has to read a satellite map, only "water today," "rain in 2 days, delay fertilizer," or "your field's NDVI dropped — check for pests."

## 2. Problem Statement

- 500M+ smallholder farms produce a third of the world's food, but almost none of them have access to satellite agronomy — that data exists, is free, and is going unused because it is locked behind scientific portals, English-only interfaces, and GIS jargon.
- Climate variability (erratic rainfall, drought, flash floods) is the single biggest yield-destroying risk for smallholders, and NASA already tracks all of it in near-real-time.
- Existing agri-tech (FarmLogs, Plantix, aWhere) is either commercial-farm-scale, pest-photo-only, or not localized/offline-friendly for the Global South smallholder.
- **Gap AgroNova fills:** a free, multilingual, low-bandwidth, farmer-literate translation layer between NASA's open data and a farmer's daily decisions.

## 3. Goals & Success Metrics

| Goal                                   | MVP Metric (hackathon)                                                                            | Post-hackathon Metric                                        |
| -------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Prove the data→decision pipeline works | Live demo: real coordinates → real NASA data → real recommendation                                | Recommendation accuracy validated against agronomist review  |
| Prove it's farmer-usable               | Judge/tester completes farm setup + reads 1 recommendation in <2 min, no training                 | % of test users who understand a recommendation without help |
| Prove it's inclusive                   | UI functional in ≥3 languages + 1 on-demand AI-translated language, on a simulated low-end device | Number of languages actively used; SMS delivery success rate |
| Prove real-world relevance             | Judging scorecard: Impact, Creativity, Validity, Relevance, Presentation all addressed explicitly | Pilot partnership with 1 NGO / agri-extension office         |

## 4. Target Users & Personas

1. **Amina, smallholder farmer (primary)** — 2-acre plot, smartphone with patchy 3G, moderate literacy, makes daily irrigation/spraying decisions on gut feel and neighbor advice.
2. **Rafiq, agri-extension officer** — supports 200+ farmers across a district, needs a dashboard view across many farms, not just one.
3. **NGO/Gov program manager** — wants aggregate analytics to target interventions (e.g., "which villages are heading into drought stress").

## 5. Scope

**In scope (MVP / hackathon build):**

- Farm profile + field boundary pin/draw
- NASA-data-driven dashboard (soil moisture, rainfall, vegetation index, temperature)
- AI irrigation & planting/harvest advisor (rule engine + LLM explanation layer)
- Multilingual UI: 3 pre-built languages + on-demand AI-translated languages (see §7)
- Basic pest/disease and extreme-weather risk alerts
- Claymorphism responsive UI (PC + mobile + PWA installable)
- Chatbot for free-text farmer questions

**Out of scope (post-hackathon roadmap):**

- Full SMS/WhatsApp delivery at scale (architecture included, live integration stretch-goal)
- Marketplace / input-buying features
- Drone/on-ground sensor integration
- Native mobile app (PWA covers this for MVP)

## 6. Key Features (see 02_FRD.md for full detail)

Farm mapping · Satellite dashboard · AI advisor · Crop calendar · Risk alerts · Multilingual + voice UI · Chatbot · Offline/low-data mode · Community tips hub · NGO analytics view.

## 7. What Makes This Unique (judging: Creativity/Impact)

- **AI-Dynamic Localization Engine:** core UI is hand-verified in top farming-population languages (English, Bengali, Hindi, Spanish, Swahili) at launch; any _other_ language a farmer selects is translated on first use by the LLM layer and cached — meaning the product genuinely supports "all languages" without a translation team, at zero marginal cost.
- **Icon-and-voice-first design:** every recommendation has a text version, an icon version, and a spoken version, so literacy is never a barrier.
- **Data source transparency:** every recommendation cites which NASA dataset and date it came from, building trust rather than being a black box.
- **Offline-tolerant:** last-fetched recommendations are cached client-side; the app is usable with zero connectivity after first sync.

## 8. Assumptions & Constraints

- Hackathon deadline: submission form + 240s video + public repo link due **01 Oct 2026, 12:00 AM**.
- Team must build on entirely free-tier infrastructure (see 03_TRD.md).
- NASA Earthdata / POWER / AppEEARS access requires a free account + token, obtainable same-day.
- Demo will use 2–3 real, pre-selected farm coordinates (e.g., a drought-prone region) rather than requiring live judge input, to guarantee reliable data during the video/demo.

## 9. Timeline

See `TASKS.md` for the day-by-day build plan through the submission deadline.

## 10. Stakeholders

Team Voyagers (build) · NASA Space Apps judges (evaluators) · smallholder farmers (end users, represented via personas above) · agri-extension NGOs (secondary/B2B users, see 12_MONETIZATION.md).
