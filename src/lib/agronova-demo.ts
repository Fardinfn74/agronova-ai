export type Language = "en" | "bn" | "hi" | "es" | "sw";
export type Status = "Normal" | "Watch" | "High Risk" | "Data Unavailable";
export type Freshness = "Fresh" | "Recent" | "Stale" | "Unavailable" | "Demo";

// ---------------------------------------------------------------------------
// Soil Profile — NPK, pH, micronutrients entered by farmer or OCR from card
// ---------------------------------------------------------------------------
export type SoilProfile = {
  nitrogen: number;   // kg/ha  — optimal: 80–120 for rice
  phosphorus: number; // kg/ha  — optimal: 20–40
  potassium: number;  // kg/ha  — optimal: 40–80
  ph: number;         // 0–14   — optimal: 6.0–7.0 for most crops
  organicMatter: number; // %   — optimal: >2
};

export type SoilLimitingFactor = {
  factor: "Nitrogen" | "Phosphorus" | "Potassium" | "pH" | "Organic Matter" | "Balanced";
  severity: "Critical" | "Moderate" | "Slight" | "None";
  icon: string;
  advice: string;
  yieldImpact: number; // estimated % yield reduction from this factor alone
};

/** Liebig's Law of the Minimum — finds the single worst bottleneck */
export function computeSoilLimitingFactor(soil: SoilProfile): SoilLimitingFactor {
  const factors: Array<{
    factor: SoilLimitingFactor["factor"];
    deficit: number;
    icon: string;
    advice: string;
    yieldImpact: number;
  }> = [];

  // Nitrogen deficit: below 60 = critical, 60–80 = moderate, 80–100 = slight
  if (soil.nitrogen < 60) {
    factors.push({ factor: "Nitrogen", deficit: 3, icon: "🌿", yieldImpact: Math.round((80 - soil.nitrogen) * 0.4),
      advice: `Nitrogen is very low (${soil.nitrogen} kg/ha vs. 80–120 ideal). Apply urea or organic compost in split doses at tillering and panicle initiation stages to avoid runoff losses.` });
  } else if (soil.nitrogen < 80) {
    factors.push({ factor: "Nitrogen", deficit: 2, icon: "🌿", yieldImpact: Math.round((80 - soil.nitrogen) * 0.3),
      advice: `Nitrogen is moderate (${soil.nitrogen} kg/ha). A top-dress of 20–30 kg/ha urea at active tillering should bring this into range.` });
  } else if (soil.nitrogen < 100) {
    factors.push({ factor: "Nitrogen", deficit: 1, icon: "🌿", yieldImpact: 5,
      advice: `Nitrogen is slightly below optimum (${soil.nitrogen} kg/ha). Monitor crop colour — pale yellowing of lower leaves indicates need to supplement.` });
  }

  // Phosphorus
  if (soil.phosphorus < 15) {
    factors.push({ factor: "Phosphorus", deficit: 3, icon: "🌾", yieldImpact: Math.round((25 - soil.phosphorus) * 0.8),
      advice: `Phosphorus is critically low (${soil.phosphorus} kg/ha vs. 20–40 ideal). Apply Single Super Phosphate (SSP) or DAP at basal before transplanting to build root development.` });
  } else if (soil.phosphorus < 20) {
    factors.push({ factor: "Phosphorus", deficit: 2, icon: "🌾", yieldImpact: 12,
      advice: `Phosphorus is moderately low (${soil.phosphorus} kg/ha). Incorporate 30–40 kg/ha DAP basal at field preparation to support early root growth.` });
  }

  // Potassium
  if (soil.potassium < 30) {
    factors.push({ factor: "Potassium", deficit: 3, icon: "⚡", yieldImpact: Math.round((50 - soil.potassium) * 0.5),
      advice: `Potassium is critically deficient (${soil.potassium} kg/ha vs. 40–80 ideal). Apply Muriate of Potash (MOP) at 40–50 kg/ha. Potassium improves stem strength and disease tolerance.` });
  } else if (soil.potassium < 40) {
    factors.push({ factor: "Potassium", deficit: 2, icon: "⚡", yieldImpact: 10,
      advice: `Potassium is low (${soil.potassium} kg/ha). Add MOP at 25–30 kg/ha basal application to strengthen cell walls and grain filling.` });
  }

  // pH
  const phDiff = soil.ph < 6.0 ? 6.0 - soil.ph : soil.ph > 7.5 ? soil.ph - 7.5 : 0;
  if (phDiff > 1.5) {
    factors.push({ factor: "pH", deficit: 3, icon: "🧪", yieldImpact: 25,
      advice: soil.ph < 6 ? `Soil is strongly acidic (pH ${soil.ph}). Apply agricultural lime at 1–2 t/ha to raise pH toward 6.0–7.0 range. Acidic soils lock up phosphorus and micronutrients.`
        : `Soil is strongly alkaline (pH ${soil.ph}). Apply gypsum or sulfur at 250–500 kg/ha. High pH reduces iron, zinc, and manganese availability.` });
  } else if (phDiff > 0.5) {
    factors.push({ factor: "pH", deficit: 2, icon: "🧪", yieldImpact: 12,
      advice: soil.ph < 6 ? `Soil is slightly acidic (pH ${soil.ph}). Light liming (500 kg/ha) or use of acidifying fertilizers can help bring this toward 6.0–6.5.`
        : `Soil is mildly alkaline (pH ${soil.ph}). Organic matter additions and sulfur-containing fertilizers can gradually lower pH.` });
  }

  // Organic matter
  if (soil.organicMatter < 1.0) {
    factors.push({ factor: "Organic Matter", deficit: 3, icon: "🌰", yieldImpact: 18,
      advice: `Organic matter is critically low (${soil.organicMatter}%). Soils below 1% lose water retention capacity and microbial activity. Incorporate green manure, compost, or crop residues at 3–5 t/ha every season.` });
  } else if (soil.organicMatter < 2.0) {
    factors.push({ factor: "Organic Matter", deficit: 2, icon: "🌰", yieldImpact: 8,
      advice: `Organic matter is moderate (${soil.organicMatter}%). Target 2%+ through regular compost applications and avoiding full crop-residue removal.` });
  }

  if (factors.length === 0) {
    return { factor: "Balanced", severity: "None", icon: "✅", advice: "Soil nutrients and pH are within optimal ranges for most crops in this region. Focus on maintaining organic matter and monitoring micronutrients seasonally.", yieldImpact: 0 };
  }

  // Most limiting = highest deficit score
  factors.sort((a, b) => b.deficit - a.deficit || b.yieldImpact - a.yieldImpact);
  const top = factors[0]!;
  const severity: SoilLimitingFactor["severity"] = top.deficit >= 3 ? "Critical" : top.deficit === 2 ? "Moderate" : "Slight";
  return { factor: top.factor, severity, icon: top.icon, advice: top.advice, yieldImpact: top.yieldImpact };
}

/** Adjusts scenario score by nutrient limiting factor penalty */
export function nutrientAdjustedScore(baseScore: number, soil: SoilProfile): number {
  const lf = computeSoilLimitingFactor(soil);
  const penalty = Math.min(lf.yieldImpact, 30);
  return Math.max(20, Math.round(baseScore - penalty));
}

// ---------------------------------------------------------------------------
// Crop Doctor — disease reference database (client-side diagnosis lookup)
// ---------------------------------------------------------------------------
export type CropDisease = {
  id: string;
  name: string;
  crops: string[];
  symptoms: string;
  visualCues: string[];   // What to look for
  cause: "Fungal" | "Bacterial" | "Viral" | "Nutrient" | "Pest";
  conditions: string;     // Triggering weather/soil conditions
  treatment: string;
  prevention: string;
  nasaLink: string;       // Which NASA observation is relevant
  severity: "Low" | "Medium" | "High";
};

