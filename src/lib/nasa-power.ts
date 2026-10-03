export type PowerReading = {
  date: string;
  temperature: number | null;        // T2M — mean temp at 2m °C
  tempMax: number | null;            // T2M_MAX — daily max temp °C
  tempMin: number | null;            // T2M_MIN — daily min temp °C
  rain: number | null;               // PRECTOTCORR — corrected precipitation mm/day
  humidity: number | null;           // RH2M — relative humidity %
  solar: number | null;              // ALLSKY_SFC_SW_DWN — solar radiation kWh/m²/day
  windSpeed: number | null;          // WS10M — wind speed m/s at 10m
  dewPoint: number | null;           // T2MDEW — dew/frost point °C
  evapotranspiration: number | null; // EVPTRNS — evapotranspiration mm/day
};

export type NasaFieldInsights = {
  readings: PowerReading[];
  source: "live" | "cached" | "fallback";
  latestDate: string;
  summary: {
    meanTemp7d: number;
    totalRain7d: number;
    totalRain30d: number;
    meanHumidity7d: number;
    meanSolar7d: number;
    extremeHeatDays: number;
    frostRiskDays: number;
    totalET7d: number;
    irrigationDeficit7d: number;
    meanWindSpeed7d: number;
    meanDewPoint7d: number;
    leafWetHours7d: number;
    irrigationStatus: "Low" | "Moderate" | "Act Now";
    irrigationAdvice: string;
    heatStatus: "Normal" | "Watch" | "High Risk";
    heatAdvice: string;
    windStatus: "Safe" | "Caution" | "No-Spray";
    windAdvice: string;
    fungalRisk: "Low" | "Moderate" | "High";
    fungalAdvice: string;
  };
  chartTimeline: Array<{
    day: string;
    rain: number;
    temp: number;
    moisture: number;
    vegetation: number;
  }>;
};

const CACHE_KEY_PREFIX = "nasa_power_cache_";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// 9 NASA POWER agroclimatology variables (API limit is 20 per request)
const POWER_PARAMS =
  "T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,RH2M,ALLSKY_SFC_SW_DWN,WS10M,T2MDEW,EVPTRNS";

export async function getPowerReadings(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<PowerReading[]> {
  const cacheKey = `${CACHE_KEY_PREFIX}${latitude.toFixed(2)}_${longitude.toFixed(2)}`;
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { timestamp, data } = JSON.parse(cached) as { timestamp: number; data: PowerReading[] };
        if (Date.now() - timestamp < CACHE_TTL_MS && Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch {
      // Ignore cache parse errors
    }
  }

  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 3); // POWER has 3–4 day NRT lag
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 29);

  const fmt = (d: Date) => d.toISOString().slice(0, 10).replaceAll("-", "");
  const url = new URL("https://power.larc.nasa.gov/api/temporal/daily/point");
  const qp: Record<string, string> = {
    parameters: POWER_PARAMS,
    community: "AG",
    longitude: String(longitude),
    latitude: String(latitude),
    format: "JSON",
    start: fmt(start),
    end: fmt(end),
  };
  Object.entries(qp).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), { signal: signal ?? null });
  if (!res.ok) throw new Error(`NASA POWER API returned ${res.status}`);

  const json = (await res.json()) as {
    properties?: { parameter?: Record<string, Record<string, number>> };
  };

  const p = json.properties?.parameter;
  const temperatures = p?.["T2M"];
  if (!temperatures) throw new Error("NASA POWER returned no observations.");

  const valid = (n: number | undefined): number | null =>
    n == null || n <= -900 ? null : Math.round(n * 10) / 10;

  const results: PowerReading[] = Object.keys(temperatures)
    .sort()
    .map((date) => ({
      date,
      temperature: valid(temperatures[date]),
      tempMax: valid(p?.["T2M_MAX"]?.[date]),
      tempMin: valid(p?.["T2M_MIN"]?.[date]),
      rain: valid(p?.["PRECTOTCORR"]?.[date]),
      humidity: valid(p?.["RH2M"]?.[date]),
      solar: valid(p?.["ALLSKY_SFC_SW_DWN"]?.[date]),
      windSpeed: valid(p?.["WS10M"]?.[date]),
      dewPoint: valid(p?.["T2MDEW"]?.[date]),
      evapotranspiration: valid(p?.["EVPTRNS"]?.[date]),
    }))
    .filter((r) => r.temperature !== null || r.rain !== null);

  if (typeof window !== "undefined" && results.length > 0) {
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: results }));
    } catch { /* storage quota guard */ }
  }
  return results;
}

