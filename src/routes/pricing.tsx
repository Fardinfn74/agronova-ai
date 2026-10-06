import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Sprout } from "lucide-react";
import { Pricing } from "@/components/pricing";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — AgroNova | Satellite Agronomy Plans" },
      {
        name: "description",
        content:
          "Simple, transparent plans for every farm. Start free with NASA satellite data, upgrade to Harvest Pro for unlimited fields, or choose Terra Enterprise for your cooperative.",
      },
      { property: "og:title", content: "AgroNova Pricing — Satellite Agronomy for Every Farmer" },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Simple top nav */}
      <header className="glass-panel sticky top-0 z-50 border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold text-foreground/70 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <span className="clay-chip flex h-9 w-9 items-center justify-center bg-leaf">
              <Sprout className="h-4 w-4 text-primary-foreground" />
            </span>
            <span className="font-display text-lg font-semibold">
              Agro<span className="text-leaf-deep">Nova</span>
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/demo" className="clay-btn bg-secondary px-5 py-2.5 text-sm font-semibold">
              Try Demo
            </Link>
            <Link
              to="/auth"
              className="clay-btn bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Sign up free
            </Link>
          </div>
        </div>
      </header>

      {/* Pricing content */}
      <main>
        <Pricing />
      </main>

      {/* Simple footer */}
      <footer className="border-t border-border px-5 py-8 text-center text-sm text-muted-foreground">
        <p>
          © 2026 AgroNova · Built for NASA Space Apps Challenge 2026 ·{" "}
          <Link to="/" className="text-primary hover:underline">
            Back to Home
          </Link>
        </p>
      </footer>
    </div>
  );
}
