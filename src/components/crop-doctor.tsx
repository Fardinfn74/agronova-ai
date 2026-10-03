import { useMemo, useState } from "react";
import {
  cropDiseases,
  type CropDisease,
  type Language,
} from "@/lib/agronova-demo";
import { Stethoscope, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Satellite } from "lucide-react";

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

export function CropDoctor({ lang: _lang }: { lang: Language }) {
  const [selectedCrop, setSelectedCrop] = useState("");
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);

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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="clay-chip flex h-10 w-10 items-center justify-center bg-destructive/20">
          <Stethoscope className="h-5 w-5 text-destructive" />
        </span>
        <div>
          <h3 className="font-display text-lg font-semibold">Crop Doctor</h3>
          <p className="text-muted-foreground text-sm">
            Describe what you see — get instant diagnosis &amp; treatment guidance.
          </p>
        </div>
      </div>

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
  );
}
