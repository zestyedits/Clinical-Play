import type { AgeMode, BodyRegion } from "./meadow-data";
import { BODY_REGIONS } from "./meadow-data";

interface BodyScanStepProps {
  selectedRegions: BodyRegion[];
  onToggleRegion: (r: BodyRegion) => void;
  ageMode: AgeMode;
}

const PROMPTS: Record<AgeMode, string> = {
  child: "Which parts of your body feel tight, heavy, or uncomfortable right now? Tap to mark them.",
  teen: "Where in your body do you notice stress, tension, or discomfort? Tap each area.",
  adult: "Which parts of your body are holding tension right now? Tap to mark each region.",
};

export function BodyScanStep({ selectedRegions, onToggleRegion, ageMode }: BodyScanStepProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p
        style={{
          fontSize: 13,
          color: "rgba(232, 220, 200, 0.65)",
          margin: 0,
          lineHeight: 1.6,
        }}
      >
        {PROMPTS[ageMode]}
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        {BODY_REGIONS.map(({ id, label, emoji }) => {
          const isSelected = selectedRegions.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => onToggleRegion(id)}
              style={{
                flex: "1 1 calc(33% - 10px)",
                minWidth: 100,
                background: isSelected
                  ? "rgba(91, 168, 196, 0.2)"
                  : "rgba(232, 220, 200, 0.04)",
                border: isSelected
                  ? "1px solid rgba(91, 168, 196, 0.5)"
                  : "1px solid rgba(232, 220, 200, 0.1)",
                borderRadius: 12,
                padding: "14px 10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: isSelected ? "0 0 12px rgba(91, 168, 196, 0.15)" : "none",
              }}
            >
              <span style={{ fontSize: 28 }}>{emoji}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: isSelected ? "#7ec8e3" : "rgba(232, 220, 200, 0.55)",
                  fontFamily: "Inter, sans-serif",
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "10px 16px",
          background: "rgba(91, 168, 196, 0.06)",
          borderRadius: 10,
          border: "1px solid rgba(91, 168, 196, 0.12)",
        }}
      >
        <span style={{ fontSize: 16 }}>🫀</span>
        <span
          style={{
            fontSize: 13,
            color:
              selectedRegions.length > 0
                ? "rgba(91, 168, 196, 0.9)"
                : "rgba(232, 220, 200, 0.35)",
            fontWeight: 500,
          }}
        >
          {selectedRegions.length === 0
            ? "No areas selected yet"
            : `${selectedRegions.length} area${selectedRegions.length === 1 ? "" : "s"} selected`}
        </span>
      </div>

      {selectedRegions.length === 0 && (
        <p style={{ fontSize: 11, color: "rgba(91, 168, 196, 0.6)", margin: 0, textAlign: "center" }}>
          Select at least 1 area to continue.
        </p>
      )}
    </div>
  );
}