export const cropDiseases: CropDisease[] = [
  {
    id: "blast",
    name: "Rice Blast",
    crops: ["Rice"],
    cause: "Fungal",
    symptoms: "Diamond-shaped grey-green lesions with dark brown borders on leaves, neck, and panicle. Infected necks turn white and grains fail to fill.",
    visualCues: ["Diamond-shaped spots on leaves", "Grey/white patch at neck below panicle", "Empty or half-filled grains"],
    conditions: "High humidity (>90% RH), night temps 19–24°C, long leaf wetness periods — exactly the conditions our humidity sensor watches.",
    treatment: "Spray Tricyclazole or Propiconazole at first sign. Do not apply high nitrogen during active infection — it accelerates spread.",
    prevention: "Use blast-resistant varieties. Apply balanced nitrogen — excess nitrogen raises disease risk. Maintain good drainage.",
    nasaLink: "Humidity and dew period from NASA POWER RH2M correlates with blast outbreak risk.",
    severity: "High",
  },
  {
    id: "brownspot",
    name: "Brown Spot",
    crops: ["Rice"],
    cause: "Fungal",
    symptoms: "Oval to circular brown spots with yellow halo on leaves. Heavy infection turns leaves brown and reduces photosynthesis.",
    visualCues: ["Circular brown spots, yellow halo", "Lesions on leaf sheaths and grains too"],
    conditions: "Linked to nutrient stress (low K, N, Si) and humidity >80%. NASA POWER humidity above 80% for 3+ days is a warning sign.",
    treatment: "Apply Mancozeb or Carbendazim. Supplement potassium (MOP) — low K is the most common trigger.",
    prevention: "Maintain balanced fertilization especially potassium. Avoid water stress at critical growth stages.",
    nasaLink: "Cross with NASA POWER RH2M. Brown spot risk rises when 7-day mean humidity stays above 80%.",
    severity: "Medium",
  },
  {
    id: "sheath_blight",
    name: "Sheath Blight",
    crops: ["Rice"],
    cause: "Fungal",
    symptoms: "Oval, water-soaked greenish-grey lesions on leaf sheaths near waterline. Lesions turn white/grey with dark brown border. Severe lodging in dense crops.",
    visualCues: ["Grey-green oval lesions on leaf sheath", "White lesion centers, dark borders", "Web-like mycelium visible in humid mornings"],
    conditions: "Favoured by warm temps (28–32°C), high humidity, dense planting, high nitrogen fertilization.",
    treatment: "Apply Hexaconazole or Validamycin at early infection. Drain field intermittently to disrupt humid microclimate.",
    prevention: "Widen plant spacing. Moderate nitrogen. Avoid excess irrigation that raises field humidity.",
    nasaLink: "NASA POWER temperature (T2M 28–32°C) + high RH2M is the combined risk window we flag in the Pest Watch.",
    severity: "High",
  },
  {
    id: "late_blight",
    name: "Late Blight",
    crops: ["Potato", "Tomato"],
    cause: "Fungal",
    symptoms: "Dark brown water-soaked lesions on leaves, often starting at edges. White mold on leaf underside in humid conditions. Tubers show copper-brown rot inside.",
    visualCues: ["Water-soaked brown leaf edge lesions", "White cottony mold on leaf underside", "Brown rot inside tubers at harvest"],
    conditions: "Cool temps (10–20°C), high humidity, frequent rain — classic monsoon conditions. Spreads very fast once established.",
    treatment: "Spray Metalaxyl+Mancozeb (Ridomil Gold) at first lesion. Remove and destroy affected plants. Do not compost infected material.",
    prevention: "Use certified blight-resistant seed. Avoid irrigating by overhead; use drip or furrow. Destroy volunteer potato plants.",
    nasaLink: "NASA POWER: Cool T2M (<20°C) combined with high rainfall (PRECTOTCORR) and RH2M >90% is a high blight alert window.",
    severity: "High",
  },
  {
    id: "leaf_curl",
    name: "Leaf Curl (Virus)",
    crops: ["Tomato", "Chilli", "Brinjal"],
    cause: "Viral",
    symptoms: "Leaves curl upward or downward. New growth is small, yellow, and distorted. Stunted plant growth. Virus spread by whiteflies.",
    visualCues: ["Curled, cupped leaves — upward or downward", "Yellow mosaic pattern on young leaves", "Stunted plant; small distorted new growth"],
    conditions: "Hot dry weather favours whitefly vectors. Drought stress weakens plant immune response.",
    treatment: "No cure for virus. Remove and destroy infected plants immediately. Control whitefly with neem-based spray or yellow sticky traps.",
    prevention: "Use virus-resistant cultivars. Apply reflective mulch to deter whitefly. Inspect seedlings before transplanting.",
    nasaLink: "High temperature (T2M >35°C) and low rainfall periods increase whitefly activity — NASA POWER can signal these windows.",
    severity: "Medium",
  },
  {
    id: "nitrogen_def",
    name: "Nitrogen Deficiency",
    crops: ["Rice", "Wheat", "Maize", "Potato", "Vegetables"],
    cause: "Nutrient",
    symptoms: "Yellowing starts from the tips of older (bottom) leaves and moves upward. Entire plant may turn light green. Stunted growth.",
    visualCues: ["V-shaped yellowing from tip of older leaves", "Lower leaves yellow first, upper leaves stay green longer", "Pale, light-green plant overall"],
    conditions: "Sandy soils with poor organic matter, waterlogged fields (nitrogen leaches), or heavy rain after top-dressing.",
    treatment: "Apply urea (46-0-0) at 20–30 kg/ha as a top-dress. Split application reduces leaching loss.",
    prevention: "Test soil before planting. Apply basal nitrogen. Use slow-release fertilizers in sandy soils.",
    nasaLink: "Heavy rainfall events from NASA POWER (PRECTOTCORR >20mm/day) can signal nitrogen leaching risk after fertilizer application.",
    severity: "Medium",
  },
  {
    id: "potassium_def",
    name: "Potassium Deficiency",
    crops: ["Rice", "Potato", "Wheat", "Vegetables"],
    cause: "Nutrient",
    symptoms: "Brown scorching and curling of leaf tips and margins starting on older leaves. Weak stems. Poor grain or tuber filling.",
    visualCues: ["Brown-burnt edges on older leaves", "Tip and margin scorch progressing inward", "Weak, easily lodged stems"],
    conditions: "Sandy soils, high rainfall, or soils that receive nitrogen but no potassium for many seasons.",
    treatment: "Apply Muriate of Potash (MOP) at 20–40 kg/ha. Response is fast — visible improvement in 7–10 days.",
    prevention: "Include potassium in every fertilizer programme. Sandy soils need split applications to prevent leaching.",
    nasaLink: "No direct satellite link, but heavy precipitation (PRECTOTCORR) accelerates K leaching from sandy soils.",
    severity: "Medium",
  },
  {
    id: "stem_borer",
    name: "Yellow Stem Borer",
    crops: ["Rice"],
    cause: "Pest",
    symptoms: "Larvae bore into tillers causing 'deadhearts' (dead central shoot) at vegetative stage, or 'whiteheads' (white empty panicle) at flowering.",
    visualCues: ["Dead central tiller that pulls out easily", "White empty panicle at heading (whitehead)", "Small round holes in stem at soil level"],
    conditions: "Night temperatures 20–25°C and dense planting. Peak activity during tillering to heading stages.",
    treatment: "Apply Chlorpyrifos or Carbofuran (granules) at stem base during peak incidence. Pheromone traps for monitoring.",
    prevention: "Use stem-borer resistant varieties. Avoid excess nitrogen. Light traps near field boundaries reduce adult moth populations.",
    nasaLink: "Warm nights (T2M >22°C) at tillering stage from NASA POWER signal elevated stem borer risk — matches our Pest Watch threshold.",
    severity: "High",
  },
];

export type DemoField = {
  id: string;
  name: string;
  district: string;
  coordinates: [number, number];
  crop: string;
  season: string;
  water: "Low" | "Moderate" | "Reliable";
  priority: "Save water" | "Income stability" | "Soil health";
  size: number;
  soil: string;
  history: string[];
  position: { x: number; y: number };
};

export type Evidence = {
  id: string;
  dataset: string;
  variable: string;
  value: string;
  unit: string;
  date: string;
  freshness: Freshness;
  resolution: string;
  source: string;
  processing: string;
  limitation: string;
};

export type Scenario = {
  id: "A" | "B" | "C";
  name: string;
  sequence: string[];
  summary: string;
  score: number;
  water: number;
  rainfall: number;
  temperature: number;
  soil: number;
  resilience: number;
  priority: number;
  action: string;
  why: string;
  evidenceIds: string[];
  tradeoff: string;
};

export const demoDate = "18 September 2026";

