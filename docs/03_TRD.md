# 03 — Technical Requirements Document (TRD)

## 1. Architecture Style
Monolithic **Next.js** app (frontend + API routes) for hackathon build speed, with a small **Python (FastAPI)** microservice for geospatial/satellite-data heavy lifting (NASA APIs are easier to consume with `requests`/`xarray`/`rasterio` in Python than in Node). This keeps the codebase simple enough for one AI coding agent to manage while isolating the one part that genuinely benefits from Python's geospatial ecosystem.

## 2. Tech Stack

| Layer | Choice | Why (and free-tier note) |
|---|---|---|
| Frontend | Next.js 14 (React, App Router) + TypeScript | Free, SSR for fast first paint on slow connections, deploys free on Vercel |
| Styling | Tailwind CSS + custom claymorphism tokens | Free, fast to theme consistently (see 04_UI_UX_SPEC.md) |
| Maps | Leaflet.js + OpenStreetMap tiles | Free, no API key needed, no usage cap for reasonable hackathon traffic |
| Backend (app logic) | Next.js API routes (Node) | Free on Vercel, colocated with frontend |
| Backend (geospatial) | Python FastAPI microservice | Free hosting on Render/Railway free tier |
| Database | Supabase (Postgres + PostGIS) | Free tier: 500MB DB, generous for hackathon scale |
| Auth | Supabase Auth | Free, built-in, supports phone-OTP (useful for low-literacy/no-email farmers) |
| AI / LLM | Anthropic Claude API | Used for the advisor explanation layer, chatbot, and dynamic translation (see 07_AI_AGENT_SPEC.md) |
| Translation (fallback/free) | LibreTranslate (self-hosted, free/OSS) as backup to the AI layer | Zero cost, works offline of Claude if needed |
| SMS/WhatsApp | Twilio free trial / WhatsApp Cloud API sandbox | Free credits sufficient for demo-scale alerts |
| Hosting (frontend+API) | Vercel (free tier) | Auto CI/CD from GitHub, free SSL, global CDN |
| Hosting (Python service) | Render or Railway (free tier) | Free tier sleeps when idle — acceptable for hackathon demo cadence |
| CI/CD | GitHub Actions (free for public repos) | Lint + test + deploy on push |
| Monitoring | UptimeRobot (free) + Vercel Analytics (free tier) | Basic uptime + traffic visibility |
| PWA | `next-pwa` plugin | Free, enables install + offline caching |

## 3. NASA & Open Data Sources Used

| Source | What it provides | Access |
|---|---|---|
| NASA POWER | Daily solar radiation, rainfall, temperature, wind (agroclimatology) | Free REST API, **no key required** |
| NASA SMAP | Soil moisture (surface & root-zone) | Free via NASA Earthdata (token required, instant signup) |
| MODIS/VIIRS (via AppEEARS or Google Earth Engine) | NDVI/EVI vegetation health, Land Surface Temperature | Free Earthdata account |
| GPM IMERG | Near-real-time & forecast precipitation | Free via Earthdata/GES DISC |
| ECOSTRESS | Evapotranspiration / plant water stress | Free via Earthdata |
| SRTM DEM | Elevation, slope (drainage/flood risk context) | Free, no key |
| NASA Worldview | Visual imagery for context/demo screenshots | Free, public |

All of the above are free and require no paid tier; only Earthdata requires a (free, same-day) account.

## 4. Performance Requirements
- Dashboard first meaningful paint < 3s on a simulated 3G connection.
- Total first-load JS+CSS payload < 250KB gzipped (excluding map tiles).
- All satellite data pre-fetched/cached server-side via a daily cron — **the client never calls a NASA API directly**, both for speed and to respect NASA API rate limits.

## 5. Device & Browser Support
- Mobile-first responsive (320px–1920px+).
- Chrome/Firefox/Safari/Edge, last 2 versions; explicit testing on a low-end Android Chrome profile (throttled CPU + 3G network).
- PWA installable on Android and iOS (Add to Home Screen).

## 6. Non-Functional Requirements
- **Scalability:** cached satellite data + async job queue so adding farms doesn't linearly increase NASA API calls.
- **Localization:** all user-facing strings pulled from i18n resource files, never hardcoded (enforced in AGENTS.md).
- **Reliability:** if the Claude API or a NASA source is temporarily unavailable, fall back to the last-cached data + a rule-based (non-AI) recommendation rather than showing an error (see 07_AI_AGENT_SPEC.md §5).
- **Cost ceiling:** entire stack must run at $0 infra cost through the hackathon and pilot phase.
