import { useState, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import {
  Check,
  X,
  Zap,
  Building2,
  Sprout,
  ArrowRight,
  Star,
  Shield,
  Satellite,
  Bot,
  BarChart3,
  HeartHandshake,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  SUBSCRIPTION_PLANS,
  COMPARISON_FEATURES,
  CURRENCIES,
  type BillingCycle,
  type CurrencyCode,
  type PlanTier,
  getStoredUserPlan,
  saveStoredUserPlan,
  formatPrice,
} from "@/lib/subscription";

// ---------------------------------------------------------------------------
// PlanIcon helper
// ---------------------------------------------------------------------------
function PlanIcon({ tier, size = 24 }: { tier: PlanTier; size?: number }) {
  const cls = `h-${size / 4} w-${size / 4}`;
  if (tier === "free") return <Sprout className={cls} />;
  if (tier === "pro") return <Zap className={cls} />;
  return <Building2 className={cls} />;
}

// ---------------------------------------------------------------------------
// Category icon
// ---------------------------------------------------------------------------
const categoryIcons: Record<string, React.ReactNode> = {
  satellite: <Satellite className="h-4 w-4" />,
  ai: <Bot className="h-4 w-4" />,
  management: <BarChart3 className="h-4 w-4" />,
  support: <HeartHandshake className="h-4 w-4" />,
};
const categoryLabels: Record<string, string> = {
  satellite: "Satellite & Observations",
  ai: "AI Agronomy & Intelligence",
  management: "Farm Management & Export",
  support: "Support & Integrations",
};

// ---------------------------------------------------------------------------
// FeatureCell
// ---------------------------------------------------------------------------
function FeatureCell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="mx-auto h-5 w-5 text-primary" />;
  if (value === false) return <X className="mx-auto h-5 w-5 text-muted-foreground/40" />;
  return <span className="text-xs font-semibold text-foreground/80">{value}</span>;
}

