/**
 * OpenFarm API integration — free, no API key required
 * Provides rich crop growing guides for 2,000+ crops
 * Source: https://openfarm.cc/api/v1/crops/
 */

export type OpenFarmCrop = {
  name: string;
  slug: string;
  binomial_name: string | null;
  common_names: string[];
  description: string;
  sun_requirements: string | null;        // "Full Sun", "Partial Sun", "Shade"
  watering_interval: string | null;       // "1-2 days", etc.
  planting_description: string | null;
  growing_degree_days: number | null;
  row_spacing: number | null;             // cm
  spread: number | null;                  // cm
  height: number | null;                  // cm
  days_to_maturity: number | null;
  processing_pictures: Array<{
    thumb_url: string;
    small_url: string;
  }>;
};

const OPENFARM_BASE = "https://openfarm.cc/api/v1/crops";
const OPENFARM_CACHE_KEY_PREFIX = "openfarm_crop_";
const OPENFARM_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function fetchOpenFarmCrop(
  cropName: string,
): Promise<OpenFarmCrop | null> {
  const cacheKey = `${OPENFARM_CACHE_KEY_PREFIX}${cropName.toLowerCase().trim()}`;
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { timestamp, data } = JSON.parse(cached) as { timestamp: number; data: OpenFarmCrop };
        if (Date.now() - timestamp < OPENFARM_CACHE_TTL) return data;
      }
    } catch { /* ignore */ }
  }

  try {
    const url = `${OPENFARM_BASE}/?q=${encodeURIComponent(cropName)}&filter=true`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;

    const json = (await res.json()) as {
      data?: Array<{
        attributes: {
          name: string;
          slug: string;
          binomial_name: string | null;
          common_names: string[];
          description: string;
          sun_requirements: string | null;
          watering_interval: string | null;
          planting_description: string | null;
          growing_degree_days: number | null;
          row_spacing: number | null;
          spread: number | null;
          height: number | null;
          days_to_maturity: number | null;
          processing_pictures: Array<{ thumb_url: string; small_url: string }>;
        };
      }>;
    };

    const first = json.data?.[0]?.attributes;
    if (!first) return null;

    const crop: OpenFarmCrop = {
      name: first.name,
      slug: first.slug,
      binomial_name: first.binomial_name,
      common_names: first.common_names ?? [],
      description: first.description ?? "",
      sun_requirements: first.sun_requirements,
      watering_interval: first.watering_interval,
      planting_description: first.planting_description,
      growing_degree_days: first.growing_degree_days,
      row_spacing: first.row_spacing,
      spread: first.spread,
      height: first.height,
      days_to_maturity: first.days_to_maturity,
      processing_pictures: first.processing_pictures ?? [],
    };

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: crop }));
      } catch { /* storage guard */ }
    }

    return crop;
  } catch {
    return null;
  }
}

/** Batch-fetch OpenFarm data for multiple crops */
export async function fetchOpenFarmCrops(
  cropNames: string[],
): Promise<Record<string, OpenFarmCrop | null>> {
  const results: Record<string, OpenFarmCrop | null> = {};
  await Promise.all(
    cropNames.map(async (name) => {
      results[name] = await fetchOpenFarmCrop(name);
    }),
  );
  return results;
}
