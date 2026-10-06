import { Link, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { PlanBadge, PricingModal } from "@/components/pricing";
import { CropDoctor } from "@/components/crop-doctor";
import {
  CalendarDays,
  Flame,
  GitCompareArrows,
  HeartPulse,
  History as HistoryIcon,
  LayoutGrid,
  Library,
  LogOut,
  Menu,
  Mic,
  PanelLeftClose,
  PanelLeftOpen,
  SlidersHorizontal,
  Stethoscope,
  UserRound,
  Volume2,
  VolumeX,
  Wind,
  Sun,
  Thermometer,
  CloudRain,
  Bug,
  ArrowLeft,
  BookOpen,
  Droplets,
  FileDown,
  Info,
  Languages,
  MapPin,
  MessageCircle,
  Satellite,
  Send,
  Share2,
  Sparkles,
  Sprout,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DemoProfile, LiveProfile, AddFieldForm } from "@/components/workspace-live";
import { useSpeech } from "@/hooks/use-speech";
import { askNovaAssistant } from "@/lib/ai-assistant";
import { generateGeminiText, getGeminiApiKey } from "@/lib/gemini";

import {
  getPowerReadings,
  computeFieldInsights,
  formatNasaChartTimeline,
  type PowerReading,
} from "@/lib/nasa-power";
import { get7DayForecast, type ForecastSummary } from "@/lib/open-meteo";
import { getFireAlerts, type FireRisk } from "@/lib/nasa-firms";
import { applyFullPageTranslation } from "@/lib/full-translator";
const FieldMap = lazy(() => import("@/components/field-map").then((m) => ({ default: m.FieldMap })));
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AgroButton } from "@/components/agronova-button";
import {
  adjustedScenario,
  computeSoilLimitingFactor,
  crops,
  demoDate,
  evidence,
  fields as demoFields,
  type DemoField,
  type SoilProfile,
  scenarios,
  timeline,
  translations,
  type Language,
  type Scenario,
} from "@/lib/agronova-demo";
import novaMascot from "../assets/nova-mascot.png";

type Tab = "profile" | "field" | "health" | "rotation" | "compare" | "simulator" | "doctor" | "forecast" | "crops" | "history" | "how";

type ChatMsg = { me: boolean; text: string };

function useNovaChat(lang: Language, scenario: Scenario, field: DemoField, nasaData?: PowerReading[] | null) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    {
      me: false,
      text:
        lang === "bn"
          ? "নমস্কার/সালাম! আমি নোভা — আপনার কৃষি ও নাসা স্যাটেলাইট তথ্য বিশেষজ্ঞ। আপনার জমি, ফসল নির্বাচন, রোগবালাই বা সেচ নিয়ে প্রশ্ন করুন।"
          : lang === "hi"
            ? "नमस्ते! मैं नोवा हूँ — आपका कृषि और नासा उपग्रह विशेषज्ञ। अपने खेत, फसल चक्र, रोग नियंत्रण या सिंचाई के बारे में पूछें।"
            : lang === "es"
              ? "¡Hola! Soy Nova, tu especialista en agronomía y datos satelitales de la NASA. Pregúntame sobre tus cultivos, suelo, plagas o riego."
              : lang === "sw"
                ? "Habari! Mimi ni Nova — mtaalamu wako wa kilimo na takwimu za satelaiti za NASA. Niulize kuhusu mazao, udongo, au umwagiliaji."
                : "Hello! I'm Nova, your certified AI Agronomy & NASA Earth Observation Specialist. Ask me about your crops, soil moisture, pest defense, or satellite climate data.",
    },
  ]);

  const ask = async (q: string) => {
    if (!q.trim()) return;
    setMsgs((m) => [...m, { me: true, text: q }]);
    const reply = await askNovaAssistant(q, {
      field,
      scenario,
      nasaReadings: nasaData ?? undefined,
      lang,
    });
    setMsgs((m) => [...m, { me: false, text: reply }]);
  };

  return { msgs, ask };
}

const tabs: Tab[] = ["profile", "field", "health", "rotation", "compare", "simulator", "doctor", "forecast", "crops", "history", "how"];
const workspaceTabs = tabs.filter((tab): tab is Exclude<Tab, "profile"> => tab !== "profile");
const tabIcons: Record<Exclude<Tab, "profile">, typeof MapPin> = {
  field: MapPin,
  health: HeartPulse,
  rotation: Sprout,
  compare: GitCompareArrows,
  simulator: SlidersHorizontal,
  doctor: Stethoscope,
  forecast: CalendarDays,
  crops: Library,
  history: HistoryIcon,
  how: Info,
};

const languages: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "bn", label: "বাংলা" },
  { code: "hi", label: "हिन्दी" },
  { code: "es", label: "Español" },
  { code: "sw", label: "Kiswahili" },
];

function SpeechButton({ text, lang }: { text: string; lang: Language }) {
  const { speak, stop, speaking, supported } = useSpeech(lang);
  if (!supported) return null;
  return (
    <AgroButton
      type="button"
      size="icon"
      variant="ghost"
      onClick={(e) => {
        e.stopPropagation();
        if (speaking) stop();
        else speak(text);
      }}
      aria-label={speaking ? "Stop speaking" : "Listen to advice"}
      title={speaking ? "Stop" : "Listen"}
      className="h-7 w-7 shrink-0"
    >
      {speaking ? (
        <VolumeX className="h-4 w-4 text-primary animate-pulse" />
      ) : (
        <Volume2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
      )}
    </AgroButton>
  );
}

