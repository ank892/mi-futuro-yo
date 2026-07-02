"use client";
import { useEffect, useState } from "react";

interface Props {
  value: number; // 0..100
  size?: number;
  label?: string;
}

export function ScoreRing({ value, size = 220, label }: Props) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 1200;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayed(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - displayed / 100);
  const colorStop =
    value >= 75 ? "#44F5BA" : value >= 55 ? "#3D4FE8" : value >= 35 ? "#FF8A65" : "#EF4444";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colorStop} stopOpacity="0.9" />
            <stop offset="100%" stopColor="#44F5BA" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#scoreGrad)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 200ms linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-6xl font-black tabular-nums text-white">{displayed}</div>
        {label && <div className="mt-1 text-sm font-medium text-mint">{label}</div>}
      </div>
    </div>
  );
}
