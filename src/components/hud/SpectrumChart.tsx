import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { SpectrumFrame } from "@/lib/types";

export function SpectrumChart({ frame, height = 240 }: { frame: SpectrumFrame; height?: number }) {
  const span = frame.stop_mhz - frame.start_mhz;
  const data = frame.bins.map((dbm, i) => ({
    mhz: Math.round(frame.start_mhz + (i / (frame.bins.length - 1)) * span),
    dbm: Number(dbm.toFixed(1)),
  }));

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} baseValue={-100} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id="spectrumFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-signal)" stopOpacity={0.55} />
              <stop offset="100%" stopColor="var(--color-signal)" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-grid)" vertical={false} />
          <XAxis
            dataKey="mhz"
            tick={{ fontSize: 10, fill: "var(--color-muted-foreground)", fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--color-border)" }}
            minTickGap={40}
            unit=" MHz"
          />
          <YAxis
            domain={[-100, -35]}
            tick={{ fontSize: 10, fill: "var(--color-muted-foreground)", fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={false}
            width={44}
            unit=" dBm"
          />
          <ReferenceLine
            y={frame.noise_floor}
            stroke="var(--color-idle)"
            strokeDasharray="4 4"
            strokeOpacity={0.7}
          />
          <Area
            type="monotone"
            dataKey="dbm"
            stroke="var(--color-signal)"
            strokeWidth={1.5}
            fill="url(#spectrumFill)"
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
