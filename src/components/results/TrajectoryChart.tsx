"use client";
import {
  ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceDot, ReferenceLine,
} from "recharts";
import type { WealthTrajectory } from "@/lib/types";

function fmtY(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1000)}K`;
  return `$${v}`;
}
function fmtTip(v: number): string {
  return `$${Math.round(v).toLocaleString()} USD`;
}

export function TrajectoryChart({ traj }: { traj: WealthTrajectory }) {
  const data = traj.points.map((p) => ({
    year: p.year,
    Actual: p.current_path,
    Optimizado: p.optimized,
    Adverso: p.adverse,
    // banda entre optimizado y actual
    _band: [p.current_path, p.optimized],
  }));
  const start = data[0]?.year ?? new Date().getFullYear();
  const midYear = data[Math.floor(data.length / 2)]?.year ?? start;
  const finalYear = data[data.length - 1]?.year ?? start + 20;

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id="gOpt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#44F5BA" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#44F5BA" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gAdv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF8A65" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#FF8A65" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis
            dataKey="year"
            stroke="rgba(255,255,255,0.55)"
            fontSize={11}
            tickMargin={6}
            ticks={[start, midYear, finalYear]}
          />
          <YAxis
            stroke="rgba(255,255,255,0.55)"
            fontSize={11}
            tickFormatter={fmtY}
            width={55}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(15,27,61,0.96)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 12,
              color: "#fff",
              fontSize: 12,
            }}
            labelStyle={{ color: "#fff", fontWeight: 600 }}
            formatter={(v: any, name: any) => (typeof name === "string" && name.startsWith("_") ? null : [fmtTip(Number(v)), name])}
          />
          <Legend
            wrapperStyle={{ color: "#fff", fontSize: 12, paddingTop: 8 }}
            iconType="line"
            formatter={(v: any) => (typeof v === "string" && v.startsWith("_") ? null : v)}
          />
          {/* Área optimizada (fondo) */}
          <Area
            type="monotone"
            dataKey="Optimizado"
            stroke="none"
            fill="url(#gOpt)"
            fillOpacity={1}
            isAnimationActive={false}
          />
          {/* Área adversa */}
          <Area
            type="monotone"
            dataKey="Adverso"
            stroke="none"
            fill="url(#gAdv)"
            fillOpacity={1}
            isAnimationActive={false}
          />
          {/* Líneas */}
          <Line type="monotone" dataKey="Optimizado" stroke="#44F5BA" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="Actual" stroke="#8FA3FF" strokeWidth={2.2} dot={false} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="Adverso" stroke="#FF8A65" strokeWidth={2} strokeDasharray="6 4" dot={false} activeDot={{ r: 4 }} />
          {/* "Estás aquí" marker */}
          <ReferenceLine x={start} stroke="rgba(255,255,255,0.35)" strokeDasharray="2 4" label={{ value: "Hoy", position: "insideTopLeft", fill: "#fff", fontSize: 10 }} />
          <ReferenceDot x={finalYear} y={traj.final_optimized} r={5} fill="#44F5BA" stroke="#0F1B3D" strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
