/**
 * NASA FIRMS (Fire Information for Resource Management System) integration
 * Detects near-real-time agricultural fire alerts near farm fields
 * Source: https://firms.modaps.eosdis.nasa.gov/api/
 *
 * API key: free registration at https://firms.modaps.eosdis.nasa.gov/api/
 * Set VITE_FIRMS_MAP_KEY in .env to enable live data.
 * Gracefully falls back to "no fires" when key is absent.
 */

export type FIRMSAlert = {
  latitude: number;
  longitude: number;
  brightness: number;     // Kelvin — fire radiative power proxy
  scan: number;
  track: number;
  acq_date: string;       // "YYYY-MM-DD"
  acq_time: string;       // "HHMM"
  satellite: string;      // "N" (NOAA-20), "S" (Suomi NPP), etc.
  confidence: string;     // "n" (nominal), "h" (high), "l" (low)
  frp: number;            // Fire Radiative Power MW
  daynight: "D" | "N";
};

export type FireRisk = {
  hasActiveFireNearby: boolean;
  alertLevel: "None" | "Monitor" | "Alert";
  alertMessage: string;
  nearestFireKm: number | null;
  fireCount: number;
  alerts: FIRMSAlert[];
  source: "live" | "no-key" | "fallback";
};

const FIRMS_CACHE_KEY_PREFIX = "firms_fire_";
const FIRMS_CACHE_TTL = 3 * 60 * 60 * 1000; // 3 hours

/** Haversine distance in km between two lat/lon points */
function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Fetch NASA FIRMS VIIRS fire alerts within ~50km of a field
 * @param latitude Field latitude
 * @param longitude Field longitude
 * @param radiusKm Search radius (default 50km)
 */
export async function getFireAlerts(
  latitude: number,
  longitude: number,
  radiusKm = 50,
): Promise<FireRisk> {
  const cacheKey = `${FIRMS_CACHE_KEY_PREFIX}${latitude.toFixed(2)}_${longitude.toFixed(2)}`;
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { timestamp, data } = JSON.parse(cached) as { timestamp: number; data: FireRisk };
        if (Date.now() - timestamp < FIRMS_CACHE_TTL) return data;
      }
    } catch { /* ignore */ }
  }

  const apiKey = (import.meta.env as Record<string, string | undefined>)["VITE_FIRMS_MAP_KEY"];
  if (!apiKey) {
    return {
      hasActiveFireNearby: false,
      alertLevel: "None",
      alertMessage: "Fire monitoring not active (API key not configured).",
      nearestFireKm: null,
      fireCount: 0,
      alerts: [],
      source: "no-key",
    };
  }

  // Bounding box ±0.5° ≈ 55km around field center
  const delta = 0.5;
  const bbox = `${longitude - delta},${latitude - delta},${longitude + delta},${latitude + delta}`;

  try {
    // VIIRS SNPP NRT — updated every 3 hours, last 1 day
    const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${apiKey}/VIIRS_SNPP_NRT/${bbox}/1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`FIRMS returned ${res.status}`);

    const csv = await res.text();
    const lines = csv.trim().split("\n");
    if (lines.length <= 1) {
      return buildFireResult([], latitude, longitude, radiusKm, "live", cacheKey);
    }

    // Parse CSV (columns: latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_ti5,frp,daynight)
    const alerts: FIRMSAlert[] = lines.slice(1).map((line) => {
      const parts = line.split(",");
      return {
        latitude: parseFloat(parts[0] ?? "0"),
        longitude: parseFloat(parts[1] ?? "0"),
        brightness: parseFloat(parts[2] ?? "0"),
        scan: parseFloat(parts[3] ?? "0"),
        track: parseFloat(parts[4] ?? "0"),
        acq_date: parts[5] ?? "",
        acq_time: parts[6] ?? "",
        satellite: parts[7] ?? "",
        confidence: parts[9] ?? "n",
        frp: parseFloat(parts[12] ?? "0"),
        daynight: (parts[13]?.trim() ?? "D") as "D" | "N",
      };
    }).filter((a) => !isNaN(a.latitude) && !isNaN(a.longitude));

    return buildFireResult(alerts, latitude, longitude, radiusKm, "live", cacheKey);
  } catch {
    return {
      hasActiveFireNearby: false,
      alertLevel: "None",
      alertMessage: "Fire data temporarily unavailable.",
      nearestFireKm: null,
      fireCount: 0,
      alerts: [],
      source: "fallback",
    };
  }
}

function buildFireResult(
  alerts: FIRMSAlert[],
  fieldLat: number,
  fieldLon: number,
  radiusKm: number,
  source: "live" | "no-key" | "fallback",
  cacheKey: string,
): FireRisk {
  const nearby = alerts
    .map((a) => ({ ...a, distKm: haversineKm(fieldLat, fieldLon, a.latitude, a.longitude) }))
    .filter((a) => a.distKm <= radiusKm)
    .sort((a, b) => a.distKm - b.distKm);

  const nearestFireKm = nearby[0]?.distKm ? Math.round(nearby[0].distKm) : null;
  const highConfidence = nearby.filter((a) => a.confidence === "h" || a.confidence === "n");

  let alertLevel: FireRisk["alertLevel"] = "None";
  let alertMessage = `No active fires detected within ${radiusKm}km of your field in the last 24 hours.`;

  if (nearby.length > 0 && nearestFireKm !== null) {
    if (nearestFireKm < 10 || highConfidence.length > 3) {
      alertLevel = "Alert";
      alertMessage = `🔥 Active fire detected ${nearestFireKm}km from your field (${nearby.length} hotspot${nearby.length !== 1 ? "s" : ""} within ${radiusKm}km). Smoke may reduce solar radiation and affect crop health. Check field access and drainage.`;
    } else {
      alertLevel = "Monitor";
      alertMessage = `⚠️ Fire activity detected ${nearestFireKm}km away (${nearby.length} hotspot${nearby.length !== 1 ? "s" : ""}). Monitor wind direction — smoke could affect your field if winds shift.`;
    }
  }

  const result: FireRisk = {
    hasActiveFireNearby: nearby.length > 0,
    alertLevel,
    alertMessage,
    nearestFireKm,
    fireCount: nearby.length,
    alerts: nearby,
    source,
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: result }));
    } catch { /* storage guard */ }
  }

  return result;
}
