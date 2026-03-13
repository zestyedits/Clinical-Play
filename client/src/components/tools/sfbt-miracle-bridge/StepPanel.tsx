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
  const isCompleted = completedSteps.has(step.id);

  return (
    <div
      style={{
        width: 340,
        background: "rgba(26, 26, 46, 0.96)",
        borderLeft: "1px solid rgba(120, 100, 180, 0.15)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
        backdropFilter: "blur(10px)",
      }}
    >
      <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(120, 100, 180, 0.12)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: step.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
            {step.emoji}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#d4d0e8" }}>{step.name}</div>
            <div style={{ fontSize: 10, color: "rgba(212, 208, 232, 0.4)" }}>Step {currentStep + 1} of {BRIDGE_STEPS.length}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 3, marginTop: 8 }}>
          {BRIDGE_STEPS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= currentStep ? step.color : "rgba(212, 208, 232, 0.08)", transition: "background 0.3s" }} />
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "16px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ background: "rgba(212, 208, 232, 0.05)", borderRadius: 12, padding: "14px", border: "1px solid rgba(120, 100, 180, 0.12)" }}>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(212, 208, 232, 0.9)", margin: 0 }}>
            {step.question}
          </p>
          <p style={{ fontSize: 11, color: "rgba(212, 208, 232, 0.4)", margin: "8px 0 0", fontStyle: "italic" }}>
            {step.helpText}
          </p>
        </div>

        {isScalingStep ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "rgba(212, 208, 232, 0.04)", borderRadius: 12, padding: "14px", border: "1px solid rgba(120, 100, 180, 0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
                  <button
                    key={val}
                    onClick={() => onScalingChange("main", val)}
                    data-testid={`button-scale-${val}`}
                    style={{
                      width: 28,
                      height: 36,
                      borderRadius: 6,
                      border: mainScale === val ? `2px solid ${step.color}` : "1px solid rgba(120, 100, 180, 0.15)",
                      background: val <= mainScale ? `${step.color}40` : "rgba(212, 208, 232, 0.04)",
                      color: val <= mainScale ? "#d4d0e8" : "rgba(212, 208, 232, 0.3)",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "rgba(212, 208, 232, 0.3)" }}>
                <span>Hardest</span>
                <span>Miracle day</span>
              </div>
            </div>

            {mainScale > 0 && SCALING_QUESTIONS.map((sq) => {
              const val = scalingValues[sq.id] || 0;
              return (
                <div key={sq.id} style={{ background: "rgba(212, 208, 232, 0.03)", borderRadius: 10, padding: "12px", border: "1px solid rgba(120, 100, 180, 0.08)" }}>
                  <p style={{ fontSize: 12, color: "rgba(212, 208, 232, 0.75)", margin: "0 0 8px" }}>{sq.question}</p>
                  <div style={{ display: "flex", gap: 4 }}>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => (
                      <button
                        key={v}
                        onClick={() => onScalingChange(sq.id, v)}
                        style={{
                          flex: 1,
                          height: 24,
                          borderRadius: 4,
                          border: "none",
                          background: v <= val ? `${step.color}50` : "rgba(212, 208, 232, 0.06)",
                          cursor: "pointer",
                          fontSize: 9,
                          color: v <= val ? "#d4d0e8" : "transparent",
                          fontFamily: "Inter, sans-serif",
                          transition: "all 0.1s",
                        }}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "rgba(212, 208, 232, 0.25)", marginTop: 4 }}>
                    <span>{sq.lowLabel}</span>
                    <span>{sq.highLabel}</span>
                  </div>
                  {val > 0 && (
                    <p style={{ fontSize: 11, color: "rgba(212, 168, 83, 0.7)", margin: "8px 0 0", fontStyle: "italic" }}>{sq.followUp}</p>
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
              width: "100%",
              minHeight: 120,
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid rgba(120, 100, 180, 0.15)",
              background: "rgba(212, 208, 232, 0.04)",
              color: "#d4d0e8",
              fontSize: 13,
              lineHeight: 1.7,
              resize: "vertical",
              fontFamily: "Inter, sans-serif",
              outline: "none",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(120, 100, 180, 0.35)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(120, 100, 180, 0.15)"; }}
          />
        )}

        {showPrompt && (
          <div style={{ background: "rgba(120, 100, 180, 0.08)", borderRadius: 10, padding: "12px 14px", border: "1px solid rgba(120, 100, 180, 0.15)", animation: "fadeIn 0.2s ease" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(212, 168, 83, 0.7)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              Clinician Prompt
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(212, 208, 232, 0.85)", margin: 0, fontStyle: "italic" }}>
              {step.discussionPrompt}
            </p>
          </div>
        )}
      </div>

      <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(120, 100, 180, 0.12)", display: "flex", gap: 8 }}>
        {currentStep > 0 && (
          <button
            onClick={onPrev}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid rgba(120, 100, 180, 0.2)",
              background: "rgba(212, 208, 232, 0.04)",
              color: "rgba(212, 208, 232, 0.6)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {"\u2190"} Back
          </button>
        )}
        <button
          onClick={() => setShowPrompt(!showPrompt)}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid rgba(120, 100, 180, 0.2)",
            background: showPrompt ? "rgba(212, 168, 83, 0.1)" : "rgba(212, 208, 232, 0.04)",
            color: showPrompt ? "rgba(212, 168, 83, 0.9)" : "rgba(212, 208, 232, 0.5)",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
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
            flex: 1,
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background: canProceed ? `linear-gradient(135deg, ${step.color}, ${step.color}cc)` : "rgba(212, 208, 232, 0.06)",
            color: canProceed ? "#fff" : "rgba(212, 208, 232, 0.25)",
            fontSize: 12,
            fontWeight: 600,
            cursor: canProceed ? "pointer" : "default",
            fontFamily: "Inter, sans-serif",
            transition: "all 0.2s",
          }}
        >
          {isLast ? "\u2728 Complete Journey" : "Continue \u2192"}
        </button>
      </div>
    </div>
  );
}
