"use client";
export function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.min(100, (current / total) * 100);
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-xs text-white/60">
        <span>Pregunta {current} de {total}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-mint to-info transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
