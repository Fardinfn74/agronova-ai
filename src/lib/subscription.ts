export type PlanTier = "free" | "pro" | "enterprise";
export type BillingCycle = "monthly" | "yearly";
export type CurrencyCode = "USD" | "BDT" | "INR" | "EUR";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateAgainstUsd: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: "USD", symbol: "$", name: "US Dollar", rateAgainstUsd: 1 },
  BDT: { code: "BDT", symbol: "৳", name: "Bangladesh Taka", rateAgainstUsd: 110 },
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", rateAgainstUsd: 83 },
  EUR: { code: "EUR", symbol: "€", name: "Euro", rateAgainstUsd: 0.92 },
};

export interface PlanFeature {
  name: string;
  free: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
  category: "satellite" | "ai" | "management" | "support";
}

export interface PlanItem {
  id: PlanTier;
  name: string;
  tagline: string;
  badge?: string;
  popular?: boolean;
  basePriceMonthlyUsd: number;
  basePriceYearlyMonthlyUsd: number; // monthly rate when billed yearly
  summaryFeatures: string[];
  limits: {
    fields: string;
    hectares: string;
    aiQueries: string;
    exports: string;
  };
}

export const SUBSCRIPTION_PLANS: PlanItem[] = [
  {
    id: "free",
    name: "Seedling Free",
    tagline: "For individual smallholders & family farms starting with satellite agronomy.",
    basePriceMonthlyUsd: 0,
    basePriceYearlyMonthlyUsd: 0,
    popular: false,
    limits: {
      fields: "1 field",
      hectares: "Up to 5 ha",
      aiQueries: "20 / month",
      exports: "Standard print",
    },
    summaryFeatures: [
      "1 Farm Field boundary on interactive satellite map",
      "Daily NASA POWER observations (Temp, Rain, Solar)",
      "Essential crop rotation recommendations",
      "Multilingual audio speech in 5 languages",
      "Offline PWA caching for low-connectivity zones",
      "Standard microclimate disease risk watch",
    ],
  },
  {
    id: "pro",
    name: "Harvest Pro",
    tagline: "For commercial growers & progressive farmers maximizing crop yields.",
    badge: "Most Popular",
    popular: true,
    basePriceMonthlyUsd: 7,
    basePriceYearlyMonthlyUsd: 5, // $60/yr (Save 28%)
    limits: {
      fields: "Unlimited fields",
      hectares: "Up to 250 ha",
      aiQueries: "Unlimited",
      exports: "PDF field dossiers & print",
    },
    summaryFeatures: [
      "Unlimited farm fields & precision GPS boundary mapping",
      "Near-real-time NASA POWER & microclimate satellite radar",
      "Unlimited Nova AI Agronomist voice & chat consultations",
      "Pest & fungal disease risk early-warning microclimate radar",
      "Multi-variable climate stress & rainfall simulator",
      "One-click PDF harvest advisory report exports",
      "Priority satellite telemetry refresh queue",
      "Automated SMS & WhatsApp weather stress alerts (upcoming)",
    ],
  },
  {
    id: "enterprise",
    name: "Terra Enterprise",
    tagline: "For agricultural cooperatives, extension officers & regional agribusinesses.",
    badge: "For Cooperatives & NGOs",
    popular: false,
    basePriceMonthlyUsd: 29,
    basePriceYearlyMonthlyUsd: 24, // $288/yr (Save 17%)
    limits: {
      fields: "500+ fields",
      hectares: "Unlimited",
      aiQueries: "Dedicated quota",
      exports: "Custom branded reports & CSV/JSON data",
    },
    summaryFeatures: [
      "Multi-farmer portfolio dashboard for extension officers & NGOs",
      "Monitor 500+ farmer plots across regional districts",
      "Regional drought stress & yield anomaly cluster radar",
      "Custom GIS shapefile, GeoJSON & drone multispectral upload",
      "Agronomist REST API access & mass SMS broadcast webhooks",
      "Dedicated agronomist consultation & localized phenology models",
      "Priority 24/7 SLA support & field officer onboarding",
    ],
  },
];

