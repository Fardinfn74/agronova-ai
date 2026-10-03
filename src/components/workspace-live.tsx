import { useEffect, useState, type FormEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CloudRain,
  Droplets,
  ExternalLink,
  KeyRound,
  Languages,
  Plus,
  Sparkles,
  Thermometer,
  UserRound,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { getPowerReadings, type PowerReading } from "@/lib/nasa-power";
import { demoFarmer, translations, type DemoField, type Language } from "@/lib/agronova-demo";
import { AgroButton } from "@/components/agronova-button";
import { getGeminiApiKey, setGeminiApiKey, testGeminiApiKey } from "@/lib/gemini";

const input = "clay-card-sunken mt-1 w-full px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-primary";

const languageOptions: { code: Language; name: string; native: string; flag: string }[] = [
  { code: "en", name: "English", native: "English", flag: "🇬🇧" },
  { code: "bn", name: "Bengali", native: "বাংলা", flag: "🇧🇩" },
  { code: "hi", name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸" },
  { code: "sw", name: "Swahili", native: "Kiswahili", flag: "🇰🇪" },
];

export function GeminiApiKeyCard() {
  const [key, setKey] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setKey(getGeminiApiKey());
  }, []);

  const handleSave = () => {
    setGeminiApiKey(key.trim());
    setSavedSuccess(true);
    setTestResult(null);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testGeminiApiKey(key.trim());
    setTestResult(result);
    setTesting(false);
  };

  const handleClear = () => {
    setKey("");
    setGeminiApiKey("");
    setTestResult(null);
    setSavedSuccess(false);
  };

  const hasKey = Boolean(key.trim());

  return (
    <section className="clay-card p-5 sm:p-6 mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
          <h3 className="font-display text-xl">Google Gemini AI Integration</h3>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
            hasKey
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
              : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
          }`}
        >
          {hasKey ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Gemini Ready</span>
            </>
          ) : (
            <>
              <KeyRound className="h-3.5 w-3.5" />
              <span>Key Required (Free)</span>
            </>
          )}
        </span>
      </div>

      <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
        AgroNova uses <strong>Google Gemini 1.5 Flash</strong> (100% free tier) to power Nova AI Chat,
        Crop Doctor leaf image pathology, and climate-aware crop rotation recommendations.
      </p>

      <div className="clay-card-sunken p-4 rounded-xl space-y-3 mb-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Gemini API Key
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="password"
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              setTestResult(null);
            }}
            placeholder="AIzaSy..."
            className="clay-card-sunken flex-1 px-3 py-2 text-sm rounded-lg outline-none font-mono focus:ring-2 focus:ring-primary"
          />
          <div className="flex gap-2">
            <AgroButton
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSave}
              className="flex items-center gap-1.5"
            >
              <KeyRound className="h-4 w-4" />
              Save Key
            </AgroButton>
            <AgroButton
              type="button"
              variant="secondary"
              size="sm"
              disabled={testing || !key.trim()}
              onClick={handleTest}
              className="flex items-center gap-1.5"
            >
              {testing ? "Testing..." : "Test Connection"}
            </AgroButton>
            {hasKey && (
              <AgroButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-xs"
              >
                Clear
              </AgroButton>
            )}
          </div>
        </div>

        {savedSuccess && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Key saved successfully to local workspace.
          </p>
        )}

        {testResult && (
          <div
            className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
              testResult.ok
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                : "bg-destructive/10 text-destructive border border-destructive/20"
            }`}
          >
            {testResult.ok ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{testResult.ok ? "Success!" : "Connection Failed"}</p>
              <p className="mt-0.5">{testResult.message}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground pt-1">
        <span>Don't have a key yet? Free keys take 30 seconds to generate.</span>
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
        >
          <span>Get Free Key at Google AI Studio</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </section>
  );
}

