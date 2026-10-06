# AgroNova 🌱 — AI Farm Companion
> **NASA International Space Apps Challenge 2026** · *Field Shift Challenge*

AgroNova is a climate-adaptive precision agriculture workspace and decision-support companion that empowers smallholder farmers to read their fields with NASA Earth observation satellites and make confident crop rotation and resource decisions.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FFardinfn74%2Fagronova-ai)

---

## 🛰️ 10 Integrated Data Sources & Features

1. **NASA POWER (Agroclimatology API)**: 9 live climate parameters (`T2M`, `T2M_MAX`, `T2M_MIN`, `PRECTOTCORR`, `ALLSKY_SFC_SW_DWN`, `RH2M`, `WS10M`, `T2MDEW`, `EVPTRNS`).
2. **Open-Meteo (ECMWF IFS)**: 7-day weather forecasts & Penman-Monteith reference evapotranspiration ($ET_0$) with daily irrigation deficit metrics.
3. **NASA FIRMS (Fire Information for Resource Management)**: Near real-time satellite fire anomaly detection (MODIS & VIIRS) for crop residue burns and heat protection.
4. **NASA SMAP & GPM**: Satellite soil moisture and precipitation baseline observations.
5. **NASA MODIS**: Normalized difference vegetation index & vegetation vitality tracking.
6. **OpenFarm**: Comprehensive crop growth guides and seasonal calendar data.
7. **Rotation Lab**: 3 deterministic rotation scenarios (Water-Saver, Climate Resilience, High Yield) with Liebig's Law of the Minimum soil nutrient balancing.
8. **Crop Doctor**: Visual symptom checker and disease prevention engine with offline capabilities.
9. **Interactive Leaflet & OpenStreetMap**: Interactive field boundary picker, GPS coordinates, and district matching.
10. **Full-Page Multilingual Engine**: Complete 5-language localization with instant DOM translation and Google Translate engine integration:
    - 🇬🇧 **English (EN)**
    - 🇧🇩 **বাংলা (Bengali - BN)**
    - 🇮🇳 **हिन्दी (Hindi - HI)**
    - 🇪🇸 **Español (Spanish - ES)**
    - 🇰🇪 **Kiswahili (Swahili - SW)**

---

## 🚀 Deploying to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import `https://github.com/Fardinfn74/agronova-ai`.
2. Configure your Environment Variables in the Vercel dashboard:
   ```env
   VITE_SUPABASE_PROJECT_ID=your_project_id
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
   # Optional NASA FIRMS key
   # VITE_FIRMS_MAP_KEY=your_key
   ```
3. Set Build & Output Settings:
   - **Framework Preset**: `Vite` or `Other`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`
4. Click **Deploy**!

---

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/Fardinfn74/agronova-ai.git
cd agronova-ai

# Install dependencies
npm install

# Copy environment template and add credentials
cp .env.example .env

# Start development server
npm run dev
```

Visit [http://localhost:8080](http://localhost:8080) for the public landing page and [http://localhost:8080/demo](http://localhost:8080/demo) for the interactive farmer workspace.

---

## 🛠️ Technology Stack

- **Framework**: TanStack Start & React 19
- **Routing**: TanStack Router (file-based routing)
- **Styling**: Tailwind CSS v4, Lucide Icons & Claymorphism / Skeuomorphism design system
- **Charts & Maps**: Recharts & Leaflet
- **Backend & Auth**: Supabase & Drizzle ORM
- **Bundler**: Vite 8 & TypeScript
- **Engine**: Nitro & ECMWF Open-Meteo & NASA APIs

---

## 👥 Team Vision-X (Sylhet Region)

- **Al Wahed Fardin** — Team Leader
- **Ahnaf Tahmid Nafi** — Team Member
- **Abrar Sahriar** — Team Member
- **Ramisa Anjum Simi** — Team Member
- **Ramis Fariha Bhabna** — Team Member
- **Erina Siddiqua Eram** — Team Member