export const fields: DemoField[] = [
  {
    id: "rajshahi",
    name: "Padma North Field",
    district: "Rajshahi",
    coordinates: [24.3745, 88.6042],
    crop: "Rice",
    season: "Aman → Rabi",
    water: "Moderate",
    priority: "Save water",
    size: 2.4,
    soil: "Silty loam",
    history: ["2025 Aman rice", "2026 Boro rice", "Low-water note · March 2026"],
    position: { x: 27, y: 38 },
  },
  {
    id: "rangpur",
    name: "Teesta Family Plot",
    district: "Rangpur",
    coordinates: [25.7439, 89.2752],
    crop: "Potato",
    season: "Rabi",
    water: "Reliable",
    priority: "Income stability",
    size: 1.7,
    soil: "Sandy loam",
    history: ["2025 Maize", "2026 Potato", "Good drainage noted"],
    position: { x: 48, y: 18 },
  },
  {
    id: "barisal",
    name: "Kirtankhola Lowland",
    district: "Barisal",
    coordinates: [22.701, 90.3535],
    crop: "Rice",
    season: "Aman",
    water: "Reliable",
    priority: "Soil health",
    size: 3.1,
    soil: "Clay loam",
    history: ["2025 Aman rice", "2026 Mung bean", "Heavy rain note · July 2026"],
    position: { x: 57, y: 70 },
  },
];

export const evidence: Evidence[] = [
  {
    id: "smap",
    dataset: "NASA SMAP",
    variable: "Surface soil moisture",
    value: "0.21",
    unit: "m³/m³",
    date: "17 Sep 2026",
    freshness: "Demo",
    resolution: "9 km · 2–3 day revisit",
    source: "SMAP L3 Enhanced Passive Soil Moisture",
    processing: "7-day field-area mean compared with a 5-year seasonal baseline.",
    limitation: "Satellite pixels are larger than this field; local soil can vary.",
  },
  {
    id: "gpm",
    dataset: "NASA GPM",
    variable: "Accumulated precipitation",
    value: "42",
    unit: "mm / 30 days",
    date: "18 Sep 2026",
    freshness: "Demo",
    resolution: "0.1° · 30-minute source data",
    source: "GPM IMERG Final Run",
    processing: "Daily precipitation summed over the selected field grid cell.",
    limitation: "Gauge-corrected estimates may miss very local rain events.",
  },
  {
    id: "power",
    dataset: "NASA POWER",
    variable: "Mean air temperature",
    value: "31.4",
    unit: "°C",
    date: "17 Sep 2026",
    freshness: "Demo",
    resolution: "0.5° × 0.625° · daily",
    source: "NASA POWER Daily API",
    processing: "7-day mean of temperature at 2 metres.",
    limitation: "Regional grid value; not an on-farm thermometer reading.",
  },
  {
    id: "modis",
    dataset: "NASA MODIS / VIIRS",
    variable: "Vegetation condition index",
    value: "0.61",
    unit: "index",
    date: "14 Sep 2026",
    freshness: "Demo",
    resolution: "250–500 m · 8-day composite",
    source: "MODIS vegetation indices",
    processing: "Cloud-screened current value compared with this season's median.",
    limitation: "Cloud and mixed crops can influence the signal; this is not disease detection.",
  },
  {
    id: "srtm",
    dataset: "NASA SRTM",
    variable: "Elevation",
    value: "18",
    unit: "m",
    date: "Static reference",
    freshness: "Demo",
    resolution: "30 m · static",
    source: "Shuttle Radar Topography Mission",
    processing: "Median elevation within the approximate field area.",
    limitation: "Elevation does not show current drainage or flood depth.",
  },
];

export const scenarios: Scenario[] = [
  {
    id: "A",
    name: "Water-wise balance",
    sequence: ["Rice", "Wheat", "Lentil"],
    summary: "Reduces dry-season water pressure while adding a soil-building pulse crop.",
    score: 86,
    water: 88,
    rainfall: 79,
    temperature: 82,
    soil: 90,
    resilience: 87,
    priority: 92,
    action: "Consider wheat after Aman rice, followed by lentil before the next monsoon.",
    why: "Wheat uses less irrigation than Boro rice, while lentil can support soil nitrogen and fits the short pre-monsoon window.",
    evidenceIds: ["smap", "gpm", "power"],
    tradeoff: "Strong water savings, but wheat is sensitive to late-season heat.",
  },
  {
    id: "B",
    name: "Short-season resilience",
    sequence: ["Rice", "Mustard", "Lentil"],
    summary: "Uses two shorter Rabi crops to limit heat and irrigation exposure.",
    score: 82,
    water: 93,
    rainfall: 84,
    temperature: 86,
    soil: 87,
    resilience: 90,
    priority: 89,
    action: "Consider a short-duration mustard crop, then lentil if the harvest window remains open.",
    why: "Both crops have lower water demand than dry-season rice and can avoid the hottest weeks when planted on time.",
    evidenceIds: ["smap", "gpm", "power"],
    tradeoff: "Lowest water exposure, but depends on a timely rice harvest and careful planting dates.",
  },
  {
    id: "C",
    name: "Market opportunity",
    sequence: ["Rice", "Vegetables", "Maize"],
    summary: "Prioritizes income diversity where reliable market access and irrigation exist.",
    score: 71,
    water: 59,
    rainfall: 74,
    temperature: 70,
    soil: 72,
    resilience: 64,
    priority: 68,
    action: "Consider vegetables only on the best-drained portion, then maize if water remains available.",
    why: "The sequence can diversify income but exposes the field to greater irrigation and temperature risk.",
    evidenceIds: ["gpm", "power", "modis", "srtm"],
    tradeoff: "Higher income potential, with higher labour, market, heat, and water exposure.",
  },
];

export const crops = [
  { name: "Rice", bn: "ধান", season: "Aman · Jun–Nov", duration: "120–150 days", water: "High", temp: "24–35°C", soil: "Clay loam; tolerates standing water", follows: "Lentil, mustard" },
  { name: "Wheat", bn: "গম", season: "Rabi · Nov–Mar", duration: "105–125 days", water: "Moderate", temp: "15–25°C", soil: "Well-drained loam", follows: "Rice, pulses" },
  { name: "Maize", bn: "ভুট্টা", season: "Rabi/Kharif", duration: "100–130 days", water: "Moderate", temp: "18–30°C", soil: "Deep, well-drained loam", follows: "Legumes" },
  { name: "Mustard", bn: "সরিষা", season: "Rabi · Oct–Feb", duration: "75–95 days", water: "Low", temp: "10–25°C", soil: "Well-drained loam", follows: "Rice" },
  { name: "Lentil", bn: "মসুর", season: "Rabi · Nov–Mar", duration: "100–120 days", water: "Low", temp: "18–30°C", soil: "Sandy loam to clay loam", follows: "Rice, wheat" },
  { name: "Potato", bn: "আলু", season: "Rabi · Nov–Mar", duration: "85–110 days", water: "Moderate", temp: "15–22°C", soil: "Loose sandy loam", follows: "Rice, maize" },
  { name: "Vegetables", bn: "সবজি", season: "Varies by crop", duration: "45–120 days", water: "Moderate–High", temp: "18–32°C", soil: "Fertile, well-drained soil", follows: "Legumes" },
];

export const timeline = [
  { day: "19 Aug", rain: 2, temp: 30, moisture: 31, vegetation: 72 },
  { day: "24 Aug", rain: 12, temp: 31, moisture: 35, vegetation: 70 },
  { day: "29 Aug", rain: 4, temp: 33, moisture: 30, vegetation: 68 },
  { day: "3 Sep", rain: 0, temp: 34, moisture: 26, vegetation: 66 },
  { day: "8 Sep", rain: 15, temp: 32, moisture: 33, vegetation: 65 },
  { day: "13 Sep", rain: 7, temp: 31, moisture: 28, vegetation: 63 },
  { day: "18 Sep", rain: 2, temp: 31.4, moisture: 21, vegetation: 61 },
];

