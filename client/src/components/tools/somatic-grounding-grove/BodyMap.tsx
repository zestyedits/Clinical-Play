import { BODY_REGIONS } from "./grove-data";

interface BodyMapProps {
  selectedRegion: string | null;
  regionTension: Record<string, number>;
  completedRegions: Set<string>;
  onSelectRegion: (regionId: string) => void;
}

const REGION_LAYOUT: Record<string, { x: number; y: number; w: number; h: number }> = {
  head:      { x: 37, y: 0,  w: 26, h: 9 },
  throat:    { x: 39, y: 11, w: 22, h: 7 },
  shoulders: { x: 22, y: 20, w: 56, h: 7 },
  chest:     { x: 32, y: 29, w: 36, h: 10 },
  stomach:   { x: 35, y: 41, w: 30, h: 9 },
  hands:     { x: 10, y: 41, w: 18, h: 9 },
  legs:      { x: 30, y: 55, w: 40, h: 16 },
  feet:      { x: 30, y: 76, w: 40, h: 9 },
};

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
    <div style={{ position: "relative", width: "100%", maxWidth: 300, margin: "0 auto", aspectRatio: "3 / 5" }}>
      <svg viewBox="0 0 120 200" preserveAspectRatio="xMidYMid meet" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.2))" }}>
        <ellipse cx="60" cy="12" rx="10" ry="12" fill="rgba(212, 232, 208, 0.06)" stroke="rgba(212, 232, 208, 0.15)" strokeWidth="0.6" />
        <line x1="60" y1="24" x2="60" y2="100" stroke="rgba(212, 232, 208, 0.12)" strokeWidth="5" strokeLinecap="round" />
        <line x1="60" y1="42" x2="25" y2="90" stroke="rgba(212, 232, 208, 0.12)" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="60" y1="42" x2="95" y2="90" stroke="rgba(212, 232, 208, 0.12)" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="60" y1="100" x2="42" y2="180" stroke="rgba(212, 232, 208, 0.12)" strokeWidth="4" strokeLinecap="round" />
        <line x1="60" y1="100" x2="78" y2="180" stroke="rgba(212, 232, 208, 0.12)" strokeWidth="4" strokeLinecap="round" />
      </svg>

      {BODY_REGIONS.map((region) => {
        const layout = REGION_LAYOUT[region.id];
        if (!layout) return null;
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
              left: `${layout.x}%`,
              top: `${layout.y}%`,
              width: `${layout.w}%`,
              height: `${layout.h}%`,
              background: isSelected
                ? "rgba(100, 180, 100, 0.3)"
                : getTensionColor(tension),
              border: isSelected
                ? "2px solid rgba(100, 200, 100, 0.7)"
                : isCompleted
                  ? "2px solid rgba(100, 200, 100, 0.4)"
                  : "1.5px solid rgba(212, 232, 208, 0.15)",
              borderRadius: region.id === "head" ? "50%" : 10,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
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
            <span style={{ fontSize: "clamp(11px, 2.5vw, 16px)", lineHeight: 1 }}>
              {isCompleted ? "\u2705" : region.emoji}
            </span>
            <span style={{ fontSize: "clamp(7px, 1.4vw, 9px)", color: "rgba(212, 232, 208, 0.7)", fontWeight: 600, whiteSpace: "nowrap" }}>
              {region.name.split(" ")[0]}
            </span>
            {tension > 0 && !isCompleted && (
              <span style={{ fontSize: "clamp(6px, 1.1vw, 7px)", color: tension > 5 ? "rgba(220, 140, 60, 0.9)" : "rgba(212, 232, 208, 0.5)" }}>
                {tension}/10
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
