import { useMemo, useState, useRef } from "react";
import {
  cropDiseases,
  type CropDisease,
  type Language,
} from "@/lib/agronova-demo";
import {
  Stethoscope,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Satellite,
  Sparkles,
  Camera,
  Upload,
  RefreshCw,
  Copy,
  Check,
  X,
  Volume2,
} from "lucide-react";
import { diagnoseCropImage, getGeminiApiKey } from "@/lib/gemini";
import { AgroButton } from "@/components/agronova-button";

const severityColor: Record<CropDisease["severity"], string> = {
  High: "bg-destructive/15 text-destructive border-destructive/30",
  Medium: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  Low: "bg-primary/10 text-primary border-primary/30",
};

const causeColor: Record<CropDisease["cause"], string> = {
  Fungal: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  Bacterial: "bg-red-500/15 text-red-700 dark:text-red-400",
  Viral: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
  Nutrient: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  Pest: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
};

function DiseaseCard({ disease, defaultOpen = false }: { disease: CropDisease; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const causeEmoji =
    disease.cause === "Fungal" ? "🍄" :
    disease.cause === "Bacterial" ? "🦠" :
    disease.cause === "Viral" ? "⚠️" :
    disease.cause === "Pest" ? "🐛" : "🧪";

  return (
    <div className={`clay-card border ${severityColor[disease.severity]} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{causeEmoji}</span>
          <div>
            <p className="font-semibold">{disease.name}</p>
            <div className="mt-0.5 flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${causeColor[disease.cause]}`}>
                {disease.cause}
              </span>
              <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${severityColor[disease.severity]}`}>
                {disease.severity} risk
              </span>
            </div>
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 opacity-60" /> : <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />}
      </button>

      {open && (
        <div className="space-y-4 border-t border-current/10 p-4 pt-3">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-60">What to look for</p>
            <ul className="space-y-1">
              {disease.visualCues.map((cue) => (
                <li key={cue} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 shrink-0 text-primary">•</span>
                  {cue}
                </li>
              ))}
            </ul>
          </div>

          <div className="clay-card-sunken rounded-xl p-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-60">Triggering conditions</p>
            <p className="text-sm">{disease.conditions}</p>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide opacity-60">🩺 Treatment now</p>
            <p className="text-sm">{disease.treatment}</p>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide opacity-60">🛡️ Prevention</p>
            <p className="text-sm">{disease.prevention}</p>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-primary/8 p-3 text-sm text-primary">
            <Satellite className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{disease.nasaLink}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Pre-packaged realistic sample leaf illustrations rendered to clean data URLs for immediate testing
const SAMPLE_LEAF_SAMPLES = [
  {
    name: "Tomato Early Blight",
    crop: "Tomato",
    symptoms: "Dark brown concentric target rings on bottom leaves with yellowing halos",
    previewBg: "from-amber-700/30 to-emerald-950/40",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
      <defs>
        <radialGradient id="ring" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#3d2008"/>
          <stop offset="40%" stop-color="#6e380f"/>
          <stop offset="70%" stop-color="#997014"/>
          <stop offset="100%" stop-color="#2d6a2f"/>
        </radialGradient>
      </defs>
      <rect width="300" height="300" fill="#1b361a"/>
      <path d="M150 20 C220 80, 240 220, 150 280 C60 220, 80 80, 150 20 Z" fill="#387a38" stroke="#1f4c1f" stroke-width="4"/>
      <path d="M150 25 L150 275 M150 90 L200 65 M150 90 L100 65 M150 160 L220 135 M150 160 L80 135 M150 220 L210 205 M150 220 L90 205" stroke="#255925" stroke-width="3" fill="none"/>
      <circle cx="160" cy="140" r="38" fill="url(#ring)"/>
      <circle cx="160" cy="140" r="26" fill="none" stroke="#2d1706" stroke-width="3"/>
      <circle cx="160" cy="140" r="14" fill="none" stroke="#2d1706" stroke-width="2"/>
      <circle cx="120" cy="200" r="22" fill="url(#ring)"/>
      <circle cx="190" cy="85" r="18" fill="url(#ring)"/>
    </svg>`,
  },
  {
    name: "Rice Blast Lesions",
    crop: "Rice",
    symptoms: "Spindle-shaped diamond lesions on paddy leaves with grey centers and brown borders",
    previewBg: "from-yellow-700/30 to-green-950/40",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
      <rect width="300" height="300" fill="#172b15"/>
      <path d="M150 15 C190 70, 195 240, 150 285 C105 240, 110 70, 150 15 Z" fill="#467c3b" stroke="#244b1c" stroke-width="4"/>
      <line x1="150" y1="15" x2="150" y2="285" stroke="#2f5e25" stroke-width="3"/>
      <!-- Diamond lesions -->
      <path d="M150 110 L165 130 L150 150 L135 130 Z" fill="#c4b59d" stroke="#5a2b0c" stroke-width="3"/>
      <path d="M150 180 L168 205 L150 230 L132 205 Z" fill="#b8a88f" stroke="#5a2b0c" stroke-width="4"/>
      <path d="M130 70 L140 85 L130 100 L120 85 Z" fill="#b8a88f" stroke="#5a2b0c" stroke-width="2"/>
    </svg>`,
  },
  {
    name: "Wheat Stem / Leaf Rust",
    crop: "Wheat",
    symptoms: "Orange-brown powdery rust pustules erupting across upper leaf blade",
    previewBg: "from-orange-800/30 to-amber-950/40",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
      <rect width="300" height="300" fill="#1b2e17"/>
      <path d="M150 20 C180 80, 180 230, 150 280 C120 230, 120 80, 150 20 Z" fill="#5c8a3c" stroke="#2e4e19" stroke-width="4"/>
      <line x1="150" y1="20" x2="150" y2="280" stroke="#3b6623" stroke-width="2"/>
      <!-- Rust spots -->
      <ellipse cx="145" cy="90" rx="6" ry="12" fill="#c45c16"/>
      <ellipse cx="158" cy="115" rx="5" ry="14" fill="#d96a1a"/>
      <ellipse cx="140" cy="140" rx="7" ry="15" fill="#c45c16"/>
      <ellipse cx="155" cy="170" rx="6" ry="13" fill="#e07524"/>
      <ellipse cx="145" cy="205" rx="5" ry="10" fill="#c45c16"/>
      <ellipse cx="156" cy="225" rx="7" ry="12" fill="#d96a1a"/>
    </svg>`,
  },
];

async function svgToPngBase64(svg: string): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve("");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve("");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    img.onerror = () => resolve("");
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });
}

