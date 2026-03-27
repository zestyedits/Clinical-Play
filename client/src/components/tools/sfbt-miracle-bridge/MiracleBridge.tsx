import { useState, useCallback } from "react";
import { WelcomeScreen } from "./WelcomeScreen";
import { BridgeVisual } from "./BridgeVisual";
import { StepPanel } from "./StepPanel";
import { JourneySummary } from "./JourneySummary";
import { BRIDGE_STEPS } from "./bridge-data";
import { useAudio } from "../../../lib/stores/useAudio";
import { FurtherReading } from "../shared/FurtherReading";
import { ClinicalToolFrame } from "../shared/clinical-tool-frame";
import { SFBT_REFERENCES } from "../shared/references-data";

export function MiracleBridge() {
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [scalingValues, setScalingValues] = useState<Record<string, number>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showSummary, setShowSummary] = useState(false);
  const { isMuted, toggleMute, playSuccess } = useAudio();

  const handleResponse = useCallback((stepId: string, text: string) => {
    setResponses(prev => ({ ...prev, [stepId]: text }));
  }, []);

  const handleScalingChange = useCallback((questionId: string, value: number) => {
    setScalingValues(prev => ({ ...prev, [questionId]: value }));
  }, []);

  const handleNext = useCallback(() => {
    const step = BRIDGE_STEPS[currentStep];
    setCompletedSteps(prev => {
      const next = new Set(prev);
      next.add(step.id);
      return next;
    });
    playSuccess();

    if (currentStep < BRIDGE_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowSummary(true);
    }
  }, [currentStep, playSuccess]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  }, [currentStep]);

  const handleRestart = useCallback(() => {
    setCurrentStep(0);
    setResponses({});
    setScalingValues({});
    setCompletedSteps(new Set());
    setShowSummary(false);
  }, []);

  if (!started) {
    return <WelcomeScreen onStart={() => setStarted(true)} />;
  }

  return (
    <ClinicalToolFrame
      data-testid="tool-miracle-bridge"
      style={{
        background: "#1c1e2a",
        fontFamily: "Inter, sans-serif",
        position: "relative",
        ["--game-panel-border" as string]: "rgba(224, 221, 213, 0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "rgba(28, 30, 42, 0.98)",
          borderBottom: "1px solid rgba(224, 221, 213, 0.06)",
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="22" height="14" viewBox="0 0 22 14" style={{ opacity: 0.7 }}>
            <path d="M 1 12 Q 11 1 21 12" stroke="#c4a25a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#e0ddd5", lineHeight: 1.2, fontFamily: "'Lora', Georgia, serif" }}>
              The Miracle Bridge
            </div>
            <div style={{ fontSize: 10, color: "rgba(224, 221, 213, 0.35)" }}>
              Walk toward your preferred future
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 11, color: "rgba(224, 221, 213, 0.35)" }}>
            {completedSteps.size}/{BRIDGE_STEPS.length}
          </div>
          <FurtherReading
            references={SFBT_REFERENCES}
            accentColor="rgba(196,162,90,0.6)"
            textColor="#e0ddd5"
            bgColor="rgba(28,30,42,0.97)"
          />
          <button
            onClick={toggleMute}
            data-testid="button-bridge-mute"
            type="button"
            style={{
              background: "rgba(224, 221, 213, 0.04)",
              border: "1px solid rgba(224, 221, 213, 0.06)",
              borderRadius: 8,
              padding: "8px 12px",
              minWidth: 44,
              minHeight: 44,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#e0ddd5",
              fontSize: 14,
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
          <BridgeVisual
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={(i) => setCurrentStep(i)}
          />
        </div>

        <StepPanel
          currentStep={currentStep}
          responses={responses}
          scalingValues={scalingValues}
          onResponse={handleResponse}
          onScalingChange={handleScalingChange}
          onNext={handleNext}
          onPrev={handlePrev}
          completedSteps={completedSteps}
        />
      </div>

      {showSummary && (
        <JourneySummary
          responses={responses}
          scalingValues={scalingValues}
          onRestart={handleRestart}
        />
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
