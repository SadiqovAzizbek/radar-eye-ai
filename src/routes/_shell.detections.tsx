import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/hud/Panel";
import { useSystem } from "@/hooks/useSystem";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/detections")({
  head: () => ({
    meta: [
      { title: "Detection Log — Smart Helmet UAV Detection" },
      {
        name: "description",
        content:
          "Chronological log of simulated RF detection events with confidence, band and classification.",
      },
      { property: "og:title", content: "Detection Log — Smart Helmet" },
      {
        property: "og:description",
        content: "Every classified RF event with confidence and signal strength.",
      },
    ],
  }),
  component: Detections,
});

function Detections() {
  const { snapshot, settings } = useSystem();
  const rows = snapshot?.detections ?? [];
  const high = rows.filter((r) => r.signal_strength === "HIGH").length;

  return (
    <div className="space-y-4">
      <h1 className="font-mono text-lg tracking-[0.16em]">DETECTION LOG</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Panel title="Total events">
          <p className="font-mono text-3xl tabular-nums">{rows.length}</p>
        </Panel>
        <Panel title="High-strength">
          <p className="font-mono text-3xl tabular-nums text-alert">{high}</p>
        </Panel>
        <Panel title="Active threshold">
          <p className="font-mono text-3xl tabular-nums text-signal">
            {Math.round(settings.threshold * 100)}%
          </p>
        </Panel>
      </div>

      <Panel title="Events (newest first)" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-border">
                {["TIME", "ID", "CLASSIFICATION", "BAND", "STRENGTH", "CONF", "BEARING", "SRC"].map(
                  (h) => (
                    <th key={h} className="label-hud px-3 py-2 font-normal">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} className="border-b border-border/60 hover:bg-accent/40">
                  <td className="px-3 py-2 text-muted-foreground">
                    {new Date(d.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-3 py-2">{d.id}</td>
                  <td className="px-3 py-2">{d.classification}</td>
                  <td className="px-3 py-2">{d.band}</td>
                  <td
                    className={cn(
                      "px-3 py-2",
                      d.signal_strength === "HIGH" && "text-alert",
                      d.signal_strength === "MEDIUM" && "text-warn",
                      d.signal_strength === "LOW" && "text-signal",
                    )}
                  >
                    {d.signal_strength}
                  </td>
                  <td className="px-3 py-2 tabular-nums">{Math.round(d.confidence * 100)}%</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {d.direction === null ? "N/A" : `${d.direction}°`}
                  </td>
                  <td className="px-3 py-2 text-idle">{d.source}</td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="label-hud px-3 py-6">
                    NO EVENTS — START THE SIMULATION FROM THE HEADER
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
