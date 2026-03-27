import { useState, useCallback } from "react";
import { WelcomeScreen } from "./WelcomeScreen";
import { BodyMap } from "./BodyMap";
import { RegionPanel } from "./RegionPanel";
import { BODY_REGIONS } from "./grove-data";
import { useAudio } from "../../../lib/stores/useAudio";
import { FurtherReading } from "../shared/FurtherReading";
import { ClinicalToolFrame } from "../shared/clinical-tool-frame";
import { SOMATIC_REFERENCES } from "../shared/references-data";

export function GroundingGrove() {
  const [started, setStarted] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [regionTension, setRegionTension] = useState<Record<string, number>>({});
  const [completedTechniques, setCompletedTechniques] = useState<Set<string>>(new Set());
  const [completedRegions, setCompletedRegions] = useState<Set<string>>(new Set());
  const { isMuted, toggleMute, playSuccess } = useAudio();

  const totalTechniques = BODY_REGIONS.reduce((sum, r) => sum + r.groundingTechniques.length, 0);
  const completedCount = completedTechniques.size;
  const regionsExplored = Object.keys(regionTension).length;
  const allComplete = completedRegions.size === BODY_REGIONS.length;

  const handleRateTension = useCallback((regionId: string, tension: number) => {
    setRegionTension(prev => ({ ...prev, [regionId]: tension }));
  }, []);

  const handleCompleteTechnique = useCallback((regionId: string, techniqueId: string) => {
    setCompletedTechniques(prev => {
      const next = new Set(prev);
      next.add(techniqueId);
      return next;
    });

    const region = BODY_REGIONS.find(r => r.id === regionId);
    if (region) {
      const allTechsDone = region.groundingTechniques.every(
        t => t.id === techniqueId || completedTechniques.has(t.id)
      );
      if (allTechsDone) {
        setCompletedRegions(prev => {
          const next = new Set(prev);
          next.add(regionId);
          return next;
        });
      }
    }
    playSuccess();
  }, [completedTechniques, playSuccess]);

  if (!started) {
    return <WelcomeScreen onStart={() => setStarted(true)} />;
  }

  return (
    <ClinicalToolFrame
      data-testid="tool-grounding-grove"
      style={{
        background: "linear-gradient(170deg, #1a2a1a 0%, #2a3a2a 30%, #1e3028 60%, #162016 100%)",
        fontFamily: "Inter, sans-serif",
        position: "relative",
        ["--game-panel-border" as string]: "rgba(100, 160, 100, 0.2)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "rgba(26, 42, 26, 0.94)",
          borderBottom: "1px solid rgba(100, 160, 100, 0.2)",
          zIndex: 10,
          flexShrink: 0,
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{"\u{1F333}"}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#d4e8d0", lineHeight: 1.2 }}>
              The Grounding Grove
            </div>
            <div style={{ fontSize: 10, color: "rgba(212, 232, 208, 0.5)" }}>
              Return to your body, one region at a time
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 11, color: "rgba(212, 232, 208, 0.5)" }}>
            {regionsExplored}/{BODY_REGIONS.length} explored
          </div>
          <FurtherReading
            references={SOMATIC_REFERENCES}
            accentColor="rgba(100,160,100,0.6)"
            textColor="#d4e8d0"
            bgColor="rgba(26,42,26,0.97)"
          />
          <button
            onClick={toggleMute}
            data-testid="button-grove-mute"
            type="button"
            style={{
              background: "rgba(212, 232, 208, 0.1)",
              border: "1px solid rgba(100, 160, 100, 0.2)",
              borderRadius: 8,
              padding: "8px 12px",
              minWidth: 44,
              minHeight: 44,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#d4e8d0",
              fontSize: 16,
              cursor: "pointer",
              boxSizing: "border-box",
            }}
          >
            {isMuted ? "\u{1F507}" : "\u{1F50A}"}
          </button>
        </div>
      </div>

      <div className="tool-game-split">
        <div className="tool-game-split-canvas">
          <BodyMap
            selectedRegion={selectedRegion}
            regionTension={regionTension}
            completedRegions={completedRegions}
            onSelectRegion={(id) => setSelectedRegion(id)}
          />
        </div>

        {selectedRegion && (
          <RegionPanel
            selectedRegion={selectedRegion}
            regionTension={regionTension}
            completedTechniques={completedTechniques}
            completedRegions={completedRegions}
            onRateTension={handleRateTension}
            onCompleteTechnique={handleCompleteTechnique}
            onClose={() => setSelectedRegion(null)}
          />
        )}
      </div>

      {allComplete && (
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(135deg, rgba(58, 107, 58, 0.95), rgba(45, 90, 45, 0.95))",
            color: "#d4e8d0",
            padding: "14px 28px",
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 600,
            textAlign: "center",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset",
            zIndex: 5,
            backdropFilter: "blur(10px)",
            whiteSpace: "normal",
            maxWidth: "min(calc(100vw - 32px), 380px)",
            lineHeight: 1.35,
          }}
          data-testid="text-grove-complete"
        >
          {"\u{1F333}"} All regions grounded! {completedCount} techniques practiced.
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </ClinicalToolFrame>
  );
}
