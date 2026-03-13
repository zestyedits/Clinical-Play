import { useState, useCallback } from "react";
import { WelcomeScreen } from "./WelcomeScreen";
import { BridgeVisual } from "./BridgeVisual";
import { StepPanel } from "./StepPanel";
import { JourneySummary } from "./JourneySummary";
import { BRIDGE_STEPS } from "./bridge-data";
import { useAudio } from "../../../lib/stores/useAudio";

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
    <div
      data-testid="tool-miracle-bridge"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(170deg, #1a1a2e 0%, #2a2040 30%, #1e2848 60%, #141428 100%)",
        fontFamily: "Inter, sans-serif",
        overflow: "hidden",
        position: "relative",
        borderRadius: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "rgba(26, 26, 46, 0.94)",
          borderBottom: "1px solid rgba(120, 100, 180, 0.2)",
          zIndex: 10,
          flexShrink: 0,
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{"\u{1F309}"}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#d4d0e8", lineHeight: 1.2 }}>
              The Miracle Bridge
            </div>
            <div style={{ fontSize: 10, color: "rgba(212, 208, 232, 0.5)" }}>
              Walk toward your preferred future
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 11, color: "rgba(212, 208, 232, 0.5)" }}>
            {completedSteps.size}/{BRIDGE_STEPS.length} steps
          </div>
          <button
            onClick={toggleMute}
            data-testid="button-bridge-mute"
            style={{
              background: "rgba(212, 208, 232, 0.1)",
              border: "1px solid rgba(120, 100, 180, 0.2)",
              borderRadius: 8,
              padding: "5px 10px",
              color: "#d4d0e8",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            {isMuted ? "\u{1F507}" : "\u{1F50A}"}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
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
    </div>
  );
}