/** Derives agronomic metrics from 9 NASA POWER parameters */
export function computeFieldInsights(readings: PowerReading[]): NasaFieldInsights["summary"] {
  if (!readings.length) {
    return {
      meanTemp7d: 29.5, totalRain7d: 14, totalRain30d: 82,
      meanHumidity7d: 74, meanSolar7d: 17.5, extremeHeatDays: 2,
      frostRiskDays: 0, totalET7d: 32, irrigationDeficit7d: 18,
      meanWindSpeed7d: 1.8, meanDewPoint7d: 24.1, leafWetHours7d: 8,
      irrigationStatus: "Moderate",
      irrigationAdvice: "Soil moisture adequate. Monitor rainfall forecast over the next 48 hours.",
      heatStatus: "Watch",
      heatAdvice: "Temperatures near seasonal average; monitor afternoon heat stress.",
      windStatus: "Safe",
      windAdvice: "Wind speed within safe spray application range (<3 m/s).",
      fungalRisk: "Low",
      fungalAdvice: "Dew point and humidity conditions do not strongly favour fungal spore germination.",
    };
  }

  const last7 = readings.slice(-7);
  const nums = (arr: (number | null)[]): number[] => arr.filter((t): t is number => t !== null);
  const avg = (a: number[]) => a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0;
  const sum = (a: number[]) => a.reduce((s, v) => s + v, 0);

  const temps7   = nums(last7.map((r) => r.temperature));
  const tempsMax7 = nums(last7.map((r) => r.tempMax));
  const tempsMin7 = nums(last7.map((r) => r.tempMin));
  const rains7   = nums(last7.map((r) => r.rain));
  const rains30  = nums(readings.map((r) => r.rain));
  const hums7    = nums(last7.map((r) => r.humidity));
  const solars7  = nums(last7.map((r) => r.solar));
  const winds7   = nums(last7.map((r) => r.windSpeed));
  const dews7    = nums(last7.map((r) => r.dewPoint));
  const et7      = nums(last7.map((r) => r.evapotranspiration));

  const meanTemp7d       = Math.round(avg(temps7) * 10) / 10 || 30;
  const totalRain7d      = Math.round(sum(rains7) * 10) / 10;
  const totalRain30d     = Math.round(sum(rains30) * 10) / 10;
  const meanHumidity7d   = Math.round(avg(hums7)) || 70;
  const meanSolar7d      = Math.round(avg(solars7) * 10) / 10 || 16;
  const meanWindSpeed7d  = Math.round(avg(winds7) * 10) / 10;
  const meanDewPoint7d   = Math.round(avg(dews7) * 10) / 10;
  const totalET7d        = Math.round(sum(et7) * 10) / 10;
  const irrigationDeficit7d = Math.round((totalET7d - totalRain7d) * 10) / 10;

  const extremeHeatDays  = (tempsMax7.length ? tempsMax7 : temps7).filter((t) => t >= 35).length;
  const frostRiskDays    = (tempsMin7.length ? tempsMin7 : []).filter((t) => t <= 10).length;
  const leafWetHours7d   = last7.filter(
    (r) => (r.humidity ?? 0) > 85 && (r.temperature ?? 30) < 28,
  ).length * 6;

  // Irrigation
  let irrigationStatus: "Low" | "Moderate" | "Act Now" = "Moderate";
  let irrigationAdvice = "Soil moisture balanced. No urgent irrigation needed.";
  if (irrigationDeficit7d > 20 || (totalRain7d < 5 && meanTemp7d > 31)) {
    irrigationStatus = "Act Now";
    irrigationAdvice = `ET₀ demand exceeds rainfall by ~${irrigationDeficit7d}mm (7 days). Apply 15–20mm irrigation, preferably early morning to reduce evaporation losses.`;
  } else if (irrigationDeficit7d > 10) {
    irrigationStatus = "Moderate";
    irrigationAdvice = `Mild moisture deficit (~${irrigationDeficit7d}mm). Consider light irrigation if no rain forecast in next 48 hours.`;
  } else if (totalRain7d > 35) {
    irrigationStatus = "Low";
    irrigationAdvice = "Recent rainfall sufficient. Avoid additional watering — risk of waterlogging and nitrogen leaching.";
  }

  // Heat
  let heatStatus: "Normal" | "Watch" | "High Risk" = "Normal";
  let heatAdvice = "Temperatures within comfortable crop development thresholds.";
  if (extremeHeatDays >= 3 || meanTemp7d >= 34) {
    heatStatus = "High Risk";
    heatAdvice = `Sustained high temperatures (${meanTemp7d}°C avg, ${extremeHeatDays} days ≥35°C). Mulch, shade netting, or light evening irrigation advised during flowering/grain-fill.`;
  } else if (meanTemp7d >= 31) {
    heatStatus = "Watch";
    heatAdvice = `Mean 7-day temperature ${meanTemp7d}°C is elevated. Watch for heat stress in flowering crops — 2% KCl foliar spray can reduce heat damage.`;
  }

  // Wind / spray advisory
  let windStatus: "Safe" | "Caution" | "No-Spray" = "Safe";
  let windAdvice = `Wind ${meanWindSpeed7d} m/s — safe for pesticide/fertilizer spray application.`;
  if (meanWindSpeed7d > 4.0) {
    windStatus = "No-Spray";
    windAdvice = `Wind speed ${meanWindSpeed7d} m/s is too high for spray. Drift risk is significant. Spray early morning when wind is <3 m/s.`;
  } else if (meanWindSpeed7d > 2.5) {
    windStatus = "Caution";
    windAdvice = `Moderate wind (${meanWindSpeed7d} m/s). Use drift-reducing nozzles and spray in early morning.`;
  }

  // Fungal disease risk
  const humidAndCool = meanHumidity7d > 80 && meanTemp7d < 30;
  const dewClose = meanDewPoint7d > 22 && (meanTemp7d - meanDewPoint7d) < 3;
  let fungalRisk: "Low" | "Moderate" | "High" = "Low";
  let fungalAdvice = "Humidity and dew point do not strongly favour fungal spore germination this week.";
  if ((humidAndCool || dewClose) && leafWetHours7d > 12) {
    fungalRisk = "High";
    fungalAdvice = `High fungal disease risk: humidity ${meanHumidity7d}% with ~${leafWetHours7d}h estimated leaf wetness. Inspect for rice blast, sheath blight, and brown spot. Preventive fungicide may be warranted at tillering or heading stage.`;
  } else if (meanHumidity7d > 75 || leafWetHours7d > 6) {
    fungalRisk = "Moderate";
    fungalAdvice = `Moderate fungal risk: humidity ${meanHumidity7d}%. Inspect leaf undersides for early lesions every 2–3 days.`;
  }

  return {
    meanTemp7d, totalRain7d, totalRain30d, meanHumidity7d, meanSolar7d,
    extremeHeatDays, frostRiskDays, totalET7d, irrigationDeficit7d,
    meanWindSpeed7d, meanDewPoint7d, leafWetHours7d,
    irrigationStatus, irrigationAdvice,
    heatStatus, heatAdvice,
    windStatus, windAdvice,
    fungalRisk, fungalAdvice,
  };
}

/** Transforms NASA readings into timeline points for Recharts charts */
export function formatNasaChartTimeline(readings: PowerReading[]) {
  return readings.map((r) => {
    const d = r.date;
    const dayLabel = d.length === 8 ? `${d.slice(6, 8)}/${d.slice(4, 6)}` : d;
    const rain = r.rain ?? 0;
    const temp = r.temperature ?? 28;
    const humidity = r.humidity ?? 65;
    const moisture = Math.min(42, Math.max(16, Math.round(humidity * 0.25 + rain * 0.8 + 10)));
    const vegetation = Math.min(85, Math.max(48, Math.round(62 + (rain > 1 ? 4 : -1) - (temp > 33 ? 3 : 0))));
    return { day: dayLabel, rain, temp, moisture, vegetation };
  });
}