export const translations: Record<Language, {
  demo: string; field: string; health: string; rotation: string;
  compare: string; simulator: string; doctor: string; forecast: string;
  crops: string; history: string; how: string; profile: string;
  ask: string; select: string; source: string; listen: string; save: string;
  share: string; download: string; back: string; search: string; close: string;
  onlineLabel: string; offlineLabel: string; farmerWorkspace: string;
  demoWorkspace: string; liveNasa: string; loginSignup: string; signOut: string;
  fieldStep: string; chooseField: string; searchField: string;
  yourFarmFields: string; noFieldMatch: string; coordinates: string;
  season: string; water: string; soilType: string; priority: string;
  fieldSize: string; cropType: string; next: string; tapMapHint: string;
  healthStep: string; nasaEvidence: string; liveObservation: string;
  fetchingNasa: string;
  temperature: string; rainfall: string; humidity: string; solar: string;
  windSpeed: string; dewPoint: string; evapotrans: string;
  irrigationNeed: string; irrigationStatus: string; heatStatus: string;
  fungalRisk: string; windStatus: string;
  statusLow: string; statusModerate: string; statusActNow: string;
  statusNormal: string; statusWatch: string; statusHighRisk: string;
  statusSafe: string; statusCaution: string; statusNoSpray: string;
  rotationStep: string; rotationTitle: string; pickScenario: string;
  waterFit: string; overallFit: string; rotationSeq: string;
  action: string; rationale: string; evidence: string;
  compareStep: string; compareTitle: string;
  simStep: string; simTitle: string; simNotForecast: string;
  climateWater: string; rainfallChange: string; waterAvail: string;
  tempChange: string; seasonLength: string; soilNutrient: string;
  liebigHint: string; limitingFactor: string; soilBalanced: string;
  yieldImpact: string; soilPenalty: string; idealRange: string;
  doctorTitle: string; searchSymptom: string; allCrops: string;
  noMatch: string; treatment: string; prevention: string;
  forecastTitle: string; fetchingForecast: string; liveForecast: string;
  demoForecast: string; totalRain: string; et0Label: string;
  irrigDemand: string; forecastAlerts: string; irrigBar: string;
  irrigBarSub: string;
  cropsTitle: string; cropCompat: string;
  historyTitle: string; savedPlans: string; noSavedPlans: string;
  howTitle: string;
  profileTitle: string; languageLabel: string; languageHint: string;
  langEn: string; langBn: string; langHi: string; langEs: string; langSw: string;
}> = {
  en: {
    demo: "Demo workspace", field: "Field", health: "Field health",
    rotation: "Rotation Lab", compare: "Compare", simulator: "What-If",
    doctor: "Crop Doctor", forecast: "7-Day Forecast", crops: "Crop library",
    history: "History", how: "How it works", profile: "Profile",
    ask: "Ask Nova", select: "Select field", source: "View evidence",
    listen: "Listen", save: "Save plan", share: "Share", download: "Download PDF",
    back: "Back", search: "Search", close: "Close",
    onlineLabel: "Online", offlineLabel: "Offline · cached",
    farmerWorkspace: "Farmer Workspace", demoWorkspace: "Demo Workspace",
    liveNasa: "My farm · Live NASA Observations",
    loginSignup: "Login / Signup", signOut: "Sign out",
    fieldStep: "Step 1", chooseField: "Choose your field",
    searchField: "Search district or field…",
    yourFarmFields: "Your farm fields", noFieldMatch: "No field matches.",
    coordinates: "Coordinates", season: "Season", water: "Water",
    soilType: "Soil type", priority: "Priority", fieldSize: "Size (ha)",
    cropType: "Crop", next: "Go to field health →", tapMapHint: "Tap a pin to select, or tap map to pick coordinates.",
    healthStep: "Step 2", nasaEvidence: "NASA evidence & field health",
    liveObservation: "Working Real-Time NASA POWER Observations",
    fetchingNasa: "Fetching NASA Observations…",
    temperature: "Temperature", rainfall: "Rainfall", humidity: "Humidity",
    solar: "Solar radiation", windSpeed: "Wind speed", dewPoint: "Dew point",
    evapotrans: "Evapotranspiration", irrigationNeed: "Irrigation need",
    irrigationStatus: "Irrigation status", heatStatus: "Heat stress",
    fungalRisk: "Fungal disease risk", windStatus: "Spray advisory",
    statusLow: "Low", statusModerate: "Moderate", statusActNow: "Act Now",
    statusNormal: "Normal", statusWatch: "Watch", statusHighRisk: "High Risk",
    statusSafe: "Safe", statusCaution: "Caution", statusNoSpray: "No-Spray",
    rotationStep: "Step 3", rotationTitle: "Crop rotation scenarios",
    pickScenario: "Pick the scenario that best fits your field conditions.",
    waterFit: "Water fit", overallFit: "Overall fit", rotationSeq: "Sequence",
    action: "Recommended action", rationale: "Rationale", evidence: "Evidence",
    compareStep: "Step 4", compareTitle: "Compare scenarios",
    simStep: "Step 5", simTitle: "What-If simulator",
    simNotForecast: "Scenario assumptions, not forecasts.",
    climateWater: "Climate & Water", rainfallChange: "Rainfall change",
    waterAvail: "Water availability", tempChange: "Temperature change",
    seasonLength: "Season length", soilNutrient: "Soil Nutrient Simulator",
    liebigHint: "Enter soil health card values to see which nutrient limits yield (Liebig's Law).",
    limitingFactor: "#1 Limiting factor", soilBalanced: "Soil is well-balanced",
    yieldImpact: "Est. yield impact", soilPenalty: "Soil penalty",
    idealRange: "Ideal",
    doctorTitle: "Crop Doctor — Symptom Diagnosis",
    searchSymptom: "Search symptoms (e.g. yellow leaves, spots…)",
    allCrops: "All crops", noMatch: "No diseases matched your search. Try different keywords.",
    treatment: "Treatment", prevention: "Prevention",
    forecastTitle: "7-Day Forecast", fetchingForecast: "Fetching forecast…",
    liveForecast: "Live Open-Meteo Forecast",
    demoForecast: "Demo values — forecast unavailable",
    totalRain: "7-day total rain", et0Label: "ET₀",
    irrigDemand: "Irrigation need (7-day)", forecastAlerts: "Forecast alerts",
    irrigBar: "Daily irrigation demand (ET₀ − rain, mm)",
    irrigBarSub: "Source: Open-Meteo (ECMWF IFS) · ET₀ per FAO-56 Penman-Monteith",
    cropsTitle: "Crop library & Seasonal Calendar",
    cropCompat: "Crop growth windows and temperature compatibility for",
    historyTitle: "Field History & Saved Plans",
    savedPlans: "Saved plans", noSavedPlans: "No saved plans yet. Save a rotation plan to see it here.",
    howTitle: "How AgroNova Works",
    profileTitle: "Profile & Settings", languageLabel: "Interface language",
    languageHint: "Changes the entire app language instantly.",
    langEn: "English", langBn: "বাংলা (Bengali)", langHi: "हिन्दी (Hindi)",
    langEs: "Español (Spanish)", langSw: "Kiswahili (Swahili)",
  },
  bn: {
    demo: "ডেমো কর্মক্ষেত্র", field: "জমি", health: "জমির স্বাস্থ্য",
    rotation: "ফসল আবর্তন", compare: "তুলনা", simulator: "পরিস্থিতি পরীক্ষা",
    doctor: "ফসল ডাক্তার", forecast: "৭ দিনের পূর্বাভাস", crops: "ফসল তথ্য",
    history: "ইতিহাস", how: "কীভাবে কাজ করে", profile: "প্রোফাইল",
    ask: "নোভাকে জিজ্ঞাসা", select: "জমি বাছুন", source: "প্রমাণ দেখুন",
    listen: "শুনুন", save: "পরিকল্পনা সংরক্ষণ", share: "শেয়ার",
    download: "পিডিএফ ডাউনলোড", back: "ফিরুন", search: "খুঁজুন", close: "বন্ধ",
    onlineLabel: "অনলাইন", offlineLabel: "অফলাইন · ক্যাশড",
    farmerWorkspace: "কৃষক কর্মক্ষেত্র", demoWorkspace: "ডেমো কর্মক্ষেত্র",
    liveNasa: "আমার খামার · লাইভ NASA পর্যবেক্ষণ",
    loginSignup: "লগইন / নিবন্ধন", signOut: "সাইন আউট",
    fieldStep: "ধাপ ১", chooseField: "আপনার জমি বাছুন",
    searchField: "জেলা বা জমি খুঁজুন…",
    yourFarmFields: "আপনার খামারের জমি", noFieldMatch: "কোনো জমি পাওয়া যায়নি।",
    coordinates: "স্থানাঙ্ক", season: "মৌসুম", water: "পানি",
    soilType: "মাটির ধরন", priority: "অগ্রাধিকার", fieldSize: "আকার (হে)",
    cropType: "ফসল", next: "জমির স্বাস্থ্য দেখুন →",
    tapMapHint: "পিন ট্যাপ করে জমি বাছুন বা মানচিত্রে ট্যাপ করুন।",
    healthStep: "ধাপ ২", nasaEvidence: "NASA প্রমাণ ও জমির স্বাস্থ্য",
    liveObservation: "সরাসরি NASA POWER পর্যবেক্ষণ",
    fetchingNasa: "NASA ডেটা আনা হচ্ছে…",
    temperature: "তাপমাত্রা", rainfall: "বৃষ্টিপাত", humidity: "আর্দ্রতা",
    solar: "সৌর বিকিরণ", windSpeed: "বায়ু গতি", dewPoint: "শিশির বিন্দু",
    evapotrans: "বাষ্পীভবন", irrigationNeed: "সেচের প্রয়োজন",
    irrigationStatus: "সেচ অবস্থা", heatStatus: "তাপ চাপ",
    fungalRisk: "ছত্রাক রোগের ঝুঁকি", windStatus: "স্প্রে পরামর্শ",
    statusLow: "কম", statusModerate: "মাঝারি", statusActNow: "এখনই ব্যবস্থা নিন",
    statusNormal: "স্বাভাবিক", statusWatch: "সতর্ক", statusHighRisk: "উচ্চ ঝুঁকি",
    statusSafe: "নিরাপদ", statusCaution: "সাবধান", statusNoSpray: "স্প্রে নয়",
    rotationStep: "ধাপ ৩", rotationTitle: "ফসল আবর্তন পরিস্থিতি",
    pickScenario: "আপনার জমির উপযুক্ত পরিস্থিতি বাছুন।",
    waterFit: "পানির উপযুক্ততা", overallFit: "সামগ্রিক উপযুক্ততা",
    rotationSeq: "ক্রম", action: "প্রস্তাবিত পদক্ষেপ", rationale: "যুক্তি",
    evidence: "প্রমাণ",
    compareStep: "ধাপ ৪", compareTitle: "পরিস্থিতি তুলনা",
    simStep: "ধাপ ৫", simTitle: "পরিস্থিতি সিমুলেটর",
    simNotForecast: "অনুমানভিত্তিক, পূর্বাভাস নয়।",
    climateWater: "জলবায়ু ও পানি", rainfallChange: "বৃষ্টিপাত পরিবর্তন",
    waterAvail: "পানির প্রাপ্যতা", tempChange: "তাপমাত্রা পরিবর্তন",
    seasonLength: "মৌসুমের দৈর্ঘ্য", soilNutrient: "মাটির পুষ্টি সিমুলেটর",
    liebigHint: "মাটির পুষ্টি মান দিন — কোন পুষ্টি উৎপাদন সীমিত করছে তা দেখুন।",
    limitingFactor: "প্রধান সীমাবদ্ধ উপাদান", soilBalanced: "মাটি সুষম",
    yieldImpact: "আনুমানিক ফলন প্রভাব", soilPenalty: "মাটির জরিমানা",
    idealRange: "আদর্শ",
    doctorTitle: "ফসল ডাক্তার — লক্ষণ নির্ণয়",
    searchSymptom: "লক্ষণ খুঁজুন (হলুদ পাতা, দাগ…)",
    allCrops: "সব ফসল", noMatch: "কোনো রোগ পাওয়া যায়নি।",
    treatment: "চিকিৎসা", prevention: "প্রতিরোধ",
    forecastTitle: "৭ দিনের পূর্বাভাস", fetchingForecast: "পূর্বাভাস আনা হচ্ছে…",
    liveForecast: "সরাসরি Open-Meteo পূর্বাভাস",
    demoForecast: "ডেমো মান — পূর্বাভাস অনুপলব্ধ",
    totalRain: "৭ দিনের মোট বৃষ্টি", et0Label: "ET₀",
    irrigDemand: "সেচের প্রয়োজন (৭ দিন)", forecastAlerts: "পূর্বাভাস সতর্কতা",
    irrigBar: "দৈনিক সেচ চাহিদা (ET₀ − বৃষ্টি, মি.মি.)",
    irrigBarSub: "উৎস: Open-Meteo · ET₀ FAO-56 পদ্ধতি",
    cropsTitle: "ফসল তথ্য ও মৌসুমী ক্যালেন্ডার",
    cropCompat: "ফসলের বৃদ্ধি উইন্ডো ও তাপমাত্রা সামঞ্জস্য",
    historyTitle: "ক্ষেত্রের ইতিহাস ও সংরক্ষিত পরিকল্পনা",
    savedPlans: "সংরক্ষিত পরিকল্পনা", noSavedPlans: "কোনো পরিকল্পনা সংরক্ষিত নেই।",
    howTitle: "AgroNova কীভাবে কাজ করে",
    profileTitle: "প্রোফাইল ও সেটিংস", languageLabel: "ভাষা পরিবর্তন",
    languageHint: "পুরো অ্যাপের ভাষা তাৎক্ষণিকভাবে পরিবর্তন হবে।",
    langEn: "English (ইংরেজি)", langBn: "বাংলা", langHi: "हिन्दी (হিন্দি)",
    langEs: "Español (স্প্যানিশ)", langSw: "Kiswahili (সোয়াহিলি)",
  },
  hi: {
    demo: "डेमो कार्यक्षेत्र", field: "खेत", health: "खेत का स्वास्थ्य",
    rotation: "फसल चक्र लैब", compare: "तुलना", simulator: "क्या-अगर सिम्युलेटर",
    doctor: "फसल डॉक्टर", forecast: "7-दिन का पूर्वानुमान", crops: "फसल पुस्तकालय",
    history: "इतिहास", how: "यह कैसे काम करता है", profile: "प्रोफाइल",
    ask: "नोवा से पूछें", select: "खेत चुनें", source: "साक्ष्य देखें",
    listen: "सुनें", save: "योजना सहेजें", share: "साझा करें",
    download: "PDF डाउनलोड", back: "वापस", search: "खोजें", close: "बंद करें",
    onlineLabel: "ऑनलाइन", offlineLabel: "ऑफलाइन · कैश्ड",
    farmerWorkspace: "किसान कार्यक्षेत्र", demoWorkspace: "डेमो कार्यक्षेत्र",
    liveNasa: "मेरा खेत · लाइव NASA अवलोकन",
    loginSignup: "लॉगिन / साइनअप", signOut: "साइन आउट",
    fieldStep: "चरण 1", chooseField: "अपना खेत चुनें",
    searchField: "जिला या खेत खोजें…",
    yourFarmFields: "आपके खेत", noFieldMatch: "कोई खेत नहीं मिला।",
    coordinates: "निर्देशांक", season: "मौसम", water: "पानी",
    soilType: "मिट्टी का प्रकार", priority: "प्राथमिकता", fieldSize: "आकार (हे)",
    cropType: "फसल", next: "खेत स्वास्थ्य देखें →",
    tapMapHint: "पिन टैप करें या मानचित्र पर टैप करें।",
    healthStep: "चरण 2", nasaEvidence: "NASA साक्ष्य और खेत स्वास्थ्य",
    liveObservation: "लाइव NASA POWER अवलोकन",
    fetchingNasa: "NASA डेटा प्राप्त हो रहा है…",
    temperature: "तापमान", rainfall: "वर्षा", humidity: "आर्द्रता",
    solar: "सौर विकिरण", windSpeed: "हवा की गति", dewPoint: "ओस बिंदु",
    evapotrans: "वाष्पोत्सर्जन", irrigationNeed: "सिंचाई की आवश्यकता",
    irrigationStatus: "सिंचाई स्थिति", heatStatus: "गर्मी का तनाव",
    fungalRisk: "कवक रोग जोखिम", windStatus: "स्प्रे सलाह",
    statusLow: "कम", statusModerate: "मध्यम", statusActNow: "अभी कार्य करें",
    statusNormal: "सामान्य", statusWatch: "सतर्क", statusHighRisk: "उच्च जोखिम",
    statusSafe: "सुरक्षित", statusCaution: "सावधानी", statusNoSpray: "स्प्रे न करें",
    rotationStep: "चरण 3", rotationTitle: "फसल चक्र परिदृश्य",
    pickScenario: "अपने खेत की स्थिति के अनुसार परिदृश्य चुनें।",
    waterFit: "पानी उपयुक्तता", overallFit: "कुल उपयुक्तता",
    rotationSeq: "क्रम", action: "अनुशंसित कार्रवाई", rationale: "तर्क",
    evidence: "साक्ष्य",
    compareStep: "चरण 4", compareTitle: "परिदृश्य तुलना",
    simStep: "चरण 5", simTitle: "क्या-अगर सिम्युलेटर",
    simNotForecast: "परिदृश्य अनुमान, पूर्वानुमान नहीं।",
    climateWater: "जलवायु और पानी", rainfallChange: "वर्षा परिवर्तन",
    waterAvail: "पानी की उपलब्धता", tempChange: "तापमान परिवर्तन",
    seasonLength: "मौसम की लंबाई", soilNutrient: "मिट्टी पोषक सिम्युलेटर",
    liebigHint: "मिट्टी स्वास्थ्य कार्ड मान दर्ज करें।",
    limitingFactor: "मुख्य सीमित कारक", soilBalanced: "मिट्टी संतुलित है",
    yieldImpact: "अनुमानित उपज प्रभाव", soilPenalty: "मिट्टी दंड",
    idealRange: "आदर्श",
    doctorTitle: "फसल डॉक्टर — लक्षण निदान",
    searchSymptom: "लक्षण खोजें (पीली पत्तियां, धब्बे…)",
    allCrops: "सभी फसलें", noMatch: "कोई रोग नहीं मिला।",
    treatment: "उपचार", prevention: "रोकथाम",
    forecastTitle: "7-दिन का पूर्वानुमान", fetchingForecast: "पूर्वानुमान प्राप्त हो रहा है…",
    liveForecast: "लाइव Open-Meteo पूर्वानुमान",
    demoForecast: "डेमो मान — पूर्वानुमान अनुपलब्ध",
    totalRain: "7-दिन कुल वर्षा", et0Label: "ET₀",
    irrigDemand: "सिंचाई आवश्यकता (7 दिन)", forecastAlerts: "पूर्वानुमान अलर्ट",
    irrigBar: "दैनिक सिंचाई मांग (ET₀ − वर्षा, मिमी)",
    irrigBarSub: "स्रोत: Open-Meteo · ET₀ FAO-56 विधि",
    cropsTitle: "फसल पुस्तकालय और मौसमी कैलेंडर",
    cropCompat: "फसल विकास विंडो और तापमान संगतता",
    historyTitle: "खेत इतिहास और सहेजी गई योजनाएं",
    savedPlans: "सहेजी गई योजनाएं", noSavedPlans: "अभी तक कोई योजना नहीं।",
    howTitle: "AgroNova कैसे काम करता है",
    profileTitle: "प्रोफाइल और सेटिंग्स", languageLabel: "भाषा बदलें",
    languageHint: "पूरे ऐप की भाषा तुरंत बदल जाएगी।",
    langEn: "English (अंग्रेजी)", langBn: "বাংলা (बंगाली)",
    langHi: "हिन्दी", langEs: "Español (स्पेनिश)", langSw: "Kiswahili (स्वाहिली)",
  },
  es: {
    demo: "Espacio de prueba", field: "Parcela", health: "Salud del campo",
    rotation: "Rotación de cultivos", compare: "Comparar",
    simulator: "¿Qué pasaría si?", doctor: "Doctor de cultivos",
    forecast: "Pronóstico 7 días", crops: "Biblioteca de cultivos",
    history: "Historial", how: "Cómo funciona", profile: "Perfil",
    ask: "Pregunta a Nova", select: "Seleccionar parcela", source: "Ver evidencia",
    listen: "Escuchar", save: "Guardar plan", share: "Compartir",
    download: "Descargar PDF", back: "Volver", search: "Buscar", close: "Cerrar",
    onlineLabel: "En línea", offlineLabel: "Sin conexión · caché",
    farmerWorkspace: "Espacio del agricultor", demoWorkspace: "Espacio de prueba",
    liveNasa: "Mi parcela · Observaciones NASA en vivo",
    loginSignup: "Iniciar sesión / Registrarse", signOut: "Cerrar sesión",
    fieldStep: "Paso 1", chooseField: "Elige tu parcela",
    searchField: "Buscar distrito o parcela…",
    yourFarmFields: "Tus parcelas", noFieldMatch: "No se encontraron parcelas.",
    coordinates: "Coordenadas", season: "Temporada", water: "Agua",
    soilType: "Tipo de suelo", priority: "Prioridad", fieldSize: "Tamaño (ha)",
    cropType: "Cultivo", next: "Ver salud del campo →",
    tapMapHint: "Toca un pin para seleccionar o toca el mapa.",
    healthStep: "Paso 2", nasaEvidence: "Evidencia NASA y salud del campo",
    liveObservation: "Observaciones en tiempo real de NASA POWER",
    fetchingNasa: "Obteniendo datos NASA…",
    temperature: "Temperatura", rainfall: "Lluvia", humidity: "Humedad",
    solar: "Radiación solar", windSpeed: "Velocidad del viento",
    dewPoint: "Punto de rocío", evapotrans: "Evapotranspiración",
    irrigationNeed: "Necesidad de riego", irrigationStatus: "Estado de riego",
    heatStatus: "Estrés por calor", fungalRisk: "Riesgo de enfermedades fúngicas",
    windStatus: "Aviso de aplicación",
    statusLow: "Bajo", statusModerate: "Moderado", statusActNow: "Actúa ahora",
    statusNormal: "Normal", statusWatch: "Vigilar", statusHighRisk: "Alto riesgo",
    statusSafe: "Seguro", statusCaution: "Precaución", statusNoSpray: "No rociar",
    rotationStep: "Paso 3", rotationTitle: "Escenarios de rotación de cultivos",
    pickScenario: "Elige el escenario que mejor se adapte.",
    waterFit: "Adecuación hídrica", overallFit: "Adecuación general",
    rotationSeq: "Secuencia", action: "Acción recomendada", rationale: "Justificación",
    evidence: "Evidencia",
    compareStep: "Paso 4", compareTitle: "Comparar escenarios",
    simStep: "Paso 5", simTitle: "Simulador ¿Qué pasaría si?",
    simNotForecast: "Suposiciones, no pronósticos.",
    climateWater: "Clima y agua", rainfallChange: "Cambio en lluvia",
    waterAvail: "Disponibilidad de agua", tempChange: "Cambio de temperatura",
    seasonLength: "Duración de temporada", soilNutrient: "Simulador de nutrientes",
    liebigHint: "Ingresa valores del perfil de suelo para ver qué nutriente limita el rendimiento.",
    limitingFactor: "Factor limitante #1", soilBalanced: "Suelo equilibrado",
    yieldImpact: "Impacto estimado en rendimiento", soilPenalty: "Penalización del suelo",
    idealRange: "Ideal",
    doctorTitle: "Doctor de cultivos — Diagnóstico de síntomas",
    searchSymptom: "Buscar síntomas (hojas amarillas, manchas…)",
    allCrops: "Todos los cultivos", noMatch: "No se encontraron enfermedades.",
    treatment: "Tratamiento", prevention: "Prevención",
    forecastTitle: "Pronóstico 7 días", fetchingForecast: "Obteniendo pronóstico…",
    liveForecast: "Pronóstico en vivo Open-Meteo",
    demoForecast: "Valores de demostración — pronóstico no disponible",
    totalRain: "Lluvia total 7 días", et0Label: "ET₀",
    irrigDemand: "Necesidad de riego (7 días)", forecastAlerts: "Alertas de pronóstico",
    irrigBar: "Demanda diaria de riego (ET₀ − lluvia, mm)",
    irrigBarSub: "Fuente: Open-Meteo · ET₀ método FAO-56",
    cropsTitle: "Biblioteca de cultivos y calendario estacional",
    cropCompat: "Ventanas de crecimiento y compatibilidad de temperatura para",
    historyTitle: "Historial del campo y planes guardados",
    savedPlans: "Planes guardados", noSavedPlans: "No hay planes guardados aún.",
    howTitle: "Cómo funciona AgroNova",
    profileTitle: "Perfil y configuración", languageLabel: "Idioma de la interfaz",
    languageHint: "Cambia el idioma de toda la aplicación al instante.",
    langEn: "English (inglés)", langBn: "বাংলা (bengalí)", langHi: "हिन्दी (hindi)",
    langEs: "Español", langSw: "Kiswahili (suajili)",
  },
  sw: {
    demo: "Sehemu ya majaribio", field: "Shamba", health: "Afya ya shamba",
    rotation: "Mzunguko wa mazao", compare: "Linganisha",
    simulator: "Kielelezo cha Nini-Ikiwa", doctor: "Daktari wa Mazao",
    forecast: "Utabiri wa Siku 7", crops: "Maktaba ya mazao",
    history: "Historia", how: "Inavyofanya kazi", profile: "Wasifu",
    ask: "Uliza Nova", select: "Chagua shamba", source: "Tazama ushahidi",
    listen: "Sikiliza", save: "Hifadhi mpango", share: "Shiriki",
    download: "Pakua PDF", back: "Rudi", search: "Tafuta", close: "Funga",
    onlineLabel: "Mtandaoni", offlineLabel: "Nje ya mtandao · hifadhi",
    farmerWorkspace: "Eneo la Mkulima", demoWorkspace: "Eneo la Majaribio",
    liveNasa: "Shamba langu · Uchunguzi wa NASA wa Moja kwa Moja",
    loginSignup: "Ingia / Jisajili", signOut: "Ondoka",
    fieldStep: "Hatua 1", chooseField: "Chagua shamba lako",
    searchField: "Tafuta wilaya au shamba…",
    yourFarmFields: "Mashamba yako", noFieldMatch: "Hakuna shamba linalofanana.",
    coordinates: "Viwianishi", season: "Msimu", water: "Maji",
    soilType: "Aina ya udongo", priority: "Kipaumbele", fieldSize: "Ukubwa (ha)",
    cropType: "Zao", next: "Angalia afya ya shamba →",
    tapMapHint: "Gusa pini kuchagua au gusa ramani.",
    healthStep: "Hatua 2", nasaEvidence: "Ushahidi wa NASA na afya ya shamba",
    liveObservation: "Uchunguzi wa NASA POWER wa wakati halisi",
    fetchingNasa: "Kupata data ya NASA…",
    temperature: "Joto", rainfall: "Mvua", humidity: "Unyevu",
    solar: "Mionzi ya jua", windSpeed: "Kasi ya upepo", dewPoint: "Kiwango cha umande",
    evapotrans: "Uvukizi", irrigationNeed: "Haja ya umwagiliaji",
    irrigationStatus: "Hali ya umwagiliaji", heatStatus: "Msongo wa joto",
    fungalRisk: "Hatari ya ugonjwa wa kuvu", windStatus: "Ushauri wa kupulizia",
    statusLow: "Chini", statusModerate: "Wastani", statusActNow: "Chukua hatua sasa",
    statusNormal: "Kawaida", statusWatch: "Angalia", statusHighRisk: "Hatari kubwa",
    statusSafe: "Salama", statusCaution: "Tahadhari", statusNoSpray: "Usipulizie",
    rotationStep: "Hatua 3", rotationTitle: "Hali za mzunguko wa mazao",
    pickScenario: "Chagua hali inayofaa shamba lako.",
    waterFit: "Ufaao wa maji", overallFit: "Ufaao wa jumla",
    rotationSeq: "Mpangilio", action: "Hatua inayopendekezwa", rationale: "Sababu",
    evidence: "Ushahidi",
    compareStep: "Hatua 4", compareTitle: "Linganisha hali",
    simStep: "Hatua 5", simTitle: "Kielelezo cha Nini-Ikiwa",
    simNotForecast: "Makadirio ya hali, si utabiri.",
    climateWater: "Hali ya hewa na maji", rainfallChange: "Mabadiliko ya mvua",
    waterAvail: "Upatikanaji wa maji", tempChange: "Mabadiliko ya joto",
    seasonLength: "Urefu wa msimu", soilNutrient: "Kielelezo cha virutubisho vya udongo",
    liebigHint: "Ingiza maadili ya udongo kuona kirutubisho kinachozuia mavuno.",
    limitingFactor: "Kizuizi kikuu #1", soilBalanced: "Udongo uko sawa",
    yieldImpact: "Athari ya mavuno (makadirio)", soilPenalty: "Adhabu ya udongo",
    idealRange: "Bora",
    doctorTitle: "Daktari wa Mazao — Utambuzi wa Dalili",
    searchSymptom: "Tafuta dalili (majani ya njano, madoa…)",
    allCrops: "Mazao yote", noMatch: "Hakuna ugonjwa uliopatikana.",
    treatment: "Matibabu", prevention: "Kinga",
    forecastTitle: "Utabiri wa Siku 7", fetchingForecast: "Kupata utabiri…",
    liveForecast: "Utabiri wa Moja kwa Moja wa Open-Meteo",
    demoForecast: "Maadili ya majaribio — utabiri haupatikani",
    totalRain: "Mvua jumla siku 7", et0Label: "ET₀",
    irrigDemand: "Haja ya umwagiliaji (siku 7)", forecastAlerts: "Tahadhari za utabiri",
    irrigBar: "Mahitaji ya umwagiliaji kila siku (ET₀ − mvua, mm)",
    irrigBarSub: "Chanzo: Open-Meteo · ET₀ njia ya FAO-56",
    cropsTitle: "Maktaba ya mazao na kalenda ya msimu",
    cropCompat: "Madirisha ya ukuaji na uoanifu wa joto kwa",
    historyTitle: "Historia ya shamba na mipango iliyohifadhiwa",
    savedPlans: "Mipango iliyohifadhiwa", noSavedPlans: "Hakuna mipango iliyohifadhiwa bado.",
    howTitle: "Jinsi AgroNova Inavyofanya Kazi",
    profileTitle: "Wasifu na Mipangilio", languageLabel: "Lugha ya programu",
    languageHint: "Hubadilisha lugha yote ya programu mara moja.",
    langEn: "English (Kiingereza)", langBn: "বাংলা (Kibengali)",
    langHi: "हिन्दी (Kihindi)", langEs: "Español (Kihispania)", langSw: "Kiswahili",
  },
};