export const COMPARISON_FEATURES: PlanFeature[] = [
  // Satellite & Observations
  {
    category: "satellite",
    name: "NASA POWER Agroclimatology (Temp, Rain, Solar)",
    free: true,
    pro: true,
    enterprise: true,
  },
  {
    category: "satellite",
    name: "Soil Moisture & Evaporation Indicators",
    free: "Standard",
    pro: "High Precision",
    enterprise: "Root-zone + Surface",
  },
  {
    category: "satellite",
    name: "Satellite Data Freshness",
    free: "Daily sync",
    pro: "Near-Real-Time",
    enterprise: "High-Priority Queue",
  },
  {
    category: "satellite",
    name: "Interactive OpenStreetMap Field Picker",
    free: true,
    pro: true,
    enterprise: true,
  },
  {
    category: "satellite",
    name: "GIS Shapefile & GeoJSON Polygon Import",
    free: false,
    pro: false,
    enterprise: true,
  },

  // AI & Agronomy
  {
    category: "ai",
    name: "Deterministic Crop Rotation Engine",
    free: true,
    pro: true,
    enterprise: true,
  },
  {
    category: "ai",
    name: "Nova AI Agronomist Voice & Chat",
    free: "Basic (20/mo)",
    pro: "Unlimited",
    enterprise: "Custom Tuned Models",
  },
  {
    category: "ai",
    name: "5-Language Native Voice Synthesis (TTS)",
    free: true,
    pro: true,
    enterprise: true,
  },
  {
    category: "ai",
    name: "Microclimate Pest & Blight Watch",
    free: "General",
    pro: "Precision Micro-alert",
    enterprise: "Regional Risk Map",
  },
  {
    category: "ai",
    name: "Climate Stress & Drought Simulator",
    free: "Preset",
    pro: "Full Interactive",
    enterprise: "Custom Scenarios",
  },

  // Management & Export
  {
    category: "management",
    name: "Saved Farm Fields",
    free: "1 field",
    pro: "Unlimited",
    enterprise: "500+ fields",
  },
  {
    category: "management",
    name: "Multi-farmer Extension Officer Dashboard",
    free: false,
    pro: false,
    enterprise: true,
  },
  {
    category: "management",
    name: "Export & Print Crop Plans",
    free: "Browser Print",
    pro: "One-Click PDF Dossier",
    enterprise: "Custom Branded PDF + CSV",
  },
  {
    category: "management",
    name: "Offline PWA & Low-Bandwidth Mode",
    free: true,
    pro: true,
    enterprise: true,
  },

  // Support & Integration
  {
    category: "support",
    name: "Developer & Agronomy REST API",
    free: false,
    pro: false,
    enterprise: true,
  },
  {
    category: "support",
    name: "SMS / WhatsApp Automated Alerts",
    free: false,
    pro: "Early Access",
    enterprise: "Full Mass Broadcast",
  },
  {
    category: "support",
    name: "Support Level",
    free: "Community",
    pro: "Priority Email",
    enterprise: "Dedicated Agronomist & SLA",
  },
];

export const SUBSCRIPTION_STORAGE_KEY = "agronova_user_plan";

export function getStoredUserPlan(): { plan: PlanTier; cycle: BillingCycle; upgradedAt?: string } {
  if (typeof window === "undefined") {
    return { plan: "free", cycle: "monthly" };
  }
  try {
    const raw = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        (parsed.plan === "free" || parsed.plan === "pro" || parsed.plan === "enterprise")
      ) {
        return parsed;
      }
    }
  } catch {
    // Ignore storage errors
  }
  return { plan: "free", cycle: "monthly" };
}

export function saveStoredUserPlan(plan: PlanTier, cycle: BillingCycle = "monthly"): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      SUBSCRIPTION_STORAGE_KEY,
      JSON.stringify({
        plan,
        cycle,
        upgradedAt: new Date().toISOString(),
      }),
    );
    window.dispatchEvent(new Event("agronova_plan_updated"));
  } catch {
    // Ignore storage errors
  }
}

export function formatPrice(
  amountUsd: number,
  currency: CurrencyCode,
  cycle: BillingCycle,
): { formatted: string; billedNotice: string; unitPrice: number } {
  const cfg = CURRENCIES[currency];
  if (amountUsd === 0) {
    return {
      formatted: `${cfg.symbol}0`,
      billedNotice: "Free forever",
      unitPrice: 0,
    };
  }

  const convertedMonthly = Math.round(amountUsd * cfg.rateAgainstUsd);
  if (cycle === "yearly") {
    const annualTotal = convertedMonthly * 12;
    return {
      formatted: `${cfg.symbol}${convertedMonthly}`,
      billedNotice: `billed annually (${cfg.symbol}${annualTotal.toLocaleString()}/yr)`,
      unitPrice: convertedMonthly,
    };
  }

  return {
    formatted: `${cfg.symbol}${convertedMonthly}`,
    billedNotice: "billed monthly",
    unitPrice: convertedMonthly,
  };
}
