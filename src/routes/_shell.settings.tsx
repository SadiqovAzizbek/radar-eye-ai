import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/hud/Panel";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useSystem } from "@/hooks/useSystem";

export const Route = createFileRoute("/_shell/settings")({
  head: () => ({
    meta: [
      { title: "Operator Settings — Smart Helmet" },
      {
        name: "description",
        content:
          "Configure detection threshold, audio and visual alerts, simulation mode and display theme for the Smart Helmet prototype.",
      },
      { property: "og:title", content: "Operator Settings — Smart Helmet" },
      { property: "og:description", content: "Alerting, threshold and simulation configuration." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, setSetting, running, stop, start } = useSystem();

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="font-mono text-lg tracking-[0.16em]">SETTINGS</h1>

      <Panel title="Detection threshold">
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="label-hud">Minimum confidence to declare a contact</span>
            <span className="font-mono text-xl tabular-nums text-signal">
              {Math.round(settings.threshold * 100)}%
            </span>
          </div>
          <Slider
            value={[settings.threshold * 100]}
            min={10}
            max={95}
            step={1}
            onValueChange={([v]) => setSetting("threshold", (v ?? 60) / 100)}
          />
          <p className="text-xs text-muted-foreground">
            Lower values increase sensitivity and false positives. Higher values report only strong RF
            signatures.
          </p>
        </div>
      </Panel>

      <Panel title="Alerts" bodyClassName="p-0">
        <Row
          label="AUDIO ALERTS"
          desc="Short tone when a new contact is classified"
          checked={settings.audioAlerts}
          onChange={(v) => setSetting("audioAlerts", v)}
        />
        <Row
          label="VISUAL ALERTS"
          desc="Header flash on new detection"
          checked={settings.visualAlerts}
          onChange={(v) => setSetting("visualAlerts", v)}
        />
      </Panel>

      <Panel title="System" bodyClassName="p-0">
        <Row
          label="SIMULATION MODE"
          desc="MVP only — real SDR ingest is not available yet"
          checked={settings.simulationMode}
          onChange={(v) => {
            setSetting("simulationMode", v);
            if (!v) stop();
            else if (running) start();
          }}
        />
        <Row
          label="DARK MODE"
          desc="Tactical low-light theme (default)"
          checked={settings.darkMode}
          onChange={(v) => setSetting("darkMode", v)}
        />
      </Panel>

      <p className="font-mono text-[10px] tracking-[0.14em] text-warn">
        SIMULATION MODE — NO REAL RF SENSOR CONNECTED. TECHNOLOGY DEMONSTRATION AND SOFTWARE MVP.
      </p>
    </div>
  );
}

function Row({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-4 border-b border-border/60 px-3 py-3 last:border-0">
      <span className="min-w-0">
        <span className="block font-mono text-xs tracking-[0.12em]">{label}</span>
        <span className="block text-xs text-muted-foreground">{desc}</span>
      </span>
      <Switch className="ml-auto" checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
