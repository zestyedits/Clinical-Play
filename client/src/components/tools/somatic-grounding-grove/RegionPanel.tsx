import { BODY_REGIONS } from "./grove-data";
import { TensionRater } from "./TensionRater";
import { TechniqueCard } from "./TechniqueCard";

interface RegionPanelProps {
  selectedRegion: string | null;
  regionTension: Record<string, number>;
  completedTechniques: Set<string>;
  completedRegions: Set<string>;
  onRateTension: (regionId: string, tension: number) => void;
  onCompleteTechnique: (regionId: string, techniqueId: string) => void;
  onClose: () => void;
}

export function RegionPanel({
  selectedRegion,
  regionTension,
  completedTechniques,
  completedRegions,
  onRateTension,
  onCompleteTechnique,
  onClose,
}: RegionPanelProps) {
  const region = BODY_REGIONS.find((r) => r.id === selectedRegion);
  if (!region) return null;

  const tension = regionTension[region.id] || 0;
  const regionCompleted = completedRegions.has(region.id);
  const regionTechCompleted = region.groundingTechniques.filter(t => completedTechniques.has(t.id)).length;

  return (
    <div
      className="tool-game-side-panel"
      style={{
        width: 320,
        background: "rgba(26, 42, 26, 0.96)",
        borderLeft: "1px solid rgba(100, 160, 100, 0.15)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
        backdropFilter: "blur(10px)",
      }}
    >
      <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(100, 160, 100, 0.12)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#d4e8d0", display: "flex", alignItems: "center", gap: 6 }}>
            <span>{region.emoji}</span> {region.name}
            {regionCompleted && <span style={{ fontSize: 12 }}>{"\u2705"}</span>}
          </div>
          <div style={{ fontSize: 10, color: "rgba(212, 232, 208, 0.4)", marginTop: 2 }}>
            {regionTechCompleted}/{region.groundingTechniques.length} techniques practiced
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close region panel"
          style={{
            background: "rgba(212, 232, 208, 0.06)",
            border: "1px solid rgba(100, 160, 100, 0.15)",
            borderRadius: 8,
            padding: "8px 12px",
            minWidth: 44,
            minHeight: 44,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(212, 232, 208, 0.5)",
            fontSize: 14,
            cursor: "pointer",
            boxSizing: "border-box",
          }}
        >
          {"\u2716"}
        </button>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "12px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
        <TensionRater
          region={region}
          currentTension={tension}
          onRate={(t) => onRateTension(region.id, t)}
        />

        {tension > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(100, 180, 100, 0.6)", textTransform: "uppercase", letterSpacing: 1, padding: "4px 0" }}>
              Grounding Techniques
            </div>
            {region.groundingTechniques.map((tech) => (
              <TechniqueCard
                key={tech.id}
                technique={tech}
                completed={completedTechniques.has(tech.id)}
                onComplete={() => onCompleteTechnique(region.id, tech.id)}
              />
            ))}
          </>
        )}

        {tension === 0 && (
          <div style={{ textAlign: "center", padding: "24px 16px", color: "rgba(212, 232, 208, 0.4)", fontSize: 12 }}>
            Rate your tension level above to unlock grounding techniques for this area.
          </div>
        )}
      </div>
    </div>
  );
}
