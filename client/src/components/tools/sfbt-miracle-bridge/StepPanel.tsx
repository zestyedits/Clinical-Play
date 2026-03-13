import { useState } from "react";
import { BRIDGE_STEPS, SCALING_QUESTIONS } from "./bridge-data";

interface StepPanelProps {
  currentStep: number;
  responses: Record<string, string>;
  scalingValues: Record<string, number>;
  onResponse: (stepId: string, text: string) => void;
  onScalingChange: (questionId: string, value: number) => void;
  onNext: () => void;
  onPrev: () => void;
  completedSteps: Set<string>;
}

export function StepPanel({
  currentStep,
  responses,
  scalingValues,
  onResponse,
  onScalingChange,
  onNext,
  onPrev,
  completedSteps,
}: StepPanelProps) {
  const step = BRIDGE_STEPS[currentStep];
  const [showPrompt, setShowPrompt] = useState(false);
  if (!step) return null;

  const response = responses[step.id] || "";
  const isScalingStep = step.id === "scaling";
  const mainScale = scalingValues["main"] || 0;
  const canProceed = isScalingStep ? mainScale > 0 : response.trim().length > 0;
  const isLast = currentStep === BRIDGE_STEPS.length - 1;

  return (
    <div
      style={{
        width: 340,
        background: "rgba(28, 30, 42, 0.98)",
        borderLeft: "1px solid rgba(224, 221, 213, 0.06)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(224, 221, 213, 0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: `${step.color}25`,
            border: `1px solid ${step.color}40`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
          }}>
            {step.emoji}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#e0ddd5", fontFamily: "'Lora', Georgia, serif" }}>{step.name}</div>
            <div style={{ fontSize: 10, color: "rgba(224, 221, 213, 0.35)", fontFamily: "Inter, sans-serif" }}>Step {currentStep + 1} of {BRIDGE_STEPS.length}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 3, marginTop: 8 }}>
          {BRIDGE_STEPS.map((s, i) => (
            <div key={i} style={{
              flex: 1, height: 2.5, borderRadius: 2,
              background: i <= currentStep ? step.color : "rgba(224, 221, 213, 0.06)",
              transition: "background 0.4s ease",
            }} />
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{
          borderRadius: 12, padding: "16px",
          borderLeft: `3px solid ${step.color}50`,
          background: "rgba(224, 221, 213, 0.03)",
        }}>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "rgba(224, 221, 213, 0.88)", margin: 0, fontFamily: "'Lora', Georgia, serif" }}>
            {step.question}
          </p>
          <p style={{ fontSize: 11, color: "rgba(224, 221, 213, 0.35)", margin: "10px 0 0", fontStyle: "italic", fontFamily: "Inter, sans-serif" }}>
            {step.helpText}
          </p>
        </div>

        {isScalingStep ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ borderRadius: 12, padding: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, gap: 3 }}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
                  <button
                    key={val}
                    onClick={() => onScalingChange("main", val)}
                    data-testid={`button-scale-${val}`}
                    style={{
                      width: 28, height: 36, borderRadius: 6,
                      border: mainScale === val ? `2px solid ${step.color}` : "1px solid rgba(224, 221, 213, 0.08)",
                      background: val <= mainScale ? `${step.color}35` : "rgba(224, 221, 213, 0.03)",
                      color: val <= mainScale ? "#e0ddd5" : "rgba(224, 221, 213, 0.2)",
                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                      transition: "all 0.15s", fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "rgba(224, 221, 213, 0.25)", fontFamily: "Inter, sans-serif" }}>
                <span>Hardest</span>
                <span>Miracle day</span>
              </div>
            </div>

            {mainScale > 0 && SCALING_QUESTIONS.map((sq) => {
              const val = scalingValues[sq.id] || 0;
              return (
                <div key={sq.id} style={{ borderRadius: 10, padding: "12px", background: "rgba(224, 221, 213, 0.02)", border: "1px solid rgba(224, 221, 213, 0.05)" }}>
                  <p style={{ fontSize: 12, color: "rgba(224, 221, 213, 0.65)", margin: "0 0 8px", fontFamily: "Inter, sans-serif" }}>{sq.question}</p>
                  <div style={{ display: "flex", gap: 3 }}>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => (
                      <button
                        key={v}
                        onClick={() => onScalingChange(sq.id, v)}
                        style={{
                          flex: 1, height: 24, borderRadius: 4, border: "none",
                          background: v <= val ? `${step.color}40` : "rgba(224, 221, 213, 0.04)",
                          cursor: "pointer", fontSize: 9,
                          color: v <= val ? "#e0ddd5" : "transparent",
                          fontFamily: "Inter, sans-serif", transition: "all 0.1s",
                        }}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "rgba(224, 221, 213, 0.2)", marginTop: 4, fontFamily: "Inter, sans-serif" }}>
                    <span>{sq.lowLabel}</span>
                    <span>{sq.highLabel}</span>
                  </div>
                  {val > 0 && (
                    <p style={{ fontSize: 11, color: `${step.color}cc`, margin: "8px 0 0", fontStyle: "italic", fontFamily: "Inter, sans-serif" }}>{sq.followUp}</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <textarea
            value={response}
            onChange={(e) => onResponse(step.id, e.target.value)}
            placeholder={step.placeholder}
            data-testid={`input-step-${step.id}`}
            style={{
              width: "100%", minHeight: 120, padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid rgba(224, 221, 213, 0.06)",
              background: "rgba(224, 221, 213, 0.03)",
              color: "#e0ddd5", fontSize: 13, lineHeight: 1.75,
              resize: "vertical", fontFamily: "Inter, sans-serif", outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = `${step.color}50`; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(224, 221, 213, 0.06)"; }}
          />
        )}

        {showPrompt && (
          <div style={{
            borderRadius: 10, padding: "12px 14px",
            background: "rgba(196, 148, 58, 0.06)",
            borderLeft: "3px solid rgba(196, 148, 58, 0.3)",
            animation: "fadeIn 0.2s ease",
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(196, 162, 90, 0.65)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, fontFamily: "Inter, sans-serif" }}>
              Clinician Prompt
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.75, color: "rgba(224, 221, 213, 0.8)", margin: 0, fontStyle: "italic", fontFamily: "'Lora', Georgia, serif" }}>
              {step.discussionPrompt}
            </p>
          </div>
        )}
      </div>

      <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(224, 221, 213, 0.06)", display: "flex", gap: 8 }}>
        {currentStep > 0 && (
          <button
            onClick={onPrev}
            style={{
              padding: "10px 16px", borderRadius: 8,
              border: "1px solid rgba(224, 221, 213, 0.08)",
              background: "transparent",
              color: "rgba(224, 221, 213, 0.5)",
              fontSize: 12, fontWeight: 500, cursor: "pointer",
              fontFamily: "Inter, sans-serif",
            }}
          >
            \u2190 Back
          </button>
        )}
        <button
          onClick={() => setShowPrompt(!showPrompt)}
          style={{
            padding: "10px 14px", borderRadius: 8,
            border: "1px solid rgba(224, 221, 213, 0.08)",
            background: showPrompt ? "rgba(196, 148, 58, 0.08)" : "transparent",
            color: showPrompt ? "rgba(196, 162, 90, 0.8)" : "rgba(224, 221, 213, 0.35)",
            fontSize: 12, fontWeight: 500, cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {"\u{1F4AC}"}
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          data-testid={isLast ? "button-bridge-complete" : "button-bridge-next"}
          style={{
            flex: 1, padding: "10px 16px", borderRadius: 8, border: "none",
            background: canProceed ? step.color : "rgba(224, 221, 213, 0.04)",
            color: canProceed ? "#1c1e2a" : "rgba(224, 221, 213, 0.15)",
            fontSize: 12, fontWeight: 600, cursor: canProceed ? "pointer" : "default",
            fontFamily: "Inter, sans-serif", transition: "all 0.2s",
            letterSpacing: "0.3px",
          }}
        >
          {isLast ? "Complete Journey" : "Continue \u2192"}
        </button>
      </div>
    </div>
  );
}