// ---------------------------------------------------------------------------
// Main exported Pricing component (can be rendered inline on landing or as its own page)
// ---------------------------------------------------------------------------
export function Pricing({ embedded = false }: { embedded?: boolean }) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [currentPlan, setCurrentPlan] = useState<PlanTier>("free");
  const [showComparison, setShowComparison] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tier: PlanTier } | null>(null);

  // Load stored plan on mount
  useEffect(() => {
    const stored = getStoredUserPlan();
    setCurrentPlan(stored.plan);
    const handler = () => setCurrentPlan(getStoredUserPlan().plan);
    window.addEventListener("agronova_plan_updated", handler);
    return () => window.removeEventListener("agronova_plan_updated", handler);
  }, []);

  const handleSelectPlan = useCallback(
    (tier: PlanTier) => {
      if (tier === currentPlan) return;
      saveStoredUserPlan(tier, cycle);
      setCurrentPlan(tier);
      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === tier)!;
      setToast({ msg: `🌱 ${plan.name} activated!`, tier });
      setTimeout(() => setToast(null), 3500);
    },
    [currentPlan, cycle],
  );

  const yearlyDiscount = (plan: (typeof SUBSCRIPTION_PLANS)[0]) => {
    if (plan.basePriceMonthlyUsd === 0) return null;
    const saving = Math.round(
      ((plan.basePriceMonthlyUsd - plan.basePriceYearlyMonthlyUsd) /
        plan.basePriceMonthlyUsd) *
        100,
    );
    return saving > 0 ? saving : null;
  };

  // Group comparison features by category
  const categories = ["satellite", "ai", "management", "support"] as const;

  return (
    <div
      id="pricing"
      className={`${embedded ? "py-16 px-4" : "min-h-screen py-20 px-4"} bg-background`}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------------------------ */}
      <div className="mx-auto max-w-3xl text-center">
        <span className="skeu-stitch inline-block px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Simple, transparent pricing
        </span>
        <h2 className="font-display mt-5 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
          Grow at the speed of your farm
        </h2>
        <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
          Every smallholder deserves satellite agronomy. Start free — upgrade
          when your farm grows.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Controls: billing cycle + currency */}
      {/* ------------------------------------------------------------------ */}
      <div className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-4">
        {/* Billing cycle toggle */}
        <div className="clay-card-sunken flex items-center gap-1 p-1">
          {(["monthly", "yearly"] as BillingCycle[]).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={`clay-btn flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold transition-all ${
                cycle === c
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent text-foreground/70 hover:text-foreground"
              }`}
            >
              {c === "monthly" ? "Monthly" : "Yearly"}
              {c === "yearly" && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    cycle === "yearly"
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-leaf text-white"
                  }`}
                >
                  Save up to 28%
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Currency selector */}
        <div className="relative">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="clay-card-sunken appearance-none rounded-full px-5 py-2.5 pr-9 text-sm font-semibold outline-none"
          >
            {Object.values(CURRENCIES).map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} {c.code} — {c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Plan cards */}
      {/* ------------------------------------------------------------------ */}
      <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-3">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const price = formatPrice(
            cycle === "yearly"
              ? plan.basePriceYearlyMonthlyUsd
              : plan.basePriceMonthlyUsd,
            currency,
            cycle,
          );
          const discount = cycle === "yearly" ? yearlyDiscount(plan) : null;
          const isActive = currentPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`clay-card relative flex flex-col p-6 transition-all duration-200 ${
                plan.popular
                  ? "ring-2 ring-primary shadow-xl shadow-primary/10"
                  : ""
              } ${isActive ? "ring-2 ring-leaf" : ""}`}
            >
              {/* Popular / Enterprise badge */}
              {plan.badge && (
                <div
                  className={`absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold text-white ${
                    plan.popular ? "bg-primary" : "bg-foreground"
                  }`}
                >
                  {plan.badge}
                </div>
              )}

              {/* Current plan badge */}
              {isActive && (
                <div className="absolute -top-3.5 right-4 rounded-full bg-leaf px-3 py-1 text-[10px] font-bold text-white">
                  Your Plan
                </div>
              )}

              {/* Plan header */}
              <div className="flex items-center gap-3">
                <span
                  className={`clay-chip flex h-11 w-11 items-center justify-center ${
                    plan.id === "free"
                      ? "bg-secondary text-foreground"
                      : plan.id === "pro"
                        ? "bg-primary text-primary-foreground"
                        : "bg-foreground text-background"
                  }`}
                >
                  <PlanIcon tier={plan.id} size={20} />
                </span>
                <div>
                  <p className="font-display text-xl font-semibold">{plan.name}</p>
                </div>
              </div>

              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {plan.tagline}
              </p>

              {/* Price */}
              <div className="mt-5 flex items-end gap-1.5">
                <span className="font-display text-5xl font-bold tracking-tight">
                  {price.formatted}
                </span>
                {plan.basePriceMonthlyUsd > 0 && (
                  <span className="text-muted-foreground mb-1.5 text-sm">/mo</span>
                )}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">{price.billedNotice}</p>
              {discount && (
                <span className="mt-1 inline-block w-fit rounded-full bg-leaf/10 px-2.5 py-0.5 text-[11px] font-semibold text-leaf-deep">
                  Save {discount}% with yearly billing
                </span>
              )}

              {/* Limits grid */}
              <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
                {Object.entries(plan.limits).map(([k, v]) => (
                  <div key={k} className="clay-card-sunken rounded-xl p-2.5">
                    <p className="text-muted-foreground capitalize">{k.replace("_", " ")}</p>
                    <p className="font-semibold">{v}</p>
                  </div>
                ))}
              </div>

              {/* Feature list */}
              <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                {plan.summaryFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-foreground/85">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="mt-6">
                {isActive ? (
                  <div className="clay-btn flex w-full cursor-default items-center justify-center gap-2 bg-secondary py-3 text-sm font-semibold text-foreground/60">
                    <Check className="h-4 w-4 text-leaf" /> Current Plan
                  </div>
                ) : plan.id === "free" ? (
                  <button
                    onClick={() => handleSelectPlan("free")}
                    className="clay-btn w-full bg-secondary py-3 text-sm font-semibold hover:bg-secondary/80"
                  >
                    Get Started Free
                  </button>
                ) : plan.id === "enterprise" ? (
                  <a
                    href="mailto:hello@agronova.farm?subject=Enterprise Plan Inquiry"
                    className="clay-btn flex w-full items-center justify-center gap-2 bg-foreground py-3 text-sm font-semibold text-background"
                  >
                    Contact Sales <ArrowRight className="h-4 w-4" />
                  </a>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    className="clay-btn flex w-full items-center justify-center gap-2 bg-primary py-3 text-sm font-semibold text-primary-foreground"
                  >
                    <Zap className="h-4 w-4" /> Upgrade to Pro
                  </button>
                )}
              </div>

              {plan.id !== "free" && (
                <p className="text-muted-foreground mt-3 text-center text-[11px]">
                  Cancel anytime · No setup fees
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Trust badges */}
      {/* ------------------------------------------------------------------ */}
      <div className="mx-auto mt-10 flex max-w-2xl flex-wrap justify-center gap-4 text-sm">
        {[
          { icon: <Shield className="h-4 w-4" />, text: "SSL encrypted billing" },
          { icon: <Star className="h-4 w-4" />, text: "Powered by open NASA Earth data" },
          { icon: <Sprout className="h-4 w-4" />, text: "Free plan · no credit card required" },
          { icon: <HeartHandshake className="h-4 w-4" />, text: "Built for smallholders globally" },
        ].map((b) => (
          <div
            key={b.text}
            className="clay-chip flex items-center gap-2 px-4 py-2 text-xs font-semibold"
          >
            <span className="text-primary">{b.icon}</span>
            {b.text}
          </div>
        ))}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Feature comparison table (collapsible) */}
      {/* ------------------------------------------------------------------ */}
      <div className="mx-auto mt-14 max-w-5xl">
        <button
          onClick={() => setShowComparison((v) => !v)}
          className="clay-btn mb-4 flex w-full items-center justify-between bg-secondary px-6 py-4 text-sm font-semibold"
        >
          <span>Compare all features</span>
          {showComparison ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>

        {showComparison && (
          <div className="clay-card overflow-hidden p-0">
            {/* Sticky header */}
            <div className="sticky top-0 z-10 grid grid-cols-[1fr_auto_auto_auto] bg-card shadow-sm">
              <div className="p-4 text-sm font-semibold text-muted-foreground">Feature</div>
              {SUBSCRIPTION_PLANS.map((p) => (
                <div
                  key={p.id}
                  className={`p-4 text-center text-xs font-bold ${
                    p.popular ? "text-primary" : ""
                  }`}
                >
                  {p.name}
                </div>
              ))}
            </div>

            {categories.map((cat) => {
              const catFeatures = COMPARISON_FEATURES.filter(
                (f) => f.category === cat,
              );
              return (
                <div key={cat}>
                  {/* Category header */}
                  <div className="flex items-center gap-2 border-t border-border bg-secondary/40 px-4 py-3">
                    <span className="text-primary">{categoryIcons[cat]}</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {categoryLabels[cat]}
                    </span>
                  </div>
                  {catFeatures.map((feat, i) => (
                    <div
                      key={feat.name}
                      className={`grid grid-cols-[1fr_auto_auto_auto] items-center border-t border-border/50 ${
                        i % 2 === 0 ? "" : "bg-secondary/20"
                      }`}
                    >
                      <div className="px-4 py-3 text-sm">{feat.name}</div>
                      <div className="w-24 px-4 py-3 text-center">
                        <FeatureCell value={feat.free} />
                      </div>
                      <div className="w-24 bg-primary/5 px-4 py-3 text-center">
                        <FeatureCell value={feat.pro} />
                      </div>
                      <div className="w-24 px-4 py-3 text-center">
                        <FeatureCell value={feat.enterprise} />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* FAQ teaser */}
      {/* ------------------------------------------------------------------ */}
      <div className="mx-auto mt-14 max-w-3xl">
        <h3 className="font-display mb-6 text-center text-2xl font-semibold">
          Frequently Asked Questions
        </h3>
        <div className="space-y-4">
          {[
            {
              q: "Is the Free plan really free forever?",
              a: "Yes. The Seedling Free plan is permanently free with no credit card required. You get 1 farm field, daily NASA satellite data, and all 5 language voice features.",
            },
            {
              q: "What's different in Pro vs Free for NASA data?",
              a: "Free users get daily batch observations. Pro users get a near-real-time satellite telemetry refresh queue — meaning AgroNova prioritizes fetching fresh NASA POWER data for your coordinates faster, especially during climate events.",
            },
            {
              q: "Can I cancel my subscription anytime?",
              a: "Absolutely. Cancel anytime from your Profile settings. You keep Pro access until the end of your billing period, then automatically revert to Free.",
            },
            {
              q: "Do you offer NGO or academic pricing?",
              a: "Yes! Contact our sales team at hello@agronova.farm with your organization details. We support agricultural extension offices, NGOs, and research institutions with special pricing.",
            },
          ].map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Enterprise CTA band */}
      {/* ------------------------------------------------------------------ */}
      <div className="mx-auto mt-14 max-w-4xl">
        <div className="clay-card flex flex-col items-center gap-6 bg-foreground p-10 text-center text-background md:flex-row md:text-left">
          <Building2 className="h-16 w-16 shrink-0 text-primary" />
          <div className="flex-1">
            <p className="font-display text-2xl font-semibold">
              Need a plan for your cooperative or government extension?
            </p>
            <p className="mt-2 text-sm text-background/70">
              Terra Enterprise supports 500+ farm plots, regional drought radar,
              custom branded PDF reports, and a dedicated agronomist API. Let's
              talk.
            </p>
          </div>
          <a
            href="mailto:hello@agronova.farm?subject=Enterprise Plan Inquiry"
            className="clay-btn flex shrink-0 items-center gap-2 bg-primary px-7 py-4 font-semibold text-primary-foreground"
          >
            Contact Sales <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Toast notification */}
      {/* ------------------------------------------------------------------ */}
      {toast && (
        <div
          className="fixed bottom-24 left-1/2 z-[200] -translate-x-1/2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background shadow-2xl"
          role="status"
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FAQ accordion item
// ---------------------------------------------------------------------------
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="clay-card overflow-hidden">
      <button
        className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold"
        onClick={() => setOpen((v) => !v)}
      >
        {q}
        {open ? (
          <ChevronUp className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="border-t border-border px-5 pb-4 pt-3 text-sm text-muted-foreground leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PlanBadge — small inline badge showing current plan (for sidebar/header)
// ---------------------------------------------------------------------------
export function PlanBadge({ onClick }: { onClick?: () => void }) {
  const [plan, setPlan] = useState<PlanTier>("free");

  useEffect(() => {
    setPlan(getStoredUserPlan().plan);
    const handler = () => setPlan(getStoredUserPlan().plan);
    window.addEventListener("agronova_plan_updated", handler);
    return () => window.removeEventListener("agronova_plan_updated", handler);
  }, []);

  const planObj = SUBSCRIPTION_PLANS.find((p) => p.id === plan);
  if (!planObj) return null;

  return (
    <button
      onClick={onClick}
      title="View subscription plan"
      className={`clay-chip flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all hover:ring-2 hover:ring-primary/40 ${
        plan === "free"
          ? "bg-secondary text-foreground/70"
          : plan === "pro"
            ? "bg-primary text-primary-foreground"
            : "bg-foreground text-background"
      }`}
    >
      <PlanIcon tier={plan} size={12} />
      {planObj.name}
      {plan === "free" && <ArrowRight className="h-3 w-3 opacity-50" />}
    </button>
  );
}

// ---------------------------------------------------------------------------
// PricingModal — full-screen overlay for use in workspace
// ---------------------------------------------------------------------------
export function PricingModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-background/95 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Subscription Plans"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-6 py-4 backdrop-blur-sm">
        <span className="font-display text-lg font-semibold">
          AgroNova Plans
        </span>
        <button
          onClick={onClose}
          className="clay-btn bg-secondary px-5 py-2.5 text-sm font-semibold"
        >
          ✕ Close
        </button>
      </div>
      <Pricing embedded />
    </div>
  );
}
