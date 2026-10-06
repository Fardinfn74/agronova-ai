/**
 * Open-Meteo API integration — free, no API key required
 * Provides 7-day weather forecast + Reference Evapotranspiration (ET₀)
 * Source: https://api.open-meteo.com | https://github.com/open-meteo/open-meteo
 */

export type ForecastDay = {
  date: string; // ISO date
  label: string; // "Mon 04/10"
  tempMax: number; // °C
  tempMin: number; // °C
  rain: number; // mm — total daily rainfall
  et0: number; // mm — FAO-56 reference evapotranspiration
  irrigationNeed: number; // mm — max(0, ET₀ - rain) = net irrigation demand
  weatherCode: number; // WMO weather code
  weatherLabel: string;
  weatherEmoji: string;
  riskLevel: "Low" | "Watch" | "Alert";
  riskReason: string;
};

export type ForecastSummary = {
  days: ForecastDay[];
  totalRain7d: number;
  totalET7d: number;
  totalIrrigationNeed: number;
  peakTempDay: ForecastDay | null;
  highestRainDay: ForecastDay | null;
  source: "live" | "fallback";
  fetchedAt: string;
};

// WMO Weather Interpretation Codes → label + emoji
function interpretWeatherCode(code: number): { label: string; emoji: string } {
  if (code === 0) return { label: "Clear sky", emoji: "☀️" };
  if (code <= 3) return { label: "Partly cloudy", emoji: "⛅" };
  if (code <= 9) return { label: "Fog", emoji: "🌫️" };
  if (code <= 19) return { label: "Drizzle", emoji: "🌦️" };
  if (code <= 29) return { label: "Rain", emoji: "🌧️" };
  if (code <= 39) return { label: "Snow", emoji: "🌨️" };
  if (code <= 49) return { label: "Fog", emoji: "🌫️" };
  if (code <= 59) return { label: "Drizzle", emoji: "🌦️" };
  if (code <= 69) return { label: "Rain", emoji: "🌧️" };
  if (code <= 79) return { label: "Snow", emoji: "❄️" };
  if (code <= 84) return { label: "Rain showers", emoji: "🌧️" };
  if (code <= 94) return { label: "Thunderstorm", emoji: "⛈️" };
  return { label: "Thunderstorm", emoji: "⛈️" };
}

