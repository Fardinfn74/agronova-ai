import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Leaf, LockKeyhole, Mail, Sprout } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroBg from "../assets/hero-bg.png";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Login or Signup | AgroNova" },
      {
        name: "description",
        content:
          "Sign in or create a free AgroNova account to manage your fields with NASA Earth data.",
      },
      { property: "og:title", content: "Login or Signup | AgroNova" },
      { property: "og:description", content: "Create your AgroNova farm workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name.trim(), district: district.trim() },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/dashboard" });
        else
          setMessage(
            "Check your email for a confirmation link. Then sign in to open your dashboard.",
          );
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-background min-h-screen lg:grid lg:grid-cols-2">
      <div className="relative hidden min-h-screen flex-col justify-between overflow-hidden p-12 lg:flex">
        <img
          src={heroBg}
          alt="Farmland landscape"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1d3e2b]/75 via-[#1d3e2b]/15 to-[#102918]/85" />
        <Link
          to="/"
          className="relative flex w-fit items-center gap-2 font-display text-2xl font-semibold text-white"
        >
          <Sprout />
          AgroNova
        </Link>
        <div className="relative max-w-lg text-white">
          <span className="mb-5 inline-block rounded-full border border-white/40 px-4 py-2 text-xs font-semibold tracking-widest uppercase backdrop-blur-md">
            Your farm, a clearer future
          </span>
          <h1 className="font-display text-5xl leading-tight">
            Good decisions begin with knowing your field.
          </h1>
          <p className="mt-5 text-lg text-white/85">
            Create your own field, explore NASA Earth observations, and plan what comes next — all
            in one calm place.
          </p>
        </div>
        <p className="relative text-sm text-white/75">
          AgroNova · Made for farmers, guided by Earth data
        </p>
      </div>
      <div className="flex min-h-screen flex-col px-5 py-7 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-semibold">
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>
          <span className="font-display text-xl font-semibold lg:hidden">
            Agro<span className="text-primary">Nova</span>
          </span>
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <div className="clay-chip mb-6 flex h-14 w-14 items-center justify-center bg-primary text-primary-foreground">
            <Leaf className="h-7 w-7" />
          </div>
          <p className="text-primary mb-2 text-xs font-bold tracking-[.18em] uppercase">
            Welcome to your growing space
          </p>
          <h1 className="font-display text-4xl font-semibold">
            {mode === "login" ? "Welcome back." : "Let's get growing."}
          </h1>
          <p className="text-muted-foreground mt-3">
            {mode === "login"
              ? "Sign in to continue to your fields."
              : "Create a free account to start your farm workspace."}
          </p>
          <div
            className="clay-card-sunken mt-8 flex gap-1 rounded-full p-1"
            role="tablist"
            aria-label="Account access"
          >
            {(["login", "signup"] as const).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={mode === item}
                onClick={() => {
                  setMode(item);
                  setError("");
                  setMessage("");
                }}
                className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${mode === item ? "clay-btn bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                {item === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <>
                <label className="block text-sm font-semibold">
                  Your name
                  <input
                    required
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ayesha Rahman"
                    className="clay-card-sunken mt-2 w-full px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>
                <label className="block text-sm font-semibold">
                  District
                  <input
                    required
                    maxLength={100}
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Rajshahi"
                    className="clay-card-sunken mt-2 w-full px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>
              </>
            )}
            <label className="block text-sm font-semibold">
              Email address
              <div className="clay-card-sunken mt-2 flex items-center gap-3 px-4 focus-within:ring-2 focus-within:ring-primary">
                <Mail className="text-muted-foreground h-4 w-4" />
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent py-3 font-normal outline-none"
                />
              </div>
            </label>
            <label className="block text-sm font-semibold">
              Password
              <div className="clay-card-sunken mt-2 flex items-center gap-3 px-4 focus-within:ring-2 focus-within:ring-primary">
                <LockKeyhole className="text-muted-foreground h-4 w-4" />
                <input
                  required
                  minLength={6}
                  type={visible ? "text" : "password"}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-transparent py-3 font-normal outline-none"
                />
                <button
                  type="button"
                  onClick={() => setVisible(!visible)}
                  aria-label={visible ? "Hide password" : "Show password"}
                >
                  {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>
            {error && (
              <p role="alert" className="text-destructive rounded-xl bg-destructive/10 p-3 text-sm">
                {error}
              </p>
            )}
            {message && (
              <p role="status" className="text-primary rounded-xl bg-primary/10 p-3 text-sm">
                {message}
              </p>
            )}
            <button
              disabled={busy}
              className="clay-btn bg-primary text-primary-foreground flex w-full items-center justify-center gap-2 py-3.5 font-semibold disabled:opacity-60"
            >
              {busy ? "Please wait…" : mode === "login" ? "Log in to dashboard" : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          <div className="mt-7 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or explore first
            <div className="h-px flex-1 bg-border" />
          </div>
          <Link
            to="/demo"
            className="clay-btn bg-card mt-6 block py-3 text-center text-sm font-semibold"
          >
            Try Demo Field — no account needed
          </Link>
          <p className="text-muted-foreground mt-7 text-center text-xs">
            NASA observations may be delayed and regional, not field-level measurements.
          </p>
        </div>
      </div>
    </div>
  );
}
