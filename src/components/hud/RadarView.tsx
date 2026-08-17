import { cn } from "@/lib/utils";
import type { StatusFrame } from "@/lib/types";

export function RadarView({
  status,
  running,
  size = 260,
}: {
  status: StatusFrame;
  running: boolean;
  size?: number;
}) {
  const detected = status.signal_detected;
  const radiusPct = 18 + (1 - status.confidence) * 28;
  const bearing = status.direction ?? 45;

  return (
    <div
      className="relative mx-auto aspect-square"
      style={{ width: size, maxWidth: "100%" }}
      aria-label="Radar visualization"
    >
      <div className="absolute inset-0 rounded-full border border-border bg-background/40" />
      {[0.72, 0.46, 0.22].map((s) => (
        <div
          key={s}
          className="absolute rounded-full border border-grid"
          style={{
            inset: `${((1 - s) / 2) * 100}%`,
          }}
        />
      ))}
      <div className="absolute top-1/2 left-0 h-px w-full bg-grid" />
      <div className="absolute top-0 left-1/2 h-full w-px bg-grid" />

      {running ? (
        <div
          className="radar-sweep absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, color-mix(in oklab, var(--color-signal) 32%, transparent) 0deg, transparent 55deg, transparent 360deg)",
          }}
        />
      ) : null}

      {detected ? (
        <div
          className="absolute"
          style={{
            left: `${50 + radiusPct * Math.cos((bearing * Math.PI) / 180)}%`,
            top: `${50 - radiusPct * Math.sin((bearing * Math.PI) / 180)}%`,
            transform: "translate(-50%,-50%)",
          }}
        >
          <span className="pulse-ring absolute -inset-3 rounded-full border border-alert" />
          <span className="block size-2.5 rounded-full bg-alert" />
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-2 text-center">
        <span
          className={cn(
            "label-hud",
            detected ? "text-alert" : running ? "text-signal" : "text-muted-foreground",
          )}
        >
          {detected ? "CONTACT" : running ? "SCANNING" : "IDLE"}
        </span>
      </div>
      <p className="absolute inset-x-0 -bottom-6 text-center text-[10px] font-mono text-muted-foreground">
        BEARING UNAVAILABLE — OMNIDIRECTIONAL ANTENNA
      </p>
    </div>
  );
}