export function LanguageSettingsCard({
  lang = "en",
  onLanguageChange,
}: {
  lang?: Language | undefined;
  onLanguageChange?: ((lang: Language) => void) | undefined;
}) {
  const t = translations[lang] || translations.en;
  const currentLang = languageOptions.find((l) => l.code === lang) || languageOptions[0]!;

  const cycleLang = () => {
    const idx = languageOptions.findIndex((l) => l.code === lang);
    const next = languageOptions[(idx + 1) % languageOptions.length]!.code;
    onLanguageChange?.(next);
  };

  return (
    <section className="clay-card p-5 sm:p-6 mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Languages className="h-5 w-5 text-primary" />
          <h3 className="font-display text-xl">{t.languageLabel}</h3>
        </div>
        <AgroButton
          type="button"
          size="sm"
          variant="secondary"
          onClick={cycleLang}
          className="flex items-center gap-2"
          title="Click to switch to next language"
        >
          <Languages className="h-4 w-4 text-primary" />
          <span>Change Language: <b>{currentLang.flag} {currentLang.native}</b> →</span>
        </AgroButton>
      </div>
      <p className="text-muted-foreground text-sm mb-4">
        {t.languageHint}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {languageOptions.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => onLanguageChange?.(l.code)}
            className={`clay-btn flex items-center justify-between p-3.5 transition-all text-left ${
              lang === l.code
                ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-2 ring-offset-background font-semibold"
                : "bg-card hover:bg-secondary/70"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{l.flag}</span>
              <div>
                <p className="text-sm font-semibold">{l.native}</p>
                <p className="text-xs opacity-75">{l.name}</p>
              </div>
            </div>
            {lang === l.code && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-white/20">✓</span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

function Shell({ title, kicker, children }: { title: string; kicker?: string; children: React.ReactNode }) {
  return (
    <section className="clay-card p-5 sm:p-6">
      {kicker && <p className="text-primary text-xs font-semibold uppercase tracking-wider">{kicker}</p>}
      <h2 className="font-display mb-4 text-2xl">{title}</h2>
      {children}
    </section>
  );
}

function Rows({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="grid gap-2 sm:grid-cols-2">
      {rows.map(([k, v]) => (
        <div key={k} className="clay-card-sunken p-3">
          <dt className="text-muted-foreground text-xs">{k}</dt>
          <dd className="font-semibold">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function DemoProfile({
  lang = "en",
  onLanguageChange,
}: {
  lang?: Language | undefined;
  onLanguageChange?: ((lang: Language) => void) | undefined;
}) {
  const t = translations[lang] || translations.en;
  return (
    <div>
      <Shell kicker={t.profile} title={t.profileTitle}>
        <div className="mb-4 flex items-center gap-3">
          <div className="clay-chip bg-primary text-primary-foreground flex h-14 w-14 items-center justify-center"><UserRound /></div>
          <div><p className="font-display text-xl">{demoFarmer.name}</p><p className="text-muted-foreground text-sm">{demoFarmer.village}</p></div>
        </div>
        <Rows rows={[
          ["District", demoFarmer.district],
          ["Phone", demoFarmer.phone],
          ["Farming since", demoFarmer.since],
          ["Total land", demoFarmer.land],
          ["Main crops", demoFarmer.crops],
          [t.languageLabel, languageOptions.find((l) => l.code === lang)?.native ?? demoFarmer.language],
        ]} />
        <p className="text-muted-foreground mt-4 text-xs">This is a sample farmer for the demo. Sign up to create your own profile.</p>
      </Shell>
      <GeminiApiKeyCard />
      <LanguageSettingsCard lang={lang} onLanguageChange={onLanguageChange} />
    </div>
  );
}

export function LiveProfile({
  profile,
  fieldCount,
  onSaved,
  lang = "en",
  onLanguageChange,
}: {
  profile: { display_name: string; district: string; email: string } | null;
  fieldCount: number;
  onSaved: () => void;
  lang?: Language | undefined;
  onLanguageChange?: ((lang: Language) => void) | undefined;
}) {
  const t = translations[lang] || translations.en;
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("");
  const [msg, setMsg] = useState("");
  useEffect(() => { setName(profile?.display_name ?? ""); setDistrict(profile?.district ?? ""); }, [profile]);
  async function save(e: FormEvent) {
    e.preventDefault();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    const { error } = await supabase.from("profiles").upsert({ id: data.user.id, display_name: name.trim().slice(0, 100), district: district.trim().slice(0, 100), updated_at: new Date().toISOString() });
    setMsg(error ? error.message : "Profile saved.");
    if (!error) onSaved();
  }
  return (
    <div>
      <Shell kicker="My account" title={t.profileTitle}>
        <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold">Name<input className={input} value={name} maxLength={100} onChange={(e) => setName(e.target.value)} /></label>
          <label className="text-sm font-semibold">District<input className={input} value={district} maxLength={100} onChange={(e) => setDistrict(e.target.value)} /></label>
          <p className="text-muted-foreground text-sm">Email: {profile?.email ?? "…"} · Fields: {fieldCount}</p>
          <AgroButton type="submit">Save profile</AgroButton>
          {msg && <p role="status" className="text-primary text-sm sm:col-span-2">{msg}</p>}
        </form>
      </Shell>
      <GeminiApiKeyCard />
      <LanguageSettingsCard lang={lang} onLanguageChange={onLanguageChange} />
    </div>
  );
}


export function AddFieldForm({ onAdded, initialCoords }: { onAdded: () => void; initialCoords?: [number, number] | undefined }) {
  const [f, setF] = useState({
    name: "",
    district: "",
    latitude: initialCoords ? String(initialCoords[0]) : "",
    longitude: initialCoords ? String(initialCoords[1]) : "",
    crop: "Rice",
    season: "Aman",
    water: "Moderate",
    priority: "Save water",
    size_ha: "1",
  });
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (initialCoords) {
      setF((curr) => ({
        ...curr,
        latitude: String(initialCoords[0]),
        longitude: String(initialCoords[1]),
      }));
      setOpen(true);
    }
  }, [initialCoords]);

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  async function submit(e: FormEvent) {
    e.preventDefault(); setErr("");
    const lat = Number(f.latitude), lon = Number(f.longitude), size = Number(f.size_ha);
    if (!f.name.trim() || isNaN(lat) || lat < -90 || lat > 90 || isNaN(lon) || lon < -180 || lon > 180 || !(size > 0)) { setErr("Please enter a name, valid coordinates and a size above 0."); return; }
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    const { error } = await supabase.from("farmer_fields").insert({ owner_id: data.user.id, name: f.name.trim().slice(0, 100), district: f.district.trim(), latitude: lat, longitude: lon, crop: f.crop.trim(), season: f.season.trim(), water: f.water, priority: f.priority, size_ha: size });
    if (error) { setErr(error.message); return; }
    setF({ ...f, name: "", latitude: "", longitude: "" }); setOpen(false); onAdded();
  }
  const useMyLocation = () => navigator.geolocation?.getCurrentPosition((p) => setF((x) => ({ ...x, latitude: p.coords.latitude.toFixed(4), longitude: p.coords.longitude.toFixed(4) })));
  if (!open) return <AgroButton onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add a field</AgroButton>;
  return (
    <Shell kicker="New field" title="Add your field">
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold">Field name<input required className={input} value={f.name} onChange={set("name")} /></label>
        <label className="text-sm font-semibold">District<input className={input} value={f.district} onChange={set("district")} /></label>
        <label className="text-sm font-semibold">Latitude<input required className={input} value={f.latitude} onChange={set("latitude")} placeholder="24.37" /></label>
        <label className="text-sm font-semibold">Longitude<input required className={input} value={f.longitude} onChange={set("longitude")} placeholder="88.60" /></label>
        <label className="text-sm font-semibold">Current crop<input className={input} value={f.crop} onChange={set("crop")} /></label>
        <label className="text-sm font-semibold">Season<input className={input} value={f.season} onChange={set("season")} placeholder="Aman" /></label>
        <label className="text-sm font-semibold">Water access<select className={input} value={f.water} onChange={set("water")}><option>Low</option><option>Moderate</option><option>Reliable</option></select></label>
        <label className="text-sm font-semibold">Size (ha)<input className={input} value={f.size_ha} onChange={set("size_ha")} /></label>
        <AgroButton type="button" variant="ghost" onClick={useMyLocation}>Use my location</AgroButton>
        <div className="flex gap-2"><AgroButton type="submit">Save field</AgroButton><AgroButton type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</AgroButton></div>
        {err && <p role="alert" className="text-destructive text-sm sm:col-span-2">{err}</p>}
      </form>
    </Shell>
  );
}

export function LiveWeather({ field }: { field: DemoField }) {
  const [data, setData] = useState<PowerReading[] | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    const c = new AbortController(); setData(null); setErr("");
    getPowerReadings(field.coordinates[0], field.coordinates[1], c.signal).then(setData).catch((e) => { if (!c.signal.aborted) setErr(e instanceof Error ? e.message : "Could not load NASA data."); });
    return () => c.abort();
  }, [field.coordinates[0], field.coordinates[1]]);
  const last = data?.[data.length - 1];
  const rain = data?.reduce((s, r) => s + (r.rain ?? 0), 0) ?? 0;
  const avg = (k: "temperature" | "humidity") => { const v = (data ?? []).map((r) => r[k]).filter((n): n is number => n != null); return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : "—"; };
  const chart = (data ?? []).map((r) => ({ day: `${r.date.slice(6)}/${r.date.slice(4, 6)}`, rain: r.rain ?? 0, temp: r.temperature }));
  return (
    <Shell kicker="Live · NASA POWER" title={`Field health — ${field.name}`}>
      {err && <p role="alert" className="text-destructive">{err}</p>}
      {!data && !err && <p className="text-muted-foreground">Loading the last 30 days of NASA observations…</p>}
      {data && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="clay-card-sunken p-4"><Thermometer className="text-primary h-5 w-5" /><p className="text-muted-foreground mt-1 text-xs">Avg temperature</p><p className="font-display text-2xl">{avg("temperature")} °C</p></div>
            <div className="clay-card-sunken p-4"><CloudRain className="text-primary h-5 w-5" /><p className="text-muted-foreground mt-1 text-xs">Rain, 30 days</p><p className="font-display text-2xl">{rain.toFixed(0)} mm</p></div>
            <div className="clay-card-sunken p-4"><Droplets className="text-primary h-5 w-5" /><p className="text-muted-foreground mt-1 text-xs">Avg humidity</p><p className="font-display text-2xl">{avg("humidity")} %</p></div>
          </div>
          <div className="mt-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="day" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Area dataKey="rain" name="Rain (mm)" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} /></AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-muted-foreground mt-3 text-xs">Latest day: {last?.date.slice(0, 4)}-{last?.date.slice(4, 6)}-{last?.date.slice(6)}. NASA POWER is regional (~50 km) and a few days delayed — not a field-level measurement.</p>
        </>
      )}
    </Shell>
  );
}
