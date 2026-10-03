import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Pricing } from "@/components/pricing";
import {
  ArrowRight,
  CloudRain,
  Droplets,
  Languages,
  Leaf,
  MapPin,
  Menu,
  Satellite,
  Send,
  Sprout,
  Sun,
  Tractor,
  WifiOff,
  X,
} from "lucide-react";
import heroBg from "../assets/hero-bg.png";
import fieldMap from "../assets/field-map.png";
import novaMascot from "../assets/nova-mascot.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AgroNova — Your AI Farm Companion | NASA Space Apps 2026" },
      {
        name: "description",
        content:
          "AgroNova helps farmers read their fields with NASA satellite data and make confident decisions — one friendly AI assistant, built for the Field Shift challenge.",
      },
      { property: "og:title", content: "AgroNova — Your AI Farm Companion" },
      {
        property: "og:description",
        content:
          "When fields shift, Nova helps you farm smarter — NASA satellite insights in simple words.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Meet Nova", href: "#nova" },
  { label: "Field Shift", href: "#field-shift" },
  { label: "Pricing", href: "#pricing" },
  { label: "For Farmers", href: "#farmers" },
];

function Index() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background font-sans text-foreground">
      <Nav />
      <Hero />
      <DataStrip />
      <HowItWorks />
      <NovaSection />
      <Features />
      <FieldShift />
      <FarmersBand />
      {/* Pricing section injected between farmers band and final CTA */}
      <section id="pricing" className="px-4 py-4">
        <Pricing embedded />
      </section>
      <FinalCta />
      <Footer />
    </div>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <nav className={`glass-panel mx-auto max-w-5xl overflow-hidden ${open ? "rounded-3xl" : "rounded-full"}`}>
        <div className="flex items-center gap-2 py-2.5 pr-2.5 pl-3 sm:pl-6">
        <a href="#top" className="flex shrink-0 items-center gap-2.5">
          <span className="clay-chip flex h-10 w-10 items-center justify-center bg-leaf">
            <Sprout className="h-5 w-5 text-primary-foreground" strokeWidth={2.2} />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">
            Agro<span className="text-leaf-deep">Nova</span>
          </span>
        </a>
        <div className="ml-auto hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </div>
        <Link to="/auth" className="clay-btn ml-2 hidden items-center gap-1.5 bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground md:flex">Login / Signup<ArrowRight className="h-4 w-4" /></Link>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="clay-btn bg-primary text-primary-foreground ml-auto flex h-11 w-11 items-center justify-center md:hidden"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        </div>
        {open && (
          <div className="border-t border-border px-3 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-secondary">{link.label}</a>
              ))}
              <Link to="/auth" onClick={() => setOpen(false)} className="clay-btn bg-primary text-primary-foreground mt-2 flex min-h-12 items-center justify-center gap-2 px-5 text-sm font-semibold">Login / Signup<ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden pt-36 pb-20 md:pt-44 md:pb-28"
    >
      {/* Hero background: soft clay-diorama farmland under a pale sky */}
      <div className="absolute inset-0 -z-10">
        <img
          src={heroBg}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
          width={1920}
          height={1088}
        />
        <div className="absolute inset-0 bg-background/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/25 to-background" />
      </div>

      <div className="mx-auto max-w-3xl px-5 text-center">
        <img
          src={novaMascot}
          alt="Nova, the AgroNova assistant"
          className="float-soft mx-auto h-20 w-20 drop-shadow-xl"
          width={1024}
          height={1024}
        />

        <h1 className="font-display mt-6 text-5xl leading-[1.05] font-semibold tracking-tight text-balance md:text-6xl">
          When fields shift,{" "}
          <span className="text-leaf-deep italic">farm with them</span> — not
          against them.
        </h1>

        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-relaxed">
          Seasons drift, soils dry, water moves. AgroNova watches your fields
          from space and turns NASA Earth data into simple, spoken advice — so
          every farmer can decide what to plant, water, and harvest next.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/demo"
            className="clay-btn inline-flex items-center gap-2 bg-primary px-7 py-3.5 font-semibold text-primary-foreground"
          >
            Try Demo Field <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}

const nasaSources = [
  "SMAP · Soil moisture",
  "GPM · Rainfall",
  "Landsat · Field change",
  "MODIS · Crop health",
  "Sentinel-2 · NDVI",
];