export function adjustedScenario(
  scenario: Scenario,
  rainfall: number,
  water: number,
  temperature: number,
  seasonLength: number,
) {
  const waterEffect = rainfall * 0.08 + water * 0.12;
  const heatEffect = Math.abs(temperature) * (scenario.id === "B" ? 1.3 : 2.2);
  const seasonEffect = seasonLength < 0 && scenario.id === "C" ? seasonLength * 0.25 : seasonLength * 0.08;
  const nextScore = Math.max(35, Math.min(97, Math.round(scenario.score + waterEffect - heatEffect + seasonEffect)));
  return {
    ...scenario,
    adjustedScore: nextScore,
    delta: nextScore - scenario.score,
    explanation:
      temperature > 1
        ? "Higher heat increases crop stress, especially for longer rotations."
        : rainfall < -10
          ? "Lower rainfall raises irrigation pressure and reduces water-fit."
          : water > 10
            ? "More available water improves flexibility, but does not remove heat risk."
            : seasonLength < -7
              ? "A shorter season favours quicker crop sequences."
              : "These assumptions keep the overall trade-offs close to the baseline.",
  };
}

export function novaReply(question: string, language: Language, selected: Scenario): string {
  const q = question.toLowerCase().trim();

  // Non-agricultural off-topic check
  const nonAgriKeywords = [
    "code", "python", "javascript", "react", "html", "css", "sql", "programming", "software",
    "movie", "actor", "actress", "cinema", "song", "music", "singer", "hollywood", "bollywood",
    "football", "soccer", "cricket", "basketball", "messi", "ronaldo", "game", "gaming", "playstation",
    "crypto", "bitcoin", "ethereum", "stock market", "trading", "politics", "president", "election",
    "homework", "math", "calculus", "joke", "story",
  ];

  const agriKeywords = [
    "crop", "farm", "field", "soil", "seed", "plant", "water", "rain", "irrigation",
    "rice", "wheat", "maize", "potato", "tomato", "mustard", "mungbean", "lentil", "jute",
    "pest", "disease", "fertilizer", "urea", "nitrogen", "npk", "fungus", "blight", "rust",
    "rot", "yield", "rotation", "harvest", "sowing", "weather", "nasa", "smap", "power",
    "gpm", "climate", "temp", "humidity", "moisture", "drought", "flood", "loam", "clay",
    "কৃষি", "ফসল", "জমি", "মাটি", "ধান", "গম", "সার", "কীটপতঙ্গ", "বৃষ্টি", "আবর্তন",
    "खेती", "फसल", "खेत", "मिट्टी", "धान", "गेहूं", "उर्वरक", "कीट", "बारिश", "चक्र",
    "agricultura", "cultivo", "suelo", "riego", "plaga", "enfermedad", "clima", "cosecha",
    "kilimo", "mazao", "udongo", "maji", "mvua", "wadudu", "mbolea",
  ];

  const hasAgri = agriKeywords.some((term) => q.includes(term));
  const isOffTopic = !hasAgri && nonAgriKeywords.some((kw) => {
    const rx = new RegExp(`\\b${kw}\\b`, "i");
    return rx.test(q);
  });

  if (isOffTopic) {
    if (language === "bn") {
      return "আমি নোভা, আপনার নিবেদিত কৃষি ও ফসল বিশেষজ্ঞ। আমি কেবলমাত্র কৃষিকাজ, ফসল আবর্তন, মাটির স্বাস্থ্য, রোগবালাই দমন এবং নাসার স্যাটেলাইট তথ্য সম্পর্কিত বিষয়ে উত্তর দিতে পারি। আপনার জমি বা ফসল নিয়ে যেকোনো প্রশ্ন করুন!";
    }
    if (language === "hi") {
      return "मैं नोवा हूँ, आपका समर्पित कृषि और फसल विशेषज्ञ। मैं केवल खेती, फसल चक्र, मिट्टी के स्वास्थ्य, रोग प्रबंधन और नासा उपग्रह जलवायु डेटा से संबंधित प्रश्नों में ही सहायता कर सकता हूँ। कृपया अपने खेत या फसल से संबंधित कोई प्रश्न पूछें!";
    }
    if (language === "es") {
      return "Soy Nova, tu especialista agronómico y de cultivos. Solo puedo responder preguntas sobre agricultura, rotación de cultivos, salud del suelo, patología vegetal y datos satelitales de la NASA. ¡Hazme una pregunta sobre tus cultivos!";
    }
    if (language === "sw") {
      return "Mimi ni Nova, mtaalamu wako wa kilimo na mazao. Ninaweza kujibu maswali yanayohusu kilimo, mzunguko wa mazao, afya ya udongo, magonjwa ya mimea, na takwimu za satelaiti za NASA pekee. Tafadhali niulize swali kuhusu shamba lako!";
    }
    return "I am Nova, your specialized agricultural companion. I am exclusively trained to assist with farming, crop rotations, soil health, plant pathology, and NASA satellite climate data for your fields. Please ask me a farming or crop-related question!";
  }

  // Bengali responses
  if (language === "bn") {
    if (q.includes("nasa") || q.includes("স্যাটেলাইট") || q.includes("তথ্য")) {
      return `এই সুপারিশে NASA SMAP-এর মাটির আর্দ্রতা, GPM-এর বৃষ্টিপাত এবং POWER-এর তাপমাত্রা ও বিকিরণ তথ্য ব্যবহার করা হয়েছে। এই উপগ্রহ তথ্যগুলো মাটির পানির ঘাটতি ও ফসল বোনার উপযুক্ত সময় নির্ধারণে সাহায্য করে।`;
    }
    if (q.includes("পানি") || q.includes("বৃষ্টি") || q.includes("সেচ")) {
      return `${selected.name} আবর্তনে পানি সাশ্রয়ের হার প্রায় ${selected.water}/১০০। ধান কাটার পর ডালজাতীয় ফসল করলে মাটির অবশিষ্ট আর্দ্রতা কাজে লাগে এবং অতিরিক্ত সেচের খরচ বেঁচে যায়।`;
    }
    if (q.includes("মাটি") || q.includes("সার") || q.includes("নাইট্রোজেন")) {
      return `এই আবর্তনে লেগুমিনাস (মুগ ডাল) ফসল অন্তর্ভুক্ত করায় রাইজোবিয়াম ব্যাকটেরিয়ার মাধ্যমে বায়ুমণ্ডল থেকে প্রাকৃতিকভাবে নাইট্রোজেন সংবদ্ধিত হয়, ফলে পরবর্তী ফসলে ইউরিয়া সারের ব্যবহার ২০-২৫% কম লাগে।`;
    }
    if (q.includes("রোগ") || q.includes("বালাই") || q.includes("কীটপতঙ্গ")) {
      return `একই জমিতে বারবার এক ফসল চাষ করলে মাটিতে ক্ষতিকর জীবাণু জমা হয়। ${selected.sequence.join(" → ")} চক্র অনুসরণ করলে পোকামাকড় ও ব্লাস্ট রোগের জীবনচক্র ভেঙে যায়।`;
    }
    return `${selected.name} আবর্তনটি আপনার জমির জন্য সর্বোত্তম। এটি NASA Earth ডাটার সাথে সংগতিপূর্ণ এবং পানির চাপ কমিয়ে মাটির উর্বরতা বাড়ায়।`;
  }

  // Hindi responses
  if (language === "hi") {
    if (q.includes("nasa") || q.includes("उपग्रह") || q.includes("डेटा")) {
      return `यह सलाह NASA SMAP मिट्टी की नमी, GPM उपग्रह वर्षा और POWER कृषि-जलवायु डेटा पर आधारित है। यह उपग्रह डेटा मिट्टी की जल आवश्यकता और सटीक बुवाई का समय निर्धारित करने में मदद करता है।`;
    }
    if (q.includes("पानी") || q.includes("बारिश") || q.includes("सिंचाई")) {
      return `${selected.name} चक्र जल दक्षता स्कोर ${selected.water}/100 प्रदान करता है। दलहनी फसलों को शामिल करने से भूजल का अत्यधिक दोहन रुकता है और सिंचाई लागत कम होती है।`;
    }
    if (q.includes("रोग") || q.includes("कीट") || q.includes("कीड़ा")) {
      return `${selected.sequence.join(" → ")} का फसल चक्र अपनाने से मिट्टी में पैदा होने वाले रोगजनकों और कीटों का चक्र टूट जाता है, जिससे कीटनाशकों का खर्च कम होता है।`;
    }
    return `${selected.name} विकल्प का चयन जल उपयोग संतुलन और मौसमी उपयुक्तता के लिए अनुशंसित है। यह परिदृश्य नासा डेटा पर आधारित है।`;
  }

  // Spanish responses
  if (language === "es") {
    if (q.includes("nasa") || q.includes("satélite") || q.includes("datos")) {
      return `Esta recomendación integra observaciones satelitales de humedad del suelo NASA SMAP, lluvia de GPM IMERG y radiación/temperatura de POWER para maximizar la resiliencia climática del cultivo.`;
    }
    if (q.includes("agua") || q.includes("lluvia") || q.includes("riego")) {
      return `La rotación ${selected.name} tiene un puntaje de ajuste hídrico de ${selected.water}/100, reduciendo el estrés en periodos de sequía mediante cultivos de ciclo corto.`;
    }
    return `La opción ${selected.name} (${selected.sequence.join(" → ")}) equilibra el consumo de agua, fija nitrógeno en el suelo y rompe ciclos de plagas comunes.`;
  }

  // Swahili responses
  if (language === "sw") {
    if (q.includes("nasa") || q.includes("satelaiti") || q.includes("takwimu")) {
      return `Ushauri huu unatumia data ya unyevu wa udongo ya NASA SMAP, mvua ya GPM, na joto/mionzi ya POWER kusaidia kupanga upanzi kulingana na msimu.`;
    }
    return `Mzunguko wa ${selected.name} (${selected.sequence.join(" → ")}) unalinda shamba lako dhidi ya ukame kwa kuboresha afya ya udongo na kupunguza matumizi ya maji.`;
  }

  // English responses
  if (q.includes("nasa") || q.includes("satellite") || q.includes("data") || q.includes("smap") || q.includes("power")) {
    return "This agronomic advice is directly calibrated using NASA SMAP (root-zone soil moisture), GPM IMERG (satellite precipitation estimates), and NASA POWER (daily solar irradiance, temperature, and relative humidity). These Earth observations ensure planting schedules match actual soil moisture rather than guesswork.";
  }
  if (q.includes("rain") || q.includes("water") || q.includes("irrigation") || q.includes("drought")) {
    return `${selected.name} scores ${selected.water}/100 for water-fit. By rotating from high-demand paddy rice into low-water pulses, you conserve groundwater and capitalize on residual root-zone moisture detected by NASA SMAP.`;
  }
  if (q.includes("soil") || q.includes("fertilizer") || q.includes("nitrogen") || q.includes("nutrient")) {
    return `In this sequence (${selected.sequence.join(" → ")}), introducing legumes fixes atmospheric nitrogen into the soil (soil score: ${selected.soil}/100). This reduces synthetic urea/NPK requirements by 20-30% for the subsequent cereal crop.`;
  }
  if (q.includes("pest") || q.includes("disease") || q.includes("blast") || q.includes("blight") || q.includes("fungus")) {
    return `Monoculture cultivations build up soil-borne pathogens and insect populations. Switching crops through ${selected.sequence.join(" → ")} disrupts host availability, suppressing stem borers, fungal blast, and root rots naturally.`;
  }
  return `${selected.name} (${selected.sequence.join(" → ")}) is prioritized for your field because it balances seasonal water availability, soil nutrient restoration, and climate resilience (${selected.resilience}/100). Grounded in NASA Earth observations.`;
}

// Sample farmer shown in the demo Profile section (not a real person).
export const demoFarmer = {
  name: "Abdul Karim (demo)",
  village: "Paba Upazila, Rajshahi",
  district: "Rajshahi",
  phone: "+880 1XXX-XXXXXX (sample)",
  since: "2004",
  land: "3 fields · 3.4 ha",
  crops: "Rice, Wheat, Lentil",
  language: "বাংলা / English",
};
