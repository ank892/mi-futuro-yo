"use client";
import type { WealthNarrative, WealthLevel } from "@/lib/types";
import { GlassCard } from "@/components/ui/GlassCard";

export function PersonalNarrative({
  narrative,
  level,
}: {
  narrative: WealthNarrative;
  level: WealthLevel;
}) {
  return (
    <GlassCard className="relative overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: `linear-gradient(90deg, ${level.color}, transparent)` }}
      />
      <div className="mb-3 flex items-center gap-3">
        <span className="text-3xl">{level.emoji}</span>
        <div>
          <div className="text-xs uppercase tracking-widest text-white/50">Tu historia</div>
          <div className="text-lg font-bold" style={{ color: level.color }}>
            Nivel {level.name}
          </div>
        </div>
      </div>
      <p className="mb-4 text-[15px] leading-relaxed text-white/90">
        {narrative.story_paragraph}
      </p>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-1 text-xs uppercase tracking-widest text-mint">
          Mensaje de tu Futuro Yo
        </div>
        <p className="text-sm italic text-white/85">"{narrative.future_self_message}"</p>
      </div>
      {narrative.celebration_hook ? (
        <p className="mt-3 text-sm font-semibold text-mint">🏆 {narrative.celebration_hook}</p>
      ) : (
        <p className="mt-3 text-sm text-coral">⏳ {narrative.urgency_hook}</p>
      )}
    </GlassCard>
  );
}