function DataStrip() {
  return (
    <section className="px-5 py-6">
      <div className="mx-auto max-w-5xl">
        <div className="skeu-ridge rounded-4xl px-6 py-5">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-leaf-deep">
              NASA data inside
            </span>
            {nasaSources.map((s) => (
              <span
                key={s}
                className="text-sm font-medium text-foreground/70"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    icon: Satellite,
    title: "See from space",
    body: "Nova reads free NASA satellite data over your village — soil moisture, rainfall, and the greenness of every field — updated as each satellite passes.",
  },
  {
    icon: Sprout,
    title: "Understand your field",
    body: "You don't read charts. Nova does. It blends satellite data with your local crop calendar and turns it into one clear sentence: what to do this week.",
  },
  {
    icon: Tractor,
    title: "Act with confidence",
    body: "Plant, irrigate, or shift a crop — with a reason you can trust. Every advice shows which NASA mission said so, in your own language.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-28 px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          kicker="How it works"
          title="Three steps between the sky and your soil"
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="clay-card group relative p-8">
              <span className="font-display absolute -top-5 left-8 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground shadow-lg">
                {i + 1}
              </span>
              <s.icon className="mt-4 h-9 w-9 text-leaf-deep" strokeWidth={1.6} />
              <h3 className="font-display mt-5 text-xl font-semibold">
                {s.title}
              </h3>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const chatThread = [
  {
    from: "farmer" as const,
    text: "My field has been very dry this month. What should I sow in November?",
  },
  {
    from: "nova" as const,
    text: "Your plot's soil moisture has dropped 18% since last month — I can see it in NASA's SMAP data. Good news: rain is likely this Friday. I'd wait, then sow chickpea; it suits drier soil and short winters.",
  },
  {
    from: "farmer" as const,
    text: "What about the field near the river?",
  },
  {
    from: "nova" as const,
    text: "That one stayed moist — crop health is 92% there. Keep your maize going 2 more weeks, then switch to mustard.",
  },
];

const quickReplies = [
  "When should I irrigate?",
  "Which crop suits my soil?",
  "Will it rain this week?",
  "Is my crop healthy?",
];

function NovaSection() {
  return (
    <section id="nova" className="scroll-mt-28 px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          kicker="Meet Nova"
          title="A farming companion that speaks your language"
          sub="Ask in plain words — in Bangla, Hindi, Swahili or English. No dashboards to decode, no spreadsheets to fill."
        />
        <div className="mt-12 grid items-center gap-10 lg:grid-cols-[1fr_1.15fr]">
          <div className="relative mx-auto hidden lg:block">
            <div className="clay-card-sunken flex h-72 w-72 items-center justify-center">
              <img
                src={novaMascot}
                alt="Nova mascot"
                className="float-soft h-64 w-64 drop-shadow-xl"
                width={1024}
                height={1024}
              />
            </div>
            <div className="glass-panel absolute -right-16 bottom-4 flex items-center gap-2 rounded-2xl px-4 py-3">
              <Leaf className="h-4 w-4 text-leaf-deep" />
              <span className="text-sm font-medium">
                12 fields watched today
              </span>
            </div>
          </div>

          <div className="glass-panel rounded-4xl p-4 sm:p-6">
            <div className="clay-card-sunken space-y-4 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <img
                  src={novaMascot}
                  alt="Nova"
                  className="h-10 w-10 rounded-full bg-card object-cover"
                  width={1024}
                  height={1024}
                />
                <div>
                  <p className="text-sm font-semibold">Nova</p>
                  <p className="text-leaf-deep text-xs font-medium">
                    online · watching your fields
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {chatThread.map((m, i) => (
                  <ChatBubble key={i} {...m} />
                ))}
                <div className="flex items-center gap-1.5 pl-1">
                  <span className="typing-dot h-2 w-2 rounded-full bg-leaf-deep" />
                  <span
                    className="typing-dot h-2 w-2 rounded-full bg-leaf-deep"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <span
                    className="typing-dot h-2 w-2 rounded-full bg-leaf-deep"
                    style={{ animationDelay: "0.3s" }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 px-1">
              {quickReplies.map((q) => (
                <span
                  key={q}
                  className="clay-chip bg-card px-4 py-2 text-sm font-medium text-foreground/80"
                >
                  {q}
                </span>
              ))}
            </div>
            <div className="clay-card-sunken mt-4 flex items-center justify-between gap-3 px-5 py-3.5">
              <span className="text-sm text-muted-foreground">
                Ask about your field…
              </span>
              <span className="clay-btn flex h-10 w-10 items-center justify-center bg-primary">
                <Send className="h-4 w-4 text-primary-foreground" />
              </span>
            </div>
            <p className="text-muted-foreground mt-3 px-2 text-center text-xs">
              Demo conversation — the real Nova answers from live NASA data.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChatBubble({
  from,
  text,
}: {
  from: "farmer" | "nova";
  text: string;
}) {
  const isNova = from === "nova";
  return (
    <div className={isNova ? "flex gap-2.5" : "flex justify-end"}>
      {isNova && (
        <img
          src={novaMascot}
          alt=""
          className="h-7 w-7 shrink-0 rounded-full bg-card object-cover"
          width={1024}
          height={1024}
        />
      )}
      <div
        className={
          isNova
            ? "max-w-[85%] rounded-2xl rounded-tl-sm bg-card px-4 py-3 text-sm leading-relaxed shadow-sm"
            : "max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground"
        }
      >
        {text}
      </div>
    </div>
  );
}

const features = [
  {
    icon: Droplets,
    title: "Irrigation timing",
    body: "SMAP soil moisture plus GPM rainfall tells Nova when your roots are thirsty — days before the plants show it.",
    tag: "Water saved, not wasted",
  },
  {
    icon: Leaf,
    title: "Crop health watch",
    body: "MODIS and Sentinel-2 greenness flags a struggling patch early, so you fix one corner — not lose one field.",
    tag: "Spot trouble early",
  },
  {
    icon: CloudRain,
    title: "Rain you can plan on",
    body: "Nova blends GPM rainfall history with forecasts into one honest window: sow, hold, or harvest this week.",
    tag: "Simple decisions",
  },
  {
    icon: MapPin,
    title: "Field shift advisor",
    body: "When a parcel can no longer carry its old crop, Nova suggests what thrives there next — rotation by data, not habit.",
    tag: "For the Field Shift challenge",
  },
];

function Features() {
  return (
    <section className="px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          kicker="What Nova watches"
          title="Quietly noticing everything that matters"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="clay-card p-8">
              <div className="flex items-start justify-between">
                <span className="clay-chip flex h-12 w-12 items-center justify-center bg-secondary">
                  <f.icon className="h-6 w-6 text-leaf-deep" strokeWidth={1.7} />
                </span>
                <span className="skeu-stitch px-3 py-1.5 text-[11px] font-semibold text-muted-foreground">
                  {f.tag}
                </span>
              </div>
              <h3 className="font-display mt-6 text-xl font-semibold">
                {f.title}
              </h3>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const mapStats = [
  { label: "Fields monitored", value: "12,400+" },
  { label: "Avg. health score", value: "87%" },
  { label: "Data updates / week", value: "3–5" },
];

function FieldShift() {
  return (
    <section id="field-shift" className="scroll-mt-28 px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <div className="clay-card overflow-hidden p-2.5">
              <img
                src={fieldMap}
                alt="Satellite map of fields with crop health overlay"
                className="w-full rounded-[calc(var(--radius)+4px)] object-cover"
                loading="lazy"
                width={1920}
                height={1088}
              />
            </div>
            <div className="glass-panel absolute -bottom-6 left-6 flex items-center gap-2 rounded-2xl px-4 py-3">
              <Satellite className="h-4 w-4 text-leaf-deep" />
              <span className="text-sm font-medium">
                Live boundary & health mapping
              </span>
            </div>
          </div>
          <div>
            <span className="skeu-stitch inline-block px-4 py-2 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
              The challenge
            </span>
            <h2 className="font-display mt-6 text-4xl font-semibold tracking-tight text-balance md:text-5xl">
              Fields are shifting. Farmers shouldn't have to guess.
            </h2>
            <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
              Rainfall patterns move. Water tables drop. Old sowing calendars
              quietly stop matching reality. AgroNova tracks these shifts field
              by field — and helps each farmer move with them: changing crop
              choice, sowing dates, and water plans before losses happen.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Detects boundary and land-use change from Landsat imagery",
                "Scores every parcel's health with NDVI, weekly",
                "Recommends what to plant where next season — with reasons",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="clay-chip mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-leaf">
                    <Leaf className="h-3.5 w-3.5 text-primary-foreground" />
                  </span>
                  <span className="font-medium">{t}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10 grid grid-cols-3 gap-4">
              {mapStats.map((s) => (
                <div key={s.label} className="clay-card-sunken px-4 py-4 text-center">
                  <p className="font-display text-2xl font-semibold">
                    {s.value}
                  </p>
                  <p className="text-muted-foreground mt-1 text-[11px] font-semibold tracking-wide uppercase">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const farmerPoints = [
  {
    icon: Languages,
    title: "Speaks your language",
    body: "Bangla, Hindi, Swahili, Spanish and more — spoken aloud or on screen.",
  },
  {
    icon: WifiOff,
    title: "Works without internet",
    body: "Advice by SMS or voice call when the signal drops. Data waits, answers don't.",
  },
  {
    icon: Sprout,
    title: "Built with farmers",
    body: "Every word tested with real growers — simple, respectful, never condescending.",
  },
];

function FarmersBand() {
  return (
    <section id="farmers" className="scroll-mt-28 px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[calc(var(--radius)+28px)] bg-forest px-6 py-14 text-cream sm:px-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage: `radial-gradient(circle at 15% 20%, color-mix(in oklab, var(--leaf) 30%, transparent), transparent 40%), radial-gradient(circle at 85% 80%, color-mix(in oklab, var(--leaf) 22%, transparent), transparent 45%)`,
            }}
          />
          <div className="relative">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <span className="glass-dark inline-block rounded-full px-4 py-2 text-xs font-semibold tracking-wide uppercase text-cream/90">
                  For farmers, first
                </span>
                <h2 className="font-display mt-5 max-w-xl text-4xl font-semibold tracking-tight text-balance md:text-5xl">
                  Technology that fits in a farmer's hand
                </h2>
              </div>
              <p className="text-cream/70 max-w-sm text-base leading-relaxed">
                No logins to remember, no jargon to learn. If you can send a
                message, you can farm with Nova.
              </p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {farmerPoints.map((p) => (
                <div key={p.title} className="glass-dark rounded-3xl p-7">
                  <p.icon className="h-7 w-7 text-leaf" strokeWidth={1.7} />
                  <h3 className="font-display mt-4 text-lg font-semibold text-cream">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-cream/70">
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="px-5 py-20">
      <div className="clay-card mx-auto max-w-4xl px-8 py-14 text-center sm:px-14">
        <img
          src={novaMascot}
          alt="Nova"
          className="float-soft mx-auto h-24 w-24 drop-shadow-xl"
          loading="lazy"
          width={1024}
          height={1024}
        />
        <h2 className="font-display mt-6 text-4xl font-semibold tracking-tight text-balance md:text-5xl">
          Let's farm with the sky, together.
        </h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
          AgroNova is our team's entry for the NASA Space Apps Challenge 2026
          — Field Shift. We're building it with and for farming communities.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <a
            href="#nova"
            className="clay-btn bg-primary px-8 py-4 font-semibold text-primary-foreground"
          >
            Start asking Nova
          </a>
          <Link
            to="/pricing"
            className="clay-btn bg-secondary px-8 py-4 font-semibold text-secondary-foreground"
          >
            See plans &amp; pricing
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-5 pb-10">
      <div className="mx-auto max-w-6xl">
        <div className="skeu-engrave" />
        <div className="flex flex-col items-center justify-between gap-4 py-8 text-sm sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="clay-chip flex h-8 w-8 items-center justify-center bg-leaf">
              <Sprout className="h-4 w-4 text-primary-foreground" />
            </span>
            <span className="font-display font-semibold">AgroNova</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-muted-foreground">
            <p>Built for NASA Space Apps Challenge 2026 · Powered by open NASA Earth data</p>
            <div className="flex items-center gap-3">
              <Link to="/pricing" className="text-primary hover:underline">Pricing</Link>
              <Link to="/demo" className="hover:underline">Demo</Link>
              <Link to="/auth" className="hover:underline">Sign Up</Link>
            </div>
          </div>
          <p className="text-muted-foreground">
            © 2026 Team AgroNova
          </p>
        </div>
      </div>
    </footer>
  );
}

function SectionHeading({
  kicker,
  title,
  sub,
}: {
  kicker: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="skeu-stitch inline-block px-4 py-2 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
        {kicker}
      </span>
      <h2 className="font-display mt-5 text-4xl font-semibold tracking-tight text-balance md:text-5xl">
        {title}
      </h2>
      {sub && (
        <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
          {sub}
        </p>
      )}
    </div>
  );
}
