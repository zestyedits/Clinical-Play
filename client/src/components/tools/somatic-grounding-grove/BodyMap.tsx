import { BODY_REGIONS, type BodyRegion } from "./grove-data";

interface BodyMapProps {
  selectedRegion: string | null;
  regionTension: Record<string, number>;
  completedRegions: Set<string>;
  onSelectRegion: (regionId: string) => void;
}

export function BodyMap({ selectedRegion, regionTension, completedRegions, onSelectRegion }: BodyMapProps) {
  const getTensionColor = (tension: number) => {
    if (tension === 0) return "rgba(100, 160, 100, 0.15)";
    if (tension <= 3) return "rgba(100, 180, 100, 0.35)";
    if (tension <= 5) return "rgba(200, 180, 60, 0.4)";
    if (tension <= 7) return "rgba(220, 140, 60, 0.45)";
    return "rgba(200, 80, 60, 0.5)";
  };

  const getTensionGlow = (tension: number) => {
    if (tension <= 3) return "0 0 8px rgba(100, 180, 100, 0.3)";
    if (tension <= 5) return "0 0 12px rgba(200, 180, 60, 0.3)";
    if (tension <= 7) return "0 0 14px rgba(220, 140, 60, 0.3)";
    return "0 0 16px rgba(200, 80, 60, 0.4)";
  };

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 280, height: "100%", maxHeight: 520, margin: "0 auto" }}>
      <svg viewBox="0 0 100 85" style={{ width: "100%", height: "100%", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.2))" }}>
        <ellipse cx="50" cy="8" rx="7" ry="8" fill="rgba(212, 232, 208, 0.08)" stroke="rgba(212, 232, 208, 0.2)" strokeWidth="0.5" />
        <line x1="50" y1="16" x2="50" y2="50" stroke="rgba(212, 232, 208, 0.15)" strokeWidth="4" strokeLinecap="round" />
        <line x1="50" y1="22" x2="30" y2="42" stroke="rgba(212, 232, 208, 0.15)" strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="22" x2="70" y2="42" stroke="rgba(212, 232, 208, 0.15)" strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="50" x2="38" y2="82" stroke="rgba(212, 232, 208, 0.15)" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="50" y1="50" x2="62" y2="82" stroke="rgba(212, 232, 208, 0.15)" strokeWidth="3.5" strokeLinecap="round" />
      </svg>

      {BODY_REGIONS.map((region) => {
        const tension = regionTension[region.id] || 0;
        const isSelected = selectedRegion === region.id;
        const isCompleted = completedRegions.has(region.id);

        return (
          <button
            key={region.id}
            onClick={() => onSelectRegion(region.id)}
            data-testid={`button-body-${region.id}`}
            style={{
              position: "absolute",
              left: `${region.x}%`,
              top: `${region.y}%`,
              width: `${region.width}%`,
              height: `${region.height}%`,
              background: isSelected
                ? "rgba(100, 180, 100, 0.3)"
                : getTensionColor(tension),
              border: isSelected
                ? "2px solid rgba(100, 200, 100, 0.7)"
                : isCompleted
                  ? "2px solid rgba(100, 200, 100, 0.4)"
                  : "1.5px solid rgba(212, 232, 208, 0.15)",
              borderRadius: region.id === "head" ? "50%" : 8,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              transition: "all 0.25s ease",
              boxShadow: isSelected
                ? "0 0 20px rgba(100, 200, 100, 0.3)"
                : tension > 0
                  ? getTensionGlow(tension)
                  : "none",
              backdropFilter: "blur(4px)",
              padding: 2,
            }}
          >
            <span style={{ fontSize: "clamp(10px, 2vw, 14px)", lineHeight: 1 }}>
              {isCompleted ? "\u2705" : region.emoji}
            </span>
            <span style={{ fontSize: "clamp(6px, 1.2vw, 8px)", color: "rgba(212, 232, 208, 0.7)", fontWeight: 600, whiteSpace: "nowrap" }}>
              {region.name.split(" ")[0]}
            </span>
            {tension > 0 && !isCompleted && (
              <span style={{ fontSize: "clamp(6px, 1vw, 7px)", color: tension > 5 ? "rgba(220, 140, 60, 0.9)" : "rgba(212, 232, 208, 0.5)" }}>
                {tension}/10
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
