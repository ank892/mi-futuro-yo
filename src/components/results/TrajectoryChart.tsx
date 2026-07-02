"use client";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import type { WealthTrajectory } from "@/lib/types";

export function TrajectoryChart({ traj }: { traj: WealthTrajectory }) {
  const data = traj.points.map((p) => ({
    year: p.year,
    Actual: p.current_path,
    Optimizado: p.optimized,
    Adverso: p.adverse,
  }));
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 12, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis
            stroke="rgba(255,255,255,0.5)"
            fontSize={11}
            tickFormatter={(v) => (v >= 1000 ? `$${Math.round(v / 1000)}K` : `$${v}`)}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(15,27,61,0.95)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 12,
              color: "#fff",
            }}
            formatter={(v: any) => `$${Number(v).toLocaleString()} USD`}
          />
          <Legend wrapperStyle={{ color: "#fff", fontSize: 12 }} />
          <Line type="monotone" dataKey="Optimizado" stroke="#44F5BA" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="Actual" stroke="#3D4FE8" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Adverso" stroke="#FF8A65" strokeWidth={2} strokeDasharray="5 5" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