function dayLabel(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00");
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${weekdays[d.getDay()]} ${day}/${month}`;
}

const FORECAST_CACHE_KEY_PREFIX = "openmeteo_forecast_";
const FORECAST_CACHE_TTL = 3 * 60 * 60 * 1000; // 3 hours

export async function get7DayForecast(
  latitude: number,
  longitude: number,
): Promise<ForecastSummary> {
  const cacheKey = `${FORECAST_CACHE_KEY_PREFIX}${latitude.toFixed(2)}_${longitude.toFixed(2)}`;
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { timestamp, data } = JSON.parse(cached) as {
          timestamp: number;
          data: ForecastSummary;
        };
        if (Date.now() - timestamp < FORECAST_CACHE_TTL) return data;
      }
    } catch {
      /* ignore */
    }
  }

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  const params: Record<string, string> = {
    latitude: String(latitude),
    longitude: String(longitude),
    daily:
      "temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration,weathercode",
    timezone: "auto",
    forecast_days: "7",
  };
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Open-Meteo returned ${res.status}`);
    const json = (await res.json()) as {
      daily?: {
        time: string[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        precipitation_sum: number[];
        et0_fao_evapotranspiration: number[];
        weathercode: number[];
      };
    };

    const d = json.daily;
    if (!d?.time?.length) throw new Error("No forecast data");

    const days: ForecastDay[] = d.time.map((date, i) => {
      const tempMax = Math.round((d.temperature_2m_max[i] ?? 30) * 10) / 10;
      const tempMin = Math.round((d.temperature_2m_min[i] ?? 20) * 10) / 10;
      const rain = Math.round((d.precipitation_sum[i] ?? 0) * 10) / 10;
      const et0 = Math.round((d.et0_fao_evapotranspiration[i] ?? 4) * 10) / 10;
      const irrigationNeed = Math.round(Math.max(0, et0 - rain) * 10) / 10;
      const code = d.weathercode[i] ?? 0;
      const { label: weatherLabel, emoji: weatherEmoji } = interpretWeatherCode(code);

      let riskLevel: ForecastDay["riskLevel"] = "Low";
      let riskReason = "";

      if (tempMax >= 38) {
        riskLevel = "Alert";
        riskReason = `Extreme heat (${tempMax}°C) — risk of crop scorching and pollen sterility.`;
      } else if (tempMax >= 35) {
        riskLevel = "Watch";
        riskReason = `High temperature (${tempMax}°C) — heat stress likely for rice at flowering.`;
      } else if (rain >= 50) {
        riskLevel = "Alert";
        riskReason = `Heavy rain (${rain}mm) — waterlogging risk. Check drainage channels.`;
      } else if (rain >= 20 && irrigationNeed === 0) {
        riskLevel = "Low";
        riskReason = "Good rainfall — no irrigation needed.";
      } else if (irrigationNeed >= 6) {
        riskLevel = "Watch";
        riskReason = `Irrigation deficit: ${irrigationNeed}mm. Consider supplemental watering.`;
      }

      return {
        date,
        label: dayLabel(date),
        tempMax,
        tempMin,
        rain,
        et0,
        irrigationNeed,
        weatherCode: code,
        weatherLabel,
        weatherEmoji,
        riskLevel,
        riskReason,
      };
    });

    const totalRain7d = Math.round(days.reduce((s, d) => s + d.rain, 0) * 10) / 10;
    const totalET7d = Math.round(days.reduce((s, d) => s + d.et0, 0) * 10) / 10;
    const totalIrrigationNeed =
      Math.round(days.reduce((s, d) => s + d.irrigationNeed, 0) * 10) / 10;
    const peakTempDay = days.reduce((a, b) => (a.tempMax > b.tempMax ? a : b), days[0]!) ?? null;
    const highestRainDay = days.reduce((a, b) => (a.rain > b.rain ? a : b), days[0]!) ?? null;

    const result: ForecastSummary = {
      days,
      totalRain7d,
      totalET7d,
      totalIrrigationNeed,
      peakTempDay,
      highestRainDay,
      source: "live",
      fetchedAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: result }));
      } catch {
        /* storage guard */
      }
    }

    return result;
  } catch {
    // Graceful fallback with demo-like values
    return buildFallbackForecast();
  }
}

function buildFallbackForecast(): ForecastSummary {
  const base = new Date();
  const days: ForecastDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const rain = [0, 2, 12, 0, 0, 5, 3][i] ?? 0;
    const et0 = 4.2;
    const irrigationNeed = Math.max(0, et0 - rain);
    return {
      date: iso,
      label: dayLabel(iso),
      tempMax: [32, 31, 28, 30, 33, 34, 32][i] ?? 31,
      tempMin: [24, 23, 22, 23, 24, 25, 24][i] ?? 23,
      rain,
      et0,
      irrigationNeed: Math.round(irrigationNeed * 10) / 10,
      weatherCode: rain > 5 ? 61 : 1,
      weatherLabel: rain > 5 ? "Rain" : "Partly cloudy",
      weatherEmoji: rain > 5 ? "🌧️" : "⛅",
      riskLevel: "Low",
      riskReason: "",
    };
  });
  return {
    days,
    totalRain7d: 22,
    totalET7d: 29.4,
    totalIrrigationNeed: 7.4,
    peakTempDay: days[4] ?? null,
    highestRainDay: days[2] ?? null,
    source: "fallback",
    fetchedAt: new Date().toISOString(),
  };
}