export function CropDoctor({ lang }: { lang: Language }) {
  const [activeMode, setActiveMode] = useState<"database" | "gemini">("gemini");

  // Database search state
  const [selectedCrop, setSelectedCrop] = useState("");
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);

  // Gemini Vision state
  const [visionCrop, setVisionCrop] = useState("Tomato");
  const [visionSymptoms, setVisionSymptoms] = useState("Brown circular spots on lower leaves with yellow halo");
  const [imageDataUrl, setImageDataUrl] = useState<string>("");
  const [imageMime, setImageMime] = useState<string>("image/jpeg");
  const [analyzing, setAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const cropNames = useMemo(
    () => ["All crops", ...Array.from(new Set(cropDiseases.flatMap((d) => d.crops)))],
    [],
  );

  const results = useMemo<CropDisease[]>(() => {
    if (!searched && !query.trim() && !selectedCrop) return [];
    const q = query.toLowerCase();
    return cropDiseases.filter((d) => {
      const cropMatch =
        !selectedCrop || selectedCrop === "All crops" ||
        d.crops.some((c) => c.toLowerCase() === selectedCrop.toLowerCase());
      if (!q) return cropMatch;
      return (
        cropMatch &&
        (d.name.toLowerCase().includes(q) ||
          d.symptoms.toLowerCase().includes(q) ||
          d.visualCues.some((v) => v.toLowerCase().includes(q)) ||
          d.cause.toLowerCase().includes(q) ||
          d.treatment.toLowerCase().includes(q))
      );
    });
  }, [selectedCrop, query, searched]);

  const showResults = searched || (selectedCrop !== "" && selectedCrop !== "All crops");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMime(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") {
        setImageDataUrl(result);
        setAiReport("");
      }
    };
    reader.readAsDataURL(file);
  };

  const loadSample = async (sample: typeof SAMPLE_LEAF_SAMPLES[0]) => {
    setVisionCrop(sample.crop);
    setVisionSymptoms(sample.symptoms);
    setAiReport("");
    const base64 = await svgToPngBase64(sample.svg);
    if (base64) {
      setImageDataUrl(base64);
      setImageMime("image/jpeg");
    }
  };

  const handleRunAiDiagnosis = async () => {
    if (!imageDataUrl) {
      // Auto-load first sample if farmer hasn't picked one
      await loadSample(SAMPLE_LEAF_SAMPLES[0]!);
    }

    setAnalyzing(true);
    setAiReport("");

    // Read latest image data URL or wait if loading
    const currentData = imageDataUrl || (await svgToPngBase64(SAMPLE_LEAF_SAMPLES[0]!.svg));
    const res = await diagnoseCropImage(currentData, imageMime, visionCrop, visionSymptoms, lang);

    if (res.success && res.text) {
      setAiReport(res.text);
    } else {
      setAiReport(`⚠️ AI Diagnosis Note:\n${res.error || "Could not complete diagnosis. Please verify your Gemini API key in Profile settings."}`);
    }
    setAnalyzing(false);
  };

  const copyReport = () => {
    if (!aiReport) return;
    navigator.clipboard.writeText(aiReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const speakReport = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = aiReport.replace(/[*#_`]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const codeMap: Record<Language, string> = {
      en: "en-US",
      bn: "bn-BD",
      hi: "hi-IN",
      es: "es-ES",
      sw: "sw-KE",
    };
    utterance.lang = codeMap[lang] || "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const hasApiKey = Boolean(getGeminiApiKey());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="clay-chip flex h-11 w-11 items-center justify-center bg-destructive/20 text-destructive">
            <Stethoscope className="h-6 w-6" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl font-bold">Crop Doctor</h3>
              <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                <Sparkles className="h-3 w-3" />
                Gemini Vision 1.5
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              Instant plant pathology diagnosis via leaf photo analysis &amp; verified agronomic database.
            </p>
          </div>
        </div>

        {/* Mode selector pills */}
        <div className="flex gap-1.5 rounded-xl bg-secondary/80 p-1">
          <button
            type="button"
            onClick={() => setActiveMode("gemini")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeMode === "gemini"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>AI Leaf Vision</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("database")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeMode === "database"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Stethoscope className="h-3.5 w-3.5" />
            <span>Disease Library</span>
          </button>
        </div>
      </div>

      {/* GEMINI VISION LAB MODE */}
      {activeMode === "gemini" && (
        <div className="space-y-5">
          <div className="clay-card-sunken flex flex-wrap items-center justify-between gap-3 rounded-xl p-3.5 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>
                <strong>Google Gemini 1.5 Flash Vision:</strong> Upload a photo of an unhealthy leaf to detect fungal, bacterial, viral or nutrient stress.
              </span>
            </div>
            {!hasApiKey && (
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-amber-700 dark:text-amber-300 font-medium">
                Tip: Enter your free API key in Profile to enable live AI vision
              </span>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left column: Photo Upload & Input */}
            <div className="space-y-4 lg:col-span-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  1. Leaf Photo (Camera or Upload)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {imageDataUrl ? (
                  <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-3 shadow-inner">
                    <img
                      src={imageDataUrl}
                      alt="Uploaded leaf"
                      className="h-48 w-full rounded-xl object-contain bg-black/10"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageDataUrl("");
                        setAiReport("");
                      }}
                      className="absolute right-5 top-5 rounded-full bg-background/90 p-1.5 text-foreground shadow hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      Photo loaded and ready for analysis
                    </p>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="clay-card-sunken flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 p-6 text-center hover:border-primary transition-colors"
                  >
                    <div className="clay-chip mb-2 flex h-12 w-12 items-center justify-center bg-primary/10 text-primary">
                      <Camera className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold">Click to upload leaf photo</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Supports JPG, PNG, WEBP or mobile camera snap
                    </p>
                  </div>
                )}
              </div>

              {/* Sample images quick-picker */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Or Test with Sample Diseased Leaves:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {SAMPLE_LEAF_SAMPLES.map((sample) => (
                    <button
                      key={sample.name}
                      type="button"
                      onClick={() => loadSample(sample)}
                      className="clay-card hover:border-primary p-2 text-left transition-all group"
                    >
                      <div className={`h-12 w-full rounded-lg bg-gradient-to-br ${sample.previewBg} flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform`}>
                        <span className="text-lg">🍃</span>
                      </div>
                      <p className="mt-1.5 text-[11px] font-semibold leading-tight line-clamp-1">{sample.name}</p>
                      <p className="text-[10px] text-muted-foreground">{sample.crop}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Crop & symptoms form */}
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    2. Crop Name
                  </label>
                  <input
                    type="text"
                    value={visionCrop}
                    onChange={(e) => setVisionCrop(e.target.value)}
                    placeholder="e.g. Tomato, Rice, Potato, Wheat"
                    className="clay-card-sunken w-full rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    3. Observed Symptoms / Notes
                  </label>
                  <textarea
                    rows={2}
                    value={visionSymptoms}
                    onChange={(e) => setVisionSymptoms(e.target.value)}
                    placeholder="Describe spots, wilting, curling, discoloration..."
                    className="clay-card-sunken w-full rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </div>

              {/* Action Button */}
              <AgroButton
                type="button"
                variant="primary"
                size="md"
                disabled={analyzing}
                onClick={handleRunAiDiagnosis}
                className="w-full flex items-center justify-center gap-2 py-3 shadow-lg"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Gemini Pathologist Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>✨ Diagnose Leaf with Gemini Vision</span>
                  </>
                )}
              </AgroButton>
            </div>

            {/* Right column: AI Diagnostic Report */}
            <div className="lg:col-span-7">
              <div className="clay-card flex h-full flex-col p-5 sm:p-6">
                <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    <h4 className="font-display font-semibold">Gemini Plant Pathology Report</h4>
                  </div>
                  {aiReport && (
                    <div className="flex items-center gap-1.5">
                      <AgroButton
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={speakReport}
                        title="Read diagnosis aloud"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </AgroButton>
                      <AgroButton
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={copyReport}
                        title="Copy to clipboard"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        <span className="text-xs">{copied ? "Copied" : "Copy"}</span>
                      </AgroButton>
                    </div>
                  )}
                </div>

                {analyzing ? (
                  <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
                    <div className="relative mb-4">
                      <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                      <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
                    </div>
                    <p className="font-semibold">Examining cellular leaf pathology...</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                      Consulting Gemini 1.5 Flash multimodal vision against agricultural knowledge base
                    </p>
                  </div>
                ) : aiReport ? (
                  <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                    <div className="clay-card-sunken rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                      {aiReport}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span>Always cross-check severe field outbreaks with your district agricultural extension officer.</span>
                    </div>
                  </div>
                ) : (
                  <div className="clay-card-sunken flex flex-1 flex-col items-center justify-center rounded-xl p-8 text-center text-muted-foreground">
                    <div className="clay-chip mb-3 flex h-14 w-14 items-center justify-center bg-primary/10 text-primary">
                      <Sparkles className="h-7 w-7" />
                    </div>
                    <h5 className="font-semibold text-foreground">No Diagnosis Yet</h5>
                    <p className="mt-1 text-xs max-w-sm">
                      Upload a photo or pick a sample leaf on the left, then click <strong>"Diagnose Leaf with Gemini Vision"</strong> to receive an immediate plant pathology evaluation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DATABASE LIBRARY MODE */}
      {activeMode === "database" && (
        <div className="space-y-5">
          {/* Disclaimer */}
          <div className="clay-card-sunken flex items-start gap-2 rounded-xl p-3 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <p className="text-muted-foreground">
              Decision-support reference based on agronomy. Confirm critical diagnoses with your local agricultural extension office.
            </p>
          </div>

          {/* Filters */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Your crop</label>
              <select
                value={selectedCrop}
                onChange={(e) => { setSelectedCrop(e.target.value); setSearched(true); }}
                className="clay-card-sunken w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select crop…</option>
                {cropNames.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Describe symptoms</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") setSearched(true); }}
                placeholder="yellow leaves, brown spots, curling…"
                className="clay-card-sunken w-full rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Quick symptom tags */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quick tags</p>
            <div className="flex flex-wrap gap-2">
              {["yellow leaves", "brown spots", "curling", "white patches", "rotting", "stunted growth", "dead shoots", "lesions"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => { setQuery(tag); setSearched(true); }}
                  className={`clay-chip rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    query === tag
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-primary/20"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSearched(true)}
              className="clay-btn bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Diagnose
            </button>
            {(searched || query || selectedCrop) && (
              <button
                type="button"
                onClick={() => { setQuery(""); setSelectedCrop(""); setSearched(false); }}
                className="clay-btn bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground"
              >
                Clear
              </button>
            )}
          </div>

          {/* Results or browse all */}
          {showResults ? (
            <div className="space-y-3">
              {results.length === 0 ? (
                <div className="clay-card-sunken flex items-center gap-3 rounded-xl p-5">
                  <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold">No matching conditions found</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Try different keywords or select another crop. If symptoms persist, contact your extension officer.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-muted-foreground">
                    {results.length} possible {results.length === 1 ? "condition" : "conditions"} found
                  </p>
                  {results.map((d, i) => (
                    <DiseaseCard key={d.id} disease={d} defaultOpen={i === 0} />
                  ))}
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Browse all conditions</p>
              {cropDiseases.map((d) => (
                <DiseaseCard key={d.id} disease={d} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

