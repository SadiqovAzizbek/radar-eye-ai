import { createFileRoute } from "@tanstack/react-router";
import { Metric, Panel } from "@/components/hud/Panel";
import { SpectrumChart } from "@/components/hud/SpectrumChart";
import { useSystem } from "@/hooks/useSystem";

export const Route = createFileRoute("/_shell/spectrum")({
  head: () => ({
    meta: [
      { title: "RF Spectrum Analyzer — Smart Helmet" },
      {
        name: "description",
        content:
          "Animated 2.4 GHz RF spectrum analyzer with waterfall history, peak power and noise floor readout.",
      },
      { property: "og:title", content: "RF Spectrum Analyzer — Smart Helmet" },
      { property: "og:description", content: "Simulated wideband RF spectrum and waterfall view." },
    ],
  }),
  component: Spectrum,
});

const HISTORY = 40;

function Spectrum() {
  const { snapshot, running } = useSystem();
  const frame = snapshot?.spectrum;
  const peak = frame ? Math.max(...frame.bins) : null;
  const peakIdx = frame && peak !== null ? frame.bins.indexOf(peak) : -1;
  const peakMhz =
    frame && peakIdx >= 0
      ? frame.start_mhz + (peakIdx / (frame.bins.length - 1)) * (frame.stop_mhz - frame.start_mhz)
      : null;

  return (
    <div className="space-y-4">
      <h1 className="font-mono text-lg tracking-[0.16em]">RF SPECTRUM</h1>

      <div className="grid gap-4 sm:grid-cols-4">
        <Panel title="Span">
          <Metric
            label="MHz"
            value={frame ? `${frame.start_mhz}–${frame.stop_mhz}` : "—"}
          />
        </Panel>
        <Panel title="Peak power">
          <Metric label="dBm" value={peak !== null ? peak.toFixed(1) : "—"} tone="signal" />
        </Panel>
        <Panel title="Peak frequency">
          <Metric label="MHz" value={peakMhz ? peakMhz.toFixed(1) : "—"} />
        </Panel>
        <Panel title="Noise floor">
          <Metric label="dBm" value={`${frame?.noise_floor ?? "—"}`} tone="idle" />
        </Panel>
      </div>

      <Panel title={running ? "Live FFT — streaming" : "Live FFT — stopped"}>
        {frame ? <SpectrumChart frame={frame} height={320} /> : <p className="label-hud">NO DATA</p>}
      </Panel>

      <Panel title="Waterfall (recent frames)">
        <Waterfall frame={frame?.bins ?? []} />
      </Panel>
    </div>
  );
}

function Waterfall({ frame }: { frame: number[] }) {
  const historyRef = useHistory(frame);
  return (
    <div className="space-y-px">
      {historyRef.map((row, r) => (
        <div key={r} className="flex h-1.5 gap-px">
          {row.map((v, i) => {
            const intensity = Math.max(0, Math.min(1, (v + 92) / 45));
            return (
              <span
                key={i}
                className="flex-1"
                style={{
                  backgroundColor: `color-mix(in oklab, var(--color-signal) ${Math.round(
                    intensity * 100,
                  )}%, transparent)`,
                }}
              />
            );
          })}
        </div>
      ))}
      {historyRef.length === 0 ? <p className="label-hud">NO FRAMES</p> : null}
    </div>
  );
}

import { useEffect, useState } from "react";

function useHistory(frame: number[]) {
  const [history, setHistory] = useState<number[][]>([]);
  useEffect(() => {
    if (frame.length === 0) return;
    setHistory((h) => [frame, ...h].slice(0, HISTORY));
  }, [frame]);
  return history;
}
