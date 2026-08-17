import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  right,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("panel-hud flex flex-col", className)}>
      {title ? (
        <header className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
          <h2 className="label-hud">{title}</h2>
          {right}
        </header>
      ) : null}
      <div className={cn("flex-1 p-3", bodyClassName)}>{children}</div>
    </section>
  );
}

export function Metric({
  label,
  value,
  unit,
  tone = "default",
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: "default" | "signal" | "warn" | "alert" | "idle";
}) {
  const toneClass = {
    default: "text-foreground",
    signal: "text-signal",
    warn: "text-warn",
    alert: "text-alert",
    idle: "text-idle",
  }[tone];
  return (
    <div>
      <div className="label-hud">{label}</div>
      <div className={cn("font-mono text-2xl leading-tight tabular-nums", toneClass)}>
        {value}
        {unit ? <span className="ml-1 text-xs text-muted-foreground">{unit}</span> : null}
      </div>
    </div>
  );
}

export function StatusDot({ status }: { status: "OK" | "DEGRADED" | "OFFLINE" }) {
  const color =
    status === "OK" ? "bg-signal" : status === "DEGRADED" ? "bg-warn" : "bg-muted-foreground";
  return <span className={cn("inline-block size-2 rounded-full", color)} aria-hidden />;
}