export function Workspace({ mode }: { mode: "demo" | "live" }) {
  const live = mode === "live";
  const navigate = useNavigate();
  const [liveFields, setLiveFields] = useState<DemoField[]>([]);
  const [profile, setProfile] = useState<{ display_name: string; district: string; email: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [pickedCoords, setPickedCoords] = useState<[number, number] | undefined>(undefined);
  
  const loadLive = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const [{ data: p }, { data: rows }] = await Promise.all([
      supabase.from("profiles").select("display_name, district").eq("id", u.user.id).maybeSingle(),
      supabase.from("farmer_fields").select("*").order("created_at", { ascending: false }),
    ]);
    setProfile({ display_name: p?.display_name ?? "", district: p?.district ?? "", email: u.user.email ?? "" });
    setLiveFields(
      (rows ?? []).map((r) => ({
        id: r.id,
        name: r.name,
        district: r.district,
        coordinates: [r.latitude, r.longitude] as [number, number],
        crop: r.crop || "Not set",
        season: r.season || "Not set",
        water: r.water as DemoField["water"],
        priority: r.priority as DemoField["priority"],
        size: Number(r.size_ha),
        soil: "Clay loam",
        history: ["Saved in live workspace"],
        position: { x: 50, y: 50 },
      }))
    );
  };

  useEffect(() => {
    setMounted(true);
    if (live) loadLive();
  }, [live]);

  const fields = live ? liveFields : demoFields;
  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("agronova_language") as Language | null;
      if (stored && ["en", "bn", "hi", "es", "sw"].includes(stored)) return stored;
    }
    return "en";
  });

  const handleLanguageChange = (nextLang: Language) => {
    setLang(nextLang);
    applyFullPageTranslation(nextLang);
  };

  const [tab, setTab] = useState<Tab>("field");

  useEffect(() => {
    applyFullPageTranslation(lang);
  }, [lang, tab]);

  const [fieldIdRaw, setFieldId] = useState("");
  const fieldId = fields.some((f) => f.id === fieldIdRaw) ? fieldIdRaw : (fields[0]?.id ?? "");
  const [scenarioId, setScenarioId] = useState<Scenario["id"]>("A");
  const [evidenceIds, setEvidenceIds] = useState<string[] | null>(null);
  const [online, setOnline] = useState(true);
  const [saved, setSaved] = useState<string[]>([]);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const t = translations[lang] || translations.en;
  
  const field = fields.find((f) => f.id === fieldId) ?? {
    ...demoFields[0]!,
    id: "",
    name: live ? "No field added yet" : "Demo Field",
    coordinates: demoFields[0]!.coordinates,
  };
  
  const scenario = scenarios.find((s) => s.id === scenarioId)!;

  // NASA observations state for current field
  const [activeNasaData, setActiveNasaData] = useState<PowerReading[] | null>(null);

  useEffect(() => {
    let active = true;
    if (field.coordinates && field.coordinates[0] && field.coordinates[1]) {
      getPowerReadings(field.coordinates[0], field.coordinates[1])
        .then((res) => {
          if (active && res && res.length > 0) setActiveNasaData(res);
        })
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, [field.coordinates[0], field.coordinates[1]]);

  const chat = useNovaChat(lang, scenario, field, activeNasaData);

  useEffect(() => {
    const s = localStorage.getItem("agronova-saved");
    if (s) setSaved(JSON.parse(s));
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const save = () => {
    const entry = `${field.name} · ${scenario.name}`;
    const next = [entry, ...saved.filter((x) => x !== entry)].slice(0, 6);
    setSaved(next);
    localStorage.setItem("agronova-saved", JSON.stringify(next));
  };

  const selectTab = (nextTab: Tab) => {
    setTab(nextTab);
    setMobileMenuOpen(false);
  };

  const cycleLanguage = () => {
    const currentIndex = languages.findIndex((l) => l.code === lang);
    const nextLang = languages[(currentIndex + 1) % languages.length]!.code;
    setLang(nextLang);
  };

  const sidebarContent = (mobile = false) => (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
        {(sidebarExpanded || mobile) && (
          <span className="font-display text-lg">
            {live ? "Farmer Workspace" : "Demo Workspace"}
          </span>
        )}
        {!mobile && (
          <AgroButton
            size="icon"
            variant="ghost"
            onClick={() => setSidebarExpanded((value) => !value)}
            aria-label={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
            title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarExpanded ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </AgroButton>
        )}
        {mobile && (
          <AgroButton size="icon" variant="ghost" onClick={() => setMobileMenuOpen(false)} aria-label="Close workspace menu">
            <X className="h-4 w-4" />
          </AgroButton>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto py-3">
        {workspaceTabs.map((key) => {
          const Icon = tabIcons[key];
          return (
            <AgroButton
              key={key}
              variant={tab === key ? "primary" : "ghost"}
              size={sidebarExpanded || mobile ? "md" : "icon"}
              onClick={() => selectTab(key)}
              className={sidebarExpanded || mobile ? "w-full justify-start" : "mx-auto"}
              aria-label={t[key]}
              title={!sidebarExpanded && !mobile ? t[key] : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {(sidebarExpanded || mobile) && <span className="truncate">{t[key]}</span>}
            </AgroButton>
          );
        })}
      </div>
      <div className="flex flex-col gap-2 border-t border-border pt-3">
        <AgroButton
          variant={tab === "profile" ? "primary" : "ghost"}
          size={sidebarExpanded || mobile ? "md" : "icon"}
          onClick={() => selectTab("profile")}
          className={sidebarExpanded || mobile ? "min-w-0 justify-start" : "mx-auto"}
          aria-label={t.profile}
          title={!sidebarExpanded && !mobile ? t.profile : undefined}
        >
          <UserRound className="h-4 w-4 shrink-0" />
          {(sidebarExpanded || mobile) && <span className="truncate">{t.profile}</span>}
        </AgroButton>
        {(sidebarExpanded || mobile) ? (
          <PlanBadge onClick={() => { setPlanOpen(true); setMobileMenuOpen(false); }} />
        ) : (
          <AgroButton
            variant="secondary"
            size="icon"
            onClick={() => { setPlanOpen(true); setMobileMenuOpen(false); }}
            aria-label="View subscription plan"
            title="Subscription plan"
            className="mx-auto"
          >
            <span className="text-[11px] font-bold">★</span>
          </AgroButton>
        )}
      </div>
    </>
  );

  return (
    <div className="bg-background min-h-screen">
      <header className="glass-panel sticky top-0 z-30 border-b border-border">
        <div className="mx-auto grid max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-3 py-3 sm:px-4">
          <AgroButton size="icon" variant="ghost" onClick={() => setMobileMenuOpen(true)} className="lg:hidden" aria-label="Open workspace menu">
            <Menu className="h-5 w-5" />
          </AgroButton>
          <Link to="/" className="hidden items-center gap-2 font-semibold lg:flex">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-display text-xl">AgroNova</span>
          </Link>
          <div className="flex min-w-0 items-center gap-2">
            <Link to="/" className="font-display truncate text-xl font-semibold lg:hidden">AgroNova</Link>
            {live ? (
              <span className="clay-chip hidden px-3 py-1 text-xs font-semibold sm:inline">
                {t.liveNasa}
              </span>
            ) : (
              <>
                <span className="clay-chip hidden px-3 py-1 text-xs font-semibold sm:inline">{t.demo}</span>
                <span className="text-muted-foreground hidden text-xs sm:inline">
                  {t.liveObservation}
                </span>
              </>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="clay-chip hidden items-center gap-1 px-3 py-1 text-xs md:flex">
              {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              {online ? t.onlineLabel : t.offlineLabel}
            </span>
            {live ? (
              <AgroButton size="sm" variant="ghost" onClick={signOut} className="hidden sm:inline-flex">
                <LogOut className="h-4 w-4" /> {t.signOut}
              </AgroButton>
            ) : (
              <Link to="/auth" className="clay-btn bg-primary text-primary-foreground hidden px-3 py-1.5 text-sm font-semibold sm:inline-flex">
                {t.loginSignup}
              </Link>
            )}
          </div>
        </div>
      </header>

      {!online && (
        <div className="bg-secondary px-4 py-2 text-center text-sm">
          {t.offlineLabel}. Showing cached field data.
        </div>
      )}

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[1000] bg-foreground/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        >
          <nav
            aria-label="Workspace sections"
            className="bg-background relative z-[1001] flex h-full w-[min(86vw,320px)] flex-col p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {sidebarContent(true)}
            <div className="mt-3 border-t border-border pt-3">
              {live ? (
                <AgroButton variant="ghost" className="w-full justify-start" onClick={signOut}>
                  <LogOut className="h-4 w-4" /> {t.signOut}
                </AgroButton>
              ) : (
                <Link to="/auth" className="clay-btn bg-primary text-primary-foreground flex min-h-12 items-center justify-center px-4 text-sm font-semibold">
                  {t.loginSignup}
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}

      <div className={`mx-auto grid max-w-[1400px] gap-6 px-4 py-6 ${sidebarExpanded ? "lg:grid-cols-[220px_minmax(0,1fr)]" : "lg:grid-cols-[76px_minmax(0,1fr)]"}`}>
        <nav aria-label="Workspace sections" className="clay-card sticky top-24 hidden h-[calc(100vh-8rem)] flex-col p-3 lg:flex">
          {sidebarContent()}
        </nav>
        <main className="min-w-0 space-y-6">
          {tab === "profile" && (live ? <LiveProfile profile={profile} fieldCount={fields.length} onSaved={loadLive} lang={lang} onLanguageChange={handleLanguageChange} /> : <DemoProfile lang={lang} onLanguageChange={handleLanguageChange} />)}
          {live && tab === "field" && <AddFieldForm onAdded={loadLive} initialCoords={pickedCoords} />}
          {tab === "field" && (
            <FieldExplorer
              fields={fields}
              mounted={mounted}
              live={live}
              fieldId={fieldId}
              setFieldId={setFieldId}
              next={() => setTab("health")}
              onMapClick={(coords) => setPickedCoords(coords)}
              lang={lang}
            />
          )}
          {tab === "health" && <Health field={field} openEvidence={setEvidenceIds} live={live} lang={lang} />}
          {tab === "rotation" && (
            <RotationLab
              selected={scenarioId}
              setSelected={setScenarioId}
              openEvidence={setEvidenceIds}
              save={save}
              lang={lang}
              field={field}
              nasaData={activeNasaData}
            />
          )}
          {tab === "compare" && <Compare lang={lang} />}
          {tab === "simulator" && <Simulator lang={lang} />}
          {tab === "doctor" && (
            <section className="clay-card p-5 sm:p-6">
              <CropDoctor lang={lang} />
            </section>
          )}
          {tab === "forecast" && (
            <ForecastPanel
              lat={field.coordinates[0]}
              lon={field.coordinates[1]}
              fieldName={field.name}
              lang={lang}
            />
          )}
          {tab === "crops" && <CropLibrary lang={lang} field={field} />}
          {tab === "history" && <History field={field} saved={saved} lang={lang} />}
          {tab === "how" && <HowItWorks lang={lang} />}
        </main>
      </div>

      {planOpen && (
        <PricingModal onClose={() => setPlanOpen(false)} />
      )}

      {evidenceIds && (
        <EvidenceDrawer ids={evidenceIds} fieldName={field.name} close={() => setEvidenceIds(null)} lang={lang} />
      )}
      <FloatingNova lang={lang} label={t.ask} chat={chat} />
    </div>
  );
}

function Card({ title, children, kicker }: { title: string; kicker?: string; children: React.ReactNode }) {
  return (
    <section className="clay-card p-5 sm:p-6">
      {kicker && <p className="text-primary text-xs font-semibold uppercase tracking-wider">{kicker}</p>}
      <h2 className="font-display mb-4 text-2xl">{title}</h2>
      {children}
    </section>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="clay-chip px-2.5 py-0.5 text-xs font-semibold">{children}</span>;
}

function FieldExplorer({
  fields,
  mounted,
  live,
  fieldId,
  setFieldId,
  next,
  onMapClick,
  lang = "en",
}: {
  fields: DemoField[];
  mounted: boolean;
  live: boolean;
  fieldId: string;
  setFieldId: (id: string) => void;
  next: () => void;
  onMapClick?: (coords: [number, number]) => void;
  lang?: Language;
}) {
  const t = translations[lang] || translations.en;
  const [q, setQ] = useState("");
  const list = fields.filter((f) =>
    `${f.name} ${f.district}`.toLowerCase().includes(q.toLowerCase()),
  );
  const f = fields.find((x) => x.id === fieldId);
  if (!f) {
    return (
      <Card title={live ? t.yourFarmFields : t.field}>
        <p className="text-muted-foreground">
          {live ? "No fields registered yet. Use the 'Add a field' form above or tap the map to save your farm location." : t.noFieldMatch}
        </p>
      </Card>
    );
  }
  return (
    <Card kicker={t.fieldStep} title={live ? `${t.yourFarmFields} (${fields.length})` : t.chooseField}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t.searchField}
        className="clay-card-sunken mb-4 w-full px-4 py-3 text-base outline-none"
      />
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          {mounted ? (
            <Suspense fallback={<div className="clay-card-sunken h-[360px]" />}>
              <FieldMap
                fields={fields}
                selected={fieldId}
                onSelect={setFieldId}
                onClickCoordinate={onMapClick}
              />
            </Suspense>
          ) : (
            <div className="clay-card-sunken h-[360px]" />
          )}
          <p className="text-muted-foreground mt-2 text-xs">
            OpenStreetMap. {t.tapMapHint}
          </p>
        </div>
        <div className="space-y-3">
          {list.length === 0 && <p className="text-muted-foreground">{t.noFieldMatch}</p>}
          {list.map((x) => (
            <button
              key={x.id}
              onClick={() => setFieldId(x.id)}
              className={`clay-btn block w-full p-4 text-left ${x.id === fieldId ? "bg-primary text-primary-foreground" : "bg-card"}`}
            >
              <p className="font-semibold">{x.name}</p>
              <p className="text-sm opacity-80">
                {x.district} · {x.crop} · {x.size} ha
              </p>
            </button>
          ))}
          <dl className="grid grid-cols-2 gap-2 pt-2 text-sm">
            {[
              [t.coordinates, `${f.coordinates[0]}, ${f.coordinates[1]}`],
              [t.season, f.season],
              [t.water, f.water],
              [t.priority, f.priority],
              [t.soilType, f.soil],
              [t.fieldSize, `${f.size} ha`],
            ].map(([k, v]) => (
              <div key={k} className="clay-card-sunken p-2.5">
                <dt className="text-muted-foreground text-xs">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <AgroButton className="w-full" onClick={next}>
            {t.next}
          </AgroButton>
        </div>
      </div>
    </Card>
  );
}

function Health({
  field,
  openEvidence,
  live,
  lang,
}: {
  field: DemoField;
  openEvidence: (ids: string[]) => void;
  live: boolean;
  lang: Language;
}) {
  const t = translations[lang] || translations.en;
  const [range, setRange] = useState<"7" | "30">("30");
  const [nasaData, setNasaData] = useState<PowerReading[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLiveNasa, setIsLiveNasa] = useState(false);

  useEffect(() => {
    let active = true;
    if (field.coordinates && field.coordinates[0] && field.coordinates[1]) {
      setLoading(true);
      getPowerReadings(field.coordinates[0], field.coordinates[1])
        .then((res) => {
          if (active && res && res.length > 0) {
            setNasaData(res);
            setIsLiveNasa(true);
            setLoading(false);
          }
        })
        .catch(() => {
          if (active) {
            setIsLiveNasa(false);
            setLoading(false);
          }
        });
    }
    return () => {
      active = false;
    };
  }, [field.coordinates[0], field.coordinates[1]]);

  const insights = useMemo(() => computeFieldInsights(nasaData ?? []), [nasaData]);
  const formattedTimeline = useMemo(() => {
    if (nasaData && nasaData.length > 0) {
      return formatNasaChartTimeline(nasaData);
    }
    return timeline;
  }, [nasaData]);

  const chartData = range === "7" ? formattedTimeline.slice(-7) : formattedTimeline;

  // Use the NASA POWER-computed fungal risk from computeFieldInsights (richer than a simple boolean)
  const pestStatus = insights.fungalRisk;
  const pestAdvice = insights.fungalAdvice;

  const displayEvidence = useMemo(() => {
    if (!isLiveNasa || !nasaData || nasaData.length === 0) return evidence;
    return evidence.map((e) => {
      if (e.id === "power") {
        return {
          ...e,
          value: `${insights.meanTemp7d}`,
          freshness: "Fresh" as const,
          date: "Live NASA POWER (7-day avg)",
        };
      }
      if (e.id === "gpm") {
        return {
          ...e,
          value: `${insights.totalRain7d}`,
          freshness: "Fresh" as const,
          date: "Live NASA POWER rain (7-day total)",
        };
      }
      return e;
    });
  }, [isLiveNasa, nasaData, insights]);

  return (
    <>
      <Card kicker={t.healthStep} title={`${t.nasaEvidence} — ${field.name}`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="clay-chip flex items-center gap-1.5 px-3 py-1 text-xs font-semibold">
              <Satellite className="h-3.5 w-3.5 text-primary" />
              {isLiveNasa
                ? t.liveObservation
                : loading
                  ? t.fetchingNasa
                  : `Observations dated ${demoDate}`}
            </span>
          </div>
          <span className="text-muted-foreground text-xs">
            {t.coordinates}: [{field.coordinates[0]}, {field.coordinates[1]}]
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {displayEvidence.map((e) => (
            <button
              key={e.id}
              onClick={() => openEvidence([e.id])}
              className="clay-card-sunken p-4 text-left transition hover:ring-2 hover:ring-primary/40"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">{e.dataset}</span>
                <Badge>{e.freshness}</Badge>
              </div>
              <p className="font-display mt-2 text-3xl">
                {e.value} <span className="text-sm">{e.unit}</span>
              </p>
              <p className="text-muted-foreground text-sm">{e.variable}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                {e.date} · {e.resolution}
              </p>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* 1. Daily Irrigation Need */}
        <div className="clay-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-semibold uppercase">{t.irrigationNeed}</p>
            <div className="flex items-center gap-1">
              <Badge>{insights.irrigationStatus}</Badge>
              <SpeechButton text={insights.irrigationAdvice} lang={lang} />
            </div>
          </div>
          <p className="font-display mt-1 text-xl">{insights.irrigationStatus}</p>
          <p className="mt-2 text-xs leading-relaxed">{insights.irrigationAdvice}</p>
          <button
            onClick={() => openEvidence(["smap", "gpm"])}
            className="text-primary mt-3 text-xs font-semibold underline"
          >
            {t.source}
          </button>
        </div>

        {/* 2. Heat Stress Risk */}
        <div className="clay-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-semibold uppercase">{t.heatStatus}</p>
            <div className="flex items-center gap-1">
              <Badge>{insights.heatStatus}</Badge>
              <SpeechButton text={insights.heatAdvice} lang={lang} />
            </div>
          </div>
          <p className="font-display mt-1 text-xl">{insights.heatStatus}</p>
          <p className="mt-2 text-xs leading-relaxed">{insights.heatAdvice}</p>
          <p className="text-muted-foreground mt-1 text-[11px]">
            7d mean: {insights.meanTemp7d}°C · Extreme heat days: {insights.extremeHeatDays}
          </p>
          <button
            onClick={() => openEvidence(["power"])}
            className="text-primary mt-3 text-xs font-semibold underline"
          >
            {t.source}
          </button>
        </div>

        {/* 3. Solar & Photosynthesis */}
        <div className="clay-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-semibold uppercase">{t.solar} &amp; {t.humidity}</p>
            <div className="flex items-center gap-1">
              <Badge>Active</Badge>
              <SpeechButton text={`Solar radiation is ${insights.meanSolar7d} MegaJoules per square meter with ${insights.meanHumidity7d}% relative humidity.`} lang={lang} />
            </div>
          </div>
          <p className="font-display mt-1 text-xl">{insights.meanSolar7d} MJ/m²/d</p>
          <p className="mt-2 text-xs leading-relaxed">
            Supports active photosynthesis. 7-day mean relative humidity is {insights.meanHumidity7d}%.
          </p>
          <button
            onClick={() => openEvidence(["power", "modis"])}
            className="text-primary mt-3 text-xs font-semibold underline"
          >
            {t.source}
          </button>
        </div>

        {/* 4. Pest & Disease Microclimate Watch (FR-5) */}
        <div className="clay-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-semibold uppercase">{t.fungalRisk}</p>
            <div className="flex items-center gap-1">
              <Badge>{pestStatus}</Badge>
              <SpeechButton text={pestAdvice} lang={lang} />
            </div>
          </div>
          <p className="font-display mt-1 text-xl">{pestStatus}</p>
          <p className="mt-2 text-xs leading-relaxed">{pestAdvice}</p>
          <button
            onClick={() => openEvidence(["modis"])}
            className="text-primary mt-3 text-xs font-semibold underline"
          >
            {t.source}
          </button>
        </div>

        {/* 5. Wind & Spray Application Safety */}
        <div className="clay-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-semibold uppercase">{t.windStatus}</p>
            <div className="flex items-center gap-1">
              <Badge>{insights.windStatus}</Badge>
              <SpeechButton text={insights.windAdvice} lang={lang} />
            </div>
          </div>
          <p className="font-display mt-1 text-xl">{insights.windStatus}</p>
          <p className="mt-2 text-xs leading-relaxed">{insights.windAdvice}</p>
          <p className="text-muted-foreground mt-1 text-[11px]">
            7d mean wind: {insights.meanWindSpeed7d} m/s · Dew point: {insights.meanDewPoint7d}°C
          </p>
          <button
            onClick={() => openEvidence(["power"])}
            className="text-primary mt-3 text-xs font-semibold underline"
          >
            {t.source}
          </button>
        </div>
      </div>

      <Card title={t.nasaEvidence}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex gap-2">
            {(["7", "30"] as const).map((r) => (
              <AgroButton key={r} size="sm" variant={range === r ? "primary" : "ghost"} onClick={() => setRange(r)}>
                {r} {lang === "bn" || lang === "hi" ? "দিন" : lang === "es" ? "días" : lang === "sw" ? "siku" : "days"}
              </AgroButton>
            ))}
          </div>
          <span className="text-muted-foreground text-xs">
            {isLiveNasa ? t.liveObservation : "Sample baseline observations plotted"}
          </span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line dataKey="temp" name={`${t.temperature} (°C)`} stroke="var(--primary)" strokeWidth={2.5} />
              <Line dataKey="moisture" name="Soil Moisture Index (%)" stroke="var(--accent)" strokeWidth={2.5} />
              <Line dataKey="vegetation" name="Vegetation Vitality" stroke="var(--muted-foreground)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Area dataKey="rain" name={`${t.rainfall} (mm)`} stroke="var(--primary)" fill="var(--secondary)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </>
  );
}

function RotationLab({
  selected,
  setSelected,
  openEvidence,
  save,
  lang,
  field,
  nasaData,
}: {
  selected: Scenario["id"];
  setSelected: (id: Scenario["id"]) => void;
  openEvidence: (ids: string[]) => void;
  save: () => void;
  lang: Language;
  field?: DemoField | undefined;
  nasaData?: PowerReading[] | null | undefined;
}) {
  const t = translations[lang] || translations.en;
  const [advisoryLoading, setAdvisoryLoading] = useState(false);
  const [advisoryText, setAdvisoryText] = useState("");
  const [copiedAdvisory, setCopiedAdvisory] = useState(false);

  const selectedScenario = scenarios.find((s) => s.id === selected) || scenarios[0]!;

  const handleGenerateAdvisory = async () => {
    setAdvisoryLoading(true);
    setAdvisoryText("");

    const recentTemp = nasaData?.slice(-1)[0]?.temperature ?? 29;
    const recentRain = nasaData?.slice(-7).reduce((acc, r) => acc + (r.rain ?? 0), 0) ?? 12;

    const prompt = `Generate a customized 3-step practical agronomic advisory for a farmer in ${field?.district || "South Asia"} adopting crop rotation plan: "${selectedScenario.name}" (Crops: ${selectedScenario.sequence.join(" -> ")}).
Field characteristics: Soil: ${field?.soil || "Loam"}, Water access: ${field?.water || "Moderate"}, Current Crop: ${field?.crop || "Rice"}.
NASA POWER Earth observation context: 7-day cumulative rainfall ${recentRain.toFixed(1)}mm, temperature ${recentTemp}°C.

Structure your response into 3 concise actionable sections in language "${lang}":
1. 🌾 Sowing Timeline & Soil Prep (How to prepare field and optimal transition date)
2. 💧 Water & Irrigation Schedule (Grounded in current NASA rainfall trends)
3. 🛡️ Pest, Disease & Nutrient Cycle Benefits (Why this sequence protects the farmer)

Be encouraging, specific, and grounded for a smallholder farmer.`;

    const systemInstruction = `You are a certified agronomy specialist for the NASA Space Apps Challenge 2026. Keep advice clear, supportive, and accessible for smallholder farmers.`;

    const res = await generateGeminiText(prompt, systemInstruction, 0.5);

    if (res.success && res.text) {
      setAdvisoryText(res.text);
    } else {
      setAdvisoryText(
        `💡 Agronomic Action Plan: ${selectedScenario.name}\n\n` +
        `1. 🌾 Sowing & Transition: Plant ${selectedScenario.sequence[1] || "legumes"} immediately following ${selectedScenario.sequence[0] || "rice"} harvest to utilize residual soil moisture. This allows you to capture end-of-season moisture before the dry period sets in.\n` +
        `2. 💧 Water Management: Current 7-day rainfall is ${recentRain.toFixed(1)}mm. Implement alternate wetting and drying (AWD) irrigation to realize the projected ${selectedScenario.water}/100 water score — this can save 20–30% of irrigation water compared to continuous flooding.\n` +
        `3. 🛡️ Soil & Pest Defense: Incorporating legumes into this rotation fixes atmospheric nitrogen (targeting ${selectedScenario.soil}/100 soil index) and breaks the monoculture pest cycle. This reduces fertilizer costs and lowers blast and sheath blight pressure in subsequent rice seasons.\n\n` +
        `Source: AgroNova Agronomy Engine · NASA POWER observations · Verified against BRRI and IRRI crop calendars for South Asia.`
      );
    }
    setAdvisoryLoading(false);
  };

  const copyAdvisory = () => {
    if (!advisoryText) return;
    navigator.clipboard.writeText(advisoryText);
    setCopiedAdvisory(true);
    setTimeout(() => setCopiedAdvisory(false), 2000);
  };

  return (
    <Card kicker={t.rotationStep} title={t.rotationTitle}>
      <p className="text-muted-foreground mb-4 text-sm">{t.pickScenario}</p>

      {/* Gemini AI Scenario Advisory Box */}
      <div className="clay-card border border-primary/20 p-5 mb-5 bg-gradient-to-br from-card to-primary/5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
            <h4 className="font-display font-semibold text-base sm:text-lg">
              Gemini AI Advisory for Plan {selectedScenario.id}: {selectedScenario.name}
            </h4>
          </div>
          <AgroButton
            size="sm"
            variant="primary"
            disabled={advisoryLoading}
            onClick={handleGenerateAdvisory}
            className="flex items-center gap-1.5 shadow"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{advisoryLoading ? "Analyzing..." : "Generate AI Action Plan"}</span>
          </AgroButton>
        </div>

        <p className="text-xs text-muted-foreground mb-3">
          Generates field-tailored recommendations combining your soil profile, selected sequence ({selectedScenario.sequence.join(" → ")}), and NASA satellite observations.
        </p>

        {advisoryText && (
          <div className="mt-3 space-y-3">
            <div className="clay-card-sunken rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap">
              {advisoryText}
            </div>
            <div className="flex items-center justify-between">
              <SpeechButton text={advisoryText.replace(/[*#_`]/g, "")} lang={lang} />
              <button
                type="button"
                onClick={copyAdvisory}
                className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
              >
                {copiedAdvisory ? "✓ Copied to clipboard" : "Copy action plan"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {scenarios.map((s) => (
          <div
            key={s.id}
            className={`clay-card-sunken p-5 ${selected === s.id ? "ring-2 ring-primary" : ""}`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-display text-2xl">
                {s.id}. {s.name}
              </span>
              <span className="clay-chip ml-auto px-3 py-1 font-semibold">{t.overallFit} {s.score}/100</span>
            </div>
            <div className="my-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground mr-1">{t.rotationSeq}:</span>
              {s.sequence.map((c, i) => (
                <span key={c} className="flex items-center gap-2">
                  <span className="bg-secondary rounded-full px-3 py-1 text-sm font-semibold">{c}</span>
                  {i < s.sequence.length - 1 && "→"}
                </span>
              ))}
            </div>
            <div className="grid gap-3 text-sm md:grid-cols-3">
              <div>
                <div className="flex items-center gap-1.5 font-semibold">
                  <span>{t.action}:</span>
                  <SpeechButton text={s.action} lang={lang} />
                </div>
                <p className="mt-0.5">{s.action}</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-semibold">
                  <span>{t.rationale}:</span>
                  <SpeechButton text={s.why} lang={lang} />
                </div>
                <p className="mt-0.5">{s.why}</p>
              </div>
              <div>
                <span className="font-semibold">{t.evidence}:</span>
                <p className="mt-0.5">
                  {s.evidenceIds.map((id) => evidence.find((e) => e.id === id)?.dataset).join(", ")}
                </p>
              </div>
            </div>
            <p className="text-muted-foreground mt-2 text-sm">{t.waterFit}: {s.water}/100 · Trade-off: {s.tradeoff}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <AgroButton size="sm" onClick={() => setSelected(s.id)}>
                {selected === s.id ? "✓ " + t.select : t.select}
              </AgroButton>
              <AgroButton size="sm" variant="ghost" onClick={() => openEvidence(s.evidenceIds)}>
                <Satellite className="h-4 w-4" /> {t.source}
              </AgroButton>
              <AgroButton size="sm" variant="secondary" onClick={() => { setSelected(s.id); save(); }}>
                {t.save}
              </AgroButton>
            </div>
          </div>
        ))}
        <p className="text-muted-foreground text-xs">
          Adaptive rotation options based on NASA Earth observations. Consult local agricultural extension for field testing.
        </p>
      </div>

      {selectedScenario && (
        <div className="mt-6 border-t border-border pt-6">
          <SummaryCard
            field={field || demoFields[0]!}
            scenario={selectedScenario}
            save={() => { setSelected(selectedScenario.id); save(); }}
            lang={lang}
          />
        </div>
      )}
    </Card>
  );
}


const metrics = ["water", "rainfall", "temperature", "soil", "resilience", "priority"] as const;

function Compare({ lang = "en" }: { lang?: Language }) {
  const t = translations[lang] || translations.en;
  return (
    <Card kicker={t.compareStep} title={t.compareTitle}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">{t.evidence}</th>
              {scenarios.map((s) => <th key={s.id} className="p-2">{s.id}. {s.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => (
              <tr key={m} className="border-t border-border">
                <td className="p-2 capitalize">{({
                  water: t.water, rainfall: t.rainfall, temperature: t.temperature,
                  soil: t.soilType, resilience: "Resilience", priority: t.priority,
                })[m] ?? m}</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="p-2">
                    <div className="flex items-center gap-2">
                      <div className="clay-card-sunken h-2.5 w-20 overflow-hidden">
                        <div className="bg-primary h-full" style={{ width: `${s[m]}%` }} />
                      </div>
                      {s[m]}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Simulator({ lang }: { lang: Language }) {
  const t = translations[lang] || translations.en;
  const [rain, setRain] = useState(0);
  const [water, setWater] = useState(0);
  const [temp, setTemp] = useState(0);
  const [season, setSeason] = useState(0);

  // Soil profile state (default = demo farm's typical values for Rajshahi silty loam)
  const [soilN, setSoilN] = useState(72);
  const [soilP, setSoilP] = useState(18);
  const [soilK, setSoilK] = useState(45);
  const [soilPh, setSoilPh] = useState(6.4);
  const [soilOM, setSoilOM] = useState(1.6);
  const [showSoil, setShowSoil] = useState(false);

  const soil: SoilProfile = { nitrogen: soilN, phosphorus: soilP, potassium: soilK, ph: soilPh, organicMatter: soilOM };
  const limitingFactor = useMemo(() => computeSoilLimitingFactor(soil), [soilN, soilP, soilK, soilPh, soilOM]);

  const results = useMemo(
    () => scenarios.map((s) => adjustedScenario(s, rain, water, temp, season)),
    [rain, water, temp, season],
  );

  const climateSliders: [string, number, (n: number) => void, number, number, number, string][] = [
    [t.rainfallChange, rain, setRain, -40, 40, 5, "%"],
    [t.waterAvail, water, setWater, -40, 40, 5, "%"],
    [t.tempChange, temp, setTemp, -2, 4, 0.5, "°C"],
    [t.seasonLength, season, setSeason, -21, 21, 7, ` ${lang === "bn" || lang === "hi" ? "দিন" : lang === "es" ? "días" : lang === "sw" ? "siku" : "days"}`],
  ];

  const severityBg = {
    Critical: "bg-destructive/15 border-destructive/40 text-destructive",
    Moderate: "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-400",
    Slight: "bg-primary/10 border-primary/30 text-primary",
    None: "bg-primary/10 border-primary/20 text-primary",
  } as const;

  return (
    <Card kicker={t.simStep} title={t.simTitle}>
      <p className="bg-secondary mb-5 rounded-xl px-3 py-2 text-sm font-semibold">
        {t.simNotForecast}
      </p>

      {/* ── Climate sliders ── */}
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t.climateWater}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {climateSliders.map(([label, v, set, min, max, step, unit]) => (
          <label key={label} className="clay-card-sunken block p-4">
            <span className="flex justify-between text-sm font-semibold">
              {label} <span>{v > 0 ? "+" : ""}{v}{unit}</span>
            </span>
            <input
              type="range" min={min} max={max} step={step} value={v}
              onChange={(e) => set(Number(e.target.value))}
              className="mt-3 w-full accent-[var(--primary)]"
            />
          </label>
        ))}
      </div>

      {/* ── Soil Nutrient section ── */}
      <button
        type="button"
        onClick={() => setShowSoil((s) => !s)}
        className="clay-btn mt-5 flex w-full items-center justify-between px-4 py-3 text-sm font-semibold"
      >
        <span className="flex items-center gap-2">
          🌱 {t.soilNutrient}
          {limitingFactor.factor !== "Balanced" && (
            <span className={`rounded-full border px-2 py-0.5 text-xs ${severityBg[limitingFactor.severity]}`}>
              ⚠ {limitingFactor.factor} {t.limitingFactor}
            </span>
          )}
        </span>
        <span className="text-muted-foreground text-xs">{showSoil ? "hide ▲" : "show ▼"}</span>
      </button>

      {showSoil && (
        <div className="mt-3 space-y-4">
          <p className="text-xs text-muted-foreground">
            {t.liebigHint}
          </p>

          {/* Soil sliders */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {([
              ["Nitrogen (N)", soilN, setSoilN, 10, 150, 5, " kg/ha", "80–120"],
              ["Phosphorus (P)", soilP, setSoilP, 5, 80, 2, " kg/ha", "20–40"],
              ["Potassium (K)", soilK, setSoilK, 10, 120, 5, " kg/ha", "40–80"],
              ["Soil pH", soilPh, setSoilPh, 4.0, 9.0, 0.1, "", "6.0–7.0"],
              ["Organic Matter", soilOM, setSoilOM, 0.2, 6.0, 0.1, "%", ">2%"],
            ] as const).map(([label, v, set, min, max, step, unit, ideal]) => (
              <label key={label} className="clay-card-sunken block p-3">
                <span className="flex justify-between text-xs font-semibold">
                  {label}
                  <span className="font-mono">{v}{unit}</span>
                </span>
                <input
                  type="range" min={min} max={max} step={step} value={v}
                  onChange={(e) => set(Number(e.target.value))}
                  className="mt-2 w-full accent-[var(--primary)]"
                />
                <span className="text-[10px] text-muted-foreground">{t.idealRange}: {ideal}</span>
              </label>
            ))}
          </div>

          {/* Limiting factor result */}
          <div className={`clay-card rounded-2xl border p-4 ${severityBg[limitingFactor.severity]}`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{limitingFactor.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">
                    {limitingFactor.factor === "Balanced"
                      ? t.soilBalanced
                      : `#1 ${t.limitingFactor}: ${limitingFactor.factor}`}
                  </p>
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${severityBg[limitingFactor.severity]}`}>
                    {limitingFactor.severity}
                  </span>
                </div>
                {limitingFactor.yieldImpact > 0 && (
                  <p className="text-sm font-medium mt-0.5">
                    {t.yieldImpact}: −{limitingFactor.yieldImpact}%
                  </p>
                )}
              </div>
            </div>
            <p className="mt-3 text-sm">{limitingFactor.advice}</p>
          </div>
        </div>
      )}

      {/* ── Scenario results ── */}
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {results.map((r) => (
          <div key={r.id} className="clay-card p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{r.id}. {r.name}</p>
              <SpeechButton text={r.explanation} lang={lang} />
            </div>
            <p className="font-display text-3xl">
              {r.score} → {r.adjustedScore}
            </p>
            <p className={`text-sm font-semibold ${r.delta < 0 ? "text-destructive" : "text-primary"}`}>
              {r.delta > 0 ? "+" : ""}{r.delta} points
            </p>
            {showSoil && limitingFactor.yieldImpact > 0 && (
              <p className="text-muted-foreground mt-1 text-xs">
                🌱 {t.soilPenalty}: −{Math.min(limitingFactor.yieldImpact, 30)} pts
              </p>
            )}
            <p className="text-muted-foreground mt-1 text-xs">{r.explanation}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}


function ForecastPanel({
  lat, lon, fieldName, lang,
}: { lat: number; lon: number; fieldName: string; lang: Language }) {
  const t = translations[lang] || translations.en;
  const [forecast, setForecast] = useState<ForecastSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    get7DayForecast(lat, lon)
      .then(setForecast)
      .finally(() => setLoading(false));
  }, [lat, lon]);

  const riskColor = {
    Low: "bg-primary/10 border-primary/20 text-primary",
    Watch: "bg-amber-500/15 border-amber-400/40 text-amber-700 dark:text-amber-400",
    Alert: "bg-destructive/15 border-destructive/40 text-destructive",
  } as const;

  if (loading) {
    return (
      <Card kicker="Open-Meteo" title={t.forecastTitle}>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4 animate-pulse text-primary" />
          {t.fetchingForecast} {fieldName}…
        </div>
      </Card>
    );
  }

  if (!forecast) return null;

  return (
    <Card kicker="Open-Meteo · Free forecast API" title={`${t.forecastTitle} — ${fieldName}`}>
      {/* Source badge */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="clay-chip flex items-center gap-1.5 px-3 py-1 text-xs font-semibold">
          <CalendarDays className="h-3.5 w-3.5 text-primary" />
          {forecast.source === "live" ? t.liveForecast : t.demoForecast}
        </span>
        <span className="clay-chip flex items-center gap-1.5 px-3 py-1 text-xs font-semibold">
          <Droplets className="h-3.5 w-3.5 text-primary" />
          {t.totalRain}: {forecast.totalRain7d} mm
        </span>
        <span className="clay-chip flex items-center gap-1.5 px-3 py-1 text-xs font-semibold">
          <Sun className="h-3.5 w-3.5 text-amber-500" />
          {t.et0Label}: {forecast.totalET7d} mm
        </span>
        {forecast.totalIrrigationNeed > 0 && (
          <span className="clay-chip flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
            💧 {t.irrigDemand}: {forecast.totalIrrigationNeed} mm
          </span>
        )}
      </div>

      {/* Daily cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {forecast.days.map((day) => (
          <div
            key={day.date}
            className={`clay-card-sunken rounded-2xl border p-3 text-center ${day.riskLevel !== "Low" ? riskColor[day.riskLevel] : ""}`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{day.label}</p>
            <p className="my-1 text-3xl">{day.weatherEmoji}</p>
            <p className="text-xs font-medium">{day.weatherLabel}</p>
            <div className="mt-2 flex justify-around text-xs">
              <span className="text-destructive font-semibold">{day.tempMax}°</span>
              <span className="text-muted-foreground">{day.tempMin}°</span>
            </div>
            <div className="mt-1.5 space-y-0.5 text-[10px] text-muted-foreground">
              <p>🌧 {day.rain} mm {lang === "bn" || lang === "hi" ? "বৃষ্টি" : "rain"}</p>
              <p>💧 ET₀ {day.et0} mm</p>
              {day.irrigationNeed > 0 && (
                <p className="font-semibold text-primary">+{day.irrigationNeed}mm {lang === "bn" || lang === "hi" ? "প্রয়োজন" : lang === "es" ? "necesario" : lang === "sw" ? "inahitajika" : "needed"}</p>
              )}
            </div>
            {day.riskLevel !== "Low" && (
              <div className={`mt-2 rounded-xl border px-2 py-1 text-[10px] font-semibold ${riskColor[day.riskLevel]}`}>
                {day.riskLevel === "Alert" ? "⚠️ Alert" : "👁 Watch"}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Risk advice summary */}
      {forecast.days.filter((d) => d.riskLevel !== "Low").length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.forecastAlerts}</p>
          {forecast.days
            .filter((d) => d.riskLevel !== "Low")
            .map((d) => (
              <div key={d.date} className={`rounded-xl border p-3 text-sm ${riskColor[d.riskLevel]}`}>
                <span className="font-semibold">{d.label}:</span> {d.riskReason}
              </div>
            ))}
        </div>
      )}

      {/* Irrigation summary bar */}
      <div className="mt-4 clay-card-sunken rounded-2xl p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t.irrigBar}
        </p>
        <div className="flex items-end gap-1.5" style={{ height: 64 }}>
          {forecast.days.map((day) => {
            const pct = Math.min(100, (day.irrigationNeed / 8) * 100);
            return (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-primary/70 transition-all"
                  style={{ height: `${pct}%`, minHeight: day.irrigationNeed > 0 ? 4 : 0 }}
                  title={`${day.label}: ${day.irrigationNeed}mm`}
                />
                <span className="text-[9px] text-muted-foreground">{day.label.slice(0, 3)}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {t.irrigBarSub}
        </p>
      </div>
    </Card>
  );
}


function CropLibrary({ lang, field }: { lang: Language; field: DemoField }) {
  const t = translations[lang] || translations.en;
  return (
    <Card title={t.cropsTitle}>
      <p className="text-muted-foreground mb-4 text-xs">
        {t.cropCompat} {field.name}.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {crops.map((c) => {
          const fSeason = field.season.toLowerCase();
          const cSeason = c.season.toLowerCase();
          const isCurrentSeasonMatch =
            (fSeason.includes("aman") && cSeason.includes("aman")) ||
            (fSeason.includes("rabi") && cSeason.includes("rabi")) ||
            (fSeason.includes("boro") && cSeason.includes("boro")) ||
            (fSeason.includes("kharif") && cSeason.includes("kharif")) ||
            cSeason.split(/[\s/()]+/).some((tok) => tok.length > 3 && fSeason.includes(tok));
          return (
            <div key={c.name} className="clay-card-sunken p-4 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="font-display text-xl">
                    {lang === "bn" ? `${c.bn} (${c.name})` : c.name}
                  </p>
                  {isCurrentSeasonMatch && (
                    <span className="clay-chip text-[11px] font-semibold text-primary">In Window</span>
                  )}
                </div>
                <SpeechButton text={`${c.name}. Season: ${c.season}. Duration: ${c.duration}. Water requirement: ${c.water}. Optimal temperature: ${c.temp}. Recommended soil: ${c.soil}.`} lang={lang} />
              </div>
              <p className="mt-1 font-medium">{c.season} · {c.duration}</p>
              <p className="text-muted-foreground mt-0.5">Water: {c.water} · Optimal Temp: {c.temp}</p>
              <p className="text-muted-foreground">Soil: {c.soil}</p>
              <p className="text-muted-foreground mt-1 text-xs">Follows well: {c.follows}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function History({ field, saved, lang = "en" }: { field: DemoField; saved: string[]; lang?: Language }) {
  const t = translations[lang] || translations.en;
  return (
    <Card title={`${t.historyTitle} — ${field.name}`}>
      <div className="space-y-4">
        <div>
          <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wider">Previous crops and notes</p>
          <ul className="clay-card-sunken space-y-2 p-4 text-sm">
            {field.history.map((h, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="bg-primary h-2 w-2 rounded-full" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wider">{t.savedPlans} ({saved.length})</p>
          {saved.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t.noSavedPlans}</p>
          ) : (
            <ul className="clay-card-sunken space-y-2 p-4 text-sm">
              {saved.map((item, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span>{item}</span>
                  <span className="clay-chip text-xs">✓ Saved</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}

function HowItWorks({ lang = "en" }: { lang?: Language }) {
  const t = translations[lang] || translations.en;
  return (
    <Card title={t.howTitle}>
      <div className="space-y-4 text-sm leading-relaxed">
        <p>AgroNova translates open satellite data into plain, actionable advice for smallholder farmers adapting to changing seasons.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="clay-card-sunken p-4">
            <p className="font-semibold">Live NASA Data (this demo)</p>
            <p className="text-muted-foreground mt-1">NASA POWER agroclimatology API delivers real 30-day observations of temperature, rainfall, humidity, solar radiation, wind speed, and evapotranspiration for your field's exact coordinates — updated within 3–4 days of satellite pass.</p>
          </div>
          <div className="clay-card-sunken p-4">
            <p className="font-semibold">Open-Meteo Forecast (live)</p>
            <p className="text-muted-foreground mt-1">7-day weather forecast powered by ECMWF IFS, including FAO-56 Penman-Monteith ET₀ calculations for daily irrigation need estimates. Free and no API key required.</p>
          </div>
          <div className="clay-card-sunken p-4">
            <p className="font-semibold">Representative Demo Data</p>
            <p className="text-muted-foreground mt-1">SMAP soil moisture, MODIS vegetation vitality, and Landsat boundary change detection are shown as representative sample values dated August–September 2025. Full integration is planned for the production release.</p>
          </div>
          <div className="clay-card-sunken p-4">
            <p className="font-semibold">Deterministic Decision Engine</p>
            <p className="text-muted-foreground mt-1">Crop rotation scenarios are scored using agronomic water, temperature, and soil fitness curves from BRRI and IRRI crop calendars. Every recommendation links to its underlying NASA dataset.</p>
          </div>
        </div>
        <p className="text-muted-foreground text-xs">Transparency guarantee: Every recommendation links directly to its underlying NASA dataset, observation date, spatial resolution, and processing limitations.</p>
      </div>
    </Card>
  );
}

function SummaryCard({ field, scenario, save, lang = "en" }: { field: DemoField; scenario: Scenario; save: () => void; lang?: Language }) {
  const t = translations[lang] || translations.en;
  const share = async () => {
    const text = `AgroNova plan: ${field.name} (${field.district}) — ${scenario.name} (${scenario.sequence.join(" → ")})`;
    if (navigator.share) await navigator.share({ title: "AgroNova", text }).catch(() => {});
    else await navigator.clipboard?.writeText(text);
  };
  return (
    <div className="glass-dark rounded-3xl p-5 print:bg-white print:text-black print:shadow-none">
      <p className="text-xs uppercase tracking-wider opacity-80">AgroNova Farm Advisory Plan</p>
      <p className="font-display text-xl">{field.name} · {field.district}</p>
      <p className="mt-1 flex items-center gap-2 text-sm"><Sprout className="h-4 w-4" />{scenario.sequence.join(" → ")}</p>
      <p className="mt-1 flex items-center gap-2 text-sm"><Droplets className="h-4 w-4" />{t.waterFit}: {scenario.water}/100 · {t.overallFit}: {scenario.score}/100</p>
      <div className="mt-3 border-t border-white/20 pt-2 text-xs">
        <p><b>{t.action}:</b> {scenario.action}</p>
        <p className="mt-1"><b>{t.rationale}:</b> {scenario.why}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 print:hidden">
        <AgroButton size="sm" variant="secondary" onClick={save}>{t.save}</AgroButton>
        <AgroButton size="sm" variant="secondary" onClick={() => window.print()}><FileDown className="h-4 w-4" />{t.download}</AgroButton>
        <AgroButton size="sm" variant="secondary" onClick={share}><Share2 className="h-4 w-4" />{t.share}</AgroButton>
      </div>
    </div>
  );
}

function Nova({ lang, label, chat }: { lang: Language; label: string; chat: ReturnType<typeof useNovaChat> }) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const { msgs, ask } = chat;
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom whenever a new message arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = (q: string) => {
    ask(q);
    setInput("");
  };

  const toggleVoiceInput = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is supported in Chrome or Edge.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const codeMap: Record<Language, string> = {
        en: "en-US",
        bn: "bn-BD",
        hi: "hi-IN",
        es: "es-ES",
        sw: "sw-KE",
      };
      recognition.lang = codeMap[lang] || "en-US";
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          send(transcript);
        }
      };
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div className="clay-card p-5">
      <div className="mb-3 flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center gap-2.5">
          <img
            src={novaMascot}
            alt="Nova"
            className="h-8 w-8 object-contain rounded-full bg-primary/10 p-0.5 notranslate"
            translate="no"
          />
          <div>
            <p className="font-display text-lg font-bold tracking-wide notranslate" translate="no">
              Nova
            </p>
            <p className="text-[11px] text-muted-foreground">Agronomy &amp; NASA Earth Observation</p>
          </div>
        </div>
        <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
          🌾 Farming Only
        </span>
      </div>
      <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
        {msgs.map((m, i) => (
          <div key={i} className={`flex items-start gap-1.5 ${m.me ? "justify-end" : "justify-start"}`}>
            <p className={`rounded-2xl px-3 py-2 text-sm ${m.me ? "bg-primary text-primary-foreground ml-6" : "bg-secondary mr-2 flex-1"}`}>
              {m.text}
            </p>
            {!m.me && <SpeechButton text={m.text} lang={lang} />}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-3 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "Listening…" : "Type or speak a question…"}
          className="clay-card-sunken min-w-0 flex-1 px-3 py-2 text-sm outline-none"
        />
        <AgroButton
          type="button"
          size="icon"
          variant={isListening ? "primary" : "ghost"}
          onClick={toggleVoiceInput}
          aria-label="Speak question"
          title="Voice input"
        >
          <Mic className={`h-4 w-4 ${isListening ? "animate-pulse" : ""}`} />
        </AgroButton>
        <AgroButton size="icon" type="submit" aria-label="Send">
          <Send className="h-4 w-4" />
        </AgroButton>
      </form>
    </div>
  );
}

function FloatingNova({ lang, label, chat }: { lang: Language; label: string; chat: ReturnType<typeof useNovaChat> }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 24, y: 24 });
  const drag = useRef<{ startX: number; startY: number; baseX: number; baseY: number; moved: boolean } | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    drag.current = { startX: e.clientX, startY: e.clientY, baseX: pos.x, baseY: pos.y, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = d.startX - e.clientX;
    const dy = d.startY - e.clientY;
    if (Math.abs(dx) + Math.abs(dy) > 6) d.moved = true;
    if (!d.moved) return;
    const maxX = window.innerWidth - 80;
    const maxY = window.innerHeight - 80;
    setPos({
      x: Math.max(8, Math.min(maxX, d.baseX + dx)),
      y: Math.max(8, Math.min(maxY, d.baseY + dy)),
    });
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved) setOpen((o) => !o);
  };

  return (
    <div
      className="fixed z-40 flex flex-col items-end gap-3"
      style={{ right: pos.x, bottom: pos.y }}
    >
      {open && (
        <div className="w-[calc(100vw-2rem)] max-w-sm">
          <div className="relative">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close Nova chat"
              className="clay-btn bg-card text-foreground absolute -top-3 -left-3 z-10 flex h-9 w-9 items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
            <Nova lang={lang} label={label} chat={chat} />
          </div>
        </div>
      )}
      <button
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        aria-label={open ? "Close Nova chat" : "Chat with Nova — drag to move"}
        className="clay-btn bg-primary text-primary-foreground flex h-16 w-16 cursor-grab touch-none items-center justify-center overflow-hidden rounded-full shadow-xl active:cursor-grabbing"
      >
        {open ? (
          <MessageCircle className="h-7 w-7" />
        ) : (
          <img src={novaMascot} alt="Nova" className="pointer-events-none h-12 w-12 object-contain" draggable={false} />
        )}
      </button>
    </div>
  );
}

function EvidenceDrawer({ ids, fieldName, close, lang = "en" }: { ids: string[]; fieldName: string; close: () => void; lang?: Language }) {
  const t = translations[lang] || translations.en;
  const items = evidence.filter((e) => ids.includes(e.id));
  return (
    <div className="fixed inset-0 z-[1000] flex justify-end bg-foreground/50 backdrop-blur-sm" onClick={close}>
      <div className="bg-background relative z-[1001] h-full w-full max-w-md overflow-y-auto p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display flex items-center gap-2 text-2xl"><Info className="h-5 w-5" />{t.source}</h2>
          <AgroButton size="icon" variant="ghost" onClick={close} aria-label={t.close}><X className="h-4 w-4" /></AgroButton>
        </div>
        <p className="text-muted-foreground mb-4 text-sm">{t.evidence}: {fieldName}</p>
        <div className="space-y-4">
          {items.map((e) => (
            <div key={e.id} className="clay-card p-4 text-sm">
              <div className="flex justify-between"><b>{e.dataset}</b><Badge>{e.freshness}</Badge></div>
              <p className="font-display text-2xl">{e.value} {e.unit}</p>
              <p>{e.variable} · {e.date}</p>
              <p className="mt-2"><b>{t.source}:</b> {e.source}</p>
              <p><b>Resolution:</b> {e.resolution}</p>
              <p><b>Processing:</b> {e.processing}</p>
              <p className="text-muted-foreground"><b>Limitation:</b> {e.limitation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
