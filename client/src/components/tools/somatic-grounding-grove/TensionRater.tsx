import { useState } from "react";
import type { BodyRegion } from "./grove-data";

interface TensionRaterProps {
  region: BodyRegion;
  currentTension: number;
  onRate: (tension: number) => void;
}

export function TensionRater({ region, currentTension, onRate }: TensionRaterProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  const displayValue = hoveredValue ?? currentTension;

  const getBarColor = (value: number) => {
    if (value <= 3) return "#4ade80";
    if (value <= 5) return "#facc15";
    if (value <= 7) return "#fb923c";
    return "#f87171";
  };

  return (
    <div style={{ padding: "16px 20px", background: "rgba(212, 232, 208, 0.04)", borderRadius: 12, border: "1px solid rgba(100, 160, 100, 0.15)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>{region.emoji}</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#d4e8d0" }}>{region.name}</div>
          <div style={{ fontSize: 11, color: "rgba(212, 232, 208, 0.5)" }}>How much tension do you feel here?</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
          <button
            key={value}
            onClick={() => onRate(value)}
            onMouseEnter={() => setHoveredValue(value)}
            onMouseLeave={() => setHoveredValue(null)}
            data-testid={`button-tension-${value}`}
            style={{
              flex: 1,
              height: 32,
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              background: value <= displayValue ? getBarColor(value) : "rgba(212, 232, 208, 0.08)",
              transition: "all 0.15s ease",
              opacity: value <= displayValue ? 1 : 0.4,
              transform: value <= displayValue ? "scaleY(1)" : "scaleY(0.85)",
            }}
          />
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(212, 232, 208, 0.4)" }}>
        <span>No tension</span>
        <span>{displayValue > 0 ? `${displayValue}/10` : "Tap to rate"}</span>
        <span>Very tense</span>
      </div>
    </div>
  );
}
