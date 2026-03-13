import { BODY_REGIONS } from "./grove-data";

interface BodyMapProps {
  selectedRegion: string | null;
  regionTension: Record<string, number>;
  completedRegions: Set<string>;
  onSelectRegion: (regionId: string) => void;
}

interface RegionDef {
  x: number;
  y: number;
  w: number;
  h: number;
  rx: number;
}

const REGION_RECTS: Record<string, RegionDef> = {
  head:      { x: 41, y: 2,  w: 18, h: 18, rx: 9 },
  throat:    { x: 43, y: 23, w: 14, h: 10, rx: 4 },
  shoulders: { x: 24, y: 36, w: 52, h: 12, rx: 5 },
  chest:     { x: 36, y: 51, w: 28, h: 16, rx: 5 },
  stomach:   { x: 38, y: 70, w: 24, h: 14, rx: 5 },
  hands:     { x: 14, y: 56, w: 16, h: 16, rx: 5 },
  legs:      { x: 33, y: 88, w: 34, h: 24, rx: 5 },
  feet:      { x: 33, y: 116, w: 34, h: 14, rx: 5 },
};

export function BodyMap({ selectedRegion, regionTension, completedRegions, onSelectRegion }: BodyMapProps) {
  const getTensionColor = (tension: number) => {
    if (tension === 0) return "rgba(100, 160, 100, 0.15)";
    if (tension <= 3) return "rgba(100, 180, 100, 0.3)";
    if (tension <= 5) return "rgba(200, 180, 60, 0.35)";
    if (tension <= 7) return "rgba(220, 140, 60, 0.4)";
    return "rgba(200, 80, 60, 0.45)";
  };

  const getStroke = (regionId: string, tension: number) => {
    const isSelected = selectedRegion === regionId;
    const isCompleted = completedRegions.has(regionId);
    if (isSelected) return { color: "rgba(100, 200, 100, 0.8)", width: 1.5 };
    if (isCompleted) return { color: "rgba(100, 200, 100, 0.5)", width: 1 };
    if (tension > 5) return { color: "rgba(220, 140, 60, 0.4)", width: 0.8 };
    return { color: "rgba(212, 232, 208, 0.2)", width: 0.6 };
  };

  return (
    <div style={{ width: "100%", maxWidth: 320, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <svg
        viewBox="0 0 100 135"
        style={{ width: "100%", maxHeight: "100%", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))" }}
      >
        <ellipse cx="50" cy="11" rx="7" ry="9" fill="rgba(212, 232, 208, 0.04)" stroke="rgba(212, 232, 208, 0.1)" strokeWidth="0.4" />
        <line x1="50" y1="20" x2="50" y2="84" stroke="rgba(212, 232, 208, 0.08)" strokeWidth="3.5" strokeLinecap="round" />

        <line x1="50" y1="38" x2="22" y2="68" stroke="rgba(212, 232, 208, 0.08)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="50" y1="38" x2="78" y2="68" stroke="rgba(212, 232, 208, 0.08)" strokeWidth="2.5" strokeLinecap="round" />

        <line x1="50" y1="84" x2="38" y2="125" stroke="rgba(212, 232, 208, 0.08)" strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="84" x2="62" y2="125" stroke="rgba(212, 232, 208, 0.08)" strokeWidth="3" strokeLinecap="round" />

        <line x1="50" y1="38" x2="78" y2="68" stroke="rgba(212, 232, 208, 0.08)" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="70" y="56" width="16" height="16" rx="5" fill="none" stroke="none" />

        {BODY_REGIONS.map((region) => {
          const r = REGION_RECTS[region.id];
          if (!r) return null;
          const tension = regionTension[region.id] || 0;
          const isSelected = selectedRegion === region.id;
          const isCompleted = completedRegions.has(region.id);
          const stroke = getStroke(region.id, tension);

          const showHands2 = region.id === "hands";

          return (
            <g key={region.id}>
              <rect
                x={r.x}
                y={r.y}
                width={r.w}
                height={r.h}
                rx={r.rx}
                fill={isSelected ? "rgba(100, 180, 100, 0.3)" : getTensionColor(tension)}
                stroke={stroke.color}
                strokeWidth={stroke.width}
                style={{ cursor: "pointer", transition: "all 0.25s ease" }}
                onClick={() => onSelectRegion(region.id)}
                data-testid={`button-body-${region.id}`}
              />
              {showHands2 && (
                <rect
                  x={100 - r.x - r.w}
                  y={r.y}
                  width={r.w}
                  height={r.h}
                  rx={r.rx}
                  fill={isSelected ? "rgba(100, 180, 100, 0.3)" : getTensionColor(tension)}
                  stroke={stroke.color}
                  strokeWidth={stroke.width}
                  style={{ cursor: "pointer", transition: "all 0.25s ease" }}
                  onClick={() => onSelectRegion(region.id)}
                />
              )}

              <text
                x={r.x + r.w / 2}
                y={r.y + r.h * 0.42}
                textAnchor="middle"
                dominantBaseline="central"
                style={{ fontSize: r.h > 14 ? 7 : 5.5, pointerEvents: "none", userSelect: "none" }}
              >
                {isCompleted ? "\u2705" : region.emoji}
              </text>
              <text
                x={r.x + r.w / 2}
                y={r.y + r.h * 0.75}
                textAnchor="middle"
                dominantBaseline="central"
                fill="rgba(212, 232, 208, 0.7)"
                style={{ fontSize: 3.8, fontWeight: 600, pointerEvents: "none", userSelect: "none", fontFamily: "Inter, sans-serif" }}
              >
                {region.name.split(" ")[0]}
              </text>

              {showHands2 && (
                <>
                  <text
                    x={100 - r.x - r.w / 2}
                    y={r.y + r.h * 0.42}
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{ fontSize: 5.5, pointerEvents: "none", userSelect: "none" }}
                  >
                    {isCompleted ? "\u2705" : region.emoji}
                  </text>
                  <text
                    x={100 - r.x - r.w / 2}
                    y={r.y + r.h * 0.75}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="rgba(212, 232, 208, 0.7)"
                    style={{ fontSize: 3.8, fontWeight: 600, pointerEvents: "none", userSelect: "none", fontFamily: "Inter, sans-serif" }}
                  >
                    Hands
                  </text>
                </>
              )}

              {tension > 0 && !isCompleted && (
                <text
                  x={r.x + r.w / 2}
                  y={r.y + r.h - 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={tension > 5 ? "rgba(220, 140, 60, 0.9)" : "rgba(212, 232, 208, 0.5)"}
                  style={{ fontSize: 3, fontWeight: 500, pointerEvents: "none", userSelect: "none", fontFamily: "Inter, sans-serif" }}
                >
                  {tension}/10
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
