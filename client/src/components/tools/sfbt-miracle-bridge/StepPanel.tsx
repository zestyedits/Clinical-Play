import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const STEP_FLOATS: Record<number, string[]> = {
  0: ["📍", "🗺️"],
  1: ["✨", "🌟"],
  2: ["🔎", "💡"],
  3: ["📏", "📊"],
  4: ["💪", "🌱"],
  5: ["🎯", "🚀"],
  6: ["🌅", "🌈"],
};

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
  const floats = STEP_FLOATS[currentStep] || [];

  return (
    <div
      style={{
        width: 340,
        background: "linear-gradient(170deg, rgba(28, 30, 42, 0.98), rgba(20, 22, 35, 0.99))",
        borderLeft: "1px solid rgba(224, 221, 213, 0.06)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
        position: "relative",
      }}
    >
      <style>{`
        @keyframes mb-sp-float0 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-6px) rotate(5deg); } }
        @keyframes mb-sp-float1 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-8px) rotate(-4deg); } }
      `}</style>

      {floats.map((emoji, i) => (
        <div
          key={`${currentStep}-${i}`}
          style={{
            position: "absolute",
            top: i === 0 ? "15%" : "30%",
            right: i === 0 ? "10%" : "18%",
            fontSize: i === 0 ? 20 : 14,
            opacity: 0.08,
            animation: `mb-sp-float${i} ${5 + i}s ease-in-out infinite`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          {emoji}
        </div>
      ))}

      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0, height: 100,
          background: `radial-gradient(ellipse at 50% 0%, ${step.color}10, transparent 70%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(224, 221, 213, 0.06)", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <motion.div
            key={currentStep}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            style={{
              width: 34, height: 34, borderRadius: 10,
              background: `radial-gradient(circle, ${step.color}20, ${step.color}08)`,
              border: `1px solid ${step.color}30`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
            }}
          >
            {step.emoji}
          </motion.div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#e0ddd5", fontFamily: "'Lora', Georgia, serif" }}>{step.name}</div>
            <div style={{ fontSize: 10, color: "rgba(224, 221, 213, 0.35)", fontFamily: "Inter, sans-serif" }}>Step {currentStep + 1} of {BRIDGE_STEPS.length}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 3, marginTop: 8 }}>
          {BRIDGE_STEPS.map((s, i) => (
            <motion.div
              key={i}
              animate={{
                backgroundColor: i === currentStep ? step.color : i < currentStep ? `${step.color}60` : "rgba(224, 221, 213, 0.06)",
                boxShadow: i === currentStep ? `0 0 6px ${step.color}30` : "none",
              }}
              transition={{ duration: 0.3 }}
              style={{
                flex: 1, height: 3, borderRadius: 2,
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 14, position: "relative", zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
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
          </motion.div>
        </AnimatePresence>

        {isScalingStep ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ borderRadius: 12, padding: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, gap: 3 }}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
                  <motion.button
                    key={val}
                    onClick={() => onScalingChange("main", val)}
                    data-testid={`button-scale-${val}`}
                    whileTap={{ scale: 0.9 }}
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
                  </motion.button>
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
                <motion.div
                  key={sq.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ borderRadius: 10, padding: "12px", background: "rgba(224, 221, 213, 0.02)", border: "1px solid rgba(224, 221, 213, 0.05)" }}
                >
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
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ fontSize: 11, color: `${step.color}cc`, margin: "8px 0 0", fontStyle: "italic", fontFamily: "Inter, sans-serif" }}
                    >
                      {sq.followUp}
                    </motion.p>
                  )}
                </motion.div>
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

        <AnimatePresence>
          {showPrompt && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                borderRadius: 10, padding: "12px 14px",
                background: "rgba(196, 148, 58, 0.06)",
                borderLeft: "3px solid rgba(196, 148, 58, 0.3)",
                overflow: "hidden",
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(196, 162, 90, 0.65)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, fontFamily: "Inter, sans-serif" }}>
                Clinician Prompt
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.75, color: "rgba(224, 221, 213, 0.8)", margin: 0, fontStyle: "italic", fontFamily: "'Lora', Georgia, serif" }}>
                {step.discussionPrompt}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(224, 221, 213, 0.06)", display: "flex", gap: 8, position: "relative", zIndex: 1, background: "linear-gradient(to top, rgba(0,0,0,0.2), transparent)" }}>
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
            ← Back
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
          💬
        </button>
        <motion.button
          onClick={onNext}
          disabled={!canProceed}
          data-testid={isLast ? "button-bridge-complete" : "button-bridge-next"}
          whileHover={canProceed ? { scale: 1.02 } : {}}
          whileTap={canProceed ? { scale: 0.97 } : {}}
          style={{
            flex: 1, padding: "10px 16px", borderRadius: 8, border: "none",
            background: canProceed ? `linear-gradient(135deg, ${step.color}, ${step.color}cc)` : "rgba(224, 221, 213, 0.04)",
            color: canProceed ? "#1c1e2a" : "rgba(224, 221, 213, 0.15)",
            fontSize: 12, fontWeight: 600, cursor: canProceed ? "pointer" : "default",
            fontFamily: "Inter, sans-serif", transition: "all 0.2s",
            letterSpacing: "0.3px",
            boxShadow: canProceed ? `0 2px 12px ${step.color}25` : "none",
          }}
        >
          {isLast ? "Complete Journey ✨" : "Continue →"}
        </motion.button>
      </div>
    </div>
  );
}
