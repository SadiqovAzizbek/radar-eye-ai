import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { Metric, Panel, StatusDot } from "@/components/hud/Panel";
import { RadarView } from "@/components/hud/RadarView";
import { SpectrumChart } from "@/components/hud/SpectrumChart";
import { useSystem } from "@/hooks/useSystem";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => ({
    meta: [
      { title: "Tactical Dashboard — Smart Helmet UAV Detection" },
      {
        name: "description",
        content:
          "Live tactical dashboard for passive UAV detection: RF spectrum, radar view, confidence and system health.",
      },
      { property: "og:title", content: "Tactical Dashboard — Smart Helmet" },
      {
        property: "og:description",
        content: "Passive UAV detection dashboard running in simulation mode.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { snapshot, running, settings, toggle } = useSystem();
  const status = snapshot?.status;
  const system = snapshot?.system;
  const detected = status?.signal_detected ?? false;
  const confidence = Math.round((status?.confidence ?? 0) * 100);

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "panel-hud flex flex-wrap items-center gap-4 p-4",
          detected ? "border-alert bg-alert/10" : running ? "border-signal/50" : undefined,
        )}
      >
        {detected ? (
          <AlertTriangle className="size-8 text-alert" aria-hidden />
        ) : (
          <ShieldCheck
            className={cn("size-8", running ? "text-signal" : "text-muted-foreground")}
            aria-hidden
          />
        )}
        <div className="min-w-0">
          <p className="label-hud">Threat state</p>
          <p
            className={cn(
              "font-mono text-2xl tracking-[0.1em]",
              detected ? "text-alert" : running ? "text-signal" : "text-muted-foreground",
            )}
          >
            {detected ? "POSSIBLE UAV DETECTED" : running ? "AIRSPACE CLEAR" : "SENSOR STANDBY"}
          </p>
        </div>
        <div className="ml-auto flex flex-wrap gap-8">
          <Metric
            label="Confidence"
            value={`${confidence}`}
            unit="%"
            tone={detected ? "alert" : "signal"}
          />
          <Metric
            label="Signal strength"
            value={status?.signal_strength ?? "NONE"}
            tone={detected ? "alert" : "signal"}
          />
          <Metric label="Band" value={status?.band ?? "—"} />
          <Metric label="Source" value={status?.source ?? "SIM"} tone="idle" />
        </div>
        {!running ? (
          <button
            onClick={toggle}
            className="rounded-sm border border-signal/60 px-3 py-2 font-mono text-xs tracking-[0.12em] text-signal hover:bg-signal/10"
          >
            START SIMULATION
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="RF Spectrum — 2.4 GHz" className="lg:col-span-2">
          {snapshot ? (
            <SpectrumChart frame={snapshot.spectrum} height={230} />
          ) : (
            <p className="label-hud">AWAITING STREAM</p>
          )}
          <div className="mt-2 flex justify-between">
            <span className="label-hud">Noise floor {snapshot?.spectrum.noise_floor ?? "—"} dBm</span>
            <Link to="/spectrum" className="label-hud hover:text-signal">
              EXPANDED VIEW →
            </Link>
          </div>
        </Panel>

        <Panel title="Radar / Situational awareness" bodyClassName="pt-6 pb-10">
          {status ? <RadarView status={status} running={running} /> : null}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Confidence vs threshold" className="lg:col-span-1">
          <div className="space-y-3">
            <div className="h-3 w-full overflow-hidden rounded-sm bg-muted">
              <div
                className={cn("h-full transition-all", detected ? "bg-alert" : "bg-signal")}
                style={{ width: `${confidence}%` }}
              />
            </div>
            <div className="flex justify-between font-mono text-xs text-muted-foreground">
              <span>0%</span>
              <span>THRESHOLD {Math.round(settings.threshold * 100)}%</span>
              <span>100%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Classification is reported only when confidence exceeds the operator threshold. Adjust it
              in <Link to="/settings" className="text-signal">Settings</Link>.
            </p>
          </div>
        </Panel>

        <Panel title="System health">
          <div className="grid grid-cols-2 gap-4">
            <Metric label="Mode" value={system?.mode ?? "SIMULATION"} tone="warn" />
            <Metric label="Uptime" value={`${system?.uptime_s ?? 0}`} unit="s" />
            <Metric
              label="CPU"
              value={`${Math.round((system?.cpu_load ?? 0) * 100)}`}
              unit="%"
            />
            <Metric
              label="Battery"
              value={`${Math.round((system?.battery ?? 0) * 100)}`}
              unit="%"
            />
          </div>
        </Panel>

        <Panel
          title="Recent detections"
          right={
            <Link to="/detections" className="label-hud hover:text-signal">
              HISTORY →
            </Link>
          }
        >
          <ul className="space-y-2">
            {(snapshot?.detections ?? []).slice(0, 5).map((d) => (
              <li key={d.id} className="flex items-center gap-2 font-mono text-xs">
                <StatusDot status={d.confidence > 0.8 ? "OFFLINE" : "DEGRADED"} />
                <span className="text-muted-foreground">
                  {new Date(d.timestamp).toLocaleTimeString()}
                </span>
                <span className="truncate">{d.classification}</span>
                <span className="ml-auto text-alert">{Math.round(d.confidence * 100)}%</span>
              </li>
            ))}
            {(snapshot?.detections.length ?? 0) === 0 ? (
              <li className="label-hud">NO EVENTS LOGGED</li>
            ) : null}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
