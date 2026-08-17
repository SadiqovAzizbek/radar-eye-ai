import { createFileRoute } from "@tanstack/react-router";
import { Metric, Panel, StatusDot } from "@/components/hud/Panel";
import { useSystem } from "@/hooks/useSystem";

export const Route = createFileRoute("/_shell/system")({
  head: () => ({
    meta: [
      { title: "System Health — Smart Helmet" },
      {
        name: "description",
        content:
          "System status for the Smart Helmet prototype: pipeline services, load, battery, thermal and telemetry endpoints.",
      },
      { property: "og:title", content: "System Health — Smart Helmet" },
      { property: "og:description", content: "Service status and telemetry for the software MVP." },
    ],
  }),
  component: SystemPage,
});

const ENDPOINTS = [
  { path: "/api/status", desc: "Current detection state frame" },
  { path: "/api/detections", desc: "Detection history log" },
  { path: "/api/spectrum", desc: "Latest FFT bins" },
  { path: "/api/system", desc: "Health + service telemetry" },
];

function SystemPage() {
  const { snapshot, running, serviceName } = useSystem();
  const system = snapshot?.system;

  return (
    <div className="space-y-4">
      <h1 className="font-mono text-lg tracking-[0.16em]">SYSTEM</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel title="Mode">
          <Metric label="Operating" value={system?.mode ?? "SIMULATION"} tone="warn" />
        </Panel>
        <Panel title="Pipeline">
          <Metric
            label="State"
            value={running ? "STREAMING" : "STOPPED"}
            tone={running ? "signal" : "default"}
          />
        </Panel>
        <Panel title="Latency">
          <Metric label="Link" value={`${system?.link_latency_ms ?? 0}`} unit="ms" tone="idle" />
        </Panel>
        <Panel title="Data source">
          <Metric label="Service" value={serviceName === "simulationService" ? "SIM" : "BACKEND"} />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Resources" className="lg:col-span-1">
          <div className="space-y-4">
            <Bar label="CPU LOAD" value={system?.cpu_load ?? 0} />
            <Bar label="BATTERY" value={system?.battery ?? 0} />
            <Bar label="THERMAL" value={((system?.temperature_c ?? 30) - 20) / 60} />
            <p className="label-hud">UPTIME {system?.uptime_s ?? 0}s</p>
          </div>
        </Panel>

        <Panel title="Services" className="lg:col-span-2" bodyClassName="p-0">
          <ul>
            {(system?.services ?? []).map((s) => (
              <li
                key={s.name}
                className="flex items-center gap-3 border-b border-border/60 px-3 py-2.5 last:border-0"
              >
                <StatusDot status={s.status} />
                <span className="font-mono text-xs tracking-[0.1em]">{s.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{s.detail}</span>
                <span className="w-20 text-right font-mono text-xs">{s.status}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Telemetry interface (API-ready)">
        <ul className="space-y-2">
          {ENDPOINTS.map((e) => (
            <li key={e.path} className="flex flex-wrap items-baseline gap-3 font-mono text-xs">
              <span className="text-signal">GET {e.path}</span>
              <span className="text-muted-foreground">{e.desc}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          The UI reads only through the <span className="font-mono text-signal">DataService</span>{" "}
          interface. Swapping <span className="font-mono">simulationService</span> for a
          <span className="font-mono"> backendService</span> (REST + WebSocket) requires no UI changes.
        </p>
      </Panel>
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div>
      <div className="flex justify-between">
        <span className="label-hud">{label}</span>
        <span className="font-mono text-xs tabular-nums">{pct}%</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-sm bg-muted">
        <div className="h-full bg-signal transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
