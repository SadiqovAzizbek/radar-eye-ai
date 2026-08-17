import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Helmet — Passive UAV Detection System" },
      {
        name: "description",
        content:
          "Smart Helmet is a passive UAV detection and situational awareness prototype: RF spectrum monitoring, radar view and AI classification. Prototype v0.1, simulation mode.",
      },
      { property: "og:title", content: "Smart Helmet — Passive UAV Detection System" },
      {
        property: "og:description",
        content: "Passive UAV detection & situational awareness. Software prototype v0.1.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="dark">
      <main className="grid-hud relative flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 40%, color-mix(in oklab, var(--color-signal) 12%, transparent), transparent 60%)",
          }}
          aria-hidden
        />
        <div className="relative flex flex-col items-center">
          <Logo className="h-20 w-20 text-signal" />
          <h1 className="mt-8 font-mono text-4xl tracking-[0.3em] sm:text-5xl">SMART HELMET</h1>
          <p className="mt-4 max-w-xl font-mono text-xs tracking-[0.22em] text-muted-foreground sm:text-sm">
            PASSIVE UAV DETECTION &amp; SITUATIONAL AWARENESS
          </p>
          <p className="mt-2 label-hud">PROTOTYPE v0.1</p>

          <Link
            to="/dashboard"
            className="mt-12 inline-flex items-center gap-3 border border-signal/70 px-8 py-3.5 font-mono text-sm tracking-[0.24em] text-signal transition-colors hover:bg-signal/10"
          >
            ENTER SYSTEM
            <ArrowRight className="size-4" aria-hidden />
          </Link>

          <div className="mt-14 space-y-1">
            <p className="font-mono text-[11px] tracking-[0.2em] text-warn">SIMULATION MODE</p>
            <p className="label-hud">SOFTWARE PROTOTYPE</p>
            <p className="mt-4 max-w-md text-xs text-muted-foreground">
              No real RF sensor is connected. This is a technology demonstration and software MVP —
              passive receive-only by design.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
