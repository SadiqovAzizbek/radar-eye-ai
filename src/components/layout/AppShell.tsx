import { Link, Outlet } from "@tanstack/react-router";
import {
  Activity,
  AudioWaveform,
  Cpu,
  Gauge,
  HardDrive,
  Play,
  Radar,
  Settings as SettingsIcon,
  Square,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useSystem } from "@/hooks/useSystem";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "DASHBOARD", icon: Gauge },
  { to: "/detections", label: "DETECTIONS", icon: Activity },
  { to: "/spectrum", label: "RF SPECTRUM", icon: AudioWaveform },
  { to: "/system", label: "SYSTEM", icon: Cpu },
  { to: "/hardware", label: "HARDWARE", icon: HardDrive },
  { to: "/settings", label: "SETTINGS", icon: SettingsIcon },
] as const;

export function AppShell() {
  const { running, toggle, snapshot, settings, alertFlash } = useSystem();
  const status = snapshot?.status;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-border bg-panel md:flex">
        <Link to="/" className="flex items-center gap-2.5 border-b border-border px-4 py-4">
          <Logo className="h-7 w-7 text-signal" />
          <span>
            <span className="block font-mono text-sm tracking-[0.18em]">SMART HELMET</span>
            <span className="block text-[10px] tracking-[0.12em] text-muted-foreground">
              PROTOTYPE v0.1
            </span>
          </span>
        </Link>
        <nav className="flex-1 p-2">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-2.5 rounded-sm px-3 py-2 font-mono text-xs tracking-[0.1em] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[status=active]:bg-accent data-[status=active]:text-signal"
              activeProps={{ "aria-current": "page" }}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <p className="label-hud leading-relaxed">
            SIMULATION MODE
            <br />
            NO REAL RF SENSOR
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className={cn(
            "sticky top-0 z-20 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-border bg-panel/95 px-4 py-2.5 backdrop-blur transition-colors",
            alertFlash && "bg-alert/15",
          )}
        >
          <div className="flex items-center gap-2 md:hidden">
            <Logo className="h-6 w-6 text-signal" />
            <span className="font-mono text-xs tracking-[0.16em]">SMART HELMET</span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                "size-2 rounded-full",
                running ? "bg-signal" : "bg-muted-foreground",
                running && "animate-pulse",
              )}
              aria-hidden
            />
            <span className="font-mono text-xs tracking-[0.12em]">
              {running ? "SYSTEM ACTIVE" : "SYSTEM STANDBY"}
            </span>
          </div>

          <div className="hidden items-center gap-6 sm:flex">
            <HeaderStat
              label="RF"
              value={status?.signal_strength ?? "NONE"}
              tone={status && status.signal_strength !== "NONE" ? "signal" : "muted"}
            />
            <HeaderStat
              label="UAV"
              value={status?.signal_detected ? "DETECTED" : "CLEAR"}
              tone={status?.signal_detected ? "alert" : "muted"}
            />
            <HeaderStat
              label="CONF"
              value={`${Math.round((status?.confidence ?? 0) * 100)}%`}
              tone="signal"
            />
            <HeaderStat label="THR" value={`${Math.round(settings.threshold * 100)}%`} tone="muted" />
          </div>

          <button
            onClick={toggle}
            className={cn(
              "ml-auto inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 font-mono text-xs tracking-[0.12em] transition-colors",
              running
                ? "border-alert/60 text-alert hover:bg-alert/10"
                : "border-signal/60 text-signal hover:bg-signal/10",
            )}
          >
            {running ? <Square className="size-3.5" /> : <Play className="size-3.5" />}
            {running ? "STOP SIM" : "START SIM"}
          </button>
        </header>

        <div className="border-b border-border bg-warn/10 px-4 py-1.5">
          <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-warn">
            <Radar className="size-3" aria-hidden />
            SIMULATION MODE — NO REAL RF SENSOR CONNECTED
          </p>
        </div>

        <main className="grid-hud min-w-0 flex-1 p-4">
          <Outlet />
        </main>

        <nav className="sticky bottom-0 z-20 grid grid-cols-6 border-t border-border bg-panel md:hidden">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-1 py-2 text-muted-foreground data-[status=active]:text-signal"
            >
              <Icon className="size-4" aria-hidden />
              <span className="text-[8px] tracking-wider">{label.split(" ")[0]}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

function HeaderStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "signal" | "alert" | "muted";
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="label-hud">{label}</span>
      <span
        className={cn(
          "font-mono text-xs tabular-nums",
          tone === "signal" && "text-signal",
          tone === "alert" && "text-alert",
          tone === "muted" && "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}
